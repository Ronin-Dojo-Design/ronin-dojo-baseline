"use server"

import { z } from "zod"
import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"

const createEntitlementSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
})

const linkPlanToEntitlementSchema = z.object({
  pricingPlanId: z.string().min(1),
  entitlementId: z.string().min(1),
})

/**
 * Create a new Entitlement definition for the current brand.
 */
export const createEntitlement = adminActionClient
  .schema(createEntitlementSchema)
  .action(async ({ parsedInput: input, ctx: { db } }) => {
    return db.entitlement.create({
      data: {
        brand: Brand.BBL,
        key: input.key,
        name: input.name,
        description: input.description,
      },
    })
  })

/**
 * Link a PricingPlan to an Entitlement (creates EntitlementGrant).
 */
export const linkPlanToEntitlement = adminActionClient
  .schema(linkPlanToEntitlementSchema)
  .action(async ({ parsedInput: input, ctx: { db } }) => {
    return db.entitlementGrant.create({
      data: {
        pricingPlanId: input.pricingPlanId,
        entitlementId: input.entitlementId,
      },
    })
  })

/**
 * List all entitlements for the current brand.
 */
export const listEntitlements = adminActionClient.action(async ({ ctx: { db } }) => {
  return db.entitlement.findMany({
    where: { brand: Brand.BBL },
    include: { grants: { include: { pricingPlan: true } } },
    orderBy: { createdAt: "desc" },
  })
})
