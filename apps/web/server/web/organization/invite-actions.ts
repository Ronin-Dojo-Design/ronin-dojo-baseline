"use server"

import { after } from "next/server"
import { z } from "zod/v4"
import { userActionClient } from "~/lib/safe-actions"
import { assertOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import { db } from "~/services/db"

const createOrgInviteSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  maxUses: z.coerce.number().int().positive().nullable().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
})

const revokeOrgInviteSchema = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  inviteId: z.string().min(1, "Invite ID is required"),
})

/**
 * Generate an org-scoped invite link. Authorized for owner + ORG_ADMIN via
 * `assertOrgAdminAccess`. Forces `type: ORGANIZATION` and the caller's org; the
 * code is auto-generated (cuid default) and the public `/invite/[code]` claim
 * flow (`server/invites/actions.ts`) handles the rest unchanged. Brand is
 * sourced from the org row. Optional `maxUses` / `expiresAt` are enforced at
 * claim time by the existing flow.
 */
export const createOrgInvite = userActionClient
  .inputSchema(createOrgInviteSchema)
  .action(
    async ({ parsedInput: { organizationId, maxUses, expiresAt }, ctx: { user, revalidate } }) => {
      await assertOrgAdminAccess(user.id, organizationId)

      const org = await db.organization.findUnique({
        where: { id: organizationId },
        select: { brand: true, slug: true },
      })
      if (!org) {
        throw new Error("Organization not found")
      }

      const invite = await db.invite.create({
        data: {
          brand: org.brand,
          type: "ORGANIZATION",
          organizationId,
          createdById: user.id,
          maxUses: maxUses ?? null,
          expiresAt: expiresAt ?? null,
        },
      })

      after(async () => {
        revalidate({
          paths: [`/organizations/${org.slug}/settings/invites`],
          tags: ["invites", `invite-${invite.id}`],
        })
      })

      return invite
    },
  )

/**
 * Revoke an org-scoped invite (status → REVOKED). Authorized for owner +
 * ORG_ADMIN. Guards that the invite belongs to the asserted org so an org admin
 * cannot revoke another org's invite by ID.
 */
export const revokeOrgInvite = userActionClient
  .inputSchema(revokeOrgInviteSchema)
  .action(async ({ parsedInput: { organizationId, inviteId }, ctx: { user, revalidate } }) => {
    await assertOrgAdminAccess(user.id, organizationId)

    const invite = await db.invite.findUnique({
      where: { id: inviteId },
      select: { id: true, organizationId: true, organization: { select: { slug: true } } },
    })
    if (!invite) {
      throw new Error("Invite not found")
    }
    if (invite.organizationId !== organizationId) {
      throw new Error("ACCESS_DENIED")
    }

    await db.invite.update({
      where: { id: inviteId },
      data: { status: "REVOKED" },
    })

    after(async () => {
      revalidate({
        paths: [`/organizations/${invite.organization.slug}/settings/invites`],
        tags: ["invites", `invite-${inviteId}`],
      })
    })

    return { revoked: true }
  })
