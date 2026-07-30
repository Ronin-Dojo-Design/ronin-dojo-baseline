import { BadgeCheckIcon, ShieldOffIcon, TriangleAlertIcon } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"
import type { Badge } from "~/components/common/badge"

/**
 * Shared `{label, variant, icon}` rows for the 3 statuses `LineageTrustBadge` (member-level
 * aggregate trust axis) and `RankStatusBadge` (per-award `RankEntry.status` axis) render
 * IDENTICALLY — Verified / Unverified / Disputed (SESSION_0724 ggr pass 1, Desi MINOR). Both
 * badges stay on the SAME `Badge` primitive + color vocabulary; this constant is just the one
 * place those 3 shared rows are spelled out, so the two configs can't silently drift apart.
 *
 * Deliberately NOT the 4th row (rank `PENDING` vs claim `claim-pending`) — those two have
 * different label copy ("Pending verification" vs "Claim pending") even though variant + icon
 * match, so hoisting it would either lose that copy distinction or need a param; not worth it
 * for one row.
 */

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>

type SharedTrustBadgeRow = {
  label: string
  variant: BadgeVariant
  icon: ReactNode
}

export const SHARED_TRUST_BADGE_ROWS = {
  verified: {
    label: "Verified",
    variant: "success",
    icon: <BadgeCheckIcon />,
  },
  unverified: {
    label: "Unverified",
    variant: "outline",
    icon: <ShieldOffIcon />,
  },
  disputed: {
    label: "Disputed",
    variant: "danger",
    icon: <TriangleAlertIcon />,
  },
} satisfies Record<"verified" | "unverified" | "disputed", SharedTrustBadgeRow>
