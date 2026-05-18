import { cacheLife, cacheTag } from "next/cache"
import type { Brand } from "~/.generated/prisma/client"
import { DirectoryVisibility, MembershipStatus } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Payload for discipline list cards.
 */
const disciplineManyPayload = {
  id: true,
  name: true,
  slug: true,
  code: true,
  defaultInstructorTitle: true,
  createdAt: true,
  _count: {
    select: {
      organizations: true,
      rankSystems: true,
      memberships: true,
      programs: true,
      courses: true,
    },
  },
} as const

/**
 * Payload for discipline detail page.
 */
const disciplineDetailPayload = {
  id: true,
  name: true,
  slug: true,
  code: true,
  isSystem: true,
  brand: true,
  defaultInstructorTitle: true,
  foundedBy: true,
  yearEstablished: true,
  history: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      organizations: true,
      rankSystems: true,
      memberships: true,
      programs: true,
      courses: true,
      styles: true,
      techniques: true,
    },
  },
  rankSystems: {
    select: {
      id: true,
      name: true,
      kind: true,
      _count: { select: { ranks: true } },
    },
    orderBy: { name: "asc" as const },
  },
  organizations: {
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          city: true,
          state: true,
        },
      },
    },
    take: 20,
  },
  styles: {
    select: { id: true, name: true },
    orderBy: { name: "asc" as const },
  },
} as const

/**
 * Find all disciplines for a brand (system + brand-specific).
 * Used on the /disciplines list page.
 */
export const findDisciplines = async (brand: Brand) => {
  "use cache"

  cacheTag("disciplines")
  cacheLife("minutes")

  return db.discipline.findMany({
    where: {
      OR: [{ isSystem: true }, { brand }],
    },
    select: disciplineManyPayload,
    orderBy: { name: "asc" },
  })
}

/**
 * Find all discipline slugs for static generation.
 */
export const findDisciplineSlugs = async (brand: Brand) => {
  "use cache"

  cacheTag("discipline-slugs")
  cacheLife("hours")

  return db.discipline.findMany({
    where: {
      OR: [{ isSystem: true }, { brand }],
    },
    select: { slug: true },
  })
}

/**
 * Find a single discipline by slug (brand-scoped).
 * Used on the /disciplines/[slug] detail page.
 */
export const findDisciplineBySlug = async (brand: Brand, slug: string) => {
  "use cache"

  cacheTag(`discipline-${slug}`)
  cacheLife("minutes")

  // Discipline has @@unique([name, brand]) but not @@unique([slug, brand]).
  // Use findFirst with OR to match system or brand-specific.
  return db.discipline.findFirst({
    where: {
      slug,
      OR: [{ isSystem: true }, { brand }],
    },
    select: disciplineDetailPayload,
  })
}

/**
 * Find videos for a discipline via ContentAtom → ContentVariant.
 * Returns variants that have a videoUrl, mapped to a simple shape.
 */
export const findDisciplineVideos = async (disciplineId: string) => {
  "use cache"

  cacheTag(`discipline-videos-${disciplineId}`)
  cacheLife("minutes")

  const atoms = await db.contentAtom.findMany({
    where: { disciplineId },
    select: {
      id: true,
      title: true,
      variants: {
        where: { videoUrl: { not: null } },
        select: {
          id: true,
          publicTitle: true,
          thumbnailUrl: true,
          videoUrl: true,
        },
        take: 20,
      },
    },
  })

  return atoms.flatMap(atom =>
    atom.variants.map(v => ({
      id: v.id,
      title: v.publicTitle ?? atom.title,
      thumbnailUrl: v.thumbnailUrl,
    })),
  )
}

/**
 * Find active members for a discipline with rank data.
 * Respects DirectoryProfile visibility (PUBLIC only).
 * Sorted by rank sortOrder ascending.
 */
export const findDisciplineMembersByRank = async (disciplineId: string) => {
  "use cache"

  cacheTag(`discipline-members-${disciplineId}`)
  cacheLife("minutes")

  const memberships = await db.membership.findMany({
    where: {
      disciplineId,
      status: MembershipStatus.ACTIVE,
      rankId: { not: null },
      user: {
        directoryProfile: {
          visibility: DirectoryVisibility.PUBLIC,
        },
      },
    },
    select: {
      id: true,
      user: {
        select: {
          passport: {
            select: { displayName: true },
          },
        },
      },
      rank: {
        select: {
          name: true,
          sortOrder: true,
        },
      },
    },
    orderBy: { rank: { sortOrder: "asc" } },
    take: 50,
  })

  return memberships.map(m => ({
    id: m.id,
    name: m.user.passport?.displayName ?? null,
    rankName: m.rank!.name,
    rankSortOrder: m.rank!.sortOrder,
  }))
}
