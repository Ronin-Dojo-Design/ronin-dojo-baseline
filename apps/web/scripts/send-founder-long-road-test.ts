/**
 * send-founder-long-road-test.ts (SESSION_0418)
 *
 * One-off helper to deliver a REAL copy of the founder "Long Road" email to a
 * test inbox, so Brian can eyeball it on his phone before Bob ever sees it. This
 * does NOT mint a live claim token — it passes a placeholder claim URL purely so
 * the button + paste link render. The live founder flow
 * (createJoinLegacyInterest → notifyFounderOfTheLongRoad) mints the real,
 * email-bound magic link.
 *
 * Env (run from apps/web):
 *   - RESEND_API_KEY            (send)
 *   - RESEND_SENDER_EMAIL_BBL   (BBL from-address; prod throws without it)
 *
 * CLI:
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-founder-long-road-test.ts \
 *     [--to ronindojodesign@gmail.com] [--name Bob] [--base-url https://blackbeltlegacy.com]
 */

import { Brand } from "../.generated/prisma/client.js"
import { notifyFounderOfTheLongRoad } from "../lib/notifications"

function parseArgs() {
  const opts = {
    to: "ronindojodesign@gmail.com",
    name: "Bob",
    baseUrl: "https://blackbeltlegacy.com",
  }
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--to") opts.to = argv[++i] ?? opts.to
    else if (arg === "--name") opts.name = argv[++i] ?? opts.name
    else if (arg === "--base-url") opts.baseUrl = (argv[++i] ?? opts.baseUrl).replace(/\/+$/, "")
    else throw new Error(`Unknown argument: ${arg}`)
  }
  return opts
}

async function main() {
  const opts = parseArgs()
  // Placeholder magic-link-shaped URL so the button + paste fallback look real in the test.
  const claimUrl = `${opts.baseUrl}/api/auth/magic-link/verify?token=TEST-PREVIEW&callbackURL=${encodeURIComponent(
    "/preview?token=bob-tony-BBL-preview&next=/lineage/claim/accept?node=bob-bass",
  )}`

  console.log(`📨 Sending founder "Long Road" test → ${opts.to} (${opts.name})`)
  await notifyFounderOfTheLongRoad({
    brand: Brand.BBL,
    to: opts.to,
    firstName: opts.name,
    claimUrl,
  })
  console.log("✅ Sent (check the inbox + spam).")
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
