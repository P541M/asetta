import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { getAdmin } from "../../lib/firebase-admin";
import { extractAssessmentsWithAI } from "../../lib/upload/gemini";
import {
  ExtractedAssessment,
  extractAssessmentsBasic,
  extractCourseName,
} from "../../lib/upload/textExtraction";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filter: ({ mimetype }) => mimetype === "application/pdf",
    });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);
    const semesterIdField = fields.semesterId;
    const semesterId = Array.isArray(semesterIdField) ? semesterIdField[0] : semesterIdField;
    if (!semesterId) {
      return res.status(400).json({ success: false, error: "Semester ID is required" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];
    const admin = await getAdmin();
    let userId;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch {
      return res.status(401).json({ success: false, error: "Invalid authentication token" });
    }

    const adminDb = admin.firestore();
    // Verify the semester exists by checking if we can access it
    const semesterRef = adminDb.doc(`users/${userId}/semesters/${semesterId}`);
    const semesterDoc = await semesterRef.get();
    if (!semesterDoc.exists) {
      return res.status(400).json({ success: false, error: "Semester not found" });
    }

    const uploadedFiles: formidable.File[] = [];
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
        } catch {
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
      } catch {
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
  } catch {
    return res.status(500).json({
      success: false,
      error: "Processing error occurred",
    });
  }
}
