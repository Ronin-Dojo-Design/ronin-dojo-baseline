import { ToolForm } from "~/app/admin/tools/_components/tool-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findCategoryList } from "~/server/admin/categories/queries"
import { findTagList } from "~/server/admin/tags/queries"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <ToolForm
        title="Create tool"
        categoriesPromise={findCategoryList()}
        tagsPromise={findTagList()}
      />
    </Wrapper>
  )
})
