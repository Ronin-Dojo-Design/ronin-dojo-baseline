/**
 * SESSION_0499 — `mediaUrl` schema pin (pure zod, no DB).
 *
 * Run: cd apps/web && bun run test server/lineage/storyboard-schemas.test.ts
 *
 * The founder seeds store ROOT-RELATIVE hero paths (`/brand/…`); a bare
 * `z.string().url()` rejected them → every save of a seeded scene 400'd
 * ("Invalid URL" — live prod bug surfaced by the 0499 fallow loop). The fix
 * accepts absolute URLs OR root-relative paths, and must NOT accept
 * protocol-relative (`//host`) smuggling.
 */

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep.
import { describe, expect, it } from "bun:test"
import { sceneFields } from "~/server/lineage/storyboard-schemas"

const heroOk = (value: string) => sceneFields.safeParse({ heroImageUrl: value }).success

describe("sceneFields media URLs — absolute or root-relative (SESSION_0499)", () => {
  it("accepts absolute URLs", () => {
    expect(heroOk("https://media.blackbeltlegacy.com/lineage/story-scenes/abc.webp")).toBe(true)
  })

  it("accepts root-relative paths (the founder-seed shape)", () => {
    expect(heroOk("/brand/blackbeltlegacy/carlos-gracie-sr.jpg")).toBe(true)
  })

  it("rejects protocol-relative //host smuggling", () => {
    expect(heroOk("//evil.example.com/x.jpg")).toBe(false)
  })

  it("rejects non-URL garbage", () => {
    expect(heroOk("not a url")).toBe(false)
    expect(heroOk("javascript:alert(1)")).toBe(false)
  })

  it("null clears; undefined keeps (belt-router idiom untouched)", () => {
    expect(sceneFields.safeParse({ heroImageUrl: null }).success).toBe(true)
    expect(sceneFields.safeParse({}).success).toBe(true)
  })
})
