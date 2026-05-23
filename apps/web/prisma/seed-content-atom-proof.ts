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

const proofTags = [
  { name: "Dojo Ritual", slug: "dojo-ritual" },
  { name: "Beginner Training", slug: "beginner-training" },
  { name: "Martial Arts Culture", slug: "martial-arts-culture" },
]

const proofTools = [
  {
    name: "Dojo Bell",
    slug: "dojo-bell",
    websiteUrl: "https://baselinemartialarts.com/tools/dojo-bell",
    tagline: "A simple class boundary marker for presence and respect.",
    description: "A proof listing used by the ContentAtom seed to demonstrate tools mentioned.",
    faviconUrl: "/favicon.png",
  },
  {
    name: "Training Journal",
    slug: "training-journal",
    websiteUrl: "https://baselinemartialarts.com/tools/training-journal",
    tagline: "Capture class notes, repetitions, and reflections after practice.",
    description: "A proof listing used by the ContentAtom seed to demonstrate tools mentioned.",
    faviconUrl: "/favicon.png",
  },
]

const proofMedia = [
  {
    id: "media-why-bell-hero",
    type: "IMAGE" as const,
    url: "/content/boilerplate.webp",
    title: "Class opening bell",
    altText: "Martial arts class opening ritual",
    purpose: "hero",
    sortOrder: 0,
  },
  {
    id: "media-why-bell-presence",
    type: "IMAGE" as const,
    url: "/content/tool-mentions.webp",
    title: "Training floor presence",
    altText: "Training tools arranged for a focused martial arts class",
    purpose: "gallery",
    sortOrder: 1,
  },
]

async function main() {
  // Find the first admin/owner user to be the atom creator
  const owner = await prisma.user.findFirst({ where: { role: "admin" } })
  if (!owner) {
    console.error("No ADMIN user found. Run seed-baseline-owner.ts first.")
    process.exit(1)
  }

  const canonicalId = "atom-2026-why-the-bell-matters"

  const tags = await Promise.all(
    proofTags.map(tag =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: { name: tag.name },
        create: tag,
      }),
    ),
  )

  const tools = await Promise.all(
    proofTools.map(tool =>
      prisma.tool.upsert({
        where: { slug: tool.slug },
        update: {
          name: tool.name,
          websiteUrl: tool.websiteUrl,
          tagline: tool.tagline,
          description: tool.description,
          faviconUrl: tool.faviconUrl,
          status: "Published",
          publishedAt: new Date("2026-05-22T12:00:00Z"),
        },
        create: {
          ...tool,
          status: "Published",
          publishedAt: new Date("2026-05-22T12:00:00Z"),
        },
      }),
    ),
  )

  // Upsert to make this idempotent
  const atom = await prisma.contentAtom.upsert({
    where: { canonicalId },
    update: {
      tags: { set: tags.map(tag => ({ id: tag.id })) },
      tools: { set: tools.map(tool => ({ id: tool.id })) },
    },
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
      tags: { connect: tags.map(tag => ({ id: tag.id })) },
      tools: { connect: tools.map(tool => ({ id: tool.id })) },
    },
  })

  for (const media of proofMedia) {
    const mediaRow = await prisma.media.upsert({
      where: { id: media.id },
      update: {
        brand: "BASELINE_MARTIAL_ARTS",
        type: media.type,
        url: media.url,
        title: media.title,
        altText: media.altText,
        isPublic: true,
        uploadedById: owner.id,
      },
      create: {
        id: media.id,
        brand: "BASELINE_MARTIAL_ARTS",
        type: media.type,
        url: media.url,
        title: media.title,
        altText: media.altText,
        isPublic: true,
        sortOrder: media.sortOrder,
        uploadedById: owner.id,
      },
    })

    await prisma.mediaAttachment.upsert({
      where: { id: `attachment-${media.id}` },
      update: {
        purpose: media.purpose,
        sortOrder: media.sortOrder,
        mediaId: mediaRow.id,
        contentAtomId: atom.id,
      },
      create: {
        id: `attachment-${media.id}`,
        purpose: media.purpose,
        sortOrder: media.sortOrder,
        mediaId: mediaRow.id,
        contentAtomId: atom.id,
      },
    })
  }

  await prisma.contentVariant.upsert({
    where: {
      atomId_brand_channel: {
        atomId: atom.id,
        brand: "BASELINE_MARTIAL_ARTS",
        channel: "BLOG",
      },
    },
    update: {
      thumbnailUrl: proofMedia[0]?.url,
    },
    create: {
      atomId: atom.id,
      brand: "BASELINE_MARTIAL_ARTS",
      channel: "BLOG",
      status: "PUBLISHED",
      publicTitle: "Why the Bell Matters",
      publicSlug: "why-the-bell-matters",
      excerpt:
        "Every class begins and ends with the bell. Here's why that ritual matters more than any technique you'll learn.",
      thumbnailUrl: proofMedia[0]?.url,
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
