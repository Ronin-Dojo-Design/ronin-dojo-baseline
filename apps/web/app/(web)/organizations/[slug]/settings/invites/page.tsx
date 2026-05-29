import { formatDate } from "@dirstack/utils"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { ButtonGroup } from "~/components/common/button-group"
import { Card, CardHeader } from "~/components/common/card"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { OrgAccessDenied } from "~/components/web/organizations/org-access-denied"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { cx } from "~/lib/utils"
import { hasOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import { getOrganizationBySlug, getOrganizationInvites } from "~/server/web/organization/queries"
import { GenerateInviteForm } from "./_components/generate-invite-form"
import { InviteRowActions } from "./_components/invite-row-actions"

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ status?: string }>
}

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  EXPIRED: "outline",
  REVOKED: "danger",
}

export default async function OrgInvitesPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { status } = await searchParams
  const showAll = status === "all"

  const brand = await getRequestBrand()
  const [org, session] = await Promise.all([getOrganizationBySlug(brand, slug), getServerSession()])

  if (!org) notFound()
  if (!session?.user) notFound()

  const canAccess = await hasOrgAdminAccess(session.user.id, org.id)

  if (!canAccess) {
    return (
      <Section>
        <OrgAccessDenied orgSlug={slug} />
      </Section>
    )
  }

  const invites = await getOrganizationInvites(org.id, showAll)
  const base = `/organizations/${slug}/settings/invites`
  const tabClass = (active: boolean) =>
    cx(
      "border px-3 py-1.5 text-sm",
      active ? "bg-primary text-background" : "bg-background hover:bg-muted",
    )

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/organizations", title: "Organizations" },
          { url: `/organizations/${slug}`, title: org.name },
          { url: `/organizations/${slug}/settings`, title: "Settings" },
          { url: base, title: "Invites" },
        ]}
      />

      <Intro>
        <IntroTitle>{org.name} — Invite Links</IntroTitle>
        <IntroDescription>
          Generate shareable links that let people join your organization.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <div className="flex flex-col gap-6">
            <GenerateInviteForm organizationId={org.id} />

            <ButtonGroup>
              <Link href={base} className={tabClass(!showAll)}>
                Active
              </Link>
              <Link href={`${base}?status=all`} className={tabClass(showAll)}>
                All
              </Link>
            </ButtonGroup>

            {invites.length === 0 ? (
              <Note>{showAll ? "No invites yet." : "No active invite links."}</Note>
            ) : (
              <div className="flex flex-col gap-3">
                {invites.map(invite => (
                  <Card key={invite.id}>
                    <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <Stack size="sm">
                          <code className="text-sm">/invite/{invite.code}</code>
                          <Badge variant={STATUS_VARIANT[invite.status] ?? "outline"}>
                            {invite.status}
                          </Badge>
                        </Stack>
                        <Note>
                          {invite._count.claims} claimed · {invite.currentUses}/
                          {invite.maxUses ?? "∞"} used · expires{" "}
                          {invite.expiresAt ? formatDate(invite.expiresAt) : "never"}
                        </Note>
                      </div>
                      <InviteRowActions
                        organizationId={org.id}
                        inviteId={invite.id}
                        code={invite.code}
                        revocable={invite.status === "PENDING"}
                      />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Section.Content>
      </Section>
    </>
  )
}
