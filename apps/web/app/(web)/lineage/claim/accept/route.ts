import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "~/lib/auth"
import { acceptLineageClaimByToken } from "~/server/web/lineage/claim-accept-actions"

/**
 * BBL one-click token-bound claim accept route (SESSION_0412 FIX #3).
 *
 * This is the landing target of the emailed magic link's `callbackURL`. Better
 * Auth's `/api/auth/magic-link/verify` (outside the gated `(web)` group) verifies
 * the token, sets the session cookie, then redirects here. The emailed link
 * actually points the callbackURL at `/preview?token=…&next=/lineage/claim/accept?node=…`
 * so the self-arming preview route sets the `bbl_preview` cookie BEFORE this route
 * runs — that's what lets the recipient through the pre-launch countdown gate.
 * (Route handlers aren't wrapped by the `(web)` layout, so this route does NOT
 * itself arm preview; the magic link's preview hop does.)
 *
 * Security: the node id rides the URL, so the heavy lifting (re-validating the
 * node is a claimable BBL member, the Passport is accountless, the claimant owns
 * no other node) happens server-side in `acceptLineageClaimByToken`. This route
 * only translates the outcome into a redirect.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(request)

  // No session means the magic link was bad / expired (verify never set the cookie).
  // Send them to the manual join form so they can recover.
  if (!session?.user) {
    return NextResponse.redirect(new URL("/lineage/join", request.url))
  }

  const nodeId = request.nextUrl.searchParams.get("node")
  if (!nodeId) {
    return NextResponse.redirect(new URL("/lineage/join", request.url))
  }

  const result = await acceptLineageClaimByToken({ nodeId })

  // Guard failure (node taken, claimant already owns a node, not claimable, …) or a
  // validation error: fall back to the manual join form, preselecting the node so the
  // recipient at least sees the form for the profile they were invited to claim.
  if (result?.serverError || result?.validationErrors || !result?.data) {
    const fallback = new URL("/lineage/join", request.url)
    fallback.searchParams.set("node", nodeId)
    return NextResponse.redirect(fallback)
  }

  // Success (claimed or already-claimed replay): land on the claimant's own profile.
  return NextResponse.redirect(new URL("/me", request.url))
}
