# CLAUDE.md

Asetta monorepo (npm workspaces). Two independent Next.js apps, each deployed as its own Vercel project.

## Layout

| Path            | App                                | Domain        | Rules                                                         |
| --------------- | ---------------------------------- | ------------- | ------------------------------------------------------------- |
| `apps/web`      | Platform (Next.js 15, Firebase)    | asetta.me     | `apps/web/CLAUDE.md` and `apps/web/standards.md` (required)   |
| `apps/landing`  | Marketing site (Next.js 16)        | www.asetta.me | `apps/landing/CLAUDE.md`                                      |

- `docs/superpowers/`: in-flight plans and specs only. Delete them in the PR that ships the work; git history keeps them, and the rules they produce go into the app's rules files.
- `docs/AUDIT.md`: the work tracker (checklist with permanent IDs, open decisions, session log). Read it before starting a batch; update it before ending a session.
- `.github/workflows/ci.yml`: one CI job covering both apps.
- Before working in an app, read its rules files. They are the source of truth for that app.

## Commands (run from the repo root)

```bash
npm install            # one root lockfile; never add per-app lockfiles
npm run dev:web        # platform on localhost:3000
npm run dev:landing    # marketing site (moves to 3001 if web is already running)
npm run build          # build both apps
npm run lint           # lint both apps
npm run format:check   # Prettier check, both apps
npm run typecheck      # tsc for apps/web
```

Add a dependency to one app with `npm install <pkg> -w apps/web` (or `-w apps/landing`). Each app pins its own `next` and `eslint-config-next`. Both apps must share one `react`/`react-dom` version, because hoisted packages resolve React from the root.

## Cross-app links

The apps link to each other by URL only; no shared code.
- `apps/landing/src/lib/site.ts`: `APP_URL` (`https://asetta.me`). Login/register links and the `/login` and `/register` redirects in `apps/landing/next.config.ts` point here.
- `apps/web/next.config.ts`: production redirects `/`, `/terms`, `/privacy` (and `/legal/*`) to `https://www.asetta.me`.

Change one side and you probably need to change the other.

## Rules

- **No em dashes in copy, in either app.** Use commas, periods, or semicolons. Founder rule.
- **This repo is the only Asetta codebase.** Never reference, read from, or copy from another folder on the machine. Docs and config use repo-relative paths, never absolute machine paths.
- Git: the user handles commits and pushes unless they say otherwise for a specific task (see `apps/web/CLAUDE.md`).
