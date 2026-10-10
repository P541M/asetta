import type { NextApiRequest, NextApiResponse } from "next";
import { reminderEmail, welcomeEmail } from "../../../lib/emailTemplates";
import type { EmailContent } from "../../../lib/emailTemplates";

const VARIANTS = [
  ["Reminder, due in 3 days", "email=reminder"],
  ["Reminder, due tomorrow", "email=reminder&days=1"],
  ["Welcome, verified address (Google sign-up)", "email=welcome&name=Sam%20Lee"],
  ["Welcome, unverified address (password sign-up)", "email=welcome"],
];

function render(req: NextApiRequest, appUrl: string): EmailContent | null {
  const { email, name, days } = req.query;
  if (email === "welcome") {
    return welcomeEmail(typeof name === "string" ? name : undefined, appUrl);
  }
  if (email === "reminder") {
    const daysUntilDue = Math.max(0, Math.min(30, Number(days ?? 3) || 0));
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + daysUntilDue);
    dueAt.setHours(23, 59, 0, 0);
    return reminderEmail(
      { assessmentTitle: "Lab report 2", courseName: "CHEM 1010", dueAt },
      appUrl,
    );
  }
  return null;
}

/**
 * Dev only: renders the outgoing emails with sample data so they can be reviewed without sending.
 * Links and the logo point at this dev server. `format=text` shows the subject and plain text.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).end();
  }

  const appUrl = `http://${req.headers.host}`;
  const content = render(req, appUrl);

  if (!content) {
    const links = VARIANTS.map(
      ([label, query]) =>
        `<li>${label}: <a href="?${query}">HTML</a> · <a href="?${query}&format=text">text</a></li>`,
    ).join("");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`<!DOCTYPE html><title>Email preview</title><ul>${links}</ul>`);
  }

  if (req.query.format === "text") {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(`Subject: ${content.subject}\n\n${content.text}\n`);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(content.html);
}
