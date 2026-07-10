/**
 * SESSION_0522 — belt verification backfill (operator-authorized).
 *
 *   DRY RUN (default): bun --env-file=.env.prod scripts/session-0522-belt-backfill.ts
 *   APPLY:             bun --env-file=.env.prod scripts/session-0522-belt-backfill.ts --apply
 *
 * Two parts, both scoped to the canonical BBL tree (`rigan-machado-lineage`):
 *   A. Flip every non-VERIFIED RankAward of a current tree member → VERIFIED, then re-sync its
 *      RankEntry ("everyone on the tree now is verified" — operator).
 *   B. Mint a VERIFIED RankAward + RankEntry for the no-award members whose join-the-legacy Lead
 *      carries a `currentRankId` (Jay Farrell + Tony's students), sourced via `meta.placedMemberId`.
 *
 * Reuses the canonical seams: RankAward(source=STATED) + syncRankEntryFromAward. Idempotent.
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { RankAwardSource, RankAwardVerificationStatus } from "../.generated/prisma/client"
import { PrismaClient } from "../.generated/prisma/client"

// Inlined equivalent of server/belt/rank-entry-compatibility.ts `syncRankEntryFromAward` for the
// VERIFIED case (a VERIFIED award → VERIFIED entry, per rankEntryStatusForAward). Inlined so this
// prod script imports NO app module — `.env.prod` replaces env and app modules trip env validation.
type SyncTx = { rankEntry: PrismaClient["rankEntry"] }
const syncVerifiedEntry = (
  tx: SyncTx,
  a: { rankAwardId: string; passportId: string; rankId: string },
) =>
  tx.rankEntry.upsert({
    where: { rankAwardId: a.rankAwardId },
    create: {
      rankAwardId: a.rankAwardId,
      passportId: a.passportId,
      rankId: a.rankId,
      status: "VERIFIED",
    },
    update: { passportId: a.passportId, rankId: a.rankId, status: "VERIFIED" },
  })

const APPLY = process.argv.includes("--apply")
const TREE_SLUG = "rigan-machado-lineage"
const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL missing — run with --env-file=.env.prod")
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const meta = (m: unknown) => (m && typeof m === "object" ? (m as Record<string, unknown>) : {})

async function main() {
  console.log(
    `\n### SESSION_0522 belt backfill — ${APPLY ? "APPLY (writing)" : "DRY RUN (no writes)"} ###\n`,
  )

  const tree = await db.lineageTree.findFirstOrThrow({
    where: { slug: TREE_SLUG },
    select: { id: true },
  })
  const members = await db.lineageTreeMember.findMany({
    where: { treeId: tree.id },
    select: {
      id: true,
      node: {
        select: {
          passportId: true,
          passport: {
            select: {
              displayName: true,
              rankAwardsEarned: { select: { id: true, verificationStatus: true, rankId: true } },
            },
          },
        },
      },
    },
  })

  // ---- PART A: verify current tree members' entries ----
  // UNVERIFIED award → flip award→VERIFIED (the verification act) + entry VERIFIED.
  // IMPORTED award  → KEEP award IMPORTED (provenance + belt-gate read-only); only set entry VERIFIED
  //                   (durable via the rankEntryStatusForAward IMPORTED→VERIFIED mapping change).
  console.log("== PART A: verify current tree members' entries ==")
  let flippedAwards = 0
  let importedEntries = 0
  const disputed: string[] = []
  for (const mem of members) {
    const p = mem.node.passport
    if (!p) continue
    for (const award of p.rankAwardsEarned) {
      const vs = award.verificationStatus
      if (vs === "VERIFIED") continue
      if (vs === "DISPUTED") {
        disputed.push(`${p.displayName} (${award.id})`)
        continue
      }
      const flipAward = vs === "UNVERIFIED"
      console.log(
        `  ${p.displayName}: ${vs} → entry VERIFIED${flipAward ? " + award→VERIFIED" : " (award kept IMPORTED)"}`,
      )
      if (APPLY) {
        await db.$transaction(async tx => {
          if (flipAward) {
            await tx.rankAward.update({
              where: { id: award.id },
              data: { verificationStatus: RankAwardVerificationStatus.VERIFIED },
            })
          }
          await syncVerifiedEntry(tx, {
            rankAwardId: award.id,
            passportId: mem.node.passportId,
            rankId: award.rankId,
          })
        })
      }
      if (flipAward) flippedAwards++
      else importedEntries++
    }
  }
  console.log(
    `  → ${flippedAwards} UNVERIFIED awards ${APPLY ? "flipped→VERIFIED" : "would flip"}; ${importedEntries} IMPORTED entries ${APPLY ? "verified" : "would verify"} (award kept IMPORTED).`,
  )
  if (disputed.length) console.log(`  DISPUTED (left untouched): ${disputed.join(", ")}`)
  console.log("")

  // ---- PART B: mint awards for no-award members with a lead rank ----
  console.log(
    "== PART B: mint VERIFIED award+entry for no-award members with a lead currentRankId ==",
  )
  const leads = await db.lead.findMany({
    where: { meta: { path: ["source"], equals: "join-the-legacy" } },
    select: { id: true, firstName: true, lastName: true, meta: true },
  })
  const memberById = new Map(members.map(m => [m.id, m]))
  let bMinted = 0
  const skipped: string[] = []
  for (const lead of leads) {
    const m = meta(lead.meta)
    const placedMemberId = m.placedMemberId
    const rankId = m.currentRankId
    if (typeof placedMemberId !== "string" || !placedMemberId) continue
    if (typeof rankId !== "string" || !rankId) continue
    const mem = memberById.get(placedMemberId)
    if (!mem?.node.passport) {
      skipped.push(`${lead.firstName} ${lead.lastName}: placedMember not on canonical tree`)
      continue
    }
    const passportId = mem.node.passportId
    const existing = mem.node.passport.rankAwardsEarned.find(a => a.rankId === rankId)
    if (existing) {
      skipped.push(
        `${mem.node.passport.displayName}: already has award for that rank (${existing.verificationStatus})`,
      )
      continue
    }
    const rank = await db.rank.findUnique({ where: { id: rankId }, select: { name: true } })
    console.log(`  MINT ${mem.node.passport.displayName}: ${rank?.name ?? rankId} (VERIFIED)`)
    if (APPLY) {
      await db.$transaction(async tx => {
        const award = await tx.rankAward.create({
          data: {
            passportId,
            rankId,
            source: RankAwardSource.STATED,
            verificationStatus: RankAwardVerificationStatus.VERIFIED,
          },
          select: { id: true },
        })
        await syncVerifiedEntry(tx, { rankAwardId: award.id, passportId, rankId })
      })
    }
    bMinted++
  }
  console.log(`  → ${bMinted} awards ${APPLY ? "minted" : "would mint"}.`)
  if (skipped.length) console.log(`  skipped:\n    ${skipped.join("\n    ")}`)

  console.log(
    `\n### SUMMARY: ${flippedAwards} UNVERIFIED awards flipped, ${importedEntries} IMPORTED entries verified, ${bMinted} minted — ${APPLY ? "APPLIED" : "DRY RUN, no writes"} ###`,
  )
}

main()
  .then(() => db.$disconnect())
  .catch(e => {
    console.error(e)
    return db.$disconnect().then(() => process.exit(1))
  })
