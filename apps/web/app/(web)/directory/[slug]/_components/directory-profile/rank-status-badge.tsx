"use client"

import { Clock3Icon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { RankEntryStatus } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/common/tooltip"
import { SHARED_TRUST_BADGE_ROWS } from "~/components/web/lineage/trust-badge-status-rows"

/**
 * Per-rank verification badge (BBL-RANK-001 / WL-P2-47). Renders the raw `RankEntry.status`
 * carried by `PublicPassportRank.status` — the public projection MAY expose this enum
 * (lineage-data-wiring-flow.md §3), but MUST NOT expose reviewer / evidence / reporter identity;
 * this component only ever reads the 4-value status enum, nothing else.
 *
 * Label copy mirrors the wiring flow's public-projection table verbatim (§3): VERIFIED ->
 * Verified, UNVERIFIED -> Unverified, PENDING -> Pending verification, DISPUTED -> Disputed.
 * Icon + `Badge` variant tokens for VERIFIED/UNVERIFIED/DISPUTED share
 * `SHARED_TRUST_BADGE_ROWS` (`components/web/lineage/trust-badge-status-rows.tsx`) with
 * `LineageTrustBadge`'s config (`components/web/lineage/lineage-trust-badge.tsx`, the directory
 * CARD's aggregate trust badge) — same primitive, same color vocabulary, no new color system.
 * This is a DISTINCT axis from `LineageTrustStatus`: that type is the member-level aggregate
 * (rank + claim + placeholder); this badge is the single award's own `RankEntry.status`,
 * unaggregated — PENDING has no `LineageTrustStatus` equivalent so it stays local.
 *
 * Desi P1 (SESSION_0724 ggr pass 1): visually identical to the hero's `LineageTrustBadge` but a
 * DIFFERENT trust axis — wrapped in the existing `Tooltip` primitive (never hand-rolled) with a
 * one-line qualifier so a public visitor can't misread a hero-vs-row mismatch as a bug. Hover/
 * focus only — the row itself stays visually uncluttered.
 */

type BadgeSize = NonNullable<ComponentProps<typeof Badge>["size"]>
type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

type RankStatusBadgeConfig = {
  label: string
  variant: BadgeVariant
  icon: ReactNode
}

const RANK_STATUS_BADGE_CONFIG = {
  VERIFIED: SHARED_TRUST_BADGE_ROWS.verified,
  UNVERIFIED: SHARED_TRUST_BADGE_ROWS.unverified,
  PENDING: {
    label: "Pending verification",
    variant: "caution",
    icon: <Clock3Icon />,
  },
  DISPUTED: SHARED_TRUST_BADGE_ROWS.disputed,
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
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge variant={config.variant} size={size} prefix={config.icon} className={className}>
            {config.label}
          </Badge>
        }
      />
      <TooltipContent>Verification status for this specific rank award.</TooltipContent>
    </Tooltip>
  )
}
