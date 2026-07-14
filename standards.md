# Asetta Engineering & Design Standards

**This file is the single source of truth for code norms and UI styling/theming on the main
platform.** Read it before writing or reviewing any code. If a change conflicts with this file,
either the change is wrong or this file must be updated in the same commit — never let them drift.

Last updated: 2026-07-14 (v3 — surface language locked after the auth remodel: borderless tonal
surfaces, filled inputs, flat buttons, View Transitions theme crossfade).

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

### Surface language (locked 2026-07-14 — the "premium minimal" rules)

Adopted from the landing design system — **directionally, not verbatim**. The landing sells;
the platform is a daily tool. When they conflict, the platform chooses calm cohesion over
marketing flourish (founder decision, 2026-07-14: e.g. no entrance animations here). These rules
are what make Asetta look like Asetta and not a default shadcn app:

- **No decorative borders.** Surfaces separate by *tone shift* (`background` vs `secondary` vs
  `card`), never by hairlines. `--border` exists for true structural rules only (table row
  dividers, typographic rules).
- **Inputs are filled, not outlined**: resting on the `--input` tonal fill, borderless; focus
  lifts to `card` with a 2px amber ring. Never add borders back to form fields.
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

### Motion

- **No entrance animations on app screens.** Fade-up reveals belong to the marketing site; the
  platform is a tool people open many times a day — screens appear instantly. Motion is reserved
  for *feedback*: responses to a user action (an alert appearing, a criteria check turning on,
  button press states), always behind `motion-safe:`.
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
| `--background` | `#FAFAFA` | `#151515` | page background (soft dark, not near-black) |
| `--foreground` | `#1A1A1A` | `#F5F5F4` | primary text |
| `--card` / `--popover` | `#FFFFFF` | `#1E1E1E` | elevated surfaces |
| `--muted` / `--secondary` | `#F0EFED` | `#1E1E1E` | tonal bands, tonal buttons |
| `--accent` | `#E9E7E4` | `#282828` | hover tone (one step deeper/lighter) |
| `--input` | `#F0EFED` | `#1E1E1E` | **input resting fill** (inputs are borderless) |
| `--muted-foreground` | `#6B6B6B` | `#A3A3A3` | secondary text |
| `--primary` | `#D97706` | `#F59E0B` | Asetta amber |
| `--primary-hover` | `#B45309` | `#D97706` | primary button hover (darkens) |
| `--primary-foreground` | `#FFFFFF` | `#1A1A1A` | text on primary |
| `--destructive` | `#DC2626` | `#EF4444` | errors, deletes |
| `--success` | `#059669` | `#10B981` | success alerts, met criteria |
| `--border` | `#E5E5E5` | `#2E2E2E` | structural rules only (no decorative borders) |
| `--ring` | `#D97706` | `#F59E0B` | focus rings |

**Dark-mode cohesion rule**: adjacent surfaces sit one gentle step apart on the ramp
(`#151515` page → `#1E1E1E` band/surface → `#282828` hover). Never place a near-black next to a
mid-grey; if two surfaces look like different apps side by side, the ramp is wrong. (Legacy
sections still use the old `#0A0A0A` body until they migrate — expected during the transition.)

**Radius ladder** (no `--radius` indirection — we use the platform's existing scale):
`rounded-lg` (0.5rem) for controls (buttons, inputs), `rounded-xl` (1rem) for cards/tiles,
`rounded-2xl` (1.5rem) for large panels. The xl/2xl/3xl values are legacy overrides kept in
`@theme`.

**Type**: Manrope everywhere (`--font-sans`/`--font-heading`); headings `font-semibold
tracking-tight` in **sentence case** ("Welcome back", not "Welcome Back").

### Component rules

- **shadcn primitives live in `src/components/ui/` with lowercase filenames** (`button.tsx`,
  `input.tsx`, `card.tsx`, …) — the shadcn CLI convention. Existing PascalCase files in the same
  folder (`CustomSelect.tsx`, `StatusSelect.tsx`, …) are legacy app components; the casing makes
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
  primitives (`Card`, `CardHeader`, …); don't fork primitive markup.

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
- **Legacy tokens** (`light-*`/`dark-*` in `tailwind.config.ts` and the `.btn-*`/`.input`/
  `.form-*`/`.badge*`/`.modal-*`/`.stat*` classes in `globals.css`) stay until the last section
  using them is migrated. Deleting a legacy class requires a grep proving zero usages.

### Dark/light mode rules

- Strategy: class-based (`.dark` on `<html>` via `@custom-variant`), managed by **next-themes**
  (`ThemeProvider` in `_app.tsx`, currently `defaultTheme="light"`, system option arrives with the
  settings redesign). It owns the no-flash pre-hydration script and persistence (`theme` key);
  `_document.tsx` carries only the one-time seed that migrates the legacy `darkMode` key.
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
| Theme engine (next-themes) + tokens + primitives (`button`, `input`, `label`, `card`, `alert`) | ✅ migrated 2026-07-14 |
| Auth flow (login/register/reset) | ✅ migrated 2026-07-14 |
| Onboarding | legacy |
| Dashboard shell (header, tabs, semester bar) | legacy |
| Assessments table | legacy |
| Grades / Calendar / Add | legacy |
| Settings | legacy (toggle already rewired to next-themes) |
