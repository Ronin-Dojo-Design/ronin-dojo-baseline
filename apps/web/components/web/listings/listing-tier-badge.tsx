import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { tiersConfig } from "~/config/tiers"
import { cx } from "~/lib/utils"
import type { ToolMany, ToolOne } from "~/server/web/tools/payloads"

type ListingTierTool = Pick<ToolMany | ToolOne, "isFeatured" | "ownerId" | "tier" | "tierPriority">
type BadgeProps = ComponentProps<typeof Badge>
type BadgeVariant = BadgeProps["variant"]

type ListingTierBadgeProps = Pick<BadgeProps, "size" | "variant"> & {
  tool: ListingTierTool
  className?: string
}

const tierBadgeVariant: Record<ListingTierTool["tier"], BadgeVariant> = {
  Free: "outline",
  Standard: "info",
  Premium: "primary",
}

const isFeaturedListing = (tool: Pick<ListingTierTool, "isFeatured" | "tierPriority">) => {
  return tool.isFeatured || tool.tierPriority === 0
}

export const ListingTierBadge = ({
  tool,
  size = "sm",
  variant,
  className,
}: ListingTierBadgeProps) => {
  return (
    <Badge
      size={size}
      variant={variant ?? tierBadgeVariant[tool.tier]}
      className={cx("shrink-0", className)}
    >
      {tiersConfig[tool.tier].label}
    </Badge>
  )
}

type ListingStatusBadgesProps = {
  tool: ListingTierTool
  className?: string
}

export const ListingStatusBadges = ({ tool, className }: ListingStatusBadgesProps) => {
  return (
    <Stack size="sm" className={cx("min-w-0", className)}>
      {isFeaturedListing(tool) && (
        <Badge size="sm" variant="primary">
          Featured
        </Badge>
      )}

      {tool.ownerId && (
        <Badge size="sm" variant="success">
          Verified
        </Badge>
      )}
    </Stack>
  )
}
