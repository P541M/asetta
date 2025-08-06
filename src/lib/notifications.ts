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
  dueDate: Date | string | { toDate: () => Date }; // Can be Date, string, or Firestore Timestamp
  userId: string;
  courseName: string;
  assignmentName: string;
  dueTime: string;
}

export async function checkAndSendNotifications() {
  const startTime = new Date();
  console.log("=== NOTIFICATION CHECK STARTED ===", startTime.toISOString());
  
  try {
    const admin = await getAdmin();
    const db = admin.firestore();
    console.log("✅ Firebase Admin initialized successfully");

    // Get all users with notification preferences
    const usersRef = db.collection("users");
    const usersSnapshot = await usersRef.get();
    console.log(`📊 Found ${usersSnapshot.docs.length} users to check`);

    let totalNotificationsSent = 0;
    let totalUsersProcessed = 0;
    let totalErrors = 0;

    for (const userDoc of usersSnapshot.docs) {
      totalUsersProcessed++;
      console.log(`\n--- Processing User ${userDoc.id} (${totalUsersProcessed}/${usersSnapshot.docs.length}) ---`);
      
      try {
        const userData = userDoc.data();
        console.log("📋 Raw user data:", {
          hasEmailNotifications: 'emailNotifications' in userData,
          hasNotificationDaysBefore: 'notificationDaysBefore' in userData,
          hasEmail: 'email' in userData,
          hasConsent: 'hasConsentedToNotifications' in userData,
        });

        // Validate user preferences
        const preferencesValidation = validateNotificationPreferences(userData);
        
        if (!preferencesValidation.isValid) {
          console.log(`⚠️ Invalid user preferences for ${userDoc.id}:`, preferencesValidation.errors);
          continue;
        }

        const preferences = preferencesValidation.sanitized!;

        console.log("⚙️ User preferences:", {
          userId: userDoc.id,
          emailNotifications: preferences.emailNotifications,
          notificationDaysBefore: preferences.notificationDaysBefore,
          hasConsentedToNotifications: preferences.hasConsentedToNotifications,
          email: preferences.email ? `${preferences.email.substring(0, 3)}***` : "not set",
        });

        if (!preferences.hasConsentedToNotifications) {
          console.log("⏭️ User has not consented to notifications, skipping");
          continue;
        }

        if (!preferences.emailNotifications) {
          console.log("⏭️ Email notifications disabled for user, skipping");
          continue;
        }

        if (!preferences.email) {
          console.log("⚠️ No email address set for user, skipping");
          continue;
        }

        // Get all semesters for this user
        const semestersRef = userDoc.ref.collection("semesters");
        const semestersSnapshot = await semestersRef.get();
        console.log(`📚 Found ${semestersSnapshot.docs.length} semesters for user`);

        // Get all assessments across all semesters
        const now = new Date();
        console.log("🕐 Current time:", now.toISOString());

        let allAssessments: Assessment[] = [];

        for (const semesterDoc of semestersSnapshot.docs) {
          const assessmentsRef = semesterDoc.ref.collection("assessments");
          const assessmentsSnapshot = await assessmentsRef.get();
          console.log(`📝 Found ${assessmentsSnapshot.docs.length} assessments in semester ${semesterDoc.id}`);

          const semesterAssessments = assessmentsSnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log(`📄 Assessment data for ${doc.id}:`, {
              title: data.title,
              assignmentName: data.assignmentName,
              dueDate: data.dueDate,
              dueTime: data.dueTime,
              courseName: data.courseName,
              dueDateType: typeof data.dueDate,
              dueTimeType: typeof data.dueTime,
            });
            
            return {
              id: doc.id,
              userId: userDoc.id,
              ...data,
            };
          }) as Assessment[];

          allAssessments = [...allAssessments, ...semesterAssessments];
        }

        console.log(`📊 Total assessments found: ${allAssessments.length}`);

        // Filter assessments that are due in the future and process dates
        const futureAssessments = [];
        const dateParsingErrors = [];

        for (const assessment of allAssessments) {
          try {
            let dueDate: Date;
            
            // Handle different date formats from Firestore
            if (assessment.dueDate && typeof assessment.dueDate === 'object' && 'toDate' in assessment.dueDate) {
              // Firestore Timestamp
              dueDate = (assessment.dueDate as { toDate: () => Date }).toDate();
              if (assessment.dueTime) {
                const [hours, minutes] = assessment.dueTime.split(':');
                dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              }
            } else if (typeof assessment.dueDate === 'string') {
              // String date
              const dateTimeString = assessment.dueTime 
                ? `${assessment.dueDate}T${assessment.dueTime}`
                : assessment.dueDate;
              dueDate = new Date(dateTimeString);
            } else {
              throw new Error(`Invalid date format: ${typeof assessment.dueDate}`);
            }

            if (isNaN(dueDate.getTime())) {
              throw new Error(`Invalid date value: ${assessment.dueDate}`);
            }

            if (dueDate > now) {
              futureAssessments.push({
                ...assessment,
                parsedDueDate: dueDate,
              });
            }

            console.log(`✅ Parsed date for "${assessment.assignmentName}": ${dueDate.toISOString()}`);
          } catch (error) {
            console.error(`❌ Date parsing error for assessment "${assessment.assignmentName}":`, error);
            dateParsingErrors.push({
              assessmentId: assessment.id,
              title: assessment.assignmentName,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        if (dateParsingErrors.length > 0) {
          console.log(`⚠️ Date parsing errors (${dateParsingErrors.length}):`, dateParsingErrors);
        }

        console.log(`🔮 Future assessments: ${futureAssessments.length}`);

        for (const assessment of futureAssessments) {
          const dueDate = assessment.parsedDueDate;
          const timeDiffMs = dueDate.getTime() - now.getTime();
          const daysUntilDue = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
          const hoursUntilDue = Math.floor(timeDiffMs / (1000 * 60 * 60));

          console.log(`📋 Assessment details:`, {
            title: assessment.assignmentName,
            courseName: assessment.courseName,
            dueDate: dueDate.toISOString(),
            daysUntilDue,
            hoursUntilDue,
            notificationDaysBefore: preferences.notificationDaysBefore,
            shouldNotify: daysUntilDue === preferences.notificationDaysBefore,
          });

          // Check if we should send a notification (with some tolerance for timing)
          if (daysUntilDue === preferences.notificationDaysBefore || 
              (preferences.notificationDaysBefore === 1 && hoursUntilDue <= 36 && hoursUntilDue >= 12)) {
            
            // Check if we've already sent a notification for this assessment
            const notificationId = `${userDoc.id}_${assessment.id}_${daysUntilDue}`;
            const notificationRef = db.collection("notifications").doc(notificationId);
            const existingNotification = await notificationRef.get();
            
            if (existingNotification.exists) {
              console.log(`⏭️ Notification already sent for "${assessment.assignmentName}" (${daysUntilDue} days)`);
              continue;
            }
            
            const subject = `Assessment Reminder: ${assessment.assignmentName}`;

            console.log(`📧 Sending notification for "${assessment.assignmentName}" (${daysUntilDue} days until due)`);
            
            try {
              await sendEmail(
                preferences.email,
                subject,
                assessment.assignmentName,
                daysUntilDue
              );
              
              // Record the notification to prevent duplicates
              await notificationRef.set({
                userId: userDoc.id,
                assessmentId: assessment.id,
                assessmentTitle: assessment.assignmentName,
                courseName: assessment.courseName,
                daysUntilDue,
                email: preferences.email,
                sentAt: new Date(),
                notificationType: 'email',
                status: 'sent'
              });
              
              totalNotificationsSent++;
              console.log(`✅ Email sent successfully to ${preferences.email} and notification recorded`);
            } catch (emailError) {
              console.error(`❌ Failed to send email:`, emailError);
              
              // Record the failed notification attempt
              await notificationRef.set({
                userId: userDoc.id,
                assessmentId: assessment.id,
                assessmentTitle: assessment.assignmentName,
                courseName: assessment.courseName,
                daysUntilDue,
                email: preferences.email,
                sentAt: new Date(),
                notificationType: 'email',
                status: 'failed',
                error: emailError instanceof Error ? emailError.message : String(emailError)
              });
              
              totalErrors++;
            }
          } else {
            console.log(`⏭️ Not sending notification - timing doesn't match (${daysUntilDue} days vs ${preferences.notificationDaysBefore} required)`);
          }
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${userDoc.id}:`, userError);
        totalErrors++;
      }
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    console.log("\n=== NOTIFICATION CHECK COMPLETED ===");
    console.log(`⏱️ Duration: ${duration}ms`);
    console.log(`👥 Users processed: ${totalUsersProcessed}`);
    console.log(`📧 Notifications sent: ${totalNotificationsSent}`);
    console.log(`❌ Errors encountered: ${totalErrors}`);
    console.log("=== END SUMMARY ===");

  } catch (error) {
    console.error("💥 CRITICAL ERROR in notification system:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : String(error));
    throw error;
  }
}

// Function to validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


// Function to validate user notification preferences
export function validateNotificationPreferences(preferences: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized: NotificationPreferences | null;
} {
  const errors: string[] = [];
  
  // Check required fields exist
  if (typeof preferences !== 'object' || preferences === null) {
    errors.push("Preferences must be an object");
    return { isValid: false, errors, sanitized: null };
  }

  const prefs = preferences as Record<string, unknown>;

  // Validate emailNotifications
  if (typeof prefs.emailNotifications !== 'boolean') {
    errors.push("emailNotifications must be a boolean");
  }

  // Validate notificationDaysBefore
  if (typeof prefs.notificationDaysBefore !== 'number' || 
      prefs.notificationDaysBefore < 1 || 
      prefs.notificationDaysBefore > 30) {
    errors.push("notificationDaysBefore must be a number between 1 and 30");
  }

  // Validate email if email notifications are enabled
  if (prefs.emailNotifications && prefs.email) {
    if (typeof prefs.email === 'string' && !isValidEmail(prefs.email)) {
      errors.push("Invalid email format");
    }
  } else if (prefs.emailNotifications && !prefs.email) {
    errors.push("Email address required when email notifications are enabled");
  }

  // Validate consent
  if (typeof prefs.hasConsentedToNotifications !== 'boolean') {
    errors.push("hasConsentedToNotifications must be a boolean");
  }

  const sanitized: NotificationPreferences = {
    emailNotifications: Boolean(prefs.emailNotifications),
    notificationDaysBefore: Math.max(1, Math.min(30, Number(prefs.notificationDaysBefore) || 1)),
    email: String(prefs.email || "").trim(),
    hasConsentedToNotifications: Boolean(prefs.hasConsentedToNotifications),
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
}

