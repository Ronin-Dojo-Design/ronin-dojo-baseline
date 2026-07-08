import "dotenv/config"

import { render } from "@react-email/components"
import { writeFileSync } from "node:fs"
import { Brand, Prisma } from "~/.generated/prisma/client"
import { EmailBblFirstTesterWelcome } from "~/emails/bbl-first-tester-welcome"

/**
 * SESSION_0420 — the warm, personal thank-you to Brian Truelson, a long-time
 * loyal member and Black Belt Legacy's FIRST non-admin tester. This one script
 * carries every step of the outreach, each behind its own explicit flag so a
 * prod write or an outward send NEVER happens by accident:
 *
 *   # 0. Render the email to /tmp (no DB, no send) — review the exact HTML.
 *   SKIP_ENV_VALIDATION=1 bun scripts/send-bbl-truelson-thankyou.ts --dry-run
 *
 *   # 1. Verify the claim flow end-to-end in a ROLLED-BACK prod tx (no changes).
 *   bun scripts/send-bbl-truelson-thankyou.ts --verify
 *
 *   # 2. Backfill the email->node binding so ANY sign-in auto-claims.
 *   bun scripts/send-bbl-truelson-thankyou.ts --backfill
 *
 *   # 3. Grant LIFETIME Elite comp (LINEAGE_PREMIUM + LINEAGE_ELITE, no expiry).
 *   bun scripts/send-bbl-truelson-thankyou.ts --grant --grantor-email <admin@…>
 *
 *   # 4. Mint his one-click claim link + send via Resend (report the id).
 *   bun scripts/send-bbl-truelson-thankyou.ts --send
 *
 * Steps 1–4 require prod credentials in the environment (DATABASE_URL = Neon;
 * --send also needs RESEND_API_KEY + RESEND_SENDER_EMAIL_BBL).
 * Flags may be combined; they run in the order verify -> backfill -> grant -> send.
 */

const TARGET = {
  email: "btruelson@gmail.com",
  recipientName: "Brian",
  nodeSlug: "brian-truelson",
  brand: Brand.BBL,
  baseUrl: "https://blackbeltlegacy.com",
} as const

const args = process.argv.slice(2)
const has = (flag: string) => args.includes(flag)
const flagValue = (flag: string) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const mode = {
  dryRun: has("--dry-run"),
  verify: has("--verify"),
  backfill: has("--backfill"),
  grant: has("--grant"),
  send: has("--send"),
}

// SESSION_0513: the durable, public sign-in URL the email now links to (no one-shot token).
const PLACEHOLDER_CLAIM_URL = `${TARGET.baseUrl}/auth/login?next=%2Fme`

/** Render the email to /tmp with a placeholder link — no DB, no send. */
async function renderDryRun(): Promise<void> {
  const html = await render(
    EmailBblFirstTesterWelcome({
      to: TARGET.email,
      recipientName: TARGET.recipientName,
      claimUrl: PLACEHOLDER_CLAIM_URL,
    }),
  )
  const out = "/tmp/bbl-first-tester-welcome.html"
  writeFileSync(out, html)
  console.log(
    `🧪 DRY RUN — ${TARGET.recipientName} <${TARGET.email}> | ${html.length} chars → ${out}`,
  )
}

type ResolvedNode = {
  nodeId: string
  passportId: string
  passportUserId: string | null
  profileName: string
  treePublished: boolean
  treeClaimable: boolean
  isClaimableMember: boolean
  dirtyDozenLabel: string | null
}

/** Resolve brian-truelson's claimable lineage node (node slug -> profile slug). */
// biome-ignore lint/suspicious/noExplicitAny: app Prisma client surface.
async function resolveNode(db: any): Promise<ResolvedNode | null> {
  const select = {
    id: true,
    passportId: true,
    passport: { select: { displayName: true, userId: true } },
  } as const

  let node = await db.lineageNode.findUnique({ where: { slug: TARGET.nodeSlug }, select })
  if (!node) {
    const profile = await db.directoryProfile.findUnique({
      where: { slug: TARGET.nodeSlug },
      select: { passport: { select: { lineageNode: { select } } } },
    })
    node = profile?.passport?.lineageNode ?? null
  }
  if (!node) return null

  // A node can belong to several trees — e.g. the leftover unpublished
  // `rigan-machado-bjj-lineage` clone trees from the PR #162 consolidation. The claim
  // succeeds via the node's PUBLISHED + claimable membership (`claimNodeForUser` resolves
  // it), so prefer that membership for the guard; fall back to any membership so the
  // report still renders when none is published. Using a bare `findFirst` here was a
  // false-negative: it could pick an unpublished clone-tree row and fail the guard for a
  // node that is genuinely claimable on the published tree (SESSION_0453).
  const memberSelect = {
    isClaimable: true,
    tree: { select: { isPublished: true, isClaimable: true } },
    visualGroup: { select: { label: true } },
  } as const
  const member =
    (await db.lineageTreeMember.findFirst({
      // Match `claimNodeForUser`'s resolver exactly, incl. the brand scope: same-slug clone
      // trees can be brand-distinct (`LineageTree @@unique([brand, slug])`), so a brandless
      // query could flag a published membership on the wrong brand's tree.
      where: {
        nodeId: node.id,
        isClaimable: true,
        tree: { brand: TARGET.brand, isPublished: true, isClaimable: true },
      },
      select: memberSelect,
    })) ??
    (await db.lineageTreeMember.findFirst({ where: { nodeId: node.id }, select: memberSelect }))

  return {
    nodeId: node.id,
    passportId: node.passportId,
    passportUserId: node.passport?.userId ?? null,
    profileName: node.passport?.displayName ?? TARGET.nodeSlug,
    treePublished: Boolean(member?.tree?.isPublished),
    treeClaimable: Boolean(member?.tree?.isClaimable),
    isClaimableMember: Boolean(member?.isClaimable),
    dirtyDozenLabel: member?.visualGroup?.label ?? null,
  }
}

/**
 * Verify the claim would succeed — exactly the SESSION_0419 (Tony) pattern, but
 * for an account that may not exist yet: report node/passport/account state, then
 * run `claimNodeForUser` inside a ROLLED-BACK Serializable tx (real account if
 * present, else a synthetic throwaway user) and assert it CLAIMS + grants comp.
 * Nothing is persisted.
 */
async function verify(): Promise<void> {
  const { db } = await import("~/services/db")
  const { claimNodeForUser, CLAIM_NODE_RESULT } =
    await import("~/server/web/lineage/claim-node-for-user")

  const normalizedEmail = TARGET.email.trim().toLowerCase()
  const resolved = await resolveNode(db)
  if (!resolved) {
    console.error(`❌ VERIFY — no lineage node resolved for slug "${TARGET.nodeSlug}"`)
    process.exitCode = 1
    return
  }

  const account = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    select: { id: true, email: true, emailVerified: true, banned: true, role: true },
  })

  console.log("🔎 VERIFY — node + claimability")
  console.table({
    profileName: resolved.profileName,
    nodeId: resolved.nodeId,
    passportId: resolved.passportId,
    passportUnclaimed: resolved.passportUserId === null,
    isClaimableMember: resolved.isClaimableMember,
    treePublished: resolved.treePublished,
    treeClaimable: resolved.treeClaimable,
    visualGroup: resolved.dirtyDozenLabel ?? "(none)",
  })
  console.log("🔎 VERIFY — account state for", normalizedEmail)
  console.table(
    account
      ? {
          exists: true,
          userId: account.id,
          email: account.email,
          emailVerified: account.emailVerified,
          banned: account.banned ?? false,
          role: account.role ?? "(none)",
        }
      : { exists: false, note: "no account yet — claim happens on first sign-in" },
  )

  const guardsOk =
    resolved.passportUserId === null &&
    resolved.isClaimableMember &&
    resolved.treePublished &&
    resolved.treeClaimable
  if (!guardsOk) {
    console.error("❌ VERIFY — node-side guards FAIL; claim would NOT succeed. Stop here.")
    process.exitCode = 1
    return
  }

  // Rolled-back end-to-end simulation. Use the real account if present; otherwise a
  // synthetic throwaway user created inside the same tx. A sentinel error guarantees
  // rollback so NOTHING is persisted.
  class Rollback extends Error {}
  let simulated: { outcome: string; compGrantIds: number } | null = null
  try {
    await db.$transaction(
      // biome-ignore lint/suspicious/noExplicitAny: tx client.
      async (tx: any) => {
        let userId = account?.id as string | undefined
        if (!userId) {
          const temp = await tx.user.create({
            data: {
              id: `verify_${Date.now()}`,
              email: `verify_${Date.now()}@brian-truelson.invalid`,
              name: "verify-throwaway",
              emailVerified: true,
            },
            select: { id: true },
          })
          userId = temp.id
        }
        const result = await claimNodeForUser(tx, {
          userId: userId as string,
          nodeId: resolved.nodeId,
          brand: TARGET.brand,
        })
        const grants = await tx.userEntitlement.findMany({
          where: { userId, status: "ACTIVE" },
          select: { id: true },
        })
        simulated = { outcome: result.outcome, compGrantIds: grants.length }
        throw new Rollback()
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (error) {
    if (!(error instanceof Rollback)) {
      console.error("❌ VERIFY — rolled-back claim simulation THREW:", error)
      process.exitCode = 1
      return
    }
  }

  if (simulated && (simulated as { outcome: string }).outcome === CLAIM_NODE_RESULT.CLAIMED) {
    console.log(
      `✅ VERIFY — claimNodeForUser would CLAIM (rolled back; ${(simulated as { compGrantIds: number }).compGrantIds} entitlement(s) granted in-sim). No changes persisted.`,
    )
  } else {
    console.error("❌ VERIFY — simulation did not reach CLAIMED:", simulated)
    process.exitCode = 1
  }
}

/** Upsert the email->node pending-claim binding so ANY sign-in auto-claims (no expiry). */
async function backfill(): Promise<void> {
  const { db } = await import("~/services/db")
  const resolved = await resolveNode(db)
  if (!resolved) {
    console.error(`❌ BACKFILL — no node for "${TARGET.nodeSlug}"`)
    process.exitCode = 1
    return
  }
  const normalizedEmail = TARGET.email.trim().toLowerCase()
  const row = await db.lineagePendingClaim.upsert({
    where: { email_nodeId: { email: normalizedEmail, nodeId: resolved.nodeId } },
    create: {
      email: normalizedEmail,
      nodeId: resolved.nodeId,
      brand: TARGET.brand,
      expiresAt: null,
    },
    update: { brand: TARGET.brand, expiresAt: null, consumedAt: null, consumedByUserId: null },
    select: { id: true, email: true, nodeId: true, expiresAt: true },
  })
  console.log("✅ BACKFILL — LineagePendingClaim upserted (expiresAt: null = never):")
  console.table(row)
}

/** Grant LIFETIME Elite comp (LINEAGE_PREMIUM + LINEAGE_ELITE, no expiry) to Brian's account. */
async function grant(): Promise<void> {
  const { db } = await import("~/services/db")
  const { grantComp } = await import("~/server/entitlements/comp-grants")
  const { getLineageCompEntitlementKeys, LINEAGE_ELITE_ENTITLEMENT_KEY } =
    await import("~/lib/entitlements/lineage-comp")

  const normalizedEmail = TARGET.email.trim().toLowerCase()
  const grantee = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    select: { id: true },
  })
  if (!grantee) {
    console.error(
      `❌ GRANT — no account for ${normalizedEmail}. A userId is required to hold the comp.\n` +
        "   Brian has not signed in yet. Either (a) run --backfill so his claim auto-grants Elite\n" +
        "   on first sign-in (1yr by default), then re-run --grant to upgrade it to lifetime, or\n" +
        "   (b) wait until he has signed in and re-run --grant.",
    )
    process.exitCode = 1
    return
  }

  const grantorEmail = flagValue("--grantor-email")?.trim().toLowerCase()
  const grantor = grantorEmail
    ? await db.user.findFirst({
        where: { email: { equals: grantorEmail, mode: "insensitive" } },
        select: { id: true },
      })
    : await db.user.findFirst({
        where: { role: "admin" },
        select: { id: true },
      })
  if (!grantor) {
    console.error("❌ GRANT — no grantor resolved. Pass --grantor-email <admin email>.")
    process.exitCode = 1
    return
  }

  const result = await grantComp({
    db,
    brand: TARGET.brand,
    grantorUserId: grantor.id,
    granteeUserId: grantee.id,
    entitlementKeys: getLineageCompEntitlementKeys(LINEAGE_ELITE_ENTITLEMENT_KEY),
    term: null, // lifetime — no expiry
    reason: "bbl-loyal-first-tester-lifetime-gift",
  })
  console.log("✅ GRANT — LIFETIME Elite comp granted (endsAt: null):")
  console.table(result.grants)
}

/** Bind the durable claim + build the public sign-in link, then send the email via Resend. */
async function send(): Promise<void> {
  const { db } = await import("~/services/db")
  const { bindPendingClaim, buildClaimSignInUrl } =
    await import("~/server/web/lineage/mint-claim-magic-link")
  const { notifyMemberOfBblFirstTesterWelcome } = await import("~/lib/notifications")

  // Test overrides (SESSION_0439): --to redirects the send to a throwaway inbox, and
  // --free-signup binds NOTHING — so a test click only signs in and NEVER claims Brian's node.
  const toEmail = (flagValue("--to") ?? TARGET.email).trim()
  const freeSignup = has("--free-signup")

  const resolved = await resolveNode(db)
  if (!resolved) {
    console.error(`❌ SEND — no node for "${TARGET.nodeSlug}"`)
    process.exitCode = 1
    return
  }
  if (!freeSignup && resolved.passportUserId) {
    console.error("❌ SEND — node already claimed; aborting (will not re-bind).")
    process.exitCode = 1
    return
  }

  // SESSION_0513: bind the email→node durably (auto-claims on Brian's next sign-in) and link the
  // email to the public sign-in URL — no one-shot magic-link token to be consumed by a scanner.
  if (!freeSignup) {
    await bindPendingClaim(toEmail, resolved.nodeId)
  }
  const claimUrl = buildClaimSignInUrl(TARGET.baseUrl)
  console.log(
    `📤 SEND — to=${toEmail} | claimUrl=${claimUrl}${freeSignup ? " (FREE-SIGNUP test — no claim bound)" : ` (bound node ${resolved.nodeId})`}`,
  )

  const res = await notifyMemberOfBblFirstTesterWelcome({
    brand: TARGET.brand,
    to: toEmail,
    recipientName: TARGET.recipientName,
    claimUrl,
  })
  const id = (res as { data?: { id?: string } } | undefined)?.data?.id
  const err = (res as { error?: unknown } | undefined)?.error
  if (err) {
    console.error(`❌ SEND — ${toEmail}:`, err)
    process.exitCode = 1
  } else if (id) {
    console.log(`✅ SEND — ${toEmail} — Resend id ${id}`)
  } else {
    console.warn(`⚠️ SEND — no id/error (rate-limited or RESEND_API_KEY unset?)`)
  }
}

async function main() {
  if (!mode.dryRun && !mode.verify && !mode.backfill && !mode.grant && !mode.send) {
    console.log(
      "No mode flag given. Use --dry-run | --verify | --backfill | --grant | --send.\n" +
        "Safe default does nothing. See the header for the per-step commands.",
    )
    return
  }
  if (mode.dryRun) await renderDryRun()
  if (mode.verify) await verify()
  if (mode.backfill) await backfill()
  if (mode.grant) await grant()
  if (mode.send) await send()
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
