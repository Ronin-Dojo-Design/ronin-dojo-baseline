import type { PropsWithChildren } from "react"
import { Sidebar } from "~/components/app/sidebar"
import type { SessionUser } from "~/server/orpc/context"

type ShellProps = PropsWithChildren<{
  user: SessionUser | null
  /**
   * Ronin delta (SOT-ADR D4): whether the user holds any active
   * `LineageTreeAccess` grant. Computed server-side in the `/app` layout and
   * used by the sidebar to show the Lineage area to stewards who have no flat
   * role permission (mirrors `requireLineageAccess` in `lib/auth-guard.ts`).
   */
  hasLineageGrant: boolean
}>

export const Shell = ({ user, hasLineageGrant, children }: ShellProps) => {
  return (
    <div className="flex items-stretch size-full">
      <Sidebar user={user} hasLineageGrant={hasLineageGrant} />

      <div className="grid content-start gap-4 flex-1 p-4 sm:px-6">{children}</div>
    </div>
  )
}
