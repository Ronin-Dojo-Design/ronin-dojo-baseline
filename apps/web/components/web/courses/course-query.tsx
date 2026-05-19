import { getTranslations } from "next-intl/server"
import type { SearchParams } from "nuqs"
import type { Brand } from "~/.generated/prisma/client"
import { CourseList, type CourseListProps } from "~/components/web/courses/course-list"
import { CourseListing, type CourseListingProps } from "~/components/web/courses/course-listing"
import type { PaginationProps } from "~/components/web/pagination"
import { ResultsCount } from "~/components/web/ui/results-count"
import { searchCourses } from "~/server/web/courses/queries"
import { type CourseFilterParams, courseFilterParamsCache } from "~/server/web/courses/schema"

type CourseQueryProps = Omit<CourseListingProps, "list" | "pagination"> & {
  searchParams: Promise<SearchParams>
  brand: Brand
  overrideParams?: Partial<CourseFilterParams>
  list?: Partial<Omit<CourseListProps, "courses">>
  pagination?: Partial<Omit<PaginationProps, "total" | "pageSize">>
}

const CourseQuery = async ({
  searchParams,
  brand,
  overrideParams,
  list,
  pagination,
  ...props
}: CourseQueryProps) => {
  const parsedParams = courseFilterParamsCache.parse(await searchParams)
  const params = { ...parsedParams, ...overrideParams }
  const { courses, total, page, perPage } = await searchCourses(
    { q: params.q, sort: params.sort, page: params.page, perPage: params.perPage },
    brand,
  )
  const t = await getTranslations("courses")

  return (
    <>
      <ResultsCount total={total} label={t("results", { count: total })} />
      <CourseListing pagination={{ total, perPage, page, ...pagination }} {...props}>
        <CourseList courses={courses} {...list} />
      </CourseListing>
    </>
  )
}

export { CourseQuery, type CourseQueryProps }
