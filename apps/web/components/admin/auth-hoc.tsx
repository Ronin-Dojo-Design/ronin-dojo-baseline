import { notFound } from "next/navigation"
import type { FunctionComponent } from "react"
import { getServerSession } from "~/lib/auth"

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
