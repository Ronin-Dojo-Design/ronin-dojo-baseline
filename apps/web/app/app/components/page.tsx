import type { Metadata } from "next"
import { ComponentCatalogPanel } from "~/components/app/state-of-dojo/component-catalog-panel"
import { Wrapper } from "~/components/common/wrapper"

export const metadata: Metadata = {
  title: "Component catalog",
}

// The panel self-fetches from `main` (itself `revalidate`-cached ~15min), so render fresh per
// request without hammering GitHub — same posture as `/app/state` and `/app/loop-board`.
export const dynamic = "force-dynamic"

/**
 * /app/components — the live Component catalog projection surface (G-023 WS-B, SESSION_0606).
 *
 * The route owns placement (the `Wrapper`); `ComponentCatalogPanel` stays placement-agnostic and
 * self-fetching so a future landing-shell mount (mirrors `/app/state` + `DashboardLanding`) can
 * mount the SAME component into a landing slot unchanged.
 */
export default function Page() {
  return (
    <Wrapper size="lg" gap="sm">
      <ComponentCatalogPanel />
    </Wrapper>
  )
}
