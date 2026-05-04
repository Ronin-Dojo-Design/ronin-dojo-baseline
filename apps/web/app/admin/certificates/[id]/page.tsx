import { notFound } from "next/navigation"
import { CertificateTemplateForm } from "~/app/admin/certificates/_components/certificate-template-form"
import { CertificateIssuanceList } from "~/app/admin/certificates/_components/certificate-issuance-list"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findCertificateTemplateById } from "~/server/admin/certificates/queries"
import { findIssuancesByTemplate } from "~/server/admin/certificates/issuance-queries"

export default withAdminPage(async ({ params }) => {
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
})
