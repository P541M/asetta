# CLAUDE.md

Asetta monorepo (npm workspaces). Two independent Next.js apps, each deployed as its own Vercel project.

## Layout

| Path            | App                                | Domain        | Rules                                                         |
| --------------- | ---------------------------------- | ------------- | ------------------------------------------------------------- |
| `apps/web`      | Platform (Next.js 15, Firebase)    | asetta.me     | `apps/web/CLAUDE.md` and `apps/web/standards.md` (required)   |
| `apps/landing`  | Marketing site (Next.js 16)        | www.asetta.me | `apps/landing/CLAUDE.md`                                      |

## Read order

1. This file.
2. The app's `CLAUDE.md` (`apps/web/CLAUDE.md` or `apps/landing/CLAUDE.md`).
3. `apps/web/standards.md`, before any change in the platform.
4. `docs/AUDIT.md`, when picking up work.
5. `docs/ops.md`, for deploys, the cron, env vars, Firestore rules and npm.

## Doc map

| Doc                      | Holds                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `README.md`              | For humans: what Asetta is, layout, setup, env, deploy and CI.                              |
| `CLAUDE.md`              | This file: layout, root commands, cross-app links, global rules.                            |
| `apps/web/CLAUDE.md`     | Platform: commands, where things live, how to verify.                                       |
| `apps/web/standards.md`  | Platform code and UI standards. The source of truth for how platform code is written.      |
| `apps/landing/CLAUDE.md` | Marketing site: stack, structure and design system.                                         |
| `docs/AUDIT.md`          | The work tracker: checklist with permanent IDs, open decisions, session log. Read it before starting a batch; update it before ending a session. |
| `docs/ops.md`            | Vercel projects, the reminder cron, the env matrix, Firestore rules deploy, the `npm audit` policy, npm workspace and Windows gotchas. |
| `docs/superpowers/`      | In-flight plans and specs only; the folder exists only while something is in flight. Delete them in the PR that ships the work; git history keeps them, and the rules they produce go into the app's rules files. |
| `.github/workflows/ci.yml` | One CI job covering both apps.                                                            |
| `.github/workflows/reminders.yml` | Calls the reminder endpoint every 30 minutes (needs the `CRON_SECRET` Actions secret; `docs/ops.md`). |

Rules belong in the CLAUDE files and `apps/web/standards.md`; history belongs in the `docs/AUDIT.md` session log and git.

## Commands (run from the repo root)

```bash
npm install            # one root lockfile; never add per-app lockfiles
npm run dev:web        # platform on localhost:3000
npm run dev:landing    # marketing site (moves to 3001 if web is already running)
npm run build          # build both apps
npm run lint           # lint both apps
npm run format:check   # Prettier check, both apps
npm run typecheck      # tsc for apps/web
npm test               # Vitest unit tests for apps/web
npm run test:rules     # Firestore rules suite on the emulator (Java; see docs/ops.md)
```

Add a dependency to one app with `npm install <pkg> -w apps/web` (or `-w apps/landing`); run an app's own script with `npm run <script> -w apps/web`. Each app pins its own `next` and `eslint-config-next`. Both apps must share one `react`/`react-dom` version, because hoisted packages resolve React from the root. npm's workspace flags have traps; read `docs/ops.md` before updating dependencies.

## Cross-app links

The apps link to each other by URL only; no shared code.
- `apps/landing/src/lib/site.ts`: `APP_URL` (`https://asetta.me`). Login/register links and the `/login` and `/register` redirects in `apps/landing/next.config.ts` point here.
- `apps/web/next.config.ts`: production redirects `/`, `/terms`, `/privacy` (and `/legal/*`) to `https://www.asetta.me`.

Change one side and you probably need to change the other.

## Rules

- **Git: never commit, push or open a PR unless the founder says so for that specific task.** Make the file changes and leave git to the founder, who controls commit messages and deploy timing (a push to `main` deploys to production).
- **No em dashes in copy, in either app.** Use commas, periods, or semicolons. Founder rule.
- **This repo is the only Asetta codebase.** Never reference, read from, or copy from another folder on the machine. Docs and config use repo-relative paths, never absolute machine paths.
- **On the Windows dev machine, stop every dev server before any `npm install` or build**; file locks cause EPERM failures. More machine gotchas in `docs/ops.md`.
