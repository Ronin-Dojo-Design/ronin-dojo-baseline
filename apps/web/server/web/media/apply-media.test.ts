// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it, mock } from "bun:test"

mock.module("~/lib/media", () => ({
  uploadToS3Storage: async () => "https://s3.example.com/media/abc.png?v=1",
  getS3KeyFromUrl: () => "media/abc.png",
  removeS3File: async () => ({}),
}))

import { applyWebMediaRemoval, applyWebMediaUpload } from "~/server/web/media/apply-media"
import { authorizeMediaTarget } from "~/server/web/media/media-authorization"
import { WEB_MEDIA_ERROR } from "~/server/web/media/media-errors"
import { uploadWebMediaSchema, webMediaFileSchema } from "~/server/web/media/media-schemas"

const brand = "BASELINE_MARTIAL_ARTS" as const
const editorUser = { id: "user-editor", role: "user" }

type FakeState = {
  authorizedOrgIds?: string[]
  techniques?: Record<string, string>
  passports?: Record<string, string>
  attachments?: Array<Record<string, unknown>>
}

const FK_KEYS = [
  "promotionEventId",
  "techniqueId",
  "organizationId",
  "courseId",
  "passportId",
] as const

function makeDb(state: FakeState = {}) {
  const attachments = state.attachments ?? []
  const created = { media: [] as any[], attachments: [] as any[], audits: [] as any[] }

  const db: any = {
    $transaction: async (callback: (tx: any) => Promise<unknown>) => callback(db),
    organization: {
      findFirst: async ({ where }: any) => {
        // isOrgAuthor passes a concrete org id; the passport-owner-org admin path
        // does not (and is left unauthorized in these tests).
        if (where.id) {
          return (state.authorizedOrgIds ?? []).includes(where.id) ? { id: where.id } : null
        }
        return null
      },
    },
    technique: {
      findFirst: async ({ where }: any) => {
        const organizationId = state.techniques?.[where.id]
        return organizationId ? { organizationId } : null
      },
    },
    course: {
      findFirst: async () => null,
    },
    passport: {
      findFirst: async ({ where }: any) => {
        const userId = state.passports?.[where.id]
        return userId ? { userId } : null
      },
    },
    media: {
      create: async ({ data }: any) => {
        const row = { id: "media-created", ...data }
        created.media.push(row)
        return { id: row.id }
      },
      delete: async ({ where }: any) => ({ id: where.id }),
    },
    mediaAttachment: {
      create: async ({ data }: any) => {
        const row = { id: "attach-created", ...data }
        created.attachments.push(row)
        return { id: row.id }
      },
      findFirst: async ({ where }: any) =>
        attachments.find(row => {
          if (row.id !== where.id) return false
          for (const key of FK_KEYS) {
            if (where[key] !== undefined) return row[key] === where[key]
          }
          return true
        }) ?? null,
      delete: async ({ where }: any) => {
        const index = attachments.findIndex(row => row.id === where.id)
        if (index >= 0) attachments.splice(index, 1)
        return { id: where.id }
      },
      count: async ({ where }: any) =>
        attachments.filter(row => row.mediaId === where.mediaId).length,
    },
    auditLog: {
      create: async ({ data }: any) => {
        created.audits.push(data)
        return data
      },
    },
  }

  return { db, created, attachments }
}

const imageFile = () => new File([new Uint8Array([1, 2, 3, 4])], "photo.png", { type: "image/png" })

const expectRejectsWithMessage = async (promise: Promise<unknown>, message: string) => {
  try {
    await promise
    throw new Error("Expected promise to reject")
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe(message)
  }
}

describe("web media authorization", () => {
  it("authorizes an org author for an organization target", async () => {
    const { db } = makeDb({ authorizedOrgIds: ["org-1"] })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "organization", id: "org-1" },
    })
    expect(ok).toBe(true)
  })

  it("rejects a non-author for an organization target", async () => {
    const { db } = makeDb({ authorizedOrgIds: [] })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "organization", id: "org-1" },
    })
    expect(ok).toBe(false)
  })

  it("authorizes a technique via its owning organization", async () => {
    const { db } = makeDb({ authorizedOrgIds: ["org-1"], techniques: { "tech-1": "org-1" } })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "technique", id: "tech-1" },
    })
    expect(ok).toBe(true)
  })

  it("authorizes a passport for its own owner but not another user", async () => {
    const { db } = makeDb({
      passports: { "pass-self": editorUser.id, "pass-other": "someone-else" },
    })
    const self = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "passport", id: "pass-self" },
    })
    const other = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "passport", id: "pass-other" },
    })
    expect(self).toBe(true)
    expect(other).toBe(false)
  })
})

describe("web media upload", () => {
  it("creates Media + MediaAttachment + audit for an authorized organization upload", async () => {
    const { db, created } = makeDb({ authorizedOrgIds: ["org-1"] })

    const result = await applyWebMediaUpload({
      db,
      brand,
      user: editorUser,
      input: {
        target: { kind: "organization", id: "org-1" },
        file: imageFile(),
        isPublic: true,
      },
    })

    expect(result.mediaId).toBe("media-created")
    expect(result.attachmentId).toBe("attach-created")
    expect(result.isPublic).toBe(true)
    expect(created.media[0]).toMatchObject({ brand, type: "IMAGE", isPublic: true })
    expect(created.attachments[0]).toMatchObject({
      mediaId: "media-created",
      organizationId: "org-1",
    })
    expect(created.audits[0]).toMatchObject({
      action: "media.attached",
      entityType: "Organization",
      entityId: "org-1",
      organizationId: "org-1",
      userId: "user-editor",
    })
  })

  it("rejects an unauthorized upload server-side", async () => {
    const { db } = makeDb({ authorizedOrgIds: [] })

    await expectRejectsWithMessage(
      applyWebMediaUpload({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "organization", id: "org-1" },
          file: imageFile(),
          isPublic: false,
        },
      }),
      WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED,
    )
  })

  it("rejects non-image/video files at the schema boundary", async () => {
    const textFile = new File([new Uint8Array([1])], "notes.txt", { type: "text/plain" })
    expect(webMediaFileSchema.safeParse(textFile).success).toBe(false)

    const ok = uploadWebMediaSchema.safeParse({
      target: { kind: "organization", id: "org-1" },
      file: imageFile(),
    })
    expect(ok.success).toBe(true)
  })
})

describe("web media removal", () => {
  it("rejects removing an attachment that does not belong to the target", async () => {
    const { db } = makeDb({
      authorizedOrgIds: ["org-2"],
      attachments: [
        { id: "attach-1", mediaId: "media-1", organizationId: "org-1", media: { url: "u" } },
      ],
    })

    await expectRejectsWithMessage(
      applyWebMediaRemoval({
        db,
        brand,
        user: editorUser,
        input: { target: { kind: "organization", id: "org-2" }, attachmentId: "attach-1" },
      }),
      WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND,
    )
  })

  it("detaches and audits an authorized removal", async () => {
    const { db, created, attachments } = makeDb({
      authorizedOrgIds: ["org-1"],
      attachments: [
        {
          id: "attach-1",
          mediaId: "media-1",
          organizationId: "org-1",
          media: { url: "https://s3.example.com/media/abc.png?v=1" },
        },
      ],
    })

    const result = await applyWebMediaRemoval({
      db,
      brand,
      user: editorUser,
      input: { target: { kind: "organization", id: "org-1" }, attachmentId: "attach-1" },
    })

    expect(result).toEqual({ removed: true })
    expect(attachments).toHaveLength(0)
    expect(created.audits[0]).toMatchObject({
      action: "media.detached",
      entityType: "Organization",
    })
  })
})
