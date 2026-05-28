/**
 * @added   SESSION_0147 (2026-05-12)
 * @why     Public claim action — validates invite, creates InviteClaim + Membership in transaction
 * @wired   app/(web)/invite/[code]/claim-form.tsx
 */
"use server"

import { after } from "next/server"
import * as z from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { notifyMemberOfMembershipWelcome } from "~/lib/notifications"
import { userActionClient } from "~/lib/safe-actions"

const claimInviteSchema = z.object({
  code: z.string().min(1),
  disciplineId: z.string().min(1, "Discipline is required"),
})

export const claimInvite = userActionClient
  .inputSchema(claimInviteSchema)
  .action(async ({ parsedInput: { code, disciplineId }, ctx: { db, user } }) => {
    const brand = await getRequestBrand()

    // Find and validate invite in a transaction
    const result = await db.$transaction(async tx => {
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
          brand,
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

      return {
        membership,
        organizationName: invite.organization.name,
        disciplineName: membership.discipline.name,
      }
    })

    // Fire-and-forget welcome email. Resend failures must not unwind the
    // membership write (already committed), so we run it post-tx in `after()`
    // and wrap in try/catch.
    if (user.email) {
      after(async () => {
        try {
          await notifyMemberOfMembershipWelcome({
            brand,
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
