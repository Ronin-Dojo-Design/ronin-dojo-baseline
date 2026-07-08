// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { ColorField } from "./color-field"

const noop = () => {}

/**
 * SSR-render assertions (react-colorful's picker lives in a closed popover, so it isn't
 * mounted here). This guards the part most likely to silently regress: the injected
 * `id`/`aria-*` and `placeholder`/`value` must land on the TEXT input so the enclosing
 * `<FormLabel htmlFor>` association and the `getByLabel(...)` e2e selectors keep working.
 * `ref` forwarding and the picker-drag → triplet write are DOM-interaction concerns and
 * are covered by the brand-settings e2e / left as fast-follow (WL-P3-36), not here.
 */
describe("ColorField (WL-P2-36)", () => {
  it("forwards id / name / aria-* / placeholder / value onto the text input", () => {
    const html = renderToStaticMarkup(
      <ColorField
        value="234 98% 61%"
        onChange={noop}
        id="primaryColor"
        name="primaryColor"
        placeholder="e.g. 234 98% 61%"
        aria-describedby="primaryColor-description"
        aria-invalid
      />,
    )

    expect(html).toContain('id="primaryColor"')
    expect(html).toContain('name="primaryColor"')
    expect(html).toContain('placeholder="e.g. 234 98% 61%"')
    expect(html).toContain('aria-describedby="primaryColor-description"')
    expect(html).toContain('value="234 98% 61%"')
  })

  it("paints the swatch with the parsed color for a valid triplet (no checkerboard)", () => {
    const html = renderToStaticMarkup(<ColorField value="234 98% 61%" onChange={noop} />)

    // The swatch preview is a React inline-style object — serialized as a DOM style prop,
    // never raw CSS text, so it is not an injection vector.
    expect(html).toContain("hsl(234 98% 61%)")
    expect(html).not.toContain("bg-[length:8px_8px]")
  })

  it("shows the checkerboard 'no color' swatch for an empty / unparseable value", () => {
    for (const value of ["", "not-a-color", "234 98%"]) {
      const html = renderToStaticMarkup(<ColorField value={value} onChange={noop} />)
      expect(html).toContain("bg-[length:8px_8px]")
      expect(html).not.toContain("background-color:hsl(")
    }
  })

  it("disables the text input when disabled", () => {
    const html = renderToStaticMarkup(<ColorField value="" onChange={noop} disabled />)
    expect(html).toContain("disabled")
  })
})
