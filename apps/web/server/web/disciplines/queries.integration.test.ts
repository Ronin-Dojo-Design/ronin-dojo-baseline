/**
 * SESSION_0125 — Privacy filter integration test for findDisciplineMembersByRank.
 *
 * Proves that members with PRIVATE or MEMBERS_ONLY DirectoryProfile visibility
 * are excluded from the public member carousel query. Only PUBLIC members appear.
 *
 * Uses real Postgres dev DB. Fixtures are cleaned up after.
 *
 * Run: cd apps/web && bun test server/web/disciplines/queries.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { DirectoryVisibility, MembershipStatus } from "~/.generated/prisma/client"
import { db } from "~/services/db"

/**
 * Inline replica of the findDisciplineMembersByRank query logic,
 * without the "use cache" wrapper that requires Next.js runtime.
 */
async function queryMembersByRank(disciplineId: string) {
  const memberships = await db.membership.findMany({
    where: {
      disciplineId,
      status: MembershipStatus.ACTIVE,
      rankId: { not: null },
      user: {
        passport: {
          directoryProfile: {
            visibility: DirectoryVisibility.PUBLIC,
          },
        },
      },
    },
    select: {
      id: true,
      user: {
        select: {
          passport: { select: { displayName: true } },
        },
      },
      rank: { select: { name: true, sortOrder: true } },
    },
    orderBy: { rank: { sortOrder: "asc" } },
    take: 50,
  })

  return memberships.map(m => ({
    id: m.id,
    name: m.user.passport?.displayName ?? null,
    rankName: m.rank!.name,
    rankSortOrder: m.rank!.sortOrder,
  }))
}

// -----------------------------------------------------------------------------
// Fixtures
// -----------------------------------------------------------------------------

const TS = Date.now()
let disciplineId: string
let orgId: string
let publicUserId: string
let privateUserId: string
let membersOnlyUserId: string
let publicMembershipId: string
let privateMembershipId: string
let membersOnlyMembershipId: string
let rankId: string

beforeAll(async () => {
  // Get existing discipline + org + rank
  const discipline = await db.discipline.findFirst()
  if (!discipline) throw new Error("No discipline in DB — run seed first")
  disciplineId = discipline.id

  const org = await db.organization.findFirst()
  if (!org) throw new Error("No organization in DB — run seed first")
  orgId = org.id

  const rank = await db.rank.findFirst({ orderBy: { sortOrder: "asc" } })
  if (!rank) throw new Error("No rank in DB — run seed first")
  rankId = rank.id

  // Create three test users with different visibility levels
  const publicUser = await db.user.create({
    data: {
      name: `privacy-test-public-${TS}`,
      email: `privacy-public-${TS}@test.local`,
      emailVerified: true,
      passport: {
        create: {
          displayName: `Public User ${TS}`,
          directoryProfile: { create: { visibility: "PUBLIC" } },
        },
      },
    },
  })
  publicUserId = publicUser.id

  const privateUser = await db.user.create({
    data: {
      name: `privacy-test-private-${TS}`,
      email: `privacy-private-${TS}@test.local`,
      emailVerified: true,
      passport: {
        create: {
          displayName: `Private User ${TS}`,
          directoryProfile: { create: { visibility: "HIDDEN" } },
        },
      },
    },
  })
  privateUserId = privateUser.id

  const membersOnlyUser = await db.user.create({
    data: {
      name: `privacy-test-membersonly-${TS}`,
      email: `privacy-membersonly-${TS}@test.local`,
      emailVerified: true,
      passport: {
        create: {
          displayName: `MembersOnly User ${TS}`,
          directoryProfile: { create: { visibility: "MEMBERS_ONLY" } },
        },
      },
    },
  })
  membersOnlyUserId = membersOnlyUser.id

  // Create ACTIVE memberships with rank for all three
  const publicMembership = await db.membership.create({
    data: {
      brand: "BASELINE_MARTIAL_ARTS",
      status: "ACTIVE",
      userId: publicUserId,
      organizationId: orgId,
      disciplineId,
      rankId,
    },
  })
  publicMembershipId = publicMembership.id

  const privateMembership = await db.membership.create({
    data: {
      brand: "BASELINE_MARTIAL_ARTS",
      status: "ACTIVE",
      userId: privateUserId,
      organizationId: orgId,
      disciplineId,
      rankId,
    },
  })
  privateMembershipId = privateMembership.id

  const membersOnlyMembership = await db.membership.create({
    data: {
      brand: "BASELINE_MARTIAL_ARTS",
      status: "ACTIVE",
      userId: membersOnlyUserId,
      organizationId: orgId,
      disciplineId,
      rankId,
    },
  })
  membersOnlyMembershipId = membersOnlyMembership.id
})

afterAll(async () => {
  // Clean up in reverse dependency order
  await db.membership.deleteMany({
    where: { id: { in: [publicMembershipId, privateMembershipId, membersOnlyMembershipId] } },
  })
  await db.directoryProfile.deleteMany({
    where: { passport: { userId: { in: [publicUserId, privateUserId, membersOnlyUserId] } } },
  })
  await db.passport.deleteMany({
    where: { userId: { in: [publicUserId, privateUserId, membersOnlyUserId] } },
  })
  await db.user.deleteMany({
    where: { id: { in: [publicUserId, privateUserId, membersOnlyUserId] } },
  })
})

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("findDisciplineMembersByRank privacy filter", () => {
  it("returns only PUBLIC members, excludes PRIVATE and MEMBERS_ONLY", async () => {
    const results = await queryMembersByRank(disciplineId)

    const resultIds = results.map(r => r.id)

    expect(resultIds).toContain(publicMembershipId)
    expect(resultIds).not.toContain(privateMembershipId)
    expect(resultIds).not.toContain(membersOnlyMembershipId)
  })

  it("returns displayName from Passport", async () => {
    const results = await queryMembersByRank(disciplineId)
    const publicMember = results.find(r => r.id === publicMembershipId)

    expect(publicMember).toBeDefined()
    expect(publicMember!.name).toBe(`Public User ${TS}`)
  })
})
