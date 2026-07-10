/**
 * FI-022 — issueCertificate wiring regression.
 *
 * Drives the admin action boundary end-to-end: role gate, BBL template brand
 * check, and the issuance row (certificate number + QR verification code) the
 * public /certificates/verify/[code] page depends on.
 */

// @ts-expect-error — bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL" })

import { issueCertificate } from "~/server/admin/certificates/issuance-actions"
import { db } from "~/services/db"

const TS = Date.now()
const TAG_PREFIX = "fi-022-issue-certificate-"
const tag = (name: string) => `${TAG_PREFIX}${TS}-${name}`

let adminUserId = ""
let recipientUserId = ""
let templateId = ""

beforeAll(async () => {
  const [admin, recipient, template] = await Promise.all([
    db.user.create({
      data: { name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
      select: { id: true },
    }),
    db.user.create({
      data: { name: tag("recipient"), email: `${tag("recipient")}@test.local` },
      select: { id: true },
    }),
    db.certificateTemplate.create({
      data: { brand: "BBL", name: tag("template"), type: "BELT_RANK" },
      select: { id: true },
    }),
  ])

  adminUserId = admin.id
  recipientUserId = recipient.id
  templateId = template.id
  setTestSession({ id: adminUserId, role: "admin" })
})

afterAll(async () => {
  if (templateId) {
    await db.certificateIssuance.deleteMany({ where: { certificateTemplateId: templateId } })
    await db.certificateTemplate.deleteMany({ where: { id: templateId } })
  }
  await db.user.deleteMany({ where: { email: { startsWith: TAG_PREFIX } } })
})

describe("issueCertificate", () => {
  it("creates an issuance row keyed to User.id with a QR verification code", async () => {
    const result = await issueCertificate({
      certificateTemplateId: templateId,
      userId: recipientUserId,
      // Date-only string, as the dialog's date input emits.
      expiresAt: "2030-01-01",
    })

    expect(result?.serverError).toBeUndefined()
    const issuanceId = result?.data?.id as string
    expect(issuanceId).toBeDefined()

    const issuance = await db.certificateIssuance.findUniqueOrThrow({
      where: { id: issuanceId },
      select: {
        certificateNumber: true,
        qrVerificationCode: true,
        userId: true,
        certificateTemplateId: true,
        expiresAt: true,
        revokedAt: true,
      },
    })

    expect(issuance.userId).toBe(recipientUserId)
    expect(issuance.certificateTemplateId).toBe(templateId)
    expect(issuance.certificateNumber).toStartWith("CERT-")
    // 16 random bytes hex-encoded — the code the public verify page looks up.
    expect(issuance.qrVerificationCode).toMatch(/^[0-9a-f]{32}$/)
    expect(issuance.expiresAt?.toISOString().slice(0, 10)).toBe("2030-01-01")
    expect(issuance.revokedAt).toBeNull()
  })
})
