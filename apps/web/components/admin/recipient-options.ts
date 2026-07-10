/**
 * Shared recipient shape + picker formatting for admin "pick a user" dialogs
 * (walk-in tournament registration, certificate issuance). Client-safe: pure,
 * no server imports — safe to consume from "use client" dialogs.
 *
 * @added SESSION_0520 — extracted from the identical useMemo in
 *   walk-in-registration-dialog + certificate-issue-dialog (fallow dup);
 *   `findActiveUsers` (server/admin/tournaments/queries.ts) types its return
 *   with `ActiveUser` so picker producers and consumers share one shape.
 * @why the User-id-space contract (NOT passport ids) lives in one place —
 *   the belt promoter pickers are passport-keyed don't-merge twins.
 */
export type ActiveUser = { id: string; name: string | null; email: string }

/** ComboboxSelector options — `Name <email>` (email-only when the user is unnamed). */
export const toRecipientOptions = (users: ActiveUser[]) =>
  users.map(u => ({ id: u.id, name: `${u.name ?? u.email} <${u.email}>` }))
