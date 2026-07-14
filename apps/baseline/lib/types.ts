/**
 * Baseline — shared DTOs for the Lead funnel + admin board.
 *
 * Kept in their OWN module (not lib/actions.ts) so the `"use server"` action
 * module exports only async functions (Next server-action rule) — mirrors
 * Mammoth's lib/types.ts split. These are serialization-safe (ISO string dates,
 * plain unions) so they cross the server-action boundary and feed the kernel
 * BoardCard without pulling the generated Prisma client into client components.
 */

/** The Lead pipeline stages — mirrors the `LeadStatus` enum (prisma/schema.prisma). */
export type LeadStatusValue = "NEW" | "CONTACTED" | "TRIAL_BOOKED" | "ENROLLED" | "CLOSED";

/** Payload for the PUBLIC inquiry funnel (createLead). All strings; validated server-side. */
export interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message?: string;
}

/** createLead result — success + the new id, or a validation error. No admin data. */
export type CreateLeadResult = { ok: true; id: string } | { ok: false; error: string };

/** A Lead projected for the admin surface (ISO dates; the flat read-model). */
export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string | null;
  status: LeadStatusValue;
  source: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
