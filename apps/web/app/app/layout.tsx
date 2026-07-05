import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { Shell } from "~/components/app/shell"
import { MobileShell } from "~/components/web/nav/mobile-shell"
import { hasAnyLineageGrant, requireUser } from "~/lib/auth-guard"
import { getCurrentUserAvatar } from "~/server/web/account/current-user-avatar"

export const metadata: Metadata = {
  title: "Dashboard",
}

export const dynamic = "force-dynamic"

// Upstream wraps this layout in an AIProvider for the AI dashboard features —
// not a Ronin lane yet, so it's omitted (not stubbed) until that lane lands.
export default async function ({ children }: LayoutProps<"/app">) {
  const user = await requireUser()
  const [hasLineageGrant, userAvatarUrl] = await Promise.all([
    hasAnyLineageGrant(user.id),
    // Threaded to the demoted "More" drawer (NavSheet) inside MobileShell.
    getCurrentUserAvatar(Brand.BBL),
  ])

  return (
    <>
      <Shell user={user} hasLineageGrant={hasLineageGrant}>
        {children}
      </Shell>

      {/* Mobile chrome (B0/B1 v2): the bottom nav stays on across `/app` too, so a signed-in
          member never loses it walking into the console. Same server-resolved-permissions
          MobileShell as the `(web)` layout; all `md:hidden`, so the desktop console sidebar is
          untouched. The `/app` mobile icon rail is demoted (hidden) — this is the ONE mobile nav. */}
      <MobileShell userAvatarUrl={userAvatarUrl} />
    </>
  )
}
