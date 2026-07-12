"use server"

import { Brand } from "~/.generated/prisma/client"
import { userActionClient } from "~/lib/safe-actions"
import {
  applyCreateTechnique,
  applySetTechniqueFeatured,
  applyUpdateTechnique,
} from "~/server/web/techniques/apply-technique"
import {
  createTechniqueSchema,
  setTechniqueFeaturedSchema,
  updateTechniqueSchema,
} from "~/server/web/techniques/crud-schemas"

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

// SESSION_0529 Slice 3C — staff promote/demote to the canonical library (ADR 0046 D4). RBAC
// `techniques.manage` gated in the apply core; busting `techniques` flips the row on/off the
// public browse/rails/watch immediately.
export const setTechniqueFeatured = userActionClient
  .inputSchema(setTechniqueFeaturedSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const updated = await applySetTechniqueFeatured({ db, user, input: parsedInput })

    revalidate({
      tags: ["techniques", `technique-${updated.slug}`],
      paths: ["/app/profile", "/app/techniques", "/techniques"],
    })
    return updated
  })
