import { redirect } from "next/navigation"
import { Stack } from "~/components/common/stack"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { PassportEditor } from "~/components/web/passport/passport-editor"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { canUploadMedia } from "~/server/web/entitlements/queries"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
import { getDirectoryProfileByUserId, getPassportByUserId } from "~/server/web/passport/queries"

export async function DashboardProfileTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/app/profile")
  }

  const brand = await getRequestBrand()
  const [passport, directoryProfile] = await Promise.all([
    getPassportByUserId(session.user.id),
    getDirectoryProfileByUserId(session.user.id),
  ])

  if (!passport || !directoryProfile) {
    // Shouldn't happen post-S2 sign-up hook, but guard defensively (mirrors /me).
    throw redirect("/auth/login?next=/app/profile")
  }

  const [canUpload, passportAttachments] = await Promise.all([
    canUploadMedia(session.user.id, brand),
    getDashboardMediaAttachments({
      brand,
      user: session.user,
      target: { kind: "passport", id: passport.id },
    }),
  ])

  return (
    <Stack direction="column" size="lg" className="w-full">
      <PassportEditor
        passport={passport}
        directoryProfile={directoryProfile}
        userId={session.user.id}
        canUploadVideo={canUpload}
      />

      <MediaAttachmentManager
        target={{ kind: "passport", id: passport.id }}
        initialAttachments={passportAttachments ?? []}
        avatarUrl={passport.avatarUrl}
        title="Passport media"
        description="Upload profile images or clips tied to this Passport. Private items stay dashboard-only."
      />
    </Stack>
  )
}
