import { BadgeCheckIcon, Clock3Icon, ShieldOffIcon, TriangleAlertIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { RankEntryStatus } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"

/**
 * Per-rank verification badge (BBL-RANK-001 / WL-P2-47). Renders the raw `RankEntry.status`
 * carried by `PublicPassportRank.status` — the public projection MAY expose this enum
 * (lineage-data-wiring-flow.md §3), but MUST NOT expose reviewer / evidence / reporter identity;
 * this component only ever reads the 4-value status enum, nothing else.
 *
 * Label copy mirrors the wiring flow's public-projection table verbatim (§3): VERIFIED ->
 * Verified, UNVERIFIED -> Unverified, PENDING -> Pending verification, DISPUTED -> Disputed.
 * Icon + `Badge` variant tokens mirror `LineageTrustBadge`'s config
 * (`components/web/lineage/lineage-trust-badge.tsx`, the directory CARD's aggregate trust
 * badge) — same primitive, same color vocabulary, no new color system. This is a DISTINCT axis
 * from `LineageTrustStatus`: that type is the member-level aggregate (rank + claim + placeholder);
 * this badge is the single award's own `RankEntry.status`, unaggregated.
 */

type BadgeSize = NonNullable<ComponentProps<typeof Badge>["size"]>
type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

type RankStatusBadgeConfig = {
  label: string
  variant: BadgeVariant
  icon: ReactNode
}

const RANK_STATUS_BADGE_CONFIG = {
  VERIFIED: {
    label: "Verified",
    variant: "success",
    icon: <BadgeCheckIcon />,
  },
  UNVERIFIED: {
    label: "Unverified",
    variant: "outline",
    icon: <ShieldOffIcon />,
  },
  PENDING: {
    label: "Pending verification",
    variant: "caution",
    icon: <Clock3Icon />,
  },
  DISPUTED: {
    label: "Disputed",
    variant: "danger",
    icon: <TriangleAlertIcon />,
  },
} satisfies Record<RankEntryStatus, RankStatusBadgeConfig>

/** Renders nothing for a null/absent status — a rank with no linked `RankEntry` stays orphan-free. */
export function RankStatusBadge({
  status,
  size = "sm",
  className,
}: {
  status: RankEntryStatus | null | undefined
  size?: BadgeSize
  className?: string
}) {
  if (!status) return null
  const config = RANK_STATUS_BADGE_CONFIG[status]

  return (
    <Badge variant={config.variant} size={size} prefix={config.icon} className={className}>
      {config.label}
    </Badge>
  )
}
