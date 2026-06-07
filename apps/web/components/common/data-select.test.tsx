// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { buildSelectItems, DataSelect, dataSelectRowContent } from "./data-select"

const OPTIONS = [
  { value: "ckcuid_bjj_0001", label: "Brazilian Jiu-Jitsu" },
  { value: "ckcuid_judo_0002", label: "Judo" },
]

// A rich row: a belt-color swatch ReactNode + the string label (SESSION_0355).
const SWATCH = <span data-testid="belt-swatch">🟫</span>
const RICH_OPTIONS = [
  {
    value: "rank_black",
    label: "Black Belt",
    content: <span data-testid="row">{SWATCH} Black Belt</span>,
  },
  { value: "rank_white", label: "White Belt" },
]

describe("buildSelectItems", () => {
  it("maps each option value to its label", () => {
    expect(buildSelectItems(OPTIONS)).toEqual({
      ckcuid_bjj_0001: "Brazilian Jiu-Jitsu",
      ckcuid_judo_0002: "Judo",
    })
  })
})

describe("DataSelect (WL-P1-7)", () => {
  it("renders the preset value's LABEL in the trigger, not the raw id", () => {
    const html = renderToStaticMarkup(
      <DataSelect defaultValue="ckcuid_bjj_0001" options={OPTIONS} placeholder="Pick discipline" />,
    )

    // The whole point: the VISIBLE trigger value shows the label, not the cuid.
    expect(html).toContain('data-slot="select-value">Brazilian Jiu-Jitsu</span>')
    // The raw id is allowed ONLY in the hidden form input (forms submit the id),
    // never as the visible select-value text.
    expect(html).not.toContain('data-slot="select-value">ckcuid_bjj_0001')
  })

  it("falls back to the placeholder when no value is preset", () => {
    const html = renderToStaticMarkup(
      <DataSelect options={OPTIONS} placeholder="Pick discipline" />,
    )

    expect(html).toContain("Pick discipline")
  })
})

describe("DataSelect rich content (SESSION_0355)", () => {
  it("renders the ReactNode content in the dropdown row when provided", () => {
    // The popup is portaled, so it never reaches the SSR markup — assert the
    // row-content rule directly (the half that proves the row shows the ReactNode).
    expect(dataSelectRowContent(RICH_OPTIONS[0])).toBe(RICH_OPTIONS[0].content)
  })

  it("falls back to the string label for rows without content", () => {
    expect(dataSelectRowContent(RICH_OPTIONS[1])).toBe("White Belt")
  })

  it("keeps the items map (trigger/typeahead) string-only even when an option has ReactNode content", () => {
    // Rich content must never pollute the value→label map Base UI uses for the
    // collapsed trigger and typeahead.
    expect(buildSelectItems(RICH_OPTIONS)).toEqual({
      rank_black: "Black Belt",
      rank_white: "White Belt",
    })
  })

  it("shows the string label in the trigger for a content-bearing selected value (content never leaks to the trigger)", () => {
    const html = renderToStaticMarkup(
      <DataSelect defaultValue="rank_black" options={RICH_OPTIONS} placeholder="Pick rank" />,
    )

    // Trigger shows the plain string label...
    expect(html).toContain('data-slot="select-value">Black Belt</span>')
    // ...and the rich row's ReactNode never appears in the collapsed trigger.
    expect(html).not.toContain('data-testid="belt-swatch"')
  })
})
