import { Suspense } from "react"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"

/**
 * WS-3 mount seam — the 0593 "State of the Dojo" panels (State · Component Catalog
 * · Card Catalog · Cookbook) land here once SESSION_0593 freezes its import-path
 * contract (`components/app/state-of-dojo/{...}-panel.tsx`). WS-1 owns ONLY the
 * placeholder seam: each panel is a `<Suspense>` boundary wrapping a stub. WS-3
 * swaps each stub for its real async panel — the boundary and layout stay put.
 *
 * This lane does NOT import `components/app/state-of-dojo/**` (frozen) and does NOT
 * create the `app/app/{state,component-catalog,card-catalog,cookbook}` route dirs
 * (SESSION_0593 owns them).
 */
const PANELS = [
  { key: "state", title: "State of the Dojo" },
  { key: "component-catalog", title: "Component Catalog" },
  { key: "card-catalog", title: "Card Catalog" },
  { key: "cookbook", title: "Cookbook" },
] as const

function PanelStub({ title }: { title: string }) {
  return (
    <Card hover={false} className="gap-3">
      <Stack size="sm" className="w-full items-center justify-between">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <Badge variant="soft" size="sm">
          Soon
        </Badge>
      </Stack>
      <Skeleton className="h-16 w-full rounded-md" />
      <Note>Panel mounts in WS-3.</Note>
    </Card>
  )
}

export function AttentionPanelsPlaceholder() {
  return (
    <Stack direction="column" size="sm" className="w-full">
      <H4>Attention</H4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PANELS.map(panel => (
          <Suspense key={panel.key} fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
            <PanelStub title={panel.title} />
          </Suspense>
        ))}
      </div>
    </Stack>
  )
}
