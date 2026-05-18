import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { canUploadMedia } from "~/server/web/entitlements/queries"
import { getDirectoryProfileByUserId, getPassportByUserId } from "~/server/web/passport/queries"
import { PassportEditor } from "./passport-editor"

export const metadata: Metadata = {
  title: "My Passport",
  description: "Manage your martial arts identity and directory profile.",
}

export default async function MePage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect("/auth/login")
  }

  const [passport, directoryProfile] = await Promise.all([
    getPassportByUserId(session.user.id),
    getDirectoryProfileByUserId(session.user.id),
  ])

  if (!passport || !directoryProfile) {
    // Shouldn't happen post-S2 sign-up hook, but guard defensively
    redirect("/auth/login")
  }

  const brand = await getRequestBrand()
  const canUpload = await canUploadMedia(session.user.id, brand)

  return (
    <>
      <Intro>
        <IntroTitle>My Passport</IntroTitle>
        <IntroDescription>
          Manage your identity and control what others see in the directory.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <PassportEditor
            passport={passport}
            directoryProfile={directoryProfile}
            userId={session.user.id}
            canUploadVideo={canUpload}
          />
        </Section.Content>
      </Section>
    </>
  )
}
