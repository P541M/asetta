# Asetta work tracker

The single list of cleanup and quality work for both apps, plus the decisions it waits on and a
log of what each session changed. It started from the 2026-10-10 code and docs audit and also
replaces the old `docs/backlog.md` (now item A17).

## How to use this file

**Starting a session** (paste this):

```
Read docs/AUDIT.md. Do batch B<n> (items A<x>, A<y>) only. Plan first, then implement on a new
branch. Tick the items off and add a session log entry when done. Don't commit.
```

**Ending a session:**

1. Run the verification loop from the repo root: `npm run lint && npm run format:check && npm run typecheck && npm run build` (add `npm test` once A7 lands).
2. Tick finished items and note the date and PR: `- [x] **A1 · ...** (done 2026-10-12, PR #4)`. If an item is only partly done, leave it unticked and say what's left in the log.
3. Add a session log entry at the bottom: branch, items, what changed, what's left, gotchas.
4. Anything new you found becomes a new item with the next free ID. Don't fold it into the current batch.
5. Run `/code-review` and check the Vercel preview. The founder commits, pushes and merges.

**Rules:**

- IDs are permanent. Never renumber. New items take the next free number; split an item as A9a/A9b.
- Dropped items stay in the list, struck through with a reason: `~~A24~~ dropped: <why>`.
- Line numbers are as of 2026-10-10 and will drift. Search by symbol name.
- One theme per branch and PR.
- Effort is S/M/L. Risk is the risk of the fix itself (L/M/H).

## Decisions needed

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| D1 | Does a "Missed" assessment with no mark count as 0 toward the current grade? | A10 | **Yes, count it as 0.** (2026-10-10) |
| D2 | Delete or archive the shipped superpowers plans and specs? | A6 | **Delete both; git history keeps every version.** The three decisions only the specs recorded moved into standards.md first. Not CLAUDE.md: it loads into every session, so it holds rules, not history. (2026-10-10, done the same day) |
| D3 | Stay on Gmail + nodemailer, or move to a transactional email provider? | A2, A19 | **Stay on Gmail + nodemailer for now**; revisit as the user base grows (Gmail caps sending at roughly 500 a day). (2026-10-10) |
| D4 | When do reminders go out, and in which timezone? | A8 | **At 9:30 in each user's own timezone**, taken from their browser. (2026-10-10) |
| D5 | What is the per-user upload limit? | A18 | **20 files per user per day.** (2026-10-10) |
| D6 | What runs the reminder job often enough to hit 9:30 local time? Vercel Hobby cron runs once a day and fires anywhere within its hour. | A8 | **GitHub Actions, every 30 minutes**, calling the endpoint with the cron secret. The repo is public, so Actions minutes are free. The Vercel daily cron stays as a backstop. Details and gotchas in A8. (2026-10-10) |
| D7 | Welcome email for unverified password sign-ups: wait for a verified address, drop the user-chosen name from the subject, or accept the risk? | A30 | **Use the name only when the token says `email_verified` (Google sign-ups); everyone else gets a fixed "Welcome to Asetta" and "Hi there".** Small, no sign-up friction, and attacker-chosen text never reaches an unverified inbox. Shipped with A31. (2026-10-10, done the same day) |

## Batches (suggested order)

| Batch | Items | Theme | Notes |
| --- | --- | --- | --- |
| B1 | A1 | Welcome email lockdown | Security; small |
| B16 | A31, A30 | Email redesign | Founder priority: next after B1. A30 rides along (same subject and greeting) once D7 is answered |
| B2 | A2 | Dependency security patch | Lockfile churn; nodemailer major as its own commit |
| B3 | A6 | Docs cleanup | Docs only; the D2 part is done |
| B4 | A7 | Vitest setup + first suites | The next stated goal |
| B5 | A3, A4 | Server hardening quick wins (cron, upload) | |
| B6 | A5, A29 | Repo hygiene leftovers, line endings | A29 unblocks the local format check |
| B7 | A10, A14 | Grade math + ICS export, test-first | D1 decided |
| B8 | A9 | Extraction normalization, test-first | |
| B9 | A8, A32 | Reminders at 9:30 local time, test-first | D4 and D6 decided; A32 is the Settings copy for the new time |
| B10 | A11, A12 | Data layer: live assessments, user doc | |
| B11 | A13 | Course names containing "/" | Reproduce first |
| B12 | A16, A17 | Rules + verified notification email | Founder deploys rules |
| B13 | A15 | Bundle size | |
| B14 | A18, A20 | Rate limits (upload quota, contact form) | D5 decided |
| B15 | A19 | Cron throughput | After A8 |
| any | A21 to A28 | Later items | As time allows |

Until A29 lands, run the format check locally with `npx prettier --check --end-of-line auto .` inside each app.

## Fix now

- [x] **A1 · Lock down `/api/welcome-email`** · S · risk L (done 2026-10-10, PR #5)
  - **Shipped:** the once-per-user marker is a server-only `welcomeEmails/{uid}` doc, not a user-doc field: owners can write any user-doc field today, so they could clear one and re-send without limit. No rule matches `welcomeEmails`, so clients can't touch it (keep it that way in A16). Escaping helper: `apps/web/src/utils/escapeHtml.ts`. Follow-up risk: A30.
  - **Where:** `apps/web/src/pages/api/welcome-email.ts`; `apps/web/src/lib/emailTemplates.ts` (welcome `displayName` :247, `institution` :255; reminder `courseName`/`assessmentTitle` :113-114); only caller `apps/web/src/contexts/AuthContext.tsx:53`.
  - **Problem:** No auth. Anyone can POST any `email` and `displayName`, and the server sends HTML mail from Asetta's Gmail with those values unescaped. That's phishing from your identity, and a Gmail suspension would also stop reminders.
  - **Fix:** Require `Authorization: Bearer <ID token>` and verify it with firebase-admin. Send only to the token's email and ignore the body's. Send at most once per uid (e.g. a `welcomeEmailSentAt` field written with the admin SDK). Escape every interpolated value in both templates with one shared `escapeHtml` (model: `apps/landing/src/pages/api/contact.ts:13`). Fix the AuthContext comment that says the email is for Google users only; it fires for every new user doc.
  - **Done when:** an unauthenticated POST returns 401; a body `email` is ignored; a second call for the same user sends nothing; `<b>x</b>` as a name renders as text.

- [ ] **A2 · Patch vulnerable dependencies** · S (M for nodemailer) · risk L/M
  - **Where:** `apps/web/package.json:35` (`"next": "15.5.20"`, an exact pin; `eslint-config-next` is pinned the same), `apps/landing/package.json`, `package-lock.json`.
  - **Problem:** `npm audit --omit=dev` reports 46: 1 critical, 12 high, 33 moderate. The critical is `next` in both apps. Highs: `nodemailer` (both apps), a paste XSS in `prosemirror-view` (notes editor), `@firebase/firestore` via `@grpc/grpc-js`, `sharp` and `postcss` (through next), `@fastify/busboy`, `brace-expansion`, `nanoid`, `source-map-js`. The exact pin blocks the 15.5.27 fix.
  - **Fix:** Web `next` and `eslint-config-next` to 15.5.27. `npm update` in the landing (`next` 16.4.0 is in range). `npm audit fix` (never `--force`). Then nodemailer 10 (a major, both apps) as its own commit; smoke-test the reminder, welcome and contact emails. If the firebase/grpc high needs a major, move it to A25 and log it.
  - **Done when:** 0 critical; every remaining high is listed in the session log with a reason; Baseline numbers updated.

- [ ] **A3 · Cron: fail closed, log failures, retry failed sends** · S · risk L
  - **Where:** `apps/web/src/pages/api/cron/notifications.ts:8`; `apps/web/src/lib/notifications.ts` (dedupe check :219-228, failed record :262-280); `apps/web/src/utils/devLog.ts`; `apps/web/vercel.json`.
  - **Problem:** If `CRON_SECRET` is unset, the header `Bearer undefined` is accepted. Per-user errors and email failures go through `devError`, which does nothing in production, and Vercel Hobby keeps logs for 1 hour, so failures are invisible. A failed send still writes the dedupe doc (status "failed"), so it is never retried. `maxDuration: 10` caps a sequential scan of every user. `memory` and `version: 2` in `vercel.json` are ignored leftovers.
  - **Fix:** Reject when the secret is unset. `console.error` real failures (no email addresses in logs). Persist a per-run summary (e.g. a `cronRuns/{date}` doc with users, sent, failed, duration). Treat only `status: "sent"` as already sent. Raise `maxDuration` within the plan's limit; drop `memory` and `version`.
  - **Done when:** with no secret configured, every request gets 401; a forced SMTP failure is retried on the next run; the last run's result is still readable after an hour.

- [ ] **A4 · Upload route: auth first, clean temp files, log errors** · S · risk L
  - **Where:** `apps/web/src/pages/api/upload.ts` (parse :74, auth :104, bare catches :158, :226, :276).
  - **Problem:** The multipart body (up to 4 MB, written to /tmp) is parsed before the token is checked. formidable's temp files are never deleted. Three `catch {}` blocks swallow errors with no log. `semesterId` isn't checked to be a single path segment.
  - **Fix:** Verify the Bearer token before `parseForm` (headers arrive before the body). Unlink every temp file in a `finally`. `console.error` in each catch. Reject a `semesterId` containing `/`.
  - **Done when:** an unauthenticated 4 MB POST returns 401 without touching /tmp; no upload files remain in /tmp after a request; failures show up in logs.
  - The per-user quota is A18.

- [ ] **A5 · Repo hygiene leftovers from the merge** · S · risk L
  - `.claude/settings.local.json` is committed but personal. Done 2026-10-10: the 4 entries pointing at the old project folder are removed, the file is in the root `.gitignore`, and git no longer tracks it. Optionally prune its broad allows (`Bash(rm:*)`, `Bash(curl:*)`, `Bash(env)`).
  - `apps/web/.env.example` exists but `.env*` in `apps/web/.gitignore` hides it, and the README points to it. Add `!.env.example`; check it holds placeholders only.
  - `.refactor-baseline/` lines in `apps/landing/.gitignore` and `apps/landing/.prettierignore`: remove.
  - `apps/web/next.config.ts`: `images.remotePatterns` is dead (no remote images; Storage is unused and has no rules). Remove it. Check whether `dangerouslyAllowSVG` is still needed for the logo (the landing renders the same SVG without it).
  - Em dashes in user-facing copy: `apps/web/src/lib/upload/constants.ts:46,53` and `apps/web/src/lib/uploadClient.ts:56,65`.
  - Root `.gitignore`: carry the secret patterns repo-wide (`serviceAccountKey*.json`, `firebase-adminsdk*.json`, `*.pem`); today only `apps/web/.gitignore` has them.
  - **Done when:** verification loop green; the logo renders on `/login` in both themes.

- [ ] **A6 · Docs cleanup** · S-M · risk L
  - **Done 2026-10-10 (D2):** all 12 plans and 3 specs under `docs/superpowers/` deleted (in git history). Their three spec-only decisions now live in `apps/web/standards.md` (notes editor extensions, initials-only avatar, course color scope). The `next lint` note in standards.md points at A25 instead of the deleted plan. The root `CLAUDE.md` says `docs/superpowers/` holds in-flight work only.
  - **Target structure:**
    ```
    README.md               humans: what Asetta is, layout, setup, env, deploy (from apps/web/README.md)
    CLAUDE.md               agents: layout, root commands, cross-app links, global rules, read order, doc map
    docs/AUDIT.md           this tracker (also the backlog)
    docs/ops.md             new: Vercel projects, cron, env matrix per app, rules deploy, audit policy, ops notes
    docs/superpowers/       in-flight plans/specs only; deleted in the PR that ships them
    apps/web/CLAUDE.md      about 20 lines: app commands, where things live, tests; points to standards.md
    apps/web/standards.md   current rules only, plus Testing and API/server sections
    apps/web/.env.example   committed (A5)
    apps/landing/CLAUDE.md  same role, small fixes
    ```
  - **Read order for Claude:** root `CLAUDE.md`, then the app's `CLAUDE.md`, then `apps/web/standards.md` (web only), then `docs/AUDIT.md` when picking work, then `docs/ops.md` for deploy, cron and env.
  - **Per doc:**

    | Doc | Action | Why |
    | --- | --- | --- |
    | `CLAUDE.md` | Update | Add the read order and a doc map. Make it the only home of the git rule and the em dash rule. |
    | `apps/web/CLAUDE.md` | Rewrite to about 20 lines | Per-app commands vs the root's "run from the root"; "Testing" means lint only, contradicting the standards loop; says preferences live in localStorage (they're in Firestore); generic `/init` filler; repeats the git rule. |
    | `apps/web/standards.md` | Update | Drop the 22-line changelog preamble and the migration-state table (history). Part 2's intro still says "migrating incrementally". Remove references to deleted `CustomSelect`, `card.tsx`, `statusUtils`, `AvatarPicker`/`IconPicker` and the `gray-200` compat block. The selector pattern says "check-marked options" while the Icons section says "no checkmark": keep the Icons rule. Use the root `npm run typecheck` in the loop. Add a Testing section (after A7) and an API/server section (auth before reading the body, validate input, log real failures, escape HTML in email with `utils/escapeHtml.ts`). |
    | `apps/landing/CLAUDE.md` | Small fixes | Matches the code. Fix the per-app commands and the "Vercel/Netlify-style" deploy line. |
    | `apps/web/README.md` | Move to a root `README.md` | Good content, but written as a standalone repo (`npm run dev` doesn't exist at the root); CI step names are out of date. There is no root README today. |
    | `apps/landing/README.md` | Delete | Written before the rewrite: Next 15, Framer Motion, Outfit/Lexend, `tailwind.config.ts`, `pricing.tsx`, Netlify, Node 18. Contradicts the landing `CLAUDE.md` throughout. |
    | `docs/superpowers/plans/*` (12) and `specs/*` (3) | ~~Delete~~ done 2026-10-10 | All shipped; stale paths and constraints; a future agent could re-run them. Recover any of them with `git log --all -- docs/superpowers/`. |

  - **Ops notes for `docs/ops.md`** (carried over from the deleted dependency-pass plan, plus one from git history):
    - On the Windows dev machine, stop the dev server before any `npm install`, `node_modules` operation or `next build`; file locks cause EPERM failures (check `Get-Process node`).
    - After pulling a commit that touches a `package.json`, run `npm install`.
    - Never call `/api/cron/notifications` locally with the real secret: it reads production data and sends real emails. QA it through the scheduled run's logs (and the A3 run summary once that exists).
    - The cron route has no `regions` config on purpose: it was never a valid key for Pages Router API routes, so the function runs in the project's default region. Pin a region in Vercel project settings if ever needed.
    - The root `package.json` overrides `jose` to ^5 (commit cf0d0b4: the upload route crashed at module load with jose 6 under `jwks-rsa`). Revisit when firebase-admin bumps `jwks-rsa`.
    - The `next lint` to ESLint CLI codemod is in A25.
  - **Contradictions to resolve:**
    - Landing README vs landing `CLAUDE.md`: fonts, animation library, Tailwind config, pricing page, Next version, hosting.
    - Verification steps: web `CLAUDE.md` (lint only) vs standards.md (4-step loop) vs root (`npm run typecheck`).
    - Where commands run: the app `CLAUDE.md` files say `npm run dev` inside the app; the root says run from the root.
    - standards.md's selector rule vs its icon rule.
    - The git rule is repeated in the root `CLAUDE.md`, web `CLAUDE.md` and standards.md (twice).
  - **Done when:** no doc uses `asetta/` as a working directory, an absolute machine path, `npx tsc --noEmit`, or names deleted files; the git and em dash rules live only in the root `CLAUDE.md`; every path in the CLAUDE files resolves.

- [x] **A31 · Redesign the welcome and reminder emails** · M · risk L · founder priority (2026-10-10: "it is hideous") (done 2026-10-10, PR #6)
  - **Shipped:** one shared layout and a builder per email in `lib/emailTemplates.ts`, a hosted amber logo PNG, Manrope with a system fallback, the platform's `sm` button, matching plain-text parts, and the dev preview at `/api/dev/email-preview`. The founder signed off on the test sends. The rules are in standards.md ("Email").
  - **Where:** `apps/web/src/lib/emailTemplates.ts`, `apps/web/src/lib/email.ts` (subjects, plain-text parts).
  - **Problem:** Both emails ignore the platform's surface language (standards.md): emoji everywhere (🎉 👋 ✨ 💪 🚀 and one per feature line), a solid amber header band, bordered boxes and a left accent bar, drop shadows, Title Case headings ("Assessment Reminder") and cutesy copy ("Hey there! 👋 Just a friendly heads up", "You've got this! 💪", "Welcome to the Asetta family! 🚀"). No logo; the font is named Manrope, which mail clients won't load. The reminder shows the course name twice and never shows the actual due date or time, only "N days". Styling sits in a `<style>` block with classes, which some clients strip. Nothing links to turning reminders off.
  - **Fix:** One shared layout for both emails: table-based, inline styles, a ~560px column, system font stack, stone neutrals, amber only on the single button and the logo. The logo as a hosted PNG (Gmail doesn't render SVG; `public/images/` has only `Asetta_Logo.svg` and the favicons today). Copy in the app's quiet voice: sentence case, no emoji, no em dashes. Reminder: the assessment as the emphasized line, the course as supporting text, the due date and time, one "Open Asetta" button, and a footer link to manage reminders in Settings. Welcome: a few lines and one button. Matching plain-text parts. A local preview (render to HTML files or a dev-only page) so changes can be reviewed without sending.
  - **Pairs with:** A30 (the name in the welcome subject and greeting, D7) and A8 (time zone in the due line, the optional daily digest).
  - **Done when:** both emails follow standards.md's surface language; they render cleanly in Gmail (web and mobile) and Apple Mail, light and dark; the founder signs off on a test send to their own address.

## Next

- [ ] **A7 · Vitest setup + first suites (grade, date, parsing)** · M · risk L
  - **Where:** `apps/web` (new `vitest.config.ts`, a `test` script), root `package.json` (`npm test`), `.github/workflows/ci.yml`, `apps/web/standards.md` (Testing section).
  - **Setup:** Vitest in `apps/web` only, node environment, the `@/` alias from tsconfig. Pin the timezone (e.g. `process.env.TZ = "America/Toronto"` at the top of `vitest.config.ts`) and prove it with a test on `getTimezoneOffset()`. Run the date suites under a second zone too (e.g. `Asia/Kolkata` or `Pacific/Auckland`). Use `vi.setSystemTime` for "now" and cover the DST weekends (Mar 8 and Nov 1, 2026).
  - **Testable today (pure):** `utils/gradeCalculations.ts`, `utils/dateUtils.ts`, `utils/urgency.ts`, `utils/icsGenerator.ts`, `lib/upload/textExtraction.ts` (`formatDate`, `extractAssessmentsBasic`, `extractCourseName`; `extractTime` is private, so test it through `extractAssessmentsBasic` or export it), `lib/upload/constants.ts` (`validateUploadSelection`), `lib/uploadClient.ts` (`parseUploadResponse`; Node 22 has `Response`), `constants/courseColors.ts`, `utils/authErrors.ts`.
  - **Needs extracting first (in later items):** the Gemini response cleanup in `lib/upload/gemini.ts` (A9); the date math, `validateNotificationPreferences` and the send decision in `lib/notifications.ts` (A8); `processCourseStats`/`computeStats` in `hooks/useSemesterAssessments.ts`; the "a mark sets status to Submitted" rule in `GradeCalculator.tsx` (A10).
  - **Scope rule:** A7 doesn't fix logic. Known bugs (A9, A10, A14) go in as `it.todo` or `it.fails` naming their ID; those items turn them green.
  - **Done when:** `npm test` runs from the root and in CI; first suites cover grades, dates/urgency, `formatDate` and ICS; standards.md has a Testing section.

- [ ] **A8 · Reminders at 9:30 in each user's timezone** · M-L · risk M · D4 decided, needs D6 · test-first
  - **Where:** `apps/web/src/lib/notifications.ts:138-216`; `apps/web/src/pages/api/cron/notifications.ts`; `apps/web/vercel.json` (cron `0 21 * * *`); new `.github/workflows/reminders.yml` (D6); the user doc (new fields); wherever the timezone gets saved (sign-in in `AuthContext.tsx`, or onboarding/Settings).
  - **Today:** one run a day at 21:00 UTC (5 PM in Toronto), and the server reads every due date as UTC: ``new Date(`${dueDate}T${dueTime}`)`` (:156-159), the pattern standards.md bans. Reminders are off by each user's UTC offset. Unpadded times (`"9:00"`) give an Invalid Date and are skipped silently (verified in Node). Days are `floor(ms/day)` (:200) while the UI counts calendar days (`getDaysUntil`), so the email and the UI can disagree; the 12-36h window (:216) can send "due in 0 days". Future assessments marked "Missed" still get reminders (only "Submitted" is skipped). No timezone is stored per user.
  - **Target (D4):** each user gets their reminders at 9:30 in their own timezone.
  - **Design:**
    - Save the browser's IANA zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) as `timeZone` on the user doc at sign-in, and update it when it changes. Users without one fall back to `America/Toronto` until their next sign-in.
    - Store `nextReminderAt` on the user doc: the UTC instant of that user's next 9:30 local. Each run queries `users where nextReminderAt <= now`, sends that user's reminders, then advances `nextReminderAt` to the next day's 9:30 in their zone. A late or missed run just catches up on the next one, any scheduler works (D6), and the full scan of every user goes away (most of A19).
    - "Due in N days" = calendar days from the user's local today to the due date, the same rule as `getDaysUntil` in the UI. Accept unpadded times; skip "Missed" as well as opted-out "Submitted".
    - Converting "9:30 in this zone" to UTC across DST needs a small timezone library (e.g. `@date-fns/tz`). Keep it in one pure, tested helper.
    - **Trigger (D6): GitHub Actions.** Vercel Hobby cron runs once a day and fires anywhere within its hour, so it can't hit 9:30 per zone on its own. New `.github/workflows/reminders.yml`:
      - `schedule: cron: "5,35 * * * *"` (UTC), offset from the top of the hour, when GitHub delays scheduled runs most; plus `workflow_dispatch` for manual runs.
      - One step: `curl --fail` the production endpoint with `Authorization: Bearer ${{ secrets.CRON_SECRET }}`. The founder adds `CRON_SECRET` as a repo Actions secret with the same value as in Vercel.
      - `concurrency` group so two runs never overlap.
      - Keep the daily Vercel cron in `vercel.json` as a backstop. The endpoint must be safe to call twice (the `nextReminderAt` advance plus the dedupe docs make it so).
    - **GitHub Actions gotchas:** scheduled workflows run only from the default branch; GitHub can delay runs or drop some under heavy load; and it disables scheduled workflows in a public repo after 60 days with no repo activity (it emails a warning first; re-enable from the Actions tab). The Vercel backstop still sends, just late, during any gap.
    - **Ship the workflow in the same PR as the new send logic, not before.** Under today's logic, 48 runs a day would each scan every user (48x the Firestore reads) and send reminders at whatever time an assessment enters the 12-36h window.
    - Optional, decide while building: one digest email per user per day instead of one per assessment (fewer Gmail sends, see D3).
  - **Done when:** tests cover Toronto, a UTC+ zone, a half-hour zone (e.g. `Asia/Kolkata`), both 2026 DST switches, unpadded times and a late run; reminders arrive shortly after 9:30 local (within one scheduler interval).

- [ ] **A9 · Normalize AI and regex extraction output** · M · risk L-M · test-first
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts:124-176` (`formatDate`), `apps/web/src/lib/upload/gemini.ts:146-203`, `apps/web/src/pages/api/upload.ts:182-191`.
  - **Problem:** `formatDate` only knows full month names, so "Sept 30, 2026" and "Mar 15, 2026" are stored as raw text. DD/MM (common in Canada) is read as MM/DD: "15/03/2026" becomes "2026-15-03" (verified). No range checks. `dueTime`, `weight` and the names aren't type- or range-checked, so "11:59 PM" reaches the UI as an Invalid Date, and nothing guards against NaN (likely shows "NaN days left"). Fallback dates use the UTC day (`toISOString().split("T")[0]` at upload.ts:186, gemini.ts:182, textExtraction.ts:49). JSON is scraped out of free text with a regex.
  - **Fix:** One `normalizeExtractedAssessment()` used by both paths: a valid `YYYY-MM-DD` or the item is flagged for review (no guessing today's date in UTC), padded `HH:MM` (accept 12-hour input), weight clamped 0-100, strings trimmed and length-capped. Ask Gemini for structured JSON output (easier on `@google/genai`, see A25).
  - **Done when:** table tests over realistic syllabus strings pass; no stored assessment can have an unparseable date or time.

- [ ] **A10 · Grade math bugs** · S-M · risk M · D1 decided · test-first
  - **Where:** `apps/web/src/utils/gradeCalculations.ts`, `apps/web/src/components/assessment/GradeCalculator.tsx`, `apps/web/src/components/assessment/grade-calculator/GradeOverviewCards.tsx`.
  - **Problems:**
    - `calculateRequiredGrade` returns `0` when the remaining weight is 0 (:65); it should be null ("nothing left to grade").
    - D1: a "Missed" assessment with no mark counts as 0 toward the current grade. Today `computeCurrentGrade` ignores it and `calculateRequiredGrade` counts it as remaining weight (:49), so "needed" assumes you can still earn it. Fix both to treat it as completed with a mark of 0.
    - Clearing the only mark leaves the old grade on screen (`recalculateGrade`, GradeCalculator.tsx:76-81).
    - Rounding vs letter: 89.96 shows "90.0%" with the letter "A" (GradeOverviewCards.tsx:54 vs `getGradeInfo`). Pick the letter from the displayed value.
    - A target of 0 becomes 85 (`|| 85`, GradeCalculator.tsx:179); use `??`.
    - A required grade below 0 (target already secured) renders as a negative percentage.
  - **Done when:** each case has a test; the grades tab shows correct values after clearing marks.

- [ ] **A11 · One live source of assessments** · M · risk M
  - **Where:** `apps/web/src/hooks/useAssessments.ts` (used by `GradeCalculator.tsx:48`, `CalendarView.tsx:70`, `CourseFilteredAssessments.tsx:23`); `apps/web/src/hooks/useSemesterAssessments.ts:128-139`; tabs mounted in `UnifiedDashboardPage.tsx:340-358`.
  - **Problem:** All five tabs stay mounted, but grades, calendar and the course-filtered view read once with `getDocs`. Mark something Submitted in Assessments and Grades/Calendar stay stale until a remount. The live listener drops `mark`, `createdAt` and `updatedAt`, so it can't be reused yet. Each of those views is an extra full read on top of the listener.
  - **Fix:** Keep `mark` in the live mapping. Derive the grades, calendar and filtered views from `DashboardData`. Delete `useAssessments` and the `refreshTrigger` plumbing if nothing else needs them.
  - **Done when:** an edit in any tab shows in every other tab without a reload; no `getDocs` on assessments outside the listener.

- [ ] **A12 · Auth reliability and user-doc reads** · S, then M · risk L/M
  - **Where:** `apps/web/src/contexts/AuthContext.tsx:33-75`; `hooks/useOnboardingStatus.ts`; `hooks/useUserProfile.ts` (in DashboardHeader); `hooks/useDisplayPreferences.ts` (DashboardLayout.tsx:32 and AssessmentsTable.tsx:55); `hooks/useSemesters.ts:46-70`; `hooks/useCoursePreferences.ts:43-48`.
  - **Problems:**
    - The `onAuthStateChanged` callback has no try/finally. One failed `getDoc`/`setDoc` (offline, network) leaves `loading` true forever: an endless spinner.
    - The user doc is read 5 times per dashboard load, plus a `lastLogin` write on every page load (:71).
    - `useSemesters` re-runs the legacy `order` backfill (a full `getDocs`) on every mount.
    - `useCoursePreferences` writes a default doc when you merely view a course; `updateTargetGrade` reads then writes where one merged `setDoc` would do.
  - **Fix:** try/finally first (S). Then one live user-doc context (`onSnapshot`) that feeds the profile, display preferences and onboarding status (M). Write `lastLogin` at most once a day. No writes on read.
  - **Done when:** a forced Firestore error shows an error state, not a spinner; 1 user-doc read per dashboard load.

- [ ] **A13 · Course names containing "/"** · S-M · risk M · reproduce first
  - **Where:** `apps/web/src/lib/firebaseUtils.ts:27-33` (`getCoursePreferencesDocRef`); callers `hooks/useCoursePreferences.ts`, `hooks/useCourseColors.ts:61`, `hooks/useCourseRename.ts`.
  - **Problem (inferred from Firestore's path rules, not yet reproduced):** the raw course name is the document ID. A cross-listed name like "MATH/STAT 2050" adds path segments, so `doc()` throws: target grade, color and rename would fail for that course.
  - **Fix:** Encode the ID (e.g. `encodeURIComponent`) with a fallback read of the raw ID for existing docs, or store the name in a field with a slug ID.
  - **Done when:** reproduced first; then a course with "/" can set its color and target grade and be renamed.

- [ ] **A14 · ICS export correctness** · S · risk L · test-first
  - **Where:** `apps/web/src/utils/icsGenerator.ts`.
  - **Problem:** The default 23:59 due time makes DTEND 00:59 on the same day, before DTSTART (verified; `incrementHour` at :54-58 wraps without rolling the date). `DTSTAMP`, required by RFC 5545, is missing. SUMMARY and DESCRIPTION aren't escaped for `,` `;` `\`. No 75-octet line folding. The UID uses `@asetta.app` (the domain is asetta.me).
  - **Fix:** Compute the end from a Date (or make due-time events zero-length). Add DTSTAMP, escaping and folding. Changing the UID domain would duplicate events for anyone who already imported, so decide whether it's worth it.
  - **Done when:** tests cover 23:59 and names with commas and semicolons; the file imports cleanly into Google Calendar.

- [ ] **A15 · Bundle size** · M · risk L-M
  - **Where:** `apps/web/src/contexts/AuthContext.tsx` (pulls Firestore into `_app`); `apps/web/src/components/pages/UnifiedDashboardPage.tsx:10-16` (every tab imported eagerly).
  - **Problem:** 229 kB of JS is shared by every page (the `_app` chunk is 114 kB: Firebase Auth + Firestore). Every dashboard route is 320 kB because Calendar, Grades, Upload, dnd-kit and react-colorful all load up front.
  - **Fix:** `next/dynamic` for every tab except the one being opened. Move the user-doc bootstrap out of `AuthContext` (or lazy-import Firestore there) so the auth pages don't ship Firestore.
  - **Done when:** `npm run build` shows smaller numbers than the Baseline; no visible jank on tab switch.

- [ ] **A16 · Firestore rules: validate fields** · M · risk M
  - **Where:** `firestore.rules` (the live rules matched this file on 2026-10-10).
  - **Problem:** Owners can write any key, type or size on every doc, including the `email` that reminders go to (see A17). The `documents` and `courses` rules match collections nothing uses.
  - **Fix:** Allow-list keys and types per collection (user doc, semesters, assessments, coursePreferences); cap string lengths; delete the dead matches. Leave `welcomeEmails` without a client rule (server-only, A1). Test in the Firestore emulator before deploying. Agents can't deploy rules (`.claude/settings.json` denies it); the founder deploys.
  - **Done when:** emulator tests pass for every write the app makes and fail for out-of-schema writes.

- [ ] **A17 · Verify the notification email before sending** · M · risk M · moved from `docs/backlog.md`
  - Verify a custom notification email with a confirm link before sending to it; until it's verified, fall back to the Auth email.
  - **Context:** the reminder cron (`apps/web/src/lib/notifications.ts`) sends to the `email` field on the user doc, which the user sets freely in onboarding and Settings. Firestore rules let owners write any field on their own doc, so today a user can point reminders at someone else's address.
  - Pairs with A16: the "verified" flag must be writable by the server only.

- [ ] **A18 · Per-user upload quota** · M · risk L · D5 decided: 20 files per user per day
  - **Where:** `apps/web/src/pages/api/upload.ts`.
  - **Problem:** Any signed-in account can call Gemini without limit and burn the shared quota for everyone. Accounts are free to create.
  - **Fix:** A per-uid counter written with the admin SDK (e.g. `usage/{uid}_{YYYY-MM-DD}`, UTC day, incremented in a transaction) checked before calling Gemini; limit 20 files a day. Reuse the existing quota-exceeded response shape.
  - **Done when:** going over the limit returns 429 with a clear message and the existing limit modal shows.

- [ ] **A19 · Cron throughput** · M · risk M · after A8
  - **Where:** `apps/web/src/lib/notifications.ts:36-130`; `apps/web/src/lib/email.ts:32,99`.
  - **Problem:** Every run reads every user, then every semester, then every assessment, one at a time. `transporter.verify()` runs before every email. Gmail caps sending at roughly 500 a day (D3: staying on Gmail for now). It will time out as users grow.
  - **Fix:** A8's `nextReminderAt` query removes the full user scan. What's left: read only the due user's assessments in the reminder window, bounded concurrency, verify the transporter once per run, and track daily send counts in the A3 run summary. Revisit D3 if sends approach the Gmail cap.
  - **Done when:** run time stays flat as users grow (measure with the A3 run summary).

- [ ] **A20 · Landing contact form: throttle and bot check** · S · risk L
  - **Where:** `apps/landing/src/pages/api/contact.ts`, `apps/landing/src/pages/contact.tsx`.
  - **Problem:** Validation and escaping are good, but nothing stops bots or repeat submissions, and it all lands in your inbox.
  - **Fix:** A hidden honeypot field plus a simple per-IP limit.

- [ ] **A32 · Settings states the wrong reminder time** · S · risk L · ship with A8 · found during B16
  - **Where:** the custom-days hint "Notifications will be sent daily at 9:00 PM." in `apps/web/src/components/settings/NotificationsSection.tsx` and `apps/web/src/components/onboarding/steps/NotificationsStep.tsx`.
  - **Problem:** the cron runs at 21:00 UTC (`vercel.json`), which is 5 PM in Toronto during daylight time and 4 PM in winter, not 9 PM. After A8 it becomes 9:30 in the user's own time zone, so the copy is wrong either way.
  - **Fix:** in the A8 PR, change both to "around 9:30 in the morning, your time" (or whatever A8 ships).

## Later

- [ ] **A21 · Merge the two upload forms' logic** · M · risk M
  - `apps/web/src/components/forms/UploadForm.tsx` (425 lines) and `apps/web/src/components/onboarding/OnboardingUploadForm.tsx` (403) share about 120 identical lines (file selection, drag and drop, validation, response handling). Extract a `useSyllabusUpload` hook; keep the two UIs.

- [ ] **A22 · Split files over the 300-line limit** · M · risk M
  - `components/tables/AssessmentsTable.tsx` 448, `components/pages/UnifiedDashboardPage.tsx` 396, `components/calendar/CalendarView.tsx` 313, `contexts/OnboardingContext.tsx` 309. Use the folder pattern from standards.md.

- [ ] **A23 · Standards drift in components** · S-M each · risk L
  - Firestore calls outside hooks: `SemesterTabs.tsx`, `AddAssessmentForm.tsx`, `AssessmentsTable.tsx`, `UserSettings.tsx`, `onboarding/steps/SemesterStep.tsx`, `pages/dashboard.tsx`.
  - Five `alert()` calls in `SemesterTabs.tsx` (:60, :80, :123, :136, :146); use inline alerts.
  - Bulk delete is a sequential, non-atomic loop that fails silently (`AssessmentsTable.tsx:146-162`); use `writeBatch` and show an error.
  - Deleting a semester leaves its `coursePreferences` subcollection behind (`SemesterTabs.tsx:94-112`).
  - Template-literal `className` in `tables/assessments/TableHeader.tsx`; use `cn()`.

- [ ] **A24 · Dead code** · S · risk L
  - `CheckSolidIcon` and `CloseSolidIcon` are unused (`components/ui/icons.tsx:56`, `:72`).
  - The legacy `darkMode` theme seed in `pages/_document.tsx`.
  - The `order` backfill in `hooks/useSemesters.ts:46-70`, once every semester doc has `order` (check with an admin script the founder runs).

- [ ] **A25 · Outdated dependencies (not security)** · M each · risk M · one major per PR
  - `@google/generative-ai` is Google's deprecated legacy SDK; move to `@google/genai` (also unlocks structured output for A9).
  - `pdf-parse` 1.1.1 is from 2018 and unmaintained; move to a maintained parser.
  - Tiptap 2 to 3; firebase 11 to 12 or later.
  - Web Next 15 to 16, to match the landing. `next lint` is removed in 16; the codemod is `npx @next/codemod@canary next-lint-to-eslint-cli .`.
  - `@types/node` is `^20` in web while `engines` says Node 22; `@types/react` 19.0 in web vs 19.2 in the landing.

- [ ] **A26 · Align tooling across the apps** · S · risk L
  - One root `.prettierrc` and one Prettier version (web `^3.9.5` vs a pinned `3.8.4` in the landing can format differently).
  - Typecheck the landing too (the root `typecheck` covers web only).
  - Same env var name for the same Gmail credentials (`EMAIL_APP_PASSWORD` in web, `EMAIL_PASS` in the landing); update both Vercel projects together.
  - `engines` in the landing `package.json`.
  - The code duplication (`cn`, Logo, favicons, amber tokens, logo filter, nodemailer setup, email regex) stays, per the root "no shared code" rule.

- [ ] **A27 · Landing feature GIFs** · S-M · risk L
  - About 9.3 MB of GIFs in `apps/landing/public/images/features`. Convert to MP4/WebM (autoplay, muted, loop, playsinline).

- [ ] **A28 · CI audit step** · S · risk L
  - Add `npm audit --omit=dev --audit-level=high` to `.github/workflows/ci.yml` after A2 (it would fail today). The test step comes with A7.

- [ ] **A29 · Line endings: local format check fails on Windows** · S · risk L · do early (B6)
  - **Problem:** this machine has `core.autocrlf=true`, so the checkout has CRLF line endings, and `npm run format:check` reports "Code style issues" in 159 files of `apps/web` alone; the verification loop can't pass locally. The only difference is line endings: `npx prettier --check --end-of-line auto .` passes. CI (Linux, LF) is unaffected.
  - **Fix:** a root `.gitattributes` with `* text=auto eol=lf` (mark binaries such as images and fonts `binary`), then the founder renormalizes once: `git add --renormalize .` in its own commit. No Prettier config change needed.
  - **Done when:** `npm run format:check` passes on a fresh Windows checkout.

- [x] **A30 · Welcome email to unverified sign-up addresses** · S-M · risk L · D7 decided · found during A1 (done 2026-10-10, PR #6)
  - **Shipped:** the route reads `email_verified` from the verified ID token; only then does the name (body `displayName`, else the token's `name`) reach `welcomeEmail()`, which otherwise sends "Welcome to Asetta" and "Hi there". The unused `institution` body field is gone (the client never sent it, and it was one more piece of attacker-chosen text). A verified account with no name now also gets "Hi there" instead of its email prefix.
  - **Done when** (added at ship time; the item had none): a verified token puts the name in the subject and greeting; an unverified token gets the fixed subject and "Hi there" even when the body sends a name; the once-per-user rule from A1 still holds. All three checked against the emulators (session log).
  - **Where:** `apps/web/src/pages/api/welcome-email.ts`, `apps/web/src/lib/email.ts` (`sendWelcomeEmail` subject), `apps/web/src/pages/register.tsx`.
  - **Problem:** Password sign-ups never verify their email, so anyone can register with someone else's address and a display name of their choosing (up to 100 characters, escaped, but plain text such as a URL still shows). Asetta's Gmail then sends that address one welcome email with the name in the subject and greeting. A1 limits this to one email per new account, but accounts are free to create, and each send counts toward the Gmail daily cap (D3).
  - **Fix (pick with D7):** send the welcome email only once `email_verified` is true (needs a verification step; pairs with A17), or keep sending but leave the name out of the subject (and maybe the greeting), or accept the risk.
  - **Recommended (2026-10-10):** use the name only when the token says `email_verified` (Google sign-ups); otherwise send the fixed "Welcome to Asetta" with "Hi there". Text an attacker chooses then never reaches an unverified inbox, at the cost of the name for password sign-ups (usually just their email prefix). A few lines in the route; ship it with A31, which rewrites the same subject and greeting. Gating on verification is heavier and belongs with A17. If abuse ever shows up, add a global daily cap on welcome emails so they can't eat the Gmail limit reminders need.

## Baseline (2026-10-10)

Numbers to compare against when items land.

- `npm audit --omit=dev`: 46 vulnerabilities (1 critical, 12 high, 33 moderate).
- `apps/web` build: 229 kB First Load JS shared by all pages (`_app` chunk 114 kB); every dashboard route 320 kB; `/login` and `/register` 242 kB; `/onboarding` and `/settings` 285 kB.
- Live Firestore rules identical to `firestore.rules`; no Storage rules (Storage unused).
- Vercel: projects `asetta` (apps/web) and `asetta-landing` (apps/landing), Hobby plan: runtime logs kept 1 hour; cron jobs run at most once a day and fire anywhere within the scheduled hour.
- Tests: none.

## Session log

Newest last. One entry per session: date, branch, items, what changed, what's left, gotchas.

### 2026-10-10 · audit (no branch)

- Read-only audit of both apps and every doc. Created this tracker; moved the one `docs/backlog.md` item into A17 and deleted that file; added a pointer to this file in the root `CLAUDE.md`. No code changes.
- Verified by running Node: unpadded times give an Invalid Date (A8); "15/03/2026" becomes "2026-15-03" (A9); the ICS end time lands before the start (A14). Not reproduced yet: A13.
- Next: B1 (A1).

### 2026-10-10 · decisions (no branch)

- Founder answers: D1 Missed counts as 0; D3 stay on Gmail + nodemailer; D4 reminders at 9:30 in each user's timezone; D5 20 uploads per user per day. Updated A8, A10, A18 and A19 to match.
- D2 pending: recommended deleting the plans and specs after moving three spec-only decisions into standards.md (listed in A6). All three specs are in git history.
- New D6 (open): Vercel Hobby cron runs once a day within an hour, so 9:30 local needs another trigger. Recommended a GitHub Actions schedule every 30 minutes, with the daily Vercel cron as a backstop.
- No code changes.

### 2026-10-10 · D2 cleanup and D6 (no branch)

- D2: deleted `docs/superpowers/` (12 plans, 3 specs). Moved the three spec-only decisions into `apps/web/standards.md` and pointed its `next lint` note at A25. Ops notes from the dependency-pass plan are written out in A6 for `docs/ops.md`.
- D6 decided: GitHub Actions every 30 minutes (repo is public, so free). Workflow design and gotchas are in A8; it ships with A8, not before.
- Stale references: the old project folder is no longer referenced anywhere in the repo. Removed its 4 entries from `.claude/settings.local.json` and gitignored that file (part of A5). Added a root `CLAUDE.md` rule: this repo is the only codebase; no absolute machine paths.
- `gh` was not signed in on this machine; the founder signed in with `gh auth login --web` (account P541M, scopes include `repo` and `workflow`). Confirmed the repo is public.
- New A29: `npm run format:check` fails locally on all CRLF files (core.autocrlf); the formatting itself is clean. Fix with `.gitattributes`.
- Untracked `.claude/settings.local.json` in the same commit (the local file stays on disk).
- No app code changes.

### 2026-10-10 · B1 (`fix/welcome-email-lockdown`, PR #5)

- **A1 done.** `/api/welcome-email` now requires `Authorization: Bearer <ID token>` (verified with firebase-admin) and sends only to the token's email; a body `email` is ignored. The name comes from the body (whitespace collapsed, 100 characters max), falling back to the token's name, then the email's local part. Once per uid: the route creates `welcomeEmails/{uid}` with `create()` (atomic) before sending and deletes it again if the send fails, so a retry is possible. Failures go to `console.error` with the uid and SMTP codes only, never the address. No rules change: nothing matches `welcomeEmails`, so clients are denied.
- New `apps/web/src/utils/escapeHtml.ts` (copied from the landing contact route); both templates escape every user value (welcome `displayName`, `institution`; reminder `courseName`, `assessmentTitle`). Dropped the unused `email` parameter of `generateWelcomeEmailHTML`.
- `AuthContext`: sends the ID token and only `displayName`, and no longer awaits the request. It used to hold `loading` true until SMTP finished, despite its "non-blocking" comment. Comment fixed: it fires for every new user doc, not just Google sign-ups.
- **Verified:** GET gives 405; POST with no header, a non-Bearer header or a junk token gives 401. Against the local Auth and Firestore emulators (dev server on :3005), with a test user on the founder's address: a body email (a `+a1body` alias of the same inbox) was ignored and the mail went to the token's address; a second call returned `sent: false`; two concurrent calls after clearing the marker sent one email; the user's own token gets 403 reading or deleting its marker. Exactly two real emails arrived, both to the founder's address, and the HTML reads `Hi &lt;b&gt;x&lt;/b&gt;!`. The reminder template's escaping was checked by rendering it locally (no send).
- **Verification loop:** lint, typecheck and build green. `format:check` fails on line endings only (A29: 158 web and 38 landing files); `prettier --check --end-of-line auto .` passes in both apps. Build sizes unchanged.
- **Left for the founder:** on the Vercel preview, sign up with a fresh address and expect exactly one welcome email. Not tested locally: the browser sign-up flow (it would need a new production account) and the SMTP-failure path that releases the marker.
- Existing users have no marker. The client only calls the route when the user doc is missing, so nothing changes for them, but a direct call from an existing account would send it one welcome email at its own address.
- **Gotchas:** the C: drive is full (17.5 MB free), so the Firestore emulator download failed with ENOSPC. Set `FIREBASE_EMULATORS_PATH`, `TEMP`/`TMP` and `JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=<dir>` to folders under `node_modules/.cache/` on E:. The jar (v1.22.0, 131 MB) stays cached in `node_modules/.cache/a1-test/emulators` for A16 (`npm ci` deletes it). Emulator ID tokens are unsigned and only pass when the server has `FIREBASE_AUTH_EMULATOR_HOST` set; set `FIRESTORE_EMULATOR_HOST` with it so no write reaches production. Stopping a background dev server or emulator leaves its node/java children running on Windows; kill them by PID.
- **New:** A30 and D7 (welcome email to unverified sign-up addresses; recommendation in A30). A31: redesign both emails, founder priority, queued as B16 right after B1.
- The founder allowed the agent to commit, push and open the PR for this batch only; the founder merges.

### 2026-10-10 · B16 (`feat/email-redesign`, PR #6)

- **D7 decided** as recommended (name only for a verified address). **A30 and A31 done**; the founder signed off on the test sends, then asked for a PR (the agent committed, pushed and opened it for this batch only).
- **A31.** `lib/emailTemplates.ts` is rewritten as one shared layout plus `reminderEmail()` and `welcomeEmail()`, each returning `{ subject, html, text }`; `lib/email.ts` is one `deliver()` plus `sendReminderEmail` and `sendWelcomeEmail` (the old `sendEmail` and the subject line in `notifications.ts` are gone). The layout is tables, inline light styles, a `prefers-color-scheme` dark block for Apple Mail, a 560px column, the theme tokens, Manrope from Google Fonts with an Outlook guard and a system fallback, the platform's `sm` primary button, and a hidden preheader. New `public/images/email-logo.png` (the mark in amber, 84px, rendered from `Asetta_Logo.svg` with sharp). The reminder shows the assessment, the course and the real due date and time ("Tuesday, October 13 at 11:59 PM"), with a footer link to Settings. The due time is formatted on the server's clock, the same clock `notifications.ts` parses it on; A8 replaces both. The new "Email" section in standards.md records the rules.
- **Founder feedback on the first preview**, now fixed: the font didn't match the platform (it now loads Manrope; Gmail and Outlook still can't), and the button was too big (it was 44px; it is now the platform's 36px `sm` button). Light/dark stays with the mail app's setting, the standard; the Asetta theme lives in the browser and the server never sees it.
- **Preview:** dev-only `GET /api/dev/email-preview` (404 unless `NODE_ENV` is development) lists the variants; `format=text` shows the subject and plain text. It renders with the dev server's origin, so the logo loads locally.
- **A30.** `/api/welcome-email` passes the name only when the token has `email_verified`, and the `institution` body field is gone.
- **Verified:**
  - Previews checked in light and dark, at 680px and 390px, and with Manrope stripped (the Gmail fallback); HTML in a name renders as text.
  - Templates contain no emoji, borders, shadows or old copy; amber only on the button and the logo.
  - Four emails sent with the founder's approval, all to the founder's own inbox, all landed in Primary. Two design tests went from a scratchpad script that sent the preview HTML with the logo as an inline attachment (the hosted PNG isn't deployed yet). Two went through the real route on the dev server (:3005) against the Auth and Firestore emulators:
    - Verified test user: "Welcome to Asetta, B16 Verified" / "Hi B16 Verified,".
    - Unverified test user, whose body sent "Visit evil.example now": "Welcome to Asetta" / "Hi there,", and that text appears nowhere in the HTML or the plain text.
    - A second call for each returned `sent: false`.
- **Verification loop:** lint, typecheck and build green; build sizes match the Baseline. `format:check` fails on line endings only (A29: 158 web files); `prettier --check --end-of-line auto .` passes in both apps.
- **`/code-review` (high) before the PR:** fixed the reminder's "due in" wording, which came from the cron's `floor(ms / day)` count and could contradict the date now shown (due tomorrow 10:00 with the 21:00 UTC run read "due today"; 47 hours out read "due tomorrow"). The email now counts calendar days to `dueAt` on the same clock via the new `calendarDaysUntil` in `utils/dateUtils.ts`, which `getDaysUntil` now wraps. The send decision and the dedupe IDs still use the old count until A8. Also fixed: an empty course name no longer leaves "for  is due" in the subject. Skipped: reminder send failures are still dev-logged only (A3).
- **Left for the founder:** after deploy, the logo loads from `https://asetta.me/images/email-logo.png`; until then, emails sent by the real routes show no logo (the two A30 test emails are like that), so check one real email after the merge. Check the Vercel preview, then merge.
- **New:** A32 (Settings and onboarding say reminders go out at 9:00 PM; ships with A8, added to B9).
- **Gotchas:**
  - Manrope is installed on this machine, so a local preview shows it even when the web font doesn't load; strip it from the inline styles to see the Gmail fallback.
  - Gmail builds the inbox snippet from the plain-text part when the email has an attachment, so the design tests' previews skip the preheader; real sends have no attachment and show it.
  - Resizing the built-in browser pane clears an emulated viewport; the Chrome DevTools browser gives exact sizes and color schemes.
  - The emulator setup from B1 still works (project `asetta-me`, jar cached in `node_modules/.cache/a1-test/emulators`). The Auth emulator's `projects/{id}/accounts:update` with `Authorization: Bearer owner` sets `emailVerified`.
  - Stopped the dev server and emulators with `taskkill /T` by PID.
