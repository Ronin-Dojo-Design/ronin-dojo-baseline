/**
 * SESSION_0411 — action-level proof for the BBL launch-teaser email capture.
 *
 * Proves the public `captureBblEmail` action PERSISTS a row to `BblEmailCapture`
 * and DEDUPES on `email` (a re-submit updates the name, keeps one row, no error).
 * This is the proof the email capture works (the legacy WordPress endpoint it
 * replaces was dead).
 *
 * Run (RESEND empty so no live send is even attempted):
 *   cd apps/web && RESEND_API_KEY= bun test server/web/bbl/capture-email.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test"

const requestBrand = "BBL"

// --- standard mock seams (installed before importing the action) ---
mock.module("next/headers", () => ({
  headers: async () => ({
    get: (key: string) => {
      const k = key.toLowerCase()
      if (k === "x-brand") return requestBrand
      if (k === "host") return "blackbeltlegacy.local"
      return null
    },
  }),
}))

mock.module("next/cache", () => ({
  revalidatePath: () => {},
  updateTag: () => {},
  revalidateTag: () => {},
}))

mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    void Promise.resolve().then(() => fn())
  },
}))

// Stub the email seam so the best-effort confirmation never hits Resend, even if a
// key is present in the environment (sender-rep guard — SOP §3 seam).
const sendEmailMock = mock(async () => undefined)
mock.module("~/lib/email", () => ({
  sendEmail: sendEmailMock,
}))

// Mock the rate limiter (no Redis in tests); `limited` is toggled per-test.
const rateLimitState = { limited: false }
mock.module("~/lib/rate-limiter", () => ({
  isRateLimited: async () => rateLimitState.limited,
  getIP: async () => "203.0.113.7",
}))

// --- real imports, after mocks ---
import { captureBblEmail } from "~/server/web/bbl/capture-email"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "session-0411-capture-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

const cleanup = async () => {
  await db.bblEmailCapture.deleteMany({ where: { email: { startsWith: TAG_PREFIX } } })
}

beforeEach(async () => {
  sendEmailMock.mockClear()
  rateLimitState.limited = false
  await cleanup()
})

afterAll(async () => {
  await cleanup()
  await db.$disconnect()
})

describe("captureBblEmail", () => {
  it("persists a capture row to the BBL brand", async () => {
    const email = `${tag("new")}@test.local`

    const result = await captureBblEmail({ email, name: "Test Persona" })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.email).toBe(email)

    const row = await db.bblEmailCapture.findUnique({ where: { email } })
    expect(row).not.toBeNull()
    expect(row?.name).toBe("Test Persona")
    expect(row?.brand).toBe(requestBrand)
    expect(row?.source).toBe("teaser")
  })

  it("normalizes the email to lowercase and trims it", async () => {
    const raw = `  ${tag("MixedCase")}@TEST.LOCAL  `
    const normalized = `${tag("mixedcase")}@test.local`

    const result = await captureBblEmail({ email: raw })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.email).toBe(normalized)
    expect(await db.bblEmailCapture.findUnique({ where: { email: normalized } })).not.toBeNull()
  })

  it("dedupes on email — a re-submit keeps ONE row and updates the name", async () => {
    const email = `${tag("dupe")}@test.local`

    const first = await captureBblEmail({ email, name: "First Name" })
    expect(first?.serverError).toBeUndefined()
    const firstId = first?.data?.id

    const second = await captureBblEmail({ email, name: "Updated Name" })
    expect(second?.serverError).toBeUndefined()

    // Same row (upsert, not insert) — id is stable, no unique-constraint error.
    expect(second?.data?.id).toBe(firstId)
    expect(await db.bblEmailCapture.count({ where: { email } })).toBe(1)
    const row = await db.bblEmailCapture.findUnique({ where: { email } })
    expect(row?.name).toBe("Updated Name")
  })

  it("succeeds with no name (name is optional)", async () => {
    const email = `${tag("noname")}@test.local`

    const result = await captureBblEmail({ email })

    expect(result?.serverError).toBeUndefined()
    const row = await db.bblEmailCapture.findUnique({ where: { email } })
    expect(row).not.toBeNull()
    expect(row?.name).toBeNull()
  })

  it("rejects an invalid email via the Zod schema (no row written)", async () => {
    const result = await captureBblEmail({ email: "not-an-email" })

    expect(result?.validationErrors).toBeDefined()
    expect(result?.data).toBeUndefined()
  })

  it("rejects when rate-limited — no row written, no email sent", async () => {
    rateLimitState.limited = true
    const email = `${tag("limited")}@test.local`

    const result = await captureBblEmail({ email })

    expect(result?.serverError).toBeDefined()
    expect(result?.data).toBeUndefined()
    expect(await db.bblEmailCapture.findUnique({ where: { email } })).toBeNull()
    expect(sendEmailMock).not.toHaveBeenCalled()
  })
})
