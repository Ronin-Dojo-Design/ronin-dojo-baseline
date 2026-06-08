// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { BeltSwatch } from "./belt-swatch"

describe("BeltSwatch (SESSION_0355)", () => {
  it("applies the Rank.colorHex as a data-driven SVG fill (not an inline style)", () => {
    const html = renderToStaticMarkup(<BeltSwatch colorHex="#CFB87C" />)
    expect(html).toContain('fill="#CFB87C"')
    // Brand-safe rule: colour comes from data via `fill`, never a hardcoded
    // `style={{ ... }}` attribute.
    expect(html).not.toContain("style=")
  })

  it("falls back to a neutral muted dot when a rank has no colorHex", () => {
    const html = renderToStaticMarkup(<BeltSwatch colorHex={null} />)
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain("text-muted")
    expect(html).not.toContain("style=")
  })
})
