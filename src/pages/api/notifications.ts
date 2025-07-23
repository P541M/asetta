import { NextApiRequest, NextApiResponse } from "next";
import { checkAndSendNotifications } from "../../lib/notifications";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check for API key to ensure this endpoint is secure
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== process.env.NOTIFICATION_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await checkAndSendNotifications();
    res
      .status(200)
      .json({ message: "Notifications checked and sent successfully" });
  } catch (error) {
    console.error("Error in notification handler:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
