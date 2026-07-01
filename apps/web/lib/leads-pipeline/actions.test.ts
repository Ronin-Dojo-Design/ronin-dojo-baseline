/**
 * BBL Lead Pipeline — actions integration test (Slice 6, Petey Plan 0477).
 *
 * Runs the pipeline server actions end-to-end through the safe-action harness (mocks
 * auth/cache/rate-limiter) against real BBL DB fixtures. Proves:
 *   (a) the `leads.manage` permission gate — a non-admin session is REDIRECTED, no write;
 *   (b) `updateLeadStatus` writes the stage + no-ops on an unknown/cross-brand lead;
 *   (c) `createLeadFollowUp` creates a follow-up + nudges NEW → CONTACTED;
 *   (d) the HARD BOUNDARY — `prepareSchoolInvite` with NO recipient creates the invite
 *       link but NEVER calls `notifyUserOfInvite` (no autonomous email send); a recipient
 *       is the ONLY path that sends.
 *
 * Run: cd apps/web && bun run test lib/leads-pipeline/actions.test.ts
 */

import { installSafeActionMocks, setTestSession } from "~/lib/test/safe-action-env"

installSafeActionMocks({ brand: "BBL", host: "baseline.local" })

// @ts-expect-error - bun:test is a Bun runtime module; @types/bun is not a repo dep yet.
import { afterAll, beforeAll, beforeEach, describe, expect, it, mock } from "bun:test"

// Spy on the invite email send so we can PROVE the no-recipient path never fires it.
const notifyInviteMock = mock(async (_params: unknown) => undefined)
mock.module("~/lib/notifications", () => ({
  notifyUserOfInvite: notifyInviteMock,
}))

// `requirePermission` redirects on deny; capture instead of throwing so we can assert it.
const redirectState = { url: "" }
mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    redirectState.url = url
    throw new Error(`REDIRECT:${url}`)
  },
}))

import { Brand } from "~/.generated/prisma/client"
import {
  createLeadFollowUp,
  prepareSchoolInvite,
  updateLeadStatus,
} from "~/lib/leads-pipeline/actions"
import { SCHOOL_OUTREACH_KIND } from "~/server/web/school-lead/emit-school-lead"
import { db } from "~/services/db"

const TS = Date.now()
const PREFIX = `session-0483-pipeline-${TS}`
const tag = (name: string) => `${PREFIX}-${name}`

let adminId = ""
let organizationId = ""
let plainLeadId = ""
let schoolLeadId = ""

beforeAll(async () => {
  const admin = await db.user.create({
    data: { name: tag("admin"), email: `${tag("admin")}@test.local`, role: "admin" },
  })
  adminId = admin.id

  const org = await db.organization.create({
    data: {
      brand: Brand.BBL,
      name: tag("Atlantis BJJ"),
      slug: tag("atlantis-bjj"),
      type: "SCHOOL",
      ownerId: null, // placeholder school org (the flywheel shape)
    },
  })
  organizationId = org.id

  const plain = await db.lead.create({
    data: { brand: Brand.BBL, organizationId, firstName: tag("Alex"), status: "NEW" },
  })
  plainLeadId = plain.id

  const school = await db.lead.create({
    data: {
      brand: Brand.BBL,
      organizationId,
      firstName: tag("Atlantis BJJ"),
      status: "NEW",
      meta: { kind: SCHOOL_OUTREACH_KIND, demandCount: 3 },
    },
  })
  schoolLeadId = school.id
})

afterAll(async () => {
  await db.leadFollowUp.deleteMany({ where: { lead: { organizationId } } })
  await db.lead.deleteMany({ where: { organizationId } })
  await db.invite.deleteMany({ where: { organizationId } })
  await db.auditLog.deleteMany({ where: { organizationId } })
  await db.organization.deleteMany({ where: { id: organizationId } })
  await db.user.deleteMany({ where: { id: adminId } })
})

beforeEach(() => {
  notifyInviteMock.mockClear()
  redirectState.url = ""
  setTestSession({ id: adminId, role: "admin" })
})

describe("permission gate (leads.manage)", () => {
  it("redirects a non-admin session away — no status write", async () => {
    setTestSession({ id: "someone", role: "user" })
    await expect(updateLeadStatus(plainLeadId, "CONTACTED")).rejects.toThrow(/REDIRECT:\/app/)

    const lead = await db.lead.findUnique({ where: { id: plainLeadId }, select: { status: true } })
    expect(lead?.status).toBe("NEW") // untouched
  })
})

describe("updateLeadStatus", () => {
  it("writes a valid stage for a BBL lead", async () => {
    const result = await updateLeadStatus(plainLeadId, "TRIAL_BOOKED")
    expect(result).toEqual({ id: plainLeadId, status: "TRIAL_BOOKED" })
    const lead = await db.lead.findUnique({ where: { id: plainLeadId }, select: { status: true } })
    expect(lead?.status).toBe("TRIAL_BOOKED")
  })

  it("records a lost reason on meta when moving to LOST", async () => {
    await updateLeadStatus(plainLeadId, "LOST", "Chose a rival gym")
    const lead = await db.lead.findUnique({ where: { id: plainLeadId }, select: { meta: true } })
    const meta = (lead?.meta ?? {}) as Record<string, unknown>
    expect(meta.lostReason).toBe("Chose a rival gym")
  })

  it("no-ops (returns null) on an unknown lead", async () => {
    expect(await updateLeadStatus("does-not-exist", "CONTACTED")).toBeNull()
  })

  it("no-ops (returns null) on an invalid stage", async () => {
    // @ts-expect-error — deliberately passing an off-board status to prove the guard.
    expect(await updateLeadStatus(plainLeadId, "NURTURE")).toBeNull()
  })
})

describe("createLeadFollowUp", () => {
  it("creates a follow-up and nudges a still-NEW lead to CONTACTED", async () => {
    // Reset to NEW first (prior test may have moved it).
    await db.lead.update({ where: { id: schoolLeadId }, data: { status: "NEW" } })

    const result = await createLeadFollowUp({ leadId: schoolLeadId, channel: "email", notes: "hi" })
    expect(result).not.toBeNull()

    const [lead, followUps] = await Promise.all([
      db.lead.findUnique({ where: { id: schoolLeadId }, select: { status: true } }),
      db.leadFollowUp.findMany({ where: { leadId: schoolLeadId } }),
    ])
    expect(lead?.status).toBe("CONTACTED")
    expect(followUps.length).toBeGreaterThan(0)
  })
})

describe("prepareSchoolInvite — HARD BOUNDARY (no autonomous email send)", () => {
  it("prepares an invite link WITHOUT sending when no recipient is given", async () => {
    const result = await prepareSchoolInvite({ organizationId })
    expect("error" in result).toBe(false)
    if ("error" in result) return
    expect(result.sent).toBe(false)
    expect(result.inviteCode).toBeTruthy()
    // The boundary: the email seam was NEVER invoked on the no-recipient path.
    expect(notifyInviteMock).not.toHaveBeenCalled()

    const invite = await db.invite.findUnique({ where: { code: result.inviteCode } })
    expect(invite?.organizationId).toBe(organizationId)
  })

  it("sends ONLY when the operator explicitly supplies a recipient", async () => {
    const result = await prepareSchoolInvite({
      organizationId,
      recipientEmail: `${tag("school")}@test.local`,
    })
    expect("error" in result).toBe(false)
    if ("error" in result) return
    expect(result.sent).toBe(true)
    expect(notifyInviteMock).toHaveBeenCalledTimes(1)
  })
})
