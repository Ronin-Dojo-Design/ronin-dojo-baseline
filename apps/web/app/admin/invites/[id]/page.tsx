import { formatDate } from "@dirstack/utils"
import { notFound } from "next/navigation"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { H3, H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { findInviteById } from "~/server/admin/invites/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/invites/[id]">) => {
  const { id } = await params
  const invite = await findInviteById(id)

  if (!invite) {
    notFound()
  }

  const inviteUrl = `/invite/${invite.code}`

  return (
    <div className="space-y-6">
      <Stack className="justify-between">
        <H3>Invite Details</H3>
        <Badge
          variant={
            invite.status === "PENDING"
              ? "primary"
              : invite.status === "ACCEPTED"
                ? "success"
                : invite.status === "REVOKED"
                  ? "danger"
                  : "outline"
          }
        >
          {invite.status}
        </Badge>
      </Stack>

      <div className="grid gap-4 @lg:grid-cols-2">
        <div>
          <Note className="text-muted-foreground text-xs">Code</Note>
          <p className="font-mono">{invite.code}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Invite Link</Note>
          <p className="font-mono text-sm break-all">{inviteUrl}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Organization</Note>
          <p>{invite.organization.name}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Type</Note>
          <Badge variant="outline">{invite.type}</Badge>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Uses</Note>
          <p className="tabular-nums">
            {invite.currentUses}/{invite.maxUses ?? "∞"}
          </p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Expires</Note>
          <p>{invite.expiresAt ? formatDate(invite.expiresAt) : "Never"}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Created By</Note>
          <p>{invite.createdBy.name ?? invite.createdBy.email}</p>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Created At</Note>
          <p>{formatDate(invite.createdAt)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <H4>Claims ({invite.claims.length})</H4>

        {invite.claims.length === 0 ? (
          <Note>No claims yet.</Note>
        ) : (
          <div className="divide-y rounded-lg border">
            {invite.claims.map(claim => (
              <div key={claim.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="font-medium">{claim.user.name ?? claim.user.email}</p>
                  <Note className="text-xs">{claim.user.email}</Note>
                </div>
                <Note className="text-xs">{formatDate(claim.claimedAt)}</Note>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
