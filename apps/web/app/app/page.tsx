import { Suspense } from "react"
import { RevenueMetric } from "~/app/app/_components/revenue-metric"
import { SubscriberMetric } from "~/app/app/_components/subscriber-metric"
import { UserMetric } from "~/app/app/_components/user-metric"
import { VisitorMetric } from "~/app/app/_components/visitor-metric"
import { CommandDeckLauncher } from "~/app/app/beta/command-deck/command-deck"
import { resolveCommandDeckData } from "~/app/app/beta/command-deck/data"
import { MetricChartSkeleton } from "~/components/admin/metrics/metric-chart"
import { MetricValue, MetricValueSkeleton } from "~/components/admin/metrics/metric-value"
import { H3, H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Skeleton } from "~/components/common/skeleton"
import { Stack } from "~/components/common/stack"
import { DashboardOnboardingTour } from "~/components/web/onboarding/dashboard-onboarding-tour"
import { Brand } from "~/.generated/prisma/client"
import { hasAnyLineageGrant, requireUser } from "~/lib/auth-guard"
import { can } from "~/server/orpc/permissions"
import { getOnboardingState } from "~/server/web/onboarding/queries"
import { db } from "~/services/db"
import { filterAppQuickActions } from "./_landing/app-quick-actions"
import { AttentionPanels } from "./_landing/attention-panels"
import { DashboardLanding } from "./_landing/dashboard-landing"
import { LoopBoardEmbed } from "./_landing/loop-board-embed"
import { QuickActions } from "./_landing/quick-actions"

/**
 * `/app` admin landing (SESSION_0600 WS-1, G-026) — thin auth-gate that gathers
 * server data and composes the `DashboardLanding` slot shell (ADR 0045 D4: a
 * COMPOSITION, never an `AdminCollection`). The Desi hierarchy — greeting +
 * quick-actions above the fold, the promoted Command Deck launcher, 0593 attention
 * placeholders, then demoted metrics / loop-board / charts — is arranged by the
 * shell; this page fills the slots and gates them by permission.
 *
 * Metrics gate on `metrics.read` (only `admin`'s `"*"` grants it today); the
 * loop-board embed on `loop-board.manage`; quick-actions and the launcher are
 * permission-filtered at config-build time so no numbers leak.
 */
export default async function (_props: PageProps<"/app">) {
  const user = await requireUser()
  const showMetrics = can(user, "metrics.read")
  const showLoopBoard = can(user, "loop-board.manage")

  const [hasLineageGrant, onboardingState] = await Promise.all([
    hasAnyLineageGrant(user.id),
    getOnboardingState({ userId: user.id, role: user.role, brand: Brand.BBL }),
  ])

  const { allowedHrefs, counts } = await resolveCommandDeckData(user, hasLineageGrant)
  const allowedQuickActionIds = filterAppQuickActions(user).map(action => action.id)

  // First-run: an admin whose dojo is effectively empty (only themselves, no leads).
  // Reuses already-fetched Command Deck counts — no extra queries. Non-admins never
  // see the metric surfaces, so first-run only shifts the admin landing.
  const userCount = counts["/app/users"] ?? 0
  const leadCount = counts["/app/leads"] ?? 0
  const firstRun = showMetrics && userCount <= 1 && leadCount === 0

  const greeting = (
    <Stack direction="column" size="xs" className="w-full">
      <H3>{firstRun ? "Welcome to your dojo" : "Welcome back"}</H3>
      <Note>
        {firstRun
          ? "Get started — add your first member or lead below."
          : `Signed in as ${user.name ?? user.email ?? "admin"}. Your console and dojo overview are below.`}
      </Note>
    </Stack>
  )

  const launcher =
    allowedHrefs.length > 0 ? (
      <CommandDeckLauncher
        allowedHrefs={allowedHrefs}
        counts={counts}
        heading={<H4>Jump to a section</H4>}
      />
    ) : undefined

  const metricsStrip =
    showMetrics && !firstRun ? (
      <Stack direction="column" size="sm" className="w-full">
        {/* Lifetime totals, NOT today's numbers (the charts below own "last 30 days") —
            DES-0600 P2: the label must not imply a daily figure. */}
        <H4>At a glance</H4>
        <Stack size="md" className="w-full">
          {[
            { label: "Tools", href: "/app/tools", query: db.tool.count() },
            { label: "Categories", href: "/app/categories", query: db.category.count() },
            { label: "Users", href: "/app/users", query: db.user.count() },
            { label: "Tournaments", href: "/app/tournaments", query: db.tournament.count() },
            { label: "Memberships", href: "/app/memberships", query: db.membership.count() },
          ].map(counter => (
            <Suspense key={counter.label} fallback={<MetricValueSkeleton />}>
              <MetricValue label={counter.label} href={counter.href} query={counter.query} />
            </Suspense>
          ))}
        </Stack>
      </Stack>
    ) : undefined

  const charts =
    showMetrics && !firstRun ? (
      <div className="grid gap-4 md:grid-cols-2">
        <Suspense fallback={<MetricChartSkeleton />}>
          <VisitorMetric />
        </Suspense>
        <Suspense fallback={<MetricChartSkeleton />}>
          <RevenueMetric />
        </Suspense>
        <Suspense fallback={<MetricChartSkeleton />}>
          <SubscriberMetric />
        </Suspense>
        <Suspense fallback={<MetricChartSkeleton />}>
          <UserMetric />
        </Suspense>
      </div>
    ) : undefined

  const loopBoard =
    showLoopBoard && !firstRun ? (
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <LoopBoardEmbed />
      </Suspense>
    ) : undefined

  return (
    <DashboardLanding
      onboarding={
        <Suspense fallback={null}>
          <DashboardOnboardingTour tier={onboardingState.tier} />
        </Suspense>
      }
      greeting={greeting}
      quickActions={<QuickActions allowedIds={allowedQuickActionIds} />}
      launcher={launcher}
      attention={showMetrics ? <AttentionPanels /> : undefined}
      metricsStrip={metricsStrip}
      loopBoard={loopBoard}
      charts={charts}
    />
  )
}
