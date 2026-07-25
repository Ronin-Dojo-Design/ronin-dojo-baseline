/**
 * Pure param-normalization for the belt-color promotion OG card (SESSION_0705 — the PL-027
 * renderer graduation of the #288/#292 `scripts/prototypes/bbl-og-cards/` prototype, which app
 * code must not import; the belt-color validation idiom is copied/adapted from it).
 *
 * Everything here is pure and unit-tested: `/api/og` is a PUBLIC endpoint, so every card param
 * arrives as untrusted query-string input. Normalization is the whole security posture:
 * - the belt color must be a hex literal or it falls back to the brand accent (a raw string
 *   would otherwise flow into an inline style);
 * - free-text lines are length-clamped so a crafted URL cannot blow up the render;
 * - missing/legacy inputs (title/description-only payloads from before graduation) return
 *   `null` → the route falls back to the generic `OgBase`, never a broken card.
 */

/** The `card=` discriminator for the rank-promotion celebration card. */
export const OG_CARD_RANK_PROMOTION = "rank-promotion"

/**
 * Fallback accent when no valid belt color arrives (prototype `PALETTE.accent`; brand-token
 * literal — the OG route renders outside the DB-driven BrandSettings CSS pipeline).
 */
export const OG_BELT_COLOR_FALLBACK = "hsl(1 79% 51%)"

/** #RGB / #RGBA / #RRGGBB / #RRGGBBAA — anything else is not a color we will inline-style. */
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

/** Validated belt color, or the brand-accent fallback (never a raw untrusted string). */
export const safeBeltColorHex = (value: string | null | undefined): string =>
  value != null && HEX_COLOR_RE.test(value) ? value : OG_BELT_COLOR_FALLBACK

/** Length-clamp a free-text line from the query string (ellipsis when truncated). */
const clamp = (value: string, max: number): string =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value

export type PromotionCardParams = {
  name: string
  beltName: string
  /** Always render-safe: validated hex or the accent fallback. */
  beltColor: string
  date: string | null
  lineageLine: string | null
}

/**
 * Normalize the raw `/api/og` query params into render-safe card props, or `null` when this
 * is not a (complete) promotion-card request — the route then renders the generic `OgBase`.
 * Null-safe for empty/legacy payload URLs by construction: `card`, `name`, and `beltName`
 * are all required for the variant to activate.
 */
export const parsePromotionCardParams = (input: {
  card: string | null
  name: string | null
  beltName: string | null
  beltColorHex: string | null
  date: string | null
  lineageLine: string | null
}): PromotionCardParams | null => {
  if (input.card !== OG_CARD_RANK_PROMOTION) return null

  const name = input.name?.trim()
  const beltName = input.beltName?.trim()
  if (!name || !beltName) return null

  return {
    name: clamp(name, 80),
    beltName: clamp(beltName, 60),
    beltColor: safeBeltColorHex(input.beltColorHex),
    date: input.date?.trim() ? clamp(input.date.trim(), 40) : null,
    lineageLine: input.lineageLine?.trim() ? clamp(input.lineageLine.trim(), 160) : null,
  }
}
