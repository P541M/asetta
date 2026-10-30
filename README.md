# Asetta

AI-powered academic planner for students that turns course outlines into organized assessment
trackers with automatic deadline extraction. Built with Next.js, React, TypeScript and Firebase,
it features weighted grade calculations, email reminders, calendar export, and real-time sync
across devices.

## Features

- **AI-powered extraction**: upload a course syllabus and Google Gemini extracts every assessment, due date and weight
- **Assessment tracking**: status tracking (Not started, In progress, Submitted, Missed) and rich-text notes
- **Course color-coding**: give every course its own color with a custom picker (any hex, plus curated presets); subtle dots keep courses recognizable across the assessments, courses and grades views
- **Grade calculator**: weighted grades per course with auto-save and target grade tracking
- **Calendar**: a calendar view with ICS export to Google Calendar, Outlook or Apple Calendar
- **Reminders**: email notifications for upcoming deadlines with customizable timing
- **Multi-semester support**: organize assessments across semesters and courses
- **Light, dark or system theme**
- **Real-time sync** across devices through Firestore

## Repository layout

This is an npm workspaces monorepo with two independent Next.js apps, each deployed as its own
Vercel project. They link to each other by URL only and share no code.

| Path           | App                          | Domain        | Stack                                                       |
| -------------- | ---------------------------- | ------------- | ----------------------------------------------------------- |
| `apps/web`     | The platform                 | asetta.me     | Next.js 15 (Pages Router), React 19, Tailwind v4, shadcn/ui, Firebase Auth and Firestore, Gemini 2.5 Flash, Nodemailer |
| `apps/landing` | The marketing site           | www.asetta.me | Next.js 16 (Pages Router), React 19, Tailwind v4, Motion, Nodemailer |

Other files at the root:

- `docs/AUDIT.md`: the work tracker (open items, batch order, latest baseline); `docs/AUDIT-archive.md` keeps done items and the session log.
- `docs/ops.md`: deploys, the reminder cron, environment variables, Firestore rules, dependency notes.
- `firestore.rules`, `firebase.json`, `.firebaserc`: Firestore security rules and the Firebase CLI config.
- `.github/workflows/ci.yml`: the CI job for both apps.
- `.github/workflows/reminders.yml`: calls the reminder endpoint every 30 minutes.
- `CLAUDE.md` and each app's `CLAUDE.md`: rules for AI coding agents, including the writing rules (`apps/web/standards.md` holds the platform's code and design standards). `AGENTS.md` points other agent tools there.
- `scripts/check-copy.mjs`: the copy check (`npm run check:copy`).

## Getting started

### Prerequisites

- Node.js 22
- A Firebase project with Firestore and Authentication enabled
- A Google AI API key (for Gemini)
- A Gmail account with an app password (for email)

### Install

```bash
git clone https://github.com/P541M/asetta.git
cd asetta
npm install
```

Run every npm command from the repository root. There is one lockfile, at the root.

### Environment variables

Each app reads its own `.env.local` (`apps/web/.env.local`, `apps/landing/.env.local`). The variables, what uses each one and where production values live are in the matrix in `docs/ops.md` ("Environment variables").

### Development

```bash
npm run dev:web        # the platform on http://localhost:3000
npm run dev:landing    # the marketing site (3001 if the platform is already running)
```

### Checks

The full command list and the verification loop (lint, format, copy check, typecheck, tests, build) are in `CLAUDE.md`. CI runs the same loop.

## Deployment and CI

- **Deploys**: two Vercel projects, `asetta` (`apps/web`) and `asetta-landing` (`apps/landing`), both connected to this repository. A push to `main` deploys both to production; other branches get preview deployments with their own URLs. Details in `docs/ops.md`.
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) runs one job, `verify`, on every push to `main` and every pull request: install, then the verification loop from `CLAUDE.md`. The build uses harmless placeholder Firebase values; real credentials stay in Vercel.
- **Reminders**: GitHub Actions (`.github/workflows/reminders.yml`) calls `/api/cron/notifications` every 30 minutes with the `CRON_SECRET` repository secret, so reminders go out at 9:30 in each user's time zone; the daily Vercel cron in `apps/web/vercel.json` is the backstop. Details in `docs/ops.md`.
- **Recommended**: protect `main` (GitHub, Settings, Branches) by requiring the "CI / verify" check, so nothing broken can be merged and auto-deployed.

## Let's connect

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:videna.psalmeleazar@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pevidena/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/P541M)
