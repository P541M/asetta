# Backlog

## Platform (`apps/web`)

- Verify custom notification email with a confirm link before sending; until verified, fall back to the Auth email.
  - Context: the reminder cron (`apps/web/src/lib/notifications.ts`) sends to the `email` field on the user doc, which the user sets freely in onboarding and Settings. Firestore rules let owners write any fields on their own doc, so today a user can point reminders at someone else's address.
