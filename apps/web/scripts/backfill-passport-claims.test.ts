/**
 * SESSION_0437 P4 (ADR 0036) — backfillPassportClaims idempotency test.
 *
 * Run: cd apps/web && bun test scripts/backfill-passport-claims.test.ts
 *
 * Seeds a BASELINE-brand APPROVED LineageClaimRequest (Tony-Hua-shaped) and a PERSON
 * ProfileClaimRequest, runs the backfill twice, and asserts: the seeded rows migrate once,
 * APPROVED status is preserved, and the second run is a no-op (no duplicates).
 *
 * Scoped to BASELINE so it never touches real BBL data. afterAll deletes every BASELINE
 * PassportClaimRequest, which restores prodsnap to its original state (the table is new + empty).
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"

mock.module("next/cache", () => ({
  cacheLife: () => {},
  cacheTag: () => {},
  revalidatePath: () => {},
  revalidateTag: () => {},
  updateTag: () => {},
}))

import { db } from "~/services/db"
import { backfillPassportClaims } from "./backfill-passport-claims"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const TS = Date.now()
const tag = (name: string) => `s0437-bf-${TS}-${name}`

type Fixtures = {
  lineagePassportId: string
  profilePassportId: string
  treeId: string
  nodeId: string
  directoryProfileId: string
  lineageClaimantId: string
  profileClaimantId: string
}

let fx: Fixtures | null = null

beforeAll(async () => {
  const lineageClaimant = await db.user.create({
    data: { id: tag("lc-claimant"), name: tag("LC"), email: `${tag("lc-claimant")}@test.local` },
  })
  const profileClaimant = await db.user.create({
    data: { id: tag("pc-claimant"), name: tag("PC"), email: `${tag("pc-claimant")}@test.local` },
  })

  // Lineage source: a node-backed placeholder Passport + an APPROVED LineageClaimRequest.
  const node = await db.lineageNode.create({
    data: {
      id: tag("node"),
      passport: { create: { id: tag("lineage-passport"), displayName: tag("Lineage Person") } },
      slug: tag("node-slug"),
      visibility: "PUBLIC",
      verificationStatus: "PENDING",
    },
    select: { id: true, passportId: true },
  })
  const tree = await db.lineageTree.create({
    data: {
      id: tag("tree"),
      brand: TEST_BRAND,
      slug: tag("tree-slug"),
      name: tag("Tree"),
      visibility: "PUBLIC",
      isPublished: true,
      scopeType: "DISCIPLINE",
    },
  })
  await db.lineageTreeMember.create({
    data: { id: tag("member"), treeId: tree.id, nodeId: node.id, visualSortOrder: 0 },
  })
  await db.lineageClaimRequest.create({
    data: {
      id: tag("lineage-claim"),
      treeId: tree.id,
      nodeId: node.id,
      claimantUserId: lineageClaimant.id,
      status: "APPROVED",
      reviewedById: lineageClaimant.id,
      reviewedAt: new Date(),
    },
  })

  // Profile source: a directory-only placeholder Passport + a PENDING PERSON ProfileClaimRequest.
  const profilePassport = await db.passport.create({
    data: {
      id: tag("profile-passport"),
      displayName: tag("Profile Person"),
      directoryProfile: { create: { id: tag("dp"), slug: tag("dp-slug") } },
    },
    select: { id: true, directoryProfile: { select: { id: true } } },
  })
  await db.profileClaimRequest.create({
    data: {
      id: tag("profile-claim"),
      brand: TEST_BRAND,
      subjectType: "PERSON",
      relationship: "SELF",
      claimantUserId: profileClaimant.id,
      directoryProfileId: profilePassport.directoryProfile!.id,
      status: "PENDING",
    },
  })

  fx = {
    lineagePassportId: node.passportId,
    profilePassportId: profilePassport.id,
    treeId: tree.id,
    nodeId: node.id,
    directoryProfileId: profilePassport.directoryProfile!.id,
    lineageClaimantId: lineageClaimant.id,
    profileClaimantId: profileClaimant.id,
  }
})

afterAll(async () => {
  if (!fx) return
  // Deleting every BASELINE PassportClaimRequest restores prodsnap (the table was empty pre-test).
  await db.passportClaimRequest.deleteMany({ where: { brand: TEST_BRAND } })
  await db.lineageClaimRequest.deleteMany({ where: { treeId: fx.treeId } })
  await db.profileClaimRequest.deleteMany({ where: { directoryProfileId: fx.directoryProfileId } })
  await db.lineageTreeMember.deleteMany({ where: { treeId: fx.treeId } })
  await db.lineageTree.deleteMany({ where: { id: fx.treeId } })
  await db.lineageNode.deleteMany({ where: { id: fx.nodeId } })
  await db.passport.deleteMany({
    where: { id: { in: [fx.lineagePassportId, fx.profilePassportId] } },
  })
  await db.user.deleteMany({ where: { id: { in: [fx.lineageClaimantId, fx.profileClaimantId] } } })
})

describe("backfillPassportClaims (ADR 0036 P4)", () => {
  it("migrates seeded lineage + profile claims, preserves APPROVED, and is idempotent", async () => {
    await backfillPassportClaims(db, { brand: TEST_BRAND })

    // Lineage claim migrated, APPROVED preserved, node/tree context carried.
    const lineageMigrated = await db.passportClaimRequest.findMany({
      where: { passportId: fx!.lineagePassportId, claimantUserId: fx!.lineageClaimantId },
    })
    expect(lineageMigrated).toHaveLength(1)
    expect(lineageMigrated[0].status).toBe("APPROVED")
    expect(lineageMigrated[0].nodeId).toBe(fx!.nodeId)
    expect(lineageMigrated[0].treeId).toBe(fx!.treeId)

    // Profile PERSON claim migrated with directory context + relationship.
    const profileMigrated = await db.passportClaimRequest.findMany({
      where: { passportId: fx!.profilePassportId, claimantUserId: fx!.profileClaimantId },
    })
    expect(profileMigrated).toHaveLength(1)
    expect(profileMigrated[0].directoryProfileId).toBe(fx!.directoryProfileId)
    expect(profileMigrated[0].relationship).toBe("SELF")

    // Second run is a no-op for every BASELINE row already migrated (including any pre-existing).
    const second = await backfillPassportClaims(db, { brand: TEST_BRAND })
    expect(second.lineageMigrated).toBe(0)
    expect(second.profilePersonMigrated).toBe(0)

    // No duplicates created for the seeded passports.
    expect(
      await db.passportClaimRequest.count({ where: { passportId: fx!.lineagePassportId } }),
    ).toBe(1)
    expect(
      await db.passportClaimRequest.count({ where: { passportId: fx!.profilePassportId } }),
    ).toBe(1)
  })
})
