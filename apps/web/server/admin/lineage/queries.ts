import "server-only"

import { isTruthy } from "@dirstack/utils"
import { Brand, type Prisma } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import type { LineageTreesTableSchema } from "~/server/admin/lineage/schema"
import { db } from "~/services/db"

const claimStatusOrder = {
  APPROVED: 0,
  PENDING: 1,
  NEEDS_INFO: 2,
  DENIED: 3,
  CANCELLED: 4,
} as const

function latestClaimStatus<T extends { status: keyof typeof claimStatusOrder; updatedAt: Date }>(
  claims: T[],
): T | null {
  if (claims.length === 0) return null

  return [...claims].sort((a, b) => {
    const orderDiff = claimStatusOrder[a.status] - claimStatusOrder[b.status]
    if (orderDiff !== 0) return orderDiff
    return b.updatedAt.getTime() - a.updatedAt.getTime()
  })[0]!
}

export const findLineageTrees = async (search: LineageTreesTableSchema) => {
  const session = await getServerSession()
  const isAdmin = session?.user.role === "admin"

  if (!isAdmin && !session?.user.id) {
    return { trees: [], total: 0, pageCount: 0 }
  }

  const { name, page, perPage, sort, operator } = search
  const offset = (page - 1) * perPage
  const orderBy = sort.map(item => ({ [item.id]: item.desc ? "desc" : "asc" }) as const)

  const expressions: (Prisma.LineageTreeWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
  ]

  const where: Prisma.LineageTreeWhereInput = {
    brand: Brand.BBL,
    ...(isAdmin
      ? {}
      : {
          accessGrants: {
            some: {
              userId: session.user.id,
              role: "TREE_ADMIN",
              revokedAt: null,
            },
          },
        }),
    [operator.toUpperCase()]: expressions.filter(isTruthy),
  }

  const [trees, total] = await db.$transaction([
    db.lineageTree.findMany({
      where,
      orderBy: [...orderBy, { createdAt: "asc" }],
      take: perPage,
      skip: offset,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        visibility: true,
        isPublished: true,
        isClaimable: true,
        updatedAt: true,
        discipline: { select: { id: true, name: true, slug: true } },
        organization: { select: { id: true, name: true, slug: true } },
        _count: {
          select: {
            members: true,
            claimRequests: true,
          },
        },
        claimRequests: {
          select: { id: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 20,
        },
      },
    }),
    db.lineageTree.count({ where }),
  ])

  return {
    trees: trees.map(tree => ({
      ...tree,
      currentClaim: latestClaimStatus(tree.claimRequests),
    })),
    total,
    pageCount: Math.ceil(total / perPage),
  }
}

export type AdminLineageTreeRow = Awaited<ReturnType<typeof findLineageTrees>>["trees"][number]

export const findLineageTreeDetail = async (treeId: string) => {
  const session = await getServerSession()
  const isAdmin = session?.user.role === "admin"

  if (!isAdmin && !session?.user.id) {
    return null
  }

  const tree = await db.lineageTree.findFirst({
    where: {
      id: treeId,
      brand: Brand.BBL,
      ...(isAdmin
        ? {}
        : {
            accessGrants: {
              some: {
                userId: session.user.id,
                role: "TREE_ADMIN",
                revokedAt: null,
              },
            },
          }),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      isPublished: true,
      isClaimable: true,
      updatedAt: true,
      discipline: { select: { id: true, name: true, slug: true } },
      organization: { select: { id: true, name: true, slug: true } },
      members: {
        orderBy: [{ visualSortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          isClaimable: true,
          visualSortOrder: true,
          rankAwardId: true,
          selectedRankAward: {
            select: {
              id: true,
              awardedAt: true,
              rank: { select: { name: true, shortName: true, sortOrder: true } },
            },
          },
          node: {
            select: {
              id: true,
              slug: true,
              verificationStatus: true,
              isVerified: true,
              // Phase 3c (SOT-ADR D1): identity is Passport-rooted. The attached account (nullable
              // `user`) carries account fields; null `user` = accountless placeholder.
              passport: {
                select: {
                  displayName: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      archivedAt: true,
                    },
                  },
                  rankAwardsEarned: {
                    orderBy: [{ awardedAt: "desc" }, { createdAt: "desc" }],
                    select: {
                      id: true,
                      awardedAt: true,
                      rank: {
                        select: {
                          name: true,
                          shortName: true,
                          sortOrder: true,
                          colorHex: true,
                          rankSystem: {
                            select: {
                              name: true,
                              discipline: { select: { name: true, code: true } },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              claimRequests: {
                where: { treeId },
                select: {
                  id: true,
                  status: true,
                  claimantNote: true,
                  reviewerNote: true,
                  updatedAt: true,
                  claimant: { select: { id: true, name: true, email: true } },
                },
                orderBy: { updatedAt: "desc" },
              },
            },
          },
        },
      },
    },
  })

  if (!tree) return null

  return {
    ...tree,
    members: tree.members.map(member => ({
      ...member,
      currentClaim: latestClaimStatus(member.node.claimRequests),
    })),
  }
}

export type AdminLineageTreeDetail = NonNullable<Awaited<ReturnType<typeof findLineageTreeDetail>>>
export type AdminLineageTreeMember = AdminLineageTreeDetail["members"][number]
