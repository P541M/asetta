# CLAUDE.md

Guidance for Claude Code in `apps/landing`, the marketing site at www.asetta.me. Global rules (git, copy, commands) are in the root `CLAUDE.md`.

## Project Overview

Asetta is a landing page for an AI-powered academic management platform. The landing page showcases features like assessment tracking, deadline management, and grade calculation for students. The project is a marketing site that redirects users to the main application at `https://asetta.me`.

## Tech Stack & Architecture

- **Framework**: Next.js 16 (Pages Router, Turbopack) with React 19. `next`, `eslint-config-next` and `@next/third-parties` stay on `~16.3.8` until A33 (16.4.0 breaks dev; see `docs/ops.md`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 — CSS-first config via `@theme` in `src/styles/globals.css` (there is **no** `tailwind.config.ts`)
- **Animations**: Motion (`motion/react`, the renamed framer-motion) — scroll-triggered reveals via the `Reveal` component
- **Email**: Nodemailer for the contact form
- **Fonts**: Inter via `next/font` (variable font, CSS variable `--font-inter`)
- **Analytics**: Google Analytics 4 via `@next/third-parties`
- **Deployment**: Vercel project `asetta-landing` (www.asetta.me); pages are prerendered, plus one API route. See `docs/ops.md`

## Common Development Commands

Run from the repo root:

```bash
npm run dev:landing                   # Dev server (Turbopack; port 3001 if web is already on 3000)
npm run lint -w apps/landing          # ESLint (flat config; `next lint` was removed in Next 16)
npm run format -w apps/landing        # Prettier write (printWidth 100; .md files and public/ are ignored)
npm run format:check -w apps/landing  # Prettier check
npm run build -w apps/landing         # Production build (`npm run build` builds both apps)
```

## Project Structure

### Shared Data (`src/lib/`)

- **`site.ts`**: Single source of truth for external URLs (`REGISTER_URL`, `LOGIN_URL`, `CONTACT_EMAIL`, `LINKEDIN_URL`), default meta strings (`SITE_TITLE`, `SITE_DESCRIPTION`), header nav links (`NAV_LINKS`), and footer link groups (`FOOTER_LINK_GROUPS`). Add/remove nav entries here, not in components. `next.config.ts` imports the auth URLs from here for its redirects.
- **`features.ts`**: Feature and challenge copy (`FEATURES`, `HOME_FEATURES`, `CHALLENGES`). The home page shows the first three features; the features page shows all six.
- **`contact.ts`**: `ContactFormPayload`, the contact form's POST contract shared by the contact page and the API route.
- **`utils.ts`**: `cn()` helper (clsx + tailwind-merge).

### Components (`src/components/`)

- **`Layout.tsx`**: Page shell used by every route — `<Head>` meta, fixed `Header`, `main` with `.pt-page` offset, `Footer`. All pages render inside this.
- **`Container.tsx`**: The standard page frame (`max-w-6xl px-6 lg:px-8`, optional `as="section"`). **Never hand-roll page widths/gutters** — use this. Prose nests a `max-w-3xl` block inside it.
- **`TextLink.tsx`**: Standard inline text link (stone underline, warms on hover; auto `target="_blank"` for external URLs).
- **`Header.tsx`**: Fixed full-bleed nav in a three-zone grid: logo far left, page links dead-center, Login/Get started far right (Notion-style). Scroll-aware hairline, active-route highlighting, working mobile dropdown. Nav items come from `NAV_LINKS` (no "Home" link; the logo links home).
- **`Footer.tsx`**: Data-driven from `FOOTER_LINK_GROUPS` (Product incl. Login/Get started, Company, Legal) on a stone-50 band; brand block with tagline + LinkedIn, "Ontario, Canada" sign-off. No decorative wordmark (tried and rejected as tacky).
- **`Button.tsx`**: `ButtonLink` with `primary` (solid amber) / `ghost` (quiet text link) variants, `md`/`lg` sizes, optional arrow icon and analytics `trackLabel`. Also exports `Button`, the native-button counterpart with identical styling (form submits, in-page actions); never hand-roll button class strings.
- **`icons.tsx`**: All shared inline SVG icons (`ArrowIcon`, `CloseIcon`, `MenuIcon`, `CheckIcon`, `ZoomInIcon`, `ChevronsLeftRightIcon`, `SpinnerIcon`, `LinkedInIcon`). Add new icons here instead of inlining `<svg>` in components.
- **`Reveal.tsx`**: Scroll-into-view fade-up wrapper (Motion `whileInView`, respects reduced motion). Use this for entrance animations instead of custom CSS classes.
- **`PageHero.tsx`** / **`SectionHeading.tsx`**: Heading blocks for page tops (h1) and in-page sections (h2). No badges/eyebrows — title + subtitle only. `SectionHeading` supports `align="split"` (editorial two-column: title left, lead right) used on the home content sections; `center` is for CTAs and symmetric blocks.
- **`FeatureGrid.tsx`**: Feature card grid with shared click-to-zoom `ImageModal`. Three layouts: `uniform` (equal tiles), `featured` (first tile full-row horizontal; home page), `bento` (alternating wide/narrow spans, wide tiles horizontal; features page).
- **`ContentSection.tsx`**: Plain prose section (heading + paragraphs) used on the About page.
- **`CTAPanel.tsx`**: The standardized closing CTA on every page: a plain centered headline + lead + buttons in whitespace (no box, no band of its own); the stone footer beneath it closes the page. Self-contained (owns its vertical spacing); place it directly under page content, **outside** any narrower content container. No card children — the former `CTAPanelCard` highlights were removed as redundant and boxy.
- **`LegalPage.tsx`**: Document-style shell for legal pages — left-aligned header with last-updated date up top, sticky "On this page" sidebar on desktop, plus primitives (`BulletList`, `Callout`, `QuickSummary`, `EmailContactCard`). All boxes are neutral stone (no color on legal pages). Pages define a `SECTIONS: LegalSectionData[]` array and pass it as the `sections` prop; the shell renders the sections and derives the TOC from their titles. `QuickSummary` takes a flat `entries` list and splits it into two columns itself.
- **`ImageModal.tsx`**: Full-size image lightbox.
- **`ui/image-comparison.tsx`**: Draggable before/after slider used for the dashboard preview on the home page.

### Pages (`src/pages/`)

- **`index.tsx`**: Hero with the tagline headline and the dark/light dashboard slider (in a macOS-style window frame) cresting into the first viewport, challenges tile grid, feature highlights (`layout="featured"`), closing `CTAPanel` (all pages share the same closing CTA pattern)
- **`features.tsx`**: All six features + CTA block
- **`about.tsx`**: Single company page — mission, why we built Asetta, founder's note, promise CTA (the former `/story` and `/founders-note` pages were merged here and redirect to it)
- **`contact.tsx`**: Split layout (intro + email alternative left, form right). Filled borderless inputs (`bg-stone-100`, white + ring on focus); CASL consent checkbox; posts to `/api/contact`
- **`privacy.tsx`**, **`terms.tsx`**: Built from `LegalPage` primitives
- **`api/contact.ts`**: Nodemailer handler; requires `EMAIL_USER` / `EMAIL_PASS`, sends to `CONTACT_EMAIL`

## Design System (premium minimal)

- **Layout standards (enforced via `Container`)**: every page-level block is `max-w-6xl px-6 lg:px-8`; long-form prose sits in a `max-w-3xl` block inside that frame (About, legal content). The header is full-bleed but shares the same `px-6 lg:px-8` gutters. Vertical rhythm uses one scale: sections `py-24 md:py-32` (or the pt/pb/mt equivalents), page bottoms `pb-24 md:pb-32`, heading-to-content `mb-12 md:mb-16`, `PageHero` `mb-16 md:mb-24`. Card grids use `gap-5`. Radius ladder: `rounded-lg` controls, `rounded-xl` cards/tiles, `rounded-2xl` panels. Do not introduce new width, spacing, gap, or radius values without updating this section.

- **Color**: Near-monochrome — white background, Tailwind **stone** neutrals for all text and borders. The amber `primary` palette (defined in `@theme` in `globals.css`) appears **only** on primary buttons, the logo icon, and link hovers. Headings are solid `stone-900` with no highlighted/colored words. No gradients, glows, badges, pills, or dark sections.
- **Typography**: Inter. Headings `font-semibold tracking-tight` in **sentence case** ("Get organized today", not Title Case); home hero uses fluid `clamp()` sizing; inner-page h1 `text-3xl sm:text-4xl lg:text-5xl`. Body/leads are `text-lg` (leads `md:text-xl`) in `text-stone-600`/`stone-700` with narrow measures (`max-w-xl`/`max-w-2xl`) — never below `text-base` for content (small sizes only for captions/meta). Fix "thin-looking" text with size and contrast, not weight; never `font-bold`/`font-extrabold` for headings.
- **Voice**: Premium and quiet — no salesy qualifiers ("100% Free!", "No credit card required" trust rows, pill badges). Free-for-students is stated once, plainly, where relevant.
- **Tagline**: "Always ahead, never behind." is the single brand line (hero h1, footer, default meta title). Do not introduce other slogans ("your smart academic assistant" etc. were retired).
- **Tiling**: avoid uniformly stacked blocks. Use the `FeatureGrid` layouts for wide/narrow rhythm and hairline-divided tile grids (`gap-px` over a `bg-stone-200` container) for list-like content.
- **Surfaces (two-tone, no outlines)**: Sections alternate `bg-white` and `bg-stone-50` bands for distinction. Cards are **borderless** and take the opposite tone of their band: `bg-stone-50` tonal cards on white sections (hover deepens to `bg-stone-100`), `bg-white` cards on stone-50 bands. No decorative borders anywhere; form inputs are **filled** (`bg-stone-100`, borderless, white + primary ring on focus). Borders remain only on the comparison-slider handle and typographic rules (blockquote bar, signature divider). The header gains a soft shadow (not a border) on scroll; the footer is a `bg-stone-50` band and acts as the page's closing tone shift beneath the white `CTAPanel` (no two adjacent stone zones). The hero preview uses a single soft large shadow.
- **Header**: clean fixed full-bleed bar (`bg-white/85 backdrop-blur`, hairline border appears on scroll); three-zone grid with logo at the far left edge, centered page links, auth actions at the far right edge.
- **Buttons**: Always use `ButtonLink`; pair one `primary` CTA with a `ghost` text link rather than two boxed buttons. The primary CTA label is standardized to **"Get started"** everywhere (analytics `trackLabel`s stay page-specific). In-page closing CTAs use the shared `CTAPanel`.
- **Motion**: subtle only — `Reveal` (small fade-up on scroll), arrow nudge on button hover; respects `prefers-reduced-motion`.
- **Custom CSS utilities** (`globals.css`): `.pt-page` (fixed-header offset incl. notch), `.pt-safe-only`, `.filter-primary` (tints the SVG logo).

## External Integrations

- **Redirects** (in `next.config.ts`): `/login` → `https://asetta.me/login`, `/register` → `https://asetta.me/register`; legacy `/story` + `/founders-note` → `/about`, `/pricing` → `/` (all permanent)
- **Analytics**: GA4 component renders only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Page views (including client-side route changes) are tracked automatically by GA4 Enhanced Measurement (history events enabled on the property June 12, 2026); do not add manual page-view tracking. Helpers in `src/utils/analytics.ts` (`trackCTAClick`, `trackContactFormSubmission`) cover CTA and form events only.
- **Social**: LinkedIn link in the footer (from `site.ts`)

## Environment Variables

- `EMAIL_USER`: Gmail account for sending contact form emails (the form needs both email variables)
- `EMAIL_PASS`: App password for the Gmail account
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional): GA4 measurement ID

The full matrix for both apps is in `docs/ops.md`.

## Conventions

- The root `CLAUDE.md` copy rule applies to every string on the site.
- Content/copy lives in `src/lib/` data files or page JSX; components stay copy-free where practical
- All internal/external CTAs route through `ButtonLink`; URLs come from `src/lib/site.ts`
- Entrance animations use `Reveal`; do not add bespoke CSS keyframe utilities
- Shared SVG icons live in `src/components/icons.tsx`; native buttons use `Button` from `Button.tsx`
- Formatting is enforced by Prettier. Before calling work done, run `npm run lint && npm run format:check && npm run build` from the repo root (on Windows, see `docs/ops.md` for the local `format:check` line-ending workaround)

## Content Strategy

The landing page positions Asetta as a free, AI-powered academic assistant with six core features: AI Extraction, Grade Calculator, Calendar & Deadlines, Semester Organization, Assessment Tracking, and Notes & Documentation. The product is simply free — there is intentionally **no pricing page** (`/pricing` redirects home); free-for-students is stated plainly in the hero and CTAs rather than shouted in badges. Copy is concise and sentence-case; all CTAs direct users to the main application for registration and login.

Legal pages reflect that Asetta is operated from Ontario, Canada: PIPEDA compliance, breach notification, cross-border (US) data storage disclosure, age eligibility (13+), termination, and Ontario governing law/venue. Have a lawyer review before relying on them.
