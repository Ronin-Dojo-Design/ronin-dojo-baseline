import { CourseForm } from "~/app/app/courses/_components/course-form"
import { Wrapper } from "~/components/common/wrapper"

export default () => {
  return (
    <Wrapper size="md" gap="sm">
      <CourseForm title="Create course" />
    </Wrapper>
  )
}
