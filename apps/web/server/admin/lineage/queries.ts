import "server-only"

import { Brand, type Prisma } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { isAdmin } from "~/lib/authz-predicates"
import {
  buildAdminListWhere,
  getAdminListQueryParts,
  runAdminListTransaction,
} from "~/server/admin/list-query"
import type { LineageTreesTableSchema } from "~/server/admin/lineage/schema"
import { treeAdminScopeWhere } from "~/server/admin/lineage/tree-admin-scope"
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
  // Identity-only row-scoping (authz-conformance sweep item 3): platform admins see
  // every tree; non-admins are narrowed to the trees they hold a TREE_ADMIN grant on.
  // This is a "who am I" data filter, not an action gate → the `isAdmin()` predicate.
  const isPlatformAdmin = isAdmin(session?.user)

  if (!isPlatformAdmin && !session?.user.id) {
    return { trees: [], total: 0, pageCount: 0 }
  }

  const { name, perPage, operator } = search
  const { offset, orderBy } =
    getAdminListQueryParts<Prisma.LineageTreeOrderByWithRelationInput>(search)

  const expressions: (Prisma.LineageTreeWhereInput | undefined)[] = [
    name ? { name: { contains: name, mode: "insensitive" } } : undefined,
  ]

  const where = buildAdminListWhere<Prisma.LineageTreeWhereInput>({
    baseWhere: {
      brand: Brand.BBL,
      ...treeAdminScopeWhere(isPlatformAdmin, session?.user.id),
    },
    expressions,
    operator,
  })

  const {
    rows: trees,
    total,
    pageCount,
  } = await runAdminListTransaction({
    perPage,
    findMany: () =>
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
    count: () => db.lineageTree.count({ where }),
  })

  return {
    trees: trees.map(tree => ({
      ...tree,
      currentClaim: latestClaimStatus(tree.claimRequests),
    })),
    total,
    pageCount,
  }
}

export type AdminLineageTreeRow = Awaited<ReturnType<typeof findLineageTrees>>["trees"][number]

export const findLineageTreeDetail = async (treeId: string) => {
  const session = await getServerSession()
  // Identity-only row-scoping (authz-conformance sweep item 3): see `findLineageTrees`.
  const isPlatformAdmin = isAdmin(session?.user)

  if (!isPlatformAdmin && !session?.user.id) {
    return null
  }

  const tree = await db.lineageTree.findFirst({
    where: {
      id: treeId,
      brand: Brand.BBL,
      ...treeAdminScopeWhere(isPlatformAdmin, session?.user.id),
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
                  id: true,
                  displayName: true,
                  avatarUrl: true,
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
