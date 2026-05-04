import type { PropsWithChildren } from "react"
import { toast } from "sonner"
import type { Course } from "~/.generated/prisma/client"
import { DeleteDialog } from "~/components/admin/dialogs/delete-dialog"
import { deleteCourses } from "~/server/admin/courses/actions"

type CoursesDeleteDialogProps = PropsWithChildren<{
  courses: Course[]
  onExecute?: () => void
}>

export const CoursesDeleteDialog = ({
  courses,
  onExecute,
  ...props
}: CoursesDeleteDialogProps) => {
  return (
    <DeleteDialog
      ids={courses.map(({ id }) => id)}
      label="course"
      action={deleteCourses}
      callbacks={{
        onExecute: () => {
          toast.success("Courses deleted successfully")
          onExecute?.()
        },
        onError: ({ error }) => toast.error(error.serverError),
      }}
      {...props}
    />
  )
}
