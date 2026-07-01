import { redirect } from "next/navigation"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { H6 } from "~/components/common/heading"
import { Stack } from "~/components/common/stack"
import { BeltJourneyTab } from "~/components/web/belt"
import { getServerSession } from "~/lib/auth"
import { loadBeltTabData } from "~/server/web/belt/belt-tab-loader"

/**
 * The profile "Belts" tab (Slice 5 — Petey Plan 0477). Server-loads the member's
 * belt-journey view-model in ONE pass (BJJ ladder + awarded ranks + the ceiling +
 * milestone media joined to their URLs — see `loadBeltTabData`) and hands it to the
 * `BeltJourneyTab` client bridge, which supplies the R2 `onUpload`. Every gating
 * decision (locked above the ceiling, verified-fact read-only, delete-top blocked)
 * lives server-side in the belt oRPC + the pure view-model helpers.
 */
export async function DashboardBeltsTab() {
  const session = await getServerSession()
  if (!session?.user) {
    redirect("/auth/login?next=/app/profile")
  }

  const data = await loadBeltTabData(session.user.id)

  if (!data || data.ranks.length === 0) {
    return (
      <Card hover={false}>
        <CardHeader direction="column" size="xs">
          <H6 render={props => <h2 {...props}>{props.children}</h2>}>No belt journey yet</H6>
          <CardDescription>
            Your belt journey will appear here once you have a rank on your BJJ passport.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Stack direction="column" size="lg">
      <BeltJourneyTab
        ranks={data.ranks}
        ceiling={data.ceiling}
        promoterOptions={data.promoterOptions}
        schoolOptions={data.schoolOptions}
      />
    </Stack>
  )
}
