/**
 * Canonical token literals for the shared kernel, as data.
 *
 * The runtime styling lives in `tokens.css` (CSS custom properties). This module exposes the
 * same values for tooling, brand-swap generators, and any consumer that needs the literal (e.g.
 * a Satori/OG image renderer that can't read CSS vars). Components themselves NEVER import a
 * literal — they reference `var(--mk-*)` only (ADR 0033 D2: tokens in, no brand identifiers in
 * the component).
 *
 * To theme a new brand: produce a `BrandTokenBlock` and emit a `:root { ... }` override, OR map
 * the kernel vars onto a host's existing tokens (e.g. `--mk-accent: var(--color-primary)`).
 */

export type BrandTokenBlock = {
  /** The one focal/accent color. BBL = brand red #E52421. */
  accent: string;
  accentStrong: string;
  onAccent: string;
  bg: string;
  page: string;
  surface: string;
  elevated: string;
  fg: string;
  muted: string;
  line: string;
};

/** Light mode (the default) — BBL brand. */
export const BBL_LIGHT: BrandTokenBlock = {
  accent: "#E52421",
  accentStrong: "#B91C1C",
  onAccent: "#FFFFFF",
  bg: "#FFFFFF",
  page: "#F5F5F5",
  surface: "#FAFAFA",
  elevated: "#FFFFFF",
  fg: "#1F1F1F",
  muted: "#737373",
  line: "#E0E0E0",
};

/** Dark mode — a true inversion; same hue accent lifted for AA contrast. */
export const BBL_DARK: BrandTokenBlock = {
  accent: "#FF4D49",
  accentStrong: "#FF7A75",
  onAccent: "#FFFFFF",
  bg: "#1C1C1E",
  page: "#000000",
  surface: "#2C2C2E",
  elevated: "#1C1C1E",
  fg: "#F5F5F5",
  muted: "#9A9AA0",
  line: "#2C2C2E",
};

/** The design-system type pair (heading is Poppins extrabold uppercase italic at the call site). */
export const FONTS = {
  head: '"Poppins","Segoe UI",Tahoma,sans-serif',
  body: '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  mono: "ui-monospace,SFMono-Regular,Menlo,monospace",
} as const;

/** Emit a brand block as a `:root`/`[data-theme]` selector body (for generators, not the app). */
export function brandTokenCss(block: BrandTokenBlock): string {
  return [
    `--mk-accent:${block.accent}`,
    `--mk-accent-strong:${block.accentStrong}`,
    `--mk-on-accent:${block.onAccent}`,
    `--mk-bg:${block.bg}`,
    `--mk-page:${block.page}`,
    `--mk-surface:${block.surface}`,
    `--mk-elevated:${block.elevated}`,
    `--mk-fg:${block.fg}`,
    `--mk-muted:${block.muted}`,
    `--mk-line:${block.line}`,
  ].join(";");
}
