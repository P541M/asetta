import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  phoneNumber: string;
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
        smsNotifications: userData.smsNotifications || false,
        notificationDaysBefore: userData.notificationDaysBefore || 1,
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
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
          const message = `Reminder: "${
            assessment.title
          }" is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;

          // Send email notification if enabled
          if (preferences.emailNotifications && preferences.email) {
            await sendEmailNotification(preferences.email, message);
          }

          // Send SMS notification if enabled
          if (preferences.smsNotifications && preferences.phoneNumber) {
            await sendSMSNotification(preferences.phoneNumber, message);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking and sending notifications:", error);
  }
}

async function sendEmailNotification(email: string, message: string) {
  // TODO: Implement email sending using your preferred email service
  // For example, you could use SendGrid, AWS SES, or other email services
  console.log(`Sending email to ${email}: ${message}`);
}

async function sendSMSNotification(phoneNumber: string, message: string) {
  // TODO: Implement SMS sending using your preferred SMS service
  // For example, you could use Twilio, AWS SNS, or other SMS services
  console.log(`Sending SMS to ${phoneNumber}: ${message}`);
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
