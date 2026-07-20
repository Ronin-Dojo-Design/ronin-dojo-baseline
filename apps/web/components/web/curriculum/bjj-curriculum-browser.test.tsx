// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"
import type { BjjCurriculumLevelView } from "~/server/web/curriculum/queries"
import { BjjCurriculumBrowser } from "./bjj-curriculum-browser"

const makeLevel = (overrides: Partial<BjjCurriculumLevelView> = {}): BjjCurriculumLevelView => ({
  id: "level_1",
  title: "BJJ Level 1",
  slug: "bjj-level-1",
  description: null,
  rank: { name: "White Belt", shortName: "White", colorHex: "#e5e7eb" },
  items: [],
  ...overrides,
})

describe("BjjCurriculumBrowser", () => {
  test("renders the item grid when the default (all-topics) level has items", () => {
    const html = renderToStaticMarkup(
      <BjjCurriculumBrowser
        levels={[
          makeLevel({
            items: [
              {
                id: "item_1",
                order: 1,
                title: "Closed Guard Retention",
                description: "",
                section: "",
                category: "Guard",
                access: "public",
                isRequired: false,
                keyPoints: [],
                techniqueLinks: [],
              },
            ],
          }),
        ]}
      />,
    )

    expect(html).toContain("Closed Guard Retention")
    expect(html).not.toContain("No items in")
  })

  // AUD2-7: a level with genuinely zero published items previously left a silent, blank grid —
  // the same defect class as the graph's D3 (SESSION_0583). This is the ONE branch reachable
  // without simulating a topic-button click (this repo's component tests use
  // `renderToStaticMarkup`, not an interactive DOM harness — see `registration-notice.test.tsx`
  // for the established pattern); the topic-narrows-to-zero branch is the same ternary,
  // typechecked and code-reviewed, verified live in the browser via the graph's identical D3
  // pattern.
  test("shows an EmptyList message (no reset link) when the selected level has no items at all", () => {
    const html = renderToStaticMarkup(<BjjCurriculumBrowser levels={[makeLevel({ items: [] })]} />)

    expect(html).toContain("No items in Level 1 yet.")
    expect(html).not.toContain("Show all topics")
  })

  test("renders the empty-level fallback when there are no levels at all", () => {
    const html = renderToStaticMarkup(<BjjCurriculumBrowser levels={[]} />)

    expect(html).toContain("No BJJ curriculum has been published yet.")
  })
})
