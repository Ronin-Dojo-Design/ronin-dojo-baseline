/**
 * FS-0031 — provision a small, seeded local e2e database (`ronindojo_e2e`) so heavy admin pages
 * render locally without the full `ronindojo_prodsnap`. The prodsnap's cold `/app/blog` list
 * `$transaction` times out locally, so authors default to "verified by inspection". A tiny seeded
 * DB makes the real surface runnable. Idempotent — safe to re-run.
 *
 * Run:  cd apps/web && bun run e2e:db:setup
 *   (package.json wraps it: `bun --env-file=.env.e2e scripts/setup-e2e-db.ts`, so DATABASE_URL/
 *    DIRECT_URL already point at ronindojo_e2e when this executes.)
 *
 * Steps: ensure the DB exists (`createdb`, "already exists" tolerated) → `prisma migrate deploy`
 * → minimal seed (one admin author + a few Published/Draft `Post`s + ≥2 `Organization`s — exactly
 * what `e2e/admin/admin-collection-conformance.spec.ts` needs; the admin USER is minted per-test by
 * `e2e/helpers/auth.ts`).
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PostStatus, PrismaClient } from "~/.generated/prisma/client"
import { uniqueSlugsExtension } from "~/prisma/extensions/unique-slugs"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL unset — run via `bun --env-file=.env.e2e scripts/setup-e2e-db.ts`")
}

const dbUrl = new URL(DATABASE_URL)
const dbName = dbUrl.pathname.replace(/^\//, "")

// Safety rail: this script CREATES + SEEDS the target DB. Refuse to touch anything that isn't an
// explicit e2e database (never prodsnap/dev). The `.env.e2e` DB name must contain "e2e".
if (!/e2e/.test(dbName)) {
  throw new Error(
    `Refusing to provision non-e2e database "${dbName}". Point DATABASE_URL at ronindojo_e2e (.env.e2e).`,
  )
}

// createdb is off the sandbox PATH; Postgres.app ships it at an absolute path (works locally).
const CREATEDB_ABS = "/Applications/Postgres.app/Contents/Versions/latest/bin/createdb"

function ensureDatabase() {
  const args: string[] = []
  if (dbUrl.hostname) args.push("-h", dbUrl.hostname)
  if (dbUrl.port) args.push("-p", dbUrl.port)
  if (dbUrl.username) args.push("-U", dbUrl.username)
  args.push(dbName)

  const bin = existsSync(CREATEDB_ABS) ? CREATEDB_ABS : "createdb"
  try {
    execFileSync(bin, args, { stdio: "pipe" })
    console.log(`✓ created database ${dbName}`)
  } catch (err) {
    const stderr = String(
      (err as { stderr?: Buffer | string })?.stderr ?? (err as Error)?.message ?? "",
    )
    // Postgres has no `CREATE DATABASE IF NOT EXISTS`; an existing DB is the idempotent no-op.
    if (/already exists/i.test(stderr)) {
      console.log(`✓ database ${dbName} already exists`)
    } else {
      throw new Error(`createdb failed for ${dbName}: ${stderr}`)
    }
  }
}

function migrateDeploy() {
  console.log("→ prisma migrate deploy…")
  // Inherits process.env (DATABASE_URL/DIRECT_URL from --env-file=.env.e2e), so the CLI's
  // prisma.config.ts (`DIRECT_URL ?? DATABASE_URL` locally) targets ronindojo_e2e.
  execFileSync("bunx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env: process.env })
}

async function seed() {
  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  const db = new PrismaClient({ adapter }).$extends(uniqueSlugsExtension)

  try {
    // Admin author for the seeded Posts (idempotent by unique email). The e2e specs mint their own
    // per-test admin USERS via createAuthenticatedUser; this one only owns the seeded content.
    const author = await db.user.upsert({
      where: { email: "e2e-seed-admin@test.local" },
      update: { role: "admin" },
      create: {
        name: "E2E Seed Admin",
        email: "e2e-seed-admin@test.local",
        emailVerified: true,
        role: "admin",
      },
      select: { id: true },
    })

    // Posts (brand BBL — /app/blog is BBL-scoped). The "clearing the defaulted Status facet reaches
    // All" test seeds Published posts and asserts `tbody tr` visible after clearing the Drafts
    // default; one Draft keeps the default (Draft) view non-empty too.
    const posts = [
      { slug: "e2e-published-alpha", title: "E2E Published Alpha", status: PostStatus.Published },
      { slug: "e2e-published-bravo", title: "E2E Published Bravo", status: PostStatus.Published },
      {
        slug: "e2e-published-charlie",
        title: "E2E Published Charlie",
        status: PostStatus.Published,
      },
      { slug: "e2e-draft-delta", title: "E2E Draft Delta", status: PostStatus.Draft },
    ]
    for (const p of posts) {
      const data = {
        title: p.title,
        slug: p.slug,
        content: `Seed content for ${p.title}.`,
        plainText: `Seed content for ${p.title}.`,
        status: p.status,
        publishedAt: p.status === PostStatus.Published ? new Date() : null,
        brand: Brand.BBL,
        author: { connect: { id: author.id } },
      }
      // slug is @unique — upsert-by-slug keeps the seed idempotent (re-runs update in place).
      const existing = await db.post.findUnique({ where: { slug: p.slug }, select: { id: true } })
      if (existing) await db.post.update({ where: { id: existing.id }, data })
      else await db.post.create({ data })
    }

    // ≥2 Organizations — the org-sort test's row-order flip is guarded by `if (rowCount >= 2)`.
    // Names bracket the alphabet so `name asc` vs `desc` always changes the first row.
    const orgs = [
      { slug: "e2e-org-aikido-house", name: "E2E Aikido House" },
      { slug: "e2e-org-zenith-bjj", name: "E2E Zenith BJJ" },
    ]
    for (const o of orgs) {
      const existing = await db.organization.findFirst({
        where: { name: o.name },
        select: { id: true },
      })
      if (!existing) {
        await db.organization.create({ data: { brand: Brand.BBL, name: o.name, slug: o.slug } })
      }
    }

    const [postCount, orgCount] = await Promise.all([
      db.post.count({ where: { brand: Brand.BBL } }),
      db.organization.count(),
    ])
    console.log(`✓ seeded — posts(BBL)=${postCount}, organizations=${orgCount}`)
  } finally {
    await db.$disconnect()
  }
}

async function main() {
  console.log(`FS-0031 e2e DB setup → ${dbName}`)
  ensureDatabase()
  migrateDeploy()
  await seed()
  console.log("✓ e2e DB ready")
}

main().catch(err => {
  console.error("setup-e2e-db failed:", err)
  process.exit(1)
})
