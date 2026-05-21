import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4, H5 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { CourseEnrollmentPanel } from "~/components/web/courses/course-enrollment-panel"
import { CurriculumCompletionList } from "~/components/web/courses/curriculum-completion-list"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { getCurrentCourseEnrollmentState } from "~/server/web/course-enrollment/queries"
import { findCourseBySlug } from "~/server/web/courses/queries"

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

  return getPageMetadata({
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
    : { enrollment: null, hasActiveMembership: false }

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

  return (
    <>
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
    </>
  )
}
