import type { Prisma } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Slice B (SESSION_0442) — resolve the Join-the-Legacy wizard's lineage refs that the
 * free/Tool intake persists into `Lead.meta`.
 *
 * The creatable comboboxes store BOTH a typed ref id (a *registered* pick) AND the text
 * (a *custom* entry) — see `createJoinLegacyInterest`. The claim path (Slice A) gets typed
 * FK columns on `PassportClaimRequest` and resolves them via Prisma relations; the
 * free/Tool path has no claim row, so the refs live only as ids inside `lead.meta` JSON.
 * This resolver is the free-path counterpart: parse the JSON, look up each registered id,
 * and fall back to the custom text when there is no id (or the id no longer resolves).
 */

export type LeadLineageMeta = {
  currentRank: string | null
  currentRankId: string | null
  schoolName: string | null
  schoolOrgId: string | null
  trainedUnder: string | null
  trainedUnderNodeId: string | null
  represent: string | null
  representTreeId: string | null
}

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null

/**
 * Pure extraction of the lineage fields from a `Lead.meta` JSON value. Defensive: any
 * non-object meta (null, array, scalar) yields all-null. Exported for unit testing without
 * a DB.
 */
export function parseLeadLineageMeta(meta: Prisma.JsonValue | null | undefined): LeadLineageMeta {
  const record =
    meta && typeof meta === "object" && !Array.isArray(meta)
      ? (meta as Record<string, unknown>)
      : {}

  return {
    currentRank: asString(record.currentRank),
    currentRankId: asString(record.currentRankId),
    schoolName: asString(record.schoolName),
    schoolOrgId: asString(record.schoolOrgId),
    trainedUnder: asString(record.trainedUnder),
    trainedUnderNodeId: asString(record.trainedUnderNodeId),
    represent: asString(record.represent),
    representTreeId: asString(record.representTreeId),
  }
}

/** A resolved lineage selection: a verified registered entity, or the raw custom text. */
export type LeadLineageSelection<TRegistered> =
  | ({ kind: "registered" } & TRegistered)
  | { kind: "custom"; text: string }
  | null

export type ResolvedLeadLineageSelections = {
  rank: LeadLineageSelection<{ name: string; shortName: string | null; colorHex: string | null }>
  school: LeadLineageSelection<{ name: string; slug: string }>
  trainedUnder: LeadLineageSelection<{ name: string }>
  represent: LeadLineageSelection<{ name: string; slug: string }>
}

/** True when at least one selection (registered or custom) is present. */
export function hasLeadLineageSelections(resolved: ResolvedLeadLineageSelections): boolean {
  return Boolean(resolved.rank || resolved.school || resolved.trainedUnder || resolved.represent)
}

/**
 * Resolve a `Lead.meta` JSON value into displayable lineage selections. Registered ids are
 * looked up concurrently; a missing/stale id degrades to the custom text (or null). Returns
 * `null` when there is nothing to show so the caller can skip the card entirely.
 */
export async function resolveLeadLineageSelections(
  meta: Prisma.JsonValue | null | undefined,
): Promise<ResolvedLeadLineageSelections | null> {
  const parsed = parseLeadLineageMeta(meta)

  const [rank, school, node, tree] = await Promise.all([
    parsed.currentRankId
      ? db.rank.findUnique({
          where: { id: parsed.currentRankId },
          select: { name: true, shortName: true, colorHex: true },
        })
      : null,
    parsed.schoolOrgId
      ? db.organization.findUnique({
          where: { id: parsed.schoolOrgId },
          select: { name: true, slug: true },
        })
      : null,
    parsed.trainedUnderNodeId
      ? db.lineageNode.findUnique({
          where: { id: parsed.trainedUnderNodeId },
          select: { passport: { select: { displayName: true } } },
        })
      : null,
    parsed.representTreeId
      ? db.lineageTree.findUnique({
          where: { id: parsed.representTreeId },
          select: { name: true, slug: true },
        })
      : null,
  ])

  const resolved: ResolvedLeadLineageSelections = {
    rank: rank
      ? { kind: "registered", name: rank.name, shortName: rank.shortName, colorHex: rank.colorHex }
      : parsed.currentRank
        ? { kind: "custom", text: parsed.currentRank }
        : null,
    school: school
      ? { kind: "registered", name: school.name, slug: school.slug }
      : parsed.schoolName
        ? { kind: "custom", text: parsed.schoolName }
        : null,
    trainedUnder: node
      ? { kind: "registered", name: node.passport?.displayName ?? "Lineage member" }
      : parsed.trainedUnder
        ? { kind: "custom", text: parsed.trainedUnder }
        : null,
    represent: tree
      ? { kind: "registered", name: tree.name, slug: tree.slug }
      : parsed.represent
        ? { kind: "custom", text: parsed.represent }
        : null,
  }

  return hasLeadLineageSelections(resolved) ? resolved : null
}
