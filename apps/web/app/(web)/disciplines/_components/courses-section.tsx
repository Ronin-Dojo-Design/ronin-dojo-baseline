import type { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { db } from "~/services/db"

type CoursesSectionProps = {
  disciplineId: string
  brand: Brand
}

/**
 * Server component listing published courses for a discipline.
 */
export async function CoursesSection({ disciplineId, brand }: CoursesSectionProps) {
  const courses = await db.course.findMany({
    where: {
      disciplineId,
      brand,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      certificationType: true,
      organization: { select: { name: true } },
    },
    orderBy: { title: "asc" },
    take: 20,
  })

  if (courses.length === 0) {
    return (
      <section>
        <H4 render={props => <h3 {...props}>{props.children}</h3>}>Courses & Certifications</H4>
        <p className="mt-2 text-sm text-muted-foreground">No published courses yet.</p>
      </section>
    )
  }

  return (
    <section>
      <H4 render={props => <h3 {...props}>{props.children}</h3>} className="mb-4">
        Courses & Certifications ({courses.length})
      </H4>
      <div className="grid gap-3 @md:grid-cols-2">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <Stack size="sm" direction="column">
                <span className="font-medium">{course.title}</span>
                <Stack size="xs" className="text-sm text-muted-foreground">
                  <Badge variant="outline" size="sm">
                    {course.certificationType}
                  </Badge>
                  <span>{course.organization.name}</span>
                </Stack>
              </Stack>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}
