// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import { buildSelectItems, DataSelect } from "./data-select"

const OPTIONS = [
  { value: "ckcuid_bjj_0001", label: "Brazilian Jiu-Jitsu" },
  { value: "ckcuid_judo_0002", label: "Judo" },
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
