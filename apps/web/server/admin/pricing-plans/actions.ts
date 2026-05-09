"use server"

import { after } from "next/server"
import type { Prisma } from "~/.generated/prisma/client"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { pricingPlanSchema } from "~/server/admin/pricing-plans/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertPricingPlan = adminActionClient
  .inputSchema(pricingPlanSchema)
  .action(async ({ parsedInput: { id, entitlementIds, metadata, ...input }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    const pricingPlan = id
      ? await db.pricingPlan.update({
          where: { id },
          data: {
            name: input.name,
            pricingModel: input.pricingModel,
            amountCents: input.amountCents,
            currency: input.currency,
            intervalMonths: input.intervalMonths ?? null,
            classCount: input.classCount ?? null,
            trialDays: input.trialDays ?? null,
            isActive: input.isActive,
            sortOrder: input.sortOrder,
            stripeProductId: input.stripeProductId ?? null,
            stripePriceId: input.stripePriceId ?? null,
            organizationId: input.organizationId,
            programId: input.programId ?? null,
            metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
          },
        })
      : await db.pricingPlan.create({
          data: {
            brand,
            name: input.name,
            pricingModel: input.pricingModel,
            amountCents: input.amountCents,
            currency: input.currency,
            intervalMonths: input.intervalMonths ?? null,
            classCount: input.classCount ?? null,
            trialDays: input.trialDays ?? null,
            isActive: input.isActive,
            sortOrder: input.sortOrder,
            stripeProductId: input.stripeProductId ?? null,
            stripePriceId: input.stripePriceId ?? null,
            organizationId: input.organizationId,
            programId: input.programId ?? null,
            metadata: (metadata as Prisma.InputJsonValue) ?? undefined,
          },
        })

    // Sync entitlement grants
    if (entitlementIds) {
      // Remove existing grants
      await db.entitlementGrant.deleteMany({
        where: { pricingPlanId: pricingPlan.id },
      })

      // Create new grants
      if (entitlementIds.length > 0) {
        await db.entitlementGrant.createMany({
          data: entitlementIds.map(entitlementId => ({
            pricingPlanId: pricingPlan.id,
            entitlementId,
          })),
        })
      }
    }

    after(async () => {
      revalidate({
        paths: ["/admin/pricing-plans"],
        tags: ["pricing-plans", `pricing-plan-${pricingPlan.id}`],
      })
    })

    return pricingPlan
  })

export const deletePricingPlans = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    await db.pricingPlan.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/pricing-plans"],
      tags: ["pricing-plans"],
    })
  })
