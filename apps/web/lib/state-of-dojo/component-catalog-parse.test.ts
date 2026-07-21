// @ts-expect-error - bun:test is a Bun runtime module; @types/bun isn't a repo dep yet.
import { describe, expect, test } from "bun:test"
import {
  bucketComponentPhase,
  classifyCatalogKind,
  frontmatterListField,
  parseBrands,
  parseComponentSpecFile,
} from "./component-catalog-parse"

describe("frontmatterListField", () => {
  test("reads an inline bracket list", () => {
    const doc = "---\ntags: [admin, kanban, crm]\n---\n"
    expect(frontmatterListField(doc, "tags")).toEqual(["admin", "kanban", "crm"])
  })

  test("reads a block list, tolerating a blank separator line", () => {
    const doc = [
      "---",
      "wiring:",
      "",
      '  - "a.tsx — role"',
      '  - "b.tsx — role"',
      "tags: [x]",
      "---",
    ].join("\n")
    expect(frontmatterListField(doc, "wiring")).toEqual(["a.tsx — role", "b.tsx — role"])
  })

  test("reads a block list with no blank separator", () => {
    const doc = ["---", "tags:", "  - card", "  - m-card", "status: active", "---"].join("\n")
    expect(frontmatterListField(doc, "tags")).toEqual(["card", "m-card"])
  })

  test("missing key or empty value -> []", () => {
    const doc = "---\nstatus: active\n---\n"
    expect(frontmatterListField(doc, "tags")).toEqual([])
    expect(frontmatterListField("---\ntags:\n---\n", "tags")).toEqual([])
  })
})

describe("bucketComponentPhase", () => {
  test("maps each lifecycle word to its belt", () => {
    expect(bucketComponentPhase("PLANNED")).toBe("planned")
    expect(bucketComponentPhase("WIP")).toBe("in-flight")
    expect(bucketComponentPhase("MVP_LIVE")).toBe("held")
    expect(bucketComponentPhase("STABLE")).toBe("done")
    expect(bucketComponentPhase("DEPRECATED")).toBe("done")
  })

  test("missing or unrecognized lifecycle defaults to planned", () => {
    expect(bucketComponentPhase(undefined)).toBe("planned")
    expect(bucketComponentPhase("active")).toBe("planned")
  })

  test("case-insensitive", () => {
    expect(bucketComponentPhase("wip")).toBe("in-flight")
  })
})

describe("parseBrands", () => {
  test("parses comma and slash separated tokens", () => {
    expect(parseBrands("rdd, bbl")).toEqual(["rdd", "bbl"])
    expect(parseBrands("bbl/mmb")).toEqual(["bbl", "mmb"])
  })

  test("drops unrecognized tokens", () => {
    expect(parseBrands("bbl, tuffbuffs")).toEqual(["bbl"])
  })

  test("absent or all-unrecognized -> rdd umbrella default", () => {
    expect(parseBrands(undefined)).toEqual(["rdd"])
    expect(parseBrands("tuffbuffs")).toEqual(["rdd"])
  })
})

describe("classifyCatalogKind", () => {
  test("a card-ish tag classifies as card", () => {
    expect(classifyCatalogKind(["card", "roster"])).toBe("card")
    expect(classifyCatalogKind(["m-card", "drawer"])).toBe("card")
    expect(classifyCatalogKind(["directory", "card-grid"])).toBe("card")
  })

  test("no card tag classifies as component", () => {
    expect(classifyCatalogKind(["admin", "kanban", "pipeline"])).toBe("component")
    expect(classifyCatalogKind([])).toBe("component")
  })
})

describe("parseComponentSpecFile", () => {
  test("returns null for README/template filenames", () => {
    expect(parseComponentSpecFile("docs/knowledge/wiki/files/README.md", "---\n---\n")).toBeNull()
    expect(
      parseComponentSpecFile("docs/knowledge/wiki/files/_template/SPEC_TEMPLATE.md", "---\n---\n"),
    ).toBeNull()
  })

  test("parses a full spec: slug/title/status/lifecycle/pwcc/brands/wiring/kind", () => {
    const content = [
      "---",
      'title: "m-card (roster / rank / task / loop card)"',
      "slug: m-card-pattern",
      "type: file",
      "status: active",
      "lifecycle: WIP",
      "pwcc: PWCC-002",
      "brands: rdd, bbl",
      "wiring:",
      "",
      '  - "apps/web/components/common/card.tsx — L1 base primitive"',
      '  - "apps/web/app/styles.css — token surface"',
      "tags: [card, m-card, roster, dto, spec, flow, ui]",
      "---",
      "",
      "# m-card",
    ].join("\n")
    const row = parseComponentSpecFile("docs/knowledge/wiki/files/m-card-pattern.md", content)
    expect(row).toEqual({
      slug: "m-card-pattern",
      title: "m-card (roster / rank / task / loop card)",
      status: "active",
      lifecycle: "WIP",
      phase: "in-flight",
      deprecated: false,
      pwcc: "PWCC-002",
      brands: ["rdd", "bbl"],
      wiringCount: 2,
      kind: "card",
      bugs: [],
      path: "docs/knowledge/wiki/files/m-card-pattern.md",
    })
  })

  test("a spec with no lifecycle/pwcc/brands/wiring falls back honestly", () => {
    const content = [
      "---",
      'title: "directory/page.tsx"',
      "slug: directory-page",
      "type: file",
      "status: active",
      "tags: [directory, page, s4]",
      "---",
    ].join("\n")
    const row = parseComponentSpecFile("docs/knowledge/wiki/files/directory-page.md", content)
    expect(row).toMatchObject({
      slug: "directory-page",
      lifecycle: undefined,
      phase: "planned",
      deprecated: false,
      pwcc: undefined,
      brands: ["rdd"],
      wiringCount: 0,
      kind: "component",
      bugs: [],
    })
  })

  test("DEPRECATED lifecycle buckets to done phase with the deprecated flag set", () => {
    const content = [
      "---",
      'title: "old-thing.tsx"',
      "slug: old-thing",
      "status: active",
      "lifecycle: DEPRECATED",
      "tags: [legacy]",
      "---",
    ].join("\n")
    const row = parseComponentSpecFile("docs/knowledge/wiki/files/old-thing.md", content)
    expect(row?.phase).toBe("done")
    expect(row?.deprecated).toBe(true)
  })

  test("missing slug falls back to the filename stem", () => {
    const content = ["---", 'title: "No Slug"', "status: active", "---"].join("\n")
    const row = parseComponentSpecFile("docs/knowledge/wiki/files/no-slug-here.md", content)
    expect(row?.slug).toBe("no-slug-here")
  })
})
