/**
 * send-bbl-claim-emails.ts
 *
 * SESSION_0403 — bulk "claim your profile" launch announcement for Black Belt
 * Legacy. For each recipient (an existing member whose profile was imported as a
 * placeholder Passport), resolve their claimable lineage node, build a claim
 * link that deep-opens the join modal (`/lineage/join?node=<nodeId>`), and send
 * the branded EmailBblClaimYourProfile via notifyMemberOfBblClaimYourProfile.
 *
 * WHY a manifest (not a DB query): imported placeholders are accountless
 * Passports with NO stored email (by design — personal email is only captured on
 * claim/signup). The recipient email list comes from the old WordPress site
 * export. Pair with Track-A (which creates the placeholder Passports) — run this
 * after the import, with the WP email export as --recipients.
 *
 * The comp itself is granted on claim approval (the cohort decides lifetime vs
 * 1yr — see lib/entitlements/lineage-comp). Here `dirtyDozen` only flips the
 * email copy (lifetime vs one free year); mark the 12 in the manifest.
 *
 * Env (run from apps/web, SKIP_ENV_VALIDATION=1 to bypass the app's full schema):
 *   - DATABASE_URL          (resolve nodes/passports)
 *   - RESEND_API_KEY        (send)
 *   - RESEND_SENDER_EMAIL_BBL (BBL from-address; prod throws without it)
 *
 * CLI:
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-bbl-claim-emails.ts \
 *     --recipients <path.json> [--base-url https://blackbeltlegacy.com] \
 *     [--limit N] [--dry-run]
 *
 * Recipients shape (JSON array; one of nodeSlug | profileSlug | displayName must resolve a node):
 *   [
 *     { "email": "chris@example.com", "firstName": "Chris", "nodeSlug": "chris-haueter", "dirtyDozen": true },
 *     { "email": "alex@example.com",  "displayName": "Alex Stone" }
 *   ]
 */

import { readFileSync } from "node:fs"
import { PrismaPg } from "@prisma/adapter-pg"
import { Brand, PrismaClient } from "../.generated/prisma/client.js"
import { notifyMemberOfBblClaimYourProfile } from "../lib/notifications"
import {
  claimAcceptNextPath,
  mintClaimMagicLink,
} from "../server/web/lineage/mint-claim-magic-link"

type Recipient = {
  email: string
  firstName?: string
  displayName?: string
  profileSlug?: string
  nodeSlug?: string
  dirtyDozen?: boolean
}

type Options = {
  recipients: string
  baseUrl: string
  limit?: number
  dryRun: boolean
}

function parseArgs(): Options {
  const opts: Options = { recipients: "", baseUrl: "https://blackbeltlegacy.com", dryRun: false }
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    switch (arg) {
      case "--recipients":
        opts.recipients = argv[++i] ?? ""
        break
      case "--base-url":
        opts.baseUrl = (argv[++i] ?? opts.baseUrl).replace(/\/+$/, "")
        break
      case "--limit":
        opts.limit = Number.parseInt(argv[++i] ?? "", 10) || undefined
        break
      case "--dry-run":
        opts.dryRun = true
        break
      default:
        throw new Error(`Unknown argument: ${arg}`)
    }
  }
  if (!opts.recipients) throw new Error("--recipients <path.json> is required")
  return opts
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://brianscott@localhost:5432/ronindojo_dev",
  }),
})

type ResolvedNode = { nodeId: string; profileName: string; claimed: boolean }

/** Resolve the claimable lineage node for a recipient (nodeSlug → profileSlug → displayName). */
async function resolveNode(recipient: Recipient): Promise<ResolvedNode | null> {
  const select = {
    id: true,
    passport: { select: { displayName: true, userId: true } },
  } as const

  let node:
    | { id: string; passport: { displayName: string | null; userId: string | null } | null }
    | null
    | undefined

  if (recipient.nodeSlug) {
    node = await prisma.lineageNode.findUnique({ where: { slug: recipient.nodeSlug }, select })
  }
  if (!node && recipient.profileSlug) {
    const profile = await prisma.directoryProfile.findUnique({
      where: { slug: recipient.profileSlug },
      select: { passport: { select: { lineageNode: { select } } } },
    })
    node = profile?.passport?.lineageNode ?? null
  }
  if (!node && recipient.displayName) {
    // Prefer the accountless placeholder when names collide.
    const passport =
      (await prisma.passport.findFirst({
        where: { displayName: recipient.displayName, userId: null },
        select: { lineageNode: { select } },
      })) ??
      (await prisma.passport.findFirst({
        where: { displayName: recipient.displayName },
        select: { lineageNode: { select } },
      }))
    node = passport?.lineageNode ?? null
  }

  if (!node) return null
  return {
    nodeId: node.id,
    profileName: node.passport?.displayName ?? recipient.displayName ?? "your profile",
    claimed: Boolean(node.passport?.userId),
  }
}

async function main() {
  const opts = parseArgs()
  const recipients = JSON.parse(readFileSync(opts.recipients, "utf-8")) as Recipient[]
  const queue = opts.limit ? recipients.slice(0, opts.limit) : recipients

  console.log(
    `📨 BBL claim emails — ${queue.length} recipient(s)${opts.dryRun ? " (dry run)" : ""}\n`,
  )

  let sent = 0
  let skipped = 0
  const warnings: string[] = []

  for (const recipient of queue) {
    try {
      if (!recipient.email) {
        warnings.push(`(no email) ${recipient.displayName ?? recipient.nodeSlug ?? "?"}`)
        skipped += 1
        continue
      }

      const resolved = await resolveNode(recipient)
      if (!resolved) {
        warnings.push(`no node resolved for ${recipient.email}`)
        skipped += 1
        continue
      }
      if (resolved.claimed) {
        console.log(`  ⏭️  ${recipient.email} — already claimed (${resolved.profileName})`)
        skipped += 1
        continue
      }

      // FIX #3 (SESSION_0412): the claim link is now an email-bound, single-use
      // magic link. The recipient clicks it → BA verifies + sets the session →
      // redirects straight to the `callbackURL` (token-accept route), which
      // one-click-claims the profile. (SESSION_0443: the `/preview` countdown-gate
      // wrapper is retired — the gate is hard-off and the public site is open.)
      if (opts.dryRun) {
        // Dry run must not mint a real (DB-writing, single-use) token — print the
        // would-be link SHAPE with a placeholder token instead.
        const callbackURL = claimAcceptNextPath(resolved.nodeId)
        const wouldBe = `${opts.baseUrl}/api/auth/magic-link/verify?token=<minted>&callbackURL=${encodeURIComponent(callbackURL)}`
        console.log(
          `  ✓ would send → ${recipient.email} (${resolved.profileName}, ${recipient.dirtyDozen ? "lifetime" : "1yr"}) ${wouldBe}`,
        )
        sent += 1
        continue
      }

      const claimUrl = await mintClaimMagicLink({
        baseUrl: opts.baseUrl,
        email: recipient.email,
        nextPath: claimAcceptNextPath(resolved.nodeId),
      })

      await notifyMemberOfBblClaimYourProfile({
        brand: Brand.BBL,
        to: recipient.email,
        firstName: recipient.firstName ?? null,
        profileName: resolved.profileName,
        claimUrl,
        compTier: "ELITE",
        isLifetime: Boolean(recipient.dirtyDozen),
      })
      console.log(`  ✉️  sent → ${recipient.email} (${resolved.profileName})`)
      sent += 1
    } catch (error) {
      warnings.push(`${recipient.email}: ${error instanceof Error ? error.message : String(error)}`)
      skipped += 1
    }
  }

  console.log(`\nDone. sent=${sent} skipped=${skipped} warnings=${warnings.length}`)
  if (warnings.length) {
    console.log("Warnings:")
    for (const warning of warnings) console.log(`  - ${warning}`)
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
