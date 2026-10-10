import nodemailer from "nodemailer";
import { devLog, devError } from "../utils/devLog";
import { generateEmailHTML, generateWelcomeEmailHTML } from "./emailTemplates";

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendWelcomeEmail(displayName: string, email: string, institution?: string) {
  if (process.env.NODE_ENV === "development") {
    devLog("📧 Attempting to send welcome email");
  }

  // Validate environment variables
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER environment variable is not set");
  }
  if (!process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_APP_PASSWORD environment variable is not set");
  }

  try {
    // Test transporter connection
    if (process.env.NODE_ENV === "development") {
      devLog("🔍 Testing email transporter connection...");
    }
    await transporter.verify();
    if (process.env.NODE_ENV === "development") {
      devLog("✅ Email transporter connection verified");
    }

    const html = generateWelcomeEmailHTML(displayName, email, institution);

    const mailOptions = {
      from: `"Asetta" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to Asetta, ${displayName}! 🎉`,
      text: `Hi ${displayName}! Welcome to Asetta! We're excited to help you manage your academic assessments and stay on top of your studies. Visit your dashboard at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard to get started.`,
      html,
    };

    if (process.env.NODE_ENV === "development") {
      devLog("📤 Sending welcome email");
    }

    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === "development") {
      devLog("✅ Welcome email sent successfully");
    }
    return true;
  } catch (error) {
    const emailError = error as {
      message?: string;
      code?: string;
      command?: string;
      response?: string;
      responseCode?: number;
    };
    devError("❌ Welcome email sending failed");
    if (process.env.NODE_ENV === "development") {
      devError("Welcome email error details:", {
        error: emailError.message || String(error),
        code: emailError.code,
      });
    }
    throw error;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  assessmentTitle: string,
  daysUntilDue: number,
  courseName: string,
) {
  if (process.env.NODE_ENV === "development") {
    devLog("📧 Attempting to send assessment email");
  }

  // Validate environment variables
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER environment variable is not set");
  }
  if (!process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_APP_PASSWORD environment variable is not set");
  }

  try {
    // Test transporter connection
    if (process.env.NODE_ENV === "development") {
      devLog("🔍 Testing email transporter connection...");
    }
    await transporter.verify();
    if (process.env.NODE_ENV === "development") {
      devLog("✅ Email transporter connection verified");
    }

    const html = generateEmailHTML(assessmentTitle, daysUntilDue, courseName);

    const mailOptions = {
      from: `"Asetta" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: `Reminder: "${courseName} - ${assessmentTitle}" is due in ${daysUntilDue} day${
        daysUntilDue === 1 ? "" : "s"
      }`,
      html,
    };

    if (process.env.NODE_ENV === "development") {
      devLog("📤 Sending assessment email");
    }

    await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === "development") {
      devLog("✅ Assessment email sent successfully");
    }
    return true;
  } catch (error) {
    const emailError = error as {
      message?: string;
      code?: string;
      command?: string;
      response?: string;
      responseCode?: number;
    };
    devError("❌ Assessment email sending failed");
    if (process.env.NODE_ENV === "development") {
      devError("Assessment email error details:", {
        error: emailError.message || String(error),
        code: emailError.code,
      });
    }
    throw error;
  }
}
