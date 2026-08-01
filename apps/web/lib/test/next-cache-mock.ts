/**
 * @added   SESSION_0731 (2026-07-31)
 * @why     Keep DB-backed tests on one complete no-op next/cache contract
 * @wired   scripts/backfill-passport-claims.test.ts, server/admin/claims/review-passport-claim.test.ts, server/web/claims/*.test.ts
 */
// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { mock } from "bun:test"

export function installNextCacheMock(): void {
  mock.module("next/cache", () => ({
    cacheLife: () => {},
    cacheTag: () => {},
    revalidatePath: () => {},
    revalidateTag: () => {},
    updateTag: () => {},
  }))
}
