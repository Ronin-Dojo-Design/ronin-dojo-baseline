// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import {
  commitCustomText,
  CreatableCombobox,
  type CreatableOption,
  creatableTriggerLabel,
  EMPTY_CREATABLE_VALUE,
  filterOptions,
  optionMatchesText,
  selectRegisteredOption,
  shouldOfferCreate,
} from "./creatable-combobox"

const RANKS: CreatableOption[] = [
  { id: "rank_white", name: "White Belt" },
  { id: "rank_blue", name: "Blue Belt" },
  { id: "rank_black", name: "Black Belt" },
]

describe("selectRegisteredOption (pick a registered option)", () => {
  it("stores BOTH the ref id and the option name as the label", () => {
    expect(selectRegisteredOption(RANKS[2])).toEqual({ id: "rank_black", label: "Black Belt" })
  })
})

describe("commitCustomText (enter custom)", () => {
  it("clears the ref id and keeps the trimmed custom text", () => {
    expect(commitCustomText("  Coral Belt  ")).toEqual({ id: null, label: "Coral Belt" })
  })
})

describe("creatableTriggerLabel", () => {
  it("shows the chosen/typed label", () => {
    expect(creatableTriggerLabel({ id: "rank_blue", label: "Blue Belt" }, "Pick")).toBe("Blue Belt")
  })

  it("falls back to the placeholder when the label is empty/whitespace", () => {
    expect(creatableTriggerLabel(EMPTY_CREATABLE_VALUE, "Pick")).toBe("Pick")
    expect(creatableTriggerLabel({ id: null, label: "   " }, "Pick")).toBe("Pick")
  })
})

describe("optionMatchesText (case/whitespace-insensitive exact match)", () => {
  it("matches regardless of case and surrounding whitespace", () => {
    expect(optionMatchesText(RANKS[0], "  white belt ")).toBe(true)
  })

  it("does not treat a partial as an exact match", () => {
    expect(optionMatchesText(RANKS[0], "white")).toBe(false)
  })
})

describe("filterOptions", () => {
  it("returns all options for an empty search", () => {
    expect(filterOptions(RANKS, "  ")).toHaveLength(3)
  })

  it("substring-matches names case-insensitively", () => {
    expect(filterOptions(RANKS, "bl").map(o => o.id)).toEqual(["rank_blue", "rank_black"])
  })
})

describe("shouldOfferCreate", () => {
  it("offers create for a non-empty search with no EXACT match (even with partial matches)", () => {
    // "bl" partially matches Blue/Black but is not an exact name → still creatable.
    expect(shouldOfferCreate(RANKS, "bl", true)).toBe(true)
  })

  it("does NOT offer create when an exact (case-insensitive) option already exists", () => {
    expect(shouldOfferCreate(RANKS, "black belt", true)).toBe(false)
  })

  it("does NOT offer create for an empty search", () => {
    expect(shouldOfferCreate(RANKS, "   ", true)).toBe(false)
  })

  it("does NOT offer create when custom is disallowed", () => {
    expect(shouldOfferCreate(RANKS, "Coral Belt", false)).toBe(false)
  })
})

describe("CreatableCombobox SSR trigger (portaled popover excluded)", () => {
  it("renders the selected label in the collapsed trigger, not the raw id", () => {
    const html = renderToStaticMarkup(
      <CreatableCombobox
        options={RANKS}
        value={{ id: "rank_black", label: "Black Belt" }}
        onValueChange={() => {}}
        placeholder="Pick or type a rank"
      />,
    )

    expect(html).toContain("Black Belt")
    // The trigger must never surface the raw ref id.
    expect(html).not.toContain("rank_black")
  })

  it("renders a custom (ref-less) label in the trigger", () => {
    const html = renderToStaticMarkup(
      <CreatableCombobox
        options={RANKS}
        value={{ id: null, label: "Coral Belt" }}
        onValueChange={() => {}}
        placeholder="Pick or type a rank"
      />,
    )

    expect(html).toContain("Coral Belt")
  })

  it("falls back to the placeholder when empty", () => {
    const html = renderToStaticMarkup(
      <CreatableCombobox
        options={RANKS}
        value={EMPTY_CREATABLE_VALUE}
        onValueChange={() => {}}
        placeholder="Pick or type a rank"
      />,
    )

    expect(html).toContain("Pick or type a rank")
  })
})
