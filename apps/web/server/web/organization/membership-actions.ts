"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { notifyMemberOfMembershipStatusChange } from "~/lib/notifications"
import { userActionClient } from "~/lib/safe-actions"
import { VALID_TRANSITIONS } from "~/server/admin/memberships/constants"
import { assertOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import { db } from "~/services/db"

const orgTransitionSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  membershipId: z.string().min(1, "Membership ID is required"),
  toStatus: z.enum(["INVITED", "PENDING", "ACTIVE", "SUSPENDED", "CANCELLED", "EXPIRED"]),
})

/**
 * Org-scoped membership status transition for the org settings → members surface.
 *
 * Authorized for the org owner or a member with the ORG_ADMIN role (via
 * `assertOrgAdminAccess`). Mirrors the platform-admin transition contract
 * (`server/admin/memberships/actions.ts`): same `VALID_TRANSITIONS` guard,
 * optimistic-lock update, fire-and-forget audit log + email notify. Unlike the
 * platform-admin path, this verifies the membership belongs to the asserted org
 * so an org admin cannot transition another org's member by ID.
 */
export const transitionOrgMembershipStatus = userActionClient
  .inputSchema(orgTransitionSchema)
  .action(
    async ({
      parsedInput: { organizationId, membershipId, toStatus },
      ctx: { user, db, revalidate },
    }) => {
      await assertOrgAdminAccess(user.id, organizationId)

      const membership = await db.membership.findUnique({
        where: { id: membershipId },
        select: {
          id: true,
          status: true,
          version: true,
          brand: true,
          organizationId: true,
          user: { select: { email: true, name: true } },
          organization: { select: { name: true, slug: true } },
          discipline: { select: { name: true } },
        },
      })

      if (!membership) {
        throw new Error("Membership not found")
      }

      // Cross-org guard: the membership must belong to the asserted org.
      if (membership.organizationId !== organizationId) {
        throw new Error("ACCESS_DENIED")
      }

      const allowed = VALID_TRANSITIONS[membership.status] ?? []
      if (!allowed.includes(toStatus)) {
        throw new Error(
          `Invalid transition: ${membership.status} → ${toStatus}. Allowed: ${allowed.join(", ") || "(terminal state)"}`,
        )
      }

      const previousStatus = membership.status

      // Optimistic locking: only update if version is unchanged since read.
      // A losing concurrent writer triggers P2025 (compound where no longer matches).
      let updated: Awaited<ReturnType<typeof db.membership.update>>
      try {
        updated = await db.membership.update({
          where: { id: membershipId, version: membership.version },
          data: {
            status: toStatus as typeof membership.status,
            version: { increment: 1 },
            ...(toStatus === "ACTIVE" ? { joinedAt: new Date() } : {}),
            ...(toStatus === "CANCELLED" || toStatus === "EXPIRED" ? { leftAt: new Date() } : {}),
          },
        })
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          (error as { code: string }).code === "P2025"
        ) {
          throw new Error(
            `Conflict: membership ${membershipId} was modified by another request. Please retry.`,
          )
        }
        throw error
      }

      after(async () => {
        try {
          await db.auditLog.create({
            data: {
              brand: membership.brand,
              action: "STATUS_TRANSITION",
              entityType: "Membership",
              entityId: membershipId,
              before: { status: previousStatus },
              after: { status: toStatus },
              userId: user.id,
            },
          })
        } catch (error) {
          // Audit write is fire-and-forget — transition already succeeded.
          console.error("[AuditLog] Failed to write org STATUS_TRANSITION audit entry", {
            entityId: membershipId,
            action: "STATUS_TRANSITION",
            error,
          })
        }

        if (membership.user.email) {
          try {
            await notifyMemberOfMembershipStatusChange({
              to: membership.user.email,
              firstName: membership.user.name?.split(" ")[0] ?? null,
              organizationName: membership.organization.name,
              disciplineName: membership.discipline.name,
              previousStatus,
              newStatus: toStatus,
            })
          } catch (error) {
            console.error("[notify] org membership status email failed", {
              entityId: membershipId,
              error,
            })
          }
        }

        revalidate({
          paths: [`/organizations/${membership.organization.slug}/settings/members`],
          tags: ["memberships", `membership-${updated.id}`],
        })
      })

      return updated
    },
  )

const orgRoleSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  membershipId: z.string().min(1, "Membership ID is required"),
  roleId: z.string().min(1, "Role ID is required"),
})

const orgRejectSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  membershipId: z.string().min(1, "Membership ID is required"),
})

/**
 * Load a membership for an org-scoped mutation and enforce the cross-org guard.
 * Throws ACCESS_DENIED if the membership does not belong to `organizationId`,
 * so an org admin cannot act on another org's member by ID. Caller must have
 * already passed `assertOrgAdminAccess` for `organizationId`.
 */
async function loadOrgMembership(membershipId: string, organizationId: string) {
  const membership = await db.membership.findUnique({
    where: { id: membershipId },
    select: {
      id: true,
      status: true,
      brand: true,
      organizationId: true,
      organization: { select: { slug: true } },
    },
  })

  if (!membership) {
    throw new Error("Membership not found")
  }
  if (membership.organizationId !== organizationId) {
    throw new Error("ACCESS_DENIED")
  }

  return membership
}

/**
 * Assign a system role to a member of the org. Authorized for owner + ORG_ADMIN.
 * Validates the role is a system role and the member belongs to the org.
 * Idempotent via upsert on the compound unique.
 *
 * PRIVILEGE ESCALATION GUARD (F-0300-2): Only the org owner can assign the
 * ORG_ADMIN role. An ORG_ADMIN cannot elevate another member to ORG_ADMIN.
 */
export const assignOrgRole = userActionClient
  .inputSchema(orgRoleSchema)
  .action(
    async ({
      parsedInput: { organizationId, membershipId, roleId },
      ctx: { user, db, revalidate },
    }) => {
      await assertOrgAdminAccess(user.id, organizationId)
      const membership = await loadOrgMembership(membershipId, organizationId)

      const role = await db.role.findUnique({
        where: { id: roleId },
        select: { id: true, code: true, isSystem: true },
      })
      if (!role?.isSystem) {
        throw new Error("Invalid role")
      }

      // F-0300-2: Only the org owner can assign ORG_ADMIN to prevent privilege escalation.
      if (role.code === "ORG_ADMIN") {
        const org = await db.organization.findUnique({
          where: { id: organizationId },
          select: { ownerId: true },
        })
        if (org?.ownerId !== user.id) {
          throw new Error("ACCESS_DENIED")
        }
      }

      const assignment = await db.membershipRoleAssignment.upsert({
        where: { membershipId_roleId: { membershipId, roleId } },
        create: { membershipId, roleId },
        update: {},
      })

      after(async () => {
        try {
          await db.auditLog.create({
            data: {
              brand: membership.brand,
              action: "ROLE_ASSIGNED",
              entityType: "Membership",
              entityId: membershipId,
              after: { roleId, roleCode: role.code },
              userId: user.id,
            },
          })
        } catch (error) {
          console.error("[AuditLog] Failed to write org ROLE_ASSIGNED entry", {
            entityId: membershipId,
            error,
          })
        }

        revalidate({
          paths: [`/organizations/${membership.organization.slug}/settings/members`],
          tags: ["memberships", `membership-${membershipId}`],
        })
      })

      return assignment
    },
  )

/**
 * Remove a system role from a member of the org. Authorized for owner + ORG_ADMIN.
 * Idempotent via deleteMany (no P2025 on a double-click race).
 */
export const removeOrgRole = userActionClient
  .inputSchema(orgRoleSchema)
  .action(
    async ({
      parsedInput: { organizationId, membershipId, roleId },
      ctx: { user, db, revalidate },
    }) => {
      await assertOrgAdminAccess(user.id, organizationId)
      const membership = await loadOrgMembership(membershipId, organizationId)

      const role = await db.role.findUnique({
        where: { id: roleId },
        select: { code: true },
      })

      await db.membershipRoleAssignment.deleteMany({ where: { membershipId, roleId } })

      after(async () => {
        try {
          await db.auditLog.create({
            data: {
              brand: membership.brand,
              action: "ROLE_REMOVED",
              entityType: "Membership",
              entityId: membershipId,
              before: { roleId, roleCode: role?.code ?? null },
              userId: user.id,
            },
          })
        } catch (error) {
          console.error("[AuditLog] Failed to write org ROLE_REMOVED entry", {
            entityId: membershipId,
            error,
          })
        }

        revalidate({
          paths: [`/organizations/${membership.organization.slug}/settings/members`],
          tags: ["memberships", `membership-${membershipId}`],
        })
      })

      return { removed: true }
    },
  )

/**
 * Reject (decline) a PENDING join request by hard-deleting the membership row.
 * Resolves F-0296-1: leaving a CANCELLED row collided with
 * `@@unique([userId, organizationId, disciplineId])` and blocked re-requests.
 * A declined request is not a membership — removing it lets the user re-apply.
 * Writes a REQUEST_REJECTED audit entry before the delete (AuditLog.entityId is
 * a free string, so the record survives the row deletion).
 */
export const rejectOrgJoinRequest = userActionClient
  .inputSchema(orgRejectSchema)
  .action(
    async ({ parsedInput: { organizationId, membershipId }, ctx: { user, db, revalidate } }) => {
      await assertOrgAdminAccess(user.id, organizationId)
      const membership = await loadOrgMembership(membershipId, organizationId)

      if (membership.status !== "PENDING") {
        throw new Error("Only pending join requests can be rejected")
      }

      // Record the rejection before the row disappears. Wrapped so an audit
      // failure does not abort the reject itself.
      try {
        await db.auditLog.create({
          data: {
            brand: membership.brand,
            action: "REQUEST_REJECTED",
            entityType: "Membership",
            entityId: membershipId,
            before: { status: "PENDING" },
            userId: user.id,
          },
        })
      } catch (error) {
        console.error("[AuditLog] Failed to write org REQUEST_REJECTED entry", {
          entityId: membershipId,
          error,
        })
      }

      await db.membership.delete({ where: { id: membershipId } })

      after(async () => {
        revalidate({
          paths: [`/organizations/${membership.organization.slug}/settings/members`],
          tags: ["memberships", `membership-${membershipId}`],
        })
      })

      return { rejected: true }
    },
  )
