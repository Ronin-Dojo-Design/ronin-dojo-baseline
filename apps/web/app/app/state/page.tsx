import type { Metadata } from "next"
import { StatePanel } from "~/components/app/state-of-dojo/state-panel"
import { Wrapper } from "~/components/common/wrapper"

export const metadata: Metadata = {
  title: "State of the Dojo",
}

// The panel self-fetches from `main` (itself `revalidate`-cached ~5min), so render fresh per request
// without hammering GitHub — same posture as `/app/loop-board`.
export const dynamic = "force-dynamic"

/**
 * /app/state — the live State-of-Dojo projection surface (G-023 slice-2, SESSION_0603 WS-A).
 *
 * The route owns placement (the `Wrapper`); `StatePanel` stays placement-agnostic and self-fetching so
 * SESSION_0599's `DashboardLanding` shell can mount the SAME component into a landing slot unchanged.
 */
export default function Page() {
  return (
    <Wrapper size="lg" gap="sm">
      <StatePanel />
    </Wrapper>
  )
}
