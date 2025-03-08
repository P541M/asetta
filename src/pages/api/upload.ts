// Updated upload.ts to fix PDF parsing and database structure
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { getAdmin } from "../../lib/firebase-admin";

// Disable body parsing so that formidable can handle the file
export const config = {
  api: {
    bodyParser: false,
  },
};

// Sample data structure for assessments
interface Assessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  weight: number;
  status: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Create a promise to handle the form parsing
  const parseForm = (
    req: NextApiRequest
  ): Promise<{ fields: Fields; files: Files }> => {
    return new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
  };

  try {
    // Parse the form
    const { fields, files } = await parseForm(req);

    // Ensure semester is a string
    const semesterField = fields.semester;
    const semester = Array.isArray(semesterField)
      ? semesterField[0]
      : semesterField;
    if (!semester) {
      return res
        .status(400)
        .json({ success: false, error: "Semester is required" });
    }

    // Get userId from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const admin = await getAdmin(); // Get the Firebase Admin instance
    let userId;

    try {
      // Verify the Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("Invalid token:", error);
      return res
        .status(401)
        .json({ success: false, error: "Invalid authentication token" });
    }

    // Get the admin Firestore instance
    const adminDb = admin.firestore();

    // Find the semester ID based on the name
    const semestersRef = adminDb.collection(`users/${userId}/semesters`);
    const semesterQuery = semestersRef.where("name", "==", semester).limit(1);
    const semesterSnapshot = await semesterQuery.get();

    if (semesterSnapshot.empty) {
      return res
        .status(400)
        .json({ success: false, error: "Semester not found" });
    }

    const semesterDoc = semesterSnapshot.docs[0];
    const semesterId = semesterDoc.id;

    // Ensure file is a single file
    const fileField = files.file;
    let fileData: formidable.File;
    if (Array.isArray(fileField)) {
      fileData = fileField[0];
    } else if (fileField) {
      fileData = fileField;
    } else {
      return res
        .status(400)
        .json({ success: false, error: "File is required" });
    }

    const filePath = fileData.filepath;
    const fileName = fileData.originalFilename || "unknown.pdf";

    // Read file into a buffer
    const pdfBuffer = fs.readFileSync(filePath);

    // --- Extract Text from PDF ---
    let extractedText: string;
    try {
      const data = await pdfParse(pdfBuffer);
      extractedText = data.text;
      console.log("Extracted text from PDF:", extractedText.slice(0, 100));
    } catch (error) {
      console.error("Error parsing PDF:", error);
      return res
        .status(500)
        .json({ success: false, error: "Error reading PDF content" });
    }

    // --- Parse the PDF text without AI (simplified approach) ---
    const assessments: Assessment[] = [];

    // Example: Look for patterns like "Assignment X - Due: MM/DD/YYYY"
    const assignmentPattern =
      /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam)\s+(\d+)[\s\-:]+[Dd]ue\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/g;
    let match;
    while ((match = assignmentPattern.exec(extractedText)) !== null) {
      assessments.push({
        courseName: extractCourseName(extractedText) || "Unknown Course",
        assignmentName: `${match[1]} ${match[2]}`,
        dueDate: formatDate(match[3]),
        weight: 0, // You'd need to extract this from the text
        status: "Not started",
      });
    }

    // If no assessments were found, try to identify sections
    if (assessments.length === 0) {
      const sections = extractedText.split(/\n{2,}/);
      for (const section of sections) {
        if (
          /assessment|assignment|quiz|exam|test|grading|evaluation/i.test(
            section
          ) &&
          /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/.test(section)
        ) {
          assessments.push({
            courseName: extractCourseName(extractedText) || "Unknown Course",
            assignmentName:
              "Assignment from " + section.slice(0, 30).trim() + "...",
            dueDate:
              extractDate(section) || new Date().toISOString().split("T")[0],
            weight: 0,
            status: "Not started",
          });
        }
      }
    }

    // If still no assessments, add a placeholder
    if (assessments.length === 0) {
      assessments.push({
        courseName: extractCourseName(extractedText) || "Unknown Course",
        assignmentName: "Manual Review Required",
        dueDate: new Date().toISOString().split("T")[0],
        weight: 0,
        status: "Not started",
      });
    }

    // Save the PDF metadata using admin Firestore
    await adminDb.collection(`users/${userId}/documents`).add({
      fileName,
      uploadDate: new Date(),
      semester,
      text: extractedText.slice(0, 5000),
    });

    // Add the assessments using admin Firestore
    const assessmentsRef = adminDb.collection(
      `users/${userId}/semesters/${semesterId}/assessments`
    );
    for (const assessment of assessments) {
      await assessmentsRef.add({
        ...assessment,
        createdAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: `Extracted ${assessments.length} assessments from the PDF`,
    });
  } catch (error) {
    console.error("Processing error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Helper functions for extracting information from the PDF text
function extractCourseName(text: string): string | null {
  const courseCodePattern = /([A-Z]{2,4})\s*(\d{3,4})/i;
  const match = text.match(courseCodePattern);
  if (match) {
    return `${match[1]}${match[2]}`;
  }

  const courseTitlePattern = /[Cc]ourse\s*(?:[Tt]itle)?:?\s*([A-Za-z0-9\s&]+)/;
  const titleMatch = text.match(courseTitlePattern);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return null;
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split(/[\/-]/);
    let month, day, year;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) {
        // MM/DD/YYYY
        month = parts[0];
        day = parts[1];
        year = parts[2];
      } else {
        // MM/DD/YY
        month = parts[0];
        day = parts[1];
        year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      }
      month = month.padStart(2, "0");
      day = day.padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
}

function extractDate(text: string): string | null {
  const datePattern = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
  const match = text.match(datePattern);
  if (match) {
    return formatDate(match[1]);
  }
  return null;
}

export default handler;
