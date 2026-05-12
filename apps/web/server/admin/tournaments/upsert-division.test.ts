/**
 * SESSION_0135 TASK_02 — upsertDivision schema validation test.
 *
 * Tests the `divisionSchema` Zod validation to prove create/update/invalid
 * inputs are handled correctly. Pure schema tests — no DB needed.
 *
 * Run: cd apps/web && bun test server/admin/tournaments/upsert-division.test.ts
 */

// @ts-expect-error — bun:test is a Bun runtime module
import { describe, expect, it } from "bun:test"
import { divisionSchema } from "./schema"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validInput = {
  name: "Men's Lightweight Sparring",
  format: "SINGLE_ELIM" as const,
  gender: "MALE" as const,
  tournamentDisciplineId: "clxyz_discipline_01",
  roleRequiredId: "clxyz_role_01",
}

// ---------------------------------------------------------------------------
// Create (no id)
// ---------------------------------------------------------------------------

describe("divisionSchema", () => {
  describe("valid create input", () => {
    it("parses minimal valid input", () => {
      const result = divisionSchema.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Men's Lightweight Sparring")
        expect(result.data.format).toBe("SINGLE_ELIM")
        expect(result.data.gender).toBe("MALE")
        expect(result.data.feeCents).toBe(0) // default
        expect(result.data.sortOrder).toBe(0) // default
        expect(result.data.id).toBeUndefined()
      }
    })

    it("parses full input with optional fields", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        ageMin: 18,
        ageMax: 35,
        weightMinKg: 60,
        weightMaxKg: 70,
        feeCents: 5000,
        capacity: 32,
        sortOrder: 1,
        rankMinId: "rank_01",
        rankMaxId: "rank_05",
        ruleSetId: "ruleset_01",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.ageMin).toBe(18)
        expect(result.data.capacity).toBe(32)
        expect(result.data.feeCents).toBe(5000)
        expect(result.data.rankMinId).toBe("rank_01")
      }
    })
  })

  // ---------------------------------------------------------------------------
  // Update (with id)
  // ---------------------------------------------------------------------------

  describe("valid update input", () => {
    it("accepts input with id for update", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        id: "clxyz_division_01",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe("clxyz_division_01")
      }
    })
  })

  // ---------------------------------------------------------------------------
  // Invalid inputs
  // ---------------------------------------------------------------------------

  describe("invalid inputs", () => {
    it("rejects missing name", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        name: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing tournamentDisciplineId", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        tournamentDisciplineId: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects missing roleRequiredId", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        roleRequiredId: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid format enum", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        format: "INVALID_FORMAT",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid gender enum", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        gender: "INVALID_GENDER",
      })
      expect(result.success).toBe(false)
    })

    it("allows empty string for optional FK fields (rankMinId, rankMaxId, ruleSetId)", () => {
      const result = divisionSchema.safeParse({
        ...validInput,
        rankMinId: "",
        rankMaxId: "",
        ruleSetId: "",
      })
      expect(result.success).toBe(true)
    })
  })
})
