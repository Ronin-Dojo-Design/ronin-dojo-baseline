import type { Metadata } from "next"
import { Suspense } from "react"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"
import { generateCollectionPage } from "~/lib/structured-data"
import { DisciplineList } from "./_components/discipline-list"
import { DisciplineListSkeleton } from "./_components/discipline-list-skeleton"

export const metadata: Metadata = {
  title: "Disciplines",
  description: "Explore martial arts disciplines, styles, and rank systems.",
}

export default async function DisciplinesPage() {
  const brand = await getRequestBrand()

  return (
    <>
      <Breadcrumbs items={[{ url: "/disciplines", title: "Disciplines" }]} />

      <Intro>
        <IntroTitle>Disciplines</IntroTitle>
        <IntroDescription className="max-w-3xl">
          Explore martial arts disciplines, their rank systems, and affiliated organizations.
        </IntroDescription>
      </Intro>

      <Suspense fallback={<DisciplineListSkeleton />}>
        <DisciplineList brand={brand} />
      </Suspense>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            generateCollectionPage(
              "/disciplines",
              "Disciplines",
              "Explore martial arts disciplines, their rank systems, and affiliated organizations.",
            ),
          ],
        }}
      />
    </>
  )
}
