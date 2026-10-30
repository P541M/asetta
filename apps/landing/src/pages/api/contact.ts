import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer, { type Transporter } from "nodemailer";
import type { ContactFormPayload } from "@/lib/contact";
import { clientIp, createRateLimiter } from "@/lib/rateLimit";
import { CONTACT_EMAIL } from "@/lib/site";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 320;
const MAX_MESSAGE_LENGTH = 5000;

/** Escapes user-supplied text before it is interpolated into the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Every message lands in the founder's inbox, so one IP gets a few an hour (A20). The count lives
// in this instance only (see lib/rateLimit.ts): it slows a client resubmitting in a loop, it isn't
// a hard cap.
const SENDS_PER_IP = 5;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const sendLimiter = createRateLimiter({ limit: SENDS_PER_IP, windowMs: SEND_WINDOW_MS });

const waitText = (seconds: number) => {
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "about a minute" : `about ${minutes} minutes`;
};

// Reused across requests for the lifetime of the serverless instance.
let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message, emailConsent, website } = (req.body ?? {}) as ContactFormPayload;

  // The honeypot: people never see the field, bots fill it. They get the usual answer, so they
  // learn nothing, and nothing is sent.
  if (website) {
    return res.status(200).json({ message: "Email sent successfully" });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return res.status(400).json({ message: "Submission is too long" });
  }

  // CASL Compliance Check
  if (!emailConsent) {
    return res.status(400).json({
      message:
        "Email consent is required under Canada's Anti-Spam Legislation (CASL) to process this inquiry.",
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Counted only once a submission is valid and about to send
  const ipAddress = clientIp(req.headers["x-forwarded-for"], req.socket.remoteAddress);
  const decision = sendLimiter.hit(ipAddress, Date.now());
  if (!decision.allowed) {
    res.setHeader("Retry-After", String(decision.retryAfterSeconds));
    return res.status(429).json({
      message: `You've sent several messages in the last hour. Please try again in ${waitText(
        decision.retryAfterSeconds,
      )}, or email us at ${CONTACT_EMAIL}.`,
    });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Contact form: EMAIL_USER and EMAIL_PASS must be configured");
    return res.status(500).json({
      message: "Failed to initialize email service. Please try again later.",
    });
  }

  const userAgent = req.headers["user-agent"] || "Unknown";

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to: CONTACT_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      text: `
New Contact Form Submission (CASL Compliant)

Name: ${name}
Email: ${email}
Message: ${message}

CASL Compliance: User provided explicit consent for email communications.
Submission Date: ${new Date().toISOString()}
IP Address: ${ipAddress}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<div style="background-color: #e8f5e8; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
  <p><strong>CASL compliant submission</strong></p>
  <p style="font-size: 12px;">User provided explicit consent for email communications as required by Canada's Anti-Spam Legislation.</p>
</div>
<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Message:</strong></p>
<p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${escapeHtml(message)}</p>
<hr>
<p style="font-size: 12px; color: #666;">
  <strong>Submission Details:</strong><br>
  Date: ${new Date().toLocaleString("en-CA", { timeZone: "America/Toronto" })}<br>
  IP: ${escapeHtml(ipAddress)}<br>
  User Agent: ${escapeHtml(userAgent)}
</p>
      `,
    });

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "Failed to send email. Please try again later.",
    });
  }
}
