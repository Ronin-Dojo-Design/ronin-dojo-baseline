import { notFound } from "next/navigation"
import { LineageClaimabilityToggle } from "~/app/admin/lineage/_components/lineage-claimability-toggle"
import { LineageSelectedRankSelect } from "~/app/admin/lineage/_components/lineage-selected-rank-select"
import { withLineageAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { type AdminLineageTreeMember, findLineageTreeDetail } from "~/server/admin/lineage/queries"

function displayName(member: AdminLineageTreeMember) {
  return member.node.passport?.displayName ?? member.node.passport?.user?.name ?? "Unnamed profile"
}

function claimBadge(member: AdminLineageTreeMember) {
  if (member.currentClaim?.status === "APPROVED") {
    return (
      <Badge variant="success" size="sm">
        Claimed
      </Badge>
    )
  }
  if (member.currentClaim?.status === "PENDING") {
    return (
      <Badge variant="warning" size="sm">
        Pending claim
      </Badge>
    )
  }
  if (member.currentClaim?.status === "NEEDS_INFO") {
    return (
      <Badge variant="info" size="sm">
        Needs info
      </Badge>
    )
  }
  if (member.currentClaim) {
    return (
      <Badge variant="soft" size="sm">
        {member.currentClaim.status}
      </Badge>
    )
  }
  if (member.node.passport?.user == null) {
    return (
      <Badge variant="outline" size="sm">
        Unclaimed placeholder
      </Badge>
    )
  }
  return (
    <Badge variant="soft" size="sm">
      Account profile
    </Badge>
  )
}

export default withLineageAdminPage(async ({ params }: PageProps<"/admin/lineage/[treeId]">) => {
  const { treeId } = await params
  const tree = await findLineageTreeDetail(treeId)

  if (!tree) {
    notFound()
  }

  return (
    <Stack direction="column" className="gap-6">
      <Stack className="items-start justify-between gap-4" wrap>
        <Stack direction="column" size="xs">
          <Button variant="ghost" size="sm" render={<Link href="/admin/lineage" />}>
            Back to lineage
          </Button>
          <h1 className="font-semibold text-2xl">{tree.name}</h1>
          {tree.description && <Note>{tree.description}</Note>}
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

        <Stack size="xs" wrap>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={`/lineage/${tree.slug}`} target="_blank" />}
          >
            View public tree
          </Button>
          <Button
            variant="secondary"
            size="sm"
            render={<Link href={`/dashboard/lineage/${tree.id}`} />}
          >
            Open editor
          </Button>
          <Button variant="secondary" size="sm" render={<Link href="/admin/lineage/claims" />}>
            Review claims
          </Button>
        </Stack>
      </Stack>

      <Card className="p-4">
        <Stack className="items-center justify-between gap-4" wrap>
          <Stack direction="column" size="xs">
            <span className="font-medium">Tree claimability</span>
            <Note>
              When disabled, the public claim page blocks new claims for every profile in this tree.
            </Note>
          </Stack>
          <Stack size="xs" className="items-center">
            <LineageClaimabilityToggle
              target="tree"
              treeId={tree.id}
              initialChecked={tree.isClaimable}
              label={`Toggle claims for ${tree.name}`}
            />
            <Note>{tree.isClaimable ? "Accepting claims" : "Display only"}</Note>
          </Stack>
        </Stack>
      </Card>

      <Stack direction="column" className="gap-3">
        <Stack direction="column" size="xs">
          <h2 className="font-semibold text-xl">Profiles</h2>
          <Note>{tree.members.length} tree members</Note>
        </Stack>

        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[minmax(18rem,1fr)_12rem_16rem_9rem_11rem] gap-3 border-b bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground max-lg:hidden">
            <span>Profile</span>
            <span>Claim state</span>
            <span>Selected rank</span>
            <span>Claimable</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y">
            {tree.members.map(member => (
              <Card
                key={member.id}
                className="grid gap-3 rounded-none border-0 p-4 lg:grid-cols-[minmax(18rem,1fr)_12rem_16rem_9rem_11rem] lg:items-center"
              >
                <Stack direction="column" size="xs" className="min-w-0">
                  <span className="truncate font-medium">{displayName(member)}</span>
                  <Stack size="xs" wrap>
                    {member.node.passport?.user == null && (
                      <Badge variant="outline" size="sm">
                        Placeholder
                      </Badge>
                    )}
                    <Badge
                      variant={
                        member.node.verificationStatus === "VERIFIED"
                          ? "success"
                          : member.node.verificationStatus === "DISPUTED"
                            ? "danger"
                            : "soft"
                      }
                      size="sm"
                    >
                      {member.node.verificationStatus}
                    </Badge>
                  </Stack>
                </Stack>

                <Stack size="xs" wrap>
                  {claimBadge(member)}
                  {member.currentClaim?.claimant && (
                    <Note className="truncate">
                      {member.currentClaim.claimant.name ?? member.currentClaim.claimant.email}
                    </Note>
                  )}
                </Stack>

                <LineageSelectedRankSelect
                  treeId={tree.id}
                  member={member}
                  label={`Select display rank for ${displayName(member)}`}
                />

                <Stack size="xs" className="items-center">
                  <LineageClaimabilityToggle
                    target="member"
                    treeId={tree.id}
                    memberId={member.id}
                    initialChecked={member.isClaimable}
                    label={`Toggle claims for ${displayName(member)}`}
                  />
                  <Note>{member.isClaimable ? "On" : "Off"}</Note>
                </Stack>

                <Stack size="xs" className="justify-end" wrap>
                  {member.currentClaim && (
                    <Button
                      variant="secondary"
                      size="sm"
                      render={<Link href={`/admin/lineage/claims/${member.currentClaim.id}`} />}
                    >
                      Claim
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/lineage/${tree.slug}/edit/${member.node.id}`} />}
                  >
                    Profile
                  </Button>
                </Stack>
              </Card>
            ))}
          </div>
        </div>
      </Stack>
    </Stack>
  )
})
