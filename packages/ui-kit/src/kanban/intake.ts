/**
 * Lead intake (PWCC-007) — one short form → a card in the `intake:true` stage.
 *
 * Pure: dedupe by phone/email, stamp the source, drop into stage[0 with intake].
 * No fetch — the board persists through the BoardStore port (D2).
 */

import type { BoardCard, BoardConfig, CardContact } from "./types"

export interface LeadInput {
  title: string
  contact?: CardContact
  /** Where the lead came from — stamped for reporting (web/manual/email). */
  source?: string
  note?: string
  /** Optional domain attributes that ride along in the card's open bag. */
  fields?: Record<string, unknown>
}

export type IntakeResult =
  | { ok: true; card: BoardCard }
  | { ok: false; reason: "duplicate"; existingId: string; message: string }

/** The stage a new lead drops into = the first stage flagged `intake`, else stage[0]. */
export function intakeStageId(config: BoardConfig): string {
  const intake = config.stages.find(s => s.intake)
  const fallback = config.stages[0]
  return (intake ?? fallback)?.id ?? "new"
}

function norm(s?: string): string {
  return (s ?? "").trim().toLowerCase()
}

/** True when two contacts share a non-empty phone or email. */
export function isDuplicateContact(a?: CardContact, b?: CardContact): boolean {
  if (!a || !b) {
    return false
  }
  const aPhone = norm(a.phone).replace(/[^\d]/g, "")
  const bPhone = norm(b.phone).replace(/[^\d]/g, "")
  if (aPhone && bPhone && aPhone === bPhone) {
    return true
  }
  const aEmail = norm(a.email)
  const bEmail = norm(b.email)
  return Boolean(aEmail && bEmail && aEmail === bEmail)
}

let counter = 0
function genId(prefix = "c"): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`
}

/**
 * Create a lead card. Dedupes against existing cards by phone/email; on a hit
 * returns a typed rejection instead of a duplicate. Source is stamped; the card
 * lands in the intake stage with `active` lifecycle.
 */
export function createLead(
  input: LeadInput,
  existing: BoardCard[],
  config: BoardConfig,
  now: number = Date.now(),
): IntakeResult {
  if (input.contact) {
    const dup = existing.find(c => isDuplicateContact(c.contact, input.contact))
    if (dup) {
      return {
        ok: false,
        reason: "duplicate",
        existingId: dup.id,
        message: `A lead with that ${input.contact.email ? "email" : "phone"} already exists.`,
      }
    }
  }

  const iso = new Date(now).toISOString()
  const card: BoardCard = {
    id: genId(),
    stage: intakeStageId(config),
    title: input.title.trim(),
    status: "active",
    nextStep: "",
    source: input.source ?? "manual",
    contact: input.contact,
    fields: input.fields,
    createdAt: iso,
    updatedAt: iso,
  }
  return { ok: true, card }
}
