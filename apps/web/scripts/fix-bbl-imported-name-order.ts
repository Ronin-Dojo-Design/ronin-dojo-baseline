/**
 * SESSION_0445 #6 — correct mis-imported person names (French "NOM Prénom" roster:
 * surname-first and/or all-uppercase). EXPLICIT corrections only (no heuristics) so
 * the write is auditable. Sets displayName + legalFirstName + legalLastName to the
 * corrected values; idempotent (absolute set). Targets by node slug.
 *
 * Excluded on purpose (NOT bugs): "GM Steve Wolk" (GM = Grandmaster title), and the
 * middle-initial rows George C. Smith / Jerry C. Smith Jr. / Joseph D. Jacky.
 *
 * Usage:
 *   bun scripts/fix-bbl-imported-name-order.ts            # dry-run on local DB (prodsnap)
 *   bun scripts/fix-bbl-imported-name-order.ts --apply    # write to local DB (prodsnap)
 *   bun --env-file=.env.prod scripts/fix-bbl-imported-name-order.ts --apply   # write to PROD
 */
const CORRECTIONS: Array<{
  slug: string
  displayName: string
  legalFirstName: string
  legalLastName: string
}> = [
  {
    slug: "cullet-eric",
    displayName: "Eric Cullet",
    legalFirstName: "Eric",
    legalLastName: "Cullet",
  },
  {
    slug: "francis-delpech",
    displayName: "Francis Delpech",
    legalFirstName: "Francis",
    legalLastName: "Delpech",
  },
  {
    slug: "robert-mansfield",
    displayName: "Robert Mansfield",
    legalFirstName: "Robert",
    legalLastName: "Mansfield",
  },
]

async function main() {
  const apply = process.argv.includes("--apply")
  const { db } = await import("~/services/db")

  console.log(
    `\n${apply ? "APPLYING" : "DRY-RUN"} name-order corrections (${CORRECTIONS.length})\n`,
  )

  for (const c of CORRECTIONS) {
    const node = await db.lineageNode.findFirst({
      where: { slug: c.slug },
      select: {
        id: true,
        passportId: true,
        passport: {
          select: { displayName: true, legalFirstName: true, legalLastName: true },
        },
      },
    })
    if (!node?.passportId || !node.passport) {
      console.log(`  ⚠ ${c.slug}: no node/passport found — SKIPPED`)
      continue
    }
    const before = `"${node.passport.displayName}" [${node.passport.legalFirstName ?? "∅"}/${node.passport.legalLastName ?? "∅"}]`
    const after = `"${c.displayName}" [${c.legalFirstName}/${c.legalLastName}]`
    const already =
      node.passport.displayName === c.displayName &&
      node.passport.legalFirstName === c.legalFirstName &&
      node.passport.legalLastName === c.legalLastName

    console.log(`  ${c.slug}:`)
    console.log(`      before ${before}`)
    console.log(`      after  ${after}${already ? "   (already correct)" : ""}`)

    if (apply && !already) {
      await db.passport.update({
        where: { id: node.passportId },
        data: {
          displayName: c.displayName,
          legalFirstName: c.legalFirstName,
          legalLastName: c.legalLastName,
        },
      })
      console.log("      ✓ written")
    }
  }

  console.log(`\n${apply ? "Applied." : "Dry-run only — re-run with --apply to write."}\n`)
  await db.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
