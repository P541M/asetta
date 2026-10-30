# apps/web: the Asetta platform (asetta.me)

Students upload course outlines, Gemini extracts the assessments, and they track due dates, grades and notes per semester. Next.js 15 (Pages Router), React 19, TypeScript strict, Tailwind v4 + shadcn/ui, Firebase Auth + Firestore, firebase-admin on the server, Nodemailer over Gmail.

**Read `standards.md` before writing or changing any code.** It is the source of truth for code norms and the UI system; code that conflicts with it is wrong. Commands, the verification loop, git and the writing rules are in the root `CLAUDE.md`.

## Where things live (`src/`)

- `pages/`: thin route files; `pages/api/`: server routes (`upload`, `welcome-email`, `notification-email/verify` and `confirm`, `cron/notifications`, `dev/email-preview`)
- `components/`: markup, by feature; `components/ui/`: shadcn primitives (lowercase) and shared app components
- `hooks/`: client Firestore reads and writes; `lib/`: Firebase setup (`firebase.ts` for the app and Auth, `firestore.ts` for `db`, kept out of `_app`), server logic (email, notifications, upload)
- `utils/`: pure functions; `constants/`, `contexts/`, `types/`; `styles/globals.css`: theme tokens and Tailwind config
- `contexts/AuthContext.tsx`: the signed-in user and the live user doc (`hooks/useUserDoc.ts`, which loads `hooks/userDocListener.ts` on sign-in); the dashboard's assessments are one live listener (`hooks/useSemesterAssessments.ts`); its tabs are `next/dynamic` chunks (`components/pages/dashboard-tabs/`)
- Tests: `*.test.ts` next to the module they cover; shared fixtures in `test/`; the Firestore rules suite in `rules/`
- Outside `src/`: `vercel.json` (the daily backstop cron, function limits); `vitest.config.ts`; `firestore.rules` and `.github/workflows/reminders.yml` (the 30-minute reminder schedule) at the repo root

## Verifying

- Run the verification loop (root `CLAUDE.md`); check UI changes in both themes and at mobile width.
- `npm test` runs the Vitest suites in two time zones. How to write tests, and how known bugs are marked, is under "Testing" in `standards.md`.
- Never call `/api/cron/notifications` locally with the real `CRON_SECRET`: it reads production data and sends real emails. Test API routes against the emulators; see `docs/ops.md`.
