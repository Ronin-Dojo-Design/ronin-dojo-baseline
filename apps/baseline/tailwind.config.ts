import type { Config } from "tailwindcss";

/**
 * Baseline — every color maps to a CSS variable in app/globals.css, so a brand
 * swap (real school palette) is a one-file change. The token names here are the
 * utility surface (bg-bg, text-ink, bg-primary, border-border, …); the values
 * live as --css-vars. See lib/brand.ts for the data mirror + identity copy.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--surface-elevated)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          deep: "var(--primary-deep)",
          foreground: "var(--on-primary)",
        },
        ink: "var(--text-primary)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
      },
    },
  },
  plugins: [],
};

export default config;
