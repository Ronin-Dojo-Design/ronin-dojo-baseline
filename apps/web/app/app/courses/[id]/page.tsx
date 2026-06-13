import { notFound } from "next/navigation"
import { CourseForm } from "~/app/app/courses/_components/course-form"
import { CurriculumItemsEditor } from "~/app/app/courses/_components/curriculum-items-editor"
import { Wrapper } from "~/components/common/wrapper"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findCourseById } from "~/server/admin/courses/queries"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"

export default async ({ params }: PageProps<"/app/courses/[id]">) => {
  const { id } = await params
  const course = await findCourseById(id)

  if (!course) {
    return notFound()
  }

  const [session, brand] = await Promise.all([getServerSession(), getRequestBrand()])
  const courseAttachments = session?.user
    ? ((await getDashboardMediaAttachments({
        brand,
        user: session.user,
        target: { kind: "course", id: course.id },
      })) ?? [])
    : []

  return (
    <Wrapper size="md" gap="sm">
      <CourseForm title={`Edit ${course.title}`} course={course} />
      <MediaAttachmentManager
        target={{ kind: "course", id: course.id }}
        initialAttachments={courseAttachments}
        title="Course media"
        description="Upload course images or clips. Public items can appear on public course surfaces."
      />
      <CurriculumItemsEditor courseId={course.id} items={course.curriculumItems} />
    </Wrapper>
  )
}
