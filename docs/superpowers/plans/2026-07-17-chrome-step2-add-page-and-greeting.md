# Chrome step 2: Add page + greeting-anchored bar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Add page (upload hero + manual form, no toggle) and swap the bar's wordmark for a one-line greeting (founder reversal recorded in the spec, 2026-07-17), then sweep anything the chrome work orphaned.

**Architecture:** `AddTab` loses its `addMode` state and segmented toggle — `UploadForm` renders as the hero, then a typographic "or add one manually" rule, then `AddAssessmentForm`; `UploadForm` drops its internal `h3` (the panel header owns the heading). `DashboardHeader` replaces `<Logo />` with a render-time greeting (time-of-day helper local to the file — no timers, no util file; `Logo` remains in use on auth pages).

**Tech Stack:** Existing stack; no dependency changes.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-17-dashboard-chrome-design.md` (step 2 + the reversed greeting decision in the header notes).
- standards.md rules; verification loop from `asetta/`; no agent git ops; Node 22 via nvm-windows PATH prefix; stop dev servers before builds.
- Greeting: sentence case, one line, item-title tier, truncates; computed at render (no mid-session update timers — a stale greeting after an hour-boundary is acceptable for a tool).
- The "or add one manually" rule uses `--border` as a typographic rule (its legitimate purpose); caption-tier label.

---

### Task 1: Greeting-anchored bar

**Files:**
- Modify: `src/components/layout/DashboardHeader.tsx`

- [ ] **Step 1:** Delete the `Logo` import; add above the component:

```tsx
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
```

- [ ] **Step 2:** In the bar, `<Logo />` becomes (name priority matches the avatar's):

```tsx
<p className="min-w-0 shrink truncate text-base font-semibold text-foreground">
  {getTimeGreeting()}
  {(profile?.displayName || user.displayName || user.email?.split("@")[0]) &&
    `, ${profile?.displayName || user.displayName || user.email?.split("@")[0]}`}
</p>
```

Hoist the name into a variable to avoid the triple expression:

```tsx
const displayName = profile?.displayName || user.displayName || user.email?.split("@")[0] || "";
```

```tsx
<p className="min-w-0 shrink truncate text-base font-semibold text-foreground">
  {getTimeGreeting()}
  {displayName && `, ${displayName}`}
</p>
```

- [ ] **Step 3:** `npx tsc --noEmit` — clean; `Logo` still compiles (used by `AuthShell`).

---

### Task 2: Add page — upload hero, manual beneath

**Files:**
- Modify: `src/components/pages/UnifiedDashboardPage.tsx:259-306` (AddTab)
- Modify: `src/components/forms/UploadForm.tsx:228-235`

- [ ] **Step 1: AddTab** — delete the `addMode` state line and the whole mode-toggle block; the happy path becomes:

```tsx
const AddTab = ({ data, urlSemesterId }: TabComponentProps) => {
  const { selectedSemester, selectedSemesterId, refreshAssessments } = data;

  return (
    <div>
      {selectedSemesterId ? (
        <div className="p-6">
          <PanelHeader title="Add assessments" />

          <UploadForm
            semesterId={selectedSemesterId}
            semesterName={selectedSemester}
            onUploadSuccess={refreshAssessments}
          />

          {/* Typographic rule: --border's legitimate use */}
          <div className="my-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">or add one manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <AddAssessmentForm semesterId={selectedSemesterId} onSuccess={refreshAssessments} />
        </div>
      ) : (
        /* EmptyState branch unchanged */
      )}
    </div>
  );
};
```

If `useState` or `cn` become unused in the file after this, remove them from the imports (other tabs may still use them — lint decides).

- [ ] **Step 2: UploadForm** — the internal heading duplicates the panel header; the block

```tsx
<div>
  <h3 className="text-base font-semibold text-foreground">Upload course outlines</h3>
  <p className="mt-1 text-sm text-muted-foreground">
    Transform your PDF course outlines into organized assessments automatically. Our AI
    extracts deadlines, requirements, and details in seconds.
  </p>
</div>
```

becomes description-only (the hero explains itself; the AI alert below it stays):

```tsx
<p className="text-sm text-muted-foreground">
  Transform your PDF course outlines into organized assessments automatically. Our AI extracts
  deadlines, requirements, and details in seconds.
</p>
```

- [ ] **Step 3:** `npx tsc --noEmit` — clean.

---

### Task 3: Consolidation sweep, verification, QA handoff

- [ ] **Step 1: Orphan sweep** — re-run the audit checks scoped to the chrome work: no file in `src/` is never-imported; no unused exports appear in `utils/`, `lib/`, `types/`, `constants/`; `Logo` has exactly one consumer (`AuthShell`); grep `addMode|Upload file|Quick add` → zero hits.
- [ ] **Step 2:** From `asetta/`: `npm run format`, then `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 3: Manual QA** (founder; both themes, mobile width):
  1. Bar shows "Good morning, {name}" (truncates gracefully at phone width beside the semester switcher); no Asetta branding anywhere in the app; auth pages still show the wordmark.
  2. Settings bar shows the greeting too.
  3. Add page: no toggle; dropzone hero → rule → manual form on one scroll; an upload round-trips through extraction results; manual add validates and saves; no-semester empty state unchanged.
  4. Greeting matches the time of day.
- [ ] **Step 4: Hand off for commit** (suggested: `add page single-scroll redesign, greeting replaces wordmark in app bar`).
