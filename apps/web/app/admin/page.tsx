import { NetworkIcon } from "lucide-react"
import { Suspense } from "react"
import { RevenueMetric } from "~/app/admin/_components/revenue-metric"
import { SubscriberMetric } from "~/app/admin/_components/subscriber-metric"
import { UserMetric } from "~/app/admin/_components/user-metric"
import { VisitorMetric } from "~/app/admin/_components/visitor-metric"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { MetricChartSkeleton } from "~/components/admin/metrics/metric-chart"
import { MetricValue, MetricValueSkeleton } from "~/components/admin/metrics/metric-value"
import { Card } from "~/components/common/card"
import { H3 } from "~/components/common/heading"
import { Link } from "~/components/common/link"
import { Wrapper } from "~/components/common/wrapper"
import { db } from "~/services/db"

export default withAdminPage(() => {
  const counters = [
    { label: "Tools", href: "/admin/tools", query: db.tool.count() },
    { label: "Categories", href: "/admin/categories", query: db.category.count() },
    { label: "Users", href: "/admin/users", query: db.user.count() },
    { label: "Age Groups", href: "/admin/age-groups", query: db.ageGroup.count() },
    { label: "Skill Levels", href: "/admin/skill-levels", query: db.skillLevel.count() },
  ]

  return (
    <Wrapper size="lg" gap="xs">
      <H3>Dashboard</H3>

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

        {/* Local-only: /graphify.html is a gitignored 5MB codebase map (regenerate with `bun run graphify:viz`). Never deployed — gating to dev avoids a 404 in prod and keeps the codebase map off the public web. */}
        {process.env.NODE_ENV === "development" && (
          <Card className="p-4">
            <Link
              href="/graphify.html"
              target="_blank"
              className="flex items-center gap-3 no-underline"
            >
              <NetworkIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">Repo Graph</p>
                <p className="text-xs text-muted-foreground">
                  Interactive Graphify visualization of the codebase (local dev)
                </p>
              </div>
            </Link>
          </Card>
        )}
      </div>
    </Wrapper>
  )
})
