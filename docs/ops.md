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

- `apps/web/vercel.json` schedules `GET /api/cron/notifications` at `0 21 * * *` (21:00 UTC,
  so 5 PM in Toronto in summer and 4 PM in winter, give or take the Hobby hour).
- The route accepts only `Authorization: Bearer <CRON_SECRET>`. Vercel sends that header itself
  when the project has `CRON_SECRET` set. With the secret unset or empty, every request gets 401
  and logs `Reminder cron: CRON_SECRET is not set`, so a missing secret stops reminders loudly.
- **Run summary:** every run writes `cronRuns/{YYYY-MM-DD}`, keyed by the UTC day the run
  started. `runs`, `sent` and `failed` are that day's totals; `lastRun` is the latest run
  (`startedAt`, `finishedAt`, `durationMs`, `users` checked, `sent`, `failed`, `userErrors`, and
  `error`, the message that stopped the run, or null). Read it in the Firestore console; it
  outlives the 1-hour log window. No doc for a day means no run got past the secret check and
  reached Firestore that day: look in the logs for a 401 or a startup error (within the hour).
  The route also returns the summary as JSON.
- **Failures** go to `console.error` without email addresses: `Reminder cron: send failed` (uid,
  assessment ID, SMTP `code` and `responseCode`), `could not process a user` (uid, error),
  `could not save the run summary`, and `run failed`. The full send error is kept on the failed
  record in `notifications/{uid}_{assessmentId}_{days}`.
- **Retries:** only a `notifications` record with `status: "sent"` blocks a reminder. A failed
  send is retried by the next run that computes the same day count, so under the daily schedule
  only a rerun on the same day retries it (A38).
- **Never call the route locally with the real secret.** It reads production Firestore and sends
  real emails. QA production through the run summary (and the logs, within the hour); test
  locally against the emulators with a placeholder secret ("Testing API routes locally").
- Planned: 9:30 in each user's timezone through a GitHub Actions schedule (A8, D6), and
  throughput (A19).

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
| `CRON_SECRET`                              | `pages/api/cron/notifications.ts`           | See "Reminder cron".                                                                        |
| `NEXT_PUBLIC_APP_URL`                      | `lib/emailTemplates.ts`                     | Links and the logo in emails. Defaults to `https://asetta.me`.                              |

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
- The live rules matched `firestore.rules` on 2026-10-10. After any deploy, check the console
  matches the file.
- `welcomeEmails/{uid}`, `cronRuns/{date}` and `notifications/{id}` (the reminder records) are
  server-only: no rule matches them, so clients are denied. Keep it that way when rules gain
  field validation (A16).
- Storage is unused and has no rules.

## Testing API routes locally

- Use the Firebase Auth and Firestore emulators, never production data. Set
  `FIREBASE_AUTH_EMULATOR_HOST` and `FIRESTORE_EMULATOR_HOST` together on the dev server:
  emulator ID tokens are unsigned and only pass with the Auth one set, and the Firestore one
  keeps every write off production.
- The emulator jar is cached in `node_modules/.cache/a1-test/emulators` (point
  `FIREBASE_EMULATORS_PATH` there). `npm ci` deletes it.
- The Auth emulator's `projects/{id}/accounts:update` with `Authorization: Bearer owner` sets
  `emailVerified` on a test user.
- Override `.env.local` values in the dev server's own environment: Next never replaces a
  variable that is already set, even to an empty string.
  - `CRON_SECRET=<a placeholder>` lets you call the cron route without the real secret.
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
  `AuthContext` request the welcome email. Delete the cookie afterwards.
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
- The C: drive is nearly full, so npm and the emulators can fail with ENOSPC. Point
  `npm_config_cache`, `TEMP` and `TMP` (and `JAVA_TOOL_OPTIONS=-Djava.io.tmpdir=<dir>` for the
  emulators) at folders under `node_modules/.cache/` in the repo. When C: is completely full,
  every `npm run` and `npx` command needs this, not only installs.
- Line endings: the root `.gitattributes` (`* text=auto eol=lf`) checks every text file out with
  LF even though this machine has `core.autocrlf=true`, so `npm run format:check` passes locally
  as it does on CI. It also lists the binary types (images, fonts, video, PDF); give any new
  binary type a `binary` line there.
- Next 16 keeps a versioned Turbopack dev cache in `apps/landing/.next/dev`; deleting it is safe.
- Git Bash doesn't pass `TZ` through to Node (`TZ=UTC node ...` still runs in the host zone). Set
  it from PowerShell (`$env:TZ = "UTC"`) to run something under another zone. The Vitest config
  doesn't depend on this: Node applies `process.env.TZ` when it is assigned at runtime.
