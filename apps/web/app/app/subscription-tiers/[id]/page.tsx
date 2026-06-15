import { notFound } from "next/navigation"
import { SubscriptionTierForm } from "~/app/app/subscription-tiers/_components/subscription-tier-form"
import { Wrapper } from "~/components/common/wrapper"
import { findSubscriptionTierById } from "~/server/admin/subscription-tiers/queries"

export default async function Page({ params }: PageProps<"/app/subscription-tiers/[id]">) {
  const { id } = await params
  const tier = await findSubscriptionTierById(id)

  if (!tier) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <SubscriptionTierForm title="Update subscription tier" tier={tier} />
    </Wrapper>
  )
}
