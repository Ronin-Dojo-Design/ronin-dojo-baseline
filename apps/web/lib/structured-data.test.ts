// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import {
  generateCollectionPageWithGenericItems,
  generateCollectionPageWithItems,
  generateGenericItemList,
  generateItemList,
  generateSchemaReference,
} from "~/lib/structured-data"

type CollectionSchemaForTest = {
  "@id"?: string
  hasPart?: ReadonlyArray<{
    "@type": string
    "@id"?: string
    aggregateRating?: unknown
    provider?: { "@id": string; name?: string }
    about?: { "@id": string; name?: string }
    address?: {
      "@type": string
      addressLocality?: string
      addressRegion?: string
      addressCountry?: string
    }
  }>
  breadcrumb?: { "@id": string }
  isPartOf?: { "@id": string }
}

type ItemListSchemaForTest = {
  itemListElement?: ReadonlyArray<{
    item: {
      "@type": string
      "@id"?: string
      aggregateRating?: unknown
      provider?: { "@id": string; name?: string }
      about?: { "@id": string; name?: string }
    }
  }>
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

  it("adds factual page and entity relationships for generic collections", () => {
    const provider = generateSchemaReference(
      "Organization",
      "/organizations/baseline",
      "Baseline Martial Arts",
    )
    const about = generateSchemaReference("Thing", "/disciplines/bjj", "Brazilian Jiu-Jitsu")
    const schema = generateCollectionPageWithGenericItems(
      "/programs",
      "Programs",
      null,
      [
        {
          name: "BJJ Fundamentals",
          url: "/programs/program-1",
          id: "https://example.com/programs/program-1#program",
          provider,
          about,
        },
      ],
      "Course",
    ) as unknown as CollectionSchemaForTest

    expect(schema["@id"]?.endsWith("/programs#collection")).toBe(true)
    expect(schema.breadcrumb?.["@id"].endsWith("/programs#breadcrumb")).toBe(true)
    expect(schema.isPartOf?.["@id"]).toContain("#/schema/website/1")
    expect(schema.hasPart?.[0]?.["@id"]).toBe("https://example.com/programs/program-1#program")
    expect(schema.hasPart?.[0]?.provider?.name).toBe("Baseline Martial Arts")
    expect(schema.hasPart?.[0]?.about?.name).toBe("Brazilian Jiu-Jitsu")
  })

  it("supports factual address fields without adding empty postal addresses", () => {
    const schema = generateCollectionPageWithGenericItems(
      "/organizations",
      "Organizations",
      null,
      [
        {
          name: "Wolchek Academy",
          url: "/organizations/wolchek",
          address: {
            addressLocality: "Boulder",
            addressRegion: "CO",
            addressCountry: "US",
          },
        },
        {
          name: "No Address",
          url: "/organizations/no-address",
          address: {},
        },
      ],
      "Organization",
    ) as unknown as CollectionSchemaForTest

    expect(schema.hasPart?.[0]?.address?.["@type"]).toBe("PostalAddress")
    expect(schema.hasPart?.[0]?.address?.addressLocality).toBe("Boulder")
    expect(schema.hasPart?.[1]?.address).toBeUndefined()
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

  it("does not add generated aggregate ratings to generic non-tool entities", () => {
    const schema = generateGenericItemList(
      [
        {
          name: "Course",
          url: "/courses/course",
          provider: generateSchemaReference("Organization", "/organizations/baseline", "BMA"),
          about: generateSchemaReference("Thing", "/disciplines/eskrima", "Eskrima"),
        },
      ],
      "Courses",
      "Course",
    ) as unknown as ItemListSchemaForTest

    expect(schema.itemListElement?.[0]?.item.provider?.name).toBe("BMA")
    expect(schema.itemListElement?.[0]?.item.about?.name).toBe("Eskrima")
    expect(schema.itemListElement?.[0]?.item.aggregateRating).toBeUndefined()
  })
})
