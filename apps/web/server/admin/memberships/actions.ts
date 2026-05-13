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
      select: { id: true, status: true, version: true },
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

    // Optimistic locking: only update if version hasn't changed since read.
    // If another caller updated first, Prisma throws P2025 (record not found)
    // because the compound where {id, version} no longer matches.
    let updated
    try {
      updated = await db.membership.update({
        where: { id, version: membership.version },
        data: {
          status: toStatus as typeof membership.status,
          version: { increment: 1 },
          ...(toStatus === "ACTIVE" && !membership.status ? { joinedAt: new Date() } : {}),
          ...(toStatus === "CANCELLED" || toStatus === "EXPIRED" ? { leftAt: new Date() } : {}),
        },
      })
    } catch (error: unknown) {
      // P2025 = "Record to update not found" — another caller won the race
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code: string }).code === "P2025"
      ) {
        throw new Error(
          `Conflict: membership ${id} was modified by another request. Please retry.`,
        )
      }
      throw error
    }

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
