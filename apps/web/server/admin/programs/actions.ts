"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { programSchema, programCourseSchema, programCourseRemoveSchema } from "~/server/admin/programs/schema"

export const upsertProgram = adminActionClient
  .inputSchema(programSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const { id, ...input } = parsedInput

    const program = id
      ? await db.program.update({
          where: { id, brand },
          data: input,
        })
      : await db.program.create({
          data: {
            ...input,
            brand,
            slug: input.slug || "",
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/programs"],
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
      paths: ["/admin/programs"],
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
      paths: ["/admin/programs"],
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
      paths: ["/admin/programs"],
      tags: ["programs", `program-${program.slug}`],
    })

    return true
  })
