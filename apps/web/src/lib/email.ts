import nodemailer, { type Transporter } from "nodemailer";
import { onceUntilSuccess } from "../utils/async";
import { devError } from "../utils/devLog";
import { confirmAddressEmail, reminderEmail, welcomeEmail } from "./emailTemplates";
import type { EmailContent, ReminderDetails } from "./emailTemplates";

/** The most Gmail connections one reminder cron run opens; each sends its emails in turn (A19). */
const REMINDER_CONNECTIONS = 3;

const gmailAuth = () => ({
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_APP_PASSWORD,
});

// Create a transporter using Gmail, for the routes that send one email per request
const transporter = nodemailer.createTransport({ service: "gmail", auth: gmailAuth() });

async function deliver(
  transport: Transporter,
  verify: () => Promise<unknown>,
  to: string,
  { subject, html, text }: EmailContent,
) {
  if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER environment variable is not set");
  }
  if (!process.env.EMAIL_APP_PASSWORD) {
    throw new Error("EMAIL_APP_PASSWORD environment variable is not set");
  }

  try {
    await verify();
    await transport.sendMail({
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

const deliverOne = (to: string, content: EmailContent) =>
  deliver(transporter, () => transporter.verify(), to, content);

/** `name` only for a verified address; see the welcome-email route (D7). */
export async function sendWelcomeEmail(to: string, name?: string) {
  await deliverOne(to, welcomeEmail(name));
}

/** The confirm link for a notification address the student chose (A17). */
export async function sendConfirmAddressEmail(to: string, confirmUrl: string) {
  await deliverOne(to, confirmAddressEmail(confirmUrl));
}

/** Sends one reminder cron run's emails. */
export interface ReminderMailer {
  send(to: string, details: ReminderDetails): Promise<void>;
  /** Closes the Gmail connections once the run has nothing left to send. */
  close(): void;
}

/**
 * The mailer for one cron run (A19): its emails share a few pooled Gmail connections, and the
 * login is verified once, before the first send (again only after a failed check).
 */
export function createReminderMailer(): ReminderMailer {
  const pool = nodemailer.createTransport({
    service: "gmail",
    pool: true,
    maxConnections: REMINDER_CONNECTIONS,
    auth: gmailAuth(),
  });
  const verify = onceUntilSuccess(() => pool.verify());
  return {
    send: (to, details) => deliver(pool, verify, to, reminderEmail(details)),
    close: () => pool.close(),
  };
}
