// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { IncomingForm, Fields, Files } from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

// Disable body parsing so that formidable can handle the file
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  const form = new IncomingForm();

  form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error parsing form" });
    }

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

    // --- Deepseek AI Integration ---
    try {
      // Construct the full endpoint URL by appending "/chat/completions"
      const baseEndpoint =
        process.env.DEEPSEEK_ENDPOINT || "https://api.deepseek.com/v1";
      const deepseekEndpoint = `${baseEndpoint}/chat/completions`;

      // Updated prompt: instruct the AI to return only valid JSON with key "assessments"
      const promptText = `Analyze the following syllabus and return ONLY a valid JSON object with a key "assessments". Do not include any extra text, explanations, or commentary. Use the following format strictly: {"assessments": [ ... ]}.\n\n${extractedText}`;

      const requestBody = {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: promptText },
        ],
        temperature: 0.3,
      };

      const deepseekResponse = await fetch(deepseekEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!deepseekResponse.ok) {
        throw new Error(`HTTP error! status: ${deepseekResponse.status}`);
      }

      const responseData = await deepseekResponse.json();
      console.log("Full API response:", responseData);

      // Extract the AI's message content
      const aiContent = responseData.choices[0]?.message?.content;
      if (!aiContent) {
        throw new Error("No content in AI response");
      }

      // Attempt to parse the output as JSON
      let extractedData;
      try {
        extractedData = JSON.parse(aiContent);
      } catch (parseError) {
        console.error("Error parsing AI response JSON:", parseError);
        // Fallback: extract JSON substring between the first '{' and last '}'
        const firstBrace = aiContent.indexOf("{");
        const lastBrace = aiContent.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const jsonSubstring = aiContent.substring(firstBrace, lastBrace + 1);
          try {
            extractedData = JSON.parse(jsonSubstring);
          } catch (fallbackError) {
            console.error("Fallback JSON parsing failed:", fallbackError);
            throw new Error("Invalid JSON output from Deepseek AI");
          }
        } else {
          throw new Error("Invalid JSON output from Deepseek AI");
        }
      }
      console.log("Parsed assessments:", extractedData);

      // Check if the parsed response contains an 'assessments' array
      if (
        extractedData.assessments &&
        Array.isArray(extractedData.assessments)
      ) {
        for (const assessment of extractedData.assessments) {
          await addDoc(collection(db, "semesters", semester, "assessments"), {
            ...assessment,
            status: "Not started", // default status
            createdAt: new Date(),
          });
        }
        return res.status(200).json({ success: true });
      } else {
        console.error("Unexpected response structure:", extractedData);
        return res.status(500).json({
          success: false,
          error: "Invalid response from Deepseek AI",
        });
      }
    } catch (error) {
      console.error("Processing error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};

export default handler;
