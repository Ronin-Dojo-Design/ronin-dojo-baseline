"use server";

/**
 * Baseline — server-side data layer (ADR 0038 Phase 2).
 *
 * Two surfaces, one clear boundary:
 *   - `createLead` is PUBLIC / un-authenticated — that's how a prospect submits
 *     the inquiry funnel (they're not logged in). It's the ONLY public export;
 *     it validates hard and returns only a success/id (never admin data).
 *   - every other export is AUTH-GATED (`requireAuth`): the admin Leads board.
 *     Baseline is single-tenant (one school), so the session IS the owner — there
 *     is NO per-lead ownership scoping / IDOR layer (unlike Mammoth's TeamMember).
 *
 * Every export in this "use server" module MUST be an async function (Next
 * server-action rule); DTOs live in lib/types.ts, helpers are local non-exports.
 */

import { db } from "./db";
import { getServerSession } from "./auth";
import { LeadStatus, type Lead } from "../.generated/prisma/client";
import type { BoardCard } from "@ronin-dojo/ui-kit/kanban";
import type { CreateLeadInput, CreateLeadResult, LeadRecord, LeadStatusValue } from "./types";

// ---------------------------------------------------------------------------
// Validation + read-model helpers (non-exported)
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CAP = { name: 120, email: 200, phone: 40, interest: 120, message: 2000 } as const;

/** Trim + hard length-cap a free-text field (defense against oversized public input). */
function clean(value: string | undefined, cap: number): string {
  return (value ?? "").trim().slice(0, cap);
}

/** Runtime allow-list of valid stage ids (= LeadStatus enum members). */
const VALID_STATUS = new Set<string>(Object.values(LeadStatus));

/** Coerce a board card's stage to a valid LeadStatus, defaulting unknowns to NEW. */
function toStatus(stage: string): LeadStatusValue {
  return (VALID_STATUS.has(stage) ? stage : LeadStatus.NEW) as LeadStatusValue;
}

/** DB row → the flat, serialization-safe read-model the admin surface consumes. */
function toRecord(row: Lead): LeadRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    interest: row.interest,
    message: row.message,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Auth gate (ADR 0038 D5 — per-product identity)
// ---------------------------------------------------------------------------

/** Thrown when a gated action runs without an authenticated session. */
class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized: sign in to access the Baseline admin board.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Require an authenticated session. Single-tenant: any signed-in staff user may
 * act on the shared lead pipeline — there is no per-row ownership to scope to.
 * Throws `UnauthorizedError` when unauthenticated (no anonymous reads/writes).
 */
async function requireAuth(): Promise<void> {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
}

// ---------------------------------------------------------------------------
// PUBLIC funnel (un-authenticated) — the ONLY public export
// ---------------------------------------------------------------------------

/**
 * Public inquiry capture. Un-authenticated by design (prospects aren't logged
 * in). Validates loud, inserts a `NEW` web_form Lead, and returns only the new
 * id — never any admin/pipeline data.
 */
export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const name = clean(input.name, CAP.name);
  const email = clean(input.email, CAP.email).toLowerCase();

  if (!name) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const lead = await db.lead.create({
    data: {
      name,
      email,
      phone: clean(input.phone, CAP.phone) || null,
      interest: clean(input.interest, CAP.interest) || null,
      message: clean(input.message, CAP.message) || null,
      status: LeadStatus.NEW,
      source: "web_form",
    },
    select: { id: true },
  });

  return { ok: true, id: lead.id };
}

// ---------------------------------------------------------------------------
// AUTH-GATED admin board actions
// ---------------------------------------------------------------------------

/** All leads for the admin pipeline board (newest first). Session required. */
export async function listLeads(): Promise<LeadRecord[]> {
  await requireAuth();
  const rows = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toRecord);
}

/** Move a lead to a new pipeline stage. Session required. */
export async function setLeadStatus(id: string, status: LeadStatusValue): Promise<LeadRecord> {
  await requireAuth();
  const row = await db.lead.update({ where: { id }, data: { status } });
  return toRecord(row);
}

// ---------------------------------------------------------------------------
// Board reconcile (the AdminKanban BoardStore.save path)
// ---------------------------------------------------------------------------

/**
 * Reconcile the kernel board's cards back into Lead rows (ADR 0033 D2). Existing
 * lead → update its stage/title; a board-originated card (intake / quick-add) →
 * create a Lead, PRESERVING the kernel card id so subsequent saves UPDATE, not
 * duplicate. Session required.
 */
export async function reconcileBoard(cards: BoardCard[]): Promise<void> {
  await requireAuth();
  for (const card of cards) {
    const status = toStatus(card.stage);
    const existing = await db.lead.findUnique({ where: { id: card.id }, select: { id: true } });
    if (existing) {
      // Board-mutable fields only: the stage move + a card rename.
      await db.lead.update({ where: { id: card.id }, data: { status, name: card.title } });
    } else {
      await db.lead.create({
        data: {
          id: card.id, // preserve the kernel card id so re-saves UPDATE, not dupe
          name: card.title,
          // Lead.email is required; an intake card carries a contact, a bare
          // quick-add may not — fall back to empty so the board create never fails.
          email: card.contact?.email?.trim().toLowerCase() || "",
          phone: card.contact?.phone?.trim() || null,
          status,
          source: card.source ?? "board",
        },
      });
    }
  }
}
