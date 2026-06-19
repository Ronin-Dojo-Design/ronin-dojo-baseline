import { Stack } from "~/components/common/stack"
import type { SchoolDetailView } from "./school-detail-data"

type SchoolIntroProps = Pick<SchoolDetailView, "school" | "formattedAddress">

/** One-line intro under the hero: member count plus the formatted address (if any). */
export function SchoolIntro({ school, formattedAddress }: SchoolIntroProps) {
  return (
    <Stack size="sm" className="flex-wrap">
      <span className="text-sm text-muted-foreground">
        {school._count.memberships} member{school._count.memberships !== 1 ? "s" : ""}
      </span>
      {formattedAddress && (
        <span className="text-sm text-muted-foreground">{formattedAddress}</span>
      )}
    </Stack>
  )
}
