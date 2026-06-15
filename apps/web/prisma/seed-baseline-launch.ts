import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-baseline-launch.ts
 *
 * Launch-safe production seed for the BASELINE_MARTIAL_ARTS brand. Creates
 * ONLY the minimum rows required by the downstream catalog/pricing-plans
 * seeds:
 *
 *   1. Exactly one Organization row (brand = BASELINE_MARTIAL_ARTS,
 *      slug = "baseline-martial-arts").
 *   2. The 6 system Role rows (STUDENT, INSTRUCTOR, OWNER, COACH, ORG_ADMIN,
 *      STYLE_APPROVER) used everywhere by membership/role-assignment code.
 *
 * It does NOT create test users, Categories, Tags, Tools, ContentAtoms,
 * Programs, Courses, or Entitlements. Pricing-plan seeds create their own
 * Entitlements + EntitlementGrants on demand.
 *
 * Idempotency: re-running this script is a no-op (Organization matched on
 * (brand, slug) via findFirst+create; Roles via per-code findFirst+create
 * loop — see SESSION_0172 finding F-06: `createMany({ skipDuplicates: true })`
 * is a no-op for `brand=null` system roles because Postgres treats NULL as
 * distinct in the `@@unique([code, brand])` constraint).
 *
 * Usage:
 *   bun run apps/web/prisma/seed-baseline-launch.ts
 *
 * @see docs/sprints/SESSION_0172.md TASK_01
 * @see docs/runbooks/integrations/product-catalog-seed.md (Prerequisites section)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const ORG_SLUG = "baseline-martial-arts"
const ORG_NAME = "Baseline Martial Arts"
const LEGACY_OWNER_ID = "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"

const SYSTEM_ROLES = [
  {
    code: "STUDENT",
    name: "Student",
    description: "Standard member/student role",
    isSystem: true,
  },
  {
    code: "INSTRUCTOR",
    name: "Instructor",
    description: "Teaches classes and can verify curriculum completions",
    isSystem: true,
  },
  {
    code: "OWNER",
    name: "Owner",
    description: "Organization owner with full administrative access",
    isSystem: true,
  },
  {
    code: "COACH",
    name: "Coach",
    description: "Coaches students, can award ranks and manage rosters",
    isSystem: true,
  },
  {
    code: "ORG_ADMIN",
    name: "Organization Admin",
    description: "Administrative access to organization settings and membership",
    isSystem: true,
  },
  {
    code: "STYLE_APPROVER",
    name: "Style Approver",
    description: "Can approve user-submitted styles within their organization",
    isSystem: true,
  },
] as const

async function resolveBrianOwnerId(): Promise<string | null> {
  const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT u."id"
     FROM "User" u
     LEFT JOIN "Passport" p ON p."userId" = u."id"
     WHERE u."id" = $1
        OR u."name" = 'Brian Scott'
        OR p."displayName" = 'Brian Scott'
        OR (p."legalFirstName" = 'Brian' AND p."legalLastName" = 'Scott')
     ORDER BY
       CASE WHEN u."role" = 'admin' THEN 0 ELSE 1 END,
       CASE WHEN u."id" = $1 THEN 0 ELSE 1 END,
       u."createdAt" ASC
     LIMIT 1`,
    LEGACY_OWNER_ID,
  )
  return rows[0]?.id ?? null
}

async function main() {
  console.log(`\n🌱 seed-baseline-launch.ts — brand=${BRAND}\n`)
  const ownerId = await resolveBrianOwnerId()

  // ---------------------------------------------------------------------------
  // Organization — exactly one row, idempotent on (brand, slug).
  // ---------------------------------------------------------------------------
  let orgCreated = 0
  const existingOrg = await db.organization.findFirst({
    where: { brand: BRAND, slug: ORG_SLUG },
    select: { id: true, name: true, slug: true },
  })

  if (existingOrg) {
    console.log(
      `   ⏭️  Skipped (exists): Organization "${existingOrg.name}" (id=${existingOrg.id})`,
    )
    if (ownerId) {
      await db.organization.update({ where: { id: existingOrg.id }, data: { ownerId } })
      console.log(`   ✅ Ensured Organization ownerId → ${ownerId}`)
    }
  } else {
    const org = await db.organization.create({
      data: {
        brand: BRAND,
        name: ORG_NAME,
        slug: ORG_SLUG,
        ownerId,
      },
      select: { id: true, name: true, slug: true },
    })
    console.log(`   ✅ Created Organization: "${org.name}" (id=${org.id}, slug=${org.slug})`)
    orgCreated = 1
  }

  // ---------------------------------------------------------------------------
  // System Roles — 6 rows. Idempotency via per-code findFirst+create loop
  // (NOT createMany skipDuplicates — Postgres treats NULL as distinct on the
  // @@unique([code, brand]) constraint, so skipDuplicates is a no-op for
  // brand=null rows and silently duplicates on every re-run.
  // See SESSION_0172 finding F-06.)
  // Roles are global (brand left null on system defaults).
  // ---------------------------------------------------------------------------
  const rolesBefore = await db.role.count({ where: { isSystem: true, brand: null } })
  let rolesCreated = 0
  let rolesSkipped = 0
  for (const role of SYSTEM_ROLES) {
    const existing = await db.role.findFirst({
      where: { code: role.code, brand: null, isSystem: true },
      select: { id: true },
    })
    if (existing) {
      rolesSkipped++
      continue
    }
    await db.role.create({ data: { ...role, isSystem: true } })
    rolesCreated++
  }
  const rolesAfter = await db.role.count({ where: { isSystem: true, brand: null } })

  if (rolesCreated > 0) {
    console.log(`   ✅ Created ${rolesCreated} system role(s)`)
  }
  if (rolesSkipped > 0) {
    console.log(`   ⏭️  Skipped ${rolesSkipped} system role(s) (already exist)`)
  }
  console.log(`   📊 System Role count: before=${rolesBefore}, after=${rolesAfter} (expected 6)`)

  console.log(
    `\n🎉 Done! Organization created: ${orgCreated}, Roles created: ${rolesCreated} (skipped: ${rolesSkipped}).`,
  )
}

main()
  .catch(e => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
