import type { Metadata } from "next"
import { CookbookPanel } from "~/components/app/state-of-dojo/cookbook-panel"
import { Wrapper } from "~/components/common/wrapper"

export const metadata: Metadata = {
  title: "Cookbook",
}

// The panel self-fetches from `main` (itself `revalidate`-cached ~5min), so render fresh per
// request without hammering GitHub — same posture as `/app/state` and `/app/loop-board`.
export const dynamic = "force-dynamic"

/**
 * /app/cookbook — the browsable recipe-book surface (G-023 slice-2, SESSION_0607 WS-C).
 *
 * The route owns placement (the `Wrapper`); `CookbookPanel` stays placement-agnostic and
 * self-fetching so a future landing shell can mount the SAME component into a landing slot
 * unchanged (mirrors `/app/state`).
 */
export default function Page() {
  return (
    <Wrapper size="lg" gap="sm">
      <CookbookPanel />
    </Wrapper>
  )
}
