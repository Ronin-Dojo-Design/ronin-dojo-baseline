import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import type { BreadcrumbItem, CourseDetailView } from "./course-detail-data"

type CourseDetailHeaderProps = {
  course: CourseDetailView["course"]
  breadcrumbItems: BreadcrumbItem[]
}

/**
 * Course "hero": breadcrumbs + the title/description intro. Returns a fragment so
 * breadcrumbs and intro stay direct children of the brand typography scope
 * (preserving its `gap-y-fluid-md` rhythm). The `IntroTitle` inherits the BBL heading
 * font from the scope's heading selector (`bblHeadingScopeClass`) — no per-element
 * font class needed here.
 */
export function CourseDetailHeader({ course, breadcrumbItems }: CourseDetailHeaderProps) {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <Intro>
        <IntroTitle>{course.title}</IntroTitle>
        {course.description && <IntroDescription>{course.description}</IntroDescription>}
      </Intro>
    </>
  )
}
