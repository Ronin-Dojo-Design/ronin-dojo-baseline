import { CertificateTemplateForm } from "~/app/app/certificates/_components/certificate-template-form"
import { Wrapper } from "~/components/common/wrapper"

export default () => {
  return (
    <Wrapper size="md" gap="sm">
      <CertificateTemplateForm title="Create certificate template" />
    </Wrapper>
  )
}
