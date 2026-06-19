"use client"

import { NewspaperIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "~/components/common/button"
import { Link } from "~/components/common/link"
import { POST_HEADING_FONT } from "./content-post-feed-types"

/** Empty-feed state. When a tag filter is active it offers a route back to the
 * full feed; otherwise it reads as a first-run "no posts yet". */
export const ContentPostEmpty = ({ isFiltered = false }: { isFiltered?: boolean }) => {
  const t = useTranslations()

  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <NewspaperIcon className="size-6" />
      </span>
      <p className={`font-medium text-foreground ${POST_HEADING_FONT}`}>{t("posts.empty_title")}</p>
      <p className="max-w-sm text-muted-foreground text-sm">{t("posts.no_posts")}</p>
      {isFiltered && (
        <Button variant="secondary" size="sm" render={<Link href="/posts" />}>
          {t("posts.view_all")}
        </Button>
      )}
    </div>
  )
}
