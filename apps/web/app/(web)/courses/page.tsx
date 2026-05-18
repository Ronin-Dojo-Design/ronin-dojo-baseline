import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { CourseListingSkeleton } from "~/components/web/courses/course-listing"
import { CourseQuery } from "~/components/web/courses/course-query"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { getRequestBrand } from "~/lib/brand-context"

export const metadata = {
  title: "Courses",
  description: "Browse available courses and curriculum.",
}

type PageProps = {
  searchParams: Promise<SearchParams>
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  return (
    <>
      <Intro>
        <IntroTitle>Courses</IntroTitle>
        <IntroDescription>Browse our curriculum and certification programs.</IntroDescription>
      </Intro>

      <Suspense fallback={<CourseListingSkeleton />}>
        <CourseQuery searchParams={searchParams} brand={brand} options={{ enableSort: true }} />
      </Suspense>
    </>
  )
}
