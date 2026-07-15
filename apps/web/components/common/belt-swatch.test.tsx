// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { BeltSwatch, beltBarTreatment } from "./belt-swatch"

/** Marks are the only rects rendered at the tape width — count them to assert grade marks. */
const markCount = (html: string) => html.split('width="2.9"').length - 1
/** Coral/red flush seams are the only rects at the seam width — count them (0 or 2). */
const seamCount = (html: string) => html.split('width="0.8"').length - 1

describe("BeltSwatch (SESSION_0355 / SESSION_0539)", () => {
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

describe("beltBarTreatment (bar design constants — the ONE home)", () => {
  it("COLORED → black bar, no outline", () => {
    expect(beltBarTreatment("COLORED")).toEqual({ barColor: "#111111", outline: false })
  })
  it("BLACK → red bar, no outline", () => {
    expect(beltBarTreatment("BLACK")).toEqual({ barColor: "#C1121F", outline: false })
  })
  it("CORAL → red bar + seam treatment", () => {
    expect(beltBarTreatment("CORAL")).toEqual({ barColor: "#C1121F", outline: true })
  })
  it("RED → red bar + seam treatment", () => {
    expect(beltBarTreatment("RED")).toEqual({ barColor: "#C1121F", outline: true })
  })
  it("null → neutral (type-safety fallback only; the belt variant never renders a null-family bar)", () => {
    expect(beltBarTreatment(null)).toEqual({ barColor: "#6B7280", outline: false })
  })
})

describe("BeltSwatch belt variant (SESSION_0539 operator-locked rank-bar)", () => {
  it("COLORED: 3/4-length black bar, no seams, marks = stripe degree; body colour from data", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#0000FF" beltFamily="COLORED" degree={3} />,
    )
    expect(html).toContain('fill="#0000FF"') // body colour = data (ADR 0022)
    expect(html).toContain('fill="#111111"') // black bar
    expect(html).toContain('width="46.5"') // short (3/4) bar
    expect(html).not.toContain('width="62"') // not the full-length bar
    expect(seamCount(html)).toBe(0) // no coral/red seams
    expect(markCount(html)).toBe(3)
    expect(html).not.toContain("style=")
  })

  it("COLORED base (degree 0): black bar, zero marks", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#FFFFFF" beltFamily="COLORED" degree={0} />,
    )
    expect(html).toContain('fill="#111111"')
    expect(markCount(html)).toBe(0)
  })

  it("BLACK: 3/4-length red bar, no seams, marks = degree", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#000000" beltFamily="BLACK" degree={5} />,
    )
    expect(html).toContain('fill="#C1121F"') // red bar
    expect(html).toContain('width="46.5"') // short bar
    expect(seamCount(html)).toBe(0)
    expect(markCount(html)).toBe(5)
  })

  it("CORAL: full-length red bar + 2 flush white seams + alternating panels + 7 marks", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch
        variant="belt"
        colorHex="#FF0000"
        secondaryColorHex="#000000"
        beltFamily="CORAL"
        degree={7}
      />,
    )
    expect(html).toContain('fill="#C1121F"') // red bar
    expect(html).toContain('width="62"') // full-length bar
    expect(html).toContain('fill="#000000"') // second-colour panels
    expect(seamCount(html)).toBe(2) // flush left + right seams (not a boxed outline)
    expect(html).not.toContain('stroke="#FFFFFF"') // no boxed-in outline — seams are fills
    expect(markCount(html)).toBe(7)
  })

  it("RED: full-length red bar + 2 flush seams, solid body (no panels), 9 marks", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#FF0000" beltFamily="RED" degree={9} />,
    )
    expect(html).toContain('fill="#C1121F"')
    expect(html).toContain('width="62"')
    expect(seamCount(html)).toBe(2)
    expect(html).not.toContain('stroke="#FFFFFF"')
    expect(markCount(html)).toBe(9)
  })

  it("caps marks at 10 (a 10th-degree red belt reads legibly, not a barcode)", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#FF0000" beltFamily="RED" degree={10} />,
    )
    expect(markCount(html)).toBe(10)
  })

  it("null beltFamily (non-BJJ / unseeded) → belt-colour body ONLY: no bar, no marks, no seams", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#8B4513" beltFamily={null} degree={null} />,
    )
    expect(html).toContain('fill="#8B4513"') // belt-colour body from data
    expect(html).not.toContain('fill="#6B7280"') // the neutral "silver bar" must NOT render
    expect(html).not.toContain('fill="#111111"') // no black bar
    expect(html).not.toContain('fill="#C1121F"') // no red bar
    expect(markCount(html)).toBe(0)
    expect(seamCount(html)).toBe(0)
    expect(html).not.toContain("style=")
  })

  it("null colorHex on the belt variant still degrades to currentColor + text-muted", () => {
    const html = renderToStaticMarkup(<BeltSwatch variant="belt" colorHex={null} />)
    expect(html).toContain('fill="currentColor"')
    expect(html).toContain("text-muted")
    expect(html).not.toContain("style=")
  })

  it("uses the operator-locked 148x20 viewBox; marks are full belt height (edge to edge)", () => {
    const html = renderToStaticMarkup(
      <BeltSwatch variant="belt" colorHex="#000000" beltFamily="BLACK" degree={2} />,
    )
    expect(html).toContain('viewBox="0 0 148 20"')
    // Full-height tape: marks share the body height (18) at y=1, not a vertical inset.
    expect(html).toContain('width="2.9"')
    expect(html).toContain('height="18"')
  })

  it("size presets set WIDTH only and let height auto-follow (no fighting h-*)", () => {
    const sm = renderToStaticMarkup(<BeltSwatch variant="belt" colorHex="#000000" size="sm" />)
    const md = renderToStaticMarkup(<BeltSwatch variant="belt" colorHex="#000000" />)
    const lg = renderToStaticMarkup(<BeltSwatch variant="belt" colorHex="#000000" size="lg" />)
    const full = renderToStaticMarkup(<BeltSwatch variant="belt" colorHex="#000000" size="full" />)
    expect(sm).toContain("w-28")
    expect(md).toContain("w-36") // default
    expect(lg).toContain("w-48")
    expect(full).toContain("w-full")
    // height governed by the aspect, never a hard-coded h-4/h-2 that would letterbox.
    expect(md).toContain("h-auto")
    expect(md).not.toContain("h-3")
  })
})
