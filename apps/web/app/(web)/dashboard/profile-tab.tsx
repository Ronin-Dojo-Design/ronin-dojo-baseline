import { redirect } from "next/navigation"
import { ProfileForm } from "~/app/(web)/dashboard/profile-form"
import { Stack } from "~/components/common/stack"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { findUserDirectoryProfile, findUserPassport } from "~/server/web/dashboard/queries"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"

export async function DashboardProfileTab() {
  const session = await getServerSession()

  if (!session?.user) {
    throw redirect("/auth/login?next=/dashboard")
  }

  const brand = await getRequestBrand()
  const [passport, directoryProfile] = await Promise.all([
    findUserPassport(session.user.id),
    findUserDirectoryProfile(session.user.id),
  ])

  const passportAttachments = passport
    ? ((await getDashboardMediaAttachments({
        brand,
        user: session.user,
        target: { kind: "passport", id: passport.id },
      })) ?? [])
    : []

  return (
    <Stack direction="column" size="lg" className="w-full">
      <ProfileForm passport={passport} directoryProfile={directoryProfile} />

      {passport && (
        <MediaAttachmentManager
          target={{ kind: "passport", id: passport.id }}
          initialAttachments={passportAttachments}
          avatarUrl={passport.avatarUrl}
          title="Passport media"
          description="Upload profile images or clips tied to this Passport. Private items stay dashboard-only."
        />
      )}
    </Stack>
  )
}
