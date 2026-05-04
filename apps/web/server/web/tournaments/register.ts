"use server"

import { registrationCheckoutSchema, registrationCancelSchema } from "~/server/web/tournaments/schema"
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

/**
 * Cancel a tournament registration.
 * If the registration was paid, issues a Stripe refund.
 */
export const cancelRegistration = userActionClient
  .schema(registrationCancelSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const userId = ctx.user.id

    // 1. Find the registration and verify ownership
    const registration = await db.registration.findUnique({
      where: { id: input.registrationId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalFeeCents: true,
        userId: true,
        tournamentId: true,
      },
    })

    if (!registration || registration.userId !== userId) {
      throw new Error("Registration not found")
    }

    if (registration.status === "CANCELLED") {
      throw new Error("Registration is already cancelled")
    }

    // 2. If paid, issue Stripe refund via checkout session lookup
    let newPaymentStatus = registration.paymentStatus
    if (registration.paymentStatus === "PAID" && registration.totalFeeCents > 0) {
      const allSessions = await stripe.checkout.sessions.list({ limit: 100 })
      const matchingSession = allSessions.data.find(
        (s) =>
          s.metadata?.type === "tournament_registration" &&
          s.metadata?.tournamentId === registration.tournamentId &&
          s.metadata?.userId === userId,
      )

      if (matchingSession?.payment_intent) {
        const paymentIntentId =
          typeof matchingSession.payment_intent === "string"
            ? matchingSession.payment_intent
            : matchingSession.payment_intent.id

        await stripe.refunds.create({
          payment_intent: paymentIntentId,
        })
        newPaymentStatus = "REFUNDED"
      }
    }

    // 3. Update registration status
    await db.registration.update({
      where: { id: registration.id },
      data: {
        status: "CANCELLED",
        paymentStatus: newPaymentStatus,
      },
    })

    // 4. Mark all entries as withdrawn
    await db.registrationEntry.updateMany({
      where: { registrationId: registration.id },
      data: { status: "CANCELLED" },
    })

    return { success: true }
  })
