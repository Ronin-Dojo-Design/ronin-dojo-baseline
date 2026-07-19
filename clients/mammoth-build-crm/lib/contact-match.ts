/**
 * Contact matching keys — THE ONE dedupe semantic for Mammoth CRM
 * (SESSION_0582, G-021 loop 2).
 *
 * Extracted from lib/lead-ingest.ts so the ingest PREVIEW and the WRITE path
 * (`findOrCreateContact` / `commitLeadSheet` in lib/actions.ts) provably
 * consume the same implementation. Resolves Doug's SESSION_0577 finding #1 —
 * the preview matched case-insensitive email + normalized phone while the
 * write path deduped case-sensitive email only — by WIDENING the write path
 * (operator ratification 2026-07-19, SESSION_0582 grill outcome #1).
 */

/** Case-insensitive email key; a string without "@" is too weak to dedupe on. */
export function emailKey(email: string | null | undefined): string | null {
  const key = (email ?? "").trim().toLowerCase();
  return key.includes("@") ? key : null;
}

/**
 * Digits-only phone key, trimmed to the last 10 digits (US local form) so
 * "+1 (555) 010-0134" and "555-010-0134" collide. Under 7 digits is too weak
 * a signal to dedupe on — treated as no key.
 */
export function phoneKey(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length < 7) return null;
  return digits.length > 10 ? digits.slice(-10) : digits;
}
