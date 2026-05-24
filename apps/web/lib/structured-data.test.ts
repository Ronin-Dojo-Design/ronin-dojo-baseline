// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  generateCollectionPageWithGenericItems,
  generateCollectionPageWithItems,
  generateGenericItemList,
  generateItemList,
} from "~/lib/structured-data"

type CollectionSchemaForTest = {
  hasPart?: ReadonlyArray<{ "@type": string }>
}

type ItemListSchemaForTest = {
  itemListElement?: ReadonlyArray<{ item: { "@type": string } }>
}

describe("structured data listing helpers", () => {
  it("keeps collection SoftwareApplication schema explicit for tool listings", () => {
    const schema = generateCollectionPageWithItems("/tools", "Tools", null, [
      { name: "Tool", url: "/tool" },
    ]) as unknown as CollectionSchemaForTest

    expect(schema.hasPart?.[0]?.["@type"]).toBe("SoftwareApplication")
  })

  it("supports generic collection item schema for non-tool listings", () => {
    const schema = generateCollectionPageWithGenericItems(
      "/lineage",
      "Lineage Trees",
      null,
      [{ name: "Tree", url: "/lineage/tree" }],
      "CreativeWork",
    ) as unknown as CollectionSchemaForTest

    expect(schema.hasPart?.[0]?.["@type"]).toBe("CreativeWork")
  })

  it("keeps ItemList SoftwareApplication schema explicit for tool listings", () => {
    const schema = generateItemList([
      { name: "Tool", url: "/tool" },
    ]) as unknown as ItemListSchemaForTest

    expect(schema.itemListElement?.[0]?.item["@type"]).toBe("SoftwareApplication")
  })

  it("supports generic ItemList item schema for non-tool listings", () => {
    const schema = generateGenericItemList(
      [{ name: "Course", url: "/courses/course" }],
      "Courses",
      "Course",
    ) as unknown as ItemListSchemaForTest

    expect(schema.itemListElement?.[0]?.item["@type"]).toBe("Course")
  })
})
