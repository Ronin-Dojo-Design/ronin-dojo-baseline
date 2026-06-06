import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import { FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY } from "~/lib/entitlements/lineage-tier-policy"
import type { MemberFilterParams } from "~/server/web/directory/member-schema"
import { directoryProfileListPayload } from "~/server/web/directory/payloads"
import { projectDirectoryProfileListItem } from "~/server/web/directory/profile-projection"
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

  const { q, discipline, city, region, sort, page, perPage } = search
  const start = performance.now()
  const skip = (page - 1) * perPage
  const take = perPage
  const [sortBy, sortOrder] = sort ? sort.split(".") : [undefined, undefined]

  const allowedVisibility: DirectoryVisibility[] = viewerUserId
    ? ["PUBLIC", "MEMBERS_ONLY"]
    : ["PUBLIC"]

  // Build the where clause
  const where: Record<string, unknown> = {
    visibility: { in: allowedVisibility },
    user: {
      memberships: {
        some: {
          organization: { brand },
          ...(discipline && { discipline: { slug: discipline } }),
        },
      },
    },
  }

  if (city) {
    where.locationCity = { contains: city, mode: "insensitive" }
  }
  if (region) {
    where.locationRegion = { contains: region, mode: "insensitive" }
  }
  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { locationCity: { contains: q, mode: "insensitive" } },
      { locationRegion: { contains: q, mode: "insensitive" } },
    ]
  }

  const [profiles, total] = await db.$transaction([
    db.directoryProfile.findMany({
      where: where as any,
      select: {
        ...directoryProfileListPayload,
        user: {
          select: {
            ...directoryProfileListPayload.user.select,
            memberships: {
              where: { organization: { brand } },
              select: directoryProfileListPayload.user.select.memberships.select,
            },
          },
        },
      },
      orderBy: sortBy ? { user: { [sortBy]: sortOrder } } : { user: { name: "asc" } },
      take,
      skip,
    }),
    db.directoryProfile.count({ where: where as any }),
  ])

  console.log(`Directory search: ${Math.round(performance.now() - start)}ms`)

  const policies = await getLineageProfileDetailRenderPoliciesForUsers({
    userIds: profiles.map(profile => profile.user.id),
    brand,
  })

  const members = profiles.map(profile =>
    projectDirectoryProfileListItem({
      profile,
      policy: policies.get(profile.user.id) ?? FREE_LINEAGE_PROFILE_DETAIL_RENDER_POLICY,
      viewerUserId,
      viewerRole,
    }),
  )

  return { members, total, page, perPage }
}
