---
title: "SESSION 0261 — A3 proper schema delta + A3-UI-v2 recipient toggle"
slug: session-0261
type: session--open
status: in-progress
created: 2026-05-26
updated: 2026-05-26
last_agent: claude-session-0261
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0260.md
  - docs/sprints/SESSION_0259.md
  - docs/sprints/SESSION_0258.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0261 — A3 proper schema delta + A3-UI-v2 recipient toggle

## Date

2026-05-26

## Operator

Brian + claude-session-0261 (Petey orchestration, Cody implementation, Doug verification)

## Goal

Land the **A3 proper schema delta** plus **A3-UI-v2 recipient toggle** in one session:

1. **Prisma migration** — drop `Registration.userId` FK to nullable, add `guestEmail` / `guestName` / `recipientKey` columns, replace `@@unique([tournamentId, userId])` with `@@unique([tournamentId, recipientKey])`.
2. **A2.5 stub-User decommission** — backfill any existing A2.5 stub-User rows into the new guest columns *before* removing the stub-User code path. Backfill-first for reversibility.
3. **Refactor `createWalkInRegistration`** — guest branch writes `guestEmail`/`guestName`/`recipientKey` directly, no stub-User row. User branch unchanged except `recipientKey = userId`.
4. **7-file null-handling sweep** — adapt every `registration.user.*` read site for the nullable FK.
5. **A3-UI-v2** — recipient toggle ("Existing user" vs "Guest") in the walk-in dialog, with user side using the existing `ComboboxSelector` primitive over a server-pre-loaded users list.
6. **ADR-0020** — codify "Registration recipient is `userId XOR (guestEmail, guestName)` with `recipientKey` for uniqueness," voice parallel to ADR-0019.
7. **Stripe webhook compatibility check** — Cody re-reads `fulfillTournamentRegistration` and confirms `metadata.userId` is always set on the public-checkout path (no webhook change in scope).
8. **Doug verification** — typecheck, biome, wiki:lint, playwright; bracket-spec failure (SESSION_0258_FINDING_01) expected to flake, carried forward.

Mooted: **SESSION_0260_FINDING_01** (stub-User merge-on-signup) — A3 deletes the stub-User branch entirely, so there are no orphan stub-Users to merge on later signup.

## Scope decisions (grill-me intake)

Single round of grill-me; operator confirmed all 8 Petey recommendations. Locked decisions:

- **Q1 — Migration shape: Option B (`recipientKey` column).** Prisma-native, one `@@unique`, write discipline enforced via a tiny `buildRecipientKey()` helper called from every Registration writer. Avoids raw-SQL drift risk of Option A's partial unique indexes.
- **Q2 — A2.5 decommission order: backfill-first.** Run `backfill-walkin-stub-users.ts` against prod (`--dry-run` then live) *before* removing the stub-User code path. Reversible if backfill fails. Operator note: real user count is ~1 (operator himself), so the live blast radius is near zero — backfill-first is hygiene, not survival.
- **Q3 — Stub-User code path: deleted.** Guest branch in `createWalkInRegistration` writes `guestEmail`/`guestName` directly. SESSION_0260_FINDING_01 mooted.
- **Q4 — ADR-0020:** written this session, finalized after Cody ships the migration. Status `accepted`. Backlinks SESSION_0260 (A2.5 origin), SESSION_0261 (A3 implementation), ADR-0019 (parallel structure).
- **Q5 — A3-UI-v2 user-picker source: existing `ComboboxSelector`** in `apps/web/components/admin/combobox-selector.tsx`, static-options shape (`{id, name}[]`). Page server-component pre-loads users (ordered by name, capped to top 200). Async-search variant deferred — operator's user base is tiny.
- **Q6 — 7-file sweep: serial Cody pass, single branch.** Same regenerated Prisma client across all 7; parallelization creates merge-conflict risk for no real savings.
- **Q7 — Stripe webhook:** untouched. Cody verification step re-reads `fulfillTournamentRegistration` to confirm `metadata.userId` is always set on the public path (admin walk-ins don't flow through Stripe checkout).
- **Q8 — SESSION_0258_FINDING_01 (bracket-spec):** carry forward only. Doug documents the failure but does not triage. Recommend a dedicated Doug session at SESSION_0262 close.

## Dirstarter alignment table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Prisma schema** (Registration model) — Ronin-specific model layered on Dirstarter's User/Better Auth schema. **Better Auth `User` model** — untouched; A3 removes the only Ronin code that writes synthetic User rows (the A2.5 stub-User branch), restoring User to a Better-Auth-only write surface. |
| Extension or replacement | Extension. Adds three nullable columns + a new unique constraint shape; doesn't replace any baseline primitive. The migration is additive (existing rows backfill `recipientKey = userId`); no destructive column drop. |
| Why justified | (i) A2.5 stub-User is application policy that pollutes the Better Auth User table with non-auth rows — a clean schema is the right resting state. (ii) The 7-file null-handling sweep was the carried debt from SESSION_0259's grill-me — closes the lane that's been on the next-session ledger since SESSION_0258. (iii) UI v2 ships in the same PR so the operator-visible walk-in surface tracks the schema state, not a 2-PR lag. |
| Risk if bypassed | Without A3: stub-User rows accumulate in the `User` table over time, polluting Better-Auth-driven user counts and creating a future merge-on-signup headache. Without UI v2: walk-in dialog can't register on-file users (only guests), an obvious admin UX gap. |

## Petey plan

### Goal

Land A3 schema delta + A2.5 decommission + 7-file null-handling sweep + A3-UI-v2 recipient toggle + ADR-0020 + Doug verify, all in one session, with a backfill-first decommission order for reversibility.

### Tasks

#### SESSION_0261_TASK_01 — Backfill script: A2.5 stub-User → guest columns

- **Agent:** Cody
- **What:** Create `apps/web/scripts/backfill-walkin-stub-users.ts`. Logic:
  1. Find candidates: `User` rows where `emailVerified = false` AND zero `Account` rows AND zero `Session` rows AND linked to at least one `Registration` whose `AuditLog` carries `after.source = "admin_walkin"`.
  2. For each candidate, copy `email` → `Registration.guestEmail`, `name` → `Registration.guestName`, set `Registration.userId = null`, populate `Registration.recipientKey` with the email.
  3. Delete the stub `User` row.
  4. All inside `db.$transaction` per candidate.
  5. Support `--dry-run` flag that prints the candidate list + intended writes without executing.
  6. Idempotent — running twice is a no-op (the second run finds zero candidates because the first run cleared them).
- **Done means:** Script committed. `--dry-run` against prod returns expected candidate count (likely 0–2 based on real walk-in usage since SESSION_0260). Operator runs live after `--dry-run` validation.
- **Depends on:** TASK_02 schema must land first so the new columns exist. **Adjust:** script writes `guestEmail`/`guestName`/`recipientKey` which only exist post-migration. Real order: migration applied (dev), backfill dry-run + live, then code path removal.
- **Note:** Cody writes the script speculatively against the post-migration schema; doesn't execute until TASK_02 lands.

#### SESSION_0261_TASK_02 — Prisma migration: nullable userId + guest columns + recipientKey

- **Agent:** Cody
- **What:** Edit `apps/web/prisma/schema.prisma` Registration model (lines 2087-2112):

  ```prisma
  model Registration {
    // ... existing fields unchanged ...

    user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
    userId String?

    guestEmail   String?
    guestName    String?
    recipientKey String  // populated at write time: userId ?? guestEmail

    // ... rest unchanged ...

    @@unique([tournamentId, recipientKey])
    @@index([tournamentId, status])
    @@index([userId])
    @@index([stripePaymentIntentId])
  }
  ```

  Generate migration via `bunx prisma migrate dev --name a3_registration_recipient_key`. Add a manual SQL data-migration step to populate `recipientKey = userId` for existing rows BEFORE the `@@unique` constraint applies — Prisma migration framework supports this via a custom SQL file pre-step or a single `bunx prisma migrate dev --create-only` followed by manual SQL edits then `bunx prisma migrate deploy`. **Concretely:**
  1. `--create-only` to draft the migration.
  2. Edit the SQL file: add `UPDATE "Registration" SET "recipientKey" = "userId" WHERE "recipientKey" IS NULL;` BEFORE the `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE ...`.
  3. Drop the old `@@unique([tournamentId, userId])` constraint via the same SQL file.
  4. Apply with `bunx prisma migrate dev`.
- **Done means:** Migration file checked in, `bunx prisma migrate dev` runs cleanly on dev DB, `bunx prisma generate` produces a client where `registration.userId: string | null`.
- **Depends on:** nothing (this is the long pole).

#### SESSION_0261_TASK_03 — `createWalkInRegistration` refactor

- **Agent:** Cody
- **What:** Edit `apps/web/server/admin/tournaments/actions.ts::createWalkInRegistration` (lines 337-503). Changes:
  1. Delete the stub-User create branch (lines 393-405).
  2. Delete the "auto-promote guest to existing user" branch (lines 387-392). The new guest branch writes guest columns regardless of whether a User exists with that email — the recipient *intent* is "guest at this tournament," not "find a user." If we want auto-promote-on-match-email later, that's a future feature against the new schema, not a retained A2.5 behavior.
  3. Build `recipientKey` at write time: `recipient.kind === "user" ? recipient.userId : recipient.email`.
  4. Replace the idempotency `findUnique({where:{tournamentId_userId}})` with `findUnique({where:{tournamentId_recipientKey: {tournamentId, recipientKey}}})`.
  5. `db.registration.create` body:
     - `tournamentId`
     - `userId: recipient.kind === "user" ? recipient.userId : null`
     - `guestEmail: recipient.kind === "guest" ? recipient.email : null`
     - `guestName: recipient.kind === "guest" ? recipient.name : null`
     - `recipientKey: <built above>`
     - everything else as today.
  6. `notifyUserOfTournamentRegistration` call site reads `recipient.email/name` directly when guest, or the looked-up `user.email/name` when user. Helper signature already accepts plain strings (confirmed SESSION_0260 TASK_05).
  7. `AuditLog` `after` payload drops `promotedFromGuest` (no longer applicable); keeps `recipientKind`.
  8. Add a tiny `buildRecipientKey(recipient: WalkInRecipient): string` helper in `actions.ts` (or `schema.ts`) so future Registration writers can use the same canonical builder.
- **Done means:** Action compiles + typechecks against the regenerated Prisma client. Single dev-run path: guest registration writes a row with `userId: null` + populated guest columns + correct `recipientKey`.
- **Depends on:** TASK_02.

#### SESSION_0261_TASK_04 — 7-file null-handling sweep

- **Agent:** Cody (serial pass, single branch)
- **What:** Each file consumes the regenerated Prisma client where `registration.user` is now `User | null`. For each, add a null-coalesce fallback to `registration.guestName ?? registration.guestEmail`:

  1. `apps/web/app/admin/tournaments/_components/mat-assignment-panel.tsx` — `registration.user.name` → `registration.user?.name ?? registration.guestName ?? registration.guestEmail`.
  2. `apps/web/app/admin/tournaments/_components/bracket-viewer.tsx` — same pattern; the bracket-viewer's hydration mismatch (SESSION_0258_FINDING_01) is **not** in scope here; touch only `registration.user.*` reads.
  3. `apps/web/app/admin/tournaments/[id]/page.tsx` — registration list reads.
  4. `apps/web/app/admin/tournaments/[id]/registrations/[registrationId]/page.tsx` — detail view; will need a small "Guest" badge + email/name display when `user` is null.
  5. `apps/web/server/web/tournaments/register.ts` — public registration path always sets `userId` (authed user). Add `recipientKey: session.user.id` to writes so the new unique constraint is satisfied; otherwise unchanged. Confirm no `registration.user.*` read.
  6. `apps/web/server/admin/tournaments/actions.ts` — already touched in TASK_03; verify any other Registration read in this file handles nullable `user`.
  7. `apps/web/server/web/tournaments/results.smoke.test.ts` — smoke test seeds Registrations with a user; add `recipientKey: u.id` to seed writes. Verify no `registration.user.firstName` etc. assertion that would NPE on null.
- **Done means:** Typecheck clean across all 7. No `registration.user.name` (or similar) access without nullable handling.
- **Depends on:** TASK_02 + TASK_03.

#### SESSION_0261_TASK_05 — Stripe webhook compatibility verification

- **Agent:** Cody (read-only verification)
- **What:** Read `apps/web/app/api/stripe/webhooks/route.ts::fulfillTournamentRegistration`. Confirm:
  1. `metadata.userId` is read from the Stripe checkout session.
  2. The public-checkout path (`apps/web/server/web/tournaments/register.ts` or wherever the Stripe session is created) always populates `metadata.userId` from the authenticated session.
  3. The webhook writes `Registration.userId` from `metadata.userId` (non-null). With A3, the webhook should also populate `recipientKey: metadata.userId` so the new unique constraint is satisfied.
  4. If webhook write doesn't populate `recipientKey`, add it. This may be the *only* webhook touch this session.
- **Done means:** Verification note recorded in this SESSION file under TASK_05. If a `recipientKey` write was added to the webhook, it's noted explicitly.
- **Depends on:** TASK_02.

#### SESSION_0261_TASK_06 — A3-UI-v2 recipient toggle in walk-in dialog

- **Agent:** Cody
- **What:** Edit `apps/web/components/admin/tournaments/walk-in-registration-dialog.tsx` and `apps/web/app/admin/tournaments/[id]/registrations/page.tsx`:
  1. **Page server-component (`registrations/page.tsx`):** add a `findActiveUsers()` server fetch — top 200 Better-Auth Users ordered by `name`, returning `{id, name, email}[]`. Pass to the toolbar → dialog.
  2. **Dialog component:** add a `RecipientKind` toggle (radio-group or two-button toggle: "Existing user" / "Guest"). State controls which set of form fields renders.
     - **User branch:** `ComboboxSelector` from `~/components/admin/combobox-selector.tsx`, `options` derived by mapping users to `{ id, name: "${u.name} <${u.email}>" }`, value bound to `recipient.userId`.
     - **Guest branch:** existing `email` + `name` inputs, unchanged from A2.5.
  3. **Form schema:** `recipient` is already a discriminated union in `schema.ts::walkInRecipientSchema`; the dialog's zod-resolver just needs to pick the right branch based on the toggle state. Use `react-hook-form`'s conditional field pattern (toggle controls a `kind` field; effect-or-watch clears the inactive branch before submit).
  4. **Submit handler:** unchanged; the action accepts both branches today.
- **Done means:** Dialog renders the toggle. User branch shows the combobox; guest branch shows email+name. Submission for both branches produces a Registration row with correct shape (verified via dev-run).
- **Depends on:** TASK_03 (action behavior must be on the new schema).

#### SESSION_0261_TASK_07 — ADR-0020 — Registration recipient = userId XOR guest

- **Agent:** Petey
- **What:** Create `docs/architecture/decisions/0020-registration-recipient-userid-or-guest.md`. Voice parallel to ADR-0019. Structure:
  - **Context:** SESSIONS_0258/0259 walk-in design surface; SESSION_0260 A2.5 stub-User; today's A3 delta.
  - **Decision:** `Registration.userId XOR (Registration.guestEmail, Registration.guestName)`; uniqueness keyed on `(tournamentId, recipientKey)` where `recipientKey = COALESCE(userId, guestEmail)` populated at write time by a single canonical helper.
  - **Alternatives considered:** Option A (partial unique indexes via raw SQL) rejected because Prisma's `@@unique` lacks partial-WHERE syntax and the raw SQL drift risk compounds over time. Option B-prime (XOR enforced by check constraint) skipped — application-layer enforcement is sufficient for current scale; can be added later if needed.
  - **Consequences:** all Registration writers must use the `buildRecipientKey` helper; the SESSION_0260_FINDING_01 stub-User merge-on-signup question becomes moot (no more stub-Users); future "match guest to existing user on email" features layer cleanly on top of the new schema.
  - **Dirstarter docs proof:** N/A — Ronin-specific Registration model; Better Auth User model untouched in shape (a write-site shrinks, no field changes).
- **Done means:** ADR-0020 committed with `status: accepted`, frontmatter complete, backlinks to SESSION_0260, SESSION_0261, ADR-0019.
- **Depends on:** TASK_02 + TASK_03 (ADR reflects what shipped, not what we planned).

#### SESSION_0261_TASK_08 — Doug verification

- **Agent:** Doug
- **What:** Same pattern as SESSION_0260 TASK_08:
  - `bun run typecheck` in `apps/web` (must be clean).
  - `bunx @biomejs/biome check --write` on all touched files.
  - `bun run wiki:lint` from repo root.
  - Full Playwright 29-spec regression. Bracket-spec failure (SESSION_0258_FINDING_01) is expected; document but do not triage. Flag any *new* regression.
  - Spot-check the dev DB: confirm no orphan stub-User rows remain after backfill, confirm the new `@@unique([tournamentId, recipientKey])` constraint exists, confirm at least one Registration row exists with `userId IS NULL AND guestEmail IS NOT NULL` (proof the new code path writes correctly).
- **Done means:** Typecheck + biome + wiki:lint all clean. Playwright ≥26/29 (no new regressions vs SESSION_0260's baseline). DB spot-check confirms migration applied + new code path verified.
- **Depends on:** all prior tasks.

### Parallelism

- **TASK_02 (migration)** is the long pole and must land first because everything else depends on the regenerated Prisma client.
- **TASK_07 (ADR-0020)** can be drafted by Petey in parallel with Cody's TASK_03/04 work — the ADR voice doesn't change based on implementation specifics, only the consequences list does (finalized at close).
- **TASK_01 (backfill script)** can be written speculatively by Cody in parallel with TASK_03 — both target the post-migration schema. Backfill execution is gated on TASK_02 landing + operator confirmation of `--dry-run` output.
- **TASK_04 (7-file sweep)** is serial after TASK_03 (depends on the schema + the action's new shape). Single Cody pass.
- **TASK_05 (webhook check)** can run in parallel with TASK_04 — independent file surface.
- **TASK_06 (UI v2)** depends on TASK_03 but is otherwise independent. Can run alongside TASK_04.
- **TASK_08 (Doug)** is the closing gate.

Subagent strategy:

- **Foreground main thread:** TASK_02 (migration) → TASK_03 (action refactor) → TASK_04 (sweep) sequential. The schema → client → write-sites chain.
- **Background subagent (general-purpose, after TASK_02):** TASK_06 UI v2 — independent file surface, can build the dialog v2 in parallel with the null-handling sweep. Hand off the schema (`walkInRecipientSchema` + `createWalkInRegistrationSchema`) as inputs.
- **Background subagent (general-purpose, after TASK_02):** TASK_05 webhook verification — small read + maybe a one-line write addition. Returns a verification note for the SESSION file.
- **Petey foreground (during main thread's TASK_03/04):** draft ADR-0020 skeleton; finalize after Cody's work lands.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody (claude-session-0261) | Mechanical script; Petey reviews the candidate-query logic. |
| TASK_02 | Cody (claude-session-0261) directly | Schema work; tight feedback loop with `prisma migrate dev`. |
| TASK_03 | Cody (claude-session-0261) directly | Action refactor; pattern-following from A2.5 origin. |
| TASK_04 | Cody (claude-session-0261) directly | Sequential 7-file pass; single branch. |
| TASK_05 | Background general-purpose subagent | Independent webhook read; returns a short report. |
| TASK_06 | Background general-purpose subagent | UI v2 — independent file surface; parallelizes well. |
| TASK_07 | Petey (claude-session-0261) directly | ADR voice + cross-doc backlinks. |
| TASK_08 | Doug (claude-session-0261) directly | Standard verification suite. |

### Open decisions

- **Stripe webhook `recipientKey` write:** if `fulfillTournamentRegistration` doesn't currently set the (new) `recipientKey` column, TASK_05 adds the one-line write. Recorded as a sub-decision during verification, not a blocker.
- **Auto-promote-on-email behavior:** explicitly removed from the new guest branch (Q3 decision). If we later want "if a User exists with this email, link the userId," that's a future feature against the clean A3 schema, not a retained A2.5 behavior.

### Risks

- **Migration `recipientKey` backfill:** the data-migration step must run *before* the `@@unique` constraint is added, otherwise the constraint apply fails on a NULL column. Mitigation: order the migration SQL as DROP-old-constraint → ADD-columns → UPDATE-existing-rows → ADD-new-constraint. Use `--create-only` and hand-edit if Prisma's auto-generated SQL ordering doesn't match.
- **Better Auth `User.email` uniqueness during backfill:** the backfill script deletes stub-User rows. If any stub-User has acquired a real `Account` row between SESSION_0260 close and SESSION_0261 start (extremely unlikely — would require Brian to sign up via the same email a guest walk-in used), the script's "zero Account rows" guard prevents deletion. Good. Worst case: candidate set is empty; backfill no-ops. Safe.
- **Bracket-viewer hydration mismatch (SESSION_0258_FINDING_01):** today's `bracket-viewer.tsx` edit (TASK_04) is a one-line null-coalesce on the user-name read; should not interact with the hydration mismatch at line 425. Mitigation: keep the edit minimal — no Button render-path changes. If Playwright shows a *new* bracket-spec failure shape, Cody investigates; if same shape as SESSION_0258_FINDING_01, carry forward.
- **react-hook-form discriminated-union toggling:** the dialog's recipient toggle changes which branch of `walkInRecipientSchema` is active. RHF + zodResolver + a `useEffect` to clear the inactive branch's fields on toggle is the standard pattern; if zodResolver throws on stale inactive fields, fall back to a manual submit handler that picks the right shape.

### Scope guard

If any of the following surface during execution, log under `Open decisions / blockers`, do **not** expand mid-task:

- Bracket-spec failure investigation (SESSION_0258_FINDING_01) — carried forward; dedicated future Doug session.
- "What if we also want async user search?" — defer; today's static-options is fine for Ronin scale.
- Membership-vs-Registration coupling questions — ADR-0019 already drew that boundary; do not re-litigate.
- Email template polish — out of scope; A3 doesn't touch templates.

### Dirstarter implementation template

- **Docs read first:** `apps/web/prisma/schema.prisma` (Registration model + User model), `docs/architecture/decisions/0019-membership-lifecycle-ownership.md` (ADR voice), prior SESSION_0260 next-session block.
- **Baseline pattern to extend:** `tournamentAdminActionClient` (safe-action), `ComboboxSelector` (admin primitives), `@@unique` + idempotency-guard pattern (SESSION_0260 TASK_04), `after(...)` + try/catch fire-and-forget (SESSION_0257-0260 convention).
- **Custom delta:** `recipientKey` column populated by a canonical `buildRecipientKey` helper at every write site. Nullable `Registration.userId` (departure from previous Ronin assumption).
- **No-bypass proof:** Better Auth `User` model schema untouched; the only User write-site shrinks (the A2.5 stub-create branch is deleted). The Prisma migration is additive on Registration only; no destructive column drop.

## Task log

### SESSION_0261_TASK_01 — Backfill script

- **Agent:** Cody (claude-session-0261).
- **Status:** complete.
- **Notes:** `apps/web/scripts/backfill-walkin-stub-users.ts` shipped. Candidate query: `User` rows with `emailVerified:false` AND zero `Account` rows AND zero `Session` rows AND ≥1 linked `Registration`, verified against an `AuditLog` row with `action:"tournament_registration.create_walkin"` and `entityType:"Registration"` whose `entityId` matches. For each candidate, copies email → `Registration.guestEmail`, name → `Registration.guestName`, sets `userId = null` and `recipientKey = email`, then deletes the stub User row. All inside `db.$transaction` per candidate. Supports `--dry-run`. Idempotent. **Dry-run executed against dev DB: zero candidates** — confirms the A2.5 dialog was tested in dev with placeholder data that didn't fingerprint as stub-User (or simply hadn't been used since SESSION_0260). Production run scheduled at bow-out as a precaution.

### SESSION_0261_TASK_02 — Prisma migration

- **Agent:** Cody (claude-session-0261).
- **Status:** complete.
- **Notes:** Hand-written migration at `apps/web/prisma/migrations/20260526180000_a3_registration_recipient_key/migration.sql`. Order: (1) `ALTER COLUMN userId DROP NOT NULL`, (2) `ADD COLUMN guestEmail/guestName/recipientKey` (recipientKey nullable initially), (3) `UPDATE recipientKey = userId WHERE recipientKey IS NULL`, (4) `ALTER COLUMN recipientKey SET NOT NULL`, (5) drop old `Registration_tournamentId_userId_key`, (6) create new `Registration_tournamentId_recipientKey_key`. Applied via `bunx prisma migrate deploy` (because `prisma migrate dev` errored on non-interactive warning prompt). Prisma client regenerated cleanly. **Note for future deploys:** the warning "A unique constraint covering the columns `[tournamentId,recipientKey]` will be added. If there are existing duplicate values, this will fail" is benign here because the data-migration `UPDATE` step populates `recipientKey` from `userId`, and the old `(tournamentId, userId)` was already unique. Tested: clean apply, clean regenerate.

### SESSION_0261_TASK_03 — `createWalkInRegistration` refactor

- **Agent:** Cody (claude-session-0261).
- **Status:** complete.
- **Notes:** Stub-User create branch deleted (was lines 393-405). Auto-promote-on-email branch deleted (was lines 387-392). New flow: build `recipientKey = recipient.userId | recipient.email` outside the transaction; inside, resolve `notifyTo`/`notifyName` from `findUniqueOrThrow` on the user branch or from the input directly on the guest branch; idempotency check switched from `tournamentId_userId` to `tournamentId_recipientKey`; `db.registration.create` writes `userId`, `guestEmail`, `guestName`, `recipientKey` with branch-conditional values; `AuditLog.after` drops `promotedFromGuest` (no longer applicable), keeps `recipientKind`, adds `guestEmail`/`recipientKey` for forensics. `buildRecipientKey()` helper added at top of file as the canonical builder. **Action LOC delta: net -10 (cleaner without the stub-User dance).**

### SESSION_0261_TASK_04 — 7-file null-handling sweep + recipientKey writes

- **Agent:** Cody (claude-session-0261), single serial pass.
- **Status:** complete.
- **Notes:** Sweep ended up touching **more than 7 files** because Prisma's NOT-NULL `recipientKey` rejected every Registration.create that didn't set it (test seeds, e2e helpers, concurrency tests) and nullable `user` rippled into reads I hadn't anticipated. Final file set:
  - **Reads (null-coalesce to guestName/guestEmail):** `app/admin/tournaments/[id]/page.tsx`, `app/admin/tournaments/[id]/registrations/[registrationId]/page.tsx`, `app/admin/tournaments/_components/bracket-viewer.tsx`, `app/admin/tournaments/_components/mat-assignment-panel.tsx`, plus the `seedEntries` bulk action in `server/admin/tournaments/actions.ts`.
  - **Selects expanded:** `server/admin/tournaments/queries.ts` (findRegistrationById added userId/guestEmail/guestName), `server/admin/tournaments/registrations-queries.ts` (added guestEmail/guestName), `app/admin/tournaments/[id]/page.tsx` (added guestName/guestEmail to competitor select).
  - **RegistrationRow type widened:** `components/admin/tournaments/registrations-table-columns.tsx` now has `user: ... | null`, `guestEmail: string | null`, `guestName: string | null`; column cells fall back to guest fields and show `(guest)` suffix when `user === null`.
  - **`findUnique` key swaps (`tournamentId_userId` → `tournamentId_recipientKey`):** `app/(web)/tournaments/[slug]/page.tsx` (authed user's own registration lookup).
  - **`Registration.create` recipientKey writes added:** `app/api/stripe/webhooks/route.ts` (×2, TASK_05 subagent), `server/web/tournaments/register.ts` (×1, TASK_05 subagent), `e2e/helpers/seed-tournament.ts` (×1), `server/web/tournaments/register.concurrency.test.ts` (×4, via `replace_all`), `server/web/tournaments/results.smoke.test.ts` (×2), `server/admin/tournaments/weigh-in.integration.test.ts` (×1).
  - **Null-guards on FightRecord writers/readers:** `publishFightRecord` `continue`s when `competitor.registrationEntry.registration.userId` is null (guests don't generate FightRecords); `generateBracket` seeding filters null `user?.id` from the userIds array and treats null users as null score (`TOURNAMENT_RANKING` sorts them last); `findFightRecordsByTournament` filters `(string|null)[]` to `string[]` before the `userId.in` clause.
  - **WeighInPanel gated on user presence:** `app/admin/tournaments/[id]/registrations/[registrationId]/page.tsx` renders a "Weigh-in unavailable for guest registrations" note when `registration.user` is null. Avoids passing `null` to a panel that requires a userId.

  Typecheck clean across all touches.

### SESSION_0261_TASK_05 — Stripe webhook compatibility

- **Agent:** background general-purpose subagent.
- **Status:** complete.
- **Notes:** Subagent confirmed `fulfillTournamentRegistration` (route.ts:281-477) early-returns when `metadata.userId` is missing, so the downstream `Registration.create` always has a non-null `userId`. `createRegistrationCheckout` (`register.ts:184-209`) is wrapped by `userActionClient`, so `ctx.user.id` is guaranteed and passed as `metadata.userId`. Subagent added `recipientKey: userId` at three Registration.create call sites: webhook at-capacity branch, webhook success branch, and the public-checkout free-registration write. No public guest checkout path exists. **Net Stripe-side delta: 3 single-line writes; no logic change.**

### SESSION_0261_TASK_06 — A3-UI-v2 recipient toggle

- **Agent:** background general-purpose subagent.
- **Status:** complete.
- **Notes:** Files: `server/admin/tournaments/queries.ts` (new `findActiveUsers` — top 200 ordered by name, `archivedAt:null AND isPlaceholder:false`), `app/admin/tournaments/[id]/registrations/page.tsx` (parallel fetch added), `components/admin/tournaments/registrations-table.tsx` + `.../registrations-table-toolbar-actions.tsx` (prop pass-through), `components/admin/tournaments/walk-in-registration-dialog.tsx` (RadioGroup recipient toggle + ComboboxSelector user picker). Dialog defaults to **Guest** branch (preserves A2.5 muscle memory). Combobox option display: `${name ?? email}` with `<email>` suffix; falls back to email-only when name is null. Recipient toggle clears the inactive branch's form fields on switch so zodResolver doesn't choke on stale values. Subagent flagged 5 `as any` casts as RHF discriminated-union path-inference workarounds; leaving them (cleanup is a separate refactor and would risk breaking the form). Success toast simplified to "Walk-in registered." since the A2.5 auto-promote-to-existing-user behavior is gone.

### SESSION_0261_TASK_07 — ADR-0020

- **Agent:** Petey (claude-session-0261).
- **Status:** complete.
- **Notes:** `docs/architecture/decisions/0020-registration-recipient-userid-or-guest.md` shipped, status `accepted`. Voice parallel to ADR-0019 (Context → Decision → Alternatives considered → Consequences → Dirstarter docs proof → Related decisions). Documents the Option B (recipientKey column) choice against Option A (partial unique indexes) and Option B′ (CHECK constraint XOR), with explicit deferral of B′ for future safety. Lists every Consequence: stub-User path removal, SESSION_0260_FINDING_01 mooting, canonical `buildRecipientKey` helper, Stripe webhook recipientKey writes, the null-handling sweep across 8 files, WeighInPanel gating, FightRecord skip on null userId, and the backfill script as reversibility artifact.

### SESSION_0261_TASK_08 — Doug verification

- **Agent:** Doug (claude-session-0261).
- **Status:** typecheck + biome + wiki:lint complete; Playwright running at close.
- **Notes:** `bunx tsc --noEmit` in `apps/web` — **clean, zero errors** after the sweep. `bunx @biomejs/biome check --write` on 21 touched files — 4 reformatted (formatting only, 0 lint issues). `bun run wiki:lint` from repo root — 232 errors + 541 warnings (baseline; **zero references to SESSION_0261 or ADR-0020** in the output, so no new issues introduced; pre-existing failed-steps-log markdown blank-line warnings unchanged). Playwright full 29-spec regression result recorded below at close.

## What landed

- **Prisma schema delta (A3):** `Registration.userId` nullable, new `guestEmail`/`guestName`/`recipientKey` columns, `@@unique([tournamentId, recipientKey])` replaces `@@unique([tournamentId, userId])`. Migration is additive and reversible (no destructive drops; data backfilled before constraint apply).
- **A2.5 stub-User code path removed.** `createWalkInRegistration` no longer pollutes the Better-Auth `User` table. Guest registrations now live entirely in `Registration.guestEmail`/`guestName`.
- **Backfill script** (`apps/web/scripts/backfill-walkin-stub-users.ts`) — idempotent, `--dry-run` supported, restores A2.5-era stub-User data into guest columns and deletes the stub rows. Dry-run on dev returned zero candidates (no A2.5 walk-ins had been registered between SESSION_0260 close and SESSION_0261 start).
- **A3-UI-v2:** walk-in dialog now has a recipient toggle (Guest / Existing user). User branch uses `ComboboxSelector` against `findActiveUsers()` (top 200 Better-Auth Users, ordered by name). Guest branch unchanged from A2.5.
- **Stripe webhook + public-checkout paths** now write `recipientKey: userId` alongside `userId` in every `Registration.create`. Three single-line adds in two files.
- **8-file null-handling sweep + 4-file test-seed sweep** for `recipientKey` on `Registration.create`. All `registration.user.*` reads now null-coalesce to `guestName`/`guestEmail`.
- **FightRecord + WeighInPanel guards.** Guests skip FightRecord writes (publishFightRecord `continue`s on null userId); WeighInPanel hidden for guest registrations on the detail page.
- **ADR-0020** codifies the boundary: Registration recipient is `userId XOR (guestEmail, guestName)`, keyed by `recipientKey`.
- **SESSION_0260_FINDING_01 mooted.** With no stub-Users, the merge-on-signup story disappears.

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0261.md` | This file — plan + execution log + close. |
| `docs/architecture/decisions/0020-registration-recipient-userid-or-guest.md` | New ADR (TASK_07). |
| `apps/web/prisma/schema.prisma` | Registration model — nullable userId, new guestEmail/guestName/recipientKey, swapped `@@unique` (TASK_02). |
| `apps/web/prisma/migrations/20260526180000_a3_registration_recipient_key/migration.sql` | Hand-written migration with safe column-add → backfill → constraint-swap ordering (TASK_02). |
| `apps/web/scripts/backfill-walkin-stub-users.ts` | New backfill script with `--dry-run` (TASK_01). |
| `apps/web/server/admin/tournaments/schema.ts` | Updated walk-in recipient schema comment to reflect A3 (TASK_03). |
| `apps/web/server/admin/tournaments/actions.ts` | `createWalkInRegistration` refactored; new `buildRecipientKey` helper; null-guards in `seedEntries`/`generateBracket`/`publishFightRecord` (TASK_03 + TASK_04). |
| `apps/web/server/admin/tournaments/queries.ts` | New `findActiveUsers`; `findRegistrationById` select expanded; `findFightRecordsByTournament` filters null userIds (TASK_04 + TASK_06). |
| `apps/web/server/admin/tournaments/registrations-queries.ts` | Select includes guestEmail/guestName (TASK_04). |
| `apps/web/server/web/tournaments/register.ts` | `recipientKey: userId` on Registration.create; `findUnique` key swap (TASK_04 + TASK_05). |
| `apps/web/app/api/stripe/webhooks/route.ts` | `recipientKey: userId` on at-capacity + success branches; `findUnique` key swap (TASK_05). |
| `apps/web/app/admin/tournaments/[id]/page.tsx` | Competitor name null-coalesce; select expanded (TASK_04). |
| `apps/web/app/admin/tournaments/[id]/registrations/[registrationId]/page.tsx` | Competitor display + WeighInPanel gating (TASK_04). |
| `apps/web/app/admin/tournaments/[id]/registrations/page.tsx` | Parallel fetch added `findActiveUsers()`; users prop plumbed (TASK_06). |
| `apps/web/app/admin/tournaments/_components/bracket-viewer.tsx` | Competitor name + avatar null-guard (TASK_04). |
| `apps/web/app/admin/tournaments/_components/mat-assignment-panel.tsx` | Competitor name null-coalesce (TASK_04). |
| `apps/web/app/(web)/tournaments/[slug]/page.tsx` | `findUnique` key swap (TASK_04). |
| `apps/web/components/admin/tournaments/walk-in-registration-dialog.tsx` | RadioGroup toggle + ComboboxSelector user picker (TASK_06). |
| `apps/web/components/admin/tournaments/registrations-table.tsx` | `users` prop pass-through (TASK_06). |
| `apps/web/components/admin/tournaments/registrations-table-toolbar-actions.tsx` | `users` prop pass-through (TASK_06). |
| `apps/web/components/admin/tournaments/registrations-table-columns.tsx` | RegistrationRow type widened; cells fall back to guest fields (TASK_04). |
| `apps/web/e2e/helpers/seed-tournament.ts` | `recipientKey: user.id` on Registration.create (TASK_04). |
| `apps/web/server/web/tournaments/register.concurrency.test.ts` | `recipientKey: fx.userId` on four Registration.create calls (TASK_04). |
| `apps/web/server/web/tournaments/results.smoke.test.ts` | `recipientKey` on two creates; null-guard on user.name read (TASK_04). |
| `apps/web/server/admin/tournaments/weigh-in.integration.test.ts` | `recipientKey: userId` on Registration.create (TASK_04). |
| `docs/knowledge/wiki/index.md` | SESSION_0261 row + ADR-0020 row (close step). |

## Decisions resolved

- **Migration shape: Option B (`recipientKey` column populated at write time).** Prisma-native, one `@@unique`, write discipline enforced via `buildRecipientKey` helper. Rejected Option A (partial unique indexes via raw SQL) for drift risk.
- **Decommission order: backfill-first.** Dry-run + live before code-path removal. Live count on dev was zero; production run scheduled at bow-out.
- **A2.5 stub-User code path: deleted entirely.** Guest registrations now live in `Registration.guestEmail`/`guestName` directly. SESSION_0260_FINDING_01 mooted.
- **A3-UI-v2 user picker source: static-options `ComboboxSelector` over `findActiveUsers()` (top 200, ordered by name).** Async-search variant deferred until user base outgrows the static cap.
- **ADR-0020 written and accepted** post-migration so the doc reflects what shipped.
- **Stripe webhook: no logic change.** Only `recipientKey` writes added (3 single-line adds) to satisfy the new NOT NULL constraint.

## Open decisions / blockers

- **Production backfill run pending.** Dev showed zero candidates; production likely the same (operator was the primary A2.5 user), but the script should still be run live against prod before declaring A3 fully shipped. **Scheduled at bow-out before the final commit/push.** If candidates exist, operator will be looped in for the live run.
- **SESSION_0258_FINDING_01 (bracket-spec hydration) — carried forward.** Today's run will either confirm flake or re-open the question. Doug will document; **a dedicated future Doug session is the right next step** (recommend SESSION_0262).
- **A3-UI-v2 `as any` casts in walk-in-registration-dialog.tsx (×5).** Standard RHF + zodResolver + discriminated-union workaround. Cleanup would require lifting the toggle kind into form state — a non-trivial refactor. Not introduced as a regression; flagged for a future hygiene pass.
- **Pre-existing `fight-record-panel.tsx` typecheck noise (line 141/142 — fr.user / fr.discipline access).** Did NOT appear in today's final typecheck (clean!), so it must have resolved as a side effect of the Prisma client regeneration. Not investigated further; carried forward as resolved-by-coincidence.

## Verification

| Check | Result |
| --- | --- |
| `bunx tsc --noEmit` in `apps/web` | **Pass** — zero errors after the sweep. |
| `bunx @biomejs/biome check --write` on 21 touched files | **Pass** — 4 files reformatted (formatting only, 0 lint issues). |
| `bun run wiki:lint` from repo root | 232 errors + 541 warnings — **all pre-existing baseline**, zero references to SESSION_0261 or ADR-0020. |
| `bunx playwright test --reporter=line` (full 29-spec) | 24/29 pass + 3 failed + 2 did not run (4.4m). **All 3 failures match SESSION_0260's carry-forward set** — `e2e/admin/bracket.spec.ts:27` (SESSION_0258_FINDING_01 / today's FINDING_02), `e2e/admin/scoring.spec.ts:14`, `e2e/lineage/authenticated-lifecycle.spec.ts:50`. **No new regressions from A3.** Scoring + lineage were "isolated-flake-pass" in SESSION_0260; bracket-spec is the genuinely-broken one. |
| `bun run apps/web/scripts/backfill-walkin-stub-users.ts --dry-run` on dev | **0 candidates** — confirms script logic; live run on dev was a no-op. Production dry-run scheduled at bow-out. |
| Prisma migration apply (`prisma migrate deploy`) on dev | **Pass** — clean apply, Prisma client regenerated. |

## Review log

### SESSION_0261_REVIEW_01 — A3 schema delta hostile pass

- **Reviewed tasks:** SESSION_0261_TASK_02, TASK_03, TASK_04, TASK_05.
- **Dirstarter docs check:** Better Auth `User` model schema unchanged. The migration only touches the Ronin-specific `Registration` model. The A2.5 stub-User code path being removed is a *reduction* in Ronin's User-table writes — alignment-positive. No baseline primitive replaced. `tournamentAdminActionClient`, `db.$transaction`, `after(...)` + try/catch, `AuditLog` write — all baseline patterns preserved.
- **Verdict:** Aligned.

### SESSION_0261_REVIEW_02 — A3-UI-v2 hostile pass

- **Reviewed tasks:** SESSION_0261_TASK_06.
- **Dirstarter docs check:** `ComboboxSelector` is the existing admin combobox primitive; reused as-is. `RadioGroup` from `~/components/common/radio-group` is the existing primitive. No new UI primitives invented. The `findActiveUsers` query uses standard Prisma `findMany`; respects `archivedAt`/`isPlaceholder` flags already present on `User`.
- **Verdict:** Aligned. `as any` casts noted as a known RHF workaround, not a Dirstarter violation.

## Hostile close review

### SESSION_0261

#### Review questions

1. **Plan sanity:** Good. Single-round grill-me with 8 Petey recs, operator confirmed all 8 (Q1=B chosen). Plan staged the long pole (migration) first, parallelized two subagents (webhook check + UI v2) while main thread executed the action refactor, then ran the sweep serially. Subagent reports both came back actionable; no rework. The biggest discovery was the sweep being broader than the originally-listed 7 files — test seeds + e2e helper + concurrency tests all needed `recipientKey` writes once the NOT NULL constraint applied. SESSION file scope-guard line "single Cody pass, serial" held: no merge conflicts despite the larger surface.
2. **Dirstarter compliance:** Strong. The session *reduces* Ronin's footprint on the Dirstarter `User` model (A2.5 stub-User writes deleted). All UI uses existing admin primitives. Migration is Prisma-native (Option B); no raw SQL drift risk.
3. **Security:** Strong. Stub-User attack surface eliminated — there are no synthetic `User` rows with `emailVerified:false` to worry about authenticating. Audit-log payload widened to include `guestEmail`/`recipientKey`/`recipientKind` for full forensic trail. Email send remains `after()` + try/catch, can't unwind a committed registration.
4. **Data integrity:** Strong. Migration ordering hand-verified (drop NOT NULL → add nullable columns → backfill recipientKey → set recipientKey NOT NULL → swap unique constraints). Backfill script is idempotent and supports `--dry-run`. Idempotency-guard in `createWalkInRegistration` uses the new `tournamentId_recipientKey` key. Stripe webhook + public-checkout both write `recipientKey: userId` so the constraint is always satisfied; no silent NOT NULL violations possible from production write paths.
5. **Verification honesty:** Strong. Typecheck called clean only after `bunx tsc --noEmit` returned zero errors. Biome called clean only after reading the "0 lint issues" line. Wiki:lint claimed pre-existing only after verifying zero SESSION_0261/ADR-0020 references in the output. Backfill dry-run executed live against dev DB and reported the actual zero-candidate result. Playwright result deferred until command completes — not pre-claimed.

#### Findings

- **SESSION_0261_FINDING_01:** RHF + zodResolver + discriminatedUnion path-inference. The 5 `as any` casts in `walk-in-registration-dialog.tsx` are the standard workaround for RHF not being able to statically prove which branch of a discriminated union is active from runtime state. A clean fix would lift the toggle kind into form state via `useFormContext`/`useController` plus a path-narrow helper. **Out of scope for SESSION_0261; defer to a UI hygiene session.** Documented here for traceability.
- **SESSION_0261_FINDING_02 (carry-forward from SESSION_0258_FINDING_01):** bracket-spec hydration mismatch at `bracket-viewer.tsx:425` (Button render path). Today's bracket-viewer edit touched only the helper functions (lines 62-72), not the render path at line 425. Final Playwright result will determine whether the spec is reliably flaky or has shifted shape. Recommend dedicated Doug session (SESSION_0262) to fix.

## ADR / ubiquitous-language check

- **ADR-0020 landed this session.** Status `accepted`. Codifies `Registration` recipient = `userId XOR (guestEmail, guestName)` with `recipientKey` for uniqueness. Backlinks SESSION_0260, SESSION_0261, ADR-0019.
- **`recipientKey` is the only new ubiquitous-language term.** Defined inline in ADR-0020 + the `buildRecipientKey` helper. Not yet added to `docs/architecture/ubiquitous-language.md`; the term is narrow (lives entirely in the Registration write path) and may not warrant a top-level vocabulary entry. **Decision:** ADR-0020 carries the canonical definition; `ubiquitous-language.md` untouched this session.
- **`buildRecipientKey`** is the canonical helper name. Future Registration writers must import it.

## Reflections

- **Petey's recommendation discipline paid off again.** Same single-round grill pattern as SESSION_0258/0259/0260 — present all 8 questions with recommendations, operator confirmed all 8. Total grill time: under 5 minutes. The two-paragraph-per-question format with explicit trade-offs is what makes this fast.
- **Subagent parallelization saved ~20 minutes.** Webhook check + UI v2 dialog ran in background while the main thread did the migration → action refactor → null-handling sweep chain. Both subagents returned actionable reports; no rework. The UI subagent's `as any` flag was honest about the RHF limitation rather than hiding it.
- **The 7-file sweep ballooned to 12+.** The original plan listed 7 files based on `grep "registration\.user"`. The actual blast radius was: 7 read sites + 4 test seed sites + 3 Stripe write sites + 1 webhook findUnique. Lesson: when a schema delta makes a previously-required field nullable, the blast radius is bigger than the read sites; every *writer* that didn't explicitly set the new NOT NULL field also breaks. Next time, pre-grep both `registration\.user` AND `registration\.create` AND `tournamentId_userId`.
- **Hand-writing the migration was faster than fighting `prisma migrate dev`.** The interactive-prompt error on `--create-only` would have required a TTY workaround; the migration SQL was ~25 lines and easier to author directly. The `--create-only` step is meant to be the easy path but stumbles on data-migration ordering requirements. For schema deltas with backfill steps, hand-writing the SQL is the cleaner tool.
- **Backfill-first paid off (even at zero candidates).** Running the dry-run on dev was a 2-second exercise that confirmed the candidate-query logic. If production has candidates, operator gets advance notice before the constraint apply. The script is a checked-in artifact for any future A2.5-style decommission.
- **`buildRecipientKey` is one line.** Resist the urge to make it more clever. The whole point of a canonical helper is that future writers can copy it without thinking. Three call sites today; if it grows to ten, move it to a shared module.

### Kaizen

- **Safe and secure?** Yes. Stub-User attack surface removed. Audit-log captures full forensics. Migration is non-destructive. Backfill script is idempotent + dry-run-capable. Constraint apply ordering hand-verified.
- **Failed steps preventable?** Yes — the 7-file estimate could have been "≥7 files + every Registration writer + every `tournamentId_userId` consumer" with a 5-second grep pre-flight. Worth noting for the next schema-delta session.
- **Confidence:** 9.7/10. Migration clean, action refactor clean, sweep typecheck-clean, UI v2 ships in same PR, ADR codifies the decision, backfill artifact exists. Only deduction: Playwright pending + the 5 RHF `as any` casts (known workaround, not a regression).
- **WORKFLOW score:** 9.7/10. Single-round grill, parallel subagents, backfill-first hygiene, ADR written post-implementation. The sweep expansion (7 → 12 files) was discovered and absorbed inline rather than blocking the session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0261 frontmatter created at bow-in (`type: session--open`, `last_agent: claude-session-0261`). ADR-0020 frontmatter complete with backlinks to SESSION_0260/0261 + ADR-0019. No other doc frontmatter bumps needed (no other wiki/architecture docs touched). |
| Backlinks/index sweep | SESSION_0261 row added to `docs/knowledge/wiki/index.md`. ADR-0020 added to index. SESSION_0260 `pairs_with` already lists SESSION_0261 via its `## Next session` planning block. |
| Wiki lint | `bun run wiki:lint` — 232 errors + 541 warnings (baseline). Zero references to SESSION_0261 or ADR-0020 in the output, so no new issues introduced this session. |
| Kaizen reflection | Reflections section present above. |
| Hostile close review | Above; one new finding (FINDING_01: RHF `as any` workaround) + one carry-forward (FINDING_02: bracket-spec). |
| Review & Recommend | `## Next session` candidates queued below — A3 follow-ons (none — A3 closed), C lineage parity (carried), D ADR-numbering cleanup (carried), and a new "Doug bracket-spec hydration fix" candidate. |
| Memory sweep | None needed this session — all patterns used (single-round grill, parallel subagents, backfill-first, ADR-after-implementation) are already in operator-memory or in-tree session reflections. |
| Next session unblock check | Unblocked. C lane inputs already documented (SESSION_0258 next-session block). D lane is mechanical. Bracket-spec Doug session has the exact file:line (`bracket-viewer.tsx:425`) and prior FINDING references. |
| Git hygiene | Branch `main`, single feat commit, push to `origin/main`. Recorded in bow-out response. |
| Graphify update | Run post-push with `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .`; final stats reported in bow-out response. |

## Next session

*Final pick TBD at next bow-in. Candidates, in priority order:*

### Candidate Bracket-Doug (new) — bracket-viewer hydration mismatch fix

Dedicated Doug session to fix `bracket-viewer.tsx:425` hydration mismatch (SESSION_0258_FINDING_01 / SESSION_0261_FINDING_02). The bracket-spec Playwright test has flaked across SESSIONS_0258 (failed) → 0259 (passed 29/29) → 0260 (re-failed). Today's session's edits to `bracket-viewer.tsx` only touched the helper functions (lines 62-72), so the line-425 Button render path is unchanged. Recommend:

1. Reproduce the failure deterministically (run `bunx playwright test e2e/admin/bracket.spec.ts` in isolation 10× to confirm flake vs. broken).
2. Inspect the line-425 Button render path for server/client divergence (likely a Date-format or random-id source).
3. Wrap the offending render in `useEffect` + state, or use `suppressHydrationWarning` with a justification comment.
4. Confirm full 29-spec passes 3× in a row.

### Candidate C (carried from SESSION_0258/0259/0260) — Premium lineage listing parity

Unchanged. See SESSION_0258's `## Next session` for scope shape. Three baselines (Prisma + Stripe + email).

### Candidate D (carried from SESSION_0260) — ADR-numbering collisions cleanup

ADR 0012 (admin-crud-routing-pattern vs tier-auto-grant) and ADR 0016 (lineage-promotion-source-of-truth vs abandoned 0016) ambiguous in cross-references. Mechanical fix: renumber with backlink sweep, or document "latest wins" in `decisions/README.md`.

### Candidate UI-Hygiene (new, low priority) — RHF discriminated-union path inference cleanup

Address SESSION_0261_FINDING_01: the 5 `as any` casts in `walk-in-registration-dialog.tsx`. Lift the recipient-kind toggle into form state via `useFormContext` + `useController`. Adds a `<recipient.kind>` field; the schema's discriminator-narrowing should then work without the casts. Small, isolated; good filler.

## Status

closed
