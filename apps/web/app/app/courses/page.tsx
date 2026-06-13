import { Suspense } from "react"
import { CoursesTable } from "~/app/app/courses/_components/courses-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findCourses } from "~/server/admin/courses/queries"
import { coursesTableParamsCache } from "~/server/admin/courses/schema"

export default async ({ searchParams }: PageProps<"/app/courses">) => {
  const search = coursesTableParamsCache.parse(await searchParams)
  const coursesPromise = findCourses(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Courses" />}>
      <CoursesTable coursesPromise={coursesPromise} />
    </Suspense>
  )
}
