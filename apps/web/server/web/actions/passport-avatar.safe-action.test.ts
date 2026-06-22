/**
 * bun test server/web/actions/passport-avatar.safe-action.test.ts
 *
 * Verifies the `uploadAndPromotePassportAvatar` safe-action auth gate and
 * its schema-boundary validations. S3 and env are stubbed so no external
 * services are required — gate wiring is the unit under test.
 *
 * The PASSPORT_NOT_FOUND path (authenticated but no passport) requires a
 * real Postgres fixture; that case is deferred to integration tests.
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { beforeEach, describe, expect, it, mock } from "bun:test"

// Stub env validation BEFORE any other import that pulls ~/env transitively.
mock.module("~/env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost/test",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_SITE_EMAIL: "test@test.com",
    NODE_ENV: "test",
    VERCEL_ENV: "development",
  },
}))

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

const uploadCalls: { path: string }[] = []

mock.module("~/lib/media", () => ({
  uploadToS3Storage: async (_buffer: unknown, path: string) => {
    uploadCalls.push({ path })
    return `https://r2.example.com/${path}`
  },
  getS3KeyFromUrl: (url: string) => url.replace("https://r2.example.com/", ""),
  removeS3File: async () => ({}),
  resolveDisplayAvatar: (url: string | null) => url,
}))

// Stub the DB so the auth gate tests don't need a real Postgres connection.
mock.module("~/services/db", () => ({
  db: {
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => cb({}),
    passport: {
      findFirst: async () => null,
      update: async () => ({}),
    },
    media: { create: async () => ({ id: "m1" }) },
    mediaAttachment: { create: async () => ({ id: "a1" }) },
    auditLog: { create: async () => ({}) },
    organization: { findFirst: async () => null },
  },
}))

const TEST_USER = { id: "avatar-test-user", role: "user" }
const validFile = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "photo.jpg", { type: "image/jpeg" })

beforeEach(() => {
  uploadCalls.length = 0
})

describe("uploadAndPromotePassportAvatar — auth gate", () => {
  it("rejects when unauthenticated", async () => {
    const { uploadAndPromotePassportAvatar } = await import("~/server/web/actions/passport-avatar")
    setTestSession(null)

    const result = await uploadAndPromotePassportAvatar({ file: validFile() })
    expect(result?.serverError).toBe("User not authenticated")
    expect(uploadCalls.length).toBe(0)
  })

  it("rejects non-image files at the schema boundary", async () => {
    const { uploadAndPromotePassportAvatar } = await import("~/server/web/actions/passport-avatar")
    setTestSession(TEST_USER)

    const textFile = new File([new Uint8Array([1])], "notes.txt", { type: "text/plain" })
    const result = await uploadAndPromotePassportAvatar({ file: textFile })
    expect(result?.validationErrors).toBeDefined()
    expect(uploadCalls.length).toBe(0)
  })

  it("rejects video files even though webMediaFileSchema allows them", async () => {
    const { uploadAndPromotePassportAvatar } = await import("~/server/web/actions/passport-avatar")
    setTestSession(TEST_USER)

    const videoFile = new File([new Uint8Array([1])], "clip.mp4", { type: "video/mp4" })
    const result = await uploadAndPromotePassportAvatar({ file: videoFile })
    expect(result?.validationErrors).toBeDefined()
    expect(uploadCalls.length).toBe(0)
  })

  it("fails with PASSPORT_NOT_FOUND when authenticated but no passport exists", async () => {
    const { uploadAndPromotePassportAvatar } = await import("~/server/web/actions/passport-avatar")
    setTestSession(TEST_USER)

    // db.passport.findFirst is stubbed to return null above.
    const result = await uploadAndPromotePassportAvatar({ file: validFile() })
    expect(result?.serverError).toBe("PASSPORT_NOT_FOUND")
    expect(uploadCalls.length).toBe(0)
  })
})
