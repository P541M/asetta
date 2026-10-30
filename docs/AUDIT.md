# Asetta work tracker

Open work for both apps, the order to do it in, and the latest baseline numbers. Done items in full,
answered decisions, past baselines and the session log are in `docs/AUDIT-archive.md`.

## How to use this file

**Starting a session** (paste this):

```
Read docs/AUDIT.md. Do batch B<n> (items A<x>, A<y>) only. Plan first, then implement. Tick the
items off and add a session log entry to docs/AUDIT-archive.md when done. Don't commit.
```

**Ending a session:**

1. Run the verification loop (root `CLAUDE.md`).
2. For each finished item: move its full text to "Done items" in the archive with what shipped, and leave one line under "Done" here: `- [x] A1 · Lock down /api/welcome-email · 2026-10-10, PR #5`. A partly done item stays open here, with what's left on its first line.
3. Add a session log entry at the bottom of the archive: branch, items, what changed, what's left, gotchas.
4. Update the docs the change touches: rules in the CLAUDE files or `apps/web/standards.md`; deploy, cron, env, rules and npm facts in `docs/ops.md`; the numbers under "Baseline" here.
5. Anything new you found becomes a new item with the next free ID. Don't fold it into the current batch.
6. Run `/code-review` and check the Vercel preview. The founder commits, pushes and merges.

**Rules:**

- IDs are permanent. Never renumber. New items take the next free number (**next: A104, D14**); split an item as A9a/A9b.
- Dropped items move to the archive struck through with a reason: `~~A24~~ dropped: <why>`.
- Line numbers in items drift. Search by symbol name.
- One theme per branch and PR.
- Effort is S/M/L. Risk is the risk of the fix itself (L/M/H).

## Decisions needed

Answered decisions are in the archive ("Answered decisions"); an item that depends on one says what was decided.

| ID | Question | Blocks | Answer |
| --- | --- | --- | --- |
| D12 | Students whose onboarding saved `emailNotifications: true` with `hasConsentedToNotifications: false` before B20 (A48): leave them, or set `emailNotifications: false` on those docs once? | Nothing (B20 fixed new saves) | Open. **Who:** everyone who finished onboarding (not "Skip setup") without switching email notifications on, since the switch starts off and `false || true` saved it on. **What they get today:** no reminders (the cron needs consent), but Settings shows the switch on, and the next save of the Notifications card (a timing or address change) turns reminders on without the student choosing it. **Options:** (a) leave them; (b) first count them with a read-only admin query (`emailNotifications == true` and `hasConsentedToNotifications == false`; the Settings save always writes both the same, so such a doc comes from onboarding or code older than that save), then set `emailNotifications: false` on each once, a script the founder runs or a one-time cron step like D11's: no one's reminders change, and Settings then shows what they get. **Recommended: (b), after the count.** B20 changed no existing data. |

## Batches

**Done:** B1 to B22 (PRs #5 to #28): security, tests, reminders, data layer, rules, bundle size, rate limits, cron throughput, the dashboard and grades bugs, the onboarding and notification settings, and the writing rules and docs (B21). What each shipped is in the archive.

**Up next, in order** (reprioritized 2026-10-30 from the founder's list: after the backend work, the focus moves to cleanup and UI/UX):

| Order | Batch | Items | Theme | Why here |
| --- | --- | --- | --- | --- |
| 1 | B23 | A89, A99, A100 (audit phase only) | UI/UX audit: Impeccable, Windows and macOS, mobile | Read-only. It turns "improve the UI" into a list of findings per screen, filed as new items, so B26 has a plan and B25 knows which components the UI work will touch. |
| 2 | B24 | A92, A93, A24, A47 | Cleanup sweep: test names, comments, dead code | Mechanical, no behavior change. Shrinks the code before B25 simplifies it. A47's 5-day wait ended long ago. |
| 3 | B25 | A94, A95, A21, A22, A23, A83 | Simplify and modularize | Test-first wherever logic moves. Before the UI work so each screen is restyled once, in its final files. A83 is the last stray user-doc read. Expect 2 or 3 PRs, one per area. |
| 4 | B26 | A89, A99, A100 (fixes), A66, A69 | UI/UX implementation | One screen or theme per PR, from B23's findings. A66 and A69 are UI items already on the list. |
| 5 | B27 | A96, A25, A33, A62 | Deprecated and outdated dependencies | One major per PR. `@google/generative-ai` is Google's retired SDK and runs the core feature (extraction): if it starts failing, its move to `@google/genai` jumps the queue. Do Tiptap 3 before B26 restyles the notes editor. |
| any | B28 | A98 | One domain | D13 decided: the platform moves to `app.asetta.me`. Touches only config, env and cross-app links, so it can run beside any batch. |
| any | B29 | A90, A27, A68 | Landing polish: Lenis, GIFs to video, tests | The landing shares no code with the platform, so this runs beside any batch. |
| any | | A101 (the founder reads the docs), A103, A14 (a manual check), A26, A28, A39, A40, A42, A45, A46, A49, A52, A55, A57 to A61, A63, A64, A70 to A73, A80, A81, A82, A85 | Remaining items | As time allows. Founder calls first: D12, A73, A80, A81 and A85. A64 once the D11 marker has `finishedAt`; A71 only if spam arrives. |

## Open items

### Bugs

None open outside "Backend and earlier items".

### UI/UX

- [ ] **A103 · The calendar's assessment count badge is amber** · S · risk L · UI · found during B22
  - **Where:** the count badge beside each day number in `apps/web/src/components/calendar/CalendarGrid.tsx` (`bg-primary/10 text-primary`). The same 10% amber tint is on the icon tile of the onboarding step headers (`UploadStep`, and likely the other steps).
  - **Problem:** "Surface language" in `standards.md` keeps amber for primary buttons, the logo, links, focus rings and today's date. The badge uses it as decoration, and beside today's solid amber circle (A86) it puts two ambers in today's cell.
  - **Fix:** a neutral badge (a `secondary` fill with `muted-foreground` text, for example), checked in both themes. Decide the onboarding icon tiles in A89's audit.

- [ ] **A89 · UI/UX pass with Impeccable** · L · risk M · audit first (B23), then fixes per screen (B26)
  - **Where:** every platform screen: auth pages, onboarding, the dashboard tabs (Assessments, Courses, Calendar, Grades, Upload), the notes editor, Settings and the overlays.
  - **Tool:** Impeccable, the frontend design skill set for coding agents. It is not installed in this repo (`.claude/`) or in the user's skills (checked 2026-10-30); install it into the project's `.claude/skills` first so every session has the same version, with the founder's OK.
  - **Audit (B23):** run its audit and critique per screen at desktop and 375px, both themes. File each finding as its own item (one screen or theme per item) with the screenshot path, and mark which ones conflict with a "locked" rule in `standards.md` Part 2. A conflict is the founder's call: either the rule changes in `standards.md` in the same PR, or the finding is dropped with the reason.
  - **Fixes (B26):** one screen or theme per PR, checked in both themes and at mobile width.
  - **Done when:** every screen has been audited, every finding is filed or dropped with a reason, and the fix items are done.

- [ ] **A90 · Lenis smooth scroll on the marketing site** · S · risk L
  - **Where:** `apps/landing` (`_app.tsx`, `hooks/useScrollLock.ts`, `components/LegalPage.tsx`'s "On this page" links); new dependency `lenis` (`npm install lenis -w apps/landing`).
  - **Fix:** one Lenis instance for the landing, started in `_app`. Things to handle: off under `prefers-reduced-motion` (the landing's Motion rule); `lenis.stop()` and `start()` while `useScrollLock` holds the page (the image lightbox and the mobile menu), or the page scrolls under the overlay; in-page anchor links (the legal pages' table of contents, the fixed header's offset); Motion's `whileInView` reveals still firing; the scrollbar recipe and `scrollbar-gutter` unchanged. Platform scrolling stays native (it is an app, not a page to read).
  - **Done when:** scrolling feels smooth with a mouse wheel and trackpad, an open overlay still locks the page, reduced motion turns it off, and the legal TOC jumps to each section below the header.

- [ ] **A99 · Works the same on Windows and macOS** · M · risk L · audit with A89
  - **Problem:** the founder works on Windows; students are split across both. Known Windows gaps so far: the date picker (A88, done); scrollbars were one (A65, done). Not yet checked: font rendering of the stack on Windows (ClearType, fallback fonts), native controls (date, time, select, checkbox) in dark mode, any keyboard shortcut hint that says Cmd or Ctrl, focus rings and hover states on touch laptops, and file pickers and drag and drop on upload.
  - **Fix:** a checklist run per screen on Windows (Chrome, Edge, Firefox) and macOS (Safari, Chrome) during B23; each problem becomes its own item. Add the checklist to "Quality bar for every screen" in `standards.md` so later screens are checked the same way.
  - **Done when:** the checklist is in `standards.md` and every screen passes it on both systems.

- [ ] **A100 · Mobile pass** · M-L · risk M · audit with A89
  - **Problem:** screens are checked at 375px for overflow (`apps/web/CLAUDE.md`, "Verifying"), but they were designed desktop first. Not yet checked as a phone user would: the assessments table and its edit row, the calendar grid and day view, the grade breakdown's inputs, the notes editor's toolbar, overlays with the on-screen keyboard open, hover-only controls, touch targets (44px is the rule in `components/ui/input.tsx`), iOS Safari's viewport height and safe areas, and Android Chrome.
  - **Fix:** audit each screen on a real phone or the browser's device mode at 375 and 390px during B23; file findings per screen; fix in B26.
  - **Done when:** every main flow (sign up, onboarding upload, add and edit an assessment, check grades, write a note, change settings) works one-handed on a phone without zooming or sideways scroll.

### Cleanup

- [ ] **A92 · Tracker IDs in test names** · S · risk L
  - **Where:** 92 test names start with an item ID ("A19: verifies the Gmail login once ...", "A8: sends N days before the due date ..."), across the `apps/web` suites; the rule is "Known bugs are `it.fails`" in `standards.md` ("Testing").
  - **Problem:** the ID means something while the bug is open: an `it.fails("A10: ...")` says which item turns it green. Once fixed, the prefix is history in a place meant to describe behavior, and a reader needs the tracker to read the suite.
  - **Recommended:** keep IDs only on `it.fails` and `it.todo`. Remove them from passing tests and make sure each name still says the behavior on its own ("sends N days before the due date, from 9:30 local time"). The fix's history stays in git and on the item. Update the Testing rule to say so: a fixed bug's `it.fails` becomes a plain `it` and loses its ID.
  - **Done when:** no passing test name starts with an ID; `standards.md` states the rule; the suite count is unchanged.

- [ ] **A93 · Comments that narrate or log history** · M · risk L · both apps · do with A35
  - **Found (2026-10-30):** `apps/web/src` has about 1,250 comment lines in about 20,200 lines (JSDoc included). Many are useful "why" notes. Patterns to remove: narration of the next line ("Navigation handlers" in `CalendarView.tsx`), version and history stamps ("standards.md v4.3" in `components/ui/input.tsx`, "Also handle direct /terms and /privacy routes for consistency" in `next.config.ts`, "Pricing page removed" in the landing config), and item IDs in comments where the constraint itself can be stated instead.
  - **Fix:** per folder, keep comments that explain a constraint the code can't show (the A44 `Buffer` note in `lib/upload/pdfText.ts`, the adjust-state-during-render note in `GradesTab.tsx`, Safari or Gmail quirks); delete the rest or rewrite them as the reason. No code change in the same PR. The rule is A102's "Comments" rule.
  - **Done when:** a pass over every folder of both apps is done, and the verification loop is green with no code diff besides comments.

- [ ] **A94 · Simplify over-built logic** · L · risk M · test-first · after A92 and A93
  - **Goal (founder):** find code that does in many steps what could be done in a few, and simplify it without changing behavior. Look first; this is not a deletion pass.
  - **Known candidates:** the two upload forms' shared logic (A21); files over 300 lines (A22); Firestore calls in components, `alert()`s, the non-atomic bulk delete (A23); dead code and the `order` backfill (A24); the two extra user-doc readers (A54); the one-time cron code once its time has passed (A47, A64). To check: the target-grade draft held in state plus a mirrored ref (B18's review), the calendar's own date formatter that duplicates `utils/dateUtils.ts` (B18's review), and duplicated parsing between `lib/upload/textExtraction.ts` and `normalize.ts`.
  - **Method:** one area per PR (upload, grades, calendar, reminders, auth and user doc, dashboard shell). For each, list the candidates with a short before and after in the session log before changing code. Code without tests gets tests on today's behavior first; the simplification must keep them green. Run `/simplify` and `/code-review` on each PR. Measure what changes: lines, files, bundle size (Baseline).
  - **Done when:** every area has been reviewed, each simplification shipped or dropped with a reason, and tests and page sizes are no worse.

- [ ] **A95 · Modularity** · M · risk M · with A94
  - **Problem:** the rules already exist in `standards.md` ("Architecture & file layout": thin pages, components own markup and hooks own data, one responsibility per file, the folder pattern past 300 lines), but A22 and A23 list where the code breaks them, and nothing checks them.
  - **Fix:** in B25, fix the breaks (A21, A22, A23, A54), then add the checks that are cheap to automate: an ESLint `no-restricted-imports` rule that keeps `firebase/firestore` out of `components/` (only `hooks/` and `lib/` may import it), and a line-count warning in CI for files over 300 lines. Keep `standards.md` the one place the rules are written.
  - **Done when:** A21, A22, A23 and A54 are done and the lint rule is on with zero warnings.

- [ ] **A96 · Deprecated packages, dependencies and methods** · M each · risk M · one change per PR
  - **Packages:** A25 has the list (`@google/generative-ai` to `@google/genai`; `pdf-parse` 1.1.1; Tiptap 2 to 3; firebase 11 to 12; web Next 15 to 16 and `next lint` to the ESLint CLI; firebase-admin's `uuid` chain; `@types/node` 20 to 22), plus A33 (the landing's Next pin) and A62 (Tiptap's `immediatelyRender` warning).
  - **Add to A25:** start with a fresh inventory, since A25 was written 2026-10-10: `npm outdated --workspaces`, the `npm warn deprecated` lines from a clean `npm install`, and `npm audit --omit=dev`, recorded in the B27 log. Then search the code for deprecated APIs the upgrades will remove (React 19 and Next 16 deprecations, Firebase calls marked deprecated in the installed types).
  - **Done when:** the inventory shows no deprecated direct dependency and no deprecated API in use, or each one left has a reason in `docs/ops.md` ("Pins to know").

- [ ] **A98 · One domain** · M · risk M-H · D13 decided (a): the platform on `app.asetta.me`
  - **Today:** the platform (Vercel project `asetta`) serves `asetta.me`; the marketing site (`asetta-landing`) serves `www.asetta.me`. The platform's production `/`, `/terms`, `/privacy` and `/legal/*` redirect to `www` (`apps/web/next.config.ts`), and the landing's `/login` and `/register` redirect to the bare domain (`apps/landing/next.config.ts`, `APP_URL` in `src/lib/site.ts`). Two apps in one repo is normal; what's unusual is the app on the bare domain and marketing on `www`, which most people read as the same site.
  - **Fix (D13, recommended (a)):** the platform moves to `app.asetta.me`; `asetta.me` serves the marketing site and `www` redirects to it. Checklist: the Vercel domains on both projects; Firebase Auth's authorized domains (Google sign-in fails on a host not listed); `APP_URL` in the platform's env (email links) and in the landing's `site.ts`; both `next.config.ts` redirect lists; keep `asetta.me/login`, `/register`, `/dashboard/*` and `/confirm-email` redirecting to `app.` for good, because sent emails and bookmarks point there; the reminder workflow's URL (`https://asetta.me/api/cron/notifications` in `.github/workflows/reminders.yml`; a redirect would drop its `Authorization` header); the GA settings; canonical URLs and the sitemap; the cross-app links section of the root `CLAUDE.md`, `README.md`, `docs/ops.md` and `apps/landing/CLAUDE.md`. The ICS UID stays `asetta.app` (D9). Users stay signed in only if Firebase Auth's persistence carries over to the new origin: it does not (storage is per origin), so everyone signs in once after the move; say so in the release.
  - **Done when:** each app answers on its one host, every old URL redirects to its new home, sign-in (password and Google) and every email link work on production.

- [ ] **A101 · Docs overlap** · M · risk L · docs only · after A97 (docs done 2026-10-30 in B21, PR #27; left: the founder reads the result)
  - **Done in B21:** commands and the verification loop live only in the root `CLAUDE.md` (the app CLAUDE files and `README.md` link to it); env vars only in `docs/ops.md`; the scrollbar recipe only in `standards.md`; `standards.md` lost its "locked" dates, version stamps, item IDs in rule text, the verification loop copy and the handoff section; `apps/landing/CLAUDE.md` lost its component-by-component catalog for a short structure list and a Rules list. `docs/ops.md` still names items where it explains why a mechanism exists; it describes facts, not rules.
  - **Problem:** about 2,800 lines across seven docs plus this file, and the same facts live in several places, so they drift and agents read the same rule worded three ways. Found 2026-10-30:
    - Commands: the root `CLAUDE.md`, `apps/web/CLAUDE.md`, `apps/landing/CLAUDE.md` and `README.md`.
    - The verification loop: `standards.md`, `apps/web/CLAUDE.md`, the landing's Conventions (a shorter loop) and this file's "Ending a session".
    - Env vars: `README.md`, `docs/ops.md` and `apps/landing/CLAUDE.md`.
    - The scrollbar recipe: `standards.md` and `apps/landing/CLAUDE.md`.
    - History inside rules: "(locked 2026-07-14)" stamps on most `standards.md` Part 2 headings, item IDs in rule text (A13, A15, A17, A18, A19, A44), and a "Handoff notes for new sessions" section.
    - `apps/landing/CLAUDE.md` describes every component one by one, which repeats the code and goes stale.
  - **Fix:** one home per fact (a table at the top of the root `CLAUDE.md`'s doc map already says which doc holds what; enforce it), the others link to it. Strip dates and item IDs from rule text. Cut the landing's component list to the rules a component must follow. Reword rules as plain instructions ("Do X", "Never Y") in the A102 style so agents read one voice. Target: each doc shorter, none repeating another.
  - **Done when:** each fact in the list above lives in one doc; no rule carries a date or an item ID; the founder has read the result.

### Backend and earlier items

- [ ] **A14 · ICS export correctness** · S · risk L · test-first (code done 2026-10-11 in PR #12; left: the Google Calendar import of the B7 sample, see the B7 log; the UID stays on `asetta.app` (D9))
  - **Where:** `apps/web/src/utils/icsGenerator.ts`.
  - **Problem:** The default 23:59 due time makes DTEND 00:59 on the same day, before DTSTART (verified; `incrementHour` at :54-58 wraps without rolling the date). `DTSTAMP`, required by RFC 5545, is missing. SUMMARY and DESCRIPTION aren't escaped for `,` `;` `\`. No 75-octet line folding. The UID uses `@asetta.app` (the domain is asetta.me).
  - **Fix:** Compute the end from a Date (or make due-time events zero-length). Add DTSTAMP, escaping and folding. Changing the UID domain would duplicate events for anyone who already imported, so decide whether it's worth it.
  - **Tests:** `utils/icsGenerator.test.ts` holds the A14 `it.fails` (the 23:59 end, DTSTAMP, SUMMARY escaping, 75-octet folding) and an `it.todo` for the UID domain decision.
  - **Done when:** tests cover 23:59 and names with commas and semicolons; the file imports cleanly into Google Calendar.

- [ ] **A21 · Merge the two upload forms' logic** · M · risk M
  - `apps/web/src/components/forms/UploadForm.tsx` (425 lines) and `apps/web/src/components/onboarding/OnboardingUploadForm.tsx` (403) share about 120 identical lines (file selection, drag and drop, validation, response handling). Extract a `useSyllabusUpload` hook; keep the two UIs.

- [ ] **A22 · Split files over the 300-line limit** · M · risk M
  - `components/tables/AssessmentsTable.tsx` 448, `components/pages/UnifiedDashboardPage.tsx` 396, `components/calendar/CalendarView.tsx` 313, `contexts/OnboardingContext.tsx` 309. Use the folder pattern from standards.md.

- [ ] **A23 · Standards drift in components** · S-M each · risk L
  - Firestore calls outside hooks: `SemesterTabs.tsx`, `AddAssessmentForm.tsx`, `AssessmentsTable.tsx`, `UserSettings.tsx`, `onboarding/steps/SemesterStep.tsx`, `pages/dashboard.tsx`.
  - Five `alert()` calls in `SemesterTabs.tsx` (:60, :80, :123, :136, :146); use inline alerts.
  - Bulk delete is a sequential, non-atomic loop that fails silently (`AssessmentsTable.tsx:146-162`); use `writeBatch` and show an error.
  - Deleting a semester leaves its `coursePreferences` subcollection behind (`SemesterTabs.tsx:94-112`).
  - Template-literal `className` in `tables/assessments/TableHeader.tsx`; use `cn()`.

- [ ] **A24 · Dead code** · S · risk L
  - `CheckSolidIcon` and `CloseSolidIcon` are unused (`components/ui/icons.tsx:56`, `:72`).
  - The legacy `darkMode` theme seed in `pages/_document.tsx`.
  - The `order` backfill in `hooks/useSemesters.ts:46-70`, once every semester doc has `order` (check with an admin script the founder runs). Until then it re-reads every semester doc on each dashboard mount (A12 listed it; B10 left it here).

- [ ] **A25 · Outdated dependencies (not security)** · M each · risk M · one major per PR
  - `@google/generative-ai` is Google's deprecated legacy SDK; move to `@google/genai` (also unlocks structured output for A9).
  - `pdf-parse` 1.1.1 is from 2018 and unmaintained; move to a maintained parser.
  - Tiptap 2 to 3; firebase 11 to 12 or later.
    - Tiptap 3 clears the Tiptap moderates (`mergeAttributes`, GHSA-cp6q-959q-f8rh); every 2.x is affected. Since A2 the core and StarterKit extensions are 2.27.3 while `@tiptap/react`, `starter-kit`, `pm`, `extension-link` and `extension-placeholder` stay 2.11.7 (`npm audit fix` moved only the transitive ones).
    - No firebase release clears the `@grpc/grpc-js` high: every `@firebase/firestore` up to firebase 13.0.0 pins `@grpc/grpc-js` `~1.9.0`, and the fix is 1.13.6 or 1.14.5. Why it doesn't apply to us is in the B2 log.
  - Web Next 15 to 16, to match the landing. `next lint` is removed in 16; the codemod is `npx @next/codemod@canary next-lint-to-eslint-cli .`. It also clears the web `postcss` high (Next 15.5.27 pins `postcss` 8.4.31). Mind A33: 16.4.0 breaks Pages Router dev under Turbopack.
  - The `uuid` moderate chain (firebase-admin → `@google-cloud/storage` 7 → `gaxios` 6 / `teeny-request` 9). npm calls it fixable, but `npm audit fix` leaves it; firebase-admin 14.5 (in range) moves its Google Cloud dependencies up a major (`@google-cloud/storage` 8, `@google-cloud/firestore` 9), so treat it as its own change.
  - `@types/node` is `^20` in web while `engines` says Node 22. (`@types/react` and `@types/react-dom` are one shared 19.3.0 since A2.) Moving it to `^22` also unblocks Vitest 5, which declares `@types/node` `^22 || >=24` as a peer, and the removal of the root `vite` override (B4 log; `docs/ops.md`, "Pins to know").

- [ ] **A26 · Align tooling across the apps** · S · risk L
  - One root `.prettierrc` and one Prettier version (web `^3.9.5` vs a pinned `3.8.4` in the landing can format differently).
  - Typecheck the landing too (the root `typecheck` covers web only).
  - Same env var name for the same Gmail credentials (`EMAIL_APP_PASSWORD` in web, `EMAIL_PASS` in the landing); update both Vercel projects together. Check the accounts first: in B2 the landing's local `.env.local` held a different Gmail account than web's, with an app password Gmail rejected (the founder replaced it).
  - `engines` in the landing `package.json`.
  - The code duplication (`cn`, Logo, favicons, amber tokens, logo filter, nodemailer setup, email regex) stays, per the root "no shared code" rule.

- [ ] **A27 · Landing feature GIFs** · S-M · risk L
  - About 9.3 MB of GIFs in `apps/landing/public/images/features`. Convert to MP4/WebM (autoplay, muted, loop, playsinline).

- [ ] **A28 · CI audit step** · S · risk L
  - Add `npm audit --omit=dev --audit-level=high` to `.github/workflows/ci.yml` after A2 (it would fail today). The test step shipped with A7.
  - Still fails after A2 (exit 1): the 5 remaining highs have no in-range fix (B2 log). Needs web Next 16 (A25) and a firebase release that lifts `@grpc/grpc-js`, or a step that tolerates those two advisories by ID.

- [ ] **A33 · Landing back to the current Next 16 once the dev bug is fixed** · S · risk L · found during B2
  - **Where:** `apps/landing/package.json` (`next`, `eslint-config-next`, `@next/third-parties` are `~16.3.8`).
  - **Problem:** Next 16.4.0 breaks Pages Router dev under Turbopack: modules a page shares with `_app` never get chunked, so the page server-renders and then dies on hydration with "module factory is not available" (vercel/next.js#99789; reproduced in B2 on `/` and `/contact` from a clean `.next` in a clean browser). `next build` is fine. 16.3.8 is the first release outside every `next` advisory, so the landing is pinned to `~16.3.8` until a fixed release ships.
  - **Fix:** when a 16.4.x or later release lists #99789 as fixed, move the three back to `^` that version and run `npm run dev:landing` on `/` and `/contact` in a fresh browser profile.
  - **Done when:** the landing is on the latest 16.x and dev renders every page without the overlay; the pin notes in `docs/ops.md` ("Pins to know") and `apps/landing/CLAUDE.md` (Framework) are gone.

- [ ] **A39 · Token checks that fail for server reasons are silent** · S · risk L · found during B5
  - **Where:** the `catch` around `verifyIdToken` in `apps/web/src/pages/api/upload.ts` and `apps/web/src/pages/api/welcome-email.ts`.
  - **Problem:** every error becomes a 401 "Invalid authentication token" with no log. That is right for an expired or junk token, but the same catch also takes server-side failures (for example the admin SDK failing to fetch Google's signing keys, or bad admin credentials). The student then sees "Your session expired" while nothing reaches the logs.
  - **Fix:** `console.error` (with the error code, no token) when the code isn't a client token problem (`auth/id-token-expired`, `auth/id-token-revoked`, `auth/argument-error` and similar), and consider a 503 for those.

- [ ] **A40 · Upload route capped at 60 seconds** · S · risk L · found during B5
  - **Where:** `apps/web/vercel.json` (`src/pages/api/upload.ts`: `maxDuration: 60`).
  - **Problem:** one upload of up to 10 PDFs calls Gemini once per file, one after another. Hobby on Fluid compute allows 300 seconds (B5 checked the docs), but this route stops at 60, and a slow batch shows the student the timeout message.
  - **Fix:** time a 10-file upload; if it gets near 60 seconds, raise the limit (up to 300) or process the files with bounded concurrency.

- [ ] **A42 · ICS file ends without a CRLF** · S · risk L · found during B7
  - **Where:** `generateICSFile` in `apps/web/src/utils/icsGenerator.ts`.
  - **Problem:** RFC 5545 ends every content line with CRLF, including `END:VCALENDAR`; the file joins with CRLF but has none after the last line. Google Calendar accepts it; a strict parser may not.
  - **Fix:** append `\r\n` after the join and update the "wraps the events" test.

- [ ] **A45 · Regex fallback takes a weight from the next line or the whole outline** · S · risk L · found during B8
  - **Where:** `apps/web/src/lib/upload/textExtraction.ts` (`extractWeight`).
  - **Problem:** an assessment's weight is the first percentage in the 200 characters from its match, so a line without one takes the next line's ("Lab 2 due 20/10/2026" before "Project ... (30%)" gets 30). With none in that window it falls back to the first percentage in the whole outline. B8's tests give every line its own weight to stay clear of it.
  - **Fix:** look for the weight on the assessment's own line (or up to the next match) only, and store 0 when there is none.

- [ ] **A46 · Regex fallback reads a number before a month as the day** · S · risk L · found during B8 (`/code-review`)
  - **Where:** `apps/web/src/lib/upload/normalize.ts` (`DAY_FIRST` in `parseDueDate`) and the day-first alternative of `DATE_TEXT` in `textExtraction.ts`.
  - **Problem:** "Lab 3 Dec 2026" or "Week 10 May 2026" reads 3 or 10 as the day, a valid but wrong date with no review flag. "3 Dec 2026" alone is a real day-first date, so the text can't tell them apart; before B8 the same reading happened through `\w+\s+\d{1,2},?\s*\d{4}`.
  - **Fix (decide while building):** accept a day-first date only when the number isn't right after an assessment word (Lab, Quiz, Week, Assignment), or flag it for review.

- [ ] **A47 · Remove the reminder cron's check for records from before A8** · S · risk L · found during B9
  - **Where:** `legacyRecordIds` and `isRecentLegacySend` in `apps/web/src/lib/reminderCron.ts`, their use in `sendReminder` (`lib/notifications.ts`), their tests, and the "Records from before A8" bullet in `docs/ops.md`.
  - **Problem:** the check only matters for the first 4 days after A8's first production run: it stops the switch from resending what the old cron had just sent. After that it is one or two wasted reads for each new reminder.
  - **Fix:** delete it once 5 days have passed since the first production run (the first `cronRuns/{date}` doc with `sweptAt` dates it).

- [ ] **A49 · Daily digest email (optional, from A8)** · M · risk M · found during B9
  - A8 left the digest to "decide while building"; B9 didn't build it. Since A8 a user's due reminders all go out in the same run, one email each. A digest would be one email per user per run listing them: fewer Gmail sends (D3) and less inbox noise. It needs one claim covering several records and a new builder in `lib/emailTemplates.ts`. Revisit with A19, or when sends approach the Gmail cap.

- [ ] **A52 · An assessment without a due date is hidden everywhere** · S · risk L · found during B10
  - **Where:** the `orderBy("dueDate")` query in `apps/web/src/hooks/useSemesterAssessments.ts`; the `dueDate` default in `assessmentFromDoc` (`utils/semesterAssessments.ts`).
  - **Problem:** Firestore's `orderBy` leaves out docs without the field, so such an assessment never appears in any tab, and its weight and mark never reach the grade. The mapping's "today" default only applies to an empty or null `dueDate`. Before B10 it was worse: the grades tab read such docs with `getDocs` and its sort crashed the whole dashboard (`parseLocalDateTime(undefined)`, reproduced on main with a seeded doc). The upload (B8's normalizer) and the Add form always write a date, so only old or hand-edited docs can be affected.
  - **Fix:** drop the `orderBy` and sort on the client (every consumer sorts anyway), and give such a doc `needsReview` with the viewer's today rather than a silent default (D10's rule). Or first check with an admin script whether any production doc lacks a `dueDate`.

- [ ] **A55 · Metadata-only user-doc snapshots re-render every `useAuth` consumer** · S · risk L · found during B10 (`/code-review`, skipped)
  - **Where:** `useUserDoc` in `apps/web/src/hooks/useUserDoc.ts` (`includeMetadataChanges: true`, so the server confirming a cached doc counts as its first answer).
  - **Problem:** each write ack and each connectivity change sets new state, so the whole dashboard re-renders two or three times per user-doc write (a settings toggle, the daily `lastLogin`).
  - **Fix:** after the first server answer, skip the state update when only the metadata changed.

- [ ] **A57 · A course rename fails silently, and each Enter runs it twice** · S · risk L · found during B11
  - **Where:** `CoursesOverviewTable.tsx` (`useCourseRename`'s `onError`, and the editor's `onBlur`); `hooks/useCourseRename.ts`.
  - **Problem:** `onError` only logs and closes the editor, so a validation message (empty, over 100 characters) or a Firestore failure never reaches the student, who just sees the old name. One Enter calls `renameCourse` twice: Enter submits, `isRenaming` disables the input, the input loses focus, and `onBlur` submits again. The B11 baseline logged two "Course rename failed" errors for one Enter. A successful second run repeats the same writes, so it does no harm today. The rename also swallows a failed read of the old preferences doc (`console.warn`) and commits without moving it, so the renamed course shows the default color and target.
  - **Fix:** show the error inline, as the color picker's `colorError` already does. Ignore a submit while a rename is running. Fail the rename when the preferences read fails.

- [ ] **A58 · Course names aren't trimmed or capped in the Add form** · S · risk L · found during B11 (`/code-review`)
  - **Where:** `components/forms/AddAssessmentForm.tsx` (`addDoc` with `...formData` as typed). Check the assessment edit row's save too.
  - **Problem:** "CIS 3760 " and "CIS 3760" become two courses (two cards, two preferences docs). Rename trims the old name, so on the spaced one it finds none of its assessments and not its preferences doc. There's no length cap either, while rename and upload cap at 100. A name over 1,500 bytes can't be a doc ID even escaped (A13), so its color and target can't save.
  - **Fix:** trim and cap at 100 wherever a course name is saved (reuse `validateCourseName` from `utils/courseName.ts`).

- [ ] **A59 · Renaming a course onto another course's name replaces that course's preferences** · S · risk L · found during B11 (`/code-review`)
  - **Where:** `hooks/useCourseRename.ts` (`batch.set(newPrefsRef, prefsData)`).
  - **Problem:** renaming "MATH 2050" to an existing "MATH/STAT 2050" merges the two courses' assessments. When the renamed course has a preferences doc, it overwrites the other course's color and target grade. Read from the code, not reproduced. A13 made cross-listed names reachable here; the behavior itself is older.
  - **Fix:** keep the existing course's values (`set` with `merge`, written so the existing fields win), or ask which to keep.

- [ ] **A60 · Run the Firestore rules suite in CI** · S · risk L · found during B12
  - **Where:** `.github/workflows/ci.yml`; the suite is `apps/web/src/rules/firestore.rules.test.ts` (`npm run test:rules`).
  - **Problem:** the rules suite needs the Firestore emulator, so `npm test` and CI leave it out, and a rules change can merge without it.
  - **Fix:** a CI step that runs `npm run test:rules` (the ubuntu runner has Java; firebase-tools 13.35.1 needs 11 or later, newer ones 21). It downloads the emulator jar on each run; cache it if that is slow.

- [ ] **A61 · Password sign-ups get reminders at an unverified account email** · S-M · risk L · found during B12
  - **Where:** `reminderRecipient` in `apps/web/src/utils/notificationEmail.ts` (the account-email fallback A17 asked for); A30 has the same root.
  - **Problem:** A17 makes a chosen address prove itself, but the account email of a password sign-up is never verified, so someone can register with another person's address, turn reminders on and have Asetta email that address assessment names they typed (escaped, plain text). Bounded by account creation and one address per account.
  - **Fix (decide with A30's follow-up):** send reminders to the account email only when Auth says it is verified (Google sign-ups), and offer password users Firebase's own verification email (`sendEmailVerification`), or treat their account email like a chosen address and use the A17 link.

- [ ] **A62 · Two development console errors on every dashboard load** · S · risk L · found during B12
  - **Where:** `components/editor/RichTextEditor.tsx` (Tiptap), and next-themes' theme script in `_app` through `ThemeProvider`.
  - **Problem:** in development, Tiptap warns "SSR has been detected, please set `immediatelyRender` explicitly to `false`", and React logs "Encountered a script tag while rendering React component" after a client-side navigation (next-themes' inline script). Neither breaks a page, but they bury real errors when checking the console.
  - **Fix:** pass `immediatelyRender: false` to `useEditor`; check whether a next-themes release renders its script without the React 19 warning.

- [ ] **A63 · A daily cap on confirm links across all accounts** · S · risk L · found during B12 (`/code-review`)
  - **Where:** `apps/web/src/pages/api/notification-email/verify.ts`, `lib/emailVerification.ts`.
  - **Problem:** confirm links are capped per account (one a minute, 5 a day), but accounts are free, so many accounts can each send 5 a day to addresses of their choosing. Each is a fixed-text email (no text the sender chose), but they count toward Gmail's daily cap that reminders need (D3). The welcome email has the same exposure (A30's note).
  - **Fix:** a server-only daily counter (for example a `usage/{day}` doc) checked in the same transaction, with a cap well under Gmail's; consider covering welcome emails with it.

- [ ] **A64 · Remove the one-time D11 step from the reminder cron** · S · risk L · found during the D11 follow-up
  - **Where:** `confirmExistingAddresses` in `apps/web/src/lib/notifications.ts` and its call in `checkAndSendNotifications`; `existingAddressToConfirm` in `utils/notificationEmail.ts` and its tests; the D11 bullet in `docs/ops.md` ("Reminder cron").
  - **Problem:** after the first production run the step only reads its marker on every run (one read each).
  - **Fix:** once `migrations/d11-existing-addresses` in production has a `finishedAt`, delete the code, tests and bullet; keep the marker doc as the record.

- [ ] **A66 · Dark `--border` differs between `globals.css` and the token table** · S · risk L · found during A65
  - **Where:** `.dark` in `apps/web/src/styles/globals.css` (`--border: #333333`); the "Theme tokens" table in `apps/web/standards.md` (`#2E2E2E`).
  - **Problem:** the code ships `#333333`, the same value as `--accent`, so dark row dividers match the hover tone; the table says `#2E2E2E`. standards.md says the two never drift.
  - **Fix:** the founder picks the intended value; make both files match and check the dark dividers.

- [ ] **A68 · The landing site has no unit tests** · S · risk L · found during B14
  - **Where:** `apps/landing` (no test runner); the root `npm test` and CI run `apps/web` only.
  - **Problem:** A20's limiter (`src/lib/rateLimit.ts`) is pure logic with no test in the repo; B14 checked it with a scratch script (`node_modules/.cache/b14/ratelimit-check.mts`, 7 checks, Node's own TypeScript stripping).
  - **Fix:** Vitest in `apps/landing` (the same version as web's, so the lockfile only gains the landing's entry), `npm test` at the root running both apps, and the scratch checks as `rateLimit.test.ts`. Read `docs/ops.md` on workspace installs first.

- [ ] **A69 · The extraction summary shows a stray "0" and never names failed files** · S · risk L · found during B14
  - **Where:** `apps/web/src/components/modals/ExtractionSuccessModal.tsx` (`{result.processingTime && (`).
  - **Problem:** an extraction that takes under a second (the regex fallback) has `processingTime: 0`, and React renders the 0 under the course list. The modal also never shows `failedFiles` or the route's `errors`, so a file that couldn't be read just goes missing from the summary.
  - **Fix:** `processingTime > 0 &&` (or drop the line); show failed files with the route's reason.

- [ ] **A70 · Upload quota edge cases** · S · risk L · found during B14 (`/code-review`)
  - **Where:** `apps/web/src/pages/api/upload.ts`.
  - **Problem:** the refund runs after the loop, so a request killed part way (the route's 60-second `maxDuration` with several slow Gemini calls) keeps every claimed file counted, and a retry of the same files can be refused. An account already at 20 still uploads and parses up to 4 MB before the 429.
  - **Fix:** if it shows up in practice: a cheap read of the count before `parseForm` (the transaction stays the guard), and a refund in the `finally` for files not yet processed.

- [ ] **A71 · A hard cap for the contact form** · S-M · risk L · found during B14 · only if spam gets through
  - **Where:** `apps/landing/src/pages/api/contact.ts`, `src/lib/rateLimit.ts`.
  - **Problem:** A20's per-IP limit lives in one function instance's memory (see A20), so a client hitting cold starts or several instances can send more than 5 an hour, and bots that rotate IPs aren't limited at all. Failed sends (a Gmail outage) also use up a person's attempts.
  - **Fix (founder's call):** a Vercel Firewall rate-limit rule on `/api/contact` (dashboard config, no code; check what the Hobby plan includes), or a shared store (the landing has none today). Decide only if contact spam arrives.

- [ ] **A72 · A reminder run has no time budget** · S · risk L · found during B15
  - **Where:** `checkAndSendNotifications` in `apps/web/src/lib/notifications.ts`; the route's `maxDuration` 300 (`apps/web/vercel.json`).
  - **Problem:** a run that reaches 300 seconds is killed before it writes `cronRuns/{date}`, so the summary never shows it; the users it didn't reach are still due and go in the next run, 30 minutes later. After A19, B15 measured 1,200 due users in 71 seconds at a simulated 25 ms per Firestore call, before any Gmail time (B15 log), so it is far off today; Gmail's daily cap (D3) limits the sends long before.
  - **Fix:** stop taking new users after about 240 seconds, finish the ones running, and record the stop in `lastRun` (for example `stoppedEarly: true` and how many were left).

- [ ] **A73 · A bad Gmail login spends every reminder's attempts** · S · risk M · found during B15 · changes when reminders go out, so the founder decides
  - **Where:** `sendReminder` in `apps/web/src/lib/notifications.ts`; `createReminderMailer` in `lib/email.ts`.
  - **Problem:** each send is claimed (an attempt counted) before the login check, so with a revoked app password every due reminder fails its 3 attempts within about an hour and is never sent, even after the password is fixed the same day. Same before B15, when the check ran before every email.
  - **Fix (decide):** check the login once at the start of a run that has reminders to send; if it fails, log it, claim nothing, and give the due users a short retry (`nextReminderRun` with a retry) so the reminders go out once the login works.

- [ ] **A80 · A target typed but not yet saved is lost on a reload or a closed tab** · S · risk L · found during B18 (`/code-review`)
  - **Where:** the target draft in `apps/web/src/components/assessment/GradeCalculator.tsx` (A76's save on leave).
  - **Problem:** since A76 the target saves on blur, Enter, a course change or the calculator unmounting. A full page reload or a closed tab fires none of those, so a target typed and left focused is lost. Before A76 every keystroke saved it.
  - **Fix (if it matters in practice):** also save the draft on `pagehide`; Firestore queues the write locally, but whether it reaches the server before the page goes is not guaranteed.
  - **Checked (B19), left open: `pagehide` doesn't work.** The app's Firestore keeps its cache in memory, so a write has to leave the page before it goes. On a production build against the emulators, with 60 ms added each way between the page and Firestore (a proxy that logs what leaves the browser), "70" typed and the page reloaded with the field focused: with no handler (today) 85 stayed and nothing was sent; with a `pagehide` handler that leaves the field (the same save as a blur), the handler ran but no write left the page, both with the write stream closed (the first save after a load) and with it open from a save seconds before. A `beforeunload` handler did save 70 when the write stream was already open; with it closed, the stream's handshake left but the page was gone 11 ms later. Opening the stream takes about 2.5 round trips before the write itself goes, and a target typed right after opening the page has no open stream. Not tried: a closed tab, which goes at least as fast as a reload; Safari and Firefox (the pane is Chromium). Not tried either: switching tabs or apps, which browsers normally answer by blurring the focused field, which would save it.
  - **Options (founder's call, none needed for B19):** (a) accept the gap: only a reload or a close with the field still focused loses the value, and the old target shows on return; (b) keep the draft in `localStorage` per course and save it on the next visit (survives a reload or a close on the same browser; a stale draft could overwrite a target changed on another device unless it expires); (c) send the draft with a `keepalive` request (`fetch` or `sendBeacon`), which browsers let outlive the page, through a small API route or Firestore's REST API: a second write path for one field. Recommended: (a).

- [ ] **A81 · Typing a mark and deleting it leaves the assessment Submitted** · S · risk L · found during B19 · changes A41's rule, so the founder decides
  - **Where:** `applyMarkInput` in `apps/web/src/utils/gradeCalculations.ts`, through `handleMarkChange` in `GradeCalculator.tsx`.
  - **Problem:** a digit typed into a Not started or In progress assessment's empty mark field makes it Submitted; deleting the digit clears the mark but keeps Submitted (A41: clearing a mark never changes the status), and the auto-save writes Submitted with no mark, so a stray keystroke undone still moves the assessment to Submitted and Done. Read from the code, not reproduced in the UI.
  - **Fix (decide):** clearing a mark goes back to the status the assessment has saved (as `weightEdit` goes back to the saved weight), so only a mark that stays changes the status; a Missed assessment keeps its status either way (D1).

- [ ] **A82 · Old "Completed" and "Under Review" statuses show under the table's To do** · S · risk L · found during B19 (`/code-review`)
  - **Where:** `matchesAssessmentFilter` in `apps/web/src/utils/semesterAssessments.ts` (`isCompletedStatus` knows only Submitted and Missed); `getDaysTillDue` in `components/tables/AssessmentsTable.tsx`, which treats both as complete.
  - **Problem:** a doc still holding a legacy status is listed under To do, while the same row shows no days left as if done. Predates B19; the To do label makes it read as work left. Whether such docs still exist in production is unknown.
  - **Fix:** count the legacy statuses with Submitted in one place (`constants/assessment.ts`), or migrate them, and type the stored status as possibly legacy.

- [ ] **A83 · Settings reads the user doc with its own `getDoc`** · S · risk L · found during B20
  - **Where:** `fetchUserData` in `apps/web/src/components/settings/UserSettings.tsx`.
  - **Problem:** the last reader of the user doc beside `AuthContext`'s live one (standards.md, "The user doc is read once, live"). It reads once at mount, so the cards don't follow later changes to the doc, and a failed read is only logged: the forms keep their defaults (notifications off) with Save disabled, and no error shows. A23 lists `UserSettings` among the Firestore calls outside hooks.
  - **Fix:** start the Profile and Notifications forms and the preferences from `useAuth()` (`profile`, `displayPreferences`, and a notifications mapping like B20's `onboardingChoicesFromUserDoc`, with `notifySubmittedAssessments`), as B20 did for onboarding; delete the `getDoc`. Keep the dirty check against what was loaded.

- [ ] **A85 · Onboarding's "Skip for now" on the notifications step keeps what was already changed** · S · risk L · found during B20 (second `/code-review`)
  - **Where:** `NotificationsStep` (`components/onboarding/steps/NotificationsStep.tsx`): every change goes to `updateUserData` at once, and `StepNavigation`'s Skip calls `nextStep` without Continue's check (`canContinue`).
  - **Problem:** a student who switches notifications on, types part of an address and presses Skip for now finishes onboarding with `emailNotifications` and consent true and the unfinished address (reminders then go to the account email). Read from the code, not reproduced in the UI. Predates B20.
  - **Fix (decide):** Skip for now saves notifications off (the step's default), or Skip is hidden once the switch is on. A small product call.

## Done

Full text and what shipped: archive, "Done items".

- [x] A1 · Lock down /api/welcome-email · 2026-10-10, PR #5
- [x] A2 · Patch vulnerable dependencies · 2026-10-10, PR #7
- [x] A3 · Cron: fail closed, log failures, retry failed sends · 2026-10-11, PR #10
- [x] A4 · Upload route: auth first, clean temp files, log errors · 2026-10-11, PR #10
- [x] A5 · Repo hygiene leftovers from the merge · 2026-10-11, PR #11
- [x] A6 · Docs cleanup · 2026-10-10, PR #8
- [x] A7 · Vitest setup + first suites (grade, date, parsing) · 2026-10-11, PR #9
- [x] A8 · Reminders at 9:30 in each user's timezone · 2026-10-11, PR #14
- [x] A9 · Normalize AI and regex extraction output · 2026-10-11, PR #13
- [x] A10 · Grade math bugs · 2026-10-11, PR #12
- [x] A11 · One live source of assessments · 2026-10-12, PR #15
- [x] A12 · Auth reliability and user-doc reads · 2026-10-12, PR #15
- [x] A13 · Course names containing "/" · 2026-10-16, PR #16
- [x] A15 · Bundle size · 2026-10-18, PR #19
- [x] A16 · Firestore rules: validate fields · 2026-10-16, PR #17
- [x] A17 · Verify the notification email before sending · 2026-10-16, PR #17
- [x] A18 · Per-user upload quota · 2026-10-19, PR #21
- [x] A19 · Cron throughput · 2026-10-19, PR #22
- [x] A20 · Landing contact form: throttle and bot check · 2026-10-19, PR #21
- [x] A29 · Line endings: local format check fails on Windows · 2026-10-11, PR #11
- [x] A30 · Welcome email to unverified sign-up addresses · 2026-10-10, PR #6
- [x] A31 · Redesign the welcome and reminder emails · 2026-10-10, PR #6
- [x] A32 · Settings states the wrong reminder time · 2026-10-11, PR #14
- [x] A34 · next dev writes apps/landing/AGENTS.md · 2026-10-30, PR #27
- [x] A35 · Em dashes left in the rules docs and code comments · 2026-10-30, PR #27
- [x] A36 · Current grade reads 0% when every marked assessment weighs 0 · 2026-10-11, PR #12
- [x] A37 · Course-name fallback reads a term as the course code · 2026-10-11, PR #13
- [x] A38 · A failed reminder is retried only on the same day count · 2026-10-11, PR #14
- [x] A41 · A mark edit always sets the status to Submitted · 2026-10-11, PR #12
- [x] A43 · Clearing the target-grade field saves 0 · 2026-10-19, PR #23
- [x] A44 · Small PDFs fail to parse in the upload route · 2026-10-19, PR #21
- [x] A48 · Onboarding saves email notifications as on even when switched off · 2026-10-29, PR #26
- [x] A50 · The reminder time shows only under Custom timing · 2026-10-29, PR #26
- [x] A51 · The stats bar's "Submitted" counts Missed assessments · 2026-10-19, PR #23
- [x] A53 · The grade breakdown labels a Missed assessment "Pending" or "Overdue" · 2026-10-19, PR #23
- [x] A54 · Sign-in reads the onboarding status on its own, and a read error sends an onboarded user to onboarding · 2026-10-29, PR #26
- [x] A56 · The calendar's Today button never opens today · 2026-10-19, PR #23
- [x] A65 · Scrollbars: one clean look on every OS, no sideways jumps · 2026-10-19, PR #20
- [x] A67 · Landing scrollbars have the same Chrome bug · 2026-10-19, PR #20
- [x] A74 · The assessments table's "Submitted" filter shows Missed assessments · 2026-10-29, PR #25
- [x] A75 · The grade breakdown marks a flagged assessment Overdue · 2026-10-29, PR #24
- [x] A76 · The target-grade field saves every keystroke · 2026-10-29, PR #24
- [x] A77 · The calendar's today highlight doesn't follow the clock · 2026-10-29, PR #24
- [x] A78 · Clearing a weight in the grade breakdown saves 0 · 2026-10-29, PR #24
- [x] A79 · Typing "-" or "." in a mark field marks the assessment Submitted with 0 · 2026-10-29, PR #25
- [x] A84 · Onboarding's "Continue without upload" stays disabled until "Skip for now" is pressed · 2026-10-30, PR #28
- [x] A86 · Today is hard to spot in the calendar · 2026-10-30, PR #28
- [x] A87 · A preview deploy's `/` opens the live marketing site · 2026-10-30, PR #28
- [x] A88 · Editing a due date shows no calendar on Windows · 2026-10-30, PR #28
- [x] A91 · Emojis in the code and copy · 2026-10-30, PR #27
- [x] A97 · Clean this file · 2026-10-30, PR #27
- [x] A102 · Writing rules for agents (no AI slop) · 2026-10-30, PR #27

## Baseline

The latest numbers to compare against. Every earlier value is in the archive ("Baselines as recorded").

- `npm audit --omit=dev`: 38 vulnerabilities (0 critical, 5 high, 33 moderate) since A2 (2026-10-10); 43 (10 high) with dev dependencies. Why each high stays is in the B2 session log.
- `apps/web` build (Next 15.5.27, after B22, 2026-10-30): First Load JS shared by every page 154 kB; `/login` 166 kB, `/register` 167, `/reset-password` 165, `/confirm-email` 162, `/404` 157, `/dashboard` 145, `/dashboard/*` 272, `/dashboard/[semester]/*` 272, `/settings` 273, `/onboarding` 288. A dashboard fetches the other tabs after first paint (about 37 kB in all) and the semester drag list when its menu opens (about 17 kB).
- Tests (after B20, 2026-10-29; B21 and B22 added none): 25 suites, 774 tests per zone, all passing (1,548 across the two zones). The rules suite (`npm run test:rules`): 44 cases.
- Reminder cron (B15, emulators, a simulated 25 ms per Firestore call): a day's first run with nobody due reads 4 docs at 10 to 500 users (6 at 2,000); a run with 300 of 500 users due takes 13.3 s and 3,514 reads.
- Firestore reads (B10, emulator rule coverage): a dashboard load reads the user doc once and writes nothing; a day's first load also writes `lastLogin` once.
- Vercel limits and the live rules' deploy state: `docs/ops.md`.
