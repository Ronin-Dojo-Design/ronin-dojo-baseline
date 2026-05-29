import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { OrgAccessDenied } from "~/components/web/organizations/org-access-denied"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { hasOrgAdminAccess } from "~/server/web/organization/org-admin-access"
import { getOrganizationBySlug, getOrganizationMembers } from "~/server/web/organization/queries"
import { MemberApprovalActions } from "./_components/member-approval-actions"

interface Props {
  params: Promise<{ slug: string }>
}

const STATUS_VARIANT: Record<string, "primary" | "success" | "warning" | "danger" | "outline"> = {
  INVITED: "primary",
  PENDING: "warning",
  ACTIVE: "success",
  SUSPENDED: "danger",
  CANCELLED: "outline",
  EXPIRED: "outline",
}

export default async function OrgMembersPage({ params }: Props) {
  const { slug } = await params
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

  const members = await getOrganizationMembers(org.id)
  const pending = members.filter(m => m.status === "PENDING")
  const roster = members.filter(m => m.status !== "PENDING")

  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/organizations", title: "Organizations" },
          { url: `/organizations/${slug}`, title: org.name },
          { url: `/organizations/${slug}/settings`, title: "Settings" },
          { url: `/organizations/${slug}/settings/members`, title: "Members" },
        ]}
      />

      <Intro>
        <IntroTitle>{org.name} — Members</IntroTitle>
        <IntroDescription>
          Review pending join requests and view your organization's roster.
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <div className="flex flex-col gap-10">
            {/* Approval queue */}
            <section className="flex flex-col gap-3">
              <Stack size="sm">
                <H4>Pending requests</H4>
                {pending.length > 0 && <Badge variant="warning">{pending.length}</Badge>}
              </Stack>

              {pending.length === 0 ? (
                <Note>No pending join requests.</Note>
              ) : (
                <div className="flex flex-col gap-3">
                  {pending.map(member => (
                    <Card key={member.id}>
                      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <H4>{member.user.name ?? member.user.email ?? "Unknown member"}</H4>
                          <CardDescription>
                            {member.discipline.name}
                            {member.user.email ? ` · ${member.user.email}` : ""}
                          </CardDescription>
                        </div>
                        <MemberApprovalActions
                          organizationId={org.id}
                          membershipId={member.id}
                          memberName={member.user.name ?? "Member"}
                        />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Roster */}
            <section className="flex flex-col gap-3">
              <Stack size="sm">
                <H4>Roster</H4>
                <Badge variant="outline">{roster.length}</Badge>
              </Stack>

              {roster.length === 0 ? (
                <Note>No members yet.</Note>
              ) : (
                <div className="flex flex-col gap-3">
                  {roster.map(member => (
                    <Card key={member.id}>
                      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <H4>{member.user.name ?? member.user.email ?? "Unknown member"}</H4>
                          <CardDescription>
                            {member.discipline.name}
                            {member.rank ? ` · ${member.rank.name}` : ""}
                            {member.memberNumber ? ` · #${member.memberNumber}` : ""}
                          </CardDescription>
                        </div>
                        <Stack size="sm" wrap>
                          {member.roleAssignments.map(({ role }) => (
                            <Badge key={role.id} variant="primary">
                              {role.name}
                            </Badge>
                          ))}
                          <Badge variant={STATUS_VARIANT[member.status] ?? "outline"}>
                            {member.status}
                          </Badge>
                        </Stack>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </Section.Content>
      </Section>
    </>
  )
}
