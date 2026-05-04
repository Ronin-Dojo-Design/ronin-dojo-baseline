"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idSchema, idsSchema } from "~/server/admin/shared/schema"
import { courseSchema, curriculumItemSchema, reorderCurriculumItemsSchema } from "~/server/admin/courses/schema"
import { z } from "zod/v4"

export const upsertCourse = adminActionClient
  .inputSchema(courseSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const { id, ...input } = parsedInput

    const course = id
      ? await db.course.update({
          where: { id, brand },
          data: input,
        })
      : await db.course.create({
          data: {
            ...input,
            brand,
            slug: input.slug || "",
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/courses"],
        tags: ["courses", `course-${course.slug}`],
      })
    })

    return course
  })

export const deleteCourses = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    await db.course.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/courses"],
      tags: ["courses"],
    })

    return true
  })

export const upsertCurriculumItem = adminActionClient
  .inputSchema(curriculumItemSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { id, ...input } = parsedInput

    const item = id
      ? await db.curriculumItem.update({
          where: { id },
          data: input,
        })
      : await db.curriculumItem.create({
          data: input,
        })

    after(async () => {
      revalidate({
        tags: ["courses", `course-items-${input.courseId}`],
      })
    })

    return item
  })

export const deleteCurriculumItem = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const item = await db.curriculumItem.delete({
      where: { id },
    })

    after(async () => {
      revalidate({
        tags: ["courses", `course-items-${item.courseId}`],
      })
    })

    return true
  })

export const reorderCurriculumItems = adminActionClient
  .inputSchema(reorderCurriculumItemsSchema)
  .action(async ({ parsedInput: { courseId, itemIds }, ctx: { db, revalidate } }) => {
    await db.$transaction(
      itemIds.map((id, index) =>
        db.curriculumItem.update({
          where: { id },
          data: { order: index + 1 },
        }),
      ),
    )

    after(async () => {
      revalidate({
        tags: ["courses", `course-items-${courseId}`],
      })
    })

    return true
  })

const linkTechniqueSchema = z.object({
  techniqueId: z.string(),
  curriculumItemId: z.string(),
  courseId: z.string(),
})

export const linkTechniqueToCurriculum = adminActionClient
  .inputSchema(linkTechniqueSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { techniqueId, curriculumItemId, courseId } = parsedInput

    await db.techniqueCurriculumLink.upsert({
      where: {
        techniqueId_curriculumItemId: { techniqueId, curriculumItemId },
      },
      update: {},
      create: { techniqueId, curriculumItemId },
    })

    after(async () => {
      revalidate({
        tags: ["courses", `course-items-${courseId}`],
      })
    })

    return true
  })

export const unlinkTechniqueFromCurriculum = adminActionClient
  .inputSchema(linkTechniqueSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { techniqueId, curriculumItemId, courseId } = parsedInput

    await db.techniqueCurriculumLink.delete({
      where: {
        techniqueId_curriculumItemId: { techniqueId, curriculumItemId },
      },
    })

    after(async () => {
      revalidate({
        tags: ["courses", `course-items-${courseId}`],
      })
    })

    return true
  })
