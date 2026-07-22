/**
 * CSP violation rollup reader (SESSION_0617, research-review security-headers Fork 1B).
 *
 * Prints the deduplicated `CspViolationReport` rollup ordered by `count` desc so the operator can
 * review the Report-Only stream — the "clean for N days" evidence gate before the `CSP_ENFORCE`
 * flip. One row per DISTINCT violation shape (directive × blockedURI × documentURI), so the output
 * length reflects the diversity of violations, not the raw report volume.
 *
 * Run:  cd apps/web && bun scripts/csp-violations.ts
 *
 * TODO(G-030-adjacent): a read-only AdminCollection surface at `/app/csp-violations` (the admin-list
 * law, `/app/tools` ref impl) is the nice-to-have follow-up — this script covers operator review now.
 */

import { db } from "~/services/db"

const main = async () => {
  const rows = await db.cspViolationReport.findMany({
    orderBy: [{ count: "desc" }, { lastSeenAt: "desc" }],
  })

  if (rows.length === 0) {
    console.log("No CSP violations recorded. (Report-Only stream is empty — clean so far.)")
    return
  }

  const total = rows.reduce((sum, r) => sum + r.count, 0)
  console.log(`CSP violation rollup — ${rows.length} distinct shape(s), ${total} total report(s)\n`)

  for (const r of rows) {
    console.log(
      [
        `count=${String(r.count).padStart(6)}`,
        `dir=${r.violatedDirective ?? "-"}`,
        `blocked=${r.blockedUri ?? "-"}`,
        `doc=${r.documentUri ?? "-"}`,
        `disp=${r.disposition ?? "-"}`,
        `first=${r.firstSeenAt.toISOString()}`,
        `last=${r.lastSeenAt.toISOString()}`,
      ].join("  "),
    )
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
