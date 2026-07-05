import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { cache, Suspense } from "react"
import { DashboardBeltsTab } from "~/app/(web)/dashboard/belts-tab"
import { DashboardBillingTab } from "~/app/(web)/dashboard/billing-tab"
import { DashboardEventsTab } from "~/app/(web)/dashboard/events-tab"
import { DashboardLineageTab } from "~/app/(web)/dashboard/lineage-tab"
import { DashboardToolListing } from "~/app/(web)/dashboard/listing"
import { DashboardMembership } from "~/app/(web)/dashboard/membership"
import { DashboardProfileTab } from "~/app/(web)/dashboard/profile-tab"
import { DashboardSavedTab } from "~/app/(web)/dashboard/saved-tab"
import { DashboardSchoolTab } from "~/app/(web)/dashboard/school-tab"
import { DashboardTabs } from "~/app/(web)/dashboard/tabs"
import { DashboardTechniquesTab } from "~/app/(web)/dashboard/techniques-tab"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { ProfileEnhancementLauncher } from "~/components/web/onboarding/profile-enhancement-launcher"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getBrandSiteConfig } from "~/config/site"
import { requireUser } from "~/lib/auth-guard"
import { Brand } from "~/.generated/prisma/client"
import { getPageData, getPageMetadata } from "~/lib/pages"
import { getJoinWizardOptions } from "~/server/web/lineage/join-options"
import { getOnboardingState } from "~/server/web/onboarding/queries"
import { getBeltRanks } from "~/server/web/onboarding/ranks"

// I18n page namespace
const namespace = "pages.dashboard"

// Get page data
const getData = cache(async () => {
  const brandConfig = getBrandSiteConfig(Brand.BBL)
  const t = await getTranslations()
  const url = "/app/profile"
  const title = t(`${namespace}.title`)
  const description = t(`${namespace}.description`, { siteName: brandConfig.name })

  return await getPageData(url, title, description, {
    metadata: {
      robots: { index: false, follow: false },
    },
    breadcrumbs: [{ url, title }],
  })
})

export const generateMetadata = async (): Promise<Metadata> => {
  const { url, metadata } = await getData()
  return await getPageMetadata({ url, metadata })
}

export default async function ({ searchParams }: PageProps<"/app/profile">) {
  const { breadcrumbs, metadata } = await getData()

  const user = await requireUser()
  const [onboarding, ranks, joinOptions] = await Promise.all([
    getOnboardingState({ userId: user.id, role: user.role, brand: Brand.BBL }),
    getBeltRanks(Brand.BBL),
    // Registered instructor (NODE-keyed) + school (Organization-keyed) options for the wizard's
    // verified creatable comboboxes — the SAME cached public source the Join wizard uses.
    getJoinWizardOptions(),
  ])

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <Intro>
        <IntroTitle>{metadata.title}</IntroTitle>
        <IntroDescription>{metadata.description}</IntroDescription>
      </Intro>

      <Suspense fallback={null}>
        <ProfileEnhancementLauncher
          ranks={ranks}
          instructorOptions={joinOptions.instructors}
          schoolOptions={joinOptions.schools}
          userId={user.id}
          initialAvatarUrl={onboarding.avatarUrl}
          incomplete={!onboarding.hasAvatar || !onboarding.hasRank}
        />
      </Suspense>

      <div className="flex flex-col gap-8">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <DashboardMembership />
        </Suspense>

        <Section>
          <Section.Content>
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
                    id: "belts",
                    label: "Belts",
                    content: (
                      <Suspense fallback={<Skeleton className="h-64" />}>
                        <DashboardBeltsTab />
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
                  {
                    id: "events",
                    label: "Events",
                    content: (
                      <Suspense fallback={<Skeleton className="h-64" />}>
                        <DashboardEventsTab />
                      </Suspense>
                    ),
                  },
                  {
                    id: "billing",
                    label: "Billing",
                    content: (
                      <Suspense fallback={<Skeleton className="h-64" />}>
                        <DashboardBillingTab />
                      </Suspense>
                    ),
                  },
                  {
                    id: "saved",
                    label: "Saved",
                    content: (
                      <Suspense fallback={<Skeleton className="h-64" />}>
                        <DashboardSavedTab />
                      </Suspense>
                    ),
                  },
                ]}
                defaultTab="profile"
              />
            </Suspense>
          </Section.Content>

          <Section.Sidebar>
            <Card hover={false}>
              <CardHeader>
                <H4>Quick Links</H4>
              </CardHeader>
              <CardDescription className="line-clamp-none">
                <Stack direction="column" size="xs" className="items-start">
                  <Link href="/me">My Passport</Link>
                  <Link href="/app/techniques/new">Add technique</Link>
                  <Link href="/directory">Public directory</Link>
                  <Link href="/programs">Programs</Link>
                  <Link href="/tournaments">Tournaments</Link>
                  <Link href="/schools">Schools</Link>
                </Stack>
              </CardDescription>
            </Card>
          </Section.Sidebar>
        </Section>
      </div>
    </>
  )
}
