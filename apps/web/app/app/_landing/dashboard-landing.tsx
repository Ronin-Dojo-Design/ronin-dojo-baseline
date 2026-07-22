import type { ReactNode } from "react"
import { Stack } from "~/components/common/stack"
import { Wrapper } from "~/components/common/wrapper"

type DashboardLandingProps = {
  /** Onboarding tour — mounts invisibly, drives the first-run flow. */
  onboarding?: ReactNode
  /** Greeting block (welcome + first-run nudge). */
  greeting: ReactNode
  /** Quick-action grid + carousel island (the hero). */
  quickActions?: ReactNode
  /** The promoted Command Deck grouped launcher over the 7-group SOT. */
  launcher?: ReactNode
  /** 0593 attention panels — placeholder seam this lane (real panels = WS-3). */
  attention?: ReactNode
  /** Compact metrics strip (today's counters, demoted below the launcher). */
  metricsStrip?: ReactNode
  /** Compact loop-board embed (the AdminTODOist glance). */
  loopBoard?: ReactNode
  /** Full metric charts — the deepest, below-the-fold layer. */
  charts?: ReactNode
}

/**
 * `DashboardLanding` — the `/app` admin landing shell (SESSION_0600 WS-1, G-026).
 *
 * A pure slot COMPOSITION (`Wrapper` / `Stack`), NEVER routed through
 * `AdminCollection` (ADR 0045 D4 — the landing is a composition, not a record
 * list). It owns ONLY the hierarchy (Desi): actions + attention above the fold,
 * metrics demoted below. `page.tsx` fills the slots; absent slots (non-admin,
 * first-run) simply render nothing.
 *
 * Order: onboarding → greeting + quick actions (hero) → Command Deck launcher →
 * attention panels → compact metrics strip → loop-board embed → full charts.
 */
export function DashboardLanding({
  onboarding,
  greeting,
  quickActions,
  launcher,
  attention,
  metricsStrip,
  loopBoard,
  charts,
}: DashboardLandingProps) {
  return (
    <Wrapper size="lg" gap="md">
      {onboarding}

      <Stack direction="column" size="sm" className="w-full">
        {greeting}
        {quickActions}
      </Stack>

      {launcher}
      {attention}
      {metricsStrip}
      {loopBoard}
      {charts}
    </Wrapper>
  )
}
