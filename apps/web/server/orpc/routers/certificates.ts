import { randomBytes } from "node:crypto"
import { ORPCError } from "@orpc/server"
import { revalidatePath } from "next/cache"
import { after } from "next/server"
import { z } from "zod/v4"
import { Brand } from "~/.generated/prisma/client"
import { issueCertificateSchema } from "~/server/admin/certificates/schema"
import { authedProcedure } from "~/server/orpc/procedure"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { db } from "~/services/db"

/**
 * Certificate issuance router (WL-P2-43, SESSION_0697) — the issue/revoke mutations migrated
 * off the retiring next-safe-action seam (`server/admin/certificates/issuance-actions.ts`,
 * deleted) onto oRPC (ADR 0024 full-oRPC direction / SOT-ADR D3).
 *
 * Why this migration exists: the safe-action ctx `revalidate({ paths, tags })` seam cannot
 * express Next's LAYOUT-typed revalidation, so these actions imported
 * `revalidatePath(path, "layout")` directly — a third revalidation idiom (seam bypass,
 * FI-022's fix). Here the procedure OWNS its revalidation: the layout-typed call is
 * idiomatic inside the handler, and the deferred tag work stays on the oRPC
 * `context.revalidate` seam (`revalidateTag(tag, { expire: 0 })` — Route-Handler-legal).
 *
 * Authz: `meta.permission = APP_AREA_PERMISSIONS.certificates` ("certificates.manage") — the
 * same string that gates the `/app/certificates` layout (SOT-ADR D5). Only admin `"*"`
 * grants it today, preserving the old `adminActionClient` admin-only boundary.
 */

const certificatesProcedure = authedProcedure.meta({
  permission: APP_AREA_PERMISSIONS.certificates,
})

function generateCertificateNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = randomBytes(3).toString("hex").toUpperCase()
  return `CERT-${timestamp}-${random}`
}

function generateQrCode(): string {
  return randomBytes(16).toString("hex")
}

/**
 * Layout-typed revalidation for the `/app/certificates` subtree: the issuance list renders
 * on the dynamic `/app/certificates/[id]` page, which plain path/tag revalidation alone
 * doesn't bust (FI-022 stale-list class). The handler completes before the RPC response
 * returns, so the dialog's follow-up `router.refresh()` observes the fresh list — no race
 * with deferred work.
 */
const revalidateCertificatesSubtree = () => {
  revalidatePath("/app/certificates", "layout")
}

const issue = certificatesProcedure
  .input(issueCertificateSchema)
  .handler(async ({ input, context }) => {
    const { certificateTemplateId, userId, certificationId, expiresAt } = input

    // Brand validation: ensure template belongs to admin's current brand
    const template = await db.certificateTemplate.findUnique({
      where: { id: certificateTemplateId },
      select: { brand: true },
    })
    if (!template || template.brand !== Brand.BBL) {
      throw new ORPCError("NOT_FOUND", {
        message: "Certificate template not found or does not belong to this brand",
      })
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

    revalidateCertificatesSubtree()

    after(async () => {
      context.revalidate({
        tags: ["certificates", `certificate-${certificateTemplateId}`],
      })
    })

    return issuance
  })

const revoke = certificatesProcedure
  .input(z.object({ id: z.string() }))
  .handler(async ({ input, context }) => {
    const issuance = await db.certificateIssuance.update({
      where: { id: input.id },
      data: { revokedAt: new Date() },
    })

    after(async () => {
      context.revalidate({
        tags: ["certificates", `certificate-issuance-${input.id}`],
      })
    })

    // Same layout-typed revalidation as issue: the issuance list renders on the dynamic
    // /app/certificates/[id] page, which tag/path revalidation alone doesn't bust.
    revalidateCertificatesSubtree()

    return issuance
  })

export const certificates = {
  issue,
  revoke,
}
