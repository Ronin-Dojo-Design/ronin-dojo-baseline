/**
 * Seed BrandSettings rows from existing styles.css hardcoded values.
 * Run once: `bun run apps/web/scripts/seed-brand-settings.ts`
 *
 * @added SESSION_0291 (2026-05-29)
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const seeds = [
  {
    brand: "BBL" as const,
    primaryColor: "1 79% 51%",
    primaryFgColor: "0 0% 98%",
    accentColor: "51 100% 50%",
    accentFgColor: null,
  },
  {
    brand: "WEKAF" as const,
    primaryColor: "0 84% 50%",
    primaryFgColor: "0 0% 98%",
    accentColor: null,
    accentFgColor: null,
  },
]

async function main() {
  for (const seed of seeds) {
    const result = await db.brandSettings.upsert({
      where: { brand: seed.brand },
      create: seed,
      update: seed,
    })
    console.log(`✅ ${seed.brand}: ${result.id}`)
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
