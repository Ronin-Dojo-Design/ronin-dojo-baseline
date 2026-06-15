import { notFound } from "next/navigation"
import { PricingPlanForm } from "~/app/app/pricing-plans/_components/pricing-plan-form"
import { Wrapper } from "~/components/common/wrapper"
import { findEntitlementList } from "~/server/admin/entitlements/queries"
import {
  findOrganizationList,
  findPricingPlanById,
  findProgramList,
} from "~/server/admin/pricing-plans/queries"

export default async function Page({ params }: PageProps<"/app/pricing-plans/[id]">) {
  const { id } = await params
  const pricingPlan = await findPricingPlanById(id)

  if (!pricingPlan) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <PricingPlanForm
        title="Update pricing plan"
        pricingPlan={pricingPlan}
        organizationsPromise={findOrganizationList()}
        programsPromise={findProgramList()}
        entitlementsPromise={findEntitlementList()}
      />
    </Wrapper>
  )
}
