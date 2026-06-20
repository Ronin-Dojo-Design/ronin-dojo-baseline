import type { Config } from "tailwindcss";

/**
 * Palette is provisional (Desi spec) — every color maps to a CSS variable in
 * app/globals.css, so a brand-asset swap (real Mammoth logo hex) is a one-file change.
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
        },
        ink: "var(--text-primary)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        display: "var(--font-display)",
        sans: "var(--font-sans)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        pop: "pop 220ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
