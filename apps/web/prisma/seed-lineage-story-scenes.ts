/**
 * Seed script: Epic A (SESSION_0498 TASK_01) — founder LineageStoryScene rows for the
 * Lineage Journey prologue: Carlos Gracie Sr → Carlos Gracie Jr → Rorion Gracie →
 * Rigan Machado (sceneOrder 1–4).
 *
 * Idempotent: upserts by `passportId` (1:1 @unique). Founders are located via their
 * LineageNode slugs (displayName fallback); a missing founder is SKIPPED with a logged
 * warning — this seed NEVER creates person rows (Passport/LineageNode stay untouched).
 *
 * Quotes + attribution notes are the ratified SESSION_0498 founder-seed copy table
 * (grill fork #4 — sourced; editable via the A1 storyboard). The Rorion quote is
 * marked for source-verify in its attribution note.
 *
 * Usage: cd apps/web && bun prisma/seed-lineage-story-scenes.ts
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

const founderScenes = [
  {
    nodeSlug: "carlos-gracie-sr",
    displayName: "Carlos Gracie Sr",
    quote: "Brute physical force is worth nothing against the science of the samurais.",
    quoteAttribution: "Widely attributed (fightersmarket / sensobjj)",
    sceneOrder: 1,
  },
  {
    nodeSlug: "carlos-gracie-jr",
    displayName: "Carlos Gracie Jr",
    quote: "There is no losing in Jiu-Jitsu. You either win or you learn.",
    quoteAttribution: "His signature line (azquotes / quotefancy)",
    sceneOrder: 2,
  },
  {
    nodeSlug: "rorion-gracie",
    displayName: "Rorion Gracie",
    quote: "You have to do what you can with what you've got.",
    quoteAttribution: "Aikido Journal interview — mark for source-verify before un-flagging",
    sceneOrder: 3,
  },
  {
    nodeSlug: "rigan-machado",
    displayName: "Rigan Machado",
    quote: "Jiu-Jitsu is not about fighting; it's about solving problems.",
    quoteAttribution: "Interview-sourced (bjjee / maiahub)",
    sceneOrder: 4,
  },
]

async function main() {
  let upserted = 0
  let skipped = 0

  for (const founder of founderScenes) {
    // Locate the founder's Passport via their lineage node — slug first (the
    // canonical deep-link key), displayName as the fallback for re-slugged nodes.
    const node =
      (await prisma.lineageNode.findUnique({
        where: { slug: founder.nodeSlug },
        select: { passportId: true, passport: { select: { displayName: true } } },
      })) ??
      (await prisma.lineageNode.findFirst({
        where: { passport: { displayName: founder.displayName } },
        select: { passportId: true, passport: { select: { displayName: true } } },
      }))

    if (!node) {
      skipped++
      console.warn(
        `⚠️  SKIP ${founder.displayName}: no LineageNode found (slug "${founder.nodeSlug}" or displayName) — not creating person rows.`,
      )
      continue
    }

    const scene = await prisma.lineageStoryScene.upsert({
      where: { passportId: node.passportId },
      update: {
        quote: founder.quote,
        quoteAttribution: founder.quoteAttribution,
        sceneOrder: founder.sceneOrder,
        enabled: true,
      },
      create: {
        passportId: node.passportId,
        quote: founder.quote,
        quoteAttribution: founder.quoteAttribution,
        sceneOrder: founder.sceneOrder,
        enabled: true,
      },
    })

    upserted++
    console.log(
      `✅ Scene ${founder.sceneOrder}: ${node.passport.displayName ?? founder.displayName} (scene ${scene.id}, passport ${node.passportId})`,
    )
  }

  console.log(`Done: ${upserted} scene(s) upserted, ${skipped} skipped.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
