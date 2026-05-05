"use server"

import { after } from "next/server"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { subscriptionSchema } from "~/server/admin/subscriptions/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertSubscription = adminActionClient
  .inputSchema(subscriptionSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

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
            brand,
            userId: input.userId,
            tierId: input.tierId,
            status: input.status,
            startsAt: input.startsAt ?? new Date(),
            expiresAt: input.expiresAt,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/subscriptions"],
        tags: ["subscriptions", `subscription-${subscription.id}`],
      })
    })

    return subscription
  })

export const deleteSubscriptions = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    await db.userBrandSubscription.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/subscriptions"],
      tags: ["subscriptions"],
    })
  })
