/**
 * SESSION_0099 - Storage cost projection proof.
 *
 * Run: cd apps/web && bun test server/admin/storage/monitoring/queries.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  projectS3MonthlyCost,
  type StorageAssetSummary,
} from "~/server/admin/storage/monitoring/queries"

const assetSummary = {
  objectCount: 100,
  localByteTotal: 100 * 1024 * 1024,
  localGbTotal: 100 / 1024,
  averageObjectBytes: 1 * 1024 * 1024,
  missingLocalPaths: [],
} satisfies StorageAssetSummary

describe("projectS3MonthlyCost", () => {
  it("projects storage, request, and free direct transfer costs for launch volume", () => {
    const projection = projectS3MonthlyCost(assetSummary, {
      id: "test",
      label: "Test",
      monthlyPageViews: 1000,
      imagesPerPageView: 10,
      monthlyUploads: 100,
      averageUploadMb: 1,
    })

    expect(projection.monthlyGetRequests).toBe(10_000)
    expect(projection.monthlyPutRequests).toBe(100)
    expect(projection.projectedStoredGb).toBeCloseTo(200 / 1024, 8)
    expect(projection.projectedTransferOutGb).toBeCloseTo(10_000 / 1024, 8)
    expect(projection.directTransferOutCostUsd).toBe(0)
    expect(projection.storageCostUsd).toBeCloseTo((200 / 1024) * 0.023, 8)
    expect(projection.getRequestCostUsd).toBeCloseTo(0.004, 8)
    expect(projection.putRequestCostUsd).toBeCloseTo(0.0005, 8)
    expect(projection.projectedMonthlyS3CostUsd).toBeGreaterThan(0)
    expect(projection.projectedMonthlyS3CostUsd).toBeLessThan(0.02)
  })

  it("adds direct S3 data-transfer-out cost above the 100 GB monthly free tier", () => {
    const projection = projectS3MonthlyCost(assetSummary, {
      id: "heavy",
      label: "Heavy",
      monthlyPageViews: 20_000,
      imagesPerPageView: 10,
      monthlyUploads: 0,
      averageUploadMb: 1,
    })

    expect(projection.projectedTransferOutGb).toBeCloseTo(200_000 / 1024, 8)
    expect(projection.directTransferOutCostUsd).toBeCloseTo((200_000 / 1024 - 100) * 0.09, 8)
  })
})
