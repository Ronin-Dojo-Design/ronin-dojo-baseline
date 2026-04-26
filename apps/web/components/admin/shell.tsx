import type { PropsWithChildren } from "react"
import { Sidebar } from "~/components/admin/sidebar"

export const Shell = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex items-stretch size-full">
      <Sidebar />

      <div className="grid content-start gap-4 flex-1 p-4 sm:px-6">{children}</div>
    </div>
  )
}
