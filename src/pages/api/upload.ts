import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { getAdmin } from "../../lib/firebase-admin";
import { supabase } from "../../lib/supabase";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface Assessment {
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  weight: number;
  status: string;
  outlineUrl?: string;
}

async function extractAssessmentsAI(text: string): Promise<string> {
  const deepseekEndpoint = process.env.DEEPSEEK_ENDPOINT;
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!deepseekEndpoint || !deepseekApiKey) {
    throw new Error("DeepSeek API not configured");
  }

  const prompt = `
    You are an AI assistant that extracts assessment information from course outlines.
    Extract all assessments from the following course outline text. Return a JSON array with objects having the following structure:
    {
      "courseName": "The course code or name",
      "assignmentName": "Name of the assessment",
      "dueDate": "YYYY-MM-DD format date",
      "dueTime": "HH:MM format time (24-hour), default to '23:59' if not specified",
      "weight": "Percentage weight as a number",
      "status": "Not started"
    }

    Only include assessments that have clear due dates or deadline information. Extract as many assessments as you can find. If no time is specified, use '23:59' as the default.

    Course outline text:
    ${text}

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
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  return aiResponse.choices[0].message.content;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const parseForm = (
    req: NextApiRequest
  ): Promise<{ fields: Fields; files: Files }> => {
    return new Promise((resolve, reject) => {
      const form = new IncomingForm({ 
        multiples: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        filter: ({ mimetype }) => mimetype === 'application/pdf'
      });
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
  };

  try {
    const { fields, files } = await parseForm(req);
    const semesterField = fields.semester;
    const semester = Array.isArray(semesterField)
      ? semesterField[0]
      : semesterField;
    if (!semester) {
      return res
        .status(400)
        .json({ success: false, error: "Semester is required" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }
    const token = authHeader.split(" ")[1];
    const admin = await getAdmin();
    let userId;
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("Invalid token:", error);
      return res
        .status(401)
        .json({ success: false, error: "Invalid authentication token" });
    }

    const adminDb = admin.firestore();
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
      return res
        .status(400)
        .json({ success: false, error: "No valid files were uploaded" });
    }

    let totalAssessments = 0;
    let processedFiles = 0;
    let failedFiles = 0;
    const errors: string[] = [];

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
          console.error(`Error parsing PDF ${fileName}:`, error);
          failedFiles++;
          errors.push(`Failed to parse PDF: ${fileName}`);
          continue;
        }

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('outlines')
          .upload(`${userId}/${semesterId}/${fileName}`, pdfBuffer, {
            contentType: 'application/pdf',
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('outlines')
          .getPublicUrl(`${userId}/${semesterId}/${fileName}`);

        let assessments: Assessment[] = [];
        try {
          if (process.env.DEEPSEEK_API_KEY) {
            const aiContent = await extractAssessmentsAI(extractedText);
            const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
            const jsonString = jsonMatch ? jsonMatch[0] : aiContent;
            assessments = JSON.parse(jsonString);
            assessments = assessments.map((assessment) => ({
              courseName:
                assessment.courseName ||
                extractCourseName(extractedText) ||
                "Unknown Course",
              assignmentName: assessment.assignmentName || "Unknown Assessment",
              dueDate:
                formatDate(assessment.dueDate) ||
                new Date().toISOString().split("T")[0],
              dueTime: assessment.dueTime || "23:59",
              weight:
                typeof assessment.weight === "number"
                  ? assessment.weight
                  : parseFloat(assessment.weight) || 0,
              status: "Not started",
              outlineUrl: publicUrl,
            }));
          } else {
            throw new Error("DeepSeek API not configured");
          }
        } catch (aiError) {
          console.warn(`AI extraction failed for ${fileName}, falling back to basic extraction`);
          assessments = extractAssessmentsBasic(extractedText).map(
            (assessment) => ({
              ...assessment,
              outlineUrl: publicUrl,
            })
          );
        }

        if (assessments.length === 0) {
          assessments.push({
            courseName: extractCourseName(extractedText) || "Unknown Course",
            assignmentName: "Manual Review Required",
            dueDate: new Date().toISOString().split("T")[0],
            dueTime: "23:59",
            weight: 0,
            status: "Not started",
            outlineUrl: publicUrl,
          });
        }

        await adminDb.collection(`users/${userId}/documents`).add({
          fileName,
          uploadDate: new Date(),
          semester,
          text: extractedText.slice(0, 5000),
          outlineUrl: publicUrl,
          fileSize: pdfBuffer.length,
          status: 'processed'
        });

        const assessmentsRef = adminDb.collection(
          `users/${userId}/semesters/${semesterId}/assessments`
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
      } catch (fileError) {
        console.error("Error processing file:", fileError);
        failedFiles++;
        errors.push(`Failed to process file: ${fileData.originalFilename}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${processedFiles} file(s), extracted ${totalAssessments} assessments. ${
        failedFiles > 0 ? `Failed to process ${failedFiles} file(s).` : ""
      }`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("Processing error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

function extractAssessmentsBasic(extractedText: string): Assessment[] {
  const assessments: Assessment[] = [];
  const assignmentPattern =
    /([Aa]ssignment|[Qq]uiz|[Tt]est|[Ee]xam|[Pp]roject|[Pp]aper|[Ll]ab)\s*(\d*)\s*[-:\.]*\s*([Dd]ue|[Dd]eadline|[Ss]ubmission)?\s*[-:\.]*\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s*\d{4})(\s*at\s*(\d{1,2}:\d{2}\s*[APap][Mm])|\s*(\d{1,2}:\d{2}))?/gi;
  const sections = extractedText.split(/\n{2,}/);
  let match;
  while ((match = assignmentPattern.exec(extractedText)) !== null) {
    const timeMatch = match[6] || match[7];
    const dueTime = extractTime(timeMatch) || "23:59";
    assessments.push({
      courseName: extractCourseName(extractedText) || "Unknown Course",
      assignmentName: `${match[1]} ${match[2] || ""}`.trim(),
      dueDate: formatDate(match[4]),
      dueTime,
      weight: extractWeight(extractedText, match[0]) || 0,
      status: "Not started",
    });
  }

  if (assessments.length === 0) {
    for (const section of sections) {
      if (
        /assessment|assignment|quiz|exam|test|grading|evaluation|project|paper|due date|deadline/i.test(
          section
        ) &&
        /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\w+\s+\d{1,2},?\s*\d{4}/i.test(section)
      ) {
        const date = extractDate(section);
        const time = extractTimeFromSection(section) || "23:59";
        assessments.push({
          courseName: extractCourseName(extractedText) || "Unknown Course",
          assignmentName:
            extractAssignmentName(section) ||
            "Assignment from " + section.slice(0, 30).trim() + "...",
          dueDate: date || new Date().toISOString().split("T")[0],
          dueTime: time,
          weight: extractWeight(section) || 0,
          status: "Not started",
        });
      }
    }
  }
  return assessments;
}

function extractCourseName(text: string): string | null {
  const courseCodePattern = /([A-Z]{2,4})\s*(\d{3,4}[A-Z]*)/i;
  const match = text.match(courseCodePattern);
  if (match) return `${match[1]}${match[2]}`;
  const courseTitlePattern = /[Cc]ourse\s*(?:[Tt]itle)?:?\s*([A-Za-z0-9\s&]+)/;
  const titleMatch = text.match(courseTitlePattern);
  if (titleMatch) return titleMatch[1].trim();
  return null;
}

function extractDate(text: string): string | null {
  const datePatterns = [
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
    /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
    /(\w+\s+\d{1,2},?\s*\d{4})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return formatDate(match[1]);
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
      if (match[3]) return `${match[1]} ${match[2] || ""}: ${match[3]}`.trim();
      return `${match[1]} ${match[2] || ""}`.trim();
    }
  }
  return null;
}

function extractWeight(text: string, context?: string): number | null {
  if (context) {
    const contextIndex = text.indexOf(context);
    if (contextIndex !== -1) {
      const searchArea = text.substring(contextIndex, contextIndex + 200);
      const weightPattern =
        /(\d{1,3})%|\((\d{1,3})%\)|\[(\d{1,3})%\]|worth\s+(\d{1,3})%|weighted\s+(\d{1,3})%/i;
      const match = searchArea.match(weightPattern);
      if (match) {
        for (let i = 1; i < match.length; i++) {
          if (match[i]) return parseInt(match[i]);
        }
      }
    }
  }
  const weightPattern =
    /(\d{1,3})%|\((\d{1,3})%\)|\[(\d{1,3})%\]|worth\s+(\d{1,3})%|weighted\s+(\d{1,3})%/i;
  const match = text.match(weightPattern);
  if (match) {
    for (let i = 1; i < match.length; i++) {
      if (match[i]) return parseInt(match[i]);
    }
  }
  return null;
}

function formatDate(dateStr: string): string {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
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
    const parts = dateStr.split(/[\/-]/);
    if (parts.length === 3) {
      let month, day, year;
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else if (parts[2].length === 4) {
        month = parts[0];
        day = parts[1];
        year = parts[2];
      } else {
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

function extractTime(timeStr?: string): string | null {
  if (!timeStr) return null;
  const timePattern = /(\d{1,2}:\d{2})\s*([APap][Mm])?/i;
  const match = timeStr.match(timePattern);
  if (match) {
    let [hours, minutes] = match[1].split(":").map((num) => parseInt(num, 10));
    const period = match[2] ? match[2].toUpperCase() : "";
    if (period) {
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  return null;
}

function extractTimeFromSection(section: string): string | null {
  const timePattern = /(\d{1,2}:\d{2})\s*([APap][Mm])?|at\s*(\d{1,2}:\d{2})/i;
  const match = section.match(timePattern);
  if (match) {
    const timeStr = match[1] || match[3];
    const period = match[2] ? match[2].toUpperCase() : "";
    let [hours, minutes] = timeStr.split(":").map((num) => parseInt(num, 10));
    if (period) {
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  return null;
}
