import { notFound } from "next/navigation"
import { EntitlementForm } from "~/app/admin/entitlements/_components/entitlement-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { findEntitlementById } from "~/server/admin/entitlements/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/entitlements/[id]">) => {
  const { id } = await params
  const entitlement = await findEntitlementById(id)

  if (!entitlement) {
    return notFound()
  }

  return (
    <Wrapper size="md" gap="sm">
      <EntitlementForm title="Update entitlement" entitlement={entitlement} />
    </Wrapper>
  )
})
