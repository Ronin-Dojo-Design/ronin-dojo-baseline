import { notFound } from "next/navigation"
import { ContentAtomForm } from "~/app/admin/content/_components/content-atom-form"
import { ContentMediaPanel } from "~/app/admin/content/_components/content-media-panel"
import { ContentVariantsPanel } from "~/app/admin/content/_components/content-variants-panel"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/common/tabs"
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
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="variants">Variants ({atom.variants.length})</TabsTrigger>
          <TabsTrigger value="media">Media ({atom.mediaAttachments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ContentAtomForm
            title={`Edit ${atom.title}`}
            atom={atom}
            tagsPromise={findTagList()}
            toolsPromise={findToolList()}
            disciplinesPromise={findDisciplineOptions()}
            stylesPromise={findStyleOptions()}
          />
        </TabsContent>

        <TabsContent value="variants">
          <ContentVariantsPanel atom={atom} />
        </TabsContent>

        <TabsContent value="media">
          <ContentMediaPanel atom={atom} />
        </TabsContent>
      </Tabs>
    </Wrapper>
  )
})
