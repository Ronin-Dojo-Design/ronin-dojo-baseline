/**
 * SESSION_0522 — READ-ONLY live-prod re-grounding (prodsnap was stale).
 * Run: bun --env-file=.env.prod scripts/session-0522-belt-forensics.ts
 * Strictly SELECTs. No writes.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL missing — run with --env-file=.env.prod")
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const LEAD_IDS = [
  "lhbowcpm8qu5bqgauegfgtwa",
  "paqg442cisod9ttb3ml3whis",
  "l55qn7k0h2xzvj1v23x0thip",
  "e0zjml4m1urpysm4qm8ki94b",
]
const TREE_SLUG = "rigan-machado-lineage"

const meta = (m: unknown) => (m && typeof m === "object" ? (m as Record<string, unknown>) : {})

async function main() {
  console.log("=== (1) THE 4 LEADS (operator: ranks are here) ===")
  for (const id of LEAD_IDS) {
    const lead = await db.lead.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, email: true, status: true, meta: true },
    })
    if (!lead) {
      console.log(`  ${id}: NOT FOUND`)
      continue
    }
    const m = meta(lead.meta)
    console.log(
      `  ${lead.firstName ?? ""} ${lead.lastName ?? ""} <${lead.email}> [${id}]\n` +
        `      source=${m.source} status=${lead.status}\n` +
        `      currentRank=${JSON.stringify(m.currentRank)} currentRankId=${JSON.stringify(m.currentRankId)}\n` +
        `      placedMemberId=${JSON.stringify(m.placedMemberId)} trainedUnderNodeId=${JSON.stringify(m.trainedUnderNodeId)}`,
    )
    // resolve the rank name if an id is present
    if (typeof m.currentRankId === "string" && m.currentRankId) {
      const rank = await db.rank.findUnique({
        where: { id: m.currentRankId },
        select: { name: true, shortName: true },
      })
      console.log(
        `      → currentRankId resolves to: ${rank?.name ?? "UNRESOLVED"} (${rank?.shortName ?? "?"})`,
      )
    }
  }

  console.log("\n=== (2) CANONICAL TREE RANK STATE ===")
  const tree = await db.lineageTree.findFirst({
    where: { slug: TREE_SLUG },
    select: { id: true, brand: true, isPublished: true },
  })
  if (!tree) {
    console.log("  tree not found")
    return
  }
  const members = await db.lineageTreeMember.findMany({
    where: { treeId: tree.id },
    select: {
      id: true,
      nodeId: true,
      node: {
        select: {
          passportId: true,
          passport: {
            select: {
              displayName: true,
              rankAwardsEarned: { select: { id: true, verificationStatus: true } },
              rankEntries: { select: { status: true } },
            },
          },
        },
      },
    },
  })
  let verified = 0,
    nonVerified = 0,
    noEntry = 0
  const noAward: { memberId: string; name: string }[] = []
  for (const mem of members) {
    const p = mem.node.passport
    const entries = p?.rankEntries ?? []
    if (entries.length === 0) noEntry++
    else if (entries.some(e => e.status === "VERIFIED")) verified++
    else nonVerified++
    if ((p?.rankAwardsEarned ?? []).length === 0)
      noAward.push({ memberId: mem.id, name: p?.displayName ?? "(no passport)" })
  }
  console.log(
    `  tree=${TREE_SLUG} brand=${tree.brand} published=${tree.isPublished} members=${members.length}`,
  )
  console.log(
    `  hasVERIFIEDentry=${verified}  hasNonVerifiedEntry=${nonVerified}  noEntry=${noEntry}`,
  )
  console.log(`  members with NO RankAward=${noAward.length}`)

  console.log("\n=== (3) BACKFILL TARGET: no-award members that HAVE a lead-rank source ===")
  // Map placedMemberId -> lead rank source (join-the-legacy leads)
  const leads = await db.lead.findMany({
    where: { meta: { path: ["source"], equals: "join-the-legacy" } },
    select: { id: true, firstName: true, lastName: true, email: true, meta: true },
  })
  const byPlacedMember = new Map<string, (typeof leads)[number]>()
  for (const l of leads) {
    const pm = meta(l.meta).placedMemberId
    if (typeof pm === "string" && pm) byPlacedMember.set(pm, l)
  }
  let sourced = 0
  for (const t of noAward) {
    const l = byPlacedMember.get(t.memberId)
    if (!l) continue
    const m = meta(l.meta)
    const hasRank = Boolean(m.currentRankId || m.currentRank)
    if (hasRank) {
      sourced++
      console.log(
        `  ${t.name} ← lead ${l.id}: currentRankId=${JSON.stringify(m.currentRankId)} currentRank=${JSON.stringify(m.currentRank)}`,
      )
    }
  }
  console.log(`  → ${sourced} no-award members are backfillable from a join-the-legacy lead rank.`)
  console.log(
    `  (join-the-legacy leads total=${leads.length}, with placedMemberId=${byPlacedMember.size})`,
  )

  console.log("\n=== (4) TRUELSON edges (is Bob still there on LIVE prod?) ===")
  const truelson = await db.lineageNode.findFirst({
    where: { slug: "brian-truelson" },
    select: { id: true, passportId: true },
  })
  if (truelson) {
    const edges = await db.lineageRelationship.findMany({
      where: { type: "INSTRUCTOR_STUDENT", toNodeId: truelson.id },
      select: {
        id: true,
        isVerified: true,
        verificationStatus: true,
        createdAt: true,
        fromNode: { select: { slug: true, passport: { select: { displayName: true } } } },
      },
      orderBy: [{ isVerified: "desc" }, { createdAt: "asc" }, { id: "asc" }],
    })
    console.log(`  Truelson node ${truelson.id} — incoming INSTRUCTOR_STUDENT edges (walk order):`)
    for (const e of edges)
      console.log(
        `    from=${e.fromNode.passport?.displayName ?? e.fromNode.slug} isVerified=${e.isVerified} status=${e.verificationStatus} id=${e.id} createdAt=${e.createdAt.toISOString()}`,
      )
    console.log(`  → walk picks: ${edges[0]?.fromNode.passport?.displayName ?? "(none)"}`)
  }
}

main()
  .then(() => db.$disconnect())
  .catch(e => {
    console.error(e)
    return db.$disconnect().then(() => process.exit(1))
  })
