import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-bbl-org.ts
 *
 * Idempotent seed for the BBL (Black Belt Legacy) Organization row.
 *
 * SESSION_0443 (ADR 0037): this script USED to also create a smoke-test tree and CLONE the Baseline
 * `rigan-machado-bjj-lineage` projection into a brand-scoped BBL copy. Both are retired — BBL now has
 * ONE canonical tree, `rigan-machado-lineage`, built by `scripts/import-bbl-members-full.ts` (the full
 * 77-member roster) and wired up by `scripts/consolidate-rigan-machado-tree.ts`. The Baseline→BBL
 * brand-clone was dead weight under the single-brand collapse, so only the Organization remains here.
 *
 * Idempotency: findFirst + create. Safe to re-run.
 *
 * Usage (LOCAL DEV ONLY):
 *   bun run apps/web/prisma/seed-bbl-org.ts
 *
 * @see apps/web/scripts/import-bbl-members-full.ts (the canonical roster import)
 * @see apps/web/scripts/consolidate-rigan-machado-tree.ts (root/discipline/visual-group wiring)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BBL" as const

async function main() {
  console.log("[seed-bbl-org] Ensuring BBL Organization...")

  let org = await db.organization.findFirst({ where: { brand: BRAND } })
  if (!org) {
    org = await db.organization.create({
      data: {
        name: "Black Belt Legacy",
        brand: BRAND,
        slug: "black-belt-legacy",
      },
    })
    console.log(`  ✅ Created BBL Organization: ${org.id}`)
  } else {
    console.log(`  ⏭️  BBL Organization already exists: ${org.id}`)
  }

  console.log("[seed-bbl-org] Done.")
  await db.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
