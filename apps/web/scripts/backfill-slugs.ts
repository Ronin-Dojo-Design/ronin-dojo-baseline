/**
 * Backfill null slugs on DirectoryProfile and Organization rows.
 *
 * Idempotent: only touches rows where slug is null.
 * Run: `bun scripts/backfill-slugs.ts`
 *
 * SESSION_0074_TASK_08
 */

import { PrismaClient } from "@prisma/client"
import { slugify, generateUniqueProfileSlug } from "../lib/slug"

const prisma = new PrismaClient()

async function backfillProfileSlugs() {
  const profiles = await prisma.directoryProfile.findMany({
    where: { slug: null },
    select: { id: true, displayName: true },
  })

  console.log(`[DirectoryProfile] Found ${profiles.length} rows with null slug`)

  for (const profile of profiles) {
    const slug = await generateUniqueProfileSlug(
      profile.displayName,
      async (candidate) => {
        const existing = await prisma.directoryProfile.findUnique({
          where: { slug: candidate },
          select: { id: true },
        })
        return existing !== null
      },
    )

    await prisma.directoryProfile.update({
      where: { id: profile.id },
      data: { slug },
    })

    console.log(`  ✅ ${profile.id} → ${slug}`)
  }
}

async function backfillOrgSlugs() {
  const orgs = await prisma.organization.findMany({
    where: { slug: "" },
    select: { id: true, name: true },
  })

  // Also check for null slugs if schema allows
  const nullOrgs = await prisma.organization.findMany({
    where: { slug: { equals: null as any } },
    select: { id: true, name: true },
  }).catch(() => [])

  const allOrgs = [...orgs, ...nullOrgs]
  console.log(`[Organization] Found ${allOrgs.length} rows with empty/null slug`)

  for (const org of allOrgs) {
    const base = slugify(org.name) || "org"
    let candidate = base
    let attempt = 0

    while (true) {
      const existing = await prisma.organization.findFirst({
        where: { slug: candidate, id: { not: org.id } },
        select: { id: true },
      })
      if (!existing) break
      candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`
      if (++attempt > 5) break
    }

    await prisma.organization.update({
      where: { id: org.id },
      data: { slug: candidate },
    })

    console.log(`  ✅ ${org.id} → ${candidate}`)
  }
}

async function main() {
  console.log("=== Slug backfill script (SESSION_0074_TASK_08) ===\n")

  await backfillProfileSlugs()
  console.log()
  await backfillOrgSlugs()

  console.log("\n=== Done ===")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
