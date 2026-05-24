// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })

import { MediaType } from "~/.generated/prisma/client"
import { db } from "~/services/db"

const TEST_BRAND = "BASELINE_MARTIAL_ARTS" as const
const PREFIX = `session-0227-content-${Date.now()}`

let adminUserId = ""

const createAtom = async (suffix: string) => {
  return db.contentAtom.create({
    data: {
      id: `${PREFIX}-atom-${suffix}`,
      canonicalId: `${PREFIX}-canonical-${suffix}`,
      title: `Session 0227 Atom ${suffix}`,
      slug: `${PREFIX}-atom-${suffix}`,
      status: "APPROVED",
      createdById: adminUserId,
      variants: {
        create: {
          brand: TEST_BRAND,
          channel: "BLOG",
          status: "DRAFT",
          publicTitle: `Session 0227 Variant ${suffix}`,
          publicSlug: `${PREFIX}-variant-${suffix}`,
        },
      },
    },
  })
}

const createAttachment = async ({
  atomId,
  suffix,
  sortOrder,
}: {
  atomId: string
  suffix: string
  sortOrder: number
}) => {
  const media = await db.media.create({
    data: {
      id: `${PREFIX}-media-${suffix}`,
      brand: TEST_BRAND,
      type: MediaType.IMAGE,
      url: `https://session-0227.test/${PREFIX}-${suffix}.jpg`,
      uploadedById: adminUserId,
    },
  })

  return db.mediaAttachment.create({
    data: {
      id: `${PREFIX}-attachment-${suffix}`,
      contentAtomId: atomId,
      mediaId: media.id,
      sortOrder,
    },
  })
}

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      id: `${PREFIX}-admin`,
      name: "Session 0227 Admin",
      email: `${PREFIX}-admin@test.local`,
      role: "admin",
    },
  })

  adminUserId = admin.id
})

beforeEach(() => {
  setTestSession({ id: adminUserId, role: "admin" })
})

afterAll(async () => {
  await db.mediaAttachment.deleteMany({
    where: {
      OR: [{ id: { startsWith: PREFIX } }, { media: { is: { uploadedById: adminUserId } } }],
    },
  })
  await db.media.deleteMany({
    where: {
      OR: [{ id: { startsWith: PREFIX } }, { uploadedById: adminUserId }],
    },
  })
  await db.contentAtom.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: adminUserId } })
})

describe("admin content media actions", () => {
  it("reorders a content atom's media attachments", async () => {
    const atom = await createAtom("reorder")
    const first = await createAttachment({ atomId: atom.id, suffix: "reorder-1", sortOrder: 0 })
    const second = await createAttachment({ atomId: atom.id, suffix: "reorder-2", sortOrder: 1 })
    const third = await createAttachment({ atomId: atom.id, suffix: "reorder-3", sortOrder: 2 })

    const { reorderContentAtomMediaAttachments } = await import("~/server/admin/content/actions")

    const result = await reorderContentAtomMediaAttachments({
      atomId: atom.id,
      attachmentIds: [third.id, first.id, second.id],
    })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data).toBe(true)

    const attachments = await db.mediaAttachment.findMany({
      where: { contentAtomId: atom.id },
      select: { id: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    })

    expect(attachments).toEqual([
      { id: third.id, sortOrder: 0 },
      { id: first.id, sortOrder: 1 },
      { id: second.id, sortOrder: 2 },
    ])
  })

  it("rejects duplicate attachment ids", async () => {
    const atom = await createAtom("duplicate")
    const first = await createAttachment({ atomId: atom.id, suffix: "duplicate-1", sortOrder: 0 })
    const second = await createAttachment({ atomId: atom.id, suffix: "duplicate-2", sortOrder: 1 })

    const { reorderContentAtomMediaAttachments } = await import("~/server/admin/content/actions")

    const result = await reorderContentAtomMediaAttachments({
      atomId: atom.id,
      attachmentIds: [first.id, first.id, second.id],
    })

    expect(String(result?.serverError)).toContain("duplicate")
  })

  it("rejects foreign attachment ids", async () => {
    const atom = await createAtom("foreign")
    const otherAtom = await createAtom("foreign-other")
    const first = await createAttachment({ atomId: atom.id, suffix: "foreign-1", sortOrder: 0 })
    const foreign = await createAttachment({
      atomId: otherAtom.id,
      suffix: "foreign-other-1",
      sortOrder: 0,
    })

    const { reorderContentAtomMediaAttachments } = await import("~/server/admin/content/actions")

    const result = await reorderContentAtomMediaAttachments({
      atomId: atom.id,
      attachmentIds: [first.id, foreign.id],
    })

    expect(String(result?.serverError)).toContain("invalid attachment")
  })

  it("appends uploaded media after the current max sort order", async () => {
    const atom = await createAtom("append")
    await createAttachment({ atomId: atom.id, suffix: "append-1", sortOrder: 5 })

    const { attachMediaToAtom } = await import("~/server/admin/content/actions")
    const url = `https://session-0227.test/${PREFIX}-uploaded.jpg`

    const result = await attachMediaToAtom({ atomId: atom.id, url })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.sortOrder).toBe(6)

    const attachment = await db.mediaAttachment.findFirst({
      where: { contentAtomId: atom.id, media: { is: { url } } },
      select: { sortOrder: true },
    })

    expect(attachment?.sortOrder).toBe(6)
  })
})
