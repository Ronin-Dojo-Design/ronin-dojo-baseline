import { performance } from "node:perf_hooks"
import { cacheLife, cacheTag } from "next/cache"
import type { Brand, DirectoryVisibility } from "~/.generated/prisma/client"
import { directoryProfileListPayload } from "~/server/web/directory/payloads"
import type { MemberFilterParams } from "~/server/web/directory/member-schema"
import { db } from "~/services/db"

/**
 * Paginated, privacy-aware directory profile search.
 * Brand-scoped. Unauthenticated = PUBLIC only; authenticated = PUBLIC + MEMBERS_ONLY.
 */
export const searchDirectoryProfiles = async (
  search: MemberFilterParams,
  brand: Brand,
  viewerUserId?: string | null,
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
      orderBy: sortBy
        ? { user: { [sortBy]: sortOrder } }
        : { user: { name: "asc" } },
      take,
      skip,
    }),
    db.directoryProfile.count({ where: where as any }),
  ])

  console.log(`Directory search: ${Math.round(performance.now() - start)}ms`)

  // Apply per-field privacy flags
  const members = profiles.map((profile) => ({
    id: profile.id,
    slug: (profile as any).slug ?? profile.id,
    displayName: profile.user.name,
    avatarUrl: profile.user.image,
    bio: null as string | null,
    locationCity: profile.locationCity,
    locationRegion: profile.locationRegion,
    disciplines: profile.showOrgs
      ? profile.user.memberships
          .filter((m) => m.discipline)
          .map((m) => ({ name: m.discipline!.name }))
      : [],
  }))

  return { members, total, page, perPage }
}
