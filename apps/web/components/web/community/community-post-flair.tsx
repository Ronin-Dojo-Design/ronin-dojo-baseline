"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { COMMUNITY_POST_TYPE_META } from "~/components/web/community/post-type"
import type { CommunityPostTypeInput } from "~/server/web/community/schema"

/**
 * CommunityPostFlair — the one type badge (icon + token variant + label) shared by the community
 * card, row, and detail header, so the type→color contract lives in a single place.
 */
type CommunityPostFlairProps = Omit<ComponentProps<typeof Badge>, "variant" | "prefix"> & {
  type: CommunityPostTypeInput
}

export const CommunityPostFlair = ({ type, size = "sm", ...props }: CommunityPostFlairProps) => {
  const t = useTranslations("community")
  const meta = COMMUNITY_POST_TYPE_META[type]
  const Icon = meta.icon

  return (
    <Badge variant={meta.badgeVariant} size={size} prefix={<Icon />} {...props}>
      {t(meta.labelKey)}
    </Badge>
  )
}
