import { HardDriveIcon } from "lucide-react"
import { withAdminPage } from "~/components/admin/auth-hoc"
import { Badge } from "~/components/common/badge"
import { Card } from "~/components/common/card"
import { H3, H4, H5 } from "~/components/common/heading"
import { Wrapper } from "~/components/common/wrapper"
import {
  getStorageOperationsMonitor,
  S3_COST_MODEL,
  type StorageCostProjection,
} from "~/server/admin/storage/monitoring/queries"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value)

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value)

const formatDateTime = (date: Date) => `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`

const CountCard = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <Card hover={false} className="min-h-24">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="break-words text-2xl font-semibold tracking-normal">{value}</div>
    </Card>
  )
}

const ProjectionTable = ({ scenarios }: { scenarios: StorageCostProjection[] }) => {
  return (
    <section className="grid gap-3">
      <H5>Monthly S3 Projection</H5>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[780px] table-fixed text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-28 px-3 py-2 font-medium">Scenario</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Views</th>
              <th className="w-28 px-3 py-2 text-right font-medium">GETs</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Transfer</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Stored</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Direct egress</th>
              <th className="w-28 px-3 py-2 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {scenarios.map(scenario => (
              <tr key={scenario.id}>
                <td className="px-3 py-2 font-medium">{scenario.label}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(scenario.monthlyPageViews, 0)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(scenario.monthlyGetRequests, 0)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(scenario.projectedTransferOutGb)} GB
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatNumber(scenario.projectedStoredGb, 3)} GB
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatCurrency(scenario.directTransferOutCostUsd)}
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  {formatCurrency(scenario.projectedMonthlyS3CostUsd)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default withAdminPage(async () => {
  const monitor = await getStorageOperationsMonitor()
  const baseProjection = monitor.scenarios[0]

  return (
    <Wrapper size="lg" gap="sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <HardDriveIcon className="size-5 text-muted-foreground" />
          <H3>Storage Monitoring</H3>
        </div>
        <Badge variant={monitor.configured ? "success" : "warning"} size="lg">
          {monitor.statusLabel}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <CountCard label="Catalog objects" value={monitor.assetSummary.objectCount} />
        <CountCard
          label="Local catalog size"
          value={`${formatNumber(monitor.assetSummary.localGbTotal, 3)} GB`}
        />
        <CountCard
          label="Avg object"
          value={`${formatNumber(monitor.assetSummary.averageObjectBytes / 1024, 0)} KB`}
        />
        <CountCard
          label="Launch estimate"
          value={baseProjection ? formatCurrency(baseProjection.projectedMonthlyS3CostUsd) : "N/A"}
        />
        <CountCard label="Generated" value={formatDateTime(monitor.generatedAt)} />
      </div>

      {monitor.warnings.length > 0 && (
        <section className="grid gap-2 rounded-md border border-orange-500/30 bg-orange-500/5 p-4">
          <H4 className="text-base">Setup Warnings</H4>
          <ul className="grid gap-1 text-sm text-orange-800 dark:text-orange-100">
            {monitor.warnings.map(warning => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6">
        <section className="grid gap-3">
          <H5>Environment</H5>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CountCard label="Bucket" value={monitor.config.bucketName ?? "Missing"} />
            <CountCard label="Region" value={monitor.config.region ?? "Missing"} />
            <CountCard
              label="Upload keys"
              value={
                monitor.config.accessKeyConfigured && monitor.config.secretKeyConfigured
                  ? "Configured"
                  : "Missing"
              }
            />
            <CountCard
              label="S3_PUBLIC_URL"
              value={monitor.config.serverPublicUrlConfigured ? "Configured" : "Missing"}
            />
            <CountCard
              label="Media base"
              value={monitor.config.clientPublicMediaBaseConfigured ? "Configured" : "Local"}
            />
            <CountCard
              label="Missing local paths"
              value={monitor.assetSummary.missingLocalPaths.length}
            />
          </div>
        </section>

        <ProjectionTable scenarios={monitor.scenarios} />

        <section className="grid gap-2 rounded-md border p-4 text-sm text-secondary-foreground">
          <H5>Cost Model</H5>
          <p>
            Estimates use S3 Standard at {formatCurrency(S3_COST_MODEL.storageStandardPerGbMonth)}
            /GB-month, GET requests at {formatCurrency(S3_COST_MODEL.getPer1000Requests)}/1,000,
            PUT/LIST-class requests at{" "}
            {formatCurrency(S3_COST_MODEL.putCopyPostListPer1000Requests)}
            /1,000, and direct S3 transfer after the first {S3_COST_MODEL.directTransferOutFreeGb}{" "}
            GB/month at {formatCurrency(S3_COST_MODEL.directTransferOutPerGbAfterFreeTier)}/GB.
          </p>
          <p>
            If `NEXT_PUBLIC_MEDIA_BASE_URL` points at CloudFront, this S3 estimate excludes
            CloudFront plan/pay-as-you-go charges; S3 transfer to CloudFront is not charged as
            direct public egress.
          </p>
        </section>
      </div>
    </Wrapper>
  )
})
