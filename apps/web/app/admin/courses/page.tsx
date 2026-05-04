import { Suspense } from "react"
import { CoursesTable } from "~/app/admin/courses/_components/courses-table"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findCourses } from "~/server/admin/courses/queries"
import { coursesTableParamsCache } from "~/server/admin/courses/schema"

export default withAdminPage(async ({ searchParams }) => {
  const search = coursesTableParamsCache.parse(await searchParams)
  const coursesPromise = findCourses(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Courses" />}>
      <CoursesTable coursesPromise={coursesPromise} />
    </Suspense>
  )
})
