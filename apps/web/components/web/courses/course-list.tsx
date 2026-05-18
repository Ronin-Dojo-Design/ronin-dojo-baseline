import type { ComponentProps } from "react"
import { CourseCard, CourseCardSkeleton } from "~/components/web/courses/course-card"
import { EmptyList } from "~/components/web/empty-list"
import { Grid } from "~/components/web/ui/grid"
import type { CourseMany } from "~/server/web/courses/payloads"

type CourseListProps = ComponentProps<typeof Grid> & {
  courses: CourseMany[]
}

const CourseList = ({ children, courses, ...props }: CourseListProps) => {
  return (
    <Grid {...props}>
      {courses.map((course, order) => (
        <CourseCard key={course.slug} course={course} style={{ order }} />
      ))}

      {courses.length ? children : <EmptyList>No courses found.</EmptyList>}
    </Grid>
  )
}

const CourseListSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <Grid>
      {[...Array(count)].map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { CourseList, type CourseListProps, CourseListSkeleton }
