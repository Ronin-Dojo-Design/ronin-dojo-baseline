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
  // BJJ lineage — direct instructor + grand-instructor for depth-2 ladder.
  { key: "bob-bass", name: "Bob Bass", email: "bob-bass@placeholder.lineage" },
  { key: "rigan-machado", name: "Rigan Machado", email: "rigan-machado@placeholder.lineage" },
  // Eskrima
  { key: "steve-wolk", name: "GM Steve Wolk", email: "steve-wolk@placeholder.lineage" },
  // Muay Thai
  { key: "sak-va-roon", name: "Sak Va Roon", email: "sak-va-roon@placeholder.lineage" },
  // Kajukenbo — three co-instructors, seed one to keep MVP focused.
  { key: "tim-mills", name: "Sifu Tim Mills", email: "tim-mills@placeholder.lineage" },
  { key: "sam-carter", name: "Sifu Sam Carter", email: "sam-carter@placeholder.lineage" },
  { key: "hanyann-ng", name: "Sifu Hanyann Ng", email: "hanyann-ng@placeholder.lineage" },
  // Karate
  { key: "tim-wolchek", name: "Mr. Tim Wolchek", email: "tim-wolchek@placeholder.lineage" },
]

const NODE_SEEDS: LineageNodeSeed[] = [
  {
    userKey: "bob-bass",
    slug: "bob-bass",
    bio: "1st American Black Belt under Rigan Machado · 8th Degree Coral Belt · BJJ instructor at South Bay Jiu Jitsu, Hermosa Beach CA. Brian Scott's BJJ instructor.",
  },
  {
    userKey: "rigan-machado",
    slug: "rigan-machado",
    bio: "Machado Brothers founder · BJJ Coral Belt · trained under Carlos Gracie Jr lineage. Bob Bass's BJJ instructor.",
  },
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

// All edges go INTO Brian unless otherwise noted (Brian = toNode, instructor = fromNode).
const EDGE_SEEDS: LineageEdgeSeed[] = [
  // Depth-1 ladder — Brian's direct instructors.
  {
    fromKey: "bob-bass",
    toKey: "OWNER",
    description: "BJJ Black Belt 1st Degree under Bob Bass (Rigan Machado lineage).",
    isVerified: false,
  },
  {
    fromKey: "steve-wolk",
    toKey: "OWNER",
    description: "Eskrima 5th Degree Black Belt (Master) under GM Steve Wolk, PIMA Denver Doce Pares.",
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
  // Depth-2 ladder — Rigan Machado → Bob Bass.
  {
    fromKey: "rigan-machado",
    toKey: "bob-bass",
    description: "Bob Bass earned his BJJ Black Belt as the first American under Rigan Machado.",
    isVerified: false,
  },
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
}

async function ensureUser(
  pu: PlaceholderUser,
  counts: Counts,
): Promise<{ id: string; created: boolean }> {
  const existing = await db.user.findFirst({
    where: { email: pu.email },
    select: { id: true },
  })
  if (existing) {
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
    select: { id: true },
  })
  if (existing) {
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
      isVerified: false,
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
  isVerified: boolean,
  counts: Counts,
): Promise<void> {
  const existing = await db.lineageRelationship.findFirst({
    where: {
      fromNodeId,
      toNodeId,
      type: "INSTRUCTOR_STUDENT",
    },
    select: { id: true },
  })
  if (existing) {
    counts.edgesFound++
    console.log(`   Edge ${fromNodeId.slice(0, 6)} → ${toNodeId.slice(0, 6)}: already exists`)
    return
  }
  await db.lineageRelationship.create({
    data: {
      fromNodeId,
      toNodeId,
      type: "INSTRUCTOR_STUDENT",
      description,
      isVerified,
    },
  })
  counts.edgesCreated++
  console.log(`   ✅ Created Edge ${fromNodeId.slice(0, 6)} → ${toNodeId.slice(0, 6)}`)
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
  }

  // ---------------------------------------------------------------------
  // 0. Resolve the owner user. Prefer production OWNER_ID; fall back to
  //    the Baseline org owner on local dev where Brian's user isn't seeded.
  // ---------------------------------------------------------------------
  let owner = await db.user.findUnique({
    where: { id: OWNER_ID },
    select: { id: true, email: true, name: true },
  })
  if (!owner) {
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
          `   ⚠️  Production OWNER_ID not found; falling back to Baseline org owner: ${owner.email} (org=${baselineOrg.slug})`,
        )
      }
    }
  }
  if (!owner) {
    throw new Error(
      `No owner user found: tried OWNER_ID=${OWNER_ID} and Baseline org owner. Run seed-baseline-owner.ts (production) or seed.ts (local) first.`,
    )
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
  // Summary
  // ---------------------------------------------------------------------
  console.log("\n📊 seed-baseline-lineage summary:")
  console.log(`   Users:        created=${counts.usersCreated}, found=${counts.usersFound}`)
  console.log(`   LineageNodes: created=${counts.nodesCreated}, found=${counts.nodesFound}`)
  console.log(`   Relationships:created=${counts.edgesCreated}, found=${counts.edgesFound}`)
  console.log("\n🎉 seed-baseline-lineage.ts complete.\n")
}

main()
  .catch((error) => {
    console.error("❌ Error in seed-baseline-lineage:", error)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
