import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getAdmin } from "../../../lib/firebase-admin";
import { sendConfirmAddressEmail } from "../../../lib/email";
import {
  confirmLinkUrl,
  linkSendDecision,
  newConfirmToken,
  newLinkRecord,
  verificationRecordFromData,
} from "../../../lib/emailVerification";
import { cleanEmail, notificationEmailStatus } from "../../../utils/notificationEmail";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://asetta.me";

// Nothing is read from the body: the address comes from the user doc
export const config = { api: { bodyParser: false } };

/**
 * Emails the confirm link for the notification address saved on the signed-in user's doc (A17).
 * Until the link is used, reminders go to the account email. Links are capped per user
 * (lib/emailVerification.ts), because each one is an email to an address the student typed.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const adminApp = await getAdmin();
  let uid: string;
  let accountEmail: string | undefined;
  try {
    ({ uid, email: accountEmail } = await getAuth(adminApp).verifyIdToken(authHeader.slice(7)));
  } catch {
    return res.status(401).json({ error: "Invalid authentication token" });
  }

  const db = getFirestore(adminApp);
  const token = newConfirmToken();
  let email: string;
  try {
    const user = await db.doc(`users/${uid}`).get();
    const saved = cleanEmail(user.get("email"));
    const status = notificationEmailStatus({
      email: saved,
      verifiedEmail: user.get("verifiedEmail"),
      accountEmail,
    });
    if (!saved || !status) {
      return res.status(400).json({ error: "No notification email saved" });
    }
    if (status !== "unconfirmed") {
      return res.status(200).json({ status, sent: false });
    }
    email = saved;

    // Claimed in a transaction, so two requests at once can't both pass the cap
    const recordRef = db.doc(`emailVerifications/${uid}`);
    const decision = await db.runTransaction(async (transaction) => {
      const now = new Date();
      const record = verificationRecordFromData((await transaction.get(recordRef)).data());
      const outcome = linkSendDecision(record, now);
      if (outcome.send) {
        transaction.set(recordRef, newLinkRecord(email, token, now, outcome.sendsToday));
      }
      return outcome;
    });
    if (!decision.send) {
      res.setHeader("Retry-After", String(decision.retryAfterSeconds));
      return res.status(429).json({
        error: "Too many links",
        retryAfterSeconds: decision.retryAfterSeconds,
      });
    }
  } catch (error) {
    console.error("Confirm link: could not prepare the link", { uid, error });
    return res.status(500).json({ error: "Could not send the link" });
  }

  try {
    await sendConfirmAddressEmail(email, confirmLinkUrl(APP_URL, uid, token));
  } catch (error) {
    // Log the codes only: nodemailer's messages can contain the recipient address. The stored
    // link stays: it was never delivered, and the cap still counts it.
    const { code, responseCode } = error as { code?: string; responseCode?: number };
    console.error("Confirm link: send failed", { uid, code, responseCode });
    return res.status(code === "ECONNECTION" ? 503 : 500).json({ error: "Email sending failed" });
  }

  return res.status(200).json({ status: "unconfirmed", sent: true });
}
