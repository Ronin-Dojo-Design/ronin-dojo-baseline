import { EntitlementForm } from "~/app/admin/entitlements/_components/entitlement-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <EntitlementForm title="Create entitlement" />
    </Wrapper>
  )
})
