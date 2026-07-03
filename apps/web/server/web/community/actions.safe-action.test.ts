/**
 * bun test server/web/community/actions.safe-action.test.ts
 *
 * SESSION_0493 — community post write-surface gates (the adversarial GAINER tests):
 *   - create: requires auth; authorId comes from the SESSION (client-supplied authorId ignored);
 *     foreign imageUrl hosts rejected; unknown styles rejected; rate-limit trips before any write.
 *   - hide/unhide: admin ONLY — a plain member (the would-be gainer, incl. the post's own author)
 *     is rejected; admin toggles PUBLISHED↔HIDDEN.
 *   - image upload: requires auth; stores under the isolated `community-posts/` prefix.
 *
 * DB / S3 / brand-context are stubbed (the `media.safe-action.test.ts` precedent) — gate wiring is
 * the unit under test; query PUBLISHED-pinning is covered in `queries.guard.test.ts`.
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
  isProd: false,
}))

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

const { setRateLimited } = installSafeActionMocks({ brand: "BBL" })

// The harness's whole-module brand-context mock omits `resolveBrand` (single-brand collapse);
// the community actions call it, so re-mock with it present.
mock.module("~/lib/brand-context", () => ({
  resolveBrand: () => "BBL",
  getRequestOrigin: async () => "http://bbl.local:3000",
  resolveRequestOrigin: () => "http://bbl.local:3000",
}))

// Keep the entitlement seam (imported transitively via lib/safe-actions) off the real DB.
mock.module("~/server/web/entitlements/queries", () => ({
  canUploadMedia: async () => false,
  hasEntitlement: async () => false,
}))

const uploadCalls: { path: string }[] = []
mock.module("~/lib/media", () => ({
  uploadToS3Storage: async (_buffer: unknown, path: string) => {
    uploadCalls.push({ path })
    return `https://media.test/${path}.jpg`
  },
}))

// Own media bucket origin — `isAllowedCommunityImageUrl` compares against this.
mock.module("~/services/s3", () => ({
  getMediaConfig: () => ({
    client: {},
    bucket: "test-bucket",
    region: "auto",
    publicUrl: "https://media.test",
  }),
}))

// In-memory DB stub capturing writes.
type CreateArgs = { data: Record<string, unknown> }
type UpdateArgs = { where: Record<string, unknown>; data: Record<string, unknown> }
const dbState: {
  createCalls: CreateArgs[]
  updateCalls: UpdateArgs[]
  slugTaken: boolean
  styleExists: boolean
} = { createCalls: [], updateCalls: [], slugTaken: false, styleExists: true }

mock.module("~/services/db", () => ({
  db: {
    communityPost: {
      findUnique: async () => (dbState.slugTaken ? { slug: "taken" } : null),
      create: async (args: CreateArgs) => {
        dbState.createCalls.push(args)
        return { id: "post-1", slug: args.data.slug }
      },
      update: async (args: UpdateArgs) => {
        dbState.updateCalls.push(args)
        return { id: args.where.id, slug: "some-post", status: args.data.status }
      },
    },
    style: {
      findFirst: async () => (dbState.styleExists ? { id: "style-1" } : null),
    },
  },
}))

const MEMBER = { id: "member-1", role: "user" }
const ADMIN = { id: "admin-1", role: "admin" }

const validCreateInput = {
  type: "TECHNIQUE" as const,
  title: "Armbar from Closed Guard",
  content: "Control the wrist, climb the legs, cut the angle — finish with hips up.",
}

// Real JPEG magic bytes so `sniffUploadBuffer` accepts the payload.
const validImage = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "post.jpg", { type: "image/jpeg" })

beforeEach(() => {
  dbState.createCalls.length = 0
  dbState.updateCalls.length = 0
  dbState.slugTaken = false
  dbState.styleExists = true
  uploadCalls.length = 0
  setRateLimited(false)
  setTestSession(null)
})

describe("createCommunityPost — auth + authorship", () => {
  it("rejects when unauthenticated", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")

    const result = await createCommunityPost(validCreateInput)

    expect(result?.serverError).toBe("User not authenticated")
    expect(dbState.createCalls.length).toBe(0)
  })

  it("derives authorId from the SESSION — a client-supplied authorId is ignored (GAINER test)", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)

    const result = await createCommunityPost({
      ...validCreateInput,
      // Adversarial: attacker tries to attribute the post to someone else.
      authorId: "victim-user",
    } as never)

    expect(result?.serverError).toBeUndefined()
    expect(dbState.createCalls.length).toBe(1)
    expect(dbState.createCalls[0]?.data.authorId).toBe("member-1")
    expect(dbState.createCalls[0]?.data.brand).toBe("BBL")
    expect(dbState.createCalls[0]?.data.slug).toBe("armbar-from-closed-guard")
  })

  it("suffixes the slug when the base slug is taken (explicit slug — NOT uniqueSlugsExtension)", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)
    dbState.slugTaken = true

    const result = await createCommunityPost(validCreateInput)

    // Every candidate reads as taken, so generation exhausts and errors — proving the create
    // action, not the extension, owns slug uniqueness. (Single-collision suffixing is covered by
    // lib/slug's own generateUniqueSlug tests.)
    expect(result?.serverError).toContain("Failed to generate unique slug")
    expect(dbState.createCalls.length).toBe(0)
  })

  it("rejects an imageUrl outside OUR media bucket origin", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)

    const result = await createCommunityPost({
      ...validCreateInput,
      imageUrl: "https://evil.example.com/community-posts/fake.jpg",
    })

    expect(result?.serverError).toBe("Post images must be uploaded through the post form.")
    expect(dbState.createCalls.length).toBe(0)
  })

  it("accepts an imageUrl from our media bucket", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)

    const result = await createCommunityPost({
      ...validCreateInput,
      imageUrl: "https://media.test/community-posts/abc123.jpg",
    })

    expect(result?.serverError).toBeUndefined()
    expect(dbState.createCalls[0]?.data.imageUrl).toBe(
      "https://media.test/community-posts/abc123.jpg",
    )
  })

  it("rejects an unknown / unapproved style", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)
    dbState.styleExists = false

    const result = await createCommunityPost({ ...validCreateInput, styleId: "bogus-style" })

    expect(result?.serverError).toBe("Unknown style.")
    expect(dbState.createCalls.length).toBe(0)
  })

  it("blocks (before any write) when the community_post_write rate-limit trips", async () => {
    const { createCommunityPost } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)
    setRateLimited(true)

    const result = await createCommunityPost(validCreateInput)

    expect(result?.serverError).toBe("You're posting too fast. Please try again in a minute.")
    expect(dbState.createCalls.length).toBe(0)
  })
})

describe("setCommunityPostStatus — admin-only moderation (GAINER tests)", () => {
  it("rejects when unauthenticated", async () => {
    const { setCommunityPostStatus } = await import("~/server/web/community/actions")

    const result = await setCommunityPostStatus({ id: "post-1", hidden: true })

    expect(result?.serverError).toBe("User not authenticated")
    expect(dbState.updateCalls.length).toBe(0)
  })

  it("rejects a plain member — the post's own author CANNOT hide/unhide", async () => {
    const { setCommunityPostStatus } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)

    const result = await setCommunityPostStatus({ id: "post-1", hidden: true })

    expect(result?.serverError).toBe("User not authorized")
    expect(dbState.updateCalls.length).toBe(0)
  })

  it("lets an admin hide and unhide", async () => {
    const { setCommunityPostStatus } = await import("~/server/web/community/actions")
    setTestSession(ADMIN)

    const hide = await setCommunityPostStatus({ id: "post-1", hidden: true })
    expect(hide?.serverError).toBeUndefined()
    expect(dbState.updateCalls[0]?.data.status).toBe("HIDDEN")

    const unhide = await setCommunityPostStatus({ id: "post-1", hidden: false })
    expect(unhide?.serverError).toBeUndefined()
    expect(dbState.updateCalls[1]?.data.status).toBe("PUBLISHED")
  })
})

describe("uploadCommunityPostImage — member-safe upload gate", () => {
  it("rejects when unauthenticated", async () => {
    const { uploadCommunityPostImage } = await import("~/server/web/community/actions")

    const result = await uploadCommunityPostImage({ file: validImage() })

    expect(result?.serverError).toBe("User not authenticated")
    expect(uploadCalls.length).toBe(0)
  })

  it("rejects non-image files at the schema boundary", async () => {
    const { uploadCommunityPostImage } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)

    const textFile = new File([new Uint8Array([1])], "notes.txt", { type: "text/plain" })
    const result = await uploadCommunityPostImage({ file: textFile })

    expect(result?.validationErrors).toBeDefined()
    expect(uploadCalls.length).toBe(0)
  })

  it("blocks when the community_image_upload rate-limit trips", async () => {
    const { uploadCommunityPostImage } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)
    setRateLimited(true)

    const result = await uploadCommunityPostImage({ file: validImage() })

    expect(result?.serverError).toBe("Too many image uploads. Please try again in a bit.")
    expect(uploadCalls.length).toBe(0)
  })

  it("uploads a valid image for a signed-in member under the community-posts/ prefix", async () => {
    const { uploadCommunityPostImage } = await import("~/server/web/community/actions")
    setTestSession(MEMBER)

    const result = await uploadCommunityPostImage({ file: validImage() })

    expect(result?.serverError).toBeUndefined()
    expect(result?.data?.url).toStartWith("https://media.test/community-posts/")
    expect(uploadCalls.length).toBe(1)
    expect(uploadCalls[0]?.path).toStartWith("community-posts/")
  })
})
