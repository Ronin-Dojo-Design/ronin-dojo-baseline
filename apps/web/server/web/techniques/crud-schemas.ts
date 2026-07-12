import { z } from "zod"

const TechniqueCategory = z.enum([
  "STRIKE",
  "KICK",
  "THROW",
  "SUBMISSION",
  "SWEEP",
  "ESCAPE",
  "BLOCK",
  "FORM",
  "DRILL",
  "CONDITIONING",
  "TRANSITION",
  "TAKEDOWN",
])

const TechniquePosition = z.enum([
  "STANDING",
  "GUARD",
  "HALF_GUARD",
  "MOUNT",
  "SIDE_CONTROL",
  "BACK",
  "TURTLE",
  "CLINCH",
  "OPEN",
])

const DifficultyLevel = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])

export const createTechniqueSchema = z.object({
  // @changed SESSION_0528 (ADR 0046) — org is now optional. The org-canonical path passes an
  // `organizationId` (OWNER/INSTRUCTOR-gated); the authored path omits it and derives the school
  // from the author's current `Affiliation` (may be null → profile-only).
  organizationId: z.string().optional(),
  // @added SESSION_0528 (ADR 0046 D5) — routes to the capability-gated authored create path
  // (sets `authorPassportId`, derives org from affiliation). Absent/false = the org-canonical path.
  authored: z.boolean().optional(),
  disciplineId: z.string(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  position: TechniquePosition.nullish(),
  category: TechniqueCategory.nullish(),
  difficultyLevel: DifficultyLevel.nullish(),
  // @added SESSION_0527 Slice 1 — the tagged belt (`beltLevelMinId` FK → Rank). Author picks one
  // belt (KISS scalar-belt model, Stream D1); drives the browse belt facet + the per-belt rail.
  beltLevelMinId: z.string().nullish(),
  isGi: z.boolean().nullish(),
  isFoundational: z.boolean().optional(),
  requiresPartner: z.boolean().optional(),
  requiresEquipment: z.boolean().optional(),
  movementPattern: z.string().max(200).optional(),
  rangeBand: z.string().max(200).optional(),
  teachingCues: z.array(z.string()).optional(),
  commonErrors: z.array(z.string()).optional(),
  safetyNotes: z.string().max(2000).optional(),
  isPublished: z.boolean().optional(),
})

export const updateTechniqueSchema = createTechniqueSchema.partial().extend({
  id: z.string(),
})

// @added SESSION_0529 Slice 3C — staff promote/demote to the canonical library (ADR 0046 D4).
// Deliberately its OWN schema/action (not an `updateTechnique` field): `applyUpdateTechnique`
// strips ownership/identity axes, and `isFeatured` is a staff-only axis with its own RBAC gate.
export const setTechniqueFeaturedSchema = z.object({
  id: z.string(),
  isFeatured: z.boolean(),
})

export type CreateTechniqueInput = z.infer<typeof createTechniqueSchema>
export type UpdateTechniqueInput = z.infer<typeof updateTechniqueSchema>
export type SetTechniqueFeaturedInput = z.infer<typeof setTechniqueFeaturedSchema>
