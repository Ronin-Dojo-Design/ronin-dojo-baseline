"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import { applyCreateTechnique, applyUpdateTechnique } from "~/server/web/techniques/apply-technique"
import { createTechniqueSchema, updateTechniqueSchema } from "~/server/web/techniques/crud-schemas"

export const createTechnique = userActionClient
  .inputSchema(createTechniqueSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const technique = await applyCreateTechnique({
      db,
      user,
      // Single-brand collapse: the creator's brand context is BBL. The authored path overrides this
      // with the school's brand when the author has a current org affiliation (ADR 0046 D5).
      brandContext: Brand.BBL,
      input: parsedInput,
    })

    revalidate({ tags: ["techniques"], paths: ["/app/profile", "/app/techniques", "/techniques"] })
    return technique
  })

export const updateTechnique = userActionClient
  .inputSchema(updateTechniqueSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const updated = await applyUpdateTechnique({ db, user, input: parsedInput })

    revalidate({
      tags: ["techniques", `technique-${updated.slug}`],
      paths: ["/app/profile", "/app/techniques", "/techniques"],
    })
    return updated
  })
