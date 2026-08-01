import { cacheLife, cacheTag } from "next/cache"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY } from "~/lib/entitlements/lineage-tier-policy"
import { type DirectoryFacetResult, mapPersonToFacet } from "~/lib/directory/facet-result"
import { rankEntryDisplayOrder } from "~/server/belt/rank-entry-display-order"
import { directoryProfileListPayload } from "~/server/web/directory/payloads"
import { projectDirectoryProfileListItem } from "~/server/web/directory/profile-projection"
import { buildDirectoryProfileWhere } from "~/server/web/directory/profile-where"
import { getLineageProfileDetailRenderPoliciesForUsers } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

/**
 * "Related profiles" for a public profile detail page (BBL-DISCOVER-003).
 *
 * Operator-approved heuristic (ggr pass 3 — strict-AND relaxed to disc-OR-tree): a related profile
 * is one that
 *   (a) shares the current profile's TOP discipline (the discipline of the person's highest
 *       belt — approximated as "holds any rank in that discipline", the same way
 *       `findRelatedOrganizations` treats a shared discipline),
 *   OR
 *   (b) shares at least ONE lineage tree with the current profile,
 *   AND (always)
 *   (c) is not the current profile,
 *   (d) is PUBLIC-visibility only,
 * limited to 6.
 *
 * The (a)/(b) relation is an OR because shared discipline and shared lineage are independent
 * affinity signals; strict AND would discard a legitimate match that has only one. The OR branches
 * are built from only the signals that actually exist on the current profile, so a null top
 * discipline or an empty tree list never contributes a branch (and therefore never matches on
 * "everyone with no discipline" or similar).
 *
 * Privacy: the visibility + brand scope is REUSED from `buildDirectoryProfileWhere` (the ONE
 * directory privacy predicate). Passing `viewerUserId: null` pins the visibility scope to PUBLIC
 * only — MEMBERS_ONLY / HIDDEN never surface here, regardless of who is viewing. The card payload
 * is the SAME `directoryProfileListPayload` → `projectDirectoryProfileListItem` → `mapPersonToFacet`
 * pipeline the `/directory` people facet uses, so this widens public exposure by exactly nothing
 * beyond what a directory card already shows.
 */

/** Max related cards shown — mirrors `findRelatedOrganizations`. */
const RELATED_PROFILE_LIMIT = 6

export async function findRelatedProfiles({
  passportId,
  brand,
}: {
  passportId: string
  brand: Brand
}): Promise<DirectoryFacetResult[]> {
  "use cache"

  cacheTag(`related-profiles-${passportId}`)
  cacheLife("minutes")

  // Resolve the current profile's TOP-discipline id (highest belt first, same ordering as the
  // canonical public passport payload) and the ids of every lineage tree it belongs to.
  const current = await db.passport.findUnique({
    where: { id: passportId },
    select: {
      // ADR 0058 — RankEntry is the canonical member-rank display model. RankAward remains the
      // populated write/promotion-fact anchor until #380, but it is not a display source. RankEntry
      // reaches the canonical awardedAt tiebreak through that required transitional relation.
      rankEntries: {
        orderBy: rankEntryDisplayOrder,
        take: 1,
        select: { rank: { select: { rankSystem: { select: { disciplineId: true } } } } },
      },
      lineageNode: { select: { treeMembers: { select: { treeId: true } } } },
    },
  })

  const topDisciplineId = current?.rankEntries[0]?.rank?.rankSystem?.disciplineId ?? null
  const treeIds = current?.lineageNode?.treeMembers.map(member => member.treeId) ?? []

  // Build the peer-match OR from only the signals that actually exist on the current profile — a
  // null top-discipline or an empty tree list contributes NO branch, so we never match on
  // "everyone with no discipline" or an empty `treeId in []`. (ggr pass 3 — operator-approved:
  // relate by discipline OR shared lineage tree, not the old strict AND.)
  const orBranches: Prisma.PassportWhereInput[] = []
  if (topDisciplineId) {
    // ADR 0058 — same-top-discipline peers derive from canonical RankEntry display truth, not the
    // transitional RankAward fact anchor.
    orBranches.push({
      rankEntries: { some: { rank: { rankSystem: { disciplineId: topDisciplineId } } } },
    })
  }
  if (treeIds.length > 0) {
    orBranches.push({ lineageNode: { treeMembers: { some: { treeId: { in: treeIds } } } } })
  }

  // Relate only when at least ONE signal exists (discipline OR tree). With NEITHER there is nothing
  // to relate against, so render nothing (the section self-hides on an empty list). A profile with
  // only a tree — the BBL norm today — now proceeds (previously the strict-AND gate short-circuited
  // it to dark).
  if (orBranches.length === 0) {
    return []
  }

  // Reuse the directory privacy predicate for the PUBLIC-only visibility + brand scope, then AND in
  // the related constraints (self-exclusion + the disc-OR-tree peer match). Composed via `AND`
  // (never spread) so this function's own `passport` sub-filter can never clobber `baseWhere`'s
  // `passport` sub-filter — including if `buildDirectoryProfileWhere` is ever called here with a
  // non-empty search that populates `passport.rankEntries` itself. Each `AND` branch is its own
  // typed literal, so TypeScript field-checks every key (no blind cast).
  const baseWhere = buildDirectoryProfileWhere({}, brand, null) as Prisma.DirectoryProfileWhereInput

  const where: Prisma.DirectoryProfileWhereInput = {
    AND: [
      baseWhere,
      {
        passportId: { not: passportId },
        // Peer match: discipline OR shared lineage tree (built above from live signals only).
        passport: { OR: orBranches },
      },
    ],
  }

  const profiles = await db.directoryProfile.findMany({
    where,
    // Brand-filter the account-side memberships inside the shared list payload, identical to
    // `searchDirectoryProfiles`, so a cross-brand membership can never leak onto the card.
    select: {
      ...directoryProfileListPayload,
      passport: {
        select: {
          ...directoryProfileListPayload.passport.select,
          user: {
            select: {
              ...directoryProfileListPayload.passport.select.user.select,
              memberships: {
                where: { organization: { brand } },
                select: directoryProfileListPayload.passport.select.user.select.memberships.select,
              },
            },
          },
        },
      },
    },
    orderBy: { passport: { displayName: "asc" } },
    take: RELATED_PROFILE_LIMIT,
  })

  const policies = await getLineageProfileDetailRenderPoliciesForUsers({
    userIds: profiles.flatMap(profile => (profile.passport.user ? [profile.passport.user.id] : [])),
    brand,
  })

  return profiles.map(profile =>
    mapPersonToFacet(
      projectDirectoryProfileListItem({
        profile,
        policy:
          policies.get(profile.passport.user?.id ?? "") ??
          FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
        brand,
      }),
    ),
  )
}
