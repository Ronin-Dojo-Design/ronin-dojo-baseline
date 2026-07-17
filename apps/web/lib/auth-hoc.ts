import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getServerSession, type Session } from "~/lib/auth"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

type WithAuthHandler = (req: NextRequest, session: Session) => Promise<Response>

/**
 * A higher order function that wraps a handler with authentication.
 * @param handler - The handler to wrap.
 * @returns A new handler that checks for authentication.
 */
export const withAuth = (handler: WithAuthHandler) => {
  return async (req: NextRequest) => {
    const session = await getServerSession(req)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return handler(req, session)
  }
}

/**
 * A higher order function that wraps a handler with admin authentication.
 * @param handler - The handler to wrap.
 * @returns A new handler that checks for admin authentication.
 */
export const withAdminAuth = (handler: WithAuthHandler) => {
  return withAuth(async (req, session) => {
    if (!can(session.user, APP_AREA_PERMISSIONS.content)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return handler(req, session)
  })
}
