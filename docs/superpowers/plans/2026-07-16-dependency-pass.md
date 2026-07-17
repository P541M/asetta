# Dependency vulnerability pass — 2026-07-16

Record of the phased npm-audit cleanup that followed the UI housekeeping revamp, plus the plan
for the one remaining phase. Starting point: `npm audit` reported **31 vulnerabilities
(4 low, 14 moderate, 8 high, 5 critical)**. Current state after phases 1–2: **9 moderate,
0 low/high/critical** — and the 9 that remain are all understood and intentionally deferred
(see "Remaining findings").

Reading audit numbers: npm counts one entry per affected *package*, not per root cause — a
single issue in a deep dependency counts once for itself and once for every package depending
on it. 8 of the 9 remaining entries are one uuid issue counted down the firebase-admin chain.

---

## Phase 1 — `npm audit fix` (done, pushed 2026-07-16)

- Two passes of plain `npm audit fix` (the second pass caught `brace-expansion`); 31 → 11.
- Lockfile-only: every update landed within existing `package.json` ranges.
- Covered: the ESLint/dev-tooling chain (never ships to production), the firebase-admin parsing
  stack (`protobufjs`, `fast-xml-parser`, `@grpc/grpc-js`, `node-forge`, `jws`, `form-data`),
  `websocket-driver` (Firebase client realtime), Tiptap's `markdown-it`/`linkify-it`,
  `formidable`, and nodemailer 7.0.3 → 7.0.13 (partial — see phase 2).

## Phase 2 — Next 15.5 + nodemailer 9 (done 2026-07-16)

- `next` 15.1.11 → **15.5.20** and `eslint-config-next` to match, both pinned exact (repo
  convention). Cleared the entire ~20-advisory critical rollup. Shared first-load JS shrank
  236 → 218 kB as a side effect.
- `nodemailer` ^7 → **^9.0.3** (major bump). No code changes needed: `src/lib/email.ts` uses
  only `createTransport({ service: "gmail", auth })` + `sendMail` with `from/to/subject/text/
  html` — none of the advisory surfaces (`envelope.size`, transport `name`, `List-*` headers,
  `jsonTransport`, `raw`, OAuth2).
- **Upgrade fallout fixed:** Next 15.5 type-checks Pages Router API route `config` exports and
  rejected `src/pages/api/cron/notifications.ts`'s `export const config = { regions: ["iad1"] }`.
  Deleted as a long-standing no-op: `regions` was never a valid config key for Node Pages Router
  routes (Next silently ignored it pre-15.5), so the cron has always run in the Vercel project's
  default region and its behavior is unchanged. Real function config (memory, maxDuration) lives
  in `vercel.json`; region pinning, if ever wanted, belongs in Vercel project settings.
- Verified: full loop green; dev server boot-checked on Turbopack (`/login`, `/dashboard` → 200).

## Remaining findings (9 moderate) — accepted for now

| Finding | Why it remains |
| --- | --- |
| `uuid` <11.1.1 (GHSA-w5hq-g745-h8pq) + 7 chain entries (`gaxios`, `google-gax`, `@google-cloud/firestore`, `@google-cloud/storage`, `teeny-request`, `retry-request`, `firebase-admin`) | One buffer bounds-check edge case in uuid v3/v5/v6, counted down the firebase-admin dependency chain. Full fix requires `firebase-admin@14` (breaking major) — phase 3 below. |
| `postcss` <8.5.10 inside `node_modules/next/node_modules` | Next pins its own internal postcss copy; not fixable downstream (npm's "fix" suggestion is a downgrade to Next 9). Build-time only, processes our own CSS — noise until a Next patch bumps it. |

## Phase 3 — `firebase-admin` 13 → 14 (planned, not started)

Scope: clears the 8 uuid-chain moderates. `firebase-admin` is server-only here, wrapped in
`src/lib/firebase-admin.ts` (`getAdmin()`), consumed by exactly two paths:
`src/pages/api/upload.ts` (auth token verification for uploads) and `src/lib/notifications.ts`
(the 9 PM cron).

**Done 2026-07-17** (after a one-day pause: `firebase-admin@14` declares `engines.node >=22`,
so the dev machine moved from Node 20.13.1 to 22.23.1 via nvm-windows first). Two surprises
surfaced during execution, both handled:

1. **v14 removed the legacy namespaced API** ("no code changes expected" was wrong).
   `src/lib/firebase-admin.ts` was rewritten on the modular API (`initializeApp`/`getApps`/
   `cert`/`applicationDefault` from `firebase-admin/app`; `getAdmin()` still returns the app,
   init-once semantics unchanged); consumers now call `getAuth(app).verifyIdToken` and
   `getFirestore(app)`; `types/assessment.ts` swapped the deleted global
   `FirebaseFirestore.Timestamp` for a type-only import of the **client** SDK's `Timestamp`
   (more accurate — client components are what read those fields; erased at runtime).
2. **The uuid chain did not clear as npm originally promised.** The advisory range widened
   after the phase was planned: even v14's newest `@google-cloud/storage` still pins
   `teeny-request`/`gaxios` with uuid <11.1.1 internally (npm's "fix" suggestion degenerated
   to a firebase-admin *downgrade*). The remaining entries are **upstream-blocked on Google**
   — they will clear via ordinary `npm audit fix`/`npm update` once Google ships bumped deps.
   v14 still cleared the Firestore/google-gax branch (2 entries) and is the right resting
   place: current major, Node-22-aligned.

`package.json` also gained `"engines": { "node": "22.x" }` so Vercel builds/runs on Node 22
regardless of the dashboard setting, and local installs on the wrong Node warn loudly.

Verified: full loop green; dev-server smoke check — `/api/cron/notifications` without the
bearer header → 401 and `/api/upload` GET → 405, proving the v14 modules load in the server
runtime under Node 22 (never invoke the cron locally WITH the header against production data;
it sends real emails — QA it via Vercel's scheduled-run function logs).

## Final state (pass complete)

**8 moderate, 0 low/high/critical — none actionable downstream:**

- 6 entries: the uuid <11.1.1 chain under firebase-admin (upstream-blocked on Google, above).
- 2 entries: `postcss` pinned inside `next`'s own node_modules (+ `next` flagged for depending
  on it) — build-time only, waits for a Next patch.

Re-check with `npm audit` occasionally (any future npm work will surface it); both residuals
should clear from upstream releases without local intervention beyond `npm update`.

## Ops notes

- **`next lint` is deprecated as of Next 15.5** (removed in Next 16). It still works and the
  verification loop is unchanged; when it's time, the migration is
  `npx @next/codemod@canary next-lint-to-eslint-cli .` — do it as its own small commit.
- On this Windows dev machine, stop the dev server before any `npm install`/`node_modules`
  operation or `next build` (file locks cause EPERM failures; check `Get-Process node`).
- After pulling a commit that touches `package.json`, run `npm install` on other machines.
  Vercel installs fresh per deploy automatically.
