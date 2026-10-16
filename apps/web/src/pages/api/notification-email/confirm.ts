import { NextApiRequest, NextApiResponse } from "next";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAdmin } from "../../../lib/firebase-admin";
import {
  confirmOutcome,
  isConfirmTokenFormat,
  verificationRecordFromData,
  type ConfirmOutcome,
} from "../../../lib/emailVerification";
import { isValidDocId } from "../../../utils/validation";

export const config = { api: { bodyParser: { sizeLimit: "1kb" } } };

/**
 * Confirms a notification address with the token from its link (A17). No sign-in: the link may
 * be opened on another device, and the token is the proof. The confirm page POSTs here from a
 * button, so a mail scanner fetching the link confirms nothing. Only this route writes
 * `verifiedEmail`; the rules refuse it from clients.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { uid, token } = (req.body ?? {}) as { uid?: unknown; token?: unknown };
  if (!isValidDocId(uid) || !isConfirmTokenFormat(token)) {
    return res.status(400).json({ status: "invalid" });
  }

  const db = getFirestore(await getAdmin());
  const recordRef = db.doc(`emailVerifications/${uid}`);
  const userRef = db.doc(`users/${uid}`);
  try {
    const outcome = await db.runTransaction(async (transaction): Promise<ConfirmOutcome> => {
      const [recordDoc, userDoc] = await transaction.getAll(recordRef, userRef);
      if (!userDoc.exists) return "invalid";
      const record = verificationRecordFromData(recordDoc.data());
      const result = confirmOutcome(record, token, new Date());
      if (result === "confirmed") {
        transaction.update(userRef, { verifiedEmail: record!.email });
        // One use: the link stops working, and the day's send count stays
        transaction.update(recordRef, {
          tokenHash: FieldValue.delete(),
          expiresAt: FieldValue.delete(),
        });
      }
      return result;
    });
    return res.status(outcome === "confirmed" ? 200 : 400).json({ status: outcome });
  } catch (error) {
    console.error("Confirm link: could not confirm", { uid, error });
    return res.status(500).json({ status: "failed" });
  }
}
