import type { LineageVisualNode } from "~/lib/lineage/to-lineage-visual"

/**
 * Promotion-date provenance helpers (the lineage USP). The timeline orders + dates
 * the tree off these; a null/invalid date sorts last so dated promotions read first.
 * Pure + presentation-only — colocated with the timeline module, no React, no DB.
 */

/** Year label (UTC) for a connector rail / row chip, or null when undated/invalid. */
export function promotionYear(iso: string | null): string | null {
  if (!iso) return null
  const year = new Date(iso).getUTCFullYear()
  return Number.isNaN(year) ? null : String(year)
}

/**
 * "Mon YYYY" (UTC) for the card provenance line, or null when undated/invalid.
 *
 * WL-P2-45 rider d (Desi LOW-2): widened from `string | null` to also accept `Date`
 * so the directory-profile ranks section (`RanksSection`, which reads Prisma `Date`
 * columns) shares THIS formatter instead of its duplicated local `formatPromotedOn`.
 */
export function formatPromotionDate(date: Date | string | null): string | null {
  if (!date) return null
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
}

/**
 * Chronological comparator (earliest promotion first; undated members sort last —
 * reading down a branch = forward in time). Only reads `promotionDate`, so it
 * accepts any node-shaped row carrying that field.
 */
export function sortByPromotion(
  a: Pick<LineageVisualNode, "promotionDate">,
  b: Pick<LineageVisualNode, "promotionDate">,
): number {
  const at = a.promotionDate ? new Date(a.promotionDate).getTime() : Number.POSITIVE_INFINITY
  const bt = b.promotionDate ? new Date(b.promotionDate).getTime() : Number.POSITIVE_INFINITY
  return at - bt
}
