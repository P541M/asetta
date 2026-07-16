# Step 1: Motion removal + semester-switch flicker fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the leftover entrance animations from app screens and make semester selection URL-first so the dropdown label never flickers.

**Architecture:** Selection state currently lives in three places (React state in `useSemesterSelection`, the URL, and `useSemesters`' auto-select callback), reconciled by async Firestore lookups — that race is the flicker. After this step, the URL's `[semester]` id is the only source of truth; the active semester derives synchronously from the already-loaded semester list. The `isDataReady`/`isHeaderReady` fade gates and their 50 ms timeouts are deleted; the only loading UI left is the first-load skeleton/spinner.

**Tech Stack:** Next.js 15 (pages router), React 19, TypeScript, Firebase Firestore (`onSnapshot`), Tailwind v4.

## Global Constraints

- Read `asetta/standards.md` before coding; all commands run from the `asetta/` directory.
- No entrance animations on app screens; feedback motion stays (standards.md "Motion").
- Semantic tokens only; `cn()` for conditional classes; Prettier printWidth 100; zero ESLint warnings.
- Comments only for constraints code can't express; narrating comments on touched lines are removed.
- **No test framework exists in this repo.** The project-defined verification loop replaces unit tests: `npm run lint && npm run format:check && npx tsc --noEmit && npm run build`.
- **Never run `git commit` or `git push`** — the founder owns all git operations (CLAUDE.md critical rule). "Commit" checkpoints are user handoffs, not agent actions.
- Spec: `docs/superpowers/specs/2026-07-16-ui-housekeeping-design.md` (step 1 section).

---

### Task 1: Remove the header greeting fade

**Files:**
- Modify: `src/components/layout/DashboardHeader.tsx:30-84`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: no API change — `DashboardHeader` props are unchanged.

- [ ] **Step 1: Delete the `isHeaderReady` gate**

In `src/components/layout/DashboardHeader.tsx`:

Remove the state declaration (line 30):

```tsx
const [isHeaderReady, setIsHeaderReady] = useState(false);
```

Replace the greeting effect (lines 34-66) with:

```tsx
useEffect(() => {
  const updateGreeting = () => {
    setGreeting(getPersonalizedGreeting(user, profile));
    setSubtitle(getRotatingSubtitle());
  };

  updateGreeting();

  const scheduleNextUpdate = () => {
    greetingTimeoutRef.current = setTimeout(() => {
      updateGreeting();
      scheduleNextUpdate();
    }, getMillisecondsToNextGreetingUpdate());
  };

  scheduleNextUpdate();

  return () => {
    if (greetingTimeoutRef.current) {
      clearTimeout(greetingTimeoutRef.current);
    }
  };
}, [user, profile]);
```

Replace the fade wrapper (line 75):

```tsx
<div className={isHeaderReady ? "motion-safe:animate-fade-in" : "opacity-0"}>
```

with:

```tsx
<div>
```

Keep the `{/* Personalized greeting */}` structure comment or drop it — but delete the
narrating comments tied to the removed mechanism ("Initialize and update greeting",
"Reset ready state when user/profile changes", "Small delay so the greeting fades in…",
"Initial greeting", "Schedule next update", "Cleanup timeout on unmount").

- [ ] **Step 2: Verify**

Run: `npm run lint && npx tsc --noEmit`
Expected: zero warnings, zero type errors. `useState` import must still be used (greeting/subtitle state remains) — if the editor flags unused imports, that's a missed deletion.

---

### Task 2: Remove the tab-content fade and the `isDataReady` machinery

**Files:**
- Modify: `src/hooks/useSemesterAssessments.ts:100,116,161-179,189`
- Modify: `src/types/dashboard.ts:10-11`
- Modify: `src/components/layout/DashboardLayout.tsx:16-28,49-50,102-127`
- Modify: `src/components/pages/UnifiedDashboardPage.tsx` (only if the grep in Step 3 hits it)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `useSemesterAssessments` returns `{ assessments, courses, availableCourses, isLoading, error, stats }` (no `isDataReady`). `DashboardData` (types/dashboard.ts) loses `isLoading` and `isDataReady`. `DashboardLayout`'s children-render-prop object loses `isLoading`/`isDataReady`. Task 3 edits `DashboardLayout` on top of this.

- [ ] **Step 1: Strip `isDataReady` from the hook**

In `src/hooks/useSemesterAssessments.ts`:

- Delete line 100: `const [isDataReady, setIsDataReady] = useState(false);`
- Delete line 116: `setIsDataReady(false);`
- Replace lines 161-166:

```ts
          setIsLoading(false);

          // Add a small delay before marking data as ready to ensure smooth animations
          setTimeout(() => {
            setIsDataReady(true);
          }, 50);
```

with:

```ts
          setIsLoading(false);
```

- Delete `setIsDataReady(true);` from both error paths (lines 172 and 179).
- Change the return (line 189) to:

```ts
return { assessments, courses, availableCourses, isLoading, error, stats };
```

- [ ] **Step 2: Update the shared type**

In `src/types/dashboard.ts`, delete both lines from `DashboardData`:

```ts
  isLoading: boolean;
  isDataReady: boolean;
```

(No dashboard tab consumes either — verified by audit; the grep in Step 3 double-checks.)

- [ ] **Step 3: Replace the fade gate in the layout with a plain first-load spinner**

In `src/components/layout/DashboardLayout.tsx`:

- In the `DashboardLayoutProps` children signature (lines 16-28), delete `isLoading: boolean;` and `isDataReady: boolean;`.
- Add the import: `import LoadingSpinner from "../ui/LoadingSpinner";`
- Destructure the hook without `isDataReady` (line 49-50):

```ts
const { assessments, courses, availableCourses, isLoading, error, stats } =
  useSemesterAssessments(user, selectedSemesterId);
```

- Replace the content panel (lines 107-127):

```tsx
<div className="mt-6">
  <div className="rounded-xl bg-card shadow-soft">
    {isLoading ? (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    ) : (
      children({
        selectedSemester,
        selectedSemesterId,
        assessments,
        courses,
        availableCourses,
        error,
        stats,
        refreshAssessments,
        refreshTrigger,
      })
    )}
  </div>
</div>
```

Note: `isLoading` is true only when there is no previous data (`hasDataRef` in the hook), so
switching between populated semesters swaps content directly with no spinner and no blank frame —
that behavior is intentional and stays.

Then confirm nothing else consumed the deleted fields:

Run: `Grep pattern "isDataReady" path asetta/src` and `Grep pattern "data.isLoading|isLoading," path asetta/src/components/pages`
Expected: zero hits for `isDataReady`; if `UnifiedDashboardPage.tsx` destructures `isLoading` from the render-prop object, delete it there too (the audit found no such use).

- [ ] **Step 4: Verify**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean. A type error naming `isDataReady` means a consumer was missed — fix it by deletion, not by re-adding the field.

---

### Task 3: URL-first semester selection (the flicker fix)

**Files:**
- Create: `src/hooks/useSemesters.ts`
- Delete: `src/components/assessment/semester-tabs/useSemesters.ts`
- Delete: `src/hooks/useSemesterSelection.ts`
- Modify: `src/types/course.ts:7-10`
- Modify: `src/components/layout/DashboardLayout.tsx` (selection wiring, on top of Task 2)
- Modify: `src/components/assessment/SemesterTabs.tsx` (full rewrite below)

**Interfaces:**
- Consumes: Task 2's `DashboardLayout` panel structure.
- Produces:
  - `useSemesters(user: User | null, forceSemesterId?: string)` → `{ semesters: Semester[], setSemesters: Dispatch<SetStateAction<Semester[]>>, isLoading: boolean, activeSemester: Semester | null }`
  - `SemesterTabsProps` = `{ semesters: Semester[]; setSemesters: Dispatch<SetStateAction<Semester[]>>; activeSemester: Semester | null; isLoading: boolean }`
  - `Semester` stays `{ id: string; name: string; order?: number }` (`src/types/semester.ts`, unchanged).

- [ ] **Step 1: Create the layout-level hook**

Create `src/hooks/useSemesters.ts` (this replaces the component-folder version; data hooks belong in `src/hooks/` per standards):

```ts
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { collection, getDocs, onSnapshot, orderBy, query, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Semester } from "@/types/semester";

/**
 * Live semester list for the user (ordered by `order`), plus the one-time
 * migration that backfills the `order` field on older documents.
 *
 * The active semester derives synchronously: the URL's semester id when given,
 * else the first semester. No selection state exists outside the URL.
 */
export function useSemesters(user: User | null, forceSemesterId?: string) {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSemesters([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const semColRef = collection(db, "users", user.uid, "semesters");
    const q = query(semColRef, orderBy("order", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSemesters(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, name: docSnap.data().name })),
        );
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to semesters:", error);
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const migrateSemesters = async () => {
      if (!user) return;

      try {
        const semColRef = collection(db, "users", user.uid, "semesters");
        const snapshot = await getDocs(semColRef);
        const needsMigration = snapshot.docs.some((doc) => !doc.data().hasOwnProperty("order"));

        if (needsMigration) {
          const batch = writeBatch(db);
          snapshot.docs.forEach((doc, index) => {
            if (!doc.data().hasOwnProperty("order")) {
              batch.update(doc.ref, { order: index });
            }
          });
          await batch.commit();
        }
      } catch (error) {
        console.error("Error during migration:", error);
      }
    };

    migrateSemesters();
  }, [user]);

  const activeSemester = forceSemesterId
    ? (semesters.find((sem) => sem.id === forceSemesterId) ?? null)
    : (semesters[0] ?? null);

  return { semesters, setSemesters, isLoading, activeSemester };
}
```

Delete `src/components/assessment/semester-tabs/useSemesters.ts` and `src/hooks/useSemesterSelection.ts`.

- [ ] **Step 2: Update `SemesterTabsProps`**

In `src/types/course.ts`, replace lines 7-10 with:

```ts
export interface SemesterTabsProps {
  semesters: Semester[];
  setSemesters: Dispatch<SetStateAction<Semester[]>>;
  activeSemester: Semester | null;
  isLoading: boolean;
}
```

Add the needed imports at the top of the file:

```ts
import { Dispatch, SetStateAction } from "react";
import { Semester } from "./semester";
```

- [ ] **Step 3: Rewire `DashboardLayout`**

In `src/components/layout/DashboardLayout.tsx`:

- Replace the `useSemesterSelection` import with `import { useSemesters } from "../../hooks/useSemesters";`
- Replace the selection block (previously lines 45-48):

```ts
const { selectedSemester, setSelectedSemester, selectedSemesterId } = useSemesterSelection(
  user,
  forceSemesterId,
);
```

with:

```ts
const {
  semesters,
  setSemesters,
  isLoading: semestersLoading,
  activeSemester,
} = useSemesters(user, forceSemesterId);
const selectedSemester = activeSemester?.name ?? "";
const selectedSemesterId = activeSemester?.id ?? "";
```

- Replace the `SemesterTabs` usage:

```tsx
<SemesterTabs
  semesters={semesters}
  setSemesters={setSemesters}
  activeSemester={activeSemester}
  isLoading={semestersLoading}
/>
```

- [ ] **Step 4: Rewrite `SemesterTabs` as a URL-driven view**

Replace the full contents of `src/components/assessment/SemesterTabs.tsx` with:

```tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import { useTab } from "../../contexts/TabContext";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  getDocs,
  writeBatch,
  limit,
} from "firebase/firestore";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";
import { Check, ChevronsUpDown, GraduationCap, Settings2 } from "lucide-react";
import { Semester } from "@/types/semester";
import { SemesterTabsProps } from "@/types/course";
import { cn } from "@/lib/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import SemesterTabsSkeleton from "./semester-tabs/SemesterTabsSkeleton";
import ManageSemestersModal from "./semester-tabs/ManageSemestersModal";

const SemesterTabs = ({ semesters, setSemesters, activeSemester, isLoading }: SemesterTabsProps) => {
  const { user } = useAuth();
  const { activeTab } = useTab();
  const router = useRouter();
  const [newSemester, setNewSemester] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [semesterToDelete, setSemesterToDelete] = useState<Semester | null>(null);

  const handleAddSemester = async () => {
    if (newSemester.trim() === "" || !user) return;

    try {
      setIsAdding(true);
      const semesterName = newSemester.trim();
      const semColRef = collection(db, "users", user.uid, "semesters");

      const exists = semesters.some(
        (sem) => sem.name.toLowerCase() === semesterName.toLowerCase(),
      );
      if (exists) {
        alert(`Semester "${semesterName}" already exists.`);
        setIsAdding(false);
        return;
      }

      const orderQuery = query(semColRef, orderBy("order", "desc"), limit(1));
      const orderSnapshot = await getDocs(orderQuery);
      const currentHighestOrder = orderSnapshot.docs[0]?.data()?.order ?? -1;

      const docRef = await addDoc(semColRef, {
        name: semesterName,
        createdAt: new Date(),
        order: currentHighestOrder + 1,
      });

      router.push(`/dashboard/${docRef.id}/assessments`);
      setNewSemester("");
      setShowManageModal(false);
    } catch (error) {
      console.error("Error adding semester:", error);
      alert("Failed to add semester. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSemester = (id: string) => {
    const semToDelete = semesters.find((sem) => sem.id === id);
    if (!semToDelete) return;

    setSemesterToDelete(semToDelete);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!user || !semesterToDelete) return;

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "users", user.uid, "semesters", semesterToDelete.id));

      const assessmentsRef = collection(
        db,
        "users",
        user.uid,
        "semesters",
        semesterToDelete.id,
        "assessments",
      );
      const assessmentSnapshot = await getDocs(assessmentsRef);
      assessmentSnapshot.docs.forEach((assessmentDoc) => batch.delete(assessmentDoc.ref));

      await batch.commit();

      if (semesterToDelete.id === activeSemester?.id) {
        const next = semesters.find((sem) => sem.id !== semesterToDelete.id);
        router.push(next ? `/dashboard/${next.id}/${activeTab}` : "/dashboard/assessments");
      }

      setShowDeleteModal(false);
      setSemesterToDelete(null);
    } catch (error) {
      console.error("Error deleting semester:", error);
      alert("Failed to delete semester. Please try again.");
    }
  };

  const handleEditSave = async (id: string, newName: string) => {
    if (!user) return;

    try {
      const updatedName = newName.trim();
      const existingWithSameName = semesters.some(
        (sem) => sem.id !== id && sem.name.toLowerCase() === updatedName.toLowerCase(),
      );
      if (existingWithSameName) {
        alert(`Semester "${updatedName}" already exists.`);
        return;
      }

      await updateDoc(doc(db, "users", user.uid, "semesters", id), {
        name: updatedName,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating semester:", error);
      alert("Failed to update semester name. Please try again.");
    }
  };

  // Optimistic reorder: without the local set, rows snap back until the batch commits
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = semesters.findIndex((s) => s.id === active.id);
    const newIndex = semesters.findIndex((s) => s.id === over.id);
    const newSemesters = arrayMove(semesters, oldIndex, newIndex);
    setSemesters(newSemesters);

    if (user) {
      try {
        const batch = writeBatch(db);
        newSemesters.forEach((sem, index) => {
          batch.update(doc(db, "users", user.uid, "semesters", sem.id), { order: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating semester order:", error);
      }
    }
  };

  if (isLoading) {
    return <SemesterTabsSkeleton />;
  }

  return (
    <div className="mb-6">
      {/* One switcher instead of pill clutter: current semester + everything else in the menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            className="min-w-44 justify-between md:min-w-56"
            aria-label="Switch semester"
          >
            <span className="flex min-w-0 items-center gap-2">
              <GraduationCap className="text-muted-foreground" aria-hidden />
              <span className="truncate">{activeSemester?.name ?? "Select semester"}</span>
            </span>
            <ChevronsUpDown className="text-muted-foreground" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {semesters.length > 0 ? (
            semesters.map((sem) => (
              <DropdownMenuItem
                key={sem.id}
                onSelect={() => router.push(`/dashboard/${sem.id}/${activeTab}`)}
              >
                <Check
                  className={cn(activeSemester?.id === sem.id ? "opacity-100" : "opacity-0")}
                  aria-hidden
                />
                <span className="truncate">{sem.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuLabel>No semesters yet</DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setShowManageModal(true)}>
            <Settings2 aria-hidden />
            Manage semesters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* One surface owns all semester management: add, reorder, rename, delete */}
      {showManageModal && (
        <ManageSemestersModal
          semesters={semesters}
          selectedSemester={activeSemester?.name ?? ""}
          onClose={() => {
            setShowManageModal(false);
            setNewSemester("");
          }}
          onDragEnd={handleDragEnd}
          onEdit={handleEditSave}
          onDelete={handleDeleteSemester}
          addValue={newSemester}
          onAddValueChange={setNewSemester}
          onAdd={handleAddSemester}
          isAdding={isAdding}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSemesterToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete semester"
        message={`Are you sure you want to delete the semester "${semesterToDelete?.name}" and all its assessments? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default SemesterTabs;
```

Behavior notes locked by this rewrite (deliberate):

- Switching semesters preserves the active tab (`router.push(/dashboard/{id}/{activeTab})`) —
  the old path-string parsing is gone. `useTab` is safe here: `DashboardLayout` renders only
  inside `TabProvider` (via `UnifiedDashboardPage`).
- Adding a semester still lands on the new semester's assessments view (a new semester has
  nothing to show elsewhere).
- The duplicate-name check for adds uses the in-memory list instead of a Firestore round trip —
  the list is live via `onSnapshot`, so it's the same data.
- Rename no longer touches local state or selection: the snapshot listener updates the list, and
  the label derives from it.

- [ ] **Step 5: Confirm the old plumbing is fully gone**

Run: `Grep pattern "useSemesterSelection|setSelectedSemester|onSelect(sems" path asetta/src`
Expected: zero hits.

Run: `Grep pattern "animate-fade-in" path asetta/src glob "*.tsx"`
Expected: hits ONLY in `UnifiedDashboardPage.tsx` (auto-save indicator), `OnboardingFlow.tsx`
(step transition — onboarding wizard, feedback-adjacent, out of scope for step 1),
`alert.tsx` (`fade-in-down`, feedback), `AssessmentEditRow.tsx`, and `BulkActionsBar.tsx`
(both feedback). None in `DashboardHeader`, `DashboardLayout`, or `SemesterTabs`.

- [ ] **Step 6: Verify**

Run: `npm run lint && npx tsc --noEmit`
Expected: clean.

---

### Task 4: Full verification loop + manual QA

**Files:** none (verification only).

- [ ] **Step 1: Run the complete project verification loop**

Run (from `asetta/`): `npm run lint && npm run format:check && npx tsc --noEmit && npm run build`
Expected: all four green. If `format:check` fails, run `npm run format` and re-run the loop.

- [ ] **Step 2: Manual QA in the browser**

Run: `npm run dev`, sign in, then check:

1. Switch semesters in the dropdown repeatedly: the trigger label changes exactly once per
   switch — never old→new→old→new. No skeleton reappears once the list is loaded.
2. Switch semesters while on the Calendar tab: you stay on Calendar for the new semester.
3. Hard-reload a `/dashboard/[semester]/assessments` URL: skeleton shows once, then the
   switcher and content appear with no fade-in.
4. The greeting renders immediately with no fade.
5. Delete the active semester (use a throwaway): you land on another semester, same tab;
   deleting the last semester lands on `/dashboard/assessments`.
6. Rename the active semester in Manage semesters: the trigger label updates via the live list.
7. Reorder semesters by drag: no snap-back.
8. Both themes: no visual regressions in the header/switcher area.

- [ ] **Step 3: Hand off for commit**

Report results to the founder; they commit (suggested message:
`fix: remove entrance animations and make semester selection URL-first`).
