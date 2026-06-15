import { notFound } from "next/navigation"
import { ToolForm } from "~/app/app/tools/_components/tool-form"
import { Wrapper } from "~/components/common/wrapper"
import { findCategoryList } from "~/server/admin/categories/queries"
import { findTagList } from "~/server/admin/tags/queries"
import { findToolBySlug } from "~/server/admin/tools/queries"

export default async function Page({ params }: PageProps<"/app/tools/[slug]">) {
  const { slug } = await params
  const tool = await findToolBySlug(slug)

  if (!tool) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <ToolForm
        title={`Edit listing: ${tool.name}`}
        tool={tool}
        categoriesPromise={findCategoryList()}
        tagsPromise={findTagList()}
      />
    </Wrapper>
  )
}
