import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { Note } from "~/components/common/note"
import { CommunityFeed } from "~/components/web/community/community-feed"
import { shouldMountMab } from "~/components/web/nav/mab-mount"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { getServerSession } from "~/lib/auth"
import { isAdmin } from "~/lib/authz"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { checkBookmarkSubjects } from "~/server/web/bookmarks/saved-subjects"
import {
  isCommunityPostViewerEntitled,
  resolveCommunityViewerContext,
} from "~/server/web/community/post-access"
import { gateCommunityPost } from "~/server/web/community/post-gate"
import { canCreateCommunityPostForUser } from "~/server/web/community/permissions"
import { findApprovedStyleOptions, findCommunityPosts } from "~/server/web/community/queries"

// I18n page namespace — the community feed OWNS its namespace; `pages.blog` stays editorial-only
// (ADR 0042 Amendment 1).
const namespace = "pages.community"

type Props = PageProps<"/posts">

// Get page data
const getData = cache(async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const [posts, styles] = await Promise.all([
    findCommunityPosts(Brand.BBL),
    findApprovedStyleOptions(),
  ])

  const t = await getTranslations()
  const url = "/posts"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  const data = await getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
  })

  return { posts, styles, ...data }
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function ({ searchParams }: Props) {
  const [{ posts, styles, metadata, breadcrumbs }, session, params] = await Promise.all([
    getData(),
    getServerSession(),
    searchParams,
  ])

  const t = await getTranslations("community")

  // Batch the viewer's saved-state for the WHOLE feed in ONE query (D6), then thread it down as
  // `initialSaved` per card — replacing the N per-card `checkBookmarkSubject` actions that fired on
  // mount. Signed-out viewers skip the query entirely (the Save button is a sign-in CTA for them).
  const savedPostIds = session?.user
    ? await checkBookmarkSubjects(
        session.user.id,
        posts.map(post => ({ subjectType: "COMMUNITY_POST" as const, subjectId: post.id })),
      )
    : null

  // `?school=` is part of the URL contract already (ADR 0042 Amendment 1 §3) but stays a stub
  // until school data flows onto community posts.
  const school = typeof params.school === "string" ? params.school : undefined

  // SESSION_0529 review fix (Doug P2-3): the SAME mount predicate the MobileShell uses — when the
  // radial MAB mounts for this viewer, the feed hides its own mobile create-post FAB (the MAB
  // overlays that corner). Request-cached, so this costs no extra lookup beside the shell's.
  const hasMab = await shouldMountMab(session?.user)

  // FI-028: the server-resolved CREATE gate, threaded to the composer via `viewer.canCreate`. A free
  // member keeps the visible "New post" affordances but the dialog swaps to an upgrade CTA.
  // Request-cached (shared with `shouldMountMab` above), so this adds no extra lookup.
  const canCreate = session?.user
    ? await canCreateCommunityPostForUser(session.user, Brand.BBL)
    : false

  // FI-028b READ gate: resolve the viewer's read context ONCE (admin/paid legs), then gate every row
  // BEFORE it crosses to the client `CommunityFeed`. A locked premium post's body + media are stripped
  // server-side here (type-encoded) — the raw content-bearing `posts` never reach a client component.
  // `posts.some(isPremium)` short-circuits the paid-tier lookup on an all-free feed (the default-false
  // MVP), mirroring the technique gate's `hasPremiumTechniqueMedia` guard.
  const viewerContext = await resolveCommunityViewerContext(posts.some(post => post.isPremium))
  const views = posts.map(post =>
    gateCommunityPost(post, isCommunityPostViewerEntitled(post, viewerContext)),
  )

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero band — the legacy feed's header band, tokens-only (primary/card gradients). */}
      <section className="relative w-full overflow-hidden rounded-xl border bg-linear-to-br from-primary/10 via-card to-card px-6 py-8">
        <Intro>
          <IntroTitle>{metadata.title}</IntroTitle>
          <IntroDescription>{metadata.description}</IntroDescription>
          {/* Hero shows the TOTAL only when there is one (C1-4). The filter-aware count lives under
              the bar (CommunityFeed → ResultsCount); at 0, the feed's EmptyList carries the copy, so
              a "No posts yet" line here would duplicate it. */}
          {posts.length > 0 && (
            <Note className="mt-2">{t("count_posts", { count: posts.length })}</Note>
          )}
        </Intro>
      </section>

      <CommunityFeed
        views={views}
        styles={styles}
        viewer={{ isAdmin: isAdmin(session?.user), hasMab, canCreate }}
        savedPostIds={savedPostIds ? [...savedPostIds] : null}
        school={school}
      />
    </>
  )
}
