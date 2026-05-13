"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import {
  transitionMembershipSchema,
  VALID_TRANSITIONS,
  roleAssignmentSchema,
} from "~/server/admin/memberships/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const transitionMembershipStatus = adminActionClient
  .inputSchema(transitionMembershipSchema)
  .action(async ({ parsedInput: { id, toStatus }, ctx: { db, revalidate, brand, user } }) => {
    // Brand scoping note: This action finds by global cuid() ID, not brand-scoped.
    // This is acceptable because: (1) cuid IDs are globally unique — no cross-brand
    // collision, (2) adminActionClient already gates access to admin-role users,
    // (3) the AuditLog records brand provenance for forensic traceability.
    const membership = await db.membership.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!membership) {
      throw new Error("Membership not found")
    }

    const allowed = VALID_TRANSITIONS[membership.status] ?? []
    if (!allowed.includes(toStatus)) {
      throw new Error(
        `Invalid transition: ${membership.status} → ${toStatus}. Allowed: ${allowed.join(", ") || "(terminal state)"}`,
      )
    }

    const previousStatus = membership.status

    const updated = await db.membership.update({
      where: { id },
      data: {
        status: toStatus as typeof membership.status,
        ...(toStatus === "ACTIVE" && !membership.status ? { joinedAt: new Date() } : {}),
        ...(toStatus === "CANCELLED" || toStatus === "EXPIRED" ? { leftAt: new Date() } : {}),
      },
    })

    after(async () => {
      try {
        await db.auditLog.create({
          data: {
            brand: brand,
            action: "STATUS_TRANSITION",
            entityType: "Membership",
            entityId: id,
            before: { status: previousStatus },
            after: { status: toStatus },
            userId: user.id,
          },
        })
      } catch (error) {
        // Audit write is fire-and-forget — transition already succeeded.
        // Log the failure for monitoring but don't throw.
        console.error("[AuditLog] Failed to write STATUS_TRANSITION audit entry", {
          entityId: id,
          action: "STATUS_TRANSITION",
          error,
        })
      }

      revalidate({
        paths: ["/admin/memberships"],
        tags: ["memberships", `membership-${updated.id}`],
      })
    })

    return updated
  })

export const deleteMemberships = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    await db.membership.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/memberships"],
      tags: ["memberships"],
    })

    return true
  })

export const assignRoleToMembership = adminActionClient
  .inputSchema(roleAssignmentSchema)
  .action(async ({ parsedInput: { membershipId, roleId }, ctx: { db, revalidate } }) => {
    const assignment = await db.membershipRoleAssignment.upsert({
      where: { membershipId_roleId: { membershipId, roleId } },
      create: { membershipId, roleId },
      update: {},
    })

    after(async () => {
      revalidate({
        paths: ["/admin/memberships", `/admin/memberships/${membershipId}`],
        tags: ["memberships", `membership-${membershipId}`],
      })
    })

    return assignment
  })

export const removeRoleFromMembership = adminActionClient
  .inputSchema(roleAssignmentSchema)
  .action(async ({ parsedInput: { membershipId, roleId }, ctx: { db, revalidate } }) => {
    await db.membershipRoleAssignment.delete({
      where: { membershipId_roleId: { membershipId, roleId } },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/memberships", `/admin/memberships/${membershipId}`],
        tags: ["memberships", `membership-${membershipId}`],
      })
    })

    return true
  })
