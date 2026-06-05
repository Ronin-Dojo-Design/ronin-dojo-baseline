import { notFound, redirect } from "next/navigation"
import { QrShareButton } from "~/components/common/qr-share-button"
import { Stack } from "~/components/common/stack"
import { getServerSession } from "~/lib/auth"
import { buildAbsoluteUrl, getRequestOrigin } from "~/lib/request-url"
import { findValidInviteByCode } from "~/server/invites/queries"
import { ClaimForm } from "./claim-form"

export default async function InviteClaimPage({ params }: PageProps<"/invite/[code]">) {
  const { code } = await params
  const session = await getServerSession()

  // If not signed in, redirect to login with return URL
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/invite/${code}`)
  }

  const invite = await findValidInviteByCode(code)

  if (!invite) {
    notFound()
  }

  const disciplines = invite.organization.disciplines.map(d => d.discipline)
  const origin = await getRequestOrigin()
  const inviteUrl = buildAbsoluteUrl(`/invite/${invite.code}`, origin)

  return (
    <Stack direction="column" className="gap-4">
      <Stack size="sm" wrap className="justify-end">
        <QrShareButton
          url={inviteUrl}
          title="Invite QR Code"
          description="Scan to open this invite claim link."
          fileName={`invite-${invite.code}`}
        />
      </Stack>
      <ClaimForm
        code={invite.code}
        organizationName={invite.organization.name}
        disciplines={disciplines}
        userName={session.user.name ?? session.user.email ?? ""}
      />
    </Stack>
  )
}
