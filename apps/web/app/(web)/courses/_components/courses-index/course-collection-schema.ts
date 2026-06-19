import type { CourseMany } from "~/server/web/courses/payloads"
import { generateSchemaReference } from "~/lib/structured-data"

/**
 * Shape the on-the-wire featured courses into the ItemList entries the index
 * JSON-LD graph needs (Course `@id` + provider Organization + optional discipline
 * `about` references). Pure derivation kept out of the orchestrator's JSX so the
 * barrel stays thin (component-launch-sweep step 1).
 */
export function buildCourseCollectionItems(courses: CourseMany[]) {
  return courses.map(course => ({
    name: course.title,
    url: `/courses/${course.slug}`,
    description: course.description,
    id: generateSchemaReference("Course", `/courses/${course.slug}`, course.title)["@id"],
    provider: generateSchemaReference(
      "Organization",
      `/organizations/${course.organization.slug}`,
      course.organization.name,
    ),
    about: course.discipline
      ? generateSchemaReference(
          "Thing",
          `/disciplines/${course.discipline.slug}`,
          course.discipline.name,
        )
      : undefined,
  }))
}
