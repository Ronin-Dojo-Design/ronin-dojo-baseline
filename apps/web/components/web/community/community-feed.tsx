"use client"

import { LayoutGridIcon, ListIcon, NewspaperIcon, PenSquareIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Button } from "~/components/common/button"
import { DataSelect } from "~/components/common/data-select"
import { EmptyList } from "~/components/common/empty-list"
import { CommunityPostCard } from "~/components/web/community/community-post-card"
import { CommunityPostRow } from "~/components/web/community/community-post-row"
import { CreateCommunityPostDialog } from "~/components/web/community/create-community-post-dialog"
import { COMMUNITY_POST_TYPES } from "~/components/web/community/post-type"
import { Grid } from "~/components/web/ui/grid"
import { Sticky } from "~/components/web/ui/sticky"
import { cx } from "~/lib/utils"
import type { CommunityPostMany } from "~/server/web/community/payloads"
import type { CommunityPostTypeInput } from "~/server/web/community/schema"

/**
 * CommunityFeed — the member community feed (SESSION_0493, ADR 0042 Amendment 1). Adopts the
 * SESSION_0492 blog `PostFeed` layout (sticky filter bar: flair tabs + grid/list toggle) and the
 * approved legacy BBLPostsFeed structure (per-type icon tabs, style select, desktop New-post button
 * + mobile FAB) over `CommunityPost` rows. Type/style filtering is client-side over the
 * server-fetched PUBLISHED set (the blog-feed precedent); sort is fixed newest-first (locked MVP —
 * no sort UI, no votes).
 */
type CommunityFeedProps = {
  posts: CommunityPostMany[]
  /** Approved styles for the create dialog's optional style select. */
  styles: { id: string; name: string }[]
  viewer: { isAdmin: boolean }
  /**
   * `?school=` facet — ACCEPTED but a stub until school data flows onto community posts
   * (ADR 0042 Amendment 1 §3: school scoping = a future filter facet, not a namespace).
   */
  school?: string
}

const ALL = "all" as const
type View = "grid" | "list"
type TypeFilter = typeof ALL | CommunityPostTypeInput

export const CommunityFeed = ({ posts, styles, viewer }: CommunityFeedProps) => {
  const t = useTranslations("community")
  const [view, setView] = useState<View>("grid")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL)
  const [styleFilter, setStyleFilter] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Style facet derives from the styles PRESENT in the feed (legacy buildPostStyles behavior),
  // ordered by name — not the full approved catalog.
  const feedStyles = useMemo(() => {
    const seen = new Map<string, string>()
    for (const post of posts) {
      if (post.style && !seen.has(post.style.id)) seen.set(post.style.id, post.style.name)
    }
    return [...seen.entries()]
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter(post => {
      if (typeFilter !== ALL && post.type !== typeFilter) return false
      if (styleFilter && post.style?.id !== styleFilter) return false
      return true
    })
  }, [posts, typeFilter, styleFilter])

  const hasActiveFilters = typeFilter !== ALL || Boolean(styleFilter)

  const tabClassName = (active: boolean) =>
    cx(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      active
        ? "bg-primary text-primary-foreground"
        : "text-secondary-foreground hover:bg-muted hover:text-foreground",
    )

  const toggleClassName = (active: boolean) =>
    cx(
      "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      active
        ? "bg-background text-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground",
    )

  return (
    <div className="flex w-full flex-col gap-6">
      <Sticky isOverlay className="border-b bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Type flair tabs — All + one iconed pill per post type. */}
          <div
            className="-mx-1 flex items-center gap-1 overflow-x-auto px-1"
            role="tablist"
            aria-label={t("filter_by_type")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === ALL}
              onClick={() => setTypeFilter(ALL)}
              className={tabClassName(typeFilter === ALL)}
            >
              <NewspaperIcon className="size-4" />
              {t("tab_all")}
            </button>

            {COMMUNITY_POST_TYPES.map(meta => {
              const Icon = meta.icon
              return (
                <button
                  key={meta.type}
                  type="button"
                  role="tab"
                  aria-selected={typeFilter === meta.type}
                  onClick={() => setTypeFilter(meta.type)}
                  className={tabClassName(typeFilter === meta.type)}
                >
                  <Icon className="size-4" />
                  {t(meta.tabKey)}
                </button>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Style facet — only when the feed actually carries styles. */}
            {!!feedStyles.length && (
              <DataSelect
                options={[{ value: "", label: t("all_styles") }, ...feedStyles]}
                value={styleFilter}
                onValueChange={value => setStyleFilter(typeof value === "string" ? value : "")}
                placeholder={t("all_styles")}
                size="sm"
                triggerClassName="max-sm:hidden"
              />
            )}

            {/* Grid / list view toggle. */}
            <div className="flex items-center gap-1 rounded-lg border bg-muted p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label={t("grid_view")}
                className={toggleClassName(view === "grid")}
              >
                <LayoutGridIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label={t("list_view")}
                className={toggleClassName(view === "list")}
              >
                <ListIcon className="size-4" />
              </button>
            </div>

            {/* Desktop New-post button (mobile gets the FAB below). */}
            <Button
              type="button"
              size="sm"
              prefix={<PenSquareIcon />}
              onClick={() => setIsCreateOpen(true)}
              className="max-md:hidden"
            >
              {t("new_post")}
            </Button>
          </div>
        </div>
      </Sticky>

      {!filtered.length && (
        <EmptyList>
          {hasActiveFilters ? (
            <>
              {t("no_posts_filtered")}{" "}
              <button
                type="button"
                onClick={() => {
                  setTypeFilter(ALL)
                  setStyleFilter("")
                }}
                className="text-primary underline-offset-2 hover:underline"
              >
                {t("clear_filters")}
              </button>
            </>
          ) : (
            t("no_posts")
          )}
        </EmptyList>
      )}

      {!!filtered.length &&
        (view === "grid" ? (
          <Grid>
            {filtered.map(post => (
              <CommunityPostCard key={post.slug} post={post} isAdmin={viewer.isAdmin} />
            ))}
          </Grid>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {filtered.map(post => (
              <CommunityPostRow key={post.slug} post={post} isAdmin={viewer.isAdmin} />
            ))}
          </div>
        ))}

      {/* Mobile create-post FAB (the legacy feed's pattern, tokens-only). */}
      <Button
        type="button"
        size="lg"
        prefix={<PenSquareIcon />}
        onClick={() => setIsCreateOpen(true)}
        aria-label={t("new_post")}
        className="fixed right-5 bottom-5 z-40 rounded-full shadow-lg md:hidden"
      />

      <CreateCommunityPostDialog
        styles={styles}
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
      />
    </div>
  )
}
