import dynamic from "next/dynamic"
import Link from "next/link"
import type { SearchParams } from "nuqs"
import { Suspense } from "react"
import type { Brand } from "~/.generated/prisma/client"
import { Button } from "~/components/common/button"
import { TechniqueListingSkeleton } from "~/components/web/techniques/technique-listing"
import { TechniqueQuery } from "~/components/web/techniques/technique-query"
import { BrandTypography, bblHeadingScopeClass } from "~/components/web/ui/brand-typography"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { TechniquesIndexStructuredData } from "./techniques-index-structured-data"

// Lazy boundary: the cross-links sit below the technique grid, so their chunk loads
// once reached. SSR is kept (no `ssr: false`) so they still server-render.
const TechniquesCrossLinks = dynamic(() =>
  import("./techniques-cross-links").then(m => m.TechniquesCrossLinks),
)

type TechniquesIndexView = {
  searchParams: Promise<SearchParams>
  brand: Brand
  url: string
  title: string
  description: string
}

/**
 * Public technique-library orchestrator — the folder module's barrel and only export
 * (component-launch-sweep recipe). Thin: it composes the header + the streamed query +
 * lazy cross-links inside the brand typography scope, and renders the JSON-LD sibling;
 * the route owns metadata + brand resolution.
 *
 * Brand seam: the visible body renders inside `BrandTypography` (`bblHeadingScopeClass`)
 * so the heading + body inherit the BBL type tokens under BBL and degrade to the app
 * fonts off-BBL. The technique cards/badges were already token-clean (semantic Badge
 * variants, ListingCard chrome — no hex literals), so step 2 is a type-seam-only pass.
 *
 * @see docs/runbooks/component-launch-sweep-recipe.md
 */
export function TechniquesIndex({
  searchParams,
  brand,
  url,
  title,
  description,
}: TechniquesIndexView) {
  return (
    <>
      <BrandTypography brand={brand} className={bblHeadingScopeClass}>
        <Breadcrumbs items={[{ url, title }]} />

        <Intro>
          <IntroTitle>{title}</IntroTitle>
          <IntroDescription>{description}</IntroDescription>
          <Button variant="secondary" render={<Link href="/techniques/graph" />}>
            BJJ Graph
          </Button>
        </Intro>

        <Section>
          <Section.Content>
            <Suspense fallback={<TechniqueListingSkeleton />}>
              <TechniqueQuery
                searchParams={searchParams}
                brand={brand}
                options={{ enableFilters: true, enableSort: true }}
              />
            </Suspense>
          </Section.Content>
        </Section>

        <TechniquesCrossLinks />
      </BrandTypography>

      <TechniquesIndexStructuredData url={url} title={title} description={description} />
    </>
  )
}
