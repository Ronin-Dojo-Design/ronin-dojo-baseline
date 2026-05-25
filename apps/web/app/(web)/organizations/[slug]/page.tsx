import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { JoinOrganizationButton } from "~/components/web/organizations/join-organization-button"
import { MembershipActions } from "~/components/web/organizations/membership-actions"
import { StructuredData } from "~/components/web/structured-data"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { Grid } from "~/components/web/ui/grid"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getServerSession } from "~/lib/auth"
import { getRequestBrand } from "~/lib/brand-context"
import { getPageMetadata } from "~/lib/pages"
import {
  createGraph,
  generateBreadcrumbs,
  generateCollectionPage,
  generateSchemaReference,
  generateStructuredDataEntity,
} from "~/lib/structured-data"
import {
  findOrganizationSlugs,
  findRelatedOrganizations,
  getOrganizationBySlug,
  getSystemRoles,
} from "~/server/web/organization/queries"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const orgs = await findOrganizationSlugs()
  return orgs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getRequestBrand()
  const org = await getOrganizationBySlug(brand, slug)

  if (!org) return { title: "Organization Not Found" }

  return getPageMetadata({
    url: `/organizations/${org.slug}`,
    metadata: {
      title: org.name,
      description: org.description ?? `${org.type} — ${org._count.memberships} members`,
    },
  })
}

export default async function OrganizationDetailPage({ params }: Props) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const [org, session, roles] = await Promise.all([
    getOrganizationBySlug(brand, slug),
    getServerSession(),
    getSystemRoles(),
  ])

  if (!org) notFound()

  const isOwner = session?.user?.id === org.ownerId

  const relatedOrgs = await findRelatedOrganizations({
    organizationId: org.id,
    brand,
    disciplineIds: org.disciplines.map(od => od.discipline.id),
    city: org.city,
  })

  // Format address from expanded fields
  const addressParts = [
    org.addressLine1,
    org.addressLine2,
    org.city,
    org.state,
    org.zip,
    org.country,
  ].filter(Boolean)
  const formattedAddress = addressParts.length > 0 ? addressParts.join(", ") : null
  const orgUrl = `/organizations/${org.slug}`
  const orgReference = generateSchemaReference("Organization", orgUrl, org.name)
  const disciplineReferences = org.disciplines.map(od =>
    generateSchemaReference("Thing", `/disciplines/${od.discipline.slug}`, od.discipline.name),
  )
  const breadcrumbItems = [
    { url: "/organizations", title: "Organizations" },
    { url: orgUrl, title: org.name },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />

      <Intro>
        <IntroTitle>{org.name}</IntroTitle>
        <IntroDescription>
          <Stack size="sm" className="flex-wrap">
            <Badge variant="outline" size="lg">
              {org.type}
            </Badge>
            {org.disciplines.map(od => (
              <Badge key={od.discipline.id} size="lg">
                <Link href={`/disciplines/${od.discipline.slug}`}>{od.discipline.name}</Link>
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              {org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}
            </span>
          </Stack>
        </IntroDescription>
      </Intro>

      <Section>
        <Section.Content>
          {/* Overview */}
          {org.description && (
            <div className="space-y-2">
              <H4>Overview</H4>
              <p className="text-sm text-secondary-foreground text-pretty">{org.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <H4>Details</H4>
            <dl className="grid gap-2 text-sm @sm:grid-cols-[10rem_minmax(0,1fr)]">
              {org.owner && (
                <>
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd>{org.owner.name ?? org.owner.email}</dd>
                </>
              )}

              <dt className="text-muted-foreground">Type</dt>
              <dd>{org.type}</dd>

              {formattedAddress && (
                <>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>{formattedAddress}</dd>
                </>
              )}

              {org.websiteUrl && (
                <>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>
                    <Link href={org.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {org.websiteUrl}
                    </Link>
                  </dd>
                </>
              )}

              {org.phoneE164 && (
                <>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{org.phoneE164}</dd>
                </>
              )}

              {org.email && (
                <>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>
                    <Link href={`mailto:${org.email}`}>{org.email}</Link>
                  </dd>
                </>
              )}
            </dl>
          </div>

          {/* Members */}
          <div className="space-y-3">
            <H4>Members ({org._count.memberships})</H4>

            {org.disciplines.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Join a discipline:</p>
                <Stack size="sm" className="flex-wrap">
                  {org.disciplines.map(od => (
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
              {org.memberships.map(m => (
                <Card key={m.id} hover={false}>
                  <CardHeader>
                    <span className="text-sm font-medium">{m.user.name ?? "Unknown"}</span>
                    <Badge
                      size="sm"
                      variant={
                        m.status === "ACTIVE"
                          ? "success"
                          : m.status === "SUSPENDED"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {m.status}
                    </Badge>
                    {m.discipline && (
                      <Badge size="sm" variant="outline">
                        {m.discipline.name}
                      </Badge>
                    )}
                    {m.roleAssignments.map(ra => (
                      <Badge key={ra.role.id} size="sm" variant="soft">
                        {ra.role.name}
                      </Badge>
                    ))}
                  </CardHeader>
                  {isOwner && m.user.id !== org.ownerId && (
                    <MembershipActions
                      membership={m}
                      roles={roles}
                      assignedRoleIds={m.roleAssignments.map(ra => ra.role.id)}
                    />
                  )}
                </Card>
              ))}

              {org.memberships.length === 0 && (
                <p className="text-sm text-secondary-foreground">No members yet.</p>
              )}
            </div>
          </div>
        </Section.Content>

        <Section.Sidebar>
          {isOwner && org.inviteCode && (
            <Card hover={false}>
              <CardHeader>
                <H4>Invite Link</H4>
              </CardHeader>
              <CardDescription>
                <p className="text-sm text-muted-foreground break-all">
                  {`/organizations/join?code=${org.inviteCode}`}
                </p>
              </CardDescription>
            </Card>
          )}

          <Card hover={false}>
            <CardHeader>
              <H4>Organization Info</H4>
            </CardHeader>
            <CardDescription>
              <Stack direction="column" className="items-start">
                <Badge variant="outline">{org.type}</Badge>
                <span>{org._count.memberships} members</span>
                <span>{org.disciplines.length} disciplines</span>
              </Stack>
            </CardDescription>
          </Card>
        </Section.Sidebar>
      </Section>

      {/* Related Organizations */}
      {relatedOrgs.length > 0 && (
        <Section>
          <Section.Content>
            <H4>Related Organizations</H4>
            <Grid>
              {relatedOrgs.map(ro => (
                <Card key={ro.id} isRevealed>
                  <CardHeader>
                    <H4 render={props => <h3 {...props}>{props.children}</h3>} className="truncate">
                      <Link href={`/organizations/${ro.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {ro.name}
                      </Link>
                    </H4>
                  </CardHeader>
                  <CardDescription>{ro.description ?? `${ro.type} organization`}</CardDescription>
                  <Stack size="sm" className="flex-wrap">
                    <Badge variant="outline">{ro.type}</Badge>
                    {ro.city && <Badge variant="soft">{ro.city}</Badge>}
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section.Content>
        </Section>
      )}

      <StructuredData
        data={createGraph([
          generateBreadcrumbs(breadcrumbItems),
          generateCollectionPage(orgUrl, org.name, org.description ?? `${org.type} organization`, {
            mainEntity: orgReference,
            about: orgReference,
          }),
          generateStructuredDataEntity({
            type: "Organization",
            url: orgUrl,
            name: org.name,
            description: org.description,
            id: orgReference["@id"],
            about: disciplineReferences.length > 0 ? disciplineReferences : undefined,
            address: {
              streetAddress: [org.addressLine1, org.addressLine2].filter(Boolean).join(", "),
              addressLocality: org.city,
              addressRegion: org.state,
              postalCode: org.zip,
              addressCountry: org.country,
            },
          }),
        ])}
      />
    </>
  )
}
