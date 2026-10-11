# apps/web: the Asetta platform (asetta.me)

Students upload course outlines, Gemini extracts the assessments, and they track due dates, grades and notes per semester. Next.js 15 (Pages Router), React 19, TypeScript strict, Tailwind v4 + shadcn/ui, Firebase Auth + Firestore, firebase-admin on the server, Nodemailer over Gmail.

**Read `standards.md` before writing or changing any code.** It is the source of truth for code norms and the UI system; code that conflicts with it is wrong. Global rules (git, copy) are in the root `CLAUDE.md`.

## Commands (from the repo root)

- `npm run dev:web` (localhost:3000; `/` redirects to `/login` in development)
- `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run build` (the verification loop in `standards.md`)
- `npm run format -w apps/web` to write Prettier fixes; `npm install <pkg> -w apps/web` to add a dependency

## Where things live (`src/`)

- `pages/`: thin route files; `pages/api/`: server routes (`upload`, `welcome-email`, `cron/notifications`, `dev/email-preview`)
- `components/`: markup, by feature; `components/ui/`: shadcn primitives (lowercase) and shared app components
- `hooks/`: client Firestore reads and writes; `lib/`: Firebase setup, server logic (email, notifications, upload)
- `utils/`: pure functions; `constants/`, `contexts/`, `types/`; `styles/globals.css`: theme tokens and Tailwind config
- Tests: `*.test.ts` next to the module they cover; shared fixtures in `test/`
- Outside `src/`: `vercel.json` (cron, function limits); `vitest.config.ts`; `firestore.rules` at the repo root

## Verifying

- Run the verification loop from `standards.md` and check UI changes in both themes and at mobile width.
- `npm test` runs the Vitest suites in two time zones. How to write tests, and how known bugs are marked (`it.fails` with the `docs/AUDIT.md` ID), is under "Testing" in `standards.md`.
- Never call `/api/cron/notifications` locally with the real `CRON_SECRET`: it reads production data and sends real emails. Test API routes against the emulators; see `docs/ops.md`.
