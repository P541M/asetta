import nodemailer from "nodemailer";

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

function generateEmailHTML(
  assessmentTitle: string,
  daysUntilDue: number
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assessment Reminder</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #111827;
            margin: 0;
            padding: 0;
            background-color: #F9FAFB;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 0;
            background-color: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
          }
          .header {
            background-color: #009cff;
            color: white;
            padding: 24px;
            text-align: center;
            border-radius: 12px 12px 0 0;
          }
          .content {
            padding: 32px;
            background-color: #FFFFFF;
          }
          .assessment-title {
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
          }
          .due-date {
            background-color: #F3F4F6;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
            border: 1px solid #E5E7EB;
          }
          .days-remaining {
            font-size: 32px;
            font-weight: 700;
            color: #009cff;
            margin-top: 8px;
          }
          .message {
            color: #374151;
            font-size: 16px;
            margin: 16px 0;
          }
          .button {
            display: inline-block;
            background-color: #009cff;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 16px;
          }
          .footer {
            text-align: center;
            padding: 24px;
            background-color: #F9FAFB;
            border-top: 1px solid #E5E7EB;
            color: #6B7280;
            font-size: 14px;
            border-radius: 0 0 12px 12px;
          }
          .highlight {
            color: #009cff;
            font-weight: 500;
          }
          @media (max-width: 640px) {
            .container {
              margin: 0;
              border-radius: 0;
            }
            .header {
              border-radius: 0;
            }
            .content {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Assessment Reminder</h1>
          </div>
          <div class="content">
            <div class="assessment-title">${assessmentTitle}</div>
            <p class="message">Hey there! 👋 Just a friendly heads up about your upcoming assessment. We want to make sure you have everything you need to succeed!</p>
            <div class="due-date">
              <p style="margin: 0; color: #374151;">Time remaining:</p>
              <div class="days-remaining">${daysUntilDue} day${
    daysUntilDue === 1 ? "" : "s"
  }</div>
            </div>
            <p class="message">Need a quick refresher on the details? <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/dashboard" class="highlight">Check it out in Asetta</a> ✨</p>
            <p class="message" style="margin-top: 24px; font-style: italic;">You've got this! 💪</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">This is a friendly reminder from your Asetta team.</p>
            <p style="margin: 8px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} Asetta. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendEmail(
  to: string,
  subject: string,
  assessmentTitle: string,
  daysUntilDue: number
) {
  console.log("📧 Attempting to send email:", {
    to: `${to.substring(0, 3)}***`,
    subject,
    assessmentTitle,
    daysUntilDue,
  });

  // Validate environment variables
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER environment variable is not set");
  }
  if (!process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_APP_PASSWORD environment variable is not set");
  }

  try {
    // Test transporter connection
    console.log("🔍 Testing email transporter connection...");
    await transporter.verify();
    console.log("✅ Email transporter connection verified");

    const html = generateEmailHTML(assessmentTitle, daysUntilDue);

    const mailOptions = {
      from: `"Asetta" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: `Reminder: "${assessmentTitle}" is due in ${daysUntilDue} day${
        daysUntilDue === 1 ? "" : "s"
      }`,
      html,
    };

    console.log("📤 Sending email with options:", {
      from: mailOptions.from,
      to: `${to.substring(0, 3)}***`,
      subject: mailOptions.subject,
      textLength: mailOptions.text.length,
      htmlLength: mailOptions.html.length,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    return true;
  } catch (error) {
    const emailError = error as { 
      message?: string; 
      code?: string; 
      command?: string; 
      response?: string; 
      responseCode?: number; 
    };
    console.error("❌ Detailed email error:", {
      error: emailError.message || String(error),
      code: emailError.code,
      command: emailError.command,
      response: emailError.response,
      responseCode: emailError.responseCode,
    });
    throw error;
  }
}
