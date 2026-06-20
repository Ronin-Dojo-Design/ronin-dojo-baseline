import "dotenv/config"

import { render } from "@react-email/components"
import { writeFileSync } from "node:fs"
import { Brand } from "~/.generated/prisma/client"
import { EmailBblBuildTour } from "~/emails/bbl-build-tour"
import { notifyFounderOfBuildTour } from "~/lib/notifications"

/**
 * Send the "Explore the Build" email (live docs navigator + knowledge-graph links)
 * to the founders. Positive/transparency only — no claim link, no prod DB, no asks.
 *
 *   bun scripts/send-bbl-build-tour.ts --dry-run   # render both + write HTML previews, no send
 *   bun scripts/send-bbl-build-tour.ts             # send to Bob + Tony via Resend (SERIAL)
 */

const RECIPIENTS = [
  { to: "Bobbassjj@gmail.com", variant: "founder" as const, label: "Bob" },
  { to: "tonyhua08@gmail.com", variant: "tony" as const, label: "Tony" },
]

const dryRun = process.argv.includes("--dry-run")

async function main() {
  for (const r of RECIPIENTS) {
    if (dryRun) {
      const html = await render(EmailBblBuildTour({ to: r.to, variant: r.variant }))
      const out = `/tmp/bbl-build-tour-${r.variant}.html`
      writeFileSync(out, html)
      console.log(
        `🧪 DRY RUN — ${r.label} <${r.to}> | variant=${r.variant} | ${html.length} chars → ${out}`,
      )
      continue
    }
    const res = await notifyFounderOfBuildTour({ brand: Brand.BBL, to: r.to, variant: r.variant })
    const id = (res as { data?: { id?: string } } | undefined)?.data?.id
    const err = (res as { error?: unknown } | undefined)?.error
    if (err) {
      console.error(`❌ ${r.label} <${r.to}>:`, err)
      process.exitCode = 1
    } else if (id) {
      console.log(`✅ Sent ${r.label} <${r.to}> — Resend id ${id}`)
    } else {
      console.warn(`⚠️ ${r.label} <${r.to}> — no id/error (rate-limited or no RESEND_API_KEY?)`)
    }
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
