/**
 * SESSION_0348 — Directory profile owner-tier render policy integration test.
 * @changed SESSION_0502 (TASK_03) — the free/paid boundary was repackaged (operator-ratified):
 * a FREE claimed profile now renders the FULL BASIC public profile (bio, organizations, full
 * rank history, trust status); Premium/Elite gate only RICH MEDIA (cover photo, video intro,
 * social links, location, email). These reads now prove:
 *  - a free claimed profile publishes full BASIC fields but gates cover/video/social/location/email,
 *  - premium/elite profiles publish the rich-media fields too (`canRenderFullProfile === true`),
 *  - the owner previewing their own free profile also gets rich media.
 *
 * Uses the real Postgres dev DB. Fixtures are cleaned up after.
 *
 * Run: cd apps/web && bun test server/web/directory/profile-tier-policy.integration.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { type Brand, MembershipStatus } from "~/.generated/prisma/client"
import { LINEAGE_PREMIUM_ENTITLEMENT_KEY } from "~/lib/entitlements/lineage-comp"
import { findProfileBySlug } from "~/server/web/directory/queries"
import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as Brand
const PREFIX = `session-0348-profile-tier-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

const createdUserIds: string[] = []
const createdOrganizationIds: string[] = []
const createdDisciplineIds: string[] = []
const createdRankSystemIds: string[] = []
const createdRankIds: string[] = []
const createdEntitlementIds: string[] = []
const createdUserEntitlementIds: string[] = []
const createdLineageNodeIds: string[] = []

let organizationId: string
let disciplineId: string
let rankId: string
let entitlementId: string
let freeUserId: string
let premiumUserId: string

async function ensurePremiumEntitlement() {
  const existing = await db.entitlement.findUnique({
    where: { brand_key: { brand: TEST_BRAND, key: LINEAGE_PREMIUM_ENTITLEMENT_KEY } },
  })

  if (existing) return existing

  const entitlement = await db.entitlement.create({
    data: {
      brand: TEST_BRAND,
      key: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      name: "Lineage Premium",
    },
  })
  createdEntitlementIds.push(entitlement.id)
  return entitlement
}

async function createProfileFixture(name: "free" | "premium") {
  const user = await db.user.create({
    data: {
      id: tag(`${name}-user`),
      name: tag(`${name}-name`),
      email: `${tag(name)}@test.local`,
      emailVerified: true,
      image: `https://example.com/${tag(name)}-user.jpg`,
      // Phase 3c (SOT-ADR D1): DirectoryProfile + RankAward are Passport-rooted.
      passport: {
        create: {
          avatarUrl: `https://example.com/${tag(name)}-avatar.jpg`,
          bio: `${tag(name)} public bio`,
          socialLinks: { website: `https://example.com/${tag(name)}` },
          directoryProfile: {
            create: {
              slug: tag(`${name}-profile`),
              visibility: "PUBLIC",
              locationCity: "Denver",
              locationRegion: "CO",
              locationCountry: "US",
              // Rich-media fields set on BOTH fixtures (incl. free) so the paid gate is proven
              // non-vacuously: the free projection must NULL these even though the DB rows hold a
              // real value (a null-by-absence field would pass a "gated" assertion vacuously).
              coverPhotoUrl: `https://example.com/${tag(name)}-cover.jpg`,
              videoIntroUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              showEmail: true,
              showOrgs: true,
              showRanks: true,
            },
          },
        },
      },
    },
    select: { id: true, passport: { select: { id: true } } },
  })
  createdUserIds.push(user.id)
  const passportId = user.passport!.id

  await db.membership.create({
    data: {
      brand: TEST_BRAND,
      status: MembershipStatus.ACTIVE,
      userId: user.id,
      organizationId,
      disciplineId,
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  })

  await db.rankAward.create({
    data: {
      passportId,
      rankId,
      awardedAt: new Date("2026-02-01T00:00:00.000Z"),
      organizationId,
    },
  })

  return user
}

beforeAll(async () => {
  const organization = await db.organization.create({
    data: {
      id: tag("org"),
      brand: TEST_BRAND,
      type: "DOJO",
      name: tag("org"),
      slug: tag("org"),
    },
  })
  organizationId = organization.id
  createdOrganizationIds.push(organization.id)

  const discipline = await db.discipline.create({
    data: {
      id: tag("discipline"),
      brand: TEST_BRAND,
      name: tag("discipline"),
      slug: tag("discipline"),
    },
  })
  disciplineId = discipline.id
  createdDisciplineIds.push(discipline.id)

  const rankSystem = await db.rankSystem.create({
    data: {
      id: tag("rank-system"),
      brand: TEST_BRAND,
      name: tag("rank-system"),
      disciplineId,
    },
  })
  createdRankSystemIds.push(rankSystem.id)

  const rank = await db.rank.create({
    data: {
      id: tag("rank"),
      brand: TEST_BRAND,
      name: tag("black-belt"),
      sortOrder: 10,
      rankSystemId: rankSystem.id,
    },
  })
  rankId = rank.id
  createdRankIds.push(rank.id)

  const entitlement = await ensurePremiumEntitlement()
  entitlementId = entitlement.id

  const freeUser = await createProfileFixture("free")
  freeUserId = freeUser.id
  const freeLineageNode = await db.lineageNode.create({
    data: {
      passportId: freeUser.passport!.id,
      slug: tag("free-node"),
      verificationStatus: "DISPUTED",
      isVerified: true,
    },
  })
  createdLineageNodeIds.push(freeLineageNode.id)

  const premiumUser = await createProfileFixture("premium")
  premiumUserId = premiumUser.id

  const grant = await db.userEntitlement.create({
    data: {
      userId: premiumUserId,
      entitlementId,
      sourceType: "MANUAL_GRANT",
      sourceId: tag("premium-grant"),
      status: "ACTIVE",
      startsAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  })
  createdUserEntitlementIds.push(grant.id)
})

afterAll(async () => {
  await db.userEntitlement.deleteMany({ where: { id: { in: createdUserEntitlementIds } } })
  await db.lineageNode.deleteMany({ where: { id: { in: createdLineageNodeIds } } })
  await db.rankAward.deleteMany({ where: { passport: { userId: { in: createdUserIds } } } })
  await db.membership.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.directoryProfile.deleteMany({ where: { passport: { userId: { in: createdUserIds } } } })
  await db.passport.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.session.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.account.deleteMany({ where: { userId: { in: createdUserIds } } })
  await db.user.deleteMany({ where: { id: { in: createdUserIds } } })
  await db.rank.deleteMany({ where: { id: { in: createdRankIds } } })
  await db.rankSystem.deleteMany({ where: { id: { in: createdRankSystemIds } } })
  await db.organization.deleteMany({ where: { id: { in: createdOrganizationIds } } })
  await db.discipline.deleteMany({ where: { id: { in: createdDisciplineIds } } })

  for (const entitlement of createdEntitlementIds) {
    await db.entitlement.delete({ where: { id: entitlement } })
  }
})

describe("directory profile detail tier policy", () => {
  it("publishes full BASIC fields for a free claimed profile but gates rich media", async () => {
    const profile = await findProfileBySlug({ slug: tag("free-profile"), brand: TEST_BRAND })

    expect(profile?.profileTier).toBe("free")
    // canRenderFullProfile is now an alias for canRenderRichMedia — free = false (rich gated).
    expect(profile?.canRenderFullProfile).toBe(false)
    expect(profile?.trustStatus).toBe("disputed")

    // BASIC fields — always published for a claimed profile, free tier included.
    expect(profile?.user.image).toBe(`https://example.com/${tag("free")}-avatar.jpg`)
    expect(profile?.user.bio).toBe(`${tag("free")} public bio`)
    expect(profile?.user.organizations).toHaveLength(1)
    // Full rank history (not truncated to a 1-rank summary). Only one rank was seeded.
    expect(profile?.user.ranks).toHaveLength(1)

    // RICH-media fields — gated on the free tier even though the DB rows hold real values.
    expect(profile?.coverPhotoUrl).toBeNull()
    expect(profile?.videoIntroUrl).toBeNull()
    expect(profile?.locationCity).toBeNull()
    expect(profile?.locationRegion).toBeNull()
    expect(profile?.locationCountry).toBeNull()
    expect(profile?.user.socialLinks).toBeNull()
    expect(profile?.user.email).toBeNull()
  })

  it("publishes rich media for a premium profile owner", async () => {
    const profile = await findProfileBySlug({ slug: tag("premium-profile"), brand: TEST_BRAND })

    expect(profile?.profileTier).toBe("premium")
    expect(profile?.canRenderFullProfile).toBe(true)

    // BASIC still present.
    expect(profile?.user.bio).toBe(`${tag("premium")} public bio`)
    expect(profile?.user.organizations).toHaveLength(1)
    expect(profile?.user.ranks).toHaveLength(1)

    // RICH-media unlocked for the paid tier.
    expect(profile?.coverPhotoUrl).toBe(`https://example.com/${tag("premium")}-cover.jpg`)
    expect(profile?.videoIntroUrl).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    expect(profile?.locationCity).toBe("Denver")
    expect(profile?.user.email).toBe(`${tag("premium")}@test.local`)
    expect(profile?.user.socialLinks).toMatchObject({
      website: `https://example.com/${tag("premium")}`,
    })
  })

  it("gives a free owner rich media on their own profile without publishing it publicly", async () => {
    const profile = await findProfileBySlug({
      slug: tag("free-profile"),
      brand: TEST_BRAND,
      viewerUserId: freeUserId,
    })

    expect(profile?.profileTier).toBe("free")
    expect(profile?.canRenderFullProfile).toBe(true)
    expect(profile?.isOwnProfile).toBe(true)
    expect(profile?.user.bio).toBe(`${tag("free")} public bio`)
    expect(profile?.user.organizations).toHaveLength(1)
    // Owner viewing own profile bypasses the rich-media gate.
    expect(profile?.coverPhotoUrl).toBe(`https://example.com/${tag("free")}-cover.jpg`)
    expect(profile?.locationCity).toBe("Denver")
  })
})
