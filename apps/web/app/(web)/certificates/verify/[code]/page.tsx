import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { findIssuanceByQrCode } from "~/server/admin/certificates/issuance-queries"

type PageProps = {
  params: Promise<{ code: string }>
}

export default async function CertificateVerifyPage({ params }: PageProps) {
  const { code } = await params
  const issuance = await findIssuanceByQrCode(code)

  if (!issuance) {
    notFound()
  }

  const isRevoked = !!issuance.revokedAt
  const isExpired = issuance.expiresAt ? new Date(issuance.expiresAt) < new Date() : false
  const isValid = !isRevoked && !isExpired

  return (
    <>
      <Intro>
        <IntroTitle>Certificate Verification</IntroTitle>
        <IntroDescription>{issuance.certificateTemplate.name}</IntroDescription>
      </Intro>

      <Section>
        <Card className="mx-auto max-w-md space-y-6 p-6">
          <div className="flex items-center justify-center">
            {isValid ? (
              <Badge variant="success" className="text-lg px-4 py-2">
                ✓ Valid Certificate
              </Badge>
            ) : isRevoked ? (
              <Badge variant="danger" className="text-lg px-4 py-2">
                ✗ Revoked
              </Badge>
            ) : (
              <Badge variant="outline" className="text-lg px-4 py-2">
                ⏳ Expired
              </Badge>
            )}
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Certificate Number</dt>
              <dd className="font-mono">{issuance.certificateNumber}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Recipient</dt>
              <dd>{issuance.user.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Issued</dt>
              <dd>{new Date(issuance.issuedAt).toLocaleDateString()}</dd>
            </div>
            {issuance.expiresAt && (
              <div>
                <dt className="text-muted-foreground">Expires</dt>
                <dd>{new Date(issuance.expiresAt).toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </Card>
      </Section>
    </>
  )
}
