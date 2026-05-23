import { ContentAtomForm } from "~/app/admin/content/_components/content-atom-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findStyleOptions } from "~/server/admin/content/queries"
import { findDisciplineOptions } from "~/server/admin/programs/queries"
import { findTagList } from "~/server/admin/tags/queries"
import { findToolList } from "~/server/admin/tools/queries"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <ContentAtomForm
        title="Create content atom"
        tagsPromise={findTagList()}
        toolsPromise={findToolList()}
        disciplinesPromise={findDisciplineOptions()}
        stylesPromise={findStyleOptions()}
      />
    </Wrapper>
  )
})
