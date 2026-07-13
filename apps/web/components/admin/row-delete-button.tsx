"use client"

import { TrashIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { cx } from "~/lib/utils"

/**
 * The trailing icon-only red trash button that opens a row's `DeleteDialog` (WL-P2-54). Hoisted
 * from the identical blog/tools inline buttons; standardizes the trash on `aria-label="Delete"`
 * (a deliberate a11y win — tools previously shipped it unlabelled). Forwards `className` and
 * `{...props}` onto the button so it composes as a `DeleteDialog` trigger exactly as the raw
 * `Button` did.
 */
export const RowDeleteButton = ({ className, ...props }: ComponentProps<typeof Button>) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      prefix={<TrashIcon />}
      aria-label="Delete"
      className={cx("text-red-500", className)}
      {...props}
    />
  )
}
