import { notFound } from "next/navigation"
import { SubscriptionTierForm } from "~/app/admin/subscription-tiers/_components/subscription-tier-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findSubscriptionTierById } from "~/server/admin/subscription-tiers/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/subscription-tiers/[id]">) => {
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
})
