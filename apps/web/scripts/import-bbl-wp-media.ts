/**
 * import-bbl-wp-media.ts
 *
 * SESSION_0403 — bulk migration of WordPress / BBLApp profile images into S3, with
 * optional avatar attachment onto the imported placeholder Passports.
 *
 * Purpose:
 *   Operators have a local folder of legacy WordPress/BBLApp member photos. This script
 *   uploads each image to S3 (via the app's `uploadToS3Storage`) and, when a manifest is
 *   supplied, attaches the resulting public URL to the matching Passport's `avatarUrl`.
 *   It PAIRS WITH the Track-A profile import (which creates the placeholder Passports,
 *   i.e. Passport rows with `userId == null`). Run Track-A first, then this to wire avatars.
 *
 * IMPORTANT:
 *   `--dir` must point at a LOCAL copy of the WordPress images (this script does not fetch
 *   from a remote WordPress site — copy/export the uploads folder locally first).
 *
 * Env it needs (from apps/web env; consumed transitively by `uploadToS3Storage` →
 * `services/s3.ts`). Set these before running. `--brand BBL` routes uploads to the
 * BBL bucket (Cloudflare R2) and requires the `S3_*_BBL` variants instead:
 *   - S3_BUCKET[_BBL]            (required — guarded here)
 *   - S3_REGION[_BBL]            (required for the public URL when S3_PUBLIC_URL[_BBL] is unset)
 *   - S3_ENDPOINT[_BBL]          (S3 / R2 / MinIO endpoint)
 *   - S3_ACCESS_KEY[_BBL]        (access key id)
 *   - S3_SECRET_ACCESS_KEY[_BBL] (secret access key)
 *   - S3_PUBLIC_URL[_BBL]        (optional — public base URL; falls back to the bucket vhost URL)
 *   - DATABASE_URL               (Postgres — only needed when a --manifest is supplied)
 *
 * CLI (run from apps/web; `SKIP_ENV_VALIDATION=1` so the standalone script skips the
 * app's full t3-env schema and reads the S3/DB vars straight from the environment):
 *   SKIP_ENV_VALIDATION=1 bun scripts/import-bbl-wp-media.ts --dir <folder> \
 *     [--brand BBL] \
 *     [--manifest <path.json>] \
 *     [--prefix media/bbl/profiles] \
 *     [--match displayName|profileSlug|nodeSlug] \
 *     [--dry-run] [--overwrite]
 *
 * Manifest shape (JSON array; `file` is the image basename within --dir):
 *   [
 *     { "file": "john-smith.jpg", "displayName": "John Smith" },
 *     { "file": "jane-doe.png",   "profileSlug": "jane-doe" },
 *     { "file": "sensei.webp",    "nodeSlug": "sensei-tanaka" }
 *   ]
 *
 *   When a manifest is present, each matched file's uploaded URL is attached to the
 *   resolved Passport's `avatarUrl`. Resolution priority: profileSlug (DirectoryProfile.slug)
 *   → nodeSlug (LineageNode.slug) → displayName (prefers a placeholder Passport, userId == null).
 *   Existing non-empty `avatarUrl` values are preserved unless --overwrite is passed.
 *
 *   Without a manifest, every image is uploaded and a `filename -> url` table is printed so
 *   Track A can wire avatars from it.
 *
 * Flags:
 *   --dry-run    do everything except the S3 upload + DB writes; log what *would* happen.
 *   --overwrite  replace an existing avatarUrl instead of only filling null/empty ones.
 */

import { readdirSync, readFileSync, statSync } from "node:fs"
import { basename, extname, join } from "node:path"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PrismaClient } from "../.generated/prisma/client.js"
import { uploadToS3Storage } from "../lib/media"

const ACCEPTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"])
const DEFAULT_PREFIX = "media/bbl/profiles"

type MatchMode = "displayName" | "profileSlug" | "nodeSlug"

type ManifestEntry = {
  file: string
  displayName?: string
  profileSlug?: string
  nodeSlug?: string
}

type CliOptions = {
  dir: string
  manifest?: string
  prefix: string
  match?: MatchMode
  brand?: Brand
  dryRun: boolean
  overwrite: boolean
}

type UploadResult = {
  file: string
  key: string
  url: string
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

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    dir: "",
    prefix: DEFAULT_PREFIX,
    dryRun: false,
    overwrite: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case "--dir":
        opts.dir = argv[++i] ?? ""
        break
      case "--manifest":
        opts.manifest = argv[++i]
        break
      case "--prefix":
        opts.prefix = (argv[++i] ?? DEFAULT_PREFIX).replace(/\/+$/, "")
        break
      case "--brand": {
        const value = argv[++i]
        if (!value || !(value in Brand)) {
          throw new Error(`--brand must be one of: ${Object.keys(Brand).join(", ")}`)
        }
        opts.brand = value as Brand
        break
      }
      case "--match": {
        const value = argv[++i]
        if (value !== "displayName" && value !== "profileSlug" && value !== "nodeSlug") {
          throw new Error(
            `--match must be one of displayName|profileSlug|nodeSlug (got "${value}")`,
          )
        }
        opts.match = value
        break
      }
      case "--dry-run":
        opts.dryRun = true
        break
      case "--overwrite":
        opts.overwrite = true
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!opts.dir) {
    throw new Error("--dir <folder> is required")
  }

  return opts
}

/**
 * Verifies the S3 env for the target bucket is present; returns missing var
 * names. `--brand BBL` routes uploads to the BBL bucket, so it requires the
 * `S3_*_BBL` vars (Cloudflare R2); otherwise the platform `S3_*` vars.
 */
function missingS3Env(brand?: Brand): string[] {
  const suffix = brand === Brand.BBL ? "_BBL" : ""
  const required = [
    `S3_BUCKET${suffix}`,
    `S3_REGION${suffix}`,
    `S3_ENDPOINT${suffix}`,
    `S3_ACCESS_KEY${suffix}`,
    `S3_SECRET_ACCESS_KEY${suffix}`,
  ]
  return required.filter(name => !process.env[name])
}

function listImageFiles(dir: string): string[] {
  let stat: ReturnType<typeof statSync>
  try {
    stat = statSync(dir)
  } catch {
    throw new Error(`--dir does not exist: ${dir}`)
  }
  if (!stat.isDirectory()) {
    throw new Error(`--dir is not a directory: ${dir}`)
  }

  return readdirSync(dir)
    .filter(name => {
      const full = join(dir, name)
      if (!statSync(full).isFile()) return false
      return ACCEPTED_EXTENSIONS.has(extname(name).toLowerCase())
    })
    .sort()
}

function readManifest(path: string): Map<string, ManifestEntry> {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as unknown
  if (!Array.isArray(parsed)) {
    throw new Error(`Manifest must be a JSON array of { file, ... } entries: ${path}`)
  }

  const byFile = new Map<string, ManifestEntry>()
  for (const raw of parsed as ManifestEntry[]) {
    if (!raw || typeof raw.file !== "string" || !raw.file) {
      throw new Error(`Manifest entry is missing a "file" string: ${JSON.stringify(raw)}`)
    }
    byFile.set(raw.file, raw)
  }
  return byFile
}

/**
 * Resolves the Passport id for a manifest entry, honoring the resolution priority
 * (profileSlug → nodeSlug → displayName), narrowed by --match when provided.
 */
async function resolvePassportId(
  db: PrismaClient,
  entry: ManifestEntry,
  match: MatchMode | undefined,
): Promise<string | null> {
  const wants = (mode: MatchMode) => !match || match === mode

  if (wants("profileSlug") && entry.profileSlug) {
    const profile = await db.directoryProfile.findUnique({
      where: { slug: entry.profileSlug },
      select: { passportId: true },
    })
    if (profile) return profile.passportId
  }

  if (wants("nodeSlug") && entry.nodeSlug) {
    const node = await db.lineageNode.findUnique({
      where: { slug: entry.nodeSlug },
      select: { passportId: true },
    })
    if (node) return node.passportId
  }

  if (wants("displayName") && entry.displayName) {
    // Prefer a placeholder Passport (userId == null) over a claimed one.
    const placeholder = await db.passport.findFirst({
      where: { displayName: entry.displayName, userId: null },
      select: { id: true },
    })
    if (placeholder) return placeholder.id

    const any = await db.passport.findFirst({
      where: { displayName: entry.displayName },
      select: { id: true },
    })
    if (any) return any.id
  }

  return null
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  // 1. Env guard — never attempt uploads without the S3 vars.
  const missing = missingS3Env(opts.brand)
  if (missing.length > 0) {
    console.error(
      `[env] Missing required S3 env: ${missing.join(", ")}.\n` +
        "       Set the S3_* vars in apps/web before running (see header comment).",
    )
    process.exit(1)
  }

  // 2. Read images.
  const files = listImageFiles(opts.dir)
  console.log(
    `[source] ${files.length} image(s) in ${opts.dir} ` +
      `(brand=${opts.brand ?? "platform"}, prefix=${opts.prefix}, match=${opts.match ?? "auto"}` +
      `${opts.dryRun ? ", DRY-RUN" : ""}${opts.overwrite ? ", overwrite" : ""})`,
  )
  if (files.length === 0) {
    console.log("[source] nothing to do.")
    return
  }

  const manifest = opts.manifest ? readManifest(opts.manifest) : null
  if (manifest) {
    console.log(`[manifest] ${manifest.size} entr(ies) from ${opts.manifest}`)
  }

  // Prisma is only needed when a manifest drives avatar attachment.
  const db = manifest
    ? new PrismaClient({
        adapter: new PrismaPg({
          connectionString:
            process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
        }),
      })
    : null

  const uploads: UploadResult[] = []
  let uploaded = 0
  let attached = 0
  let skipped = 0
  const warnings: string[] = []

  try {
    for (const file of files) {
      try {
        const key = `${opts.prefix}/${slugify(basename(file, extname(file)))}`

        let url: string
        if (opts.dryRun) {
          url = "(dry-run: not uploaded)"
          console.log(`[upload] would upload ${file} -> key ${key}`)
        } else {
          const buffer = readFileSync(join(opts.dir, file))
          url = await uploadToS3Storage(buffer, key, opts.brand)
          uploaded++
          console.log(`[upload] ${file} -> ${url}`)
        }
        uploads.push({ file, key, url })

        // 4. Manifest-driven avatar attachment.
        if (manifest && db) {
          const entry = manifest.get(file)
          if (!entry) {
            // Not in the manifest — still uploaded, just nothing to attach.
            continue
          }

          const passportId = await resolvePassportId(db, entry, opts.match)
          if (!passportId) {
            const warning = `no Passport matched manifest entry for ${file} (${JSON.stringify({
              displayName: entry.displayName,
              profileSlug: entry.profileSlug,
              nodeSlug: entry.nodeSlug,
            })})`
            warnings.push(warning)
            console.warn(`[attach] WARN ${warning}`)
            continue
          }

          const passport = await db.passport.findUnique({
            where: { id: passportId },
            select: { id: true, avatarUrl: true, displayName: true, userId: true },
          })
          if (!passport) {
            const warning = `resolved passportId ${passportId} no longer exists (${file})`
            warnings.push(warning)
            console.warn(`[attach] WARN ${warning}`)
            continue
          }

          const hasAvatar = Boolean(passport.avatarUrl && passport.avatarUrl.trim())
          if (hasAvatar && !opts.overwrite) {
            skipped++
            console.log(
              `[attach] skip ${file}: passport ${passport.id} already has avatarUrl ` +
                "(use --overwrite to replace)",
            )
            continue
          }

          if (opts.dryRun) {
            console.log(
              `[attach] would set avatarUrl on passport ${passport.id} ` +
                `(${passport.displayName ?? "no name"}, userId=${passport.userId ?? "null"})`,
            )
            attached++
            continue
          }

          await db.passport.update({
            where: { id: passport.id },
            data: { avatarUrl: url },
          })
          attached++
          console.log(`[attach] passport ${passport.id} avatarUrl <- ${url}`)
        }
      } catch (error) {
        // Idempotency + safety: one bad file must not abort the whole run.
        const message = error instanceof Error ? error.message : String(error)
        warnings.push(`failed processing ${file}: ${message}`)
        console.error(`[error] ${file}: ${message}`)
      }
    }

    // Without a manifest, print a filename -> url table so Track A can wire avatars.
    if (!manifest) {
      console.log("\n[table] filename -> url")
      for (const u of uploads) {
        console.log(`  ${u.file}\t${u.url}`)
      }
    }
  } finally {
    if (db) await db.$disconnect()
  }

  // 6. Final summary.
  console.log(
    `\n[summary] ${JSON.stringify({
      uploaded: opts.dryRun ? `${uploads.length} (dry-run)` : uploaded,
      attached,
      skipped,
      warnings: warnings.length,
    })}`,
  )
  if (warnings.length > 0) {
    console.log("[summary] warnings:")
    for (const w of warnings) console.log(`  - ${w}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
