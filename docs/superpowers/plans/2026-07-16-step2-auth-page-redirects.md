# Step 2: Auth pages redirect signed-in users — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A signed-in user who lands on `/login` or `/register` is sent to the dashboard (or onboarding) instead of seeing the auth form — fixing the "I got logged out" impression. Firebase session persistence itself already works (local by default; nothing opts out).

**Architecture:** Each auth page reads `useAuth()`. While auth state resolves, render `LoadingScreen`; once resolved with a user, redirect via the existing `redirectAfterAuth` (which branches to onboarding for new users). The `!isSubmitting` guard keeps the in-progress sign-in/sign-up flow untouched: during a submit, the handler owns the redirect and the form (with its spinner button) stays visible.

**Tech Stack:** Next.js pages router, Firebase Auth via `AuthContext`, existing `utils/authRedirect.ts`.

## Global Constraints

- Same as step 1 (see `2026-07-16-step1-motion-and-semester-flicker.md`): standards.md rules, verification loop `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` from `asetta/`, no agent git operations, no test framework.
- `/reset-password` deliberately keeps no redirect — a signed-in user may legitimately reset a password (spec scope: login + register only).

---

### Task 1: Redirect gate on `/login`

**Files:**
- Modify: `src/pages/login.tsx`

**Interfaces:**
- Consumes: `useAuth()` → `{ user, loading }`; `redirectAfterAuth(user, router)` (existing).
- Produces: no API changes.

- [ ] **Step 1: Add the gate**

Add imports:

```tsx
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/ui/LoadingScreen";
```

Inside the component, after the existing state declarations:

```tsx
const { user, loading } = useAuth();

// A signed-in visitor skips the form; during an active submit the handler owns the redirect
useEffect(() => {
  if (!loading && user && !isSubmitting) {
    redirectAfterAuth(user, router);
  }
}, [user, loading, isSubmitting, router]);
```

Before the `return` of the form JSX:

```tsx
if (loading || (user && !isSubmitting)) {
  return <LoadingScreen />;
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npx tsc --noEmit` — expected clean.

---

### Task 2: Redirect gate on `/register`

**Files:**
- Modify: `src/pages/register.tsx`

Same three additions as Task 1 (`useEffect` is already imported there): the `useAuth` + `LoadingScreen` imports, the identical effect, and the identical pre-form early return.

- [ ] **Step 1: Add the gate** (code identical to Task 1)
- [ ] **Step 2: Verify** — `npm run lint && npx tsc --noEmit` clean.

---

### Task 3: Verification loop + manual QA

- [ ] **Step 1:** `npm run lint && npm run format:check && npx tsc --noEmit && npm run build` — all green.
- [ ] **Step 2: Manual QA** (`npm run dev`):
  1. Signed in → visit `/login` directly: brief loading screen, then dashboard; no form flash.
  2. Signed in → visit `/register`: same.
  3. Signed out → `/login`: form appears; sign in works and lands on dashboard as before.
  4. Sign out → you land on `/login` and STAY there (the gate must not bounce a signed-out user).
  5. Close the tab while signed in, reopen the app URL: still signed in.
- [ ] **Step 3:** Hand off for commit (suggested: `fix: redirect signed-in users away from auth pages`).
