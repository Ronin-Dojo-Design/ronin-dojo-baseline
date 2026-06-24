/**
 * set-bbl-default-avatars.ts
 *
 * Sets the BBL default gi avatar (media/bbl/profiles/default-black-belt.png) as the
 * `avatarUrl` for accountless placeholder Passports in a BBL lineage tree that have no
 * avatar yet. Idempotent (only fills NULL avatarUrl; never overwrites a real photo).
 * Prod stores avatars as ABSOLUTE r2.dev URLs (NEXT_PUBLIC_MEDIA_BASE_URL is empty in prod),
 * so pass --media-base with the public r2.dev base.
 *
 *   SKIP_ENV_VALIDATION=1 bun run scripts/set-bbl-default-avatars.ts \
 *     --media-base https://pub-xxxx.r2.dev [--tree-slug bbl-lineage] [--dry-run]
 */
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const treeSlug = args.includes("--tree-slug")
  ? args[args.indexOf("--tree-slug") + 1]
  : "rigan-machado-lineage"
const mediaBase = (
  args.includes("--media-base")
    ? (args[args.indexOf("--media-base") + 1] ?? "")
    : (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "")
).replace(/\/+$/, "")
const BRAND = "BBL" as const

async function main() {
  if (!mediaBase) throw new Error("--media-base <url> is required (the public r2.dev base)")
  const url = `${mediaBase}/media/bbl/profiles/default-black-belt.png`

  const tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: BRAND, slug: treeSlug } },
    select: { id: true },
  })
  if (!tree) throw new Error(`LineageTree not found: brand=${BRAND} slug=${treeSlug}`)

  const members = await db.lineageTreeMember.findMany({
    where: { treeId: tree.id },
    select: {
      node: { select: { passport: { select: { id: true, displayName: true, avatarUrl: true } } } },
    },
  })
  const targets = members
    .map(m => m.node?.passport)
    .filter(
      (p): p is { id: string; displayName: string | null; avatarUrl: string | null } =>
        Boolean(p) && !p!.avatarUrl,
    )

  console.log(
    `tree "${treeSlug}": ${members.length} members; ${targets.length} placeholder Passports with NULL avatarUrl${dryRun ? " (DRY RUN)" : ""}`,
  )
  let updated = 0
  for (const p of targets) {
    if (dryRun) continue
    await db.passport.update({ where: { id: p.id }, data: { avatarUrl: url } })
    updated++
  }
  console.log(dryRun ? `Would set ${targets.length} → ${url}` : `Set ${updated} avatarUrl → ${url}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
