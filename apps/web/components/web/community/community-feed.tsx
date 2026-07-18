"use client"

import { NewspaperIcon, PenSquareIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Button } from "~/components/common/button"
import { DataSelect } from "~/components/common/data-select"
import { EmptyList } from "~/components/common/empty-list"
import { CommunityPostCard } from "~/components/web/community/community-post-card"
import { CommunityPostRow } from "~/components/web/community/community-post-row"
import { CreateCommunityPostDialog } from "~/components/web/community/create-community-post-dialog"
import { COMMUNITY_POST_TYPES } from "~/components/web/community/post-type"
import {
  FeedFilterBar,
  type FeedFilterTab,
  type FeedView,
} from "~/components/web/ui/feed-filter-bar"
import { Grid } from "~/components/web/ui/grid"
import { ResultsCount } from "~/components/web/ui/results-count"
import type { CommunityPostView } from "~/server/web/community/post-gate"
import type { CommunityPostTypeInput } from "~/server/web/community/schema"

/**
 * CommunityFeed — the member community feed (SESSION_0493, ADR 0042 Amendment 1). Adopts the
 * SESSION_0492 blog `PostFeed` layout (sticky filter bar: flair tabs + grid/list toggle) and the
 * approved legacy BBLPostsFeed structure (per-type icon tabs, style select, desktop New-post button
 * + mobile FAB) over `CommunityPost` rows. Type/style filtering is client-side over the
 * server-fetched PUBLISHED set (the blog-feed precedent); sort is fixed newest-first (locked MVP —
 * no sort UI, no votes).
 *
 * SESSION_0495 C2-1: the sticky bar itself is now the shared `FeedFilterBar` (deduped with `PostFeed`);
 * C1-1/2/3 (mobile sticky, mobile-visible style facet, edge-fade/tighter pills) land through it.
 */
type CommunityFeedProps = {
  /**
   * The server-GATED feed (FI-028b): each post is already resolved to a `CommunityPostView` — a
   * locked premium post's body/media were stripped server-side before crossing here, so the client
   * only ever holds a teaser for a post the viewer can't read.
   */
  views: CommunityPostView[]
  /** Approved styles for the create dialog's optional style select. */
  styles: { id: string; name: string }[]
  /**
   * @changed SESSION_0529 review fix (Doug P2-3): `hasMab` = the server-resolved
   * `shouldMountMab` predicate. The mobile create-post FAB hides whenever the radial MAB mounts
   * for this viewer (admin OR technique-capable member) — the two dock at the same corner and
   * the MAB (z-50) buried this FAB (z-30) for Elite non-admins.
   *
   * @changed FI-028: `canCreate` = the server-resolved `canCreateCommunityPostForUser` gate,
   * threaded to the composer dialog. A free member keeps the visible "New post" entry points but
   * the dialog swaps to an upgrade CTA (the button/FAB is not hidden — funnel-first).
   */
  viewer: { isAdmin: boolean; hasMab: boolean; canCreate: boolean }
  /**
   * Server-batched saved-state (D6): the ids of the posts the viewer has saved, resolved in ONE
   * query on the page render and threaded to each card's `ListingSaveButton initialSaved`. `null` for
   * signed-out viewers (they get the sign-in CTA, no per-card check). An array (not a `Set`) because
   * this prop crosses the server→client boundary; rebuilt into a `Set` here for O(1) lookup.
   */
  savedPostIds: string[] | null
  /**
   * `?school=` facet — ACCEPTED but a stub until school data flows onto community posts
   * (ADR 0042 Amendment 1 §3: school scoping = a future filter facet, not a namespace).
   */
  school?: string
}

const ALL = "all" as const
type TypeFilter = typeof ALL | CommunityPostTypeInput

export const CommunityFeed = ({ views, styles, viewer, savedPostIds }: CommunityFeedProps) => {
  const t = useTranslations("community")
  const [view, setView] = useState<FeedView>("grid")

  // O(1) saved lookups from the server-batched ids. `undefined` (signed-out) → each card self-defers
  // to its sign-in CTA; a `Set` → each card hydrates `initialSaved` and skips the per-mount check.
  const savedIds = useMemo(() => (savedPostIds ? new Set(savedPostIds) : null), [savedPostIds])
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL)
  const [styleFilter, setStyleFilter] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Style facet derives from the styles PRESENT in the feed (legacy buildPostStyles behavior),
  // ordered by name — not the full approved catalog. (Type + style survive the lock strip, so both
  // filters work on a locked teaser too.)
  const feedStyles = useMemo(() => {
    const seen = new Map<string, string>()
    for (const { post } of views) {
      if (post.style && !seen.has(post.style.id)) seen.set(post.style.id, post.style.name)
    }
    return [...seen.entries()]
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [views])

  const filtered = useMemo(() => {
    return views.filter(({ post }) => {
      if (typeFilter !== ALL && post.type !== typeFilter) return false
      if (styleFilter && post.style?.id !== styleFilter) return false
      return true
    })
  }, [views, typeFilter, styleFilter])

  const hasActiveFilters = typeFilter !== ALL || Boolean(styleFilter)

  const tabs: FeedFilterTab[] = [
    { value: ALL, label: t("tab_all"), icon: NewspaperIcon },
    ...COMMUNITY_POST_TYPES.map(meta => ({
      value: meta.type,
      label: t(meta.tabKey),
      icon: meta.icon,
    })),
  ]

  return (
    <div className="flex w-full flex-col gap-6">
      <FeedFilterBar
        tabs={tabs}
        activeTab={typeFilter}
        onTabChange={value => setTypeFilter(value as TypeFilter)}
        tablistLabel={t("filter_by_type")}
        view={view}
        onViewChange={setView}
        gridViewLabel={t("grid_view")}
        listViewLabel={t("list_view")}
        trailing={
          <>
            {/* Style facet — only when the feed actually carries styles. Shown on mobile too now
                (C1-2: `max-sm:hidden` removed the only style filter on the mobile-heavy surface). */}
            {!!feedStyles.length && (
              <DataSelect
                options={[{ value: "", label: t("all_styles") }, ...feedStyles]}
                value={styleFilter}
                onValueChange={value => setStyleFilter(typeof value === "string" ? value : "")}
                placeholder={t("all_styles")}
                size="sm"
                aria-label={t("filter_by_style")}
              />
            )}

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
          </>
        }
      />

      {/* Filter-aware count under the bar (C1-4). hideWhenEmpty: at 0 the EmptyList carries the copy,
          so the "0 posts" line is noise here (opt-in — other ResultsCount consumers keep the zero-signal). */}
      <ResultsCount
        total={filtered.length}
        label={t("count_posts", { count: filtered.length })}
        hideWhenEmpty
      />

      {!filtered.length && (
        <EmptyList render={<div className="flex flex-col items-start" />}>
          {hasActiveFilters ? (
            <>
              {t("no_posts_filtered")}{" "}
              <button
                type="button"
                onClick={() => {
                  setTypeFilter(ALL)
                  setStyleFilter("")
                }}
                className="text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("clear_filters")}
              </button>
            </>
          ) : (
            <>
              {viewer.canCreate ? t("no_posts") : t("no_posts_upgrade")}
              {/* Launch empty state doubles as the funnel entry — same CTA as the header button.
                  The dialog gates internally (logged-out → LoginDialog, free → upgrade CTA per
                  FI-028, capable → form), so the button stays visible for everyone (funnel-first);
                  a free member gets the upgrade label and reaches the upgrade panel, not a dead wall. */}
              <Button
                type="button"
                size="sm"
                prefix={<PenSquareIcon />}
                onClick={() => setIsCreateOpen(true)}
                className="mt-4"
              >
                {viewer.canCreate ? t("new_post") : t("upgrade_cta")}
              </Button>
            </>
          )}
        </EmptyList>
      )}

      {!!filtered.length &&
        (view === "grid" ? (
          <Grid>
            {filtered.map(postView => (
              <CommunityPostCard
                key={postView.post.slug}
                view={postView}
                isAdmin={viewer.isAdmin}
                initialSaved={savedIds?.has(postView.post.id)}
              />
            ))}
          </Grid>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {filtered.map(postView => (
              <CommunityPostRow
                key={postView.post.slug}
                view={postView}
                isAdmin={viewer.isAdmin}
                initialSaved={savedIds?.has(postView.post.id)}
              />
            ))}
          </div>
        ))}

      {/* Mobile create-post FAB. The circular `icon` size (SESSION_0495 C2-5) replaces the old
          `lg`-pill + `mx-0! my-0! size-6! rounded-full p-4` hack.

          SESSION_0500 (Epic B) → SESSION_0529 (Doug P2-3): the radial MAB owns the corner when it
          mounts (admin OR technique-capable member — `shouldMountMab`), so this FAB hides for ANY
          MAB-holding viewer, not just admins (it was already buried under the z-50 MAB). Viewers
          without the MAB keep this direct create affordance. `bottom-20` clears the bottom nav.
          Follow-up ticket: a member-facing "post" MAB action so MAB holders regain 1-tap create. */}
      {!viewer.hasMab && (
        <Button
          type="button"
          variant="fancy"
          size="icon"
          prefix={<PenSquareIcon />}
          onClick={() => setIsCreateOpen(true)}
          aria-label={t("new_post")}
          className="fixed right-5 bottom-20 z-30 shadow-lg md:hidden"
        />
      )}

      <CreateCommunityPostDialog
        styles={styles}
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
        canCreate={viewer.canCreate}
      />
    </div>
  )
}
