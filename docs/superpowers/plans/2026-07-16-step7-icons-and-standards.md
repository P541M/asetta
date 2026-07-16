# Step 7: Icon minimalism + standards.md v4.1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dropdown triggers show value + chevron only, menu options lead with the selection check only, and every recipe this effort introduced is codified in `standards.md` as v4.1.

**Architecture:** Four surgical icon removals (semester switcher, grade course picker, assessments filter, calendar status filter trigger + its per-option icons; the calendar trigger also gains the `ChevronsUpDown` the other triggers already have). Then `standards.md` gets a v4.1 changelog line and four additions: the icon rule, the panel-header + empty-state recipes (documented as they shipped after step 4 QA), the settings stacked-section recipe with the instant-preferences rule, and a URL-derived context-switcher note appended to the existing Selector pattern paragraph.

**Tech Stack:** Existing React/Tailwind/lucide stack; documentation in `standards.md`.

## Global Constraints

- Same as step 1 (`2026-07-16-step1-motion-and-semester-flicker.md`): standards.md rules, verification loop from `asetta/`, no agent git operations, no test framework (verification loop + manual QA stand in for TDD).
- Spec scope guard: EmptyState `icon` props, tab-bar icons (navigation aids), the "Manage semesters" action-item icon, and the Export button's Download icon all STAY. Only the four named decorative icons go.
- When a trigger label loses its wrapping `<span className="flex min-w-0 items-center gap-2">`, the label span keeps `min-w-0 truncate` — truncation inside a flex button needs `min-w-0`.
- Git via `git -C e:\Code_Files\Asetta_Project\Code\asetta` only (stray repo at E:\ root).

---

### Task 1: The four trigger/menu icon removals

**Files:**
- Modify: `src/components/assessment/SemesterTabs.tsx:189-192` (+ import line 19)
- Modify: `src/components/pages/UnifiedDashboardPage.tsx:204-207` (imports unchanged — `BookOpen`/`GraduationCap` still used by EmptyStates)
- Modify: `src/components/tables/AssessmentsTable.tsx:291-296` (imports unchanged — `ListFilter` still used by the filtered EmptyState)
- Modify: `src/components/calendar/CalendarView.tsx` (imports, `statusFilterOptions`, trigger, menu items)

- [ ] **Step 1: SemesterTabs** — the trigger's label block

```tsx
<span className="flex min-w-0 items-center gap-2">
  <GraduationCap className="text-muted-foreground" aria-hidden />
  <span className="truncate">{activeSemester?.name ?? "Select semester"}</span>
</span>
```

becomes

```tsx
<span className="min-w-0 truncate">{activeSemester?.name ?? "Select semester"}</span>
```

and `GraduationCap` leaves the lucide import (line 19: `import { Check, ChevronsUpDown, Settings2 } from "lucide-react";`). The `Settings2` on "Manage semesters" stays (action item, one icon allowed).

- [ ] **Step 2: UnifiedDashboardPage (grade course picker)** — same transformation:

```tsx
<span className="min-w-0 truncate">{selectedCourse || "Select a course"}</span>
```

(delete the wrapping span + `<BookOpen …/>` line; the import stays — `BookOpen` is still the no-courses EmptyState icon).

- [ ] **Step 3: AssessmentsTable (filter trigger)** — same transformation:

```tsx
<span className="min-w-0 truncate">
  {filterOptions.find((option) => option.value === filter)?.label ?? "All tasks"}
</span>
```

(`ListFilter` import stays — still the filtered EmptyState icon).

- [ ] **Step 4: CalendarView** — four coordinated edits:
  1. Lucide import becomes: `import { Check, ChevronLeft, ChevronRight, ChevronsUpDown, Download } from "lucide-react";` (drop `CircleCheck`, `CircleDashed`, `CircleX`, `Clock`, `ListFilter`, `type LucideIcon`; add `ChevronsUpDown`).
  2. Options lose their icons:

```tsx
const statusFilterOptions: { value: string; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Not started", label: "Not started" },
  { value: "In progress", label: "In progress" },
  { value: "Submitted", label: "Submitted" },
  { value: "Missed", label: "Missed" },
];
```

  3. Delete `const ActiveFilterIcon = activeFilter.icon;` (keep the `activeFilter` lookup — the label is still shown); the trigger becomes value + chevron like every other dropdown:

```tsx
<Button
  type="button"
  variant="secondary"
  className="min-w-40 justify-between"
  aria-label="Filter by status"
>
  <span className="min-w-0 truncate">{activeFilter.label}</span>
  <ChevronsUpDown className="text-muted-foreground" aria-hidden />
</Button>
```

  4. Menu items keep only the check:

```tsx
{statusFilterOptions.map(({ value, label }) => (
  <DropdownMenuItem key={value} onSelect={() => setStatusFilter(value)}>
    <Check className={cn(statusFilter === value ? "opacity-100" : "opacity-0")} aria-hidden />
    {label}
  </DropdownMenuItem>
))}
```

- [ ] **Step 5: Sweep** — Grep `asetta/src` for `CircleDashed|ActiveFilterIcon|OptionIcon` → zero hits; `GraduationCap` appears only as EmptyState `icon=` props in `UnifiedDashboardPage.tsx`; `npx tsc --noEmit` clean; `npm run lint` clean (catches any unused import missed above).

---

### Task 2: standards.md v4.1

**Files:**
- Modify: `standards.md` (header changelog, Selector pattern paragraph, three new sections)

- [ ] **Step 1: Header changelog** — the `Last updated:` paragraph becomes:

```markdown
Last updated: 2026-07-16 (v4.1 — 2026-07 housekeeping recipes codified: icon rules, panel-header
+ empty-state recipes, settings stacked-sections layout with instant preferences, URL-derived
context-switcher state. v4.0 2026-07-15: **migration complete** — every section is on the
shadcn/Tailwind-v4 system and the legacy token families and utilities are deleted from
`globals.css` (grep-proofed); this file describes the steady state. Surface language unchanged
since the 2026-07-14 v3 lock: borderless tonal surfaces, filled inputs, flat buttons, View
Transitions theme crossfade).
```

- [ ] **Step 2: Icons section** — insert after the "Component rules" bullet list (before "### Theming rules"):

```markdown
### Icons (locked 2026-07-16)

- **One icon max per element** (a button, a dropdown trigger, a menu item). Icons carry
  meaning — selection (the check in menus), status (status chips, the save indicator),
  navigation (tab bar, chevrons, back arrows) — **never decoration**.
- **Dropdown triggers show value + chevron only.** No leading glyph next to the current value
  (the semester switcher, course picker, and filter triggers all lost theirs in the 2026-07
  housekeeping pass).
- **Menu options lead with the selection check as their only glyph.** Action items in the same
  menu (e.g. "Manage semesters") may keep one identifying icon.
- Tab-bar icons stay — they are navigation aids, not decoration.
- Empty states show one icon by recipe (see "Tab panels & empty states").
```

- [ ] **Step 3: Panel + empty-state + settings sections** — insert after the "Selector pattern" paragraph (before "### Overlays (the modal recipe)"):

```markdown
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
- Subpages pass `title` to `DashboardHeader` for a static page title — the greeting/rotating
  subtitle belongs to the dashboard only.
```

- [ ] **Step 4: Selector pattern note** — append one sentence to the existing "Selector pattern" paragraph:

```markdown
Context-switcher state derives from the URL: the active semester is the `[semester]` route
segment (first semester when absent), switching is just a `router.push`, and selection state is
never duplicated into component state (the source of the 2026-07-16 flicker fix).
```

---

### Task 3: Verification + QA handoff

- [ ] **Step 1:** From `asetta/`: `npm run format`, then `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 2: Manual QA** (`npm run dev`, both themes, mobile width):
  1. Semester switcher, grade course picker, assessments filter: value + chevron only, label truncation still works at narrow widths.
  2. Calendar status filter: trigger shows value + chevron (chevron is new); menu options show only the check on the selected row.
  3. "Manage semesters" keeps its icon; tab bar unchanged; empty states unchanged; Export keeps Download.
  4. `standards.md` reads coherently top to bottom (v4.1 header, new sections in place).
- [ ] **Step 3: Hand off for commit** (founder runs git; suggested message: `remove decorative dropdown icons, codify housekeeping recipes as standards v4.1`).
