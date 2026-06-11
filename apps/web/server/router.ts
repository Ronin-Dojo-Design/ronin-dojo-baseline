import { publicProcedure } from "~/server/orpc/procedure"

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
 * Root oRPC router served at `/api/rpc`. Phase 1a carries only the health
 * smoke; entity routers join here as surfaces migrate off next-safe-action
 * (Phase 1c onward), mirroring upstream's flat `server/<entity>/router.ts`
 * aggregation.
 */
export const appRouter = {
  ping,
  health: {
    brand,
  },
}

export type AppRouter = typeof appRouter
