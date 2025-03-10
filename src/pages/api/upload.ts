// src/pages/api/upload.ts
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
      // Safely log the error
      console.error(
        "Invalid token:",
        error instanceof Error ? error.message : String(error)
      );
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
      console.error(
        "Error parsing PDF:",
        error instanceof Error ? error.message : String(error)
      );
      return res
        .status(500)
        .json({ success: false, error: "Error reading PDF content" });
    }

    // Call DeepSeek API to extract assessments
    try {
      const deepseekEndpoint = process.env.DEEPSEEK_ENDPOINT;
      const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

      if (!deepseekEndpoint || !deepseekApiKey) {
        throw new Error("DeepSeek API credentials not configured");
      }

      const prompt = `
        You are an AI assistant that extracts assessment information from course outlines.
        
        Extract all assessments from the following course outline text. Return a JSON array with objects having the following structure:
        {
          "courseName": "The course code or name",
          "assignmentName": "Name of the assessment",
          "dueDate": "YYYY-MM-DD format date",
          "weight": "Percentage weight as a number",
          "status": "Not started"
        }
        
        Only include assessments that have clear due dates or deadline information. Extract as many assessments as you can find.
        
        Course outline text:
        ${extractedText}
        
        Respond with ONLY a valid JSON array of assessment objects. No other explanation or text.
      `;

      const response = await fetch(deepseekEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("DeepSeek API error:", errorData);
        throw new Error(`DeepSeek API returned status ${response.status}`);
      }

      const aiResponse = await response.json();

      // Extract the content from the AI response
      const aiContent = aiResponse.choices[0].message.content;

      // Try to parse the JSON from the AI's response
      let assessments: Assessment[] = [];
      try {
        // Find JSON in the response if it's not a perfect JSON string
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : aiContent;

        assessments = JSON.parse(jsonString);

        // Validate and clean the data
        assessments = assessments.map((assessment) => ({
          courseName:
            assessment.courseName ||
            extractCourseName(extractedText) ||
            "Unknown Course",
          assignmentName: assessment.assignmentName || "Unknown Assessment",
          dueDate:
            formatDate(assessment.dueDate) ||
            new Date().toISOString().split("T")[0],
          weight:
            typeof assessment.weight === "number"
              ? assessment.weight
              : parseFloat(assessment.weight) || 0,
          status: "Not started",
        }));
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("AI raw response:", aiContent);

        // Fallback to basic extraction if AI parsing fails
        assessments = extractAssessmentsBasic(extractedText);
      }

      // If no assessments were found even after AI processing, add a placeholder
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

      const batch = adminDb.batch();
      for (const assessment of assessments) {
        const newAssessmentRef = assessmentsRef.doc();
        batch.set(newAssessmentRef, {
          ...assessment,
          createdAt: new Date(),
        });
      }
      await batch.commit();

      return res.status(200).json({
        success: true,
        message: `Extracted ${assessments.length} assessments from the PDF`,
      });
    } catch (aiError) {
      console.error("AI processing error:", aiError);

      // Fallback to basic extraction if AI fails
      const assessments = extractAssessmentsBasic(extractedText);

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

      const batch = adminDb.batch();
      for (const assessment of assessments) {
        const newAssessmentRef = assessmentsRef.doc();
        batch.set(newAssessmentRef, {
          ...assessment,
          createdAt: new Date(),
        });
      }
      await batch.commit();

      return res.status(200).json({
        success: true,
        message: `Extracted ${assessments.length} assessments from the PDF (fallback method)`,
      });
    }
  } catch (error) {
    // Safely log the error with more details
    try {
      if (error instanceof Error) {
        console.error("Processing error:", error.message);
        console.error("Error stack:", error.stack);
      } else if (error === null) {
        console.error("Processing error: null");
      } else {
        console.error("Processing error:", String(error));
      }
    } catch (logError) {
      console.error("Error while logging error:", String(logError));
    }
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Basic extraction function as fallback
function extractAssessmentsBasic(extractedText: string): Assessment[] {
  const assessments: Assessment[] = [];

  // Example: Look for patterns like "Assignment X - Due: MM/DD/YYYY"
  const assignmentPattern =
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)\s*[-:\.]*\s*([Dd]ue|[Dd]eadline|[Ss]ubmission)?\s*[-:\.]*\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s*\d{4})/g;

  // Split text into sections to analyze each part
  const sections = extractedText.split(/\n{2,}/);

  // Process whole text first
  let match;
  while ((match = assignmentPattern.exec(extractedText)) !== null) {
    assessments.push({
      courseName: extractCourseName(extractedText) || "Unknown Course",
      assignmentName: `${match[1]} ${match[2] || ""}`.trim(),
      dueDate: formatDate(match[4]),
      weight: extractWeight(extractedText, match[0]) || 0,
      status: "Not started",
    });
  }

  // If no assessments were found from the whole text, analyze section by section
  if (assessments.length === 0) {
    for (const section of sections) {
      if (
        /assessment|assignment|quiz|exam|test|grading|evaluation|project|paper|due date|deadline/i.test(
          section
        ) &&
        /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s*\d{4}/i.test(section)
      ) {
        assessments.push({
          courseName: extractCourseName(extractedText) || "Unknown Course",
          assignmentName:
            extractAssignmentName(section) ||
            "Assignment from " + section.slice(0, 30).trim() + "...",
          dueDate:
            extractDate(section) || new Date().toISOString().split("T")[0],
          weight: extractWeight(section) || 0,
          status: "Not started",
        });
      }
    }
  }

  return assessments;
}

// Helper functions for extracting information from the PDF text
function extractCourseName(text: string): string | null {
  // Try to find a course code (e.g., CS101 or HIST 200)
  const courseCodePattern = /([A-Z]{2,4})\s*(\d{3,4}[A-Z]*)/i;
  const match = text.match(courseCodePattern);
  if (match) {
    return `${match[1]}${match[2]}`;
  }

  // Try to find a course title
  const courseTitlePattern = /[Cc]ourse\s*(?:[Tt]itle)?:?\s*([A-Za-z0-9\s&]+)/;
  const titleMatch = text.match(courseTitlePattern);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  return null;
}

function formatDate(dateStr: string): string {
  try {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Check for month name format (e.g., "January 15, 2023")
    const monthNamePattern = /(\w+)\s+(\d{1,2}),?\s*(\d{4})/i;
    const monthNameMatch = dateStr.match(monthNamePattern);
    if (monthNameMatch) {
      const monthNames = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];
      const month =
        monthNames.findIndex((m) => m === monthNameMatch[1].toLowerCase()) + 1;
      if (month > 0) {
        const day = parseInt(monthNameMatch[2]);
        const year = parseInt(monthNameMatch[3]);
        return `${year}-${month.toString().padStart(2, "0")}-${day
          .toString()
          .padStart(2, "0")}`;
      }
    }

    // Handle formats like MM/DD/YYYY or DD/MM/YYYY
    const parts = dateStr.split(/[\/-]/);
    if (parts.length === 3) {
      let month, day, year;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) {
        // Assume MM/DD/YYYY for US format (most common)
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
    console.error("Date formatting error:", e);
    return dateStr;
  }
}

function extractDate(text: string): string | null {
  // First try to match specific date formats
  const datePatterns = [
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/, // YYYY/MM/DD
    /(\w+\s+\d{1,2},?\s*\d{4})/, // Month DD, YYYY
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return formatDate(match[1]);
    }
  }

  return null;
}

function extractAssignmentName(text: string): string | null {
  const patterns = [
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)\s*:?\s*([^.]*)/,
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[3]) {
        return `${match[1]} ${match[2] || ""}: ${match[3]}`.trim();
      } else {
        return `${match[1]} ${match[2] || ""}`.trim();
      }
    }
  }

  return null;
}

function extractWeight(text: string, context?: string): number | null {
  // If we have context (like the assignment mention), look for percentage near it
  if (context) {
    const contextIndex = text.indexOf(context);
    if (contextIndex !== -1) {
      // Look for weight within 200 characters after the context
      const searchArea = text.substring(contextIndex, contextIndex + 200);
      const weightPattern =
        /(\d{1,3})%|\((\d{1,3})%\)|\[(\d{1,3})%\]|worth\s+(\d{1,3})%|weighted\s+(\d{1,3})%/i;
      const match = searchArea.match(weightPattern);
      if (match) {
        // Find the first non-undefined capture group with a number
        for (let i = 1; i < match.length; i++) {
          if (match[i]) {
            return parseInt(match[i]);
          }
        }
      }
    }
  }

  // If no context or no match found with context, search in the general text
  const weightPattern =
    /(\d{1,3})%|\((\d{1,3})%\)|\[(\d{1,3})%\]|worth\s+(\d{1,3})%|weighted\s+(\d{1,3})%/i;
  const match = text.match(weightPattern);
  if (match) {
    // Find the first non-undefined capture group with a number
    for (let i = 1; i < match.length; i++) {
      if (match[i]) {
        return parseInt(match[i]);
      }
    }
  }

  return null;
}

export default handler;
