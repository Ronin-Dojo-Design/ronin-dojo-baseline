"use client"

import { useTranslations } from "next-intl"
import type { ComponentProps } from "react"
import { EmptyList } from "~/components/web/empty-list"
import { TagCard, TagCardSkeleton } from "~/components/web/tags/tag-card"
import { Grid } from "~/components/web/ui/grid"
import { cx } from "~/lib/utils"
import type { TagMany } from "~/server/web/tags/payloads"

type TagListProps = ComponentProps<typeof Grid> & {
  tags: TagMany[]
}

const TagList = ({ tags, className, ...props }: TagListProps) => {
  const t = useTranslations()

  return (
    <Grid className={cx("gap-x-8", className)} {...props}>
      {tags.map(tag => (
        <TagCard key={tag.slug} tag={tag} />
      ))}

      {!tags.length && <EmptyList>{t("tags.no_tags")}</EmptyList>}
    </Grid>
  )
}

const TagListSkeleton = () => {
  return (
    <Grid className="gap-x-8">
      {[...Array(24)].map((_, index) => (
        <TagCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { TagList, TagListSkeleton, type TagListProps }
