import type { PropsWithChildren } from "react"
import { Sidebar } from "~/components/admin/sidebar"

type ShellProps = PropsWithChildren<{
  userRole?: string
}>

export const Shell = ({ children, userRole }: ShellProps) => {
  return (
    <div className="flex items-stretch size-full">
      <Sidebar userRole={userRole} />

      <div className="grid content-start gap-4 flex-1 p-4 sm:px-6">{children}</div>
    </div>
  )
}
