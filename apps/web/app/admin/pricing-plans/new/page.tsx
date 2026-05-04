import { PricingPlanForm } from "~/app/admin/pricing-plans/_components/pricing-plan-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findEntitlementList } from "~/server/admin/entitlements/queries"
import {
  findOrganizationList,
  findProgramList,
} from "~/server/admin/pricing-plans/queries"

export default withAdminPage(() => {
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
})
