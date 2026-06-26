import { notFound } from "next/navigation"
import { UploadGrantToggle } from "~/app/app/users/_components/upload-grant-toggle"
import { UserForm } from "~/app/app/users/_components/user-form"
import { Wrapper } from "~/components/common/wrapper"
import { Brand } from "~/.generated/prisma/client"
import { findUserById } from "~/server/admin/users/queries"
import { hasEntitlement } from "~/server/web/entitlements/queries"

export default async ({ params }: PageProps<"/app/users/[id]">) => {
  const { id } = await params
  const user = await findUserById(id)

  if (!user) {
    return notFound()
  }

  const hasUpload = await hasEntitlement(id, "S3_UPLOAD", Brand.BBL)

  return (
    <Wrapper size="md" gap="sm">
      <UploadGrantToggle userId={id} hasUploadEntitlement={hasUpload} />
      <UserForm title="Update user" user={user} />
    </Wrapper>
  )
}
