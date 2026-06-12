import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer, { Transporter } from "nodemailer";
import { CONTACT_EMAIL } from "@/lib/site";

type ContactFormData = {
  name: string;
  email: string;
  message: string;
  emailConsent: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, message, emailConsent } = req.body as ContactFormData;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // CASL Compliance Check
  if (!emailConsent) {
    return res.status(400).json({ 
      message: "Email consent is required under Canada's Anti-Spam Legislation (CASL) to process this inquiry." 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  let transporter: Transporter;
  try {
    // Create a transporter using Gmail
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    await transporter.verify();
  } catch (error) {
    console.error("Error creating email transporter:", error);
    return res.status(500).json({
      message: "Failed to initialize email service. Please try again later.",
    });
  }

  try {
    // Send email
    await transporter.sendMail({
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
IP Address: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<div style="background-color: #e8f5e8; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
  <p><strong>✅ CASL Compliant Submission</strong></p>
  <p style="font-size: 12px;">User provided explicit consent for email communications as required by Canada's Anti-Spam Legislation.</p>
</div>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${message}</p>
<hr>
<p style="font-size: 12px; color: #666;">
  <strong>Submission Details:</strong><br>
  Date: ${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })}<br>
  IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown'}<br>
  User Agent: ${req.headers['user-agent'] || 'Unknown'}
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
