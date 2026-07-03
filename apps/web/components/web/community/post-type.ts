import type { LucideIcon } from "lucide-react"
import { GraduationCapIcon, HelpCircleIcon, LightbulbIcon, SwordsIcon } from "lucide-react"
import type { ComponentProps } from "react"
import type { Badge } from "~/components/common/badge"
import type { CommunityPostTypeInput } from "~/server/web/community/schema"

/**
 * Community post-type presentation map (SESSION_0493). Adapted from the approved legacy
 * `postOptions.js` (technique=Swords/blue, tip=Lightbulb/amber, seminar=GraduationCap/purple,
 * qa=HelpCircle/green) onto OUR Badge token variants — tokens-are-the-contract, no raw color
 * classes. Purple has no token variant, so seminar maps to `warning` (the nearest distinct token).
 * Labels resolve via the `community.*` i18n namespace at the usage site.
 */

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

export type CommunityPostTypeMeta = {
  type: CommunityPostTypeInput
  icon: LucideIcon
  badgeVariant: BadgeVariant
  /** `community.type_*` — singular flair label ("Technique"). */
  labelKey: string
  /** `community.tab_*` — plural feed-tab label ("Techniques"). */
  tabKey: string
}

export const COMMUNITY_POST_TYPE_META: Record<CommunityPostTypeInput, CommunityPostTypeMeta> = {
  TECHNIQUE: {
    type: "TECHNIQUE",
    icon: SwordsIcon,
    badgeVariant: "info",
    labelKey: "type_technique",
    tabKey: "tab_technique",
  },
  TIP: {
    type: "TIP",
    icon: LightbulbIcon,
    badgeVariant: "caution",
    labelKey: "type_tip",
    tabKey: "tab_tip",
  },
  SEMINAR: {
    type: "SEMINAR",
    icon: GraduationCapIcon,
    badgeVariant: "warning",
    labelKey: "type_seminar",
    tabKey: "tab_seminar",
  },
  QA: {
    type: "QA",
    icon: HelpCircleIcon,
    badgeVariant: "success",
    labelKey: "type_qa",
    tabKey: "tab_qa",
  },
}

/** Fixed display order for tabs / selects (matches the legacy feed). */
export const COMMUNITY_POST_TYPES: CommunityPostTypeMeta[] = [
  COMMUNITY_POST_TYPE_META.TECHNIQUE,
  COMMUNITY_POST_TYPE_META.TIP,
  COMMUNITY_POST_TYPE_META.SEMINAR,
  COMMUNITY_POST_TYPE_META.QA,
]
