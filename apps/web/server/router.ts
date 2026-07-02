import { belt } from "~/server/belt/router"
import { lineage } from "~/server/lineage/router"
import { publicProcedure } from "~/server/orpc/procedure"
import { promotion } from "~/server/promotion/router"

const ping = publicProcedure.handler(() => {
  return { status: "ok" as const, timestamp: new Date().toISOString() }
})

/**
 * Brand smoke — proves the Ronin `withBrand` middleware end to end: the
 * returned brand must match the request host (`bbl.local` → `BBL`). Gated by
 * the `health.read` public permission so the smoke also exercises `can()`.
 */
const brand = publicProcedure.meta({ permission: "health.read" }).handler(({ context }) => {
  return { brand: context.brand, source: context.source }
})

/**
 * Root oRPC router served at `/api/rpc`. Phase 1a carried only the health
 * smoke; entity routers join here as surfaces migrate off next-safe-action,
 * mirroring upstream's flat `server/<entity>/router.ts` aggregation. Phase 1c
 * (SESSION_0364) adds the first migrated read surface: `lineage` (the public
 * tree-by-slug read). SESSION_0480 (Belt Journey Slice 3) adds `belt` — the
 * member-facing, own-Passport belt-journey mutations.
 */
export const appRouter = {
  ping,
  health: {
    brand,
  },
  lineage,
  promotion,
  belt,
}

export type AppRouter = typeof appRouter
