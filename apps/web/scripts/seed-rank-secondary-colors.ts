/**
 * Seed `Rank.secondaryColorHex` for alternating-panel belts (SESSION_0493, Desi review).
 *
 * WHY: both BJJ coral ranks were seeded `colorHex #FF0000` — identical to the red belts —
 * so a red/black 7th-degree coral renders as a plain red belt, which in BJJ signals 9th
 * degree: an overstatement on a verification platform. `secondaryColorHex` (additive
 * nullable, migration 20260703000000_add_rank_secondary_color) lets BeltSwatch render the
 * true alternating panels data-driven.
 *
 * MAPPING (explicit name patterns — reviewed dry-run before apply):
 *  - "Coral Belt (Red/Black)"  → secondary #000000   (BJJ 7th degree)
 *  - "Coral Belt (Red/White)"  → secondary #FFFFFF   (BJJ 8th degree)
 *  - "Red-White Belt"          → secondary #FFFFFF   (Kodokan 6th–8th Dan)
 *  - everything else           → untouched (solid belts stay null)
 *
 * Idempotent: only rows whose computed value differs are written.
 *
 * USAGE (local):  cd apps/web && bun scripts/seed-rank-secondary-colors.ts [--apply]
 * USAGE (prod):   cd apps/web && bun --env-file=.env.prod scripts/seed-rank-secondary-colors.ts [--apply]
 */
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const APPLY = process.argv.includes("--apply")

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 }),
})

/** Compute the secondary panel color from a canonical rank name; null = solid belt. */
export const secondaryColorFromRankName = (name: string): string | null => {
  if (/Coral Belt \(Red\/Black\)/i.test(name)) return "#000000"
  if (/Coral Belt \(Red\/White\)/i.test(name)) return "#FFFFFF"
  if (/Red-White Belt/i.test(name)) return "#FFFFFF"
  return null
}

const main = async () => {
  const ranks = await db.rank.findMany({
    select: {
      id: true,
      name: true,
      colorHex: true,
      secondaryColorHex: true,
      rankSystem: { select: { name: true } },
    },
    orderBy: [{ rankSystem: { name: "asc" } }, { sortOrder: "asc" }],
  })

  const changes = ranks
    .map(rank => ({ rank, to: secondaryColorFromRankName(rank.name) }))
    .filter(({ rank, to }) => to !== null && to !== rank.secondaryColorHex)

  console.log(`${APPLY ? "APPLY" : "DRY-RUN"} — ${changes.length} rows to write\n`)
  for (const { rank, to } of changes) {
    console.log(
      `  [${rank.rankSystem?.name}] ${rank.name}  ${rank.colorHex} + ${rank.secondaryColorHex ?? "null"} → ${to}`,
    )
  }

  if (!APPLY) {
    console.log("\nDry-run only. Re-run with --apply to write.")
    return
  }

  for (const { rank, to } of changes) {
    await db.rank.update({ where: { id: rank.id }, data: { secondaryColorHex: to } })
  }
  console.log(`\nUpdated ${changes.length} rank rows.`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
