import { getTranslations } from "next-intl/server"
import type { ComponentProps } from "react"
import { CategoryCard, CategoryCardSkeleton } from "~/components/web/categories/category-card"
import { EmptyList } from "~/components/web/empty-list"
import { Grid } from "~/components/web/ui/grid"
import { cx } from "~/lib/utils"
import type { CategoryMany } from "~/server/web/categories/payloads"

type CategoryListProps = ComponentProps<typeof Grid> & {
  categories: CategoryMany[]
}

const CategoryList = async ({ categories, className, ...props }: CategoryListProps) => {
  const t = await getTranslations()

  return (
    <Grid className={cx("gap-x-8", className)} {...props}>
      {categories.map(category => (
        <CategoryCard key={category.slug} category={category} />
      ))}

      {!categories.length && <EmptyList>{t("categories.no_categories")}</EmptyList>}
    </Grid>
  )
}

const CategoryListSkeleton = () => {
  return (
    <Grid className="gap-x-8">
      {[...Array(24)].map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </Grid>
  )
}

export { CategoryList, CategoryListSkeleton }
