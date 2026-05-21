"use client"

import { CheckCircle2Icon, LogInIcon, UserPlusIcon, XCircleIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { enrollInCourse, unenrollFromCourse } from "~/server/web/course-enrollment/actions"

type CourseEnrollmentState = {
  id: string
  enrolledAt: string
  completedAt: string | null
} | null

type CourseEnrollmentPanelProps = {
  courseId: string
  courseSlug: string
  organizationName: string
  isAuthenticated: boolean
  hasActiveMembership: boolean
  enrollment: CourseEnrollmentState
  completedItems: number
  totalItems: number
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(date),
  )
}

export function CourseEnrollmentPanel({
  courseId,
  courseSlug,
  organizationName,
  isAuthenticated,
  hasActiveMembership,
  enrollment,
  completedItems,
  totalItems,
}: CourseEnrollmentPanelProps) {
  const router = useRouter()

  const enrollAction = useAction(enrollInCourse, {
    onSuccess: () => {
      toast.success("Course enrollment created")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Enrollment failed")
    },
  })

  const unenrollAction = useAction(unenrollFromCourse, {
    onSuccess: () => {
      toast.success("Course enrollment removed")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to unenroll")
    },
  })

  const isPending = enrollAction.isPending || unenrollAction.isPending

  if (!isAuthenticated) {
    return (
      <Card hover={false}>
        <Stack direction="column" size="md">
          <Stack size="sm">
            <Badge variant="outline">Sign in required</Badge>
          </Stack>
          <H4>Enroll in this course</H4>
          <Note>Sign in before enrolling or tracking curriculum progress.</Note>
          <Button
            variant="primary"
            prefix={<LogInIcon />}
            render={<Link href={`/auth/login?next=/courses/${courseSlug}`} />}
          >
            Sign in
          </Button>
        </Stack>
      </Card>
    )
  }

  if (!hasActiveMembership && !enrollment) {
    return (
      <Card hover={false}>
        <Stack direction="column" size="md">
          <Badge variant="warning">Membership required</Badge>
          <H4>Join {organizationName}</H4>
          <Note>
            Course enrollment opens after an active membership exists. Invites create that
            membership when claimed.
          </Note>
        </Stack>
      </Card>
    )
  }

  if (enrollment) {
    const isComplete = Boolean(enrollment.completedAt)

    return (
      <Card hover={false}>
        <Stack direction="column" size="md">
          <Stack size="sm">
            <Badge variant={isComplete ? "success" : "info"} prefix={<CheckCircle2Icon />}>
              {isComplete ? "Completed" : "Enrolled"}
            </Badge>
            <Badge variant="outline">
              {completedItems}/{totalItems} complete
            </Badge>
          </Stack>

          <Stack direction="column" size="xs">
            <H4>{isComplete ? "Course complete" : "Curriculum in progress"}</H4>
            <Note>
              Enrolled {formatDate(enrollment.enrolledAt)}
              {enrollment.completedAt ? `; completed ${formatDate(enrollment.completedAt)}` : ""}
            </Note>
          </Stack>

          <Button
            variant="destructive"
            isPending={unenrollAction.isPending}
            disabled={isPending}
            prefix={<XCircleIcon />}
            onClick={() => unenrollAction.execute({ enrollmentId: enrollment.id })}
          >
            Unenroll
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Card hover={false}>
      <Stack direction="column" size="md">
        <Badge variant="soft">Available</Badge>
        <H4>Enroll in this course</H4>
        <Note>
          Your active {organizationName} membership unlocks enrollment and completion tracking.
        </Note>
        <Button
          variant="primary"
          isPending={enrollAction.isPending}
          disabled={isPending}
          prefix={<UserPlusIcon />}
          onClick={() => enrollAction.execute({ courseId })}
        >
          Enroll
        </Button>
      </Stack>
    </Card>
  )
}
