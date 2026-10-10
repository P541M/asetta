import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAdmin } from "../../lib/firebase-admin";
import { sendWelcomeEmail } from "../../lib/email";

const MAX_NAME_LENGTH = 100;

// gRPC status ALREADY_EXISTS, which DocumentReference.create() throws when the doc is there.
const ALREADY_EXISTS = 6;

/** Collapses whitespace (so a name can't break the subject line) and caps the length. */
function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only POST method is allowed",
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const adminApp = await getAdmin();
  let uid: string;
  let email: string | undefined;
  let tokenName: unknown;
  try {
    ({ uid, email, name: tokenName } = await getAuth(adminApp).verifyIdToken(authHeader.slice(7)));
  } catch {
    return res.status(401).json({ error: "Invalid authentication token" });
  }

  // The recipient is always the signed-in account's own address; any email in the body is ignored.
  if (!email) {
    return res.status(400).json({ error: "No email address on this account" });
  }

  const body = (req.body ?? {}) as { displayName?: unknown; institution?: unknown };
  const displayName = cleanText(body.displayName) || cleanText(tokenName) || email.split("@")[0];
  const institution = cleanText(body.institution) || undefined;

  // Claim the send before sending. create() is atomic, so concurrent requests for the same user
  // send one email. Clients have no rule for this collection, so only the server can reset it.
  const sentMarker = getFirestore(adminApp).doc(`welcomeEmails/${uid}`);
  try {
    await sentMarker.create({ sentAt: FieldValue.serverTimestamp() });
  } catch (error) {
    if ((error as { code?: unknown }).code === ALREADY_EXISTS) {
      return res.status(200).json({ success: true, sent: false, message: "Already sent" });
    }
    console.error("Welcome email: could not record the send", { uid, error });
    return res.status(500).json({ error: "Email sending failed" });
  }

  try {
    await sendWelcomeEmail(displayName, email, institution);
  } catch (error) {
    // Release the claim so a later request can retry.
    await sentMarker.delete().catch((deleteError: unknown) => {
      console.error("Welcome email: could not release the send claim", { uid, deleteError });
    });

    // Log the codes only: nodemailer's messages can contain the recipient address.
    const { code, responseCode } = error as { code?: string; responseCode?: number };
    console.error("Welcome email: send failed", { uid, code, responseCode });

    return res.status(code === "ECONNECTION" ? 503 : 500).json({
      error: "Email sending failed",
      message: "Failed to send welcome email",
    });
  }

  return res.status(200).json({ success: true, sent: true, message: "Welcome email sent" });
}
