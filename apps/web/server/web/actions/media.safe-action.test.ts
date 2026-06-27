/**
 * SESSION_0288 TASK_02 — web media upload auth gate.
 *
 * Run: cd apps/web && bun test server/web/actions/media.safe-action.test.ts
 *
 * Proves that `uploadMedia`/`fetchMedia` now run through `mediaUploadActionClient`
 * (auth + `canUploadMedia` entitlement gate) instead of the public base client.
 * The entitlement *logic* is covered separately by
 * `server/web/entitlements/queries.integration.test.ts`; here `canUploadMedia` and
 * the S3/network primitives are mocked so the test isolates the gate wiring.
 *
 * Author: Cody / SESSION_0288 TASK_02.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { beforeEach, describe, expect, it, mock } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

// Control the entitlement gate without DB fixtures.
const entitlementState = { canUpload: true }
mock.module("~/server/web/entitlements/queries", () => ({
  canUploadMedia: async () => entitlementState.canUpload,
  hasEntitlement: async () => false,
}))

// Keep the action bodies off real S3 / outbound HTTP.
const uploadCalls: { path: string }[] = []
mock.module("~/lib/media", () => ({
  uploadToS3Storage: async (_buffer: unknown, path: string) => {
    uploadCalls.push({ path })
    return `https://s3.test/${path}`
  },
  getFaviconFetchUrl: (url: string) => `https://favicon.test/?u=${encodeURIComponent(url)}`,
  getScreenshotFetchUrl: (url: string) => `https://screenshot.test/?u=${encodeURIComponent(url)}`,
}))

// The input schemas pull translated error messages; echo the key.
mock.module("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))

const TEST_USER = { id: "media-gate-user", role: "user" }
const ADMIN_USER = { id: "media-gate-admin", role: "admin" }
// Real JPEG magic bytes (FF D8 FF E0) so the server-side `sniffUploadBuffer` guard accepts it.
const validFile = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "avatar.jpg", { type: "image/jpeg" })

beforeEach(() => {
  entitlementState.canUpload = true
  uploadCalls.length = 0
})

describe("web media actions — upload auth gate", () => {
  it("rejects uploadMedia when unauthenticated", async () => {
    const { uploadMedia } = await import("~/server/web/actions/media")
    setTestSession(null)

    const result = await uploadMedia({ path: "avatars/test", file: validFile() })

    expect(result?.serverError).toBe("User not authenticated")
    expect(uploadCalls.length).toBe(0)
  })

  it("rejects uploadMedia when authenticated but not entitled", async () => {
    const { uploadMedia } = await import("~/server/web/actions/media")
    setTestSession(TEST_USER)
    entitlementState.canUpload = false

    const result = await uploadMedia({ path: "avatars/test", file: validFile() })

    expect(result?.serverError).toBe("User not authorized to upload media")
    expect(uploadCalls.length).toBe(0)
  })

  it("allows uploadMedia for a platform admin even with NO entitlement (WL-P2-19 role bypass)", async () => {
    const { uploadMedia } = await import("~/server/web/actions/media")
    setTestSession(ADMIN_USER)
    entitlementState.canUpload = false

    const result = await uploadMedia({ path: "avatars/admin", file: validFile() })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBe("https://s3.test/avatars/admin")
    expect(uploadCalls).toEqual([{ path: "avatars/admin" }])
  })

  it("allows uploadMedia for an entitled user and stores to S3", async () => {
    const { uploadMedia } = await import("~/server/web/actions/media")
    setTestSession(TEST_USER)
    entitlementState.canUpload = true

    const result = await uploadMedia({ path: "avatars/test", file: validFile() })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBe("https://s3.test/avatars/test")
    expect(uploadCalls).toEqual([{ path: "avatars/test" }])
  })

  it("rejects fetchMedia when unauthenticated", async () => {
    const { fetchMedia } = await import("~/server/web/actions/media")
    setTestSession(null)

    const result = await fetchMedia({
      url: "https://example.com",
      path: "favicons/test",
      type: "favicon",
    })

    expect(result?.serverError).toBe("User not authenticated")
    expect(uploadCalls.length).toBe(0)
  })

  it("rejects fetchMedia when authenticated but not entitled", async () => {
    const { fetchMedia } = await import("~/server/web/actions/media")
    setTestSession(TEST_USER)
    entitlementState.canUpload = false

    const result = await fetchMedia({
      url: "https://example.com",
      path: "favicons/test",
      type: "favicon",
    })

    expect(result?.serverError).toBe("User not authorized to upload media")
    expect(uploadCalls.length).toBe(0)
  })
})
