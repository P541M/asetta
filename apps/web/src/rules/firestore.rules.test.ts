// The emulator suite for `firestore.rules` at the repo root (A16): every write the app makes is
// allowed, and writes outside the schema are denied. `npm run test:rules` starts the Firestore
// emulator and runs it; `npm test` leaves it out. Each payload below copies the app's own write
// (the comment names where it lives), so change both together.
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import {
  deleteApp as deleteAdminApp,
  initializeApp as initializeAdminApp,
} from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Timestamp } from "firebase-admin/firestore";

const RULES_PATH = fileURLToPath(new URL("../../../../firestore.rules", import.meta.url));
const projectId = process.env.GCLOUD_PROJECT || "demo-asetta-rules";
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
if (!emulatorHost) {
  throw new Error("FIRESTORE_EMULATOR_HOST is not set: run `npm run test:rules`");
}
const portAt = emulatorHost.lastIndexOf(":");
const emulatorHostname = emulatorHost.slice(0, portAt);
const emulatorPort = Number(emulatorHost.slice(portAt + 1));

// The admin SDK bypasses the rules on the emulator, so it seeds what a test starts from
const adminApp = initializeAdminApp({ projectId }, "rules-admin");
const admin = getAdminFirestore(adminApp);
const clientApps: FirebaseApp[] = [];

setLogLevel("silent");

beforeAll(async () => {
  const response = await fetch(
    `http://${emulatorHost}/emulator/v1/projects/${projectId}:securityRules`,
    {
      method: "PUT",
      body: JSON.stringify({
        rules: { files: [{ name: "firestore.rules", content: readFileSync(RULES_PATH, "utf8") }] },
      }),
    },
  );
  if (!response.ok) throw new Error(`Could not load the rules: ${await response.text()}`);
});

afterAll(async () => {
  await Promise.all(clientApps.map((app) => deleteApp(app)));
  await deleteAdminApp(adminApp);
});

/** A client signed in as `uid` (null: signed out), as the app's client SDK sees Firestore. */
function clientAs(uid: string | null): Firestore {
  const app = initializeApp({ projectId, apiKey: "rules-test" }, `client-${clientApps.length}`);
  clientApps.push(app);
  const db = getFirestore(app);
  connectFirestoreEmulator(
    db,
    emulatorHostname,
    emulatorPort,
    uid ? { mockUserToken: { sub: uid } } : undefined,
  );
  return db;
}

/** A fresh user per test, so tests share no data. */
function newUser() {
  const uid = `user-${randomUUID()}`;
  return { uid, db: clientAs(uid) };
}

async function expectDenied(request: Promise<unknown>) {
  await expect(request).rejects.toMatchObject({ code: "permission-denied" });
}

const longText = (length: number) => "x".repeat(length);

/** A user doc as the app creates it, plus a key from an older version of the app. */
async function seedUser(uid: string, extra: Record<string, unknown> = {}) {
  const now = Timestamp.now();
  await admin.doc(`users/${uid}`).set({
    displayName: "Sam Lee",
    email: "sam@example.test",
    institution: "",
    createdAt: now,
    lastLogin: now,
    timeZone: "America/Toronto",
    nextReminderAt: now,
    photoURL: "https://example.test/legacy.png",
    ...extra,
  });
}

async function seedSemester(uid: string, semesterId = "fall") {
  await admin.doc(`users/${uid}/semesters/${semesterId}`).set({
    name: "Fall 2026",
    order: 0,
    createdAt: Timestamp.now(),
  });
  return semesterId;
}

/** An assessment as the upload route stores it, with a key an older edit row wrote. */
async function seedAssessment(
  uid: string,
  semesterId: string,
  extra: Record<string, unknown> = {},
) {
  const ref = admin.collection(`users/${uid}/semesters/${semesterId}/assessments`).doc();
  await ref.set({
    courseName: "CIS 3760",
    assignmentName: "Assignment 1",
    dueDate: "2026-10-30",
    dueTime: "23:59",
    weight: 20,
    status: "Not started",
    needsReview: true,
    createdAt: Timestamp.now(),
    ...extra,
  });
  return ref.id;
}

describe("users/{uid}", () => {
  const userRef = (db: Firestore, uid: string) => doc(db, "users", uid);

  it("allows the sign-in create (useUserDoc bootstrapUserDoc)", async () => {
    const { uid, db } = newUser();
    const now = new Date();
    await setDoc(userRef(db, uid), {
      displayName: "Sam Lee",
      email: "sam@example.test",
      institution: "",
      createdAt: now,
      lastLogin: now,
      timeZone: "America/Toronto",
      nextReminderAt: serverTimestamp(),
    });
  });

  it("allows the sign-in create without a zone", async () => {
    const { uid, db } = newUser();
    const now = new Date();
    await setDoc(userRef(db, uid), {
      displayName: "User",
      email: "",
      institution: "",
      createdAt: now,
      lastLogin: now,
      nextReminderAt: serverTimestamp(),
    });
  });

  it("allows the sign-in merges: lastLogin, and the zone with nextReminderAt", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await setDoc(userRef(db, uid), { lastLogin: new Date() }, { merge: true });
    await setDoc(
      userRef(db, uid),
      { lastLogin: new Date(), timeZone: "Asia/Kolkata", nextReminderAt: serverTimestamp() },
      { merge: true },
    );
  });

  it("allows reading your own doc", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    expect((await getDoc(userRef(db, uid))).exists()).toBe(true);
  });

  it("allows the Settings profile save (UserSettings handleProfileSave)", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await updateDoc(userRef(db, uid), {
      displayName: "Sam L.",
      institution: "University of Guelph",
      updatedAt: new Date(),
    });
  });

  it("allows each Settings display preference (UserSettings handlePrefChange)", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    for (const field of ["showDaysTillDue", "showWeight", "showNotes", "showStatsBar"]) {
      await updateDoc(userRef(db, uid), { [field]: false, updatedAt: new Date() });
    }
  });

  it("allows the Settings notifications save (UserSettings handleNotifSave)", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await updateDoc(userRef(db, uid), {
      emailNotifications: true,
      notificationDaysBefore: 3,
      email: "sam.lee@uni.example.test",
      notifySubmittedAssessments: false,
      hasConsentedToNotifications: true,
      nextReminderAt: serverTimestamp(),
      updatedAt: new Date(),
    });
  });

  it("allows finishing onboarding (OnboardingContext completeOnboarding)", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await updateDoc(userRef(db, uid), {
      hasCompletedOnboarding: true,
      onboardingCompletedAt: new Date(),
      institution: "University of Guelph",
      hasConsentedToNotifications: true,
      emailNotifications: true,
      notificationDaysBefore: 7,
      email: "sam@example.test",
      nextReminderAt: serverTimestamp(),
    });
  });

  it("allows skipping onboarding (OnboardingContext confirmExit)", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await updateDoc(userRef(db, uid), {
      hasCompletedOnboarding: true,
      onboardingCompletedAt: new Date(),
      onboardingSkipped: true,
    });
  });

  it("allows removing a field, which reads back as its default", async () => {
    const { uid, db } = newUser();
    await seedUser(uid, { verifiedEmail: "sam.lee@uni.example.test" });
    await updateDoc(userRef(db, uid), { verifiedEmail: deleteField(), photoURL: deleteField() });
  });

  it("denies a confirmed address written by the client (A17: server only)", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await expectDenied(updateDoc(userRef(db, uid), { verifiedEmail: "someone@example.test" }));
    await expectDenied(
      setDoc(userRef(db, uid), { verifiedEmail: "someone@example.test" }, { merge: true }),
    );
  });

  it("denies a confirmed address in the create", async () => {
    const { uid, db } = newUser();
    await expectDenied(
      setDoc(userRef(db, uid), { email: "a@example.test", verifiedEmail: "a@example.test" }),
    );
  });

  it("denies nextReminderAt as anything but the server's time", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await expectDenied(updateDoc(userRef(db, uid), { nextReminderAt: new Date() }));
    await expectDenied(updateDoc(userRef(db, uid), { nextReminderAt: new Date(2000, 0, 1) }));
  });

  it("denies a key the app never writes", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await expectDenied(updateDoc(userRef(db, uid), { isAdmin: true }));
  });

  it("denies wrong types", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await expectDenied(updateDoc(userRef(db, uid), { displayName: 42 }));
    await expectDenied(updateDoc(userRef(db, uid), { emailNotifications: "yes" }));
    await expectDenied(updateDoc(userRef(db, uid), { notificationDaysBefore: "3" }));
    await expectDenied(updateDoc(userRef(db, uid), { notificationDaysBefore: 2.5 }));
    await expectDenied(updateDoc(userRef(db, uid), { lastLogin: "2026-10-16" }));
    await expectDenied(updateDoc(userRef(db, uid), { timeZone: null }));
  });

  it("denies strings over their cap", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await expectDenied(
      updateDoc(userRef(db, uid), { email: `${longText(243)}@example.test` }), // 256 characters
    );
    await expectDenied(updateDoc(userRef(db, uid), { displayName: longText(201) }));
    await expectDenied(updateDoc(userRef(db, uid), { institution: longText(201) }));
    await expectDenied(updateDoc(userRef(db, uid), { timeZone: longText(65) }));
  });

  it("denies deleting the user doc", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    await expectDenied(deleteDoc(userRef(db, uid)));
  });

  it("denies another user's doc, and a signed-out client", async () => {
    const { uid } = newUser();
    await seedUser(uid);
    const other = clientAs(`user-${randomUUID()}`);
    await expectDenied(getDoc(userRef(other, uid)));
    await expectDenied(updateDoc(userRef(other, uid), { displayName: "Not you" }));
    const signedOut = clientAs(null);
    await expectDenied(getDoc(userRef(signedOut, uid)));
    await expectDenied(setDoc(userRef(signedOut, uid), { displayName: "Nobody" }));
  });
});

describe("users/{uid}/semesters/{semesterId}", () => {
  const semesters = (db: Firestore, uid: string) => collection(db, "users", uid, "semesters");

  it("allows adding a semester (SemesterTabs handleAddSemester)", async () => {
    const { uid, db } = newUser();
    await getDocs(query(semesters(db, uid), orderBy("order", "desc")));
    await addDoc(semesters(db, uid), { name: "Winter 2027", createdAt: new Date(), order: 1 });
  });

  it("allows the onboarding semester, dates included (SemesterStep createSemester)", async () => {
    const { uid, db } = newUser();
    await getDocs(query(semesters(db, uid), orderBy("name")));
    await addDoc(semesters(db, uid), {
      name: "Fall 2026",
      createdAt: new Date(),
      order: 0,
      startDate: "2026-09-08",
      endDate: "2026-12-18",
    });
  });

  it("allows a rename and a reorder (handleEditSave, handleDragEnd, the order backfill)", async () => {
    const { uid, db } = newUser();
    await seedSemester(uid, "fall");
    await seedSemester(uid, "winter");
    await updateDoc(doc(db, "users", uid, "semesters", "fall"), {
      name: "Fall term 2026",
      updatedAt: new Date(),
    });
    const batch = writeBatch(db);
    batch.update(doc(db, "users", uid, "semesters", "winter"), { order: 0 });
    batch.update(doc(db, "users", uid, "semesters", "fall"), { order: 1 });
    await batch.commit();
  });

  it("allows deleting a semester with its assessments (handleConfirmDelete)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const assessmentId = await seedAssessment(uid, semesterId);
    const assessments = await getDocs(
      collection(db, "users", uid, "semesters", semesterId, "assessments"),
    );
    expect(assessments.docs.map((snapshot) => snapshot.id)).toEqual([assessmentId]);
    const batch = writeBatch(db);
    batch.delete(doc(db, "users", uid, "semesters", semesterId));
    assessments.docs.forEach((snapshot) => batch.delete(snapshot.ref));
    await batch.commit();
  });

  it("denies other keys, wrong types and long names", async () => {
    const { uid, db } = newUser();
    await seedSemester(uid, "fall");
    const ref = doc(db, "users", uid, "semesters", "fall");
    await expectDenied(updateDoc(ref, { archived: true }));
    await expectDenied(updateDoc(ref, { name: 2026 }));
    await expectDenied(updateDoc(ref, { order: "1" }));
    await expectDenied(updateDoc(ref, { name: longText(201) }));
    await expectDenied(addDoc(semesters(db, uid), { name: "Fall", order: 0, createdAt: "today" }));
  });

  it("denies another user's semesters", async () => {
    const { uid } = newUser();
    await seedSemester(uid, "fall");
    const other = clientAs(`user-${randomUUID()}`);
    await expectDenied(getDocs(semesters(other, uid)));
    await expectDenied(addDoc(semesters(other, uid), { name: "Mine now", order: 0 }));
    await expectDenied(deleteDoc(doc(other, "users", uid, "semesters", "fall")));
  });
});

describe("users/{uid}/semesters/{semesterId}/assessments/{assessmentId}", () => {
  const assessmentRef = (db: Firestore, uid: string, semesterId: string, id: string) =>
    doc(db, "users", uid, "semesters", semesterId, "assessments", id);

  it("allows the Add form (AddAssessmentForm handleSubmit)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    await addDoc(collection(db, "users", uid, "semesters", semesterId, "assessments"), {
      courseName: "CIS 3760",
      assignmentName: "Lab 1",
      dueDate: "2026-10-20",
      dueTime: "23:59",
      weight: 5,
      status: "Not started",
      createdAt: new Date(),
    });
  });

  it("allows reading the semester's assessments, as the live listener does", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    await seedAssessment(uid, semesterId);
    const snapshot = await getDocs(
      query(
        collection(db, "users", uid, "semesters", semesterId, "assessments"),
        orderBy("dueDate"),
      ),
    );
    expect(snapshot.size).toBe(1);
  });

  it("allows a status change and the bulk status change (AssessmentsTable)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    for (const status of ["In progress", "Submitted", "Missed", "Not started"]) {
      await updateDoc(assessmentRef(db, uid, semesterId, id), {
        status,
        updatedAt: serverTimestamp(),
      });
    }
  });

  it("allows the edit row's save, which clears the review flag (handleSaveEdit)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    await updateDoc(assessmentRef(db, uid, semesterId, id), {
      courseName: "CIS 3760",
      assignmentName: "Assignment 1 (revised)",
      dueDate: "2026-11-02",
      dueTime: "17:00",
      weight: 25,
      status: "In progress",
      needsReview: deleteField(),
      updatedAt: new Date(),
    });
    const saved = await admin.doc(`users/${uid}/semesters/${semesterId}/assessments/${id}`).get();
    expect(saved.get("needsReview")).toBeUndefined();
  });

  it("allows the edit row on a doc that holds keys from older versions", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId, {
      status: "Completed",
      source: "gemini",
    });
    await admin.doc(`users/${uid}/semesters/${semesterId}/assessments/${id}`).update({ id });
    await updateDoc(assessmentRef(db, uid, semesterId, id), {
      courseName: "CIS 3760",
      assignmentName: "Assignment 1",
      dueDate: "2026-10-30",
      dueTime: "23:59",
      weight: 20,
      status: "Completed",
      needsReview: deleteField(),
      updatedAt: new Date(),
    });
  });

  it("allows saving and clearing notes (handleSaveNotes)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    const ref = assessmentRef(db, uid, semesterId, id);
    await updateDoc(ref, { notes: "<p>Bring a calculator</p>", updatedAt: new Date() });
    await updateDoc(ref, { updatedAt: new Date(), notes: null });
  });

  it("allows the grade calculator's saves (useAssessmentAutoSave)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    const ref = assessmentRef(db, uid, semesterId, id);
    await updateDoc(ref, { mark: 85.5, weight: 20, status: "Submitted" });
    await updateDoc(ref, { mark: null, weight: 20, status: "Submitted" });
  });

  it("allows deleting one and several (handleDeleteAssessment, handleConfirmBulkDelete)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const first = await seedAssessment(uid, semesterId);
    const second = await seedAssessment(uid, semesterId);
    await deleteDoc(assessmentRef(db, uid, semesterId, first));
    await deleteDoc(assessmentRef(db, uid, semesterId, second));
  });

  it("denies the doc's own ID as a field (the edit row wrote it before A16)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    await expectDenied(updateDoc(assessmentRef(db, uid, semesterId, id), { id }));
  });

  it("denies the review flag set by the client (only the upload sets it)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId, { needsReview: false });
    await expectDenied(updateDoc(assessmentRef(db, uid, semesterId, id), { needsReview: true }));
  });

  it("denies an unknown status, wrong types and oversize text", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    const ref = assessmentRef(db, uid, semesterId, id);
    await expectDenied(updateDoc(ref, { status: "Done" }));
    await expectDenied(updateDoc(ref, { weight: "20" }));
    await expectDenied(updateDoc(ref, { mark: "A" }));
    await expectDenied(updateDoc(ref, { dueDate: 20261030 }));
    await expectDenied(updateDoc(ref, { notes: longText(100_001) }));
    await expectDenied(updateDoc(ref, { courseName: longText(501) }));
    await expectDenied(updateDoc(ref, { assignmentName: longText(501) }));
    await expectDenied(updateDoc(ref, { dueTime: longText(33) }));
    await expectDenied(updateDoc(ref, { grade: 90 }));
  });

  it("denies another user's assessments", async () => {
    const { uid } = newUser();
    const semesterId = await seedSemester(uid);
    const id = await seedAssessment(uid, semesterId);
    const other = clientAs(`user-${randomUUID()}`);
    await expectDenied(getDoc(assessmentRef(other, uid, semesterId, id)));
    await expectDenied(updateDoc(assessmentRef(other, uid, semesterId, id), { status: "Missed" }));
    await expectDenied(deleteDoc(assessmentRef(other, uid, semesterId, id)));
  });
});

describe("users/{uid}/semesters/{semesterId}/coursePreferences/{prefsId}", () => {
  // IDs come from coursePreferencesDocId: the name itself, or an escaped one (A13)
  const prefsRef = (db: Firestore, uid: string, semesterId: string, id: string) =>
    doc(db, "users", uid, "semesters", semesterId, "coursePreferences", id);

  it("allows a color pick, first and again (useCourseColors setCourseColor)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const ref = prefsRef(db, uid, semesterId, "%MATH%2FSTAT 2050");
    await setDoc(ref, { color: "#2563EB" }, { merge: true });
    await setDoc(ref, { color: "#B45309" }, { merge: true });
  });

  it("allows a target grade, first and again (useCoursePreferences updateTargetGrade)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const ref = prefsRef(db, uid, semesterId, "CIS 3760");
    await getDoc(ref);
    await setDoc(ref, { targetGrade: 80 }, { merge: true });
    await setDoc(ref, { targetGrade: 0 }, { merge: true });
  });

  it("allows a course rename: assessments and the preferences move (useCourseRename)", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    await seedAssessment(uid, semesterId, { courseName: "MATH 2050" });
    await admin
      .doc(`users/${uid}/semesters/${semesterId}/coursePreferences/MATH 2050`)
      .set({ color: "#2563EB", targetGrade: 75 });

    const batch = writeBatch(db);
    const matches = await getDocs(
      query(
        collection(db, "users", uid, "semesters", semesterId, "assessments"),
        where("courseName", "==", "MATH 2050"),
      ),
    );
    matches.forEach((snapshot) => batch.update(snapshot.ref, { courseName: "MATH/STAT 2050" }));
    const oldPrefs = await getDoc(prefsRef(db, uid, semesterId, "MATH 2050"));
    const { color, targetGrade } = oldPrefs.data()!;
    batch.set(prefsRef(db, uid, semesterId, "%MATH%2FSTAT 2050"), { color, targetGrade });
    batch.delete(oldPrefs.ref);
    await batch.commit();
  });

  it("allows the rename's empty doc, when the old one held no valid value", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    await setDoc(prefsRef(db, uid, semesterId, "MATH 2050"), {});
  });

  it("denies a color that isn't #RRGGBB, a non-number target and other keys", async () => {
    const { uid, db } = newUser();
    const semesterId = await seedSemester(uid);
    const ref = prefsRef(db, uid, semesterId, "CIS 3760");
    await expectDenied(setDoc(ref, { color: "red" }, { merge: true }));
    await expectDenied(setDoc(ref, { color: "#12345" }, { merge: true }));
    await expectDenied(setDoc(ref, { color: "#2563EB; x" }, { merge: true }));
    await expectDenied(setDoc(ref, { targetGrade: "80" }, { merge: true }));
    await expectDenied(setDoc(ref, { courseName: "CIS 3760" }, { merge: true }));
  });

  it("denies another user's preferences", async () => {
    const { uid } = newUser();
    const semesterId = await seedSemester(uid);
    const other = clientAs(`user-${randomUUID()}`);
    await expectDenied(
      getDocs(collection(other, "users", uid, "semesters", semesterId, "coursePreferences")),
    );
    await expectDenied(setDoc(prefsRef(other, uid, semesterId, "CIS 3760"), { color: "#2563EB" }));
  });
});

describe("server-only and unused paths", () => {
  it("denies every client read and write of the server's collections", async () => {
    const { uid, db } = newUser();
    await seedUser(uid);
    const serverDocs = [
      doc(db, "welcomeEmails", uid),
      doc(db, "cronRuns", "2026-10-16"),
      doc(db, "notifications", `${uid}_a1_2026-10-16`),
      doc(db, "emailVerifications", uid),
    ];
    for (const ref of serverDocs) {
      await admin.doc(ref.path).set({ seeded: true });
      await expectDenied(getDoc(ref));
      await expectDenied(setDoc(ref, { status: "sent" }));
      await expectDenied(deleteDoc(ref));
    }
  });

  it("denies the collections nothing uses any more (documents, courses)", async () => {
    const { uid, db } = newUser();
    await expectDenied(setDoc(doc(db, "users", uid, "documents", "outline"), { name: "x" }));
    await expectDenied(setDoc(doc(db, "users", uid, "courses", "cis3760"), { name: "x" }));
    await expectDenied(getDocs(collection(db, "users", uid, "documents")));
  });
});
