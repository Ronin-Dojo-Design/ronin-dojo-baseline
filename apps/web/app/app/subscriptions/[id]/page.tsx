import { notFound } from "next/navigation"
import { SubscriptionForm } from "~/app/app/subscriptions/_components/subscription-form"
import { Wrapper } from "~/components/common/wrapper"
import { findSubscriptionTierList } from "~/server/admin/subscription-tiers/queries"
import { findSubscriptionById } from "~/server/admin/subscriptions/queries"

export default async function Page({ params }: PageProps<"/app/subscriptions/[id]">) {
  const { id } = await params
  const subscription = await findSubscriptionById(id)

  if (!subscription) {
    return notFound()
  }

  const tiersPromise = findSubscriptionTierList()

  return (
    <Wrapper size="md" gap="sm">
      <SubscriptionForm
        title="Update subscription"
        subscription={subscription}
        tiersPromise={tiersPromise}
      />
    </Wrapper>
  )
}
