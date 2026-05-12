"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { skillLevelSchema } from "~/server/admin/skill-levels/schema"
import { idSchema, idsSchema } from "~/server/admin/shared/schema"

export const upsertSkillLevel = adminActionClient
  .inputSchema(skillLevelSchema)
  .action(async ({ parsedInput: { id, ...input }, ctx: { db, revalidate, brand } }) => {
    const skillLevel = id
      ? await db.skillLevel.update({
          where: { id },
          data: input,
        })
      : await db.skillLevel.create({
          data: {
            ...input,
            brand,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/skill-levels"],
        tags: ["skill-levels", `skill-level-${skillLevel.id}`],
      })
    })

    return skillLevel
  })

export const deleteSkillLevels = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.skillLevel.deleteMany({
      where: { id: { in: ids }, isSystem: false },
    })

    revalidate({
      paths: ["/admin/skill-levels"],
      tags: ["skill-levels"],
    })

    return true
  })
