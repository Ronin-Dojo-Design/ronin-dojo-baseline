import type { Metadata } from "next"
import type { SearchParams } from "nuqs"
import { Brand } from "~/.generated/prisma/client"
import { getPageMetadata } from "~/lib/pages"
import { searchCourses } from "~/server/web/courses/queries"
import { CoursesIndex } from "./_components/courses-index"

type PageProps = {
  searchParams: Promise<SearchParams>
}

const PAGE_URL = "/courses"
const PAGE_TITLE = "Courses"
const PAGE_DESCRIPTION = "Browse our curriculum and certification programs."

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: PAGE_URL,
    metadata: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  })
}

export default async function CoursesPage({ searchParams }: PageProps) {
  // Lightweight top-N fetch (no q/sort/page) for ItemList JSON-LD.
  // Distinct cache key from CourseQuery's parsed-params fetch — no double-fetch.
  const { courses: featuredCourses, total } = await searchCourses({ perPage: 10 }, Brand.BBL)

  return (
    <CoursesIndex
      brand={Brand.BBL}
      featuredCourses={featuredCourses}
      total={total}
      searchParams={searchParams}
      pageUrl={PAGE_URL}
      pageTitle={PAGE_TITLE}
      pageDescription={PAGE_DESCRIPTION}
    />
  )
}
