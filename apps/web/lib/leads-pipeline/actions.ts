"use server"

/**
 * BBL Lead Pipeline — server actions (Slice 6, Petey Plan 0477).
 *
 * The kernel `AdminKanban` persists through the `BoardStore` port (ADR 0033 D2); the
 * board-store adapter (`board-store-db.ts`) calls these. Every action re-asserts
 * `leads.manage` (defense-in-depth behind the route layout gate) and writes over BBL's
 * OWN `Lead`/`LeadFollowUp`/`Organization` models — NOTHING from `clients/mammoth-build-crm`
 * (ADR 0034/0038: share the kernel, not the data).
 *
 * Reuse of the `server/admin/leads/*` seam: the status/follow-up writes mirror
 * `markLeadLost` / `createFollowUp` (same `writeSchoolOpsAudit` + status-nudge logic),
 * scoped to `Brand.BBL`. A `"use server"` module may only export async functions —
 * the pure row↔card mappers live in `./board-config`.
 */

import { revalidatePath } from "next/cache"
import { Brand } from "~/.generated/prisma/client"
import { requirePermission } from "~/lib/auth-guard"
import { notifyUserOfInvite } from "~/lib/notifications"
import { createOrgInvite } from "~/server/web/organization/invite-actions"
import { APP_AREA_PERMISSIONS } from "~/server/orpc/roles"
import { writeSchoolOpsAudit } from "~/server/web/school-ops/audit"
import { db } from "~/services/db"
import { isPipelineStageId, type PipelineStageId } from "./board-config"

const PIPELINE_PATH = "/app/leads-pipeline"

/** Gate every pipeline action on `leads.manage` (the same permission the layout enforces). */
async function requireLeadsAccess() {
  return requirePermission(APP_AREA_PERMISSIONS.leads)
}

/** Load a BBL-scoped lead the caller may act on, or `null`. Cross-brand rows are invisible. */
async function findBblLead(leadId: string) {
  return db.lead.findFirst({
    where: { id: leadId, brand: Brand.BBL },
    select: { id: true, status: true, organizationId: true, meta: true },
  })
}

function metaRecord(meta: unknown): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

/**
 * Move a lead to a new pipeline stage — the drag/status write. The stage id IS the
 * `LeadStatus` (board stages mirror the enum), so this is a scoped status update.
 * `LOST` optionally records a reason on `meta.lostReason` (the kernel's `lost-reason`
 * automation supplies it; "no silent drops"). Returns the updated status, or `null`
 * for an unknown/cross-brand lead or an invalid stage (a clean no-op, not a throw).
 */
export async function updateLeadStatus(
  leadId: string,
  stage: PipelineStageId,
  lostReason?: string | null,
): Promise<{ id: string; status: PipelineStageId } | null> {
  const user = await requireLeadsAccess()

  if (!isPipelineStageId(stage)) {
    return null
  }

  const lead = await findBblLead(leadId)
  if (!lead) {
    return null
  }

  const reason = lostReason?.trim()
  const nextMeta =
    stage === "LOST" && reason ? { ...metaRecord(lead.meta), lostReason: reason } : undefined

  const updated = await db.lead.update({
    where: { id: lead.id },
    data: { status: stage, ...(nextMeta ? { meta: nextMeta } : {}) },
    select: { id: true, status: true },
  })

  await writeSchoolOpsAudit({
    brand: Brand.BBL,
    userId: user.id,
    organizationId: lead.organizationId,
    entityType: "Lead",
    entityId: lead.id,
    action: "lead.pipeline_stage_changed",
    before: { status: lead.status },
    after: { status: stage, ...(reason ? { lostReason: reason } : {}) },
  })

  revalidatePath(PIPELINE_PATH)
  return { id: updated.id, status: updated.status as PipelineStageId }
}

/**
 * Log a follow-up on a lead (reuses the `admin/leads` follow-up semantics): create a
 * `LeadFollowUp`, and nudge a still-`NEW` lead to `CONTACTED` (first-touch). Scoped to
 * BBL. Returns the follow-up id, or `null` for an unknown/cross-brand lead.
 */
export async function createLeadFollowUp(input: {
  leadId: string
  channel: string
  notes?: string | null
  scheduledAt?: Date | null
  assignedToId?: string | null
}): Promise<{ id: string } | null> {
  const user = await requireLeadsAccess()

  const channel = input.channel.trim()
  if (!channel) {
    return null
  }

  const lead = await findBblLead(input.leadId)
  if (!lead) {
    return null
  }

  const followUp = await db.leadFollowUp.create({
    data: {
      leadId: lead.id,
      channel,
      notes: input.notes?.trim() || null,
      scheduledAt: input.scheduledAt ?? null,
      assignedToId: input.assignedToId?.trim() || null,
    },
    select: { id: true },
  })

  // First-touch nudge: a still-NEW lead becomes CONTACTED (mirrors admin/leads createFollowUp).
  await db.lead.updateMany({
    where: { id: lead.id, status: "NEW" },
    data: { status: "CONTACTED" },
  })

  await writeSchoolOpsAudit({
    brand: Brand.BBL,
    userId: user.id,
    organizationId: lead.organizationId,
    entityType: "LeadFollowUp",
    entityId: followUp.id,
    action: "followup.created",
    after: { channel, leadId: lead.id },
  })

  revalidatePath(PIPELINE_PATH)
  return { id: followUp.id }
}

/**
 * Prepare an org invite for a school-outreach lead's placeholder `Organization` —
 * the flywheel's payoff. This WIRES the invite seam (the EXISTING `createOrgInvite`
 * + `notifyUserOfInvite`) but is **operator-triggered ONLY** (a button click), and
 * the email send is GATED behind an explicit `recipientEmail` (HARD BOUNDARY, Petey
 * Plan 0477 §HARD BOUNDARY: no autonomous email sends). A no-recipient call PREPARES
 * the invite (creates the link) and returns without ever calling `notifyUserOfInvite`;
 * the send is a second, explicit operator step.
 *
 * `createOrgInvite` self-authorizes via `assertOrgAdminAccess` — a platform admin
 * (role `admin` = the operator, Brian + Tony) is authorized for any org including a
 * placeholder (`ownerId: null`) school org.
 */
export async function prepareSchoolInvite(input: {
  organizationId: string
  recipientEmail?: string | null
}): Promise<{ inviteCode: string; sent: boolean } | { error: string }> {
  const user = await requireLeadsAccess()

  const org = await db.organization.findFirst({
    where: { id: input.organizationId, brand: Brand.BBL },
    select: { id: true, name: true, brand: true },
  })
  if (!org) {
    return { error: "Organization not found" }
  }

  // Reuse the EXISTING invite seam (own authz + rate-limit inside). next-safe-action
  // returns an envelope; unwrap `.data` (the created Invite) or surface its error.
  const result = await createOrgInvite({ organizationId: org.id })
  const invite = result?.data
  if (!invite) {
    return { error: result?.serverError ?? "Failed to create invite" }
  }

  await writeSchoolOpsAudit({
    brand: Brand.BBL,
    userId: user.id,
    organizationId: org.id,
    entityType: "Invite",
    entityId: invite.id,
    action: "school_invite.prepared",
    after: { inviteCode: invite.code },
  })

  // HARD BOUNDARY: only send when the operator explicitly supplies a recipient. A
  // no-recipient call just prepares the link — the send is a deliberate second click.
  const recipient = input.recipientEmail?.trim()
  if (!recipient) {
    revalidatePath(PIPELINE_PATH)
    return { inviteCode: invite.code, sent: false }
  }

  await notifyUserOfInvite({
    brand: org.brand,
    to: recipient,
    organizationName: org.name,
    inviteCode: invite.code,
    expiresAt: invite.expiresAt,
  })

  await writeSchoolOpsAudit({
    brand: Brand.BBL,
    userId: user.id,
    organizationId: org.id,
    entityType: "Invite",
    entityId: invite.id,
    action: "school_invite.sent",
    after: { to: recipient, inviteCode: invite.code },
  })

  revalidatePath(PIPELINE_PATH)
  return { inviteCode: invite.code, sent: true }
}
