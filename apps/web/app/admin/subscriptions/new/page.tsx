import { SubscriptionForm } from "~/app/admin/subscriptions/_components/subscription-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findSubscriptionTierList } from "~/server/admin/subscription-tiers/queries"
import { findUserList } from "~/server/admin/users/queries"

export default withAdminPage(() => {
  const tiersPromise = findSubscriptionTierList()
  const usersPromise = findUserList()

  return (
    <Wrapper size="md" gap="sm">
      <SubscriptionForm
        title="Create subscription"
        tiersPromise={tiersPromise}
        usersPromise={usersPromise}
      />
    </Wrapper>
  )
})
