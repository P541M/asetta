# Chrome step 1: bar + underline tabs + bottom nav — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the greeting header, standalone semester row, and pill tab bar into one two-row chrome (desktop) and a slim bar + fixed bottom navigation (mobile), with "Add assessment" as the chrome's primary CTA.

**Architecture:** `DashboardHeader` becomes the bar with two optional slots — `semesterProps` (renders the restyled `SemesterTabs` switcher; absent on settings) and `onAddAssessment` (renders the CTA; provided by `DashboardLayout`, which sits inside `TabProvider` and calls `setActiveTab("add")`). `TabNavigationBar` renders both navigations from one TABS array: text underline tabs on `md+`, fixed bottom nav below. The greeting system (`greetingUtils.ts`) is deleted; settings regains an in-page title. `SemesterTabs` keeps all data logic and modals — only its trigger, wrapper, and skeleton restyle.

**Tech Stack:** Existing React/Tailwind/lucide/shadcn stack; no new dependencies.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-17-dashboard-chrome-design.md` (step 1 section governs).
- standards.md rules; verification loop from `asetta/`; no agent git operations; no test framework (loop + manual QA); Node 22 via nvm-windows (`/c/nvm4w/nodejs` on PATH if a shell can't find node); stop dev servers before builds.
- URL structure, routing, tab-state mechanics, and deep links unchanged. `"add"` stays a valid `TabType`; when active, no tab in the row appears selected (it's an action surface, not a destination).
- The active-tab underline is amber selection language; the bottom nav separates by tone (`bg-card` + `shadow-soft`), never a border.

---

### Task 1: `TabNavigationBar` — both navigations

**Files:**
- Rewrite: `src/components/layout/TabNavigationBar.tsx`

**Interfaces:**
- Produces: `<TabNavigationBar />` (prop-less; the unused `className` prop dies — `DashboardLayout` is the only consumer and passes nothing). Renders desktop tabs inline in normal flow and the mobile nav as `position: fixed` (DOM placement irrelevant for mobile).

- [ ] **Step 1: Full new contents**

```tsx
import { BookOpen, Calendar, ChartColumn, ListChecks, type LucideIcon } from "lucide-react";
import { useTab, TabType } from "../../contexts/TabContext";
import { cn } from "../../lib/utils";

const TABS: { id: TabType; label: string; icon: LucideIcon }[] = [
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: ListChecks },
  { id: "grades", label: "Grades", icon: ChartColumn },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

/**
 * Both navigations for the four destination tabs: text-only underline tabs on
 * md+, a fixed bottom bar (icons as navigation aids) below md. "Add" is not a
 * tab — it is the chrome's primary action.
 */
const TabNavigationBar = () => {
  const { activeTab, setActiveTab } = useTab();

  return (
    <>
      {/* Desktop: underline tabs */}
      <div className="hidden gap-6 md:flex" role="tablist">
        {TABS.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(id)}
              className={cn(
                "min-h-11 border-b-2 px-0.5 text-sm outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Mobile: fixed bottom navigation (below the overlay recipe's z-150) */}
      <nav
        className="pb-safe fixed inset-x-0 bottom-0 z-40 bg-card shadow-soft md:hidden"
        role="tablist"
        aria-label="Primary"
      >
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-xs font-medium leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default TabNavigationBar;
```

- [ ] **Step 2:** `npx tsc --noEmit` — EXPECTED errors only where `DashboardLayout` still passes stale usage patterns (none expected — it passes no props today); nothing new elsewhere.

---

### Task 2: `DashboardHeader` becomes the bar; `SemesterTabs` trigger restyles

**Files:**
- Rewrite: `src/components/layout/DashboardHeader.tsx`
- Modify: `src/components/assessment/SemesterTabs.tsx` (wrapper div + trigger only)
- Rewrite: `src/components/assessment/semester-tabs/SemesterTabsSkeleton.tsx`

**Interfaces:**
- Consumes: `SemesterTabsProps` from `@/types/course` (existing: `{ semesters, setSemesters, activeSemester, isLoading }`).
- Produces: `DashboardHeaderProps` = `{ onLogout?: () => Promise<void>; semesterProps?: SemesterTabsProps; onAddAssessment?: () => void }`. Semester switcher renders only with `semesterProps`; CTA only with `onAddAssessment` (safe outside `TabProvider` when both are absent — `SemesterTabs`' internal `useTab()` never runs).

- [ ] **Step 1: DashboardHeader full new contents** (greeting state/effect/timers, `title` prop, and the trigger's name span are gone; the name already lives in the menu label):

```tsx
import { useRouter } from "next/router";
import { ChevronDown, LogOut, Plus, Settings } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserProfile } from "../../hooks/useUserProfile";
import { SemesterTabsProps } from "@/types/course";
import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";
import SemesterTabs from "../assessment/SemesterTabs";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DashboardHeaderProps {
  onLogout?: () => Promise<void>;
  semesterProps?: SemesterTabsProps;
  onAddAssessment?: () => void;
}

/** The app bar: wordmark, semester context switcher, primary action, user menu. */
const DashboardHeader = ({ onLogout, semesterProps, onAddAssessment }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();

  if (!user) return null;

  return (
    <header className="bg-background">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-2 px-4 py-3 md:gap-3 md:px-6">
        <Logo />
        {semesterProps && <SemesterTabs {...semesterProps} />}
        <div className="flex-1" />
        {onAddAssessment && (
          <>
            <Button type="button" onClick={onAddAssessment} className="hidden md:inline-flex">
              Add assessment
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={onAddAssessment}
              aria-label="Add assessment"
              className="md:hidden"
            >
              <Plus aria-hidden />
            </Button>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 outline-hidden transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-accent"
            aria-label="User menu"
          >
            <Avatar
              size="sm"
              name={profile?.displayName || user.displayName || user.email || undefined}
            />
            <ChevronDown
              className="size-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180"
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              Signed in as
              <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings aria-hidden />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onLogout?.()}>
              <LogOut aria-hidden />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
```

- [ ] **Step 2: SemesterTabs wrapper + trigger** — the outer `<div className="mb-6">` (bar owns spacing now) becomes `<div className="min-w-0">`, and the trigger block

```tsx
<Button
  type="button"
  variant="secondary"
  className="min-w-44 justify-between md:min-w-56"
  aria-label="Switch semester"
>
  <span className="min-w-0 truncate">{activeSemester?.name ?? "Select semester"}</span>
  <ChevronsUpDown className="text-muted-foreground" aria-hidden />
</Button>
```

becomes the quiet ghost control (shrinks gracefully in the bar via `min-w-0` + truncate):

```tsx
<Button
  type="button"
  variant="ghost"
  className="min-w-0 justify-start gap-1.5 px-2"
  aria-label="Switch semester"
>
  <span className="min-w-0 truncate">{activeSemester?.name ?? "Select semester"}</span>
  <ChevronsUpDown className="shrink-0 text-muted-foreground" aria-hidden />
</Button>
```

- [ ] **Step 3: SemesterTabsSkeleton full new contents** (ghost-sized pulse for the bar slot):

```tsx
/** Loading placeholder matching the bar's ghost semester switcher footprint. */
const SemesterTabsSkeleton = () => (
  <div className="h-10 w-32 animate-pulse rounded-lg bg-secondary" aria-hidden />
);

export default SemesterTabsSkeleton;
```

- [ ] **Step 4:** `npx tsc --noEmit` — EXPECTED errors only in `DashboardLayout` (still renders `SemesterTabs` standalone) and `settings.tsx` (passes the deleted `title` prop). Task 3 fixes both.

---

### Task 3: Layout rewire, settings title, greeting deletion, gitignore

**Files:**
- Modify: `src/components/layout/DashboardLayout.tsx`
- Modify: `src/pages/settings.tsx`
- Delete: `src/utils/greetingUtils.ts`
- Modify: `.gitignore`

- [ ] **Step 1: DashboardLayout** — add `import { useTab } from "../../contexts/TabContext";` and `const { setActiveTab } = useTab();` beside the other hooks; delete the `SemesterTabs` import; the header call becomes:

```tsx
<DashboardHeader
  onLogout={handleLogout}
  semesterProps={{
    semesters,
    setSemesters,
    activeSemester,
    isLoading: semestersLoading,
  }}
  onAddAssessment={() => setActiveTab("add")}
/>
```

The content container's padding gains bottom-nav clearance (`pb-safe` moves to the nav itself): `"p-4 md:p-6 pl-safe pr-safe pt-safe pb-safe"` → `"p-4 pb-24 md:p-6 md:pb-6 pl-safe pr-safe pt-safe"`. Inside `max-w-7xl`, the body flattens — the standalone `<SemesterTabs …/>` block is deleted and the nested `mt-6` wrapper around tabs + content unwraps:

```tsx
<div className="max-w-7xl mx-auto">
  <TabNavigationBar />

  {showStatsBar && (
    /* stats grid unchanged, keeps mt-6 */
  )}

  <div className="mt-6">
    <div className="rounded-xl bg-card shadow-soft">{/* loading / children unchanged */}</div>
  </div>
</div>
```

- [ ] **Step 2: settings.tsx** — header call becomes `<DashboardHeader onLogout={handleLogout} />`; the in-page title returns above the back button:

```tsx
<h1 className="mb-4 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
  Settings
</h1>
```

(back button keeps its `mb-6`; everything else unchanged).

- [ ] **Step 3: Delete the greeting system**:

```powershell
Remove-Item "e:\Code_Files\Asetta_Project\Code\asetta\src\utils\greetingUtils.ts" -Confirm:$false
```

- [ ] **Step 4: .gitignore** — append:

```
# superpowers visual-companion mockups
.superpowers/
```

- [ ] **Step 5:** `npx tsc --noEmit` — clean.

---

### Task 4: Sweeps, verification, QA handoff

- [ ] **Step 1: Sweeps** — zero hits in `asetta/src` for: `greetingUtils|getPersonalizedGreeting|getRotatingSubtitle|getMillisecondsToNextGreetingUpdate|getTimeBasedGreeting`; `title=` passed to `DashboardHeader` (grep `<DashboardHeader` call sites show only the two above); `SemesterTabs` imported only by `DashboardHeader`.
- [ ] **Step 2:** From `asetta/`: `npm run format`, then `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 3: Manual QA** (founder; both themes):
  1. Desktop: two chrome rows (bar, tabs); no greeting; content starts higher; wordmark renders in both themes.
  2. Semester switching + Manage semesters work from the bar; "Select semester" state renders sanely with zero semesters.
  3. "Add assessment" CTA lands on the add surface; while there, no tab shows as active (expected — it's an action surface).
  4. Tabs switch identically to before, keyboard focus rings visible, URL behavior unchanged.
  5. Mobile: bottom nav present with safe-area padding; content never hides behind it; modals (e.g. Manage semesters, notes) render above it; the bar fits at 375px (semester name truncates).
  6. Settings: slim bar (no switcher, no CTA), in-page "Settings" title, no bottom nav.
- [ ] **Step 4: Hand off for commit** (suggested: `redesign dashboard chrome: app bar, underline tabs, mobile bottom nav`). Note: the cleanup-pass commit may still be pending — its files don't overlap except `.gitignore`/docs; commit cleanup first, then this.
