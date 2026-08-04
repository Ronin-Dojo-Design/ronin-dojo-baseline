import { Card, CardHeader } from "~/components/common/card"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { SECTION_META } from "./settings-fields"

const TOGGLE_ROW_COUNTS = [
  SECTION_META.profile.fieldCount,
  SECTION_META.notifications.fieldCount,
  SECTION_META.security.fieldCount,
  // Readiness snapshot renders two text inputs.
  2,
]

/**
 * Loading placeholder for the settings grid — one card per section with header + row stand-ins,
 * mirroring BBLApp's `BBLSettingsPage` skeleton state (row counts driven by the shared field config).
 */
export function SettingsSkeleton() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2" role="status" aria-label="Loading settings">
      {TOGGLE_ROW_COUNTS.map((rowCount, index) => (
        <Card key={`settings-skeleton-${index}`} hover={false} aria-hidden="true">
          <CardHeader direction="row" size="md" wrap={false}>
            <Skeleton className="size-9 rounded-lg" />
            <Stack direction="column" size="xs" className="flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </Stack>
          </CardHeader>
          <Stack direction="column" size="md" className="w-full">
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <Skeleton key={`settings-skeleton-row-${index}-${rowIndex}`} className="h-6 w-full" />
            ))}
          </Stack>
        </Card>
      ))}
    </div>
  )
}
