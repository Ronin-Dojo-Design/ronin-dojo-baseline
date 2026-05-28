import { notFound } from "next/navigation"
import type { FunctionComponent } from "react"
import { getServerSession } from "~/lib/auth"
import { db } from "~/services/db"

/**
 * A higher order function that wraps a page component with admin authentication.
 * Non-admins get a 404 to avoid revealing that admin routes exist.
 * @param Component - The page component to wrap.
 * @returns A new component that checks for admin authentication.
 */
export const withAdminPage = (Component: FunctionComponent<any>) => {
  return async function AdminProtectedPage(props: any) {
    const session = await getServerSession()

    if (session?.user.role !== "admin") {
      notFound()
    }

    return <Component {...props} />
  }
}

export async function hasLineageAdminAccess(userId: string, role?: string | null) {
  if (role === "admin") return true

  const grant = await db.lineageTreeAccess.findFirst({
    where: {
      userId,
      role: "TREE_ADMIN",
      revokedAt: null,
    },
    select: { id: true },
  })

  return Boolean(grant)
}

export const withLineageAdminPage = (Component: FunctionComponent<any>) => {
  return async function LineageAdminProtectedPage(props: any) {
    const session = await getServerSession()

    if (!session?.user || !(await hasLineageAdminAccess(session.user.id, session.user.role))) {
      notFound()
    }

    return <Component {...props} />
  }
}

/**
 * Wraps a page component with tournament-admin authentication.
 * Allows users with role "admin" or "tournament_director". Others get a 404.
 */
export const withTournamentAdminPage = (Component: FunctionComponent<any>) => {
  return async function TournamentAdminProtectedPage(props: any) {
    const session = await getServerSession()
    const role = session?.user.role

    if (role !== "admin" && role !== "tournament_director") {
      notFound()
    }

    return <Component {...props} />
  }
}
