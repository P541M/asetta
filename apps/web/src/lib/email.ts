import nodemailer from "nodemailer";
import { devError } from "../utils/devLog";
import { confirmAddressEmail, reminderEmail, welcomeEmail } from "./emailTemplates";
import type { EmailContent, ReminderDetails } from "./emailTemplates";

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function deliver(to: string, { subject, html, text }: EmailContent) {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER environment variable is not set");
  }
  if (!process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_APP_PASSWORD environment variable is not set");
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"Asetta" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    const { message, code } = error as { message?: string; code?: string };
    devError("Email sending failed:", { error: message || String(error), code });
    throw error;
  }
}

/** `name` only for a verified address; see the welcome-email route (D7). */
export async function sendWelcomeEmail(to: string, name?: string) {
  await deliver(to, welcomeEmail(name));
}

export async function sendReminderEmail(to: string, details: ReminderDetails) {
  await deliver(to, reminderEmail(details));
}

/** The confirm link for a notification address the student chose (A17). */
export async function sendConfirmAddressEmail(to: string, confirmUrl: string) {
  await deliver(to, confirmAddressEmail(confirmUrl));
}
