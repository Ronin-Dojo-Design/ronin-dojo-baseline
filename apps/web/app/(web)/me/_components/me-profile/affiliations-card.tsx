import { Badge } from "~/components/common/badge"
import { Card, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import type { MyProfileAffiliation } from "~/server/web/directory/profile-projection"
import { AFFILIATION_ROLE_LABEL } from "./me-profile-fields"

/** "Schools & affiliations" sidebar card — current + past school links. */
export function AffiliationsCard({ affiliations }: { affiliations: MyProfileAffiliation[] }) {
  if (affiliations.length === 0) {
    return null
  }

  return (
    <Card hover={false}>
      <CardHeader>
        <H5 className={bblHeadingFontClass}>Schools &amp; affiliations</H5>
      </CardHeader>
      <Stack direction="column" size="sm" className="w-full">
        {affiliations.map(affiliation => (
          <AffiliationRow key={affiliation.id} affiliation={affiliation} />
        ))}
      </Stack>
    </Card>
  )
}

/** A single school row: role eyebrow + (linked) name, flagged when no longer current. */
function AffiliationRow({ affiliation }: { affiliation: MyProfileAffiliation }) {
  return (
    <Stack className="w-full items-center justify-between gap-2">
      <Stack direction="column" size="xs" className="min-w-0">
        <Note className="text-xs">{AFFILIATION_ROLE_LABEL[affiliation.role]}</Note>
        {affiliation.slug ? (
          <Link href={`/schools/${affiliation.slug}`} className="truncate font-medium text-sm">
            {affiliation.name ?? "School"}
          </Link>
        ) : (
          <span className="truncate font-medium text-sm">{affiliation.name ?? "School"}</span>
        )}
      </Stack>
      {!affiliation.isCurrent && (
        <Badge variant="outline" size="sm">
          Past
        </Badge>
      )}
    </Stack>
  )
}
