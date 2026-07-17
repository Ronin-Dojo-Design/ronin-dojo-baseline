// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, describe, expect, it } from "bun:test"

import { ensurePromoterPlaceholder } from "~/server/identity/promoter-placeholder"
import { db } from "~/services/db"

/**
 * `ensurePromoterPlaceholder` — freetext coach → recruited-coach placeholder Passport
 * (SESSION_0540 rework). Real Postgres: proves find-or-create, dedup, and the tight candidate scope.
 *
 * Run: cd apps/web && bun run test server/identity/promoter-placeholder.test.ts
 */

const PREFIX = `session-0540-promoter-placeholder-${Date.now()}`
const tag = (name: string) => `${PREFIX}-${name}`

afterAll(async () => {
  // Bare placeholders this test minted (accountless, tag-named).
  await db.passport.deleteMany({ where: { userId: null, displayName: { startsWith: PREFIX } } })
  // The on-tree / accounted fixtures (negative-scope controls).
  await db.lineageNode.deleteMany({ where: { passport: { displayName: { startsWith: PREFIX } } } })
  await db.rankAward.deleteMany({ where: { passport: { displayName: { startsWith: PREFIX } } } })
  await db.passport.deleteMany({ where: { displayName: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { name: { startsWith: PREFIX } } })
})

describe("ensurePromoterPlaceholder", () => {
  it("returns null for a blank name (nothing to capture)", async () => {
    expect(await ensurePromoterPlaceholder("   ")).toBeNull()
  })

  it("mints a fresh accountless placeholder Passport on a miss", async () => {
    const name = tag("Professor Atlantis")
    const result = await ensurePromoterPlaceholder(name)
    expect(result).not.toBeNull()
    expect(result!.createdPlaceholder).toBe(true)

    const passport = await db.passport.findUnique({
      where: { id: result!.passportId },
      select: { userId: true, displayName: true },
    })
    // Hidden recruitment artifact: no account attached
    // (no LineageNode / DirectoryProfile minted here — phase-2 boundary).
    expect(passport?.userId).toBeNull()
    expect(passport?.displayName).toBe(name)
  })

  it("dedups the same coach into ONE placeholder once it is a promoter (idempotent reuse)", async () => {
    const name = tag("Master Deduplicated")
    const first = await ensurePromoterPlaceholder(name)
    // The candidate scope is `rankAwardsPromoted: some`, so wire the first placeholder as a
    // promoter (the router does this via the award write) before the second lookup can reuse it.
    const promotee = await db.passport.create({
      data: { displayName: tag("promotee") },
      select: { id: true },
    })
    const rank = await db.rank.findFirstOrThrow({
      where: { rankSystem: { discipline: { code: "bjj" } } },
      select: { id: true },
    })
    await db.rankAward.create({
      data: {
        passportId: promotee.id,
        rankId: rank.id,
        source: "STATED",
        verificationStatus: "UNVERIFIED",
        awardedByPassportId: first!.passportId,
      },
    })

    const second = await ensurePromoterPlaceholder(name)
    expect(second!.createdPlaceholder).toBe(false)
    expect(second!.passportId).toBe(first!.passportId)
  })

  it("does not dedup a typed coach onto an accountless directory identity", async () => {
    const name = tag("Coach With Directory")
    const directoryCoach = await db.passport.create({
      data: {
        displayName: name,
        directoryProfile: { create: { slug: tag("coach-with-directory") } },
      },
      select: { id: true },
    })
    const promotee = await db.passport.create({
      data: { displayName: tag("directory-coach-promotee") },
      select: { id: true },
    })
    const rank = await db.rank.findFirstOrThrow({
      where: { rankSystem: { discipline: { code: "bjj" } } },
      select: { id: true },
    })
    await db.rankAward.create({
      data: {
        passportId: promotee.id,
        rankId: rank.id,
        source: "STATED",
        verificationStatus: "UNVERIFIED",
        awardedByPassportId: directoryCoach.id,
      },
    })

    const result = await ensurePromoterPlaceholder(name)

    expect(result).toMatchObject({ createdPlaceholder: true })
    expect(result!.passportId).not.toBe(directoryCoach.id)
  })

  it("NEVER fuzzy-matches a typed name onto a real on-tree person (tight scope)", async () => {
    // A registered, on-tree person with an identical name must NOT be reused as a promoter FK.
    const name = tag("Coach OnTree")
    const user = await db.user.create({ data: { name, email: `${tag("ontree")}@test.local` } })
    const passport = await db.passport.create({
      data: { displayName: name, userId: user.id },
      select: { id: true },
    })
    await db.lineageNode.create({ data: { passportId: passport.id } })

    const result = await ensurePromoterPlaceholder(name)
    // A brand-new bare placeholder — the on-tree person was excluded from the candidate set.
    expect(result!.createdPlaceholder).toBe(true)
    expect(result!.passportId).not.toBe(passport.id)
  })
})
