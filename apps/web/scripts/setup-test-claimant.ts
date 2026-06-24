import "dotenv/config"

import { Brand, Prisma } from "~/.generated/prisma/client"

/**
 * SESSION_0440 — repeatable instant-claim TEST harness (the generalized, node-agnostic
 * sibling of `send-bbl-truelson-thankyou.ts`). Sets up a disposable account so the
 * operator can dogfood the Full A claim flow on prod exactly like a real founder:
 * bind an email -> an unclaimed node, sign in (Google or magic link), and the
 * `reconcilePendingLineageClaims` hook auto-claims it (CLAIMED_MINE → "This profile is
 * yours"). Every mode is behind an explicit flag; the safe default only reports.
 *
 *   # Inspect the account + node + binding (read-only).
 *   DATABASE_URL=<prod> SKIP_ENV_VALIDATION=1 bun scripts/setup-test-claimant.ts --status --node-slug cullet-eric
 *
 *   # Rolled-back claim simulation — proves the claim WOULD succeed (nothing persisted).
 *   ... bun scripts/setup-test-claimant.ts --verify --node-slug cullet-eric
 *
 *   # Reset any prior claim by this email on this node AND (re)bind it — the repeatable
 *   # "delete and replace" the operator asked for. Run again any time to re-test.
 *   ... bun scripts/setup-test-claimant.ts --bind --node-slug cullet-eric
 *
 *   # Just undo a claim (detach), leaving the node unclaimed and no binding.
 *   ... bun scripts/setup-test-claimant.ts --reset --node-slug cullet-eric
 *
 * `--email` overrides the default test address. Prod credentials (DATABASE_URL = Neon)
 * are required for every mode except a pure dry parse.
 */

const args = process.argv.slice(2)
const has = (flag: string) => args.includes(flag)
const flagValue = (flag: string) => {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

const EMAIL = (flagValue("--email") ?? "ronindojodesign@gmail.com").trim().toLowerCase()
const NODE_SLUG = flagValue("--node-slug")
const BRAND = Brand.BBL

const mode = {
  status: has("--status"),
  verify: has("--verify"),
  bind: has("--bind"),
  reset: has("--reset"),
  send: has("--send"),
}

type ResolvedNode = {
  nodeId: string
  passportId: string
  passportUserId: string | null
  treeId: string | null
  memberId: string | null
  profileName: string
  treePublished: boolean
  treeClaimable: boolean
  isClaimableMember: boolean
}

// biome-ignore lint/suspicious/noExplicitAny: app Prisma client surface.
async function resolveNode(db: any, slug: string): Promise<ResolvedNode | null> {
  const node = await db.lineageNode.findUnique({
    where: { slug },
    select: {
      id: true,
      passportId: true,
      passport: { select: { displayName: true, userId: true } },
    },
  })
  if (!node) return null

  const member = await db.lineageTreeMember.findFirst({
    where: { nodeId: node.id },
    select: {
      id: true,
      isClaimable: true,
      treeId: true,
      tree: { select: { isPublished: true, isClaimable: true } },
    },
  })

  return {
    nodeId: node.id,
    passportId: node.passportId,
    passportUserId: node.passport?.userId ?? null,
    treeId: member?.treeId ?? null,
    memberId: member?.id ?? null,
    profileName: node.passport?.displayName ?? slug,
    treePublished: Boolean(member?.tree?.isPublished),
    treeClaimable: Boolean(member?.tree?.isClaimable),
    isClaimableMember: Boolean(member?.isClaimable),
  }
}

// biome-ignore lint/suspicious/noExplicitAny: app Prisma client surface.
async function findUser(db: any) {
  return db.user.findFirst({
    where: { email: { equals: EMAIL, mode: "insensitive" } },
    select: { id: true, email: true, banned: true, role: true },
  })
}

async function status(): Promise<void> {
  const { db } = await import("~/services/db")
  const user = await findUser(db)
  console.log("👤 ACCOUNT —", EMAIL)
  console.table(
    user
      ? { exists: true, userId: user.id, banned: user.banned ?? false, role: user.role ?? "(none)" }
      : { exists: false, note: "no account yet — created on first sign-in" },
  )

  if (user) {
    const ownsNode = await db.lineageNode.findFirst({
      where: { passport: { userId: user.id } },
      select: { slug: true },
    })
    const claims = await db.passportClaimRequest.count({
      where: { claimantUserId: user.id, status: { in: ["PENDING", "APPROVED", "NEEDS_INFO"] } },
    })
    const ents = await db.userEntitlement.count({ where: { userId: user.id, status: "ACTIVE" } })
    console.table({
      ownsNode: ownsNode?.slug ?? "(none)",
      openClaims: claims,
      activeEntitlements: ents,
    })
  }

  if (NODE_SLUG) {
    const resolved = await resolveNode(db, NODE_SLUG)
    console.log("🌳 NODE —", NODE_SLUG)
    console.table(
      resolved
        ? {
            profileName: resolved.profileName,
            claimedByUserId: resolved.passportUserId ?? "(unclaimed)",
            isClaimableMember: resolved.isClaimableMember,
            treePublished: resolved.treePublished,
            treeClaimable: resolved.treeClaimable,
          }
        : { error: `no node for slug "${NODE_SLUG}"` },
    )
    const binding = await db.lineagePendingClaim.findFirst({
      where: { email: EMAIL, node: { slug: NODE_SLUG } },
      select: { id: true, expiresAt: true, consumedAt: true },
    })
    console.log("🔗 BINDING —", binding ? "present" : "none")
    if (binding) console.table(binding)
  }
}

/** Rolled-back end-to-end claim simulation (reuses the real core). Nothing persisted. */
async function verify(): Promise<void> {
  if (!NODE_SLUG) return fail("--verify requires --node-slug")
  const { db } = await import("~/services/db")
  const { claimNodeForUser, CLAIM_NODE_RESULT } =
    await import("~/server/web/lineage/claim-node-for-user")

  const resolved = await resolveNode(db, NODE_SLUG)
  if (!resolved) return fail(`no node for "${NODE_SLUG}"`)
  const user = await findUser(db)

  class Rollback extends Error {}
  let outcome: string | null = null
  try {
    await db.$transaction(
      // biome-ignore lint/suspicious/noExplicitAny: tx client.
      async (tx: any) => {
        let userId = user?.id as string | undefined
        if (!userId) {
          const temp = await tx.user.create({
            data: {
              id: `verify_${Date.now()}`,
              email: `verify_${Date.now()}@test.invalid`,
              name: "verify",
              emailVerified: true,
            },
            select: { id: true },
          })
          userId = temp.id
        }
        const result = await claimNodeForUser(tx, {
          userId: userId as string,
          nodeId: resolved.nodeId,
          brand: BRAND,
        })
        outcome = result.outcome
        throw new Rollback()
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (error) {
    if (!(error instanceof Rollback)) return fail(`rolled-back sim threw: ${error}`)
  }

  if (outcome === CLAIM_NODE_RESULT.CLAIMED) {
    console.log(
      `✅ VERIFY — would CLAIM "${resolved.profileName}" (rolled back; nothing persisted).`,
    )
  } else {
    fail(`simulation did not reach CLAIMED: ${outcome}`)
  }
}

/**
 * Undo any claim by EMAIL on the node: detach the Passport, revoke the node-editor grant,
 * delete the claimant's claim rows + their entitlements, and clear the binding's consumed
 * state. Leaves the node unclaimed and the account claim-free (passport-less is fine — the
 * next claim re-attaches). Idempotent.
 */
// biome-ignore lint/suspicious/noExplicitAny: app Prisma client surface.
async function resetClaim(db: any, resolved: ResolvedNode): Promise<void> {
  const user = await findUser(db)
  if (!user) {
    console.log("ℹ️  RESET — no account for", EMAIL, "(nothing claimed yet).")
    return
  }

  // Detach the claimed Passport IF this test user owns it (never touch someone else's claim).
  if (resolved.passportUserId === user.id) {
    await db.passport.update({ where: { id: resolved.passportId }, data: { userId: null } })
    console.log("   • detached Passport (userId → null)")
  }
  // Revoke node-editor access grant(s) for this user on this node.
  const grants = await db.lineageTreeAccess.deleteMany({
    where: { userId: user.id, nodeId: resolved.nodeId },
  })
  if (grants.count) console.log(`   • removed ${grants.count} access grant(s)`)
  // Drop the claim rows (evidence cascades) for this claimant on this Passport.
  await db.passportClaimEvidence.deleteMany({
    where: { claimRequest: { claimantUserId: user.id, passportId: resolved.passportId } },
  })
  const claims = await db.passportClaimRequest.deleteMany({
    where: { claimantUserId: user.id, passportId: resolved.passportId },
  })
  if (claims.count) console.log(`   • removed ${claims.count} claim row(s)`)
  // Remove the comp entitlements the claim granted (safe for a disposable test account).
  const ents = await db.userEntitlement.deleteMany({ where: { userId: user.id } })
  if (ents.count) console.log(`   • removed ${ents.count} entitlement(s)`)
  // Clear the binding's consumed state so a re-bind re-fires on next sign-in.
  await db.lineagePendingClaim.updateMany({
    where: { email: EMAIL, nodeId: resolved.nodeId },
    data: { consumedAt: null, consumedByUserId: null },
  })
}

async function reset(): Promise<void> {
  if (!NODE_SLUG) return fail("--reset requires --node-slug")
  const { db } = await import("~/services/db")
  const resolved = await resolveNode(db, NODE_SLUG)
  if (!resolved) return fail(`no node for "${NODE_SLUG}"`)
  console.log(`♻️  RESET — ${EMAIL} ✕ ${resolved.profileName}`)
  await resetClaim(db, resolved)
  console.log("✅ RESET — node is unclaimed; account is claim-free.")
}

/** Reset, then upsert the email→node binding (no expiry) so sign-in auto-claims. */
async function bind(): Promise<void> {
  if (!NODE_SLUG) return fail("--bind requires --node-slug")
  const { db } = await import("~/services/db")
  const resolved = await resolveNode(db, NODE_SLUG)
  if (!resolved) return fail(`no node for "${NODE_SLUG}"`)

  const guardsOk = resolved.isClaimableMember && resolved.treePublished && resolved.treeClaimable
  if (!guardsOk) {
    return fail(
      `node "${NODE_SLUG}" is not claimable (member=${resolved.isClaimableMember} published=${resolved.treePublished} treeClaimable=${resolved.treeClaimable})`,
    )
  }

  console.log(`🔧 BIND — ${EMAIL} → ${resolved.profileName} (${NODE_SLUG})`)
  await resetClaim(db, resolved)

  const row = await db.lineagePendingClaim.upsert({
    where: { email_nodeId: { email: EMAIL, nodeId: resolved.nodeId } },
    create: { email: EMAIL, nodeId: resolved.nodeId, brand: BRAND, expiresAt: null },
    update: { brand: BRAND, expiresAt: null, consumedAt: null, consumedByUserId: null },
    select: { id: true, email: true, nodeId: true, expiresAt: true },
  })
  console.log("✅ BIND — LineagePendingClaim ready (expiresAt: null = never):")
  console.table(row)
  console.log(
    `\n👉 Sign in at https://blackbeltlegacy.com as ${EMAIL} (Google or magic link) — it will auto-claim "${resolved.profileName}".`,
  )
}

/**
 * Reset any prior claim, mint a fresh claim-accept magic link (now-fixed callbackURL,
 * SESSION_0440), and email it via the real "Claim your Black Belt Legacy profile" notifier.
 * Needs RESEND_API_KEY + RESEND_SENDER_EMAIL_BBL in env (alongside DATABASE_URL).
 */
async function send(): Promise<void> {
  if (!NODE_SLUG) return fail("--send requires --node-slug")
  const { db } = await import("~/services/db")
  const { mintClaimMagicLink, claimAcceptNextPath } =
    await import("~/server/web/lineage/mint-claim-magic-link")
  const { notifyMemberOfBblClaimYourProfile } = await import("~/lib/notifications")

  const resolved = await resolveNode(db, NODE_SLUG)
  if (!resolved) return fail(`no node for "${NODE_SLUG}"`)

  // Re-testable: if this test user already claimed it, detach first so the fresh link re-claims.
  await resetClaim(db, resolved)

  const claimUrl = await mintClaimMagicLink({
    baseUrl: "https://blackbeltlegacy.com",
    email: EMAIL,
    nextPath: claimAcceptNextPath(resolved.nodeId),
  })
  console.log(`📤 SEND — claim link minted for ${EMAIL} → ${resolved.profileName}`)

  const res = await notifyMemberOfBblClaimYourProfile({
    brand: BRAND,
    to: EMAIL,
    firstName: "there",
    profileName: resolved.profileName,
    claimUrl,
    compTier: "ELITE",
    isLifetime: false,
  })
  const id = (res as { data?: { id?: string } } | undefined)?.data?.id
  console.log(
    id ? `✅ SEND — Resend id ${id}` : "⚠️ SEND — no id (rate-limited or RESEND key unset?)",
  )
}

function fail(msg: string): void {
  console.error("❌", msg)
  process.exitCode = 1
}

async function main() {
  if (!mode.status && !mode.verify && !mode.bind && !mode.reset && !mode.send) {
    console.log(
      "No mode flag. Use --status | --verify | --bind | --reset | --send (+ --node-slug <slug> [--email <e>]).",
    )
    return
  }
  if (mode.status) await status()
  if (mode.verify) await verify()
  if (mode.reset) await reset()
  if (mode.bind) await bind()
  if (mode.send) await send()
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
