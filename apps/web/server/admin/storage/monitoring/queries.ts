import { access, stat } from "node:fs/promises"
import path from "node:path"
import { env } from "~/env"
import { tuffBuffsAffiliateGearProducts } from "~/lib/tuffbuffs/affiliate-gear"
import { tuffBuffsMerchProducts } from "~/lib/tuffbuffs/merch-catalog"

const BYTES_PER_GB = 1024 ** 3
const BYTES_PER_MB = 1024 ** 2

export const S3_COST_MODEL = {
  storageStandardPerGbMonth: 0.023,
  putCopyPostListPer1000Requests: 0.005,
  getPer1000Requests: 0.0004,
  directTransferOutFreeGb: 100,
  directTransferOutPerGbAfterFreeTier: 0.09,
} as const

export type StorageAssetSummary = {
  objectCount: number
  localByteTotal: number
  localGbTotal: number
  averageObjectBytes: number
  missingLocalPaths: string[]
}

export type StorageUsageScenarioInput = {
  id: string
  label: string
  monthlyPageViews: number
  imagesPerPageView: number
  monthlyUploads: number
  averageUploadMb: number
}

export type StorageCostProjection = StorageUsageScenarioInput & {
  projectedStoredGb: number
  monthlyGetRequests: number
  monthlyPutRequests: number
  projectedTransferOutGb: number
  storageCostUsd: number
  getRequestCostUsd: number
  putRequestCostUsd: number
  directTransferOutCostUsd: number
  projectedMonthlyS3CostUsd: number
}

export type StorageOperationsMonitor = {
  generatedAt: Date
  statusLabel: "CONFIGURED" | "NEEDS_SETUP"
  configured: boolean
  config: {
    bucketConfigured: boolean
    regionConfigured: boolean
    accessKeyConfigured: boolean
    secretKeyConfigured: boolean
    serverPublicUrlConfigured: boolean
    clientPublicMediaBaseConfigured: boolean
    bucketName: string | null
    region: string | null
    serverPublicUrl: string | null
    clientPublicMediaBaseUrl: string | null
  }
  warnings: string[]
  assetSummary: StorageAssetSummary
  scenarios: StorageCostProjection[]
}

const defaultUsageScenarios = [
  {
    id: "launch",
    label: "Launch",
    monthlyPageViews: 2_000,
    imagesPerPageView: 12,
    monthlyUploads: 100,
    averageUploadMb: 0.5,
  },
  {
    id: "growth",
    label: "Growth",
    monthlyPageViews: 10_000,
    imagesPerPageView: 12,
    monthlyUploads: 500,
    averageUploadMb: 0.5,
  },
  {
    id: "heavy",
    label: "Heavy",
    monthlyPageViews: 50_000,
    imagesPerPageView: 12,
    monthlyUploads: 2_000,
    averageUploadMb: 0.5,
  },
] as const satisfies readonly StorageUsageScenarioInput[]

const collectTuffBuffsPublicAssetPaths = () => {
  const paths = new Set<string>()

  for (const product of tuffBuffsAffiliateGearProducts) {
    if (product.imagePath?.startsWith("/")) {
      paths.add(product.imagePath)
    }
  }

  for (const product of tuffBuffsMerchProducts) {
    if (product.imagePath.startsWith("/")) {
      paths.add(product.imagePath)
    }
    for (const imagePath of product.imagePaths ?? []) {
      if (imagePath.startsWith("/")) {
        paths.add(imagePath)
      }
    }
  }

  return [...paths].sort()
}

const getPublicRoot = async () => {
  const candidates = [
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "apps", "web", "public"),
  ]

  for (const candidate of candidates) {
    try {
      await access(candidate)
      return candidate
    } catch {
      // Try the next cwd shape.
    }
  }

  return candidates[0]
}

export const getPublicAssetStorageSummary = async (
  publicPaths = collectTuffBuffsPublicAssetPaths(),
): Promise<StorageAssetSummary> => {
  const publicRoot = await getPublicRoot()
  let localByteTotal = 0
  const missingLocalPaths: string[] = []

  for (const publicPath of publicPaths) {
    const localPath = path.join(publicRoot, publicPath.replace(/^\/+/, ""))

    try {
      const stats = await stat(localPath)
      localByteTotal += stats.size
    } catch {
      missingLocalPaths.push(publicPath)
    }
  }

  const foundCount = publicPaths.length - missingLocalPaths.length

  return {
    objectCount: publicPaths.length,
    localByteTotal,
    localGbTotal: localByteTotal / BYTES_PER_GB,
    averageObjectBytes: foundCount > 0 ? localByteTotal / foundCount : 0,
    missingLocalPaths,
  }
}

export const projectS3MonthlyCost = (
  assetSummary: StorageAssetSummary,
  scenario: StorageUsageScenarioInput,
): StorageCostProjection => {
  const monthlyGetRequests = scenario.monthlyPageViews * scenario.imagesPerPageView
  const monthlyPutRequests = scenario.monthlyUploads
  const monthlyUploadGb =
    (scenario.monthlyUploads * scenario.averageUploadMb * BYTES_PER_MB) / BYTES_PER_GB
  const projectedStoredGb = assetSummary.localGbTotal + monthlyUploadGb
  const projectedTransferOutGb =
    (monthlyGetRequests * assetSummary.averageObjectBytes) / BYTES_PER_GB
  const billableTransferOutGb = Math.max(
    0,
    projectedTransferOutGb - S3_COST_MODEL.directTransferOutFreeGb,
  )

  const storageCostUsd = projectedStoredGb * S3_COST_MODEL.storageStandardPerGbMonth
  const getRequestCostUsd = (monthlyGetRequests / 1000) * S3_COST_MODEL.getPer1000Requests
  const putRequestCostUsd =
    (monthlyPutRequests / 1000) * S3_COST_MODEL.putCopyPostListPer1000Requests
  const directTransferOutCostUsd =
    billableTransferOutGb * S3_COST_MODEL.directTransferOutPerGbAfterFreeTier

  return {
    ...scenario,
    projectedStoredGb,
    monthlyGetRequests,
    monthlyPutRequests,
    projectedTransferOutGb,
    storageCostUsd,
    getRequestCostUsd,
    putRequestCostUsd,
    directTransferOutCostUsd,
    projectedMonthlyS3CostUsd:
      storageCostUsd + getRequestCostUsd + putRequestCostUsd + directTransferOutCostUsd,
  }
}

const cleanPublicUrl = (value: string | undefined) => value?.replace(/\/+$/, "") ?? null

export const getStorageOperationsMonitor = async (): Promise<StorageOperationsMonitor> => {
  const assetSummary = await getPublicAssetStorageSummary()
  const serverPublicUrl = cleanPublicUrl(env.S3_PUBLIC_URL)
  const clientPublicMediaBaseUrl = cleanPublicUrl(env.NEXT_PUBLIC_MEDIA_BASE_URL)

  const config = {
    bucketConfigured: Boolean(env.S3_BUCKET),
    regionConfigured: Boolean(env.S3_REGION),
    accessKeyConfigured: Boolean(env.S3_ACCESS_KEY),
    secretKeyConfigured: Boolean(env.S3_SECRET_ACCESS_KEY),
    serverPublicUrlConfigured: Boolean(serverPublicUrl),
    clientPublicMediaBaseConfigured: Boolean(clientPublicMediaBaseUrl),
    bucketName: env.S3_BUCKET ?? null,
    region: env.S3_REGION ?? null,
    serverPublicUrl,
    clientPublicMediaBaseUrl,
  }

  const warnings = [
    !config.bucketConfigured ? "S3_BUCKET is not set for this environment." : null,
    !config.regionConfigured ? "S3_REGION is not set for this environment." : null,
    !config.accessKeyConfigured ? "S3_ACCESS_KEY is not set for this environment." : null,
    !config.secretKeyConfigured ? "S3_SECRET_ACCESS_KEY is not set for this environment." : null,
    !config.serverPublicUrlConfigured ? "S3_PUBLIC_URL is not set for uploaded media URLs." : null,
    !config.clientPublicMediaBaseConfigured
      ? "NEXT_PUBLIC_MEDIA_BASE_URL is not set, so public catalog assets resolve locally."
      : null,
    serverPublicUrl && clientPublicMediaBaseUrl && serverPublicUrl !== clientPublicMediaBaseUrl
      ? "S3_PUBLIC_URL and NEXT_PUBLIC_MEDIA_BASE_URL differ; confirm this is intentional."
      : null,
    assetSummary.missingLocalPaths.length > 0
      ? `${assetSummary.missingLocalPaths.length} catalog asset path(s) are missing locally.`
      : null,
  ].filter((warning): warning is string => Boolean(warning))

  const configured =
    config.bucketConfigured &&
    config.regionConfigured &&
    config.accessKeyConfigured &&
    config.secretKeyConfigured &&
    config.serverPublicUrlConfigured &&
    config.clientPublicMediaBaseConfigured

  return {
    generatedAt: new Date(),
    statusLabel: configured ? "CONFIGURED" : "NEEDS_SETUP",
    configured,
    config,
    warnings,
    assetSummary,
    scenarios: defaultUsageScenarios.map(scenario => projectS3MonthlyCost(assetSummary, scenario)),
  }
}
