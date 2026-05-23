import { notFound } from "next/navigation"
import { ContentAtomForm } from "~/app/admin/content/_components/content-atom-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findContentAtomById, findStyleOptions } from "~/server/admin/content/queries"
import { findDisciplineOptions } from "~/server/admin/programs/queries"
import { findTagList } from "~/server/admin/tags/queries"
import { findToolList } from "~/server/admin/tools/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/content/[id]">) => {
  const { id } = await params
  const atom = await findContentAtomById(id)

  if (!atom) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <ContentAtomForm
        title={`Edit ${atom.title}`}
        atom={atom}
        tagsPromise={findTagList()}
        toolsPromise={findToolList()}
        disciplinesPromise={findDisciplineOptions()}
        stylesPromise={findStyleOptions()}
      />
    </Wrapper>
  )
})
