import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import { FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY } from "~/lib/entitlements/lineage-tier-policy"
import type { MemberFilterParams } from "~/server/web/directory/member-schema"
import { directoryProfileListPayload } from "~/server/web/directory/payloads"
import { projectDirectoryProfileListItem } from "~/server/web/directory/profile-projection"
import { buildDirectoryProfileWhere } from "~/server/web/directory/profile-where"
import { getLineageProfileDetailRenderPoliciesForUsers } from "~/server/web/entitlements/lineage-tier-policy"
import { db } from "~/services/db"

/**
 * Paginated, privacy-aware directory profile search.
 * Brand-scoped. Unauthenticated = PUBLIC only; authenticated = PUBLIC + MEMBERS_ONLY.
 */
export const searchDirectoryProfiles = async (
  search: MemberFilterParams,
  brand: Brand,
  viewerUserId?: string | null,
  viewerRole?: string | null,
) => {
  "use cache"

  cacheTag("directory-profiles")
  cacheLife("minutes")

  const { q, discipline, org, city, region, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const [sortBy, sortOrder] = sort ? sort.split(".") : [undefined, undefined]

  // Brand-pinned, privacy-aware where clause (extracted + unit-tested in profile-where.ts).
  const where = buildDirectoryProfileWhere(
    { q, discipline, org, city, region },
    brand,
    viewerUserId,
  )

  const [profiles, total] = await db.$transaction([
    db.directoryProfile.findMany({
      where: where as any,
      select: {
        ...directoryProfileListPayload,
        // Phase 3c: memberships (account-side) are brand-filtered under passport.user.
        passport: {
          select: {
            ...directoryProfileListPayload.passport.select,
            user: {
              select: {
                ...directoryProfileListPayload.passport.select.user.select,
                memberships: {
                  where: { organization: { brand } },
                  select:
                    directoryProfileListPayload.passport.select.user.select.memberships.select,
                },
              },
            },
          },
        },
      },
      orderBy: sortBy
        ? { passport: { user: { [sortBy]: sortOrder } } }
        : { passport: { displayName: "asc" } },
      take,
      skip,
    }),
    db.directoryProfile.count({ where: where as any }),
  ])

  console.log(`Directory search: ${Math.round(performance.now() - start)}ms`)

  const policies = await getLineageProfileDetailRenderPoliciesForUsers({
    userIds: profiles.flatMap(profile => (profile.passport.user ? [profile.passport.user.id] : [])),
    brand,
  })

  const members = profiles.map(profile =>
    projectDirectoryProfileListItem({
      profile,
      policy:
        policies.get(profile.passport.user?.id ?? "") ?? FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
      viewerUserId,
      viewerRole,
    }),
  )

  return { members, total, page, perPage }
}
