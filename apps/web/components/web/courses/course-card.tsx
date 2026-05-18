import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import type { CourseMany } from "~/server/web/courses/payloads"

type CourseCardProps = ComponentProps<typeof Card> & {
  course: CourseMany
}

const formatCertificationType = (value: string) => value.replace(/_/g, " ")

const CourseCard = ({ course, ...props }: CourseCardProps) => {
  return (
    <Card isRevealed {...props}>
      <CardHeader wrap={false}>
        <H4 as="h3" className="truncate">
          <Link href={`/courses/${course.slug}`}>
            <span className="absolute inset-0 z-10" />
            {course.title}
          </Link>
        </H4>

        <Badge variant="outline" className="-ml-1.5">
          {formatCertificationType(course.certificationType)}
        </Badge>
      </CardHeader>

      <Stack size="lg" direction="column" className="relative size-full flex-1">
        {course.description && (
          <CardDescription className="min-h-10">{course.description}</CardDescription>
        )}

        <Stack size="sm" className="mt-auto flex-wrap">
          {course.discipline && <Badge variant="soft">{course.discipline.name}</Badge>}
          {course.rank && <Badge variant="outline">{course.rank.name}</Badge>}
          <Badge variant="outline">
            {course._count.curriculumItems} item
            {course._count.curriculumItems === 1 ? "" : "s"}
          </Badge>
          <Badge variant="soft">{course._count.enrollments} enrolled</Badge>
        </Stack>
      </Stack>
    </Card>
  )
}

const CourseCardSkeleton = () => {
  return (
    <Card hover={false} className="items-stretch select-none">
      <CardHeader>
        <H4 className="w-2/3">
          <Skeleton>&nbsp;</Skeleton>
        </H4>
      </CardHeader>

      <CardDescription className="flex flex-col gap-0.5">
        <Skeleton className="h-5 w-4/5">&nbsp;</Skeleton>
        <Skeleton className="h-5 w-1/2">&nbsp;</Skeleton>
      </CardDescription>

      <Stack size="sm" className="mt-auto">
        {[...Array(2)].map((_, index) => (
          <Badge key={index} variant="outline" className="w-12">
            &nbsp;
          </Badge>
        ))}
      </Stack>
    </Card>
  )
}

export { CourseCard, type CourseCardProps, CourseCardSkeleton }
