"use client"

import { EllipsisIcon, TrashIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { Course } from "~/.generated/prisma/browser"
import { CoursesDeleteDialog } from "~/app/admin/courses/_components/courses-delete-dialog"
import { Button } from "~/components/common/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/common/dropdown-menu"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"

type CourseActionsProps = ComponentProps<typeof Button> & {
  course: Course
}

export const CourseActions = ({ course, className, ...props }: CourseActionsProps) => {
  const pathname = usePathname()
  const router = useRouter()

  const coursePath = `/admin/courses/${course.id}`
  const isCoursePage = pathname === coursePath

  return (
    <Stack size="sm" wrap={false}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label="Open menu"
              variant="secondary"
              size="sm"
              prefix={<EllipsisIcon />}
              className={cx("data-open:bg-accent", className)}
              {...props}
            />
          }
        />

        <DropdownMenuContent align="end" sideOffset={8}>
          {!isCoursePage && (
            <DropdownMenuItem render={<Link href={coursePath} />}>Edit</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CoursesDeleteDialog courses={[course]} onExecute={() => router.push("/admin/courses")}>
        <Button
          variant="secondary"
          size="sm"
          prefix={<TrashIcon />}
          className="text-red-500"
          {...props}
        />
      </CoursesDeleteDialog>
    </Stack>
  )
}
