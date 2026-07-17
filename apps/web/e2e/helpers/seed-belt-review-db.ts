/**
 * Bun-only fixture bridge for the belt-review Playwright lifecycle.
 *
 * The Playwright process is Node, while the generated Prisma client is exercised through Bun.
 * Every row is owned by TAG_PREFIX and removed in dependency order after the spec.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PrismaClient } from "../../.generated/prisma/client"
import { assertLiteralLocalE2eUrls } from "../../scripts/e2e-db-env"

assertLiteralLocalE2eUrls(process.env.DATABASE_URL, process.env.DIRECT_URL, {
  isCi: process.env.CI === "true",
})
const databaseUrl = process.env.DATABASE_URL

const adapter = new PrismaPg({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter })

const TAG_PREFIX = "session-0543-belt-review-e2e"

export type BeltReviewFixture = {
  adminUserId: string
  memberPassportId: string
  memberName: string
  acceptedPromoterPassportId: string
  acceptedPromoterName: string
  proposedPromoterPassportId: string
  proposedPromoterName: string
  rankAwardId: string
  rankEntryId: string
  reviewId: string
}

export type BeltReviewFixtureState = {
  reviewStatus: string | null
  awardPromoterPassportId: string | null
  awardVerificationStatus: string | null
  entryStatus: string | null
  auditActions: string[]
}

const decodeFixture = (): BeltReviewFixture | undefined => {
  const encoded = process.argv[3]
  if (!encoded) return undefined
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as BeltReviewFixture
}

async function cleanupTaggedRows(): Promise<void> {
  await prisma.$transaction(
    async tx => {
      const users = await tx.user.findMany({
        where: { email: { contains: TAG_PREFIX } },
        select: { id: true },
      })
      const passports = await tx.passport.findMany({
        where: { displayName: { contains: TAG_PREFIX } },
        select: { id: true },
      })
      const disciplines = await tx.discipline.findMany({
        where: { slug: { contains: TAG_PREFIX } },
        select: { id: true },
      })
      const userIds = users.map(user => user.id)
      const passportIds = passports.map(passport => passport.id)
      const disciplineIds = disciplines.map(discipline => discipline.id)

      const rankSystems = await tx.rankSystem.findMany({
        where: { disciplineId: { in: disciplineIds } },
        select: { id: true },
      })
      const rankSystemIds = rankSystems.map(rankSystem => rankSystem.id)
      const ranks = await tx.rank.findMany({
        where: { rankSystemId: { in: rankSystemIds } },
        select: { id: true },
      })
      const rankIds = ranks.map(rank => rank.id)
      const awards = await tx.rankAward.findMany({
        where: {
          OR: [{ passportId: { in: passportIds } }, { rankId: { in: rankIds } }],
        },
        select: { id: true },
      })
      const awardIds = awards.map(award => award.id)
      const entries = await tx.rankEntry.findMany({
        where: { rankAwardId: { in: awardIds } },
        select: { id: true },
      })
      const entryIds = entries.map(entry => entry.id)
      const reviews = await tx.rankEntryReview.findMany({
        where: {
          OR: [
            { rankEntryId: { in: entryIds } },
            { expectedPromoterPassportId: { in: passportIds } },
            { proposedPromoterPassportId: { in: passportIds } },
          ],
        },
        select: { id: true },
      })
      const reviewIds = reviews.map(review => review.id)

      await tx.auditLog.deleteMany({
        where: {
          OR: [
            { userId: { in: userIds } },
            { entityId: { in: [...reviewIds, ...entryIds, ...awardIds] } },
          ],
        },
      })
      await tx.rankEntryReview.deleteMany({ where: { id: { in: reviewIds } } })
      await tx.rankAward.deleteMany({ where: { id: { in: awardIds } } })
      await tx.session.deleteMany({ where: { userId: { in: userIds } } })
      await tx.directoryProfile.deleteMany({ where: { passportId: { in: passportIds } } })
      await tx.passport.deleteMany({ where: { id: { in: passportIds } } })
      await tx.user.deleteMany({ where: { id: { in: userIds } } })
      await tx.rank.deleteMany({ where: { id: { in: rankIds } } })
      await tx.rankSystem.deleteMany({ where: { id: { in: rankSystemIds } } })
      await tx.discipline.deleteMany({ where: { id: { in: disciplineIds } } })
    },
    { maxWait: 10_000, timeout: 30_000 },
  )
}

async function seed(): Promise<BeltReviewFixture> {
  await cleanupTaggedRows()

  const uid = crypto.randomUUID().slice(0, 12)
  return prisma.$transaction(
    async tx => {
      const admin = await tx.user.create({
        data: {
          name: `${TAG_PREFIX}-admin-${uid}`,
          email: `${TAG_PREFIX}-admin-${uid}@test.local`,
          emailVerified: true,
          role: "admin",
        },
        select: { id: true },
      })
      await tx.passport.create({
        data: { userId: admin.id, displayName: `${TAG_PREFIX}-admin-${uid}` },
      })

      const memberName = `${TAG_PREFIX}-member-${uid}`
      const acceptedPromoterName = `${TAG_PREFIX}-coach-a-${uid}`
      const proposedPromoterName = `${TAG_PREFIX}-coach-b-${uid}`
      // Interactive PrismaPg transactions use one checked-out connection; keep their queries serial.
      const member = await tx.passport.create({
        data: { displayName: memberName },
        select: { id: true },
      })
      const acceptedPromoterUser = await tx.user.create({
        data: {
          name: acceptedPromoterName,
          email: `${TAG_PREFIX}-coach-a-${uid}@test.local`,
          emailVerified: true,
        },
        select: { id: true },
      })
      const acceptedPromoter = await tx.passport.create({
        data: { userId: acceptedPromoterUser.id, displayName: acceptedPromoterName },
        select: { id: true },
      })
      const proposedPromoterUser = await tx.user.create({
        data: {
          name: proposedPromoterName,
          email: `${TAG_PREFIX}-coach-b-${uid}@test.local`,
          emailVerified: true,
        },
        select: { id: true },
      })
      const proposedPromoter = await tx.passport.create({
        data: { userId: proposedPromoterUser.id, displayName: proposedPromoterName },
        select: { id: true },
      })

      const discipline = await tx.discipline.create({
        data: {
          name: `${TAG_PREFIX}-discipline-${uid}`,
          slug: `${TAG_PREFIX}-discipline-${uid}`,
          code: `${TAG_PREFIX}-${uid}`,
          brand: Brand.BBL,
        },
        select: { id: true },
      })
      const rankSystem = await tx.rankSystem.create({
        data: {
          name: `${TAG_PREFIX}-system-${uid}`,
          disciplineId: discipline.id,
          brand: Brand.BBL,
        },
        select: { id: true },
      })
      const rank = await tx.rank.create({
        data: {
          rankSystemId: rankSystem.id,
          sortOrder: 1,
          name: "Blue Belt",
          colorHex: "#2563EB",
          beltFamily: "COLORED",
          brand: Brand.BBL,
        },
        select: { id: true },
      })
      const award = await tx.rankAward.create({
        data: {
          passportId: member.id,
          rankId: rank.id,
          source: "STATED",
          verificationStatus: "UNVERIFIED",
          awardedByPassportId: acceptedPromoter.id,
        },
        select: { id: true },
      })
      const entry = await tx.rankEntry.create({
        data: {
          passportId: member.id,
          rankId: rank.id,
          rankAwardId: award.id,
          status: "UNVERIFIED",
        },
        select: { id: true },
      })
      const review = await tx.rankEntryReview.create({
        data: {
          rankEntryId: entry.id,
          status: "PROPOSAL_PENDING",
          reason: "PROMOTER_CHANGED",
          proposalCapturedAt: new Date(),
          expectedPromoterPassportId: acceptedPromoter.id,
          proposedPromoterPassportId: proposedPromoter.id,
        },
        select: { id: true },
      })

      return {
        adminUserId: admin.id,
        memberPassportId: member.id,
        memberName,
        acceptedPromoterPassportId: acceptedPromoter.id,
        acceptedPromoterName,
        proposedPromoterPassportId: proposedPromoter.id,
        proposedPromoterName,
        rankAwardId: award.id,
        rankEntryId: entry.id,
        reviewId: review.id,
      }
    },
    { maxWait: 10_000, timeout: 30_000 },
  )
}

async function readState(fixture: BeltReviewFixture): Promise<BeltReviewFixtureState> {
  const review = await prisma.rankEntryReview.findUnique({
    where: { id: fixture.reviewId },
    select: { status: true },
  })
  const award = await prisma.rankAward.findUnique({
    where: { id: fixture.rankAwardId },
    select: { awardedByPassportId: true, verificationStatus: true },
  })
  const entry = await prisma.rankEntry.findUnique({
    where: { id: fixture.rankEntryId },
    select: { status: true },
  })
  const audits = await prisma.auditLog.findMany({
    where: {
      entityId: { in: [fixture.reviewId, fixture.rankEntryId, fixture.rankAwardId] },
      userId: fixture.adminUserId,
    },
    select: { action: true },
    orderBy: { createdAt: "asc" },
  })

  return {
    reviewStatus: review?.status ?? null,
    awardPromoterPassportId: award?.awardedByPassportId ?? null,
    awardVerificationStatus: award?.verificationStatus ?? null,
    entryStatus: entry?.status ?? null,
    auditActions: audits.map(audit => audit.action),
  }
}

async function main(): Promise<void> {
  const command = process.argv[2]
  if (command === "seed") {
    process.stdout.write(JSON.stringify(await seed()))
    return
  }
  if (command === "read-state") {
    const fixture = decodeFixture()
    if (!fixture) throw new Error("Missing belt-review fixture")
    process.stdout.write(JSON.stringify(await readState(fixture)))
    return
  }
  if (command === "cleanup") {
    await cleanupTaggedRows()
    return
  }
  throw new Error(`Unknown belt-review DB command: ${command ?? "<missing>"}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async error => {
    await prisma.$disconnect()
    process.stderr.write(String(error instanceof Error ? error.stack : error))
    process.exit(1)
  })
