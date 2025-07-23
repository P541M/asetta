import { NextApiRequest, NextApiResponse } from "next";
import { checkAndSendNotifications } from "../../../lib/notifications";

// This is the handler for the cron job
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await checkAndSendNotifications();
    res
      .status(200)
      .json({ message: "Notifications checked and sent successfully" });
  } catch (error) {
    console.error("Error in notification cron job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// This is the configuration for the Vercel Cron Job
export const config = {
  regions: ["iad1"], // Use the region closest to your users
};
