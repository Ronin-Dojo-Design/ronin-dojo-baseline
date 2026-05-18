/**
 * E2E seed helper — creates an Organization + Discipline + Membership
 * for Playwright membership admin tests.
 *
 * Uses the same standalone PrismaClient as auth.ts / seed-tournament.ts.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TS = Date.now()

export interface MembershipFixture {
  organizationId: string
  disciplineId: string
  membershipId: string
  roleId: string
}

/**
 * Seeds an Organization, Discipline, Role, and a PENDING Membership
 * for the given userId. Returns IDs for test assertions and cleanup.
 */
export async function seedMembership(userId: string): Promise<MembershipFixture> {
  const org = await prisma.organization.create({
    data: {
      name: `E2E Org ${TS}`,
      slug: `e2e-org-${TS}`,
      type: "DOJO",
      brand: "BASELINE_MARTIAL_ARTS",
    },
  })

  const discipline = await prisma.discipline.create({
    data: {
      name: `E2E Discipline ${TS}`,
      slug: `e2e-discipline-${TS}`,
      isSystem: true,
    },
  })

  const role = await prisma.role.create({
    data: {
      code: `MEMBER_${TS}`,
      name: "Member",
      isSystem: true,
      brand: "BASELINE_MARTIAL_ARTS",
    },
  })

  const membership = await prisma.membership.create({
    data: {
      brand: "BASELINE_MARTIAL_ARTS",
      status: "PENDING",
      userId,
      organizationId: org.id,
      disciplineId: discipline.id,
    },
  })

  return {
    organizationId: org.id,
    disciplineId: discipline.id,
    membershipId: membership.id,
    roleId: role.id,
  }
}

/**
 * Cleans up all seeded membership test data.
 * Call in afterAll to leave the DB clean.
 */
export async function cleanupMembershipFixture(fixture: MembershipFixture) {
  await prisma.membershipRoleAssignment.deleteMany({
    where: { membership: { organizationId: fixture.organizationId } },
  })
  await prisma.membership.deleteMany({
    where: { organizationId: fixture.organizationId },
  })
  await prisma.role.deleteMany({ where: { id: fixture.roleId } })
  await prisma.organization.deleteMany({ where: { id: fixture.organizationId } })
  await prisma.discipline.deleteMany({ where: { id: fixture.disciplineId } })
}
