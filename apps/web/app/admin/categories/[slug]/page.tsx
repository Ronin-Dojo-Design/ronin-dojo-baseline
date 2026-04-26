import { notFound } from "next/navigation"
import { CategoryForm } from "~/app/admin/categories/_components/category-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findCategoryBySlug } from "~/server/admin/categories/queries"
import { findToolList } from "~/server/admin/tools/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/categories/[slug]">) => {
  const { slug } = await params
  const category = await findCategoryBySlug(slug)

  if (!category) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <CategoryForm title="Update category" category={category} toolsPromise={findToolList()} />
    </Wrapper>
  )
})
