import "server-only"

import { unstable_cache } from "next/cache"
import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"
import { getBjjRanksForClaimPicker } from "~/server/web/lineage/rank-queries"

/**
 * Option lists for the Join-the-Legacy wizard's creatable comboboxes
 * (SESSION_0441). All four sources are PUBLIC, BBL-scoped, and serializable
 * (plain `{ id, name }`, plus `colorHex` for the belt swatch) so they can be
 * server-loaded and passed as props into the account-optional, `"use client"`
 * wizard — no Prisma in the client bundle.
 *
 * Each list is a REGISTERED source; the combobox always allows a free-typed
 * custom value too, so the lists need only cover the common case (and stay
 * capped — the roster is bounded, filtering happens client-side).
 */

// The instructor roster is bounded (BBL is one brand) — a generous cap keeps the
// payload small while covering the whole list for client-side filtering.
const INSTRUCTOR_CAP = 300
const SCHOOL_CAP = 300
const TREE_CAP = 100

export type JoinRankOption = { id: string; name: string; colorHex: string | null }
export type JoinNamedOption = { id: string; name: string }

export type JoinWizardOptions = {
  ranks: JoinRankOption[]
  schools: JoinNamedOption[]
  instructors: JoinNamedOption[]
  trees: JoinNamedOption[]
}

/** BBL rank ladder → `currentRank` picker (feeds `claimedRankId`, ADR 0035). */
async function getRankOptions(): Promise<JoinRankOption[]> {
  const ranks = await getBjjRanksForClaimPicker()
  return ranks.map(rank => ({ id: rank.id, name: rank.name, colorHex: rank.colorHex }))
}

/** BBL organizations → `schoolName` picker (links the org on a registered match). */
async function getSchoolOptions(): Promise<JoinNamedOption[]> {
  return db.organization.findMany({
    where: { brand: Brand.BBL },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: SCHOOL_CAP,
  })
}

/**
 * BBL lineage people → `trainedUnder` (instructor) picker. Queried off
 * `LineageNode` directly (one row per node — no cross-tree duplicates) where the
 * node is a member of a published BBL tree. `id` is the node id, the same ref
 * the claim path links. Falls back to the Passport's `user.name` when the
 * Passport has no `displayName`; nameless placeholders are dropped.
 */
async function getInstructorOptions(): Promise<JoinNamedOption[]> {
  const nodes = await db.lineageNode.findMany({
    where: {
      visibility: "PUBLIC",
      treeMembers: { some: { tree: { brand: Brand.BBL, isPublished: true } } },
    },
    select: {
      id: true,
      passport: { select: { displayName: true, user: { select: { name: true } } } },
    },
    orderBy: { passport: { displayName: "asc" } },
    take: INSTRUCTOR_CAP,
  })

  return nodes
    .map(node => ({
      id: node.id,
      name: node.passport?.displayName ?? node.passport?.user?.name ?? "",
    }))
    .filter(option => option.name.trim().length > 0)
}

/** Published BBL lineage trees → `represent` picker (trees-only, SESSION_0441). */
async function getTreeOptions(): Promise<JoinNamedOption[]> {
  return db.lineageTree.findMany({
    where: { brand: Brand.BBL, isPublished: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: TREE_CAP,
  })
}

/**
 * Load all four wizard option lists in parallel. Cross-request cached (300s): the
 * lists are slow-moving public reference data shared by every visitor, and the
 * global join modal (SESSION_0445 #7) loads them on every signed-out page render —
 * the cache keeps that to one query batch every 5 min instead of one per page view.
 */
export const getJoinWizardOptions = unstable_cache(
  async (): Promise<JoinWizardOptions> => {
    const [ranks, schools, instructors, trees] = await Promise.all([
      getRankOptions(),
      getSchoolOptions(),
      getInstructorOptions(),
      getTreeOptions(),
    ])
    return { ranks, schools, instructors, trees }
  },
  ["join-wizard-options"],
  { revalidate: 300, tags: ["join-wizard-options"] },
)
