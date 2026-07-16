# Step 4: Tab panel + empty state standardization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every tab shares one header anatomy and one empty-state recipe; hand-rolled variants are deleted.

**Architecture:** Two small `ui/` pieces carry the whole step. `PanelHeader` (`{ title, subtitle?, actions? }`) renders the section-heading tier title with an optional right-aligned actions slot — Courses, Assessments, Grades, Calendar, and Add all use it inside a uniform `p-6` panel. `EmptyState` is restyled to the small-icon recipe and its `icon` prop tightens from "any ReactNode, caller sizes it" to a `LucideIcon` component the recipe sizes itself — making inconsistency unrepresentable. All ten empty surfaces route through it with the copy formula: "No {things} yet" (or a state like "No semester selected"), one sentence, at most one action.

**Tech Stack:** Existing React/Tailwind/lucide stack; `useTab()` for empty-state actions that jump to the Add tab.

## Global Constraints

- Same as step 1 (`2026-07-16-step1-motion-and-semester-flicker.md`): standards.md rules, verification loop from `asetta/`, no agent git operations, no test framework.
- Copy rule: "No X yet" for true-empty, "No X found" only for filter results that matched nothing; sentence case, one supporting sentence, max one action button.

---

### Task 1: The two primitives

**Files:**
- Rewrite: `src/components/ui/EmptyState.tsx`
- Create: `src/components/ui/PanelHeader.tsx`

**Interfaces (produced, used by every later task):**
- `EmptyStateProps` = `{ icon: LucideIcon; title: string; description: string; action?: ReactNode; className?: string }` — callers pass `icon={BookOpen}` (the component, not an element) and no padding overrides.
- `PanelHeaderProps` = `{ title: string; subtitle?: string; actions?: ReactNode }`.

- [ ] **Step 1: EmptyState**

```tsx
import { ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

/** The one empty-state recipe: small icon in a tonal circle, title, one sentence, optional action. */
const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("px-6 py-12 text-center", className)}>
    <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-full bg-secondary">
      <Icon className="size-5 text-muted-foreground" aria-hidden />
    </div>
    <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
    <p className="mx-auto max-w-md text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
```

- [ ] **Step 2: PanelHeader**

```tsx
import { ReactNode } from "react";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Shared tab-panel header: section-heading title, optional subtitle, right-aligned actions. */
const PanelHeader = ({ title, subtitle, actions }: PanelHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export default PanelHeader;
```

- [ ] **Step 3:** `npm run lint` — EXPECTED failures in old callers until Tasks 2-3 land; proceed.

---

### Task 2: Migrate the five tabs

**Files:**
- Modify: `src/components/tables/AssessmentsTable.tsx`
- Modify: `src/components/tables/CoursesOverviewTable.tsx`
- Modify: `src/components/pages/UnifiedDashboardPage.tsx` (GradesTab + AddTab)
- Modify: `src/components/calendar/CalendarView.tsx`

**Interfaces:** consumes Task 1's props exactly.

- [ ] **Step 1: AssessmentsTable** — header block (`mb-6 flex flex-col…` + h2 + filter) becomes `PanelHeader title="Assessments" actions={<existing filter DropdownMenu/>}`. The hand-rolled empty block becomes a true-empty vs filtered-empty split (add `useTab` import; `Button`, `FileText`, `ListFilter` already imported):

```tsx
{sortedAssessments.length === 0 ? (
  localAssessments.length === 0 ? (
    <EmptyState
      icon={FileText}
      title="No assessments yet"
      description="Upload a course outline or add assessments manually to get started."
      action={
        <Button type="button" onClick={() => setActiveTab("add")}>
          Add assessment
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={ListFilter}
      title="No assessments found"
      description="Nothing matches the current filter."
    />
  )
) : ( /* existing table */ )}
```

with `const { setActiveTab } = useTab();` at the top of the component and `import EmptyState from "../ui/EmptyState";`.

- [ ] **Step 2: CoursesOverviewTable** — h2 → `PanelHeader title="Courses"` (both branches); empty state gains the add action:

```tsx
<EmptyState
  icon={BookOpen}
  title="No courses yet"
  description="Add an assessment and its course will appear here."
  action={
    <Button type="button" onClick={() => setActiveTab("add")}>
      Add assessment
    </Button>
  }
/>
```

(add `useTab` import + hook call).

- [ ] **Step 3: GradesTab (UnifiedDashboardPage)** — flatten `<div><div className="p-6">` to one `p-6`; header becomes:

```tsx
<PanelHeader
  title="Grade calculator"
  subtitle={selectedCourse || "Select a course"}
  actions={
    <>
      {/* existing auto-save indicator div */}
      {/* existing course DropdownMenu */}
    </>
  }
/>
```

No-semester empty: `icon={GraduationCap}`, same copy, no `className`. No-courses empty: `icon={BookOpen}`, title "No courses yet", keep description + action, drop `py-10`.

- [ ] **Step 4: AddTab (UnifiedDashboardPage)** — flatten wrapper; h2 → `PanelHeader title="Add assessment"`; the bare no-semester paragraph becomes:

```tsx
<EmptyState
  icon={GraduationCap}
  title={urlSemesterId ? "Semester not found" : "No semester selected"}
  description={
    urlSemesterId
      ? "Check the URL or head back to your dashboard."
      : "Select a semester above to add assessments."
  }
/>
```

- [ ] **Step 5: CalendarView** — header block becomes `PanelHeader title="Calendar" subtitle={…month/year…} actions={<existing search/filter/nav/export cluster/>}` (the cluster's own wrapper div is replaced by PanelHeader's actions slot; note breakpoint changes lg→sm, controls wrap).

- [ ] **Step 6:** `npm run lint && npx tsc --noEmit` — clean except possibly remaining Task 3 files.

---

### Task 3: Remaining call sites + hand-rolled leftovers

**Files:**
- Modify: `src/components/assessment/CourseFilteredAssessments.tsx`
- Modify: `src/components/assessment/GradeCalculator.tsx`
- Modify: `src/components/assessment/grade-calculator/AssessmentBreakdown.tsx`
- Modify: `src/components/settings/NotificationsSection.tsx`
- Modify: `src/components/onboarding/steps/NotificationsStep.tsx`

- [ ] **Step 1: CourseFilteredAssessments** — hand-rolled spinner div → `<div className="flex justify-center py-12"><LoadingSpinner /></div>` (import it); hand-rolled empty →

```tsx
<EmptyState
  icon={FileText}
  title="No assessments in this course yet"
  description="Add assessments manually or upload a course outline."
/>
```

(import EmptyState; drop the `px-6 pb-10 text-center` wrapper).

- [ ] **Step 2: GradeCalculator** — "No course selected": `icon={ChartColumn}`, drop `py-10`.
- [ ] **Step 3: AssessmentBreakdown** — `icon={ChartColumn}`, title "No assessments yet", keep description, drop `py-10`.
- [ ] **Step 4: NotificationsSection** — `icon={BellOff}`, drop `py-8`.
- [ ] **Step 5: NotificationsStep** — `icon={Bell}`, drop `py-8`.
- [ ] **Step 6: Sweep** — `Grep pattern "size-12.*aria-hidden|py-10 text-center|pb-10 text-center" path src` → zero hits; `Grep pattern "text-xl font-semibold tracking-tight" path src/components` → hits only in `PanelHeader.tsx` (and none in tab components).

---

### Task 4: Verification + QA

- [ ] **Step 1:** `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 2: Manual QA** (`npm run dev`, both themes, mobile width):
  1. All five tabs: identical title size/weight/position, same panel padding.
  2. Empty semester: each tab's empty state shows the small tonal-circle icon, consistent copy; Courses/Assessments actions jump to the Add tab.
  3. Assessments with items + "Submitted" filter showing nothing → "No assessments found".
  4. Calendar controls usable at tablet width (they wrap under the title row).
- [ ] **Step 3:** Hand off for commit (suggested: `standardize tab panel headers and empty states`).
