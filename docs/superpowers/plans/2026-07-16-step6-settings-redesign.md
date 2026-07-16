# Step 6: Settings redesign (stacked sections) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Settings becomes one `max-w-3xl` column of three stacked cards (Profile, Preferences, Notifications) with per-card saves, instant-apply preferences, a static page header, and a working System theme.

**Architecture:** `UserSettings` stays the single data owner: it fetches the user doc once and holds one form object per card (`profileForm`, `notifForm`) plus a `prefs` object, each with a generic field setter. Profile and Notifications are small `<form>`s with their own dirty check (generic `isDirty(form, saved)` against a post-fetch snapshot), Save button (`SettingsActions`, shrunk), and scoped `SettingsMessage`. Preferences persist per field on toggle (`updateDoc({ [field]: value })`) with optimistic state + revert-and-alert on failure; theme already applies instantly via next-themes. The tab bar (`SettingsNavigation`) is deleted; the section components become controlled by `{ form, onChange }` props. `DashboardHeader` gains an optional `title` prop that swaps the greeting block for a static page title (user menu stays), so the settings page drops its duplicated in-page `h1`.

**Tech Stack:** Existing React/Tailwind/Firebase stack; next-themes `enableSystem`.

## Global Constraints

- Same as step 1 (`2026-07-16-step1-motion-and-semester-flicker.md`): standards.md rules, verification loop from `asetta/`, no agent git operations, no test framework (verification loop + manual QA stand in for TDD).
- Zero drift (spec): `defaultTheme="light"` stays in `_app.tsx` — System is an explicit opt-in.
- Copy: sentence case, quiet voice, no em dashes.
- Existing Firestore field names unchanged (`showDaysTillDue`, `emailNotifications`, `hasConsentedToNotifications`, …); consent keeps mirroring the notifications toggle.
- Git via `git -C e:\Code_Files\Asetta_Project\Code\asetta` only (stray repo at E:\ root).

---

### Task 1: Page chrome — `_app.tsx`, `DashboardHeader` title prop, `settings.tsx`

**Files:**
- Modify: `src/pages/_app.tsx:12-18`
- Modify: `src/components/layout/DashboardHeader.tsx`
- Modify: `src/pages/settings.tsx`

**Interfaces:**
- Produces: `DashboardHeaderProps` = `{ onLogout?: () => Promise<void>; title?: string }` — `title` renders a static page title (no greeting, no subtitle, no timers); user menu unchanged.
- Consumes (Task 3): `settings.tsx` renders `<UserSettings />` with no props — compile breaks against the old `UserSettingsProps` until Task 3 lands (expected).

- [ ] **Step 1: `_app.tsx`** — replace the ThemeProvider block (comment updated to state the constraint, not the pending change):

```tsx
{/* defaultTheme stays "light": System is an explicit opt-in, so nobody's appearance changes without their action (zero drift — see standards.md) */}
<ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
```

- [ ] **Step 2: DashboardHeader** — add the `title` prop:

```tsx
interface DashboardHeaderProps {
  onLogout?: () => Promise<void>;
  title?: string;
}

const DashboardHeader = ({ onLogout, title }: DashboardHeaderProps) => {
```

Guard the greeting effect so static pages schedule no timers — first line inside the existing `useEffect` body: `if (title) return;` and add `title` to its dependency array (`[user, profile, title]`).

Replace the greeting `<div>` (the block commented `{/* Personalized greeting */}`) with:

```tsx
{title ? (
  <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
) : (
  <div>
    <h1
      className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
      role="banner"
      aria-label={`Dashboard greeting: ${greeting}`}
    >
      {greeting}
    </h1>
    <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
  </div>
)}
```

- [ ] **Step 3: settings.tsx** — pass the title, drop the in-page `h1`, narrow the column, drop the `UserSettings` props. The auth glue (redirect effect, `handleLogout`, loading/null returns) and `<Head>` are unchanged; the returned JSX becomes:

```tsx
return (
  <div className="min-h-safe-screen bg-background">
    <Head>
      <title>Settings - Asetta</title>
      <meta name="description" content="Manage your account settings and preferences" />
    </Head>
    <DashboardHeader onLogout={handleLogout} title="Settings" />
    <div className="p-4 md:p-6 pl-safe pr-safe pt-safe pb-safe">
      <div className="mx-auto max-w-3xl">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ArrowLeft aria-hidden />
          Back to dashboard
        </Button>
        <UserSettings />
      </div>
    </div>
  </div>
);
```

- [ ] **Step 4:** `npx tsc --noEmit` — EXPECTED single failure: `settings.tsx` passing no props while `UserSettings` still requires `isOpen`/`onClose` (fixed in Task 3). Nothing else may error.

---

### Task 2: Section components become controlled `{ form, onChange }`

**Files:**
- Rewrite: `src/types/profile.ts`
- Rewrite: `src/types/preferences.ts`
- Modify: `src/components/settings/ProfileSection.tsx`
- Modify: `src/components/settings/PreferencesSection.tsx`
- Modify: `src/components/settings/NotificationsSection.tsx`

**Interfaces:**
- Produces (consumed by Task 3):
  - `ProfileForm` = `{ displayName: string; institution: string; studyProgram: string; graduationYear: number }`
  - `NotificationsForm` = `{ emailNotifications: boolean; notificationDaysBefore: number; email: string }`
  - `ProfileSectionProps` = `{ form: ProfileForm; onChange: <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => void }`
  - `NotificationsSectionProps` = same shape over `NotificationsForm`
  - `PreferencesSectionProps` = `{ prefs: DisplayPreferences; onPrefChange: (field: keyof DisplayPreferences, value: boolean) => void }` — reuses `DisplayPreferences` from `hooks/useDisplayPreferences` (no duplicate type)

- [ ] **Step 1: `types/profile.ts`** — full contents:

```ts
export interface ProfileForm {
  displayName: string;
  institution: string;
  studyProgram: string;
  graduationYear: number;
}

export interface ProfileSectionProps {
  form: ProfileForm;
  onChange: <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => void;
}
```

- [ ] **Step 2: `types/preferences.ts`** — full contents (`NotificationPreferencesProps` is deleted; its only consumer is rewritten below):

```ts
import type { DisplayPreferences } from "../hooks/useDisplayPreferences";

export interface PreferencesSectionProps {
  prefs: DisplayPreferences;
  onPrefChange: (field: keyof DisplayPreferences, value: boolean) => void;
}

export interface NotificationsForm {
  emailNotifications: boolean;
  notificationDaysBefore: number;
  email: string;
}

export interface NotificationsSectionProps {
  form: NotificationsForm;
  onChange: <K extends keyof NotificationsForm>(field: K, value: NotificationsForm[K]) => void;
}
```

- [ ] **Step 3: ProfileSection** — destructure changes to `({ form, onChange }: ProfileSectionProps)`; every field reads `form.X` and writes `onChange("X", …)`:

```tsx
<Input id="displayName" type="text" value={form.displayName}
  onChange={(e) => onChange("displayName", e.target.value)} placeholder="Your display name" />
```

```tsx
<Input id="institution" type="text" value={form.institution}
  onChange={(e) => onChange("institution", e.target.value)} placeholder="Your university or school" />
```

```tsx
<Input id="studyProgram" type="text" value={form.studyProgram}
  onChange={(e) => onChange("studyProgram", e.target.value)}
  placeholder="e.g., Computer Science, Business Administration" />
```

```tsx
<Input id="graduationYear" type="number" min={currentYear} max={currentYear + 10}
  value={form.graduationYear}
  onChange={(e) => onChange("graduationYear", parseInt(e.target.value))} />
```

(Labels, grid, and section header stay as they are today.)

- [ ] **Step 4: PreferencesSection** — destructure changes to `({ prefs, onPrefChange }: PreferencesSectionProps)`; the theme radiogroup block is untouched; the four `ToggleRow`s become:

```tsx
<ToggleRow title="Dashboard statistics"
  description="Show statistics overview at the top of your dashboard"
  checked={prefs.showStatsBar} onCheckedChange={(v) => onPrefChange("showStatsBar", v)} />
<ToggleRow title="Days until due"
  description="Show countdown of days remaining until assessment due dates"
  checked={prefs.showDaysTillDue} onCheckedChange={(v) => onPrefChange("showDaysTillDue", v)} />
<ToggleRow title="Assessment weight"
  description="Display the weight/percentage column in assessments table"
  checked={prefs.showWeight} onCheckedChange={(v) => onPrefChange("showWeight", v)} />
<ToggleRow title="Assessment notes"
  description="Show notes and additional information in the assessments table"
  checked={prefs.showNotes} onCheckedChange={(v) => onPrefChange("showNotes", v)} />
```

- [ ] **Step 5: NotificationsSection** — import changes to `NotificationsSectionProps`; destructure becomes `({ form, onChange }: NotificationsSectionProps)`. Mechanical substitutions throughout the file:
  - `emailNotifications` → `form.emailNotifications`; the main `Switch` handler becomes `onCheckedChange={(checked) => onChange("emailNotifications", checked)}` (consent now syncs at save time in `UserSettings`, so the second call and its comment go).
  - `notificationDaysBefore` → `form.notificationDaysBefore` (three places: the custom-days `useEffect` — also its dependency array — and `selectedTiming`); `setNotificationDaysBefore(n)` → `onChange("notificationDaysBefore", n)` (three places: both branches of `handleDaysChange`, and `handleCustomDaysBlur`).
  - `email` → `form.email`; `setEmail(...)` → `onChange("email", e.target.value)`.

- [ ] **Step 6:** `npx tsc --noEmit` — EXPECTED failures only in `UserSettings.tsx` (still on the old prop shapes) and the Task 1 `settings.tsx` prop error.

---

### Task 3: Rebuild `UserSettings`, shrink `SettingsActions`, delete `SettingsNavigation`

**Files:**
- Rewrite: `src/components/settings/UserSettings.tsx`
- Rewrite: `src/components/settings/SettingsActions.tsx`
- Delete: `src/components/settings/SettingsNavigation.tsx`
- Unchanged: `src/components/settings/SettingsMessage.tsx` (already the right shape; renders nothing for empty text — each card mounts one unconditionally)

**Interfaces:**
- Consumes Task 2's props exactly.
- Produces: `UserSettings` takes no props; `SettingsActionsProps` = `{ dirty: boolean; saving: boolean }` (a submit button inside each card's `<form>`).

- [ ] **Step 1: SettingsActions** — full contents (Cancel button, Check icon, and the "unsaved changes" hint are deleted; the disabled state carries that information):

```tsx
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface SettingsActionsProps {
  dirty: boolean;
  saving: boolean;
}

/** Per-card save footer: submit enabled only while the card's form is dirty. */
const SettingsActions = ({ dirty, saving }: SettingsActionsProps) => (
  <div className="mt-8 flex justify-end border-t border-border pt-6">
    <Button type="submit" disabled={!dirty || saving} className="sm:min-w-36">
      {saving ? (
        <>
          <Loader2 className="motion-safe:animate-spin" aria-hidden />
          Saving...
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  </div>
);

export default SettingsActions;
```

- [ ] **Step 2: UserSettings** — full contents:

```tsx
import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferencesSection";
import NotificationsSection from "./NotificationsSection";
import SettingsActions from "./SettingsActions";
import SettingsMessage from "./SettingsMessage";
import { ProfileForm } from "../../types/profile";
import { NotificationsForm } from "../../types/preferences";
import {
  DisplayPreferences,
  DEFAULT_DISPLAY_PREFERENCES,
} from "../../hooks/useDisplayPreferences";

type Message = { text: string; type: "success" | "error" } | null;

const isDirty = <T extends object>(form: T, saved: T | null) =>
  saved !== null && (Object.keys(form) as (keyof T)[]).some((key) => form[key] !== saved[key]);

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const currentYear = new Date().getFullYear();

const UserSettings = () => {
  const { user } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileForm>({
    displayName: user?.displayName || "",
    institution: "",
    studyProgram: "",
    graduationYear: currentYear + 4,
  });
  const [savedProfile, setSavedProfile] = useState<ProfileForm | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<Message>(null);

  const [prefs, setPrefs] = useState<DisplayPreferences>(DEFAULT_DISPLAY_PREFERENCES);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  const [notifForm, setNotifForm] = useState<NotificationsForm>({
    emailNotifications: false,
    notificationDaysBefore: 1,
    email: "",
  });
  const [savedNotif, setSavedNotif] = useState<NotificationsForm | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifMessage, setNotifMessage] = useState<Message>(null);

  const setProfileField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) =>
    setProfileForm((form) => ({ ...form, [field]: value }));

  const setNotifField = <K extends keyof NotificationsForm>(
    field: K,
    value: NotificationsForm[K],
  ) => setNotifForm((form) => ({ ...form, [field]: value }));

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));
        if (!userSnapshot.exists()) return;
        const userData = userSnapshot.data();

        const profile: ProfileForm = {
          displayName: user.displayName || "",
          institution: userData.institution || "",
          // Migration support: handle both old and new field names
          studyProgram: userData.studyProgram || userData.program || "",
          graduationYear:
            userData.graduationYear ||
            (typeof userData.expectedGraduation === "string"
              ? parseInt(userData.expectedGraduation) || currentYear + 4
              : currentYear + 4),
        };
        const notifications: NotificationsForm = {
          emailNotifications: userData.emailNotifications ?? false,
          notificationDaysBefore: userData.notificationDaysBefore ?? 1,
          email: userData.email || "",
        };

        setProfileForm(profile);
        setSavedProfile(profile);
        setNotifForm(notifications);
        setSavedNotif(notifications);
        setPrefs({
          showDaysTillDue: userData.showDaysTillDue ?? true,
          showWeight: userData.showWeight ?? true,
          showNotes: userData.showNotes ?? true,
          showStatsBar: userData.showStatsBar ?? false,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      if (profileForm.displayName !== savedProfile?.displayName) {
        await updateProfile(user, { displayName: profileForm.displayName });
      }
      await updateDoc(doc(db, "users", user.uid), { ...profileForm, updatedAt: new Date() });
      setSavedProfile(profileForm);
      setProfileMessage({ text: "Profile updated", type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileMessage({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePrefChange = async (field: keyof DisplayPreferences, value: boolean) => {
    const previous = prefs;
    setPrefs({ ...prefs, [field]: value });
    setPrefsError(null);
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { [field]: value, updatedAt: new Date() });
    } catch (error) {
      console.error("Error saving preference:", error);
      setPrefs(previous);
      setPrefsError("Failed to save preference. Please try again.");
    }
  };

  const handleNotifSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (notifForm.emailNotifications && notifForm.email && !isValidEmail(notifForm.email)) {
      setNotifMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }
    setNotifSaving(true);
    setNotifMessage(null);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...notifForm,
        // Consent mirrors the notifications toggle (one decision, stored in both fields)
        hasConsentedToNotifications: notifForm.emailNotifications,
        updatedAt: new Date(),
      });
      setSavedNotif(notifForm);
      setNotifMessage({ text: "Notification settings updated", type: "success" });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setNotifMessage({
        text: "Failed to update notification settings. Please try again.",
        type: "error",
      });
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <form onSubmit={handleProfileSave}>
          <ProfileSection form={profileForm} onChange={setProfileField} />
          <SettingsMessage
            text={profileMessage?.text ?? ""}
            type={profileMessage?.type ?? "success"}
          />
          <SettingsActions dirty={isDirty(profileForm, savedProfile)} saving={profileSaving} />
        </form>
      </section>

      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <PreferencesSection prefs={prefs} onPrefChange={handlePrefChange} />
        <SettingsMessage text={prefsError ?? ""} type="error" />
      </section>

      <section className="rounded-xl bg-card p-6 shadow-soft md:p-8">
        <form onSubmit={handleNotifSave}>
          <NotificationsSection form={notifForm} onChange={setNotifField} />
          <SettingsMessage text={notifMessage?.text ?? ""} type={notifMessage?.type ?? "success"} />
          <SettingsActions dirty={isDirty(notifForm, savedNotif)} saving={notifSaving} />
        </form>
      </section>
    </div>
  );
};

export default UserSettings;
```

- [ ] **Step 3: Delete** `src/components/settings/SettingsNavigation.tsx` (PowerShell, from `asetta/`):

```powershell
Remove-Item src\components\settings\SettingsNavigation.tsx -Confirm:$false
```

- [ ] **Step 4: Sweep** — zero hits in `asetta/src` for: `SettingsNavigation`, `NotificationPreferencesProps`, `isOpen` within `src/components/settings/`, `setHasConsentedToNotifications`.
- [ ] **Step 5:** `npx tsc --noEmit` — clean.

---

### Task 4: Verification + QA handoff

- [ ] **Step 1:** From `asetta/`: `npm run format`, then `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 2: Manual QA** (`npm run dev`, both themes, mobile width):
  1. Settings header shows static "Settings" (no greeting/subtitle), user menu still works; back button returns to dashboard.
  2. Three stacked cards in one `max-w-3xl` column; no tab bar.
  3. Theme "System" now follows the OS setting (flip the OS theme with System selected); Light/Dark still instant; selection survives reload.
  4. Display toggles flip instantly with no Save button, persist across reload, and the dashboard reflects them on next visit.
  5. Profile card: edit display name → its Save enables; saving updates the header avatar/greeting after reload; success message scoped to the card.
  6. Notifications card: toggle on, invalid email blocks save with the card-scoped error; valid save persists; custom timing still works.
  7. Existing users keep `defaultTheme="light"` unless they choose System (zero drift).
- [ ] **Step 3: Hand off for commit** (founder runs git; suggested message: `redesign settings as stacked cards with per-card saves and instant preferences`).
