"use server"

import { after } from "next/server"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"
import { entitlementSchema } from "~/server/admin/entitlements/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertEntitlement = adminActionClient
  .inputSchema(entitlementSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    const entitlement = id
      ? await db.entitlement.update({
          where: { id },
          data: {
            key: input.key,
            name: input.name,
            description: input.description,
          },
        })
      : await db.entitlement.create({
          data: {
            brand,
            key: input.key,
            name: input.name,
            description: input.description,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/entitlements"],
        tags: ["entitlements", `entitlement-${entitlement.id}`],
      })
    })

    return entitlement
  })

export const deleteEntitlements = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    await db.entitlement.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/entitlements"],
      tags: ["entitlements"],
    })
  })
