"use client"

import { useAction } from "next-safe-action/hooks"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { H4 } from "~/components/common/heading"
import { revokeCertificate } from "~/server/admin/certificates/issuance-actions"
import type { findIssuancesByTemplate } from "~/server/admin/certificates/issuance-queries"

type Issuance = Awaited<ReturnType<typeof findIssuancesByTemplate>>[number]

type Props = {
  templateId: string
  issuances: Issuance[]
}

export function CertificateIssuanceList({ templateId: _templateId, issuances }: Props) {
  const { execute: revokeAction, isPending } = useAction(revokeCertificate)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <H4>Issued Certificates ({issuances.length})</H4>
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
