import { ORPCError } from "@orpc/server"
import { z } from "zod"
import type { Brand } from "~/.generated/prisma/client"
import { authedProcedure } from "~/server/orpc/procedure"
import {
  clearOwnTechniqueProgress,
  upsertOwnTechniqueProgress,
} from "~/server/web/techniques/progress"
import { db } from "~/services/db"

/**
 * Flat oRPC router for member technique-progress mutations (G-022 Lane B, SESSION_0580;
 * ADR 0024 full-oRPC direction — no `next-safe-action` surface here). Mirrors `promotion/router.ts`:
 * both procedures omit `meta.permission` — any signed-in member may track their OWN progress (the
 * `authedProcedure` deny-by-default backstop is the only gate; there is no entitlement check by
 * design, per the ratified G-022 goal — progress tracking is a free-tier engagement driver).
 * Ownership is structural: `userId` is always `context.user.id`, never a caller-supplied input, so
 * a member can never write another member's row.
 *
 * `verifiedBy`/instructor verification is OUT of v1 — every write here is a self-report.
 */

const progressStatusSchema = z.enum(["NOT_STARTED", "LEARNING", "DRILLING", "SPARRING", "MASTERED"])

const setProgressInput = z.object({
  techniqueId: z.string().min(1).max(191),
  status: progressStatusSchema,
  notes: z.string().max(2000).nullish(),
  /** Explicit override — omit to let `progress.ts` auto-stamp `now()` / clear it on NOT_STARTED. */
  lastDrilledAt: z.coerce.date().nullish(),
})

const clearProgressInput = z.object({
  techniqueId: z.string().min(1).max(191),
})

/**
 * A caller-supplied `techniqueId` is untrusted input — resolve it to a real, in-BRAND `Technique`
 * (and its slug, for path revalidation) before any progress write, or throw NOT_FOUND. Without this
 * a bad id would surface as a raw Prisma P2003 on the FK, and a foreign-brand id would silently
 * mint a progress row against a technique the caller's brand never serves.
 */
async function assertOwnBrandTechnique(techniqueId: string, brand: Brand) {
  const technique = await db.technique.findUnique({
    where: { id: techniqueId },
    select: { id: true, brand: true, slug: true },
  })
  if (!technique || technique.brand !== brand) {
    throw new ORPCError("NOT_FOUND", { message: "Technique not found" })
  }
  return technique
}

/**
 * `setProgress(techniqueId, status, notes?, lastDrilledAt?)` — upsert the caller's OWN
 * `TechniqueProgress` row. Rate-limited to blunt spam; no revalidation of the shared `"techniques"` /
 * `"bjj-technique-graph"` content cache tags (CACHE TRAP — progress reads are deliberately uncached,
 * see `progress.ts`), only the two pages that render the caller's own status.
 */
const setProgress = authedProcedure
  .meta({ rateLimit: { points: 120, duration: 60 * 60 } })
  .input(setProgressInput)
  .handler(async ({ input, context }) => {
    const technique = await assertOwnBrandTechnique(input.techniqueId, context.brand)

    const progress = await upsertOwnTechniqueProgress(context.user.id, input.techniqueId, {
      status: input.status,
      notes: input.notes,
      lastDrilledAt: input.lastDrilledAt,
    })

    context.revalidate({ paths: [`/techniques/${technique.slug}`, "/dashboard"] })
    return progress
  })

/**
 * `clearProgress(techniqueId)` — delete the caller's OWN `TechniqueProgress` row (idempotent).
 */
const clearProgress = authedProcedure
  .meta({ rateLimit: { points: 120, duration: 60 * 60 } })
  .input(clearProgressInput)
  .handler(async ({ input, context }) => {
    const technique = await assertOwnBrandTechnique(input.techniqueId, context.brand)

    await clearOwnTechniqueProgress(context.user.id, input.techniqueId)

    context.revalidate({ paths: [`/techniques/${technique.slug}`, "/dashboard"] })
    return { cleared: true as const, techniqueId: input.techniqueId }
  })

export const techniques = {
  setProgress,
  clearProgress,
}
