/**
 * Certificate issuance oRPC procedures — authz + behavior + cache-contract integration test
 * (WL-P2-43, SESSION_0697; mirrors `server/lineage/storyboard-router.integration.test.ts`).
 *
 * Carries forward the FI-022 wiring regression of the retired
 * `server/admin/certificates/issuance-actions.safe-action.test.ts` against the migrated
 * `certificates` router, invoked through the live oRPC pipeline (`createRouterClient` with
 * an injected session context, `source: "rsc"` → rate-limit skipped):
 *
 *   1. ADVERSARIAL AUTHZ — an anonymous caller gets UNAUTHORIZED and a plain signed-in
 *      member gets FORBIDDEN on issue AND revoke (`meta.permission = "certificates.manage"`,
 *      deny-by-default), with no phantom issuance row.
 *   2. ISSUE (FI-022) — the issuance row is keyed to User.id with a `CERT-` number and the
 *      32-hex QR verification code the public /certificates/verify/[code] page depends on;
 *      a date-only expiry (as the dialog's date input emits) round-trips; an unknown /
 *      non-BBL template is NOT_FOUND with no row.
 *   3. REVOKE — sets `revokedAt` on the issuance.
 *   4. CACHE CONTRACT (the WL-P2-43 point) — both mutations issue the LAYOUT-typed
 *      `/app/certificates` revalidation from INSIDE the procedure (the third revalidation
 *      idiom died with the safe-action seam bypass), and defer the tag revalidation into
 *      `after()` on the oRPC `context.revalidate` seam.
 *
 * Run: cd apps/web && bun run test server/orpc/routers/certificates.integration.test.ts
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"
import { createRouterClient, ORPCError } from "@orpc/server"

// The root app router joins the belt proposal core, whose transaction-only modules are marked
// `server-only`. Bun does not provide Next's poison-package shim in its test runtime.
mock.module("server-only", () => ({}))

// Recording seams: layout-typed revalidation is the WL-P2-43 contract, so capture the
// (path, type) PAIR — a plain-path call must not satisfy a layout assertion.
const recordedPaths: Array<{ path: string; type: string | undefined }> = []
const recordedTags: string[] = []

mock.module("next/cache", () => ({
  revalidatePath: (path: string, type?: string) => {
    recordedPaths.push({ path, type })
  },
  updateTag: (tag: string) => {
    recordedTags.push(tag)
  },
  revalidateTag: (tag: string) => {
    recordedTags.push(tag)
  },
  cacheLife: () => {},
  cacheTag: () => {},
}))

// `after()` runs outside a request scope in bun tests — track + flush (the
// `lib/test/safe-action-env.ts` idiom) so the deferred tag revalidation is deterministic.
const afterTasks: Array<Promise<unknown>> = []
mock.module("next/server", () => ({
  after: (fn: () => void | Promise<void>) => {
    afterTasks.push(Promise.resolve().then(() => fn()))
  },
}))

const flushAfter = async () => {
  while (afterTasks.length) {
    const pending = afterTasks.splice(0)
    await Promise.allSettled(pending)
  }
}

// The ANONYMOUS case must reach the permission gate as a real null user: without
// this seam `withSession` falls through to the live `getServerSession()`, whose
// `headers()` call explodes outside a request scope.
mock.module("~/lib/auth", () => ({
  getServerSession: async () => null,
  auth: {},
}))

import { Brand } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const { appRouter } = await import("~/server/router")

const TS = Date.now()
const TAG_PREFIX = "certificates-router-test-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

type SessionUser = { id: string; role: string | null } | null

/** Invoke the certificates router as a given session (rsc source → no rate limit). */
const asUser = (user: SessionUser) =>
  createRouterClient(appRouter, {
    context: { user: user as never, source: "rsc" as const, brand: Brand.BBL },
  }).certificates

let recipientUserId = ""
let templateId = ""

beforeAll(async () => {
  const [recipient, template] = await Promise.all([
    db.user.create({
      data: { name: tag("recipient"), email: `${tag("recipient")}@test.local` },
      select: { id: true },
    }),
    db.certificateTemplate.create({
      data: { brand: "BBL", name: tag("template"), type: "BELT_RANK" },
      select: { id: true },
    }),
  ])
  recipientUserId = recipient.id
  templateId = template.id
})

afterAll(async () => {
  if (templateId) {
    await db.certificateIssuance.deleteMany({ where: { certificateTemplateId: templateId } })
    await db.certificateTemplate.deleteMany({ where: { id: templateId } })
  }
  await db.user.deleteMany({ where: { email: { startsWith: TAG_PREFIX } } })
  // Zombie sweep for crashed prior runs (tag-scoped).
  await db.certificateTemplate.deleteMany({ where: { name: { startsWith: TAG_PREFIX } } })
})

beforeEach(() => {
  recordedPaths.length = 0
  recordedTags.length = 0
  afterTasks.length = 0
})

// No DB row needed for the actor: the permission gate is role-based (`can()`), and neither
// procedure writes an actor-keyed row (mirrors the storyboard test's injected admin).
const anonymous = () => asUser(null)
const member = () => asUser({ id: "certificates-test-member", role: "user" })
const admin = () => asUser({ id: "certificates-test-admin", role: "admin" })

const expectCode = async (
  promise: Promise<unknown>,
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST",
) => {
  try {
    await promise
    throw new Error(`expected the call to reject with ${code}`)
  } catch (error) {
    expect(error).toBeInstanceOf(ORPCError)
    expect((error as ORPCError<string, unknown>).code).toBe(code)
  }
}

/** The WL-P2-43 contract: the procedure issued the LAYOUT-typed /app/certificates revalidation. */
const expectCertificatesLayoutRevalidated = () => {
  expect(recordedPaths).toContainEqual({ path: "/app/certificates", type: "layout" })
}

// ---------------------------------------------------------------------------
// 1. ADVERSARIAL AUTHZ FIRST — deny-by-default on both mutations.
// ---------------------------------------------------------------------------

describe("certificates authz — the GAINER's adversarial cases first", () => {
  it("DENIES both mutations for an ANONYMOUS caller (UNAUTHORIZED)", async () => {
    await expectCode(
      anonymous().issue({ certificateTemplateId: templateId, userId: recipientUserId }),
      "UNAUTHORIZED",
    )
    await expectCode(anonymous().revoke({ id: "any-issuance-id" }), "UNAUTHORIZED")
  })

  it("DENIES both mutations for a plain MEMBER (FORBIDDEN — certificates.manage gate), with no phantom row", async () => {
    await expectCode(
      member().issue({ certificateTemplateId: templateId, userId: recipientUserId }),
      "FORBIDDEN",
    )
    await expectCode(member().revoke({ id: "any-issuance-id" }), "FORBIDDEN")

    const leaked = await db.certificateIssuance.findFirst({
      where: { certificateTemplateId: templateId },
    })
    expect(leaked).toBeNull()
    expect(recordedPaths).toHaveLength(0)
    expect(recordedTags).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// 2. Issue — the FI-022 wiring regression, now through the oRPC pipeline.
// ---------------------------------------------------------------------------

describe("certificates.issue", () => {
  it("rejects an unknown template with NOT_FOUND and writes no row", async () => {
    await expectCode(
      admin().issue({ certificateTemplateId: "no-such-template", userId: recipientUserId }),
      "NOT_FOUND",
    )
    expect(recordedPaths).toHaveLength(0)
  })

  it("creates an issuance row keyed to User.id with a QR verification code, layout-revalidates + tags", async () => {
    const result = await admin().issue({
      certificateTemplateId: templateId,
      userId: recipientUserId,
      // Date-only string, as the dialog's date input emits.
      expiresAt: "2030-01-01",
    })

    const issuance = await db.certificateIssuance.findUniqueOrThrow({
      where: { id: result.id },
      select: {
        certificateNumber: true,
        qrVerificationCode: true,
        userId: true,
        certificateTemplateId: true,
        expiresAt: true,
        revokedAt: true,
      },
    })

    expect(issuance.userId).toBe(recipientUserId)
    expect(issuance.certificateTemplateId).toBe(templateId)
    expect(issuance.certificateNumber).toStartWith("CERT-")
    // 16 random bytes hex-encoded — the code the public verify page looks up.
    expect(issuance.qrVerificationCode).toMatch(/^[0-9a-f]{32}$/)
    expect(issuance.expiresAt?.toISOString().slice(0, 10)).toBe("2030-01-01")
    expect(issuance.revokedAt).toBeNull()

    // The layout-typed subtree revalidation happens IN-HANDLER (before the response);
    // the tag revalidation is deferred into after() on the oRPC seam.
    expectCertificatesLayoutRevalidated()
    await flushAfter()
    expect(recordedTags).toContain("certificates")
    expect(recordedTags).toContain(`certificate-${templateId}`)
  })
})

// ---------------------------------------------------------------------------
// 3. Revoke — flips revokedAt, same cache contract.
// ---------------------------------------------------------------------------

describe("certificates.revoke", () => {
  it("sets revokedAt on the issuance, layout-revalidates + tags", async () => {
    const seeded = await db.certificateIssuance.create({
      data: {
        certificateNumber: `CERT-${tag("revoke")}`,
        qrVerificationCode: tag("qr-revoke"),
        certificateTemplateId: templateId,
        userId: recipientUserId,
      },
      select: { id: true },
    })

    const result = await admin().revoke({ id: seeded.id })
    expect(result.revokedAt).not.toBeNull()

    const row = await db.certificateIssuance.findUniqueOrThrow({
      where: { id: seeded.id },
      select: { revokedAt: true },
    })
    expect(row.revokedAt).not.toBeNull()

    expectCertificatesLayoutRevalidated()
    await flushAfter()
    expect(recordedTags).toContain("certificates")
    expect(recordedTags).toContain(`certificate-issuance-${seeded.id}`)
  })
})
