import type { Metadata } from "next"
import { TokenCostPanel } from "~/components/app/state-of-dojo/token-cost/token-cost-panel"
import { Wrapper } from "~/components/common/wrapper"

export const metadata: Metadata = {
  title: "Token cost — State of the Dojo",
}

// The panel self-fetches from `main` (itself `revalidate`-cached ~5min), same posture as
// `/app/state` and `/app/loop-board`.
export const dynamic = "force-dynamic"

/**
 * /app/token-cost — the State-of-Dojo token-cost projection surface (G-023 WS-D, SESSION_0608).
 *
 * The route owns placement (the `Wrapper`); `TokenCostPanel` stays placement-agnostic and
 * self-fetching so it can be mounted into a landing slot unchanged, same as `/app/state`.
 */
export default function Page() {
  return (
    <Wrapper size="lg" gap="sm">
      <TokenCostPanel />
    </Wrapper>
  )
}
