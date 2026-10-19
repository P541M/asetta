# Asetta Engineering & Design Standards

**This file is the single source of truth for code norms and UI styling/theming on the main
platform.** Read it before writing or reviewing any code. If a change conflicts with this file,
either the change is wrong or this file must be updated in the same change; never let them drift.
It holds current rules only; history lives in the `docs/AUDIT.md` session log and in git.

---

## Part 1: Code standards

All new code follows these.

### Architecture & file layout

- **Pages are thin.** Files in `src/pages/` wire routing to components; they contain no business
  logic beyond auth/redirect glue.
- **Components own markup, hooks own data.** Firestore reads/writes live in `src/hooks/` (client)
  or `src/lib/` (server/API); components receive data and callbacks.
- **One responsibility per file; ~300 lines is the smell threshold.** When a component grows past
  it, split into a folder: `ComponentName.tsx` stays the public coordinator, subparts live in a
  same-named folder (see `tables/assessments/`, `assessment/semester-tabs/`,
  `assessment/grade-calculator/`, `components/auth/`).
- **The user doc is read once, live.** `hooks/useUserDoc.ts` keeps one `onSnapshot` on
  `users/{uid}` for the session (`hooks/userDocListener.ts`, which it loads on sign-in; see the
  next rule), and `AuthContext` derives the profile, display preferences and
  onboarding status from it: read them from `useAuth()`, never with a `getDoc` of your own. The
  sign-in writes run on the server's first answer: the doc is created only when the server says
  it is missing (an offline cache can't, or the app would write a new doc over the real one),
  `lastLogin` at most once per local day, and the zone when it is missing or has changed.
- **`_app` ships Firebase Auth, never Firestore** (A15). `lib/firebase.ts` holds the app and
  Auth; `db` lives in `lib/firestore.ts`, which nothing in `_app`'s import graph (`AuthContext`,
  `useUserDoc`, what they import) may import statically. Firestore code those files need loads
  with `import()` when it runs: the user-doc listener on sign-in, the sign-in redirect's
  onboarding read. So does a page that reads Firestore only once the user doc is in
  (`/dashboard`'s first-semester lookup, `hooks/firstSemester.ts`). Lazy-load a module of your
  own with named imports, never `import("firebase/firestore")` itself: the namespace stops
  webpack from tree-shaking Firestore, which added 30 kB to every page that uses it. After
  changing what `_app` or a page imports, compare `npm run build`'s First Load JS with the
  Baseline in `docs/AUDIT.md`.
- **The dashboard's assessments come from one live listener** (`useSemesterAssessments`,
  passed down as `DashboardData`). Tabs derive their views from it; no tab reads assessments
  with `getDocs` or refreshes another tab by hand. Listing docs in order to write them (course
  rename, semester delete) is the only exception.
- **Each dashboard tab is its own chunk** (`next/dynamic` in
  `components/pages/UnifiedDashboardPage.tsx`, the tabs in `components/pages/dashboard-tabs/`),
  so a dashboard page loads only the chrome up front. The open tab's chunk is fetched at mount,
  while auth and the data load; the other tabs render hidden once the data is in, which fetches
  theirs, and they stay mounted. A tab still loading shows nothing for 200 ms, then the spinner.
  Heavy UI behind a click (the notes editor, Manage semesters' drag list, fetched when the
  semester menu opens) is a `next/dynamic` part of its surface too.
- **No writes on read.** Viewing something never creates or updates a doc; a missing value falls
  back to its default when read (course preferences, course colors).
- **User text never goes into a Firestore path as is.** A "/" adds path segments: one makes
  `doc()` throw, two land on a nested path no rule matches. A course's `coursePreferences` doc is
  reached only through `getCoursePreferencesDocRef`, whose ID is `coursePreferencesDocId`
  (`utils/courseName.ts`): the name itself when Firestore takes it as one ID and it doesn't start
  with `%` (every doc written before A13 keeps its ID), otherwise `%` plus the name with `%`
  written as `%25` and `/` as `%2F`. Turn a listed doc's ID back into the name with
  `courseNameFromPreferencesDocId`. Course names may hold any character.
- **Every client write passes the Firestore rules' allow-list** (`firestore.rules`): each
  collection lists the keys a client may write, with a type and a size cap. A new field the
  client writes needs a rules change and a case in `src/rules/firestore.rules.test.ts`
  (`npm run test:rules`), and the rules deploy after the app (`docs/ops.md`). Write only the
  fields you mean to change, never a whole object read back from Firestore (the old edit row
  wrote the doc's own `id`).
- **A failed load shows an error state, never a spinner that waits forever.** A page that needs
  the user doc returns `ui/LoadErrorScreen` on `userDocError` (the dashboard layout, Settings,
  onboarding). It stays out of `_app`, where its UI imports would land in every page's shared
  bundle. Code that fails to load counts as a failed load: the user-doc listener's chunk ends in
  the same screen (and loads again when the browser comes back online), and a dashboard tab or
  the semester list shows an error with "Try again" (`next/dynamic`'s `retry`).
- **Pure logic goes in `src/utils/`** as typed, testable functions (see `gradeCalculations.ts`).
  Shared constants go in `src/constants/` (see `isCompletedStatus` — never re-inline
  `["Submitted", "Missed"]`).
- **Shared visuals**: inline SVGs used more than once go in `src/components/ui/icons.tsx`;
  full-screen loading uses `LoadingScreen`; auth-page chrome uses `components/auth/*`.

### Conventions

- TypeScript strict; no `any` in new code (parsed JSON at API boundaries is the one exception,
  validated immediately).
- Prettier (printWidth 100) is enforced: `npm run format -w apps/web` writes fixes. ESLint must
  stay at zero warnings.
- `console.error`/`console.warn` for real failures only; dev-only logging via `utils/devLog.ts`;
  no informational `console.log`.
- No dead code: unused exports, unreachable branches, and "just in case" props get deleted, not
  commented out. (Deliberate exception: `src/pages/index.tsx` is kept as a redirect safety net.)
- Comments explain constraints the code can't express (see the adjust-state-during-render note in
  `components/pages/dashboard-tabs/GradesTab.tsx`), never narrate what the next line does.

### API routes and server code

- **Authenticate before reading the body.** Verify the `Authorization: Bearer <ID token>` with
  firebase-admin first, so an unauthenticated request never gets parsed or written to disk.
  Act only on the identity in the token (its uid and email), never on a uid or email address
  from the body.
- **Validate every input** at the boundary: method, types, lengths, and path-segment safety for
  anything used in a Firestore path (no `/`). Reject with a 4xx and a short message.
- **Server-only state is written with the admin SDK** into collections no client rule matches
  (e.g. `welcomeEmails/{uid}`, `cronRuns/{date}`, `emailVerifications/{uid}`), or into a user-doc
  field the rules leave out of the client's list (`verifiedEmail`). Client-writable fields on the
  user doc are never trusted as a server guard.
- **Email goes only to an address its owner proved** (A17): reminders use the chosen `email` only
  when it is the account's own or equals `verifiedEmail` (`utils/notificationEmail.ts`), else the
  account email. Addresses saved before A17 count as confirmed (D11, set once by the cron). A link in an email that changes state opens a page whose button POSTs; the GET
  changes nothing, because mail scanners fetch links. Its token is random, stored only as a hash,
  expires, works once, and its sends are capped (`lib/emailVerification.ts`).
- **Log real failures with `console.error`** (no email addresses or other personal data in
  logs; uids and error codes are fine). `devLog`/`devError` print in development only, so they
  never carry a production failure.
- **Escape every user value in email HTML** with `utils/escapeHtml.ts` (see "Email" in Part 2).
- Secrets come from env vars only (the matrix is in `docs/ops.md`); a route whose secret is unset
  fails closed and logs that it is unset (see `pages/api/cron/notifications.ts`).
- **Delete what the request wrote to disk** in a `finally`, on success and failure alike
  (formidable's temp files in `pages/api/upload.ts`).
- **A scheduled job records each run** in Firestore (the reminder cron's `cronRuns/{date}`),
  because Vercel Hobby keeps logs for 1 hour. A failed side effect is recorded as failed and
  retried, never marked done.
- **A job is safe to run twice and to overlap with itself**: claim each side effect atomically
  before doing it (a transaction, or `create()` as in `welcomeEmails`), record the outcome, and
  cap the retries. The reminder cron's guard is its server-only `notifications/{id}` records
  (`lib/reminderCron.ts`); `nextReminderAt` and `timeZone` on the user doc are client-writable
  scheduling hints, never a guard.

### Testing

- **Vitest, in `apps/web` only**, in the node environment (`apps/web/vitest.config.ts`). `npm test`
  from the root runs every suite; it is part of the verification loop and of CI.
- **What gets tests:** pure logic in `utils/`, `constants/` and the pure parts of `lib/`. Logic
  that lives in a component or next to Firestore calls is extracted into a pure function first,
  then tested. There are no component or network tests yet.
- **The Firestore rules have an emulator suite**, `src/rules/firestore.rules.test.ts`, run by
  `npm run test:rules` (its own `vitest.rules.config.ts`; `npm test` leaves it out because it
  needs the emulator). Each case copies a write the app makes, with a comment naming where it
  lives, so change both together; add a deny case for anything the rules must refuse.
- **Files:** `<module>.test.ts` next to the module (`utils/dateUtils.test.ts`), never under
  `src/pages/` (every file there becomes a route). Shared fixtures live in `src/test/` and are
  imported through the alias (`@/test/assessments`).
- **Every suite runs in two time zones**, `America/Toronto` and `Asia/Kolkata` (the config's
  `projects` set `TZ`), so a test must pass in both. Build dates with the local constructor
  (`new Date(2026, 2, 8, 9, 30)`), never UTC strings, and leave zone-specific offsets to the zone
  checks at the top of `utils/dateUtils.test.ts`. A function that takes the zone as a parameter
  (`lib/reminderSchedule.ts`) is the exception: it is tested with absolute instants
  (`Date.UTC(...)`), the same moment in both runs, across zones of its own (Auckland, UTC).
- **"Now" is never the real clock**: use `vi.useFakeTimers()` with `vi.setSystemTime()`, or the
  function's `now` parameter. Day counts get cases on both 2026 DST weekends (Mar 8 and Nov 1).
- **Known bugs are `it.fails`**: assert the correct result and name the `docs/AUDIT.md` item
  (`it.fails("A10: ...")`). The fix turns it into a plain `it`; Vitest fails an `it.fails` that
  starts passing, so it can't be left behind. An `it.fails` also passes when the test throws for an
  unrelated reason, so run a new one once as a plain `it` and check it fails on its assertion. Use
  `it.todo("A10: ...")` when the fix lives outside the function under test or isn't designed yet.
  Never assert a known bug as correct behavior.
- **A logic fix starts with a failing test** (the items marked test-first in `docs/AUDIT.md`).
- **Assert user-facing copy loosely** (`toContain` on its key words), so a copy edit doesn't break
  a logic test; assert values, dates and thresholds exactly.

### Verification loop (every task, no exceptions)

From the repo root:

```
npm run lint && npm run format:check && npm run typecheck && npm test && npm run build
```

All five green before work is called done. CI (`.github/workflows/ci.yml`) runs the same steps on
GitHub. On Windows, stop any dev server first (`docs/ops.md`).

`next lint` prints a deprecation warning on Next 15.5 (it is removed in Next 16); the move to the
ESLint CLI is A25 in `docs/AUDIT.md`.

---

## Part 2: UI system (shadcn/ui on Tailwind v4)

Every screen is built on **shadcn/ui** primitives on **Tailwind CSS v4**, styled only with the
semantic tokens below. There is no legacy styling left to preserve.

### Tailwind v4 conventions

- There is **no `tailwind.config.ts`** — all theme configuration lives in
  `src/styles/globals.css` (`@theme`, `@theme inline`, `@utility`, `@custom-variant`).
- Class-based dark mode is wired via `@custom-variant dark (&:is(.dark *))` — do not remove it;
  without it v4 falls back to system-preference and the toggle silently breaks.
- Standalone CSS files that use `@apply` must start with `@reference "./globals.css";`
  (see `rich-text-editor.css`).
- v4 renamed some utilities (`shadow-sm`→`shadow-xs` era names, `rounded`→`rounded-sm`,
  `outline-none`→`outline-hidden`); write the v4 names.
- v4 borders default to `currentColor`: always state the border color explicitly
  (`border-border`).
- **Clickable always shows the pointer cursor** (2026-07-22). v4's preflight stopped setting
  `cursor: pointer` on buttons; `globals.css` restores it for `button:not(:disabled)` and
  `[role="button"]:not(:disabled)`, and `DropdownMenuItem` is `cursor-pointer`. Don't add
  per-element `cursor-pointer` to buttons/role-button elements (the base rule covers them);
  clickable non-button elements (e.g. calendar day cells) state it explicitly.

### Surface language (locked 2026-07-14 — the "premium minimal" rules)

Adopted from the landing design system — **directionally, not verbatim**. The landing sells;
the platform is a daily tool. When they conflict, the platform chooses calm cohesion over
marketing flourish (founder decision, 2026-07-14: e.g. no entrance animations here). These rules
are what make Asetta look like Asetta and not a default shadcn app:

- **No decorative borders.** Surfaces separate by *tone shift* (`background` vs `secondary` vs
  `card`), never by hairlines. `--border` exists for true structural rules only (table row
  dividers, typographic rules).
- **Inputs are filled, not outlined**: resting on the `--input` tonal fill, borderless; focus
  lifts to `card` with a 2px amber ring. Never add borders back to form fields. Exception
  (founder call 2026-07-16): large writing canvases (the notes rich-text editor) keep the tonal
  fill with **no** focus ring — a persistent ring around a writing surface reads as noise.
- **Buttons are flat fills**: `default` (amber, hover darkens via `--primary-hover`),
  `secondary` (tonal, hover deepens via `--accent`), `ghost`, `link`, `destructive`.
  **There is no `outline` variant** — boxed/bordered buttons don't exist in this language; pair
  one primary CTA with a ghost/secondary, never two boxed buttons.
- **No gradients, glows, badges-as-decoration, or fixed-dark sections.** Brand surfaces (e.g. the
  auth panel) are tonal bands that follow the active theme.
- **Headings are solid `foreground`** — no colored/highlighted words. Amber appears only on
  primary buttons, the logo, links, and focus rings.
- **Shadows**: `shadow-soft` for elevated cards/panels; nothing heavier without a reason.
- **Copy**: sentence case, quiet voice; the root `CLAUDE.md` copy rule applies.

### Forms & auth patterns (locked 2026-07-14)

- **Every field declares `autoComplete`** (`email`, `current-password`, `new-password`, …) so
  password managers and autofill work; the first field of a single-purpose page gets `autoFocus`.
- **Password fields use `PasswordInput`** (`ui/password-input.tsx`) — the show/hide toggle is
  standard. **No confirm-password fields**: visibility replaces confirmation (dropped from
  register 2026-07-14).
- **Users never see raw error codes.** All auth failures route through
  `utils/authErrors.ts` → human messages; deliberate cancellations (closing the Google popup)
  show nothing at all.
- **One-shot actions get a success state, not an emptied form** (see reset-password's
  "Check your inbox" view).
- Inline requirement feedback (password criteria) is compact — small type, two-column grid,
  checks animate in as rules are met.
- **Native number spinners are hidden at the `Input` primitive** (2026-07-22) — they never
  match the filled-input language; don't re-add per-field spinner CSS.
- **Numeric fields that live-parse keep the raw string in the field while focused**
  (`assessment/grade-calculator/NumberField.tsx`): the parent owns parsed/clamped numbers,
  the field snaps to canonical on blur. Controlling an input with a value reformatted on
  every keystroke ("12." re-rendering as "12") resets the caret — the 2026-07-22
  cursor-jump lesson.

### Motion

- **No entrance animations on app screens.** Fade-up reveals belong to the marketing site; the
  platform is a tool people open many times a day — screens appear instantly. Motion is reserved
  for *feedback*: responses to a user action (a criteria check turning on, button press states),
  always behind `motion-safe:`.
- **Alerts appear instantly, no drop-in fade** (founder decision 2026-07-22 — the "drop-in fader,"
  `fadeInDown`, read as cheap and was firing even on static banners that aren't feedback to any
  action). `ui/alert.tsx` has no entrance animation in its base class; this applies to every Alert
  everywhere, including conditional error/success/rate-limit notices — same instant-appearance
  rule overlays already followed.
- **Micro-motion stays under ~150ms** (2026-07-22): the `@theme` animation tokens are
  fade-in 150ms / scale-in 120ms, and control transitions (buttons, inputs, chevrons) run at
  150ms. Longer durations are reserved for genuine progress/timer animation (progress bars,
  the rate-limit countdown), never for feedback — anything slower reads as lag.
- **Theme switching**: `ThemeToggle` cross-fades the page via the View Transitions API (skipped
  under `prefers-reduced-motion`, falls back to instant). `disableTransitionOnChange` stays ON in
  `ThemeProvider` — per-element CSS transitions during a theme flip cause mismatched fades; the
  crossfade must come from the View Transition only.
- Toggle icons swap with pure CSS (`dark:` visibility), never a mounted-state guard — that guard
  causes the pop-in flicker.

### Theme tokens (locked 2026-07-14)

Defined in `globals.css` (`:root` = light, `.dark` = dark) and mapped to utilities via
`@theme inline`. Change them there and in this table together.

| Token | Light | Dark | Notes |
| --- | --- | --- | --- |
| `--background` | `#FAFAFA` | `#141414` | page background (soft dark, not near-black) |
| `--foreground` | `#1A1A1A` | `#F5F5F4` | primary text |
| `--card` / `--popover` | `#FFFFFF` | `#1E1E1E` | elevated surfaces |
| `--muted` / `--secondary` | `#F0EFED` | `#292929` | tonal fills (sit ON page or card — must contrast with both) |
| `--accent` | `#E9E7E4` | `#333333` | hover tone (one step deeper/lighter) |
| `--input` | `#F0EFED` | `#292929` | **input resting fill** (inputs are borderless) |
| `--muted-foreground` | `#6B6B6B` | `#A6A6A6` | secondary text |
| `--primary` | `#D97706` | `#F59E0B` | Asetta amber |
| `--primary-hover` | `#B45309` | `#D97706` | primary button hover (darkens) |
| `--primary-foreground` | `#FFFFFF` | `#1A1A1A` | text on primary |
| `--destructive` | `#DC2626` | `#EF4444` | errors, deletes |
| `--success` | `#059669` | `#10B981` | success alerts, met criteria |
| `--border` | `#E5E5E5` | `#2E2E2E` | structural rules only (no decorative borders) |
| `--ring` | `#D97706` | `#F59E0B` | focus rings |

**Dark-mode elevation ramp**: four distinct steps — `#141414` page → `#1E1E1E` surface →
`#292929` fill → `#333333` hover. Soft (no near-black against mid-grey) but every adjacent pair
must remain visibly distinct: a fill must read against both the page AND a card (2026-07-14
lesson: the tab pill and its track were both `#1E1E1E` — invisible selection). Interactive
selection states prefer the amber tint (`bg-primary/10 text-primary`) over surface swaps, which
stays visible in both themes by construction.

**Radius ladder** (no `--radius` indirection — we use the platform's existing scale):
`rounded-lg` (0.5rem) for controls (buttons, inputs), `rounded-xl` (1rem) for cards/tiles,
`rounded-2xl` (1.5rem) for large panels. The xl/2xl/3xl values are legacy overrides kept in
`@theme`.

**Type**: Manrope everywhere (`--font-sans`/`--font-heading`); headings `font-semibold
tracking-tight` in **sentence case** ("Welcome back", not "Welcome Back").

### Type ramp (locked 2026-07-15)

Five tiers; every piece of text in app code states its tier explicitly. If text doesn't fit
a tier, the ramp is wrong — update it here, don't invent a sixth size at the call site.

| Tier | Classes | Used for |
| --- | --- | --- |
| Page title | `text-2xl md:text-3xl font-semibold tracking-tight text-foreground` | one per screen: auth headings, the settings in-page title |
| Section heading | `text-xl font-semibold tracking-tight text-foreground` | panel headings ("Assessments") |
| Item title | `text-base font-semibold text-foreground` | the app-bar greeting, card titles (mobile assessment cards, course cards), empty-state titles, overlay titles |
| Body | `text-sm text-foreground`; `font-medium` for emphasis and control labels; `text-muted-foreground` for supporting text | the app default: table cells, buttons, menus, form labels, descriptions |
| Caption | `text-xs font-medium text-muted-foreground` | column headers (add `uppercase tracking-wider`), counts, stat labels, timestamps |

- **Stat/display numbers**: `text-xl md:text-2xl font-semibold text-foreground` (numbers, not
  headings — no tracking-tight needed).
- **Two weights only** in app UI: `font-medium` (emphasis) and `font-semibold` (titles). No
  `font-bold`, no `font-light`.
- `text-base` appears ONLY as item titles (and the 16px input text that prevents iOS zoom) —
  running app text is `text-sm`. The content hierarchy decides the tier: the row's entity (the
  assignment) is the emphasized text, its grouping labels (course) are supporting.
- The `h1`–`h6` base styles in `globals.css` are retained as a semantic baseline (they use
  `text-foreground` + the tier sizes) so bare headings — e.g. rich-text notes content — render
  sensibly; components still set their tier classes explicitly rather than relying on it.
- Deliberate exception: the auth brand panel hero (`text-5xl/6xl`) is marketing-scale on purpose
  (shared with the landing); nothing inside the app uses it.

### Component rules

- **shadcn primitives live in `src/components/ui/` with lowercase filenames** (`button.tsx`,
  `input.tsx`, `dropdown-menu.tsx`, ...), the shadcn CLI convention. PascalCase files in the same
  folder (`EmptyState.tsx`, `PanelHeader.tsx`, ...) are shared app components built on those
  primitives; the casing makes the distinction visible at a glance.
- **Customize centrally, never at call sites.** Asetta's look is achieved by editing the variant
  definitions inside the primitive files (cva variants) and the theme tokens — *not* by piling
  override classes onto `<Button className="…">` at usage sites. If a call site needs more than
  layout classes (width/margin/grid placement), the variant is missing and must be added to the
  primitive.
- **Use the `cn()` helper** (`src/lib/utils.ts`, clsx + tailwind-merge) for all conditional
  class composition. No template-literal class concatenation in new code.
- **Composition over duplication**: build app-level components (e.g. `AuthShell`) *from*
  primitives (`Button`, `Input`, `Label`, …); don't fork primitive markup.
- **The notes editor stays slim** (founder call 2026-07-16): Tiptap with StarterKit + Link +
  Placeholder only (`components/editor/RichTextEditor.tsx`). Underline and text-align were
  removed on purpose; adding an extension needs a founder decision.

### Icons (locked 2026-07-16)

- **One icon max per element** (a button, a dropdown trigger, a menu item). Icons carry
  meaning — status (status chips, the save indicator), navigation (tab bar, chevrons, back
  arrows) — **never decoration**.
- **Dropdown triggers show value + chevron only.** No leading glyph next to the current value
  (the semester switcher, course picker, and filter triggers all lost theirs in the 2026-07
  housekeeping pass).
- **Selected menu items get a highlighted background, not a checkmark** (founder decision
  2026-07-22, supersedes the prior "selection check" recipe — the check cost an icon slot and a
  layout gutter for a state a tint communicates better). `DropdownMenuItem` accepts
  `data-selected`, styled `bg-primary/10 text-primary` — the same amber-tint recipe already locked
  for selection under "Theme tokens," never a plain `bg-accent` swap (indistinguishable from the
  item's own hover/focus state). Action items in the same menu (e.g. "Manage semesters") may keep
  one identifying icon.
- **Menu items are separated by a subtle gap** (`space-y-1` on `DropdownMenuContent`, defined in
  the primitive) so hover/selection tints read as discrete pills and never bleed into each other.
- Navigation icons live in the **mobile bottom nav only** (navigation aids, not decoration);
  desktop tabs are text-only underline tabs (v4.2, supersedes the v4.1 "tab-bar icons stay"
  rule that described the retired pill tab bar).
- Empty states show one icon by recipe (see "Tab panels & empty states").

### Theming rules

- **New code uses semantic tokens only**: `bg-background`, `text-foreground`,
  `text-muted-foreground`, `bg-primary`, `border-border`, `ring-ring`, etc. Never raw palette
  classes (`text-gray-600`, `bg-amber-100`) and never the legacy `light-*`/`dark-*` pairs.
- **Semantic tokens are CSS variables** defined once in `globals.css` for `:root` (light) and
  `.dark` (dark). Because tokens flip with the theme, new components need **no `dark:` variants**
  except for genuinely asymmetric cases (e.g. shadows that only exist in light mode).
- **Exact token values are locked** in the "Theme tokens" table. Brand anchor: Asetta amber
  (`#D97706` light / `#F59E0B` dark) as `--primary`.
- **No legacy styling.** The old `light-*`/`dark-*` token families and the `.btn-*`/`.input`/
  `.form-*`/`.card*`/`.badge*`/`.modal-*` utilities no longer exist; reintroducing any of them is
  a regression. Reach for a semantic token or a `ui/` primitive. What `globals.css` holds is
  intentional: semantic tokens, the radius/shadow/font/animation `@theme` scales, safe-area
  utilities, scrollbar styling, the `h1` to `h6` baseline, and the SVG logo filters.

### Dark/light mode rules

- Strategy: class-based (`.dark` on `<html>` via `@custom-variant`), managed by **next-themes**
  (`ThemeProvider` in `_app.tsx`, `defaultTheme="light"`). It owns the no-flash pre-hydration
  script and persistence (`theme` key); `_document.tsx` carries only the one-time seed that
  migrates the legacy `darkMode` key.
- **Theme is a Light / Dark / System choice** set in Settings → Preferences (the radiogroup on the
  amber selection language). It applies **immediately** via `setThemeWithTransition` (`utils/theme.ts`)
  — the crossfade, not a Save round-trip. `defaultTheme` stays `"light"` on purpose: System is an
  explicit opt-in, so no existing user's appearance changes without their action (zero-drift).
  When rendering UI keyed off the selected theme, guard the highlight with a mounted flag (theme is
  undefined pre-hydration) but always render the controls so layout doesn't shift.
- **Never** read/write theme localStorage directly and **never** touch
  `document.documentElement.classList` manually — `useTheme()` from next-themes is the only API.
- A surface that is deliberately the same in both themes (e.g. the auth brand panel) opts in by
  putting the `dark` class on its root element — tokens inside then resolve to dark values.
- Components must render correctly in both themes *by construction* (semantic tokens). Any
  `dark:` override in new code needs a comment justifying it.

### Quality bar for every screen

- Keyboard: visible `focus-visible` rings on all interactive elements; logical tab order.
- Existing `aria-label`s and form semantics are preserved or improved, never dropped.
- Touch targets ≥ 44px on mobile (existing platform convention).
- Motion is subtle and respects `prefers-reduced-motion`.
- Manually verified in **both themes** and at mobile width before the task is called done.

### Theme control and context switchers

**Placement rule for the theme control** (founder decision, 2026-07-14): the light/dark
`ThemeToggle` is on auth pages only; inside the app, theme lives ONLY in Settings → Preferences
(the Light/Dark/System selector), not in the header or user menu. Theme is a set-and-forget
preference, not a daily control.

**Selector pattern** (founder decision, 2026-07-14): context switchers (semester, and future
course/term pickers) are a single dropdown control: current value + options, the selected one
tinted per "Icons" (no checkmark), + related actions (add/manage) in one menu. No pill rows with
satellite icon buttons.
Context-switcher state derives from the URL: the active semester is the `[semester]` route
segment (first semester when absent), switching is just a `router.push`, and selection state is
never duplicated into component state (the source of the 2026-07-16 flicker fix).

### The chrome (locked 2026-07-17, codified 2026-07-22)

- **One bar anchors the app** on `bg-background` (no chrome surface — tone separation), inside
  the `max-w-7xl` container: greeting · semester switcher · spacer · primary "Add assessment"
  CTA · user menu (avatar + chevron). No in-app branding — the wordmark lives on auth pages
  only (founder decision 2026-07-17; the marketing site owns the brand).
- **The greeting is item-title tier** (`text-base font-semibold`), one line, sentence case,
  computed at render (no timers), with a hidden-on-mobile ` · {date}` suffix in body-tier
  muted. It anchors the bar; it is NOT the page title.
- **Desktop tabs are text-only underline tabs**: inactive `text-muted-foreground font-medium`,
  active `text-foreground font-semibold` + 2px `border-primary` underline (the amber selection
  language, not a decorative border). `role="tablist"`, `min-h-11` targets.
- **Mobile navigation is a fixed bottom bar**: 4 items, `size-5` icon over caption-tier label,
  active `text-primary`; surface `bg-card shadow-soft` with `pb-safe`, z-40 (below the overlay
  recipe's z-150). Content keeps matching bottom padding (`pb-24`) so nothing hides behind it.
- **Actions never pose as navigation**: "Add" is the chrome's primary CTA, not a fifth tab.
- **Chrome spacing**: the content wrapper under the bar uses `pt-2` so the bar and tab row read
  as one chrome unit; content below separates with `mt-6` steps. Safe-area top offset lives on
  the header (`mt-safe`), not the content wrapper.

### Assessments table (locked 2026-07-22)

- **One grid template, three consumers.** The desktop column tracks live in
  `tables/assessments/tableGrid.ts` (`assessmentGridClass(showWeight)`); the header, read rows,
  and edit rows must all consume it — never re-declare columns, or headers drift off their data.
  Columns: checkbox · status · course · task · due · (weight) · actions.
- **Headers are caption tier** (`text-xs font-medium uppercase tracking-wider`); the actions
  column has **no header label** (icon buttons are self-describing); numeric columns (weight)
  are right-aligned `tabular-nums` in both header and cells.
- **The task is the row's emphasized text** (`text-sm font-medium text-foreground`); its
  grouping label (course) is supporting (`text-sm text-muted-foreground`) — the content
  hierarchy rule from the type ramp, applied to tables.
- Rows are tonal cards (`rounded-xl bg-secondary/50`), `p-4` on mobile, tightened to `lg:py-3`
  on desktop; status chips render at the `sm` size and stretch to the status track so the chip
  column reads as a uniform rail.
- **List rows hover with `transition-colors hover:bg-accent/50`** — the shared row-hover recipe
  (grades breakdown, assessment rows, overlay list rows). Full `hover:bg-accent` is reserved
  for clickable *cards* that navigate (course cards).
- **The course-filtered view titles the panel with a breadcrumb**: "Courses / {course}" as the
  `PanelHeader` title — the parent crumb is a muted text button (`text-muted-foreground
  hover:text-foreground`) that navigates back, the current name truncates. No separate back
  row; `PanelHeader.title` accepts a ReactNode for exactly this.
- **Urgency labels and tints come from `utils/urgency.ts`** (`daysUntilLabel`,
  `urgencyTextClass`, `urgencyChipClass`) — shared with the course cards; never re-derive the
  thresholds (≤3 destructive, ≤7 primary, else neutral).
- **Due dates are local calendar days** (2026-09-24): day counts come from `getDaysUntil`
  (`utils/dateUtils.ts`), which counts calendar days in the viewer's timezone (due tomorrow is
  "Due tomorrow" at any hour) and goes negative once the due moment passes. Stored
  `dueDate`/`dueTime` pairs are parsed only via `parseLocalDateTime`, never
  `new Date("YYYY-MM-DD")` (UTC midnight, the wrong local day for most users) or
  `` new Date(`${date}T${time}`) `` (Safari's strict parser rejects unpadded times). The one
  exception is the ICS export (`utils/icsGenerator.ts`): it writes floating wall-clock time, so
  it does its date math in UTC, where no DST gap can shift it. On the server, which has no
  viewer, a stored date and time become an instant only in `lib/reminderSchedule.ts`, in the
  user's stored `timeZone`; it is the only module that imports the time zone library
  (`@date-fns/tz`). Anything
  that renders time-relative text reads the clock from `hooks/useNow` (ticks each minute and on
  tab wake), so labels on a page left open overnight stay true.
- **Extracted assessments are stored only through `normalizeExtractedAssessment`**
  (`lib/upload/normalize.ts`), for Gemini and the regex fallback alike: a real calendar
  `dueDate`, a padded 24-hour `dueTime`, a weight from 0 to 100, trimmed and capped names. An
  assessment without a usable date (unreadable, impossible, or a day and month that could swap,
  D10) is kept with `needsReview: true`, dated the uploader's local today (the upload form sends
  it; the server never uses its own UTC day). A flagged row shows "Check the due date"
  (`NEEDS_REVIEW_LABEL` in `utils/urgency.ts`) in place of the urgency label, is never a course's
  next deadline and gets no reminder; saving the row's edit clears the flag.

### Course cards (locked 2026-07-22)

- A course card is a tonal card (`rounded-xl bg-secondary/50 p-5`, hover `bg-accent`,
  keyboard-activatable) with exactly one emphasized element: the course name (item-title tier,
  `line-clamp-2`), with a rename pencil that appears on card hover/focus.
- **A card with its editor open is not a navigation surface** (2026-07-22): its click/key
  handlers bail while editing. This also swallows the click browsers synthesize ON the card
  (nearest common ancestor of press and release) when a drag starting inside the non-portaled
  color popover is released over the card — `stopPropagation` inside the editor cannot catch
  that click because it never bubbles through the editor.
- Below the name, a **quiet completion meter**: full-width `h-1.5` rounded track
  (`bg-foreground/10`) filled `bg-primary` (or `bg-success` at 100% — completion is not a
  grade, so no destructive/red states), with a caption row "{done} of {total} completed" ·
  "{n}%" (`tabular-nums`).
- A `border-t` footer (structural rule) shows what's next: "Next due" caption, the assignment
  (body-tier `font-medium`, truncated), date + an urgency chip from `utils/urgency.ts`. With
  nothing upcoming: `text-success` "All assessments completed" when pending is 0, otherwise a
  muted "No upcoming due dates".

### Course colors (locked 2026-07-22)

- **A course's color is user data, not theme styling**: any `#RRGGBB` hex, chosen per course,
  stored as `color` in the course's `coursePreferences` doc (its ID: "User text never goes into
  a Firestore path as is" in Part 1), rendered via **inline style**: the one
  sanctioned exception to the tokens-only rule (same class of exception as progress-bar
  widths). The same hex renders in both themes; how a custom pick reads on each theme is the
  user's call. Malformed stored values are dropped on read and the default takes over.
- **`src/constants/courseColors.ts` owns resolution**: `resolveCourseColor(stored, courseName)`
  returns the stored hex or a stable djb2 name-hash default from `COURSE_COLOR_PRESETS` (six
  mid-range steps in spectral order, chosen to read on both themes; also the picker's
  quick-picks — never reorder, hash defaults would shuffle). Defaults are derived, never
  written; explicit choices survive renames via the existing rename batch.
- **The dot recipe** (`ui/CourseColorDot`): `size-2 rounded-full` beside the course name,
  `aria-hidden` — decorative reinforcement next to visible text, never the only identity
  carrier, never interactive, no tooltip. Course names keep their type-ramp tier and text
  tokens (no colored course-name text, no tinted badges, no colored borders).
- **The picker** (`ui/CourseColorPicker`): a form-native trigger opening the `ui/popover`
  primitive with a react-colorful saturation canvas + hue slider (skinned in
  `styles/color-picker.css`), a hex field, and the preset quick-pick row. The trigger has two
  variants — `field` (filled-input look: `bg-input` control with a `size-4 rounded-sm` swatch
  + mono hex text, tonal hover) and `swatch` (compact square for dense rows) — **no scaling
  hover effects anywhere** (transform motion on hover reads as jitter, 2026-07-22 lesson; the
  same reason the popover has no entrance animation). Instant-apply: drags commit debounced
  (~400ms, one Firestore write per gesture), presets and valid hex entry commit immediately,
  closing or unmounting flushes any pending commit; failures surface an inline destructive
  alert. **Never a native OS color input.** While the popover is open the trigger echoes the
  live draft (the preview must never lag a drag; only the Firestore commit is debounced).
  Duplicate colors across courses are allowed by design (founder call 2026-07-22).
- **Scope (founder call 2026-07-22)**: colors appear only as the dot beside course names.
  Deliberately not in the Calendar tab, notification emails, or the ICS export; no
  per-assessment colors; no color field on the Add assessment form (new courses get the hash
  default).
- **Popovers inside blur-scoped editors render without a portal**, so the editor's
  `relatedTarget` containment check keeps working, and the popover stops Escape propagation —
  Escape closes the popover, not its host editor. (The 2026-07-22 swatch-race lesson
  generalized: an editor that submits on blur scopes the check to its whole container, and
  inline pick targets either stay inside that container or never take focus.) **The editor
  container itself is `tabIndex={-1}`** (2026-09-24 lesson): Safari and Firefox on macOS never
  focus a clicked button; they move focus to its nearest focusable ancestor. Inside a
  keyboard-activatable card that ancestor was the card, so clicking the picker trigger closed
  the editor on Mac only.

### Tab panels & empty states (locked 2026-07-16)

- **Every tab renders inside a uniform `p-6` panel** and opens with `ui/PanelHeader`
  (`{ title, actions? }`): exactly ONE section-heading-tier title line, no subtitles
  (QA lesson: subtitles made header heights inconsistent). The title sits on a fixed 40px line
  (`leading-10` inside a `min-h-10` top-aligned row) so its position is identical on every tab;
  wrapping action clusters grow downward without moving it. Calendar's month/year lives between
  the prev/next arrows on a fixed-width slot inside the actions cluster.
- **Empty states are `ui/EmptyState`, never hand-rolled**: a `size-5` lucide icon (passed as the
  component, sized by the recipe) centered in a `size-10` `bg-secondary` circle with
  `text-muted-foreground`, item-title-tier title, one body-tier supporting sentence (`max-w-md`),
  optional single action, `py-12` (callers pass no padding overrides).
- **Empty-state copy formula**: "No {things} yet" for true-empty (or a state description like
  "No semester selected"); "No {things} found" ONLY when items exist but a filter matched
  nothing; sentence case, one supporting sentence, at most one action.

### Settings page (locked 2026-07-16)

- One `max-w-3xl` column of stacked `rounded-xl bg-card shadow-soft` cards — Profile,
  Preferences, Notifications — on a single scroll. No tab bar.
- **Avatars are initials only** (founder call 2026-07-16): `ui/Avatar` renders the first letter
  of the display name. No photo uploads and no icon picker.
- **Preferences apply instantly**: theme and display toggles persist per field the moment they
  change (optimistic state, reverted with an inline destructive alert on write failure). No Save
  button on instant-apply cards.
- **Profile and Notifications save per card**: each card is its own small form with its own
  Save button, dirty check against the fetched snapshot, and success/error message scoped to
  the card.
- Subpages render the slim bar (no semester switcher, no CTA — the greeting stays) plus their
  own in-page page-title-tier heading ("Settings"); the header `title` prop is gone (v4.2).
  Subpages never show the mobile bottom nav.

### Overlays (the modal recipe)

- Panel: `fixed inset-0 z-150 bg-black/60` backdrop (click closes; panel stops propagation),
  `max-w-sm rounded-2xl bg-card shadow-lg`; header row = title + ghost X;
  `role="dialog" aria-modal`. **No entrance animation** — overlays appear instantly (pop/scale
  effects read as tacky; founder decision 2026-07-14).
- **One surface owns one concept, one entry point opens it.** Creation and management of the
  same object live in the SAME overlay (the Semesters modal has the add input at top — never a
  separate floating input), and exactly ONE control leads there (a single "Manage semesters"
  item — never two menu entries opening the same surface). Auto-focus the create input only when
  the list is empty.
- Lists inside overlays sit on a `bg-secondary/50 rounded-xl` tonal container, rows on the
  shared row-hover recipe (`hover:bg-accent/50`) with ghost icon actions (pencil/trash),
  "Current"/status chips as `bg-primary/10 text-primary` pills. Read-only status chips reuse `statusTintClasses`
  exported from `StatusSelect` — never re-derive the tint mapping.
- Confirmation dialogs are `common/ConfirmationModal` (recipe panel, ghost Cancel + filled
  confirm; `variant="danger"` maps to the destructive button). No decorative icons in
  confirmations.
- Modals that must escape a legacy stacking context (`ExtractionSuccessModal`,
  `ApiLimitReachedModal`) portal to `document.body`; recipe `z-150` still applies.
- Content-listing overlays (e.g. `DayDetailModal`) may widen to `max-w-md`; `max-w-sm` is the
  confirmation-dialog size.

### Email (locked 2026-10-10)

- **One layout, one builder per email.** `lib/emailTemplates.ts` holds the shared layout and a
  builder per email (`reminderEmail`, `welcomeEmail`, `confirmAddressEmail`) that returns
  `{ subject, html, text }`;
  `lib/email.ts` only delivers. A new email is a new builder on the same layout, never a second
  layout. Every email has a matching plain-text part and a hidden preheader.
- **The surface language carries over**: the `--card` surface, one tonal panel for the key detail
  (`--secondary/50`, the assessment-row tone), one flat amber button at the platform's `sm` size,
  amber only on that button and the logo mark. No header bands, borders, shadows or emoji.
  Copy follows "Surface language". Course color dots stay out of email (see Course colors).
- **Mail clients are not browsers**: table layout, light theme as inline styles (some clients
  strip `<style>`); the `<style>` block only adds the dark theme via `prefers-color-scheme`
  (Apple Mail) and the Apple data-detector reset. Colors are the theme tokens: light inline, dark
  in the media query. Light/dark follows the reader's mail app, never the Asetta theme setting
  (the Gmail apps invert on their own; Gmail web is always light).
- **Type**: Manrope (loaded from Google Fonts, Outlook guarded) first in a system stack; Apple
  Mail and iOS Mail show it, Gmail and Outlook never load web fonts and fall back. Sizes follow
  the type ramp: 20px heading, 16px item title, 14px body, 12px footer.
- **Logo**: `public/images/email-logo.png`, the mark in `--primary` amber on transparent, 84px
  shown at 28px beside the live-text wordmark (Gmail doesn't render SVG). Regenerate it from
  `Asetta_Logo.svg` if the mark changes.
- **Escape every user value** with `utils/escapeHtml.ts` in HTML; collapse whitespace in
  subjects. The welcome email carries the account name only for a verified address (D7 in
  `docs/AUDIT.md`).
- **Preview before sending**: `npm run dev:web`, then open `/api/dev/email-preview` (404 outside
  development; `format=text` shows the subject and plain text). Test sends go to the founder's
  own address only.

### Handoff notes for new sessions

This file, the root `CLAUDE.md` and `apps/web/CLAUDE.md` are the complete context; prior chat
history is not required. In short: semantic tokens and `ui/` primitives only, customize
primitives centrally (never at call sites), and run the Part 1 verification loop after every
task. Open work and its decisions are in `docs/AUDIT.md`.
