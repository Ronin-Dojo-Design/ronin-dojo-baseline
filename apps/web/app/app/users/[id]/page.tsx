import { notFound } from "next/navigation"
import { PermissionGrantsPanel } from "~/app/app/users/_components/permission-grants-panel"
import { UserForm } from "~/app/app/users/_components/user-form"
import { Wrapper } from "~/components/common/wrapper"
import { Brand } from "~/.generated/prisma/client"
import { findUserPermissionGrantStates } from "~/server/admin/permissions/queries"
import { findUserById } from "~/server/admin/users/queries"
import { hasEntitlement } from "~/server/web/entitlements/queries"

export default async ({ params }: PageProps<"/app/users/[id]">) => {
  const { id } = await params
  const user = await findUserById(id)

  if (!user) {
    return notFound()
  }

  const [permissionGrants, hasLegacyUploadEntitlement] = await Promise.all([
    findUserPermissionGrantStates(id),
    hasEntitlement(id, "S3_UPLOAD", Brand.BBL),
  ])

  return (
    <Wrapper size="md" gap="sm">
      <PermissionGrantsPanel
        userId={id}
        grants={permissionGrants}
        hasLegacyUploadEntitlement={hasLegacyUploadEntitlement}
      />
      <UserForm title="Update user" user={user} />
    </Wrapper>
  )
}
