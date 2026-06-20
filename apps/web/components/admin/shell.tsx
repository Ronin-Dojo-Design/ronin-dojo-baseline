import type { PropsWithChildren } from "react"
import { CommandPalette } from "~/components/admin/command-palette"
import { Sidebar } from "~/components/admin/sidebar"

type ShellProps = PropsWithChildren<{
  userRole?: string
}>

export const Shell = ({ children, userRole }: ShellProps) => {
  return (
    <div className="flex items-stretch size-full">
      <Sidebar userRole={userRole} />

      {/* min-w-0 lets this flex child shrink below its content's intrinsic width;
          grid-cols-1 (minmax(0,1fr)) keeps the single column from being widened by
          wide descendants (tables, <pre>, long mono strings) — together they stop the
          known horizontal-overflow blowout on narrow (390px) viewports. */}
      <div className="grid min-w-0 grid-cols-1 content-start gap-4 flex-1 p-4 sm:px-6">
        {children}
      </div>

      <CommandPalette userRole={userRole} />
    </div>
  )
}
