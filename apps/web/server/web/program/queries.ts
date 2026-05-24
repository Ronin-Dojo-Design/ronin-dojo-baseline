import { cache } from "react"
import type { Brand, Prisma } from "~/.generated/prisma/client"
import { isAdmin } from "~/lib/authz"
import { programDetailPayload, programManyPayload } from "~/server/web/program/payloads"
import { db } from "~/services/db"

const PROGRAM_EDITOR_ROLE_CODES = ["OWNER", "ORG_ADMIN", "INSTRUCTOR"]

export const getProgramsByBrand = cache(async (brand: Brand) => {
  return db.program.findMany({
    where: {
      brand,
      status: "ACTIVE",
    },
    select: programManyPayload,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  })
})

export const getProgramById = cache(async (brand: Brand, id: string) => {
  return db.program.findFirst({
    where: {
      id,
      brand,
      status: "ACTIVE",
    },
    select: programDetailPayload,
  })
})

export const getManageableProgramById = cache(async (brand: Brand, id: string) => {
  return db.program.findFirst({
    where: {
      id,
      brand,
    },
    select: programDetailPayload,
  })
})

export const getEditableProgramOrganizations = cache(
  async (brand: Brand, userId: string, role?: string | null) => {
    const where: Prisma.OrganizationWhereInput = { brand }

    if (!isAdmin({ id: userId, role })) {
      where.OR = [
        { ownerId: userId },
        {
          memberships: {
            some: {
              userId,
              status: "ACTIVE",
              roleAssignments: {
                some: {
                  role: { code: { in: PROGRAM_EDITOR_ROLE_CODES } },
                },
              },
            },
          },
        },
      ]
    }

    return db.organization.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        disciplines: {
          select: {
            discipline: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { discipline: { name: "asc" } },
        },
      },
      orderBy: { name: "asc" },
    })
  },
)

/**
 * Return all active program IDs for generateStaticParams.
 */
export const findProgramIds = cache(async () => {
  return db.program.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  })
})

/**
 * Find related programs: same org or discipline, excluding the current program.
 * Limited to 6 results.
 */
export const findRelatedPrograms = cache(
  async ({
    programId,
    brand,
    disciplineId,
    organizationId,
  }: {
    programId: string
    brand: Brand
    disciplineId: string | null
    organizationId: string
  }) => {
    return db.program.findMany({
      where: {
        brand,
        status: "ACTIVE",
        id: { not: programId },
        OR: [...(disciplineId ? [{ disciplineId }] : []), { organizationId }],
      },
      select: programManyPayload,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 6,
    })
  },
)
