/**
 * send-founder-long-road-real.ts (SESSION_0418; durable rewrite SESSION_0513)
 *
 * Sends the founder "Long Road" email carrying a DURABLE, public sign-in URL
 * (`buildClaimSignInUrl` → `/auth/login?next=%2Fapp%2Fprofile`) — NO one-shot magic-link token.
 * The prior `mintClaimMagicLink` token was single-use + 7-day: a mail scanner or a
 * late click consumed the one use → dead link (Tony Hua + Bob both hit this). Now the
 * email→node binding (`bindPendingClaim`, 90-day) auto-claims the node on the
 * recipient's NEXT sign-in (Google OR magic link), via `lib/auth.ts` reconciliation.
 *
 * ⚠ Run against PRODUCTION env so the binding lands in the DB the deployed app reads
 *   (DATABASE_URL=prod) and the send uses the BBL domain (RESEND_SENDER_EMAIL_BBL).
 *
 * The claim-accept route validates `?node` as a DATABASE ID (not the slug), so this
 * resolves the founder node's real id via the same tree↔member↔node validation the
 * route itself uses — guaranteeing we bind a claimable member of a published,
 * claimable BBL tree.
 *
 * SAFETY:
 *   --next me     → bind NOTHING; the email is a plain sign-in test (no claim). Use for a
 *                   click-test to yourself so you never claim the founder node as the tester.
 *   --next claim  → bind --node (default: bob-bass) so it auto-claims on the recipient's next
 *                   sign-in. The real send to Bob.
 *   --dry-run     → resolve + print the URL and would-be binding; write NOTHING, send NOTHING.
 *
 * Examples (from apps/web, with PROD env):
 *   # 1) Safe click-test to yourself — proves the durable sign-in URL, no claim:
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-founder-long-road-real.ts \
 *     --to ronindojodesign@gmail.com --next me
 *   # 2) Real send to Bob (binds bob-bass → auto-claims + grants comp on his next sign-in):
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-founder-long-road-real.ts \
 *     --to sbjjitsu30@gmail.com --next claim
 */

import { Brand } from "../.generated/prisma/client.js"
import { notifyFounderOfTheLongRoad } from "../lib/notifications"
import { bindPendingClaim, buildClaimSignInUrl } from "../server/web/lineage/mint-claim-magic-link"
import { db } from "../services/db"

type Next = "me" | "claim"

function parseArgs() {
  const opts = {
    to: "",
    nodeSlug: "",
    next: "me" as Next,
    baseUrl: "https://blackbeltlegacy.com",
    dryRun: false,
    resolveOnly: false,
    variant: "founder" as "founder" | "tony",
  }
  const argv = process.argv.slice(2)
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--to") opts.to = argv[++i] ?? ""
    else if (arg === "--node") opts.nodeSlug = argv[++i] ?? opts.nodeSlug
    else if (arg === "--next") {
      const v = argv[++i]
      if (v !== "me" && v !== "claim") throw new Error(`--next must be 'me' or 'claim' (got ${v})`)
      opts.next = v
    } else if (arg === "--base-url") opts.baseUrl = (argv[++i] ?? opts.baseUrl).replace(/\/+$/, "")
    else if (arg === "--dry-run") opts.dryRun = true
    else if (arg === "--resolve-only") opts.resolveOnly = true
    else if (arg === "--variant") {
      const v = argv[++i]
      if (v !== "founder" && v !== "tony") throw new Error(`--variant must be 'founder' or 'tony'`)
      opts.variant = v
    } else throw new Error(`Unknown argument: ${arg}`)
  }
  if (!opts.to) throw new Error("--to <email> is required")
  // Default the node to the variant's owner unless explicitly overridden.
  if (!opts.nodeSlug) opts.nodeSlug = opts.variant === "tony" ? "tony-hua" : "bob-bass"
  return opts
}

/** Resolve the founder node's DB id the same way the claim-accept route validates it. */
async function resolveClaimableNodeId(nodeSlug: string): Promise<string> {
  const member = await db.lineageTreeMember.findFirst({
    where: {
      node: { slug: nodeSlug },
      isClaimable: true,
      tree: { brand: Brand.BBL, isPublished: true, isClaimable: true },
    },
    select: { nodeId: true, tree: { select: { name: true } } },
  })
  if (!member) {
    throw new Error(
      `No claimable member for node slug "${nodeSlug}" on a published, claimable BBL tree. ` +
        `The claim link would bounce to the join form — aborting.`,
    )
  }
  console.log(`🔎 Resolved node "${nodeSlug}" → id ${member.nodeId} (tree: ${member.tree.name})`)
  return member.nodeId
}

async function main() {
  const opts = parseArgs()

  if (opts.resolveOnly) {
    const nodeId = await resolveClaimableNodeId(opts.nodeSlug)
    console.log(`✅ Prod connectivity OK — "${opts.nodeSlug}" is claimable (node id ${nodeId}).`)
    return
  }

  console.log(
    `📨 "Long Road" REAL send → ${opts.to} | variant=${opts.variant} | node=${opts.nodeSlug} | next=${opts.next} | base=${opts.baseUrl}` +
      (opts.dryRun ? " | DRY RUN" : ""),
  )

  // SESSION_0513: the email now links to a durable, public sign-in URL (no one-shot token).
  // The claim happens via the email→node binding + the sign-in reconciliation, NOT via the
  // redirect target — so `--next me` (safe click-test to yourself) binds NOTHING (pure sign-in),
  // while `--next claim` binds the recipient's node so it auto-claims on their next sign-in.
  const claimUrl = buildClaimSignInUrl(opts.baseUrl)
  console.log(`🔗 Sign-in URL: ${claimUrl}`)

  if (opts.dryRun) {
    // Dry run must not write to the DB — resolve + report the would-be binding, but do NOT bind.
    if (opts.next === "claim") {
      const nodeId = await resolveClaimableNodeId(opts.nodeSlug)
      console.log(`🔗 Would bind pending claim: ${opts.to} → node ${nodeId}`)
    } else {
      console.log("🔗 No node bound (--next me): a plain sign-in test, no claim.")
    }
    console.log("🧪 DRY RUN — no binding written, email NOT sent.")
    return
  }

  if (opts.next === "claim") {
    const nodeId = await resolveClaimableNodeId(opts.nodeSlug)
    await bindPendingClaim(opts.to, nodeId)
    console.log(`🔗 Bound pending claim: ${opts.to} → node ${nodeId} (auto-claims on next sign-in)`)
  } else {
    console.log("🔗 No node bound (--next me): a plain sign-in test, no claim.")
  }

  const res = await notifyFounderOfTheLongRoad({
    brand: Brand.BBL,
    to: opts.to,
    claimUrl,
    variant: opts.variant,
  })
  const id = (res as { data?: { id?: string } } | undefined)?.data?.id
  if (res && (res as { error?: unknown }).error) {
    console.error("❌ Resend error:", (res as { error?: unknown }).error)
    process.exitCode = 1
  } else if (id) {
    console.log(`✅ Sent — Resend id ${id}`)
  } else {
    console.warn("⚠️ No id and no error — send may have been skipped (no RESEND_API_KEY?).")
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
