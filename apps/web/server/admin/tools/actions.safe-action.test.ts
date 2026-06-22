// @ts-expect-error — bun:test is a Bun runtime module
import { afterAll, beforeAll, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import { ToolStatus, ToolTier } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const PREFIX = `session-0207-tools-${Date.now()}`

let adminUserId = ""
let toolId = ""

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      id: `${PREFIX}-admin`,
      name: "Session 0207 Admin",
      email: `${PREFIX}-admin@test.local`,
      role: "admin",
    },
  })

  const tool = await db.tool.create({
    data: {
      id: `${PREFIX}-tool`,
      name: "Session 0207 Listing",
      slug: `${PREFIX}-listing`,
      websiteUrl: "https://session-0207-listing.test",
      status: ToolStatus.Published,
      publishedAt: new Date(),
      tier: ToolTier.Free,
      isFeatured: false,
    },
  })

  adminUserId = admin.id
  toolId = tool.id
})

afterAll(async () => {
  await db.auditLog.deleteMany({
    where: {
      OR: [{ entityId: toolId }, { userId: adminUserId }],
    },
  })
  await db.tool.deleteMany({ where: { id: toolId } })
  await db.user.deleteMany({ where: { id: adminUserId } })
})

describe("admin tool actions", () => {
  it("writes a TIER_TRANSITION audit row when an admin changes listing tier", async () => {
    const { upsertTool } = await import("~/server/admin/tools/actions")

    setTestSession({ id: adminUserId, role: "admin" })

    const result = await upsertTool({
      id: toolId,
      name: "Session 0207 Listing",
      slug: `${PREFIX}-listing`,
      websiteUrl: "https://session-0207-listing.test",
      affiliateUrl: "",
      tagline: "",
      description: "",
      content: "",
      faviconUrl: "",
      screenshotUrl: "",
      isFeatured: false,
      tier: ToolTier.Premium,
      status: ToolStatus.Published,
      publishedAt: new Date(),
      categories: [],
      tags: [],
      notifySubmitter: false,
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.tier).toBe(ToolTier.Premium)
    expect(result?.data?.isFeatured).toBe(true)

    await new Promise(resolve => setTimeout(resolve, 0))

    const audit = await db.auditLog.findFirst({
      where: {
        brand: TEST_BRAND,
        action: "TIER_TRANSITION",
        entityType: "Tool",
        entityId: toolId,
        userId: adminUserId,
      },
      orderBy: { createdAt: "desc" },
    })

    expect(audit?.before).toEqual({ tier: ToolTier.Free })
    expect(audit?.after).toEqual({ tier: ToolTier.Premium })
  })
})
