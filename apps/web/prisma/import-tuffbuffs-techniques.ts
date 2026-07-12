import { readFileSync } from "node:fs"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, OrganizationType, PrismaClient } from "~/.generated/prisma/client"

/**
 * import-tuffbuffs-techniques.ts
 *
 * SESSION_0396 — pulls the real TuffBuffs technique dataset from the monorepo
 * (scripts/utilities/seed-data/tuffbuffs-techniques.json, 554 techniques) into the local
 * Technique model so the Tool→Listing parity pages (/techniques + /techniques/categories/[slug])
 * render against real data.
 *
 * - Brand: BASELINE_MARTIAL_ARTS (localhost default host) so it shows at localhost:3000.
 * - Ensures a Discipline per `meta.style` and one owning Organization.
 * - Builds shared Category rows from `meta.category` and Tag rows from `meta.tags`, linked m2m.
 * - Idempotent: upsert on [brand, organizationId, slug]; connectOrCreate for taxonomy.
 *
 * Usage: bun run apps/web/prisma/import-tuffbuffs-techniques.ts
 */

const SOURCE =
  "/Users/brianscott/dev/ronin-dojo-monorepo/scripts/utilities/seed-data/tuffbuffs-techniques.json"
const BRAND = Brand.BASELINE_MARTIAL_ARTS

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

type RawTechnique = {
  title: string
  content?: string
  excerpt?: string
  meta?: {
    style?: string
    styleSlug?: string
    beltLevel?: string
    category?: string
    tags?: string[]
    accessLevel?: string
  }
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const humanize = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

async function main() {
  const raw = JSON.parse(readFileSync(SOURCE, "utf8")) as RawTechnique[]
  console.log(`[source] ${raw.length} techniques from monorepo`)

  // 1. Owning organization (brand-scoped).
  const orgSlug = "tuffbuffs-academy"
  const org = await db.organization.upsert({
    where: { id: `seed-org-${orgSlug}` },
    update: {},
    create: {
      id: `seed-org-${orgSlug}`,
      brand: BRAND,
      name: "TuffBuffs Academy",
      slug: orgSlug,
      type: OrganizationType.DOJO,
      description: "Imported curriculum source for the technique library.",
    },
  })
  console.log(`[org] ${org.name} (${org.id})`)

  // 2. Disciplines per style.
  const styles = [...new Set(raw.map(t => t.meta?.style).filter(Boolean) as string[])]
  const disciplineByStyle = new Map<string, string>()
  for (const style of styles) {
    const discipline = await db.discipline.upsert({
      where: { name_brand: { name: style, brand: BRAND } },
      update: {},
      create: { name: style, slug: slugify(style), brand: BRAND },
    })
    disciplineByStyle.set(style, discipline.id)
  }
  console.log(`[disciplines] ${styles.join(", ")}`)

  // 3. Techniques + taxonomy.
  const usedSlugs = new Set<string>()
  let created = 0
  let skipped = 0
  const categoryCounts = new Map<string, number>()

  for (const t of raw) {
    const style = t.meta?.style
    if (!style) continue
    const disciplineId = disciplineByStyle.get(style)
    if (!disciplineId) continue

    let slug = slugify(t.title) || "technique"
    let n = 2
    while (usedSlugs.has(slug)) slug = `${slugify(t.title)}-${n++}`
    usedSlugs.add(slug)

    const categoryName = t.meta?.category?.trim()
    const tagNames = (t.meta?.tags ?? []).map(x => x.trim()).filter(Boolean)
    if (categoryName) categoryCounts.set(categoryName, (categoryCounts.get(categoryName) ?? 0) + 1)

    const categoryConnect = categoryName
      ? {
          connectOrCreate: {
            where: { slug: slugify(categoryName) },
            create: {
              name: humanize(categoryName),
              slug: slugify(categoryName),
              description: `${humanize(categoryName)} techniques across the library.`,
            },
          },
        }
      : undefined

    const tagConnect =
      tagNames.length > 0
        ? {
            connectOrCreate: tagNames.map(name => ({
              where: { slug: slugify(name) },
              create: { name: humanize(name), slug: slugify(name) },
            })),
          }
        : undefined

    // Canonical (author-null) library technique. The composite @@unique was replaced by a partial
    // unique index (ADR 0046) that Prisma can't target as a WhereUniqueInput → findFirst.
    const existing = await db.technique.findFirst({
      where: { brand: BRAND, organizationId: org.id, slug, authorPassportId: null },
      select: { id: true },
    })

    if (existing) {
      skipped++
      continue
    }

    await db.technique.create({
      data: {
        brand: BRAND,
        name: t.title,
        slug,
        description: t.excerpt || null,
        isPublished: true,
        disciplineId,
        organizationId: org.id,
        ...(categoryConnect ? { categories: categoryConnect } : {}),
        ...(tagConnect ? { tags: tagConnect } : {}),
      },
    })
    created++
  }

  console.log(`[techniques] created ${created}, skipped(existing) ${skipped}`)
  const topCats = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
  console.log("[categories] top:", topCats.map(([c, n]) => `${slugify(c)}(${n})`).join(", "))
  console.log(
    `[done] visit e.g. http://localhost:3000/techniques and http://localhost:3000/techniques/categories/${topCats[0] ? slugify(topCats[0][0]) : "escapes"}`,
  )
  await db.$disconnect()
}

main().catch(async error => {
  console.error(error)
  await db.$disconnect()
  process.exit(1)
})
