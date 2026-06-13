import { notFound } from "next/navigation"
import { EntitlementForm } from "~/app/app/entitlements/_components/entitlement-form"
import { Wrapper } from "~/components/common/wrapper"
import { findEntitlementById } from "~/server/admin/entitlements/queries"

export default async function ({ params }: PageProps<"/app/entitlements/[id]">) {
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
}
