# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Asetta is a landing page for an AI-powered academic management platform. The landing page showcases features like assessment tracking, deadline management, and personalized insights for students. The project is built as a marketing site that redirects users to the main application at `https://asetta.vercel.app`.

## Tech Stack & Architecture

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Email**: Nodemailer for contact form
- **Fonts**: Google Fonts (Outfit & Lexend)
- **Deployment**: Designed for static hosting (Vercel/Netlify)

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure & Key Components

### Pages Architecture

- **Landing Page** (`src/pages/index.tsx`): Main hero section with features overview and CTAs
- **Features Page** (`src/pages/features.tsx`): Detailed feature explanations (6 features total)
- **Pricing Page** (`src/pages/pricing.tsx`): Humorous "100% Free" messaging with student-focused copy
- **Contact Page** (`src/pages/contact.tsx`): Functional contact form with React state management
- **Legal Pages**: Privacy (`privacy.tsx`) and Terms (`terms.tsx`) with basic legal content
- **App Configuration** (`src/pages/_app.tsx`): Font loading, metadata, and route change tracking

### Component Architecture

- **Header** (`src/components/Header.tsx`): Fixed navigation with scroll-based background changes, mobile menu (non-functional), and Framer Motion animations
- **Footer** (`src/components/Footer.tsx`): Site-wide footer with LinkedIn link and organized navigation
- Components use TypeScript interfaces and follow consistent naming conventions
- Mobile menu in header is present but not implemented (shows button but no menu)

### API Routes

- **Contact API** (`src/pages/api/contact.ts`): Handles contact form submissions via Nodemailer
  - Requires `EMAIL_USER` and `EMAIL_PASS` environment variables
  - Sends emails to `videna.psalmeleazar@gmail.com`
  - Includes email validation and error handling

## Design System

### Color Palette

- **Primary**: Blue gradient system (50-900 scale) defined in `tailwind.config.ts`
- **Secondary**: Gray scale for text and backgrounds
- Custom color variables: `primary-*` and `secondary-*`

### Typography

- **Body Font**: Outfit (variable: `--font-outfit`)
- **Heading Font**: Lexend (variable: `--font-lexend`)
- Font weights: 300, 400, 500, 600, 700

### Animations

- Custom Tailwind animations: `fade-in`, `fade-in-down`, `scale`
- Framer Motion for component-level animations (header, buttons)
- Hover effects and transitions throughout

## External Integrations

### Redirects Configuration

- `/login` → `https://asetta.vercel.app/login`
- `/register` → `https://asetta.vercel.app/register`
- Configured in `next.config.ts` as permanent redirects

### Social Media Links

- LinkedIn: `https://www.linkedin.com/company/asetta/` (in footer)

### Image Assets

- Dashboard preview: `/images/kivo-dashboard.png`
- Complete favicon set in `/public/images/`
- Next.js Image optimization enabled

## Development Notes

### Styling Approach

- Utility-first with Tailwind CSS
- Custom design tokens in `tailwind.config.ts`
- Responsive design with mobile-first approach
- Consistent spacing and typography scales

### Code Conventions

- TypeScript strict mode enabled
- ESLint with Next.js core web vitals rules
- React 19 features and patterns
- Functional components with hooks

### Environment Variables Required

- `EMAIL_USER`: Gmail account for sending contact form emails
- `EMAIL_PASS`: App password for Gmail account

## Content Strategy

The landing page positions Asetta as a "100% Free for Students" AI-powered academic assistant with six core features:

1. AI-Powered Assessment Tracking
2. Smart Deadline Management
3. Personalized Insights
4. Smart Notifications
5. Document Processing
6. Course Management

The pricing page uses humorous, student-friendly messaging ("Save your money for that extra coffee during finals week!") to reinforce the free positioning. All CTAs direct users to the main application for registration and login.

## Known Issues/Limitations

- Mobile menu in header shows button but dropdown functionality is not implemented
- Contact form requires Gmail SMTP setup for production use
- Some animations use `animate-fade-in-delayed` class that may not be defined in Tailwind config
