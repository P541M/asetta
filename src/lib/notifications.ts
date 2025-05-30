import { getAdmin } from "./firebase-admin";
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
  courseName: string;
  assignmentName: string;
  dueTime: string;
}

export async function checkAndSendNotifications() {
  try {
    const admin = await getAdmin();
    const db = admin.firestore();

    // Get all users with notification preferences
    const usersRef = db.collection("users");
    const usersSnapshot = await usersRef.get();
    console.log("Found", usersSnapshot.docs.length, "users");

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const preferences: NotificationPreferences = {
        emailNotifications: userData.emailNotifications || false,
        notificationDaysBefore: userData.notificationDaysBefore || 1,
        email: userData.email || "",
        hasConsentedToNotifications:
          userData.hasConsentedToNotifications || false,
      };

      console.log("User preferences:", {
        userId: userDoc.id,
        emailNotifications: preferences.emailNotifications,
        notificationDaysBefore: preferences.notificationDaysBefore,
        hasConsentedToNotifications: preferences.hasConsentedToNotifications,
        email: preferences.email ? "set" : "not set",
      });

      if (!preferences.hasConsentedToNotifications) {
        console.log("User has not consented to notifications, skipping");
        continue;
      }

      // Get all semesters for this user
      const semestersRef = userDoc.ref.collection("semesters");
      const semestersSnapshot = await semestersRef.get();
      console.log("Found", semestersSnapshot.docs.length, "semesters for user");

      // Get all assessments across all semesters
      const now = new Date();
      console.log("Checking notifications at:", now.toISOString());

      let allAssessments: Assessment[] = [];

      for (const semesterDoc of semestersSnapshot.docs) {
        const assessmentsRef = semesterDoc.ref.collection("assessments");
        const assessmentsSnapshot = await assessmentsRef.get();

        const semesterAssessments = assessmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Assessment[];

        allAssessments = [...allAssessments, ...semesterAssessments];
      }

      console.log("Found", allAssessments.length, "total assessments for user");

      // Filter assessments that are due in the future
      const futureAssessments = allAssessments.filter((assessment) => {
        const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);
        return dueDate > now;
      });

      console.log("Found", futureAssessments.length, "future assessments");

      for (const assessment of futureAssessments) {
        const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log("Assessment:", {
          title: assessment.assignmentName,
          courseName: assessment.courseName,
          dueDate: dueDate.toISOString(),
          daysUntilDue,
          notificationDaysBefore: preferences.notificationDaysBefore,
        });

        // Check if we should send a notification
        if (daysUntilDue === preferences.notificationDaysBefore) {
          const subject = `Assessment Reminder: ${assessment.assignmentName}`;

          // Send email notification if enabled
          if (preferences.emailNotifications && preferences.email) {
            console.log(
              `Sending notification for assessment "${assessment.assignmentName}" due in ${daysUntilDue} days`
            );
            await sendEmail(
              preferences.email,
              subject,
              assessment.assignmentName,
              daysUntilDue
            );
          } else {
            console.log("Email notifications not enabled or email not set");
          }
        } else {
          console.log(
            "Not sending notification - days until due doesn't match preference"
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking and sending notifications:", error);
    throw error; // Re-throw the error to be handled by the API route
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
