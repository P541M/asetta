# CLAUDE.md

Asetta monorepo (npm workspaces). Two independent Next.js apps, each deployed as its own Vercel project.

## Layout

| Path            | App                                | Domain        | Rules                                                         |
| --------------- | ---------------------------------- | ------------- | ------------------------------------------------------------- |
| `apps/web`      | Platform (Next.js 15, Firebase)    | asetta.me     | `apps/web/CLAUDE.md` and `apps/web/standards.md` (required)   |
| `apps/landing`  | Marketing site (Next.js 16)        | www.asetta.me | `apps/landing/CLAUDE.md`                                      |

The platform moves to `app.asetta.me` and the marketing site to `asetta.me` (D13, A98); until that ships, the domains above are live.

## Read order

1. This file.
2. The app's `CLAUDE.md` (`apps/web/CLAUDE.md` or `apps/landing/CLAUDE.md`).
3. `apps/web/standards.md`, before any change in the platform.
4. `docs/AUDIT.md`, when picking up work.
5. `docs/ops.md`, for deploys, the cron, env vars, Firestore rules and npm.

## Doc map

Each fact has one home. Link to it; don't restate it.

| Doc                      | Holds                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `README.md`              | For humans: what Asetta is, layout, first-time setup.                                       |
| `CLAUDE.md`              | This file: layout, commands, the verification loop, cross-app links, global and writing rules. |
| `AGENTS.md`              | Points other agent tools to this file.                                                      |
| `apps/web/CLAUDE.md`     | Platform: where things live, how to verify a UI change.                                     |
| `apps/web/standards.md`  | Platform code and UI rules. The source of truth for how platform code is written.          |
| `apps/landing/CLAUDE.md` | Marketing site: stack, structure and design system.                                         |
| `docs/AUDIT.md`          | The work tracker: open items with permanent IDs, the batch order, the latest baseline numbers. Read it before starting a batch; update it before ending a session. |
| `docs/AUDIT-archive.md`  | Done items in full, answered decisions, past baselines and the session log. Read it when you need history. |
| `docs/ops.md`            | Vercel projects, the reminder cron, the env matrix, Firestore rules deploy, the `npm audit` policy, npm workspace and Windows gotchas. |
| `docs/superpowers/`      | In-flight plans and specs only; the folder exists only while something is in flight. Delete them in the PR that ships the work; the rules they produce go into the rules files. |
| `.github/workflows/ci.yml` | One CI job covering both apps: the verification loop.                                     |
| `.github/workflows/reminders.yml` | Calls the reminder endpoint every 30 minutes (needs the `CRON_SECRET` Actions secret; `docs/ops.md`). |

Rules belong in the CLAUDE files and `apps/web/standards.md`; history belongs in `docs/AUDIT-archive.md` and git.

## Commands (run from the repo root)

```bash
npm install            # one root lockfile; never add per-app lockfiles
npm run dev:web        # platform on localhost:3000 (`/` redirects to `/login` in development)
npm run dev:landing    # marketing site (moves to 3001 if web is already running)
npm run build          # build both apps
npm run lint           # lint both apps
npm run format:check   # Prettier check, both apps
npm run check:copy     # no em dash or emoji in any tracked text file (see Writing)
npm run typecheck      # tsc for apps/web
npm test               # Vitest unit tests for apps/web
npm run test:rules     # Firestore rules suite on the emulator (Java; see docs/ops.md)
```

Add a dependency to one app with `npm install <pkg> -w apps/web` (or `-w apps/landing`); run an app's own script with `npm run <script> -w apps/web` (for example `npm run format -w apps/web` to write Prettier fixes). Each app pins its own `next` and `eslint-config-next`. Both apps must share one `react`/`react-dom` version, because hoisted packages resolve React from the root. npm's workspace flags have traps; read `docs/ops.md` before updating dependencies.

## Verification loop

Every task, both apps, before work is called done:

```bash
npm run lint && npm run format:check && npm run check:copy && npm run typecheck && npm test && npm run build
```

All six green. CI runs the same steps. Also run `npm run test:rules` after any change to `firestore.rules` or to a client write, and check UI changes in both themes and at mobile width.

## Cross-app links

The apps link to each other by URL only; no shared code.
- `apps/landing/src/lib/site.ts`: `APP_URL` (`https://asetta.me`). Login/register links and the `/login` and `/register` redirects in `apps/landing/next.config.ts` point here.
- `apps/web/next.config.ts`: redirects `/terms`, `/privacy` (and `/legal/*`) to `https://www.asetta.me`, and `/` too in a production build (`VERCEL_ENV`; previews and dev go to `/login`, `docs/ops.md`).

Change one side and you probably need to change the other.

## Rules

- **Git: never commit, push or open a PR unless the founder says so for that specific task.** Make the file changes and leave git to the founder, who controls commit messages and deploy timing (a push to `main` deploys to production).
- **This repo is the only Asetta codebase.** Never reference, read from, or copy from another folder on the machine. Docs and config use repo-relative paths, never absolute machine paths.
- **On the Windows dev machine, stop every dev server before any `npm install` or build**; file locks cause EPERM failures. More machine gotchas in `docs/ops.md`.

## Writing

These apply to everything written in this repo or about it: UI copy, emails, docs, code comments, log messages, commit messages, PR descriptions and agent replies. `npm run check:copy` enforces rules 1 and 2.

1. **No em dashes** (U+2014), anywhere. Use a comma, colon, semicolon, parentheses, a period or a plain hyphen. Write ranges in words ("1 to 30 days").
2. **No emojis.** The one exception is a test fixture that tests how the code handles emoji in user text (the files are listed in `scripts/check-copy.mjs`).
3. **Plain, direct English.** Sentence case for headings, buttons and labels. No exclamation marks in UI copy. Never use: delve, tapestry, seamless, elevate, robust, unlock, leverage, utilize, comprehensive, streamline, empower, effortless, cutting-edge, next-generation, blazing fast, "crafted with care", "dive into", "Let's get started!", "it's worth noting", "in today's fast-paced world". Don't call Asetta "modern".
4. **Comments say why, never what.** No `// increment the counter` over `count++`, no `// imports` at the top of a file. Comment a constraint the code can't show: pdf-parse misreading a pooled `Buffer` (`lib/upload/pdfText.ts`), Gmail stripping `<style>`, Safari moving focus to a clicked button's ancestor.
5. **No placeholders.** No `// TODO: implement`, `// ... rest of code`, lorem ipsum, made-up assessments or grades shown as real data, or a stub that returns a hardcoded value without saying so.
6. **No history in code or rules.** No `// updated to fix the bug`, `// new implementation`, version stamps or dates in comments, and no tracker IDs in comments or rule text. Git and `docs/AUDIT-archive.md` hold history. A test for a bug that is still open names its item (`it.fails("A<n>: ...")`; `standards.md`, Testing).
7. **Replies and commit messages lead with the result.** Say what changed, what was verified and what wasn't. Commit subjects are short and imperative ("Save the target grade on leave"). No praise of the question, no "I hope this helps", no recap of what the reader just said.
