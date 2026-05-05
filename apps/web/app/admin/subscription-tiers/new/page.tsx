import { SubscriptionTierForm } from "~/app/admin/subscription-tiers/_components/subscription-tier-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"

export default withAdminPage(() => {
  return (
    <Wrapper size="md" gap="sm">
      <SubscriptionTierForm title="Create subscription tier" />
    </Wrapper>
  )
})
