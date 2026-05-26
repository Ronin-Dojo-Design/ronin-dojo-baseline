// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { describe, expect, it } from "bun:test"

import {
  BBL_BJJ_RANK_FIELDS,
  extractBblBjjRankAwards,
  normalizeBblBjjRankName,
  normalizeBblVerificationStatus,
} from "~/server/web/lineage/bbl-bjj-rank-map"

describe("BBL BJJ rank field map", () => {
  it("covers the canonical Pods belt ladder from white through 10th degree", () => {
    expect(BBL_BJJ_RANK_FIELDS.map(rank => rank.key)).toEqual([
      "white_belt",
      "blue_belt",
      "purple_belt",
      "brown_belt",
      "black_belt",
      "black_belt_1st_degree",
      "black_belt_2nd_degree",
      "black_belt_3rd_degree",
      "black_belt_4th_degree",
      "black_belt_5th_degree",
      "black_belt_6th_degree",
      "black_belt_7th_degree",
      "black_belt_8th_degree",
      "black_belt_9th_degree",
      "black_belt_10th_degree",
    ])

    const blackBelt = BBL_BJJ_RANK_FIELDS.find(rank => rank.key === "black_belt")
    expect(blackBelt?.rankName).toBe("Black Belt")
    expect(blackBelt?.rankShortName).toBe("BK0")
    expect(blackBelt?.dateFields).toContain("black_belt_promotion_date")
    expect(blackBelt?.promoterFields).toContain("who_promoted_you_to_black_belt")

    const eighthDegree = BBL_BJJ_RANK_FIELDS.find(rank => rank.key === "black_belt_8th_degree")
    expect(eighthDegree?.rankName).toBe("Coral Belt (Red/White) - 8th Degree")
    expect(eighthDegree?.rankShortName).toBe("CB8")
    expect(eighthDegree?.dateFields).toContain("8th_degree_coral_belt_promotion_date")
    expect(eighthDegree?.locationFields).toContain("promoted_at")
  })

  it("normalizes legacy rank labels to current Rank lookup names", () => {
    expect(normalizeBblBjjRankName("8th Degree Coral Belt")).toMatchObject({
      key: "black_belt_8th_degree",
      rankShortName: "CB8",
    })
    expect(normalizeBblBjjRankName("1st Degree Black Belt")).toMatchObject({
      key: "black_belt_1st_degree",
      rankShortName: "BK1",
    })
    expect(normalizeBblBjjRankName("Black Belt")).toMatchObject({
      key: "black_belt",
      rankShortName: "BK0",
    })
  })
})

describe("extractBblBjjRankAwards", () => {
  it("extracts rank award facts from canonical bbl_member Pods fields", () => {
    const awards = extractBblBjjRankAwards({
      is_verified: true,
      black_belt_promotion_date: "2012-06-02",
      who_promoted_you_to_black_belt: { ID: 42, post_title: "Professor Bob Bass" },
      where_you_were_promoted_to_black_belt: {
        ID: 7,
        post_title: "South Bay Jiu Jitsu",
      },
      black_belt_pictures: [{ guid: "https://blackbeltlegacy.test/black-belt.jpg" }],
    })

    expect(awards).toEqual([
      expect.objectContaining({
        key: "black_belt",
        rankName: "Black Belt",
        rankShortName: "BK0",
        awardedAt: "2012-06-02",
        promotedByLegacyRef: "42",
        locationLegacyRef: "7",
        mediaUrls: ["https://blackbeltlegacy.test/black-belt.jpg"],
        verificationStatus: "VERIFIED",
        isVerified: true,
        sourceDateField: "black_belt_promotion_date",
        sourcePromoterField: "who_promoted_you_to_black_belt",
        sourceLocationField: "where_you_were_promoted_to_black_belt",
      }),
    ])
  })

  it("extracts legacy student CPT date fields with source-level verification", () => {
    const awards = extractBblBjjRankAwards({
      verified: "approved",
      date_of_blue_belt_promotion: "2009-04-10",
      date_of_1st_degree_black_belt_promotion: "2018-05-12",
    })

    expect(awards).toEqual([
      expect.objectContaining({
        key: "blue_belt",
        rankShortName: "BL0",
        awardedAt: "2009-04-10",
        sourceDateField: "date_of_blue_belt_promotion",
        verificationStatus: "VERIFIED",
      }),
      expect.objectContaining({
        key: "black_belt_1st_degree",
        rankShortName: "BK1",
        awardedAt: "2018-05-12",
        sourceDateField: "date_of_1st_degree_black_belt_promotion",
        verificationStatus: "VERIFIED",
      }),
    ])
  })

  it("falls back to current_rank_in_bjj when no belt history fields exist", () => {
    const awards = extractBblBjjRankAwards(
      {
        current_rank_in_bjj: "1st Degree Black Belt",
        instructor_id: "bob-bass",
        promotion_school: { post_name: "south-bay-jiu-jitsu" },
        is_verified: false,
      },
      { includeCurrentRankFallback: true },
    )

    expect(awards).toEqual([
      expect.objectContaining({
        key: "black_belt_1st_degree",
        awardedAt: null,
        promotedByLegacyRef: "bob-bass",
        locationLegacyRef: "south-bay-jiu-jitsu",
        verificationStatus: "PENDING",
        isVerified: false,
        sourceDateField: null,
      }),
    ])
  })
})

describe("normalizeBblVerificationStatus", () => {
  it("maps legacy verification statuses to the current lineage status enum", () => {
    expect(normalizeBblVerificationStatus(true)).toBe("VERIFIED")
    expect(normalizeBblVerificationStatus("verified")).toBe("VERIFIED")
    expect(normalizeBblVerificationStatus("approved")).toBe("VERIFIED")
    expect(normalizeBblVerificationStatus("needs-proof")).toBe("PENDING")
    expect(normalizeBblVerificationStatus("disputed")).toBe("DISPUTED")
    expect(normalizeBblVerificationStatus(false)).toBe("PENDING")
  })
})
