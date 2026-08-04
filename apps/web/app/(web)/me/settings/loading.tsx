import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { Breadcrumbs } from "~/components/web/ui/breadcrumbs"
import { SettingsSkeleton } from "./_components/settings/settings-skeleton"

/**
 * Route-level loading UI for `/me/settings` — the header placeholder + the section-card skeleton
 * grid, shown while the server resolves the member's persisted settings (BBLApp parity).
 */
export default function MeSettingsLoading() {
  return (
    <>
      <Breadcrumbs
        items={[
          { url: "/me", title: "My Passport" },
          { url: "/me/settings", title: "Settings" },
        ]}
      />

      <Stack direction="column" size="lg" className="w-full">
        <Stack size="md" wrap={false} className="items-center">
          <Skeleton className="size-10 rounded-xl" />
          <Stack direction="column" size="xs">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-72" />
          </Stack>
        </Stack>

        <SettingsSkeleton />
      </Stack>
    </>
  )
}
