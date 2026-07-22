# Asetta Engineering & Design Standards

**This file is the single source of truth for code norms and UI styling/theming on the main
platform.** Read it before writing or reviewing any code. If a change conflicts with this file,
either the change is wrong or this file must be updated in the same commit — never let them drift.

Last updated: 2026-07-22 (v4.3 — course colors: user-chosen hex per course via a custom
picker (`ui/CourseColorPicker` on the new `ui/popover` primitive, react-colorful canvas),
rendered inline-style as the sanctioned user-data exception; the course-dot recipe;
name-hash preset defaults via `constants/courseColors.ts`; grade-calculator tiles and
breakdown aligned to the stat-label and shared-grid-template recipes.
v4.2 2026-07-22: dashboard chrome codified: one-bar anatomy with an
item-title-tier greeting, underline tabs on desktop, fixed bottom nav on mobile, Add as the
chrome's primary CTA (actions never pose as navigation), chrome spacing rule; assessments-table
shared grid template recipe; course-card recipe; shared urgency helpers in `utils/urgency.ts`;
same-day polish: menu items separated by `space-y-1`, breadcrumb titles for filtered views,
the `hover:bg-accent/50` list-row hover recipe, micro-motion capped at ~150ms, mounted-tab
memoization + lazy-loaded notes editor.
v4.1 2026-07-16: 2026-07 housekeeping recipes codified: icon rules, panel-header
+ empty-state recipes, settings stacked-sections layout with instant preferences, URL-derived
context-switcher state. v4.0 2026-07-15: **migration complete** — every section is on the
shadcn/Tailwind-v4 system and the legacy token families and utilities are deleted from
`globals.css` (grep-proofed); this file describes the steady state. Surface language unchanged
since the 2026-07-14 v3 lock: borderless tonal surfaces, filled inputs, flat buttons, View
Transitions theme crossfade).

---

## Part 1 — Code Standards

These were established during the 2026-07 codebase overhaul. All new code must follow them.

### Architecture & file layout

- **Pages are thin.** Files in `src/pages/` wire routing to components; they contain no business
  logic beyond auth/redirect glue.
- **Components own markup, hooks own data.** Firestore reads/writes live in `src/hooks/` (client)
  or `src/lib/` (server/API); components receive data and callbacks.
- **One responsibility per file; ~300 lines is the smell threshold.** When a component grows past
  it, split into a folder: `ComponentName.tsx` stays the public coordinator, subparts live in a
  same-named folder (see `tables/assessments/`, `assessment/semester-tabs/`,
  `assessment/grade-calculator/`, `components/auth/`).
- **Pure logic goes in `src/utils/`** as typed, testable functions (see `gradeCalculations.ts`).
  Shared constants go in `src/constants/` (see `isCompletedStatus` — never re-inline
  `["Submitted", "Missed"]`).
- **Shared visuals**: inline SVGs used more than once go in `src/components/ui/icons.tsx`;
  full-screen loading uses `LoadingScreen`; auth-page chrome uses `components/auth/*`.

### Conventions

- TypeScript strict; no `any` in new code (parsed JSON at API boundaries is the one exception,
  validated immediately).
- Prettier (printWidth 100) is enforced — run `npm run format`; ESLint must stay at zero warnings.
- `console.error`/`console.warn` for real failures only; dev-only logging via `utils/devLog.ts`;
  no informational `console.log`.
- No dead code: unused exports, unreachable branches, and "just in case" props get deleted, not
  commented out. (Deliberate exception: `src/pages/index.tsx` is kept as a redirect safety net.)
- Comments explain constraints the code can't express (see the adjust-state-during-render note in
  `UnifiedDashboardPage.tsx`), never narrate what the next line does.

### Verification loop (every task, no exceptions)

```
npm run lint && npm run format:check && npx tsc --noEmit && npm run build
```

All four green before work is called done. CI (`.github/workflows/ci.yml`) enforces the same on
GitHub. Agents never run `git commit`/`git push` — the founder owns all git operations.

Note (2026-07-16): `next lint` prints a deprecation warning on Next 15.5 (removal in Next 16).
The loop is unchanged for now; the pending migration to the ESLint CLI is documented in
`docs/superpowers/plans/2026-07-16-dependency-pass.md`.

---

## Part 2 — UI System (shadcn/ui on Tailwind v4)

Asetta is migrating to **shadcn/ui** on **Tailwind CSS v4**, **incrementally, section by section**
(auth flow migrated first). Until a section is migrated it keeps the legacy styling; once migrated
it must contain **zero** legacy styling.

### Tailwind v4 conventions

- There is **no `tailwind.config.ts`** — all theme configuration lives in
  `src/styles/globals.css` (`@theme`, `@theme inline`, `@utility`, `@custom-variant`).
- Class-based dark mode is wired via `@custom-variant dark (&:is(.dark *))` — do not remove it;
  without it v4 falls back to system-preference and the toggle silently breaks.
- Standalone CSS files that use `@apply` must start with `@reference "./globals.css";`
  (see `rich-text-editor.css`).
- v4 renamed some utilities (`shadow-sm`→`shadow-xs` era names, `rounded`→`rounded-sm`,
  `outline-none`→`outline-hidden`); the upgrade tool already converted the codebase — write the
  new names.
- The `border-color: gray-200` compatibility block in `globals.css` exists for legacy pages;
  new code always states its border color explicitly.
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
- **Copy**: sentence case, quiet voice, no em dashes (founder rule shared with the landing).

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

Five tiers; every piece of text in migrated code states its tier explicitly. If text doesn't fit
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
  sensibly; migrated components still set their tier classes explicitly rather than relying on it.
- Deliberate exception: the auth brand panel hero (`text-5xl/6xl`) is marketing-scale on purpose
  (shared with the landing); nothing inside the app uses it.

### Component rules

- **shadcn primitives live in `src/components/ui/` with lowercase filenames** (`button.tsx`,
  `input.tsx`, `card.tsx`, …) — the shadcn CLI convention. Existing PascalCase files in the same
  folder (`CustomSelect.tsx`, `EmptyState.tsx`, …) are legacy app components; the casing makes
  the distinction visible at a glance. Legacy ones are replaced or rebuilt on primitives as their
  sections are migrated.
- **Customize centrally, never at call sites.** Asetta's look is achieved by editing the variant
  definitions inside the primitive files (cva variants) and the theme tokens — *not* by piling
  override classes onto `<Button className="…">` at usage sites. If a call site needs more than
  layout classes (width/margin/grid placement), the variant is missing and must be added to the
  primitive.
- **Use the `cn()` helper** (`src/lib/utils.ts`, clsx + tailwind-merge) for all conditional
  class composition. No template-literal class concatenation in new code.
- **Composition over duplication**: build app-level components (e.g. `AuthShell`) *from*
  primitives (`Button`, `Input`, `Label`, …); don't fork primitive markup.

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
- **Exact token values ("Theme Tokens" table): locked during the auth-flow redesign** and recorded
  here. Brand anchor: Asetta amber (`#D97706` light / `#F59E0B` dark) as `--primary`, preserved
  from the current design.
- **Legacy tokens are gone.** The `light-*`/`dark-*` families and the `.btn-*`/`.input`/`.form-*`/
  `.card*`/`.badge*`/`.modal-*` utilities were removed from `globals.css` once the migration
  completed (2026-07-15, each grep-proofed). Do not reintroduce them — reach for a semantic token
  or a `ui/` primitive. What remains in `globals.css` is intentional: semantic tokens, the radius/
  shadow/font/animation `@theme` scales, safe-area utilities, scrollbar styling, the `h1`–`h6`
  baseline, and the SVG logo filters.

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

### Quality bar for every migrated screen

- Keyboard: visible `focus-visible` rings on all interactive elements; logical tab order.
- Existing `aria-label`s and form semantics are preserved or improved, never dropped.
- Touch targets ≥ 44px on mobile (existing platform convention).
- Motion is subtle and respects `prefers-reduced-motion`.
- Manually verified in **both themes** and at mobile width before the task is called done.

### Migration state

| Section | Status |
| --- | --- |
| Theme engine (next-themes) + tokens + primitives (`button`, `input`, `label`, `card`, `alert`, `dropdown-menu`, `password-input`, `checkbox`, `switch`, `popover`) | ✅ migrated 2026-07-14 (checkbox 07-15, switch 07-15, popover added 07-22) |
| Auth flow (login/register/reset) | ✅ migrated 2026-07-14 |
| Dashboard shell (header, user menu, tabs, semester bar, stats, page frame, body base styles) | ✅ migrated 2026-07-14 |
| Modals pass (`ConfirmationModal`, semester manage/delete modals, notes modal incl. rich-text editor toolbar/content + link modal, extraction success, API limit, `DayDetailModal`) | ✅ migrated 2026-07-15 — all overlays are on the recipe; the `.modal-*` classes are deleted |
| Onboarding (wizard shell + 6 steps + `OnboardingUploadForm`; new `switch` primitive; `Avatar`/`AvatarPicker`/`IconPicker` rebuilt on tokens) | ✅ migrated 2026-07-15 |
| Assessments table (incl. course-filtered view; `StatusSelect` rebuilt on primitives as a tinted status chip, new `checkbox` primitive) | ✅ migrated 2026-07-15 |
| Courses tab (`CoursesOverviewTable`: tonal keyboard-accessible course cards) | ✅ migrated 2026-07-15 |
| Grades / Calendar / Add (grade calculator + tonal stat tiles, calendar grid + `DayDetailModal`, upload/quick-add forms; `EmptyState`/`LoadingSpinner`/`RateLimitNotice` rebuilt on tokens; `CustomSelect`, `ErrorMessage`, `utils/statusUtils.ts` deleted — status tints all come from `statusTintClasses`) | ✅ migrated 2026-07-15 |
| Settings (profile, preferences incl. Light/Dark/System theme selector, notifications; nav on the tab-bar recipe; `Switch` for all toggles) + last pages (`404`, `index`) | ✅ migrated 2026-07-15 |

**Migration complete (v4.0).** Every section is on the shadcn/Tailwind-v4 system; the legacy
`light-*`/`dark-*` tokens and `.btn-*`/`.input`/`.form-*`/`.card*`/`.badge*` utilities are gone
from `globals.css`. Any reintroduction of a `light-*`/`dark-*` class or a legacy utility is a
regression.

**Placement rule for the theme control** (founder decision, 2026-07-14): the light/dark
`ThemeToggle` is on auth pages only; inside the app theme lives ONLY in Settings → Preferences
(the Light/Dark/System selector) — not in the header or user menu. Theme is a set-and-forget
preference, not a daily control.

**Selector pattern** (founder decision, 2026-07-14): context switchers (semester, and future
course/term pickers) are a single dropdown control — current value + check-marked options +
related actions (add/manage) in one menu. No pill rows with satellite icon buttons.
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
  stored in `coursePreferences/{courseName}.color`, rendered via **inline style** — the one
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
- **Popovers inside blur-scoped editors render without a portal**, so the editor's
  `relatedTarget` containment check keeps working, and the popover stops Escape propagation —
  Escape closes the popover, not its host editor. (The 2026-07-22 swatch-race lesson
  generalized: an editor that submits on blur scopes the check to its whole container, and
  inline pick targets either stay inside that container or never take focus.)

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

### Handoff notes for new sessions

This file + `CLAUDE.md` (which mandates reading it) are the complete context — prior chat history
is NOT required. **The section-by-section migration is complete (v4.0):** every section is on the
shadcn/Tailwind-v4 system and the legacy CSS is gone. This file now describes the steady state,
not a migration in progress. New work is ordinary feature/fix work under these rules — semantic
tokens and `ui/` primitives only, no `light-*`/`dark-*` classes, customize primitives centrally
(never at call sites), run the Part 1 verification loop after every task, and the founder owns all
git operations (never the agent).
