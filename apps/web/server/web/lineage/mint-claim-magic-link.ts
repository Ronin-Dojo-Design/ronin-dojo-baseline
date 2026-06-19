import { auth } from "~/lib/auth"
import { db } from "~/services/db"

/**
 * Shared magic-link minter for the BBL self-serve claim / free-signup flow
 * (SESSION_0418). Extracted from `scripts/send-bbl-claim-emails.ts` so BOTH the
 * bulk announcement script AND the public Join-the-Legacy action mint the SAME
 * email-bound, single-use magic link.
 *
 * The recipient's click chain is:
 *   email link → /api/auth/magic-link/verify (sets the session cookie, outside
 *   the gated `(web)` group) → redirects to the `callbackURL`, which is the
 *   self-arming preview hop → /preview arms the `bbl_preview` cookie (past the
 *   pre-launch countdown gate) → redirects to `nextPath`. `nextPath` is either
 *   the token-accept route (`/lineage/claim/accept?node=…`, which one-click
 *   claims the node) or `/me` (a plain free signup that just needs an account).
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
export const FREE_SIGNUP_NEXT_PATH = "/me"

export async function mintClaimMagicLink(opts: {
  baseUrl: string
  email: string
  /** Where the recipient lands AFTER the preview hop — claim-accept route or `/me`. */
  nextPath: string
  previewToken: string
}): Promise<string> {
  const callbackURL = `/preview?token=${encodeURIComponent(opts.previewToken)}&next=${encodeURIComponent(opts.nextPath)}`

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

  // Build the verify URL on the BBL origin (not BETTER_AUTH_URL) so the emailed link
  // points at the recipient's brand host. The verify endpoint only needs token + callbackURL.
  const url = new URL("/api/auth/magic-link/verify", opts.baseUrl)
  url.searchParams.set("token", verification.identifier)
  url.searchParams.set("callbackURL", callbackURL)
  return url.toString()
}
