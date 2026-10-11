import type { NextApiRequest, NextApiResponse } from "next";
import type { File as FormidableFile } from "formidable";
import { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { getAdmin } from "../../lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { extractAssessmentsWithAI } from "../../lib/upload/gemini";
import {
  ExtractedAssessment,
  extractAssessmentsBasic,
  extractCourseName,
} from "../../lib/upload/textExtraction";
import {
  ACCEPTED_MIME_TYPE,
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  formatBytes,
} from "../../lib/upload/constants";
import { isValidDocId } from "../../utils/validation";

export const config = {
  api: {
    bodyParser: false,
  },
};

// formidable stamps its own errors with an httpCode, and every size/count
// violation is a 413. Reading httpCode avoids importing formidable's error
// constants, which are NOT reachable via `formidable.errors` once the bundler
// applies ESM interop (it resolves to the default export, which has no
// `.errors`) -- that lookup threw at module load and served an HTML 500.
const FORMIDABLE_MAX_FILES_EXCEEDED = 1015;

// Check isTooManyFilesError first: it also carries httpCode 413.
const isTooManyFilesError = (error: unknown): boolean =>
  (error as { code?: unknown })?.code === FORMIDABLE_MAX_FILES_EXCEEDED;

const isPayloadTooLargeError = (error: unknown): boolean =>
  (error as { httpCode?: unknown })?.httpCode === 413;

/**
 * Parses the multipart body. formidable writes each file to the OS temp dir as it arrives; every
 * path it opens, including a partial file from a failed parse, is pushed onto `tempFiles` so the
 * handler can delete them all.
 */
const parseForm = (
  req: NextApiRequest,
  tempFiles: string[],
): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      // Must stay under Vercel's 4.5 MB request-body cap. Anything larger is
      // rejected at the edge with an HTML error page we never get to handle,
      // so the browser validates against the same constants before sending.
      maxFileSize: MAX_FILE_BYTES,
      maxTotalFileSize: MAX_TOTAL_UPLOAD_BYTES,
      maxFiles: MAX_FILES_PER_UPLOAD,
      filter: ({ mimetype }) => mimetype === ACCEPTED_MIME_TYPE,
    });
    form.on("fileBegin", (_name, file) => {
      tempFiles.push(file.filepath);
    });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

/** Deletes formidable's temp files. A file that is already gone is fine; anything else is logged. */
const removeTempFiles = async (paths: string[]) => {
  const results = await Promise.allSettled(paths.map((p) => fs.promises.rm(p, { force: true })));
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Upload: could not delete a temp file", result.reason);
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  // Authenticate from the headers before reading the body, so an unauthenticated upload is never
  // parsed or written to disk.
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  let userId: string | undefined;
  const tempFiles: string[] = [];
  try {
    const adminApp = await getAdmin();
    try {
      userId = (await getAuth(adminApp).verifyIdToken(authHeader.slice(7))).uid;
    } catch {
      return res.status(401).json({ success: false, error: "Invalid authentication token" });
    }

    let fields: Fields;
    let files: Files;
    try {
      ({ fields, files } = await parseForm(req, tempFiles));
    } catch (error: unknown) {
      if (isTooManyFilesError(error)) {
        return res.status(413).json({
          success: false,
          error: "TOO_MANY_FILES",
          message: `Please upload at most ${MAX_FILES_PER_UPLOAD} files at a time.`,
        });
      }
      if (isPayloadTooLargeError(error)) {
        return res.status(413).json({
          success: false,
          error: "PAYLOAD_TOO_LARGE",
          message: `Files must be under ${formatBytes(MAX_FILE_BYTES)} each and ${formatBytes(
            MAX_TOTAL_UPLOAD_BYTES,
          )} per upload.`,
        });
      }
      // The size and count limits above are the client's mistakes; anything else is worth a log.
      console.error("Upload: could not parse the form", { uid: userId, error });
      return res.status(400).json({
        success: false,
        error: "We couldn't read that upload. Please make sure you're sending PDF files.",
      });
    }

    const semesterIdField = fields.semesterId;
    const semesterId = Array.isArray(semesterIdField) ? semesterIdField[0] : semesterIdField;
    if (!semesterId) {
      return res.status(400).json({ success: false, error: "Semester ID is required" });
    }
    // It goes into a Firestore path, so it must be exactly one segment.
    if (!isValidDocId(semesterId)) {
      return res.status(400).json({ success: false, error: "Invalid semester ID" });
    }

    const adminDb = getFirestore(adminApp);
    // Verify the semester exists by checking if we can access it
    const semesterRef = adminDb.doc(`users/${userId}/semesters/${semesterId}`);
    const semesterDoc = await semesterRef.get();
    if (!semesterDoc.exists) {
      return res.status(400).json({ success: false, error: "Semester not found" });
    }

    const uploadedFiles: FormidableFile[] = [];
    Object.keys(files).forEach((key) => {
      const file = files[key];
      if (Array.isArray(file)) {
        uploadedFiles.push(...file);
      } else if (file) {
        uploadedFiles.push(file);
      }
    });
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, error: "No valid files were uploaded" });
    }

    let totalAssessments = 0;
    let processedFiles = 0;
    let failedFiles = 0;
    const errors: string[] = [];
    const courseBreakdown: Array<{
      courseName: string;
      assessmentCount: number;
    }> = [];
    const processingStartTime = Date.now();

    for (const fileData of uploadedFiles) {
      try {
        const filePath = fileData.filepath;
        const fileName = fileData.originalFilename || "unknown.pdf";
        const pdfBuffer = fs.readFileSync(filePath);
        let extractedText: string;
        try {
          const data = await pdfParse(pdfBuffer);
          extractedText = data.text;
        } catch (error) {
          console.error("Upload: could not parse a PDF", { uid: userId, error });
          failedFiles++;
          errors.push(`Failed to parse PDF: ${fileName}`);
          continue;
        }

        let assessments: ExtractedAssessment[] = [];
        try {
          assessments = await extractAssessmentsWithAI(extractedText);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "";
          if (errorMessage === "DAILY_QUOTA_EXCEEDED") {
            failedFiles++;
            errors.push(`Daily quota exceeded: ${fileName}. Please try again tomorrow.`);
            continue;
          } else if (errorMessage === "RATE_LIMITED") {
            failedFiles++;
            errors.push(`Rate limit exceeded: ${fileName}. Please wait a moment and try again.`);
            continue;
          }
          // Fall back to basic extraction
          assessments = extractAssessmentsBasic(extractedText);
        }

        if (assessments.length === 0) {
          assessments.push({
            courseName: extractCourseName(extractedText) || "Unknown Course",
            assignmentName: "Manual Review Required",
            dueDate: new Date().toISOString().split("T")[0],
            dueTime: "23:59",
            weight: 0,
            status: "Not started",
          });
        }

        const assessmentsRef = adminDb.collection(
          `users/${userId}/semesters/${semesterId}/assessments`,
        );
        const batch = adminDb.batch();
        for (const assessment of assessments) {
          const newAssessmentRef = assessmentsRef.doc();
          batch.set(newAssessmentRef, {
            ...assessment,
            createdAt: new Date(),
            sourceFile: fileName,
          });
        }
        await batch.commit();

        totalAssessments += assessments.length;
        processedFiles++;

        // Track course breakdown for the success modal
        if (assessments.length > 0) {
          const courseNames = [...new Set(assessments.map((a) => a.courseName))];
          courseNames.forEach((courseName) => {
            const courseAssessments = assessments.filter((a) => a.courseName === courseName);
            const existingCourse = courseBreakdown.find((c) => c.courseName === courseName);
            if (existingCourse) {
              existingCourse.assessmentCount += courseAssessments.length;
            } else {
              courseBreakdown.push({
                courseName,
                assessmentCount: courseAssessments.length,
              });
            }
          });
        }
      } catch (error) {
        console.error("Upload: could not process a file", { uid: userId, error });
        failedFiles++;
        errors.push(`Failed to process file: ${fileData.originalFilename}`);
      }
    }

    // Check if any files failed due to daily quota or rate limiting
    const hasDailyQuotaErrors = errors.some((error) => error.includes("Daily quota exceeded"));
    const hasRateLimitErrors = errors.some((error) => error.includes("Rate limit exceeded"));

    if (hasDailyQuotaErrors && processedFiles === 0) {
      // All files failed due to daily quota exhaustion
      return res.status(429).json({
        success: false,
        error: "DAILY_QUOTA_EXCEEDED",
        message:
          "We've reached our daily processing limit. Daily limits refresh at midnight UTC. Please try again tomorrow.",
        quotaType: "daily",
      });
    }

    if (hasRateLimitErrors && processedFiles === 0) {
      // All files failed due to temporary rate limiting
      return res.status(429).json({
        success: false,
        error: "RATE_LIMITED",
        message:
          "Our servers are currently busy processing requests. Please wait 1-2 minutes and try again.",
        retryAfter: 120, // seconds
        quotaType: "temporary",
      });
    }

    const processingTime = Math.round((Date.now() - processingStartTime) / 1000);

    return res.status(200).json({
      success: true,
      message: `Processed ${processedFiles} file(s), extracted ${totalAssessments} assessments. ${
        failedFiles > 0 ? `Failed to process ${failedFiles} file(s).` : ""
      }`,
      data: {
        processedFiles,
        totalAssessments,
        failedFiles,
        courseBreakdown: courseBreakdown.length > 0 ? courseBreakdown : undefined,
        processingTime,
      },
      errors: errors.length > 0 ? errors : undefined,
      hasRateLimitErrors,
    });
  } catch (error) {
    console.error("Upload: request failed", { uid: userId, error });
    return res.status(500).json({
      success: false,
      error: "Processing error occurred",
    });
  } finally {
    await removeTempFiles(tempFiles);
  }
}
