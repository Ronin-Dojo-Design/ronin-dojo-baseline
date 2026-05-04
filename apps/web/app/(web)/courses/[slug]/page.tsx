import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { findCourseBySlug } from "~/server/web/courses/queries"
import Link from "next/link"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const course = await findCourseBySlug(slug, brand)

  if (!course) {
    notFound()
  }

  return (
    <>
      <Intro>
        <IntroTitle>{course.title}</IntroTitle>
        {course.description && (
          <IntroDescription>{course.description}</IntroDescription>
        )}
      </Intro>

      <Section>
        <Stack size="sm" className="flex-wrap">
          {course.discipline && (
            <Badge variant="soft">{course.discipline.name}</Badge>
          )}
          {course.rank && (
            <Badge variant="outline">{course.rank.name}</Badge>
          )}
          <Badge variant="outline">
            {course.certificationType.replace(/_/g, " ")}
          </Badge>
          <Badge variant="soft">
            {course._count.enrollments} enrolled
          </Badge>
        </Stack>
      </Section>

      {/* Curriculum Items */}
      {course.curriculumItems.length > 0 && (
        <Section>
          <H4>Curriculum</H4>
          <ol className="space-y-4">
            {course.curriculumItems.map((item, idx) => (
              <li key={item.id} className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <h5 className="font-medium">{item.title}</h5>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    )}

                    {/* Linked techniques */}
                    {item.techniqueLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.techniqueLinks.map(({ technique }) => (
                          <Link
                            key={technique.id}
                            href={`/techniques/${technique.slug}`}
                            className="inline-flex items-center gap-1 text-xs rounded-md border px-2 py-1 hover:bg-muted/50 transition-colors"
                          >
                            {technique.name}
                            {technique.difficultyLevel && (
                              <Badge variant="soft" className="text-[10px] px-1 py-0">
                                {technique.difficultyLevel.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Organization info */}
      <Section>
        <p className="text-sm text-muted-foreground">
          Offered by <span className="font-medium text-foreground">{course.organization.name}</span>
        </p>
      </Section>
    </>
  )
}
