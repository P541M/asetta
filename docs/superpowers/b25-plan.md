# B25: what's left

The founder approved B25's plan on 2026-11-01: five PRs, in this order: upload; auth and user doc; dashboard shell, table and semesters; calendar and grades; reminders. PR 1 (upload) is PR #33. PR 2 (auth and user doc) added this file. Each remaining PR gets its own new top-level session, which starts from this file and `docs/AUDIT.md`. The last B25 PR deletes it.

Every PR: test first on today's behavior; before and after for each candidate in the session log; lines, files and First Load JS against the Baseline; `/simplify` and `/code-review`; `npm run test:rules` for PRs 2 to 4.

## PR 3: dashboard shell, table and semesters (A22's table, the rest of A23, A130, A95)

Test first: `sortAssessments` and `daysTillDue` in `utils/semesterAssessments.ts` (legacy statuses as they are; A82 owns those), `notesToSave(html)`, `nextSemesterOrder`, `semesterNameTaken`, `tabFromRoute(tabQuery, pathname)`.

- Table, `AssessmentsTable` 439 to about 200 lines, split along A116's lines: writes to `hooks/useAssessmentWrites.ts` (status, edit save, notes, delete one, add from `AddAssessmentForm`, and bulk delete and bulk status each as one `writeBatch` with an inline error on failure). Drop the `localAssessments` mirror and the hand-written optimistic updates, because the live listener shows a local write at once and Firestore reverts a refused one. Add `tables/assessments/FilterMenu.tsx` and `tables/assessments/useRowSelection.ts`, keep the two delete dialogs together, and use `cn()` in `TableHeader`.
- Semesters: `hooks/semesterWrites.ts` holds add (max `order` + 1, shared by `SemesterTabs` and onboarding's `SemesterStep`), rename, reorder and delete. Delete also removes the semester's `coursePreferences` (the rules allow it; extend the rules suite's case). The five `alert()`s become an inline destructive alert in Manage semesters, with duplicate names under the input. A130: delete `Semester.order`.
- Shell: one tab list and `tabFromRoute`, used by `TabProvider` and `UnifiedDashboardPage`. The six `[semester]/*` route files become one-line re-exports, and the `forceSemesterId` prop goes. `DashboardHeader` signs out itself (the handler is duplicated in `DashboardLayout` and `settings.tsx`). `pages/dashboard.tsx`: the `redirecting` state becomes a ref.
- A95: in `apps/web/eslint.config.mjs`, `@typescript-eslint/no-restricted-imports` at error level on `src/components/**`, `src/contexts/**` and `src/pages/**`: no `firebase/firestore` (type imports allowed), no `lib/firestore`, no `lib/firebaseUtils`. Add `scripts/check-lines.mjs` and `npm run check:lines`, listing non-test source files over 300 lines in both apps; in CI a step prints them as GitHub warnings and never fails. `standards.md` names both checks; the root `CLAUDE.md` lists the command.

## PR 4: calendar and grades (A22's calendar for A118; one preferences listener for A119)

- Calendar, `CalendarView` 301 to about 130 lines. Test first: `localDateKey(date)` in `utils/dateUtils.ts` (replaces `formatDateForComparison`; `getTodayDateString` uses it), and `monthDays(month, today)`, `assessmentsByDay` and the search and status filter in `utils/calendar.ts`. Derive the grid with `useMemo`. Add `calendar/CalendarToolbar.tsx`. The day detail uses `formatLocalDateTime` (visible: the viewer's locale and "9:30 AM", not "09:30 AM").
- Grades: `useCourseColors` becomes `useCoursePreferences(user, semesterId)`, the one live listener on the semester's `coursePreferences`, now also returning target grades and `setTargetGrade`. Test first: reading a target grade and a color from a doc. `GradeCalculator` gets the saved target through `DashboardData`; the per-course `getDoc` hook goes. Visible: no spinner on a course switch, a target saved elsewhere shows live, a failed save shows an inline alert above the calculator, and a failed read shows the calculator with the default 85.

## PR 5: reminders (server only)

- Test first: `reminderPreferences(userData)` in `lib/reminderCron.ts`, on today's `validateNotificationPreferences` plus `activePreferences`. Then replace those two.
- Split `lib/notifications.ts` (573): the run stays; `processUser`, `reminderAddress`, `readAssessments` and `sendReminder` move to `lib/reminderSend.ts`.
- A64 only if the founder confirms the marker's `finishedAt`.
- Check: tests, and one cron run on the emulators, never production. This PR deletes `docs/superpowers/b25-plan.md` if it is the last of B25.

## Dropped, with reasons

- The target-grade draft and its mirrored ref: the ref is how an unmount saves a draft still being typed.
- `OnboardingContext`'s reducer: A114 reshapes it.
- Splitting `UnifiedDashboardPage`: 146 lines today.
- The five tab panels as a map: different props, and A115 reorders them.
- The stat tiles: A109 removes them.
- A131: not one of A94's candidates.

## B25 is done when

Every area has been reviewed, each simplification has shipped or been dropped with a reason, A22, A23, A83 and A94 are done, A95's lint rule is on with zero warnings, and tests and page sizes are no worse than the Baseline.
