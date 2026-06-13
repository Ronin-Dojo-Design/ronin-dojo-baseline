/**
 * Admin DSR list page — view and triage Data Subject Requests.
 *
 * @added SESSION_0255
 * @resolves SESSION_0254_FINDING_02
 * @wired server/admin/privacy/queries.ts
 */
import { formatDate } from "@dirstack/utils"
import { Badge } from "~/components/common/badge"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Wrapper } from "~/components/common/wrapper"
import { findDataSubjectRequests } from "~/server/admin/privacy/queries"

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  PENDING: "warning",
  IN_PROGRESS: "primary",
  FULFILLED: "success",
  REJECTED: "danger",
}

export default async function AppPrivacyRequestsPage() {
  const requests = await findDataSubjectRequests()

  return (
    <Wrapper size="lg">
      <H3>Data Subject Requests</H3>

      {requests.length === 0 ? (
        <p className="text-muted-foreground text-sm">No requests yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">Submitted</th>
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Reason</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b">
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(req.submittedAt)}</td>
                  <td className="py-2 pr-4">{req.user.email}</td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline">{req.type}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant={STATUS_VARIANT[req.status] ?? "outline"}>{req.status}</Badge>
                  </td>
                  <td className="py-2 pr-4 max-w-50 truncate">{req.reason ?? "—"}</td>
                  <td className="py-2">
                    <Link href={`/app/privacy/requests/${req.id}`} className="text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Wrapper>
  )
}
