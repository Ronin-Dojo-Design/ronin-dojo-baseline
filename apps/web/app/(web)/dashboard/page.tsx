import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import { DashboardLineageTab } from "~/app/(web)/dashboard/lineage-tab"
import { DashboardToolListing } from "~/app/(web)/dashboard/listing"
import { DashboardMembership } from "~/app/(web)/dashboard/membership"
import { DashboardProfileTab } from "~/app/(web)/dashboard/profile-tab"
import { DashboardSchoolTab } from "~/app/(web)/dashboard/school-tab"
import { DashboardTabs } from "~/app/(web)/dashboard/tabs"
import { DashboardTechniquesTab } from "~/app/(web)/dashboard/techniques-tab"
import { Skeleton } from "~/components/common/skeleton"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { siteConfig } from "~/config/site"
import { getPageData, getPageMetadata } from "~/lib/pages"

// I18n page namespace
const namespace = "pages.dashboard"

// Get page data
const getData = cache(async () => {
  const t = await getTranslations()
  const url = "/dashboard"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: siteConfig.name })

  return getPageData(url, title, description, {
    breadcrumbs: [{ url, title }],
  })
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return getPageMetadata({ url, metadata })
}

export default async function ({ searchParams }: PageProps<"/dashboard">) {
  const { metadata } = await getData()

  return (
    <>
      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <div className="flex flex-col gap-8">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <DashboardMembership />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96" />}>
          <DashboardTabs
            tabs={[
              {
                id: "profile",
                label: "Profile",
                content: (
                  <Suspense fallback={<Skeleton className="h-64" />}>
                    <DashboardProfileTab />
                  </Suspense>
                ),
              },
              {
                id: "school",
                label: "School",
                content: (
                  <Suspense fallback={<Skeleton className="h-64" />}>
                    <DashboardSchoolTab />
                  </Suspense>
                ),
              },
              {
                id: "techniques",
                label: "Techniques",
                content: (
                  <Suspense fallback={<DataTableSkeleton />}>
                    <DashboardTechniquesTab />
                  </Suspense>
                ),
              },
              {
                id: "listings",
                label: "Listings",
                content: (
                  <Suspense fallback={<DataTableSkeleton />}>
                    <DashboardToolListing searchParams={searchParams} />
                  </Suspense>
                ),
              },
              {
                id: "lineage",
                label: "Lineage",
                content: (
                  <Suspense fallback={<Skeleton className="h-64" />}>
                    <DashboardLineageTab />
                  </Suspense>
                ),
              },
            ]}
            defaultTab="profile"
          />
        </Suspense>
      </div>
    </>
  )
}
