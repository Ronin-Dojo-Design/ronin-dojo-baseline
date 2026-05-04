"use server"

import { registrationCheckoutSchema } from "~/server/web/tournaments/schema"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { db } from "~/services/db"
import { stripe } from "~/services/stripe"
import { env } from "~/env"

/**
 * Create a Stripe checkout session for tournament registration.
 * Validates capacity + brand scoping before creating the session.
 */
export const createRegistrationCheckout = userActionClient
  .schema(registrationCheckoutSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const brand = await getRequestBrand()
    const userId = ctx.user.id

    // 1. Verify tournament exists, is PUBLISHED, and belongs to this brand
    const tournament = await db.tournament.findFirst({
      where: {
        id: input.tournamentId,
        brand,
        status: "PUBLISHED",
      },
      select: { id: true, name: true, slug: true, startDate: true },
    })

    if (!tournament) {
      throw new Error("Tournament not found or not open for registration")
    }

    // 3. Check user doesn't already have a registration
    const existing = await db.registration.findUnique({
      where: { tournamentId_userId: { tournamentId: input.tournamentId, userId } },
    })

    if (existing) {
      throw new Error("You are already registered for this tournament")
    }

    // 4. Resolve tournament role
    const role = await db.tournamentRole.findFirst({
      where: { code: input.roleCode, OR: [{ brand }, { brand: null, isSystem: true }] },
    })

    if (!role) {
      throw new Error(`Role "${input.roleCode}" not found`)
    }

    // 5. Fetch divisions + check capacity
    const divisions = await db.division.findMany({
      where: { id: { in: input.divisionIds } },
      include: { _count: { select: { entries: { where: { status: "ACTIVE" } } } } },
    })

    if (divisions.length !== input.divisionIds.length) {
      throw new Error("One or more selected divisions not found")
    }

    for (const div of divisions) {
      if (div.capacity && div._count.entries >= div.capacity) {
        throw new Error(`Division "${div.name}" is at capacity`)
      }
    }

    // 6. Calculate total fee
    const totalFeeCents = divisions.reduce((sum, d) => sum + d.feeCents, 0)

    // 7. If free, create registration directly (no Stripe needed)
    if (totalFeeCents === 0) {
      const registration = await db.registration.create({
        data: {
          tournamentId: input.tournamentId,
          userId,
          status: "SUBMITTED",
          paymentStatus: "PAID",
          totalFeeCents: 0,
          submittedAt: new Date(),
          entries: {
            create: input.divisionIds.map((divisionId) => ({
              divisionId,
              tournamentRoleId: role.id,
              representingMembershipId: input.representingMembershipId ?? null,
            })),
          },
        },
      })

      return { type: "free" as const, registrationId: registration.id }
    }

    // 8. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: divisions.map((div) => ({
        price_data: {
          currency: "usd",
          unit_amount: div.feeCents,
          product_data: {
            name: `${tournament.name} — ${div.name}`,
          },
        },
        quantity: 1,
      })),
      metadata: {
        type: "tournament_registration",
        tournamentId: input.tournamentId,
        userId,
        divisionIds: JSON.stringify(input.divisionIds),
        roleId: role.id,
        representingMembershipId: input.representingMembershipId ?? "",
      },
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/tournaments/${tournament.slug}?registered=true`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/tournaments/${tournament.slug}`,
    })

    return { type: "checkout" as const, url: session.url }
  })
