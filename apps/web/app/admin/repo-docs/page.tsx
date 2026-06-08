import { ExternalLinkIcon, FileSearchIcon, GitBranchIcon, RefreshCwIcon } from "lucide-react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H3, H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Wrapper } from "~/components/common/wrapper"

const repoTools = [
  {
    title: "Docs Navigator",
    href: "/admin/repo-docs/docs-navigator",
    description:
      "Generated from docs/ for fast local architecture, runbook, wiki, and session browsing.",
    icon: FileSearchIcon,
  },
  {
    title: "Graphify Map",
    href: "/graphify.html",
    description: "Local repo graph export. Refresh with bun run graphify:viz after graph changes.",
    icon: GitBranchIcon,
  },
  {
    title: "Regenerate Docs",
    href: "/admin/repo-docs#commands",
    description: "Run bun run docs:nav locally, then refresh this page.",
    icon: RefreshCwIcon,
  },
] as const

export default withAdminPage(() => {
  return (
    <Wrapper size="lg" gap="sm">
      <div className="grid gap-2">
        <H3>Repo Docs</H3>
        <p className="max-w-3xl text-sm text-secondary-foreground">
          Owner/admin navigation for local repo knowledge artifacts. These links are for operating
          the project, not for public site visitors or limited admin roles.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {repoTools.map(tool => (
          <Card key={tool.title} hover={false} className="min-h-56 justify-between">
            <CardHeader size="sm">
              <tool.icon className="size-5 text-muted-foreground" />
              <H4 className="text-base">{tool.title}</H4>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>

            {tool.href.includes("#") ? (
              <Button variant="secondary" render={<Link href={tool.href} />}>
                View command
              </Button>
            ) : (
              <Button
                variant="secondary"
                suffix={<ExternalLinkIcon />}
                render={<Link href={tool.href} target="_blank" rel="noreferrer" />}
              >
                Open
              </Button>
            )}
          </Card>
        ))}
      </div>

      <section id="commands" className="grid gap-3 rounded-md border p-4">
        <H4 className="text-base">Local Refresh Commands</H4>
        <div className="grid gap-2 text-sm text-secondary-foreground">
          <p>
            <code>bun run docs:nav</code> regenerates <code>docs/index.html</code>.
          </p>
          <p>
            <code>bun run graphify:viz</code> regenerates <code>apps/web/public/graphify.html</code>
            .
          </p>
        </div>
      </section>
    </Wrapper>
  )
})
