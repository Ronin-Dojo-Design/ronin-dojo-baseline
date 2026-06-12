import type { Metadata } from "next"
import { Shell } from "~/components/app/shell"
import { hasAnyLineageGrant, requireUser } from "~/lib/auth-guard"

export const metadata: Metadata = {
  title: "Dashboard",
}

export const dynamic = "force-dynamic"

// Upstream wraps this layout in an AIProvider for the AI dashboard features —
// not a Ronin lane yet, so it's omitted (not stubbed) until that lane lands.
export default async function ({ children }: LayoutProps<"/app">) {
  const user = await requireUser()
  const hasLineageGrant = await hasAnyLineageGrant(user.id)

  return (
    <Shell user={user} hasLineageGrant={hasLineageGrant}>
      {children}
    </Shell>
  )
}
