// @ts-expect-error - bun:test is a Bun runtime module
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test"

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

// Single-brand collapse (brand-prune Stage 1): the admin content query inlines the BBL
// literal, so the round-trip fixture variant must be on BBL to be reachable.
installSafeActionMocks({ brand: "BBL" })

import { findContentAtomById } from "~/server/admin/content/queries"
import { db } from "~/services/db"

const TEST_BRAND = "BBL" as const
const PREFIX = `session-0230-roundtrip-${Date.now()}`

let adminUserId = ""

beforeAll(async () => {
  const admin = await db.user.create({
    data: {
      id: `${PREFIX}-admin`,
      name: "Session 0230 Admin",
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
  await db.contentVariant.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.contentAtom.deleteMany({ where: { id: { startsWith: PREFIX } } })
  await db.user.deleteMany({ where: { id: adminUserId } })
})

describe("ContentVariant edit-save round-trip", () => {
  it("load → save unchanged → reload preserves all editable variant fields", async () => {
    // Create an atom with a fully-populated variant
    const original = {
      renderedCopy: "<p>This is the rendered copy for round-trip test.</p>",
      excerpt: "Short excerpt for testing round-trip fidelity.",
      cta: "Read More →",
      thumbnailUrl: "https://session-0230.test/thumb.jpg",
      videoUrl: "https://session-0230.test/video.mp4",
      voiceNotes: "Speaker notes for this variant.",
    }

    await db.contentAtom.create({
      data: {
        id: `${PREFIX}-atom-rt`,
        canonicalId: `${PREFIX}-canonical-rt`,
        title: "Round Trip Atom",
        slug: `${PREFIX}-atom-rt`,
        status: "APPROVED",
        createdById: adminUserId,
        variants: {
          create: {
            id: `${PREFIX}-variant-rt`,
            brand: TEST_BRAND,
            channel: "BLOG",
            status: "DRAFT",
            publicTitle: "Round Trip Variant",
            publicSlug: `${PREFIX}-variant-rt`,
            ...original,
          },
        },
      },
    })

    // Step 1: Load via the admin query (this is what the edit page does)
    const loaded = await findContentAtomById(`${PREFIX}-atom-rt`)
    expect(loaded).not.toBeNull()
    const variant = loaded!.variants.find(v => v.id === `${PREFIX}-variant-rt`)
    expect(variant).toBeDefined()

    // Step 2: Save unchanged via upsertContentVariant
    const { upsertContentVariant } = await import("~/server/admin/content/actions")
    const result = await upsertContentVariant({
      id: variant!.id,
      atomId: loaded!.id,
      channel: variant!.channel,
      status: variant!.status,
      publicTitle: variant!.publicTitle,
      publicSlug: variant!.publicSlug,
      renderedCopy: variant!.renderedCopy,
      excerpt: variant!.excerpt,
      cta: variant!.cta,
      thumbnailUrl: variant!.thumbnailUrl,
      videoUrl: variant!.videoUrl,
      voiceNotes: variant!.voiceNotes,
      publishDate: variant!.publishDate,
    })

    expect(result?.serverError).toBeUndefined()

    // Step 3: Reload and verify all 6 fields round-tripped
    const reloaded = await findContentAtomById(`${PREFIX}-atom-rt`)
    const reloadedVariant = reloaded!.variants.find(v => v.id === `${PREFIX}-variant-rt`)

    expect(reloadedVariant?.renderedCopy).toBe(original.renderedCopy)
    expect(reloadedVariant?.excerpt).toBe(original.excerpt)
    expect(reloadedVariant?.cta).toBe(original.cta)
    expect(reloadedVariant?.thumbnailUrl).toBe(original.thumbnailUrl)
    expect(reloadedVariant?.videoUrl).toBe(original.videoUrl)
    expect(reloadedVariant?.voiceNotes).toBe(original.voiceNotes)
  })
})
