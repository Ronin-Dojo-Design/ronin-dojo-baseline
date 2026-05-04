import { CourseForm } from "~/app/admin/courses/_components/course-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <CourseForm title="Create course" />
    </Wrapper>
  )
})
