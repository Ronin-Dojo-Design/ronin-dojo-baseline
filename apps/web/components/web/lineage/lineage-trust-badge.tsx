import { Clock3Icon, ImportIcon, ShieldCheckIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import { Badge } from "~/components/common/badge"
import { SHARED_TRUST_BADGE_ROWS } from "~/components/web/lineage/trust-badge-status-rows"
import type { LineageClaimBadgeStatus, LineageTrustStatus } from "~/lib/lineage/trust-status"

type BadgeSize = NonNullable<ComponentProps<typeof Badge>["size"]>

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

type BadgeConfig = {
  label: string
  variant: BadgeVariant
  icon: ReactNode
}

const TRUST_BADGE_CONFIG = {
  disputed: SHARED_TRUST_BADGE_ROWS.disputed,
  verified: SHARED_TRUST_BADGE_ROWS.verified,
  claimed: {
    label: "Claimed",
    variant: "info",
    icon: <ShieldCheckIcon />,
  },
  "claim-pending": {
    label: "Claim pending",
    variant: "caution",
    icon: <Clock3Icon />,
  },
  imported: {
    label: "Imported",
    variant: "outline",
    icon: <ImportIcon />,
  },
  unverified: SHARED_TRUST_BADGE_ROWS.unverified,
} satisfies Record<LineageTrustStatus, BadgeConfig>

const CLAIM_BADGE_CONFIG = {
  claimable: {
    label: "Claimable",
    variant: "soft",
    icon: <ShieldCheckIcon />,
  },
} satisfies Record<LineageClaimBadgeStatus, BadgeConfig>

export function LineageTrustBadge({
  status,
  size = "sm",
  className,
}: {
  status: LineageTrustStatus
  size?: BadgeSize
  className?: string
}) {
  const config = TRUST_BADGE_CONFIG[status]

  return (
    <Badge variant={config.variant} size={size} prefix={config.icon} className={className}>
      {config.label}
    </Badge>
  )
}

export function LineageClaimBadge({
  status,
  size = "sm",
  className,
}: {
  status: LineageClaimBadgeStatus
  size?: BadgeSize
  className?: string
}) {
  const config = CLAIM_BADGE_CONFIG[status]

  return (
    <Badge variant={config.variant} size={size} prefix={config.icon} className={className}>
      {config.label}
    </Badge>
  )
}
