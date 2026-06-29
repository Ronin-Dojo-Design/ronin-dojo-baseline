import type { ComponentProps } from "react"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { ListingCard, ListingCardSkeleton } from "~/components/web/listing/listing-card"
import type { CourseMany } from "~/server/web/courses/payloads"

/**
 * CourseCard — a thin adapter over the ONE catalog card `ListingCard` (doctrine §5; SESSION_0470).
 * Wires a `CourseMany` into ListingCard's slots: certification type → header badge, discipline/rank
 * → category badges, curriculum/enrollment counts → status badges. No bespoke card markup.
 */
type CourseCardProps = Omit<ComponentProps<typeof ListingCard>, "href" | "name"> & {
  course: CourseMany
}

const formatCertificationType = (value: string) => value.replace(/_/g, " ")

const CourseCard = ({ course, ...props }: CourseCardProps) => {
  const categories = [
    course.discipline && { name: course.discipline.name },
    course.rank && { name: course.rank.name },
  ].filter((c): c is { name: string } => Boolean(c))

  const itemCount = course._count.curriculumItems
  const enrolledCount = course._count.enrollments

  return (
    <ListingCard
      href={`/courses/${course.slug}`}
      name={course.title}
      headerBadges={
        <Badge variant="outline" className="-ml-1.5">
          {formatCertificationType(course.certificationType)}
        </Badge>
      }
      tagline={course.description}
      categories={categories}
      statusBadges={
        <Stack size="xs" className="flex-wrap">
          <Badge variant="outline">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </Badge>
          <Badge variant="soft">{enrolledCount} enrolled</Badge>
        </Stack>
      }
      viewLabel="View course"
      {...props}
    />
  )
}

const CourseCardSkeleton = ListingCardSkeleton

export { CourseCard, type CourseCardProps, CourseCardSkeleton }
