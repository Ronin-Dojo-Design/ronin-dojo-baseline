/**
 * Bun-only E2E base-reference seed — ensures the STATIC reference data every deploy
 * always has, but the migrate-only e2e DB never did: the BJJ discipline (`code:"bjj"`)
 * + a belt rank system + the 5-belt ladder (white→blue→purple→brown→black).
 *
 * WHY this exists (SESSION_0717, down-synced from rdd-monorepo SESSION_0716): CI's e2e
 * DB is `prisma migrate deploy` only — no `prisma/seed.ts` — and no per-spec fixture
 * creates `code:"bjj"`. But the lineage claim / place-lead flow calls `getBjjDisciplineId()`
 * (server/belt/queries.ts) and `belt-journey.spec` calls `threeAscendingBjjRanks()`; both
 * THROW when BJJ is absent (`BJJ_DISCIPLINE_NOT_FOUND` / `BELT_E2E_NEEDS_THREE_BJJ_RANKS`).
 * Because the failing spec varied by run (getBjjDisciplineId caches per-process) it read as
 * a cross-browser flake; it is a deterministic missing-reference-data gap. This seed closes
 * it once, up front, in Playwright's globalSetup — identically local + CI, so local == CI
 * holds (FS-0031: the divergence rule is about VARIABLE data — posts/orgs — not static
 * reference data seeded the same way in both places).
 *
 * IDEMPOTENT: early-outs if a BJJ ladder with ≥3 ranks already exists (full prod seed,
 * or a prior run against the persistent local `ronindojo_e2e`), so it never P2002s and
 * never clobbers a richer prod-shaped ladder.
 *
 * Run:  bun e2e/helpers/seed-base-reference-db.ts seed
 *   (invoked by e2e/global-setup.ts before the tournament fixture + any spec.)
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"
import { assertReferenceContract } from "./reference-data-contract"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TEST_BRAND = "BBL" as const

/** The canonical BJJ 5-belt ladder, ascending. sortOrder is the rank authority. */
const BJJ_BELTS = [
  { sortOrder: 1, name: "White", shortName: "W", colorHex: "#f8fafc" },
  { sortOrder: 2, name: "Blue", shortName: "BL", colorHex: "#2563eb" },
  { sortOrder: 3, name: "Purple", shortName: "P", colorHex: "#7c3aed" },
  { sortOrder: 4, name: "Brown", shortName: "BR", colorHex: "#7c2d12" },
  { sortOrder: 5, name: "Black", shortName: "BK", colorHex: "#111827" },
] as const

async function ensureBjjLadder(): Promise<{ seeded: boolean; rankCount: number }> {
  // Early-out: a ladder with ≥3 ascending ranks already satisfies both consumers
  // (getBjjDisciplineId needs the discipline; threeAscendingBjjRanks needs ≥3 ranks).
  const existingRanks = await prisma.rank.count({
    where: { rankSystem: { discipline: { code: "bjj" } } },
  })
  if (existingRanks >= 3) return { seeded: false, rankCount: existingRanks }

  const discipline =
    (await prisma.discipline.findFirst({ where: { code: "bjj" }, select: { id: true } })) ??
    (await prisma.discipline.create({
      data: {
        code: "bjj",
        name: "Brazilian Jiu-Jitsu",
        slug: "bjj",
        isSystem: true,
        brand: TEST_BRAND,
      },
      select: { id: true },
    }))

  const rankSystem =
    (await prisma.rankSystem.findFirst({
      where: { disciplineId: discipline.id },
      select: { id: true },
    })) ??
    (await prisma.rankSystem.create({
      data: { disciplineId: discipline.id, name: "BJJ Belts", isSystem: true, brand: TEST_BRAND },
      select: { id: true },
    }))

  // Upsert per (rankSystemId, sortOrder) so a partially-seeded ladder converges without P2002.
  for (const belt of BJJ_BELTS) {
    await prisma.rank.upsert({
      where: { rankSystemId_sortOrder: { rankSystemId: rankSystem.id, sortOrder: belt.sortOrder } },
      update: {},
      create: { rankSystemId: rankSystem.id, isSystem: true, brand: TEST_BRAND, ...belt },
    })
  }

  return { seeded: true, rankCount: BJJ_BELTS.length }
}

const command = process.argv[2]

if (command === "seed") {
  const result = await ensureBjjLadder()
  // Gate 2 (SESSION_0717): prove the seed satisfies every registered reference getter BEFORE any
  // spec runs. If a new throws-if-missing dependency isn't covered, fail here with a named getter
  // instead of a page-goto timeout deep in the suite.
  await assertReferenceContract(prisma)
  await prisma.$disconnect()
  // Logs go to stderr; stdout stays clean for callers that capture it.
  console.error(
    result.seeded
      ? `✓ base-reference seed: created BJJ discipline + ${result.rankCount}-belt ladder (contract ok)`
      : `✓ base-reference seed: BJJ ladder already present (${result.rankCount} ranks) — no-op (contract ok)`,
  )
} else {
  await prisma.$disconnect()
  throw new Error(`Unknown seed-base-reference command: ${command ?? "<missing>"}`)
}
