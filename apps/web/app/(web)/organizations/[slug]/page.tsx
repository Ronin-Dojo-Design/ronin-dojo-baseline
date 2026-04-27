import { headers } from "next/headers"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Brand } from "~/.generated/prisma/client"
import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { Intro, IntroTitle, IntroDescription } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { JoinOrganizationButton } from "~/components/web/organizations/join-organization-button"
import { getOrganizationBySlug } from "~/server/web/organization/queries"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const org = await getOrganizationBySlug(brand, slug)

  if (!org) return { title: "Organization Not Found" }

  return {
    title: org.name,
    description: `${org.type} — ${org._count.memberships} members`,
  }
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { slug } = await params
  const headersList = await headers()
  const brand = (headersList.get("x-brand") as Brand) ?? Brand.RONIN_DOJO_DESIGN
  const org = await getOrganizationBySlug(brand, slug)

  if (!org) notFound()

  return (
    <>
      <Intro>
        <IntroTitle>{org.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm">
            <Badge variant="outline" size="lg">{org.type}</Badge>
            <span>{org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}</span>
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          <div className="grid gap-8 @lg:grid-cols-2">
            {/* Info */}
            <div className="space-y-4">
              <H4>Details</H4>

              <dl className="grid gap-2 text-sm">
                {org.owner && (
                  <>
                    <dt className="text-muted-foreground">Owner</dt>
                    <dd>{org.owner.name ?? org.owner.email}</dd>
                  </>
                )}

                {org.address && (
                  <>
                    <dt className="text-muted-foreground">Address</dt>
                    <dd>{org.address}</dd>
                  </>
                )}

                {org.websiteUrl && (
                  <>
                    <dt className="text-muted-foreground">Website</dt>
                    <dd>
                      <a
                        href={org.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        {org.websiteUrl}
                      </a>
                    </dd>
                  </>
                )}
              </dl>

              {org.disciplines.length > 0 && (
                <div className="space-y-2">
                  <H4>Disciplines</H4>
                  <Stack size="sm" className="flex-wrap">
                    {org.disciplines.map((od) => (
                      <Badge key={od.discipline.id}>{od.discipline.name}</Badge>
                    ))}
                  </Stack>
                </div>
              )}
            </div>

            {/* Members + Join */}
            <div className="space-y-4">
              <H4>Members ({org._count.memberships})</H4>

              {org.disciplines.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Join a discipline:</p>
                  <Stack size="sm" className="flex-wrap">
                    {org.disciplines.map((od) => (
                      <JoinOrganizationButton
                        key={od.discipline.id}
                        organizationId={org.id}
                        disciplineId={od.discipline.id}
                        brand={brand}
                      />
                    ))}
                  </Stack>
                </div>
              )}

              <div className="space-y-2">
                {org.memberships.map((m) => (
                  <Card key={m.id} hover={false}>
                    <CardHeader>
                      <span className="text-sm font-medium">
                        {m.user.name ?? "Unknown"}
                      </span>
                      <Badge size="sm" variant={m.status === "ACTIVE" ? "success" : "warning"}>
                        {m.status}
                      </Badge>
                      {m.discipline && (
                        <Badge size="sm" variant="outline">
                          {m.discipline.name}
                        </Badge>
                      )}
                    </CardHeader>
                  </Card>
                ))}

                {org.memberships.length === 0 && (
                  <p className="text-sm text-secondary-foreground">No members yet.</p>
                )}
              </div>
            </div>
          </div>
        </Section.Content>
      </Section>
    </>
  )
}
