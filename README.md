# Asetta

AI-powered academic planner for students that transforms course outlines into organized assessment trackers with automatic deadline extraction. Built with Next.js 15, React, TypeScript, and Firebase, it features weighted grade calculations, email reminders, calendar export, and real-time sync across devices.

## Features

- **AI-Powered Extraction** - Upload course syllabi and automatically extract all assessments, due dates, and weights using Google Gemini
- **Assessment Tracking** - Manage assignments with status tracking (Not Started, In Progress, Submitted, Missed) and rich-text notes
- **Grade Calculator** - Calculate weighted grades per course with auto-save and target grade tracking
- **Calendar Integration** - Visual calendar view with drag-and-drop and ICS export to Google Calendar, Outlook, or Apple Calendar
- **Automated Reminders** - Email notifications for upcoming deadlines with customizable timing
- **Multi-Semester Support** - Organize assessments across multiple semesters and courses
- **Dark Mode** - Full dark theme with system preference detection
- **Real-time Sync** - Firebase-powered synchronization across devices

## Tech Stack

**Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Tiptap

**Backend:** Firebase Authentication, Firestore, Storage

**AI:** Google Gemini 2.5 Flash

**Email:** Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore and Authentication enabled
- Google AI API key (for Gemini)

### Installation

```bash
git clone https://github.com/P541M/asetta.git
cd asetta
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (complete service account JSON as a single line)
FIREBASE_SERVICE_ACCOUNT=

# Google Gemini
GEMINI_API_KEY=

# Email (Gmail via Nodemailer)
EMAIL_USER=
EMAIL_APP_PASSWORD=

# Vercel Cron auth token for /api/cron/notifications
CRON_SECRET=

# Application URL (used in email links)
NEXT_PUBLIC_APP_URL=
```

See `.env.example` for the same list with placeholder values.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production

```bash
npm run build
npm start
```

## Let's Connect!

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:videna.psalmeleazar@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pevidena/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/P541M)

---

*Built for students, by a student*