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
| D9 | Move the ICS export's UID domain from `asetta.app` to `asetta.me`? | A14's `it.todo` | **Keep `asetta.app`.** (2026-10-11) Calendar apps match a re-imported event by its UID, so a new domain makes every assessment a new event: anyone who imported before gets each one twice. Keeping `asetta.app` costs nothing in practice: a UID is an opaque ID, nothing resolves it, and Firestore IDs make a clash implausible. Revisit only with a subscribed feed (webcal), where a one-time switch could be announced. A14's `it.todo` is now a test that pins the domain. |
| D10 | How should upload extraction read a numeric date whose day and month could swap ("03/04/2026"), when nothing in the outline settles the order? | Nothing (B8 shipped the safe default) | **Keep flagging for review, never guess.** (2026-10-11) What B8 shipped stays. **As shipped (B8):** if another numeric date in the same outline can only be one order ("15/04/2026" is day first, "04/15/2026" month first), every date in it is read that way. Otherwise the assessment is kept, dated the upload day and flagged "Check the due date" (`needsReview`), and Gemini is told to leave such a date empty. **Options:** (a) keep flagging (no wrong dates; costs a manual fix only for outlines where every numeric date has a day of 12 or less, which is rare in a full outline); (b) assume month first, the old silent behavior (US style, wrong for day-first outlines, common in Canada); (c) assume day first (the reverse). **Recommended: (a).** A wrong date that looks right is worse than a flagged one: reminders and the "Due in N days" label trust it. A cheap improvement either way: put the outline's raw date text in the flagged assessment's notes so the fix takes one look. |

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
| any | A21 to A28, A33 to A35, A39, A40, A42 to A56 | Later items | As time allows; A34 needs D8; A47 once 5 days have passed since A8's first production run |

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

- [x] **A8 · Reminders at 9:30 in each user's timezone** · M-L · risk M · D4 and D6 decided · test-first (done 2026-10-11, PR #14)
  - **Shipped (B9):** the date math is the pure `lib/reminderSchedule.ts`, the only module that imports the time zone library (`@date-fns/tz` 1.5.0). A reminder belongs to a target day, N calendar days before the due date; from 9:30 that day in the user's `timeZone` (else `America/Toronto`), every run sends it until it has gone out, up to 2 days late. The user doc has `timeZone` (the browser's zone, written at sign-in when missing or changed) and `nextReminderAt`; each run reads only the users whose `nextReminderAt` has come and moves it to their next 9:30, and the first run of each UTC day schedules users without one. `.github/workflows/reminders.yml` calls the route at :05 and :35 UTC; the daily Vercel cron stays as the backstop. Unpadded and 12-hour times are read, Missed is skipped, "due in N days" counts calendar days in the user's zone, and the email shows the stored date and time. The digest is not built (A49). Details in the B9 session log and `docs/ops.md` ("Reminder cron").
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

- [x] **A9 · Normalize AI and regex extraction output** · M · risk L-M · test-first (done 2026-10-11, PR #13; D10 decided: keep flagging)
  - **Shipped (B8):** `lib/upload/normalize.ts` (`normalizeExtractedAssessment` and its parsers), used by `lib/upload/aiResponse.ts` (the Gemini cleanup, now pure and tested), `lib/upload/textExtraction.ts` and the route's "nothing found" placeholder. No usable date means `needsReview: true` on the upload day the client sends (`localDate`), never the server's UTC day. Gemini gets a `responseSchema` (structured JSON) on the installed `@google/generative-ai` 0.24.1, no dependency change; A25 is not needed for it. Details in the B8 session log.
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts:124-176` (`formatDate`), `apps/web/src/lib/upload/gemini.ts:146-203`, `apps/web/src/pages/api/upload.ts:182-191`.
  - **Problem:** `formatDate` only knows full month names, so "Sept 30, 2026" and "Mar 15, 2026" are stored as raw text. DD/MM (common in Canada) is read as MM/DD: "15/03/2026" becomes "2026-15-03" (verified). No range checks. `dueTime`, `weight` and the names aren't type- or range-checked, so "11:59 PM" reaches the UI as an Invalid Date, and nothing guards against NaN (likely shows "NaN days left"). Fallback dates use the UTC day (`toISOString().split("T")[0]` at upload.ts:186, gemini.ts:182, textExtraction.ts:49). JSON is scraped out of free text with a regex.
  - **Fix:** One `normalizeExtractedAssessment()` used by both paths: a valid `YYYY-MM-DD` or the item is flagged for review (no guessing today's date in UTC), padded `HH:MM` (accept 12-hour input), weight clamped 0-100, strings trimmed and length-capped. Ask Gemini for structured JSON output (easier on `@google/genai`, see A25).
  - **Tests:** `lib/upload/textExtraction.test.ts` holds the A9 `it.fails` (abbreviated months, "15/03/2026") and `it.todo` (range checks, the shared normalizer); the fix turns them into passing `it`s. The Gemini cleanup in `lib/upload/gemini.ts` has no tests yet (extract it first). A37 sits in the same test file.
  - **Done when:** table tests over realistic syllabus strings pass; no stored assessment can have an unparseable date or time.

- [x] **A10 · Grade math bugs** · S-M · risk M · D1 decided · test-first (done 2026-10-11, PR #12)
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

- [x] **A11 · One live source of assessments** · M · risk M (done 2026-10-12, PR #15)
  - **Shipped (B10):** the listener's mapping is the pure `assessmentFromDoc` in `utils/semesterAssessments.ts` (with `processCourseStats`, `computeStats` and `courseNames`, all tested) and keeps `mark`, `createdAt` and `updatedAt`. Grades, Calendar and the course-filtered view derive from `DashboardData`; `useAssessments`, `refreshTrigger`/`refreshAssessments` and the props that only fed them (`onStatusChange`, `onCourseRenamed`, `onUploadSuccess`, `onSuccess`, `semesterName`) are gone. The grade calculator shows typed edits over the live data until their debounced save lands (`withEdits`, `pendingEdits`). Each snapshot is stored with its semester, so after a switch no tab shows the last semester's assessments; Grades falls back to the first course when the selected one is gone; an open calendar day follows the live data. The two `getDocs` left on assessments list docs to write them: course rename (`useCourseRename`) and semester delete (`SemesterTabs`, which can target a semester the listener doesn't cover). The listener keeps `orderBy("dueDate")` (A52).
  - **Where:** `apps/web/src/hooks/useAssessments.ts` (used by `GradeCalculator.tsx:48`, `CalendarView.tsx:70`, `CourseFilteredAssessments.tsx:23`); `apps/web/src/hooks/useSemesterAssessments.ts:128-139`; tabs mounted in `UnifiedDashboardPage.tsx:340-358`.
  - **Problem:** All five tabs stay mounted, but grades, calendar and the course-filtered view read once with `getDocs`. Mark something Submitted in Assessments and Grades/Calendar stay stale until a remount. The live listener drops `mark`, `createdAt` and `updatedAt`, so it can't be reused yet. Each of those views is an extra full read on top of the listener.
  - **Fix:** Keep `mark` in the live mapping. Derive the grades, calendar and filtered views from `DashboardData`. Delete `useAssessments` and the `refreshTrigger` plumbing if nothing else needs them.
  - **Done when:** an edit in any tab shows in every other tab without a reload; no `getDocs` on assessments outside the listener.

- [x] **A12 · Auth reliability and user-doc reads** · S, then M · risk L/M (done 2026-10-12, PR #15)
  - **Shipped (B10):** S first: the `onAuthStateChanged` callback got a try/catch/finally and a `userDocError`, so a failed read ends in `LoadErrorScreen`, not a spinner. Then M: `hooks/useUserDoc.ts` keeps one `onSnapshot` on the user doc for the session, and `useAuth()` derives `profile`, `displayPreferences` and `onboardingStatus` from it (`utils/userDoc.ts`, tested); `useUserProfile`, `useDisplayPreferences`, `useOnboardingStatus` and `refreshOnboardingStatus` are gone. The server's first answer runs the sign-in writes: a missing doc is created (and requests the welcome email), `lastLogin` is written at most once per local day (`lastLoginToWrite`), and the zone when missing or changed (`timeZoneToWrite`, B9's rule unchanged). Only a server snapshot can say the doc is missing; offline with nothing cached shows "Can't reach Asetta" and the page recovers once the server answers. The dashboard layout, Settings and onboarding show the error screen (not `_app`, which would put its UI in every page's bundle). `useCoursePreferences` writes nothing on view and saves the target with one merged `setDoc`. Measured on the emulators: 1 user-doc read per dashboard load (was 2 reads, 5 `getDoc` calls, plus a `lastLogin` write every load). Left: `useSemesters` still re-runs the `order` backfill read on every mount (not in the Fix; A24 deletes it).
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

- [ ] **A14 · ICS export correctness** · S · risk L · test-first (code done 2026-10-11 in PR #12; left: the Google Calendar import of the B7 sample, see the B7 log; the UID stays on `asetta.app` (D9))
  - **Where:** `apps/web/src/utils/icsGenerator.ts`.
  - **Problem:** The default 23:59 due time makes DTEND 00:59 on the same day, before DTSTART (verified; `incrementHour` at :54-58 wraps without rolling the date). `DTSTAMP`, required by RFC 5545, is missing. SUMMARY and DESCRIPTION aren't escaped for `,` `;` `\`. No 75-octet line folding. The UID uses `@asetta.app` (the domain is asetta.me).
  - **Fix:** Compute the end from a Date (or make due-time events zero-length). Add DTSTAMP, escaping and folding. Changing the UID domain would duplicate events for anyone who already imported, so decide whether it's worth it.
  - **Tests:** `utils/icsGenerator.test.ts` holds the A14 `it.fails` (the 23:59 end, DTSTAMP, SUMMARY escaping, 75-octet folding) and an `it.todo` for the UID domain decision.
  - **Done when:** tests cover 23:59 and names with commas and semicolons; the file imports cleanly into Google Calendar.

- [ ] **A15 · Bundle size** · M · risk L-M
  - B10: `_app` is 115 kB (+1 kB for the user-doc listener). `LoadErrorScreen` stays out of `_app` on purpose: there it put Button, EmptyState and `tailwind-merge` into every page's shared chunk (+11 kB, measured).
  - **Where:** `apps/web/src/contexts/AuthContext.tsx` (pulls Firestore into `_app`); `apps/web/src/components/pages/UnifiedDashboardPage.tsx:10-16` (every tab imported eagerly).
  - **Problem:** 229 kB of JS is shared by every page (the `_app` chunk is 114 kB: Firebase Auth + Firestore). Every dashboard route is 320 kB because Calendar, Grades, Upload, dnd-kit and react-colorful all load up front.
  - **Fix:** `next/dynamic` for every tab except the one being opened. Move the user-doc bootstrap out of `AuthContext` (or lazy-import Firestore there) so the auth pages don't ship Firestore.
  - **Done when:** `npm run build` shows smaller numbers than the Baseline; no visible jank on tab switch.

- [ ] **A16 · Firestore rules: validate fields** · M · risk M
  - Since A8 (B9) the client writes `timeZone` on the user doc and sets `nextReminderAt` to `serverTimestamp()`. Allow `timeZone` as a short string and `nextReminderAt` only as `request.time`, so a client can ask for the next run but not schedule itself into every run. `notifications` and `cronRuns` stay server-only.
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
  - After A8 (B9): a run reads only the users whose `nextReminderAt` has come (about once a day each, plus retries), but the first run of each UTC day still reads every user doc once (the `nextReminderAt` field only, to schedule users without one), and a due user's semesters and assessments are all read, one at a time. `transporter.verify()` still runs before every email.
  - **Where:** `apps/web/src/lib/notifications.ts:36-130`; `apps/web/src/lib/email.ts:32,99`.
  - **Problem:** Every run reads every user, then every semester, then every assessment, one at a time. `transporter.verify()` runs before every email. Gmail caps sending at roughly 500 a day (D3: staying on Gmail for now). It will time out as users grow.
  - **Fix:** A8's `nextReminderAt` query removes the full user scan. What's left: read only the due user's assessments in the reminder window, bounded concurrency, and verify the transporter once per run. The A3 run summary (`cronRuns/{date}`) already keeps each day's `sent` and `failed` totals and each run's `durationMs`. Revisit D3 if sends approach the Gmail cap.
  - **Done when:** run time stays flat as users grow (measure with the A3 run summary).

- [ ] **A20 · Landing contact form: throttle and bot check** · S · risk L
  - **Where:** `apps/landing/src/pages/api/contact.ts`, `apps/landing/src/pages/contact.tsx`.
  - **Problem:** Validation and escaping are good, but nothing stops bots or repeat submissions, and it all lands in your inbox.
  - **Fix:** A hidden honeypot field plus a simple per-IP limit.

- [x] **A32 · Settings states the wrong reminder time** · S · risk L · ship with A8 · found during B16 (done 2026-10-11, PR #14)
  - **Shipped (B9):** both hints read "Choose between 1 and 30 days. Reminders go out at about 9:30 AM in your time zone." They still show only under Custom timing (A50).
  - **Where:** the custom-days hint "Notifications will be sent daily at 9:00 PM." in `apps/web/src/components/settings/NotificationsSection.tsx` and `apps/web/src/components/onboarding/steps/NotificationsStep.tsx`.
  - **Problem:** the cron runs at 21:00 UTC (`vercel.json`), which is 5 PM in Toronto during daylight time and 4 PM in winter, not 9 PM. After A8 it becomes 9:30 in the user's own time zone, so the copy is wrong either way.
  - **Fix:** in the A8 PR, change both to "around 9:30 in the morning, your time" (or whatever A8 ships).

- [x] **A36 · Current grade reads 0% when every marked assessment weighs 0** · S · risk L · with A10 (B7) · found during B4 (done 2026-10-11, PR #12)
  - **Where:** `apps/web/src/utils/gradeCalculations.ts` (`computeCurrentGrade`).
  - **Problem:** when the completed, marked assessments weigh 0 in total, the function returns `0` (`completedWeight > 0 ? ... : 0`), so the grades tab shows 0.0% and an F. Weight 0 is common: the regex fallback stores 0 when it finds no weight, and entering a mark in the grade calculator sets the status to Submitted.
  - **Fix:** return null ("no grade yet") when the completed weight is 0, the same answer A10 gives `calculateRequiredGrade` when nothing weighted is left.
  - **Done when:** the `it.fails("A36: ...")` in `utils/gradeCalculations.test.ts` is a passing `it`.

- [x] **A37 · Course-name fallback reads a term as the course code** · S · risk L · with A9 (B8) · found during B4 (done 2026-10-11, PR #13)
  - **Shipped (B8):** codes are 2 to 4 capitals at a word boundary, then an optional space, `*` or `-`, then 3 or 4 digits ("CIS 3760", "CIS*3760", "COMP-1405", "MATH1010A"); a capitalized term before a year ("FALL 2026") is skipped. A lowercase "cis 3760" is no longer read as a code.
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts` (`extractCourseName`). Callers: the regex fallback, the "Manual Review Required" placeholder in `pages/api/upload.ts`, and `lib/upload/gemini.ts` whenever Gemini returns no course name.
  - **Problem:** the code pattern `/([A-Z]{2,4})\s*(\d{3,4}[A-Z]*)/i` is case-insensitive, matches inside words, and takes the first hit in the whole text. A term before the course code wins: "Fall 2026 syllabus" then "CIS 3760" gives `Fall2026`; "Course outline, Winter 2027" gives `nter2027`; "Summer 2026" gives `mmer2026` (all checked in B4).
  - **Fix:** match capitals at a word boundary only (no `i` on the letters) and skip a term word (Fall, Winter, Spring, Summer) followed by a year.
  - **Done when:** the `it.fails("A37: ...")` in `lib/upload/textExtraction.test.ts` is a passing `it`, plus cases for the code formats the fix accepts.

- [x] **A38 · A failed reminder is retried only on the same day count** · S · risk L · with A8 (B9) · found during B5 (done 2026-10-11, PR #14)
  - **Shipped (B9):** records are `notifications/{uid}_{assessmentId}_{targetDay}`, so a failed send keeps its ID after the day count changes, and any run up to 2 days after the target day retries it. Each send is claimed in a transaction first (status `sending`; `claimDecision` in `lib/reminderCron.ts`), retried at least 20 minutes apart, at most 3 attempts; a claim whose run died is taken over after 10 minutes. The test is "A38: goes out in the next run after the day count has changed" in `lib/reminderSchedule.test.ts`.
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
  - The `order` backfill in `hooks/useSemesters.ts:46-70`, once every semester doc has `order` (check with an admin script the founder runs). Until then it re-reads every semester doc on each dashboard mount (A12 listed it; B10 left it here).

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
  - **Where:** `apps/web/standards.md` (57 left) and `apps/landing/CLAUDE.md` (13 left). B3 kept em dashes out of everything it wrote or rewrote, but left untouched lines alone. Added in B6 at the founder's request: 32 in code comments across 24 files in `apps/web/src` (TS, TSX and CSS comments, for example `components/ui/button.tsx`, `styles/globals.css`, `lib/uploadClient.ts`). B6 removed the last ones from web copy; the landing's `src` has none. B10 rewrote one in `hooks/useAssessmentAutoSave.ts`, leaving 31.
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

- [x] **A41 · A mark edit always sets the status to Submitted** · S · risk L · found during B7 (done 2026-10-11, PR #12)
  - **Where:** `applyMarkInput` in `apps/web/src/utils/gradeCalculations.ts` (used by `GradeCalculator.tsx`).
  - **Problem:** entering or clearing a mark in the grade calculator saves the assessment as Submitted. Clearing a stray mark on a Missed assessment leaves it Submitted with no mark, so it stops counting as 0 (D1) and its weight goes back to "remaining". Entering a mark on a Missed assessment also relabels it Submitted.
  - **Fix (founder call, 2026-10-11):** entering a mark makes a Not started or In progress assessment Submitted; Submitted and Missed keep their status; clearing a mark never changes the status. A Missed assessment with a typed mark counts that mark, and counts 0 again once the mark is cleared (D1).

- [ ] **A42 · ICS file ends without a CRLF** · S · risk L · found during B7
  - **Where:** `generateICSFile` in `apps/web/src/utils/icsGenerator.ts`.
  - **Problem:** RFC 5545 ends every content line with CRLF, including `END:VCALENDAR`; the file joins with CRLF but has none after the last line. Google Calendar accepts it; a strict parser may not.
  - **Fix:** append `\r\n` after the join and update the "wraps the events" test.

- [ ] **A43 · Clearing the target-grade field saves 0** · S · risk L · found during B7
  - **Where:** the target `NumberField` in `apps/web/src/components/assessment/grade-calculator/GradeOverviewCards.tsx` (`parseFloat(raw) || 0`).
  - **Problem:** every keystroke saves, so deleting the target to retype it writes 0 to Firestore, and leaving the field empty keeps 0. Before B7 the `|| 85` showed 85 while 0 was saved; now the 0 shows, with "Target already secured" while the field is empty.
  - **Fix:** don't save an empty or unparseable value (the field snaps back to the saved target on blur); consider clamping to 0 to 100.

- [ ] **A44 · Small PDFs fail to parse in the upload route** · S · risk L · found during B8
  - **Where:** `apps/web/src/pages/api/upload.ts` (`pdfParse(fs.readFileSync(filePath))`); pdf-parse 1.1.1 with its bundled pdf.js.
  - **Problem:** a valid PDF under about 4 KB fails with "bad XRef entry" and the file is reported as unreadable. Node hands a small file back as a slice of its shared buffer pool (nonzero `byteOffset`), and pdf.js then reads every object 8 bytes off (B8 logged it: at xref offset 9 it saw "PDF-1.4"). Passing `new Uint8Array(buffer)` parsed the same file; files over about 4 KB parse either way, so real outlines are rarely hit. B5's hand-written PDF failed the same way.
  - **Fix:** pass a fresh `Uint8Array` copy to `pdfParse`, with a test PDF under 4 KB. Check whether a pdf-parse upgrade (A25) also fixes it.

- [ ] **A45 · Regex fallback takes a weight from the next line or the whole outline** · S · risk L · found during B8
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts` (`extractWeight`).
  - **Problem:** an assessment's weight is the first percentage in the 200 characters from its match, so a line without one takes the next line's ("Lab 2 due 20/10/2026" before "Project ... (30%)" gets 30). With none in that window it falls back to the first percentage in the whole outline. B8's tests give every line its own weight to stay clear of it.
  - **Fix:** look for the weight on the assessment's own line (or up to the next match) only, and store 0 when there is none.

- [ ] **A46 · Regex fallback reads a number before a month as the day** · S · risk L · found during B8 (`/code-review`)
  - **Where:** `apps/web/src/lib/upload/normalize.ts` (`DAY_FIRST` in `parseDueDate`) and the day-first alternative of `DATE_TEXT` in `textExtraction.ts`.
  - **Problem:** "Lab 3 Dec 2026" or "Week 10 May 2026" reads 3 or 10 as the day, a valid but wrong date with no review flag. "3 Dec 2026" alone is a real day-first date, so the text can't tell them apart; before B8 the same reading happened through `\w+\s+\d{1,2},?\s*\d{4}`.
  - **Fix (decide while building):** accept a day-first date only when the number isn't right after an assessment word (Lab, Quiz, Week, Assignment), or flag it for review.

- [ ] **A47 · Remove the reminder cron's check for records from before A8** · S · risk L · found during B9
  - **Where:** `legacyRecordIds` and `isRecentLegacySend` in `apps/web/src/lib/reminderCron.ts`, their use in `sendReminder` (`lib/notifications.ts`), their tests, and the "Records from before A8" bullet in `docs/ops.md`.
  - **Problem:** the check only matters for the first 4 days after A8's first production run: it stops the switch from resending what the old cron had just sent. After that it is one or two wasted reads for each new reminder.
  - **Fix:** delete it once 5 days have passed since the first production run (the first `cronRuns/{date}` doc with `sweptAt` dates it).

- [ ] **A48 · Onboarding saves email notifications as on even when switched off** · S · risk L · found during B9
  - **Where:** `completeOnboarding` in `apps/web/src/contexts/OnboardingContext.tsx`: `emailNotifications: state.userData.emailNotifications || true`.
  - **Problem:** `false || true` is true, so a student who turns email notifications off in onboarding is saved with `emailNotifications: true` and `hasConsentedToNotifications: false`. No reminder goes out (the cron needs consent), but Settings then shows the switch on, and the next save of the Notifications card sets consent to match it, turning reminders on without the student choosing it.
  - **Fix:** `?? false` (check what `loadUserDataForOnboarding` defaults it to), with a test once the save's mapping is pulled out.

- [ ] **A49 · Daily digest email (optional, from A8)** · M · risk M · found during B9
  - A8 left the digest to "decide while building"; B9 didn't build it. Since A8 a user's due reminders all go out in the same run, one email each. A digest would be one email per user per run listing them: fewer Gmail sends (D3) and less inbox noise. It needs one claim covering several records and a new builder in `lib/emailTemplates.ts`. Revisit with A19, or when sends approach the Gmail cap.

- [ ] **A50 · The reminder time shows only under Custom timing** · S · risk L · found during B9
  - **Where:** `apps/web/src/components/settings/NotificationsSection.tsx` and `apps/web/src/components/onboarding/steps/NotificationsStep.tsx`.
  - **Problem:** the hint that says when reminders go out (A32) sits inside the custom-days panel, so a student who picks 1, 2, 3 or 7 days never sees it.
  - **Fix:** show the time under the timing field for every choice.

- [ ] **A51 · The stats bar's "Submitted" counts Missed assessments** · S · risk L · found during B10
  - **Where:** `computeStats` in `apps/web/src/utils/semesterAssessments.ts` (`submitted: completedCount`), shown by the "Submitted" card in `DashboardLayout.tsx`.
  - **Problem:** `isCompletedStatus` counts Submitted and Missed, so a student with one Submitted and one Missed assessment sees "Submitted 2". The completion rate counting Missed as done is deliberate; the label is not.
  - **Fix:** count `status === "Submitted"` only, and keep the completion rate as it is.
  - **Done when:** the `it.fails("A51: ...")` in `utils/semesterAssessments.test.ts` is a passing `it`.

- [ ] **A52 · An assessment without a due date is hidden everywhere** · S · risk L · found during B10
  - **Where:** the `orderBy("dueDate")` query in `apps/web/src/hooks/useSemesterAssessments.ts`; the `dueDate` default in `assessmentFromDoc` (`utils/semesterAssessments.ts`).
  - **Problem:** Firestore's `orderBy` leaves out docs without the field, so such an assessment never appears in any tab, and its weight and mark never reach the grade. The mapping's "today" default only applies to an empty or null `dueDate`. Before B10 it was worse: the grades tab read such docs with `getDocs` and its sort crashed the whole dashboard (`parseLocalDateTime(undefined)`, reproduced on main with a seeded doc). The upload (B8's normalizer) and the Add form always write a date, so only old or hand-edited docs can be affected.
  - **Fix:** drop the `orderBy` and sort on the client (every consumer sorts anyway), and give such a doc `needsReview` with the viewer's today rather than a silent default (D10's rule). Or first check with an admin script whether any production doc lacks a `dueDate`.

- [ ] **A53 · The grade breakdown labels a Missed assessment "Pending" or "Overdue"** · S · risk L · found during B10
  - **Where:** `getAssessmentStatus` in `apps/web/src/components/assessment/grade-calculator/AssessmentBreakdown.tsx`.
  - **Problem:** the label looks at Submitted and the due date only. A Missed assessment due later reads "Pending" and a past one "Overdue", while the grade counts it as 0 (D1).
  - **Fix:** a "Missed" label with the Missed tint (`statusTintClasses.Missed`).

- [ ] **A54 · Sign-in reads the onboarding status on its own, and a read error sends an onboarded user to onboarding** · S · risk L · found during B10
  - **Where:** `getUserOnboardingStatus` in `apps/web/src/utils/onboardingUtils.ts` (used by `redirectAfterAuth` on login and register) and `loadUserDataForOnboarding` (`OnboardingContext`).
  - **Problem:** two `getDoc` readers of the user doc remain beside the live one in `AuthContext`. `getUserOnboardingStatus` turns any read error into "needs onboarding", so a failed read at sign-in sends an onboarded user to `/onboarding`. Since B10 that page shows the error screen instead of the flow, so nothing gets overwritten; checked with the user-doc read denied, `/login` lands on `/onboarding` with "Couldn't load your account". With the live listener active the extra `getDoc` shares its target, so it costs no extra read.
  - **Fix:** route login and register through `useAuth()` (wait for `loading`, then read `onboardingStatus`) and seed the onboarding form from `useAuth()` too; delete both readers.

- [ ] **A55 · Metadata-only user-doc snapshots re-render every `useAuth` consumer** · S · risk L · found during B10 (`/code-review`, skipped)
  - **Where:** `useUserDoc` in `apps/web/src/hooks/useUserDoc.ts` (`includeMetadataChanges: true`, so the server confirming a cached doc counts as its first answer).
  - **Problem:** each write ack and each connectivity change sets new state, so the whole dashboard re-renders two or three times per user-doc write (a settings toggle, the daily `lastLogin`).
  - **Fix:** after the first server answer, skip the state update when only the metadata changed.

- [ ] **A56 · The calendar's Today button never opens today** · S · risk L · found during B10
  - **Where:** `goToToday` in `apps/web/src/components/calendar/CalendarView.tsx` (also the Home key).
  - **Problem:** it compares each day's midnight with `new Date()` (the current time), which never matches, so the month moves but today's day never opens.
  - **Fix:** compare with the start of today.

## Baseline (2026-10-10)

Numbers to compare against when items land.

- `npm audit --omit=dev`: 38 vulnerabilities (0 critical, 5 high, 33 moderate) after A2 (2026-10-10; was 46: 1 critical, 12 high, 33 moderate). Including dev dependencies: 43 (10 high). Unchanged after B9 (`@date-fns/tz` has no dependencies and no advisories).
- `apps/web` build (Next 15.5.27, after A2): 229 kB First Load JS shared by all pages (`_app` chunk 114 kB); `/dashboard/*` 320 kB (B8 measured main at 320; the 319 recorded after A2 was stale by then) and `/dashboard/[semester]/*` 320 kB after B7 (+767 bytes, 345 gzipped, in the shared dashboard chunk: the grade view helpers and ICS folding); `/login` and `/register` 242 kB; `/onboarding` 285 kB; `/settings` 285 kB after B9 (was 284: about 20 bytes for `serverTimestamp` in the Settings save took the page from 5.38 to 5.4 kB, measured against main). After B10 (main built first, same machine): shared 229 kB with `_app` 115 kB (was 114, the user-doc listener); `/dashboard/*`, `/login` and `/settings` unchanged; `/onboarding` 286 (was 285), `/register` 243 (was 242), `/reset-password` 241 (was 240).
- Live Firestore rules identical to `firestore.rules`; no Storage rules (Storage unused).
- Vercel: projects `asetta` (apps/web) and `asetta-landing` (apps/landing), Hobby plan: runtime logs kept 1 hour; cron jobs run at most once a day and fire anywhere within the scheduled hour; functions on Fluid compute get a 300-second default and maximum duration (docs checked 2026-10-11). In `apps/web/vercel.json` the cron route has `maxDuration` 300 since A3 (was 10) and the upload route 60.
- Tests (after B10, 2026-10-12; 16 suites after B9, 13 after B8, 11 after B7, 9 after A7, none before): 18 suites in `apps/web`, each run in two zones. Per zone, 527 tests: 526 passing and 1 expected failure (`it.fails`, A51); no todo. `npm test` takes about 4 seconds.
- Firestore reads (B10, emulator rule coverage): a dashboard load reads the user doc once and writes nothing (before B10: 2 reads from 5 `getDoc` calls, plus a `lastLogin` write every load); the first load of a day also writes `lastLogin` once.

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

### 2026-10-11 · B7 (`fix/b7-grades-ics`, PR #12)

- **A10 and A36 done; A14's code done, its Google Calendar import still open** (below). Pulled main first (already up to date with PR #11); no dev servers were running and no `package.json` changed, so no install. After the report the founder asked the agent to run every check itself, then commit, push and open the PR for this batch (the founder merges).
- **Test-first:**
  - The 8 waiting `it.fails` (A10 3, A36 1, A14 4) ran once as plain `it`s and failed on their assertions in both zones: a Missed assessment with no mark gave 90, not 45; DTEND `20261015T005900` came before DTSTART; SUMMARY was unescaped; a line was 138 octets.
  - The four A10 `it.todo` cases: the logic moved into `utils/gradeCalculations.ts` with today's behavior first (`applyMarkInput`, `resolveTargetGrade`, `currentGradeView`, `requiredGradeView`, plus a temporary `gradeAfterEdit` copying `recalculateGrade`). Their tests failed (85 for a target of 0, "A" for 89.96, 90 kept after clearing the mark, "-12.5" and "-0.0" shown as needed), then passed after the fix. `gradeAfterEdit` then reduced to `computeCurrentGrade` and was deleted: the component derives the grade instead.
  - The new ICS tests also ran against the old generator: 11 failed on their assertions (unpadded `T90500`, DTEND `20261231T003000`, a raw newline in SUMMARY, a 146-octet line). The two DST cases and the unfold case pass on both and stay as guards.
- **A10/A36:**
  - One counted-mark rule for both functions: a completed assessment counts with its mark; a Missed one without a mark counts as 0 (D1). `computeCurrentGrade` is null ("no grade yet") until graded assessments carry weight; `calculateRequiredGrade` is null when no weight is left to grade.
  - `GradeCalculator` no longer keeps the grade or total weight in state; both are derived each render, so clearing a mark can't leave a stale grade. The target uses `??` through `resolveTargetGrade`, for the field and the projection alike.
  - `GradeOverviewCards` takes the letter, GPA and meter color from the shown one-decimal value (the meter color had the same rounding issue at 85: 84.96 showed 85.0% on an amber bar).
  - Null states, checked at every caller (`GradeCalculator` is the only one): the grade tile shows "No weighted marks yet" (was "No completed assessments yet", wrong once a Submitted assessment has no mark or the marked ones weigh 0); the "Need" line is hidden when nothing weighted is left, as it already was when everything was graded; a needed average of 0 or below (shown value) reads "Target already secured" in the success color. No state shows "0%", "NaN" or a negative percentage for a grade.
- **A14:** the end comes from date math in UTC (floating time has no zone, so a DST gap can't move it): 23:59 ends 00:59 the next day and Dec 31 rolls into the next year. DTSTAMP is UTC, from a new `now` parameter (default: the real clock). SUMMARY, DESCRIPTION and PRODID are escaped as TEXT. Lines fold at 75 octets, counted in UTF-8 and never splitting a character. Unpadded times ("9:05") now come out padded, since start and end share one parse. The UID stays `@asetta.app`: D9 added with the trade-off and a recommendation, and its `it.todo` stays.
- **Grades tab, end to end** (the A10 "after clearing marks" check), on this branch's dev server (:3005) against the Auth and Firestore emulators, with a seeded test user (credentials generated into `node_modules/.cache/b7/e2e-user.json`, emulator only) and three courses:
  - The browser was pointed at the emulators with the `__FIREBASE_DEFAULTS__` cookie (no code change; see `docs/ops.md`). Before typing the test credentials, the console showed the SDK's "You are using the Auth Emulator" warning; afterwards no request went to any `https://` host and Firestore traffic went to `127.0.0.1:8080`.
  - CIS 3760 (A 90 at 20%, a Missed quiz with no mark at 10%): 60.0%, C-, GPA 1.7 and "Need 95.7%" (D1; before: 90.0%).
  - ENGG 4450 (89.96 at 50%): 90.0%, A+, GPA 4 and "Need 80.0%". Clearing that only mark showed "No weighted marks yet" and "Need 85.0%" at once; typing it back restored 90.0%, and the emulator held `mark: 89.96`. Target 0: "Target already secured", the field stayed 0 after blur and after a reload (before: 85, and "Need -90.0%").
  - MATH 1200 (a 95 at weight 0, plus a weight-0 quiz): "No weighted marks yet" and no "Need" line (before: 0.0%, F and "Need 0.0%"). Weight 10 gave 95.0% and A+; back to 0 gave "No weighted marks yet" again.
  - Calendar tab: the real Export button (its blob captured in the page instead of a download) gave `text/calendar`, 8 events, 23:59 due times ending 00:59 the next day, "Final project\, demo\; report" escaped, a UTC DTSTAMP, CRLF only.
  - Phone width (375px) in dark: no horizontal scroll, tiles legible. No console errors. Afterwards the cookie and the emulator session were cleared from the built-in browser, and the dev server and emulators were stopped (ports closed).
- **Static render:** the real `GradeOverviewCards` in eight states with the built CSS (`tiles.tsx`, `make-tiles.mjs`, `serve.mjs` in `node_modules/.cache/b7/`), light and dark at desktop width and light at 375px, all as intended.
- **ICS, checked by an independent parser:** `validate-ics.mjs` round-trips the generator's output through ical.js 2.2.1 (Mozilla's RFC 5545 parser, installed only in `node_modules/.cache/b7/icaltest/`): every SUMMARY, DESCRIPTION, PRODID, DTSTART (floating), DTEND, DTSTAMP and UID decodes to the source value, including folded, accented, emoji, backslash and newline titles, both 2026 DST nights and the year rollover; the B7 sample parses too. Against the old generator ical.js rejects the whole file at a name with a line break ("invalid line ... Part B"), so before A14 one such assessment could break every import.
- **Google Calendar import: not done.** The built-in browser isn't signed in to Google, and Claude in Chrome (chosen by the founder for this) reported the extension not connected twice. The sample is `node_modules/.cache/b7/asetta-b7-sample.ics` (seven events, Oct 26 to Dec 31, 2026, built by `make-sample.mjs` with the real generator); import it into a new throwaway calendar, then tick A14.
- **Verification loop:** lint, `format:check` (no workaround), typecheck, `npm test` (22 files, 474 passed, 8 expected failures, 6 todo; the same with the host zone set to UTC) and build all green. Build: shared 229 kB and `_app` 114 kB unchanged; `/dashboard/[semester]/*` went from 319 to 320 kB (main rebuilt with the changes stashed for the comparison: +767 bytes, 345 gzipped, in the shared dashboard chunk). Baseline updated.
- **`/code-review` (high):** six findings. Fixed: `standards.md` now lists the ICS export as the one exception to "parse stored dates only via `parseLocalDateTime`"; the ICS tests pass the test clock everywhere. New items: A41, A42, A43. No change: an unparseable stored date gives NaN in DTSTART, as it gave garbage before; A9's "no unparseable stored dates" covers it.
- **Docs:** `apps/web/standards.md` (the ICS exception above); `docs/ops.md` (driving the signed-in UI against the emulators).
- **New:** A41 (a mark edit always sets Submitted, so clearing a stray mark on a Missed assessment drops D1's 0), A42 (no CRLF after `END:VCALENDAR`), A43 (clearing the target field saves 0), D9 (the UID domain).
- **After the PR:**
  - D9: the founder kept `asetta.app`; A14's UID `it.todo` became a test pinning it.
  - A41, added to this PR at the founder's request: entering a mark makes a Not started or In progress assessment Submitted; Submitted and Missed keep their status; clearing a mark never changes it. Test-first: 9 cases in `applyMarkInput`'s tests, 5 of which failed on their assertions against the old rule (Missed turned Submitted, and every cleared status became Submitted).
  - A41 end to end on the emulators (same setup as above): typing 5 on the Missed quiz took CIS 3760 to 61.7%, deleting it brought back 60.0% and "Need 95.7%", and the emulator held the quiz as Missed with no mark (before: Submitted with no mark and 90.0%). The Not started midterm became Submitted at 70 and stayed Submitted when its mark was cleared.
  - Loop green again: `npm test` 22 files, 492 passed, 8 expected failures, 4 todo (per zone 246 pass, 2 todo; Baseline updated); build sizes unchanged.
- **Left for the founder:** the Google Calendar import (above), or connect Claude in Chrome and ask the agent to run it; check the Vercel preview builds; merge.
- **Gotchas:**
  - C: had 272 KB free. Every npm and npx command ran with `npm_config_cache` on `node_modules/.cache/b2/npm` and `TEMP`/`TMP` on `node_modules/.cache/b7/tmp`; command output went to files there, because the shell fails to print more than a few lines.
  - A `next build` hung right after "Environments: .env.local" while the agent's shell had its working directory inside `apps/web/.next/static/chunks` (Windows keeps a directory busy while a process sits in it, and Next deletes `.next` first). Killing the tree and rebuilding from the repo root fixed it.
  - Signing in as a user with no user doc makes `AuthContext` call `/api/welcome-email`; seed the user doc first (and keep `EMAIL_APP_PASSWORD` empty) so a test sign-in can't send mail.
  - In the built-in browser, the first screenshot after a navigation or scroll often times out; the second one works. With a small pane, set a 1280x800 viewport or the login form doesn't render.

### 2026-10-11 · B8 (`fix/b8-extraction`, PR #13)

- **A9 and A37 done.** Pulled main after PR #12 (already up to date), branched, no dev servers were running, no `package.json` changed, so no install. C: had 33 GB free, so npm ran normally (ops.md's ENOSPC note is now a fallback).
- **Test-first:**
  - The four waiting `it.fails` (A9 3, A37 1) ran once as plain `it`s and failed on their assertions in both zones: "Sept 30, 2026" and "Mar 15, 2026" came back unchanged, "15/03/2026" became "2026-15-03", "Winter 2027" gave `nter2027`.
  - The Gemini cleanup moved out of `gemini.ts` into the pure `parseAiAssessments` (`lib/upload/aiResponse.ts`) unchanged, and 15 tests pinned today's behavior first (fences, prose around the array, empty array, bad JSON, non-array, dropped non-objects, the course and name fallbacks, text weights, forced status, the 23:59 default). Six new `it.fails` then failed on their assertions against it: a bracket in the prose before the array threw "Failed to parse"; a missing or impossible date got no flag; "11:59 PM" was stored as is; weights 150 and -5 were kept; a numeric course name and a multi-line name went through raw. All six pass after the fix.
  - A9's two `it.todo` are real tests: the range checks (Feb 30, Feb 29 in 2026, April 31, month 15, month 0, "6055-78-01", year 1999, words, no year) and the shared normalizer over a realistic outline.
  - `normalize.test.ts` holds table tests over syllabus strings: abbreviated months with and without a period, ordinals, a weekday in front, day-first names, DD/MM and DD.MM.YYYY, two-digit years, 12-hour times ("11:59 PM", "11:59pm", "11.59 p.m.", "9 AM", "12:00 AM"), out-of-range times, weights as numbers and text, over 100, negative, NaN and Infinity, over-long names (cut by code point), and a grid of junk dates and times that must still store a valid pair.
  - The two `/code-review` date fixes below also started as failing tests.
- **A9:**
  - `normalizeExtractedAssessment` is the only way an extracted assessment is stored (rule added to `apps/web/standards.md`). Dates: a real calendar day from 2000 to 2099, or null. Times: padded 24-hour HH:MM, else 23:59. Weights: 0 to 100, at most two decimals, else 0. Names: whitespace collapsed, the course capped at 100 characters, the assessment at 200.
  - Ambiguous dates (D10, open): the outline's other numeric dates settle the order when one can only be day first or month first (`detectDateOrder`, which counts real dates only); otherwise the date is not guessed. Gemini's prompt now says to leave such a date empty.
  - "Flagged for review": the old "Manual Review Required" placeholder was a normal assessment dated the server's UTC day, and nothing in the UI marked it. The founder chose a `needsReview` field plus a label (asked during planning). An assessment without a usable date is now stored with `needsReview: true`, dated the uploader's local today. `postUploadForm` sends that date as `localDate`, and the route refuses an upload without a valid one (within a day of the UTC date) with "Please refresh the page and upload again.", so no path falls back to the UTC day. The "nothing found" placeholder goes through the same normalizer and is flagged too.
  - UI: a flagged row shows "Check the due date" (amber, `NEEDS_REVIEW_LABEL` in `utils/urgency.ts`) in place of the urgency label, on the table's mobile card and desktop row and in the calendar's day modal. Saving the edit row clears the flag (`deleteField`); a status change doesn't. A flagged assessment is never a course's next deadline or counted as due this week, and the reminder cron skips it.
  - Gemini: `responseMimeType: "application/json"` with a `responseSchema` (an array of objects with the five fields), on the installed `@google/generative-ai` 0.24.1; no dependency change. The year for dates written without one comes from `localDate`, not the server clock. The real Gemini API was not called: the parser is covered by unit tests and the route ran on the regex fallback.
  - The regex fallback also reads abbreviated months, ordinals, day-first names, ISO dates and decimal weights ("12.5%").
- **A37:** see the item; 11 new cases cover the terms and the code formats.
- **End to end on the emulators** (Auth and Firestore emulators, dev server on :3005, `GEMINI_API_KEY` and `EMAIL_APP_PASSWORD` empty, `CRON_SECRET` a placeholder; scripts in `node_modules/.cache/b8/`):
  - `e2e.mjs` signed up a generated test user (credentials in `node_modules/.cache/b8/e2e-user.json`, emulator only), seeded the user doc and a semester, and posted to the real route: the five pdf-parse sample PDFs (`node_modules/pdf-parse/test/data`), plus two outlines built by `make-pdf.cjs` (a CIS*3760 one with "Sept. 30", DD/MM dates, "Dec. 1st", a 130% weight and an impossible "13/13/2026"; a MATH 1200 one whose only dates could swap).
  - Without `localDate`, and with one three days off: 400, nothing stored. `03-invalid.pdf`: "Failed to parse PDF", as before.
  - 13 assessments stored, each checked by an independent parser: a real date, a padded time, a weight from 0 to 100, single-line names within the caps, status Not started. Flagged and dated the local day: the `01-valid.pdf` item that main stores as "6055-78-01" (main's extraction was run on the same file first), the "13/13/2026" exam, both MATH 1200 quizzes (D10) and the `05` placeholder. The `05` file sent with the next day's date (a user ahead of UTC) got that day, not the server's. "CIS*3760" read as `CIS3760`, "Sept. 30, 2026 at 11:59 PM" as 2026-09-30 23:59, the 130% as 100. The research-paper samples still give junk names (they aren't outlines), now with valid dates or a flag.
  - The UI in the built-in browser (the `__FIREBASE_DEFAULTS__` cookie; the console showed the Auth Emulator warning before any credentials were typed; no request went to an `https://` host): the label on every flagged row at 1280px, and at 375px in dark with no horizontal scroll; no console errors. Editing MATH 1200 Quiz 2 to 2027-06-05 and saving removed `needsReview` in the emulator, and Quiz 1 kept it. The Oct 11 calendar modal listed its four flagged items with the label.
  - The reminder cron (preferences set to one day before): a control assessment due the next day got a send attempt (failed: no email password); the flagged placeholder due the same day was skipped.
  - Afterwards the cookie, the emulator sign-in and the viewport were cleared, and the dev server and emulators were stopped (ports closed). No formidable temp file was left.
- **Old data:** no migration. Production assessments uploaded before this PR can still hold a raw date ("Sept 30, 2026"), a month over 12 ("2026-15-03"), an impossible date ("6055-78-01"), a 12-hour or unpadded time ("11:59 PM"), weights above 100 or below 0, names with line breaks or of any length, a course code read from a term (`nter2027`), and "Manual Review Required" placeholders dated the UTC day with no `needsReview` flag. A9's guarantee covers new uploads only.
- **Verification loop:** lint, `format:check`, typecheck, `npm test` (26 files, 764 passed; the same with the host zone set to UTC) and build all green. Build sizes equal main's (main built with the changes stashed: every page within a few bytes, `/dashboard/*` 320 kB on both; the Baseline's 319 corrected).
- **`/code-review` (high):** seven findings. Fixed: the section fallback read "2026-10-15" as "26-10-15" (2015-10-26), so ISO now comes first and a numeric date can't start inside a longer number; `detectDateOrder` counted impossible dates as evidence; a flagged placeholder showed as a course's next deadline; the label was duplicated (now in `utils/urgency.ts`); a regex was rebuilt per section. New item: A46. No change: refusing an upload without `localDate` (a tab left open across the deploy is told to refresh) is the cost of never using the UTC day.
- **Docs:** `apps/web/standards.md` (the extraction rule and the flag's behavior); `docs/ops.md` (ENOSPC as a fallback, `taskkill` from Git Bash, `hasCompletedOnboarding` for a test user, the `localDate` field and the 4 KB floor for test PDFs).
- **New:** D10 (ambiguous day and month), A44 (small PDFs fail in pdf-parse), A45 (the regex fallback's weight window), A46 (a number before a month read as the day).
- **After the PR:** D10 decided: keep flagging ambiguous dates for review rather than guessing (option a), so B8's behavior stands.
- **Left for the founder:** check the Vercel preview; merge. Gemini's structured output only meets real replies in production (or a preview with the key set), so one real outline upload there is the last check of `responseSchema`.
- **Gotchas:**
  - In this shell, heredocs passed to `python` or `cat` turned `\\n` into a real newline and `\\` into `\`, which broke test strings twice; edit files that hold escapes with the editor tool.
  - pdf-parse rejects a valid PDF under about 4 KB (A44); pad generated test PDFs.
  - A seeded test user needs `hasCompletedOnboarding: true`, or every page redirects to `/onboarding`.

### 2026-10-11 · B9 (`feat/b9-reminders-local-time`, PR #14)

- **A8, A32 and A38 done.** Pulled main after PR #13 (already up to date), branched, no dev servers were running. The founder asked for every check to be run by the agent, then a commit, push and PR (the founder merges).
- **Test-first:**
  - Today's date math moved unchanged into the pure `lib/reminderSchedule.ts` (`dueReminders`, taking the zone and "now" as parameters and ignoring the zone, as the old code did). 20 cases asserting the fixed behavior (A8 19, A38 1) ran once as plain `it`s and failed on their assertions in both zones, showing today's behavior: the record key was the day count (`targetDay: "3"`); an assessment due tomorrow at 05:00 came back with `daysUntilDue: 0` through the 12-36 hour window; "9:00", "11:59 PM" and a missing time gave nothing (Invalid Date, or UTC midnight for the date alone); Auckland, Kolkata and UTC users were read on the server's clock; a Missed assessment got a reminder; nothing waited for 9:30; and on the next day the failed reminder wasn't due at all. One case first passed in the Toronto run (the old floor count landed on exactly 4 days), so its due time moved to 20:00 to fail in both zones. Marked `it.fails`, they passed against the old code; after the fix they became plain `it`s.
  - New functions started from failing tests: `resolveTimeZone`, `nextReminderRun`, `isValidTimeZone`, `browserTimeZone`, `claimDecision` (replaces `isAlreadySent`, whose cases moved into it), `legacyRecordIds`, `isRecentLegacySend`, and the reminder email's wall-clock date (`lib/emailTemplates.test.ts`, new).
  - Zones covered: Toronto, Auckland (UTC+13 in October), Kolkata (half hour), UTC, both 2026 Toronto DST switches and both Auckland ones, unpadded and 12-hour times, a late run the same day and the next morning, the 2-day catch-up limit, a run called twice (every 15 minutes across both DST weekends, `nextReminderRun` is always after now), and A38's retry after the day count changed.
- **Design** (the item and `docs/ops.md`, "Reminder cron", have the rest): reminders belong to a target day, due from 9:30 local; `nextReminderAt` decides when a run reads a user; records are keyed by the target day and claimed in a transaction before sending; at most 3 attempts, 20 minutes apart; up to 2 days of catch-up. The route takes `?now=` in development only, for the emulator checks.
- **Dependency:** `npm install @date-fns/tz@^1.5.0 -w apps/web` (1.5.0, published 2026-05-21, MIT, no dependencies). The lockfile gains one entry, from registry.npmjs.org with an integrity hash; `npm ls --all` is clean; `npm install --package-lock-only` changes nothing; `npm audit` unchanged. The dry run listed 103 "add" lines, but all except `@date-fns/tz` are platform binaries the lockfile already records, which a no-op dry run lists too.
- **Client:** sign-in writes `timeZone` (from `Intl`) with `nextReminderAt: serverTimestamp()` when the zone is missing or has changed; new user docs get both. Saving the Notifications card and finishing onboarding also set `nextReminderAt: serverTimestamp()`, so a change after 9:30 applies at the next run instead of the next day.
- **A32:** the hint reads "Choose between 1 and 30 days. Reminders go out at about 9:30 AM in your time zone." in Settings and onboarding.
- **End to end on the emulators** (Auth and Firestore emulators from `node_modules/.cache/b9/emu`, dev server on :3005 with `CRON_SECRET` a placeholder and `EMAIL_APP_PASSWORD` and `GEMINI_API_KEY` empty, so every send fails before reaching Gmail; scripts in `node_modules/.cache/b9/`). `e2e.mjs` seeded users in Toronto (N=3), Auckland (N=1), Kolkata (N=2) and UTC (N=1), a user from before A8 (no `timeZone`, no `nextReminderAt`, one assessment with an old-format `sent` record from the day before) and one with reminders off, then called the real route at simulated times:
  - Oct 11 20:05 UTC, the day's first run: the sweep scheduled the one unscheduled user; 6 users read; the pre-A8 user (Toronto fallback, 16:05 there) skipped the reminder the old cron had sent and attempted the other one due that day (1 failed); everyone else moved to their next 9:30 (Auckland 20:30 UTC = 09:30 NZDT, Kolkata 04:00 UTC, UTC 09:30, Toronto 13:30 UTC).
  - The same moment again: 0 users read, nothing new.
  - 20:35: Auckland's 09:30 had passed; its reminder was attempted ("due in 1 day"); the pre-A8 user's retry was attempt 2.
  - Oct 12 04:05: Kolkata's reminder (attempt 1, "due in 2 days"); the pre-A8 user's third attempt came after Toronto's midnight, so it went out on the new day as "due in 2 days" and then stopped (capped); its `nextReminderAt` went to 09:30 Toronto, not a retry.
  - 09:35: UTC's reminder; Auckland's third attempt, capped.
  - 13:35, Toronto's 09:30: 5 users; both Toronto reminders attempted, the unpadded "9:00" one stored as 09:00; the Missed, needs-review, later and opted-out Submitted assessments got no record; the user with reminders off was moved to tomorrow. The same moment again: 0 users.
  - With one Toronto record set to `sent` by hand (no real send can happen here) and a Settings-style write of `nextReminderAt`, 14:05 skipped the sent one and retried the other.
  - Oct 13 06:05 UTC (02:05 in Toronto) after no runs for the rest of Oct 12: the failed Toronto reminder went out on the new day under the same record ID, `daysUntilDue` 2 (A38 end to end).
  - 19 send failures in all, each logged with uid, assessment ID and attempt, no address anywhere in the log. `cronRuns` had one doc per UTC day with `sweptAt`, the day's totals and `lastRun` (with `scheduled`).
  - `overlap.mjs`: two simultaneous calls for a user with one due reminder; both read the user, one attempted the send (`attempts: 1`), the other saw the claim and set a re-check for 20 minutes later.
  - No secret: 401. A bad `?now`: 400.
  - After the `/code-review` fixes below, both scripts ran again with output identical to the first run.
- **UI, in the built-in browser** against the emulators (the `__FIREBASE_DEFAULTS__` cookie; the Auth Emulator warning showed before any credentials were typed; test users generated into `node_modules/.cache/b9/e2e-user.json`, emulator only):
  - Signing in a user stored as `Pacific/Auckland` from this Toronto browser rewrote `timeZone` to `America/Toronto` and set `nextReminderAt` to the server's now; a later page load with the same zone wrote `lastLogin` only. A user with no zone got one at sign-in.
  - Settings with custom days: the new hint in light and dark at 1280px and at 375px (no horizontal scroll); saving the card set `nextReminderAt`. Onboarding's notifications step under Custom timing: the hint in both themes at both widths; finishing onboarding set `nextReminderAt`. A cron call afterwards moved both users to 09:30 Toronto. No console errors.
  - Afterwards the cookie, the emulator sign-in, the stored theme and the viewport were cleared, and the dev server and emulators were stopped (ports closed).
- **The first production run** (existing users and records): no user has `timeZone` or `nextReminderAt` today.
  - The first run after the deploy (GitHub's next :05 or :35 once the secret is set, else the 21:00 UTC Vercel run) sweeps every existing user, sets `nextReminderAt` to now and reads them all in that run, in Toronto time, as the old daily run did. `cronRuns/<that date>` shows `sweptAt` and `lastRun.scheduled` equal to the number of users.
  - In that run, a reminder whose target day is today (once it is past 9:30 in Toronto) or one of the two days before goes out unless the old cron sent it in the last 4 days (its `{uid}_{assessmentId}_{days}` record). So the old cron's last sends are not repeated, and the ones it never made (unpadded or 12-hour times, an assessment added after its reminder day) go out late, saying "due in N days" from today. Today's reminders that the old 21:00 UTC run would have sent go out at the first run instead, and from the next morning everyone gets 09:30 Toronto.
  - Each user moves to their own zone at their next sign-in (`timeZone` plus `nextReminderAt` set to now, so the next run reschedules them).
  - Old records stay as they are; new records are `{uid}_{assessmentId}_{YYYY-MM-DD}` with `status`, `attempts` and `lastAttemptAt` and no email address. The old-record check goes away with A47.
  - If the workflow runs before the secret exists, each run fails at its first step and GitHub emails a failure; reminders still go out from the Vercel backstop.
- **Done-when checks:** A8: the tests above cover Toronto, a UTC+ zone, a half-hour zone, both 2026 DST switches, unpadded times and a late run; on the emulators each zone's reminder was attempted at the first :05 or :35 run after its 9:30 (5 minutes later; the production timing is the founder's first-run check). A32: both hints match what shipped, checked in both themes at phone width. A38: "A38: goes out in the next run after the day count has changed" passes, and the same happened end to end.
- **Verification loop:** lint, `format:check`, typecheck, `npm test` (32 files, 932 passed: 466 per zone) and build all green. Build: every page equal to main except `/settings`, 5.38 to 5.4 kB (285 kB first load, was 284), from `serverTimestamp` in the Settings save (main built with the changes stashed). `.github/workflows/reminders.yml` parses as YAML and its script passes `bash -n`; the production endpoint answers 401 to a request without the secret (no redirect, nothing ran).
- **`/code-review` (high):** seven findings. Fixed: a failure in the daily sweep stopped the whole run (it is now logged and the run goes on); curl's retries could outlast the job's 10-minute limit, and a curl failure skipped the error line (now `--retry-max-time 900`, a 20-minute job, and the curl exit code in the message); a sent reminder was re-checked with the old-record read and a transaction on each of its catch-up days (now one read settles it, and the old-record check runs only for a reminder with no new record); `storedDate` duplicated the normalizer's date check (it now calls `parseDueDate`). Skipped: two devices that name a zone differently (`Asia/Calcutta`, `Asia/Kolkata`) rewrite it on each sign-in (an extra read, never an extra send); the three `nextReminderAt: serverTimestamp()` writes stay inline; the dev preview's date formatting.
- **Docs:** `docs/ops.md` (the Reminder cron section rewritten for both triggers, the run, records, the summary and failures; the env table; `?now=` in "Testing API routes locally"); `apps/web/standards.md` (server dates only through `lib/reminderSchedule.ts`; jobs safe to run twice and to overlap; zone-parameter tests use `Date.UTC`); the root and web `CLAUDE.md` and the README (the new workflow).
- **New:** A47 (remove the old-record check after the switch), A48 (onboarding saves `emailNotifications` as true when switched off), A49 (the optional digest, not built), A50 (the reminder time shows only under Custom timing). A16 and A19 got notes for the new fields and what is left of the scan.
- **Left for the founder:** add the `CRON_SECRET` Actions secret before merging (steps in the PR), check the Vercel preview, merge, then check the first runs (in the PR).
- **Gotchas:**
  - Node's ICU reports Kolkata as `Asia/Calcutta`; both names are valid and convert the same, so compare zones through `Intl`, not as strings.
  - A collection read skips a parent doc that doesn't exist: an e2e seed that wrote assessments under a semester without writing the semester doc made every run find nothing.
  - Python's text mode on Windows writes CRLF; open files with `newline=''` (git normalizes on commit either way, through `.gitattributes`).
  - The built-in browser keeps the app's theme per origin, so after one test user picks a theme, the next one starts in it; the color-scheme emulation only applies to System.
  - Killing a background `dev.sh` or `emu.sh` leaves the dev server and the emulator tree running; kill each tree by PID.

### 2026-10-12 · B10 (`fix/b10-data-layer`, PR #15)

- **A11 and A12 done.** Pulled main after PR #14 (already up to date), no dev servers were running, `npm install` clean (nothing changed), then branched. The founder asked for every check to be run by the agent, then a commit, push and PR (the founder merges).
- **Baseline first, on the unchanged branch** (production build with `next start` on :3005, so React's StrictMode doesn't double the reads; Auth and Firestore emulators; seeded users and a semester in `node_modules/.cache/b10/seed.mjs`):
  - A dashboard reload read the user doc 2 times (the 5 `getDoc` calls share targets when they overlap) and wrote `lastLogin` every time.
  - A rules denial on the user doc left "Loading..." on screen indefinitely (`Uncaught (in promise) FirebaseError`).
  - A status change in Assessments left Grades stale (Midterm set to Missed still read 90.0%, should be 36.0%).
  - Found while seeding: an assessment without a `dueDate` crashed the whole dashboard (A52), and the stats bar's "Submitted" counted the Missed quiz (A51).
- **How reads were counted:** the emulator's rule-coverage report (`GET /emulator/v1/projects/asetta-me:ruleCoverage`), with a scratch copy of the rules where the user doc's `get`, `list` and `write` sit on their own lines (same access), diffed before and after one reload. A listen or `getDoc` evaluates `get` once. A change pushed to an open listener makes the emulator re-check the rule several times (+5 to +7 here), which production doesn't bill beyond one read per changed doc, so the per-load count comes from loads where the doc doesn't change. `count-reads.mjs` in `node_modules/.cache/b10/` reads it.
- **Test-first:**
  - Pure logic pulled out of the hooks unchanged first (`utils/semesterAssessments.ts`: `assessmentFromDoc`, `courseNames`, `processCourseStats`, `computeStats`; `utils/userDoc.ts`: the onboarding status, display preferences and profile mappings, `lastLoginToWrite`, `timeZoneToWrite`, `userDocErrorKind`), with tests pinning today's behavior.
  - Known bugs went in as `it.fails` and were each run once as a plain `it`, failing on their assertions in both zones: A11 (the mapping drops `mark`, a cleared `mark: null`, `createdAt` and `updatedAt`: "expected undefined to be 85"), A12 (`lastLoginToWrite` wrote on a second sign-in the same day, for a Timestamp or a Date, and on both 2026 DST days) and A51 ("expected 2 to be 1"). The A11 and A12 fixes turned them into plain `it`s; A51 stays.
  - New helpers started from failing tests: `userDocErrorKind`, `profileFromUserDoc`, and the grade calculator's `withEdits` and `pendingEdits`.
- **A12, in order:** S (try/catch/finally, `userDocError`, `LoadErrorScreen`), then M (see the item). In M the offline case needed care: Firestore raises a "doc missing" snapshot from the cache when it can't reach the server, and treating that as missing would create a new user doc over the real one, so only a server snapshot counts.
- **A11:** see the item.
- **`/code-review` (high):** six findings. Fixed:
  - Grades kept a renamed or other-semester course selected and showed an empty calculator.
  - On a semester switch the tabs got the previous semester's assessments until the new snapshot, so a grade typed in that moment would save to a nonexistent path.
  - UserSettings duplicated the preferences mapping.
  - An open calendar day didn't follow the live data.

  Skipped: metadata-only snapshots re-render `useAuth` consumers (A55); the second onboarding-status read path (A54).
- **Bundle:** with the error screen in `_app` (the S design) the shared chunk grew 229 to 240 kB; a build without it showed the screen's UI imports were 11 of the 12 kB. It moved into the three pages that need the user doc (dashboard layout, Settings, onboarding), which already load those modules. Final sizes are in the Baseline.
- **End to end on the emulators** (the production build; the `__FIREBASE_DEFAULTS__` cookie, with the Auth Emulator warning in the console before any credentials were typed; test credentials generated into `node_modules/.cache/b10/e2e-user.json`, emulator only):
  - A12 reads: each dashboard reload read the user doc once and wrote nothing; switching through all five tabs added nothing. With `lastLogin` set to the day before, the next load wrote it once, and the load after that read once and wrote nothing.
  - A12 errors:
    - **Rules denial:** "Couldn't load your account" within about 0.1 s on the dashboard, Settings and onboarding. `/login` for the signed-in user went to `/onboarding` with the same screen (A54).
    - **Firestore stopped** (stopping it took the whole emulator process, Auth included): "Can't reach Asetta" in about 4 s. After a restart from an export, the open page loaded on its own 9 s later with no reload, and the user doc was unchanged.
    - Checked in light and dark at 1280px and 375px, with no horizontal scroll.
  - A11, each edit then every other tab read back without a reload:
    - **Status in Assessments:** Lab 1 to Submitted showed in Courses (1 of 1), Grades and the stats bar.
    - **Grades:** a weight showed in Assessments; marks typed into two rows inside the 750 ms debounce showed at once (79.0%) and saved (70 and 80 in the emulator, Midterm's status Submitted).
    - **Add and rename:** an assessment added in Add showed in Courses, Calendar and the Grades course list. Renaming that course while Grades had it selected updated Courses, Assessments and Calendar, and Grades fell back to the first course.
    - **Due date and delete:** a due date edited in Assessments moved in Calendar and Courses; a delete removed the assessment from every tab.
    - **Another browser tab:** a status change there showed in the first tab's course-filtered view.
    - **Semester switch:** on the same page it shows a spinner, then the new semester; no tab showed the old one.
    - **Missing `dueDate`:** the doc is hidden, with no crash (A52).
    - **Course preferences:** viewing a course without a preferences doc wrote nothing; setting its target created the doc with only `targetGrade`.
  - B9 kept:
    - A user stored as Pacific/Auckland signing in from this Toronto browser got `America/Toronto` and `nextReminderAt` at the server's time; a user with no zone got both.
    - A user without a doc (sign-in, and a sign-up through the form) got a doc with both fields and exactly one welcome-email request, counted with a `fetch` wrapper in the page. The send failed by design (empty `EMAIL_APP_PASSWORD`) and the route released its marker.
    - Saving the Notifications card and finishing onboarding set `nextReminderAt`.
  - Redirects as before:
    - Sign-in for an onboarded user lands on the first semester's Assessments; for a user who isn't onboarded, on `/onboarding`.
    - Sign-up lands on `/onboarding`. `/dashboard` for a user who isn't onboarded goes to `/onboarding`, and `/login` while signed in goes to the dashboard.
    - Finishing onboarding goes to the new semester's dashboard, and skipping goes to `/dashboard/assessments`, neither bouncing back. (`/` goes to www.asetta.me in a production build, by design.)
  - Afterwards the emulator sign-in, the cookie, the stored theme and the viewport were cleared, and the server and emulators were stopped (ports closed).
- **Verification loop:** lint, `format:check`, typecheck, `npm test` (36 files, 1052 passed, 2 expected failures, A51 in both zones) and build all green.
- **Docs:** `apps/web/standards.md` (the user doc read once through `useAuth()`, one live assessments listener, no writes on read, the load error screen); `docs/ops.md` (counting reads with rule coverage, forcing a read error, stopping Firestore with an export); `apps/web/CLAUDE.md` (where the user doc lives).
- **New:** A51 to A56. A15, A24 and A35 got notes.
- **Final check (founder's request, same day):** re-read the whole diff against A11's and A12's Fix and Done when; a second `/code-review` (high) found two minor points. Fixed: the assessments snapshot is now keyed by user as well as semester, so a different account can never see the last one's snapshot. No change: `/dashboard` with a user-doc error goes to the first semester, which then shows the error screen (one extra semesters read). The loop passed again (same counts and sizes), and a smoke test on the production build against the emulators (sign-in, then a semester switch each way) showed a spinner and then the right semester.
- **Left for the founder:** check the Vercel preview, then merge.
- **Gotchas:**
  - The Firestore emulator hot-reloads the rules file, but a copy can land mid-read: "Rules updated" while the rule-coverage report still shows the old rules. Check the report's `rules.files[0].content`, and `touch` the file to reload again.
  - Killing the Firestore emulator's java process stops the whole `emulators:start` (Auth too). Export first (`firebase emulators:export <dir>`) and restart with `--import <dir>`.
  - The built-in browser's hidden pane doesn't paint, so React effects can lag: the register form's password check ran after Enter, and the first submit said the requirements weren't met. Submitting again worked.
  - The browser's network list drops requests under Firestore's long-polling; count a request with a `fetch` wrapper installed in the page instead.
