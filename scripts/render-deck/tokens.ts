// scripts/render-deck/tokens.ts
//
// Brand palette/type tokens for the render-deck renderer. Deliberately local and
// standalone — this duplicates the token idea already prototyped in scripts/render-doc
// (unmerged, PR #268). See "Proposed ledger edits" in docs/sprints/SESSION_0650.md for
// the G-030 consolidation note; do not import across the two dirs.
//
// Hex values are sourced by reading (not importing) the live brand CSS as of this
// session: apps/web/app/styles.css ([data-brand="BBL"]), clients/mammoth-build-crm/app/
// globals.css (--primary), apps/rdd/app/globals.css (--primary).

export type Brand = "rdd" | "bbl" | "mmb";

export interface BrandTokens {
  /** Human-readable brand name shown in the deck eyebrow/footer. */
  name: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryDeep: string;
  ink: string;
  muted: string;
  mutedDeep: string;
  fontDisplay: string;
  fontSans: string;
}

const FONT_SANS =
  '-apple-system, "Segoe UI", system-ui, Roboto, Helvetica, Arial, sans-serif';

export const BRAND_TOKENS: Record<Brand, BrandTokens> = {
  rdd: {
    name: "Ronin Dojo Design",
    bg: "#0d0f12",
    surface: "#15181d",
    surfaceElevated: "#1d2127",
    border: "#2a2f37",
    primary: "#3b82f6",
    primaryHover: "#60a5fa",
    primaryDeep: "#2563eb",
    ink: "#f3f5f7",
    muted: "#9aa3ad",
    mutedDeep: "#6b7280",
    fontDisplay: '"SF Compact Display", system-ui, sans-serif',
    fontSans: FONT_SANS,
  },
  bbl: {
    name: "Black Belt Legacy",
    bg: "#0a0a0a",
    surface: "#121212",
    surfaceElevated: "#1c1c1c",
    border: "#2b2b2b",
    primary: "#e52421",
    primaryHover: "#ff4c47",
    primaryDeep: "#b81c19",
    ink: "#ffffff",
    muted: "#a3a3a3",
    mutedDeep: "#6b6b6b",
    fontDisplay: '"Bebas Neue", Impact, system-ui, sans-serif',
    fontSans: FONT_SANS,
  },
  mmb: {
    name: "Mammoth Build",
    bg: "#0e0f11",
    surface: "#16181b",
    surfaceElevated: "#1f2226",
    border: "#2a2e33",
    primary: "#ff6a1a",
    primaryHover: "#ff8338",
    primaryDeep: "#c24e12",
    ink: "#f4f5f6",
    muted: "#9ba1a8",
    mutedDeep: "#6f7680",
    fontDisplay: '"Bahnschrift", "SF Compact Display", "Arial Narrow", system-ui, sans-serif',
    fontSans: FONT_SANS,
  },
};

export function isBrand(value: string): value is Brand {
  return value === "rdd" || value === "bbl" || value === "mmb";
}

export function getBrandTokens(brand: string): BrandTokens {
  if (!isBrand(brand)) {
    throw new Error(`render-deck: unknown brand "${brand}" — expected rdd | bbl | mmb`);
  }
  return BRAND_TOKENS[brand];
}
