"use server"

import { after } from "next/server"
import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { subscriptionSchema } from "~/server/admin/subscriptions/schema"

export const upsertSubscription = adminActionClient
  .inputSchema(subscriptionSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const subscription = id
      ? await db.userBrandSubscription.update({
          where: { id },
          data: {
            tierId: input.tierId,
            status: input.status,
            startsAt: input.startsAt,
            expiresAt: input.expiresAt,
          },
        })
      : await db.userBrandSubscription.create({
          data: {
            brand: Brand.BBL,
            userId: input.userId,
            tierId: input.tierId,
            status: input.status,
            startsAt: input.startsAt ?? new Date(),
            expiresAt: input.expiresAt,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/app/subscriptions"],
        tags: ["subscriptions", `subscription-${subscription.id}`],
      })
    })

    return subscription
  })

export const deleteSubscriptions = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.userBrandSubscription.deleteMany({
      where: { id: { in: ids }, brand: Brand.BBL },
    })

    revalidate({
      paths: ["/app/subscriptions"],
      tags: ["subscriptions"],
    })
  })
