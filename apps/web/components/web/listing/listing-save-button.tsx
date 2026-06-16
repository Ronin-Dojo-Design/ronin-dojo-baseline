"use client"

import { HeartIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { cx } from "~/lib/utils"

/**
 * ListingSaveButton — SESSION_0396. Generic Save affordance for listings whose entity is not yet
 * wired to the (currently tool-only) Bookmark model. Renders identically to the L1 Tool card's Save
 * button, sign-in-gated. Persisted saving for these entities awaits the Bookmark-model generalization
 * (Bookmark.toolId is required + the saved-items page depends on it — tracked as a follow-up).
 */

type ListingSaveButtonProps = Omit<ComponentProps<typeof Button>, "prefix"> & {
  label?: string
  showLabel?: boolean
}

export const ListingSaveButton = ({
  label = "Save",
  showLabel = true,
  className,
  size = "sm",
  variant = "secondary",
  ...props
}: ListingSaveButtonProps) => {
  const pathname = usePathname()
  const next = encodeURIComponent(pathname)

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size={size}
            variant={variant}
            prefix={<HeartIcon />}
            className={className}
            render={<Link href={`/auth/login?next=${next}`} />}
            {...props}
          >
            <span className={cx(!showLabel && "sr-only")}>{label}</span>
          </Button>
        }
      />
      <TooltipContent>Sign in to save this listing</TooltipContent>
    </Tooltip>
  )
}
