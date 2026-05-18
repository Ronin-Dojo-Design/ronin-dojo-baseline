import type { Metadata } from "next"
import { headers } from "next/headers"
import { Suspense } from "react"
import { Brand } from "~/.generated/prisma/client"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { generateCollectionPage } from "~/lib/structured-data"
import { DisciplineList } from "./_components/discipline-list"
import { DisciplineListSkeleton } from "./_components/discipline-list-skeleton"

export const metadata: Metadata = {
  title: "Disciplines",
  description: "Explore martial arts disciplines, styles, and rank systems.",
}

export default async function DisciplinesPage() {
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.BASELINE_MARTIAL_ARTS

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
