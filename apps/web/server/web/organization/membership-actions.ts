"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { notifyMemberOfMembershipStatusChange } from "~/lib/notifications"
import { userActionClient } from "~/lib/safe-actions"
import { VALID_TRANSITIONS } from "~/server/admin/memberships/constants"
import { assertOrgAdminAccess } from "~/server/web/organization/org-admin-access"

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
