import { PricingPlanForm } from "~/app/app/pricing-plans/_components/pricing-plan-form"
import { Wrapper } from "~/components/common/wrapper"
import { findEntitlementList } from "~/server/admin/entitlements/queries"
import { findOrganizationList, findProgramList } from "~/server/admin/pricing-plans/queries"

export default function Page() {
  return (
    <Wrapper size="md" gap="sm">
      <PricingPlanForm
        title="Create pricing plan"
        organizationsPromise={findOrganizationList()}
        programsPromise={findProgramList()}
        entitlementsPromise={findEntitlementList()}
      />
    </Wrapper>
  )
}
