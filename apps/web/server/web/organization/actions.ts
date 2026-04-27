"use server"

import { userActionClient } from "~/lib/safe-actions"
import { createOrganizationSchema, joinOrganizationSchema } from "./schemas"

// ---------------------------------------------------------------------------
// Create Organization
// ---------------------------------------------------------------------------
// Creates Org + owner Membership + OrganizationDiscipline rows in one tx.
// The calling user becomes the org owner with an ACTIVE membership.

export const createOrganization = userActionClient
  .inputSchema(createOrganizationSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { disciplineIds, ...orgData } = parsedInput

    // 1. Create the organization
    const org = await db.organization.create({
      data: {
        ...orgData,
        ownerId: user.id,
      },
    })

    // 2. Link disciplines if provided
    if (disciplineIds?.length) {
      await db.organizationDiscipline.createMany({
        data: disciplineIds.map((disciplineId) => ({
          organizationId: org.id,
          disciplineId,
        })),
      })

      // 3. Create owner membership (ACTIVE, first discipline)
      await db.membership.create({
        data: {
          brand: orgData.brand,
          userId: user.id,
          organizationId: org.id,
          disciplineId: disciplineIds[0],
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      })
    }

    revalidate({ paths: ["/organizations", `/organizations/${org.slug}`] })
    return org
  })

// ---------------------------------------------------------------------------
// Join Organization
// ---------------------------------------------------------------------------
// Creates a PENDING membership for the calling user.

export const joinOrganization = userActionClient
  .inputSchema(joinOrganizationSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { organizationId, disciplineId, brand } = parsedInput

    // Verify org exists
    const org = await db.organization.findUnique({ where: { id: organizationId } })
    if (!org) throw new Error("Organization not found")

    // Check for existing membership
    const existing = await db.membership.findUnique({
      where: {
        userId_organizationId_disciplineId: {
          userId: user.id,
          organizationId,
          disciplineId,
        },
      },
    })
    if (existing) throw new Error("Already a member of this organization for this discipline")

    const membership = await db.membership.create({
      data: {
        brand,
        userId: user.id,
        organizationId,
        disciplineId,
        status: "PENDING",
      },
    })

    revalidate({ paths: [`/organizations/${org.slug}`] })
    return membership
  })
