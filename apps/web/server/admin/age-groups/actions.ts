"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { ageGroupSchema } from "~/server/admin/age-groups/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertAgeGroup = adminActionClient
  .inputSchema(ageGroupSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate, brand } }) => {
    const ageGroup = id
      ? await db.ageGroup.update({
          where: { id },
          data: input,
        })
      : await db.ageGroup.create({
          data: {
            ...input,
            brand,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/age-groups"],
        tags: ["age-groups", `age-group-${ageGroup.id}`],
      })
    })

    return ageGroup
  })

export const deleteAgeGroups = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.ageGroup.deleteMany({
      where: { id: { in: ids }, isSystem: false },
    })

    revalidate({
      paths: ["/admin/age-groups"],
      tags: ["age-groups"],
    })

    return true
  })
