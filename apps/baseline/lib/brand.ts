/**
 * Baseline — the white-label brand-tokens kit (TASK_03, SESSION_0463).
 *
 * THE ONE FILE YOU EDIT to stand up a new school site. Baseline's whole point is
 * that re-skinning is a token swap, not a code change: change the values here (and
 * the matching CSS-variable hex in `app/globals.css`), drop in a logo, and the
 * site is yours. No component edits.
 *
 * Two layers, kept deliberately separate:
 *
 *   1. CONTENT identity  → `brand` (below): name, tagline, contact, nav. Data.
 *      In production these can come from the `SchoolSettings` DB row (so a
 *      non-developer owner edits them in an admin UI); this object is the
 *      build-time default / single-school fallback.
 *
 *   2. COLOR + TYPE tokens → CSS custom properties in `app/globals.css`. The UI
 *      reads `var(--...)` only — never a literal hex — so a palette swap is a
 *      one-block change. `brandColors` below mirrors those values as data for
 *      any consumer that can't read CSS vars (e.g. an OG-image renderer), exactly
 *      as the shared kernel's `tokens.ts` does for `--mk-*`.
 *
 * Bridging to the shared kernel (@ronin-dojo/ui-kit): the kernel reads ONLY its
 * own `--mk-*` vars (ADR 0033 D2). `app/globals.css` re-maps `--mk-accent:
 * var(--accent)` etc., so the kernel's m-card / AdminKanban inherit Baseline's
 * brand automatically. Re-skin once, the kernel follows.
 */

/** The customizable color surface — every value is also a CSS var in globals.css. */
export type BrandColors = {
  /** Page backdrop. */
  bg: string;
  /** Card / panel surface. */
  surface: string;
  /** Raised surface (modals, popovers, sticky headers). */
  elevated: string;
  /** Hairlines, dividers, input borders. */
  border: string;
  /** The ONE focal/CTA color — the school's signature. */
  primary: string;
  /** Hover state for the primary. */
  primaryHover: string;
  /** Pressed / deep variant of the primary. */
  primaryDeep: string;
  /** Ink on a primary-filled button (usually the bg or white). */
  onPrimary: string;
  /** Primary body / heading text. */
  text: string;
  /** Secondary / meta text. */
  muted: string;
};

/** The customizable type surface — mirrors the CSS font vars in globals.css. */
export type BrandFonts = {
  /** Display / heading stack (school name, hero, section titles). */
  display: string;
  /** Body / UI stack. */
  sans: string;
};

/** The content identity a school owner edits (name, copy, contact, nav). */
export type BrandIdentity = {
  schoolName: string;
  tagline: string;
  /** Hero block copy — the first thing a prospect reads. */
  hero: { headline: string; sub: string; cta: string };
  contact: { email: string; phone?: string; address?: string };
  /** Top-nav links. Keep it short; a school site is a funnel, not a portal. */
  nav: { label: string; href: string }[];
};

/**
 * The default Baseline brand. THIS is the white-label fallback — neutral, slate +
 * a single confident accent, dark-mode-first (matches the kernel + Mammoth). Swap
 * these for a real school's palette and the whole site re-skins.
 *
 * Keep `brandColors` in lockstep with the `:root` block in `app/globals.css` —
 * the CSS vars are the runtime source of truth; this object is the data mirror.
 */
export const brandColors: BrandColors = {
  bg: "#0d0f12",
  surface: "#15181d",
  elevated: "#1d2127",
  border: "#2a2f37",
  primary: "#3b82f6",
  primaryHover: "#60a5fa",
  primaryDeep: "#2563eb",
  onPrimary: "#0d0f12",
  text: "#f3f5f7",
  muted: "#9aa3ad",
};

export const brandFonts: BrandFonts = {
  display: '"Saira", "Bahnschrift", "Arial Narrow", system-ui, sans-serif',
  sans: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

export const brand: BrandIdentity = {
  schoolName: "Baseline Martial Arts",
  tagline: "Train where the lineage runs deep.",
  hero: {
    headline: "Find your dojo.",
    sub: "A modern martial-arts school site — lean, fast, and ready to make yours. Swap the brand tokens and go.",
    cta: "Book a free intro class",
  },
  contact: {
    email: "hello@baselinemartialarts.com",
    phone: undefined,
    address: undefined,
  },
  nav: [
    { label: "Programs", href: "#programs" },
    { label: "Schedule", href: "#schedule" },
    { label: "Visit", href: "#visit" },
  ],
};
