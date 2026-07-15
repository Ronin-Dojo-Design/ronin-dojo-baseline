import { Brand, LeadSource, LeadStatus, type Prisma } from "~/.generated/prisma/client"
import { fuzzyMatchSchool, normalizeSchoolName } from "~/lib/dedup"
import { db } from "~/services/db"

/**
 * Promoter-outreach lead capture (SESSION_0540) — the PERSON mirror of
 * `emit-school-lead.ts`. When a member backfills a belt and free-types the coach who
 * promoted them (no registered Passport FK), we quietly capture that coach as a
 * recruitment lead so every backfilled belt grows the roster. Idempotent + deduped by
 * the normalized coach name (demand-counted), matching the school-lead shape.
 *
 * ANCHOR DECISION (flagged for ratification): `Lead.organizationId` is a REQUIRED FK,
 * but a promoter is a PERSON, not a school — creating one placeholder Organization per
 * coach would pollute the org/directory space with person-named schools. So every
 * promoter lead hangs off ONE shared, hidden placeholder org ("BBL Coach Outreach",
 * type AFFILIATION, ownerId null) and dedups purely on the coach name in `meta`. The
 * eventual "invite this coach" action is an operator click; this never sends outreach.
 * A future model may anchor promoter leads to a placeholder Passport/LineageNode
 * instead — that is a schema-shaped decision left to Petey/an ADR.
 */

export const PROMOTER_OUTREACH_KIND = "promoter_outreach"
export const PROMOTER_OUTREACH_FOLLOW_UP_NOTE = "auto — pending promoter invite"

/** The single shared bucket org every promoter lead anchors to (see ANCHOR DECISION). */
const COACH_OUTREACH_ORG_SLUG = "bbl-coach-outreach"
const COACH_OUTREACH_ORG_NAME = "BBL Coach Outreach"

const OPEN_LEAD_STATUSES = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.TRIAL_BOOKED,
  LeadStatus.TRIAL_COMPLETED,
  LeadStatus.NURTURE,
] as const

const openPromoterLeadSelect = {
  id: true,
  organizationId: true,
  meta: true,
} satisfies Prisma.LeadSelect

type OpenPromoterLead = Prisma.LeadGetPayload<{ select: typeof openPromoterLeadSelect }>
type PromoterLeadTransaction = Pick<typeof db, "lead" | "organization" | "leadFollowUp">

type PromoterLeadMetaOptions = {
  promoterName: string
  source: string
  now: Date
}

type EmitPromoterLeadInput = {
  promoterName: string
  source: string
}

export type EmitPromoterLeadResult = {
  organizationId: string
  leadId: string
  demandCount: number
  createdLead: boolean
  matchedBy: "lead" | "none"
}

const openLeadWhere = {
  brand: Brand.BBL,
  status: { in: [...OPEN_LEAD_STATUSES] },
  meta: { path: ["kind"], equals: PROMOTER_OUTREACH_KIND },
} satisfies Prisma.LeadWhereInput

function jsonRecord(meta: Prisma.JsonValue | null | undefined): Record<string, unknown> {
  return meta && typeof meta === "object" && !Array.isArray(meta)
    ? (meta as Record<string, unknown>)
    : {}
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : []
}

function uniqueWithLatestFirst(values: string[]): string[] {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))
}

function demandCountFromMeta(meta: Prisma.JsonValue | null | undefined): number {
  const count = jsonRecord(meta).demandCount
  return typeof count === "number" && Number.isFinite(count) && count > 0 ? count : 0
}

function buildPromoterLeadMeta(
  currentMeta: Prisma.JsonValue | null | undefined,
  options: PromoterLeadMetaOptions,
): Prisma.InputJsonObject {
  const record = jsonRecord(currentMeta)
  const nowIso = options.now.toISOString()
  const nextDemandCount = demandCountFromMeta(currentMeta) + 1
  const sources = uniqueWithLatestFirst([options.source, ...stringArray(record.sources)])

  return {
    ...record,
    kind: PROMOTER_OUTREACH_KIND,
    promoterName: options.promoterName,
    promoterNameNormalized: normalizeSchoolName(options.promoterName),
    demandCount: nextDemandCount,
    firstDemandAt: typeof record.firstDemandAt === "string" ? record.firstDemandAt : nowIso,
    lastDemandAt: nowIso,
    sources,
  } satisfies Prisma.InputJsonObject
}

function promoterLeadName(lead: OpenPromoterLead): string {
  const metaName = jsonRecord(lead.meta).promoterName
  return typeof metaName === "string" ? metaName : ""
}

function resultFromLead(
  lead: Pick<OpenPromoterLead, "id" | "organizationId" | "meta">,
  flags: Pick<EmitPromoterLeadResult, "createdLead" | "matchedBy">,
): EmitPromoterLeadResult {
  return {
    organizationId: lead.organizationId,
    leadId: lead.id,
    demandCount: demandCountFromMeta(lead.meta),
    ...flags,
  }
}

async function findMatchedOpenLead(
  tx: PromoterLeadTransaction,
  promoterName: string,
): Promise<OpenPromoterLead | null> {
  const openLeads = await tx.lead.findMany({
    where: openLeadWhere,
    select: openPromoterLeadSelect,
  })

  return (
    fuzzyMatchSchool(
      promoterName,
      openLeads.map(lead => ({ name: promoterLeadName(lead), lead })),
    )?.lead ?? null
  )
}

/** Find-or-create the single shared coach-outreach bucket org. Upsert on the fixed
 *  compound-unique slug so concurrent first writes never collide (see ANCHOR DECISION). */
async function getCoachOutreachOrgId(tx: PromoterLeadTransaction): Promise<string> {
  const org = await tx.organization.upsert({
    where: { brand_slug: { brand: Brand.BBL, slug: COACH_OUTREACH_ORG_SLUG } },
    create: {
      brand: Brand.BBL,
      name: COACH_OUTREACH_ORG_NAME,
      slug: COACH_OUTREACH_ORG_SLUG,
      type: "AFFILIATION",
      ownerId: null,
    },
    update: {},
    select: { id: true },
  })
  return org.id
}

async function bumpPromoterLead(
  tx: PromoterLeadTransaction,
  lead: OpenPromoterLead,
  options: PromoterLeadMetaOptions,
): Promise<EmitPromoterLeadResult> {
  const updated = await tx.lead.update({
    where: { id: lead.id },
    data: { meta: buildPromoterLeadMeta(lead.meta, options) },
    select: openPromoterLeadSelect,
  })

  return resultFromLead(updated, { createdLead: false, matchedBy: "lead" })
}

async function createPromoterLead(
  tx: PromoterLeadTransaction,
  organizationId: string,
  options: PromoterLeadMetaOptions,
): Promise<EmitPromoterLeadResult> {
  const createdLead = await tx.lead.create({
    data: {
      brand: Brand.BBL,
      organizationId,
      source: LeadSource.OTHER,
      firstName: options.promoterName,
      email: null,
      notes: `Coach outreach demand captured from ${options.source}.`,
      meta: buildPromoterLeadMeta(null, options),
    },
    select: openPromoterLeadSelect,
  })

  await tx.leadFollowUp.create({
    data: {
      leadId: createdLead.id,
      channel: "email",
      notes: PROMOTER_OUTREACH_FOLLOW_UP_NOTE,
    },
  })

  return resultFromLead(createdLead, { createdLead: true, matchedBy: "none" })
}

export async function emitPromoterLead(
  input: EmitPromoterLeadInput,
): Promise<EmitPromoterLeadResult | null> {
  const promoterName = input.promoterName.trim()
  if (!promoterName) return null

  const options = {
    promoterName,
    source: input.source.trim() || "unknown",
    now: new Date(),
  } satisfies PromoterLeadMetaOptions

  return db.$transaction(async tx => {
    const matchedOpenLead = await findMatchedOpenLead(tx, promoterName)
    if (matchedOpenLead) return bumpPromoterLead(tx, matchedOpenLead, options)

    const organizationId = await getCoachOutreachOrgId(tx)
    return createPromoterLead(tx, organizationId, options)
  })
}
