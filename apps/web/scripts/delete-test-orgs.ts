/**
 * Delete generated TEST organizations — 0-member junk with timestamped slugs
 * (e.g. `session-0033-actions-1781881357652-org`, `test-ce-sa-...-org`).
 *
 * DRY-RUN by default: prints the candidates + their cascade footprint and deletes
 * NOTHING. Pass --apply to actually delete (each org wrapped in try/catch; relies on
 * the schema's onDelete cascade — any FK that blocks is reported, not force-removed).
 *
 *   Local prodsnap (dry-run):  bun scripts/delete-test-orgs.ts
 *   PROD (dry-run, review):    bun --env-file=.env.prod scripts/delete-test-orgs.ts
 *   PROD (DELETE, on "go"):    bun --env-file=.env.prod scripts/delete-test-orgs.ts --apply
 *
 * SAFETY: only orgs whose slug matches a test pattern AND have 0 memberships are
 * ever touched. Anything with members is listed as SKIP. ⚠ Prod can hold rows the
 * snapshot lacks (lineage-cutover lesson) — always dry-run against prod FIRST and
 * eyeball the list before --apply.
 */
import { db } from "~/services/db"

const APPLY = process.argv.includes("--apply")
const TEST_SLUG_PATTERNS = ["session-", "test-"]

const candidates = await db.organization.findMany({
  where: { OR: TEST_SLUG_PATTERNS.map(p => ({ slug: { contains: p } })) },
  select: {
    id: true,
    slug: true,
    name: true,
    brand: true,
    _count: {
      select: {
        memberships: true,
        affiliations: true,
        lineageTrees: true,
        invites: true,
        auditLogs: true,
        disciplines: true,
        courses: true,
        tournaments: true,
      },
    },
  },
})

const safe = candidates.filter(o => o._count.memberships === 0)
const skipped = candidates.filter(o => o._count.memberships > 0)

console.log(`DB: ${process.env.DATABASE_URL?.split("@")[1] ?? "(unknown)"}`)
console.log(`mode: ${APPLY ? "APPLY (will DELETE)" : "DRY-RUN (no deletes)"}\n`)
console.log(`candidates matching test patterns: ${candidates.length}\n`)

for (const o of safe) {
  const rel =
    Object.entries(o._count)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${k}=${n}`)
      .join(" ") || "no child rows"
  console.log(`  [DELETE] ${o.brand}  "${o.slug}"  (${o.name})  — ${rel}`)
}
for (const o of skipped) {
  console.log(`  [SKIP — has ${o._count.memberships} members] ${o.brand}  "${o.slug}"`)
}

if (!APPLY) {
  console.log(
    `\nDRY-RUN — nothing deleted. Re-run with --apply to delete the ${safe.length} [DELETE] org(s).`,
  )
  process.exit(0)
}

let ok = 0
let failed = 0
for (const o of safe) {
  try {
    await db.organization.delete({ where: { id: o.id } })
    console.log(`  ✓ deleted ${o.slug}`)
    ok++
  } catch (e) {
    console.log(`  ✗ FAILED ${o.slug}: ${(e as Error).message.split("\n")[0]}`)
    failed++
  }
}
console.log(`\ndeleted ${ok}, failed ${failed}`)
process.exit(failed ? 1 : 0)
