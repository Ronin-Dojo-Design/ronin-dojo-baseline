import { notFound } from "next/navigation"
import { CertificateIssuanceList } from "~/app/app/certificates/_components/certificate-issuance-list"
import { CertificateTemplateForm } from "~/app/app/certificates/_components/certificate-template-form"
import { Wrapper } from "~/components/common/wrapper"
import { findIssuancesByTemplate } from "~/server/admin/certificates/issuance-queries"
import { findCertificateTemplateById } from "~/server/admin/certificates/queries"

export default async ({ params }: PageProps<"/app/certificates/[id]">) => {
  const { id } = await params
  const [template, issuances] = await Promise.all([
    findCertificateTemplateById(id),
    findIssuancesByTemplate(id),
  ])

  if (!template) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <CertificateTemplateForm title={`Edit ${template.name}`} template={template} />
      <CertificateIssuanceList templateId={id} issuances={issuances} />
    </Wrapper>
  )
}
