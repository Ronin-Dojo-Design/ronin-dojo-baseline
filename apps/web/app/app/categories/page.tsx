import { Suspense } from "react"
import { CategoriesTable } from "~/app/app/categories/_components/categories-table"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { findCategories } from "~/server/admin/categories/queries"
import { categoriesTableParamsCache } from "~/server/admin/categories/schema"

export default async function Page({ searchParams }: PageProps<"/app/categories">) {
  const search = categoriesTableParamsCache.parse(await searchParams)
  const categoriesPromise = findCategories(search)

  return (
    <Suspense fallback={<DataTableSkeleton title="Categories" />}>
      <CategoriesTable categoriesPromise={categoriesPromise} />
    </Suspense>
  )
}
