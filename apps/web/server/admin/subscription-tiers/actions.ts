"use server"

import { after } from "next/server"
import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { subscriptionTierSchema } from "~/server/admin/subscription-tiers/schema"

export const upsertSubscriptionTier = adminActionClient
  .inputSchema(subscriptionTierSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
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
            brand: Brand.BBL,
            code: input.code,
            name: input.name,
            description: input.description,
            level: input.level,
            isSystem: input.isSystem,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/app/subscription-tiers"],
        tags: ["subscription-tiers", `subscription-tier-${tier.id}`],
      })
    })

    return tier
  })

export const deleteSubscriptionTiers = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.subscriptionTier.deleteMany({
      where: { id: { in: ids }, brand: Brand.BBL },
    })

    revalidate({
      paths: ["/app/subscription-tiers"],
      tags: ["subscription-tiers"],
    })
  })
