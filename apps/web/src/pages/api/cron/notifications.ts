import { NextApiRequest, NextApiResponse } from "next";
import { checkAndSendNotifications } from "../../../lib/notifications";
import { isCronAuthorized } from "../../../lib/reminderCron";

// Called every 30 minutes by GitHub Actions (.github/workflows/reminders.yml) and once a day by
// the Vercel cron (the backstop, vercel.json); both send `Authorization: Bearer <CRON_SECRET>`.
// Safe to call twice: a user is read only once their nextReminderAt has come, and every send is
// claimed before it goes out.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Fails closed, so a missing secret stops every reminder; say so in the logs.
    console.error("Reminder cron: CRON_SECRET is not set, refusing the request");
  }
  if (!isCronAuthorized(req.headers.authorization, secret)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Development only: `?now=<ISO instant>` runs the job as of that moment, for the emulator
  // checks in docs/ops.md. Ignored everywhere else.
  let now: Date | undefined;
  if (process.env.NODE_ENV === "development" && typeof req.query.now === "string") {
    now = new Date(req.query.now);
    if (isNaN(now.getTime())) {
      return res.status(400).json({ message: "now must be an ISO date and time" });
    }
  }

  try {
    const summary = await checkAndSendNotifications(now);
    res.status(200).json({ message: "Notifications checked", summary });
  } catch (error) {
    console.error("Reminder cron: run failed", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
