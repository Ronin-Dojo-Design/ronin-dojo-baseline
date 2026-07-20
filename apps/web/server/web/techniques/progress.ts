import type { TechniqueProgressStatus } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Member technique-progress query/write layer (G-022 Lane B, SESSION_0580). Wires the existing
 * zero-write-path `TechniqueProgress` model — own-user only, no entitlement gate (any signed-in
 * member tracks their own progress, free tier included). `verifiedBy`/instructor verification is
 * OUT of v1 — every write here is the member's own self-report.
 *
 * CACHE TRAP: technique content reads sit behind the broad `"techniques"` / `"bjj-technique-graph"`
 * cache tags (WL-P2-50). A per-user progress read must never share those tags — these functions are
 * deliberately UNCACHED (no `"use cache"`), so a progress write is visible on the next request
 * without busting the shared content cache.
 *
 * Consumed by `server/techniques/router.ts` (the oRPC write surface) and the detail page /
 * dashboard read paths. Plain functions over the global `db` client (no injectable tx — every
 * call here is a single-table read or a single-row upsert/delete, matching the `bookmarks/queries.ts`
 * idiom rather than the transaction-threaded `belt/queries.ts` one).
 */

const ownProgressSelect = {
  id: true,
  status: true,
  lastDrilledAt: true,
  notes: true,
  updatedAt: true,
} as const

export type OwnTechniqueProgress = Awaited<ReturnType<typeof findOwnTechniqueProgress>>

/** The caller's own progress row for one technique, or `null` if never tracked. */
export function findOwnTechniqueProgress(userId: string, techniqueId: string) {
  return db.techniqueProgress.findUnique({
    where: { userId_techniqueId: { userId, techniqueId } },
    select: ownProgressSelect,
  })
}

export type UpsertOwnTechniqueProgressInput = {
  status: TechniqueProgressStatus
  notes?: string | null
  /**
   * Explicit override. `undefined` (the common case — the control only sends `status`) auto-stamps
   * `now()` whenever the new status is anything past `NOT_STARTED`, and clears the timestamp when
   * reverting to `NOT_STARTED`. Pass an explicit value (including `null`) to opt out of the
   * auto-stamp.
   */
  lastDrilledAt?: Date | null
}

/**
 * Upsert the caller's OWN progress row for `techniqueId`. Ownership is structural — `userId` is
 * never caller-supplied input, only the resolved session id — so this can never write another
 * member's row. Callers (the router) are responsible for verifying `techniqueId` resolves to a
 * real, in-brand `Technique` before calling this.
 */
export function upsertOwnTechniqueProgress(
  userId: string,
  techniqueId: string,
  input: UpsertOwnTechniqueProgressInput,
) {
  const lastDrilledAt =
    input.lastDrilledAt !== undefined
      ? input.lastDrilledAt
      : input.status === "NOT_STARTED"
        ? null
        : new Date()

  return db.techniqueProgress.upsert({
    where: { userId_techniqueId: { userId, techniqueId } },
    create: {
      userId,
      techniqueId,
      status: input.status,
      notes: input.notes ?? null,
      lastDrilledAt,
    },
    update: {
      status: input.status,
      notes: input.notes,
      lastDrilledAt,
    },
    select: ownProgressSelect,
  })
}

/** Delete the caller's OWN progress row for `techniqueId` (idempotent — no-op if untracked). */
export async function clearOwnTechniqueProgress(userId: string, techniqueId: string) {
  await db.techniqueProgress.deleteMany({ where: { userId, techniqueId } })
}
