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
  /**
   * Show the "Change promoter..." item. Requires `onChangePromoter` to actually
   * fire — without a handler the item is hidden, since a silent fallback to
   * View Profile masks editor intent (SESSION_0329 / petey-plan-0305 Phase 3c).
   */
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
  const showChangePromoter = Boolean(canChangePromoter && onChangePromoter)
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
          {/* Base UI Menu.Item activates on onClick (which it synthesizes on keyboard
              Enter/Space too); it has no onSelect prop (SESSION_0333/0334). */}
          <DropdownMenuItem onClick={onViewProfile}>
            <UserRoundIcon />
            View profile
          </DropdownMenuItem>

          {showChangePromoter && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onChangePromoter}>
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
