"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { certificateTemplateSchema } from "~/server/admin/certificates/schema"

export const upsertCertificateTemplate = adminActionClient
  .inputSchema(certificateTemplateSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate, brand } }) => {
    const { id, ...input } = parsedInput

    const template = id
      ? await db.certificateTemplate.update({
          where: { id, brand },
          data: input,
        })
      : await db.certificateTemplate.create({
          data: {
            ...input,
            brand,
          },
        })

    after(async () => {
      revalidate({
        paths: ["/admin/certificates"],
        tags: ["certificates", `certificate-${template.id}`],
      })
    })

    return template
  })

export const deleteCertificateTemplates = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate, brand } }) => {
    await db.certificateTemplate.deleteMany({
      where: { id: { in: ids }, brand },
    })

    revalidate({
      paths: ["/admin/certificates"],
      tags: ["certificates"],
    })

    return true
  })
