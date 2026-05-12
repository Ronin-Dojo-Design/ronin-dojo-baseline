"use server"

import { env } from "~/env"
import { isInSameBrand } from "~/lib/authz"
import { getRequestBrand } from "~/lib/brand-context"
import { userActionClient } from "~/lib/safe-actions"
import { findStripeCustomerForCheckout } from "~/server/web/billing/stripe-customers"
import { checkEntitlement } from "~/server/web/entitlement/check-entitlement"
import {
  registrationCancelSchema,
  registrationCheckoutSchema,
} from "~/server/web/tournaments/schema"
import { db } from "~/services/db"
import { stripe } from "~/services/stripe"

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

    // 2. Verify user holds the tournament-registration entitlement for this brand
    const hasEntitlement = await checkEntitlement({
      userId,
      entitlementKey: "tournament-registration",
      brand,
    })

    if (!hasEntitlement) {
      throw new Error(
        "Your subscription does not include tournament registration. Please upgrade your plan.",
      )
    }

    // 2b. Verify user belongs to this brand
    const userInBrand = await isInSameBrand(ctx.user, brand)
    if (!userInBrand) {
      throw new Error("You are not a member of this brand")
    }

    // 2c. Verify user has a Passport (required for tournament registration)
    const passport = await db.passport.findUnique({ where: { userId } })
    if (!passport) {
      throw new Error("Please complete your Passport profile before registering for a tournament")
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

    // Capture narrowed non-null role for use inside transaction closure
    const validatedRole = role

    // 5. Fetch divisions + check capacity (inside serializable transaction to prevent races)
    // Prisma throws P2034 on serializable transaction conflicts (write conflict / deadlock).
    // This is expected under concurrent registration — treat it as a capacity conflict.
    let capacityResult: Awaited<ReturnType<typeof runCapacityTransaction>>
    try {
      capacityResult = await runCapacityTransaction()
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "P2034"
      ) {
        throw new Error(
          "Registration conflict — another registration was processed at the same time. Please try again.",
        )
      }
      throw err
    }

    async function runCapacityTransaction() {
      return db.$transaction(
      async tx => {
        const divisions = await tx.division.findMany({
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

        const totalFeeCents = divisions.reduce((sum, d) => sum + d.feeCents, 0)

        // Snapshot the user's current rank and org for registration entries
        let snapshotRankName: string | null = null
        let snapshotOrgName: string | null = null

        if (input.representingMembershipId) {
          const membership = await tx.membership.findUnique({
            where: { id: input.representingMembershipId },
            select: {
              rank: { select: { name: true } },
              organization: { select: { name: true } },
            },
          })

          if (membership) {
            snapshotRankName = membership.rank?.name ?? null
            snapshotOrgName = membership.organization?.name ?? null
          }
        }

        // If free, create registration inside the transaction
        if (totalFeeCents === 0) {
          const registration = await tx.registration.create({
            data: {
              tournamentId: input.tournamentId,
              userId,
              status: "SUBMITTED",
              paymentStatus: "PAID",
              totalFeeCents: 0,
              submittedAt: new Date(),
              entries: {
                create: input.divisionIds.map(divisionId => ({
                  divisionId,
                  tournamentRoleId: validatedRole.id,
                  representingMembershipId: input.representingMembershipId ?? null,
                  snapshotRankName,
                  snapshotOrgName,
                })),
              },
            },
          })

          return { type: "free" as const, registrationId: registration.id, divisions: [] }
        }

        return { type: "paid" as const, registrationId: null, divisions, totalFeeCents }
      },
      { isolationLevel: "Serializable" },
    )
    }

    if (capacityResult.type === "free") {
      return { type: "free" as const, registrationId: capacityResult.registrationId! }
    }

    const { divisions } = capacityResult
    const existingCustomer = await findStripeCustomerForCheckout({ userId, brand })

    // 8. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer: existingCustomer?.stripeCustomerId,
      customer_creation: existingCustomer ? undefined : "always",
      line_items: divisions.map(div => ({
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
        roleId: validatedRole.id,
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
        stripePaymentIntentId: true,
      },
    })

    if (!registration || registration.userId !== userId) {
      throw new Error("Registration not found")
    }

    if (registration.status === "CANCELLED") {
      throw new Error("Registration is already cancelled")
    }

    // 2. If paid, issue Stripe refund using stored payment intent ID
    let newPaymentStatus = registration.paymentStatus
    if (registration.paymentStatus === "PAID" && registration.totalFeeCents > 0) {
      if (!registration.stripePaymentIntentId) {
        throw new Error("Cannot refund: no payment intent ID stored on registration")
      }

      await stripe.refunds.create({
        payment_intent: registration.stripePaymentIntentId,
      })
      newPaymentStatus = "REFUNDED"
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
