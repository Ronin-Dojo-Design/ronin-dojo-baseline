/**
 * Program CRUD smoke proof — SESSION_0028 TASK_02
 *
 * Exercises the first School Ops slice at Prisma/auth-rule level:
 *   1. Create editable org + owner membership/role
 *   2. Create Program with brand/org/discipline checks
 *   3. Reject cross-brand organization input
 *   4. Reject unauthorized user
 *   5. Reject discipline not linked to the organization
 *   6. Cleanup
 *
 * Run: cd apps/web && bun scripts/smoke-program.ts
 */

import { PrismaPg } from "@prisma/adapter-pg"
import { type Brand, PrismaClient } from "../.generated/prisma/client.js"

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev"
const adapter = new PrismaPg({ connectionString: DATABASE_URL })
const db = new PrismaClient({ adapter })

const BRAND = "BASELINE_MARTIAL_ARTS" as const
const OTHER_BRAND = "BBL" as const
const TS = Date.now()

async function main() {
  console.log("Program CRUD smoke proof - start\n")

  const owner = await db.user.create({
    data: { name: "Program Owner", email: `smoke-program-owner-${TS}@test.local` },
  })
  const outsider = await db.user.create({
    data: { name: "Program Outsider", email: `smoke-program-outsider-${TS}@test.local` },
  })
  const discipline = await db.discipline.create({
    data: { name: `Program Discipline ${TS}`, slug: `program-discipline-${TS}`, brand: BRAND },
  })
  const otherDiscipline = await db.discipline.create({
    data: { name: `Other Discipline ${TS}`, slug: `other-discipline-${TS}`, brand: BRAND },
  })
  const role = await db.role.create({
    data: { code: "OWNER", name: `Smoke Owner ${TS}`, isSystem: false, brand: BRAND },
  })
  const org = await db.organization.create({
    data: {
      brand: BRAND,
      name: `Program Dojo ${TS}`,
      slug: `program-dojo-${TS}`,
      type: "DOJO",
      ownerId: owner.id,
    },
  })
  const crossBrandOrg = await db.organization.create({
    data: {
      brand: OTHER_BRAND,
      name: `Cross Brand Dojo ${TS}`,
      slug: `cross-brand-dojo-${TS}`,
      type: "DOJO",
      ownerId: owner.id,
    },
  })

  await db.organizationDiscipline.create({
    data: { organizationId: org.id, disciplineId: discipline.id },
  })

  const membership = await db.membership.create({
    data: {
      brand: BRAND,
      userId: owner.id,
      organizationId: org.id,
      disciplineId: discipline.id,
      status: "ACTIVE",
      joinedAt: new Date(),
    },
  })
  await db.membershipRoleAssignment.create({
    data: { membershipId: membership.id, roleId: role.id },
  })

  const program = await createProgramLikeAction({
    userId: owner.id,
    activeBrand: BRAND,
    organizationId: org.id,
    disciplineId: discipline.id,
    slug: `program-${TS}`,
  })
  console.log(`Created program: ${program.id}`)

  await expectRejects(
    () =>
      createProgramLikeAction({
        userId: owner.id,
        activeBrand: BRAND,
        organizationId: crossBrandOrg.id,
        disciplineId: discipline.id,
        slug: `cross-brand-${TS}`,
      }),
    "cross-brand organization rejected",
  )

  await expectRejects(
    () =>
      createProgramLikeAction({
        userId: outsider.id,
        activeBrand: BRAND,
        organizationId: org.id,
        disciplineId: discipline.id,
        slug: `unauthorized-${TS}`,
      }),
    "unauthorized user rejected",
  )

  await expectRejects(
    () =>
      createProgramLikeAction({
        userId: owner.id,
        activeBrand: BRAND,
        organizationId: org.id,
        disciplineId: otherDiscipline.id,
        slug: `wrong-discipline-${TS}`,
      }),
    "unlinked discipline rejected",
  )

  await cleanup({
    orgIds: [org.id, crossBrandOrg.id],
    userIds: [owner.id, outsider.id],
    disciplineIds: [discipline.id, otherDiscipline.id],
    roleId: role.id,
  })

  console.log("\nProgram CRUD smoke proof - passed")
}

async function createProgramLikeAction({
  userId,
  activeBrand,
  organizationId,
  disciplineId,
  slug,
}: {
  userId: string
  activeBrand: Brand
  organizationId: string
  disciplineId: string
  slug: string
}) {
  const organization = await db.organization.findFirst({
    where: { id: organizationId, brand: activeBrand },
    select: {
      id: true,
      brand: true,
      ownerId: true,
      disciplines: { select: { disciplineId: true } },
      memberships: {
        where: {
          userId,
          status: "ACTIVE",
          roleAssignments: {
            some: { role: { code: { in: ["OWNER", "ORG_ADMIN", "INSTRUCTOR"] } } },
          },
        },
        select: { id: true },
      },
    },
  })

  if (!organization) throw new Error("Organization not found for active brand")
  if (organization.ownerId !== userId && organization.memberships.length === 0) {
    throw new Error("User cannot manage organization")
  }
  if (!organization.disciplines.some(link => link.disciplineId === disciplineId)) {
    throw new Error("Discipline is not linked to organization")
  }

  return db.program.create({
    data: {
      brand: organization.brand,
      organizationId: organization.id,
      disciplineId,
      name: `Smoke Program ${slug}`,
      slug,
      status: "ACTIVE",
    },
  })
}

async function expectRejects(action: () => Promise<unknown>, label: string) {
  try {
    await action()
  } catch {
    console.log(`Rejected as expected: ${label}`)
    return
  }

  throw new Error(`Expected rejection did not happen: ${label}`)
}

async function cleanup({
  orgIds,
  userIds,
  disciplineIds,
  roleId,
}: {
  orgIds: string[]
  userIds: string[]
  disciplineIds: string[]
  roleId: string
}) {
  await db.organization.deleteMany({ where: { id: { in: orgIds } } })
  await db.user.deleteMany({ where: { id: { in: userIds } } })
  await db.discipline.deleteMany({ where: { id: { in: disciplineIds } } })
  await db.role.delete({ where: { id: roleId } })
}

main()
  .catch(async error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
