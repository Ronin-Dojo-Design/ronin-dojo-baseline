"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import {
  programCourseRemoveSchema,
  programCourseSchema,
  programSchema,
  programWaiverRemoveSchema,
  programWaiverSchema,
} from "~/server/admin/programs/schema"
import { idsSchema } from "~/server/admin/shared/schema"

export const upsertProgram = adminActionClient
  .inputSchema(programSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const { id, ageGroupIds, skillLevelIds, ...input } = parsedInput

    const ageGroupData = ageGroupIds?.length
      ? { deleteMany: {}, create: ageGroupIds.map(ageGroupId => ({ ageGroupId })) }
      : undefined

    const skillLevelData = skillLevelIds?.length
      ? { deleteMany: {}, create: skillLevelIds.map(skillLevelId => ({ skillLevelId })) }
      : undefined

    const program = id
      ? await db.program.update({
          where: { id, brand },
          data: {
            ...input,
            ageGroups: ageGroupData,
            skillLevels: skillLevelData,
          },
        })
      : await db.program.create({
          data: {
            ...input,
            brand,
            slug: input.slug || "",
            ageGroups: ageGroupIds?.length
              ? { create: ageGroupIds.map(ageGroupId => ({ ageGroupId })) }
              : undefined,
            skillLevels: skillLevelIds?.length
              ? { create: skillLevelIds.map(skillLevelId => ({ skillLevelId })) }
              : undefined,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/app/programs"],
        tags: ["programs", `program-${program.slug}`],
      })
    })

    return program
  })

export const deletePrograms = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    await db.program.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/app/programs"],
      tags: ["programs"],
    })

    return true
  })

export const addProgramCourse = adminActionClient
  .inputSchema(programCourseSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    // Verify program belongs to brand
    const program = await db.program.findUnique({
      where: { id: parsedInput.programId, brand },
    })

    if (!program) {
      throw new Error("Program not found")
    }

    await db.programCourse.create({
      data: {
        programId: parsedInput.programId,
        courseId: parsedInput.courseId,
      },
    })

    revalidate({
      paths: ["/app/programs"],
      tags: ["programs", `program-${program.slug}`],
    })

    return true
  })

export const removeProgramCourses = adminActionClient
  .inputSchema(programCourseRemoveSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const program = await db.program.findUnique({
      where: { id: parsedInput.programId, brand },
    })

    if (!program) {
      throw new Error("Program not found")
    }

    await db.programCourse.deleteMany({
      where: {
        programId: parsedInput.programId,
        courseId: { in: parsedInput.courseIds },
      },
    })

    revalidate({
      paths: ["/app/programs"],
      tags: ["programs", `program-${program.slug}`],
    })

    return true
  })

export const addProgramWaiver = adminActionClient
  .inputSchema(programWaiverSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const program = await db.program.findUnique({
      where: { id: parsedInput.programId, brand },
    })

    if (!program) {
      throw new Error("Program not found")
    }

    await db.programWaiver.create({
      data: {
        programId: parsedInput.programId,
        waiverId: parsedInput.waiverId,
        required: parsedInput.required,
      },
    })

    revalidate({
      paths: ["/app/programs"],
      tags: ["programs", `program-${program.slug}`],
    })

    return true
  })

export const removeProgramWaivers = adminActionClient
  .inputSchema(programWaiverRemoveSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const program = await db.program.findUnique({
      where: { id: parsedInput.programId, brand },
    })

    if (!program) {
      throw new Error("Program not found")
    }

    await db.programWaiver.deleteMany({
      where: {
        programId: parsedInput.programId,
        waiverId: { in: parsedInput.waiverIds },
      },
    })

    revalidate({
      paths: ["/app/programs"],
      tags: ["programs", `program-${program.slug}`],
    })

    return true
  })
