/**
 * Seed `Rank.degree` from the canonical ladder names (SESSION_0493).
 *
 * WHY: the additive `Rank.degree Int?` column (migration 20260702091000_add_rank_degree) is the
 * render-layer integer for belt-bar marks — degree stripes for black+ belts, stripe counts for
 * colored belts, Dan numbers for TKD. The count currently lives only inside the row NAME string;
 * this seed materializes it ONCE (reviewed dry-run) so `BeltSwatch` never string-parses at runtime.
 *
 * MAPPING (explicit — name patterns, matched in this order):
 *  - "Nth Degree" / "Nst|nd|rd Degree"    → N   (BJJ black 1–6, coral 7/8, red 9/10)
 *  - "Nth Dan" / "N Dan"                  → N   (TKD black-belt Dans)
 *  - "- N Stripe(s)"                      → N   (BJJ colored-belt stripes)
 *  - "Gup" anywhere in the name           → NEVER matched (Gup counts DOWN — a "7th Gup" yellow
 *                                            belt is a beginner rank, not a 7th-degree anything)
 *  - no pattern                           → null (plain belts render no marks)
 *
 * Only rows whose computed degree differs from the stored value are written. Idempotent.
 *
 * USAGE (local):  cd apps/web && bun scripts/seed-rank-degrees.ts [--apply]
 * USAGE (prod):   cd apps/web && bun --env-file=.env.prod scripts/seed-rank-degrees.ts [--apply]
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const APPLY = process.argv.includes("--apply")

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 }),
})

/** Compute the bar-mark count from a canonical rank name; null = no marks. */
export const degreeFromRankName = (name: string): number | null => {
  if (/gup/i.test(name)) return null // Gup ladders count down — never a degree

  const degree = name.match(/(\d+)(?:st|nd|rd|th)?\s*Degree/i)
  if (degree) return Number(degree[1])

  const dan = name.match(/(\d+)(?:st|nd|rd|th)?\s*Dan\b/i)
  if (dan) return Number(dan[1])

  const stripes = name.match(/(\d+)\s*Stripes?\b/i)
  if (stripes) return Number(stripes[1])

  return null
}

const main = async () => {
  const ranks = await db.rank.findMany({
    select: {
      id: true,
      name: true,
      degree: true,
      sortOrder: true,
      rankSystem: { select: { name: true } },
    },
    orderBy: [{ rankSystem: { name: "asc" } }, { sortOrder: "asc" }],
  })

  const changes: { id: string; name: string; system: string; from: number | null; to: number }[] =
    []

  console.log(`${APPLY ? "APPLY" : "DRY-RUN"} — full mapping (${ranks.length} rank rows)\n`)
  let currentSystem = ""
  for (const rank of ranks) {
    const system = rank.rankSystem?.name ?? "?"
    if (system !== currentSystem) {
      currentSystem = system
      console.log(`══ ${system}`)
    }
    const computed = degreeFromRankName(rank.name)
    const changed = computed !== null && computed !== rank.degree
    console.log(
      `  ${String(rank.sortOrder).padStart(3)}  ${rank.name}  → degree ${computed ?? "null"}${changed ? "   *WRITE*" : ""}`,
    )
    if (changed) {
      changes.push({ id: rank.id, name: rank.name, system, from: rank.degree, to: computed })
    }
  }

  console.log(`\n${changes.length} rows to write.`)

  if (!APPLY) {
    console.log("Dry-run only. Re-run with --apply to write.")
    return
  }

  for (const change of changes) {
    await db.rank.update({ where: { id: change.id }, data: { degree: change.to } })
  }
  console.log(`Updated ${changes.length} rank rows.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
