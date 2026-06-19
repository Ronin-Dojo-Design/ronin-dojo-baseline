import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { findCourseBySlug } from "~/server/web/courses/queries"
import { CourseDetail } from "./_components/course-detail"
import { loadCourseDetail } from "./_components/course-detail/course-detail-data"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getRequestBrand()
  const course = await findCourseBySlug(slug, brand)

  if (!course) {
    return {}
  }

  return await getPageMetadata({
    url: `/courses/${course.slug}`,
    metadata: {
      title: course.title,
      description: course.description ?? `View curriculum for ${course.title}.`,
    },
  })
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const view = await loadCourseDetail(slug)

  if (!view) {
    notFound()
  }

  return <CourseDetail {...view} />
}
