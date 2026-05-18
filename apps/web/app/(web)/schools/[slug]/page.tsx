import { notFound } from "next/navigation"
import { Badge } from "~/components/common/badge"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Intro, IntroDescription, IntroTitle } from "~/components/web/ui/intro"
import { Section } from "~/components/web/ui/section"
import { getRequestBrand } from "~/lib/brand-context"
import { getOrganizationBySlug } from "~/server/web/organization/queries"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const org = await getOrganizationBySlug(brand, slug)

  if (!org) return { title: "School Not Found" }

  return {
    title: org.name,
    description: `View details for ${org.name}.`,
  }
}

export default async function SchoolDetailPage({ params }: PageProps) {
  const { slug } = await params
  const brand = await getRequestBrand()
  const org = await getOrganizationBySlug(brand, slug)

  if (!org) {
    notFound()
  }

  const address = [org.addressLine1, org.addressLine2, org.city, org.state, org.zip, org.country]
    .filter(Boolean)
    .join(", ")

  return (
    <>
      <Intro>
        <IntroTitle>{org.name}</IntroTitle>
        {address && <IntroDescription>{address}</IntroDescription>}
      </Intro>

      <Section>
        <Stack size="sm" className="flex-wrap">
          {org.type && <Badge variant="outline">{org.type.replace(/_/g, " ")}</Badge>}
          {org.disciplines?.map(d => (
            <Badge key={d.discipline.id} variant="soft">
              {d.discipline.name}
            </Badge>
          ))}
          {org._count?.memberships !== undefined && (
            <Badge variant="soft">
              {org._count.memberships} member{org._count.memberships !== 1 ? "s" : ""}
            </Badge>
          )}
        </Stack>
      </Section>

      {org.websiteUrl && (
        <Section>
          <Link href={org.websiteUrl} target="_blank" rel="noopener noreferrer">
            {org.websiteUrl}
          </Link>
        </Section>
      )}

      {/* Owner */}
      {org.owner && (
        <Section>
          <H4>Owner</H4>
          <p className="text-sm">{org.owner.name}</p>
        </Section>
      )}

      {/* Members */}
      {org.memberships && org.memberships.length > 0 && (
        <Section>
          <H4>Members</H4>
          <Stack size="sm">
            {org.memberships.slice(0, 20).map(m => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-sm font-medium">{m.user.name}</span>
                {m.discipline && (
                  <Badge variant="soft" size="sm">
                    {m.discipline.name}
                  </Badge>
                )}
                {m.roleAssignments?.map(ra => (
                  <Badge key={ra.role.id} variant="outline" size="sm">
                    {ra.role.name}
                  </Badge>
                ))}
              </div>
            ))}
            {org.memberships.length > 20 && (
              <p className="text-sm text-muted-foreground">
                +{org.memberships.length - 20} more members
              </p>
            )}
          </Stack>
        </Section>
      )}
    </>
  )
}
