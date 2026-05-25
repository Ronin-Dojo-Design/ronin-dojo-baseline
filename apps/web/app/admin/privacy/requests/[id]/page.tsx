/**
 * Admin DSR detail page — view full request + transition status.
 *
 * @added SESSION_0255
 * @wired server/admin/privacy/queries.ts, server/admin/privacy/actions.ts
 */
import { formatDate } from "@dirstack/utils"
import { notFound } from "next/navigation"
import { DsrStatusActions } from "~/app/admin/privacy/requests/[id]/_components/dsr-status-actions"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Wrapper } from "~/components/common/wrapper"
import { findDataSubjectRequestById } from "~/server/admin/privacy/queries"

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  PENDING: "warning",
  IN_PROGRESS: "primary",
  FULFILLED: "success",
  REJECTED: "danger",
}

export default withAdminPage(async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const request = await findDataSubjectRequestById(id)

  if (!request) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <Link href="/admin/privacy/requests" className="text-xs text-muted-foreground">
        ← Back to requests
      </Link>

      <H3>Data Subject Request</H3>

      <DsrStatusActions request={{ id: request.id, status: request.status }} />

      <div className="grid gap-4 @lg:grid-cols-2">
        <div>
          <Note className="text-muted-foreground text-xs">Submitter</Note>
          <p className="font-medium">{request.user.name ?? "—"}</p>
          <Note className="text-xs">{request.user.email}</Note>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Type</Note>
          <Badge variant="outline">{request.type}</Badge>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Status</Note>
          <Badge variant={STATUS_VARIANT[request.status] ?? "outline"}>{request.status}</Badge>
        </div>
        <div>
          <Note className="text-muted-foreground text-xs">Submitted</Note>
          <p>{formatDate(request.submittedAt)}</p>
        </div>
        {request.fulfilledAt && (
          <div>
            <Note className="text-muted-foreground text-xs">Fulfilled/Rejected</Note>
            <p>{formatDate(request.fulfilledAt)}</p>
          </div>
        )}
        {request.fulfiller && (
          <div>
            <Note className="text-muted-foreground text-xs">Processed by</Note>
            <p>{request.fulfiller.name ?? request.fulfiller.email}</p>
          </div>
        )}
      </div>

      {request.reason && (
        <div>
          <Note className="text-muted-foreground text-xs">Reason (from submitter)</Note>
          <p className="mt-1 whitespace-pre-wrap text-sm">{request.reason}</p>
        </div>
      )}

      {request.notes && (
        <div>
          <Note className="text-muted-foreground text-xs">Admin notes</Note>
          <p className="mt-1 whitespace-pre-wrap text-sm">{request.notes}</p>
        </div>
      )}
    </Wrapper>
  )
})
