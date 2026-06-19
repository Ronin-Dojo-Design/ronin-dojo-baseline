import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { CourseListingSkeleton } from "~/components/web/courses/course-listing"
import { CourseQuery } from "~/components/web/courses/course-query"
import { StructuredData } from "~/components/web/structured-data"
import { bblHeadingFontClass, BrandTypography } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPage,
  generateGenericItemList,
} from "~/lib/structured-data"
import type { CourseMany } from "~/server/web/courses/payloads"
import { CatalogAside } from "./catalog-aside"
import { buildCourseCollectionItems } from "./course-collection-schema"

type CoursesIndexProps = {
  /** Resolved request brand — drives which font tokens the typography scope exposes. */
  brand: Brand
  /** Lightweight top-N featured courses for the ItemList JSON-LD (no q/sort/page). */
  featuredCourses: CourseMany[]
  /** Total published-course count for this brand (catalog summary). */
  total: number
  /** Forwarded to the live-search `CourseQuery` island under the Suspense boundary. */
  searchParams: Promise<SearchParams>
  pageUrl: string
  pageTitle: string
  pageDescription: string
}

/**
 * Public orchestrator for the courses index (the colocated folder module's barrel —
 * the only export consumers import). Thin by design: it shapes the on-the-wire
 * featured courses into structured data, then composes breadcrumbs + intro + the
 * searchable catalog + sidebar inside the brand typography scope. The catalog list
 * stays the existing `CourseQuery` Suspense island (reused, not re-implemented); the
 * sidebar cards live in the sibling `CatalogAside`.
 *
 * Brand seam: the visible body renders inside `BrandTypography` so the title + section
 * headings inherit the BBL type tokens under BBL and degrade to the app fonts off-BBL
 * (the consumer authorizes the tokens; the sections stay brand-agnostic). The colors
 * were already token-correct (semantic `text-muted-foreground` / `Badge` variants, no
 * hex literals), so step 2 is a type-seam-only pass here.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function CoursesIndex({
  brand,
  featuredCourses,
  total,
  searchParams,
  pageUrl,
  pageTitle,
  pageDescription,
}: CoursesIndexProps) {
  const itemListItems = buildCourseCollectionItems(featuredCourses)

  return (
    <>
      <BrandTypography brand={brand}>
        <Breadcrumbs items={[{ url: pageUrl, title: pageTitle }]} />

        <Intro>
          <IntroTitle className={bblHeadingFontClass}>{pageTitle}</IntroTitle>
          <IntroDescription>{pageDescription}</IntroDescription>
        </Intro>

        <Section>
          <Section.Content>
            <Suspense fallback={<CourseListingSkeleton />}>
              <CourseQuery
                searchParams={searchParams}
                brand={brand}
                options={{ enableSort: true }}
              />
            </Suspense>
          </Section.Content>

          <Section.Sidebar>
            <CatalogAside total={total} />
          </Section.Sidebar>
        </Section>
      </BrandTypography>

      <StructuredData
        data={createGraph([
          generateBreadcrumbs([{ url: pageUrl, title: pageTitle }]),
          generateCollectionPage(pageUrl, pageTitle, pageDescription),
          generateGenericItemList(itemListItems, pageTitle, "Course"),
        ])}
      />
    </>
  )
}
