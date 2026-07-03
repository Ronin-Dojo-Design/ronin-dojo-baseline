import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { Note } from "~/components/common/note"
import { CommunityFeed } from "~/components/web/community/community-feed"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Brand } from "~/.generated/prisma/client"
import { getBrandSiteConfig } from "~/config/site"
import { getServerSession } from "~/lib/auth"
import { isAdmin } from "~/lib/authz"
import { getPageData, getPageMetadata } from "~/lib/pages"
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

  // `?school=` is part of the URL contract already (ADR 0042 Amendment 1 §3) but stays a stub
  // until school data flows onto community posts.
  const school = typeof params.school === "string" ? params.school : undefined

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero band — the legacy feed's header band, tokens-only (primary/card gradients). */}
      <section className="relative w-full overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card px-6 py-8">
        <Intro>
          <IntroTitle>{metadata.title}</IntroTitle>
          <IntroDescription>{metadata.description}</IntroDescription>
          <Note className="mt-2">{t("count_posts", { count: posts.length })}</Note>
        </Intro>
      </section>

      <CommunityFeed
        posts={posts}
        styles={styles}
        viewer={{
          isAdmin: isAdmin(session?.user ? { id: session.user.id, role: session.user.role } : null),
        }}
        school={school}
      />
    </>
  )
}
