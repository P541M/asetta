import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          "bg-primary": "#FFFFFF",
          "bg-secondary": "#FAFAFA",
          "bg-tertiary": "#F5F5F5",
          "text-primary": "#1A1A1A",
          "text-secondary": "#404040",
          "text-tertiary": "#8A8A8A",
          "border-primary": "#E5E5E5",
          "border-secondary": "#E5E5E5",
          "hover-primary": "#F5F5F5",
          "hover-secondary": "#F0F0F0",
          "focus-ring": "#D97706",
          "input-bg": "#FFFFFF",
          "input-border": "#E5E5E5",
          "input-text": "#1A1A1A",
          "input-placeholder": "#8A8A8A",
          "button-primary": "#D97706",
          "button-primary-hover": "#B45309",
          "button-secondary": "#F5F5F5",
          "button-secondary-hover": "#F0F0F0",
          "success-bg": "rgba(16, 185, 129, 0.1)",
          "success-text": "#059669",
          "warning-bg": "rgba(245, 158, 11, 0.1)",
          "warning-text": "#D97706",
          "error-bg": "rgba(239, 68, 68, 0.1)",
          "error-text": "#DC2626",
        },
        primary: {
          50: "#fefaf7",
          100: "#fef2e8",
          200: "#fde2c8",
          300: "#fbcb9e",
          400: "#f7aa67",
          500: "#f39441",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
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
      },
      fontFamily: {
        sans: [
          "var(--font-manrope)",
          "Manrope",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        heading: [
          "var(--font-manrope)",
          "Manrope",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out both",
        "fade-in-down": "fadeInDown 0.6s ease-out both",
        "fade-in-delayed": "fadeIn 0.6s ease-out 0.3s both",
        "fade-in-up": "fadeInUp 0.6s ease-out both",
        "fade-in-left": "fadeInLeft 0.6s ease-out both",
        "fade-in-right": "fadeInRight 0.6s ease-out both",
        scale: "scale 0.6s ease-out both",
        "scale-delayed": "scale 0.6s ease-out 0.2s both",
        bounce: "bounce 1s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 3s ease-in-out infinite",
        "gradient-x": "gradientX 15s ease infinite",
        "gradient-y": "gradientY 15s ease infinite",
        "gradient-xy": "gradientXY 15s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scale: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        gradientX: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        gradientY: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "center top",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "center bottom",
          },
        },
        gradientXY: {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "400% 400%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
