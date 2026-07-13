"use client"

import { EllipsisIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { cx } from "~/lib/utils"

type RowActionsMenuProps = ComponentProps<typeof Button> & {
  /** The per-surface `DropdownMenuItem` entries — owned by the caller, never parametrized here. */
  children: ReactNode
}

/**
 * The one kebab SHELL for admin row-action menus (WL-P2-54). Hoists the identical
 * `DropdownMenu` trigger button + content wrapper that blog/tools/leads each hand-rolled,
 * leaving the per-surface menu items to the caller. Forwards `className` (columns pass
 * `float-right`) and `{...props}` onto the trigger button so a migrated surface is
 * behavior-identical to its former inline shell.
 */
export const RowActionsMenu = ({ className, children, ...props }: RowActionsMenuProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Open menu"
            variant="secondary"
            size="sm"
            prefix={<EllipsisIcon />}
            className={cx("data-open:bg-accent", className)}
            {...props}
          />
        }
      />

      <DropdownMenuContent align="end" sideOffset={8}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
