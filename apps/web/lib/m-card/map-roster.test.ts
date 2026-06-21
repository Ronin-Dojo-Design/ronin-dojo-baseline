// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"
import type { DirectoryFacetResult } from "~/lib/directory/facet-result"
import { mapRosterFromFacet } from "~/lib/m-card/map-roster"

function personFixture(overrides: Partial<DirectoryFacetResult> = {}): DirectoryFacetResult {
  return {
    id: "person:profile-1",
    type: "person",
    title: "Brian Scott",
    href: "/directory/brian-scott",
    subtitle: "Boulder, CO",
    imageUrl: "https://example.com/avatar.jpg",
    initials: "BS",
    trustStatus: "verified",
    claimStatus: null,
    tags: ["Black Belt"],
    rankColorHex: "#1a1a1a",
    badges: [{ label: "Premium", variant: "outline" }],
    save: { subjectType: "PERSON", subjectId: "passport-1" },
    ...overrides,
  }
}

describe("mapRosterFromFacet", () => {
  it("maps a person facet to the roster DTO shape", () => {
    const data = mapRosterFromFacet(personFixture())

    expect(data).toEqual({
      id: "person:profile-1",
      name: "Brian Scott",
      avatarUrl: "https://example.com/avatar.jpg",
      avatarFallbackUrl: null,
      initials: "BS",
      rank: { name: "Black Belt", colorHex: "#1a1a1a" },
      schoolLabel: null,
      locationLine: "Boulder, CO",
      trustStatus: "verified",
      claimStatus: null,
      tier: "Premium",
      badges: [{ label: "Premium", variant: "outline" }],
      viewLabel: "View profile",
    })
  })

  it("injects the surface-supplied avatar fallback without referencing a brand in the mapper", () => {
    const data = mapRosterFromFacet(personFixture({ imageUrl: null }), {
      fallbackAvatarUrl: "/brand/bbl/default-black-belt.png",
    })

    expect(data.avatarUrl).toBeNull()
    expect(data.avatarFallbackUrl).toBe("/brand/bbl/default-black-belt.png")
  })

  it("emits no rank when the facet carries no tags, and falls back to a non-person view label", () => {
    const data = mapRosterFromFacet(
      personFixture({ type: "organization", tags: [], rankColorHex: null, badges: [] }),
    )

    expect(data.rank).toBeNull()
    expect(data.tier).toBeNull()
    expect(data.viewLabel).toBe("View")
  })

  it("never leaks a non-public field — output keys are a fixed public allowlist", () => {
    // The roster DTO is presentation-only. Even if a malicious/extra field rides along on the
    // source row, the mapper's output must be exactly the public allowlist (no passthrough/spread).
    const polluted = {
      ...personFixture(),
      email: "secret@example.com",
      phone: "555-0100",
      legalName: "Secret Legal Name",
      claimEvidence: { notes: "reviewer-only" },
    } as DirectoryFacetResult

    const data = mapRosterFromFacet(polluted)
    const keys = Object.keys(data).sort()

    expect(keys).toEqual(
      [
        "avatarFallbackUrl",
        "avatarUrl",
        "badges",
        "claimStatus",
        "id",
        "initials",
        "locationLine",
        "name",
        "rank",
        "schoolLabel",
        "tier",
        "trustStatus",
        "viewLabel",
      ].sort(),
    )
    // Explicitly assert the sensitive fields did not survive the projection.
    for (const leaked of ["email", "phone", "legalName", "claimEvidence"]) {
      expect(Object.hasOwn(data, leaked)).toBe(false)
    }
  })
})
