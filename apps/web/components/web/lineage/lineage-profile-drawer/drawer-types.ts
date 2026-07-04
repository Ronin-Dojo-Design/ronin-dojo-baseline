import type { ClaimViewerState } from "~/server/web/claims/resolve-viewer-claim-state"
import type { LineageNodeProfile, LineageTreeMemberRow } from "~/server/web/lineage/payloads"

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
  isClaimable?: boolean
  isTreeClaimable?: boolean
  /**
   * The viewer's claim state for this node's Passport (ADR 0036, SESSION_0440). The
   * shared resolver both claim surfaces consume — drives the 5-state CTA so a claimed
   * node never shows a (ghost) Claim button. When omitted (e.g. the editor/board/galaxy
   * callers that don't thread it yet), the drawer falls back to a coarse claimed/
   * unclaimed read off `profile.passport.user`, which still suppresses the ghost button.
   */
  viewerClaimState?: ClaimViewerState
  treeSlug?: string
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
  /**
   * Optional classes applied to the portaled DrawerContent root.
   *
   * Brand-aware consumers use this to thread font variable classes into the
   * portal without hardcoding brand tokens inside the shared drawer.
   */
  contentClassName?: string
  /** Focal member's students (visual children in this tree) for the drawer carousel. */
  students?: LineageTreeMemberRow[]
  /** Swap the drawer to a tapped student — recursive drill-down. */
  onSelectStudent?: (memberId: string) => void
  /**
   * Students-rail bake-off toggle (SESSION_0496, Epic A0.5): "v2" renders the
   * `StudentsCarouselV2` player cards (+ the avatar layoutId morph into the identity
   * header); undefined/"v1" renders the original `StudentsCarousel` — the regression
   * guarantee. Resolved by the View A island from `?cards=v2`; no settings UI.
   */
  studentsCarouselVariant?: "v1" | "v2"
  /**
   * The tree's discipline — scopes the *students carousel* belts to this discipline
   * (the students are tree members; ADR 0035 §3). The focal member's own header rank is
   * intentionally NOT scoped here (the drawer shows their full multi-discipline rank).
   */
  disciplineId?: string | null
}
