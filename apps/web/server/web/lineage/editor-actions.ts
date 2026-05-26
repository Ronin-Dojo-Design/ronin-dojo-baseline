"use server"

import type { Brand } from "~/.generated/prisma/client"
import { isAdmin } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { LINEAGE_EDITOR_ERROR } from "~/server/web/lineage/editor-errors"
import {
  isLineageMemberInBranch,
  wouldCreateLineageParentCycle,
} from "~/server/web/lineage/editor-graph"
import type {
  UpdateLineageMemberPlacementInput,
  UpdateLineagePromotionRelationshipInput,
  UpdateLineageVisualGroupInput,
} from "~/server/web/lineage/editor-schemas"
import {
  updateLineageMemberPlacementSchema,
  updateLineagePromotionRelationshipSchema,
  updateLineageVisualGroupSchema,
} from "~/server/web/lineage/editor-schemas"
import type { db as appDb } from "~/services/db"

/**
 * Lineage Tree v1 editor actions.
 *
 * This slice intentionally avoids drag/drop mutation. Lineage-changing actions
 * must come through explicit server actions with audit notes so the graph does
 * not silently corrupt martial arts lineage truth.
 */

type AppDb = typeof appDb

type EditorGrant = {
  role: "TREE_ADMIN" | "TREE_EDITOR" | "BRANCH_EDITOR" | "NODE_EDITOR"
  rootMemberId: string | null
}

type EditorGraphMember = {
  id: string
  nodeId: string
  primaryVisualParentMemberId: string | null
  visualGroupId: string | null
  visualSortOrder: number
  rankAwardId: string | null
}

type EditorVisualGroup = {
  id: string
  parentMemberId: string | null
  label: string
  showPublicLabel: boolean
  isCollapsedDefault: boolean
}

type RelationshipAuditSnapshot = {
  id: string
  fromNodeId: string
  toNodeId: string
  rankAwardId: string | null
  startedAt: string | null
  endedAt: string | null
  isVerified: boolean
  verificationStatus: string
}

export type UpdateLineageMemberPlacementResult = {
  treeId: string
  treeSlug: string
  memberId: string
  nodeId: string
}

export type UpdateLineagePromotionRelationshipResult = {
  treeId: string
  treeSlug: string
  memberId: string
  nodeId: string
  relationshipId: string | null
}

export type UpdateLineageVisualGroupResult = {
  treeId: string
  treeSlug: string
  groupId: string
}

function memberById(members: EditorGraphMember[]) {
  return new Map(members.map(member => [member.id, member]))
}

function groupById(groups: EditorVisualGroup[]) {
  return new Map(groups.map(group => [group.id, group]))
}

function hasTreeEditorGrant(grants: EditorGrant[]) {
  return grants.some(grant => grant.role === "TREE_ADMIN" || grant.role === "TREE_EDITOR")
}

function hasTreeAdminGrant(grants: EditorGrant[]) {
  return grants.some(grant => grant.role === "TREE_ADMIN")
}

function relationshipAuditSnapshot(
  relationship: {
    id: string
    fromNodeId: string
    toNodeId: string
    rankAwardId: string | null
    startedAt: Date | null
    endedAt: Date | null
    isVerified: boolean
    verificationStatus: string
  } | null,
): RelationshipAuditSnapshot | undefined {
  if (!relationship) return undefined

  return {
    id: relationship.id,
    fromNodeId: relationship.fromNodeId,
    toNodeId: relationship.toNodeId,
    rankAwardId: relationship.rankAwardId,
    startedAt: relationship.startedAt?.toISOString() ?? null,
    endedAt: relationship.endedAt?.toISOString() ?? null,
    isVerified: relationship.isVerified,
    verificationStatus: relationship.verificationStatus,
  }
}

function assertPlacementEditorAccess({
  grants,
  members,
  editedMember,
  relatedMemberIds,
  nextParentMemberId,
}: {
  grants: EditorGrant[]
  members: EditorGraphMember[]
  editedMember: EditorGraphMember
  relatedMemberIds: string[]
  nextParentMemberId: string | null
}) {
  if (grants.length === 0) {
    throw new Error(LINEAGE_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED)
  }

  if (hasTreeEditorGrant(grants)) return

  const branchGrants = grants.filter(
    (grant): grant is EditorGrant & { rootMemberId: string } =>
      grant.role === "BRANCH_EDITOR" && Boolean(grant.rootMemberId),
  )

  if (branchGrants.length === 0 && grants.some(grant => grant.role === "NODE_EDITOR")) {
    throw new Error(LINEAGE_EDITOR_ERROR.NODE_EDITOR_CANNOT_REPARENT)
  }

  if (nextParentMemberId === null && editedMember.primaryVisualParentMemberId !== null) {
    throw new Error(LINEAGE_EDITOR_ERROR.BRANCH_EDITOR_CANNOT_DETACH)
  }

  const inAnyGrantedBranch = branchGrants.some(grant => {
    const allMemberIds = [editedMember.id, ...relatedMemberIds]
    return allMemberIds.every(memberId =>
      isLineageMemberInBranch({
        memberId,
        rootMemberId: grant.rootMemberId,
        members,
      }),
    )
  })

  if (!inAnyGrantedBranch) {
    throw new Error(LINEAGE_EDITOR_ERROR.BRANCH_SCOPE_REQUIRED)
  }
}

async function getEditorTreeContext({
  db,
  brand,
  treeId,
  userId,
  isGlobalAdmin = false,
}: {
  db: AppDb
  brand: Brand
  treeId: string
  userId: string
  isGlobalAdmin?: boolean
}) {
  const [tree, explicitGrants] = await Promise.all([
    db.lineageTree.findFirst({
      where: { id: treeId, brand },
      select: {
        id: true,
        slug: true,
        scopeType: true,
        organizationId: true,
        members: {
          select: {
            id: true,
            nodeId: true,
            primaryVisualParentMemberId: true,
            visualGroupId: true,
            visualSortOrder: true,
            rankAwardId: true,
          },
        },
        visualGroups: {
          select: {
            id: true,
            parentMemberId: true,
            label: true,
            showPublicLabel: true,
            isCollapsedDefault: true,
          },
        },
      },
    }),
    db.lineageTreeAccess.findMany({
      where: {
        treeId,
        userId,
        revokedAt: null,
        role: { in: ["TREE_ADMIN", "TREE_EDITOR", "BRANCH_EDITOR", "NODE_EDITOR"] },
      },
      select: {
        role: true,
        rootMemberId: true,
      },
    }),
  ])

  if (!tree) {
    throw new Error(LINEAGE_EDITOR_ERROR.TREE_NOT_FOUND)
  }

  const grants = [...explicitGrants]

  if (isGlobalAdmin) {
    grants.push({ role: "TREE_ADMIN", rootMemberId: null })
  } else if (tree.scopeType === "ORGANIZATION" && tree.organizationId) {
    const organizationAdminGrant = await db.organization.findFirst({
      where: {
        id: tree.organizationId,
        brand,
        OR: [
          { ownerId: userId },
          {
            memberships: {
              some: {
                userId,
                status: "ACTIVE",
                roleAssignments: {
                  some: { role: { code: { in: ["OWNER", "ORG_ADMIN"] } } },
                },
              },
            },
          },
        ],
      },
      select: { id: true },
    })

    if (organizationAdminGrant) {
      grants.push({ role: "TREE_ADMIN", rootMemberId: null })
    }
  }

  return { tree, grants }
}

export const applyLineageMemberPlacementUpdate = async ({
  db,
  brand,
  userId,
  input,
  isGlobalAdmin,
}: {
  db: AppDb
  brand: Brand
  userId: string
  input: UpdateLineageMemberPlacementInput
  isGlobalAdmin?: boolean
}): Promise<UpdateLineageMemberPlacementResult> => {
  return db.$transaction(
    async tx => {
      const { tree, grants } = await getEditorTreeContext({
        db: tx as AppDb,
        brand,
        treeId: input.treeId,
        userId,
        isGlobalAdmin,
      })

      const members = tree.members
      const membersById = memberById(members)
      const groupsById = groupById(tree.visualGroups)
      const member = membersById.get(input.memberId)

      if (!member) {
        throw new Error(LINEAGE_EDITOR_ERROR.MEMBER_NOT_FOUND)
      }

      if (input.parentMemberId && !membersById.has(input.parentMemberId)) {
        throw new Error(LINEAGE_EDITOR_ERROR.PARENT_NOT_FOUND)
      }

      const visualGroup = input.visualGroupId ? groupsById.get(input.visualGroupId) : null
      if (input.visualGroupId && !visualGroup) {
        throw new Error(LINEAGE_EDITOR_ERROR.GROUP_NOT_FOUND)
      }

      if (visualGroup?.parentMemberId && visualGroup.parentMemberId !== input.parentMemberId) {
        throw new Error(LINEAGE_EDITOR_ERROR.GROUP_PARENT_MISMATCH)
      }

      if (
        wouldCreateLineageParentCycle({
          memberId: member.id,
          candidateParentMemberId: input.parentMemberId,
          members,
        })
      ) {
        throw new Error(LINEAGE_EDITOR_ERROR.PARENT_CYCLE)
      }

      assertPlacementEditorAccess({
        grants,
        members,
        editedMember: member,
        relatedMemberIds: [
          ...(input.parentMemberId ? [input.parentMemberId] : []),
          ...(visualGroup?.parentMemberId ? [visualGroup.parentMemberId] : []),
        ],
        nextParentMemberId: input.parentMemberId,
      })

      const before = {
        memberId: member.id,
        nodeId: member.nodeId,
        primaryVisualParentMemberId: member.primaryVisualParentMemberId,
        visualGroupId: member.visualGroupId,
        visualSortOrder: member.visualSortOrder,
      }

      const updated = await tx.lineageTreeMember.update({
        where: { id: member.id },
        data: {
          primaryVisualParentMemberId: input.parentMemberId,
          visualGroupId: input.visualGroupId,
          visualSortOrder: input.visualSortOrder,
        },
        select: {
          id: true,
          nodeId: true,
          primaryVisualParentMemberId: true,
          visualGroupId: true,
          visualSortOrder: true,
        },
      })

      await tx.auditLog.create({
        data: {
          brand,
          action: "lineage.member.placement.updated",
          entityType: "LineageTreeMember",
          entityId: member.id,
          userId,
          before,
          after: {
            ...updated,
            auditNote: input.auditNote,
          },
        },
      })

      return {
        treeId: tree.id,
        treeSlug: tree.slug,
        memberId: updated.id,
        nodeId: updated.nodeId,
      }
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )
}

export const applyLineagePromotionRelationshipUpdate = async ({
  db,
  brand,
  userId,
  input,
  isGlobalAdmin,
}: {
  db: AppDb
  brand: Brand
  userId: string
  input: UpdateLineagePromotionRelationshipInput
  isGlobalAdmin?: boolean
}): Promise<UpdateLineagePromotionRelationshipResult> => {
  return db.$transaction(
    async tx => {
      const { tree, grants } = await getEditorTreeContext({
        db: tx as AppDb,
        brand,
        treeId: input.treeId,
        userId,
        isGlobalAdmin,
      })

      const members = tree.members
      const membersById = memberById(members)
      const member = membersById.get(input.memberId)
      const promoterMember = input.promoterMemberId ? membersById.get(input.promoterMemberId) : null

      if (!member) {
        throw new Error(LINEAGE_EDITOR_ERROR.MEMBER_NOT_FOUND)
      }

      if (input.promoterMemberId && !promoterMember) {
        throw new Error(LINEAGE_EDITOR_ERROR.PROMOTER_NOT_FOUND)
      }

      if (promoterMember?.id === member.id) {
        throw new Error(LINEAGE_EDITOR_ERROR.SELF_PROMOTION)
      }

      if (!input.promoterMemberId && !hasTreeEditorGrant(grants)) {
        throw new Error(LINEAGE_EDITOR_ERROR.CLEAR_PROMOTER_REQUIRES_TREE_EDITOR)
      }

      const rankAwardId = input.rankAwardId ?? member.rankAwardId
      const verificationStatus = input.verificationStatus ?? "PENDING"
      const auditNote = String(input.auditNote ?? "").trim()
      if (rankAwardId) {
        const rankAward = await tx.rankAward.findFirst({
          where: {
            id: rankAwardId,
            user: { lineageNode: { id: member.nodeId } },
          },
          select: { id: true },
        })
        if (!rankAward) {
          throw new Error(LINEAGE_EDITOR_ERROR.RANK_AWARD_NOT_FOUND)
        }
      }

      assertPlacementEditorAccess({
        grants,
        members,
        editedMember: member,
        relatedMemberIds: promoterMember ? [promoterMember.id] : [],
        nextParentMemberId: member.primaryVisualParentMemberId,
      })

      const currentRelationship = await tx.lineageRelationship.findFirst({
        where: {
          type: "PROMOTED_BY",
          toNodeId: member.nodeId,
          ...(rankAwardId ? { rankAwardId } : { endedAt: null, rankAwardId: null }),
        },
        select: {
          id: true,
          fromNodeId: true,
          toNodeId: true,
          rankAwardId: true,
          startedAt: true,
          endedAt: true,
          isVerified: true,
          verificationStatus: true,
        },
      })

      let relationshipId: string | null = currentRelationship?.id ?? null

      if (!promoterMember) {
        if (currentRelationship) {
          await tx.lineageRelationship.delete({ where: { id: currentRelationship.id } })
          relationshipId = null
        }
      } else if (currentRelationship) {
        const updated = await tx.lineageRelationship.update({
          where: { id: currentRelationship.id },
          data: {
            fromNodeId: promoterMember.nodeId,
            endedAt: null,
            isVerified: verificationStatus === "VERIFIED",
            verificationStatus,
          },
          select: { id: true },
        })
        relationshipId = updated.id
      } else {
        const created = await tx.lineageRelationship.create({
          data: {
            type: "PROMOTED_BY",
            fromNodeId: promoterMember.nodeId,
            toNodeId: member.nodeId,
            rankAwardId,
            isVerified: verificationStatus === "VERIFIED",
            verificationStatus,
          },
          select: { id: true },
        })
        relationshipId = created.id
      }

      await tx.auditLog.create({
        data: {
          brand,
          action: "lineage.relationship.promoter.updated",
          entityType: "LineageRelationship",
          entityId: relationshipId ?? currentRelationship?.id ?? `cleared-${member.id}`,
          userId,
          before: relationshipAuditSnapshot(currentRelationship),
          after: {
            treeId: tree.id,
            memberId: member.id,
            nodeId: member.nodeId,
            promoterMemberId: promoterMember?.id ?? null,
            promoterNodeId: promoterMember?.nodeId ?? null,
            rankAwardId,
            verificationStatus,
            relationshipId,
            auditNote,
          },
        },
      })

      return {
        treeId: tree.id,
        treeSlug: tree.slug,
        memberId: member.id,
        nodeId: member.nodeId,
        relationshipId,
      }
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )
}

export const applyLineageVisualGroupUpdate = async ({
  db,
  brand,
  userId,
  input,
  isGlobalAdmin,
}: {
  db: AppDb
  brand: Brand
  userId: string
  input: UpdateLineageVisualGroupInput
  isGlobalAdmin?: boolean
}): Promise<UpdateLineageVisualGroupResult> => {
  return db.$transaction(
    async tx => {
      const { tree, grants } = await getEditorTreeContext({
        db: tx as AppDb,
        brand,
        treeId: input.treeId,
        userId,
        isGlobalAdmin,
      })

      if (!hasTreeAdminGrant(grants)) {
        throw new Error(LINEAGE_EDITOR_ERROR.EDITOR_ACCESS_REQUIRED)
      }

      const groupsById = groupById(tree.visualGroups)
      const group = groupsById.get(input.groupId)

      if (!group) {
        throw new Error(LINEAGE_EDITOR_ERROR.GROUP_NOT_FOUND)
      }

      const before = {
        id: group.id,
        label: group.label,
        showPublicLabel: group.showPublicLabel,
        isCollapsedDefault: group.isCollapsedDefault,
      }

      const data = {
        ...(input.label !== undefined ? { label: input.label.trim() } : {}),
        ...(input.showPublicLabel !== undefined ? { showPublicLabel: input.showPublicLabel } : {}),
        ...(input.collapseByDefault !== undefined
          ? { isCollapsedDefault: input.collapseByDefault }
          : {}),
      }

      const updated = await tx.lineageVisualGroup.update({
        where: { id: group.id },
        data,
        select: {
          id: true,
          label: true,
          showPublicLabel: true,
          isCollapsedDefault: true,
        },
      })

      await tx.auditLog.create({
        data: {
          brand,
          action: "lineage.visual_group.updated",
          entityType: "LineageVisualGroup",
          entityId: group.id,
          userId,
          before,
          after: {
            ...updated,
            auditNote: String(input.auditNote ?? "").trim(),
          },
        },
      })

      return {
        treeId: tree.id,
        treeSlug: tree.slug,
        groupId: updated.id,
      }
    },
    { isolationLevel: "Serializable", maxWait: 30000, timeout: 30000 },
  )
}

export const updateLineageMemberPlacement = userActionClient
  .inputSchema(updateLineageMemberPlacementSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const brand = await getRequestBrand()
    const result = await applyLineageMemberPlacementUpdate({
      db,
      brand,
      userId: user.id,
      input: parsedInput,
      isGlobalAdmin: isAdmin(user),
    })

    revalidate({
      paths: [`/lineage/${result.treeSlug}`, `/dashboard/lineage/${result.treeId}`],
      tags: ["lineage"],
    })

    return result
  })

export const updateLineagePromotionRelationship = userActionClient
  .inputSchema(updateLineagePromotionRelationshipSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const brand = await getRequestBrand()
    const result = await applyLineagePromotionRelationshipUpdate({
      db,
      brand,
      userId: user.id,
      input: parsedInput,
      isGlobalAdmin: isAdmin(user),
    })

    revalidate({
      paths: [`/lineage/${result.treeSlug}`, `/dashboard/lineage/${result.treeId}`],
      tags: ["lineage"],
    })

    return result
  })

export const updateLineageVisualGroup = userActionClient
  .inputSchema(updateLineageVisualGroupSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const brand = await getRequestBrand()
    const result = await applyLineageVisualGroupUpdate({
      db,
      brand,
      userId: user.id,
      input: parsedInput,
      isGlobalAdmin: isAdmin(user),
    })

    revalidate({
      paths: [`/lineage/${result.treeSlug}`, `/dashboard/lineage/${result.treeId}`],
      tags: ["lineage"],
    })

    return result
  })
