import { auth } from "~/lib/auth"
import { db } from "~/services/db"

/**
 * SESSION_0513: the claim/onboarding EMAILS no longer embed a magic-link token. A one-shot
 * `…/magic-link/verify?token=…` link (single-use, 7-day) was consumed by mail scanners /
 * late clicks → dead link (Tony Hua + Bob got "The Long Road" with a dead CTA). The durable
 * fix is `bindPendingClaim(email, nodeId)` + `buildClaimSignInUrl(baseUrl)`: bind the
 * email→node once (90-day TTL), and point the email at a plain `/auth/login` URL that never
 * expires. `lib/auth.ts` reconciliation claims the bound node on the recipient's NEXT sign-in
 * (Google OR magic link). `mintClaimMagicLink` (below) is RETAINED for any non-email caller but
 * is no longer what the email flows embed.
 *
 * Shared magic-link minter for the BBL self-serve claim / free-signup flow
 * (SESSION_0418). Extracted from `scripts/send-bbl-claim-emails.ts` so BOTH the
 * bulk announcement script AND the public Join-the-Legacy action mint the SAME
 * email-bound, single-use magic link.
 *
 * The recipient's click chain is:
 *   email link → /api/auth/magic-link/verify (sets the session cookie, outside the
 *   gated `(web)` group) → redirects straight to the `callbackURL` == `nextPath`,
 *   either the token-accept route (`/lineage/claim/accept?node=…`, which one-click
 *   claims the node) or `/app/profile` (a plain free signup that just needs an account).
 *
 * SESSION_0440: the callbackURL was previously wrapped in a `/preview?token=…&next=…`
 * countdown-gate-bypass hop, but that produced a NESTED `?` for claim links which Better
 * Auth's double-decoding `originCheck` rejected with INVALID_CALLBACK_URL (see the
 * callbackURL note in `mintClaimMagicLink`). The gate is hard-off now, so the hop is gone.
 *
 * We call Better-Auth's `signInMagicLink` ONLY to CREATE the verification token
 * (email-bound, single-use, plugin-managed expiry), passing
 * `metadata: { skipEmail: true }` so the generic login email is suppressed — the
 * caller ships its own branded email carrying this link. The freshly-created
 * token is read back from the same DB (storeToken defaults to "plain", so
 * `Verification.identifier` IS the token). `signInMagicLink` requires a `Headers`
 * object even outside a request, so we synthesize one pinned to the BBL host.
 *
 * ⚠ Callers MUST mint SERIAL (one recipient at a time): the `value contains
 * "email":"<email>"` read-back + `orderBy desc` can grab a sibling's token if
 * two mints interleave.
 *
 * Both `auth` and this read-back share the app `db` (a single DB), so the token
 * BA just committed is visible here — no cross-client pool surprises.
 */

/** Post-preview destination for a one-click claim of an existing node. */
export const claimAcceptNextPath = (nodeId: string) => `/lineage/claim/accept?node=${nodeId}`

/** Post-preview destination for a plain free signup (no node to claim). */
export const FREE_SIGNUP_NEXT_PATH = "/app/profile"

/** Generous-but-bounded window for an email→node pending claim (a founder may read slowly). */
const PENDING_CLAIM_TTL_MS = 90 * 24 * 60 * 60 * 1000

/** Pull the node id out of a claim-accept nextPath (`/lineage/claim/accept?node=<id>`), else null. */
const claimNodeIdFromNextPath = (nextPath: string): string | null => {
  const match = nextPath.match(/\/lineage\/claim\/accept\?node=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * SESSION_0513: persist an email→node pending-claim binding, keyed on a `nodeId` DIRECTLY.
 * This is THE durable claim primitive: the emailed link no longer carries a one-shot magic-link
 * token (a mail scanner or a late click consumed the single use → dead link, SESSION_0513). Instead
 * we bind the email→node here and point the email at a plain public sign-in URL; `lib/auth.ts`
 * `hooks.after` (`reconcilePendingLineageClaims`) claims the bound node on the recipient's NEXT
 * successful auth for this email — Google OR magic link, whichever they use.
 *
 * SAME scoping as always (SESSION_0419/0508 P0): only bind a node that is `isClaimable`, whose
 * passport is UNOWNED (`node.passport.userId: null` — never bind to a node someone already owns,
 * e.g. students who arrived via their instructor's `?node=` link), on a published + claimable tree.
 * The brand is read off that tree. If the node resolves to no claimable/unowned member, it's a
 * no-op. Re-arms on re-mint (extend window, clear consumption marker). 90-day TTL.
 *
 * Returns `true` when a binding was written, `false` on a no-op (missing/blank `nodeId`, or the node
 * resolved to no claimable/unowned member — e.g. it got claimed in the window between a caller's
 * pre-guard and this call). Callers that EMAIL off the back of the bind (the invite composer) MUST
 * check the result and abort the send on `false` so a recipient never gets a claim email that can
 * never reconcile. (SESSION_0515 TASK_03 / Doug LOW-1.)
 */
export async function bindPendingClaim(email: string, nodeId: string): Promise<boolean> {
  if (!nodeId) return false

  // Resolve the brand off the node's published, claimable tree (matches the claim's own scoping).
  // `passport.userId: null` — never bind a pending claim to a node someone already owns
  // (SESSION_0508 P0: students claim-bound to their instructor's claimed node).
  const member = await db.lineageTreeMember.findFirst({
    where: {
      nodeId,
      isClaimable: true,
      node: { passport: { userId: null } },
      tree: { isPublished: true, isClaimable: true },
    },
    select: { tree: { select: { brand: true } } },
  })
  if (!member) return false

  const normalizedEmail = email.trim().toLowerCase()
  const expiresAt = new Date(Date.now() + PENDING_CLAIM_TTL_MS)
  await db.lineagePendingClaim.upsert({
    where: { email_nodeId: { email: normalizedEmail, nodeId } },
    create: { email: normalizedEmail, nodeId, brand: member.tree.brand, expiresAt },
    // Re-arm on re-mint: extend the window and clear any prior consumption marker.
    update: { brand: member.tree.brand, expiresAt, consumedAt: null, consumedByUserId: null },
  })
  return true
}

/**
 * Build the durable, PUBLIC sign-in URL the claim/onboarding emails now link to (SESSION_0513).
 * No one-shot token — it points at `/auth/login`, which never expires and cannot be consumed by a
 * mail scanner. The node claim happens via the 90-day `bindPendingClaim` binding + the sign-in
 * reconciliation, NOT via this redirect target, so `nextPath` only decides where the (now-claimed)
 * user lands — `/app/profile` (their member workspace) is sufficient.
 *
 * `nextPath` MUST stay QUERY-FREE (a single relative segment). A `?node=` here would re-introduce
 * the Better-Auth callbackURL double-decode trap (a nested `?` → INVALID_CALLBACK_URL); the
 * reconciliation makes it unnecessary anyway.
 */
export function buildClaimSignInUrl(baseUrl: string, nextPath = "/app/profile"): string {
  const base = baseUrl.replace(/\/+$/, "")
  return `${base}/auth/login?next=${encodeURIComponent(nextPath)}`
}

/**
 * SESSION_0419 (legacy nextPath-keyed binding, retained for `mintClaimMagicLink`): persist an
 * email→node binding derived from a claim-accept nextPath. Only a claim-accept nextPath binds a
 * node; a free-signup nextPath (`/app/profile`) is a no-op. Delegates to `bindPendingClaim`.
 */
async function persistPendingClaimBinding(email: string, nextPath: string): Promise<void> {
  const nodeId = claimNodeIdFromNextPath(nextPath)
  if (!nodeId) return
  await bindPendingClaim(email, nodeId)
}

export async function mintClaimMagicLink(opts: {
  baseUrl: string
  email: string
  /** Where the recipient lands after verifying — the claim-accept route or `/app/profile`. */
  nextPath: string
}): Promise<string> {
  // The callbackURL MUST be a relative path with at most ONE query string. Better Auth's
  // magic-link `originCheck` runs `decodeURIComponent(ctx.query.callbackURL)` — a SECOND
  // decode on top of the framework's — then validates against a trusted-relative regex that
  // permits a single `?` only. The old `/preview?token=…&next=/lineage/claim/accept?node=<id>`
  // wrapper decoded to a callbackURL with a NESTED `?` (the `%3F` in `next` collapsed to a
  // literal `?`) → INVALID_CALLBACK_URL on every node claim. (The `/me` free-signup path
  // survived only because its `next` carried no query.) The preview hop is now vestigial — the
  // BBL countdown gate is hard-off (`isBblCountdownActive()` returns false; `BBL_COUNTDOWN`
  // unset in prod) — so point the callbackURL straight at the single-query destination.
  const callbackURL = opts.nextPath

  const host = new URL(opts.baseUrl).host
  const headers = new Headers({ host, "x-forwarded-host": host })

  await auth.api.signInMagicLink({
    headers,
    body: { email: opts.email, callbackURL, metadata: { skipEmail: true } },
  })

  // Read back the token BA just created for this email (plain storeToken → identifier == token).
  // The verification `value` is `JSON.stringify({ email, name })`, so anchor the match to the exact
  // `"email":"<email>"` JSON fragment — a bare `contains: email` could substring-match a DIFFERENT
  // recipient (e.g. `a@x.com` ⊂ `aa@x.com`). Combined with newest-first ordering this returns this
  // call's token (callers keep minting SERIAL — see the module note).
  const verification = await db.verification.findFirst({
    where: { value: { contains: `"email":"${opts.email}"` } },
    orderBy: { createdAt: "desc" },
    select: { identifier: true },
  })
  if (!verification) {
    throw new Error(`magic-link token not found for ${opts.email}`)
  }

  // Record the email→node binding so a non-magic-link sign-in (e.g. Google) still claims the node.
  await persistPendingClaimBinding(opts.email, opts.nextPath)

  // Build the verify URL on the BBL origin (not BETTER_AUTH_URL) so the emailed link
  // points at the recipient's brand host. The verify endpoint only needs token + callbackURL.
  const url = new URL("/api/auth/magic-link/verify", opts.baseUrl)
  url.searchParams.set("token", verification.identifier)
  url.searchParams.set("callbackURL", callbackURL)
  return url.toString()
}
