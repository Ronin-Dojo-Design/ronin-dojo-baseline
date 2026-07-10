/**
 * Shared recipient shape + picker formatting for admin "pick a user" dialogs
 * (walk-in tournament registration, certificate issuance). Client-safe: pure,
 * no server imports — safe to consume from "use client" dialogs.
 */
export type ActiveUser = { id: string; name: string | null; email: string }

/** ComboboxSelector options — `Name <email>` (email-only when the user is unnamed). */
export const toRecipientOptions = (users: ActiveUser[]) =>
  users.map(u => ({ id: u.id, name: `${u.name ?? u.email} <${u.email}>` }))
