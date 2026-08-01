/**
 * @added   SESSION_0731 (2026-07-31)
 * @why     Keep integration tests on the seeded BJJ ladder without duplicating rank lookup fixtures
 * @wired   server/belt/router.integration.test.ts, server/belt/verify-rank-entry.safe-action.test.ts
 */
import { db } from "~/services/db"

/** Resolve one seeded BJJ rank by exact display name. */
export async function seededBjjRankId(name: string): Promise<string> {
  const rank = await db.rank.findFirstOrThrow({
    where: { name, rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true },
  })
  return rank.id
}
