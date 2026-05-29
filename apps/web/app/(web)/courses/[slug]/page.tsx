import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/common/avatar"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4, H5 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { CourseCard } from "~/components/web/courses/course-card"
import { CourseEnrollmentPanel } from "~/components/web/courses/course-enrollment-panel"
import { CurriculumCompletionList } from "~/components/web/courses/curriculum-completion-list"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPage,
  generateSchemaReference,
  generateStructuredDataEntity,
} from "~/lib/structured-data"
import { getCurrentCourseEnrollmentState } from "~/server/web/course-enrollment/queries"
import {
  findCourseBySlug,
  findCourseInstructors,
  findProgramSiblingCourses,
  findRelatedCourses,
} from "~/server/web/courses/queries"

type PageProps = {
  params: Promise<{ slug: string }>
}

const formatCertificationType = (value: string) => value.replace(/_/g, " ")

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getRequestBrand()
  const course = await findCourseBySlug(slug, brand)

  if (!course) {
    return {}
  }

  return await getPageMetadata({
    url: `/courses/${course.slug}`,
    metadata: {
      title: course.title,
      description: course.description ?? `View curriculum for ${course.title}.`,
    },
  })
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const course = await findCourseBySlug(slug, brand)

  if (!course) {
    notFound()
  }

  const session = await getServerSession()
  const enrollmentState = session?.user
    ? await getCurrentCourseEnrollmentState({
        brand,
        courseId: course.id,
        organizationId: course.organization.id,
        userId: session.user.id,
      })
    : { enrollment: null, hasActiveMembership: false, hasCourseAccessEntitlement: false }

  const [instructors, programData] = await Promise.all([
    findCourseInstructors(course.organization.id, brand),
    findProgramSiblingCourses(course.id, brand),
  ])

  const programSiblingIds = programData.courses.map(c => c.id)
  const relatedCourses = await findRelatedCourses({
    courseId: course.id,
    brand,
    disciplineId: course.discipline?.id ?? null,
    organizationId: course.organization.id,
    excludeIds: programSiblingIds,
  })

  const completedItems = enrollmentState.enrollment?.itemCompletions.length ?? 0
  const totalItems = course.curriculumItems.length
  const enrollmentForClient = enrollmentState.enrollment
    ? {
        id: enrollmentState.enrollment.id,
        enrolledAt: enrollmentState.enrollment.enrolledAt.toISOString(),
        completedAt: enrollmentState.enrollment.completedAt?.toISOString() ?? null,
      }
    : null
  const completionsForClient =
    enrollmentState.enrollment?.itemCompletions.map(completion => ({
      id: completion.id,
      curriculumItemId: completion.curriculumItemId,
      completedAt: completion.completedAt.toISOString(),
    })) ?? []
  const courseUrl = `/courses/${course.slug}`
  const courseReference = generateSchemaReference("Course", courseUrl, course.title)
  const providerReference = generateSchemaReference(
    "Organization",
    `/organizations/${course.organization.slug}`,
    course.organization.name,
  )
  const aboutReference = course.discipline
    ? generateSchemaReference(
        "Thing",
        `/disciplines/${course.discipline.slug}`,
        course.discipline.name,
      )
    : undefined
  const breadcrumbItems = [
    { url: "/courses", title: "Courses" },
    { url: courseUrl, title: course.title },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <Intro>
        <IntroTitle>{course.title}</IntroTitle>
        {course.description && <IntroDescription>{course.description}</IntroDescription>}
      </Intro>

      <Section>
        <Section.Content>
          <Stack size="sm" className="flex-wrap">
            {course.discipline && <Badge variant="soft">{course.discipline.name}</Badge>}
            {course.rank && <Badge variant="outline">{course.rank.name}</Badge>}
            <Badge variant="outline">{formatCertificationType(course.certificationType)}</Badge>
            <Badge variant="soft">{course._count.enrollments} enrolled</Badge>
          </Stack>

          <Card hover={false}>
            <Stack direction="column" size="sm">
              <H5 render={props => <h2 {...props}>{props.children}</h2>}>Offered by</H5>
              <H4>{course.organization.name}</H4>
            </Stack>
          </Card>
        </Section.Content>

        <Section.Sidebar>
          <CourseEnrollmentPanel
            courseId={course.id}
            courseSlug={course.slug}
            organizationName={course.organization.name}
            isAuthenticated={Boolean(session?.user)}
            hasActiveMembership={enrollmentState.hasActiveMembership}
            hasCourseAccessEntitlement={enrollmentState.hasCourseAccessEntitlement}
            enrollment={enrollmentForClient}
            completedItems={completedItems}
            totalItems={totalItems}
          />
        </Section.Sidebar>
      </Section>

      {course.curriculumItems.length > 0 && (
        <Section>
          <Section.Content>
            <Stack direction="column" size="md">
              <H4>Curriculum</H4>
              <CurriculumCompletionList
                enrollmentId={enrollmentState.enrollment?.id}
                items={course.curriculumItems}
                completions={completionsForClient}
              />
            </Stack>
          </Section.Content>
        </Section>
      )}

      {/* Instructors */}
      {instructors.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Instructors</H4>
            <div className="grid gap-3 @md:grid-cols-2 @lg:grid-cols-3 mt-4">
              {instructors.map(instructor => (
                <Card key={instructor.id} hover={false}>
                  <CardHeader>
                    <Stack size="sm" wrap={false}>
                      <Avatar>
                        {instructor.user.image && (
                          <AvatarImage
                            src={instructor.user.image}
                            alt={instructor.user.name ?? ""}
                          />
                        )}
                        <AvatarFallback>
                          {(instructor.user.name ?? "?").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Stack direction="column" size="xs">
                        <span className="font-medium">{instructor.user.name ?? "Instructor"}</span>
                        <Stack size="xs" className="flex-wrap">
                          {instructor.roleAssignments.map(ra => (
                            <Badge key={ra.role.code} variant="soft" size="sm">
                              {ra.role.displayTitle ?? ra.role.code}
                            </Badge>
                          ))}
                          {instructor.rank && (
                            <Badge variant="outline" size="sm">
                              {instructor.rank.name}
                            </Badge>
                          )}
                          {instructor.discipline && (
                            <Badge variant="outline" size="sm">
                              {instructor.discipline.name}
                            </Badge>
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </Section.Content>
        </Section>
      )}

      {/* Courses in this Program */}
      {programData.courses.length > 0 && (
        <Section>
          <Section.Content>
            <Stack direction="column" size="md">
              <H4>
                Courses in{" "}
                {programData.programs.length === 1 ? programData.programs[0].name : "this program"}
              </H4>
              <Note>
                Other courses in the same program
                {programData.programs.length === 1 ? ` — ${programData.programs[0].name}` : ""}.
              </Note>
              <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
                {programData.courses.map(c => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </Stack>
          </Section.Content>
        </Section>
      )}

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <Section>
          <Section.Content>
            <Stack direction="column" size="md">
              <H4>Related Courses</H4>
              <div className="grid gap-4 @md:grid-cols-2 @lg:grid-cols-3">
                {relatedCourses.map(c => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </Stack>
          </Section.Content>
        </Section>
      )}

      <StructuredData
        data={createGraph([
          generateBreadcrumbs(breadcrumbItems),
          generateCollectionPage(
            courseUrl,
            course.title,
            course.description ?? `Curriculum and certification for ${course.title}`,
            {
              mainEntity: courseReference,
              provider: providerReference,
              about: aboutReference,
            },
          ),
          generateStructuredDataEntity({
            type: "Course",
            url: courseUrl,
            name: course.title,
            description: course.description,
            id: courseReference["@id"],
            provider: providerReference,
            about: aboutReference,
          }),
        ])}
      />
    </>
  )
}
