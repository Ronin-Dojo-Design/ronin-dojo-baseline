/**
 * Bun-only Playwright DB bridge for the belt-journey behavior spec
 * (Slice 5 — Petey Plan 0477 §Slice 5).
 *
 * Playwright helpers run in Node, but the generated Prisma TS client imports
 * cleanly under Bun (mirrors `auth-db.ts` / `seed-lineage-lifecycle-db.ts`). All
 * belt-fixture DB writes live here; the spec calls them via `seed-belt-journey.ts`.
 *
 * The fixture is DELIBERATELY minimal — two BJJ awards + one uncovered ladder rank —
 * so it exercises every gating branch the spec asserts (B1 — ADR 0035 Amendment 1):
 *   - White belt  → self-added STATED (`awardedById === null`; below the ceiling →
 *                   fact-editable per `isFactEditable`; enrichable)
 *   - Blue belt   → promotion-minted VERIFIED (`awardedById` = the approving
 *                   instructor; the TOP award → ceiling; fact read-only; delete blocked)
 *   - Purple belt → NO award   (above the ceiling → routes to the promotion flow)
 *
 * Under B1 there are NO `UNVERIFIED` awards (no code path mints one) and a
 * promotion-minted award is stamped with the approver's `awardedById`, so the
 * fixture mirrors those two prod shapes exactly rather than the pre-B1 world.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const TEST_BRAND = "BBL" as const
const TAG_PREFIX = "session-0482-belt-e2e"

export type BeltJourneyFixture = {
  userId: string
  passportId: string
  /** The approving instructor's User id — stamped onto the promotion-minted Blue award. */
  instructorUserId: string
  whiteRankId: string
  whiteRankName: string
  blueRankId: string
  blueRankName: string
  purpleRankId: string
  purpleRankName: string
  whiteAwardId: string
  blueAwardId: string
}

const decodePayload = <T>() => {
  const encoded = process.argv[3]
  if (!encoded) return undefined as T | undefined
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf-8")) as T
}

/** Three ascending BJJ ranks from the seed ladder — the fixture's ceiling window. */
async function threeAscendingBjjRanks() {
  const ranks = await prisma.rank.findMany({
    where: { rankSystem: { discipline: { code: "bjj" } } },
    select: { id: true, name: true, sortOrder: true },
    orderBy: { sortOrder: "asc" },
  })
  if (ranks.length < 3) {
    throw new Error("BELT_E2E_NEEDS_THREE_BJJ_RANKS — seed the BJJ ladder first")
  }
  // White is the lowest; pick two ranks above it for the ceiling + the locked rank.
  return { white: ranks[0], blue: ranks[1], purple: ranks[2] }
}

async function seed(): Promise<BeltJourneyFixture> {
  await cleanup()

  const { white, blue, purple } = await threeAscendingBjjRanks()

  const uid = crypto.randomUUID().slice(0, 12)
  const user = await prisma.user.create({
    data: {
      name: `${TAG_PREFIX}-${uid}`,
      email: `${TAG_PREFIX}-${uid}@test.local`,
      emailVerified: true,
      passport: {
        create: {
          brand: TEST_BRAND,
          displayName: `Belt E2E ${uid}`,
          directorySlug: `${TAG_PREFIX}-${uid}`,
        },
      },
    },
    select: { id: true, passport: { select: { id: true } } },
  })
  const passportId = user.passport?.id
  if (!passportId) throw new Error("BELT_E2E_PASSPORT_MISSING")

  // The approving instructor — a distinct User so the Blue award's `awardedById`
  // mirrors the prod promotion mint (approver ≠ the member; self-approval is blocked).
  const instructor = await prisma.user.create({
    data: {
      name: `${TAG_PREFIX}-instructor-${uid}`,
      email: `${TAG_PREFIX}-instructor-${uid}@test.local`,
      emailVerified: true,
    },
    select: { id: true },
  })

  // White belt — self-added STATED backfill: `awardedById === null`, so under B1's
  // `isFactEditable` its promotion facts are the member's to edit (below the ceiling
  // → enrichable). No `UNVERIFIED` state exists under B1, so this is the editable shape.
  const whiteAward = await prisma.rankAward.create({
    data: {
      passportId,
      rankId: white.id,
      source: "STATED",
      verificationStatus: "VERIFIED",
    },
    select: { id: true },
  })

  // Blue belt — promotion-minted VERIFIED: the member's TOP award → the ceiling.
  // Stamped with the approving instructor's `awardedById` (mirrors `mintAssertedRankAward`),
  // so `isFactEditable` reads it as authority-owned → read-only; it also cannot be
  // deleted via self-service.
  const blueAward = await prisma.rankAward.create({
    data: {
      passportId,
      rankId: blue.id,
      source: "STATED",
      verificationStatus: "VERIFIED",
      awardedById: instructor.id,
    },
    select: { id: true },
  })

  return {
    userId: user.id,
    passportId,
    instructorUserId: instructor.id,
    whiteRankId: white.id,
    whiteRankName: white.name,
    blueRankId: blue.id,
    blueRankName: blue.name,
    purpleRankId: purple.id,
    purpleRankName: purple.name,
    whiteAwardId: whiteAward.id,
    blueAwardId: blueAward.id,
  }
}

async function cleanup(fixture?: BeltJourneyFixture) {
  const users = await prisma.user.findMany({
    where: { email: { contains: TAG_PREFIX } },
    select: { id: true, passport: { select: { id: true } } },
  })
  const userIds = users.map(u => u.id)
  const passportIds = users.map(u => u.passport?.id).filter((id): id is string => Boolean(id))
  if (fixture) {
    userIds.push(fixture.userId, fixture.instructorUserId)
    passportIds.push(fixture.passportId)
  }
  if (userIds.length === 0 && passportIds.length === 0) return

  // RankMilestone + MediaAttachment cascade from RankAward (Slice 2); delete awards,
  // then passports, then users. Sessions cascade on user delete.
  await prisma.rankAward.deleteMany({ where: { passportId: { in: passportIds } } })
  await prisma.passport.deleteMany({ where: { id: { in: passportIds } } })
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } })
  await prisma.user.deleteMany({ where: { id: { in: userIds } } })
}

async function main() {
  const command = process.argv[2]
  if (command === "seed") {
    process.stdout.write(JSON.stringify(await seed()))
    return
  }
  if (command === "cleanup") {
    await cleanup(decodePayload<BeltJourneyFixture>())
    return
  }
  throw new Error(`Unknown belt-journey DB command: ${command}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async error => {
    await prisma.$disconnect()
    process.stderr.write(String(error instanceof Error ? error.stack : error))
    process.exit(1)
  })
