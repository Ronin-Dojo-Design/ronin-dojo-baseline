"use server"

import { after } from "next/server"
import { Brand } from "~/.generated/prisma/client"
import { adminActionClient } from "~/lib/safe-actions"
import { followUpFormSchema, leadFormSchema } from "~/server/admin/leads/schema"
import { idSchema, idsSchema } from "~/server/admin/shared/schema"
import { leadPayload } from "~/server/web/lead/payloads"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"

// ---------------------------------------------------------------------------
// Upsert lead (admin create / edit)
// Brand-validated on update per ADR 0004.
// ---------------------------------------------------------------------------

export const upsertLead = adminActionClient
  .inputSchema(leadFormSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const { id, programId, ...input } = parsedInput

    // Validate org belongs to current brand
    const org = await db.organization.findFirst({
      where: { id: input.organizationId, brand: Brand.BBL },
      select: { id: true, brand: true },
    })

    if (!org) {
      throw new Error("Organization not found for this brand")
    }

    const data = {
      ...input,
      programId: programId || null,
      lastName: input.lastName || null,
      email: input.email || null,
      phoneE164: input.phoneE164 || null,
      notes: input.notes || null,
      referredBy: input.referredBy || null,
    }

    const lead = id
      ? await db.lead.update({
          where: { id },
          data,
          select: leadPayload,
        })
      : await db.lead.create({
          data: { ...data, brand: Brand.BBL },
          select: leadPayload,
        })

    after(async () => {
      await writeSchoolOpsAudit({
        brand: Brand.BBL,
        userId: user.id,
        organizationId: org.id,
        entityType: "Lead",
        entityId: lead.id,
        action: id ? "lead.updated" : "lead.created",
        after: { id: lead.id, status: lead.status, source: lead.source },
      })

      revalidate({
        paths: ["/app/leads"],
        tags: ["leads", `lead-${lead.id}`],
      })
    })

    return lead
  })

// ---------------------------------------------------------------------------
// Delete leads (bulk)
// ---------------------------------------------------------------------------

export const deleteLeads = adminActionClient
  .inputSchema(idsSchema)
  .action(async ({ parsedInput: { ids }, ctx: { user, db, revalidate } }) => {
    // Only delete leads belonging to this brand
    const leads = await db.lead.findMany({
      where: { id: { in: ids }, brand: Brand.BBL },
      select: { id: true, organizationId: true },
    })

    await db.lead.deleteMany({
      where: { id: { in: leads.map(l => l.id) } },
    })

    after(async () => {
      for (const lead of leads) {
        await writeSchoolOpsAudit({
          brand: Brand.BBL,
          userId: user.id,
          organizationId: lead.organizationId,
          entityType: "Lead",
          entityId: lead.id,
          action: "lead.deleted",
        })
      }

      revalidate({
        paths: ["/app/leads"],
        tags: ["leads"],
      })
    })

    return true
  })

// ---------------------------------------------------------------------------
// Status transitions
// ---------------------------------------------------------------------------

export const markLeadLost = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { user, db, revalidate } }) => {
    const lead = await db.lead.update({
      where: { id },
      data: { status: "LOST" },
      select: leadPayload,
    })

    after(async () => {
      await writeSchoolOpsAudit({
        brand: Brand.BBL,
        userId: user.id,
        organizationId: lead.organizationId,
        entityType: "Lead",
        entityId: id,
        action: "lead.marked_lost",
      })

      revalidate({
        paths: ["/app/leads"],
        tags: ["leads", `lead-${id}`],
      })
    })

    return lead
  })

export const markLeadNurture = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { user, db, revalidate } }) => {
    const lead = await db.lead.update({
      where: { id },
      data: { status: "NURTURE" },
      select: leadPayload,
    })

    after(async () => {
      await writeSchoolOpsAudit({
        brand: Brand.BBL,
        userId: user.id,
        organizationId: lead.organizationId,
        entityType: "Lead",
        entityId: id,
        action: "lead.marked_nurture",
      })

      revalidate({
        paths: ["/app/leads"],
        tags: ["leads", `lead-${id}`],
      })
    })

    return lead
  })

// ---------------------------------------------------------------------------
// Follow-up CRUD
// ---------------------------------------------------------------------------

export const createFollowUp = adminActionClient
  .inputSchema(followUpFormSchema)
  .action(async ({ parsedInput, ctx: { user, db, revalidate } }) => {
    const followUp = await db.leadFollowUp.create({
      data: {
        leadId: parsedInput.leadId,
        channel: parsedInput.channel,
        notes: parsedInput.notes || null,
        scheduledAt: parsedInput.scheduledAt ?? null,
        assignedToId: parsedInput.assignedToId || null,
      },
    })

    // Mark lead as CONTACTED if still NEW
    await db.lead.updateMany({
      where: { id: parsedInput.leadId, status: "NEW" },
      data: { status: "CONTACTED" },
    })

    after(async () => {
      const lead = await db.lead.findUnique({
        where: { id: parsedInput.leadId },
        select: { organizationId: true },
      })

      if (lead) {
        await writeSchoolOpsAudit({
          brand: Brand.BBL,
          userId: user.id,
          organizationId: lead.organizationId,
          entityType: "LeadFollowUp",
          entityId: followUp.id,
          action: "followup.created",
          after: { channel: parsedInput.channel, leadId: parsedInput.leadId },
        })
      }

      revalidate({
        paths: ["/app/leads"],
        tags: ["leads", `lead-${parsedInput.leadId}`],
      })
    })

    return followUp
  })

export const completeFollowUp = adminActionClient
  .inputSchema(idSchema)
  .action(async ({ parsedInput: { id }, ctx: { user, db, revalidate } }) => {
    const followUp = await db.leadFollowUp.update({
      where: { id },
      data: { completedAt: new Date() },
    })

    after(async () => {
      const lead = await db.lead.findUnique({
        where: { id: followUp.leadId },
        select: { organizationId: true },
      })

      if (lead) {
        await writeSchoolOpsAudit({
          brand: Brand.BBL,
          userId: user.id,
          organizationId: lead.organizationId,
          entityType: "LeadFollowUp",
          entityId: id,
          action: "followup.completed",
        })
      }

      revalidate({
        paths: ["/app/leads"],
        tags: ["leads", `lead-${followUp.leadId}`],
      })
    })

    return followUp
  })
