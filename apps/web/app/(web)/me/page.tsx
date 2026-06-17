import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { MediaAttachmentManager } from "~/components/web/media/media-attachment-manager"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import { canUploadMedia } from "~/server/web/entitlements/queries"
import { getDashboardMediaAttachments } from "~/server/web/media/queries"
import { PassportEditor } from "~/components/web/passport/passport-editor"
import { getDirectoryProfileByUserId, getPassportByUserId } from "~/server/web/passport/queries"

export async function generateMetadata(): Promise<Metadata> {
  return await getPageMetadata({
    url: "/me",
    metadata: {
      title: "My Passport",
      description: "Manage your martial arts identity and directory profile.",
      robots: { index: false, follow: false },
    },
  })
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
  const [canUpload, passportAttachments] = await Promise.all([
    canUploadMedia(session.user.id, brand),
    getDashboardMediaAttachments({
      brand,
      user: session.user,
      target: { kind: "passport", id: passport.id },
    }),
  ])

  // Profile completeness — count filled passport fields (9 total)
  const passportFields = [
    passport.displayName,
    passport.legalFirstName,
    passport.legalLastName,
    passport.dob,
    passport.phoneE164,
    passport.avatarUrl,
    passport.bio,
    passport.emergencyContactName,
    passport.emergencyContactPhoneE164,
  ]
  const passportFilled = passportFields.filter(
    v => v !== null && v !== undefined && v !== "",
  ).length
  const passportTotal = passportFields.length

  const visibilityLabel =
    directoryProfile.visibility === "PUBLIC"
      ? "Public"
      : directoryProfile.visibility === "MEMBERS_ONLY"
        ? "Members only"
        : "Hidden"

  return (
    <>
      <Breadcrumbs items={[{ url: "/me", title: "My Passport" }]} />

      <Intro>
        <IntroTitle>My Passport</IntroTitle>
        <IntroDescription>
          Manage your identity and control what others see in the directory.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
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
        </Section.Content>

        <Section.Sidebar>
          <Card hover={false}>
            <CardHeader>
              <H4>Profile Completeness</H4>
            </CardHeader>
            <CardDescription>
              <Stack direction="column" className="items-start">
                <span>
                  {passportFilled} of {passportTotal} passport fields filled
                </span>
                <span>Directory: {visibilityLabel}</span>
              </Stack>
            </CardDescription>
          </Card>

          <Card hover={false}>
            <CardHeader>
              <H4>Quick Links</H4>
            </CardHeader>
            <CardDescription>
              <Stack direction="column" className="items-start">
                <Link href="/directory">View public directory</Link>
                <Link href="/disciplines">Browse disciplines</Link>
                <Link href="/organizations">My organizations</Link>
              </Stack>
            </CardDescription>
          </Card>
        </Section.Sidebar>
      </Section>
    </>
  )
}
