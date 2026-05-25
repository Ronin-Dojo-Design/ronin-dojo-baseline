import type { Metadata } from "next"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { CourseListingSkeleton } from "~/components/web/courses/course-listing"
import { CourseQuery } from "~/components/web/courses/course-query"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import {
  generateBreadcrumbs,
  generateCollectionPage,
  generateGenericItemList,
  generateSchemaReference,
} from "~/lib/structured-data"
import { searchCourses } from "~/server/web/courses/queries"

type PageProps = {
  searchParams: Promise<SearchParams>
}

const PAGE_URL = "/courses"
const PAGE_TITLE = "Courses"
const PAGE_DESCRIPTION = "Browse our curriculum and certification programs."

const CROSS_LINKS: Array<{ href: string; label: string; description: string }> = [
  {
    href: "/programs",
    label: "Programs",
    description: "Multi-course curriculum tracks",
  },
  {
    href: "/disciplines",
    label: "Disciplines",
    description: "Martial arts styles and rank systems",
  },
  {
    href: "/schools",
    label: "Schools",
    description: "Dojos and academies in the network",
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    url: PAGE_URL,
    metadata: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
    },
  })
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const brand = await getRequestBrand()

  // Lightweight top-N fetch (no q/sort/page) for ItemList JSON-LD.
  // Distinct cache key from CourseQuery's parsed-params fetch — no double-fetch.
  const { courses: featuredCourses, total } = await searchCourses({ perPage: 10 }, brand)

  const itemListItems = featuredCourses.map(course => ({
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

  return (
    <>
      <Breadcrumbs items={[{ url: PAGE_URL, title: PAGE_TITLE }]} />

      <Intro>
        <IntroTitle>{PAGE_TITLE}</IntroTitle>
        <IntroDescription>{PAGE_DESCRIPTION}</IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <Suspense fallback={<CourseListingSkeleton />}>
            <CourseQuery searchParams={searchParams} brand={brand} options={{ enableSort: true }} />
          </Suspense>
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <Stack direction="column" size="sm">
              <H5 render={props => <h2 {...props}>{props.children}</h2>}>Catalog</H5>
              <Stack size="sm" className="flex-wrap">
                <Badge variant="soft">{total} courses</Badge>
              </Stack>
              <Note>
                Search, sort, and pagination live inside the catalog on the left to keep this
                surface focused.
              </Note>
            </Stack>
          </Card>

          <Card hover={false}>
            <Stack direction="column" size="sm">
              <H5 render={props => <h2 {...props}>{props.children}</h2>}>Explore related</H5>
              <Stack direction="column" size="xs" className="w-full">
                {CROSS_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group rounded-md p-2 -mx-2 hover:bg-accent"
                  >
                    <Stack direction="column" size="xs">
                      <span className="font-medium text-sm">{link.label}</span>
                      <span className="text-xs text-muted-foreground">{link.description}</span>
                    </Stack>
                  </Link>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Section.Sidebar>
      </Section>

      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            generateBreadcrumbs([{ url: PAGE_URL, title: PAGE_TITLE }]),
            generateCollectionPage(PAGE_URL, PAGE_TITLE, PAGE_DESCRIPTION),
            generateGenericItemList(itemListItems, PAGE_TITLE, "Course"),
          ],
        }}
      />
    </>
  )
}
