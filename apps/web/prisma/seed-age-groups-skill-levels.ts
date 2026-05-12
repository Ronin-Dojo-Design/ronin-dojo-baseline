import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

// @added   SESSION_0144 (2026-05-12)
// @why     Seed system AgeGroup and SkillLevel rows for program categorization

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding AgeGroups and SkillLevels...")

  // --- AgeGroups ---
  const ageGroups = [
    { code: "LIL_DRAGONS", name: "Lil' Dragons", ageMin: 3, ageMax: 5, sortOrder: 1 },
    { code: "KINDER_KICKERS", name: "KinderKickers", ageMin: 5, ageMax: 7, sortOrder: 2 },
    { code: "YOUTH", name: "Youth", ageMin: 8, ageMax: 12, sortOrder: 3 },
    { code: "TEEN", name: "Teen", ageMin: 13, ageMax: 17, sortOrder: 4 },
    { code: "ADULT", name: "Adult", ageMin: 18, ageMax: null, sortOrder: 5 },
  ]

  for (const ag of ageGroups) {
    await db.ageGroup.upsert({
      where: { code_brand: { code: ag.code, brand: "BASELINE_MARTIAL_ARTS" } },
      update: { name: ag.name, ageMin: ag.ageMin, ageMax: ag.ageMax, sortOrder: ag.sortOrder },
      create: { ...ag, brand: "BASELINE_MARTIAL_ARTS", isSystem: true },
    })
    console.log(`  ✓ AgeGroup: ${ag.name}`)
  }

  // --- SkillLevels ---
  const skillLevels = [
    {
      code: "BEGINNER",
      name: "Beginner",
      description:
        "Wolchek: White–Gold–Orange belts; BJJ: Rookies, White belts 1–2 stripe",
      sortOrder: 1,
    },
    {
      code: "INTERMEDIATE",
      name: "Intermediate",
      description:
        "Wolchek: Green–Purple–Blue belts; BJJ: White belts 3–4 stripe, Blue belts",
      sortOrder: 2,
    },
    {
      code: "ADVANCED",
      name: "Advanced",
      description:
        "Wolchek: Red–Brown–Brown/Black stripe; BJJ: Blue 3–4 stripe+, Purple, Brown belts",
      sortOrder: 3,
    },
    {
      code: "BLACK_BELT",
      name: "Black Belt",
      description: "1st–5th Degree Black Belt (all systems)",
      sortOrder: 4,
    },
    {
      code: "MASTERS",
      name: "Masters Program",
      description: "5th–8th Degree Black Belt",
      sortOrder: 5,
    },
    {
      code: "INSTRUCTOR",
      name: "Coaches/Instructors",
      description: "Instructor-level training and certification programs",
      sortOrder: 6,
    },
  ]

  for (const sl of skillLevels) {
    await db.skillLevel.upsert({
      where: { code_brand: { code: sl.code, brand: "BASELINE_MARTIAL_ARTS" } },
      update: { name: sl.name, description: sl.description, sortOrder: sl.sortOrder },
      create: { ...sl, brand: "BASELINE_MARTIAL_ARTS", isSystem: true },
    })
    console.log(`  ✓ SkillLevel: ${sl.name}`)
  }

  console.log("Done seeding AgeGroups and SkillLevels.")
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e)
    db.$disconnect()
    process.exit(1)
  })
