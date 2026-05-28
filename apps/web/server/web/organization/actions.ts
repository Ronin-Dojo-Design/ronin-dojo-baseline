"use server"

import { after } from "next/server"
import { isInSameBrand } from "~/lib/authz"
import {
  notifyMemberOfMembershipStatusChange,
  notifyMemberOfMembershipWelcome,
} from "~/lib/notifications"
import { userActionClient } from "~/lib/safe-actions"
import { slugify } from "~/lib/slug"
import {
  assignRoleSchema,
  createOrganizationSchema,
  joinByInviteCodeSchema,
  joinOrganizationSchema,
  removeRoleSchema,
  updateMembershipStatusSchema,
} from "./schemas"

// ---------------------------------------------------------------------------
// Create Organization
// ---------------------------------------------------------------------------
// Creates Org + owner Membership + OrganizationDiscipline rows in one tx.
// The calling user becomes the org owner with an ACTIVE membership.

export const createOrganization = userActionClient
  .inputSchema(createOrganizationSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { disciplineIds, ...orgData } = parsedInput

    // Auto-generate slug from name if not provided or empty
    if (!orgData.slug) {
      const base = slugify(orgData.name) || "org"
      let candidate = base
      let attempt = 0
      while (
        await db.organization.findFirst({ where: { slug: candidate }, select: { id: true } })
      ) {
        candidate = `${base}-${Math.random().toString(36).slice(2, 8)}`
        if (++attempt > 5) break
      }
      orgData.slug = candidate
    }

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
        data: disciplineIds.map(disciplineId => ({
          organizationId: org.id,
          disciplineId,
        })),
      })

      // 3. Create owner membership (ACTIVE, first discipline) + assign OWNER role
      const membership = await db.membership.create({
        data: {
          brand: orgData.brand,
          userId: user.id,
          organizationId: org.id,
          disciplineId: disciplineIds[0],
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      })

      const ownerRole = await db.role.findFirst({ where: { code: "OWNER", isSystem: true } })
      if (ownerRole) {
        await db.membershipRoleAssignment.create({
          data: { membershipId: membership.id, roleId: ownerRole.id },
        })
      }
    }

    revalidate({ paths: ["/organizations", `/organizations/${org.slug}`] })
    return org
  })

// ---------------------------------------------------------------------------
// Join Organization (direct)
// ---------------------------------------------------------------------------
// Creates a PENDING membership for the calling user.

export const joinOrganization = userActionClient
  .inputSchema(joinOrganizationSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { organizationId, disciplineId, brand } = parsedInput

    // Verify user belongs to this brand
    const userInBrand = await isInSameBrand(user, brand)
    if (!userInBrand) {
      throw new Error("You are not a member of this brand")
    }

    // Verify user has a Passport
    const passport = await db.passport.findUnique({ where: { userId: user.id } })
    if (!passport) {
      throw new Error("Please complete your Passport profile before joining an organization")
    }

    const org = await db.organization.findUnique({ where: { id: organizationId } })
    if (!org) throw new Error("Organization not found")

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

    const discipline = await db.discipline.findUnique({
      where: { id: disciplineId },
      select: { name: true },
    })

    const membership = await db.membership.create({
      data: {
        brand,
        userId: user.id,
        organizationId,
        disciplineId,
        status: "PENDING",
      },
    })

    if (user.email && discipline) {
      after(async () => {
        try {
          await notifyMemberOfMembershipWelcome({
            brand,
            to: user.email,
            firstName: user.name?.split(" ")[0] ?? null,
            organizationName: org.name,
            disciplineName: discipline.name,
            status: "PENDING",
          })
        } catch (error) {
          console.error("[notify] joinOrganization welcome email failed", {
            membershipId: membership.id,
            error,
          })
        }
      })
    }

    revalidate({ paths: [`/organizations/${org.slug}`] })
    return membership
  })

// ---------------------------------------------------------------------------
// Join Organization by Invite Code
// ---------------------------------------------------------------------------
// Invite link: /organizations/join?code=<inviteCode>
// Creates an INVITED membership (auto-approved to ACTIVE since they had the link).

export const joinByInviteCode = userActionClient
  .inputSchema(joinByInviteCodeSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { inviteCode, disciplineId } = parsedInput

    const org = await db.organization.findUnique({ where: { inviteCode } })
    if (!org) throw new Error("Invalid invite code")

    const existing = await db.membership.findUnique({
      where: {
        userId_organizationId_disciplineId: {
          userId: user.id,
          organizationId: org.id,
          disciplineId,
        },
      },
    })
    if (existing) throw new Error("Already a member of this organization for this discipline")

    const discipline = await db.discipline.findUnique({
      where: { id: disciplineId },
      select: { name: true },
    })

    const membership = await db.membership.create({
      data: {
        brand: org.brand,
        userId: user.id,
        organizationId: org.id,
        disciplineId,
        status: "ACTIVE",
        joinedAt: new Date(),
      },
    })

    // Auto-assign STUDENT role
    const studentRole = await db.role.findFirst({ where: { code: "STUDENT", isSystem: true } })
    if (studentRole) {
      await db.membershipRoleAssignment.create({
        data: { membershipId: membership.id, roleId: studentRole.id },
      })
    }

    if (user.email && discipline) {
      after(async () => {
        try {
          await notifyMemberOfMembershipWelcome({
            brand: org.brand,
            to: user.email,
            firstName: user.name?.split(" ")[0] ?? null,
            organizationName: org.name,
            disciplineName: discipline.name,
            status: "ACTIVE",
          })
        } catch (error) {
          console.error("[notify] joinByInviteCode welcome email failed", {
            membershipId: membership.id,
            error,
          })
        }
      })
    }

    revalidate({ paths: [`/organizations/${org.slug}`] })
    return { membership, org }
  })

// ---------------------------------------------------------------------------
// Update Membership Status (approve / suspend / expire)
// ---------------------------------------------------------------------------
// Only the org owner can transition status.

export const updateMembershipStatus = userActionClient
  .inputSchema(updateMembershipStatusSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { membershipId, status } = parsedInput

    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: {
        organization: true,
        user: { select: { email: true, name: true } },
        discipline: { select: { name: true } },
      },
    })
    if (!membership) throw new Error("Membership not found")

    // Only org owner can change status
    if (membership.organization.ownerId !== user.id) {
      throw new Error("Only the organization owner can update membership status")
    }

    // Validate transitions
    const validTransitions: Record<string, string[]> = {
      INVITED: ["ACTIVE", "EXPIRED"],
      PENDING: ["ACTIVE", "EXPIRED"],
      ACTIVE: ["SUSPENDED", "EXPIRED"],
      SUSPENDED: ["ACTIVE", "EXPIRED"],
      EXPIRED: [], // terminal state
    }
    const allowed = validTransitions[membership.status] ?? []
    if (!allowed.includes(status)) {
      throw new Error(`Cannot transition from ${membership.status} to ${status}`)
    }

    const previousStatus = membership.status

    const updated = await db.membership.update({
      where: { id: membershipId },
      data: {
        status: status as any,
        joinedAt: status === "ACTIVE" && !membership.joinedAt ? new Date() : undefined,
        leftAt: status === "EXPIRED" ? new Date() : undefined,
      },
    })

    if (membership.user.email) {
      after(async () => {
        try {
          await notifyMemberOfMembershipStatusChange({
            brand: membership.brand,
            to: membership.user.email!,
            firstName: membership.user.name?.split(" ")[0] ?? null,
            organizationName: membership.organization.name,
            disciplineName: membership.discipline.name,
            previousStatus,
            newStatus: status as typeof previousStatus,
          })
        } catch (error) {
          console.error("[notify] updateMembershipStatus owner email failed", {
            membershipId,
            error,
          })
        }
      })
    }

    revalidate({ paths: [`/organizations/${membership.organization.slug}`] })
    return updated
  })

// ---------------------------------------------------------------------------
// Assign Role to Membership
// ---------------------------------------------------------------------------

export const assignRole = userActionClient
  .inputSchema(assignRoleSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { membershipId, roleId } = parsedInput

    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: { organization: true },
    })
    if (!membership) throw new Error("Membership not found")
    if (membership.organization.ownerId !== user.id) {
      throw new Error("Only the organization owner can assign roles")
    }

    const assignment = await db.membershipRoleAssignment.create({
      data: { membershipId, roleId },
    })

    revalidate({ paths: [`/organizations/${membership.organization.slug}`] })
    return assignment
  })

// ---------------------------------------------------------------------------
// Remove Role from Membership
// ---------------------------------------------------------------------------

export const removeRole = userActionClient
  .inputSchema(removeRoleSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { membershipId, roleId } = parsedInput

    const membership = await db.membership.findUnique({
      where: { id: membershipId },
      include: { organization: true },
    })
    if (!membership) throw new Error("Membership not found")
    if (membership.organization.ownerId !== user.id) {
      throw new Error("Only the organization owner can remove roles")
    }

    await db.membershipRoleAssignment.delete({
      where: { membershipId_roleId: { membershipId, roleId } },
    })

    revalidate({ paths: [`/organizations/${membership.organization.slug}`] })
    return { success: true }
  })
