import { noCase } from "change-case"
import { revalidatePath, updateTag } from "next/cache"
import { createSafeActionClient } from "next-safe-action"
import { Brand, Prisma } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { can } from "~/server/orpc/permissions"
import { canUploadMedia } from "~/server/web/entitlements/queries"
import { db } from "~/services/db"

type RevalidateOptions = {
  paths?: string[]
  tags?: string[]
}

/**
 * Queue revalidation for the given options.
 *
 * ⚠ TRANSPORT-BOUND TWIN (do not merge / do not copy elsewhere): `updateTag` is
 * legal ONLY inside true Server Actions — Next 16 hard-throws E872 in Route
 * Handlers. This seam serves next-safe-action Server Actions, so `updateTag`
 * (same-request refresh) is correct HERE. The oRPC seam
 * (`server/orpc/revalidate.ts`) serves `/api/rpc` (a Route Handler) and MUST use
 * `revalidateTag(tag, { expire: 0 })` instead. Same contract, two deliberate
 * transport-bound implementations — the WL-P1-8 do-not-merge-twins class
 * (SESSION_0498, Giddy pass-2).
 *
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

  return next({ ctx: { brand: Brand.BBL } })
})

// -----------------------------------------------------------------------------
// 4. Tournament-admin client (allows "admin" or "tournament_director")
// -----------------------------------------------------------------------------
export const tournamentAdminActionClient = userActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "tournament_director") {
    throw new Error("User not authorized")
  }

  return next({ ctx: { brand: Brand.BBL } })
})

// -----------------------------------------------------------------------------
// 5. Public client (no auth required — for unauthenticated forms)
// -----------------------------------------------------------------------------
export const publicActionClient = actionClient

// -----------------------------------------------------------------------------
// 6. Media-upload client (auth + canUploadMedia entitlement gate)
// -----------------------------------------------------------------------------
export const mediaUploadActionClient = userActionClient.use(async ({ next, ctx }) => {
  // Platform roles that hold `media.manage` (admin via the `*` grant) bypass the entitlement gate;
  // everyone else still needs an S3_UPLOAD entitlement / org-role / org-ownership signal. The role
  // check reads the live session (not the 60s-cached `canUploadMedia`), so a role change takes
  // effect immediately. See wiring-ledger WL-P2-19.
  const allowed = can(ctx.user, "media.manage") || (await canUploadMedia(ctx.user.id, Brand.BBL))
  if (!allowed) {
    throw new Error("User not authorized to upload media")
  }

  return next({ ctx: { brand: Brand.BBL } })
})
