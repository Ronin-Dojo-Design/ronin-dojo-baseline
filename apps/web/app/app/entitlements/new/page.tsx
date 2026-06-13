import { EntitlementForm } from "~/app/app/entitlements/_components/entitlement-form"
import { Wrapper } from "~/components/common/wrapper"

export default function () {
  return (
    <Wrapper size="md" gap="sm">
      <EntitlementForm title="Create entitlement" />
    </Wrapper>
  )
}
