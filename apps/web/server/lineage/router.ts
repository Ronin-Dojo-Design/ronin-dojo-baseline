import { z } from "zod"
import { storyboard } from "~/server/lineage/storyboard-router"
import { publicProcedure } from "~/server/orpc/procedure"
import { getLineageTreeBySlug } from "~/server/web/lineage/queries"

/**
 * Flat oRPC router for the lineage entity (SOT-ADR D5 — NEW oRPC routers live
 * at `server/<entity>/router.ts` to pre-align with the future flat layout,
 * rather than under the transitional `server/orpc/` scaffold).
 *
 * Phase 1c pilot (SESSION_0364): migrates the ONE public lineage tree read off
 * the direct `server/web/lineage` query import and onto the oRPC pipeline, so
 * the same surface now travels through brand-scope + permission + rate-limit
 * middleware. The handler is a thin pass-through — it calls the EXISTING
 * `getLineageTreeBySlug` query with `context.brand` and returns its result
 * verbatim. Zero logic reimplementation, zero payload reshaping (SOT-ADR D3
 * hard gate: the public-payload allowlist in `server/web/lineage/payloads.ts`
 * stays the single source of the response shape).
 */

const bySlugInput = z.object({
  slug: z.string().min(1),
})

/**
 * Public, unauthenticated tree-by-slug read.
 *
 * `lineage.read` is a PUBLIC grant (the `/lineage/[treeSlug]` page is a public
 * page) — see `PUBLIC_GRANTS` in `server/orpc/roles.ts`. Brand is taken from
 * `context.brand` (resolved server-side by `withBrand`); the client can never
 * choose a brand (D3), so `slug` is the only input.
 *
 * Returns `LineageTreePublicResult | null` — exactly what `getLineageTreeBySlug`
 * returns for the no-viewer (public) path, which is how the page calls it
 * today. The caller maps `null` to `notFound()`, unchanged.
 */
const bySlug = publicProcedure
  .meta({ permission: "lineage.read" })
  .input(bySlugInput)
  .handler(({ input, context }) => {
    return getLineageTreeBySlug({ brand: context.brand, slug: input.slug })
  })

export const lineage = {
  bySlug,
  /** `can("lineage.manage")`-gated storyboard scene mutations (Epic A1, SESSION_0498). */
  storyboard,
}
