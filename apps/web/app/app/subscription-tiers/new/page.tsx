import { SubscriptionTierForm } from "~/app/app/subscription-tiers/_components/subscription-tier-form"
import { Wrapper } from "~/components/common/wrapper"

export default function Page() {
  return (
    <Wrapper size="md" gap="sm">
      <SubscriptionTierForm title="Create subscription tier" />
    </Wrapper>
  )
}
