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

1. Run the verification loop from the repo root: `npm run lint && npm run format:check && npm run typecheck && npm test && npm run build`.
2. Tick finished items and note the date and PR: `- [x] **A1 · ...** (done 2026-10-12, PR #4)`. If an item is only partly done, leave it unticked and say what's left in the log.
3. Add a session log entry at the bottom: branch, items, what changed, what's left, gotchas.
4. Update the docs the change touches: rules in the CLAUDE files or `apps/web/standards.md`; deploy, cron, env, rules and npm facts in `docs/ops.md`.
5. Anything new you found becomes a new item with the next free ID. Don't fold it into the current batch.
6. Run `/code-review` and check the Vercel preview. The founder commits, pushes and merges.

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
| D8 | `next dev` (16.3.8 and 16.4.0) keeps writing `apps/landing/AGENTS.md`: disable it with `agentRules: false`, gitignore it, or commit it? | A34 | Open. Recommended: `agentRules: false` (details in A34). |

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
| B7 | A10, A14, A36 | Grade math + ICS export, test-first | D1 decided; A36 is the same grade function |
| B8 | A9, A37 | Extraction normalization, test-first | A37 is the same extraction code |
| B9 | A8, A32, A38 | Reminders at 9:30 local time, test-first | D4 and D6 decided; A32 is the Settings copy for the new time; A38 is the retry the new schedule makes possible |
| B10 | A11, A12 | Data layer: live assessments, user doc | |
| B11 | A13 | Course names containing "/" | Reproduce first |
| B12 | A16, A17 | Rules + verified notification email | Founder deploys rules |
| B13 | A15 | Bundle size | |
| B14 | A18, A20 | Rate limits (upload quota, contact form) | D5 decided |
| B15 | A19 | Cron throughput | After A8 |
| any | A21 to A28, A33 to A35, A39, A40 | Later items | As time allows; A34 needs D8 |

## Fix now

- [x] **A1 · Lock down `/api/welcome-email`** · S · risk L (done 2026-10-10, PR #5)
  - **Shipped:** the once-per-user marker is a server-only `welcomeEmails/{uid}` doc, not a user-doc field: owners can write any user-doc field today, so they could clear one and re-send without limit. No rule matches `welcomeEmails`, so clients can't touch it (keep it that way in A16). Escaping helper: `apps/web/src/utils/escapeHtml.ts`. Follow-up risk: A30.
  - **Where:** `apps/web/src/pages/api/welcome-email.ts`; `apps/web/src/lib/emailTemplates.ts` (welcome `displayName` :247, `institution` :255; reminder `courseName`/`assessmentTitle` :113-114); only caller `apps/web/src/contexts/AuthContext.tsx:53`.
  - **Problem:** No auth. Anyone can POST any `email` and `displayName`, and the server sends HTML mail from Asetta's Gmail with those values unescaped. That's phishing from your identity, and a Gmail suspension would also stop reminders.
  - **Fix:** Require `Authorization: Bearer <ID token>` and verify it with firebase-admin. Send only to the token's email and ignore the body's. Send at most once per uid (e.g. a `welcomeEmailSentAt` field written with the admin SDK). Escape every interpolated value in both templates with one shared `escapeHtml` (model: `apps/landing/src/pages/api/contact.ts:13`). Fix the AuthContext comment that says the email is for Google users only; it fires for every new user doc.
  - **Done when:** an unauthenticated POST returns 401; a body `email` is ignored; a second call for the same user sends nothing; `<b>x</b>` as a name renders as text.

- [x] **A2 · Patch vulnerable dependencies** · S (M for nodemailer) · risk L/M (done 2026-10-10, PR #7)
  - **Shipped:** web `next` and `eslint-config-next` 15.5.27 (still exact pins); landing `next`, `eslint-config-next` and `@next/third-parties` `~16.3.8`, not 16.4.0, which breaks Pages Router dev under Turbopack (A33); `npm audit fix`; nodemailer 10.1.0 in both apps as its own commit, with `@types/nodemailer` removed (nodemailer 10 ships its own types). `npm audit --omit=dev` went from 46 (1 critical, 12 high) to 38 (0 critical, 5 high); every remaining high and its reason is in the B2 session log.
  - **Where:** `apps/web/package.json:35` (`"next": "15.5.20"`, an exact pin; `eslint-config-next` is pinned the same), `apps/landing/package.json`, `package-lock.json`.
  - **Problem:** `npm audit --omit=dev` reports 46: 1 critical, 12 high, 33 moderate. The critical is `next` in both apps. Highs: `nodemailer` (both apps), a paste XSS in `prosemirror-view` (notes editor), `@firebase/firestore` via `@grpc/grpc-js`, `sharp` and `postcss` (through next), `@fastify/busboy`, `brace-expansion`, `nanoid`, `source-map-js`. The exact pin blocks the 15.5.27 fix.
  - **Fix:** Web `next` and `eslint-config-next` to 15.5.27. `npm update` in the landing (`next` 16.4.0 is in range). `npm audit fix` (never `--force`). Then nodemailer 10 (a major, both apps) as its own commit; smoke-test the reminder, welcome and contact emails. If the firebase/grpc high needs a major, move it to A25 and log it.
  - **Done when:** 0 critical; every remaining high is listed in the session log with a reason; Baseline numbers updated.

- [x] **A3 · Cron: fail closed, log failures, retry failed sends** · S · risk L (done 2026-10-11, PR #10)
  - **Shipped:** pure rules in `lib/reminderCron.ts` (`isCronAuthorized`, `isAlreadySent`, `cronRunId`), tested first in `lib/reminderCron.test.ts`. The route refuses every request while `CRON_SECRET` is unset or empty and logs that it is unset. `lib/notifications.ts` treats only `status: "sent"` as sent, so a failed send is retried; send failures (uid, assessment ID, SMTP codes, no addresses), per-user errors and a failed summary write go to `console.error`. Each run writes the server-only `cronRuns/{UTC date}` (the day's `runs`, `sent` and `failed`, plus `lastRun`), and the route returns the same summary. `vercel.json`: the cron's `maxDuration` is 300, the Hobby maximum on Fluid compute (Vercel docs, checked 2026-10-11); `memory` and `version` are gone. Retries only happen within the same day count, so under the daily cron a failure still waits for A8 (A38).
  - **Where:** `apps/web/src/pages/api/cron/notifications.ts:8`; `apps/web/src/lib/notifications.ts` (dedupe check :219-228, failed record :262-280); `apps/web/src/utils/devLog.ts`; `apps/web/vercel.json`.
  - **Problem:** If `CRON_SECRET` is unset, the header `Bearer undefined` is accepted. Per-user errors and email failures go through `devError`, which does nothing in production, and Vercel Hobby keeps logs for 1 hour, so failures are invisible. A failed send still writes the dedupe doc (status "failed"), so it is never retried. `maxDuration: 10` caps a sequential scan of every user. `memory` and `version: 2` in `vercel.json` are ignored leftovers.
  - **Fix:** Reject when the secret is unset. `console.error` real failures (no email addresses in logs). Persist a per-run summary (e.g. a `cronRuns/{date}` doc with users, sent, failed, duration). Treat only `status: "sent"` as already sent. Raise `maxDuration` within the plan's limit; drop `memory` and `version`.
  - **Done when:** with no secret configured, every request gets 401; a forced SMTP failure is retried on the next run; the last run's result is still readable after an hour.

- [x] **A4 · Upload route: auth first, clean temp files, log errors** · S · risk L (done 2026-10-11, PR #10)
  - **Shipped:** the token is verified from the headers before `parseForm`. Every temp file formidable opens, partial ones included (collected on `fileBegin`), is deleted in a `finally`. Each catch logs with `console.error` and the uid, as does the form-parse 400 (the 413s are the client's limits and stay quiet). `semesterId` must pass `isValidDocId` (`utils/validation.ts`, tested first: no `/`, not `.` or `..`, not `__x__`, at most 1,500 bytes).
  - **Where:** `apps/web/src/pages/api/upload.ts` (parse :74, auth :104, bare catches :158, :226, :276).
  - **Problem:** The multipart body (up to 4 MB, written to /tmp) is parsed before the token is checked. formidable's temp files are never deleted. Three `catch {}` blocks swallow errors with no log. `semesterId` isn't checked to be a single path segment.
  - **Fix:** Verify the Bearer token before `parseForm` (headers arrive before the body). Unlink every temp file in a `finally`. `console.error` in each catch. Reject a `semesterId` containing `/`.
  - **Done when:** an unauthenticated 4 MB POST returns 401 without touching /tmp; no upload files remain in /tmp after a request; failures show up in logs.
  - The per-user quota is A18.

- [x] **A5 · Repo hygiene leftovers from the merge** · S · risk L (done 2026-10-11, PR #11)
  - **Shipped (B6):** the `.refactor-baseline/` lines are gone from the landing `.gitignore` and `.prettierignore` (the folder no longer exists). `apps/web/next.config.ts` has no `images` block. `remotePatterns` was dead. `dangerouslyAllowSVG` only sent the logo's SVG through the image optimizer (`/_next/image`); without it, Next 15.5 serves any `.svg` given to `next/image` as is, which is how the landing already renders the same file. `contentDispositionType` and `contentSecurityPolicy` only hardened those optimizer responses, and nothing uses the optimizer now; Next's defaults are the same `attachment` and a `script-src 'none'` sandbox policy anyway. The four upload messages use a period, a semicolon or a comma instead of the em dash. The root `.gitignore` carries `*serviceAccountKey*.json` (web's pattern, which covers `serviceAccountKey*.json`), `firebase-adminsdk*.json` and `*.pem`. `.claude/settings.local.json` is no longer on disk; the prune list went to the founder (B6 log).
  - `.claude/settings.local.json` is committed but personal. Done 2026-10-10: the 4 entries pointing at the old project folder are removed, the file is in the root `.gitignore`, and git no longer tracks it. Optionally prune its broad allows (`Bash(rm:*)`, `Bash(curl:*)`, `Bash(env)`).
  - ~~Commit `apps/web/.env.example` (hidden by `.env*` in `apps/web/.gitignore`).~~ Dropped 2026-10-10: the founder deleted the file as not needed (git never tracked it). The env lists live in the root `README.md` and `docs/ops.md`.
  - `.refactor-baseline/` lines in `apps/landing/.gitignore` and `apps/landing/.prettierignore`: remove.
  - `apps/web/next.config.ts`: `images.remotePatterns` is dead (no remote images; Storage is unused and has no rules). Remove it. Check whether `dangerouslyAllowSVG` is still needed for the logo (the landing renders the same SVG without it).
  - Em dashes in user-facing copy: `apps/web/src/lib/upload/constants.ts:46,53` and `apps/web/src/lib/uploadClient.ts:56,65`.
  - Root `.gitignore`: carry the secret patterns repo-wide (`serviceAccountKey*.json`, `firebase-adminsdk*.json`, `*.pem`); today only `apps/web/.gitignore` has them.
  - **Done when:** verification loop green; the logo renders on `/login` in both themes.

- [x] **A6 · Docs cleanup** · S-M · risk L (done 2026-10-10, PR #8)
  - **Shipped (B3):** a root `README.md` (moved from `apps/web/README.md` and rewritten for the monorepo); `apps/web/README.md` and `apps/landing/README.md` deleted; new `docs/ops.md`; the root `CLAUDE.md` has the read order, a doc map, and the only copy of the git and em dash rules; `apps/web/CLAUDE.md` rewritten to 24 lines; `standards.md` cleaned up per the table below, plus a new "API routes and server code" section; small fixes to `apps/landing/CLAUDE.md`. The standards.md Testing section shipped later, with A7 (B4). The `apps/web/.env.example` line of the target structure is dropped (see A5). Details in the B3 session log.
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
    apps/web/.env.example   dropped (A5): the env lists are in README.md and docs/ops.md
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

- [x] **A7 · Vitest setup + first suites (grade, date, parsing)** · M · risk L (done 2026-10-11, PR #9)
  - **Shipped (B4):** Vitest 4.1.11 in `apps/web` (`vitest.config.ts`: node environment, the `@/` alias, `src/**/*.test.ts`), `npm test` at the root and in CI, and nine suites, one per module on the "Testable today" list. Every suite runs twice, as the `toronto` and `kolkata` projects (each sets `TZ`), and zone checks at the top of `utils/dateUtils.test.ts` prove the pin. Known bugs are 12 `it.fails` and 7 `it.todo` naming A9, A10, A14 and the new A36 and A37. No app source changed. The root `package.json` overrides `vite` to `^6.4.4`, because npm 10.9 crashes on Vite 8 (`docs/ops.md`, "Pins to know"). Details in the B4 session log.
  - **Where:** `apps/web` (new `vitest.config.ts`, a `test` script), root `package.json` (`npm test`), `.github/workflows/ci.yml`, `apps/web/standards.md` (Testing section, and `npm test` in the verification loop), `apps/web/CLAUDE.md` ("Verifying" says there are no unit tests yet), the root `README.md` checks list.
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
  - **Tests:** none yet; the date math sits in `lib/notifications.ts` next to Firestore calls, so extract it into a pure helper first. Every suite already runs under Toronto and Kolkata (`apps/web/vitest.config.ts`); a helper that takes the zone as a parameter can cover any other zone (Auckland, UTC) on top of that.
  - **Done when:** tests cover Toronto, a UTC+ zone, a half-hour zone (e.g. `Asia/Kolkata`), both 2026 DST switches, unpadded times and a late run; reminders arrive shortly after 9:30 local (within one scheduler interval).

- [ ] **A9 · Normalize AI and regex extraction output** · M · risk L-M · test-first
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts:124-176` (`formatDate`), `apps/web/src/lib/upload/gemini.ts:146-203`, `apps/web/src/pages/api/upload.ts:182-191`.
  - **Problem:** `formatDate` only knows full month names, so "Sept 30, 2026" and "Mar 15, 2026" are stored as raw text. DD/MM (common in Canada) is read as MM/DD: "15/03/2026" becomes "2026-15-03" (verified). No range checks. `dueTime`, `weight` and the names aren't type- or range-checked, so "11:59 PM" reaches the UI as an Invalid Date, and nothing guards against NaN (likely shows "NaN days left"). Fallback dates use the UTC day (`toISOString().split("T")[0]` at upload.ts:186, gemini.ts:182, textExtraction.ts:49). JSON is scraped out of free text with a regex.
  - **Fix:** One `normalizeExtractedAssessment()` used by both paths: a valid `YYYY-MM-DD` or the item is flagged for review (no guessing today's date in UTC), padded `HH:MM` (accept 12-hour input), weight clamped 0-100, strings trimmed and length-capped. Ask Gemini for structured JSON output (easier on `@google/genai`, see A25).
  - **Tests:** `lib/upload/textExtraction.test.ts` holds the A9 `it.fails` (abbreviated months, "15/03/2026") and `it.todo` (range checks, the shared normalizer); the fix turns them into passing `it`s. The Gemini cleanup in `lib/upload/gemini.ts` has no tests yet (extract it first). A37 sits in the same test file.
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
  - **Tests:** `utils/gradeCalculations.test.ts` holds the A10 `it.fails` (no remaining weight; D1 in both functions) and four `it.todo` for the component cases, which need their logic pulled out of `GradeCalculator.tsx` and `GradeOverviewCards.tsx` into `gradeCalculations.ts` first. A36 sits in the same file.
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
  - **Tests:** `utils/icsGenerator.test.ts` holds the A14 `it.fails` (the 23:59 end, DTSTAMP, SUMMARY escaping, 75-octet folding) and an `it.todo` for the UID domain decision.
  - **Done when:** tests cover 23:59 and names with commas and semicolons; the file imports cleanly into Google Calendar.

- [ ] **A15 · Bundle size** · M · risk L-M
  - **Where:** `apps/web/src/contexts/AuthContext.tsx` (pulls Firestore into `_app`); `apps/web/src/components/pages/UnifiedDashboardPage.tsx:10-16` (every tab imported eagerly).
  - **Problem:** 229 kB of JS is shared by every page (the `_app` chunk is 114 kB: Firebase Auth + Firestore). Every dashboard route is 320 kB because Calendar, Grades, Upload, dnd-kit and react-colorful all load up front.
  - **Fix:** `next/dynamic` for every tab except the one being opened. Move the user-doc bootstrap out of `AuthContext` (or lazy-import Firestore there) so the auth pages don't ship Firestore.
  - **Done when:** `npm run build` shows smaller numbers than the Baseline; no visible jank on tab switch.

- [ ] **A16 · Firestore rules: validate fields** · M · risk M
  - **Where:** `firestore.rules` (the live rules matched this file on 2026-10-10).
  - **Problem:** Owners can write any key, type or size on every doc, including the `email` that reminders go to (see A17). The `documents` and `courses` rules match collections nothing uses.
  - **Fix:** Allow-list keys and types per collection (user doc, semesters, assessments, coursePreferences); cap string lengths; delete the dead matches. Leave `welcomeEmails`, `cronRuns` and `notifications` without a client rule (server-only: A1, and A3's run summary and reminder records). Test in the Firestore emulator before deploying. Agents can't deploy rules (`.claude/settings.json` denies it); the founder deploys.
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
  - **Fix:** A8's `nextReminderAt` query removes the full user scan. What's left: read only the due user's assessments in the reminder window, bounded concurrency, and verify the transporter once per run. The A3 run summary (`cronRuns/{date}`) already keeps each day's `sent` and `failed` totals and each run's `durationMs`. Revisit D3 if sends approach the Gmail cap.
  - **Done when:** run time stays flat as users grow (measure with the A3 run summary).

- [ ] **A20 · Landing contact form: throttle and bot check** · S · risk L
  - **Where:** `apps/landing/src/pages/api/contact.ts`, `apps/landing/src/pages/contact.tsx`.
  - **Problem:** Validation and escaping are good, but nothing stops bots or repeat submissions, and it all lands in your inbox.
  - **Fix:** A hidden honeypot field plus a simple per-IP limit.

- [ ] **A32 · Settings states the wrong reminder time** · S · risk L · ship with A8 · found during B16
  - **Where:** the custom-days hint "Notifications will be sent daily at 9:00 PM." in `apps/web/src/components/settings/NotificationsSection.tsx` and `apps/web/src/components/onboarding/steps/NotificationsStep.tsx`.
  - **Problem:** the cron runs at 21:00 UTC (`vercel.json`), which is 5 PM in Toronto during daylight time and 4 PM in winter, not 9 PM. After A8 it becomes 9:30 in the user's own time zone, so the copy is wrong either way.
  - **Fix:** in the A8 PR, change both to "around 9:30 in the morning, your time" (or whatever A8 ships).

- [ ] **A36 · Current grade reads 0% when every marked assessment weighs 0** · S · risk L · with A10 (B7) · found during B4
  - **Where:** `apps/web/src/utils/gradeCalculations.ts` (`computeCurrentGrade`).
  - **Problem:** when the completed, marked assessments weigh 0 in total, the function returns `0` (`completedWeight > 0 ? ... : 0`), so the grades tab shows 0.0% and an F. Weight 0 is common: the regex fallback stores 0 when it finds no weight, and entering a mark in the grade calculator sets the status to Submitted.
  - **Fix:** return null ("no grade yet") when the completed weight is 0, the same answer A10 gives `calculateRequiredGrade` when nothing weighted is left.
  - **Done when:** the `it.fails("A36: ...")` in `utils/gradeCalculations.test.ts` is a passing `it`.

- [ ] **A37 · Course-name fallback reads a term as the course code** · S · risk L · with A9 (B8) · found during B4
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts` (`extractCourseName`). Callers: the regex fallback, the "Manual Review Required" placeholder in `pages/api/upload.ts`, and `lib/upload/gemini.ts` whenever Gemini returns no course name.
  - **Problem:** the code pattern `/([A-Z]{2,4})\s*(\d{3,4}[A-Z]*)/i` is case-insensitive, matches inside words, and takes the first hit in the whole text. A term before the course code wins: "Fall 2026 syllabus" then "CIS 3760" gives `Fall2026`; "Course outline, Winter 2027" gives `nter2027`; "Summer 2026" gives `mmer2026` (all checked in B4).
  - **Fix:** match capitals at a word boundary only (no `i` on the letters) and skip a term word (Fall, Winter, Spring, Summer) followed by a year.
  - **Done when:** the `it.fails("A37: ...")` in `lib/upload/textExtraction.test.ts` is a passing `it`, plus cases for the code formats the fix accepts.

- [ ] **A38 · A failed reminder is retried only on the same day count** · S · risk L · with A8 (B9) · found during B5
  - **Where:** `apps/web/src/lib/notifications.ts`: the record ID `${uid}_${assessmentId}_${daysUntilDue}` and the `daysUntilDue === notificationDaysBefore` check.
  - **Problem:** since A3, a failed send no longer blocks the next attempt, but the record ID and the send check both use the day count. The daily cron's next run is a day later, when the count has moved on, so that reminder is never sent and its failed record just stays. Only a rerun on the same day retries it. (Read from the code; B5's emulator runs checked the same-day retry only.)
  - **Fix (in A8's rewrite):** key the record by the assessment and the reminder's target day, not the count, and let a run send any reminder whose day has come and that has no "sent" record (or don't advance `nextReminderAt` past a failed send). With D6's 30-minute schedule, a failure is then retried within half an hour. Two things the B5 review raised come with that: overlapping runs can both read a failed record and both send (claim the send first, as `welcomeEmails` does with `create()`), and a permanent failure (a rejected address) is retried on every run, so cap the attempts.
  - **Done when:** a test of A8's pure helper shows a reminder that failed in one run going out in the next, after the day count has changed.

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
    - Tiptap 3 clears the Tiptap moderates (`mergeAttributes`, GHSA-cp6q-959q-f8rh); every 2.x is affected. Since A2 the core and StarterKit extensions are 2.27.3 while `@tiptap/react`, `starter-kit`, `pm`, `extension-link` and `extension-placeholder` stay 2.11.7 (`npm audit fix` moved only the transitive ones).
    - No firebase release clears the `@grpc/grpc-js` high: every `@firebase/firestore` up to firebase 13.0.0 pins `@grpc/grpc-js` `~1.9.0`, and the fix is 1.13.6 or 1.14.5. Why it doesn't apply to us is in the B2 log.
  - Web Next 15 to 16, to match the landing. `next lint` is removed in 16; the codemod is `npx @next/codemod@canary next-lint-to-eslint-cli .`. It also clears the web `postcss` high (Next 15.5.27 pins `postcss` 8.4.31). Mind A33: 16.4.0 breaks Pages Router dev under Turbopack.
  - The `uuid` moderate chain (firebase-admin → `@google-cloud/storage` 7 → `gaxios` 6 / `teeny-request` 9). npm calls it fixable, but `npm audit fix` leaves it; firebase-admin 14.5 (in range) moves its Google Cloud dependencies up a major (`@google-cloud/storage` 8, `@google-cloud/firestore` 9), so treat it as its own change.
  - `@types/node` is `^20` in web while `engines` says Node 22. (`@types/react` and `@types/react-dom` are one shared 19.3.0 since A2.) Moving it to `^22` also unblocks Vitest 5, which declares `@types/node` `^22 || >=24` as a peer, and the removal of the root `vite` override (B4 log; `docs/ops.md`, "Pins to know").

- [ ] **A26 · Align tooling across the apps** · S · risk L
  - One root `.prettierrc` and one Prettier version (web `^3.9.5` vs a pinned `3.8.4` in the landing can format differently).
  - Typecheck the landing too (the root `typecheck` covers web only).
  - Same env var name for the same Gmail credentials (`EMAIL_APP_PASSWORD` in web, `EMAIL_PASS` in the landing); update both Vercel projects together. Check the accounts first: in B2 the landing's local `.env.local` held a different Gmail account than web's, with an app password Gmail rejected (the founder replaced it).
  - `engines` in the landing `package.json`.
  - The code duplication (`cn`, Logo, favicons, amber tokens, logo filter, nodemailer setup, email regex) stays, per the root "no shared code" rule.

- [ ] **A27 · Landing feature GIFs** · S-M · risk L
  - About 9.3 MB of GIFs in `apps/landing/public/images/features`. Convert to MP4/WebM (autoplay, muted, loop, playsinline).

- [ ] **A28 · CI audit step** · S · risk L
  - Add `npm audit --omit=dev --audit-level=high` to `.github/workflows/ci.yml` after A2 (it would fail today). The test step shipped with A7.
  - Still fails after A2 (exit 1): the 5 remaining highs have no in-range fix (B2 log). Needs web Next 16 (A25) and a firebase release that lifts `@grpc/grpc-js`, or a step that tolerates those two advisories by ID.

- [x] **A29 · Line endings: local format check fails on Windows** · S · risk L · do early (B6) (done 2026-10-11, PR #11)
  - **Shipped (B6):** a root `.gitattributes` with `* text=auto eol=lf`, plus `binary` for images (png, jpg, jpeg, gif, ico, webp, avif, bmp), fonts (woff, woff2, ttf, otf, eot), mp4, webm (A27) and pdf. Only `apps/web/.gitignore` and `apps/landing/.gitignore` were stored with CRLF; every other text file was already LF in the index, so the renormalize commit touches those two files only. A fresh clone with `core.autocrlf=true` checks out every text file with LF and passes the whole loop, `format:check` included (B6 log). The workaround is gone from `docs/ops.md`, `apps/web/standards.md`, `apps/landing/CLAUDE.md` and the Batches section here.
  - **Problem:** this machine has `core.autocrlf=true`, so the checkout has CRLF line endings, and `npm run format:check` reports "Code style issues" in 159 files of `apps/web` alone; the verification loop can't pass locally. The only difference is line endings: `npx prettier --check --end-of-line auto .` passes. CI (Linux, LF) is unaffected.
  - **Fix:** a root `.gitattributes` with `* text=auto eol=lf` (mark binaries such as images and fonts `binary`), then the founder renormalizes once: `git add --renormalize .` in its own commit. No Prettier config change needed.
  - **Done when:** `npm run format:check` passes on a fresh Windows checkout.
  - Then delete the workaround from `docs/ops.md` ("The Windows dev machine"), the verification loop in `apps/web/standards.md`, the Conventions in `apps/landing/CLAUDE.md`, and the note under Batches in this file.

- [x] **A30 · Welcome email to unverified sign-up addresses** · S-M · risk L · D7 decided · found during A1 (done 2026-10-10, PR #6)
  - **Shipped:** the route reads `email_verified` from the verified ID token; only then does the name (body `displayName`, else the token's `name`) reach `welcomeEmail()`, which otherwise sends "Welcome to Asetta" and "Hi there". The unused `institution` body field is gone (the client never sent it, and it was one more piece of attacker-chosen text). A verified account with no name now also gets "Hi there" instead of its email prefix.
  - **Done when** (added at ship time; the item had none): a verified token puts the name in the subject and greeting; an unverified token gets the fixed subject and "Hi there" even when the body sends a name; the once-per-user rule from A1 still holds. All three checked against the emulators (session log).
  - **Where:** `apps/web/src/pages/api/welcome-email.ts`, `apps/web/src/lib/email.ts` (`sendWelcomeEmail` subject), `apps/web/src/pages/register.tsx`.
  - **Problem:** Password sign-ups never verify their email, so anyone can register with someone else's address and a display name of their choosing (up to 100 characters, escaped, but plain text such as a URL still shows). Asetta's Gmail then sends that address one welcome email with the name in the subject and greeting. A1 limits this to one email per new account, but accounts are free to create, and each send counts toward the Gmail daily cap (D3).
  - **Fix (pick with D7):** send the welcome email only once `email_verified` is true (needs a verification step; pairs with A17), or keep sending but leave the name out of the subject (and maybe the greeting), or accept the risk.
  - **Recommended (2026-10-10):** use the name only when the token says `email_verified` (Google sign-ups); otherwise send the fixed "Welcome to Asetta" with "Hi there". Text an attacker chooses then never reaches an unverified inbox, at the cost of the name for password sign-ups (usually just their email prefix). A few lines in the route; ship it with A31, which rewrites the same subject and greeting. Gating on verification is heavier and belongs with A17. If abuse ever shows up, add a global daily cap on welcome emails so they can't eat the Gmail limit reminders need.

- [ ] **A33 · Landing back to the current Next 16 once the dev bug is fixed** · S · risk L · found during B2
  - **Where:** `apps/landing/package.json` (`next`, `eslint-config-next`, `@next/third-parties` are `~16.3.8`).
  - **Problem:** Next 16.4.0 breaks Pages Router dev under Turbopack: modules a page shares with `_app` never get chunked, so the page server-renders and then dies on hydration with "module factory is not available" (vercel/next.js#99789; reproduced in B2 on `/` and `/contact` from a clean `.next` in a clean browser). `next build` is fine. 16.3.8 is the first release outside every `next` advisory, so the landing is pinned to `~16.3.8` until a fixed release ships.
  - **Fix:** when a 16.4.x or later release lists #99789 as fixed, move the three back to `^` that version and run `npm run dev:landing` on `/` and `/contact` in a fresh browser profile.
  - **Done when:** the landing is on the latest 16.x and dev renders every page without the overlay; the pin notes in `docs/ops.md` ("Pins to know") and `apps/landing/CLAUDE.md` (Framework) are gone.

- [ ] **A34 · `next dev` writes `apps/landing/AGENTS.md`** · S · risk L · needs D8 · found during B2
  - **Problem:** on Next 16.3.8 and 16.4.0 (the two B2 ran; 16.2.9 unchecked), `next dev` generates an `AGENTS.md` with a "read the Next.js docs in node_modules" block for AI agents ("Generated AGENTS.md for AI agents. Set `agentRules: false` in next.config to disable."), and re-creates it on every run, so the landing shows an untracked file after each dev session. Web will do the same after its Next 16 move (A25). B2 deleted the generated copy instead of committing it.
  - **Fix (pick with D8):** set `agentRules: false` in `apps/landing/next.config.ts` (recommended: the CLAUDE.md files are the agents' source of truth, and Claude Code doesn't read `AGENTS.md`), or gitignore `AGENTS.md`, or commit it. Then update the `AGENTS.md` line in `docs/ops.md` ("Pins to know").

- [ ] **A35 · Em dashes left in the rules docs and code comments** · S · risk L · found during B3 (code comments added in B6)
  - **Where:** `apps/web/standards.md` (57 left) and `apps/landing/CLAUDE.md` (13 left). B3 kept em dashes out of everything it wrote or rewrote, but left untouched lines alone. Added in B6 at the founder's request: 32 in code comments across 24 files in `apps/web/src` (TS, TSX and CSS comments, for example `components/ui/button.tsx`, `styles/globals.css`, `lib/uploadClient.ts`). B6 removed the last ones from web copy; the landing's `src` has none.
  - **Problem:** the root rule covers copy, not docs or comments, but the founder asked for none in anything B3 wrote, and agents lift wording from these docs and comments into code and copy.
  - **Fix:** replace each by hand with a comma, colon, semicolon or period (some are asides or ranges that need rewording, not a mechanical swap). Decide with the founder whether the root rule should say "copy, docs and code comments".
  - **Done when:** a search for the em dash character (U+2014) finds nothing in the CLAUDE files, `standards.md`, `docs/` or `apps/web/src`.

- [ ] **A39 · Token checks that fail for server reasons are silent** · S · risk L · found during B5
  - **Where:** the `catch` around `verifyIdToken` in `apps/web/src/pages/api/upload.ts` and `apps/web/src/pages/api/welcome-email.ts`.
  - **Problem:** every error becomes a 401 "Invalid authentication token" with no log. That is right for an expired or junk token, but the same catch also takes server-side failures (for example the admin SDK failing to fetch Google's signing keys, or bad admin credentials). The student then sees "Your session expired" while nothing reaches the logs.
  - **Fix:** `console.error` (with the error code, no token) when the code isn't a client token problem (`auth/id-token-expired`, `auth/id-token-revoked`, `auth/argument-error` and similar), and consider a 503 for those.

- [ ] **A40 · Upload route capped at 60 seconds** · S · risk L · found during B5
  - **Where:** `apps/web/vercel.json` (`src/pages/api/upload.ts`: `maxDuration: 60`).
  - **Problem:** one upload of up to 10 PDFs calls Gemini once per file, one after another. Hobby on Fluid compute allows 300 seconds (B5 checked the docs), but this route stops at 60, and a slow batch shows the student the timeout message.
  - **Fix:** time a 10-file upload; if it gets near 60 seconds, raise the limit (up to 300) or process the files with bounded concurrency.

## Baseline (2026-10-10)

Numbers to compare against when items land.

- `npm audit --omit=dev`: 38 vulnerabilities (0 critical, 5 high, 33 moderate) after A2 (2026-10-10; was 46: 1 critical, 12 high, 33 moderate). Including dev dependencies: 43 (10 high).
- `apps/web` build (Next 15.5.27, after A2): 229 kB First Load JS shared by all pages (`_app` chunk 114 kB); every dashboard route 319 kB (was 320); `/login` and `/register` 242 kB; `/onboarding` 285 kB; `/settings` 284 kB (was 285).
- Live Firestore rules identical to `firestore.rules`; no Storage rules (Storage unused).
- Vercel: projects `asetta` (apps/web) and `asetta-landing` (apps/landing), Hobby plan: runtime logs kept 1 hour; cron jobs run at most once a day and fire anywhere within the scheduled hour; functions on Fluid compute get a 300-second default and maximum duration (docs checked 2026-10-11). In `apps/web/vercel.json` the cron route has `maxDuration` 300 since A3 (was 10) and the upload route 60.
- Tests (after B5, 2026-10-11; 9 suites after A7, none before): 11 suites in `apps/web`, each run in two zones. Per zone, 217 tests: 198 pass, 12 expected failures (`it.fails`: A9 3, A10 3, A14 4, A36 1, A37 1), 7 todo (A9 2, A10 4, A14 1). `npm test` takes about 2 seconds.

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

### 2026-10-10 · B2 (`fix/dependency-security`, PR #7)

- **A2 done.** After a final sweep the founder asked for a PR; the agent committed, pushed and opened it for this batch only (the founder merges). Three commits: Next pins plus `npm audit fix`; nodemailer 10 on its own; this tracker update.
- **Part 1:**
  - Web `next` and `eslint-config-next` 15.5.20 to 15.5.27, still exact pins.
  - Landing `next`, `eslint-config-next` and `@next/third-parties` `^16.2.9` to `~16.3.8`, not the 16.4.0 A2 expected: 16.4.0 breaks Pages Router dev under Turbopack (A33). 16.3.8 is outside every `next` advisory, and its `postcss` 8.5.23 is patched.
  - `npm audit fix`:
    - `prosemirror-view` 1.42.6 (the notes-editor paste XSS), `@fastify/busboy` 3.2.3, `source-map-js`, `nanoid`, `brace-expansion`, `markdown-it`, `js-yaml`, firebase-admin's own `@grpc/grpc-js` 1.14.6 and `@google-cloud/storage` 7.22.0.
    - It also moved Tiptap's core and StarterKit extensions 2.11.7 to 2.27.3. That doesn't clear the Tiptap moderate (A25), and the direct Tiptap packages stay 2.11.7.
  - Hoisting side effects: `sharp` 0.35.5 and a root `postcss` 8.5.23 (both security fixes), typescript-eslint 8.71.1 (lint only), and `@types/react`/`@types/react-dom` 19.0 to one shared 19.3.0. The landing typecheck failed with two copies once its `next` sat at the root.
- **Part 2:**
  - nodemailer 10.1.0 in both apps (web was on 9.0.3, the landing on 8.0.11).
  - `@types/nodemailer` removed from both: 10 ships its own declarations, and tsc resolves `nodemailer/dist/esm/nodemailer.d.ts`.
  - The breaking changes don't touch our code: 9.0 validates TLS on remote attachment, OAuth and proxy fetches (unused); 10.0 needs Node 20+ (we run 22).
- **Audit:** `npm audit --omit=dev` 46 to 38: 0 critical, 5 high, 33 moderate.
- **Remaining highs, with reasons:**
  1. `@grpc/grpc-js` through the firebase client SDK (four entries: `firebase`, `@firebase/firestore`, `@firebase/firestore-compat`, `@grpc/grpc-js`).
     - Every `@firebase/firestore`, up to firebase 13.0.0, pins `@grpc/grpc-js` `~1.9.0`, so no upgrade, major or not, clears it (noted in A25).
     - The advisory (GHSA-m9gg-hp2v-232j) is about a gRPC *server* trusting unauthorized client certificates in `getAuthContext`, which we don't run. The client SDK talks to Firestore over WebChannel in the browser, not grpc-js.
     - npm's only suggestion is a "fix" that downgrades to firebase 9.14.0.
  2. `postcss` 8.4.31 inside web's `next` 15.5.27, an exact pin by Next.
     - The advisories are file reads through an attacker-controlled `sourceMappingURL` in CSS compiled at build time. Next compiles only our own CSS.
     - Clears with web Next 16 (A25).
  - Dev-only highs (5 more): `braces` → `micromatch` → `fast-glob` under `@next/eslint-plugin-next`, at lint time only. npm's only fix downgrades `eslint-config-next` to 14.
  - Moderates left: Tiptap (needs Tiptap 3), the `uuid` chain under firebase-admin (A25), and web `next` through that `postcss`.
- **Smoke tests:**
  - Previews checked in light and dark with the plain-text parts and shown to the founder before anything was sent.
  - Three emails sent with the founder's approval, all to the founder's own address:
    - **Welcome:** through the real `/api/welcome-email` route on the dev server (:3005) against the Auth and Firestore emulators. A verified test user got "Welcome to Asetta, B2 smoke test"; a second call returned `sent: false`; the marker landed in the emulator.
    - **Reminder:** a scratchpad script sent the preview's subject, HTML and text through nodemailer 10 with `lib/email.ts`'s transport settings (verify, then send), with links and the logo pointed at `https://asetta.me`; Gmail answered 250 OK. The cron route wasn't called (it reads production data).
    - **Contact form:** submitted on the landing dev server (:3006), `POST /api/contact` 200. The first try failed with `EAUTH 535`: the landing's local `.env.local` held a different Gmail account than web's, with an app password Gmail rejected. The founder replaced it, and the retry sent. The Vercel values may need the same check (A26).
  - These ran while the landing was briefly on 16.4.0; the web tree they used is identical in the final lockfile (checked entry by entry).
- **B16 follow-up:** the email logo is live in production (checked 2026-10-10): `https://asetta.me/images/email-logo.png` returns 200 `image/png`, 2,488 bytes.
- **Verification loop:**
  - lint, typecheck and build green: web on Next 15.5.27, the landing on 16.3.8 (Turbopack). The landing's `tsc --noEmit` is clean too, and `npm ls --all` shows no invalid or missing packages.
  - `format:check` fails on line endings only (A29: 161 web and 38 landing files); `prettier --check --end-of-line auto .` passes in both apps.
  - Web build sizes: dashboard routes 319 kB (was 320), `/settings` 284 kB (was 285), the rest unchanged (Baseline updated).
- **Final sweep before the PR:**
  - Fresh audit against the original: the `next` critical is gone in both apps (web `next` is moderate only through its pinned `postcss`). Fixed highs: `nodemailer`, `prosemirror-view`, `sharp`, `@fastify/busboy`, `brace-expansion`, `nanoid`, `source-map-js`, and the landing's `postcss`. Left: the firebase/`@grpc/grpc-js` chain and web's Next-pinned `postcss` (reasons above).
  - Lockfile: `npm install --package-lock-only` changes nothing; all 827 entries resolve from registry.npmjs.org with integrity hashes; the Linux binaries CI and Vercel need are recorded (`@next/swc-linux-x64-gnu` for 15.5.27 and 16.3.8, sharp, lightningcss, Tailwind oxide).
  - The sends ran on dev servers (Turbopack), so the production builds were checked too, without sending:
    - Web is built with webpack. Served with `next start`, `POST /api/welcome-email` and `GET /api/cron/notifications` with no auth both return 401, so `lib/email.ts` (which calls `createTransport` at module load) loads under nodemailer 10. `/api/dev/email-preview` returns 404.
    - The landing's production bundle loads nodemailer through Turbopack's external alias, which points at 10.1.0; its ESM entry exposes `createTransport` on the default export the contact route imports.
- **Left for the founder:**
  - On the Vercel preview:
    - Open a notes editor and paste some formatted text: Tiptap now mixes 2.27.3 core and extensions with 2.11.7 `react`, `starter-kit`, `link` and `placeholder`, and the editor needs a signed-in account, so it wasn't checked locally.
    - Click through the landing.
    - Submit one contact form to confirm the landing's Vercel email credentials.
  - Delete the three B2 test emails, then merge. `/code-review` was not run: the diff is package manifests, the lockfile and this tracker, with no source changes.
- **New:** A33 (landing back to the current Next 16 once vercel/next.js#99789 ships), A34 and D8 (`next dev` writes `apps/landing/AGENTS.md`; B2 deleted the generated copy, not committed). A25, A26 and A28 got B2 notes.
- **Gotchas:**
  - npm 10.9.8 workspaces misbehave:
    - `npm update -w apps/landing` updated *every* workspace: web got firebase 11.10, Tiptap 2.27 and firebase-admin's Google Cloud majors. Reverted.
    - `npm update <names> -w apps/landing` updated the root (web) copies of those names and left the landing's alone.
    - `npm install next@^16.4.0 -w apps/landing` saved the new spec but left 16.2.9 in the lockfile (an invalid tree that `npm install` would not repair).
    - What works: name the version in `npm install <pkg>@<range> -w <app>`, then check `npm ls --all`. If the lockfile is stuck, delete that package's entries from `package-lock.json` and its folder, then `npm install`.
  - Plain `npm ls` only checks top-level dependencies and called an invalid nested `postcss` valid; use `npm ls --all`.
  - Deleting a nested `next` folder by hand leaves a stale `apps/landing/node_modules/.bin/next` shim (`Cannot find module ...apps\landing\node_modules\next\dist\bin\next`); delete the shim. A fresh `npm ci` never has it.
  - The landing's `next` and `postcss` now sit at the repo root and web's `next` is nested in `apps/web/node_modules`, the reverse of before.
  - C: has about 20 MB free, so npm hit ENOSPC. Set `npm_config_cache` and `TEMP`/`TMP` to folders under `node_modules/.cache/` on E:.
  - Next 16 keeps a versioned Turbopack dev cache in `apps/landing/.next/dev`; deleting it is safe.

### 2026-10-10 · B3 (`docs/a6-cleanup`, PR #8)

- **A6 done.** Docs only: no app code, config or dependency changes. The founder asked for a PR at the end of the session; the agent committed, pushed and opened it for this batch only (the founder merges).
- **Files:**
  - New root `README.md`, moved from `apps/web/README.md`: a monorepo layout table, root commands (the old `npm run dev` doesn't exist at the root), `.env.local` blocks for both apps, both Vercel projects, and the CI job as it is (`verify`: install, lint, format check, typecheck, build). It has no pointer to `.env.example`; after the session the founder deleted that file as not needed.
  - Deleted `apps/web/README.md` and `apps/landing/README.md` (the landing one described the pre-rewrite site).
  - New `docs/ops.md`: Vercel projects, the reminder cron, an env matrix per app (every env var either app reads, apart from `NODE_ENV`), Firestore rules deploy, local API testing against the emulators, the `npm audit` policy, npm workspace notes and pins, and Windows machine notes. Sources: A6's ops notes, every B2 gotcha, and the B1/B16 emulator notes.
  - Root `CLAUDE.md`: the read order, a doc map, the full git rule, and a rule to stop dev servers before `npm install` or a build on Windows. It also points to ops.md before any dependency update.
  - `apps/web/CLAUDE.md`: rewritten to 24 lines (stack, the standards.md mandate, root commands, where things live, how to verify, the cron-route warning).
  - `apps/web/standards.md`:
    - Removed: the changelog preamble, the migration-state table, the `card.tsx`/`CustomSelect` examples, the `gray-200` block bullet (the block is gone from `globals.css`), and both git-rule copies.
    - Changed: the em dash mentions point to the root rule; "migrating"/"migrated" wording now describes the steady state; the loop runs `npm run typecheck` from the root; `npm run format` is now `npm run format -w apps/web`.
    - New: an "API routes and server code" section, which names the cron (A3) and upload (A4) routes as known gaps.
    - Rewrote only the passages it touched. The theme-control and selector rules moved under their own heading.
  - `apps/landing/CLAUDE.md`: root commands, the Vercel deploy line, a pointer for the `~16.3.8` pin (A33), the env pointer to ops.md, the em dash bullet replaced by a pointer, "before committing" replaced by the loop, and the redundant "Known issues" section dropped.
- **Contradictions resolved:**
  - Landing README vs landing `CLAUDE.md`: the README is deleted; the CLAUDE.md matches the code (Inter, Motion, Tailwind v4 CSS config, no pricing page, Next 16, Vercel).
  - Verification steps: one loop in standards.md (lint, format check, typecheck, build, from the root). Web `CLAUDE.md` points to it, and the landing runs the same loop without typecheck (the landing has no typecheck script; A26).
  - Where commands run: every doc runs them from the root, with `-w <app>` for an app's own scripts.
  - Selector vs icon rule: the Icons rule wins (selected option tinted, no checkmark).
  - The git rule now lives only in the root `CLAUDE.md`.
- **Done-when checks:**
  - Grepped the README, the CLAUDE files, standards.md and ops.md:
    - Nothing uses `npx tsc`, an absolute machine path, or `asetta/` as a working directory.
    - Nothing names a deleted file. `tailwind.config.ts` appears only as "there is no `tailwind.config.ts`".
  - The em dash and git rules appear only in the root `CLAUDE.md`. Other mentions of commits are about Firestore writes, secrets, or how to split a change, not about who commits.
  - Every backticked path in the three CLAUDE files resolves except `docs/superpowers/`, which exists only while work is in flight (the doc map says so). The component paths in standards.md resolve too.
  - This tracker still quotes old patterns where items describe them.
- **Checked while writing:**
  - Vercel, read-only through the Vercel MCP: `asetta` serves asetta.me and `asetta-landing` serves www.asetta.me, both on Node 22.x. Vercel Authentication is on for previews and the generated `*.vercel.app` URLs. The API returns neither the Root Directory nor the plan, so ops.md doesn't state the Root Directory and takes the Hobby plan from the Baseline.
  - The old web `CLAUDE.md` said preferences live in localStorage. Only the table's sort and filter do; display preferences are in Firestore. The new file doesn't make the claim.
- **Verification loop:**
  - Lint, typecheck and build green; build sizes match the Baseline.
  - `format:check` fails on line endings only (A29: 161 web files); `prettier --check --end-of-line auto .` passes in both apps.
  - Markdown is Prettier-ignored in both apps and nothing checks root-level docs, so the loop can't catch doc problems; the greps above stand in for that.
- **Tracker updates:** "Ending a session" gained a step to update the docs a change touches. A5's `.env.example` bullet is dropped (the founder deleted the file after B3). A7, A29, A33 and A34 name the doc lines they must update when they land.
- **New:** A35 (em dashes left in standards.md and the landing `CLAUDE.md`, and whether the root rule should cover docs).
- **Left for the founder:** review and merge. `/code-review` was not run: the diff is Markdown only. The Vercel preview only needs a green build (no app changes).
- **Gotchas:** the Write tool saves LF, so git warns "LF will be replaced by CRLF" on the new and rewritten files; harmless (git stores LF either way, and the diff is content only).

### 2026-10-11 · B4 (`test/a7-vitest`, PR #9)

- **A7 done.** Tests, test config, CI and docs, plus the dependencies below; no app source changed. After a last look-through the founder asked for a PR; the agent committed, pushed and opened it for this batch only (the founder merges).
- **Install:**
  - `npm install -D vitest@^4.1.11 -w apps/web` (resolves 4.1.11). Scripts: `test: vitest run` in web, `test: npm run test -w apps/web` at the root.
  - Not Vitest 5 (5.0.3 is current): it declares `@types/node` `^22 || >=24` as a peer and web is on `^20` (A25).
  - The first try crashed: npm 10.9.8, `Cannot read properties of null (reading 'edgesOut')`. Vitest takes Vite `^6 || ^7 || ^8`; npm picked Vite 8.3.4, whose optional `@vitejs/devtools` peer pulls in `@vitejs/devtools-vitest`, which peers on `vitest`, and arborist dies on the loop.
  - Vite 7 avoided the crash but wants `@types/node` `^20.19`. npm would then have hoisted `@types/node` 26.6.5 to the root over web's 20.17.19, where root-level packages web compiles against (firebase-admin, `@types/formidable`) resolve it. A direct `vite` devDependency didn't help either: npm nests it under `apps/web` and hoists `vitest` to the root, out of its reach.
  - Settled on a root override, `"vite": "^6.4.4"` (patched Oct 6; its peer range takes `@types/node` `^20`). Every step was a `--dry-run` first. Recorded in `docs/ops.md` ("Pins to know", and the loop crash under the workspace notes).
  - Lockfile: 81 new entries (Vitest, Vite 6.4.4, esbuild 0.25.12, rollup 4.64.5 and their platform binaries). One existing version changed: `@types/estree` 1.0.6 to 1.0.9, which rollup pins. Every entry resolves from registry.npmjs.org with an integrity hash, and the Linux binaries CI needs are recorded (`@rollup/rollup-linux-x64-gnu`, `@esbuild/linux-x64`, and rollup's own optional `@napi-rs/lzma-linux-x64-gnu`).
  - `npm ls --all`: no invalid or missing packages. Its two "extraneous" lines (`@emnapi/runtime`, `@img/sharp-wasm32`) are lockfile entries main already had, unchanged.
  - `npm install --package-lock-only` changes nothing. `npm audit` is unchanged (38 production, 43 with dev dependencies), with no advisory against Vitest, Vite, esbuild or rollup.
- **Config** (`apps/web/vitest.config.ts`): node environment, `@` aliased to `src` (mirrors tsconfig `paths`), `src/**/*.test.ts`, and two projects, `toronto` and `kolkata`, that set `TZ` through `env`.
  - Every suite runs in both zones, not just a list of date suites that would need keeping in sync; the full run takes about 2 seconds.
  - Before relying on it, checked on this machine that Node applies `process.env.TZ` assigned at runtime, which is how `env` reaches each worker.
  - The zone checks at the top of `utils/dateUtils.test.ts` assert `getTimezoneOffset()` in January and July, and the length of Mar 8 and Nov 1, 2026 (23 and 25 hours in Toronto, 24 in Kolkata). A pin that silently failed would show there.
- **Suites**, each next to its module, with a shared `makeAssessment()` in `src/test/assessments.ts` imported through `@/` so the alias is exercised:
  - `utils/gradeCalculations`, `utils/urgency`, `utils/icsGenerator`, `utils/authErrors`.
  - `utils/dateUtils`: local parsing, `getTodayDateString` either side of midnight, `calendarDaysUntil` and `getDaysUntil` with `vi.setSystemTime`, both 2026 DST weekends.
  - `lib/upload/textExtraction`: `formatDate`, `extractCourseName`, `extractAssessmentsBasic`; `extractTime` stays private and is covered through `extractAssessmentsBasic`.
  - `lib/upload/constants` (`validateUploadSelection`, `formatBytes`), `lib/uploadClient` (`parseUploadResponse`, with Node's `Response`).
  - `constants/courseColors`: also pins the preset order and three hash defaults, since reordering would change every unset course's color.
  - Copy is asserted with `toContain` on its key words, so A5's em dash fix in the upload messages won't break these.
- **Known bugs as tests:**
  - `it.fails` (12): A9 abbreviated months ("Sept 30, 2026", "Mar 15, 2026") and "15/03/2026" read as month 15; A10 `calculateRequiredGrade` returning 0 when nothing weighted is left, and D1 (a Missed assessment without a mark counts as 0) in both grade functions; A14 the 23:59 DTEND, DTSTAMP, SUMMARY escaping and 75-octet folding; A36; A37.
  - Each was run once as a plain `it` to confirm it fails on its assertion and not on a mistake in the test. The messages show today's behavior, for example DTEND `20261015T005900` before DTSTART `20261015T235900`.
  - `it.todo` (7): the A10 component cases (the letter from the rounded value, a target of 0, clearing the only mark, a negative required grade), A9's range checks and shared normalizer, and the A14 UID domain decision.
- **Done-when checks:**
  - `npm test` runs from the root, and CI has a "Test (web)" step after typecheck. It runs on GitHub for the first time on this PR.
  - The first suites cover grades, dates and urgency, `formatDate` and ICS.
  - standards.md has a Testing section.
- **Docs:** standards.md has a Testing section (where tests live, both zones, the clock, `it.fails` and `it.todo` with item IDs, test-first fixes, loose copy assertions) and `npm test` in the loop ("All five green"). Also updated: `apps/web/CLAUDE.md` (commands, where tests live, Verifying), the root README (checks list and CI line), the root `CLAUDE.md` command list, `docs/ops.md` (the `vite` override, the Vitest 4 choice, the npm loop crash, Git Bash and `TZ`), and here: the loop under "Ending a session", and a **Tests** line on the test-first items A8, A9, A10 and A14 saying where their waiting `it.fails` and `it.todo` live.
- **Verification loop:**
  - lint, typecheck, `npm test` and build green. `npm test`: 18 files (9 suites in 2 zones), 320 passed, 24 expected failures, 14 todo.
  - `npm test` also passes with the host zone set to UTC (`$env:TZ = "UTC"` in PowerShell), as on CI's Linux runner.
  - `format:check` fails on line endings only (A29: 160 web files, one fewer than before because Prettier rewrote `apps/web/package.json` with LF; 38 landing). `prettier --check --end-of-line auto .` passes in both apps, and the new files pass the strict check too.
  - Build sizes match the Baseline, so no test code reaches the bundles.
- **New:**
  - A36: the current grade reads 0% when every marked assessment weighs 0. Added to B7.
  - A37: the course-name fallback reads "Winter 2027" as `nter2027`. Added to B8.
  - A25 now notes Vitest 5 and the `vite` override.
- **Left for the founder:**
  - Check that the CI "Test (web)" step passes on Linux (its first run), then merge.
  - The Vercel preview only needs a green build: Vercel installs devDependencies too, but nothing from Vitest reaches the build.
  - `/code-review` was not run: the diff is tests, test config, CI and docs, with no app source changes.
- **Gotchas:**
  - C: had 224 MB free, so the install ran from the start with `npm_config_cache`, `TEMP` and `TMP` under `node_modules/.cache/a7/`. No ENOSPC.
  - `npm install --dry-run` reproduces the arborist crash without touching anything; the debug log's `placeDep` and `fetch manifest` lines show which package pulled the loop in.
  - Git Bash doesn't pass `TZ` to Node (`TZ=Asia/Kolkata node ...` still ran in Toronto); PowerShell does.
  - An `it.fails` also passes when the test throws for an unrelated reason, so run a new one once as a plain `it` and read the failure.

### 2026-10-11 · B5 (`fix/b5-server-hardening`, PR #10)

- **A3 and A4 done.** Pulled main first (already up to date with PR #9), no dev servers running, `npm install` clean. After a final sweep the founder asked for a PR; the agent committed, pushed and opened it for this batch only (the founder merges).
- **Test-first:** `lib/reminderCron.test.ts` (20 cases: the secret check, the already-sent rule, the run ID) and `utils/validation.test.ts` (18 cases for `isValidDocId`). They were first run against stubs that copied today's inline logic, and 21 of 38 failed on their assertions: the unset and empty secret accepting `Bearer undefined` and `Bearer `, a failed record counting as sent, slashes and `..` passing. Then the real functions made them pass in both zones.
- **A3:** see the item. The run summary is `cronRuns/{UTC date}` with daily counters plus `lastRun`, not one doc per run, so A8's 48 runs a day still give daily totals (A19). The day key is UTC on purpose (`cronRunId` tests it at 23:30 UTC, when Kolkata is already on the next day).
- **A4:** see the item. The route now checks the token before anything reads the body.
- **`maxDuration`:** Vercel's duration and limits pages (updated 2026-08-24) give Hobby on Fluid compute 300 seconds as both the default and the maximum, and the vercel.json page says `memory` can't be set there with Fluid compute and `version` should not be used. Fluid has been the default since April 23, 2025; `asetta` was created May 8, 2025, but the Vercel MCP doesn't show the setting, so the preview deploy is the real check.
- **Route checks** (dev server on :3005 against the Auth and Firestore emulators run from a scratch folder; placeholder `CRON_SECRET`; `EMAIL_APP_PASSWORD` and `GEMINI_API_KEY` set empty so nothing could reach Gmail or Gemini; `TEMP` on an empty folder). Old code first, then new:
  - Unauthenticated 4 MB upload: old 401 after a 4,128,768-byte temp file was written and left; new 401 with zero file events in the temp folder (`fs.watch`), same for a junk token.
  - Authenticated upload: old left its temp file; new leaves none after a 200, a 413 (a 4.06 MB file), a 400 for `sem1/assessments/x` and `..`, two unparseable PDFs, or a body with no multipart boundary.
  - Logs: `Upload: could not parse a PDF` (both PDFs) and `could not parse the form` now appear with the uid; the old code said nothing.
  - Cron, forced send failure: old run 1 failed and run 2 skipped it as "already sent". New runs 1 and 2 both attempted it and logged `Reminder cron: send failed` (uid, assessment ID, no address); `cronRuns/2026-10-11` read `runs: 2, failed: 2`. After marking the record `sent`, run 3 skipped it (`sent: 0, failed: 0`), so the change can't cause repeat sends.
  - Secret: with `CRON_SECRET` empty, no header, `Bearer `, `Bearer undefined` and `Bearer null` all got 401 and each logged that the secret is unset. A wrong secret gets 401 with the placeholder set.
  - The forced failure is `deliver()` throwing before it contacts Gmail; a real SMTP error goes through the same catch. No real email was sent this session.
- **Finding:** the old code with an *empty* secret also refused `Bearer `, because Node trims trailing spaces from header values, so only the *unset* secret (`Bearer undefined`) was open. That case can't be reproduced here, since `.env.local` defines `CRON_SECRET`; the unit tests cover it.
- **Done-when checks:**
  - A3: no secret means 401 for every request (route with an empty secret, unit tests for unset and empty); a forced send failure is retried by the next run (see A38 for the daily schedule); the run's result sits in a Firestore doc that doesn't expire.
  - A4: an unauthenticated 4 MB POST gets 401 without a file event in the temp folder; no upload file remains after any request; failures are logged.
- **`/code-review` (high):** six findings. Fixed: a null thrown value would have broken the send-failure log. Moved into A38: overlapping runs could both retry a failed send, and a permanent failure is retried every run with no cap. No change: cleanup in `finally` finishes before the handler resolves; the separate "Semester ID is required" check stays for its message; the unset-secret log is meant to be loud.
- **Verification loop:** lint, typecheck, `npm test` and build green. `npm test`: 22 files (11 suites in 2 zones), 396 passed, 24 expected failures, 14 todo. Build sizes match the Baseline. `format:check` fails on line endings only (A29: 170 web files; the 10 more than B4 are B4's own test files, which came down CRLF with the PR #9 merge). `prettier --check --end-of-line auto .` passes in both apps, and the new files pass the strict check.
- **Docs:** `apps/web/standards.md` (the "Known gaps" bullet is replaced by rules on temp-file cleanup and run records; `cronRuns` joins the server-only example); `docs/ops.md` (the function-limits note, the Reminder cron section, the server-only collections, env overrides for local route tests, the C: note).
- **New:** A38 (a failed reminder is retried only on the same day count; added to B9 with A8), A39 (token checks that fail for server reasons are silent), A40 (the upload route is capped at 60 seconds).
- **Final sweep:** re-read every changed line. Fixed two overstatements in the docs (what a missing `cronRuns` day doc means; A38's day-change case was read from the code, not run) and one wrong file size in this entry, then ran the full loop again: same results as above.
- **Vercel preview** (commit `a8cbb62`): built and READY, so Vercel accepted the cron's `maxDuration: 300` (Fluid compute is on). Through the Vercel MCP's authenticated fetch, `GET /api/upload` returned the route's own JSON 405. `GET /api/cron/notifications` returned 401, but the tool hid the body, so it couldn't show whether that was the route or Vercel Authentication; the local checks cover the route.
- **Left for the founder:**
  - Merge.
  - After the merge, after the first 21:00 UTC run, open `cronRuns/<that date>` in the Firestore console and expect `runs: 1` with `lastRun.error` null.
  - Optional: one real reminder sent to your own address to see a retried send go through end to end (not done; it needs your approval).
- **Gotchas:**
  - C: had 0 bytes free. Every `npm run` and `npx` failed with ENOSPC until `npm_config_cache`, `TEMP` and `TMP` pointed under `node_modules/.cache/b5/`, and agent shell output of more than a few lines failed with "write error", so outputs went to files there.
  - Git Bash's `curl` is a native binary, so `-F "files=@/e/..."` fails (error 26); use `E:/...` paths inside `-F`.
  - An empty env var survives into a child process on Windows, and Next keeps it, so `VAR=` in the dev server's environment overrides `.env.local`.
  - A hand-written minimal PDF gave pdf-parse 1.1.1 "bad XRef entry"; the sample PDFs in `node_modules/pdf-parse/test/data` parse.
  - Scripts, fixtures and logs for these checks are in `node_modules/.cache/b5/` (untracked; `npm ci` deletes them).

### 2026-10-11 · B6 (`chore/b6-repo-hygiene`, PR #11)

- **A5 and A29 done.** Pulled main first (already up to date with PR #10). No dev servers were running, and no `package.json` changed, so no install. After the report the founder asked the agent to commit, push and open the PR for this batch only (the founder merges); the commits follow the order below.
- **A5:**
  - Logo: `components/ui/Logo.tsx` renders `/images/Asetta_Logo.svg` through `next/image` without `unoptimized`. Before the change, both `/login` logos loaded through the optimizer (`/_next/image?url=%2Fimages%2FAsetta_Logo.svg&w=256&q=75`, seen in the built-in browser). Without `dangerouslyAllowSVG`, Next 15.5.27 marks any `.svg` source unoptimized (`get-img-props.js`), so the logo now loads from `/images/Asetta_Logo.svg`, and `/_next/image` answers 400 for that SVG. The whole `images` block went (see the item).
  - Checked in the built-in browser on the dev server (light and dark, at 1280px and 375px) and on the production build with `next start` (light and dark): the logo loads (1080px natural, 28px rendered, amber filter), nothing requests `/_next/image`, and the production console is clean.
  - Copy, now: "... per file. Try compressing it or splitting out the pages you need."; "... per upload. Please upload them in smaller batches."; "Try uploading fewer files at once; one or two syllabi per upload works best."; "Please try again, and if it keeps happening, contact support." The loose assertions in `lib/upload/constants.test.ts` and `lib/uploadClient.test.ts` pass unchanged. Web `src` still has 32 em dashes, all in code comments (CSS included), which the copy rule doesn't cover; the landing's `src` has none.
  - `.claude/settings.local.json` is no longer on disk anywhere in the repo, so there was nothing to prune. From its last tracked version (before commit 31ab08b), the broad allows suggested for pruning if it comes back: `Bash(rm:*)`, `Bash(curl:*)`, `Bash(env)`, `Bash(node:*)`, `Bash(npm install:*)`, `Bash(find:*)`, `Bash(sed:*)`, `Bash(mv:*)`, `Bash(dos2unix:*)` and the one-off PowerShell installs and `npm audit fix`. The founder decides.
  - `git ls-files -ci --exclude-standard` is empty: the new root patterns ignore no tracked file.
- **A29:**
  - Before: `git ls-files --eol` gave 232 `i/lf w/crlf`, 2 `i/crlf w/crlf` (the two `.gitignore` files) and 21 binaries git detected itself (png, gif, ico). `format:check` failed on 175 web and 38 landing files. A fresh clone of `main` listed the same, so the CRLF comes from `core.autocrlf=true` (Git for Windows' system config) at checkout.
  - Rehearsed the commits in a scratch clone on E: (scratch commits, never pushed): A5; `.gitattributes` and docs; the tracker; then `git add --renormalize .`, which staged exactly the two `.gitignore` files, line endings only.
  - After: a fresh clone of that branch into a new folder on E: (`core.autocrlf=true`) lists 235 `i/lf w/lf`, the 21 binaries as `attr/-text`, no CRLF, and a clean status. After `npm ci` there, the whole loop passed: lint, `format:check` ("All matched files use Prettier code style!" in both apps), typecheck, `npm test` (the counts below) and build, with CI's placeholder Firebase env (`/login` is 241 kB there and 242 kB here, because the placeholders are shorter than the real values).
  - `docs/ops.md`'s workaround bullet is replaced by a line on what `.gitattributes` does and that a new binary type needs a line there.
- **Verification loop (this checkout):** lint, typecheck, `npm test` and build green. `npm test`: 22 files, 396 passed, 24 expected failures, 14 todo (unchanged). Build sizes match the Baseline. `format:check` still failed here on the CRLF working tree until the refresh after the commits; then all five passed here too (below).
- **Commit order:**
  1. A5: root `.gitignore`, landing `.gitignore` and `.prettierignore`, `apps/web/next.config.ts`, `lib/upload/constants.ts`, `lib/uploadClient.ts`. Git keeps the landing `.gitignore` CRLF here (it doesn't convert a file whose index copy has CRLF), so its diff is one line.
  2. A29: `.gitattributes`, `docs/ops.md`, `apps/web/standards.md`, `apps/landing/CLAUDE.md`.
  3. The tracker: `docs/AUDIT.md`.
  4. Last, on a clean tree, alone: `git add --renormalize .`. It re-adds every tracked file, so anything uncommitted would ride along. It should stage only the two `.gitignore` files.
  5. Then refresh an existing checkout once: `git rm -r --cached -q .`, then `git reset --hard`. That rewrites tracked files only; `.env.local`, `node_modules` and other ignored files stay. `git checkout-index --force --all` doesn't do it (it skips files git considers up to date). Rehearsed in the scratch clone: 235 `w/lf` and a clean status.
- **After the report:** the founder approved the step 5 refresh of this checkout, had the scratch clones on E: deleted, and had the code-comment em dashes added to A35.
  - Commits: A5 (`f10d097`), A29 `.gitattributes` and docs (`3ed48ab`), the tracker (`fc548c4`), then the renormalize alone (`60159e2`). The renormalize staged only the two `.gitignore` files, and with CRs ignored its diff is empty.
  - Refresh: `git rm -r --cached -q .`, then `git reset --hard`. This checkout now lists 235 `i/lf w/lf` and the 21 binaries, with a clean status; `.env.local` and `node_modules` are untouched.
  - The whole loop then passed here: lint, `format:check` ("All matched files use Prettier code style!" in both apps, no workaround), typecheck, `npm test` (same counts) and build (sizes match the Baseline).
- **Left for the founder:** decide on the settings prune; check the Vercel preview; merge. Other Windows checkouts made before this PR need the same one-time refresh (step 5). `/code-review` was not run: the code diff is a config block removal and four strings, each checked above.
- **Gotchas:**
  - C: had 424 KB free. Every npm and npx command ran with `npm_config_cache` (B2's warm cache in `node_modules/.cache/b2/npm`), `TEMP` and `TMP` under `node_modules/.cache/`. For the fresh clone's `npm ci`, they pointed into this checkout's `node_modules/.cache/b6/`, because `npm ci` deletes the clone's own `node_modules` first.
  - With the built-in browser pane hidden, the page doesn't draw: `/login` stays on "Loading..." until a screenshot is taken.
  - `next dev` (Turbopack) logs `[HMR] Invalid message` for `isrManifest` and a TypeError in `handleStaticIndicator` on every load, before and after this change. Dev only.
  - Stop a background server by killing the tree from the shell that launched it (`taskkill /PID <pid> /T /F`); look the tree up with `wmic process where "name='node.exe'" get ProcessId,ParentProcessId,CommandLine /format:list`.
