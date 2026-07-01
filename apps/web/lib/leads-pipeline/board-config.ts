/**
 * BBL Lead Pipeline — the ONE per-board file (Slice 6, Petey Plan 0477).
 *
 * This is the whole "BBL leads instance" of AdminKanban: a pure `BoardConfig` (data,
 * no code) + a `PipelineLead → BoardCard` mapper — the SAME config-driven pattern
 * Mammoth (`clients/mammoth-build-crm/lib/board-config.ts`) and BBL's own loop-board
 * (`apps/web/lib/loop-board/board-config.ts`) already use. No board logic lives here;
 * columns, drag, and rendering all come from `@ronin-dojo/ui-kit/kanban`.
 *
 * Doctrine (ADR 0034/0038): share the KERNEL, not the DATA. The cards are projected
 * from BBL's OWN `Lead` rows (via `PipelineLead`) — no cross-product FKs, nothing
 * from `clients/mammoth-build-crm`.
 */

import type { BoardCard, BoardConfig, MCardBadge } from "@ronin-dojo/ui-kit"
import { LeadStatus } from "~/.generated/prisma/browser"
import { LEADS_PIPELINE_CONFIG_ID, type PipelineLead } from "./types"

export { LEADS_PIPELINE_CONFIG_ID }

/**
 * The four board stage ids (columns), in the plan's order:
 * NEW → TRIAL_BOOKED → CONTACTED → CONVERTED → LOST. Stage ids ARE the underlying
 * `LeadStatus` values so a drag maps 1:1 to a status write (no translation table).
 */
export const PIPELINE_STAGE_IDS = [
  LeadStatus.NEW,
  LeadStatus.TRIAL_BOOKED,
  LeadStatus.CONTACTED,
  LeadStatus.CONVERTED,
  LeadStatus.LOST,
] as const

export type PipelineStageId = (typeof PIPELINE_STAGE_IDS)[number]

const STAGE_ID_SET = new Set<string>(PIPELINE_STAGE_IDS)

/** Type guard: is a raw stage id a valid board (and thus writable `LeadStatus`) stage? */
export function isPipelineStageId(stage: string): stage is PipelineStageId {
  return STAGE_ID_SET.has(stage)
}

/**
 * The BBL lead statuses that DON'T map to a board column (`TRIAL_COMPLETED`,
 * `NURTURE`). They collapse onto the nearest workable column so no lead is
 * invisible: a completed trial is still an active deal (→ CONTACTED), and a
 * nurture lead is an active-but-parked deal (→ NEW). The board never WRITES these
 * (the store only writes `PipelineStageId`), so the collapse is read-only.
 */
const NON_COLUMN_STATUS_TO_STAGE: Record<string, PipelineStageId> = {
  [LeadStatus.TRIAL_COMPLETED]: LeadStatus.CONTACTED,
  [LeadStatus.NURTURE]: LeadStatus.NEW,
}

/** The board stage a lead's status renders in (columnizing the off-board statuses). */
export function stageForStatus(status: LeadStatus): PipelineStageId {
  if (isPipelineStageId(status)) {
    return status
  }
  return NON_COLUMN_STATUS_TO_STAGE[status] ?? LeadStatus.NEW
}

/**
 * Pure `BoardConfig` (ADR 0033 D5) — stages + the terminal/reason-on-lost attributes
 * the generic kernel engine interprets. `LOST` is `terminal + reasonOnLost` so a lead
 * can't be silently dropped (the kernel's `lost-reason` automation requires a reason),
 * mirroring Mammoth's Closed-Lost. `NEW` is the intake column.
 */
export const LEADS_PIPELINE_BOARD: BoardConfig = {
  id: LEADS_PIPELINE_CONFIG_ID,
  title: "BBL · Lead Pipeline",
  brand: "bbl",
  cardKind: "deal",
  stages: [
    {
      id: LeadStatus.NEW,
      name: "New",
      gate: "Fresh lead — first touch owed",
      intake: true,
      sla: 2,
    },
    {
      id: LeadStatus.TRIAL_BOOKED,
      name: "Trial Booked",
      gate: "Trial class scheduled",
      sla: 5,
    },
    { id: LeadStatus.CONTACTED, name: "Contacted", gate: "Outreach in progress", sla: 7 },
    { id: LeadStatus.CONVERTED, name: "Converted", gate: "Became a member", terminal: true },
    {
      id: LeadStatus.LOST,
      name: "Lost",
      gate: "Reason required (no silent drops)",
      terminal: true,
      reasonOnLost: true,
    },
  ],
  automations: ["rotting", "next-step-reminder", "stage-sla", "lost-reason"],
}

/**
 * The "Schools to invite" queue — Slice 1's school-outreach demand rows
 * (`Lead.meta.kind === "school_outreach"`), ranked by demand-count (highest first).
 * These are the flywheel's captured demand: schools members named that don't yet
 * exist, waiting on an operator invite. Surfaced as a demand-ranked list the route
 * renders ALONGSIDE the board (the kernel has no swimlane primitive, so ranking rides
 * the `order` field on the cards and this helper drives the sidebar rail).
 */
export function schoolOutreachQueue(leads: PipelineLead[]): PipelineLead[] {
  return leads
    .filter(lead => lead.isSchoolOutreach)
    .sort(
      (a, b) =>
        b.demandCount - a.demandCount ||
        b.createdAt.localeCompare(a.createdAt) ||
        a.id.localeCompare(b.id),
    )
}

/** Compact, informative source badge — school-outreach demand vs a plain lead. */
function sourceBadges(lead: PipelineLead): MCardBadge[] {
  if (!lead.isSchoolOutreach) {
    return []
  }
  const badges: MCardBadge[] = [{ label: "School outreach", tone: "accent" }]
  if (lead.demandCount > 1) {
    badges.push({ label: `${lead.demandCount}× demand`, tone: "positive" })
  }
  return badges
}

/**
 * Map one BBL `PipelineLead` to a kernel `BoardCard`. School-outreach cards carry
 * their demand-count as the focal `value` (so the busiest schools read loudest) and
 * a negated `order` so higher demand sorts to the top of its column.
 */
export function pipelineLeadToCard(lead: PipelineLead): BoardCard {
  const badges = sourceBadges(lead)
  return {
    id: lead.id,
    stage: stageForStatus(lead.status),
    title: lead.title,
    status: "active",
    ...(lead.isSchoolOutreach ? { value: lead.demandCount, order: -lead.demandCount } : {}),
    contact:
      lead.contactName || lead.contactEmail
        ? { name: lead.contactName ?? undefined, email: lead.contactEmail ?? undefined }
        : undefined,
    ...(lead.lostReason ? { lostReason: lead.lostReason } : {}),
    ...(badges.length > 0 ? { badges } : {}),
    fields: {
      organizationId: lead.organizationId,
      organizationName: lead.organizationName,
      isSchoolOutreach: lead.isSchoolOutreach,
      demandCount: lead.demandCount,
    },
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }
}

/** Map the full lead set to board cards (order preserved). */
export function pipelineLeadsToCards(leads: PipelineLead[]): BoardCard[] {
  return leads.map(pipelineLeadToCard)
}
