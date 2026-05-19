import { EyeIcon, GitBranchIcon, ShieldCheckIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4, H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { LineageTreeBoard } from "~/components/web/lineage/lineage-tree-board"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getLineageEditorTree } from "~/server/web/lineage/editor-queries"

type Props = {
  params: Promise<{ treeId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { treeId } = await params
  const session = await getServerSession()

  if (!session?.user) {
    return { title: "Lineage Editor" }
  }

  const brand = await getRequestBrand()
  const result = await getLineageEditorTree({ brand, treeId, user: session.user })

  if (!result) {
    return { title: "Lineage Editor" }
  }

  return {
    title: `${result.tree.name} — Lineage Editor`,
    description: result.tree.description ?? `Editor preview for ${result.tree.name}`,
  }
}

export default async function DashboardLineageEditorPage({ params }: Props) {
  const { treeId } = await params
  const session = await getServerSession()

  if (!session?.user) {
    redirect(`/auth/login?next=/dashboard/lineage/${treeId}`)
  }

  const brand = await getRequestBrand()
  const result = await getLineageEditorTree({ brand, treeId, user: session.user })

  if (!result) {
    notFound()
  }

  const memberCount = result.members.length
  const groupCount = result.visualGroups.length

  return (
    <>
      <Intro>
        <IntroTitle>{result.tree.name}</IntroTitle>
        <IntroDescription>
          {result.tree.description ?? "Lineage editor preview for the current brand."}
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          {memberCount > 0 ? (
            <LineageTreeBoard
              members={result.members}
              visualGroups={result.visualGroups}
              defaultRootMemberId={result.defaultRootMemberId}
              profilesById={result.profilesById}
            />
          ) : (
            <Card hover={false}>
              <CardHeader direction="column" size="xs">
                <H4 as="h2">No members yet</H4>
                <CardDescription>
                  This lineage tree is editable, but no members have been added.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader direction="column" size="xs">
              <Stack size="xs" wrap>
                <Badge variant={result.tree.isPublished ? "success" : "warning"} size="sm">
                  {result.tree.isPublished ? "Published" : "Draft"}
                </Badge>
                <Badge variant="outline" size="sm">
                  {result.tree.visibility.toLowerCase()}
                </Badge>
              </Stack>
              <H6 as="h2">Editor Access</H6>
              <CardDescription>
                Capabilities are derived from global admin, organization admin, or explicit lineage
                ACL grants.
              </CardDescription>
            </CardHeader>

            <Stack size="xs" wrap>
              {result.capability.roles.map(role => (
                <Badge key={role} variant="outline" size="sm" prefix={<ShieldCheckIcon />}>
                  {role.replaceAll("_", " ").toLowerCase()}
                </Badge>
              ))}
            </Stack>

            <Stack direction="column" size="xs">
              <Note>{memberCount} members in preview</Note>
              <Note>{groupCount} visual groups</Note>
              <Note>
                {result.capability.canEditTree
                  ? "Tree-level edit controls can be enabled next."
                  : "Preview access only for this grant."}
              </Note>
            </Stack>

            <Stack direction="column" size="xs" className="w-full">
              <Button size="sm" variant="secondary" prefix={<GitBranchIcon />} asChild>
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
              {result.tree.isPublished && (
                <Button size="sm" variant="ghost" prefix={<EyeIcon />} asChild>
                  <Link href={`/lineage/${result.tree.slug}`}>Open public view</Link>
                </Button>
              )}
            </Stack>
          </Card>
        </Section.Sidebar>
      </Section>
    </>
  )
}
