"use client"

import { LayoutGridIcon, ListIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "~/components/common/button"
import { Stack } from "~/components/common/stack"
import type { PostFeedView } from "./content-post-feed-types"

type PostFeedToolbarProps = {
  count: number
  view: PostFeedView
  onViewChange: (view: PostFeedView) => void
}

/** Feed header bar: a pluralized post count + a grid/list view toggle. Pure
 * presentation — colors come from neutral UI tokens (`foreground` / `muted`),
 * never a hardcoded accent. */
export const PostFeedToolbar = ({ count, view, onViewChange }: PostFeedToolbarProps) => {
  const t = useTranslations()

  return (
    <Stack className="w-full items-center" wrap>
      <p className="text-muted-foreground text-sm">
        {count} {t("posts.count_posts", { count })}
      </p>

      <Stack
        size="xs"
        wrap={false}
        className="ml-auto"
        role="group"
        aria-label={t("posts.grid_view")}
      >
        <Button
          variant={view === "grid" ? "soft" : "ghost"}
          size="sm"
          aria-pressed={view === "grid"}
          aria-label={t("posts.grid_view")}
          onClick={() => onViewChange("grid")}
          prefix={<LayoutGridIcon />}
        />
        <Button
          variant={view === "list" ? "soft" : "ghost"}
          size="sm"
          aria-pressed={view === "list"}
          aria-label={t("posts.list_view")}
          onClick={() => onViewChange("list")}
          prefix={<ListIcon />}
        />
      </Stack>
    </Stack>
  )
}
