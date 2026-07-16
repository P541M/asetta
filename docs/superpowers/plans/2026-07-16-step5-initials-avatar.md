# Step 5: Initials avatar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the icon-picker avatar with a derived initials avatar and remove `avatarIconId` (plus `react-icons`) end to end.

**Architecture:** `Avatar` becomes a pure presentational component: `{ name?, size, className? }` renders the first letter of `name` (callers pass `displayName || email`; the component falls back to "U") on the amber selection tint. Because the avatar is now derived, all picker UI, the stored `avatarIconId` field, and its localStorage flash-cache are deleted rather than migrated — existing Firestore `avatarIconId` fields are simply ignored. Delete order: rebuild `Avatar` and its three call sites first, then strip the data layer, then delete the picker files and uninstall `react-icons` (its only importer is `data/profileIcons.ts`, and it is `src/data/`'s only file — the folder goes too).

**Tech Stack:** Existing React/Tailwind stack; no new dependencies; `react-icons` removed.

## Global Constraints

- Same as step 1 (`2026-07-16-step1-motion-and-semester-flicker.md`): standards.md rules, verification loop from `asetta/`, no agent git operations, no test framework (verification loop + manual QA stand in for TDD).
- No Firestore migration: existing `avatarIconId` document fields stay in place, unread and unwritten.
- `package.json` changes → the founder must run `npm install` after pulling on any other machine.
- All git commands via `git -C e:\Code_Files\Asetta_Project\Code` (stray repo at the E:\ root breaks git from outside the project).

---

### Task 1: Rebuild `Avatar` and its three call sites

**Files:**
- Rewrite: `src/components/ui/Avatar.tsx`
- Modify: `src/components/layout/DashboardHeader.tsx:81`
- Modify: `src/components/onboarding/steps/ProfileStep.tsx`
- Modify: `src/components/settings/ProfileSection.tsx` + `src/types/profile.ts`

**Interfaces:**
- Produces: `AvatarProps` = `{ name?: string; size?: "xs" | "sm" | "md" | "lg"; className?: string }`. Callers resolve the best available string (`displayName || email || undefined`); the component handles empty/undefined → "U".

- [ ] **Step 1: Rewrite `Avatar.tsx`**

```tsx
import { cn } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "size-6 text-xs",
  sm: "size-8 text-sm",
  md: "size-10 text-base",
  lg: "size-12 text-lg",
};

const Avatar = ({ name, size = "md", className }: AvatarProps) => {
  const initial = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary select-none",
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {initial}
    </div>
  );
};

export default Avatar;
```

Notes: the letter is a glyph scaled to its circle (like the old `iconSizeClasses`), not running text, so it sizes with the avatar rather than the type ramp. `aria-hidden` because every placement sits next to (or inside a control labeled with) the user's name. Amber selection language per spec: `bg-primary/10 text-primary`.

- [ ] **Step 2: DashboardHeader** — replace line 81:

```tsx
<Avatar size="sm" name={profile?.displayName || user.displayName || user.email || undefined} />
```

(`user` is non-null past the early return; `|| undefined` converts Firebase's `null`s.) Everything else in the file waits for Task 2 (it still reads `profile` for the greeting — that stays).

- [ ] **Step 3: ProfileStep (onboarding)** — the avatar stays as a display, the picker goes:
  - Imports: delete `AvatarPicker` and `DEFAULT_ICON` imports; add `import { useAuth } from "../../../contexts/AuthContext";`.
  - Add `const { user } = useAuth();` beside the existing `useOnboarding()` call.
  - Delete `avatarIconId` from the `formData` initializer and delete `handleIconSelect` entirely.
  - Replace the whole "Avatar section" block (lines 50–62) with:

```tsx
{/* Avatar */}
<div className="mb-8 flex justify-center">
  <Avatar size="lg" name={user?.displayName || user?.email || undefined} />
</div>
```

- [ ] **Step 4: ProfileSection (settings)** — the picker block goes entirely:
  - Imports: delete `Avatar` and `AvatarPicker` imports.
  - Props: delete `avatarIconId` / `setAvatarIconId` from the destructure, and delete both fields from `ProfileSectionProps` in `src/types/profile.ts`.
  - Delete the whole "Avatar section" block (lines 29–49).
  - Header copy: "Update your profile details and avatar" → "Update your profile details".
  - Judgment call (flag at handoff): no static avatar preview is kept in settings — the section is pure form fields until step 6 redesigns it. The initials avatar is visible in the header on the same screen.

- [ ] **Step 5:** `npx tsc --noEmit` from `asetta/` — EXPECTED remaining errors only in Task 2/3 files (`UserSettings`, `useUserProfile`, onboarding files) that still pass or read deleted props; nothing new in Task 1 files.

---

### Task 2: Strip `avatarIconId` from the data layer

**Files:**
- Modify: `src/hooks/useUserProfile.ts`
- Modify: `src/components/settings/UserSettings.tsx`
- Modify: `src/utils/greetingUtils.ts:20-23`
- Modify: `src/contexts/AuthContext.tsx:7,93-96`

**Interfaces:**
- Produces: `useUserProfile`'s `UserProfile` no longer has `avatarIconId`; the hook no longer touches localStorage. `profile` is now `null` until the Firestore fetch resolves (the flash-cache effect is deleted) — `DashboardHeader` already tolerates that: greeting and avatar both fall back to `user` fields.

- [ ] **Step 1: useUserProfile** — delete the entire localStorage/flash-cache apparatus:
  - Delete the `getFromLocalStorage`/`setToLocalStorage`/`removeFromLocalStorage` import block and the `DEFAULT_ICON`/`isValidIconId` import.
  - Delete `avatarIconId: string;` from the `UserProfile` interface.
  - Delete the entire first `useEffect` (lines 34–64, the cached-avatar seeding — the fetch effect already handles the `!user → setProfile(null)` case).
  - In the fetch effect: delete the `avatarIconId` resolution + `setToLocalStorage` lines (84–90) and the `avatarIconId` field from both `setProfile` object literals (lines 93 and 109–111, including the `setToLocalStorage` on the not-exists branch).

- [ ] **Step 2: UserSettings** — remove the field end to end (the structural redesign is step 6; today only `avatarIconId` leaves):
  - Delete the `DEFAULT_ICON` import.
  - Delete the `avatarIconId` state (line 35), its `initialValues` entry (line 59), its `hasChanges()` clause (line 79), the fetch-effect lines (113–114 `newAvatarIconId`, 127 `setAvatarIconId`, 139 initial-values entry), the `updateDoc` field (line 198), the post-save `setInitialValues` entry (line 212), and the two props passed to `<ProfileSection>` (lines 274–275).

- [ ] **Step 3: greetingUtils** — the local `UserProfile` interface becomes:

```ts
interface UserProfile {
  displayName?: string;
}
```

- [ ] **Step 4: AuthContext** — delete the `removeFromLocalStorage` import (line 7) and the cache-clear inside `logout` (lines 94–95, comment included), leaving:

```ts
const logout = async () => {
  await signOut(auth);
};
```

- [ ] **Step 5:** `npx tsc --noEmit` — EXPECTED remaining errors only in Task 3's onboarding files.

---

### Task 3: Strip `avatarIconId` from onboarding

**Files:**
- Modify: `src/types/onboarding.ts:7`
- Modify: `src/contexts/OnboardingContext.tsx:14,269`
- Modify: `src/utils/onboardingUtils.ts:121`

- [ ] **Step 1: types/onboarding.ts** — delete `avatarIconId?: string;` from `OnboardingUserData`.
- [ ] **Step 2: OnboardingContext** — delete the `DEFAULT_ICON` import (line 14) and the `avatarIconId: state.userData.avatarIconId || DEFAULT_ICON.id,` line from the `completeOnboarding` `updateDoc` (line 269).
- [ ] **Step 3: onboardingUtils** — delete `avatarIconId: firebaseData.avatarIconId || "",` from `loadUserDataForOnboarding` (line 121).
- [ ] **Step 4:** `npx tsc --noEmit` — clean (picker files still exist but nothing imports them after Task 1).

---

### Task 4: Delete picker files, uninstall `react-icons`, sweep

**Files:**
- Delete: `src/components/ui/IconPicker.tsx`, `src/components/ui/AvatarPicker.tsx`, `src/data/profileIcons.ts` (and the now-empty `src/data/` folder)
- Modify: `package.json` + `package-lock.json` (via npm)

- [ ] **Step 1: Delete the three files** (PowerShell, from `asetta/`):

```powershell
Remove-Item src\components\ui\IconPicker.tsx, src\components\ui\AvatarPicker.tsx -Confirm:$false
Remove-Item src\data -Recurse -Confirm:$false
```

- [ ] **Step 2: Uninstall** — from `asetta/`: `npm uninstall react-icons`. Expected: `package.json` dependencies no longer list `react-icons`; lockfile updated.
- [ ] **Step 3: Sweep** — all of these must return zero hits in `asetta/src`:
  - Grep `avatarIconId|avatarEmoji`
  - Grep `profileIcons|DEFAULT_ICON|isValidIconId|CURATED_ICONS`
  - Grep `AvatarPicker|IconPicker`
  - Grep `react-icons` (also absent from `package.json`)

---

### Task 5: Verification + QA handoff

- [ ] **Step 1:** From `asetta/`: `npm run format`, then `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green (use the Bash tool for the `&&` chain; PowerShell 5.1 lacks `&&`).
- [ ] **Step 2: Manual QA** (`npm run dev`, both themes, mobile width):
  1. Header avatar shows the first letter of the display name on the amber tint (both themes); user with no display name shows the email's first letter.
  2. Onboarding profile step: initials avatar shown, no picker grid, form still submits; completing onboarding writes no `avatarIconId`.
  3. Settings → Profile: no avatar/picker block, fields save correctly, Save button dirty-check still works.
  4. Logout works (cache-clear line removed).
  5. An existing account whose Firestore doc still has `avatarIconId` renders fine (field ignored).
- [ ] **Step 3: Hand off for commit** (founder runs git; suggested message: `replace icon avatar with initials avatar, drop react-icons`). Flag: `package.json` changed — run `npm install` after pulling on other machines.
