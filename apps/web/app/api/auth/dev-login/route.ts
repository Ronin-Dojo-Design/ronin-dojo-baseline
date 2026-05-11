import { NextResponse } from "next/server"
import { env, isDev } from "~/env"
import { auth } from "~/lib/auth"
import { db } from "~/services/db"

/**
 * Dev-only auth bypass: GET /api/auth/dev-login
 *
 * Triggers a magic link, finds the token in the DB, and auto-verifies it
 * via Better-Auth's internal API (no self-fetch deadlock).
 *
 * ⚠️  NEVER enable in production — guarded by isDev + env var presence.
 */
export async function GET(request: Request) {
  if (!isDev || !env.DEV_LOGIN_USER_ID) {
    return NextResponse.json({ error: "Not available" }, { status: 404 })
  }

  const user = await db.user.findUnique({ where: { id: env.DEV_LOGIN_USER_ID } })
  if (!user?.email) {
    return NextResponse.json(
      { error: `User ${env.DEV_LOGIN_USER_ID} not found or has no email` },
      { status: 404 },
    )
  }

  // Step 1: Trigger magic link (sends email / logs to console)
  await auth.api.signInMagicLink({
    headers: request.headers,
    body: { email: user.email },
  })

  // Step 2: Find the verification token BA just created
  const verification = await db.verification.findFirst({
    where: { value: { contains: user.email } },
    orderBy: { createdAt: "desc" },
  })

  if (!verification) {
    return NextResponse.json({ error: "Verification token not found" }, { status: 500 })
  }

  // Step 3: Verify via auth.api (in-process, no self-fetch deadlock)
  // BA throws an APIError with status "FOUND" (302) containing the session cookies
  try {
    const verifyResponse = await auth.api.magicLinkVerify({
      headers: request.headers,
      query: { token: verification.identifier, callbackURL: "/me" },
    })
    return verifyResponse
  } catch (error: unknown) {
    // BA's redirect is thrown as an APIError — extract cookies and redirect
    const err = error as { headers?: Headers; statusCode?: number }
    if (err.statusCode === 302 && err.headers) {
      const response = NextResponse.redirect(new URL("/me", env.BETTER_AUTH_URL))
      const setCookies = err.headers.getSetCookie?.() ?? []
      for (const cookie of setCookies) {
        response.headers.append("Set-Cookie", cookie)
      }
      return response
    }
    throw error
  }
}
