/**
 * SESSION_0522 — wire the founders' existing images (scrollytelling heroImageUrl) to their
 * passport.avatarUrl. The images already exist; this just points the avatar at them.
 *   DRY: bun --env-file=.env.prod scripts/session-0522-founder-avatars.ts
 *   APPLY: ... --apply
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"
const APPLY = process.argv.includes("--apply")
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})
for (const name of ["Carlos Gracie Sr", "Carlos Gracie Jr", "Rigan Machado"]) {
  const p = await db.passport.findFirst({
    where: { displayName: name },
    select: { id: true, avatarUrl: true, storyScene: { select: { heroImageUrl: true } } },
  })
  if (!p) {
    console.log(`  ${name}: no passport`)
    continue
  }
  const hero = p.storyScene?.heroImageUrl ?? null
  console.log(
    `  ${name}: current avatar=${p.avatarUrl ?? "—"} | storyScene.heroImageUrl=${hero ?? "NONE"}`,
  )
  if (!hero) {
    console.log(`     → no scene hero image; leaving as-is`)
    continue
  }
  if (p.avatarUrl === hero) {
    console.log(`     → already set ✓`)
    continue
  }
  console.log(`     → set avatarUrl → ${hero} ${APPLY ? "(APPLY)" : "(dry)"}`)
  if (APPLY) await db.passport.update({ where: { id: p.id }, data: { avatarUrl: hero } })
}
await db.$disconnect()
