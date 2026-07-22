# Dashboard chrome redesign — 2026-07-17

Redesign of the dashboard's chrome (header, semester switcher, tab navigation) and the Add
page. Goal: collapse three stacked, differently-styled chrome rows into one calm system;
stop presenting an action ("Add") as a place; give mobile a genuinely mobile navigation.
All work follows `standards.md` (v4.1); step 3 codifies the new recipes as v4.2.

Founder decisions locked during brainstorming (2026-07-17, visual-companion session):

- Greeting: dropped entirely — the brand (wordmark) anchors the app. Personality lives in
  empty states, onboarding, and the welcome email, not the chrome. Cheap to reverse later
  (a caption-tier greeting fits in the bar without moving anything).
  **Reversed during step 1 QA (2026-07-17):** the founder prefers no in-app branding — the
  marketing site owns the brand; the wordmark stays on auth pages only. The bar's left anchor
  is a one-line greeting instead ("Good morning, {name}", item-title tier, sentence case, no
  subtitle, no update timers — computed at render). Settings shows it too.
- Add: leaves the tab bar. It becomes the amber primary CTA in the chrome, navigating to the
  existing add surface (same URLs, same deep links). Four destination tabs remain.
- Desktop chrome: one bar + text-only underline tabs (concept A).
- Mobile chrome: slim bar + fixed bottom navigation with icons (concept B).
- Add page: upload dropzone as the hero with the manual form beneath one typographic rule —
  the Upload/Manual mode toggle dies (concept B).

Mockups from the session persist in `.superpowers/brainstorm/` (gitignored as of step 1).

---

## Step 1 — The chrome (bar + tabs, desktop + mobile + settings)

**Desktop anatomy (md and up).** Two rows on `bg-background` (no chrome surface — elements
separate by tone), inside the existing `max-w-7xl` container:

- **Bar row:** `Logo` (wordmark, first in-app use) · semester switcher · spacer ·
  primary "Add assessment" button · user menu (avatar + chevron; the name stays inside the
  menu, where it already lives).
- **Tab row:** Courses, Assessments, Grades, Calendar as text-only tabs. Inactive =
  `text-muted-foreground font-medium`; active = `text-foreground font-semibold` with a 2px
  amber underline (`border-primary`). The underline is the amber *selection* language, not a
  decorative border. No icons, no track, no box. `role="tablist"` semantics and `min-h-11`
  touch targets are retained.

**Mobile anatomy (below md).**

- Bar compresses: wordmark · truncated semester switcher · square amber `Plus` icon button
  (`aria-label="Add assessment"`) · avatar menu.
- Tabs move to a **fixed bottom navigation**: 4 items, icon (`size-5`) over caption-tier
  label, active in amber (`text-primary`), inactive `text-muted-foreground`. Surface is
  `bg-card` + `shadow-soft` (tone separation, no border), `pb-safe` for the home-indicator
  area, z-index below the overlay recipe's `z-150`. Content gets matching bottom padding so
  nothing hides behind it. Icons here are navigation aids (allowed by the icon rules).

**Component structure.**

- `DashboardHeader.tsx` is rebuilt as the bar. New props:
  `{ onLogout?, semesterProps?, onAddAssessment? }` — the semester switcher renders only when
  `semesterProps` is provided, the Add CTA only when `onAddAssessment` is provided. The
  greeting state, timers, and the step-6 `title` prop are deleted.
- `SemesterTabs.tsx` keeps its data logic and Manage-semesters modal unchanged; only its
  trigger restyles to a ghost control (semester name + chevron, value + chevron only per the
  icon rules) sized for the bar.
- `TabNavigationBar.tsx` renders both navigations: the underline tab row (`hidden md:flex`)
  and the bottom nav (`md:hidden`, fixed). It stays the single consumer of the TABS array;
  icons remain in the array for mobile use.
- `DashboardLayout.tsx`: the standalone `SemesterTabs` row disappears — semester props pass
  into `DashboardHeader` instead; the layout provides `onAddAssessment` (it sits inside
  `TabProvider`, so it can call `setActiveTab("add")`); mobile bottom padding added. Tab
  state mechanics, URL structure, and deep links are untouched — `/add` still resolves; the
  CTA drives the exact navigation the old fifth tab did.
- **Settings page:** renders `DashboardHeader` with neither `semesterProps` nor
  `onAddAssessment` — bar shows wordmark + user menu only. It regains a normal in-page
  "Settings" `h1` (page-title tier) above the back button, and never shows the bottom nav.
- **Deleted:** `src/utils/greetingUtils.ts` entirely (greeting, rotating subtitles,
  time-of-day scheduling). `useUserProfile` stays — the avatar still prefers the Firestore
  `displayName`.

**Acceptance.** Desktop shows exactly two chrome rows and content starts higher; no greeting
anywhere; semester switching and Manage semesters work from the bar; the CTA lands on the add
surface; tabs switch identically to today incl. keyboard access. Mobile shows the bottom nav
with safe-area padding, no content hidden behind it, and overlays render above it. Settings
shows the slim bar, an in-page title, and no bottom nav. Grep for `greetingUtils`,
`getPersonalizedGreeting`, `getRotatingSubtitle` returns nothing.

---

## Step 2 — The Add page (upload hero, manual beneath)

- `AddTab` (in `UnifiedDashboardPage.tsx`) drops its `addMode` state and the inner segmented
  toggle. One scroll inside the existing `p-6` panel:
  1. `PanelHeader` title becomes "Add assessments" (plural — the page covers both paths).
  2. `UploadForm` as the hero, full behavior unchanged (drag-drop, processing states,
     extraction results modal, rate limiting).
  3. A typographic rule — centered caption "or add one manually" between two hairlines
     (`--border` used as a typographic rule, its legitimate purpose).
  4. `AddAssessmentForm` in its compact form.
- Duplicate internal headings between the panel header and the two forms are removed during
  implementation so the page reads as one surface (exact lines resolved in the plan).
- The no-semester empty state is unchanged.

**Acceptance.** No mode toggle exists; both paths are visible on one scroll in both themes
and at mobile width; an upload round-trips through extraction results exactly as before; the
manual form still validates and adds.

---

## Step 3 — standards.md v4.2 codification

One changelog line plus:

- **The chrome recipe:** bar anatomy (wordmark · context switcher · spacer · primary action ·
  user menu), underline-tab recipe, bottom-nav recipe with breakpoint and z-order, and the
  rule that actions never pose as navigation (the Add-as-CTA decision).
- Supersede the old segmented tab-bar recipe and amend the v4.1 icon-rules line "tab-bar
  icons stay" → icons live in the mobile bottom nav only; desktop tabs are text-only.
- Note the greeting's removal and the settings in-page title (replacing the header `title`
  prop noted in v4.1's settings recipe).

**Acceptance.** standards.md describes the shipped chrome; no stale references to the pill
tab bar, header greeting, or header `title` prop remain.

---

## Cross-cutting

- Verification loop after every step from `asetta/`: `npm run lint && npm run format:check &&
  npx tsc --noEmit && npm run build`; manual QA in both themes and at mobile width; founder
  QA + commit between steps (agent never runs git).
- Step 1 adds `.superpowers/` to `asetta/.gitignore`.
- Comments that narrate are removed on touched lines; constraint comments stay.

**Out of scope.** Routing/URL changes, stats-bar redesign, panel internals (PanelHeader,
EmptyState, tables, calendar), onboarding, auth pages, the landing site.
