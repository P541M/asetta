# Codebase cleanup pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `studyProgram` + `graduationYear` collection end to end (founder decision 2026-07-17: only institution matters), delete the dead code found by the 2026-07-17 audit, consolidate duplicated validation, and refresh stale docs — with zero intended change to remaining functionality or UI beyond the two dropped form fields.

**Architecture:** Field removal follows the proven `avatarIconId` pattern (revamp step 5): strip UI, state, writes, and types end to end; existing Firestore fields stay in place, unread and unwritten — no migration. The dead onboarding-progress localStorage mechanism deletes wholesale (nothing ever calls its save, so reads always return null). `Logo` is rebuilt as exactly the one form its two call sites use. One new file: `utils/validation.ts` for the five-times-duplicated email regex.

**Tech Stack:** Existing stack; no dependency changes except moving `@types/nodemailer` to devDependencies.

## Global Constraints

- standards.md rules; verification loop from `asetta/` (`npm run lint && npm run format:check && npx tsc --noEmit && npm run build`); no agent git operations; no test framework (loop + manual QA).
- No Firestore migration: existing `studyProgram`/`graduationYear`/`program`/`expectedGraduation` document fields stay, ignored (avatarIconId precedent).
- Node 22 via nvm-windows: prepend `/c/nvm4w/nodejs` to PATH in shells that can't find node; stop any dev server before builds.
- Out of scope (audit section E + declined optionals): file renames, docs folder moves, user-doc-reader consolidation (B3), `common/`→`modals/` move (D4), `pages/index.tsx`, `_document` theme seed, the two assessment hooks.

---

### Task 1: Remove `studyProgram` + `graduationYear` end to end

**Files:**
- Modify: `src/components/onboarding/steps/ProfileStep.tsx`
- Modify: `src/contexts/OnboardingContext.tsx:266-267`
- Modify: `src/types/onboarding.ts`
- Modify: `src/hooks/useUserProfile.ts`
- Modify: `src/types/profile.ts`
- Modify: `src/components/settings/ProfileSection.tsx`
- Modify: `src/components/settings/UserSettings.tsx`
- Modify: `src/contexts/AuthContext.tsx:45-46,63`
- Modify: `src/pages/api/welcome-email.ts:13,37`
- Modify: `src/lib/email.ts:18,42`
- Modify: `src/lib/emailTemplates.ts:139,252-259`

(`src/utils/onboardingUtils.ts` also carries the fields but is rewritten wholesale in Task 2.)

**Interfaces:**
- Produces: `ProfileForm` = `{ displayName: string; institution: string }`; `OnboardingUserData` loses both optional fields; `sendWelcomeEmail(displayName, email, institution?)`; `generateWelcomeEmailHTML(displayName, email, institution?)`.

- [ ] **Step 1: ProfileStep (onboarding)** — `formData` shrinks to `{ institution: state.userData.institution || "" }`; delete the two `<div className="space-y-1.5">` blocks for `studyProgram` and `graduationYear`; institution stays required and drives `canContinue`.
- [ ] **Step 2: OnboardingContext** — in `completeOnboarding`'s `updateDoc`, delete the `studyProgram:` and `graduationYear:` lines.
- [ ] **Step 3: types/onboarding.ts** — delete `studyProgram?: string;` and `graduationYear?: number;` from `OnboardingUserData`, and delete the unused `OnboardingStep` type at the bottom (audit item folded here — same file).
- [ ] **Step 4: useUserProfile** — delete both fields from the `UserProfile` interface and from both `setProfile` object literals.
- [ ] **Step 5: types/profile.ts** — `ProfileForm` becomes `{ displayName: string; institution: string }` (the `onChange` generic is unchanged).
- [ ] **Step 6: ProfileSection (settings)** — delete the `studyProgram` and `graduationYear` field blocks and the now-unused `const currentYear` line; displayName + institution remain side by side in the existing grid.
- [ ] **Step 7: UserSettings** — delete both fields from the `profileForm` initializer and the fetch-effect `profile` literal (the `userData.program`/`expectedGraduation` legacy fallback block dies here); delete the module-level `const currentYear` (its only consumer was the graduationYear default).
- [ ] **Step 8: AuthContext** — delete `studyProgram: ""` and `graduationYear: ...` from `defaultSettings`; delete `studyProgram: defaultSettings.studyProgram,` (and `institution` — always `""` for a brand-new user, and the API treats it as optional) from the welcome-email body.
- [ ] **Step 9: Email pipeline** — `welcome-email.ts`: destructure and pass only `{ displayName, email, institution }`; `email.ts`: `sendWelcomeEmail(displayName: string, email: string, institution?: string)` and the matching `generateWelcomeEmailHTML(displayName, email, institution)` call; `emailTemplates.ts`: drop the `studyProgram?` parameter, the `🎓 ${studyProgram}` line and its `<br>` join — the block's condition becomes just `institution`.
- [ ] **Step 10:** `npx tsc --noEmit` — EXPECTED remaining errors only in `onboardingUtils.ts` (Task 2 rewrites it).

---

### Task 2: Dead-code deletions

**Files:**
- Rewrite: `src/utils/onboardingUtils.ts`
- Modify: `src/contexts/OnboardingContext.tsx:6,239,277`
- Delete: `src/components/ui/card.tsx`
- Modify: `src/lib/firebaseUtils.ts`
- Modify: `src/utils/localStorage.ts:25-33`
- Modify: `src/utils/greetingUtils.ts`
- Modify: `src/constants/assessment.ts:7`
- Modify: `src/lib/notifications.ts`

- [ ] **Step 1: onboardingUtils rewrite** — the progress mechanism is dead (nothing ever calls `saveOnboardingProgress`, so `getOnboardingProgress` always returns null and the merge/`currentStep` logic never fires). Full new contents:

```ts
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { OnboardingUserData } from "../types/onboarding";

export interface OnboardingStatus {
  hasCompletedOnboarding: boolean;
  onboardingCompletedAt?: Date;
  isNewUser: boolean;
  needsOnboarding: boolean;
}

export async function getUserOnboardingStatus(user: User | null): Promise<OnboardingStatus | null> {
  if (!user) {
    return null;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        hasCompletedOnboarding: false,
        onboardingCompletedAt: undefined,
        isNewUser: true,
        needsOnboarding: true,
      };
    }

    const userData = userDoc.data();
    const hasCompletedOnboarding = userData.hasCompletedOnboarding ?? false;
    const onboardingCompletedAt = userData.onboardingCompletedAt?.toDate();

    // Consider a user "new" if they don't have onboarding completion data
    const isNewUser = !hasCompletedOnboarding && !onboardingCompletedAt;

    return {
      hasCompletedOnboarding,
      onboardingCompletedAt,
      isNewUser,
      needsOnboarding: !hasCompletedOnboarding,
    };
  } catch (error) {
    console.error("Error fetching user onboarding status:", error);
    // Default to safe state - assume needs onboarding
    return {
      hasCompletedOnboarding: false,
      onboardingCompletedAt: undefined,
      isNewUser: true,
      needsOnboarding: true,
    };
  }
}

export function shouldRedirectToOnboarding(onboardingStatus: OnboardingStatus | null): boolean {
  if (!onboardingStatus) {
    return false;
  }

  return onboardingStatus.needsOnboarding;
}

export async function loadUserDataForOnboarding(
  user: User | null,
): Promise<{ userData: Partial<OnboardingUserData> } | null> {
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) return null;

    const firebaseData = userDoc.data();
    return {
      userData: {
        institution: firebaseData.institution || "",
        emailNotifications: firebaseData.emailNotifications || false,
        hasConsentedToNotifications: firebaseData.hasConsentedToNotifications || false,
        notificationDaysBefore: firebaseData.notificationDaysBefore || 1,
        email: firebaseData.email || "",
      },
    };
  } catch (error) {
    console.error("Error loading user data for onboarding:", error);
    return null;
  }
}
```

- [ ] **Step 2: OnboardingContext** — remove `clearOnboardingProgress` from the import (line 6) and delete its two call lines (with their comments) in `confirmExit` and `completeOnboarding`. The `LOAD_EXISTING_DATA` payload type already treats `semesterData`/`currentStep` as optional, so the narrowed return needs no reducer change.
- [ ] **Step 3: Delete `src/components/ui/card.tsx`** (never imported):

```powershell
Remove-Item "e:\Code_Files\Asetta_Project\Code\asetta\src\components\ui\card.tsx" -Confirm:$false
```

- [ ] **Step 4: firebaseUtils** — delete the five unused helpers (`getUserSemestersRef`, `getSemesterDocRef`, `getCoursesRef`, `getCourseDocRef`, `getCoursePreferencesRef`). The `CollectionReference` import stays (`getAssessmentsRef` returns it). Keep `getUserDocRef`, `getAssessmentsRef`, `getAssessmentDocRef`, `getCoursePreferencesDocRef`.
- [ ] **Step 5: localStorage.ts** — delete `removeFromLocalStorage` (orphaned by the avatar cleanup).
- [ ] **Step 6: greetingUtils** — change `export const getTimeBasedGreeting` and `export const getUserDisplayName` to plain `const` (only used in-file by `getPersonalizedGreeting`).
- [ ] **Step 7: constants/assessment.ts** — `export const COMPLETED_STATUSES` → `const COMPLETED_STATUSES` (only `isCompletedStatus` is consumed).
- [ ] **Step 8: notifications.ts** — `export function validateNotificationPreferences` → `function ...` (in-file use only); delete `title: string;` from the local `Assessment` interface and the `title: data.title,` line in the assessment devLog object (the schema has no `title` field — it always logged undefined).
- [ ] **Step 9:** `npx tsc --noEmit` — clean.

---

### Task 3: One `isValidEmail`

**Files:**
- Create: `src/utils/validation.ts`
- Modify: `src/components/onboarding/steps/NotificationsStep.tsx:91-93`
- Modify: `src/components/settings/UserSettings.tsx:20`
- Modify: `src/components/settings/NotificationsSection.tsx:64-67`
- Modify: `src/lib/notifications.ts:302-305`
- Modify: `src/pages/api/welcome-email.ts:23-30`

**Interfaces:**
- Produces: `isValidEmail(value: string): boolean` from `src/utils/validation.ts`.

- [ ] **Step 1: Create `src/utils/validation.ts`**:

```ts
export const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
```

- [ ] **Step 2:** Delete the five local copies and import the util instead: `NotificationsStep` + `NotificationsSection` (`import { isValidEmail } from "../../utils/validation";` — path depth differs per file: `../../../utils/validation` from onboarding/steps), `UserSettings` (drop the module-level const), `notifications.ts` (delete the exported function; its line-339 caller uses the import), `welcome-email.ts` (replace the inline `emailRegex` block's test with `!isValidEmail(email)`).
- [ ] **Step 3:** `npx tsc --noEmit` — clean.

---

### Task 4: Logo rebuild + orphaned CSS filters

**Files:**
- Rewrite: `src/components/ui/Logo.tsx`
- Modify: `src/components/auth/AuthShell.tsx:28,45`
- Modify: `src/styles/globals.css:309-315`

- [ ] **Step 1: Logo.tsx** — both call sites render the identical small wordmark; every other prop/size/color is dead. Full new contents:

```tsx
import Image from "next/image";

/**
 * The Asetta wordmark. font-extrabold is the brand mark (shared with the
 * landing), deliberately outside the app's two-weight rule.
 */
const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="relative size-7 shrink-0">
      <Image
        src="/images/Asetta_Logo.svg"
        alt="Asetta logo"
        width={80}
        height={80}
        className="filter-primary-main h-full w-full object-contain"
        priority
      />
    </div>
    <span className="text-xl font-extrabold tracking-tight text-foreground">Asetta</span>
  </div>
);

export default Logo;
```

- [ ] **Step 2: AuthShell** — both `<Logo size="sm" variant="logo-with-text" color="primary" />` → `<Logo />`.
- [ ] **Step 3: globals.css** — delete the `.filter-white-main` and `.filter-dark-main` rule blocks (only `filter-primary-main` is used).
- [ ] **Step 4:** `npx tsc --noEmit` — clean. Visual parity check happens in Task 6 QA (auth pages).

---

### Task 5: AuthContext welcome-email block on devLog

**Files:**
- Modify: `src/contexts/AuthContext.tsx:53-81`

- [ ] **Step 1:** Replace the try/fetch block (the emoji `console.log`/`warn` + hand-rolled `NODE_ENV` guards are the last devLog-rule violators). With Task 1's body slimming already applied, the whole block becomes:

```ts
// Send welcome email for new Google OAuth users (non-blocking)
try {
  const response = await fetch("/api/welcome-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: defaultSettings.displayName,
      email: defaultSettings.email,
    }),
  });
  if (response.ok) {
    devLog("Welcome email sent for new Google user");
  } else {
    devError("Welcome email failed for new Google user");
  }
} catch {
  devError("Welcome email error for new Google user");
}
```

with `import { devLog, devError } from "../utils/devLog";` added.

- [ ] **Step 2:** `npm run lint` — clean.

---

### Task 6: Docs + config refresh

**Files:**
- Modify: `CLAUDE.md` (Known Issues section)
- Modify: `README.md:8,10,20`
- Modify: `package.json` + lockfile (via npm)
- Modify: `standards.md` (one example)

- [ ] **Step 1: CLAUDE.md** — delete the entire `## Known Issues` section (all three items shipped long ago: the filter renders unconditionally in `PanelHeader` actions, "Missed" exists in `AssessmentStatus`, spacing was the 2026-07 revamp).
- [ ] **Step 2: README** — line 8: status list becomes `(Not started, In progress, Submitted, Missed)` (matches real casing); line 10: `**Calendar Integration** - Visual calendar view with ICS export to Google Calendar, Outlook, or Apple Calendar` (no drag-and-drop there — that's semester reordering); line 20: `**Backend:** Firebase Authentication, Firestore` (Storage is unused).
- [ ] **Step 3: package.json** — move `"@types/nodemailer"` from `dependencies` to `devDependencies` (keep `^6.4.17`), then `npm install` from `asetta/` to sync the lockfile.
- [ ] **Step 4: standards.md** — the Composition bullet's example names the now-deleted Card primitives: `*from* primitives (`Card`, `CardHeader`, …)` → `*from* primitives (`Button`, `Input`, `Label`, …)`.

---

### Task 7: Sweeps, verification, QA handoff

- [ ] **Step 1: Sweeps** — zero hits in `asetta/src` for each of: `studyProgram|graduationYear|expectedGraduation|\.program\b`; `saveOnboardingProgress|getOnboardingProgress|clearOnboardingProgress|onboarding-progress`; `removeFromLocalStorage`; `filter-white-main|filter-dark-main`; `emailRegex` (the one in `validation.ts` is a literal, not the name); `OnboardingStep`.
- [ ] **Step 2:** From `asetta/`: `npm run format`, then `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 3: Manual QA** (founder; both themes, mobile width):
  1. Onboarding as a fresh user: profile step shows avatar + institution only; completing writes no `studyProgram`/`graduationYear`; skip/exit still works (progress-clear removal is invisible — nothing was ever saved).
  2. Settings → Profile: display name + institution only; save + dirty check still work.
  3. Auth pages: logo looks identical (both themes).
  4. Existing account with old fields in Firestore renders everywhere (fields ignored).
  5. Notifications settings + onboarding notifications step: email validation still gates saves.
- [ ] **Step 4: Hand off for commit** (suggested: `remove program/graduation collection, delete dead code, dedupe validation, refresh docs`). Flag: `package.json` changed → `npm install` after pulling elsewhere.
