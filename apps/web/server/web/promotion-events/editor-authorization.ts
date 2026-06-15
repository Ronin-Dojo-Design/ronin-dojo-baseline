import type { Brand, LineageTreeAccessRole, Prisma } from "~/.generated/prisma/client"
import { type AuthzUser, isAdmin } from "~/lib/authz"
import { isLineageMemberInBranch } from "~/server/web/lineage/editor-graph"
import type { db as appDb } from "~/services/db"

type AppDb = typeof appDb

type PromotionEventEditorDb = Pick<AppDb, "lineageTree" | "organization">

type LineageGrant = {
  role: LineageTreeAccessRole
  rootMemberId: string | null
  memberId: string | null
  nodeId: string | null
  member: { nodeId: string } | null
}

type TreeMember = {
  id: string
  nodeId: string
  primaryVisualParentMemberId: string | null
}

export type AuthorizableRankAward = {
  id: string
  awardedById: string | null
  organizationId: string | null
  promotionEventId?: string | null
  passport: {
    lineageNode: {
      id: string
    } | null
  }
}

export type AuthorizablePromotionEvent = {
  id: string
  hostOrganizationId: string | null
  rankAwards: AuthorizableRankAward[]
}

export type PromotionEventAuthoringScope = {
  isGlobalAdmin: boolean
  organizationIds: Set<string>
  fullTreeNodeIds: Set<string>
  scopedNodeIds: Set<string>
  canAuthorHostlessEvents: boolean
}

const eventOrganizationRoles = ["OWNER", "ORG_ADMIN", "INSTRUCTOR", "COACH"] as const
const organizationAdminRoles = ["OWNER", "ORG_ADMIN"] as const
const editorRoles: LineageTreeAccessRole[] = [
  "TREE_ADMIN",
  "TREE_EDITOR",
  "BRANCH_EDITOR",
  "NODE_EDITOR",
]

const fullTreeRoles = new Set<LineageTreeAccessRole>(["TREE_ADMIN", "TREE_EDITOR"])

const addBranchNodes = ({
  nodeIds,
  rootMemberId,
  members,
}: {
  nodeIds: Set<string>
  rootMemberId: string
  members: TreeMember[]
}) => {
  for (const member of members) {
    if (isLineageMemberInBranch({ memberId: member.id, rootMemberId, members })) {
      nodeIds.add(member.nodeId)
    }
  }
}

async function findEventOrganizationIds({
  db,
  brand,
  userId,
}: {
  db: PromotionEventEditorDb
  brand: Brand
  userId: string
}) {
  const organizations = await db.organization.findMany({
    where: {
      brand,
      OR: [
        { ownerId: userId },
        {
          memberships: {
            some: {
              userId,
              status: "ACTIVE",
              roleAssignments: {
                some: { role: { code: { in: [...eventOrganizationRoles] } } },
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  })

  return new Set(organizations.map(organization => organization.id))
}

async function findOrganizationAdminIds({
  db,
  brand,
  userId,
}: {
  db: PromotionEventEditorDb
  brand: Brand
  userId: string
}) {
  const organizations = await db.organization.findMany({
    where: {
      brand,
      OR: [
        { ownerId: userId },
        {
          memberships: {
            some: {
              userId,
              status: "ACTIVE",
              roleAssignments: {
                some: { role: { code: { in: [...organizationAdminRoles] } } },
              },
            },
          },
        },
      ],
    },
    select: { id: true },
  })

  return new Set(organizations.map(organization => organization.id))
}

export async function resolvePromotionEventAuthoringScope({
  db,
  brand,
  user,
}: {
  db: PromotionEventEditorDb
  brand: Brand
  user: AuthzUser
}): Promise<PromotionEventAuthoringScope> {
  if (isAdmin(user)) {
    return {
      isGlobalAdmin: true,
      organizationIds: new Set(),
      fullTreeNodeIds: new Set(),
      scopedNodeIds: new Set(),
      canAuthorHostlessEvents: true,
    }
  }

  const [organizationIds, organizationAdminIds] = await Promise.all([
    findEventOrganizationIds({ db, brand, userId: user.id }),
    findOrganizationAdminIds({ db, brand, userId: user.id }),
  ])

  const explicitAccessWhere = {
    userId: user.id,
    revokedAt: null,
    role: { in: editorRoles },
  } satisfies Prisma.LineageTreeAccessWhereInput

  const lineageTrees = await db.lineageTree.findMany({
    where: {
      brand,
      OR: [
        { accessGrants: { some: explicitAccessWhere } },
        ...(organizationAdminIds.size > 0
          ? [
              {
                scopeType: "ORGANIZATION" as const,
                organizationId: { in: Array.from(organizationAdminIds) },
              },
            ]
          : []),
      ],
    },
    select: {
      organizationId: true,
      scopeType: true,
      members: {
        select: {
          id: true,
          nodeId: true,
          primaryVisualParentMemberId: true,
        },
      },
      accessGrants: {
        where: explicitAccessWhere,
        select: {
          role: true,
          rootMemberId: true,
          memberId: true,
          nodeId: true,
          member: { select: { nodeId: true } },
        },
      },
    },
  })

  const fullTreeNodeIds = new Set<string>()
  const scopedNodeIds = new Set<string>()

  for (const tree of lineageTrees) {
    const hasOrganizationAdminGrant = Boolean(
      tree.scopeType === "ORGANIZATION" &&
      tree.organizationId &&
      organizationAdminIds.has(tree.organizationId),
    )

    if (hasOrganizationAdminGrant) {
      for (const member of tree.members) {
        fullTreeNodeIds.add(member.nodeId)
      }
    }

    for (const grant of tree.accessGrants as LineageGrant[]) {
      if (fullTreeRoles.has(grant.role)) {
        for (const member of tree.members) {
          fullTreeNodeIds.add(member.nodeId)
        }
        continue
      }

      if (grant.role === "BRANCH_EDITOR" && grant.rootMemberId) {
        addBranchNodes({
          nodeIds: scopedNodeIds,
          rootMemberId: grant.rootMemberId,
          members: tree.members,
        })
        continue
      }

      if (grant.role === "NODE_EDITOR") {
        const nodeId = grant.nodeId ?? grant.member?.nodeId
        if (nodeId) {
          scopedNodeIds.add(nodeId)
        }
      }
    }
  }

  return {
    isGlobalAdmin: false,
    organizationIds,
    fullTreeNodeIds,
    scopedNodeIds,
    canAuthorHostlessEvents: fullTreeNodeIds.size > 0,
  }
}

export function canAuthorHostOrganization(
  scope: PromotionEventAuthoringScope,
  organizationId: string | null | undefined,
) {
  return Boolean(
    scope.isGlobalAdmin || (organizationId && scope.organizationIds.has(organizationId)),
  )
}

export function canAuthorRankAward({
  scope,
  award,
  userId,
}: {
  scope: PromotionEventAuthoringScope
  award: AuthorizableRankAward
  userId: string
}) {
  if (scope.isGlobalAdmin) return true
  if (award.awardedById === userId) return true
  if (award.organizationId && scope.organizationIds.has(award.organizationId)) return true

  const nodeId = award.passport.lineageNode?.id
  if (!nodeId) return false

  return scope.fullTreeNodeIds.has(nodeId) || scope.scopedNodeIds.has(nodeId)
}

export function canAuthorRankAwards({
  scope,
  awards,
  userId,
}: {
  scope: PromotionEventAuthoringScope
  awards: AuthorizableRankAward[]
  userId: string
}) {
  return awards.every(award => canAuthorRankAward({ scope, award, userId }))
}

export function canAuthorPromotionEvent({
  scope,
  event,
  hostOrganizationId,
  awards,
  userId,
}: {
  scope: PromotionEventAuthoringScope
  event: AuthorizablePromotionEvent | null
  hostOrganizationId: string | null
  awards: AuthorizableRankAward[]
  userId: string
}) {
  if (scope.isGlobalAdmin) return true
  if (canAuthorHostOrganization(scope, hostOrganizationId)) return true
  if (canAuthorHostOrganization(scope, event?.hostOrganizationId)) return true
  if (awards.length > 0 && canAuthorRankAwards({ scope, awards, userId })) return true
  return !event && !hostOrganizationId && awards.length === 0 && scope.canAuthorHostlessEvents
}

export function buildAuthorizedRankAwardWhere({
  scope,
  userId,
  extraIds = [],
}: {
  scope: PromotionEventAuthoringScope
  userId: string
  extraIds?: string[]
}): Prisma.RankAwardWhereInput {
  if (scope.isGlobalAdmin) {
    return {}
  }

  const nodeIds = Array.from(new Set([...scope.fullTreeNodeIds, ...scope.scopedNodeIds]))
  const or: Prisma.RankAwardWhereInput[] = [{ awardedById: userId }]

  if (scope.organizationIds.size > 0) {
    or.push({ organizationId: { in: Array.from(scope.organizationIds) } })
  }

  if (nodeIds.length > 0) {
    or.push({ passport: { lineageNode: { is: { id: { in: nodeIds } } } } })
  }

  if (extraIds.length > 0) {
    or.push({ id: { in: extraIds } })
  }

  return { OR: or }
}
