# Product

<!-- impeccable:product-schema 1 -->

Product context for both apps, read by the Impeccable design skill (`.claude/skills/impeccable`).
It holds product facts only; the platform's UI rules are in `apps/web/standards.md`, the marketing
site's in `apps/landing/CLAUDE.md`.

## Platform

web

## Users

Post-secondary students (university and college) in any country. A student takes several courses
a term, each with a course outline (syllabus) that lists the assessments, their due dates and
their weights. Their job: know what is due next, never miss a deadline, and know where their grade
stands and what they need on what is left.

They set up a term on a laptop (uploading outlines, correcting what was extracted, writing notes)
and check on a phone (what is due this week, a grade after a mark comes back). Both devices matter
equally; the phone is where the quick checks happen.

## Product Purpose

Asetta turns course outlines into an organized assessment tracker. A student uploads their
outlines, AI (Google Gemini) extracts every assessment with its due date and weight, and the
student tracks status, marks, notes and deadlines per course and per semester. Success is a
student who never misses a deadline and always knows their standing, without copying anything by
hand.

## Positioning

Free for students. Setup is an upload, not data entry: the outline does the work. The marketing
site sells it; the platform is a daily tool students open many times a term.

## Operating Context

- Terms of about four months, several courses each; students keep past semesters.
- Outlines arrive as PDFs at the start of term; extraction can be wrong, so every extracted value
  is editable and a date the AI could not read is flagged for review.
- Reminders arrive by email at about 9:30 AM in the student's time zone; the calendar exports to
  Google Calendar, Outlook and Apple Calendar (ICS).
- Students use Windows and macOS laptops and iOS and Android phones.

## Capabilities and Constraints

- Platform (`apps/web`, asetta.me): sign up and sign in (email and password, Google), onboarding,
  semesters, upload and extraction (up to 20 outlines a day per account), assessments (status:
  Not started, In progress, Submitted, Missed), courses with a color each, a calendar with ICS
  export, a grade calculator with a target grade, rich-text notes per assessment, email
  reminders, Settings, light, dark or system theme.
- Marketing site (`apps/landing`, www.asetta.me): home, features, about, contact, privacy and
  terms; every sign-up and login goes to the platform. Light theme only.
- Operated from Ontario, Canada (PIPEDA); users must be 13 or older.

## Brand Commitments

- Name: Asetta. Tagline: "Always ahead, never behind." (the only slogan).
- Amber is the brand color in both themes; its exact values and where it is used are open to
  change.
- Voice: plain, direct English in sentence case, no exclamation marks in UI copy, no em dashes, no
  emoji, no salesy qualifiers (root `CLAUDE.md`, "Writing").

## Evidence on Hand

- Product screenshots: `apps/landing/public/images/Light_Prev.png` and `Dark_Prev.png`; feature
  GIFs in `apps/landing/public/images/features/`.
- The logo: `apps/landing/public/images/Asetta_Logo.svg`.
- No testimonials, user counts, press or university partnerships exist. Never invent them.

## Product Principles

- The outline does the work: anything a student would otherwise type is extracted, then easy to
  correct.
- What is due next is never more than a glance away, on any device.
- Calm over loud: a tool opened daily stays quiet; the marketing site may persuade, the platform
  never sells.
- Trust the numbers: grades, weights and dates are shown exactly, and anything uncertain is
  flagged, never guessed silently.

## Accessibility & Inclusion

WCAG 2.2 AA on every screen of both apps: contrast, keyboard use, screen
readers, target size and reduced motion.
