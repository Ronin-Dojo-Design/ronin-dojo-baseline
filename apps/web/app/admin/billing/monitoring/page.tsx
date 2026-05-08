import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H3, H4, H5 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import {
  getStripeWebhookOperationsMonitor,
  type StripeWebhookEventPreview,
  type StripeWebhookStatusTypeCount,
} from "~/server/admin/billing/monitoring/queries"

const formatDateTime = (date: Date | null) => {
  if (!date) return "None"
  return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`
}

const CountCard = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <Card hover={false} className="min-h-24">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tracking-normal">{value}</div>
    </Card>
  )
}

const StatusTypeTable = ({
  title,
  counts,
}: {
  title: string
  counts: StripeWebhookStatusTypeCount[]
}) => {
  return (
    <section className="grid gap-3">
      <H5>{title}</H5>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[520px] table-fixed text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-28 px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {counts.length > 0 ? (
              counts.map(count => (
                <tr key={`${title}-${count.status}-${count.type}`}>
                  <td className="px-3 py-2">{count.status}</td>
                  <td className="truncate px-3 py-2 font-mono text-xs">{count.type}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{count.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={3}>
                  No events
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

const EventsTable = ({
  title,
  events,
  includeError = false,
}: {
  title: string
  events: StripeWebhookEventPreview[]
  includeError?: boolean
}) => {
  return (
    <section className="grid gap-3">
      <H5>{title}</H5>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[760px] table-fixed text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-52 px-3 py-2 font-medium">Event</th>
              <th className="w-44 px-3 py-2 font-medium">Type</th>
              <th className="w-28 px-3 py-2 font-medium">Status</th>
              <th className="w-24 px-3 py-2 text-right font-medium">Attempts</th>
              <th className="w-44 px-3 py-2 font-medium">Created</th>
              {includeError && <th className="px-3 py-2 font-medium">Error</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.length > 0 ? (
              events.map(event => (
                <tr key={`${title}-${event.id}`}>
                  <td className="truncate px-3 py-2 font-mono text-xs">{event.id}</td>
                  <td className="truncate px-3 py-2 font-mono text-xs">{event.type}</td>
                  <td className="px-3 py-2">{event.status}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{event.attempts}</td>
                  <td className="px-3 py-2 text-xs">{formatDateTime(event.createdAt)}</td>
                  {includeError && (
                    <td className="truncate px-3 py-2 text-xs text-muted-foreground">
                      {event.lastErrorSummary ?? "None"}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={includeError ? 6 : 5}>
                  No events
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default withAdminPage(async () => {
  const monitor = await getStripeWebhookOperationsMonitor()

  return (
    <Wrapper size="lg" gap="sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <H3>Billing Monitoring</H3>
        <Badge variant={monitor.launchReady ? "success" : "danger"} size="lg">
          {monitor.statusLabel}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CountCard label="Processed 1h" value={monitor.counts.processedLastHour} />
        <CountCard label="Processed 24h" value={monitor.counts.processedLast24Hours} />
        <CountCard label="Failed 7d" value={monitor.counts.failedLast7Days} />
        <CountCard label="Stale processing" value={monitor.counts.staleProcessing} />
        <CountCard label="Repeated attempts" value={monitor.repeatedAttemptEvents.length} />
      </div>

      {monitor.blockingReasons.length > 0 && (
        <section className="grid gap-2 rounded-md border border-red-500/30 bg-red-500/5 p-4">
          <H4 className="text-base">Blocking Reasons</H4>
          <ul className="grid gap-1 text-sm text-red-700 dark:text-red-200">
            {monitor.blockingReasons.map(reason => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <StatusTypeTable title="Last 24 Hours" counts={monitor.counts.last24Hours} />
          <StatusTypeTable title="Last 7 Days" counts={monitor.counts.last7Days} />
        </div>

        <EventsTable title="Failed Events" events={monitor.failedEvents} includeError />
        <EventsTable title="Stale Processing Events" events={monitor.staleProcessingEvents} />
        <EventsTable title="Repeated Attempt Events" events={monitor.repeatedAttemptEvents} />
        <EventsTable title="Recent Processed Events" events={monitor.recentProcessedEvents} />
      </div>
    </Wrapper>
  )
})
