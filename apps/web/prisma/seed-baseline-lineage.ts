import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "~/.generated/prisma/client"

/**
 * seed-baseline-lineage.ts
 *
 * Idempotent seed for Brian's lineage graph. Creates:
 *   - Brian's own LineageNode (links to his existing User).
 *   - Placeholder instructor Users (isVerified=false, display-only — no
 *     credentials) for the lineage instructors gestured at by
 *     seed-baseline-owner.ts (BJJ + Eskrima + Muay Thai + Karate + Kajukenbo).
 *   - LineageNode for each placeholder instructor.
 *   - LineageRelationship INSTRUCTOR_STUDENT rows linking each instructor
 *     (fromNode) → Brian (toNode).
 *   - Depth-2 ladder: at least one instructor's instructor is seeded so the
 *     tree renders depth >= 2 (Rigan Machado → Bob Bass → Brian Scott).
 *
 * Idempotency: every insert uses findFirst + create. Safe to re-run as a
 * no-op. FS-0006 mitigated — no createMany on nullable-unique columns.
 *
 * Usage (LOCAL DEV ONLY — do NOT run against production):
 *   bun run apps/web/prisma/seed-baseline-lineage.ts
 *
 * @see docs/sprints/SESSION_0175.md TASK_02
 * @see apps/web/prisma/seed-baseline-owner.ts (Brian's identity + lineage notes)
 */

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

// Production OWNER_ID — same constant as seed-baseline-owner.ts. On local dev
// where this user may not exist, we fall back to the Baseline org's owner.
const OWNER_ID = "KBYccZGiVxmOhV2l1LpB2XjSgES3MI8T"
const BRAND = "BASELINE_MARTIAL_ARTS" as const

// Placeholder users — display-only Lineage figures. No password/credentials.
// email pattern: `<firstname-lastname>@placeholder.lineage` (out-of-band
// domain, never resolves, used solely to satisfy User.email @unique).
type PlaceholderUser = {
  key: string
  name: string
  email: string
  image?: string | null
}

type LineageNodeSeed = {
  userKey: string
  slug: string
  bio: string
}

type LineageEdgeSeed = {
  fromKey: string
  toKey: string
  description: string
  isVerified: boolean
}

// Brian's instructors (depth 1) + one depth-2 instructor (Rigan Machado as
// Bob Bass's instructor) so the tree renders depth >= 2 per Petey plan risks.
const PLACEHOLDER_USERS: PlaceholderUser[] = [
  // ========== ROOT LINEAGE (Carlos → Carlos Jr → Rigan) ==========
  {
    key: "carlos-gracie-sr",
    name: "Carlos Gracie Sr",
    email: "carlos-gracie-sr@placeholder.lineage",
  },
  {
    key: "carlos-gracie-jr",
    name: "Carlos Gracie Jr",
    email: "carlos-gracie-jr@placeholder.lineage",
  },
  { key: "rigan-machado", name: "Rigan Machado", email: "rigan-machado@placeholder.lineage" },

  // ========== DIRTY DOZEN (Rigan's First Black Belts — ALL Coral Belt) ==========
  { key: "bob-bass", name: "Bob Bass", email: "bob-bass@placeholder.lineage" },
  { key: "rick-williams", name: "Rick Williams", email: "rick-williams@placeholder.lineage" },
  { key: "david-meyer", name: "David Meyer", email: "david-meyer@placeholder.lineage" },
  { key: "chris-haueter", name: "Chris Haueter", email: "chris-haueter@placeholder.lineage" },
  { key: "john-will", name: "John Will", email: "john-will@placeholder.lineage" },
  { key: "bill-hosken", name: "Bill Hosken", email: "bill-hosken@placeholder.lineage" },
  { key: "jerry-smith", name: "Jerry Smith", email: "jerry-smith@placeholder.lineage" },

  // ========== NEXT GENERATION ==========
  { key: "brian-truelson", name: "Brian Truelson", email: "brian-truelson@placeholder.lineage" },

  // ========== Brian's non-BJJ instructors ==========
  { key: "steve-wolk", name: "GM Steve Wolk", email: "steve-wolk@placeholder.lineage" },
  { key: "sak-va-roon", name: "Sak Va Roon", email: "sak-va-roon@placeholder.lineage" },
  { key: "tim-mills", name: "Sifu Tim Mills", email: "tim-mills@placeholder.lineage" },
  { key: "sam-carter", name: "Sifu Sam Carter", email: "sam-carter@placeholder.lineage" },
  { key: "hanyann-ng", name: "Sifu Hanyann Ng", email: "hanyann-ng@placeholder.lineage" },
  { key: "tim-wolchek", name: "Mr. Tim Wolchek", email: "tim-wolchek@placeholder.lineage" },
]

const NODE_SEEDS: LineageNodeSeed[] = [
  // Root lineage
  {
    userKey: "carlos-gracie-sr",
    slug: "carlos-gracie-sr",
    bio: "Founder of Gracie Jiu-Jitsu. Belém, Brazil.",
  },
  {
    userKey: "carlos-gracie-jr",
    slug: "carlos-gracie-jr",
    bio: "Son of Carlos Gracie Sr. Founder of Gracie Barra. 9th Degree Red Belt. Rio de Janeiro, Brazil.",
  },
  {
    userKey: "rigan-machado",
    slug: "rigan-machado",
    bio: "8th Degree Coral Belt · Head of Rigan Machado Jiu-Jitsu · Los Angeles, CA. Trained under Carlos Gracie Jr lineage.",
  },

  // Dirty Dozen — Rigan's first black belts, ALL now Coral Belt
  {
    userKey: "bob-bass",
    slug: "bob-bass",
    bio: "Coral Belt · 1st American Black Belt under Rigan Machado · Founder of South Bay Jiu Jitsu, Hermosa Beach CA. Dirty Dozen #8.",
  },
  {
    userKey: "rick-williams",
    slug: "rick-williams",
    bio: "Coral Belt · Dirty Dozen #9 under Rigan Machado · South Bay Jiu Jitsu, Los Angeles CA.",
  },
  {
    userKey: "david-meyer",
    slug: "david-meyer",
    bio: "Coral Belt · Dirty Dozen #10 under Rigan Machado · David Meyer BJJ, Seattle WA.",
  },
  {
    userKey: "chris-haueter",
    slug: "chris-haueter",
    bio: "Coral Belt · Dirty Dozen #11 under Rigan Machado · Combat Base, California.",
  },
  {
    userKey: "john-will",
    slug: "john-will",
    bio: "Coral Belt · Dirty Dozen #12 under Rigan Machado · John Will Martial Arts, Melbourne, Australia.",
  },
  {
    userKey: "bill-hosken",
    slug: "bill-hosken",
    bio: "Coral Belt · Under Rigan Machado · Colorado Springs BJJ, Colorado Springs CO.",
  },
  {
    userKey: "jerry-smith",
    slug: "jerry-smith",
    bio: "Coral Belt · Under Rigan Machado · Mat Fitness, California.",
  },

  // Next generation
  {
    userKey: "brian-truelson",
    slug: "brian-truelson",
    bio: "1st Degree Black Belt · Under Bill Hosken (Rigan Machado lineage) · Puyallup BJJ, Puyallup WA.",
  },

  // Brian's non-BJJ instructors
  {
    userKey: "steve-wolk",
    slug: "gm-steve-wolk",
    bio: "Grandmaster · PIMA Denver Doce Pares Eskrima · Brian Scott's Eskrima instructor.",
  },
  {
    userKey: "sak-va-roon",
    slug: "sak-va-roon",
    bio: "Kru-level Thai Boxing instructor (Thailand). Brian Scott's Muay Thai certifying authority.",
  },
  {
    userKey: "tim-mills",
    slug: "sifu-tim-mills",
    bio: "Sifu · Kajukenbo. Co-instructor of Brian Scott's Kajukenbo 1st Degree Black Belt.",
  },
  {
    userKey: "sam-carter",
    slug: "sifu-sam-carter",
    bio: "Sifu · Kajukenbo. Co-instructor of Brian Scott's Kajukenbo 1st Degree Black Belt.",
  },
  {
    userKey: "hanyann-ng",
    slug: "sifu-hanyann-ng",
    bio: "Sifu · Kajukenbo. Co-instructor of Brian Scott's Kajukenbo 1st Degree Black Belt.",
  },
  {
    userKey: "tim-wolchek",
    slug: "mr-tim-wolchek",
    bio: "American Freestyle Karate instructor at Wolchek Academy, CO. Brian Scott's Karate instructor.",
  },
]

// EDGES: fromNode = INSTRUCTOR, toNode = STUDENT
// Tree structure: Carlos Sr → Carlos Jr → Rigan → Dirty Dozen → Next Gen
const EDGE_SEEDS: LineageEdgeSeed[] = [
  // Root lineage chain
  {
    fromKey: "carlos-gracie-sr",
    toKey: "carlos-gracie-jr",
    description: "Carlos Gracie Jr trained under his father Carlos Gracie Sr.",
    isVerified: true,
  },
  {
    fromKey: "carlos-gracie-jr",
    toKey: "rigan-machado",
    description: "Rigan Machado trained under Carlos Gracie Jr lineage.",
    isVerified: true,
  },

  // Rigan → Dirty Dozen (ALL Coral Belt)
  {
    fromKey: "rigan-machado",
    toKey: "bob-bass",
    description: "Bob Bass — 1st American Black Belt under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "rick-williams",
    description: "Rick Williams — Dirty Dozen #9 under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "david-meyer",
    description: "David Meyer — Dirty Dozen #10 under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "chris-haueter",
    description: "Chris Haueter — Dirty Dozen #11 under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "john-will",
    description: "John Will — Dirty Dozen #12 under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "bill-hosken",
    description: "Bill Hosken — under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },
  {
    fromKey: "rigan-machado",
    toKey: "jerry-smith",
    description: "Jerry Smith — under Rigan Machado. Now Coral Belt.",
    isVerified: true,
  },

  // Next generation — Bob Bass → Brian Scott
  {
    fromKey: "bob-bass",
    toKey: "OWNER",
    description: "BJJ Black Belt 1st Degree under Bob Bass (Rigan Machado lineage).",
    isVerified: true,
  },

  // Next generation — Bill Hosken → Brian Truelson (CORRECTED: was under Bob Bass in legacy)
  {
    fromKey: "bill-hosken",
    toKey: "brian-truelson",
    description: "Brian Truelson — 1st Degree Black Belt under Bill Hosken.",
    isVerified: false,
  },

  // Brian's non-BJJ instructors → Brian
  {
    fromKey: "steve-wolk",
    toKey: "OWNER",
    description:
      "Eskrima 5th Degree Black Belt (Master) under GM Steve Wolk, PIMA Denver Doce Pares.",
    isVerified: false,
  },
  {
    fromKey: "sak-va-roon",
    toKey: "OWNER",
    description: "Certified Kru under Sak Va Roon Thai Boxing (Thailand).",
    isVerified: false,
  },
  {
    fromKey: "tim-mills",
    toKey: "OWNER",
    description: "Kajukenbo 1st Degree Black Belt (co-instructor of record).",
    isVerified: false,
  },
  {
    fromKey: "sam-carter",
    toKey: "OWNER",
    description: "Kajukenbo 1st Degree Black Belt (co-instructor of record).",
    isVerified: false,
  },
  {
    fromKey: "hanyann-ng",
    toKey: "OWNER",
    description: "Kajukenbo 1st Degree Black Belt (co-instructor of record).",
    isVerified: false,
  },
  {
    fromKey: "tim-wolchek",
    toKey: "OWNER",
    description: "American Freestyle Karate 4th Degree Black Belt under Mr. Tim Wolchek.",
    isVerified: false,
  },
]

// ---------------------------------------------------------------------------
// RankAwards (SESSION_0316)
// ---------------------------------------------------------------------------
// Every BJJ-lineage figure currently has NO rank, so lineage cards render
// blank/yellow. Seed one RankAward per figure (global fact), linking the
// awarding promoter, then point each rigan-tree LineageTreeMember at it.
//
// All dates are approximate era markers — flagged in `notes`.
const RANK_AWARD_NOTE = "Approximate date — SESSION_0316 seed, refine later"

type RankAwardSeed = {
  /** Recipient user key (PLACEHOLDER_USERS key or "OWNER"). */
  userKey: string
  /** BJJ rank shortName (looked up in the BJJ rank system). */
  rankShortName: string
  /** Promoter user key, or null when unknown / root of the seeded tree. */
  awardedByKey: string | null
  /** Approximate award date (ISO). */
  awardedAt: string
}

const BJJ_RANK_AWARD_SEEDS: RankAwardSeed[] = [
  {
    userKey: "carlos-gracie-sr",
    rankShortName: "R10",
    awardedByKey: null,
    awardedAt: "1955-01-01",
  },
  {
    userKey: "carlos-gracie-jr",
    rankShortName: "R9",
    awardedByKey: "carlos-gracie-sr",
    awardedAt: "2012-01-01",
  },
  {
    userKey: "rigan-machado",
    rankShortName: "CB8",
    awardedByKey: "carlos-gracie-jr",
    awardedAt: "2016-01-01",
  },
  {
    userKey: "bob-bass",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2017-06-01",
  },
  {
    userKey: "rick-williams",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2018-06-01",
  },
  {
    userKey: "david-meyer",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2018-09-01",
  },
  {
    userKey: "chris-haueter",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2019-03-01",
  },
  {
    userKey: "john-will",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2019-09-01",
  },
  {
    userKey: "bill-hosken",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2020-06-01",
  },
  {
    userKey: "jerry-smith",
    rankShortName: "CB7",
    awardedByKey: "rigan-machado",
    awardedAt: "2021-06-01",
  },
  {
    userKey: "brian-truelson",
    rankShortName: "BK1",
    awardedByKey: "bill-hosken",
    awardedAt: "2008-01-01",
  },
  // OWNER (Brian Scott) → BK1. Spec assumed this was already seeded, but on
  // local dev the owner had no BJJ RankAward, leaving his card blank. Seed it
  // (awardedBy Bob Bass, matching the INSTRUCTOR_STUDENT edge) so the selected
  // rank resolves. SESSION_0316 deviation, documented in the report.
  { userKey: "OWNER", rankShortName: "BK1", awardedByKey: "bob-bass", awardedAt: "2005-01-01" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Counts = {
  usersCreated: number
  usersFound: number
  nodesCreated: number
  nodesFound: number
  edgesCreated: number
  edgesFound: number
  treeMembersUpdated: number
  rankAwardsCreated: number
  rankAwardsFound: number
}

async function ensureUser(
  pu: PlaceholderUser,
  counts: Counts,
): Promise<{ id: string; created: boolean }> {
  const existing = await db.user.findFirst({
    where: { email: pu.email },
    select: { id: true, isPlaceholder: true },
  })
  if (existing) {
    if (!existing.isPlaceholder) {
      await db.user.update({
        where: { id: existing.id },
        data: { isPlaceholder: true },
      })
    }
    counts.usersFound++
    console.log(`   User ${pu.key}: already exists (id=${existing.id})`)
    return { id: existing.id, created: false }
  }
  const created = await db.user.create({
    data: {
      name: pu.name,
      email: pu.email,
      emailVerified: false,
      image: pu.image ?? null,
      role: "user",
      isPlaceholder: true,
    },
    select: { id: true },
  })
  counts.usersCreated++
  console.log(`   ✅ Created User: ${pu.key} (id=${created.id})`)
  return { id: created.id, created: true }
}

async function ensureLineageNode(
  userId: string,
  seed: LineageNodeSeed,
  counts: Counts,
): Promise<{ id: string; created: boolean }> {
  const existing = await db.lineageNode.findFirst({
    where: { userId },
    select: { id: true, isVerified: true, verificationStatus: true },
  })
  if (existing) {
    // SESSION_0316: flip existing nodes to verified on re-run.
    if (!existing.isVerified || existing.verificationStatus !== "VERIFIED") {
      await db.lineageNode.update({
        where: { id: existing.id },
        data: { isVerified: true, verificationStatus: "VERIFIED" },
      })
      console.log(`   LineageNode ${seed.userKey}: exists, flipped to VERIFIED`)
    }
    counts.nodesFound++
    console.log(`   LineageNode ${seed.userKey}: already exists (id=${existing.id})`)
    return { id: existing.id, created: false }
  }
  const created = await db.lineageNode.create({
    data: {
      userId,
      slug: seed.slug,
      bio: seed.bio,
      visibility: "PUBLIC",
      isVerified: true,
      verificationStatus: "VERIFIED",
    },
    select: { id: true },
  })
  counts.nodesCreated++
  console.log(`   ✅ Created LineageNode: ${seed.userKey} (id=${created.id})`)
  return { id: created.id, created: true }
}

async function ensureLineageRelationship(
  fromNodeId: string,
  toNodeId: string,
  description: string,
  _isVerified: boolean,
  counts: Counts,
): Promise<void> {
  // SESSION_0316: all seeded relationships are verified facts. Override the
  // per-edge isVerified flag and force VERIFIED status on create + update.
  const existing = await db.lineageRelationship.findFirst({
    where: {
      fromNodeId,
      toNodeId,
      type: "INSTRUCTOR_STUDENT",
    },
    select: { id: true },
  })
  if (existing) {
    await db.lineageRelationship.update({
      where: { id: existing.id },
      data: { isVerified: true, verificationStatus: "VERIFIED", description },
    })
    counts.edgesFound++
    console.log(`   Edge ${fromNodeId.slice(0, 6)} → ${toNodeId.slice(0, 6)}: exists, updated`)
    return
  }
  await db.lineageRelationship.create({
    data: {
      fromNodeId,
      toNodeId,
      type: "INSTRUCTOR_STUDENT",
      description,
      isVerified: true,
      verificationStatus: "VERIFIED",
    },
  })
  counts.edgesCreated++
  console.log(`   ✅ Created Edge ${fromNodeId.slice(0, 6)} → ${toNodeId.slice(0, 6)}`)
}

/**
 * Upsert a BJJ RankAward (global promotion fact). Looks up the BJJ rank by
 * shortName, then findFirst on (userId, rankId) — the @@unique key — and
 * creates or refreshes. Returns the RankAward id so the tree member can point
 * its selectedRankAward at it. FS-0006: never createMany on a nullable-unique.
 */
async function ensureRankAward(
  userId: string,
  rankShortName: string,
  awardedById: string | null,
  awardedAt: string,
  counts: Counts,
): Promise<string | null> {
  const rank = await db.rank.findFirst({
    where: {
      shortName: rankShortName,
      rankSystem: { discipline: { code: "bjj" } },
    },
    select: { id: true },
  })
  if (!rank) {
    console.log(`   ⚠️  BJJ rank not found: shortName=${rankShortName} — skipping RankAward`)
    return null
  }

  const existing = await db.rankAward.findFirst({
    where: { userId, rankId: rank.id },
    select: { id: true },
  })
  if (existing) {
    await db.rankAward.update({
      where: { id: existing.id },
      data: {
        awardedById: awardedById ?? undefined,
        awardedAt: new Date(awardedAt),
        notes: RANK_AWARD_NOTE,
      },
    })
    counts.rankAwardsFound++
    console.log(`   RankAward ${rankShortName} for ${userId.slice(0, 6)}: exists, refreshed`)
    return existing.id
  }
  const created = await db.rankAward.create({
    data: {
      userId,
      rankId: rank.id,
      awardedById: awardedById ?? undefined,
      awardedAt: new Date(awardedAt),
      notes: RANK_AWARD_NOTE,
    },
    select: { id: true },
  })
  counts.rankAwardsCreated++
  console.log(
    `   ✅ Created RankAward ${rankShortName} for ${userId.slice(0, 6)} (id=${created.id})`,
  )
  return created.id
}

// The 7 "Dirty Dozen" cohort members assigned to the visual group.
const DIRTY_DOZEN_KEYS = [
  "bob-bass",
  "rick-williams",
  "david-meyer",
  "chris-haueter",
  "john-will",
  "bill-hosken",
  "jerry-smith",
] as const

const DIRTY_DOZEN_LABEL = "The Dirty Dozen — Rigan's First Black Belts (1992–96)"

/**
 * Ensure the Dirty Dozen cohort LineageVisualGroup on the rigan tree and
 * assign the 7 cohort members to it. Idempotent: findFirst by the
 * @@unique [treeId, parentMemberId, groupType, promotionDate].
 */
async function ensureDirtyDozenGroup(
  treeId: string,
  treeMemberIdByKey: Map<string, string>,
): Promise<void> {
  const riganMemberId = treeMemberIdByKey.get("rigan-machado")
  if (!riganMemberId) {
    console.log("   ⚠️  Rigan tree member not found — skipping Dirty Dozen visual group")
    return
  }

  const promotionDate = new Date("1994-01-01")
  const groupType = "PROMOTION_DATE" as const

  let group = await db.lineageVisualGroup.findFirst({
    where: {
      treeId,
      parentMemberId: riganMemberId,
      groupType,
      promotionDate,
    },
    select: { id: true },
  })
  if (group) {
    await db.lineageVisualGroup.update({
      where: { id: group.id },
      data: {
        label: DIRTY_DOZEN_LABEL,
        showPublicLabel: true,
        sortOrder: 0,
      },
    })
    console.log(`   LineageVisualGroup Dirty Dozen: exists (id=${group.id}), refreshed`)
  } else {
    group = await db.lineageVisualGroup.create({
      data: {
        treeId,
        parentMemberId: riganMemberId,
        label: DIRTY_DOZEN_LABEL,
        groupType,
        promotionDate,
        showPublicLabel: true,
        sortOrder: 0,
      },
      select: { id: true },
    })
    console.log(`   ✅ Created LineageVisualGroup Dirty Dozen (id=${group.id})`)
  }

  let assigned = 0
  for (const key of DIRTY_DOZEN_KEYS) {
    const memberId = treeMemberIdByKey.get(key)
    if (!memberId) {
      console.log(`   ⚠️  Dozen member ${key} not found — skipping group assignment`)
      continue
    }
    await db.lineageTreeMember.update({
      where: { id: memberId },
      data: { visualGroupId: group.id },
    })
    assigned++
  }
  console.log(`   LineageVisualGroup Dirty Dozen: assigned ${assigned} members`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 seed-baseline-lineage.ts — Brian's lineage graph\n")

  const counts: Counts = {
    usersCreated: 0,
    usersFound: 0,
    nodesCreated: 0,
    nodesFound: 0,
    edgesCreated: 0,
    edgesFound: 0,
    treeMembersUpdated: 0,
    rankAwardsCreated: 0,
    rankAwardsFound: 0,
  }

  // ---------------------------------------------------------------------
  // 0. Resolve the owner user (Brian Scott). SESSION_0316 hardening:
  //    Prefer production OWNER_ID; else a User named exactly "Brian Scott";
  //    else the owner of the Baseline Martial Arts org (by name/slug);
  //    else the current arbitrary Baseline-brand org owner fallback.
  // ---------------------------------------------------------------------
  let owner = await db.user.findUnique({
    where: { id: OWNER_ID },
    select: { id: true, email: true, name: true },
  })
  if (owner) {
    console.log(`   Resolved owner via OWNER_ID: ${owner.email}`)
  }

  if (!owner) {
    owner = await db.user.findFirst({
      where: { name: "Brian Scott" },
      select: { id: true, email: true, name: true },
    })
    if (owner) {
      console.log(`   Resolved owner via name="Brian Scott": ${owner.email}`)
    }
  }

  if (!owner) {
    // Owner of the Baseline Martial Arts org, matched by name ILIKE or slug.
    const baselineMaOrg = await db.organization.findFirst({
      where: {
        ownerId: { not: null },
        OR: [
          { name: { equals: "Baseline Martial Arts", mode: "insensitive" } },
          { slug: "baseline-martial-arts" },
        ],
      },
      select: { ownerId: true, slug: true },
    })
    if (baselineMaOrg?.ownerId) {
      owner = await db.user.findUnique({
        where: { id: baselineMaOrg.ownerId },
        select: { id: true, email: true, name: true },
      })
      if (owner) {
        console.log(
          `   Resolved owner via Baseline Martial Arts org owner: ${owner.email} (org=${baselineMaOrg.slug})`,
        )
      }
    }
  }

  if (!owner) {
    // Last resort: any Baseline-brand org owner (legacy arbitrary fallback).
    const baselineOrg = await db.organization.findFirst({
      where: { brand: BRAND, ownerId: { not: null } },
      select: { ownerId: true, slug: true },
    })
    if (baselineOrg?.ownerId) {
      owner = await db.user.findUnique({
        where: { id: baselineOrg.ownerId },
        select: { id: true, email: true, name: true },
      })
      if (owner) {
        console.log(
          `   ⚠️  Falling back to arbitrary Baseline-brand org owner: ${owner.email} (org=${baselineOrg.slug})`,
        )
      }
    }
  }
  if (!owner) {
    throw new Error(
      `No owner user found: tried OWNER_ID=${OWNER_ID}, name="Brian Scott", Baseline Martial Arts org owner, and Baseline-brand org owner. Run seed-baseline-owner.ts (production) or seed.ts (local) first.`,
    )
  }

  // If the resolved owner carries a fixture name (e.g. the local
  // `test-entitlement-*` integration owner), correct it to "Brian Scott" so
  // the lineage tree card reads correctly. Idempotent.
  if (owner.name !== "Brian Scott" && (owner.name?.includes("test-entitlement") || !owner.name)) {
    await db.user.update({
      where: { id: owner.id },
      data: { name: "Brian Scott" },
    })
    console.log(`   ✏️  Corrected owner name "${owner.name}" → "Brian Scott" (id=${owner.id})`)
    owner = { ...owner, name: "Brian Scott" }
  }
  console.log(`   Found owner: ${owner.email} (name=${owner.name}, id=${owner.id})`)

  // ---------------------------------------------------------------------
  // 1. Brian's own LineageNode.
  // ---------------------------------------------------------------------
  const brianNode = await ensureLineageNode(
    owner.id,
    {
      userKey: "OWNER",
      slug: "brian-scott",
      bio: "Head Instructor — Baseline Martial Arts. BJJ Black Belt under Bob Bass (Rigan Machado lineage), Eskrima 5th Degree Master under GM Steve Wolk, Muay Thai Kru under Sak Va Roon, Karate 4th Degree under Mr. Tim Wolchek, Kajukenbo 1st Degree under Mills/Carter/Ng.",
    },
    counts,
  )

  // ---------------------------------------------------------------------
  // 2. Placeholder users + their LineageNodes.
  // ---------------------------------------------------------------------
  const userIdByKey = new Map<string, string>()
  userIdByKey.set("OWNER", owner.id)

  for (const pu of PLACEHOLDER_USERS) {
    const u = await ensureUser(pu, counts)
    userIdByKey.set(pu.key, u.id)
  }

  const nodeIdByKey = new Map<string, string>()
  nodeIdByKey.set("OWNER", brianNode.id)

  for (const ns of NODE_SEEDS) {
    const userId = userIdByKey.get(ns.userKey)
    if (!userId) {
      throw new Error(`No User for node seed key=${ns.userKey}`)
    }
    const n = await ensureLineageNode(userId, ns, counts)
    nodeIdByKey.set(ns.userKey, n.id)
  }

  // ---------------------------------------------------------------------
  // 3. INSTRUCTOR_STUDENT relationships.
  // ---------------------------------------------------------------------
  for (const e of EDGE_SEEDS) {
    const fromNodeId = nodeIdByKey.get(e.fromKey)
    const toNodeId = nodeIdByKey.get(e.toKey)
    if (!fromNodeId || !toNodeId) {
      throw new Error(
        `Missing LineageNode for edge ${e.fromKey} → ${e.toKey} (from=${fromNodeId}, to=${toNodeId})`,
      )
    }
    await ensureLineageRelationship(fromNodeId, toNodeId, e.description, e.isVerified, counts)
  }

  // ---------------------------------------------------------------------
  // 3b. RankAwards (SESSION_0316). Global promotion facts — one per BJJ
  //     figure, linking the awarding promoter. Keyed by recipient userId so
  //     the rigan tree can point each member's selectedRankAward at it.
  // ---------------------------------------------------------------------
  const rankAwardIdByUserId = new Map<string, string>()
  for (const ra of BJJ_RANK_AWARD_SEEDS) {
    const userId = userIdByKey.get(ra.userKey)
    if (!userId) {
      console.log(`   ⚠️  No User for RankAward seed key=${ra.userKey} — skipping`)
      continue
    }
    const awardedById = ra.awardedByKey ? (userIdByKey.get(ra.awardedByKey) ?? null) : null
    if (ra.awardedByKey && !awardedById) {
      console.log(`   ⚠️  Awarding promoter ${ra.awardedByKey} not found for ${ra.userKey}`)
    }
    const awardId = await ensureRankAward(
      userId,
      ra.rankShortName,
      awardedById,
      ra.awardedAt,
      counts,
    )
    if (awardId) {
      rankAwardIdByUserId.set(userId, awardId)
    }
  }

  // ---------------------------------------------------------------------
  // 4. Per-discipline LineageTree + LineageTreeMember rows.
  //    Each tree is published + public so /lineage renders them.
  // ---------------------------------------------------------------------

  type SelectedRankAwardSeed = {
    disciplineCode: string
    rankShortName: string
  }

  type TreeSeed = {
    slug: string
    name: string
    disciplineCode: string
    /** Node keys to include as members (order = visualSortOrder). */
    memberKeys: string[]
    /** Visual parent mapping: childKey → parentKey. */
    parentMap: Record<string, string>
    /** Per-tree selected rank award mapping: member key → rank lookup. */
    selectedRankAwards?: Record<string, SelectedRankAwardSeed>
    /** Per-member claimable override: member key → isClaimable. */
    isClaimable?: Record<string, boolean>
  }

  const TREE_SEEDS: TreeSeed[] = [
    {
      slug: "rigan-machado-bjj-lineage",
      name: "Rigan Machado BJJ Lineage",
      disciplineCode: "bjj",
      memberKeys: [
        "carlos-gracie-sr",
        "carlos-gracie-jr",
        "rigan-machado",
        "bob-bass",
        "rick-williams",
        "david-meyer",
        "chris-haueter",
        "john-will",
        "bill-hosken",
        "jerry-smith",
        "brian-truelson",
        "OWNER",
      ],
      parentMap: {
        "carlos-gracie-jr": "carlos-gracie-sr",
        "rigan-machado": "carlos-gracie-jr",
        "bob-bass": "rigan-machado",
        "rick-williams": "rigan-machado",
        "david-meyer": "rigan-machado",
        "chris-haueter": "rigan-machado",
        "john-will": "rigan-machado",
        "bill-hosken": "rigan-machado",
        "jerry-smith": "rigan-machado",
        "brian-truelson": "bill-hosken",
        OWNER: "bob-bass",
      },
      selectedRankAwards: {
        "carlos-gracie-sr": { disciplineCode: "bjj", rankShortName: "R10" },
        "carlos-gracie-jr": { disciplineCode: "bjj", rankShortName: "R9" },
        "rigan-machado": { disciplineCode: "bjj", rankShortName: "CB8" },
        "bob-bass": { disciplineCode: "bjj", rankShortName: "CB7" },
        "rick-williams": { disciplineCode: "bjj", rankShortName: "CB7" },
        "david-meyer": { disciplineCode: "bjj", rankShortName: "CB7" },
        "chris-haueter": { disciplineCode: "bjj", rankShortName: "CB7" },
        "john-will": { disciplineCode: "bjj", rankShortName: "CB7" },
        "bill-hosken": { disciplineCode: "bjj", rankShortName: "CB7" },
        "jerry-smith": { disciplineCode: "bjj", rankShortName: "CB7" },
        "brian-truelson": { disciplineCode: "bjj", rankShortName: "BK1" },
        OWNER: { disciplineCode: "bjj", rankShortName: "BK1" },
      },
      // SESSION_0316: Carlos Sr & Jr are historical roots — not claimable.
      // Everyone else (Rigan, the Dozen, Truelson, OWNER) is claimable.
      isClaimable: {
        "carlos-gracie-sr": false,
        "carlos-gracie-jr": false,
        "rigan-machado": true,
        "bob-bass": true,
        "rick-williams": true,
        "david-meyer": true,
        "chris-haueter": true,
        "john-will": true,
        "bill-hosken": true,
        "jerry-smith": true,
        "brian-truelson": true,
        OWNER: true,
      },
    },
    {
      slug: "doce-pares-eskrima-lineage",
      name: "Doce Pares Eskrima Lineage",
      disciplineCode: "eskrima",
      memberKeys: ["steve-wolk", "OWNER"],
      parentMap: { OWNER: "steve-wolk" },
    },
    {
      slug: "muay-thai-lineage",
      name: "Muay Thai Lineage",
      disciplineCode: "muay-thai",
      memberKeys: ["sak-va-roon", "OWNER"],
      parentMap: { OWNER: "sak-va-roon" },
    },
    {
      slug: "kajukenbo-lineage",
      name: "Kajukenbo Lineage",
      disciplineCode: "kajukenbo",
      memberKeys: ["tim-mills", "sam-carter", "hanyann-ng", "OWNER"],
      parentMap: { OWNER: "tim-mills" }, // primary visual parent
    },
    {
      slug: "karate-lineage",
      name: "American Freestyle Karate Lineage",
      disciplineCode: "karate",
      memberKeys: ["tim-wolchek", "OWNER"],
      parentMap: { OWNER: "tim-wolchek" },
    },
  ]

  let treesCreated = 0
  let treesFound = 0
  let treeMembersCreated = 0
  let treeMembersFound = 0

  for (const ts of TREE_SEEDS) {
    // Resolve discipline
    const disc = await db.discipline.findFirst({
      where: { code: ts.disciplineCode },
      select: { id: true },
    })
    if (!disc) {
      console.log(`   ⚠️  Discipline ${ts.disciplineCode} not found — skipping tree ${ts.slug}`)
      continue
    }

    // Upsert tree
    let tree = await db.lineageTree.findUnique({
      where: { brand_slug: { brand: BRAND, slug: ts.slug } },
      select: { id: true },
    })
    if (tree) {
      treesFound++
      console.log(`   LineageTree ${ts.slug}: already exists (id=${tree.id})`)
    } else {
      tree = await db.lineageTree.create({
        data: {
          brand: BRAND,
          slug: ts.slug,
          name: ts.name,
          description: `${ts.name} — promotion lineage tree.`,
          visibility: "PUBLIC",
          isPublished: true,
          disciplineId: disc.id,
        },
        select: { id: true },
      })
      treesCreated++
      console.log(`   ✅ Created LineageTree: ${ts.slug} (id=${tree.id})`)
    }

    // Create LineageTreeMember rows with visual parent chain
    const treeMemberIdByKey = new Map<string, string>()

    for (let i = 0; i < ts.memberKeys.length; i++) {
      const key = ts.memberKeys[i]
      const nodeId = nodeIdByKey.get(key)
      if (!nodeId) {
        console.log(`   ⚠️  No LineageNode for key=${key} — skipping tree member`)
        continue
      }

      // SESSION_0316: look the selected RankAward up by the MEMBER's own
      // userId (was hardcoded to owner.id, which only worked for OWNER).
      const memberUserId = userIdByKey.get(key)
      const selectedRankSeed = ts.selectedRankAwards?.[key]
      const selectedRankAward =
        selectedRankSeed && memberUserId
          ? await db.rankAward.findFirst({
              where: {
                userId: memberUserId,
                rank: {
                  shortName: selectedRankSeed.rankShortName,
                  rankSystem: { discipline: { code: selectedRankSeed.disciplineCode } },
                },
              },
              select: { id: true },
            })
          : null

      if (selectedRankSeed && !selectedRankAward) {
        console.log(
          `   ⚠️  RankAward not found for tree=${ts.slug} key=${key} discipline=${selectedRankSeed.disciplineCode} rank=${selectedRankSeed.rankShortName}`,
        )
      }

      const isClaimable = ts.isClaimable?.[key]

      let member = await db.lineageTreeMember.findUnique({
        where: { treeId_nodeId: { treeId: tree.id, nodeId } },
        select: { id: true, rankAwardId: true, isClaimable: true },
      })
      if (member) {
        const updateData: { rankAwardId?: string; isClaimable?: boolean } = {}
        if (selectedRankAward && member.rankAwardId !== selectedRankAward.id) {
          updateData.rankAwardId = selectedRankAward.id
        }
        if (isClaimable !== undefined && member.isClaimable !== isClaimable) {
          updateData.isClaimable = isClaimable
        }
        if (Object.keys(updateData).length > 0) {
          member = await db.lineageTreeMember.update({
            where: { id: member.id },
            data: updateData,
            select: { id: true, rankAwardId: true, isClaimable: true },
          })
          counts.treeMembersUpdated++
          console.log(
            `   LineageTreeMember ${ts.slug}/${key}: exists, updated (${Object.keys(updateData).join(", ")})`,
          )
        }
        treeMembersFound++
        treeMemberIdByKey.set(key, member.id)
        continue
      }

      // Resolve visual parent (only if parent already created in this loop)
      const parentKey = ts.parentMap[key]
      const parentMemberId = parentKey ? (treeMemberIdByKey.get(parentKey) ?? null) : null

      member = await db.lineageTreeMember.create({
        data: {
          treeId: tree.id,
          nodeId,
          visualSortOrder: i,
          primaryVisualParentMemberId: parentMemberId,
          rankAwardId: selectedRankAward?.id ?? null,
          ...(isClaimable !== undefined ? { isClaimable } : {}),
        },
        select: { id: true, rankAwardId: true, isClaimable: true },
      })
      treeMemberIdByKey.set(key, member.id)
      treeMembersCreated++
    }

    // -------------------------------------------------------------------
    // 4b. Dirty Dozen cohort visual group (rigan tree only). SESSION_0316.
    // -------------------------------------------------------------------
    if (ts.slug === "rigan-machado-bjj-lineage") {
      await ensureDirtyDozenGroup(tree.id, treeMemberIdByKey)
    }
  }

  // ---------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------
  console.log("\n📊 seed-baseline-lineage summary:")
  console.log(`   Users:          created=${counts.usersCreated}, found=${counts.usersFound}`)
  console.log(`   LineageNodes:   created=${counts.nodesCreated}, found=${counts.nodesFound}`)
  console.log(`   Relationships:  created=${counts.edgesCreated}, found=${counts.edgesFound}`)
  console.log(
    `   RankAwards:     created=${counts.rankAwardsCreated}, found=${counts.rankAwardsFound}`,
  )
  console.log(`   LineageTrees:   created=${treesCreated}, found=${treesFound}`)
  console.log(
    `   TreeMembers:    created=${treeMembersCreated}, found=${treeMembersFound}, updated=${counts.treeMembersUpdated}`,
  )
  console.log("\n🎉 seed-baseline-lineage.ts complete.\n")
}

main()
  .catch(error => {
    console.error("❌ Error in seed-baseline-lineage:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
