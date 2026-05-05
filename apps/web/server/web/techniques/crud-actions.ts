"use server"

import { z } from "zod"
import { userActionClient } from "~/lib/safe-actions"
import { revalidateTag } from "next/cache"

const TechniqueCategory = z.enum([
  "STRIKE", "KICK", "THROW", "SUBMISSION", "SWEEP", "ESCAPE",
  "BLOCK", "FORM", "DRILL", "CONDITIONING", "TRANSITION", "TAKEDOWN",
])

const TechniquePosition = z.enum([
  "STANDING", "GUARD", "HALF_GUARD", "MOUNT", "SIDE_CONTROL",
  "BACK", "TURTLE", "CLINCH", "OPEN",
])

const DifficultyLevel = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"])

const createTechniqueSchema = z.object({
  organizationId: z.string(),
  disciplineId: z.string(),
  name: z.string().min(1).max(200),
  slug: z.string().max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  position: TechniquePosition.nullish(),
  category: TechniqueCategory.nullish(),
  difficultyLevel: DifficultyLevel.nullish(),
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

const updateTechniqueSchema = createTechniqueSchema.partial().extend({
  id: z.string(),
})

const deleteTechniqueSchema = z.object({
  id: z.string(),
})

export const createTechnique = userActionClient
  .inputSchema(createTechniqueSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { organizationId, ...data } = parsedInput

    // Verify user is owner or instructor
    const membership = await db.membership.findFirst({
      where: { userId: user.id, organizationId, roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } } },
    })
    if (!membership) {
      throw new Error("You are not authorized to create techniques for this organization")
    }

    const org = await db.organization.findUniqueOrThrow({ where: { id: organizationId } })

    const technique = await db.technique.create({
      data: {
        ...data,
        brand: org.brand,
        organizationId,
        teachingCues: data.teachingCues ?? [],
        commonErrors: data.commonErrors ?? [],
      },
    })

    revalidate({ tags: ["techniques"], paths: ["/dashboard", "/techniques"] })
    return technique
  })

export const updateTechnique = userActionClient
  .inputSchema(updateTechniqueSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { id, ...data } = parsedInput

    // Verify ownership
    const technique = await db.technique.findUniqueOrThrow({
      where: { id },
      include: { organization: { select: { id: true } } },
    })

    const membership = await db.membership.findFirst({
      where: { userId: user.id, organizationId: technique.organization.id, roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } } },
    })
    if (!membership) {
      throw new Error("You are not authorized to edit this technique")
    }

    const updated = await db.technique.update({
      where: { id },
      data,
    })

    revalidate({ tags: ["techniques", `technique-${updated.slug}`], paths: ["/dashboard", "/techniques"] })
    return updated
  })

export const deleteTechnique = userActionClient
  .inputSchema(deleteTechniqueSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { id } = parsedInput

    const technique = await db.technique.findUniqueOrThrow({
      where: { id },
      include: { organization: { select: { id: true } } },
    })

    const membership = await db.membership.findFirst({
      where: { userId: user.id, organizationId: technique.organization.id, roleAssignments: { some: { role: { code: { in: ["OWNER", "INSTRUCTOR"] } } } } },
    })
    if (!membership) {
      throw new Error("You are not authorized to delete this technique")
    }

    await db.technique.delete({ where: { id } })

    revalidate({ tags: ["techniques"], paths: ["/dashboard", "/techniques"] })
    return { success: true }
  })
