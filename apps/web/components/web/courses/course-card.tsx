import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { ShowMore } from "~/components/common/show-more"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import type { CourseMany } from "~/server/web/courses/payloads"

type CourseCardProps = ComponentProps<typeof Card> & {
  course: CourseMany
}

const formatCertificationType = (value: string) => value.replace(/_/g, " ")

const CourseCard = ({ course, ...props }: CourseCardProps) => {
  const chips = [
    course.discipline && {
      key: `disc-${course.discipline.id}`,
      label: course.discipline.name,
      variant: "soft" as const,
    },
    course.rank && {
      key: `rank-${course.rank.id}`,
      label: course.rank.name,
      variant: "outline" as const,
    },
  ].filter((chip): chip is { key: string; label: string; variant: "soft" | "outline" } =>
    Boolean(chip),
  )

  const itemCount = course._count.curriculumItems
  const enrolledCount = course._count.enrollments

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

      <div className="relative size-full flex flex-col">
        <Stack size="lg" direction="column" className="flex-1 duration-200 group-hover:opacity-0">
          {course.description && (
            <CardDescription className="min-h-10">{course.description}</CardDescription>
          )}

          <ShowMore
            items={chips}
            limit={2}
            renderItem={chip => <Badge variant={chip.variant}>{chip.label}</Badge>}
            size="xs"
            showMoreType="text"
            className="mt-auto flex-wrap"
          />
        </Stack>

        <div className="absolute inset-0 opacity-0 duration-200 group-hover:opacity-100">
          <Stack size="lg" direction="column" className="size-full">
            {course.description && (
              <CardDescription className="line-clamp-3">{course.description}</CardDescription>
            )}

            <Stack size="xs" className="mt-auto flex-wrap">
              <Badge variant="outline">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </Badge>
              <Badge variant="soft">{enrolledCount} enrolled</Badge>
            </Stack>
          </Stack>
        </div>
      </div>
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
