import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { Suspense } from "react"
import { H6 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"
import { AdCard, AdCardSkeleton } from "~/components/web/ads/ad-card"
import { Container } from "~/components/web/ui/container"
import { NavLink } from "~/components/web/ui/nav-link"
import { Tile, TileCaption, TileDivider } from "~/components/web/ui/tile"
import { Brand } from "~/.generated/prisma/client"
import { brandHasFeature } from "~/config/brand-features"
import { cx } from "~/lib/utils"
import { findCategories } from "~/server/web/categories/queries"

export const Bottom = async ({ className, ...props }: ComponentProps<typeof Wrapper>) => {
  const t = await getTranslations("components.bottom")

  // Categories are the listings taxonomy — brands without listings skip the rail.
  const categories = brandHasFeature(Brand.BBL, "listings")
    ? await findCategories({
        orderBy: { tools: { _count: "desc" } },
        take: 12,
      })
    : []

  return (
    <Container>
      <Wrapper className={cx("py-fluid-md border-t border-foreground/10", className)} {...props}>
        {!!categories?.length && (
          <Stack className="gap-x-4 text-sm">
            <H6 render={props => <strong {...props}>{props.children}</strong>}>
              {t("popular_categories")}
            </H6>

            <div className="grid grid-cols-2xs gap-x-4 gap-y-2 w-full sm:grid-cols-xs md:grid-cols-sm">
              {categories.map(category => (
                <Tile
                  key={category.slug}
                  className="gap-2"
                  render={<NavLink href={`/categories/${category.slug}`} />}
                >
                  <span className="truncate">{category.label}</span>

                  <TileDivider />

                  <TileCaption className="max-sm:hidden">{category._count.tools}</TileCaption>
                </Tile>
              ))}
            </div>
          </Stack>
        )}

        <Suspense fallback={<AdCardSkeleton />}>
          <AdCard type="Bottom" />
        </Suspense>
      </Wrapper>
    </Container>
  )
}
