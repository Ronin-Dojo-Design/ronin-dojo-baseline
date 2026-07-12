// @ts-expect-error - bun:test is a Bun runtime module
import { describe, expect, it, mock } from "bun:test"

mock.module("~/lib/media", () => ({
  uploadToS3Storage: async () => "https://s3.example.com/media/abc.png?v=1",
  getS3KeyFromUrl: () => "media/abc.png",
  removeS3File: async () => ({}),
}))

import {
  applyPassportAvatarPromotion,
  applyWebMediaPremium,
  applyWebMediaRemoval,
  applyWebMediaReorder,
  applyWebMediaUpload,
  applyWebMediaUrlAttach,
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
  /**
   * techniqueId → owning orgId (legacy string form: canonical row, author null) OR the full
   * ownership pair (SESSION_0529 Slice 3B author-path tests).
   */
  techniques?: Record<
    string,
    string | { organizationId: string | null; authorPassportId: string | null }
  >
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
    attachmentUpdates: [] as any[],
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
        const entry = state.techniques?.[where.id]
        if (!entry) return null
        // Legacy string form = canonical org row (author null); object form = explicit pair.
        return typeof entry === "string" ? { organizationId: entry, authorPassportId: null } : entry
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
        // The technique author path looks the CALLER's passport up by userId (SESSION_0529 3B);
        // the passport-target path looks the owner up by passport id.
        if (where.userId !== undefined) {
          const entry = Object.entries(state.passports ?? {}).find(
            ([, userId]) => userId === where.userId,
          )
          return entry ? { id: entry[0] } : null
        }
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
      findMany: async ({ where }: any) =>
        attachments.filter(row => {
          if (where.id?.in && !where.id.in.includes(row.id)) return false
          for (const key of FK_KEYS) {
            if (where[key] !== undefined) return row[key] === where[key]
          }
          return true
        }),
      delete: async ({ where }: any) => {
        const index = attachments.findIndex(row => row.id === where.id)
        if (index >= 0) attachments.splice(index, 1)
        return { id: where.id }
      },
      count: async ({ where }: any) =>
        attachments.filter(row => row.mediaId === where.mediaId).length,
      update: async ({ where, data }: any) => {
        const row = attachments.find(r => r.id === where.id)
        if (row) Object.assign(row, data)
        created.attachmentUpdates.push({ where, data })
        return { id: where.id, ...data }
      },
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

describe("technique media authorization — author path (SESSION_0529 Slice 3B, ADR 0046 D2)", () => {
  it("authorizes the AUTHOR of a profile-only (org-null) technique", async () => {
    const { db } = makeDb({
      techniques: { "tech-authored": { organizationId: null, authorPassportId: "pass-self" } },
      passports: { "pass-self": editorUser.id },
    })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "technique", id: "tech-authored" },
    })
    expect(ok).toBe(true)
  })

  it("authorizes the AUTHOR of an org-GROUPED authored technique even when they are not org staff", async () => {
    const { db } = makeDb({
      techniques: { "tech-authored": { organizationId: "org-1", authorPassportId: "pass-self" } },
      authorizedOrgIds: [], // NOT staff of org-1 — the org is a soft grouping, the author owns it
      passports: { "pass-self": editorUser.id },
    })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "technique", id: "tech-authored" },
    })
    expect(ok).toBe(true)
  })

  it("rejects a NON-author (their passport is not the author's)", async () => {
    const { db } = makeDb({
      techniques: {
        "tech-authored": { organizationId: null, authorPassportId: "pass-someone-else" },
      },
      passports: { "pass-self": editorUser.id },
    })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "technique", id: "tech-authored" },
    })
    expect(ok).toBe(false)
  })

  it("fails CLOSED for a genuinely unowned row (null org AND null author)", async () => {
    const { db } = makeDb({
      techniques: { "tech-orphan": { organizationId: null, authorPassportId: null } },
      passports: { "pass-self": editorUser.id },
    })
    const ok = await authorizeMediaTarget({
      db,
      brand,
      user: editorUser,
      target: { kind: "technique", id: "tech-orphan" },
    })
    expect(ok).toBe(false)
  })
})

describe("technique R2 file-upload capability gate (SESSION_0529 review fix, Doug P2-1)", () => {
  const authoredTechniqueState = () => ({
    techniques: {
      "tech-authored": { organizationId: null, authorPassportId: "pass-self" } as const,
    },
    passports: { "pass-self": editorUser.id },
  })

  it("rejects a technique FILE upload from an author WITHOUT the upload capability", async () => {
    const { db, created } = makeDb(authoredTechniqueState())

    await expectRejectsWithMessage(
      applyWebMediaUpload({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "technique", id: "tech-authored" },
          file: imageFile(),
          isPublic: true,
        },
        allowVideo: true,
        // The action resolved `canUploadMediaForUser` → false for a plain Elite author.
        fileUploadCapability: false,
      }),
      WEB_MEDIA_ERROR.FILE_UPLOAD_CAPABILITY_REQUIRED,
    )
    expect(created.media).toHaveLength(0)
    expect(created.attachments).toHaveLength(0)
  })

  it("allows a technique FILE upload WITH the capability (staff / grants / admin)", async () => {
    const { db, created } = makeDb(authoredTechniqueState())

    const result = await applyWebMediaUpload({
      db,
      brand,
      user: editorUser,
      input: {
        target: { kind: "technique", id: "tech-authored" },
        file: imageFile(),
        isPublic: true,
      },
      allowVideo: true,
      fileUploadCapability: true,
    })

    expect(result.mediaId).toBe("media-created")
    expect(created.attachments[0]).toMatchObject({ techniqueId: "tech-authored" })
  })

  it("does NOT gate non-technique targets on the flag (avatars / belt-journey unaffected)", async () => {
    const { db, created } = makeDb({ authorizedOrgIds: ["org-1"] })

    const result = await applyWebMediaUpload({
      db,
      brand,
      user: editorUser,
      input: { target: { kind: "organization", id: "org-1" }, file: imageFile(), isPublic: true },
      // capability omitted → default false; must not affect an organization target.
    })

    expect(result.mediaId).toBe("media-created")
    expect(created.attachments[0]).toMatchObject({ organizationId: "org-1" })
  })

  it("the author's URL-paste path stays OPEN without the file-upload capability", async () => {
    const { db, created } = makeDb(authoredTechniqueState())

    const result = await applyWebMediaUrlAttach({
      db,
      brand,
      user: editorUser,
      input: {
        target: { kind: "technique", id: "tech-authored" },
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    })

    expect(result.mediaId).toBe("media-created")
    expect(created.media[0]).toMatchObject({ type: "YOUTUBE" })
  })
})

describe("web media URL attach (SESSION_0529 Slice 3B — member video path, no R2)", () => {
  const YT_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  const YT_THUMB = "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"

  it("author attaches a YouTube url: Media { type YOUTUBE, derived poster, public } + attachment + audit", async () => {
    const { db, created } = makeDb({
      techniques: { "tech-authored": { organizationId: null, authorPassportId: "pass-self" } },
      passports: { "pass-self": editorUser.id },
    })

    const result = await applyWebMediaUrlAttach({
      db,
      brand,
      user: editorUser,
      input: { target: { kind: "technique", id: "tech-authored" }, url: YT_URL },
    })

    expect(result).toMatchObject({
      mediaId: "media-created",
      attachmentId: "attach-created",
      url: YT_URL,
      thumbnailUrl: YT_THUMB,
      isPublic: true,
    })
    expect(created.media[0]).toMatchObject({
      brand,
      type: "YOUTUBE",
      url: YT_URL,
      thumbnailUrl: YT_THUMB,
      isPublic: true,
    })
    expect(created.attachments[0]).toMatchObject({
      mediaId: "media-created",
      techniqueId: "tech-authored",
    })
    expect(created.audits[0]).toMatchObject({
      action: "media.attached",
      entityType: "Technique",
      entityId: "tech-authored",
      userId: editorUser.id,
    })
  })

  it("rejects a non-YouTube url (provider validation) and persists nothing", async () => {
    const { db, created } = makeDb({
      techniques: { "tech-authored": { organizationId: null, authorPassportId: "pass-self" } },
      passports: { "pass-self": editorUser.id },
    })

    await expectRejectsWithMessage(
      applyWebMediaUrlAttach({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "technique", id: "tech-authored" },
          url: "https://evil.example.com/video.mp4",
        },
      }),
      WEB_MEDIA_ERROR.VIDEO_URL_UNSUPPORTED,
    )
    expect(created.media).toHaveLength(0)
    expect(created.attachments).toHaveLength(0)
  })

  it("rejects an unauthorized caller server-side", async () => {
    const { db } = makeDb({
      techniques: {
        "tech-authored": { organizationId: null, authorPassportId: "pass-someone-else" },
      },
      passports: { "pass-self": editorUser.id },
    })

    await expectRejectsWithMessage(
      applyWebMediaUrlAttach({
        db,
        brand,
        user: editorUser,
        input: { target: { kind: "technique", id: "tech-authored" }, url: YT_URL },
      }),
      WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED,
    )
  })
})

describe("web media reorder (SESSION_0529 Slice 3B — dnd sequencing persistence)", () => {
  const authoredState = () => ({
    techniques: {
      "tech-authored": { organizationId: null, authorPassportId: "pass-self" } as const,
    },
    passports: { "pass-self": editorUser.id },
    attachments: [
      { id: "att-1", mediaId: "m1", techniqueId: "tech-authored", sortOrder: 0 },
      { id: "att-2", mediaId: "m2", techniqueId: "tech-authored", sortOrder: 1 },
      { id: "att-3", mediaId: "m3", techniqueId: "tech-authored", sortOrder: 2 },
    ],
  })

  it("persists the new order (sortOrder = array index) and audits it", async () => {
    const { db, created, attachments } = makeDb(authoredState())

    const result = await applyWebMediaReorder({
      db,
      brand,
      user: editorUser,
      input: {
        target: { kind: "technique", id: "tech-authored" },
        attachmentIds: ["att-3", "att-1", "att-2"],
      },
    })

    expect(result).toEqual({ reordered: true })
    const orderById = Object.fromEntries(attachments.map(row => [row.id, row.sortOrder]))
    expect(orderById).toEqual({ "att-3": 0, "att-1": 1, "att-2": 2 })
    expect(created.audits[0]).toMatchObject({
      action: "media.reordered",
      entityType: "Technique",
      after: { attachmentIds: ["att-3", "att-1", "att-2"] },
    })
  })

  it("rejects the whole batch when any id belongs to ANOTHER target (FK ownership guard)", async () => {
    const state = authoredState()
    state.attachments.push({
      id: "att-foreign",
      mediaId: "m4",
      techniqueId: "tech-OTHER",
      sortOrder: 0,
    })
    const { db, attachments } = makeDb(state)

    await expectRejectsWithMessage(
      applyWebMediaReorder({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "technique", id: "tech-authored" },
          attachmentIds: ["att-foreign", "att-1"],
        },
      }),
      WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND,
    )
    // Nothing was reordered.
    expect(attachments.find(row => row.id === "att-1")?.sortOrder).toBe(0)
  })

  it("rejects a PARTIAL subset (review fix P3 — must cover the target's FULL attachment set)", async () => {
    const { db, attachments } = makeDb(authoredState())

    await expectRejectsWithMessage(
      applyWebMediaReorder({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "technique", id: "tech-authored" },
          // 2 of the 3 owned attachments — a partial write would leave duplicate sort positions.
          attachmentIds: ["att-3", "att-1"],
        },
      }),
      WEB_MEDIA_ERROR.REORDER_SET_INCOMPLETE,
    )
    expect(attachments.find(row => row.id === "att-1")?.sortOrder).toBe(0)
    expect(attachments.find(row => row.id === "att-3")?.sortOrder).toBe(2)
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

  // Fail-closed default: image-only callers (avatar) omit `allowVideo`, so a spoofed
  // `image/*` carrying real video bytes is rejected at the sniff — before S3/DB writes —
  // and no stray VIDEO media/attachment ever persists.
  it("rejects spoofed video bytes on the default (image-only) path and persists nothing", async () => {
    const { db, created } = makeDb({ authorizedOrgIds: ["org-1"] })
    // Real MP4 `ftyp` (isom) magic bytes behind a lying `image/png` declaration.
    const spoofedVideo = new File(
      [
        new Uint8Array([
          0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02,
          0x00, 0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32, 0x61, 0x76, 0x63, 0x31, 0x6d, 0x70,
          0x34, 0x31,
        ]),
      ],
      "avatar.png",
      { type: "image/png" },
    )

    await expectRejectsWithMessage(
      applyWebMediaUpload({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "organization", id: "org-1" },
          file: spoofedVideo,
          isPublic: true,
        },
      }),
      "Upload a valid image file (SVG and non-image files are rejected).",
    )
    expect(created.media).toHaveLength(0)
    expect(created.attachments).toHaveLength(0)
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

describe("web media premium toggle (SESSION_0527 Slice 2)", () => {
  it("rejects an unauthorized (non-author) toggle", async () => {
    const { db } = makeDb({
      techniques: { "tech-1": "org-1" },
      authorizedOrgIds: [], // editor is not an author of org-1
      attachments: [
        { id: "attach-1", mediaId: "media-1", techniqueId: "tech-1", isPremium: false },
      ],
    })

    await expectRejectsWithMessage(
      applyWebMediaPremium({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "technique", id: "tech-1" },
          attachmentId: "attach-1",
          isPremium: true,
        },
      }),
      WEB_MEDIA_ERROR.UPLOAD_ACCESS_REQUIRED,
    )
  })

  it("rejects toggling an attachment that does not belong to the target", async () => {
    const { db } = makeDb({
      techniques: { "tech-1": "org-1" },
      authorizedOrgIds: ["org-1"],
      // attachment belongs to a DIFFERENT technique — the target-FK guard must reject it.
      attachments: [
        { id: "attach-1", mediaId: "media-1", techniqueId: "tech-OTHER", isPremium: false },
      ],
    })

    await expectRejectsWithMessage(
      applyWebMediaPremium({
        db,
        brand,
        user: editorUser,
        input: {
          target: { kind: "technique", id: "tech-1" },
          attachmentId: "attach-1",
          isPremium: true,
        },
      }),
      WEB_MEDIA_ERROR.ATTACHMENT_NOT_FOUND,
    )
  })

  it("flips isPremium and audits an authorized toggle", async () => {
    const { db, created, attachments } = makeDb({
      techniques: { "tech-1": "org-1" },
      authorizedOrgIds: ["org-1"],
      attachments: [
        { id: "attach-1", mediaId: "media-1", techniqueId: "tech-1", isPremium: false },
      ],
    })

    const result = await applyWebMediaPremium({
      db,
      brand,
      user: editorUser,
      input: {
        target: { kind: "technique", id: "tech-1" },
        attachmentId: "attach-1",
        isPremium: true,
      },
    })

    expect(result).toEqual({ attachmentId: "attach-1", isPremium: true })
    expect(attachments[0].isPremium).toBe(true)
    expect(created.audits[0]).toMatchObject({
      action: "media.premium.set",
      entityType: "Technique",
      after: { attachmentId: "attach-1", isPremium: true },
    })
  })
})
