// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it, mock } from "bun:test"

mock.module("~/lib/media", () => ({
  uploadToS3Storage: async () => "https://s3.example.com/media/abc.png?v=1",
  getS3KeyFromUrl: () => "media/abc.png",
  removeS3File: async () => ({}),
}))

import {
  applyPassportAvatarPromotion,
  applyWebMediaRemoval,
  applyWebMediaUpload,
} from "~/server/web/media/apply-media"
import { authorizeMediaTarget } from "~/server/web/media/media-authorization"
import { WEB_MEDIA_ERROR } from "~/server/web/media/media-errors"
import {
  promotePassportAvatarMediaSchema,
  uploadWebMediaSchema,
  webMediaFileSchema,
} from "~/server/web/media/media-schemas"

const brand = "BASELINE_MARTIAL_ARTS" as const
const editorUser = { id: "user-editor", role: "user" }

type FakeState = {
  authorizedOrgIds?: string[]
  techniques?: Record<string, string>
  courses?: Record<string, string>
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
  const created = {
    media: [] as any[],
    attachments: [] as any[],
    audits: [] as any[],
    mediaUpdates: [] as any[],
    passportUpdates: [] as any[],
    passportUpdateMany: [] as any[],
  }

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
      findFirst: async ({ where }: any) => {
        const organizationId = state.courses?.[where.id]
        return organizationId ? { organizationId } : null
      },
    },
    passport: {
      findFirst: async ({ where }: any) => {
        const userId = state.passports?.[where.id]
        return userId ? { userId } : null
      },
      update: async ({ where, data }: any) => {
        created.passportUpdates.push({ where, data })
        return { id: where.id, ...data }
      },
      updateMany: async ({ where, data }: any) => {
        created.passportUpdateMany.push({ where, data })
        return { count: 1 }
      },
    },
    media: {
      create: async ({ data }: any) => {
        const row = { id: "media-created", ...data }
        created.media.push(row)
        return { id: row.id }
      },
      update: async ({ where, data }: any) => {
        created.mediaUpdates.push({ where, data })
        return { id: where.id, ...data }
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

// Real JPEG magic bytes (FF D8 FF E0) so the server-side `sniffUploadBuffer` guard
// (file-type) accepts it — the declared MIME is no longer trusted.
const imageFile = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "photo.jpg", { type: "image/jpeg" })

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

  it("authorizes a course via its owning organization", async () => {
    const { db } = makeDb({ authorizedOrgIds: ["org-1"], courses: { "course-1": "org-1" } })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "course", id: "course-1" },
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

describe("admin passport-avatar override (SESSION_0437_TASK_0A)", () => {
  const adminUser = { id: "user-admin", role: "admin" }
  const nonAdminUser = { id: "user-nobody", role: "user" }

  // A small fake that can represent BOTH owned and unowned (placeholder) passports —
  // the shared `makeDb` maps id → ownerId and cannot express `userId: null`.
  function makePassportDb(passports: Record<string, { userId: string | null }>) {
    return {
      organization: { findFirst: async () => null },
      passport: {
        findFirst: async ({ where }: any) => passports[where.id] ?? null,
      },
    } as any
  }

  it("non-admin still CANNOT set another (owned) passport's avatar, even with the flag set", async () => {
    const db = makePassportDb({ "pass-other": { userId: "someone-else" } })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: nonAdminUser,
      target: { kind: "passport", id: "pass-other" },
      allowAdminOverride: true, // a forged flag must NOT help a non-admin
    })
    expect(ok).toBe(false)
  })

  it("non-admin still CANNOT set an unclaimed placeholder passport's avatar with the flag set", async () => {
    const db = makePassportDb({ "pass-placeholder": { userId: null } })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: nonAdminUser,
      target: { kind: "passport", id: "pass-placeholder" },
      allowAdminOverride: true,
    })
    expect(ok).toBe(false)
  })

  it("WITHOUT the flag, the self-service path is byte-for-byte unchanged for a placeholder (admin global line aside)", async () => {
    const db = makePassportDb({ "pass-placeholder": { userId: null } })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: nonAdminUser,
      target: { kind: "passport", id: "pass-placeholder" },
      // allowAdminOverride omitted → defaults false
    })
    expect(ok).toBe(false)
  })

  it("admin CAN set an unclaimed placeholder passport's avatar via the override path", async () => {
    const db = makePassportDb({ "pass-placeholder": { userId: null } })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: adminUser,
      target: { kind: "passport", id: "pass-placeholder" },
      allowAdminOverride: true,
    })
    expect(ok).toBe(true)
  })
})

describe("passport avatar promotion", () => {
  it("promotes a passport image attachment to avatarUrl and makes the media public", async () => {
    const { db, created } = makeDb({
      passports: { "pass-self": editorUser.id },
      attachments: [
        {
          id: "attach-1",
          mediaId: "media-1",
          passportId: "pass-self",
          media: {
            id: "media-1",
            url: "https://s3.example.com/media/avatar.png",
            type: "IMAGE",
          },
        },
      ],
    })

    const result = await applyPassportAvatarPromotion({
      db,
      brand,
      user: editorUser,
      input: {
        target: { kind: "passport", id: "pass-self" },
        attachmentId: "attach-1",
      },
    })

    expect(result.avatarUrl).toBe("https://s3.example.com/media/avatar.png")
    expect(created.mediaUpdates[0]).toMatchObject({
      where: { id: "media-1" },
      data: { isPublic: true },
    })
    expect(created.passportUpdates[0]).toMatchObject({
      where: { id: "pass-self" },
      data: { avatarUrl: "https://s3.example.com/media/avatar.png" },
    })
    expect(created.audits[0]).toMatchObject({
      action: "passport.avatar.promoted",
      entityType: "Passport",
      entityId: "pass-self",
      userId: "user-editor",
    })
  })

  it("rejects non-image passport attachments", async () => {
    const { db } = makeDb({
      passports: { "pass-self": editorUser.id },
      attachments: [
        {
          id: "attach-video",
          mediaId: "media-video",
          passportId: "pass-self",
          media: {
            id: "media-video",
            url: "https://s3.example.com/media/video.mp4",
            type: "VIDEO",
          },
        },
      ],
    })

    await expectRejectsWithMessage(
      applyPassportAvatarPromotion({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "passport", id: "pass-self" },
          attachmentId: "attach-video",
        },
      }),
      WEB_MEDIA_ERROR.AVATAR_IMAGE_REQUIRED,
    )
  })

  it("rejects non-passport targets at the schema boundary", async () => {
    const parsed = promotePassportAvatarMediaSchema.safeParse({
      target: { kind: "organization", id: "org-1" },
      attachmentId: "attach-1",
    })

    expect(parsed.success).toBe(false)
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

  it("clears passport avatarUrl when removing the current avatar attachment", async () => {
    const { db, created } = makeDb({
      passports: { "pass-self": editorUser.id },
      attachments: [
        {
          id: "attach-avatar",
          mediaId: "media-avatar",
          passportId: "pass-self",
          media: { url: "https://s3.example.com/media/avatar.png" },
        },
      ],
    })

    await applyWebMediaRemoval({
      db,
      brand,
      user: editorUser,
      input: { target: { kind: "passport", id: "pass-self" }, attachmentId: "attach-avatar" },
    })

    expect(created.passportUpdateMany[0]).toMatchObject({
      where: { id: "pass-self", avatarUrl: "https://s3.example.com/media/avatar.png" },
      data: { avatarUrl: null },
    })
  })
})
