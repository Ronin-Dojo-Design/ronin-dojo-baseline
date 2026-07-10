/**
 * SESSION_0522 — lock the founder roots as NOT claimable (operator).
 * Carlos Sr / Carlos Jr are already isClaimable=false; Rigan Machado was true → false.
 *   DRY: bun --env-file=.env.prod scripts/session-0522-rigan-not-claimable.ts
 *   APPLY: ... --apply
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"
const APPLY = process.argv.includes("--apply")
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})
const tree = await db.lineageTree.findFirstOrThrow({
  where: { slug: "rigan-machado-lineage" },
  select: { id: true },
})
for (const name of ["Carlos Gracie Sr", "Carlos Gracie Jr", "Rigan Machado"]) {
  const p = await db.passport.findFirst({
    where: { displayName: name },
    select: { lineageNode: { select: { id: true } } },
  })
  if (!p?.lineageNode) {
    console.log(`  ${name}: no node`)
    continue
  }
  const member = await db.lineageTreeMember.findFirst({
    where: { treeId: tree.id, nodeId: p.lineageNode.id },
    select: { id: true, isClaimable: true },
  })
  if (!member) {
    console.log(`  ${name}: not a tree member`)
    continue
  }
  if (member.isClaimable === false) {
    console.log(`  ${name}: already NOT claimable ✓`)
    continue
  }
  console.log(
    `  ${name}: isClaimable ${member.isClaimable} → false ${APPLY ? "(APPLYING)" : "(dry-run)"}`,
  )
  if (APPLY)
    await db.lineageTreeMember.update({ where: { id: member.id }, data: { isClaimable: false } })
}
await db.$disconnect()
