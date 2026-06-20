/**
 * send-founder-long-road-real.ts (SESSION_0418)
 *
 * Sends the founder "Long Road" email with a REAL, single-use, email-bound magic
 * link minted via `mintClaimMagicLink` — unlike `send-founder-long-road-test.ts`,
 * which carries a placeholder token purely for visual review.
 *
 * ⚠ Run against PRODUCTION env so the token lands in the DB the deployed app reads
 *   (DATABASE_URL=prod), the send uses the BBL domain (RESEND_SENDER_EMAIL_BBL),
 *   and the preview hop uses the live gate token (BBL_PREVIEW_TOKEN). A token minted
 *   against a different DB than the deployed app will 404 on click.
 *
 * The claim-accept route validates `?node` as a DATABASE ID (not the slug), so this
 * resolves the founder node's real id via the same tree↔member↔node validation the
 * route itself uses — guaranteeing the link targets a claimable member of a
 * published, claimable BBL tree.
 *
 * SAFETY:
 *   --next me     → after sign-in the link lands on /me (NO claim). Use for a
 *                   click-test to yourself so you never claim the founder node as
 *                   the tester.
 *   --next claim  → the link one-click claims --node (default: bob-bass). The real
 *                   send to Bob.
 *   --dry-run     → mint + print the URL; do NOT send the email.
 *
 * Examples (from apps/web, with PROD env):
 *   # 1) Safe click-test to yourself — proves verify → session → preview → /me:
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-founder-long-road-real.ts \
 *     --to ronindojodesign@gmail.com --next me
 *   # 2) Real send to Bob (claims bob-bass, grants comp per the claim flow):
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-founder-long-road-real.ts \
 *     --to sbjjitsu30@gmail.com --next claim
 */

import { Brand } from "../.generated/prisma/client.js"
import { getBblPreviewToken } from "../lib/bbl-preview"
import { notifyFounderOfTheLongRoad } from "../lib/notifications"
import {
  FREE_SIGNUP_NEXT_PATH,
  claimAcceptNextPath,
  mintClaimMagicLink,
} from "../server/web/lineage/mint-claim-magic-link"
import { db } from "../services/db"

type Next = "me" | "claim"

function parseArgs() {
  const opts = {
    to: "",
    nodeSlug: "bob-bass",
    next: "me" as Next,
    baseUrl: "https://blackbeltlegacy.com",
    dryRun: false,
    resolveOnly: false,
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
    else throw new Error(`Unknown argument: ${arg}`)
  }
  if (!opts.to) throw new Error("--to <email> is required")
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

  const previewToken = getBblPreviewToken()

  const nextPath =
    opts.next === "claim"
      ? claimAcceptNextPath(await resolveClaimableNodeId(opts.nodeSlug))
      : FREE_SIGNUP_NEXT_PATH

  console.log(
    `📨 Founder "Long Road" REAL send → ${opts.to} | next=${opts.next} | base=${opts.baseUrl}` +
      (opts.dryRun ? " | DRY RUN" : ""),
  )

  const claimUrl = await mintClaimMagicLink({
    baseUrl: opts.baseUrl,
    email: opts.to,
    nextPath,
    previewToken,
  })
  console.log(`🔗 Minted: ${claimUrl}`)

  if (opts.dryRun) {
    console.log("🧪 DRY RUN — token minted, email NOT sent.")
    return
  }

  const res = await notifyFounderOfTheLongRoad({ brand: Brand.BBL, to: opts.to, claimUrl })
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
