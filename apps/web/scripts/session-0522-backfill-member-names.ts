/**
 * SESSION_0522 — backfill blank member names from their lead (the "?" card bug: the free-signup
 * account was created with an empty name, so passport.displayName + user.name are blank while the
 * lead carries the real name). Sets passport.displayName (+ user.name when blank) from the lead.
 *   DRY: bun --env-file=.env.prod scripts/session-0522-backfill-member-names.ts
 *   APPLY: ... --apply
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"
const APPLY = process.argv.includes("--apply")
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})
const tree = await db.lineageTreeMember.findMany({
  where: { tree: { slug: "rigan-machado-lineage" } },
  select: {
    node: {
      select: {
        passport: {
          select: {
            id: true,
            displayName: true,
            userId: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    },
  },
})
let fixed = 0
for (const m of tree) {
  const p = m.node.passport
  if (!p) continue
  const blankName = !p.displayName || p.displayName.trim() === ""
  if (!blankName) continue
  const email = p.user?.email
  if (!email) {
    console.log(`  blank passport ${p.id.slice(0, 8)} — no bound user email, skip`)
    continue
  }
  const lead = await db.lead.findFirst({
    where: { email },
    select: { firstName: true, lastName: true },
  })
  const name = [lead?.firstName, lead?.lastName].filter(Boolean).join(" ").trim()
  if (!name) {
    console.log(`  ${email}: lead has no name either, skip`)
    continue
  }
  console.log(
    `  ${email}: displayName "" → "${name}"${!p.user?.name || p.user.name.trim() === "" ? " + user.name" : ""} ${APPLY ? "(APPLY)" : "(dry)"}`,
  )
  if (APPLY) {
    await db.passport.update({ where: { id: p.id }, data: { displayName: name } })
    if (p.user && (!p.user.name || p.user.name.trim() === ""))
      await db.user.update({ where: { id: p.user.id }, data: { name } })
  }
  fixed++
}
console.log(`\n${fixed} member(s) ${APPLY ? "fixed" : "would fix"}.`)
await db.$disconnect()
