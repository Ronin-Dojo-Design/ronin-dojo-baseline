---
title: "ADR 0020 - Registration recipient is userId XOR (guestEmail, guestName), keyed by recipientKey"
slug: adr-0020
type: adr
status: accepted
created: 2026-05-26
updated: 2026-05-26
last_agent: claude-session-0261
pairs_with:
  - docs/sprints/SESSION_0260.md
  - docs/sprints/SESSION_0261.md
  - docs/architecture/decisions/0019-membership-lifecycle-ownership.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0261.md
---

# ADR 0020 - Registration recipient is userId XOR (guestEmail, guestName), keyed by recipientKey

**Status:** Accepted
**Date:** 2026-05-26

## Context

SESSION_0258 + SESSION_0259 surfaced an admin walk-in tournament registration UX gap: operators needed to register attendees at the venue who had no Better-Auth account, but the `Registration` model carried a required `userId` foreign key with `@@unique([tournamentId, userId])`. SESSION_0260 shipped **A2.5** — accept `{userId} | {guestEmail,guestName}` at the action layer and auto-stub a User row (`emailVerified:false`, no Account/Session) for the guest branch. Zero schema migration, ships in one session.

A2.5 has a cost: every guest walk-in pollutes the Better-Auth `User` table with a synthetic row that has no auth credentials. The merge-on-signup story (SESSION_0260_FINDING_01) — what happens when a guest later signs up via Better Auth on the same email — is unresolved without a reconciliation hook. Over time the table accumulates noise.

This session (SESSION_0261) lands the **clean schema** that has been on the next-session ledger since SESSION_0258:

- `Registration.userId` becomes nullable.
- New columns `guestEmail`, `guestName` hold the guest identity directly.
- `recipientKey: String` (NOT NULL) is populated at write time and powers the new `@@unique([tournamentId, recipientKey])` constraint.
- The A2.5 stub-User code path is deleted; any A2.5-era stub-Users are backfilled into the guest columns by a one-off script (`apps/web/scripts/backfill-walkin-stub-users.ts`) and the stub User rows are deleted.

This ADR codifies the boundary the schema delta draws.

## Decision

**A `Registration` row's recipient is either a Better-Auth `User` (via `userId`) XOR a guest pair (`guestEmail` + `guestName`). Uniqueness within a tournament is enforced on `recipientKey`, populated at write time by a single canonical helper.**

- `userId String?` — references `User.id`, set when the recipient is a registered Better-Auth user.
- `guestEmail String?`, `guestName String?` — set when the recipient is a guest. Both nullable individually, but conceptually a pair: a guest registration has both populated, a user registration has both null.
- `recipientKey String` (NOT NULL) — populated by `buildRecipientKey(recipient)` which returns `recipient.userId` on the user branch and `recipient.email` on the guest branch. This is the field the `@@unique([tournamentId, recipientKey])` constraint enforces.
- **Every Registration writer** (the admin walk-in action, the public-checkout path, the Stripe webhook's at-capacity + success branches) populates `recipientKey` alongside the recipient fields. Skipping `recipientKey` is a runtime NOT NULL violation.

XOR is enforced at the application layer (the discriminated `walkInRecipientSchema` only emits one branch at a time, and the action sets fields accordingly). A future `CHECK` constraint could enforce it at the database layer if a write site bypassed the helper, but is unnecessary for current scale.

## Alternatives considered

### Option A — Partial unique indexes via raw SQL

Two indexes: `@@unique([tournamentId, userId]) WHERE userId IS NOT NULL` and `@@unique([tournamentId, guestEmail]) WHERE guestEmail IS NOT NULL`.

- **Pros:** Semantically pure — the constraint says exactly what we mean. Postgres-native partial indexes.
- **Cons:** Prisma's `@@unique` syntax lacks partial-WHERE expression. The migration is raw SQL (a hand-edited `CREATE UNIQUE INDEX ... WHERE ...`), and every subsequent `prisma migrate dev` regeneration risks drifting back to a full unique that fails on NULL. The drift risk compounds for the life of the schema. Documentation overhead to remind future contributors not to "fix" the migration.

Rejected: the long-term drift risk outweighs the semantic purity.

### Option B — `recipientKey` column populated at write time (chosen)

- **Pros:** Prisma-clean — one `@@unique([tournamentId, recipientKey])` constraint, no raw SQL. Every Registration writer follows the same `buildRecipientKey` pattern, which is a small, auditable surface (3 call sites today). Schema changes flow through `prisma migrate dev` normally.
- **Cons:** Discipline tax — every Registration writer must remember to populate `recipientKey`. Forgetting is a runtime error (NOT NULL violation), not a compile error. Mitigated by colocating `buildRecipientKey` with the schema and by Cody pre-flight requiring its use.

### Option B′ — `recipientKey` + database `CHECK (userId IS NOT NULL XOR guestEmail IS NOT NULL)`

Same as Option B but with an additional CHECK constraint at the database layer to enforce the XOR.

- **Pros:** Application bugs that set both branches (or neither) are caught at write time.
- **Cons:** Raw-SQL migration for the CHECK, mild drift risk. Scale doesn't yet justify the safety net — every write site is centralized and reviewed.

Deferred: can be added later via a small follow-up migration if a write-site bug ever surfaces.

## Consequences

- **A2.5 stub-User path removed.** `createWalkInRegistration` no longer creates a synthetic `User` row on the guest branch. The Better-Auth `User` table is restored to a single write surface (Better-Auth itself, plus the seed scripts).
- **SESSION_0260_FINDING_01 mooted.** With no stub-Users, the merge-on-signup question disappears. If a guest whose walk-in lives in `Registration.guestEmail` later signs up via Better Auth, that creates a new `User` row with no stub collision. A future "match guest to existing user on email" feature can layer on top — but it's a feature, not a bug fix.
- **Canonical helper `buildRecipientKey`** lives in `apps/web/server/admin/tournaments/actions.ts` (today, where it's first used). Future Registration writers must import it; if a third callsite ever appears, the helper can hoist to a shared module.
- **Stripe webhook now writes `recipientKey: metadata.userId`** alongside `userId` in `fulfillTournamentRegistration` (both at-capacity and success branches). Public-checkout path (`createRegistrationCheckout`) writes `recipientKey: ctx.user.id` in the free-registration write. These were the only Registration writers outside the walk-in action.
- **Null-handling sweep across reads.** Eight files were updated to handle nullable `registration.user`: bracket-viewer, mat-assignment-panel, two admin pages, registration detail page, the bulk-action `seedEntries` helper, the `findFightRecordsByTournament` query (filters out null userIds), and the e2e seed helper + three integration/concurrency tests now write `recipientKey` on their `Registration.create` calls.
- **Weigh-in records gated.** `WeighInRecord` requires `userId` (it tracks a real User's weight, not a guest). The detail page hides `WeighInPanel` for guest registrations and shows a "Weigh-in unavailable for guest registrations" note instead. When/if a guest is later linked to a User, weigh-in becomes available naturally.
- **FightRecord writes skip guests.** `publishFightRecord` `continue`s the per-competitor loop when `userId` is null. Guests don't generate FightRecord rows until they're linked to a User. Bracket seeding's `TOURNAMENT_RANKING` method assigns a null score to guests, which sorts them to the back — a sensible default that nobody complained about during the operator pre-grill.
- **Backfill script (`apps/web/scripts/backfill-walkin-stub-users.ts`)** is checked in as the reversibility artifact. Idempotent; supports `--dry-run`. Run live once during this session by the operator after dry-run confirmation.

## Dirstarter docs proof

Not applicable in the negative sense — Better Auth's `User` model is Dirstarter baseline; A2.5 *added* a synthetic write path to it (application policy on top of baseline), and A3 *removes* that write path. The net effect on Dirstarter baseline is "fewer Ronin-specific writes against `User`," which is alignment-positive, not a baseline replacement. The Registration model is Ronin-specific (no Dirstarter baseline counterpart — Dirstarter ships generic commerce primitives, not tournament registrations).

## Related decisions

- [ADR 0019 — Membership lifecycle ownership](0019-membership-lifecycle-ownership.md) — parallel structure: drew a boundary between `Membership` (community/admin state) and `UserEntitlement` (subscription-driven access) without forcing a schema delta. ADR-0020 takes the opposite tack — drawing the boundary requires a schema delta — because the Registration unique constraint couldn't be made to fit two recipient kinds without one.
- [SESSION_0260](../../sprints/SESSION_0260.md) — A2.5 implementation that shipped the discriminated input + auto-stub-User and triggered this ADR.
- [SESSION_0261](../../sprints/SESSION_0261.md) — A3 implementation (migration + null-handling sweep + UI v2 + this ADR + Doug verification).
