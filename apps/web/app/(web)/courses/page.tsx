import { Suspense } from "react"
import { Badge } from "~/components/common/badge"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { searchCourses } from "~/server/web/courses/queries"
import Link from "next/link"

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
        <Grid size="lg">
          {courses.map(course => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group flex flex-col gap-3 rounded-lg border p-5 transition-colors hover:bg-muted/50"
            >
              <h3 className="font-semibold text-lg group-hover:underline">{course.title}</h3>

              {course.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              )}

              <div className="mt-auto flex flex-wrap gap-2">
                {course.discipline && (
                  <Badge variant="soft">{course.discipline.name}</Badge>
                )}
                {course.rank && (
                  <Badge variant="outline">{course.rank.name}</Badge>
                )}
                <Badge variant="outline">
                  {course._count.curriculumItems} item{course._count.curriculumItems !== 1 ? "s" : ""}
                </Badge>
              </div>
            </Link>
          ))}

          {courses.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No courses found.
            </p>
          )}
        </Grid>
      </Section>
    </>
  )
}
