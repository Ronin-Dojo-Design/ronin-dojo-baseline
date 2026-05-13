import { CourseList } from "~/components/web/courses/course-list"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { searchCourses } from "~/server/web/courses/queries"

export const metadata = {
  title: "Courses",
  description: "Browse available courses and curriculum.",
}

type PageProps = {
  searchParams: Promise<{ q?: string; discipline?: string; page?: string }>
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()
  const sp = await searchParams
  const { courses, total } = await searchCourses(
    { q: sp.q, discipline: sp.discipline, page: Number(sp.page) || 1 },
    brand,
  )

  return (
    <>
      <Intro>
        <IntroTitle>Courses</IntroTitle>
        <IntroDescription>
          Browse our curriculum — {total} course{total !== 1 ? "s" : ""} available.
        </IntroDescription>
      </Intro>

      <Section>
        <CourseList courses={courses} />
      </Section>
    </>
  )
}
