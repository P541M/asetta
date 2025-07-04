# Asetta Landing Page

A modern, AI-powered academic management platform landing page built with Next.js 15, React 19, TypeScript, and Tailwind CSS. This landing page showcases Asetta's features and serves as the marketing website that redirects users to the main application.

## 🚀 Features

- **Modern Design**: Clean, responsive UI with custom animations using Framer Motion
- **AI-Powered Branding**: Showcases smart academic features like assessment tracking and deadline management
- **100% Free Positioning**: Emphasizes the free nature of the platform for students
- **Contact System**: Integrated contact form with email functionality via Nodemailer
- **SEO Optimized**: Proper meta tags, structured data, and performance optimization
- **Mobile-First**: Fully responsive design across all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Email**: Nodemailer for contact form
- **Fonts**: Google Fonts (Outfit & Lexend)
- **Deployment**: Optimized for Vercel/Netlify

## 🏗️ Project Structure

```
asetta-landing/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Navigation with scroll effects
│   │   └── Footer.tsx          # Site footer with links
│   ├── pages/
│   │   ├── api/
│   │   │   └── contact.ts      # Contact form API endpoint
│   │   ├── _app.tsx            # App configuration & fonts
│   │   ├── index.tsx           # Landing page with hero & features
│   │   ├── features.tsx        # Detailed features page
│   │   ├── pricing.tsx         # Pricing (free) information
│   │   ├── contact.tsx         # Contact form page
│   │   ├── privacy.tsx         # Privacy policy
│   │   └── terms.tsx           # Terms of service
│   └── styles/
│       └── globals.css         # Global styles & Tailwind imports
├── public/
│   └── images/                 # Static assets & favicon set
├── tailwind.config.ts          # Custom design system
├── next.config.ts              # Next.js config with redirects
└── CLAUDE.md                   # Development guidance
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd asetta-landing
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env.local file with:
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

```bash
# Development with Turbopack (faster)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🎨 Design System

### Color Palette

- **Primary**: Custom blue gradient scale (50-900)
- **Secondary**: Gray scale for text and backgrounds
- **Usage**: Defined in `tailwind.config.ts` as `primary-*` and `secondary-*`

### Typography

- **Body Font**: Outfit (weights: 300-700)
- **Heading Font**: Lexend (weights: 300-700)
- **Implementation**: CSS variables in `_app.tsx`

### Animations

- **Custom**: `fade-in`, `fade-in-down`, `scale` animations
- **Motion**: Framer Motion for interactive elements
- **Hover Effects**: Consistent throughout the application

## 🔗 External Integrations

### Application Redirects

- `/login` → `https://asetta.vercel.app/login`
- `/register` → `https://asetta.vercel.app/register`

### Social Media

- LinkedIn: `https://www.linkedin.com/company/asetta/`

### Email Configuration

- Service: Gmail SMTP
- Contact form sends to: `videna.psalmeleazar@gmail.com`
- Requires Gmail app password for authentication

## 🌐 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel
```

### Netlify

```bash
npm run build
# Deploy dist folder to Netlify
```

### Environment Variables for Production

- `EMAIL_USER`: Gmail account for contact form
- `EMAIL_PASS`: Gmail app password

## 🎯 Content Strategy

The landing page positions Asetta as:

- **100% Free** academic assistant for students
- **AI-Powered** with smart features:
  - Assessment tracking from documents
  - Deadline management with notifications
  - Personalized academic insights
- **Student-Focused** with relatable messaging and design

## 📧 Contact

For questions or support:

- Email: videna.psalmeleazar@gmail.com
- LinkedIn: [Asetta Company Page](https://www.linkedin.com/company/asetta/)

## 📄 License

This project is proprietary and confidential.
