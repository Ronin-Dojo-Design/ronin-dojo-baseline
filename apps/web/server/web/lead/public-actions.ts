"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import { z } from "zod"
import { getRequestBrand } from "~/lib/brand-context"
import { publicActionClient } from "~/lib/safe-actions"
import { leadPayload } from "~/server/web/lead/payloads"

const publicLeadSchema = z.object({
  organizationId: z.string().min(1),
  programId: z.string().optional(),
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email(),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
})

/**
 * Public (unauthenticated) lead capture action.
 * Rate-limited by IP. No session required.
 */
export const createPublicLead = publicActionClient
  .inputSchema(publicLeadSchema)
  .action(async ({ parsedInput, ctx: { db, revalidate } }) => {
    const brand = await getRequestBrand()

    // Basic IP-based rate limiting
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

    // Check rate: max 5 leads per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentFromIp = await db.lead.count({
      where: {
        brand,
        createdAt: { gte: oneHourAgo },
        meta: { path: ["captureIp"], equals: ip },
      },
    })

    if (recentFromIp >= 5) {
      throw new Error("Too many submissions. Please try again later.")
    }

    // Validate org belongs to brand
    const organization = await db.organization.findFirst({
      where: { id: parsedInput.organizationId, brand },
      select: { id: true },
    })

    if (!organization) {
      throw new Error("Organization not found")
    }

    const lead = await db.lead.create({
      data: {
        brand,
        organizationId: organization.id,
        programId: parsedInput.programId || null,
        source: "WEBSITE",
        firstName: parsedInput.firstName.trim(),
        lastName: parsedInput.lastName?.trim() || null,
        email: parsedInput.email.trim().toLowerCase(),
        phoneE164: parsedInput.phoneE164?.trim() || null,
        meta: { captureIp: ip },
      },
      select: leadPayload,
    })

    after(() => {
      revalidate({
        paths: ["/admin/leads"],
        tags: ["leads"],
      })
    })

    return { id: lead.id }
  })
