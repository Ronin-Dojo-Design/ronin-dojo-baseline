/**
 * The e2e / CI reference-data contract (SESSION_0717, down-synced from rdd-monorepo SESSION_0716).
 *
 * Every "throws-if-missing" reference-data getter the app calls during a page render MUST be
 * satisfied by the base-reference seed in a migrate-only environment (CI's e2e DB + the enforced
 * local reset). This registry makes that dependency EXPLICIT and CHECKED: `assertReferenceContract`
 * runs each row against the seeded DB and throws ONE clear error naming the unmet getter — so a new
 * dependency fails loud + early ("REFERENCE_CONTRACT_UNMET: getFooId") at seed time, instead of
 * surfacing as a mystery page-goto timeout 15 minutes into the Playwright suite (SESSION_0717).
 *
 * This is the fast/clear layer; the full e2e suite on a fresh migrate-only DB is the backstop.
 * ADD A ROW when you introduce a reference getter that throws on missing seed data (a `*_NOT_FOUND`
 * throw in `server/**` over static reference data), and seed the data in `seed-base-reference-db.ts`.
 */
import type { PrismaClient } from "../../.generated/prisma/client"

interface ReferenceContractEntry {
  /** The app getter this row guards — shown verbatim in the failure message. */
  getter: string
  /** What the getter needs, expressed as a boolean check against the DB. */
  satisfied: (db: PrismaClient) => Promise<boolean>
}

export const REFERENCE_CONTRACT: ReferenceContractEntry[] = [
  {
    getter: 'getBjjDisciplineId (server/belt/queries.ts) — needs a code:"bjj" discipline',
    satisfied: async db => (await db.discipline.count({ where: { code: "bjj" } })) > 0,
  },
  {
    getter: "threeAscendingBjjRanks (belt-journey e2e) — needs ≥3 BJJ ranks",
    satisfied: async db =>
      (await db.rank.count({ where: { rankSystem: { discipline: { code: "bjj" } } } })) >= 3,
  },
]

/**
 * Assert every registered reference getter is satisfied by the current DB. Throws one aggregated,
 * actionable error if any is not. Called by the base-reference seed after it runs, so the whole e2e
 * run fails closed the instant the seed is insufficient for a getter the app depends on.
 */
export async function assertReferenceContract(db: PrismaClient): Promise<void> {
  const unmet: string[] = []
  for (const entry of REFERENCE_CONTRACT) {
    if (!(await entry.satisfied(db))) unmet.push(entry.getter)
  }
  if (unmet.length > 0) {
    throw new Error(
      `REFERENCE_CONTRACT_UNMET — the base-reference seed does not satisfy:\n  - ${unmet.join(
        "\n  - ",
      )}\nSeed the missing reference data in e2e/helpers/seed-base-reference-db.ts (SESSION_0717).`,
    )
  }
}
