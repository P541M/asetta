import type { Config } from "tailwindcss";
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e6f7ff",
          100: "#ccefff",
          200: "#99dfff",
          300: "#66cfff",
          400: "#33bfff",
          500: "#009cff",
          600: "#008cff",
          700: "#007cff",
          800: "#006cff",
          900: "#005cff",
        },
        secondary: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        accent: {
          50: "#e6f7ff",
          100: "#ccefff",
          200: "#99dfff",
          300: "#66cfff",
          400: "#33bfff",
          500: "#009cff",
          600: "#008cff",
          700: "#007cff",
          800: "#006cff",
          900: "#005cff",
        },
        dark: {
          "bg-primary": "#0A0A0A", // Darker main background for better contrast
          "bg-secondary": "#1A1A1A", // Slightly lighter secondary background
          "bg-tertiary": "#2A2A2A", // Adjusted tertiary background
          "text-primary": "#FFFFFF", // Keep white for primary text
          "text-secondary": "#E5E5E5", // Brighter secondary text
          "text-tertiary": "#B0B0B0", // Brighter tertiary text
          "border-primary": "#404040", // Brighter border color
          "border-secondary": "#505050", // Brighter secondary border
          "hover-primary": "#2A2A2A", // Adjusted hover state
          "hover-secondary": "#3A3A3A", // Adjusted secondary hover
          "focus-ring": "#009cff", // Keep focus ring color
          "input-bg": "#1A1A1A", // Adjusted input background
          "input-border": "#404040", // Brighter input border
          "input-text": "#FFFFFF", // Keep white for input text
          "input-placeholder": "#B0B0B0", // Brighter placeholder text
          "button-primary": "#009cff", // Keep primary button color
          "button-primary-hover": "#008cff", // Keep primary button hover
          "button-secondary": "#2A2A2A", // Adjusted secondary button
          "button-secondary-hover": "#3A3A3A", // Adjusted secondary button hover
          "success-bg": "rgba(16, 185, 129, 0.15)", // Slightly more visible success background
          "success-text": "#10B981", // Keep success text
          "warning-bg": "rgba(245, 158, 11, 0.15)", // Slightly more visible warning background
          "warning-text": "#F59E0B", // Keep warning text
          "error-bg": "rgba(239, 68, 68, 0.15)", // Slightly more visible error background
          "error-text": "#EF4444", // Keep error text
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
        heading: ["Lexend", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-in-down": "fadeInDown 0.3s ease-in-out",
        scale: "scale 0.3s ease-in-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scale: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
