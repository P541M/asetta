# UI/UX housekeeping design — 2026-07-16

Post-revamp cleanup of the main platform (`asetta/`). Eight items, ordered for implementation.
Goal: consistency, premium-minimal feel, and removal of dead/over-engineered code. All work
follows `standards.md` (v4.0); this spec adds new recipes that get codified there in step 7.

Founder decisions locked during brainstorming (2026-07-16):

- Notes: keep rich text, slimmed to StarterKit + Link + Placeholder.
- Avatar: initials avatar replaces the icon picker; no uploadable images.
- Settings: stacked sections, no tabs, narrower column; Preferences apply instantly.
- Empty states: small icon in a tonal circle, standardized recipe.

---

## Step 1 — Remove entrance animations, fix the semester-switch flicker

**Problem.** `standards.md` outlaws entrance animations on app screens, but leftovers remain:
the header greeting, the semester bar, and the tab content wrapper all fade in behind
`isHeaderReady`/`isDataReady` flags with `setTimeout(…, 50)` hacks. Separately, the semester
dropdown label flickers B→A→B on switch because selection state is duplicated: the click updates
React state instantly, then `useSemesterSelection`'s effect (still keyed to the old URL) resolves
the old name back, then the URL catches up.

**Changes.**

- `DashboardHeader.tsx`: delete `isHeaderReady` state, its 50 ms timeout, and the fade wrapper.
  The greeting schedule (time-of-day updates) stays.
- `DashboardLayout.tsx`: delete the `isDataReady ? "animate-fade-in" : "opacity-0"` wrapper on
  tab content; content renders as soon as it exists.
- `SemesterTabs.tsx`: delete the mount `animate-fade-in`.
- `useSemesters.ts`: delete `isDataReady` and its 50 ms timeout; keep `isLoading` for the
  first-load skeleton only.
- Semester selection becomes URL-first, one source of truth:
  - `DashboardLayout` owns the single semesters listener (list of `{id, name}` ordered by
    `order`); the active semester is the URL's `[semester]` id when present, else the first
    semester in the list. Name resolution is a synchronous `find` on the loaded list — the async
    `getDoc`/`getDocs` lookups in `useSemesterSelection` are deleted (hook merges into the new
    layout-level hook).
  - `SemesterTabs` receives the list + active id as props and renders; switching semesters is
    only a `router.push` to the same tab under the new id. The `onSelect` name-based
    backward-compat path is deleted.
  - The one-time `order` backfill migration effect moves with the listener.

**Keep** (feedback motion, allowed by standards): alert `fade-in-down`, the grades auto-save
indicator, `BulkActionsBar` and `AssessmentEditRow` fades, spinners.

**Acceptance.** Switching semesters never shows an intermediate label or skeleton re-flash once
the list is loaded; no content fade on tab/semester switches; first load still shows the
skeleton; no `setTimeout` remains in the touched files.

---

## Step 2 — Login persistence (auth pages redirect signed-in users)

**Problem.** Firebase already persists sessions locally by default (nothing opts out), but
`/login` and `/register` never check auth state — a signed-in user landing there (e.g. via the
landing site's Login button) sees the login form and reads it as "logged out".

**Changes.** `login.tsx` and `register.tsx`: while auth is loading render `LoadingScreen`; if a
user is present, redirect through the existing `redirectAfterAuth` flow (which already handles
the onboarding branch). Signed-out users see the form as before.

**Acceptance.** Signed-in user visiting `/login` or `/register` lands on the dashboard (or
onboarding) without a flash of the form; signed-out flow unchanged; closing and reopening the
tab keeps the session.

---

## Step 3 — Notes editor simplification + link-button fix

**Problem.** Two real bugs and dead weight:

- `AssessmentsTable.handleAddLink` is a stub that immediately calls `callback("", "")` —
  clicking "Add link" inserts an empty link and the dialog never opens.
- `RichTextEditor`'s fallback path stores a callback with `setLinkCallback(fn)` — React treats a
  bare function as a state updater, so the stored "callback" is garbage and the dialog's submit
  does nothing.
- `@tiptap/extension-underline` is installed with no toolbar button; text alignment is toolbar
  noise for a notes field; the `onAddLink` prop threads through three layers doing nothing useful.

**Changes.**

- Dependencies: remove `@tiptap/extension-underline` and `@tiptap/extension-text-align`.
  Remaining Tiptap: `react`, `starter-kit`, `extension-link`, `extension-placeholder`, `pm`.
- `RichTextEditor.tsx`: toolbar = bold, italic, bullet list, numbered list, link, undo, redo.
  Delete the `onAddLink` prop and `linkCallback` state. The link dialog is owned here: on
  submit, apply the link to the current selection if there is one, else insert the provided text
  (or the URL) as a link. Store nothing in state that isn't plain data.
- `NotesModal.tsx`: owns its draft (`useState` seeded from `assessment.notes`); props become
  `{ assessment, onClose, onSave(notes: string) }`.
- `AssessmentsTable.tsx`: delete `notesInput`, `handleAddLink`, and one of the two modal-tracking
  states; keep the empty-notes strip-and-null logic inside the save handler.
- `types/editor.ts`: update props accordingly.

**Acceptance.** Add link opens the dialog and produces a working link in both themes; notes
save/cancel round-trips correctly; clearing all text removes the `notes` field in Firestore;
`npm ls` shows the two extensions gone; build green.

---

## Step 4 — Standardize tab panels and empty states

**Problem.** The five tabs and the course-detail view differ in header structure, padding,
wrapper nesting, and empty-state treatment (a proper `EmptyState` component exists but
Assessments and CourseFilteredAssessments hand-roll copies; the Add tab uses a bare paragraph).
Copy drifts between "No X yet" / "No X found".

**Changes.**

- New `components/ui/PanelHeader.tsx`: `{ title, actions? }` — exactly ONE title line per header,
  no subtitles (refined during step 4 QA, 2026-07-16: subtitles made header heights inconsistent).
  The title sits on a fixed 40px line (`leading-10`) inside a `min-h-10` top-aligned row, so the
  title position is identical on every tab regardless of actions; wrapping action clusters grow
  downward. Calendar's month/year lives between the prev/next arrows (fixed-width slot); Grades'
  course subtitle was dropped as redundant with its dropdown. Used by all five tabs inside a
  uniform `p-6` panel; the extra wrapper divs in `GradesTab`/`AddTab` are removed.
- `EmptyState.tsx` restyle (the one recipe): small icon (`size-5`) centered in a `size-10`
  tonal circle (`bg-secondary` circle, `text-muted-foreground` icon), item-title tier title,
  body-tier description (`max-w-md`), optional single action; standard `py-12` (callers stop
  passing padding overrides).
- All empties route through `EmptyState`, copy on one formula — "No {things} yet" (or a state
  description like "No semester selected"), one supporting sentence, at most one action:
  - Courses: "No courses yet" + add-assessment action (switches to Add tab).
  - Assessments: "No assessments yet" + add-assessment action.
  - Course detail: "No assessments in this course yet".
  - Grades, no semester: "No semester selected".
  - Grades, no courses: "No courses yet" + add-assessment action (existing).
  - Add, no semester: "No semester selected" (replaces the bare paragraph).
- Filter-produced empties (e.g. filter returns nothing) keep "No assessments found" since
  things exist but match nothing.

**Acceptance.** All six surfaces share header anatomy and padding; zero hand-rolled empty-state
markup remains (grep `size-12` / `text-center` in tab components); copy matches the table above.

---

## Step 5 — Replace the icon avatar with an initials avatar

**Changes.**

- `Avatar.tsx` rebuild: `{ name?: string; size }` — first letter of the display name (fallback:
  email's first letter, then "U") on a tonal circle, amber selection language
  (`bg-primary/10 text-primary`), sizes unchanged.
- Delete: `IconPicker.tsx`, `AvatarPicker.tsx`, `data/profileIcons.ts`; uninstall `react-icons`.
- Remove `avatarIconId` end to end: `useUserProfile` (including the entire localStorage
  cache-for-flash effect), `UserSettings` state + Firestore write, `ProfileSection` picker UI,
  onboarding `ProfileStep`/`OnboardingContext`/`types/onboarding.ts`, `utils/onboardingUtils.ts`,
  `greetingUtils` type, and the `removeFromLocalStorage("avatarIconId")` calls in
  `AuthContext.logout` and `useUserProfile`.
- Existing `avatarIconId` fields in Firestore are ignored (no migration, no deletes).

**Acceptance.** Header and onboarding show initials avatars; `react-icons` gone from
`package.json`; grep for `avatarIconId`/`profileIcons` returns nothing; settings profile section
has no picker.

---

## Step 6 — Settings redesign (stacked sections)

**Problem.** `UserSettings` is a 314-line monolith: 15 `useState`s, a hand-written 12-field
dirty check, and legacy modal props (`isOpen`/`onClose`) from before settings became a page.
The page reuses the dashboard greeting header, which reads odd. The "System" theme option is
silently broken: `_app.tsx` still has `enableSystem={false}`.

**Changes.**

- `_app.tsx`: `enableSystem` → `true` (fixes System; `defaultTheme="light"` stays — zero drift).
- `settings.tsx` + `DashboardHeader`: header gets an optional `title` prop; when set it renders
  a static page title instead of the greeting/rotating subtitle (user menu stays). Settings
  passes "Settings"; the duplicated in-page `h1` goes; back button stays.
- Layout: one `max-w-3xl` column; Profile, Preferences, Notifications as stacked
  `rounded-xl bg-card shadow-soft` cards on one scroll. `SettingsNavigation.tsx` is deleted.
- Save semantics:
  - Preferences (theme + display toggles): apply and persist immediately on change (theme
    already does); failures surface an inline destructive alert. No Save button.
  - Profile and Notifications: each card is its own small form with its own Save button and
    per-card dirty check; success/error via the existing message pattern, scoped to the card.
- `UserSettings` state consolidates into one form object per card with a generic field setter;
  `isOpen`/`onClose` props deleted. `SettingsActions`/`SettingsMessage` shrink or fold into the
  cards, whichever leaves less code.

**Acceptance.** System theme follows the OS; toggles take effect without pressing Save and
persist across reload; profile/notification saves work per card; no greeting on settings; page
renders correctly in both themes and at mobile width.

---

## Step 7 — Icon minimalism pass + standards.md codification

**Changes.**

- Dropdown triggers show value + chevron only: remove the decorative `GraduationCap` (semester),
  `BookOpen` (grade course picker), `ListFilter` (assessments filter), and the active-filter icon
  in the calendar trigger.
- Menu options keep the selection check as the only leading glyph: the calendar status filter's
  per-option icons are removed. Action items (e.g. "Manage semesters") may keep one icon.
- Tab bar icons stay (navigation aids).
- `standards.md` additions (bump to v4.1, one changelog line): the icon rule (one icon max per
  element; icons carry meaning — selection, status, navigation — never decoration), the
  empty-state recipe, the panel-header recipe, the settings stacked-section layout + instant
  preferences rule, and a note that context-switcher state derives from the URL.

**Acceptance.** Triggers/menus match the rule; standards.md documents every new recipe
introduced by this effort; grep confirms no removed icon imports linger.

---

## Cross-cutting

- Verification loop after every step: `npm run lint && npm run format:check && npx tsc --noEmit
  && npm run build`, plus manual check in both themes and at mobile width.
- Comments that narrate ("// Update local state") are removed on touched lines; constraint
  comments stay.
- No commits or pushes by the agent; the founder owns git.

**Out of scope.** Landing page, upload/extraction pipeline, notification cron jobs, grade
calculator math, onboarding flow beyond the avatar removal.

---

## Addendum — found during step 1 QA (2026-07-16)

Fast semester switching surfaced a pre-existing crash: the grade calculator's auto-save fired on
data *arrival* (not just user edits) and paired whatever `data`/`semesterId` were current at
debounce expiry, so a quick switch wrote stale assessment ids under the new semester's path →
unhandled `FirebaseError: No document to update`. It also silently wrote every fetched row back
to Firestore on each load/switch.

Fix (step 1 scope): `useAutoSave` + `useDebounce` deleted; new `hooks/useAssessmentAutoSave.ts`
queues a debounced write per assessment only from `handleMarkChange`/`handleWeightChange`, with
the document ref captured at edit time. Save-status indicator semantics unchanged.
