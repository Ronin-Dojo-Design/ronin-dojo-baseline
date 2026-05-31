"use client"

import { EllipsisVerticalIcon, UserRoundCogIcon, UserRoundIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { cx } from "~/lib/utils"

type LineageMemberActionsMenuProps = {
  displayName: string
  onViewProfile: () => void
  canChangePromoter?: boolean
  onChangePromoter?: () => void
  className?: string
}

export function LineageMemberActionsMenu({
  displayName,
  onViewProfile,
  canChangePromoter,
  onChangePromoter,
  className,
}: LineageMemberActionsMenuProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="xs"
        aria-label={`Open lineage actions for ${displayName}`}
        prefix={<EllipsisVerticalIcon />}
        className={cx("shrink-0", className)}
        disabled
      />
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            aria-label={`Open lineage actions for ${displayName}`}
            prefix={<EllipsisVerticalIcon />}
            className={cx("shrink-0", className)}
          />
        }
      />

      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Lineage</DropdownMenuLabel>
          <DropdownMenuItem onSelect={onViewProfile}>
            <UserRoundIcon />
            View profile
          </DropdownMenuItem>

          {canChangePromoter && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onChangePromoter ?? onViewProfile}>
                <UserRoundCogIcon />
                Change promoter...
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
