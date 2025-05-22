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
          "bg-primary": "#121212", // Main background
          "bg-secondary": "#1E1E1E", // Secondary background
          "bg-tertiary": "#2D2D2D", // Tertiary background
          "text-primary": "#FFFFFF", // Primary text
          "text-secondary": "#E0E0E0", // Secondary text
          "text-tertiary": "#A0A0A0", // Tertiary text
          "border-primary": "#333333", // Primary border
          "border-secondary": "#404040", // Secondary border
          "hover-primary": "#2D2D2D", // Hover state
          "hover-secondary": "#333333", // Secondary hover state
          "focus-ring": "#009cff", // Focus ring color
          "input-bg": "#1E1E1E", // Input background
          "input-border": "#333333", // Input border
          "input-text": "#FFFFFF", // Input text
          "input-placeholder": "#A0A0A0", // Input placeholder
          "button-primary": "#009cff", // Primary button
          "button-primary-hover": "#008cff", // Primary button hover
          "button-secondary": "#2D2D2D", // Secondary button
          "button-secondary-hover": "#333333", // Secondary button hover
          "success-bg": "rgba(16, 185, 129, 0.1)", // Success background
          "success-text": "#10B981", // Success text
          "warning-bg": "rgba(245, 158, 11, 0.1)", // Warning background
          "warning-text": "#F59E0B", // Warning text
          "error-bg": "rgba(239, 68, 68, 0.1)", // Error background
          "error-text": "#EF4444", // Error text
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
