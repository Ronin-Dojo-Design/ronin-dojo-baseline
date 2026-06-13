"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { roleSchema } from "~/server/admin/roles/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertRole = adminActionClient
  .inputSchema(roleSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate, brand } }) => {
    const role = id
      ? await db.role.update({
          where: { id },
          data: input,
        })
      : await db.role.create({
          data: {
            ...input,
            brand,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/app/roles"],
        tags: ["roles", `role-${role.id}`],
      })
    })

    return role
  })

export const deleteRoles = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.role.deleteMany({
      where: { id: { in: ids }, isSystem: false },
    })

    revalidate({
      paths: ["/app/roles"],
      tags: ["roles"],
    })

    return true
  })
