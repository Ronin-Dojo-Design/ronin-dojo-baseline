"use server"

import { after } from "next/server"
import { adminActionClient } from "~/lib/safe-actions"
import { idsSchema } from "~/server/admin/shared/schema"
import { certificateTemplateSchema } from "~/server/admin/certificates/schema"

export const upsertCertificateTemplate = adminActionClient
  .inputSchema(certificateTemplateSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { id, ...input } = parsedInput

    const template = id
      ? await db.certificateTemplate.update({
          where: { id },
          data: input,
        })
      : await db.certificateTemplate.create({
          data: input,
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
  .action(async ({ parsedInput: { ids }, ctx: { db, revalidate } }) => {
    await db.certificateTemplate.deleteMany({
      where: { id: { in: ids } },
    })

    revalidate({
      paths: ["/admin/certificates"],
      tags: ["certificates"],
    })

    return true
  })
