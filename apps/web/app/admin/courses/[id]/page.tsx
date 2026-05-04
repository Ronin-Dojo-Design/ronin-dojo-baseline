import { notFound } from "next/navigation"
import { CourseForm } from "~/app/admin/courses/_components/course-form"
import { CurriculumItemsEditor } from "~/app/admin/courses/_components/curriculum-items-editor"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findCourseById } from "~/server/admin/courses/queries"

export default withAdminPage(async ({ params }) => {
  const { id } = await params
  const course = await findCourseById(id)

  if (!course) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <CourseForm title={`Edit ${course.title}`} course={course} />
      <CurriculumItemsEditor courseId={course.id} items={course.curriculumItems} />
    </Wrapper>
  )
})
