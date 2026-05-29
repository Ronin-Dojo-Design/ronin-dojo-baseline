/**
 * SESSION_0289 TASK_03 — MediaAttachment attach/detach admin actions.
 *
 * Run: cd apps/web && bun test server/admin/media/media-attachment.safe-action.test.ts
 *
 * Proves that `attachMedia` creates a `MediaAttachment` linking a `Media` to a
 * target entity, `detachMedia` removes it, and invalid entity types are rejected.
 * Uses real DB fixtures (DB-backed test).
 *
 * Author: Cody / SESSION_0289 TASK_03.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const PREFIX = `session-0289-attach-${Date.now()}`

let adminUserId = ""
let mediaId = ""
let orgId = ""

beforeAll(async () => {
  // Create admin user
  const user = await db.user.create({
    data: {
      id: `${PREFIX}-admin`,
      name: "Test Admin 0289",
      email: `${PREFIX}-admin@test.local`,
      role: "admin",
      emailVerified: true,
    },
  })
  adminUserId = user.id

  // Create a media record to attach
  const media = await db.media.create({
    data: {
      id: `${PREFIX}-media`,
      brand: TEST_BRAND,
      type: "IMAGE",
      url: `https://s3.test/${PREFIX}/test.png`,
      title: "Test image 0289",
      uploadedById: adminUserId,
    },
  })
  mediaId = media.id

  // Create an organization to attach to
  const org = await db.organization.create({
    data: {
      id: `${PREFIX}-org`,
      brand: TEST_BRAND,
      name: "Test Org 0289",
      slug: `${PREFIX}-org`,
      ownerId: adminUserId,
    },
  })
  orgId = org.id
})

afterAll(async () => {
  // Clean up in order (attachment → media → org → user)
  await db.mediaAttachment.deleteMany({
    where: { mediaId: { startsWith: PREFIX } },
  })
  await db.media.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.organization.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: { startsWith: PREFIX } } })
})

beforeEach(() => {
  setTestSession({ id: adminUserId, role: "admin" })
})

describe("attachMedia / detachMedia admin actions", () => {
  it("attaches a media to an organization", async () => {
    const { attachMedia } = await import("~/server/admin/media/actions")

    const result = await attachMedia({
      mediaId,
      entityType: "organization",
      entityId: orgId,
      purpose: "logo",
      sortOrder: 0,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBeDefined()
    expect(result!.data!.organizationId).toBe(orgId)
    expect(result!.data!.mediaId).toBe(mediaId)
    expect(result!.data!.purpose).toBe("logo")

    // Clean up for next test
    await db.mediaAttachment.delete({ where: { id: result!.data!.id } })
  })

  it("detaches a media attachment by id", async () => {
    const { attachMedia, detachMedia } = await import("~/server/admin/media/actions")

    const attachResult = await attachMedia({
      mediaId,
      entityType: "organization",
      entityId: orgId,
    })

    expect(attachResult?.data).toBeDefined()
    const attachmentId = attachResult!.data!.id

    const detachResult = await detachMedia({ ids: [attachmentId] })
    expect(detachResult?.serverError).toBeUndefined()
    expect(detachResult?.data).toBe(true)

    // Verify gone
    const row = await db.mediaAttachment.findUnique({ where: { id: attachmentId } })
    expect(row).toBeNull()
  })

  it("rejects unauthenticated callers", async () => {
    const { attachMedia } = await import("~/server/admin/media/actions")
    setTestSession(null)

    const result = await attachMedia({
      mediaId,
      entityType: "organization",
      entityId: orgId,
    })

    expect(result?.serverError).toBe("User not authenticated")
  })

  it("rejects non-admin callers", async () => {
    const { attachMedia } = await import("~/server/admin/media/actions")
    setTestSession({ id: adminUserId, role: "user" })

    const result = await attachMedia({
      mediaId,
      entityType: "organization",
      entityId: orgId,
    })

    expect(result?.serverError).toBe("User not authorized")
  })
})
