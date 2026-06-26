import { Suspense } from "react"
import { RevenueMetric } from "~/app/app/_components/revenue-metric"
import { SubscriberMetric } from "~/app/app/_components/subscriber-metric"
import { UserMetric } from "~/app/app/_components/user-metric"
import { VisitorMetric } from "~/app/app/_components/visitor-metric"
import { MetricChartSkeleton } from "~/components/admin/metrics/metric-chart"
import { MetricValue, MetricValueSkeleton } from "~/components/admin/metrics/metric-value"
import { H3 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import { DashboardOnboardingTour } from "~/components/web/onboarding/dashboard-onboarding-tour"
import { Brand } from "~/.generated/prisma/client"
import { requireUser } from "~/lib/auth-guard"
import { can } from "~/server/orpc/permissions"
import { getOnboardingState } from "~/server/web/onboarding/queries"
import { db } from "~/services/db"

/**
 * Unified `/app` overview (BBL-SOT-Spec Phase 2a). Reuses the existing admin
 * metric components — the data wiring is unchanged; only the shell moved. The
 * metrics block is permission-gated per the upstream pattern (`metrics.read`,
 * which only `admin`'s `"*"` grants today); non-admin users get a plain
 * welcome until member-facing surfaces move here in wave 2b.
 */
export default async function (_props: PageProps<"/app">) {
  const user = await requireUser()
  const showMetrics = can(user, "metrics.read")
  const onboarding = await getOnboardingState({
    userId: user.id,
    role: user.role,
    brand: Brand.BBL,
  })

  const counters = [
    { label: "Tools", href: "/admin/tools", query: db.tool.count() },
    { label: "Categories", href: "/admin/categories", query: db.category.count() },
    { label: "Users", href: "/app/users", query: db.user.count() },
    { label: "Tournaments", href: "/app/tournaments", query: db.tournament.count() },
    { label: "Memberships", href: "/app/memberships", query: db.membership.count() },
  ]

  return (
    <Wrapper size="lg" gap="xs">
      <Suspense fallback={null}>
        <DashboardOnboardingTour tier={onboarding.tier} />
      </Suspense>

      <H3>Dashboard</H3>

      {showMetrics ? (
        <div className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex flex-wrap gap-4">
            {counters.map(counter => (
              <Suspense key={counter.label} fallback={<MetricValueSkeleton />}>
                <MetricValue label={counter.label} href={counter.href} query={counter.query} />
              </Suspense>
            ))}
          </div>

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
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Welcome, {user.name}. Your workspace areas appear in the sidebar.
        </p>
      )}
    </Wrapper>
  )
}
