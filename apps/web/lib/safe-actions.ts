import { noCase } from "change-case"
import { revalidatePath, updateTag } from "next/cache"
import { createSafeActionClient } from "next-safe-action"
import { Prisma } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { db } from "~/services/db"

type RevalidateOptions = {
  paths?: string[]
  tags?: string[]
}

/**
 * Queue revalidation for the given options
 * @param options - The options to queue revalidation for
 */
const revalidate = ({ paths = [], tags = [] }: RevalidateOptions) => {
  for (const path of paths) {
    revalidatePath(path)
  }

  for (const tag of tags) {
    updateTag(tag)
  }
}

// -----------------------------------------------------------------------------
// 1. Base action client – put global error handling / metadata here if needed
// -----------------------------------------------------------------------------
export const actionClient = createSafeActionClient({
  handleServerError: e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      switch (e.code) {
        // Unique constraint violation
        case "P2002": {
          const errorMeta = e.meta as { modelName: string; target: string[] }
          const model = noCase(errorMeta.modelName)
          const field = noCase(errorMeta.target[0])

          return `A ${model} with this ${field} already exists in the database.`
        }
      }
    }

    if (e instanceof Error) {
      return e.message
    }

    return "Something went wrong while executing the operation."
  },
}).use(async ({ next, ctx }) => {
  return next({
    ctx: { ...ctx, db, revalidate },
  })
})

// -----------------------------------------------------------------------------
// 2. Auth-guarded client
// -----------------------------------------------------------------------------
export const userActionClient = actionClient.use(async ({ next }) => {
  const session = await getServerSession()

  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  return next({ ctx: { user: session.user } })
})

// -----------------------------------------------------------------------------
// 3. Admin-only client (extends auth client)
// -----------------------------------------------------------------------------
export const adminActionClient = userActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("User not authorized")
  }

  return next()
})
