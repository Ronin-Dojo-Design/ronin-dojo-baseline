"use client"

import { useTranslations } from "next-intl"
import type { PropsWithChildren } from "react"
import { Input } from "~/components/common/input"
import { CourseListSkeleton } from "~/components/web/courses/course-list"
import { CourseSearch, type CourseSearchProps } from "~/components/web/courses/course-search"
import { Pagination, type PaginationProps } from "~/components/web/pagination"
import { FiltersProvider, type FiltersProviderProps } from "~/contexts/filter-context"
import { courseFilterParams } from "~/server/web/courses/schema"

type CourseListingProps = PropsWithChildren & {
  pagination: PaginationProps
  search?: CourseSearchProps
  options?: Omit<FiltersProviderProps, "schema">
}

const CourseListing = ({ children, pagination, options, search }: CourseListingProps) => {
  return (
    <FiltersProvider schema={courseFilterParams} {...options}>
      <div className="space-y-5" id="courses">
        <CourseSearch {...search} />
        {children}
      </div>

      <Pagination {...pagination} />
    </FiltersProvider>
  )
}

const CourseListingSkeleton = () => {
  const t = useTranslations("common")

  return (
    <div className="space-y-5">
      <Input size="lg" placeholder={t("loading")} disabled />
      <CourseListSkeleton />
    </div>
  )
}

export { CourseListing, type CourseListingProps, CourseListingSkeleton }
