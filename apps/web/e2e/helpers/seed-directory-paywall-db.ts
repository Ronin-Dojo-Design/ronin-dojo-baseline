/**
 * SESSION_0502 (TASK_03) — directory profile paywall field-boundary fixture (Bun DB worker).
 *
 * The wrapper (`seed-directory-paywall.ts`) shells into this file so Playwright/Node callers do
 * not import the Prisma client directly. Seeds two claimed PUBLIC BBL directory profiles under a
 * published claimable BBL tree — a FREE one and a PREMIUM one — BOTH with rich media set, so the
 * e2e proves the free/paid field boundary non-vacuously.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"
import { cleanupOwnedTestRows, createFixtureRunIdentity } from "../../lib/test/fixture-ownership"
import { LINEAGE_PREMIUM_ENTITLEMENT_KEY } from "../../lib/entitlements/lineage-comp"
import { grantComp } from "../../server/entitlements/comp-grants"
import type { DirectoryPaywallSeedFixture } from "./seed-directory-paywall"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TEST_BRAND = "BBL" as const
const TAG_PREFIX = "session-0502-directory-paywall-e2e"
const BIO = "Directory paywall fixture bio — always visible on any claimed profile."
const COVER_PHOTO_URL = "https://example.com/session-0502-paywall-cover.jpg"
const VIDEO_INTRO_TITLE = "Video Intro"
const SOCIAL_PLATFORM = "website"
const LOCATION_CITY = "Denver"
const ORG_NAME_SUFFIX = "Paywall Dojo"

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-")

async function ensurePremiumEntitlement() {
  const entitlement = await prisma.entitlement.upsert({
    where: { brand_key: { brand: TEST_BRAND, key: LINEAGE_PREMIUM_ENTITLEMENT_KEY } },
    update: {},
    create: {
      brand: TEST_BRAND,
      key: LINEAGE_PREMIUM_ENTITLEMENT_KEY,
      name: "Lineage Premium",
    },
  })
  return entitlement
}

async function createProfile({
  runId,
  label,
  organizationId,
  disciplineId,
  rankId,
}: {
  runId: string
  label: string
  organizationId: string
  disciplineId: string
  rankId: string
}) {
  const displayName = `E2E ${label} ${runId}`
  const slug = slugify(`${TAG_PREFIX}-${label}-${runId}`)
  const user = await prisma.user.create({
    data: {
      name: displayName,
      email: `${slug}@test.local`,
      emailVerified: true,
      role: "user",
      passport: {
        create: {
          displayName,
          bio: BIO,
          socialLinks: { [SOCIAL_PLATFORM]: `https://example.com/${slug}` },
          directoryProfile: {
            create: {
              slug,
              visibility: "PUBLIC",
              locationCity: LOCATION_CITY,
              locationRegion: "CO",
              locationCountry: "US",
              coverPhotoUrl: COVER_PHOTO_URL,
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
  const passportId = user.passport!.id

  await prisma.membership.create({
    data: {
      brand: TEST_BRAND,
      status: "ACTIVE",
      userId: user.id,
      organizationId,
      disciplineId,
      joinedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  })

  await prisma.rankAward.create({
    data: { passportId, rankId, awardedAt: new Date("2026-02-01T00:00:00.000Z"), organizationId },
  })

  const node = await prisma.lineageNode.create({
    data: {
      passportId,
      slug: `${slug}-node`,
      visibility: "PUBLIC",
      isVerified: true,
      bio: `${displayName} lineage node.`,
    },
  })

  return { userId: user.id, passportId, nodeId: node.id, displayName, slug }
}

async function seedDirectoryPaywallFixture(): Promise<DirectoryPaywallSeedFixture> {
  const identity = createFixtureRunIdentity(TAG_PREFIX)
  const runId = identity.runId
  const createdEntitlementIds: string[] = []
  await ensurePremiumEntitlement()

  const organization = await prisma.organization.create({
    data: {
      brand: TEST_BRAND,
      type: "DOJO",
      name: `${TAG_PREFIX} ${ORG_NAME_SUFFIX} ${runId}`,
      slug: identity.slug("org"),
    },
  })
  const discipline = await prisma.discipline.create({
    data: {
      brand: TEST_BRAND,
      name: `${TAG_PREFIX} Discipline ${runId}`,
      slug: identity.slug("discipline"),
      code: identity.shortCode("dp"),
    },
  })
  const rankSystem = await prisma.rankSystem.create({
    data: {
      brand: TEST_BRAND,
      name: `${TAG_PREFIX} Rank System ${runId}`,
      disciplineId: discipline.id,
    },
  })
  const rank = await prisma.rank.create({
    data: {
      brand: TEST_BRAND,
      rankSystemId: rankSystem.id,
      sortOrder: 10,
      name: `${TAG_PREFIX} Black Belt ${runId}`,
      colorHex: "#111827",
    },
  })

  const free = await createProfile({
    runId,
    label: "Free",
    organizationId: organization.id,
    disciplineId: discipline.id,
    rankId: rank.id,
  })
  const premium = await createProfile({
    runId,
    label: "Premium",
    organizationId: organization.id,
    disciplineId: discipline.id,
    rankId: rank.id,
  })

  await grantComp({
    db: prisma,
    brand: TEST_BRAND,
    grantorUserId: free.userId,
    granteeUserId: premium.userId,
    entitlementKeys: [LINEAGE_PREMIUM_ENTITLEMENT_KEY],
    reason: "seed-directory-paywall-premium",
  })

  const tree = await prisma.lineageTree.create({
    data: {
      brand: TEST_BRAND,
      slug: identity.slug("tree"),
      name: `E2E Directory Paywall ${runId}`,
      description: `E2E directory paywall tree ${TAG_PREFIX} ${runId}`,
      visibility: "PUBLIC",
      isPublished: true,
      isClaimable: true,
    },
  })
  for (const profile of [free, premium]) {
    await prisma.lineageTreeMember.create({
      data: { treeId: tree.id, nodeId: profile.nodeId, isClaimable: true, visualSortOrder: 10 },
    })
  }

  return {
    runId,
    treeId: tree.id,
    freeSlug: free.slug,
    premiumSlug: premium.slug,
    freeName: free.displayName,
    premiumName: premium.displayName,
    bio: BIO,
    coverPhotoUrl: COVER_PHOTO_URL,
    videoIntroTitle: VIDEO_INTRO_TITLE,
    socialPlatform: SOCIAL_PLATFORM,
    locationCity: LOCATION_CITY,
    orgName: organization.name,
    userIds: [free.userId, premium.userId],
    nodeIds: [free.nodeId, premium.nodeId],
    createdEntitlementIds,
  }
}

async function cleanupDirectoryPaywallFixture(fixture: DirectoryPaywallSeedFixture) {
  await cleanupOwnedTestRows(prisma, {
    userIds: fixture.userIds,
    treeIds: [fixture.treeId],
    nodeIds: fixture.nodeIds,
    rankNameContains: [fixture.runId],
    rankSystemNameContains: [fixture.runId],
    organizationNameContains: [fixture.runId],
    disciplineSlugContains: [fixture.runId],
    entitlementIds: fixture.createdEntitlementIds,
  })
}

const command = process.argv[2]

if (command === "seed") {
  const fixture = await seedDirectoryPaywallFixture()
  process.stdout.write(JSON.stringify(fixture))
} else if (command === "cleanup") {
  const encoded = process.argv[3]
  if (!encoded) {
    throw new Error("Missing encoded directory paywall fixture")
  }
  const fixture = JSON.parse(
    Buffer.from(encoded, "base64").toString("utf-8"),
  ) as DirectoryPaywallSeedFixture
  await cleanupDirectoryPaywallFixture(fixture)
} else {
  throw new Error(`Unknown directory paywall fixture command: ${command ?? "<missing>"}`)
}
