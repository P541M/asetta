# Course color-coding + grade calculator refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every course a color (stored per course, stable auto-defaults, user-overridable via a custom swatch selector) surfaced as subtle dots across the Assessments, Courses, Grades tabs and onboarding, plus a visual-only grade calculator refresh.

**Architecture:** Colors live in the existing `coursePreferences/{courseName}` docs (`color?: CourseColorId`), so `useCourseRename`'s batch migration carries them for free. Eight theme tokens in `globals.css` (light/dark values, flipped by the theme like every other token) are exposed as `bg-course-*`/`ring-course-*` utilities and owned exclusively by `src/constants/courseColors.ts` (fixed order, djb2 name-hash default, safe fallback for unknown ids). A new `useCourseColors` hook (one `onSnapshot` per semester, instantiated in `DashboardLayout`) feeds a `courseName → colorId` map through `DashboardData`; onboarding uses the same hook directly. Two small shared components render everything: `CourseColorDot` and `CourseColorSwatches`.

**Tech Stack:** Existing React 19 / Next 15 / Tailwind v4 / Firebase / shadcn stack; no new dependencies.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-22-course-colors-and-grade-calc-design.md` governs; founder decisions locked there (auto-assign defaults to all courses; dot indicator; palette table).
- `standards.md` rules apply everywhere; run all commands from `asetta/`; verification loop per task: `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` (run `npm run format` first if you created files). No test framework — loop + manual QA.
- **No agent git operations** — the founder owns add/commit/push. "Commit" is never a plan step.
- Node 22 via nvm-windows; if a shell can't find node, add `C:\nvm4w\nodejs` to PATH. Stop any dev server before `npm run build`.
- Palette hex values and the 8-entry order are copied verbatim from the spec — never reorder `COURSE_COLORS` (hash defaults would shuffle).
- Course color classes appear ONLY in `globals.css` and `src/constants/courseColors.ts`. Components consume `CourseColor` objects.
- Copy rules: sentence case, quiet voice, no em dashes.

---

### Task 1: Color tokens, palette constants, type

**Files:**
- Modify: `src/styles/globals.css` (three token blocks)
- Modify: `src/types/coursePreferences.ts`
- Create: `src/constants/courseColors.ts`

**Interfaces:**
- Produces: `CourseColorId` (union of 8 ids) and `CoursePreferences.color?: CourseColorId` in `types/coursePreferences.ts`; `COURSE_COLORS: readonly CourseColor[]`, `defaultCourseColorId(courseName: string): CourseColorId`, `getCourseColor(id: CourseColorId | undefined, courseName: string): CourseColor` from `constants/courseColors.ts`, where `CourseColor = { id, label, dotClass, ringClass }`.

- [ ] **Step 1: Add tokens to `globals.css`**

In the `:root` block, immediately after `--ring: #d97706;`:

```css
  /* Course categorical colors (standards.md v4.3) — used ONLY via constants/courseColors.ts */
  --course-blue: #2563eb;
  --course-teal: #0d9488;
  --course-fuchsia: #c026d3;
  --course-lime: #65a30d;
  --course-violet: #7c3aed;
  --course-cyan: #0891b2;
  --course-pink: #db2777;
  --course-indigo: #4f46e5;
```

In the `.dark` block, immediately after `--ring: #f59e0b;`:

```css
  --course-blue: #3b82f6;
  --course-teal: #0d9488;
  --course-fuchsia: #d946ef;
  --course-lime: #65a30d;
  --course-violet: #8b5cf6;
  --course-cyan: #0891b2;
  --course-pink: #ec4899;
  --course-indigo: #6366f1;
```

In the `@theme inline` block, immediately after `--color-ring: var(--ring);`:

```css
  --color-course-blue: var(--course-blue);
  --color-course-teal: var(--course-teal);
  --color-course-fuchsia: var(--course-fuchsia);
  --color-course-lime: var(--course-lime);
  --color-course-violet: var(--course-violet);
  --color-course-cyan: var(--course-cyan);
  --color-course-pink: var(--course-pink);
  --color-course-indigo: var(--course-indigo);
```

- [ ] **Step 2: Extend `src/types/coursePreferences.ts`**

Replace the `CoursePreferences` interface (including the commented-out "future preferences" lines — dead code, delete them) with:

```ts
export type CourseColorId =
  | "blue"
  | "teal"
  | "fuchsia"
  | "lime"
  | "violet"
  | "cyan"
  | "pink"
  | "indigo";

export interface CoursePreferences {
  targetGrade: number;
  /** Absent = derive the default from the course name (constants/courseColors.ts). */
  color?: CourseColorId;
}
```

Leave `CoursePreferencesHook` and `DEFAULT_COURSE_PREFERENCES` untouched in this task (the hook is reworked in Task 2).

- [ ] **Step 3: Create `src/constants/courseColors.ts`**

```ts
import { CourseColorId } from "../types/coursePreferences";

export interface CourseColor {
  id: CourseColorId;
  /** Human name for swatch aria-labels ("Blue"). */
  label: string;
  /** Solid fill for dots and swatches. */
  dotClass: string;
  /** Selected-swatch ring (self-colored — standards.md v4.3 exception). */
  ringClass: string;
}

/**
 * Fixed display and hash order, validated for both themes on 2026-07-22 (see
 * the course-colors spec). Reordering shuffles every unset course's default
 * color — never reorder.
 */
export const COURSE_COLORS: readonly CourseColor[] = [
  { id: "blue", label: "Blue", dotClass: "bg-course-blue", ringClass: "ring-course-blue" },
  { id: "teal", label: "Teal", dotClass: "bg-course-teal", ringClass: "ring-course-teal" },
  {
    id: "fuchsia",
    label: "Fuchsia",
    dotClass: "bg-course-fuchsia",
    ringClass: "ring-course-fuchsia",
  },
  { id: "lime", label: "Lime", dotClass: "bg-course-lime", ringClass: "ring-course-lime" },
  { id: "violet", label: "Violet", dotClass: "bg-course-violet", ringClass: "ring-course-violet" },
  { id: "cyan", label: "Cyan", dotClass: "bg-course-cyan", ringClass: "ring-course-cyan" },
  { id: "pink", label: "Pink", dotClass: "bg-course-pink", ringClass: "ring-course-pink" },
  { id: "indigo", label: "Indigo", dotClass: "bg-course-indigo", ringClass: "ring-course-indigo" },
];

/* djb2 — deterministic across sessions and devices so unset courses keep the
   same default everywhere without any writes. */
const defaultCourseColor = (courseName: string): CourseColor => {
  let hash = 5381;
  for (let i = 0; i < courseName.length; i++) {
    hash = (hash * 33) ^ courseName.charCodeAt(i);
  }
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length];
};

export const defaultCourseColorId = (courseName: string): CourseColorId =>
  defaultCourseColor(courseName).id;

/** Stored color when valid; otherwise the course's stable default (also covers
    unknown ids from newer/older clients). */
export const getCourseColor = (id: CourseColorId | undefined, courseName: string): CourseColor =>
  COURSE_COLORS.find((c) => c.id === id) ?? defaultCourseColor(courseName);
```

- [ ] **Step 4: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green (new exports are allowed to be unconsumed at this point).

---

### Task 2: Data layer — `useCourseColors`, hook fixes, `DashboardData` plumbing

**Files:**
- Create: `src/hooks/useCourseColors.ts`
- Modify: `src/hooks/useCoursePreferences.ts`
- Modify: `src/types/coursePreferences.ts` (drop `resetPreferences` from the hook interface)
- Modify: `src/hooks/useSemesterAssessments.ts` (hygiene: stray `title` field)
- Modify: `src/types/dashboard.ts`
- Modify: `src/components/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: `CourseColorId` (Task 1).
- Produces: `useCourseColors(user: User | null, semesterId: string): { courseColors: Record<string, CourseColorId>; setCourseColor: (courseName: string, color: CourseColorId) => Promise<void> }`; `DashboardData` gains `courseColors` and `setCourseColor` with those exact types. `CoursePreferencesHook` loses `resetPreferences`.

- [ ] **Step 1: Create `src/hooks/useCourseColors.ts`**

```ts
import { useCallback, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getCoursePreferencesDocRef } from "../lib/firebaseUtils";
import { CourseColorId } from "../types/coursePreferences";

/**
 * Stored course colors for a semester (courseName -> colorId), live via
 * onSnapshot. Only explicit user choices are stored; unset courses resolve to
 * their name-hash default at render time (constants/courseColors.ts), so a
 * failed read still paints every course. Local writes emit a cache snapshot
 * immediately, so the UI updates optimistically without extra state.
 */
export function useCourseColors(user: User | null, semesterId: string) {
  const [courseColors, setCourseColors] = useState<Record<string, CourseColorId>>({});

  useEffect(() => {
    if (!user || !semesterId) {
      setCourseColors({});
      return;
    }

    const prefsRef = collection(db, "users", user.uid, "semesters", semesterId, "coursePreferences");
    const unsubscribe = onSnapshot(
      prefsRef,
      (snapshot) => {
        const colors: Record<string, CourseColorId> = {};
        snapshot.forEach((docSnap) => {
          const color = docSnap.data().color;
          // Unknown strings are tolerated: getCourseColor falls back to the default
          if (typeof color === "string") {
            colors[docSnap.id] = color as CourseColorId;
          }
        });
        setCourseColors(colors);
      },
      (err) => {
        console.error("Error loading course colors:", err);
        setCourseColors({});
      },
    );
    return unsubscribe;
  }, [user, semesterId]);

  const setCourseColor = useCallback(
    async (courseName: string, color: CourseColorId) => {
      if (!user || !semesterId) {
        throw new Error("User not authenticated or semester not selected");
      }
      await setDoc(getCoursePreferencesDocRef(user.uid, semesterId, courseName), { color }, { merge: true });
    },
    [user, semesterId],
  );

  return { courseColors, setCourseColor };
}
```

- [ ] **Step 2: Fix `src/hooks/useCoursePreferences.ts`**

Three changes (a color-first doc must never break the grade calculator, and writes must never clobber `color`):

1. In `loadPreferences`, replace the `if (preferencesDoc.exists()) { ... } else { ... }` body with:

```ts
        if (preferencesDoc.exists()) {
          // Merge over defaults: a doc created color-first has no targetGrade yet
          const data = {
            ...DEFAULT_COURSE_PREFERENCES,
            ...(preferencesDoc.data() as Partial<CoursePreferences>),
          };
          setPreferences(data);
        } else {
          // Create default preferences for new course (merge: never clobber
          // a concurrent color write)
          const defaultPrefs = { ...DEFAULT_COURSE_PREFERENCES };
          await setDoc(preferencesRef, defaultPrefs, { merge: true });
          setPreferences(defaultPrefs);
        }
```

2. In `updateTargetGrade`, replace the non-existing-doc branch's `setDoc` call with a merge write:

```ts
          await setDoc(
            preferencesRef,
            { ...DEFAULT_COURSE_PREFERENCES, targetGrade },
            { merge: true },
          );
```

3. Delete the entire `resetPreferences` callback and remove it from the returned object (it is exported but consumed nowhere, and its whole-doc overwrite would wipe stored colors). The return becomes:

```ts
  return {
    preferences,
    loading,
    error,
    updateTargetGrade,
  };
```

In `src/types/coursePreferences.ts`, delete the `resetPreferences: () => Promise<void>;` line from `CoursePreferencesHook`.

- [ ] **Step 3: Hygiene fix in `src/hooks/useSemesterAssessments.ts`**

In the `snapshot.docs.map` mapper, delete the line `title: data.assignmentName || "Unknown Assessment",` (a stray field that is not part of the `Assessment` type).

- [ ] **Step 4: Extend `src/types/dashboard.ts`**

Add the import and two fields:

```ts
import { Assessment } from "./assessment";
import { CourseStats } from "./course";
import { CourseColorId } from "./coursePreferences";

export interface DashboardData {
  selectedSemester: string;
  selectedSemesterId: string;
  assessments: Assessment[];
  courses: CourseStats[];
  availableCourses: string[];
  error: string | null;
  stats: {
    total: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    upcomingDeadlines: number;
    completionRate: number;
  };
  refreshAssessments: () => void;
  refreshTrigger: number;
  /** Explicitly stored colors only; resolve with getCourseColor(map[name], name). */
  courseColors: Record<string, CourseColorId>;
  setCourseColor: (courseName: string, color: CourseColorId) => Promise<void>;
}
```

(`TabComponentProps` and `CoursesTabProps` are unchanged.)

- [ ] **Step 5: Wire the hook in `src/components/layout/DashboardLayout.tsx`**

1. Replace the inline `children` props type with the shared type (it duplicates `DashboardData` field-for-field today — hygiene):

```ts
import { DashboardData } from "../../types/dashboard";

interface DashboardLayoutProps {
  children: (props: DashboardData) => React.ReactNode;
  title?: string;
  description?: string;
  forceSemesterId?: string;
}
```

Remove the now-unused `Assessment`, `CourseStats`, and `DashboardStats` imports (keep `useSemesterAssessments`).

2. Instantiate the hook after `useSemesterAssessments`:

```ts
import { useCourseColors } from "../../hooks/useCourseColors";
// ...
  const { courseColors, setCourseColor } = useCourseColors(user, selectedSemesterId);
```

3. Add both to `childData` and its dependency array:

```ts
  const childData = useMemo(
    () => ({
      selectedSemester,
      selectedSemesterId,
      assessments,
      courses,
      availableCourses,
      error,
      stats,
      refreshAssessments,
      refreshTrigger,
      courseColors,
      setCourseColor,
    }),
    [
      selectedSemester,
      selectedSemesterId,
      assessments,
      courses,
      availableCourses,
      error,
      stats,
      refreshAssessments,
      refreshTrigger,
      courseColors,
      setCourseColor,
    ],
  );
```

- [ ] **Step 6: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

---

### Task 3: `CourseColorDot` + `CourseColorSwatches`

**Files:**
- Create: `src/components/ui/CourseColorDot.tsx`
- Create: `src/components/ui/CourseColorSwatches.tsx`

**Interfaces:**
- Consumes: `COURSE_COLORS`, `CourseColor` (Task 1); `CourseColorId` (Task 1).
- Produces: `<CourseColorDot color={CourseColor} className? />` and `<CourseColorSwatches value={CourseColorId} onSelect={(id: CourseColorId) => void} ariaLabel={string} disabled? className? />`. Selection is instant-apply: callers persist inside `onSelect` and surface their own failure alert.

- [ ] **Step 1: Create `src/components/ui/CourseColorDot.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { CourseColor } from "../../constants/courseColors";

/**
 * The shared course-color dot (standards.md v4.3): decorative reinforcement
 * beside a visible course name — never the only identity carrier, never
 * interactive by itself.
 */
const CourseColorDot = ({ color, className }: { color: CourseColor; className?: string }) => (
  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", color.dotClass, className)} />
);

export default CourseColorDot;
```

- [ ] **Step 2: Create `src/components/ui/CourseColorSwatches.tsx`**

```tsx
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { COURSE_COLORS } from "../../constants/courseColors";
import { CourseColorId } from "../../types/coursePreferences";

interface CourseColorSwatchesProps {
  value: CourseColorId;
  onSelect: (color: CourseColorId) => void;
  /** Names the radiogroup for screen readers, e.g. `Color for CS 101`. */
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The shared course color selector (standards.md v4.3): one radiogroup row of
 * eight swatches, roving tabindex (arrows move focus, Enter/Space selects).
 * The selected ring is self-colored — an amber ring around a colored swatch
 * clashes; keyboard focus keeps the standard amber focus-visible ring.
 */
const CourseColorSwatches = ({
  value,
  onSelect,
  ariaLabel,
  disabled,
  className,
}: CourseColorSwatchesProps) => {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % COURSE_COLORS.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (index - 1 + COURSE_COLORS.length) % COURSE_COLORS.length;
    if (next !== null) {
      e.preventDefault();
      buttonsRef.current[next]?.focus();
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      {COURSE_COLORS.map((color, index) => {
        const isSelected = color.id === value;
        return (
          <button
            key={color.id}
            ref={(el) => {
              buttonsRef.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={color.label}
            disabled={disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(color.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full outline-hidden transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50 motion-safe:hover:scale-110 md:size-9"
          >
            <span
              aria-hidden
              className={cn(
                "size-5 rounded-full",
                color.dotClass,
                isSelected && cn("ring-2 ring-offset-2 ring-offset-card", color.ringClass),
              )}
            />
          </button>
        );
      })}
    </div>
  );
};

export default CourseColorSwatches;
```

- [ ] **Step 3: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

---

### Task 4: Courses tab — dot on cards, swatches in edit state

**Files:**
- Modify: `src/types/course.ts` (`CoursesOverviewTableProps`)
- Modify: `src/components/pages/UnifiedDashboardPage.tsx` (`CoursesTab` only)
- Modify: `src/components/tables/CoursesOverviewTable.tsx`

**Interfaces:**
- Consumes: `getCourseColor` (Task 1), `CourseColorDot` + `CourseColorSwatches` (Task 3), `data.courseColors` / `data.setCourseColor` (Task 2).
- Produces: `CoursesOverviewTableProps` gains `courseColors: Record<string, CourseColorId>` and `setCourseColor: (courseName: string, color: CourseColorId) => Promise<void>`.

- [ ] **Step 1: Extend `src/types/course.ts`**

```ts
import { CourseColorId } from "./coursePreferences";
```

and in `CoursesOverviewTableProps` add:

```ts
  courseColors: Record<string, CourseColorId>;
  setCourseColor: (courseName: string, color: CourseColorId) => Promise<void>;
```

- [ ] **Step 2: Pass the props in `UnifiedDashboardPage.tsx`'s `CoursesTab`**

```tsx
const CoursesTab = memo(function CoursesTab({ data, onSelectCourse }: CoursesTabProps) {
  const { error, courses, selectedSemesterId, refreshAssessments, courseColors, setCourseColor } =
    data;

  return (
    <>
      {error ? (
        <TabError message={error} />
      ) : (
        <CoursesOverviewTable
          courses={courses}
          onSelectCourse={onSelectCourse}
          semesterId={selectedSemesterId}
          onCourseRenamed={refreshAssessments}
          courseColors={courseColors}
          setCourseColor={setCourseColor}
        />
      )}
    </>
  );
});
```

- [ ] **Step 3: Update `CoursesOverviewTable.tsx`**

1. New imports and props:

```tsx
import { CircleAlert } from "lucide-react";
import { getCourseColor } from "../../constants/courseColors";
import { CourseColorId } from "../../types/coursePreferences";
import { Alert, AlertDescription } from "../ui/alert";
import CourseColorDot from "../ui/CourseColorDot";
import CourseColorSwatches from "../ui/CourseColorSwatches";
```

```tsx
const CoursesOverviewTable = ({
  courses,
  onSelectCourse,
  semesterId,
  onCourseRenamed,
  courseColors,
  setCourseColor,
}: CoursesOverviewTableProps) => {
```

2. Color-save state + handler next to the existing rename state (the live listener repaints instantly from the local cache, so no optimistic state is needed; a server rejection reverts the snapshot and we surface the alert):

```tsx
  const [colorError, setColorError] = useState<string | null>(null);

  const handleColorSelect = async (courseName: string, color: CourseColorId) => {
    setColorError(null);
    try {
      await setCourseColor(courseName, color);
    } catch (error) {
      console.error("Error saving course color:", error);
      setColorError("Failed to save course color. Please try again.");
    }
  };
```

3. Render the alert once, directly under `<PanelHeader title="Courses" />` in the non-empty branch:

```tsx
      {colorError && (
        <Alert variant="destructive" className="mb-4">
          <CircleAlert aria-hidden />
          <AlertDescription>{colorError}</AlertDescription>
        </Alert>
      )}
```

4. Inside the card map, resolve the color once at the top (beside `daysUntilDue`):

```tsx
          const color = getCourseColor(courseColors[course.courseName], course.courseName);
```

5. Card view: the dot flows inline inside the `h3` so it hugs the first text line even when the name wraps:

```tsx
                <div className="flex min-h-9 items-center gap-1">
                  <h3 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold text-foreground">
                    <CourseColorDot color={color} className="mb-0.5 mr-2 inline-block align-middle" />
                    {course.courseName}
                  </h3>
                  {/* existing rename pencil Button unchanged */}
                </div>
```

6. Edit state: keep the existing `Input` exactly as is, and add the swatch row directly below it (still inside the `editingCourse === course.courseName` branch — wrap `Input` + swatches in a fragment). Color taps must not trigger card navigation:

```tsx
                <>
                  <Input
                    /* existing props unchanged */
                  />
                  <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                    <CourseColorSwatches
                      value={color.id}
                      onSelect={(newColor) => handleColorSelect(course.courseName, newColor)}
                      ariaLabel={`Color for ${course.courseName}`}
                    />
                  </div>
                </>
```

- [ ] **Step 4: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 5: Manual spot-check (both themes)**

`npm run dev` → Courses tab: every card shows a dot (defaults differ by name); pencil → swatch row appears; picking a color updates the card instantly and survives reload; Escape/blur still exits rename; card click still navigates.

---

### Task 5: Assessments surfaces — rows, breadcrumb, extraction modal

**Files:**
- Modify: `src/types/assessment.ts` (`AssessmentsTableProps`)
- Modify: `src/types/course.ts` (`CourseFilteredAssessmentsProps`)
- Modify: `src/components/tables/AssessmentsTable.tsx`
- Modify: `src/components/tables/assessments/AssessmentRow.tsx`
- Modify: `src/components/assessment/CourseFilteredAssessments.tsx`
- Modify: `src/components/pages/UnifiedDashboardPage.tsx` (`AssessmentsTab` only)
- Modify: `src/components/modals/ExtractionSuccessModal.tsx`

**Interfaces:**
- Consumes: `getCourseColor`, `CourseColor` (Task 1), `CourseColorDot` (Task 3), `data.courseColors` (Task 2).
- Produces: `AssessmentsTableProps` and `CourseFilteredAssessmentsProps` gain `courseColors: Record<string, CourseColorId>`; `AssessmentRow` gains a required `courseColor: CourseColor` prop.

- [ ] **Step 1: Extend the two prop types**

`src/types/assessment.ts` — add to the imports `import type { CourseColorId } from "./coursePreferences";` and to `AssessmentsTableProps`:

```ts
  courseColors: Record<string, CourseColorId>;
```

`src/types/course.ts` — add to `CourseFilteredAssessmentsProps`:

```ts
  courseColors: Record<string, CourseColorId>;
```

- [ ] **Step 2: `AssessmentsTable.tsx` — accept and resolve**

Add imports:

```tsx
import { getCourseColor } from "../../constants/courseColors";
```

Accept the prop:

```tsx
const AssessmentsTable: React.FC<AssessmentsTableProps> = ({
  assessments,
  semesterId,
  onStatusChange,
  title = "Assessments",
  courseColors,
}) => {
```

In the row map, pass the resolved color to `AssessmentRow` (read rows only; the edit row has no dot):

```tsx
                <AssessmentRow
                  key={assessment.id}
                  assessment={assessment}
                  courseColor={getCourseColor(courseColors[assessment.courseName], assessment.courseName)}
                  /* ...all existing props unchanged... */
                />
```

- [ ] **Step 3: `AssessmentRow.tsx` — the dot in both layouts**

Imports and props:

```tsx
import { CourseColor } from "../../../constants/courseColors";
import CourseColorDot from "../../ui/CourseColorDot";

interface AssessmentRowProps {
  assessment: Assessment;
  courseColor: CourseColor;
  /* ...existing props unchanged... */
}
```

Mobile card — replace the course-name `<p>` inside the `flex items-center justify-between gap-3` row with:

```tsx
          <div className="flex min-w-0 items-center gap-1.5">
            <CourseColorDot color={courseColor} />
            <p className="truncate text-sm font-medium text-muted-foreground">
              {assessment.courseName}
            </p>
          </div>
```

Desktop grid — replace `<p className="truncate text-sm text-muted-foreground">{assessment.courseName}</p>` with:

```tsx
      <div className="flex min-w-0 items-center gap-1.5">
        <CourseColorDot color={courseColor} />
        <p className="truncate text-sm text-muted-foreground">{assessment.courseName}</p>
      </div>
```

(The grid template in `tableGrid.ts` is untouched — the dot lives inside the course cell.)

- [ ] **Step 4: `CourseFilteredAssessments.tsx` — breadcrumb dot + passthrough**

Add imports:

```tsx
import { getCourseColor } from "../../constants/courseColors";
import CourseColorDot from "../ui/CourseColorDot";
```

Accept the prop and resolve:

```tsx
const CourseFilteredAssessments = ({
  semesterId,
  selectedCourse,
  onBack,
  courseColors,
}: CourseFilteredAssessmentsProps) => {
  // ...
  const courseColor = getCourseColor(courseColors[selectedCourse], selectedCourse);
```

Breadcrumb current crumb becomes dot + name:

```tsx
      <span className="flex min-w-0 items-center gap-2">
        <CourseColorDot color={courseColor} />
        <span className="truncate">{selectedCourse}</span>
      </span>
```

(this replaces the bare `<span className="truncate">{selectedCourse}</span>` inside the existing breadcrumb; the "Courses" back button and separator stay as they are). Pass the map through to the table at the bottom:

```tsx
    <AssessmentsTable
      title={breadcrumb}
      assessments={assessments}
      semesterId={semesterId}
      onStatusChange={refetch}
      courseColors={courseColors}
    />
```

- [ ] **Step 5: `UnifiedDashboardPage.tsx` — `AssessmentsTab` wiring**

Destructure `courseColors` from `data` and pass it to both children:

```tsx
  const { selectedSemesterId, assessments, error, refreshAssessments, courseColors } = data;
```

```tsx
        <CourseFilteredAssessments
          semesterId={selectedSemesterId}
          selectedCourse={selectedCourse}
          onBack={handleClearCourseSelection}
          courseColors={courseColors}
        />
```

```tsx
            <AssessmentsTable
              assessments={assessments}
              semesterId={selectedSemesterId}
              onStatusChange={refreshAssessments}
              courseColors={courseColors}
            />
```

- [ ] **Step 6: `ExtractionSuccessModal.tsx` — default-resolved dots**

The modal appears seconds after upload, before any custom color exists, so it resolves defaults only (no live map needed). Add imports:

```tsx
import { getCourseColor } from "../../constants/courseColors";
import CourseColorDot from "../ui/CourseColorDot";
```

In the `courseBreakdown` row, wrap the name:

```tsx
                    <span className="flex min-w-0 items-center gap-1.5">
                      <CourseColorDot color={getCourseColor(undefined, course.courseName)} />
                      <span className="truncate text-sm font-medium text-foreground">
                        {course.courseName}
                      </span>
                    </span>
```

- [ ] **Step 7: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 8: Manual spot-check (both themes, desktop + mobile width)**

Assessments tab rows show dots matching the Courses tab; filtered view breadcrumb shows the dot; a course recolored in the Courses tab updates Assessments rows live (shared listener); upload flow's success modal shows dots.

---

### Task 6: Grades tab — switcher dots + grade calculator refresh

**Files:**
- Modify: `src/components/pages/UnifiedDashboardPage.tsx` (`GradesTab` only)
- Rewrite: `src/components/assessment/grade-calculator/GradeOverviewCards.tsx`
- Rewrite: `src/components/assessment/grade-calculator/AssessmentBreakdown.tsx`

**Interfaces:**
- Consumes: `getCourseColor` (Task 1), `CourseColorDot` (Task 3), `data.courseColors` (Task 2), `formatLocalDate` (`utils/dateUtils`, existing).
- Produces: no interface changes — `GradeOverviewCards` and `AssessmentBreakdown` keep their existing props exactly (visual-only refresh).

- [ ] **Step 1: `GradesTab` switcher dots in `UnifiedDashboardPage.tsx`**

Destructure the map:

```tsx
  const { selectedSemesterId, availableCourses, courseColors } = data;
```

Trigger button content (dot + truncating name; chevron unchanged):

```tsx
                  <span className="flex min-w-0 items-center gap-1.5">
                    {selectedCourse && (
                      <CourseColorDot
                        color={getCourseColor(courseColors[selectedCourse], selectedCourse)}
                      />
                    )}
                    <span className="min-w-0 truncate">{selectedCourse || "Select a course"}</span>
                  </span>
```

Menu items:

```tsx
                {availableCourses.map((course: string) => (
                  <DropdownMenuItem
                    key={course}
                    data-selected={selectedCourse === course}
                    onSelect={() => setSelectedCourse(course)}
                  >
                    <CourseColorDot color={getCourseColor(courseColors[course], course)} />
                    <span className="truncate">{course}</span>
                  </DropdownMenuItem>
                ))}
```

Add the imports to the file (top-level, shared with Tasks 4–5 edits):

```tsx
import { getCourseColor } from "../../constants/courseColors";
import CourseColorDot from "../ui/CourseColorDot";
```

- [ ] **Step 2: Rewrite `GradeOverviewCards.tsx`**

Full new contents (visual changes only: caption-tier stat labels matching the dashboard stats bar, normalized tile rhythm, right-aligned tabular target input; all props, math, and bar logic unchanged):

```tsx
import { GradeInfo, getProgressBarColor } from "../../../utils/gradeCalculations";
import { cn } from "@/lib/utils";
import { Input } from "../../ui/input";

interface GradeOverviewCardsProps {
  currentGrade: number | null;
  currentGradeInfo: GradeInfo | null;
  totalWeight: number;
  targetGrade: number;
  onTargetGradeChange: (value: number) => void;
  preferencesLoading: boolean;
  requiredGrade: number | null;
}

/** Weight completeness is a checklist, not a grade: full = success, over = error, else in progress. */
const weightBarColor = (totalWeight: number) =>
  totalWeight === 100 ? "bg-success" : totalWeight > 100 ? "bg-destructive" : "bg-primary";

/** The three summary tiles: current grade, course weight, target grade + projection. */
const GradeOverviewCards = ({
  currentGrade,
  currentGradeInfo,
  totalWeight,
  targetGrade,
  onTargetGradeChange,
  preferencesLoading,
  requiredGrade,
}: GradeOverviewCardsProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    {/* Current grade */}
    <div className="rounded-xl bg-secondary/50 p-5">
      <div className="mb-2 flex min-h-5 items-center justify-between gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">Current grade</h3>
        {currentGradeInfo && (
          <span
            className={cn(
              "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium",
              currentGradeInfo.tintClass,
            )}
          >
            {currentGradeInfo.letter}
          </span>
        )}
      </div>
      {currentGrade !== null ? (
        <>
          <p className="text-xl font-semibold text-foreground md:text-2xl">
            {currentGrade.toFixed(1)}%
          </p>
          <div className="mt-3 h-1.5 w-full rounded-full bg-foreground/10">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                getProgressBarColor(currentGrade),
              )}
              style={{ width: `${Math.min(currentGrade, 100)}%` }}
            />
          </div>
          {currentGradeInfo && (
            <p className="mt-3 text-sm text-muted-foreground">GPA: {currentGradeInfo.gpa}</p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No completed assessments yet</p>
      )}
    </div>

    {/* Course weight */}
    <div className="rounded-xl bg-secondary/50 p-5">
      <div className="mb-2 flex min-h-5 items-center">
        <h3 className="text-xs font-medium text-muted-foreground">Course weight</h3>
      </div>
      <p className="text-xl font-semibold tabular-nums text-foreground md:text-2xl">
        {totalWeight.toFixed(2)}%
      </p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-foreground/10">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            weightBarColor(totalWeight),
          )}
          style={{ width: `${Math.min(totalWeight, 100)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {totalWeight === 100
          ? "Complete"
          : totalWeight > 100
            ? "Over 100%"
            : `${(100 - totalWeight).toFixed(2)}% remaining`}
      </p>
    </div>

    {/* Target grade & projection */}
    <div className="rounded-xl bg-secondary/50 p-5">
      <div className="mb-2 flex min-h-5 items-center">
        <h3 className="text-xs font-medium text-muted-foreground">Target grade</h3>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          max="100"
          value={targetGrade}
          onChange={(e) => onTargetGradeChange(parseFloat(e.target.value) || 0)}
          disabled={preferencesLoading}
          aria-label="Target grade"
          className="h-9 w-20 px-3 text-right tabular-nums"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>
      {requiredGrade !== null && (
        <p className="mt-3 text-sm text-muted-foreground">
          Need{" "}
          <span
            className={cn(
              "font-medium tabular-nums",
              requiredGrade > 100 ? "text-destructive" : "text-success",
            )}
          >
            {requiredGrade.toFixed(1)}%
          </span>{" "}
          average on remaining assessments
        </p>
      )}
    </div>
  </div>
);

export default GradeOverviewCards;
```

- [ ] **Step 3: Rewrite `AssessmentBreakdown.tsx`**

Full new contents (visual changes only: one shared grid template for header and rows so they can't drift, right-aligned `tabular-nums` numeric columns, `formatLocalDate` instead of raw `toLocaleDateString`, row padding matched to the assessments table's `p-4 lg:py-3`; status logic, inputs, and callbacks unchanged):

```tsx
import { ChartColumn, CircleAlert, CircleCheck, CircleDashed, type LucideIcon } from "lucide-react";
import { Assessment } from "../../../types/assessment";
import { cn } from "@/lib/utils";
import { formatLocalDate } from "../../../utils/dateUtils";
import { Input } from "../../ui/input";
import EmptyState from "../../ui/EmptyState";
import { statusTintClasses } from "../../tables/assessments/StatusSelect";

interface AssessmentBreakdownProps {
  assessments: Assessment[];
  onWeightChange: (assessmentId: string, value: string) => void;
  onMarkChange: (assessmentId: string, value: string) => void;
}

/* One grid template, two consumers (header + rows) — the tableGrid.ts rule
   applied to the breakdown. Columns: assessment · status · weight · mark · points. */
const gradeGridClass =
  "hidden lg:grid lg:grid-cols-[minmax(0,1fr)_5rem_7rem_7rem_5rem] lg:items-center lg:gap-4";

/** Status marker (icon + tint) for a row; overdue is derived, not stored. */
const getAssessmentStatus = (
  assessment: Assessment,
): { icon: LucideIcon; tintClass: string; label: string } => {
  const now = new Date();
  const dueDate = new Date(`${assessment.dueDate}T${assessment.dueTime}`);

  if (assessment.status === "Submitted") {
    return { icon: CircleCheck, tintClass: statusTintClasses.Submitted, label: "Submitted" };
  }
  if (dueDate < now) {
    return { icon: CircleAlert, tintClass: statusTintClasses.Missed, label: "Overdue" };
  }
  return { icon: CircleDashed, tintClass: statusTintClasses["Not started"], label: "Pending" };
};

const hideNumberSpinners =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

/** Editable weight/mark list for all assessments in the selected course. */
const AssessmentBreakdown = ({
  assessments,
  onWeightChange,
  onMarkChange,
}: AssessmentBreakdownProps) => (
  <div>
    <div className="mb-4">
      <h3 className="text-base font-semibold text-foreground">Assessment breakdown</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Edit weights and marks to calculate your grade
      </p>
    </div>

    {assessments.length === 0 ? (
      <EmptyState
        icon={ChartColumn}
        title="No assessments yet"
        description="This course doesn't have any assessments yet."
      />
    ) : (
      <div className="space-y-2">
        {/* Desktop headers - hidden on mobile */}
        <div className={cn(gradeGridClass, "px-4 pb-1")}>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Assessment
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Weight
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mark
          </span>
          <span className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Points
          </span>
        </div>

        <div className="space-y-2">
          {assessments.map((assessment) => {
            const status = getAssessmentStatus(assessment);
            const StatusIcon = status.icon;
            const contribution =
              assessment.mark && assessment.weight
                ? ((assessment.mark * assessment.weight) / 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={assessment.id}
                className="rounded-xl bg-secondary/50 p-4 transition-colors hover:bg-accent/50 lg:py-3"
              >
                {/* Mobile layout */}
                <div className="space-y-4 lg:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold leading-tight text-foreground">
                        {assessment.assignmentName}
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Due {formatLocalDate(assessment.dueDate)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        status.tintClass,
                      )}
                      title={status.label}
                    >
                      <StatusIcon className="size-4" aria-hidden />
                      <span className="sr-only">{status.label}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`weight-${assessment.id}`}
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Weight
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`weight-${assessment.id}`}
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={assessment.weight}
                          onChange={(e) =>
                            assessment.id && onWeightChange(assessment.id, e.target.value)
                          }
                          className={cn("text-right tabular-nums", hideNumberSpinners)}
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`mark-${assessment.id}`}
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Mark
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`mark-${assessment.id}`}
                          type="number"
                          min="0"
                          step="0.1"
                          value={assessment.mark ?? ""}
                          onChange={(e) =>
                            assessment.id && onMarkChange(assessment.id, e.target.value)
                          }
                          placeholder="--"
                          className={cn("text-right tabular-nums", hideNumberSpinners)}
                        />
                        <span className="shrink-0 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-sm text-muted-foreground">Points contribution</span>
                    <span className="text-base font-semibold tabular-nums text-foreground">
                      {contribution}
                    </span>
                  </div>
                </div>

                {/* Desktop layout — same grid template as the header, one cell per column */}
                <div className={gradeGridClass}>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-medium text-foreground">
                      {assessment.assignmentName}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Due {formatLocalDate(assessment.dueDate)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        status.tintClass,
                      )}
                      title={status.label}
                    >
                      <StatusIcon className="size-4" aria-hidden />
                      <span className="sr-only">{status.label}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={assessment.weight}
                      onChange={(e) =>
                        assessment.id && onWeightChange(assessment.id, e.target.value)
                      }
                      aria-label="Weight"
                      className={cn("h-9 w-20 px-2 text-right tabular-nums", hideNumberSpinners)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={assessment.mark ?? ""}
                      onChange={(e) => assessment.id && onMarkChange(assessment.id, e.target.value)}
                      placeholder="--"
                      aria-label="Mark"
                      className={cn("h-9 w-20 px-2 text-right tabular-nums", hideNumberSpinners)}
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <p className="text-right text-sm font-medium tabular-nums text-foreground">
                    {contribution}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
);

export default AssessmentBreakdown;
```

- [ ] **Step 4: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 5: Manual spot-check (both themes, desktop + mobile width)**

Grades tab: switcher trigger and menu show dots; tiles read as label → number → meter → support with caption-tier labels; breakdown header tracks align with row cells; weight/mark/points right-aligned; dates match the format used elsewhere (no timezone shift vs the assessments table); editing weight/mark still auto-saves ("Saved" indicator) and recalculates.

---

### Task 7: Onboarding — color assignment in `UploadStep`, echo in `CompletionStep`

**Files:**
- Rewrite: `src/components/onboarding/steps/UploadStep.tsx`
- Modify: `src/components/onboarding/steps/CompletionStep.tsx`

**Interfaces:**
- Consumes: `useCourseColors` (Task 2), `getCourseColor` (Task 1), `CourseColorDot` + `CourseColorSwatches` (Task 3), `useAuth`, `useOnboarding` (`state.createdSemesterId`, `state.extractionResults`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Rewrite `UploadStep.tsx`**

Full new contents (adds the courses-detected list with expandable swatch rows after a successful upload; upload/skip/navigation logic unchanged):

```tsx
import React, { useState } from "react";
import { ChevronDown, CircleAlert, CircleCheck, CloudUpload } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { useOnboarding } from "../../../contexts/OnboardingContext";
import { useCourseColors } from "../../../hooks/useCourseColors";
import { getCourseColor } from "../../../constants/courseColors";
import { CourseColorId } from "../../../types/coursePreferences";
import { cn } from "@/lib/utils";
import { StepNavigation } from "../ui/StepNavigation";
import { OnboardingUploadForm } from "../OnboardingUploadForm";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import CourseColorDot from "../../ui/CourseColorDot";
import CourseColorSwatches from "../../ui/CourseColorSwatches";
import { ExtractionResult } from "../../../types/upload";

export function UploadStep() {
  const { user } = useAuth();
  const { state, setUploadComplete } = useOnboarding();
  const [hasAttemptedUpload, setHasAttemptedUpload] = useState(false);
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);

  const { courseColors, setCourseColor } = useCourseColors(user, state.createdSemesterId ?? "");

  const handleUploadSuccess = (results: ExtractionResult) => {
    setUploadComplete(results);
    setHasAttemptedUpload(true);
  };

  const handleSkipUpload = () => {
    // Allow skipping if they haven't attempted upload yet
    if (!hasAttemptedUpload) {
      setHasAttemptedUpload(true);
    }
  };

  const handleColorSelect = async (courseName: string, color: CourseColorId) => {
    setColorError(null);
    try {
      await setCourseColor(courseName, color);
    } catch (error) {
      console.error("Error saving course color:", error);
      setColorError("Failed to save course color. Please try again.");
    }
  };

  const courseBreakdown = state.extractionResults?.courseBreakdown ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
          <CloudUpload className="size-8 text-primary" aria-hidden />
        </div>
        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Upload your course outlines
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Upload your course files and we&apos;ll automatically extract your assessments.
        </p>
      </div>

      {/* Upload form */}
      {state.createdSemesterId && (
        <div className="mb-8">
          <OnboardingUploadForm
            semesterId={state.createdSemesterId}
            semesterName={state.semesterData.name}
            onUploadSuccess={handleUploadSuccess}
            showGuidance={true}
          />
        </div>
      )}

      {/* Success message */}
      {state.hasCompletedUpload && state.extractionResults && (
        <Alert variant="success" className="mb-8">
          <CircleCheck aria-hidden />
          <AlertTitle>Upload successful</AlertTitle>
          <AlertDescription>
            Found {state.extractionResults.totalAssessments} assessment(s) from{" "}
            {state.extractionResults.processedFiles} file(s).
          </AlertDescription>
        </Alert>
      )}

      {/* Course colors: each detected course gets a stable default; expand a row to change it */}
      {state.hasCompletedUpload && state.createdSemesterId && courseBreakdown.length > 0 && (
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Courses detected</p>
          <div className="rounded-xl bg-secondary/50 p-1.5">
            {courseBreakdown.map((course) => {
              const isOpen = openCourse === course.courseName;
              const color = getCourseColor(courseColors[course.courseName], course.courseName);
              return (
                <div key={course.courseName}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenCourse(isOpen ? null : course.courseName)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left outline-hidden transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <CourseColorDot color={color} />
                      <span className="truncate text-sm font-medium text-foreground">
                        {course.courseName}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {course.assessmentCount} assessment{course.assessmentCount !== 1 ? "s" : ""}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-muted-foreground transition-transform",
                          isOpen && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-2.5 pb-2">
                      <CourseColorSwatches
                        value={color.id}
                        onSelect={(newColor) => handleColorSelect(course.courseName, newColor)}
                        ariaLabel={`Color for ${course.courseName}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {colorError && (
            <Alert variant="destructive" className="mt-3">
              <CircleAlert aria-hidden />
              <AlertDescription>{colorError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <StepNavigation
        canGoNext={state.hasCompletedUpload || hasAttemptedUpload}
        nextLabel={state.hasCompletedUpload ? "Complete setup" : "Continue without upload"}
        showSkip={!state.hasCompletedUpload && !hasAttemptedUpload}
        skipLabel="Skip for now"
        onSkip={handleSkipUpload}
      />
    </div>
  );
}
```

Note: if `state.createdSemesterId` is typed as `string` (not `string | null`) in `OnboardingContext`, drop the `?? ""` — match the actual type, don't fight it.

- [ ] **Step 2: `CompletionStep.tsx` — read-only dot echo**

Add imports:

```tsx
import { useAuth } from "../../../contexts/AuthContext";
import { useCourseColors } from "../../../hooks/useCourseColors";
import { getCourseColor } from "../../../constants/courseColors";
import CourseColorDot from "../../ui/CourseColorDot";
```

Inside the component:

```tsx
  const { user } = useAuth();
  const { courseColors } = useCourseColors(user, state.createdSemesterId ?? "");
```

(Apply the same `?? ""` note as Step 1.) In the course-breakdown row, replace the bare name span with:

```tsx
                        <span className="flex min-w-0 items-center gap-1.5">
                          <CourseColorDot
                            color={getCourseColor(courseColors[course.courseName], course.courseName)}
                          />
                          <span className="truncate text-sm font-medium text-foreground">
                            {course.courseName}
                          </span>
                        </span>
```

- [ ] **Step 3: Verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 4: Manual spot-check (both themes)**

Fresh-account onboarding: upload a sample outline → courses appear with default dots; expand a row → swatches; change a color → dot updates instantly; CompletionStep shows the chosen dots; dashboard after onboarding shows the same colors. Skip upload → no course list appears anywhere.

---

### Task 8: `standards.md` v4.3 + final QA sweep

**Files:**
- Modify: `standards.md`

**Interfaces:** none — documentation + final verification.

- [ ] **Step 1: Update the `standards.md` header**

Replace the `Last updated:` line's opening with:

```
Last updated: 2026-07-22 (v4.3 — course categorical colors: the `--course-*` token family,
the course-dot recipe, the `CourseColorSwatches` selector (self-colored selection ring
exception), name-hash defaults resolved via `constants/courseColors.ts`; grade-calculator
tiles/breakdown aligned to the stat-tile and shared-grid recipes.
v4.2 2026-07-22: dashboard chrome codified: ...
```

(keep the existing v4.2 text as history, following the established pattern of demoting the previous entry.)

- [ ] **Step 2: Add the course-colors section**

Insert after the "Course cards (locked 2026-07-22)" section:

```markdown
### Course colors (locked 2026-07-22)

- **Eight categorical tokens** `--course-blue|teal|fuchsia|lime|violet|cyan|pink|indigo`
  (light 600-steps / dark 500-steps, teal/lime/cyan stay 600 — validated for both themes
  2026-07-22, see the course-colors spec). They are theme tokens like any other: defined in
  `globals.css`, exposed as `bg-course-*`/`ring-course-*`, no `dark:` variants at call sites.
- **`src/constants/courseColors.ts` is the only owner** of course-color classes and order.
  Components consume `CourseColor` objects via `getCourseColor(storedId, courseName)`; never
  state a `bg-course-*` class anywhere else, and never reorder `COURSE_COLORS` (name-hash
  defaults would shuffle).
- **Defaults are derived, not written**: an unset course renders its djb2 name-hash color;
  Firestore only stores explicit choices (`coursePreferences/{courseName}.color`), which
  therefore survive renames via the existing rename batch.
- **The dot recipe** (`ui/CourseColorDot`): `size-2 rounded-full` beside the course name,
  `aria-hidden` — decorative reinforcement next to visible text, never the only identity
  carrier, never interactive, no tooltip. Course names keep their type-ramp tier and text
  tokens (no colored course-name text, no tinted badges, no colored borders).
- **The swatch selector** (`ui/CourseColorSwatches`): a radiogroup row of eight swatches,
  roving tabindex, instant-apply (no Save button; failures surface an inline destructive
  alert). Selected state is a **self-colored ring** (`ring-2 ring-offset-2` in the swatch's
  own hue) — the one sanctioned exception to the amber selection language, because an amber
  ring around a colored swatch clashes; keyboard focus keeps the standard amber ring. Never
  a native OS color input.
```

- [ ] **Step 3: Final verification loop**

Run: `npm run format && npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all green.

- [ ] **Step 4: Full manual QA (founder-facing checklist)**

Both themes, desktop + mobile width:

1. Courses tab: default dots differ by name; pencil → swatches; pick a color → card, assessment rows, breadcrumb, grades switcher all update live; reload persists.
2. Rename a colored course → color follows the new name (prefs doc migrates in the rename batch).
3. Grades tab: refreshed tiles and breakdown; header/cell alignment; auto-save still works; target-grade projection correct for a course whose prefs doc was created color-first (set a color on a course you've never opened in Grades, then open Grades → target 85, no NaN).
4. Assessments tab: dots on desktop rows and mobile cards; filter and bulk actions unaffected.
5. Onboarding (fresh account): upload path with color changes, and skip path (no color UI).
6. Keyboard: swatch radiogroup arrows/Enter; card rename/Escape still works; focus rings visible.

---

## Self-review notes (already applied)

- Spec coverage: data model (T1/T2), tokens (T1), swatches + dot (T3), Courses tab (T4), Assessments surfaces incl. extraction modal (T5), Grades switcher + calculator refresh (T6), onboarding (T7), hygiene (T2 folds `title`-field and `resetPreferences` removals; commented-out type props die in T1; `DashboardLayout` children typing in T2), standards v4.3 (T8).
- Type consistency: `courseColors: Record<string, CourseColorId>` and `setCourseColor(courseName, color) => Promise<void>` are identical in `useCourseColors`, `DashboardData`, `CoursesOverviewTableProps`; `AssessmentRow` takes a resolved `CourseColor` (parent resolves via `getCourseColor`).
- Each task ends with the full verification loop green, so the plan can pause at any task boundary.
