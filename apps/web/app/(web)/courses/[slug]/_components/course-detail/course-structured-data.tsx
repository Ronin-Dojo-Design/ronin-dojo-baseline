import { StructuredData } from "~/components/web/structured-data"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPage,
  generateSchemaReference,
  generateStructuredDataEntity,
} from "~/lib/structured-data"
import type { BreadcrumbItem, CourseDetailView } from "./course-detail-data"

type CourseStructuredDataProps = {
  course: CourseDetailView["course"]
  breadcrumbItems: BreadcrumbItem[]
  courseUrl: string
}

/**
 * JSON-LD graph for the course detail page (breadcrumbs + CollectionPage + the Course
 * entity with its provider Organization + optional discipline `about` references).
 * Renders a zero-height `<script>`, so it stays a sibling AFTER the brand typography
 * scope without affecting the page's visible vertical rhythm (the /about gotcha).
 */
export function CourseStructuredData({
  course,
  breadcrumbItems,
  courseUrl,
}: CourseStructuredDataProps) {
  const courseReference = generateSchemaReference("Course", courseUrl, course.title)
  const providerReference = generateSchemaReference(
    "Organization",
    `/organizations/${course.organization.slug}`,
    course.organization.name,
  )
  const aboutReference = course.discipline
    ? generateSchemaReference(
        "Thing",
        `/disciplines/${course.discipline.slug}`,
        course.discipline.name,
      )
    : undefined

  return (
    <StructuredData
      data={createGraph([
        generateBreadcrumbs(breadcrumbItems),
        generateCollectionPage(
          courseUrl,
          course.title,
          course.description ?? `Curriculum and certification for ${course.title}`,
          {
            mainEntity: courseReference,
            provider: providerReference,
            about: aboutReference,
          },
        ),
        generateStructuredDataEntity({
          type: "Course",
          url: courseUrl,
          name: course.title,
          description: course.description,
          id: courseReference["@id"],
          provider: providerReference,
          about: aboutReference,
        }),
      ])}
    />
  )
}
