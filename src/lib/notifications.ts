import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendEmail } from "./email";

interface NotificationPreferences {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  hasConsentedToNotifications: boolean;
}

interface Assessment {
  id: string;
  title: string;
  dueDate: Date;
  userId: string;
}

export async function checkAndSendNotifications() {
  try {
    // Get all assessments with due dates
    const assessmentsRef = collection(db, "assessments");
    const now = new Date();
    const q = query(assessmentsRef, where("dueDate", ">=", now));

    const assessmentsSnapshot = await getDocs(q);
    const assessments = assessmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Assessment[];

    // Get all users with notification preferences
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const preferences: NotificationPreferences = {
        emailNotifications: userData.emailNotifications || false,
        notificationDaysBefore: userData.notificationDaysBefore || 1,
        email: userData.email || "",
        hasConsentedToNotifications:
          userData.hasConsentedToNotifications || false,
      };

      if (!preferences.hasConsentedToNotifications) continue;

      // Filter assessments for this user
      const userAssessments = assessments.filter(
        (a) => a.userId === userDoc.id
      );

      for (const assessment of userAssessments) {
        const dueDate = new Date(assessment.dueDate);
        const daysUntilDue = Math.ceil(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if we should send a notification
        if (daysUntilDue === preferences.notificationDaysBefore) {
          const subject = `Assessment Reminder: ${assessment.title}`;

          // Send email notification if enabled
          if (preferences.emailNotifications && preferences.email) {
            await sendEmail(
              preferences.email,
              subject,
              assessment.title,
              daysUntilDue
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking and sending notifications:", error);
  }
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to validate phone number format (basic validation)
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // This is a basic validation - you might want to use a more comprehensive library
  // like libphonenumber-js for proper phone number validation
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phoneNumber);
}
