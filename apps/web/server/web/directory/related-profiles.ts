import { cacheLife, cacheTag } from "next/cache"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY } from "~/lib/entitlements/lineage-tier-policy"
import { type DirectoryFacetResult, mapPersonToFacet } from "~/lib/directory/facet-result"
import { directoryProfileListPayload } from "~/server/web/directory/payloads"
import { projectDirectoryProfileListItem } from "~/server/web/directory/profile-projection"
import { buildDirectoryProfileWhere } from "~/server/web/directory/profile-where"
import { getLineageProfileDetailRenderPoliciesForUsers } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

/**
 * "Related profiles" for a public profile detail page (BBL-DISCOVER-003).
 *
 * Operator-pinned heuristic (do NOT re-open): a related profile is one that
 *   (a) shares the current profile's TOP discipline (the discipline of the person's highest
 *       belt — approximated as "holds any rank in that discipline", the same way
 *       `findRelatedOrganizations` treats a shared discipline),
 *   (b) shares at least ONE lineage tree with the current profile,
 *   (c) is not the current profile,
 *   (d) is PUBLIC-visibility only,
 * limited to 6.
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
      rankAwardsEarned: {
        orderBy: [{ rank: { sortOrder: "desc" } }, { awardedAt: "desc" }],
        take: 1,
        select: { rank: { select: { rankSystem: { select: { disciplineId: true } } } } },
      },
      lineageNode: { select: { treeMembers: { select: { treeId: true } } } },
    },
  })

  const topDisciplineId = current?.rankAwardsEarned[0]?.rank?.rankSystem?.disciplineId ?? null
  const treeIds = current?.lineageNode?.treeMembers.map(member => member.treeId) ?? []

  // Both signals are required by the pinned heuristic — with no top discipline OR no lineage tree
  // there is nothing to relate against, so render nothing (the section self-hides on an empty list).
  if (!topDisciplineId || treeIds.length === 0) {
    return []
  }

  // Reuse the directory privacy predicate for the PUBLIC-only visibility + brand scope, then AND in
  // the related constraints (self-exclusion + same top-discipline + shared lineage tree). Composed
  // via `AND` (never spread) so this function's own `passport` sub-filter can never clobber
  // `baseWhere`'s `passport` sub-filter — including if `buildDirectoryProfileWhere` is ever called
  // here with a non-empty search that populates `passport.rankAwardsEarned` itself. Each `AND`
  // branch is its own typed literal, so TypeScript field-checks every key (no blind cast).
  const baseWhere = buildDirectoryProfileWhere({}, brand, null) as Prisma.DirectoryProfileWhereInput

  const where: Prisma.DirectoryProfileWhereInput = {
    AND: [
      baseWhere,
      {
        passportId: { not: passportId },
        passport: {
          rankAwardsEarned: {
            some: { rank: { rankSystem: { disciplineId: topDisciplineId } } },
          },
          lineageNode: {
            treeMembers: { some: { treeId: { in: treeIds } } },
          },
        },
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
