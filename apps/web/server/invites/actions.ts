/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Public claim action — validates invite, creates InviteClaim + Membership in transaction
 * @wired   app/(web)/invite/[code]/claim-form.tsx
 */
"use server"

import { after } from "next/server"
import * as z from "zod"
import type { Brand } from "~/.generated/prisma/client"
import {
  getLineageCompEntitlementKeys,
  parseLineageCompMeta,
} from "~/lib/entitlements/lineage-comp"
import { notifyMemberOfMembershipWelcome } from "~/lib/notifications"
import { userActionClient } from "~/lib/safe-actions"
import { grantComp } from "~/server/entitlements/comp-grants"

const claimInviteSchema = z.object({
  code: z.string().min(1),
  disciplineId: z.string().min(1, "Discipline is required"),
})

type ClaimInviteResult = {
  membership: {
    id: string
    userId: string
    brand: Brand
  }
  brand: Brand
  organizationName: string
  disciplineName: string
  compGrantIds: string[]
}

export const claimInvite = userActionClient
  .inputSchema(claimInviteSchema)
  .action(async ({ parsedInput: { code, disciplineId }, ctx: { db, user } }) => {
    // Find and validate invite in a transaction
    const result = await db.$transaction(async (tx: any): Promise<ClaimInviteResult> => {
      const invite = await tx.invite.findUnique({
        where: { code },
        include: { organization: { select: { id: true, name: true } } },
      })

      if (!invite) throw new Error("Invite not found")
      if (invite.status !== "PENDING") throw new Error("This invite is no longer active")
      if (invite.expiresAt && invite.expiresAt < new Date())
        throw new Error("This invite has expired")
      if (invite.maxUses && invite.currentUses >= invite.maxUses)
        throw new Error("This invite has reached its maximum uses")

      // Check if user already claimed this invite
      const existingClaim = await tx.inviteClaim.findUnique({
        where: { inviteId_userId: { inviteId: invite.id, userId: user.id } },
      })
      if (existingClaim) throw new Error("You have already claimed this invite")

      // Check if user already has a membership in this org+discipline
      const existingMembership = await tx.membership.findUnique({
        where: {
          userId_organizationId_disciplineId: {
            userId: user.id,
            organizationId: invite.organizationId,
            disciplineId,
          },
        },
      })
      if (existingMembership)
        throw new Error("You already have a membership in this organization for this discipline")

      // Create claim
      await tx.inviteClaim.create({
        data: {
          inviteId: invite.id,
          userId: user.id,
        },
      })

      // Increment invite use count
      await tx.invite.update({
        where: { id: invite.id },
        data: { currentUses: { increment: 1 } },
      })

      // Create membership
      const membership = await tx.membership.create({
        data: {
          brand: invite.brand,
          userId: user.id,
          organizationId: invite.organizationId,
          disciplineId,
          status: "ACTIVE",
          joinedAt: new Date(),
        },
        include: {
          discipline: { select: { name: true } },
        },
      })

      const comp = parseLineageCompMeta(invite.meta)
      const compGrantIds = comp
        ? (
            await grantComp({
              db: tx,
              brand: invite.brand,
              grantorUserId: invite.createdById,
              granteeUserId: user.id,
              entitlementKeys: getLineageCompEntitlementKeys(comp.tier),
              term: comp.termDays ? { days: comp.termDays } : null,
              reason: `invite-${invite.id}`,
            })
          ).grants.map(grant => grant.id)
        : []

      return {
        membership: {
          id: membership.id,
          userId: membership.userId,
          brand: membership.brand,
        },
        brand: invite.brand,
        organizationName: invite.organization.name,
        disciplineName: membership.discipline.name,
        compGrantIds,
      }
    })

    // Fire-and-forget welcome email. Resend failures must not unwind the
    // membership write (already committed), so we run it post-tx in `after()`
    // and wrap in try/catch.
    if (user.email) {
      after(async () => {
        try {
          await notifyMemberOfMembershipWelcome({
            brand: result.brand,
            to: user.email,
            firstName: user.name?.split(" ")[0] ?? null,
            organizationName: result.organizationName,
            disciplineName: result.disciplineName,
            status: "ACTIVE",
          })
        } catch (error) {
          console.error("[notify] claimInvite welcome email failed", {
            membershipId: result.membership.id,
            error,
          })
        }
      })
    }

    return result
  })
