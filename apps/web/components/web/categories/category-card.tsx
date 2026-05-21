import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { Link } from "~/components/common/link"
import { Skeleton } from "~/components/common/skeleton"
import { Tile, TileCaption, TileDivider, TileTitle } from "~/components/web/ui/tile"
import type { CategoryMany } from "~/server/web/categories/payloads"

type CategoryCardProps = ComponentProps<typeof Tile> & {
  category: CategoryMany
}

const CategoryCard = async ({ category, ...props }: CategoryCardProps) => {
  const t = await getTranslations()
  const count = category._count.tools

  return (
    <Tile render={<Link href={`/categories/${category.slug}`} />} {...props}>
      <TileTitle>{category.name}</TileTitle>

      <TileDivider />

      <TileCaption>{`${count} ${t("tools.count_tools", { count })}`}</TileCaption>
    </Tile>
  )
}

const CategoryCardSkeleton = () => {
  return (
    <Tile>
      <TileTitle className="w-1/3">
        <Skeleton>&nbsp;</Skeleton>
      </TileTitle>

      <Skeleton className="h-0.5 flex-1" />

      <TileCaption className="w-1/4">
        <Skeleton>&nbsp;</Skeleton>
      </TileCaption>
    </Tile>
  )
}

export { CategoryCard, CategoryCardSkeleton }
