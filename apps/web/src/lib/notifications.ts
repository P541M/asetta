import { getAdmin } from "./firebase-admin";
import { getAuth, type Auth } from "firebase-admin/auth";
import {
  FieldValue,
  Timestamp,
  getFirestore,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { sendReminderEmail } from "./email";
import {
  MAX_SEND_ATTEMPTS,
  claimDecision,
  cronRunId,
  isRecentLegacySend,
  legacyRecordIds,
  type ClaimDecision,
} from "./reminderCron";
import {
  dueReminders,
  nextReminderRun,
  reminderRecordId,
  resolveTimeZone,
  type DueReminder,
  type ReminderAssessment,
} from "./reminderSchedule";
import { isValidEmail } from "../utils/validation";
import {
  cleanEmail,
  existingAddressToConfirm,
  notificationEmailStatus,
  reminderRecipient,
  sameAddress,
} from "../utils/notificationEmail";
import { devLog } from "../utils/devLog";

interface NotificationPreferences {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
  hasConsentedToNotifications: boolean;
  notifySubmittedAssessments: boolean;
}

/** One run's result: returned by the cron route and saved as `lastRun` in `cronRuns/{UTC date}`. */
export interface CronRunSummary {
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  /** Users the day's sweep gave a first `nextReminderAt`; null when the sweep had already run. */
  scheduled: number | null;
  /** Users whose `nextReminderAt` had come. */
  users: number;
  sent: number;
  failed: number;
  userErrors: number;
  /** The message of the error that stopped the run, or null when it ran to the end. */
  error: string | null;
}

/**
 * One reminder run as of `now` (the route passes a simulated moment in development only). Only
 * users whose `nextReminderAt` has come are read, so calling it twice in a row sends nothing new.
 */
export async function checkAndSendNotifications(now: Date = new Date()): Promise<CronRunSummary> {
  const clockStart = Date.now();
  let db: Firestore | undefined;
  let auth: Auth | undefined;
  let scheduled: number | null = null;
  let users = 0;
  let sent = 0;
  let failed = 0;
  let userErrors = 0;

  const summarize = (runError: unknown): CronRunSummary => {
    const durationMs = Date.now() - clockStart;
    return {
      startedAt: now,
      finishedAt: new Date(now.getTime() + durationMs),
      durationMs,
      scheduled,
      users,
      sent,
      failed,
      userErrors,
      error:
        runError === undefined
          ? null
          : runError instanceof Error
            ? runError.message
            : String(runError),
    };
  };

  try {
    const app = await getAdmin();
    db = getFirestore(app);
    auth = getAuth(app);
    try {
      await confirmExistingAddresses(db, now);
    } catch (migrationError) {
      // The claim was released, so the next run tries again; reminders still go out meanwhile.
      console.error("Reminder cron: could not confirm existing addresses", migrationError);
    }
    try {
      scheduled = await scheduleUnscheduledUsers(db, now);
    } catch (sweepError) {
      // Users who already have a nextReminderAt still get their reminders; the next run retries.
      console.error("Reminder cron: could not schedule new users", sweepError);
    }

    const dueUsers = await db.collection("users").where("nextReminderAt", "<=", now).get();
    devLog(`Reminder cron: ${dueUsers.size} users due at ${now.toISOString()}`);

    for (const userDoc of dueUsers.docs) {
      users++;
      try {
        const result = await processUser(db, auth, userDoc, now);
        sent += result.sent;
        failed += result.failed;
      } catch (userError) {
        // nextReminderAt wasn't advanced, so the next run tries this user again.
        console.error("Reminder cron: could not process a user", {
          uid: userDoc.id,
          error: userError,
        });
        userErrors++;
      }
    }

    const summary = summarize(undefined);
    devLog("Reminder cron: run finished", summary);
    await recordRun(db, summary);
    return summary;
  } catch (error) {
    // The route logs the error itself; record that the run stopped, if Firestore is reachable.
    if (db) await recordRun(db, summarize(error));
    throw error;
  }
}

// gRPC status ALREADY_EXISTS, which DocumentReference.create() throws when the doc is there.
const ALREADY_EXISTS = 6;

/**
 * D11, once ever: marks the address every user saved before A17 as confirmed (`verifiedEmail`),
 * so A17 moves no one's reminders; only an address saved from now on needs its link. The marker
 * `migrations/d11-existing-addresses` (server-only) claims it, so overlapping runs do it once; a
 * failure releases the claim for the next run, and users already confirmed are skipped.
 */
async function confirmExistingAddresses(db: Firestore, now: Date): Promise<void> {
  const marker = db.collection("migrations").doc("d11-existing-addresses");
  try {
    await marker.create({ startedAt: now });
  } catch (error) {
    if ((error as { code?: unknown }).code === ALREADY_EXISTS) return;
    throw error;
  }

  try {
    const users = await db.collection("users").select("email", "verifiedEmail").get();
    const toConfirm = users.docs.flatMap((doc) => {
      const address = existingAddressToConfirm(doc.get("email"), doc.get("verifiedEmail"));
      return address ? [{ ref: doc.ref, address }] : [];
    });
    for (let start = 0; start < toConfirm.length; start += 500) {
      const batch = db.batch();
      for (const { ref, address } of toConfirm.slice(start, start + 500)) {
        batch.update(ref, { verifiedEmail: address });
      }
      await batch.commit();
    }
    await marker.update({ finishedAt: new Date(), users: users.size, confirmed: toConfirm.length });
    devLog(`Reminder cron: confirmed ${toConfirm.length} existing addresses (D11)`);
  } catch (error) {
    await marker.delete().catch((deleteError: unknown) => {
      console.error("Reminder cron: could not release the D11 claim", deleteError);
    });
    throw error;
  }
}

/**
 * Once per UTC day, sets `nextReminderAt` to now for every user without one, so this run reads
 * them: every user on the first run after A8, then anyone whose sign-in didn't set it. A user is
 * only ever read through the `nextReminderAt` query, and Firestore can't query a missing field.
 */
async function scheduleUnscheduledUsers(db: Firestore, now: Date): Promise<number | null> {
  const runRef = db.collection("cronRuns").doc(cronRunId(now));
  if ((await runRef.get()).get("sweptAt")) return null;

  const allUsers = await db.collection("users").select("nextReminderAt").get();
  const unscheduled = allUsers.docs.filter(
    (doc) => !(doc.get("nextReminderAt") instanceof Timestamp),
  );
  for (let start = 0; start < unscheduled.length; start += 500) {
    const batch = db.batch();
    for (const doc of unscheduled.slice(start, start + 500)) {
      batch.update(doc.ref, { nextReminderAt: now });
    }
    await batch.commit();
  }

  await runRef.set({ sweptAt: now }, { merge: true });
  return unscheduled.length;
}

/** Sends one user's due reminders, then moves their `nextReminderAt` on. */
async function processUser(
  db: Firestore,
  auth: Auth,
  userDoc: QueryDocumentSnapshot,
  now: Date,
): Promise<{ sent: number; failed: number }> {
  const userData = userDoc.data();
  const timeZone = resolveTimeZone(userData.timeZone);
  const result = { sent: 0, failed: 0 };
  let retryPending = false;

  const preferences = activePreferences(userDoc.id, userData);
  if (preferences) {
    const { assessments, names } = await readAssessments(userDoc);
    const reminders = dueReminders({
      assessments,
      settings: {
        daysBefore: preferences.notificationDaysBefore,
        notifySubmitted: preferences.notifySubmittedAssessments,
      },
      timeZone,
      now,
    });

    // Looked up once, and only when a reminder is about to be claimed
    let recipient: Promise<string | null> | undefined;
    const getRecipient = () =>
      (recipient ??= reminderAddress(auth, userDoc.id, preferences.email, userData.verifiedEmail));

    for (const reminder of reminders) {
      const outcome = await sendReminder(db, {
        uid: userDoc.id,
        preferences,
        getRecipient,
        reminder,
        names: names.get(reminder.assessmentId)!,
        now,
      });
      if (outcome.status === "sent") result.sent++;
      if (outcome.status === "failed") result.failed++;
      if (outcome.retry) retryPending = true;
    }
  }

  // A user with reminders off is still moved on, so they aren't read again until tomorrow.
  await userDoc.ref.update({ nextReminderAt: nextReminderRun(timeZone, now, retryPending) });
  return result;
}

/** The user's reminder settings, or null when they get no reminders. */
function activePreferences(uid: string, userData: unknown): NotificationPreferences | null {
  const validation = validateNotificationPreferences(userData);
  if (!validation.isValid) {
    devLog(`Reminder cron: invalid preferences for ${uid}`, validation.errors);
    return null;
  }
  const preferences = validation.sanitized!;
  if (
    !preferences.hasConsentedToNotifications ||
    !preferences.emailNotifications ||
    !preferences.email
  ) {
    return null;
  }
  return preferences;
}

/**
 * Where this user's reminders go (A17): the chosen address once it is the account's own or
 * confirmed through the link, else the account's sign-in email. Null: nowhere to send.
 */
async function reminderAddress(
  auth: Auth,
  uid: string,
  email: string,
  verifiedEmail: unknown,
): Promise<string | null> {
  // A confirmed address needs no account email, so no Auth call stands between it and a send
  if (sameAddress(email, verifiedEmail)) {
    devLog(`Reminder cron: ${uid} chose the confirmed address`);
    return cleanEmail(email);
  }
  let accountEmail: string | null = null;
  try {
    accountEmail = (await auth.getUser(uid)).email ?? null;
  } catch (error) {
    // A user doc whose account is gone has no account email; anything else is retried next run
    if ((error as { code?: unknown }).code !== "auth/user-not-found") throw error;
  }
  const addresses = { email, verifiedEmail, accountEmail };
  const status = notificationEmailStatus(addresses);
  devLog(
    `Reminder cron: ${uid} chose ${status === "unconfirmed" ? "an unconfirmed" : `the ${status}`} address`,
  );
  return reminderRecipient(addresses);
}

interface AssessmentNames {
  assessmentTitle: string;
  courseName: string;
}

/** Every assessment in every semester of the user (A19 narrows this). */
async function readAssessments(userDoc: QueryDocumentSnapshot) {
  const assessments: ReminderAssessment[] = [];
  const names = new Map<string, AssessmentNames>();
  const semesters = await userDoc.ref.collection("semesters").get();
  for (const semester of semesters.docs) {
    const snapshot = await semester.ref.collection("assessments").get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      assessments.push({
        id: doc.id,
        dueDate: data.dueDate,
        dueTime: data.dueTime,
        status: data.status,
        needsReview: data.needsReview,
      });
      names.set(doc.id, {
        assessmentTitle: String(data.assignmentName ?? ""),
        courseName: String(data.courseName ?? ""),
      });
    }
  }
  return { assessments, names };
}

const toDate = (value: unknown): Date | null =>
  value instanceof Timestamp ? value.toDate() : value instanceof Date ? value : null;

/**
 * Claims, sends and records one reminder. `retry` says whether this user needs another look
 * before tomorrow: a failed send with attempts left, or one another run is busy with.
 */
async function sendReminder(
  db: Firestore,
  {
    uid,
    preferences,
    getRecipient,
    reminder,
    names,
    now,
  }: {
    uid: string;
    preferences: NotificationPreferences;
    getRecipient: () => Promise<string | null>;
    reminder: DueReminder;
    names: AssessmentNames;
    now: Date;
  },
): Promise<{ status: "sent" | "failed" | "skipped"; retry: boolean }> {
  const notifications = db.collection("notifications");
  const { assessmentId } = reminder;
  const recordRef = notifications.doc(reminderRecordId(uid, reminder));
  const toRecord = (snapshot: DocumentSnapshot) =>
    snapshot.exists
      ? {
          status: snapshot.get("status"),
          attempts: snapshot.get("attempts"),
          lastAttemptAt: toDate(snapshot.get("lastAttemptAt")),
        }
      : undefined;
  const skipped = (decision: ClaimDecision) => ({
    status: "skipped" as const,
    retry: !decision.claim && (decision.reason === "waiting" || decision.reason === "sending"),
  });

  // A sent reminder stays due for the catch-up days; settle it with one read, no transaction.
  const existing = await recordRef.get();
  const precheck = claimDecision(toRecord(existing), now);
  if (!precheck.claim) return skipped(precheck);

  if (!existing.exists) {
    const legacy = await db.getAll(
      ...legacyRecordIds(uid, assessmentId, preferences.notificationDaysBefore).map((id) =>
        notifications.doc(id),
      ),
    );
    if (
      legacy.some((snapshot) =>
        isRecentLegacySend(
          { status: snapshot.get("status"), sentAt: toDate(snapshot.get("sentAt")) },
          now,
        ),
      )
    ) {
      devLog(`Reminder cron: ${uid}_${assessmentId} went out before A8, skipping`);
      return { status: "skipped", retry: false };
    }
  }

  const recipient = await getRecipient();
  if (!recipient) {
    devLog(`Reminder cron: ${uid} has no address to send to, skipping`);
    return { status: "skipped", retry: false };
  }

  // Claim the send before sending: the transaction lets only one run move the record to
  // "sending", so overlapping runs (GitHub Actions and the Vercel backstop) can't both send it.
  const decision: ClaimDecision = await db.runTransaction(async (transaction) => {
    const claim = claimDecision(toRecord(await transaction.get(recordRef)), now);
    if (claim.claim) {
      transaction.set(
        recordRef,
        {
          userId: uid,
          assessmentId,
          assessmentTitle: names.assessmentTitle,
          courseName: names.courseName,
          targetDay: reminder.targetDay,
          daysUntilDue: reminder.daysUntilDue,
          status: "sending",
          attempts: claim.attempt,
          lastAttemptAt: now,
        },
        { merge: true },
      );
    }
    return claim;
  });
  if (!decision.claim) return skipped(decision);

  try {
    await sendReminderEmail(recipient, {
      ...names,
      dueDate: reminder.dueDate,
      dueTime: reminder.dueTime,
      daysUntilDue: reminder.daysUntilDue,
    });
  } catch (emailError) {
    // Log the codes only: nodemailer's messages can contain the recipient address.
    // The full message goes into the record (a server-only collection).
    const { code, responseCode } = (emailError ?? {}) as { code?: string; responseCode?: number };
    console.error("Reminder cron: send failed", {
      uid,
      assessmentId,
      attempt: decision.attempt,
      code,
      responseCode,
    });
    await recordRef.update({
      status: "failed",
      error: emailError instanceof Error ? emailError.message : String(emailError),
    });
    return { status: "failed", retry: decision.attempt < MAX_SEND_ATTEMPTS };
  }

  try {
    await recordRef.update({ status: "sent", sentAt: now, error: FieldValue.delete() });
  } catch (recordError) {
    // The email went out; the claim stays "sending", and is only retried once its lease is up.
    console.error("Reminder cron: sent, but could not record it", {
      uid,
      assessmentId,
      error: recordError,
    });
  }
  return { status: "sent", retry: false };
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
