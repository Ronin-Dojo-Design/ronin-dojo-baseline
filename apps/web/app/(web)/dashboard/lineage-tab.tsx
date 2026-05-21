import { EyeIcon, GitBranchIcon } from "lucide-react"
import { redirect } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardFooter, CardHeader } from "~/components/common/card"
import { H6 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findEditableLineageTrees } from "~/server/web/lineage/editor-queries"

export async function DashboardLineageTab() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login?next=/dashboard")
  }

  const brand = await getRequestBrand()
  const trees = await findEditableLineageTrees({ brand, user: session.user })

  if (trees.length === 0) {
    return (
      <Card hover={false}>
        <CardHeader direction="column" size="xs">
          <H6 render={props => <h2 {...props}>{props.children}</h2>}>No editable lineage trees</H6>
          <CardDescription>
            You do not have lineage editor access for the current brand yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {trees.map(tree => (
        <Card key={tree.id} hover={false}>
          <CardHeader direction="column" size="xs">
            <Stack size="xs" wrap>
              <Badge variant={tree.isPublished ? "success" : "warning"} size="sm">
                {tree.isPublished ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline" size="sm">
                {tree.visibility.toLowerCase()}
              </Badge>
              <Badge variant="soft" size="sm">
                {tree.scopeType.toLowerCase()}
              </Badge>
            </Stack>
            <H6 render={props => <h2 {...props}>{props.children}</h2>}>{tree.name}</H6>
            <CardDescription>
              {[tree.organizationName, tree.disciplineName].filter(Boolean).join(" · ") ||
                "Brand lineage tree"}
            </CardDescription>
          </CardHeader>

          <Stack size="xs" wrap>
            <Note>{tree.memberCount} members</Note>
            <Note>{tree.visualGroupCount} groups</Note>
            <Note>{tree.claimCount} claims</Note>
          </Stack>

          <Stack size="xs" wrap>
            {tree.capability.roles.map(role => (
              <Badge key={role} variant="outline" size="sm">
                {role.replaceAll("_", " ").toLowerCase()}
              </Badge>
            ))}
          </Stack>

          <CardFooter className="mt-auto w-full justify-between">
            <Button
              size="sm"
              variant="secondary"
              prefix={<EyeIcon />}
              render={<Link href={`/dashboard/lineage/${tree.id}`} />}
            >
              Open preview
            </Button>
            {tree.isPublished && (
              <Button
                size="sm"
                variant="ghost"
                prefix={<GitBranchIcon />}
                render={<Link href={`/lineage/${tree.slug}`} />}
              >
                Public view
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
