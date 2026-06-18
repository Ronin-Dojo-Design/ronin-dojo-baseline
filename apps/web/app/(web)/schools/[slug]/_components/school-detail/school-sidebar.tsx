import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolSidebarProps = Pick<SchoolDetailView, "school" | "instructors" | "classesPerWeek">

/**
 * Right-column sidebar cards: an Overview summary (instructor / member / program /
 * weekly-class counts), an optional Contact card, and an optional Affiliations card
 * (parent orgs). Presentational — counts + gating are resolved upstream in the loader.
 */
export function SchoolSidebar({ school, instructors, classesPerWeek }: SchoolSidebarProps) {
  const hasContact = school.websiteUrl || school.phoneE164 || school.email

  return (
    <>
      <Card hover={false}>
        <CardHeader>
          <H4>Overview</H4>
        </CardHeader>
        <CardDescription>
          <Stack direction="column" className="items-start">
            <span>
              <span className="text-muted-foreground">Instructors: </span>
              <span className="font-medium">{instructors.length}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Members: </span>
              <span className="font-medium">{school._count.memberships}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Programs: </span>
              <span className="font-medium">{school._count.programs}</span>
            </span>
            {classesPerWeek > 0 && (
              <span>
                <span className="text-muted-foreground">Classes / week: </span>
                <span className="font-medium">{classesPerWeek}</span>
              </span>
            )}
          </Stack>
        </CardDescription>
      </Card>

      {hasContact && (
        <Card hover={false}>
          <CardHeader>
            <H4>Contact</H4>
          </CardHeader>
          <CardDescription>
            <Stack direction="column" className="items-start">
              {school.websiteUrl && (
                <Link href={school.websiteUrl} target="_blank" rel="noopener noreferrer">
                  Website
                </Link>
              )}
              {school.phoneE164 && <Link href={`tel:${school.phoneE164}`}>{school.phoneE164}</Link>}
              {school.email && <Link href={`mailto:${school.email}`}>{school.email}</Link>}
            </Stack>
          </CardDescription>
        </Card>
      )}

      {school.parentRelationships.length > 0 && (
        <Card hover={false}>
          <CardHeader>
            <H4>Affiliations</H4>
          </CardHeader>
          <CardDescription>
            <Stack direction="column" className="items-start">
              {school.parentRelationships.map(pr => {
                const isSchoolType = pr.parentOrg.type === "DOJO" || pr.parentOrg.type === "SCHOOL"
                const href = isSchoolType
                  ? `/schools/${pr.parentOrg.slug}`
                  : `/organizations/${pr.parentOrg.slug}`
                return (
                  <span key={pr.id} className="text-sm">
                    Part of <Link href={href}>{pr.parentOrg.name}</Link>
                  </span>
                )
              })}
            </Stack>
          </CardDescription>
        </Card>
      )}
    </>
  )
}
