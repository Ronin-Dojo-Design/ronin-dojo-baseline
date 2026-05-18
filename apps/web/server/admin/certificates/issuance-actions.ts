"use server"

import { randomBytes } from "node:crypto"
import { after } from "next/server"
import { z } from "zod/v4"
import { getRequestBrand } from "~/lib/brand-context"
import { adminActionClient } from "~/lib/safe-actions"

const issueCertificateSchema = z.object({
  certificateTemplateId: z.string(),
  userId: z.string(),
  certificationId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(3).toString("hex").toUpperCase()
  return `CERT-${timestamp}-${random}`
}

function generateQrCode(): string {
  return randomBytes(16).toString("hex")
}

export const issueCertificate = adminActionClient
  .inputSchema(issueCertificateSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const { certificateTemplateId, userId, certificationId, expiresAt } = parsedInput

    // Brand validation: ensure template belongs to admin's current brand
    const brand = await getRequestBrand()
    const template = await db.certificateTemplate.findUnique({
      where: { id: certificateTemplateId },
      select: { brand: true },
    })
    if (!template || template.brand !== brand) {
      throw new Error("Certificate template not found or does not belong to this brand")
    }

    const certificateNumber = generateCertificateNumber()
    const qrVerificationCode = generateQrCode()

    const issuance = await db.certificateIssuance.create({
      data: {
        certificateNumber,
        qrVerificationCode,
        certificateTemplateId,
        userId,
        certificationId: certificationId || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    })

    after(async () => {
      revalidate({
        paths: ["/admin/certificates"],
        tags: ["certificates", `certificate-${certificateTemplateId}`],
      })
    })

    return issuance
  })

export const revokeCertificate = adminActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx: { db, revalidate } }) => {
    const issuance = await db.certificateIssuance.update({
      where: { id },
      data: { revokedAt: new Date() },
    })

    after(async () => {
      revalidate({
        tags: ["certificates", `certificate-issuance-${id}`],
      })
    })

    return issuance
  })
