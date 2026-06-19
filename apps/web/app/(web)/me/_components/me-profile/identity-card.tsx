import { Card, CardHeader } from "~/components/common/card"
import { H5 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { bblHeadingFontClass } from "~/components/web/ui/brand-typography"
import type { MyProfile } from "~/server/web/directory/profile-projection"
import { buildIdentityRows } from "./me-profile-fields"

/** "Identity" sidebar card — born-in / based-in / training-since, empty rows dropped. */
export function IdentityCard({ profile }: { profile: MyProfile }) {
  const identityRows = buildIdentityRows(profile)

  if (identityRows.length === 0) {
    return null
  }

  return (
    <Card hover={false}>
      <CardHeader>
        <H5 className={bblHeadingFontClass}>Identity</H5>
      </CardHeader>
      <Stack direction="column" size="sm" className="w-full">
        {identityRows.map(row => (
          <Stack key={row.label} className="w-full items-baseline justify-between gap-3">
            <Note className="shrink-0">{row.label}</Note>
            <span className="truncate text-right text-sm">{row.value}</span>
          </Stack>
        ))}
      </Stack>
    </Card>
  )
}
