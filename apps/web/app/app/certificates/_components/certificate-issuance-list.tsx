"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { CertificateIssueDialog } from "~/app/app/certificates/_components/certificate-issue-dialog"
import type { ActiveUser } from "~/components/admin/recipient-options"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { client } from "~/lib/orpc-client"
import type { findIssuancesByTemplate } from "~/server/admin/certificates/issuance-queries"

type Issuance = Awaited<ReturnType<typeof findIssuancesByTemplate>>[number]

type Props = {
  templateId: string
  issuances: Issuance[]
  users: ActiveUser[]
}

export function CertificateIssuanceList({ templateId, issuances, users }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // oRPC `certificates.revoke` (WL-P2-43): the procedure owns the layout-typed
  // revalidation; the refresh here re-renders the revoked row (a Server Action
  // used to carry that re-render in-band — an RPC response doesn't).
  const revokeAction = ({ id }: { id: string }) => {
    startTransition(async () => {
      try {
        await client.certificates.revoke({ id })
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error && error.message ? error.message : "Failed to revoke certificate",
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <H4>Issued Certificates ({issuances.length})</H4>
        <CertificateIssueDialog templateId={templateId} users={users} />
      </div>

      {issuances.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No certificates issued yet.</p>
      ) : (
        <div className="divide-y rounded-lg border">
          {issuances.map(issuance => (
            <div key={issuance.id} className="flex items-center justify-between gap-4 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{issuance.certificateNumber}</span>
                  {issuance.revokedAt ? (
                    <Badge variant="danger">Revoked</Badge>
                  ) : issuance.expiresAt && new Date(issuance.expiresAt) < new Date() ? (
                    <Badge variant="outline">Expired</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {issuance.user.name ?? issuance.user.email} — issued{" "}
                  {new Date(issuance.issuedAt).toLocaleDateString()}
                </p>
              </div>

              {!issuance.revokedAt && (
                <Button
                  size="sm"
                  variant="secondary"
                  isPending={isPending}
                  onClick={() => revokeAction({ id: issuance.id })}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
