// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test"
process.env.BETTER_AUTH_SECRET ??= "test-secret"
process.env.BETTER_AUTH_URL ??= "http://localhost:3000"
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3000"
process.env.NEXT_PUBLIC_SITE_EMAIL ??= "test@example.com"

describe("BBL email catalog", () => {
  it("uses the BBL sender brand for live-test invite payloads", async () => {
    const [{ Brand }, { createBblEmailPayload }] = await Promise.all([
      import("~/.generated/prisma/client"),
      import("~/server/admin/email/catalog"),
    ])

    const payload = createBblEmailPayload({
      templateKey: "bbl-live-test-invite",
      to: "tony@example.com",
      recipientName: "Tony",
      joinUrl: "https://blackbeltlegacy.com/lineage/join",
    })

    expect(payload.brand).toBe(Brand.BBL)
    expect(payload.subject).toBe("You're invited to test Black Belt Legacy")
  })

  it("keeps paid Join Legacy copy on lineage membership, not gated listings checkout", async () => {
    const { getBblEmailTemplatePreviews } = await import("~/server/admin/email/catalog")
    const previews = await getBblEmailTemplatePreviews()
    const joined = previews.map(preview => preview.body).join("\n")

    expect(joined).toContain("lineage membership")
    expect(joined).not.toContain("paid directory listing checkout")
    expect(joined).not.toContain("/submit/")
  })
})
