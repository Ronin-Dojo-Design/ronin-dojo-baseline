"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { programSchema } from "~/server/admin/programs/schema"

export const upsertProgram = adminActionClient
  .inputSchema(programSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const { id, ...input } = parsedInput

    const program = id
      ? await db.program.update({
          where: { id, brand },
          data: input,
        })
      : await db.program.create({
          data: {
            ...input,
            brand,
            slug: input.slug || "",
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/programs"],
        tags: ["programs", `program-${program.slug}`],
      })
    })

    return program
  })

export const deletePrograms = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    await db.program.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/programs"],
      tags: ["programs"],
    })

    return true
  })
