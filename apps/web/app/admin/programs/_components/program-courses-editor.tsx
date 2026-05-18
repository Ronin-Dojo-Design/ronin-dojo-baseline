"use client"

import { XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { ComboboxSelector } from "~/components/admin/combobox-selector"
import { AnimatedContainer } from "~/components/common/animated-container"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { addProgramCourse, removeProgramCourses } from "~/server/admin/programs/actions"

type Course = { id: string; title: string; slug?: string }

type ProgramCoursesEditorProps = {
  programId: string
  linkedCourses: Course[]
  availableCourses: { id: string; title: string }[]
}

export function ProgramCoursesEditor({
  programId,
  linkedCourses,
  availableCourses,
}: ProgramCoursesEditorProps) {
  const router = useRouter()

  const addAction = useAction(addProgramCourse, {
    onSuccess: () => {
      toast.success("Course added")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to add course")
    },
  })

  const removeAction = useAction(removeProgramCourses, {
    onSuccess: () => {
      toast.success("Course removed")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to remove course")
    },
  })

  const handleAdd = (courseId: string) => {
    if (!courseId) return
    addAction.execute({ programId, courseId })
  }

  const handleRemove = (courseId: string) => {
    removeAction.execute({ programId, courseIds: [courseId] })
  }

  // Map available courses to combobox format (id + name)
  const comboboxOptions = availableCourses.map(c => ({ id: c.id, name: c.title }))

  return (
    <Stack direction="column" size="md">
      <H3>Courses</H3>

      <ComboboxSelector
        options={comboboxOptions}
        value=""
        onValueChange={handleAdd}
        placeholder="Add a course..."
        searchPlaceholder="Search courses..."
        emptyMessage="No available courses."
      />

      <AnimatedContainer height>
        <div>
          {linkedCourses.length === 0 ? (
            <Note>No courses linked to this program yet.</Note>
          ) : (
            <Stack direction="column" size="sm">
              {linkedCourses.map(course => (
                <Card key={course.id}>
                  <Stack direction="row" size="sm" className="items-center justify-between p-3">
                    <Stack direction="row" size="sm" className="items-center">
                      <Badge variant="soft" size="sm">
                        Course
                      </Badge>
                      <span className="text-sm font-medium">{course.title}</span>
                    </Stack>

                    <Button
                      variant="ghost"
                      size="sm"
                      prefix={<XIcon />}
                      onClick={() => handleRemove(course.id)}
                      isPending={removeAction.isPending}
                    />
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </div>
      </AnimatedContainer>
    </Stack>
  )
}
