"use server"

import { z } from "zod"
import { userActionClient } from "~/lib/safe-actions"

const updateOrganizationSchema = z.object({
  organizationId: z.string(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(2000).optional(),
  websiteUrl: z.string().max(2048).optional(),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phoneE164: z.string().max(32).optional(),
  addressLine1: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(2).optional(),
})

export const updateOrganization = userActionClient
  .inputSchema(updateOrganizationSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { organizationId, ...data } = parsedInput

    // Verify user is owner of this org
    const membership = await db.membership.findFirst({
      where: {
        userId: user.id,
        organizationId,
        roleAssignments: { some: { role: { code: "OWNER" } } },
      },
    })

    if (!membership) {
      throw new Error("You are not authorized to edit this organization")
    }

    const org = await db.organization.update({
      where: { id: organizationId },
      data,
    })

    revalidate({ paths: ["/dashboard", `/organizations/${org.slug}`] })
    return org
  })
