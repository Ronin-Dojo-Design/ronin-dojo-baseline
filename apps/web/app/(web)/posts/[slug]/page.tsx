import type { Metadata } from "next"
import { LockKeyholeIcon } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"
import { cache } from "react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { CommunityPostActions } from "~/components/web/community/community-post-actions"
import { CommunityPostFlair } from "~/components/web/community/community-post-flair"
import { ExternalLink } from "~/components/web/external-link"
import { Markdown } from "~/components/web/markdown"
import { Author } from "~/components/web/ui/author"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { UpgradePanel } from "~/components/web/ui/upgrade-panel"
import { Brand } from "~/.generated/prisma/client"
import { getServerSession } from "~/lib/auth"
import { isAdmin } from "~/lib/authz"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { toVideoEmbedUrl } from "~/lib/video-embed"
import {
  isCommunityPostViewerEntitled,
  resolveCommunityViewerContext,
} from "~/server/web/community/post-access"
import { gateCommunityPost } from "~/server/web/community/post-gate"
import { findCommunityPostBySlug } from "~/server/web/community/queries"

export const dynamicParams = true

type Props = PageProps<"/posts/[slug]">

/** The paid-tier upgrade funnel — the same route the composer/technique upgrade CTAs link to. */
const UPGRADE_HREF = "/lineage/join"

/**
 * Community post detail (SESSION_0493, ADR 0042 Amendment 1). HIDDEN posts 404 for everyone except
 * admins — the admin escape hatch exists so a moderator can reach the post to unhide it.
 *
 * FI-028b: the fetched row is GATED here (server-side) into a `CommunityPostView` — a locked premium
 * post's body + media are stripped before anything crosses to render, so the detail never emits the
 * gated content for an unentitled viewer. The bounded excerpt is kept as the teaser hook.
 */
const getData = cache(async ({ params }: Props) => {
  const { slug } = await params
  const session = await getServerSession()
  const viewerIsAdmin = isAdmin(session?.user)

  const row = await findCommunityPostBySlug(slug, Brand.BBL, { includeHidden: viewerIsAdmin })

  if (!row) {
    notFound()
  }

  // `row.isPremium` short-circuits the paid-tier lookup on a free post (mirrors the technique gate).
  const viewerContext = await resolveCommunityViewerContext(row.isPremium)
  const view = gateCommunityPost(row, isCommunityPostViewerEntitled(row, viewerContext))

  const t = await getTranslations()
  const url = `/posts/${view.post.slug}`

  const data = await getPageData(url, view.post.title, view.post.excerpt, {
    breadcrumbs: [
      { url: "/posts", title: t("navigation.posts") },
      { url, title: view.post.title },
    ],
  })

  return { view, viewerIsAdmin, ...data }
})

export const generateMetadata = async (props: Props): Promise<Metadata> => {
  const { url, metadata } = await getData(props)
  return await getPageMetadata({ url, metadata })
}

export default async function (props: Props) {
  const { view, viewerIsAdmin, breadcrumbs } = await getData(props)
  const t = await getTranslations("community")
  const format = await getFormatter()
  const post = view.post

  const header = (
    <Intro>
      <Stack size="sm">
        <CommunityPostFlair type={post.type} />

        {post.isPremium && (
          <Badge variant="warning" size="sm" prefix={<LockKeyholeIcon />}>
            {t("premium_badge")}
          </Badge>
        )}

        {post.style && (
          <Badge variant="outline" size="sm">
            {post.style.name}
          </Badge>
        )}

        {post.isHidden && (
          <Badge variant="danger" size="sm">
            {t("hidden_badge")}
          </Badge>
        )}
      </Stack>

      <IntroTitle>{post.title}</IntroTitle>

      <Author
        prefix={t("posted_by")}
        name={post.authorName}
        image={post.authorImage}
        note={
          <time dateTime={post.createdAt.toISOString()}>
            {format.dateTime(post.createdAt, { dateStyle: "long" })}
          </time>
        }
        className="mt-4"
      />
    </Intro>
  )

  // Save/Share sidebar — shared by the locked AND unlocked detail. Keeping it on a LOCKED detail is
  // DELIBERATE (not an oversight): the detail has room, and Save-for-later + Share on the public
  // teaser (title + excerpt) spread the funnel. Feed cards/rows, which are cramped, drop these for the
  // single Unlock CTA instead. `text` is the public excerpt — no gated body/media is exposed.
  const sidebar = (
    <Section.Sidebar>
      <CommunityPostActions
        postId={post.id}
        slug={post.slug}
        title={post.title}
        text={post.excerpt}
        isHidden={post.isHidden}
        isAdmin={viewerIsAdmin}
        showSaveLabel
      />
    </Section.Sidebar>
  )

  // Locked premium detail — the teaser: excerpt hook + a centered upgrade panel (NO body, NO iframe,
  // NO image; those fields don't exist on the locked view). Mirrors the technique watch "all-locked"
  // upgrade panel idiom.
  if (view.locked) {
    return (
      <>
        <Breadcrumbs items={breadcrumbs} />

        {header}

        <Section>
          <Section.Content>
            <p className="text-lg text-secondary-foreground text-pretty">{post.excerpt}</p>

            {/* Shared "all-locked upgrade panel" primitive (WL-P2-63) — strings only; the gated
                body/media fields don't exist on the locked view, so nothing here can leak. */}
            <UpgradePanel
              heading={t("locked_heading")}
              description={t("locked_description")}
              ctaLabel={t("unlock_cta")}
              href={UPGRADE_HREF}
            />
          </Section.Content>

          {sidebar}
        </Section>
      </>
    )
  }

  const videoEmbedUrl = toVideoEmbedUrl(view.post.videoUrl)

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {header}

      <Section>
        <Section.Content>
          {view.post.imageUrl && (
            <Image
              src={view.post.imageUrl}
              alt={post.title}
              width={1200}
              height={630}
              priority
              sizes="(min-width: 768px) 66vw, 100vw"
              className="w-full h-auto aspect-video object-cover rounded-lg"
            />
          )}

          <Markdown code={view.post.content} />

          {/* YouTube/Vimeo links embed via the existing `toVideoEmbedUrl` seam (FI-007 precedent
              on the directory profile); anything else falls back to an external link. */}
          {videoEmbedUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-black">
              <iframe
                src={videoEmbedUrl}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          )}

          {view.post.videoUrl && !videoEmbedUrl && (
            <ExternalLink href={view.post.videoUrl} className="font-medium text-primary">
              {t("watch_video")}
            </ExternalLink>
          )}
        </Section.Content>

        {sidebar}
      </Section>
    </>
  )
}
