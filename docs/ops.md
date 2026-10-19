# Operations

How Asetta is deployed and run: the Vercel projects, the reminder cron, environment variables,
Firestore rules, the dependency audit policy, and the gotchas of this repo and the Windows dev
machine. Planned changes live in `docs/AUDIT.md`; this file describes what is true today.

## Vercel

| Project          | App            | Domain          | Config                                   |
| ---------------- | -------------- | --------------- | ---------------------------------------- |
| `asetta`         | `apps/web`     | `asetta.me`     | `apps/web/vercel.json` (cron, functions) |
| `asetta-landing` | `apps/landing` | `www.asetta.me` | none (Next.js defaults)                  |

- Both projects are on the Hobby plan, Node 22.x, framework Next.js.
- A push to `main` deploys both to production; every other branch gets preview deployments.
- Vercel Authentication is on for previews and the generated `*.vercel.app` URLs: opening a
  preview needs a Vercel login. The custom domains are public.
- Hobby limits that shape the code: runtime logs are kept for 1 hour, and a cron job runs at most
  once a day and fires anywhere within its scheduled hour.
- Function limits in `apps/web/vercel.json`: the cron route has `maxDuration: 300`, the upload
  route `maxDuration: 60`.
  - Vercel's docs (checked 2026-10-11) give Hobby functions on Fluid compute a 300-second default
    and maximum. Fluid compute is the default for projects created after April 23, 2025, and
    `asetta` was created on May 8, 2025. The Vercel MCP's project read doesn't show the setting;
    it is under Settings, Functions, Fluid Compute in the dashboard.
  - A `maxDuration` in `vercel.json` overrides the default in both directions: the cron's old
    `10` held it to 10 seconds.
  - `vercel.json` has no `memory` or `version` (both removed in A3). With Fluid compute, memory
    can't be set there (Hobby is fixed at 2 GB and 1 vCPU), and `version` is a retired property.
- The cron route has no `regions` config on purpose: it was never a valid key for Pages Router
  API routes, so the function runs in the project's default region. Pin a region in the Vercel
  project settings if that is ever needed.

## Reminder cron

- Reminders go out at 9:30 in each user's own time zone (D4). Two triggers call
  `GET /api/cron/notifications` with `Authorization: Bearer <CRON_SECRET>`:
  - **GitHub Actions** (`.github/workflows/reminders.yml`) at :05 and :35 past every hour (UTC),
    so a user's reminders go out within about 5 minutes of their 9:30 (35 for a zone on a
    quarter hour, such as Nepal). It needs the repo Actions secret `CRON_SECRET`, with the same
    value as in Vercel, and fails loudly without it. It prints only the HTTP status, because
    Actions logs are public in this repo. Run it by hand from the Actions tab (Reminders, Run
    workflow).
  - **Vercel cron** (`apps/web/vercel.json`) at `0 21 * * *`: once a day, the backstop. Vercel
    sends the header itself when the project has `CRON_SECRET` set.
- GitHub runs schedules from the default branch only, can delay or drop runs under load, and
  turns schedules off in a public repo after 60 days without repo activity (it emails a warning
  first; re-enable from the Actions tab). While it is off, the Vercel backstop still sends, up to
  a day late.
- The route accepts only that header. With the secret unset or empty, every request gets 401
  and logs `Reminder cron: CRON_SECRET is not set`, so a missing secret stops reminders loudly.
- **How a run works** (`lib/notifications.ts`; the date math is in `lib/reminderSchedule.ts`):
  - Each user doc has `timeZone`, the browser's IANA zone, and `nextReminderAt`, when the cron
    should look at the user next. Users without a valid `timeZone` get `America/Toronto`.
  - The client writes `timeZone` at sign-in when it is missing or has changed, and sets
    `nextReminderAt` to the server's now with it, and again when it saves notification settings
    or finishes onboarding, so the change applies at the next run.
  - The first run of each UTC day sets `nextReminderAt` to now on every user without one (on the
    first run after A8, every user), because Firestore can't query a missing field.
  - Every run reads only the users whose `nextReminderAt` has come, sends their due reminders,
    and moves `nextReminderAt` to their next 9:30, or about 20 minutes on while a failed send
    waits to retry. A user with reminders off is moved on too. Calling the route twice in a row
    sends nothing new.
  - A reminder belongs to a target day, N calendar days before the due date. From 9:30 that day
    in the user's zone, runs send it until it has gone out, up to 2 days late, so a missed run
    catches up. Never for an assessment that is already due, needs review, is Missed, or is
    Submitted when the user opted out. "Due in N days" counts calendar days in the user's zone.
- **Where a reminder goes** (A17): to the user doc's `email` when it is the account's sign-in
  email or equals `verifiedEmail`, the address the student confirmed through the emailed link;
  otherwise to the sign-in email (looked up in Firebase Auth when a send is about to be claimed).
  A user with neither gets nothing. The link: `POST /api/notification-email/verify` emails it for
  the saved address (24 hours, at most one a minute and 5 a UTC day, the hash in
  `emailVerifications/{uid}`); `/confirm-email` POSTs `/api/notification-email/confirm` from a
  button. Links use `NEXT_PUBLIC_APP_URL`, so one sent from a preview points at production.
- **Addresses saved before A17 count as confirmed** (D11): the first run after the D11 deploy sets
  `verifiedEmail` to each user's saved address (valid, and no `verifiedEmail` yet), once. The
  marker `migrations/d11-existing-addresses` records `startedAt`, `finishedAt`, `users` and
  `confirmed`; a marker without `finishedAt` means a run died during the step: delete it and the
  next run redoes it (users already confirmed are skipped). A64 removes the step.
- **Records:** `notifications/{uid}_{assessmentId}_{targetDay}`. A run claims a reminder in a
  transaction (status `sending`, with `attempts` and `lastAttemptAt`) before sending, then marks
  it `sent` or `failed` (with the error message). Only `sent` blocks it for good, so overlapping
  runs can't both send one. A failed send is retried by a later run at least 20 minutes on, up to
  3 attempts; a claim whose run died is taken over after 10 minutes.
- **Records from before A8** are `notifications/{uid}_{assessmentId}_{days}`. For the first days
  after A8, a run skips a reminder whose old-format record says `sent` within the last 4 days, so
  the switch doesn't resend what the old cron had just sent (A47 removes that check). Nothing
  else reads or deletes the old records.
- **Run summary:** every run writes `cronRuns/{YYYY-MM-DD}`, keyed by the UTC day of the run.
  `runs`, `sent` and `failed` are that day's totals; `sweptAt` is when that day's first run
  scheduled the users without a `nextReminderAt`; `lastRun` is the latest run (`startedAt`,
  `finishedAt`, `durationMs`, `scheduled` (users the day's sweep scheduled, or null after it),
  `users` (users whose `nextReminderAt` had come), `sent`, `failed`, `userErrors`, and `error`,
  the message that stopped the run, or null). Read it in the Firestore console; it outlives the
  1-hour log window. No doc for a day means no run got past the secret check and reached
  Firestore that day: look in the logs for a 401 or a startup error (within the hour). The route
  also returns the summary as JSON.
- **Failures** go to `console.error` without email addresses: `Reminder cron: send failed` (uid,
  assessment ID, attempt, SMTP `code` and `responseCode`), `could not process a user` (uid,
  error; that user's `nextReminderAt` isn't moved, so the next run tries again), `could not
  schedule new users` (the day's sweep; the run goes on for users who already have a
  `nextReminderAt`, and the next run sweeps again), `sent, but could not record it`, `could not
  save the run summary`, and `run failed`.
- **Never call the route locally with the real secret.** It reads production Firestore and sends
  real emails. QA production through the run summary (and the logs, within the hour); test
  locally against the emulators with a placeholder secret ("Testing API routes locally").
- Planned: throughput (A19).

## Environment variables

Each app reads its own `.env.local` locally; production values live in the matching Vercel
project. Never commit real values.

**`apps/web`** (Vercel project `asetta`):

| Variable                                   | Used by                                     | Notes                                                                                       |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | `lib/firebase.ts` (client SDK)              | Public by design.                                                                           |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `lib/firebase.ts`                           |                                                                                             |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `lib/firebase.ts`, `lib/firebase-admin.ts`  | Firebase project `asetta-me`.                                                               |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `lib/firebase.ts`                           |                                                                                             |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `lib/firebase.ts`                           |                                                                                             |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | `lib/firebase.ts`                           |                                                                                             |
| `FIREBASE_SERVICE_ACCOUNT`                 | `lib/firebase-admin.ts`                     | The whole service account JSON on one line. Unset, the admin SDK uses default credentials. |
| `GEMINI_API_KEY`                           | `lib/upload/gemini.ts`                      | Syllabus extraction.                                                                        |
| `EMAIL_USER`                               | `lib/email.ts`                              | The Gmail account that sends reminders and welcome emails.                                  |
| `EMAIL_APP_PASSWORD`                       | `lib/email.ts`                              | A Gmail app password, not the account password.                                             |
| `CRON_SECRET`                              | `pages/api/cron/notifications.ts`           | See "Reminder cron". The repo's Actions secret `CRON_SECRET` holds the same value.          |
| `NEXT_PUBLIC_APP_URL`                      | `lib/emailTemplates.ts`, `pages/api/notification-email/verify.ts` | Links and the logo in emails, the confirm link included. Defaults to `https://asetta.me`. |

**`apps/landing`** (Vercel project `asetta-landing`):

| Variable                        | Used by                | Notes                                                                       |
| ------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `EMAIL_USER`                    | `pages/api/contact.ts` | Gmail account for the contact form; mail goes to `CONTACT_EMAIL` in `lib/site.ts`. |
| `EMAIL_PASS`                    | `pages/api/contact.ts` | Gmail app password; web calls the same kind of value `EMAIL_APP_PASSWORD` (A26). |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `pages/_app.tsx`       | Optional. GA4 loads only when it is set.                                    |

- CI sets placeholder values for the six `NEXT_PUBLIC_FIREBASE_*` variables only
  (`.github/workflows/ci.yml`), because `next build` initializes the Firebase client SDK while
  prerendering. It never contacts Firebase during a build.
- The two apps' local `.env.local` files have held different Gmail accounts. Check which account
  each Vercel project uses before changing either (A26).

## Firestore rules

- `firestore.rules` at the repo root is the source; `firebase.json` and `.firebaserc` point the
  Firebase CLI at it and at project `asetta-me`.
- **The founder deploys rules**, from the repo root: `firebase deploy --only firestore:rules`.
  Agents can't: `.claude/settings.json` denies every deploy command and the destructive Firebase
  MCP tools.
- The live rules matched `firestore.rules` on 2026-10-10. B12 (A16) rewrote the file; the
  founder deploys it after B12's merge. After any deploy, check the console matches the file.
- **Deploy order when rules and app change together:** the app first, then the rules. Rules that
  refuse a write the old app still makes break it until the deploy lands (B12's rules refuse the
  old edit row, which wrote the doc's `id`); a tab still open on the old bundle keeps failing
  until it reloads.
- **What the rules allow:** each client collection (the user doc, semesters, assessments,
  `coursePreferences`) lists the keys a client may write, with a type and a size cap for each. A
  create checks every key; an update checks only the keys it adds or changes, so a key an older
  app version left in a doc never blocks an edit; removing a key is always allowed. A new field
  the client writes needs a rules change and a case in the rules suite.
- `welcomeEmails/{uid}`, `cronRuns/{date}`, `notifications/{id}` (the reminder records),
  `emailVerifications/{uid}` (the confirm link for a notification address) and `migrations/{id}`
  (one-time steps, such as D11's) are server-only: no
  rule matches them, so clients are denied. So is `verifiedEmail` on the user doc: it isn't in the
  user doc's list (a client may only remove it, which sends its reminders to the account email).
- **The rules suite:** `npm run test:rules` (from the root) starts the Firestore emulator with
  `npx -y firebase-tools@13.35.1 emulators:exec` and runs
  `apps/web/src/rules/firestore.rules.test.ts`, which loads `firestore.rules` into the emulator and
  replays every client write in the app plus writes the rules must refuse. Run it before every
  rules deploy; `npm test` and CI leave it out (A60). Against an emulator that is already running,
  set `FIRESTORE_EMULATOR_HOST` and run `npx vitest run --config vitest.rules.config.ts` in
  `apps/web`. On Windows the emulator's java process outlives `emulators:exec`, and the next run
  fails with "port taken": kill it by PID ("The Windows dev machine").
- Storage is unused and has no rules.

## Testing API routes locally

- Use the Firebase Auth and Firestore emulators, never production data. Set
  `FIREBASE_AUTH_EMULATOR_HOST` and `FIRESTORE_EMULATOR_HOST` together on the dev server:
  emulator ID tokens are unsigned and only pass with the Auth one set, and the Firestore one
  keeps every write off production.
- firebase-tools isn't a dependency; run it with `npx -y firebase-tools@<version>`. Version 14
  and later need Java 21 for the emulators, and this machine has Java 20 (2026-10-16), so use
  `firebase-tools@13.35.1`, the last 13.x. Point `FIREBASE_EMULATORS_PATH` at a folder under
  `node_modules/.cache/` to keep the downloaded jar there; `npm ci` deletes it. B11's scripts
  (`emu.sh`, `dev.sh`, `seed.cjs`, `dump.cjs`, and `repro-docref.cjs`, which shows the A13 failure
  with the SDK alone) are in `node_modules/.cache/b11/`. B12's (`emu.sh`, `dev.sh`, `seed.cjs`
  with a reminder user per address case, `api-check.cjs` for the confirm-link routes, and
  `make-link.cjs`, which stores a known token and prints its link in place of the email) are in
  `node_modules/.cache/b12/`.
- The emulator refuses a rules file outside the folder it starts in, so a scratch emulator copies
  the repo's `firestore.rules` in at start (B12's `emu.sh` does).
- `.env.local`'s `FIREBASE_SERVICE_ACCOUNT` didn't parse on this machine (2026-10-16), which makes
  every admin route answer 500. Against the emulators set it to empty on the dev server: they need
  no credentials, and no real ones get loaded.
- firebase-admin 14 has no namespaced API (`admin.auth()` is not a function): seed scripts import
  `initializeApp`, `getAuth` and `getFirestore` from `firebase-admin/app`, `/auth` and
  `/firestore`.
- The Auth emulator's `projects/{id}/accounts:update` with `Authorization: Bearer owner` sets
  `emailVerified` on a test user.
- Override `.env.local` values in the dev server's own environment: Next never replaces a
  variable that is already set, even to an empty string.
  - `CRON_SECRET=<a placeholder>` lets you call the cron route without the real secret. In
    development the route also takes `?now=<ISO instant>` and runs as of that moment (ignored
    everywhere else), so a script can walk through each zone's 9:30. B9's are in
    `node_modules/.cache/b9/` (`e2e.mjs`, `overlap.mjs`). Seed each test user's semester doc, not
    just its assessments: a collection read skips a parent doc that doesn't exist.
  - `EMAIL_APP_PASSWORD=` (empty) makes every send fail before it contacts Gmail: the safe way to
    force a send failure.
  - `GEMINI_API_KEY=` (empty) makes uploads skip Gemini and use the regex fallback.
- Point `TEMP` and `TMP` at an empty folder to watch formidable's upload files; none should be
  left after a request, and an unauthenticated upload should never create one.
- The emulators can run from a scratch folder with its own `firebase.json` (auth on 9099,
  firestore on 8080, UI off) and `--project asetta-me`, which keeps their logs out of the repo.
- To drive the signed-in UI against the emulators without a code change, set a
  `__FIREBASE_DEFAULTS__` cookie on the dev server's origin before the app loads: web-safe
  base64 (no padding) of `{"emulatorHosts":{"auth":"127.0.0.1:9099","firestore":"127.0.0.1:8080"}}`.
  `getAuth()` and `getFirestore()` in `lib/firebase.ts` then connect to the emulators. Check the
  console shows "You are using the Auth Emulator" before typing any credentials, create the test
  user through the Auth emulator's REST API, and seed its user doc first: a user without one makes
  `AuthContext` request the welcome email. Give it `hasCompletedOnboarding: true` too, or the
  sign-in lands on `/onboarding`. Delete the cookie afterwards.
- **Counting Firestore reads:** use a production build (`npm run build -w apps/web`, then
  `npm run start -w apps/web -- -p 3005` with the same env), because development's StrictMode
  runs effects twice. The Firestore emulator's rule-coverage report
  (`GET http://127.0.0.1:8080/emulator/v1/projects/asetta-me:ruleCoverage`) counts how often
  each rule line ran; with a scratch copy of the rules where the doc's `get` has its own line,
  the change across one page load is that load's reads of the doc. A change pushed to an open
  listener makes the emulator re-check rules several times, so measure loads where nothing
  changes. B10's `count-reads.mjs` and split rules are in `node_modules/.cache/b10/`.
- **Forcing a read error:** edit the scratch rules file (for example `allow get: if false;`);
  the emulator reloads it. A copy can land mid-read and leave the old rules loaded, so check the
  report's `rules.files[0].content` and `touch` the file if needed. Stopping the Firestore
  emulator's java process stops the whole `emulators:start`, Auth included: export first
  (`firebase emulators:export <dir> --project asetta-me`) and restart with `--import <dir>`.
- Uploads need a `localDate` form field (YYYY-MM-DD within a day of the UTC date) or the route
  answers 400; the app's `postUploadForm` adds it. A test PDF must be at least about 4 KB:
  smaller ones fail in pdf-parse with "bad XRef entry" (A44). B8's generator
  (`node_modules/.cache/b8/make-pdf.cjs`) pads its outlines past that.
- Preview emails at `/api/dev/email-preview` on `npm run dev:web` (404 outside development).
  Real test sends go to the founder's own address only, with the founder's approval.

## Dependencies and `npm audit`

**Audit policy:**

- Measure with `npm audit --omit=dev` from the repo root (production dependencies) and record
  the numbers in the Baseline of `docs/AUDIT.md`.
- Fix with `npm audit fix`, never `--force`. A major upgrade is its own commit (its own PR in
  A25), smoke-tested.
- Every high that stays gets a written reason in the session log. Today's accepted highs and why
  they don't apply are in the B2 session log: the `@grpc/grpc-js` chain under the firebase
  client SDK (no firebase release lifts it) and the `postcss` that web's Next 15 pins (clears
  with Next 16, A25).
- CI has no audit step yet (A28).

**npm workspaces (npm 10.9):**

- One lockfile, at the root. Add a dependency with `npm install <pkg> -w apps/web` (or
  `-w apps/landing`); never create a per-app lockfile.
- After pulling a commit that touches any `package.json`, run `npm install`.
- Workspace-scoped updates misbehave:
  - `npm update -w apps/landing` updates *every* workspace, not just the landing.
  - `npm update <names> -w apps/landing` updates the root copies of those names (web's) and
    leaves the landing's alone.
  - `npm install <pkg>@<range> -w <app>` can save the new range in `package.json` but leave the
    old version in the lockfile, an invalid tree that a later `npm install` won't repair.
  - What works: name the version, `npm install <pkg>@<range> -w <app>`, then check
    `npm ls --all`. If the lockfile is stuck, delete that package's entries from
    `package-lock.json` and its folder under `node_modules`, then `npm install`.
- Check the tree with `npm ls --all`. Plain `npm ls` checks top-level dependencies only and
  reports an invalid nested package as valid.
- npm 10.9 crashes with `Cannot read properties of null (reading 'edgesOut')` when peer
  dependencies form a loop (Vite 8 and `vitest`, see "Pins to know"). `npm install --dry-run`
  reproduces it without touching anything, and the debug log's `placeDep` lines show which
  package pulled the loop in.
- Deleting a nested package folder by hand can leave a stale shim in `node_modules/.bin`
  (for example `apps/landing/node_modules/.bin/next` failing with "Cannot find module"). Delete
  the shim too. A fresh `npm ci` never has it.
- Hoisting is not stable across upgrades: today the landing's `next` and `postcss` sit at the
  root and web's `next` is nested in `apps/web/node_modules`. Both apps must share one
  `react`/`react-dom` (and `@types/react`) version, because hoisted packages resolve React from
  the root.

**Pins to know:**

- Web `next` and `eslint-config-next` are exact pins (`15.5.27`). Move them together.
- The landing's `next`, `eslint-config-next` and `@next/third-parties` are `~16.3.8` on purpose:
  Next 16.4.0 breaks Pages Router dev under Turbopack (vercel/next.js#99789; `next build` is
  fine). Don't move them to 16.4 until a release fixes it (A33).
- The root `package.json` overrides `jose` to `^5`: the upload route crashed at module load with
  jose 6 under `jwks-rsa`. Revisit when firebase-admin bumps `jwks-rsa`.
- The root `package.json` overrides `vite` to `^6.4.4`. Only Vitest uses Vite; neither app does.
  Vitest 4.1 accepts Vite 6 to 8, but npm 10.9 crashes resolving Vite 8: its optional
  `@vitejs/devtools` peer brings in `@vitejs/devtools-vitest`, which peers back on `vitest`. Vite 7
  and 8 also want `@types/node` `^20.19`, and npm then hoists a `@types/node` 26 to the root
  above web's 20.17. Revisit with web's `@types/node` move (A25).
- Web's `vitest` is `^4.1.11`, not 5: Vitest 5 declares `@types/node` `^22 || >=24` as a peer and
  web is on `^20` (A25).
- `next lint` is deprecated in Next 15.5 and removed in 16; the codemod to the ESLint CLI is part
  of web's Next 16 move (A25). The landing already lints with `eslint .`.
- Next 16's `next dev` writes `apps/landing/AGENTS.md` on every run. Delete it rather than adding it to the repo
  until D8 decides (A34).

## The Windows dev machine

- **Stop every dev server before any `npm install`, `node_modules` operation or build.** File
  locks cause EPERM failures. Check with `Get-Process node`, and tell a dev server from the
  editor's and MCP servers' node processes by its command line.
- Stopping a background dev server or emulator can leave its node or java children running; kill
  them by PID (`taskkill /PID <pid> /T /F`).
- If C: fills up again, npm and the emulators fail with ENOSPC. The fallback: point
  `npm_config_cache`, `TEMP` and `TMP` (and `JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=<dir>` for the
  emulators) at folders under `node_modules/.cache/` in the repo. When C: is completely full,
  every `npm run` and `npx` command needs this, not only installs. C: had 33 GB free on
  2026-10-11, so npm runs normally today.
- `taskkill /PID <pid> /T /F` from Git Bash fails with "not found" (the shell rewrites the `/`
  flags); run it through `powershell -NoProfile -Command "taskkill /PID <pid> /T /F"`.
- Line endings: the root `.gitattributes` (`* text=auto eol=lf`) checks every text file out with
  LF even though this machine has `core.autocrlf=true`, so `npm run format:check` passes locally
  as it does on CI. It also lists the binary types (images, fonts, video, PDF); give any new
  binary type a `binary` line there.
- Next 16 keeps a versioned Turbopack dev cache in `apps/landing/.next/dev`; deleting it is safe.
- Node and npm (2026-10-16): the machine runs Node 24.22 and npm 11.19 through nvm4w (20.14 is
  the only other install), while `engines` says 22.x. Install with `npm ci`, which takes the
  lockfile as is; npm 11 skips the install scripts it hasn't been told to allow (esbuild,
  `@firebase/util`, `protobufjs`), and the whole verification loop still passes without them.
  The npm 10.9 notes under "Dependencies" describe the version CI and earlier sessions used.
- The built-in browser's pane, while hidden, doesn't render the page until something asks for
  pixels: a page can sit on "Loading..." for a minute after a navigation. Taking a screenshot
  makes it render; read the page with `read_page` or JavaScript afterwards.
- Git Bash doesn't pass `TZ` through to Node (`TZ=UTC node ...` still runs in the host zone). Set
  it from PowerShell (`$env:TZ = "UTC"`) to run something under another zone. The Vitest config
  doesn't depend on this: Node applies `process.env.TZ` when it is assigned at runtime.
