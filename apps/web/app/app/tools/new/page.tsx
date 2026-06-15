import { ToolForm } from "~/app/app/tools/_components/tool-form"
import { Wrapper } from "~/components/common/wrapper"
import { findCategoryList } from "~/server/admin/categories/queries"
import { findTagList } from "~/server/admin/tags/queries"

export default function Page() {
  return (
    <Wrapper size="md" gap="sm">
      <ToolForm
        title="Create listing"
        categoriesPromise={findCategoryList()}
        tagsPromise={findTagList()}
      />
    </Wrapper>
  )
}
