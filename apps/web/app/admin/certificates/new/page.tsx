import { CertificateTemplateForm } from "~/app/admin/certificates/_components/certificate-template-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <CertificateTemplateForm title="Create certificate template" />
    </Wrapper>
  )
})
