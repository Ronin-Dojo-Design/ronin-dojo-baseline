"use server"

import { after } from "next/server"
import type { Brand } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import {
  toggleLineageTreeClaimabilitySchema,
  toggleLineageTreeMemberClaimabilitySchema,
  updateLineageTreeMemberSelectedRankSchema,
} from "~/server/admin/lineage/schema"
import type { db as appDb } from "~/services/db"

const LINEAGE_ADMIN_ERROR = {
  NOT_FOUND: "Lineage tree not found.",
  MEMBER_NOT_FOUND: "Lineage tree member not found.",
  RANK_AWARD_NOT_FOUND: "Rank award is not attached to this lineage tree member.",
  NOT_AUTHORIZED: "You are not authorized to manage this lineage tree.",
} as const

async function assertCanManageLineageTree({
  db,
  userId,
  userRole,
  brand,
  treeId,
}: {
  db: typeof appDb
  userId: string
  userRole: string | null | undefined
  brand: Brand
  treeId: string
}) {
  const tree = await db.lineageTree.findFirst({
    where: { id: treeId, brand },
    select: { id: true, slug: true, name: true, isClaimable: true },
  })

  if (!tree) {
    throw new Error(LINEAGE_ADMIN_ERROR.NOT_FOUND)
  }

  if (userRole === "admin") {
    return tree
  }

  const grant = await db.lineageTreeAccess.findFirst({
    where: {
      treeId,
      userId,
      role: "TREE_ADMIN",
      revokedAt: null,
    },
    select: { id: true },
  })

  if (!grant) {
    throw new Error(LINEAGE_ADMIN_ERROR.NOT_AUTHORIZED)
  }

  return tree
}

export const toggleLineageTreeClaimability = userActionClient
  .inputSchema(toggleLineageTreeClaimabilitySchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    const brand = await getRequestBrand()
    const tree = await assertCanManageLineageTree({
      db,
      userId: user.id,
      userRole: user.role,
      brand,
      treeId: parsedInput.treeId,
    })

    const updated = await db.lineageTree.update({
      where: { id: tree.id },
      data: { isClaimable: parsedInput.isClaimable },
      select: { id: true, slug: true, name: true, isClaimable: true },
    })

    await db.auditLog.create({
      data: {
        brand,
        action: "lineage.tree.claimability.updated",
        entityType: "LineageTree",
        entityId: tree.id,
        userId: user.id,
        before: { isClaimable: tree.isClaimable },
        after: { isClaimable: updated.isClaimable },
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/lineage", `/admin/lineage/${tree.id}`, "/lineage", `/lineage/${tree.slug}`],
        tags: ["lineage", `lineage-tree-${brand}-${tree.slug}`, `lineage-trees-${brand}`],
      })
    })

    return updated
  })

export const toggleLineageTreeMemberClaimability = userActionClient
  .inputSchema(toggleLineageTreeMemberClaimabilitySchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    const brand = await getRequestBrand()
    const tree = await assertCanManageLineageTree({
      db,
      userId: user.id,
      userRole: user.role,
      brand,
      treeId: parsedInput.treeId,
    })

    const member = await db.lineageTreeMember.findFirst({
      where: {
        id: parsedInput.memberId,
        treeId: tree.id,
      },
      select: { id: true, isClaimable: true, nodeId: true },
    })

    if (!member) {
      throw new Error(LINEAGE_ADMIN_ERROR.MEMBER_NOT_FOUND)
    }

    const updated = await db.lineageTreeMember.update({
      where: { id: member.id },
      data: { isClaimable: parsedInput.isClaimable },
      select: { id: true, isClaimable: true },
    })

    await db.auditLog.create({
      data: {
        brand,
        action: "lineage.tree.member.claimability.updated",
        entityType: "LineageTreeMember",
        entityId: member.id,
        userId: user.id,
        before: { isClaimable: member.isClaimable },
        after: { isClaimable: updated.isClaimable, nodeId: member.nodeId, treeId: tree.id },
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/lineage", `/admin/lineage/${tree.id}`, "/lineage", `/lineage/${tree.slug}`],
        tags: ["lineage", `lineage-tree-${brand}-${tree.slug}`, `lineage-trees-${brand}`],
      })
    })

    return updated
  })

export const updateLineageTreeMemberSelectedRank = userActionClient
  .inputSchema(updateLineageTreeMemberSelectedRankSchema)
  .action(async ({ parsedInput, ctx: { db, user, revalidate } }) => {
    const brand = await getRequestBrand()
    const tree = await assertCanManageLineageTree({
      db,
      userId: user.id,
      userRole: user.role,
      brand,
      treeId: parsedInput.treeId,
    })

    const member = await db.lineageTreeMember.findFirst({
      where: {
        id: parsedInput.memberId,
        treeId: tree.id,
      },
      select: {
        id: true,
        nodeId: true,
        rankAwardId: true,
        node: { select: { userId: true } },
      },
    })

    if (!member) {
      throw new Error(LINEAGE_ADMIN_ERROR.MEMBER_NOT_FOUND)
    }

    if (parsedInput.rankAwardId) {
      const rankAward = await db.rankAward.findFirst({
        where: {
          id: parsedInput.rankAwardId,
          userId: member.node.userId,
        },
        select: { id: true },
      })

      if (!rankAward) {
        throw new Error(LINEAGE_ADMIN_ERROR.RANK_AWARD_NOT_FOUND)
      }
    }

    const updated = await db.lineageTreeMember.update({
      where: { id: member.id },
      data: { rankAwardId: parsedInput.rankAwardId },
      select: { id: true, rankAwardId: true },
    })

    await db.auditLog.create({
      data: {
        brand,
        action: "lineage.tree.member.selected_rank.updated",
        entityType: "LineageTreeMember",
        entityId: member.id,
        userId: user.id,
        before: { rankAwardId: member.rankAwardId },
        after: { rankAwardId: updated.rankAwardId, nodeId: member.nodeId, treeId: tree.id },
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/lineage", `/admin/lineage/${tree.id}`, "/lineage", `/lineage/${tree.slug}`],
        tags: ["lineage", `lineage-tree-${brand}-${tree.slug}`, `lineage-trees-${brand}`],
      })
    })

    return updated
  })
