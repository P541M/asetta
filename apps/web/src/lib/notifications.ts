import { getAdmin } from "./firebase-admin";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";
import { sendReminderEmail } from "./email";
import { cronRunId, isAlreadySent } from "./reminderCron";
import { isValidEmail } from "../utils/validation";
import { devLog, devError } from "../utils/devLog";
import type { AssessmentStatus } from "../types/assessment";

interface NotificationPreferences {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  hasConsentedToNotifications: boolean;
  notifySubmittedAssessments: boolean;
}

interface Assessment {
  id: string;
  dueDate: Date | string | { toDate: () => Date }; // Can be Date, string, or Firestore Timestamp
  userId: string;
  courseName: string;
  assignmentName: string;
  dueTime: string;
  status: AssessmentStatus;
}

/** One run's result: returned by the cron route and saved as `lastRun` in `cronRuns/{UTC date}`. */
export interface CronRunSummary {
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  users: number;
  sent: number;
  failed: number;
  userErrors: number;
  /** The message of the error that stopped the run, or null when it ran to the end. */
  error: string | null;
}

export async function checkAndSendNotifications(): Promise<CronRunSummary> {
  const startTime = new Date();
  devLog("=== NOTIFICATION CHECK STARTED ===", startTime.toISOString());

  let db: Firestore | undefined;
  let totalNotificationsSent = 0;
  let totalUsersProcessed = 0;
  let totalSendFailures = 0;
  let totalUserErrors = 0;

  const summarize = (runError: unknown): CronRunSummary => {
    const finishedAt = new Date();
    return {
      startedAt: startTime,
      finishedAt,
      durationMs: finishedAt.getTime() - startTime.getTime(),
      users: totalUsersProcessed,
      sent: totalNotificationsSent,
      failed: totalSendFailures,
      userErrors: totalUserErrors,
      error:
        runError === undefined
          ? null
          : runError instanceof Error
            ? runError.message
            : String(runError),
    };
  };

  try {
    const adminApp = await getAdmin();
    db = getFirestore(adminApp);
    devLog("✅ Firebase Admin initialized successfully");

    // Get all users with notification preferences
    const usersRef = db.collection("users");
    const usersSnapshot = await usersRef.get();
    devLog(`📊 Found ${usersSnapshot.docs.length} users to check`);

    for (const userDoc of usersSnapshot.docs) {
      totalUsersProcessed++;
      devLog(
        `\n--- Processing User ${userDoc.id} (${totalUsersProcessed}/${usersSnapshot.docs.length}) ---`,
      );

      try {
        const userData = userDoc.data();
        devLog("📋 Raw user data:", {
          hasEmailNotifications: "emailNotifications" in userData,
          hasNotificationDaysBefore: "notificationDaysBefore" in userData,
          hasEmail: "email" in userData,
          hasConsent: "hasConsentedToNotifications" in userData,
        });

        // Validate user preferences
        const preferencesValidation = validateNotificationPreferences(userData);

        if (!preferencesValidation.isValid) {
          devLog(`⚠️ Invalid user preferences for ${userDoc.id}:`, preferencesValidation.errors);
          continue;
        }

        const preferences = preferencesValidation.sanitized!;

        devLog("⚙️ User preferences:", {
          userId: userDoc.id,
          emailNotifications: preferences.emailNotifications,
          notificationDaysBefore: preferences.notificationDaysBefore,
          hasConsentedToNotifications: preferences.hasConsentedToNotifications,
          notifySubmittedAssessments: preferences.notifySubmittedAssessments,
          email: preferences.email ? `${preferences.email.substring(0, 3)}***` : "not set",
        });

        if (!preferences.hasConsentedToNotifications) {
          devLog("⏭️ User has not consented to notifications, skipping");
          continue;
        }

        if (!preferences.emailNotifications) {
          devLog("⏭️ Email notifications disabled for user, skipping");
          continue;
        }

        if (!preferences.email) {
          devLog("⚠️ No email address set for user, skipping");
          continue;
        }

        // Get all semesters for this user
        const semestersRef = userDoc.ref.collection("semesters");
        const semestersSnapshot = await semestersRef.get();
        devLog(`📚 Found ${semestersSnapshot.docs.length} semesters for user`);

        // Get all assessments across all semesters
        const now = new Date();
        devLog("🕐 Current time:", now.toISOString());

        let allAssessments: Assessment[] = [];

        for (const semesterDoc of semestersSnapshot.docs) {
          const assessmentsRef = semesterDoc.ref.collection("assessments");
          const assessmentsSnapshot = await assessmentsRef.get();
          devLog(
            `📝 Found ${assessmentsSnapshot.docs.length} assessments in semester ${semesterDoc.id}`,
          );

          const semesterAssessments = assessmentsSnapshot.docs.map((doc) => {
            const data = doc.data();
            devLog(`📄 Assessment data for ${doc.id}:`, {
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

        devLog(`📊 Total assessments found: ${allAssessments.length}`);

        // Filter assessments that are due in the future and process dates
        const futureAssessments = [];
        const dateParsingErrors = [];

        for (const assessment of allAssessments) {
          try {
            let dueDate: Date;

            // Handle different date formats from Firestore
            if (
              assessment.dueDate &&
              typeof assessment.dueDate === "object" &&
              "toDate" in assessment.dueDate
            ) {
              // Firestore Timestamp
              dueDate = (assessment.dueDate as { toDate: () => Date }).toDate();
              if (assessment.dueTime) {
                const [hours, minutes] = assessment.dueTime.split(":");
                dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              }
            } else if (typeof assessment.dueDate === "string") {
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

            devLog(`✅ Parsed date for "${assessment.assignmentName}": ${dueDate.toISOString()}`);
          } catch (error) {
            devError(`❌ Date parsing error for assessment "${assessment.assignmentName}":`, error);
            dateParsingErrors.push({
              assessmentId: assessment.id,
              title: assessment.assignmentName,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        if (dateParsingErrors.length > 0) {
          devLog(`⚠️ Date parsing errors (${dateParsingErrors.length}):`, dateParsingErrors);
        }

        devLog(`🔮 Future assessments: ${futureAssessments.length}`);

        for (const assessment of futureAssessments) {
          if (assessment.status === "Submitted" && !preferences.notifySubmittedAssessments) {
            devLog(`⏭️ Skipping submitted assessment "${assessment.assignmentName}"`);
            continue;
          }

          const dueDate = assessment.parsedDueDate;
          const timeDiffMs = dueDate.getTime() - now.getTime();
          const daysUntilDue = Math.floor(timeDiffMs / (1000 * 60 * 60 * 24));
          const hoursUntilDue = Math.floor(timeDiffMs / (1000 * 60 * 60));

          devLog(`📋 Assessment details:`, {
            title: assessment.assignmentName,
            courseName: assessment.courseName,
            dueDate: dueDate.toISOString(),
            daysUntilDue,
            hoursUntilDue,
            notificationDaysBefore: preferences.notificationDaysBefore,
            shouldNotify: daysUntilDue === preferences.notificationDaysBefore,
          });

          // Check if we should send a notification (with some tolerance for timing)
          if (
            daysUntilDue === preferences.notificationDaysBefore ||
            (preferences.notificationDaysBefore === 1 && hoursUntilDue <= 36 && hoursUntilDue >= 12)
          ) {
            // Check if we've already sent a notification for this assessment
            const notificationId = `${userDoc.id}_${assessment.id}_${daysUntilDue}`;
            const notificationRef = db.collection("notifications").doc(notificationId);
            const existingNotification = await notificationRef.get();

            if (isAlreadySent(existingNotification.data())) {
              devLog(
                `⏭️ Notification already sent for "${assessment.assignmentName}" (${daysUntilDue} days)`,
              );
              continue;
            }

            devLog(
              `📧 Sending notification for "${assessment.assignmentName}" (${daysUntilDue} days until due)`,
            );

            try {
              await sendReminderEmail(preferences.email, {
                assessmentTitle: assessment.assignmentName,
                courseName: assessment.courseName,
                dueAt: dueDate,
              });

              // Record the notification to prevent duplicates
              await notificationRef.set({
                userId: userDoc.id,
                assessmentId: assessment.id,
                assessmentTitle: assessment.assignmentName,
                courseName: assessment.courseName,
                daysUntilDue,
                email: preferences.email,
                sentAt: new Date(),
                notificationType: "email",
                status: "sent",
              });

              totalNotificationsSent++;
              devLog(
                `✅ Email sent successfully to ${preferences.email} and notification recorded`,
              );
            } catch (emailError) {
              // Log the codes only: nodemailer's messages can contain the recipient address.
              // The full message goes into the failed record below (a server-only collection).
              const { code, responseCode } = (emailError ?? {}) as {
                code?: string;
                responseCode?: number;
              };
              console.error("Reminder cron: send failed", {
                uid: userDoc.id,
                assessmentId: assessment.id,
                code,
                responseCode,
              });

              // Record the failed attempt. Only status "sent" blocks a send, so the next run retries.
              await notificationRef.set({
                userId: userDoc.id,
                assessmentId: assessment.id,
                assessmentTitle: assessment.assignmentName,
                courseName: assessment.courseName,
                daysUntilDue,
                email: preferences.email,
                sentAt: new Date(),
                notificationType: "email",
                status: "failed",
                error: emailError instanceof Error ? emailError.message : String(emailError),
              });

              totalSendFailures++;
            }
          } else {
            devLog(
              `⏭️ Not sending notification - timing doesn't match (${daysUntilDue} days vs ${preferences.notificationDaysBefore} required)`,
            );
          }
        }
      } catch (userError) {
        console.error("Reminder cron: could not process a user", {
          uid: userDoc.id,
          error: userError,
        });
        totalUserErrors++;
      }
    }

    const summary = summarize(undefined);

    devLog("\n=== NOTIFICATION CHECK COMPLETED ===");
    devLog(`⏱️ Duration: ${summary.durationMs}ms`);
    devLog(`👥 Users processed: ${summary.users}`);
    devLog(`📧 Notifications sent: ${summary.sent}`);
    devLog(`❌ Send failures: ${summary.failed}, user errors: ${summary.userErrors}`);
    devLog("=== END SUMMARY ===");

    await recordRun(db, summary);
    return summary;
  } catch (error) {
    // The route logs the error itself; record that the run stopped, if Firestore is reachable.
    if (db) await recordRun(db, summarize(error));
    throw error;
  }
}

/**
 * Keeps the day's totals and the latest run in `cronRuns/{UTC date}`, readable long after
 * Vercel's 1-hour log window. No client rule matches `cronRuns`, so it is server-only.
 */
async function recordRun(db: Firestore, summary: CronRunSummary) {
  try {
    await db
      .collection("cronRuns")
      .doc(cronRunId(summary.startedAt))
      .set(
        {
          runs: FieldValue.increment(1),
          sent: FieldValue.increment(summary.sent),
          failed: FieldValue.increment(summary.failed),
          // Every key is written each time, so the merge replaces the previous run's values.
          lastRun: summary,
        },
        { merge: true },
      );
  } catch (error) {
    console.error("Reminder cron: could not save the run summary", error);
  }
}

// Function to validate email format

// Function to validate user notification preferences
function validateNotificationPreferences(preferences: unknown): {
  isValid: boolean;
  errors: string[];
  sanitized: NotificationPreferences | null;
} {
  const errors: string[] = [];

  // Check required fields exist
  if (typeof preferences !== "object" || preferences === null) {
    errors.push("Preferences must be an object");
    return { isValid: false, errors, sanitized: null };
  }

  const prefs = preferences as Record<string, unknown>;

  // Validate emailNotifications
  if (typeof prefs.emailNotifications !== "boolean") {
    errors.push("emailNotifications must be a boolean");
  }

  // Validate notificationDaysBefore
  if (
    typeof prefs.notificationDaysBefore !== "number" ||
    prefs.notificationDaysBefore < 1 ||
    prefs.notificationDaysBefore > 30
  ) {
    errors.push("notificationDaysBefore must be a number between 1 and 30");
  }

  // Validate email if email notifications are enabled
  if (prefs.emailNotifications && prefs.email) {
    if (typeof prefs.email === "string" && !isValidEmail(prefs.email)) {
      errors.push("Invalid email format");
    }
  } else if (prefs.emailNotifications && !prefs.email) {
    errors.push("Email address required when email notifications are enabled");
  }

  // Validate consent
  if (typeof prefs.hasConsentedToNotifications !== "boolean") {
    errors.push("hasConsentedToNotifications must be a boolean");
  }

  const sanitized: NotificationPreferences = {
    emailNotifications: Boolean(prefs.emailNotifications),
    notificationDaysBefore: Math.max(1, Math.min(30, Number(prefs.notificationDaysBefore) || 1)),
    email: String(prefs.email || "").trim(),
    hasConsentedToNotifications: Boolean(prefs.hasConsentedToNotifications),
    // Optional and not validated: user docs predating this setting lack the field, and a
    // validation error would silently stop all of their reminders. Absent means opted in.
    notifySubmittedAssessments: prefs.notifySubmittedAssessments !== false,
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : null,
  };
}
