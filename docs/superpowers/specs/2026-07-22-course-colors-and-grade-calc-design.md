# Course color-coding + grade calculator refresh — design

Date: 2026-07-22
Status: approved by founder (defaults + indicator style chosen via Q&A; full design approved)

## Context & goals

The Assessments tab is a monochromatic sea of tonal blocks; courses are hard to tell apart at a
glance. This feature adds a course color-coding system across the platform, plus a visual-only
refresh of the grade calculator. Constraints: premium-minimal aesthetic per `standards.md` (v4.2),
no native OS color picker, color used as a subtle indicator — never a flood.

Founder decisions locked during design:

1. **Defaults**: every course gets a stable auto-assigned color derived from its name; users can
   override per course. (Soft exception to zero-drift, accepted: the feature should be visible on
   day one.)
2. **Indicator**: a small colored dot beside the course name. No tinted badges, no left borders
   (decorative borders are banned by the surface language).

## Data model

There is no first-class Course entity. Courses exist implicitly as `courseName` strings on
assessment docs; the only per-course store is
`users/{uid}/semesters/{semesterId}/coursePreferences/{courseName}` (doc ID = course name),
currently holding `targetGrade`. That collection is the de facto course entity store and already
survives renames (`useCourseRename` copies the doc in its batch), so color lives there.

### Types (`src/types/coursePreferences.ts`)

```ts
export type CourseColorId =
  | "blue" | "teal" | "fuchsia" | "lime" | "violet" | "cyan" | "pink" | "indigo";

export interface CoursePreferences {
  targetGrade: number;
  color?: CourseColorId; // absent = derive default from course name
}
```

- `color` is optional. A missing or unrecognized value (forward/backward compat) falls back to
  the deterministic default — never crashes, never renders a broken class.
- The commented-out "future preferences" lines in this file are deleted (dead code).

### Default color resolution

`defaultCourseColorId(courseName)` — djb2 hash of the exact `courseName` string, modulo 8, indexed
into the fixed palette order below. Properties: deterministic across devices/sessions, no writes
needed, stable under course additions/deletions. Two courses may collide on a hue; the override
path is the remedy (accepted trade-off).

Resolution everywhere is: `storedColor ?? defaultCourseColorId(name)`. Stored colors are only
written when a user explicitly picks one.

## Color system

### Palette (validated)

Eight hues, deliberately excluding the semantic colors (amber = `--primary`, red =
`--destructive`, green/emerald = `--success`). Both theme variants passed the dataviz palette
validator (lightness band, chroma floor, CVD adjacent-pair separation, normal-vision floor,
contrast vs. the app's real surfaces) on 2026-07-22:

| Id | Light (Tailwind step) | Dark (Tailwind step) |
| --- | --- | --- |
| `blue` | `#2563EB` (blue-600) | `#3B82F6` (blue-500) |
| `teal` | `#0D9488` (teal-600) | `#0D9488` (teal-600) |
| `fuchsia` | `#C026D3` (fuchsia-600) | `#D946EF` (fuchsia-500) |
| `lime` | `#65A30D` (lime-600) | `#65A30D` (lime-600) |
| `violet` | `#7C3AED` (violet-600) | `#8B5CF6` (violet-500) |
| `cyan` | `#0891B2` (cyan-600) | `#0891B2` (cyan-600) |
| `pink` | `#DB2777` (pink-600) | `#EC4899` (pink-500) |
| `indigo` | `#4F46E5` (indigo-600) | `#6366F1` (indigo-500) |

The table order is the fixed display order for swatch rows and the hash index order — never
reorder it (stored data doesn't depend on order, but hash defaults do; reordering would shuffle
every unset course's color).

Course identity is never color-alone: the course name text always accompanies the dot, so CVD
safety does not rest on the palette.

### Tokens, not raw palette classes

`standards.md` bans raw palette classes in components. The eight hues become theme tokens:

- `globals.css`: `--course-blue` … `--course-indigo` in `:root` (light values) and `.dark`
  (dark values), mapped through `@theme inline` (`--color-course-blue: var(--course-blue);` etc.)
  so `bg-course-blue`, `text-course-blue`, `ring-course-blue` utilities exist and flip with the
  theme. No `dark:` variants anywhere in components.
- `src/constants/courseColors.ts` is the single owner of the palette:

```ts
export interface CourseColor {
  id: CourseColorId;
  label: string;        // "Blue" — for aria-labels on swatches
  dotClass: string;     // "bg-course-blue"
  ringClass: string;    // "ring-course-blue" — selected-swatch ring
}
export const COURSE_COLORS: readonly CourseColor[]; // fixed order per the table
export const defaultCourseColorId: (courseName: string) => CourseColorId;
export const getCourseColor: (id: CourseColorId | undefined, courseName: string) => CourseColor;
```

Class strings are literal (Tailwind can't see dynamic names). No other file states a course color
class.

## Data plumbing

### `useCourseColors(user, semesterId)` — new hook (`src/hooks/useCourseColors.ts`)

- `onSnapshot` over the `coursePreferences` collection for the semester (small collection; live
  updates keep all tabs consistent, matching the assessments listener pattern).
- Returns:
  - `courseColors: Record<string, CourseColorId>` — only explicitly stored colors; consumers
    resolve defaults via `getCourseColor(courseColors[name], name)`.
  - `setCourseColor(courseName, colorId): Promise<void>` — `setDoc(..., { color }, { merge: true })`.
- Fail-soft: subscription errors log via `console.error` and leave the map empty (defaults still
  render); they do not surface a blocking error UI.

### Wiring

- `DashboardLayout` instantiates the hook once and adds `courseColors` + `setCourseColor` to the
  memoized `childData` (and to its memo deps). `DashboardData`
  (`src/types/dashboard.ts`) gains both fields; `DashboardLayout`'s inline children-props type is
  replaced by `DashboardData` (it currently duplicates the shape field-for-field — hygiene).
- Tab components receive colors through `data` and pass what their children need as props
  (`AssessmentsTable` and `CourseFilteredAssessments` get a `courseColors` prop;
  `CoursesOverviewTable` gets `courseColors` + `setCourseColor`).
- Onboarding uses the same hook directly with `state.createdSemesterId`.

### `useCoursePreferences` read-time normalization (required fix)

Once colors ship, a prefs doc can exist with `color` but no `targetGrade` (created by
`setCourseColor` merge before the grade calculator ever ran). `useCoursePreferences` must read as
`{ ...DEFAULT_COURSE_PREFERENCES, ...doc.data() }` so a missing `targetGrade` resolves to 85
instead of `undefined` (which would NaN the required-grade projection). Its lazy
"create defaults" write switches to `setDoc(..., { merge: true })` so it can never clobber a
stored color.

`resetPreferences` (exported by the hook, consumed nowhere) is deleted — dead code, and its
whole-doc overwrite would wipe stored colors.

## UI

### The dot recipe (shared)

`<span aria-hidden className="size-2 shrink-0 rounded-full {dotClass}" />` placed immediately
before the course name text, `flex items-center gap-2` (or `gap-1.5` in dense cells). The dot is
decorative reinforcement — never the only identity carrier, never interactive by itself, no
tooltip. Where a name wraps (course cards), the dot aligns to the first text line.

### `CourseColorSwatches` (`src/components/ui/CourseColorSwatches.tsx`)

Shared swatch selector (Courses tab edit state + onboarding). No native color input.

- A single row: `role="radiogroup"` with an `aria-label`, one button per `COURSE_COLORS` entry,
  `role="radio"` + `aria-checked`, roving tabindex (arrows move focus, Enter/Space selects).
- Each button: circular hit target ≥44px on mobile (`size-11 md:size-9`), rendering a `size-5`
  colored circle (`dotClass`). Selected: `ring-2 ring-offset-2 ring-offset-card` in the swatch's
  own `ringClass` (self-colored ring, not amber — an amber ring around a colored swatch clashes;
  keyboard focus still shows the standard `focus-visible` ring). Hover: subtle scale under
  `motion-safe:` at ≤150ms.
- Selection applies **instantly** (the settings instant-apply pattern): optimistic UI, write via
  `setCourseColor`; on failure revert and show an inline destructive `Alert` adjacent to the
  picker.

### Courses tab (`CoursesOverviewTable`)

- Card view: dot beside the course name (the name stays the card's single emphasized element).
- Edit state (pencil): unchanged name `Input`, with a `CourseColorSwatches` row beneath
  (`mt-3`). Color applies instantly; name save stays Enter/blur; Escape exits as today. The card's
  click-to-navigate handler must not fire from swatch interactions (stopPropagation, as the
  rename controls already do).

### Assessments tab

- Desktop rows (`AssessmentRow`): the course cell becomes `flex items-center gap-1.5` — dot +
  truncating muted course name. Grid template (`tableGrid.ts`) unchanged.
- Mobile cards: dot before the course label line.
- Course-filtered view (`CourseFilteredAssessments`): the breadcrumb's current-course crumb gets
  the dot ("Courses / ● CS 2212").
- `ExtractionSuccessModal`'s "Courses detected" rows get the dot (default-resolved) — read-only
  echo, no picker.

### Grades tab

- The course switcher trigger and each menu item show the dot before the course name; the
  `data-selected` amber tint recipe is untouched.

### Onboarding (`UploadStep`)

- After successful extraction, beneath the success `Alert`: a "Courses detected" tonal container
  (`rounded-xl bg-secondary/50 p-1.5`, rows on the shared row-hover recipe — same recipe as
  `ExtractionSuccessModal`). Each row is a toggle button (`aria-expanded`, right-aligned chevron
  that rotates when open) showing dot (auto-assigned default) + course name + assessment count;
  opening it reveals an inline `CourseColorSwatches` row for that course (one open at a time).
  Writes go through `useCourseColors(user, state.createdSemesterId)` (user from `useAuth`, as
  everywhere else).
- Skipped upload → no course list → no color step (nothing renders).
- `CompletionStep` summary course rows show the final dot, read-only.

## Grade calculator refresh (visual only — no functional changes)

### `GradeOverviewCards`

- Tile titles drop to caption-tier stat labels (`text-xs font-medium text-muted-foreground`),
  matching the dashboard stats bar; numbers keep the stat ramp
  (`text-xl md:text-2xl font-semibold text-foreground`).
- Per-tile structure normalized: label row (label left, letter chip right where applicable),
  number, meter, one supporting line. Progress bars, letter chip, target input, and the
  projection line all stay; spacing tightened to a consistent rhythm (`space-y-3`, `mb-2` label
  row).

### `AssessmentBreakdown`

- Desktop header and rows consume one local grid constant (`gradeGridClass`, same pattern as
  `tableGrid.ts`) — columns: assessment · status · weight · mark · points. Header stays caption
  tier.
- Numeric columns (weight, mark, points) right-aligned with `tabular-nums` in header and cells;
  the input + "%" clusters right-justify within their tracks.
- Dates render via `formatLocalDate` (`utils/dateUtils`), replacing raw
  `new Date(...).toLocaleDateString()`.
- Mobile card layout is kept; only tier/alignment tidying.

## Codebase hygiene (bundled)

- `useSemesterAssessments`: remove the stray `title` field injected into `Assessment` objects
  (not part of the type).
- `types/coursePreferences.ts`: delete commented-out future props; delete `resetPreferences` from
  the hook + interface (unused).
- `DashboardLayout`: children props typed as `DashboardData` instead of a duplicated inline shape.
- `standards.md` → v4.3 in the same change: course color token family (the 8 tokens + the rule
  that `constants/courseColors.ts` is the only class owner), the dot recipe, the swatch-picker
  recipe (self-colored selection ring exception), and the instant-apply note. Changelog line
  dated 2026-07-22.

## Error handling summary

- Color reads fail-soft to defaults (log only).
- Color writes: optimistic, revert + inline destructive `Alert` on failure (settings pattern).
- Unknown stored `color` values resolve to the name-hash default.
- Rename: color migrates with the prefs doc via the existing `useCourseRename` batch (verify in QA).

## Out of scope (explicit)

Calendar tab coloring, a color field on `AddAssessmentForm` (new courses simply get hash
defaults), per-assessment colors, colors in notification emails / ICS export, and any Firestore
rules changes (the `coursePreferences` collection is already owner-writable).

## Amendments (2026-07-22 QA pass, approved by founder)

1. **Palette narrowed 8 → 5** after founder QA flagged look-alike hues; re-validated in
   **all-pairs** mode (any two colors can sit adjacent since users assign freely):
   blue `#3B82F6`/`#60A5FA`, lime `#65A30D`/`#65A30D`, bronze `#854D0E`/`#A16207`,
   purple `#7E22CE`/`#9333EA`, pink `#EC4899`/`#EC4899` (light/dark). Light passes every
   check; dark passes all quality checks with one accepted deviation (blue-400 above the
   chart lightness band — the in-band blue collapses into purple under deutan vision).
   Teal/cyan/fuchsia/violet/indigo removed: too close to blue, pink, or each other.
2. **Swatch-click race fixed**: the rename input's blur-submit unmounted the swatch row on
   mousedown. Swatch buttons no longer take focus (`onMouseDown` preventDefault) and the
   editor's blur-submit is scoped to the whole editor container via `relatedTarget`, which
   also lets keyboard users Tab from input to swatches without closing the editor.
3. **Color collisions: discourage, don't block** (founder had proposed disabling; soft
   indication chosen because hard-disable dead-ends semesters with more courses than palette
   slots and forbids deliberate grouping). In-use swatches render as a hollow outline of
   their hue with "In use by {course}" title/aria, and remain selectable.
4. **Grade calculator polish**: breakdown header reduced to a single item-title line (the
   "no header subtitles" rule); overview tiles compacted to one shared anatomy — caption
   label row, fixed h-9 value row (number and target input align by construction), meter,
   caption support line pinned to the tile bottom (`p-4`, `gap-3`).
5. Hygiene: unused `defaultCourseColorId` export removed.

## Amendment 3 (2026-07-22, founder pivot): custom colors

Supersedes the curated-palette model (amendments 1 and 3 above) per founder direction:

1. **Any color**: `coursePreferences/{courseName}.color` now stores a user-chosen `#RRGGBB`
   hex (validated on read and write; malformed values fall back to the default). Colors are
   user data rendered via inline style — the sanctioned exception to the tokens-only rule;
   the `--course-*` theme tokens are deleted. One hex renders in both themes (readability of
   a custom pick is the user's call).
2. **Custom picker** (`ui/CourseColorPicker` + new `ui/popover` primitive; deps added:
   `react-colorful`, `@radix-ui/react-popover`): swatch-button trigger → popover with
   saturation canvas + hue slider, hex field, and preset quick-picks. No native OS color
   input. Drags commit debounced (~400ms); presets/valid hex commit immediately; close
   flushes. The popover renders non-portaled inside the Courses-tab editor so the blur
   containment fix from amendment 2 keeps working, and stops Escape from closing the editor.
3. **Collision logic removed** (founder call): duplicate colors across courses are allowed;
   the hollow in-use swatch state and `CourseColorSwatches` are deleted.
4. **Defaults unchanged in spirit**: unset courses hash into `COURSE_COLOR_PRESETS` (validated
   mid-range hexes), which double as the picker's quick-picks.

## Amendment 4 (2026-07-22, QA pass on the custom picker)

1. **Trigger redesigned as a form-native control**: `field` variant (filled `bg-input` control
   with a small rounded-square swatch + mono hex text) in the Courses-tab editor, `swatch`
   variant (compact square) in onboarding rows. All scaling hover effects removed.
2. **"Modal jitter" root-caused as transform motion, not reflow** (Radix popover is non-modal:
   no scroll lock, `preventScroll` focus, fixed-strategy positioning — verified in source):
   the trigger's hover scale and the popover's scale-in entrance were the movement. Both
   removed; popovers now appear instantly per the overlay rule, with `collisionPadding`.
3. **Grade-calculator cursor-jump fixed**: inputs were controlled by parsed/clamped numbers
   reformatted every keystroke. New `grade-calculator/NumberField` keeps the raw string while
   focused, snaps on blur; parent state stays numeric. Native spinners are now hidden at the
   `Input` primitive app-wide.
4. **Presets: six** (blue, teal, lime, bronze, purple, pink in spectral order) — note the
   preset count change reshuffles name-hash defaults for unset courses (harmless; feature is
   uncommitted).

## Verification

1. `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
2. Manual, both themes, desktop + mobile width:
   - Assessments tab dots (desktop rows, mobile cards, filtered breadcrumb).
   - Courses tab: dot on cards; pencil → swatches; pick color → instant everywhere (live
     listener); collision override works.
   - Grades: switcher dots; refreshed tiles/breakdown; target-grade projection still correct for
     a course whose prefs doc was created color-first.
   - Rename a colored course → color follows.
   - Onboarding with upload (assign colors, verify post-onboarding dashboard shows them) and
     with skip (no color UI).
3. No git operations by the agent — founder commits.
