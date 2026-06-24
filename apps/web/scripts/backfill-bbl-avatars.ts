/**
 * backfill-bbl-avatars.ts
 *
 * Backfills real member featured-image avatars onto the BBL placeholder Passports
 * imported by `import-bbl-members-full.ts`. SESSION_0408 set every placeholder to
 * the default gi avatar; this replaces that default with each member's migrated
 * WP photo (optimized → R2 by the /tmp/bbl-export pipeline) for the 44 members who
 * have one. Members without a featured image keep the default gi.
 *
 * Match: optimized-manifest.json `name` → Passport.displayName within the BBL
 * `bbl-lineage` tree (accountless placeholders only). avatarUrl =
 *   <media-base>/media/bbl/profiles/<outKey>   (outKey = "<stem>.webp").
 * Prod stores ABSOLUTE r2.dev URLs (NEXT_PUBLIC_MEDIA_BASE_URL is empty in prod),
 * so pass --media-base with the public r2.dev base.
 *
 * Idempotent. Dry-run prints current → new per row (flags whether the current
 * avatar is the default gi, a real photo, or null) and writes NOTHING.
 *
 *   SKIP_ENV_VALIDATION=1 bun run scripts/backfill-bbl-avatars.ts \
 *     --media-base https://pub-5392c7fbb4d24312b2c57edcfec2f5eb.r2.dev \
 *     [--tree-slug bbl-lineage] [--manifest /tmp/bbl-export/optimized-manifest.json] \
 *     [--overwrite-real] [--overwrite-names "Rick Williams,..."] [--dry-run]
 *
 * By default a Passport whose current avatar is a REAL (non-default, non-null)
 * photo is left untouched (the SESSION_0407 Dirty Dozen already have curated
 * photos); pass --overwrite-real to replace ALL of those, or --overwrite-names
 * "<displayName>,..." to overwrite only specific people.
 */
import { readFileSync } from "node:fs"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../.generated/prisma/client"

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
})
const db = new PrismaClient({ adapter })

const args = process.argv.slice(2)
function flag(name: string, fallback: string | null): string | null {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const dryRun = args.includes("--dry-run")
const overwriteReal = args.includes("--overwrite-real")
// Comma-separated display names to overwrite even if they already have a real photo
// (targeted alternative to --overwrite-real, e.g. --overwrite-names "Rick Williams").
const overwriteNames = new Set(
  (flag("--overwrite-names", "") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => normName(s)),
)
const treeSlug = flag("--tree-slug", "rigan-machado-lineage")!
const manifestPath = flag("--manifest", "/tmp/bbl-export/optimized-manifest.json")!
const mediaBase = (
  flag("--media-base", process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "") ?? ""
).replace(/\/+$/, "")
const BRAND = "BBL" as const
const DEFAULT_AVATAR_KEY = "media/bbl/profiles/default-black-belt.png"

interface ManifestRow {
  name: string
  outKey: string
  ok: boolean
}

function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

type AvatarAction = "unchanged" | "skip-real" | "skip-claimed" | "default→photo" | "real→photo"

/** Pure decision: what should happen to one Passport's avatar? Extracted so the
 *  per-row branching stays simple + testable (keeps `main` cognitive load low). */
function classifyAvatarChange(o: {
  current: string | null
  next: string
  overwriteReal: boolean
  hasAccount: boolean
}): { action: AvatarAction; willWrite: boolean } {
  const isDefault = !o.current || o.current.endsWith(DEFAULT_AVATAR_KEY)
  if (o.current === o.next) {
    return { action: "unchanged", willWrite: false }
  }
  if (!isDefault && !o.overwriteReal) {
    return { action: "skip-real", willWrite: false }
  }
  if (o.hasAccount) {
    return { action: "skip-claimed", willWrite: false }
  }
  return { action: isDefault ? "default→photo" : "real→photo", willWrite: true }
}

async function main() {
  if (!mediaBase) {
    throw new Error("--media-base <url> is required (the public r2.dev base)")
  }
  const manifest: { results: ManifestRow[] } = JSON.parse(readFileSync(manifestPath, "utf8"))
  const byName = new Map<string, string>() // normName → outKey
  for (const r of manifest.results) {
    if (r.ok) {
      byName.set(normName(r.name), r.outKey)
    }
  }
  console.log(
    `Loaded ${byName.size} optimized avatars from ${manifestPath}${dryRun ? " (DRY RUN)" : ""}`,
  )

  const tree = await db.lineageTree.findUnique({
    where: { brand_slug: { brand: BRAND, slug: treeSlug } },
    select: { id: true },
  })
  if (!tree) {
    throw new Error(`LineageTree not found: brand=${BRAND} slug=${treeSlug}`)
  }

  const members = await db.lineageTreeMember.findMany({
    where: { treeId: tree.id },
    select: {
      node: {
        select: {
          passport: {
            select: { id: true, displayName: true, avatarUrl: true, userId: true },
          },
        },
      },
    },
  })

  let updated = 0
  let skippedReal = 0
  let unchanged = 0
  const matchedNames = new Set<string>()
  const rows: Array<{ name: string; current: string; next: string; action: string }> = []

  for (const m of members) {
    const p = m.node?.passport
    if (!p?.displayName) {
      continue
    }
    const key = byName.get(normName(p.displayName))
    if (!key) {
      continue
    }
    matchedNames.add(normName(p.displayName))
    const next = `${mediaBase}/media/bbl/profiles/${key}`
    const current = p.avatarUrl
    const isDefault = !current || current.endsWith(DEFAULT_AVATAR_KEY)
    const effectiveOverwrite = overwriteReal || overwriteNames.has(normName(p.displayName))
    const { action, willWrite } = classifyAvatarChange({
      current,
      next,
      overwriteReal: effectiveOverwrite,
      hasAccount: p.userId !== null,
    })
    if (willWrite) {
      updated++
      if (!dryRun) {
        await db.passport.update({ where: { id: p.id }, data: { avatarUrl: next } })
      }
    } else if (action === "skip-real") {
      skippedReal++
    } else if (action === "unchanged") {
      unchanged++
    }
    rows.push({
      name: p.displayName,
      current: current ? (isDefault ? "(default gi)" : current) : "(null)",
      next: key,
      action,
    })
  }

  rows.sort((a, b) => a.action.localeCompare(b.action) || a.name.localeCompare(b.name))
  console.log(`\n── Plan (${rows.length} matched passports) ──`)
  for (const r of rows) {
    console.log(`   ${r.action.padEnd(14)} ${r.name.padEnd(26)} ${r.current}  →  ${r.next}`)
  }

  const unmatched = [...byName.keys()].filter(n => !matchedNames.has(n))
  if (unmatched.length) {
    console.log(`\n⚠ ${unmatched.length} optimized avatars had NO matching Passport in the tree:`)
    for (const n of unmatched) {
      console.log(`   ✗ ${n}  (${byName.get(n)})`)
    }
  }

  console.log(`\n── Summary ──`)
  console.log(`   ${dryRun ? "would update" : "updated"}:   ${updated}`)
  console.log(`   skipped (already real photo, no --overwrite-real): ${skippedReal}`)
  console.log(`   unchanged (already this photo):                    ${unchanged}`)
  console.log(`   unmatched manifest entries:                        ${unmatched.length}`)
  console.log(`\n${dryRun ? "✅ DRY RUN — nothing written." : "🎉 Backfill complete."}\n`)
}

main()
  .catch(e => {
    console.error("❌ Backfill error:", e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
