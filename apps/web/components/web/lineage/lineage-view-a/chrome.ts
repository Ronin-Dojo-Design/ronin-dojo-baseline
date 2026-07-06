/**
 * Ratified BBL "legacy/authoritative" chrome (SESSION_0394) — solid surfaces
 * that replace glassmorphism (no backdrop-blur). These literal box-shadow /
 * border / background values are the design contract; they are shared verbatim
 * across the lineage explorer's extracted parts (filter bar, metrics header,
 * pills). Do NOT retokenize — the literals ARE the ratified law.
 */

export const SOLID_PANEL =
  "border border-white/8 bg-[#0c0c0d] shadow-[0_20px_60px_-26px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.045)]"

export const SOLID_PILL =
  "border border-white/8 bg-[#101011] shadow-[0_12px_30px_-18px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.04)]"
