"use server"

import { after } from "next/server"
import { removeS3Directories } from "~/lib/media"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { userSchema } from "~/server/admin/users/schema"

export const updateUser = adminActionClient
  .inputSchema(userSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate } }) => {
    const user = await db.user.update({
      where: { id },
      data: input,
    })

    revalidate({
      paths: ["/admin/users"],
    })

    return user
  })

export const deleteUsers = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.user.deleteMany({
      where: { id: { in: ids }, role: { not: "admin" } },
    })

    // Remove the user images from S3 asynchronously
    after(async () => {
      await removeS3Directories(ids.map(id => `users/${id}`))
    })

    revalidate({
      paths: ["/admin/users"],
    })

    return true
  })

export const updateUserRole = adminActionClient
  .inputSchema(userSchema.pick({ id: true, role: true }))
  .action(async ({ parsedInput: { id, role }, ctx: { db, revalidate } }) => {
    const user = await db.user.update({
      where: { id },
      data: { role },
    })

    revalidate({
      paths: ["/admin/users"],
    })

    return user
  })
