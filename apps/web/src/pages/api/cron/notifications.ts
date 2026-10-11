import { NextApiRequest, NextApiResponse } from "next";
import { checkAndSendNotifications } from "../../../lib/notifications";
import { isCronAuthorized } from "../../../lib/reminderCron";

// Called by the Vercel cron, which sends `Authorization: Bearer <CRON_SECRET>`.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fails closed, so a missing secret stops every reminder; say so in the logs.
    console.error("Reminder cron: CRON_SECRET is not set, refusing the request");
  }
  if (!isCronAuthorized(req.headers.authorization, secret)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const summary = await checkAndSendNotifications();
    res.status(200).json({ message: "Notifications checked", summary });
  } catch (error) {
    console.error("Reminder cron: run failed", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
