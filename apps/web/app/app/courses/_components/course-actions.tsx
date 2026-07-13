"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Course } from "~/.generated/prisma/browser"
import { CoursesDeleteDialog } from "~/app/app/courses/_components/courses-delete-dialog"
import { RowActionsMenu } from "~/components/admin/row-actions-menu"
import { RowDeleteButton } from "~/components/admin/row-delete-button"
import type { Button } from "~/components/common/button"
import { DropdownMenuItem } from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"

type CourseActionsProps = ComponentProps<typeof Button> & {
  course: Course
}

export const CourseActions = ({ course, className, ...props }: CourseActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const coursePath = `/app/courses/${course.id}`
  const isCoursePage = pathname === coursePath

  return (
    <Stack size="sm" wrap={false}>
      <RowActionsMenu className={className} {...props}>
        {!isCoursePage && (
          <DropdownMenuItem render={<Link href={coursePath} />}>Edit</DropdownMenuItem>
        )}
      </RowActionsMenu>

      <CoursesDeleteDialog courses={[course]} onExecute={() => router.push("/app/courses")}>
        <RowDeleteButton {...props} />
      </CoursesDeleteDialog>
    </Stack>
  )
}
