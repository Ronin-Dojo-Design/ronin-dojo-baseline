import { notFound } from "next/navigation"
import { UploadGrantToggle } from "~/app/admin/users/_components/upload-grant-toggle"
import { UserForm } from "~/app/admin/users/_components/user-form"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Wrapper } from "~/components/common/wrapper"
import { getRequestBrand } from "~/lib/brand-context"
import { findUserById } from "~/server/admin/users/queries"
import { hasEntitlement } from "~/server/web/entitlements/queries"

export default withAdminPage(async ({ params }: PageProps<"/admin/users/[id]">) => {
  const { id } = await params
  const user = await findUserById(id)

  if (!user) {
    return notFound()
  }

  const brand = await getRequestBrand()
  const hasUpload = await hasEntitlement(id, "S3_UPLOAD", brand)

  return (
    <Wrapper size="md" gap="sm">
      <UploadGrantToggle userId={id} hasUploadEntitlement={hasUpload} />
      <UserForm title="Update user" user={user} />
    </Wrapper>
  )
})
