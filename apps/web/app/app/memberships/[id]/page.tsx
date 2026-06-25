import { formatDate } from "@dirstack/utils"
import { notFound } from "next/navigation"
import { MembershipStatusActions } from "~/app/app/memberships/[id]/_components/membership-status-actions"
import { RoleAssignmentPanel } from "~/app/app/memberships/[id]/_components/role-assignment-panel"
import { Badge } from "~/components/common/badge"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Wrapper } from "~/components/common/wrapper"
import { findMembershipById } from "~/server/admin/memberships/queries"
import { findRoleList } from "~/server/admin/roles/queries"

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  INVITED: "primary",
  PENDING: "warning",
  ACTIVE: "success",
  SUSPENDED: "danger",
  CANCELLED: "outline",
  EXPIRED: "outline",
}

export default async ({ params }: PageProps<"/app/memberships/[id]">) => {
  const { id } = await params
  const [membership, roleList] = await Promise.all([findMembershipById(id), findRoleList()])

  if (!membership) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <H3>Membership — {membership.user.name ?? membership.user.email}</H3>

      <MembershipStatusActions membership={membership} />

      <div className="grid gap-4 @lg:grid-cols-2">
        <div>
          <Note className="text-muted-foreground text-xs">Member</Note>
          <p className="font-medium">{membership.user.name ?? "—"}</p>
          <Note className="text-xs">{membership.user.email}</Note>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Organization</Note>
          <p>
            <Link href={"/app/organizations"}>{membership.organization.name}</Link>
          </p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Discipline</Note>
          <p>{membership.discipline.name}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Status</Note>
          <Badge variant={STATUS_VARIANT[membership.status] ?? "outline"}>
            {membership.status}
          </Badge>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Rank</Note>
          <p>{membership.rank?.name ?? "—"}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Member Number</Note>
          <p className="font-mono">{membership.memberNumber ?? "—"}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Joined</Note>
          <p>{membership.joinedAt ? formatDate(membership.joinedAt) : "—"}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Left</Note>
          <p>{membership.leftAt ? formatDate(membership.leftAt) : "—"}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Created</Note>
          <p>{formatDate(membership.createdAt)}</p>
        </div>
      </div>

      <RoleAssignmentPanel
        membershipId={membership.id}
        roleAssignments={membership.roleAssignments}
        roleList={roleList}
      />
    </Wrapper>
  )
}
