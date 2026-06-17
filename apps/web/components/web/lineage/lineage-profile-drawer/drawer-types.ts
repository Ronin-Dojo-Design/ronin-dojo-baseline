import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"

/** The award the drawer focuses on (from a clicked rank in the tree); null = current. */
export type SelectedRankAward = {
  id: string
  awardedAt: Date | null
  rank: {
    id: string
    name: string
    shortName: string | null
    colorHex: string | null
    sortOrder?: number | null
    rankSystem?: {
      id: string
      name: string
      discipline?: { id: string; name: string; slug: string; code: string | null } | null
      ranks?: { id: string; sortOrder: number }[] | null
    } | null
  } | null
} | null

export type LineageProfileDrawerTab = "info" | "lineage" | "rank-history"

// Phase 3c: identity is Passport-rooted. Earned rank awards hang off
// `passport.rankAwardsEarned`; the attached account (memberships, CARRY) off
// `passport.user`. Both `passport` and `passport.user` are nullable (accountless
// placeholder), so callers narrow before indexing.
export type DrawerPassport = NonNullable<LineageNodeProfile["passport"]>
export type DrawerRankAward = DrawerPassport["rankAwardsEarned"][number]
export type DrawerAccount = DrawerPassport["user"]

export type LineageProfileDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: LineageNodeProfile | null
  promoterChangeContext?:
    | import("~/components/web/lineage/promoter-change-modal").PromoterChangeContext
    | null
  selectedRankAward?: SelectedRankAward
  isClaimable?: boolean
  isTreeClaimable?: boolean
  treeSlug?: string
  treeId?: string
  nodeId?: string | null
  isAdmin?: boolean
  /**
   * Controlled active drawer tab. The on-card / on-row `LineageMemberActionsMenu`
   * "Change promoter..." action (Phase 3c) opens the drawer on the "rank-history"
   * tab — promotion history + the promoter editor entry — while "View profile"
   * opens "info". Board-owned so there is no mount-timing race (SESSION_0333).
   */
  activeTab?: LineageProfileDrawerTab
  onTabChange?: (tab: LineageProfileDrawerTab) => void
  /** Focal member's students (visual children in this tree) for the drawer carousel. */
  students?: LineageTreeMemberRow[]
  /** Swap the drawer to a tapped student — recursive drill-down. */
  onSelectStudent?: (memberId: string) => void
}
