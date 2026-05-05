"use server"

import { after } from "next/server"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { subscriptionTierSchema } from "~/server/admin/subscription-tiers/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertSubscriptionTier = adminActionClient
  .inputSchema(subscriptionTierSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    const tier = id
      ? await db.subscriptionTier.update({
          where: { id },
          data: {
            code: input.code,
            name: input.name,
            description: input.description,
            level: input.level,
            isSystem: input.isSystem,
          },
        })
      : await db.subscriptionTier.create({
          data: {
            brand,
            code: input.code,
            name: input.name,
            description: input.description,
            level: input.level,
            isSystem: input.isSystem,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/subscription-tiers"],
        tags: ["subscription-tiers", `subscription-tier-${tier.id}`],
      })
    })

    return tier
  })

export const deleteSubscriptionTiers = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    await db.subscriptionTier.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/subscription-tiers"],
      tags: ["subscription-tiers"],
    })
  })
