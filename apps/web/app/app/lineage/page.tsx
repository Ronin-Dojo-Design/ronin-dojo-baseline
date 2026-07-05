import { Suspense } from "react"
import { LineageClaimabilityToggle } from "~/app/app/lineage/_components/lineage-claimability-toggle"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import { requireLineageManagementAccess } from "~/lib/auth-guard"
import { findLineageTrees } from "~/server/admin/lineage/queries"
import { lineageTreesTableParamsCache } from "~/server/admin/lineage/schema"
import { can } from "~/server/orpc/permissions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"

function ClaimBadge({
  claim,
}: {
  claim: { status: "PENDING" | "APPROVED" | "DENIED" | "NEEDS_INFO" | "CANCELLED" } | null
}) {
  if (!claim) {
    return (
      <Badge variant="outline" size="sm">
        No claims
      </Badge>
    )
  }

  const variant =
    claim.status === "APPROVED"
      ? "success"
      : claim.status === "PENDING"
        ? "warning"
        : claim.status === "NEEDS_INFO"
          ? "info"
          : "soft"

  return (
    <Badge variant={variant} size="sm">
      {claim.status}
    </Badge>
  )
}

async function LineageContent({
  searchParams,
  showStoryboard,
}: {
  searchParams: PageProps<"/app/lineage">["searchParams"]
  /** Storyboard is flat-`lineage.manage` only (see storyboard/page.tsx) — hide the link from tree-grant users. */
  showStoryboard: boolean
}) {
  const search = lineageTreesTableParamsCache.parse(await searchParams)
  const { trees, total } = await findLineageTrees(search)

  return (
    <Stack direction="column" className="gap-5">
      <Stack className="items-center justify-between gap-3" wrap>
        <Stack direction="column" size="xs">
          <h1 className="font-semibold text-2xl">Lineage</h1>
          <Note>{total} lineage trees</Note>
        </Stack>

        <Stack size="xs" wrap>
          {showStoryboard && (
            <Button variant="secondary" size="sm" render={<Link href="/app/lineage/storyboard" />}>
              Story scenes
            </Button>
          )}
          <Button variant="secondary" size="sm" render={<Link href="/app/lineage/claims" />}>
            Review claims
          </Button>
        </Stack>
      </Stack>

      {trees.length === 0 ? (
        <Note>No lineage trees found for this brand.</Note>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[minmax(18rem,1fr)_9rem_9rem_9rem_10rem] gap-3 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground max-lg:hidden">
            <span>Tree</span>
            <span>Members</span>
            <span>Claims</span>
            <span>Claimable</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y">
            {trees.map(tree => (
              <Card
                key={tree.id}
                className="grid gap-3 rounded-none border-0 p-4 lg:grid-cols-[minmax(18rem,1fr)_9rem_9rem_9rem_10rem] lg:items-center"
              >
                <Stack direction="column" size="xs" className="min-w-0">
                  <Link href={`/app/lineage/${tree.id}`} className="truncate font-medium">
                    {tree.name}
                  </Link>
                  <Stack size="xs" wrap>
                    <Badge variant={tree.isPublished ? "success" : "outline"} size="sm">
                      {tree.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="soft" size="sm">
                      {tree.visibility}
                    </Badge>
                    {tree.discipline && (
                      <Badge variant="info" size="sm">
                        {tree.discipline.name}
                      </Badge>
                    )}
                  </Stack>
                </Stack>

                <Note>{tree._count.members} members</Note>

                <Stack size="xs" wrap>
                  <ClaimBadge claim={tree.currentClaim} />
                  {tree._count.claimRequests > 0 && <Note>{tree._count.claimRequests} total</Note>}
                </Stack>

                <Stack size="xs" className="items-center">
                  <LineageClaimabilityToggle
                    target="tree"
                    treeId={tree.id}
                    initialChecked={tree.isClaimable}
                    label={`Toggle claims for ${tree.name}`}
                  />
                  <Note>{tree.isClaimable ? "On" : "Off"}</Note>
                </Stack>

                <Stack size="xs" className="justify-end" wrap>
                  <Button
                    variant="secondary"
                    size="sm"
                    render={<Link href={`/app/lineage/${tree.id}`} />}
                  >
                    Manage
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/lineage/${tree.slug}`} target="_blank" />}
                  >
                    View
                  </Button>
                </Stack>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Stack>
  )
}

export default async ({ searchParams }: PageProps<"/app/lineage">) => {
  const user = await requireLineageManagementAccess()

  return (
    <Suspense fallback={<DataTableSkeleton title="Lineage" />}>
      <LineageContent
        searchParams={searchParams}
        showStoryboard={can(user, APP_AREA_PERMISSIONS.lineage)}
      />
    </Suspense>
  )
}
