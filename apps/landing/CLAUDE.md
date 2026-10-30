# CLAUDE.md

Guidance for Claude Code in `apps/landing`, the marketing site at www.asetta.me. Commands, the verification loop, git and the writing rules are in the root `CLAUDE.md`; env vars and deploys in `docs/ops.md`.

## What it is

The marketing site for Asetta, a free academic planner for students: assessment tracking, deadlines and grade calculation. Every sign-up and login goes to the platform (`APP_URL` in `src/lib/site.ts`).

## Stack

- **Framework**: Next.js 16 (Pages Router, Turbopack) with React 19. `next`, `eslint-config-next` and `@next/third-parties` stay on `~16.3.8`, because 16.4.0 breaks dev (`docs/ops.md`, "Pins to know"). `agentRules: false` in `next.config.ts` stops `next dev` writing an `AGENTS.md`; the agent rules are the root `CLAUDE.md`.
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4, CSS-first config via `@theme` in `src/styles/globals.css` (there is **no** `tailwind.config.ts`)
- **Animations**: Motion (`motion/react`, the renamed framer-motion), through the `Reveal` component
- **Email**: Nodemailer for the contact form
- **Fonts**: Inter via `next/font` (variable font, CSS variable `--font-inter`)
- **Analytics**: Google Analytics 4 via `@next/third-parties`
- **Lint and format**: ESLint flat config (`npm run lint -w apps/landing`); Prettier with printWidth 100 (`npm run format -w apps/landing` writes fixes; `.md` files and `public/` are ignored)

## Structure

- **`src/lib/`** holds the data and copy: `site.ts` is the single source of external URLs, default meta strings, header nav (`NAV_LINKS`) and footer groups (`FOOTER_LINK_GROUPS`), and `next.config.ts` imports the auth URLs from it; `features.ts` the feature and challenge copy (the home page shows the first three features, the features page all six); `contact.ts` the contact form's POST contract (`website` is the honeypot); `rateLimit.ts` the contact route's per-IP limiter (per function instance, so no hard cap; `docs/ops.md`, "Limits"); `utils.ts` the `cn()` helper.
- **`src/components/`**: `Layout` wraps every page (meta, fixed `Header`, `Footer`); `Container` is the page frame; `ButtonLink` and `Button` are the only buttons; `TextLink` the inline link; `Reveal` the entrance animation; `PageHero` and `SectionHeading` the heading blocks; `FeatureGrid` the feature tiles (`uniform`, `featured`, `bento`); `CTAPanel` the closing call to action on every page; `LegalPage` the legal page shell (pages pass `sections`, the shell builds the table of contents); `ImageModal` the lightbox; `icons.tsx` every shared SVG icon.
- **`src/hooks/useScrollLock.ts`** stops the page scrolling behind an overlay. It is an identical copy of the platform's hook (the apps share no code), so change both together. Every overlay uses it; never set `overflow` on `body` or `html` by hand.
- **`src/pages/`**: `index` (hero with the dark/light dashboard slider, challenges, features, CTA), `features`, `about` (the former `/story` and `/founders-note` redirect here), `contact` (form with CASL consent and the honeypot), `privacy`, `terms`, and `api/contact.ts` (a filled honeypot gets the usual 200 and nothing is sent; 5 valid submissions per IP per hour, then 429 with `Retry-After`).
- **Redirects** (`next.config.ts`): `/login` and `/register` to the platform; `/story` and `/founders-note` to `/about`; `/pricing` to `/` (all permanent).

## Rules

- Content and copy live in `src/lib/` data files or page JSX; components stay copy-free where practical.
- Every CTA goes through `ButtonLink`; URLs come from `src/lib/site.ts`. Native buttons use `Button` from `Button.tsx`; never hand-roll button class strings.
- Page widths and gutters come from `Container`; never hand-roll them. Prose nests a `max-w-3xl` block inside it.
- Add nav and footer entries in `site.ts`, not in components. There is no "Home" link; the logo links home.
- Entrance animations use `Reveal`; no bespoke CSS keyframe utilities.
- New SVG icons go in `src/components/icons.tsx`, never inline in a component.
- `CTAPanel` sits directly under page content, **outside** any narrower content container, and takes no card children.
- Legal pages define a `SECTIONS: LegalSectionData[]` array and use the `LegalPage` primitives (`BulletList`, `Callout`, `QuickSummary`, `EmailContactCard`); every box on them is neutral stone.
- Analytics: GA4 Enhanced Measurement tracks page views, client-side route changes included. Never add manual page-view tracking; `src/utils/analytics.ts` covers CTA clicks and form submissions only.

## Design system (premium minimal)

- **Layout**: every page-level block is `max-w-6xl px-6 lg:px-8` (through `Container`); long-form prose sits in a `max-w-3xl` block inside it. The header is full-bleed with the same gutters. One vertical scale: sections `py-24 md:py-32` (or the pt/pb/mt equivalents), page bottoms `pb-24 md:pb-32`, heading to content `mb-12 md:mb-16`, `PageHero` `mb-16 md:mb-24`. Card grids use `gap-5`. Radius ladder: `rounded-lg` controls, `rounded-xl` cards and tiles, `rounded-2xl` panels. Don't add a width, spacing, gap or radius value without updating this section.
- **Color**: near-monochrome. White background, Tailwind **stone** neutrals for all text and borders. The amber `primary` palette (in `@theme` in `globals.css`) appears **only** on primary buttons, the logo icon and link hovers. Headings are solid `stone-900` with no highlighted words. No gradients, glows, badges, pills or dark sections.
- **Typography**: Inter. Headings `font-semibold tracking-tight` in **sentence case** ("Get organized today"); the home hero uses fluid `clamp()` sizing; inner-page h1 `text-3xl sm:text-4xl lg:text-5xl`. Body and leads are `text-lg` (leads `md:text-xl`) in `text-stone-600` or `stone-700` with narrow measures (`max-w-xl`, `max-w-2xl`), never below `text-base` for content (small sizes only for captions and meta). Fix thin-looking text with size and contrast, not weight; never `font-bold` or `font-extrabold` for headings.
- **Voice**: premium and quiet. No salesy qualifiers ("100% Free!", "No credit card required" rows, pill badges). Free for students is stated once, plainly, where it matters. There is no pricing page.
- **Tagline**: "Always ahead, never behind." is the single brand line (hero h1, footer, default meta title). Don't add other slogans.
- **Tiling**: avoid uniformly stacked blocks. Use the `FeatureGrid` layouts for wide/narrow rhythm, and hairline-divided tile grids (`gap-px` over a `bg-stone-200` container) for list-like content.
- **Surfaces (two-tone, no outlines)**: sections alternate `bg-white` and `bg-stone-50` bands. Cards are **borderless** and take the opposite tone of their band: `bg-stone-50` cards on white sections (hover `bg-stone-100`), `bg-white` cards on stone-50 bands. No decorative borders; borders remain only on the comparison-slider handle and typographic rules (blockquote bar, signature divider). Form inputs are **filled** (`bg-stone-100`, borderless, white with a primary ring on focus). The footer is a `bg-stone-50` band under the white `CTAPanel`, so two stone zones never touch. The hero preview has one soft large shadow.
- **Header**: fixed full-bleed bar (`bg-white/85 backdrop-blur`) that gains a soft shadow, not a border, once the page scrolls, in a three-zone grid: logo far left, page links centered, Login and Get started far right.
- **Buttons**: pair one `primary` CTA with a `ghost` text link, never two boxed buttons. The primary CTA label is **"Get started"** everywhere (analytics `trackLabel`s stay page-specific).
- **Motion**: subtle only. `Reveal` (a small fade-up on scroll) and the arrow nudge on button hover; both respect `prefers-reduced-motion`.
- **CSS utilities** (`globals.css`): `.pt-page` (fixed-header offset, notch included), `.pt-safe-only`, `.filter-primary` (tints the SVG logo).
- **Scrollbars**: the platform's recipe ("Scrollbars" in `apps/web/standards.md`) in stone-500. The fixed header uses `right-[var(--scroll-lock-strip,0px)]` instead of `inset-x-0`, so it keeps its width while an overlay locks the page.

## Content

Asetta is positioned as a free academic planner with six features: AI extraction, the grade calculator, calendar and deadlines, semester organization, assessment tracking, and notes. Copy is concise and in sentence case; every CTA leads to the platform.

The legal pages reflect that Asetta is operated from Ontario, Canada: PIPEDA compliance, breach notification, cross-border (US) data storage, age eligibility (13+), termination, and Ontario governing law and venue. Have a lawyer review them before relying on them.
