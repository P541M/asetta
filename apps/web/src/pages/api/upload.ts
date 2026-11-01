import type { NextApiRequest, NextApiResponse } from "next";
import type { Fields, Files } from "formidable";
import fs from "fs";
import { getAdmin } from "../../lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { pdfText } from "../../lib/upload/pdfText";
import { assessmentsFromText, courseBreakdown } from "../../lib/upload/extract";
import { GeminiLimitError } from "../../lib/upload/gemini";
import {
  formField,
  formFiles,
  isPayloadTooLargeError,
  isTooManyFilesError,
  parseForm,
  removeTempFiles,
} from "../../lib/upload/form";
import { ExtractedAssessment, parseLocalDate } from "../../lib/upload/normalize";
import {
  MAX_FILES_PER_UPLOAD,
  MAX_FILE_BYTES,
  MAX_TOTAL_UPLOAD_BYTES,
  RETRY_AFTER_SECONDS,
  formatBytes,
} from "../../lib/upload/constants";
import {
  claimUploadFiles,
  filesUsedFromData,
  secondsUntilUtcMidnight,
  uploadLimitMessage,
  uploadUsageDay,
  uploadUsagePath,
} from "../../lib/upload/quota";
import { isValidDocId } from "../../utils/validation";

export const config = {
  api: {
    bodyParser: false,
  },
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

    const semesterId = formField(fields, "semesterId");
    if (!semesterId) {
      return res.status(400).json({ success: false, error: "Semester ID is required" });
    }
    // It goes into a Firestore path, so it must be exactly one segment.
    if (!isValidDocId(semesterId)) {
      return res.status(400).json({ success: false, error: "Invalid semester ID" });
    }

    // The uploader's local today dates any assessment flagged for review. The server's own clock
    // only knows the UTC day, which is the wrong day for much of the world.
    const localDate = parseLocalDate(formField(fields, "localDate"), new Date());
    if (!localDate) {
      return res.status(400).json({
        success: false,
        error: "Please refresh the page and upload again.",
      });
    }

    const adminDb = getFirestore(adminApp);
    const semesterRef = adminDb.doc(`users/${userId}/semesters/${semesterId}`);
    const semesterDoc = await semesterRef.get();
    if (!semesterDoc.exists) {
      return res.status(400).json({ success: false, error: "Semester not found" });
    }

    const uploadedFiles = formFiles(files);
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, error: "No valid files were uploaded" });
    }

    // The day's limit, claimed in a transaction before any extraction so overlapping
    // requests can't both pass it: all of this request's files, or none. Files extraction never
    // runs on are refunded below.
    const now = new Date();
    const usageRef = adminDb.doc(uploadUsagePath(userId, now));
    const claim = await adminDb.runTransaction(async (transaction) => {
      const used = filesUsedFromData((await transaction.get(usageRef)).data());
      const outcome = claimUploadFiles(used, uploadedFiles.length);
      if (outcome.allowed) {
        transaction.set(usageRef, {
          uid: userId,
          day: uploadUsageDay(now),
          files: outcome.used,
          updatedAt: new Date(),
        });
      }
      return outcome;
    });
    if (!claim.allowed) {
      const retryAfter = secondsUntilUtcMidnight(now);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        error: "DAILY_QUOTA_EXCEEDED",
        message: uploadLimitMessage(claim.remaining),
        quotaType: "user",
        remaining: claim.remaining,
        retryAfter,
      });
    }

    let processedFiles = 0;
    let failedFiles = 0;
    // Files extraction ran on (Gemini, or the regex fallback): the ones the day's count keeps
    let countedFiles = 0;
    // Files Gemini refused for its own daily quota or its rate limit
    let quotaFiles = 0;
    let rateLimitedFiles = 0;
    const saved: ExtractedAssessment[] = [];
    const processingStartTime = Date.now();

    for (const fileData of uploadedFiles) {
      try {
        let extractedText: string;
        try {
          extractedText = await pdfText(fs.readFileSync(fileData.filepath));
        } catch (error) {
          console.error("Upload: could not parse a PDF", { uid: userId, error });
          failedFiles++;
          continue;
        }

        let assessments: ExtractedAssessment[];
        try {
          assessments = await assessmentsFromText(extractedText, localDate);
        } catch (error) {
          if (!(error instanceof GeminiLimitError)) throw error;
          failedFiles++;
          if (error.limit === "DAILY_QUOTA_EXCEEDED") quotaFiles++;
          else rateLimitedFiles++;
          continue;
        }
        countedFiles++;

        const assessmentsRef = adminDb.collection(
          `users/${userId}/semesters/${semesterId}/assessments`,
        );
        const batch = adminDb.batch();
        for (const assessment of assessments) {
          batch.set(assessmentsRef.doc(), {
            ...assessment,
            createdAt: new Date(),
            sourceFile: fileData.originalFilename || "unknown.pdf",
          });
        }
        await batch.commit();

        saved.push(...assessments);
        processedFiles++;
      } catch (error) {
        console.error("Upload: could not process a file", { uid: userId, error });
        failedFiles++;
      }
    }

    // An unreadable PDF never reached Gemini, and a file Gemini refused for its own quota or rate
    // limit got nothing (the rate-limit notice retries the same files): neither counts.
    const unusedFiles = uploadedFiles.length - countedFiles;
    if (unusedFiles > 0) {
      try {
        await usageRef.update({ files: FieldValue.increment(-unusedFiles), updatedAt: new Date() });
      } catch (error) {
        console.error("Upload: could not return unused files to the daily limit", {
          uid: userId,
          error,
        });
      }
    }

    if (quotaFiles > 0 && processedFiles === 0) {
      return res.status(429).json({
        success: false,
        error: "DAILY_QUOTA_EXCEEDED",
        message:
          "We've reached our daily processing limit. Daily limits refresh at midnight UTC. Please try again tomorrow.",
        quotaType: "daily",
      });
    }

    if (rateLimitedFiles > 0 && processedFiles === 0) {
      return res.status(429).json({
        success: false,
        error: "RATE_LIMITED",
        message:
          "Our servers are currently busy processing requests. Please wait 1-2 minutes and try again.",
        retryAfter: RETRY_AFTER_SECONDS,
        quotaType: "temporary",
      });
    }

    const processingTime = Math.round((Date.now() - processingStartTime) / 1000);

    return res.status(200).json({
      success: true,
      message: `Processed ${processedFiles} file(s), extracted ${saved.length} assessments. ${
        failedFiles > 0 ? `Failed to process ${failedFiles} file(s).` : ""
      }`,
      data: {
        processedFiles,
        totalAssessments: saved.length,
        courseBreakdown: courseBreakdown(saved),
        processingTime,
      },
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
