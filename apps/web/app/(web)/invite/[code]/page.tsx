import { notFound, redirect } from "next/navigation"
import { getServerSession } from "~/lib/auth"
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

  return (
    <ClaimForm
      code={invite.code}
      organizationName={invite.organization.name}
      disciplines={disciplines}
      userName={session.user.name ?? session.user.email ?? ""}
    />
  )
}
