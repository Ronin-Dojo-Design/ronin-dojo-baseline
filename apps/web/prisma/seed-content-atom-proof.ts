/**
 * Seed script: proof-of-concept ContentAtom + ContentVariant(BLOG) for Baseline Martial Arts.
 *
 * Usage: npx tsx apps/web/prisma/seed-content-atom-proof.ts
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Find the first admin/owner user to be the atom creator
  const owner = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  if (!owner) {
    console.error("No ADMIN user found. Run seed-baseline-owner.ts first.")
    process.exit(1)
  }

  const canonicalId = "atom-2026-why-the-bell-matters"

  // Upsert to make this idempotent
  const atom = await prisma.contentAtom.upsert({
    where: { canonicalId },
    update: {},
    create: {
      canonicalId,
      title: "Why the Bell Matters",
      slug: "why-the-bell-matters",
      status: "PUBLISHED",
      hook: "Every class begins and ends with the bell. Here's why that ritual matters more than any technique you'll learn.",
      teachingTruth:
        "The bell is not a timer. It is a boundary marker between the outside world and the training floor. Bowing at the bell teaches presence, respect, and the discipline of transition.",
      longFormCopy: `# Why the Bell Matters

Every martial arts class begins and ends with the bell. For new students, it might seem like a quaint tradition — a leftover from another era. But the bell is one of the most important tools in a dojo.

## The Bell Is a Boundary

The bell marks a transition. When it rings at the start of class, you are no longer at work, at school, or in traffic. You are on the training floor. Your phone doesn't matter. Your inbox doesn't matter. The only thing that matters is the next technique, the next rep, the next breath.

## Presence Over Performance

The bell teaches presence. Not the Instagram kind — the real kind. The kind where you notice your feet on the mat, the rotation of your hips, the tension in your shoulders. Martial arts is a practice of awareness, and the bell is the first cue.

## Respect as Practice

Bowing at the bell is not submission. It is acknowledgment. You are acknowledging the space, the lineage, your training partners, and yourself. Respect in martial arts is not hierarchical — it is reciprocal.

## The Discipline of Transition

Most people struggle with transitions. From rest to effort. From effort to rest. From work to home. The bell trains you to transition cleanly. When it rings, you shift. No lingering, no half-commitment. This skill transfers to everything outside the dojo.

## Conclusion

The bell is not decoration. It is the first and last lesson of every class: be here, be ready, be respectful. If you can master the bell, you can master anything that follows it.`,
      siteTargets: ["BASELINE_MARTIAL_ARTS"],
      channelTargets: ["BLOG"],
      qualityScore: 8,
      sourceType: "MANUAL",
      createdById: owner.id,
    },
  })

  await prisma.contentVariant.upsert({
    where: {
      atomId_brand_channel: {
        atomId: atom.id,
        brand: "BASELINE_MARTIAL_ARTS",
        channel: "BLOG",
      },
    },
    update: {},
    create: {
      atomId: atom.id,
      brand: "BASELINE_MARTIAL_ARTS",
      channel: "BLOG",
      status: "PUBLISHED",
      publicTitle: "Why the Bell Matters",
      publicSlug: "why-the-bell-matters",
      excerpt:
        "Every class begins and ends with the bell. Here's why that ritual matters more than any technique you'll learn.",
      renderedCopy: atom.id ? undefined : undefined, // Will fall back to atom.longFormCopy in the renderer
      publishDate: new Date("2026-05-22T12:00:00Z"),
    },
  })

  console.log("✅ Seeded proof atom: why-the-bell-matters")
  console.log(`   Atom ID: ${atom.id}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
