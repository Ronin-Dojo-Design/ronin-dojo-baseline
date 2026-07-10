"use server"

import { randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod/v4"
import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { issueCertificateSchema } from "~/server/admin/certificates/schema"

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
    const template = await db.certificateTemplate.findUnique({
      where: { id: certificateTemplateId },
      select: { brand: true },
    })
    if (!template || template.brand !== Brand.BBL) {
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

    // Layout-typed so the dynamic /app/certificates/[id] child (where the issuance
    // list lives) is busted too — plain-path revalidation only touches the exact
    // segment (precedent: server/admin/users/actions.ts). Must run BEFORE the
    // response returns: the dialog's onSuccess router.refresh() re-renders
    // immediately, and a revalidation deferred into after() races it (stale list).
    revalidatePath("/app/certificates", "layout")

    after(async () => {
      revalidate({
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

    // Same layout-typed revalidation as issueCertificate: the issuance list renders on the
    // dynamic /app/certificates/[id] page, which tag/path revalidation alone doesn't bust.
    revalidatePath("/app/certificates", "layout")

    return issuance
  })
