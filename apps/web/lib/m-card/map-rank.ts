import type { MCardData } from "~/components/web/m-card/m-card"

/**
 * Rank mapper (PWCC-002 slice 2) — a projected belt group → `MCardData["rank"]`.
 *
 * Spec: `docs/knowledge/wiki/files/m-card-pattern.md` (kind→DTO binding table; the `rank`
 * DTO slice is `{ id; name; colorHex?; disciplineCode?; count?; items?: { id; label; done? }[] }`).
 *
 * **Presentation-only / redaction is upstream.** This mapper consumes an ALREADY-projected,
 * already-public belt-group shape — a `Rank` (name + data-driven `colorHex` tint, ADR 0022)
 * with its grouped member `count` and optional curriculum `items` (techniques bounded by the
 * belt). It adds NO fetch and NO redaction, and reads ONLY the public presentation fields. No
 * member identity, no non-public field, ever reaches the card here — the count is an aggregate
 * and the curriculum items are public technique labels.
 */

/** A curriculum technique reduced to its presentation fields (public label + done state). */
export type RankCurriculumItem = {
  id: string
  label: string
  done?: boolean
}

/**
 * The already-projected, already-public belt group this mapper consumes. A surface builds this
 * from `Rank` (+ a grouped `RankAward` count and/or curriculum techniques between beltMin/Max);
 * the gating/aggregation happens in the query, NOT here.
 */
export type RankGroupProjection = {
  id: string
  name: string
  colorHex?: string | null
  disciplineCode?: string | null
  /** Members holding this rank (aggregate count — never a member list). */
  count?: number
  /** Public curriculum techniques bounded by this belt (optional). */
  items?: RankCurriculumItem[]
}

export function mapRankGroupToCard(group: RankGroupProjection): MCardData["rank"] {
  return {
    id: group.id,
    name: group.name,
    colorHex: group.colorHex ?? null,
    disciplineCode: group.disciplineCode ?? null,
    count: group.count,
    items: group.items?.map(item => ({
      id: item.id,
      label: item.label,
      done: item.done,
    })),
  }
}
