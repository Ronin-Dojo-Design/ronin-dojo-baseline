import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { InviteJoinForm } from "~/components/web/organizations/invite-join-form"
import { getOrganizationByInviteCode } from "~/server/web/organization/queries"

export const metadata: Metadata = {
  title: "Join Organization",
  description: "Join an organization via invite link.",
}

interface Props {
  searchParams: Promise<{ code?: string }>
}

export default async function JoinByInvitePage({ searchParams }: Props) {
  const { code } = await searchParams
  if (!code) notFound()

  const org = await getOrganizationByInviteCode(code)
  if (!org) notFound()

  return (
    <>
      <Intro>
        <IntroTitle>Join {org.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm">
            <Badge variant="outline" size="lg">{org.type}</Badge>
            <span>{org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}</span>
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          {org.disciplines.length > 0 ? (
            <InviteJoinForm
              inviteCode={code}
              orgName={org.name}
              disciplines={org.disciplines.map((od) => od.discipline)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              This organization has no disciplines configured yet.
            </p>
          )}
        </Section.Content>
      </Section>
    </>
  )
}
