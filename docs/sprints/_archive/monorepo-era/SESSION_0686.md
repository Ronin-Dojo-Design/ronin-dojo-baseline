---
title: "SESSION 0686 — BBL consent-gated social approval-queue (model + oRPC + /app/social-queue) (auto lane)"
slug: session-0686
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0686
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/product/black-belt-legacy/social-flywheel-approval-queue-spec-draft.md
  - docs/product/black-belt-legacy/social-content-flywheel-draft.md
  - docs/sprints/SESSION_0666.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0686 — BBL consent-gated social approval-queue (auto lane)

> Overnight-orchestrator build lane. HIGH-STAKES CODE (Larry reviews consent). Branch:
> `auto/session-0686-bbl-approval-queue`, worktree `/Users/brianscott/dev/ronin-0686`.
> PR held at the gate per the standing authorization — NEVER merged in-lane.

## Date

2026-07-24

## Operator

Brian + autonomous lane (orchestrated)

## Goal

Build the social-flywheel approval queue: auto-generated social items (e.g. belt-promotion
celebration posts) queue as DRAFTS requiring human approval before any publish. The machine
STOPS at "approved, ready to publish" — the actual publish/send is a later wired step +
operator. Scope = spec Phase A (model) + Phase C surface skeleton (queue + transitions), via
oRPC per the dispatch; NO capture wiring (Phase B), NO cron (Phase D), NO renderer graduation.

## What landed

| Piece | Where |
| --- | --- |
| Prisma model `SocialQueueItem` + enums `SocialQueueSource` (E1–E5) / `SocialQueueStatus` (DRAFT·APPROVED·REJECTED·PUBLISHED) / `SocialConsentBasis` (MEMBER_OPT_IN·AGGREGATE_ONLY·OWNED_CONTENT); back-relations on `User` (`approvedSocialQueueItems`, SetNull audit) + `Passport` (`socialQueueItems`, Cascade privacy lever) | `apps/web/prisma/schema.prisma` |
| Hand-authored migration (offline `prisma migrate diff` — the shared local DB was never touched; proven via `migrate deploy` of the FULL history on disposable `ronindojo_0686_scratch`, then dropped) | `apps/web/prisma/migrations/20260724120000_add_social_queue_item/migration.sql` |
| Pure status machine + consent gate (no edge into PUBLISHED; REJECTED terminal; `evaluateApprovalConsent` per-basis contract, F2 fail-closed) | `apps/web/server/social-queue/transitions.ts` |
| Client-safe params/row contract (inbox-schema idiom; enums as string literals, never value-imported) | `apps/web/server/social-queue/schema.ts` |
| oRPC router `socialQueue` = `list` / `approve` / `reject`, all gated `meta.permission: social-queue.manage`; approve re-runs live consent, compare-and-swap transitions; NO publish procedure exists | `apps/web/server/orpc/routers/social-queue.ts`, mounted in `apps/web/server/router.ts` |
| Authz key `socialQueue: "social-queue.manage"` in the EXISTING per-area matrix (new NEED = new KEY, never a 5th system; admin `"*"` covers it) | `apps/web/server/orpc/roles.ts` |
| Conformed AdminCollection surface: segment-layout permission gate, params-cache → `rsc()` → Suspense → `AdminCollection` frame (NOT hand-rolled/forked), status DataSelect (opens on DRAFT), source facet, per-row approve/reject with confirmation dialog + required reject reason | `apps/web/app/app/social-queue/{layout,page}.tsx` + `_components/social-queue-{table,table-columns,row-actions}.tsx` |
| Hermetic unit tests: 17 pure transition/consent cases + 21 live-pipeline router cases (authz matrix, transitions, consent auto-reject/fail-closed, CAS races, whole-file "nothing publishes" write sweep) | `apps/web/server/social-queue/transitions.test.ts`, `apps/web/server/orpc/routers/social-queue.test.ts` |

## The consent basis (for Larry)

Every queue row carries a `consentBasis` recorded at enqueue time and **re-verified live at
approve time** (enqueue-time consent is necessary, not sufficient — spec §2.3):

- **`MEMBER_OPT_IN`** (person-centric: claim-verified / belt-promotion celebrations): requires
  (1) a subject Passport FK, (2) that Passport still exists AND is account-claimed
  (`userId != null` — placeholder Passports structurally excluded; an accountless person cannot
  have consented), (3) the affirmative publicity opt-in (fork F2, proposed
  `Passport.allowSocialCelebration`, explicit opt-in default OFF). **F2 is NOT yet ratified by
  the operator, so leg 3 FAILS CLOSED**: person-centric items cannot be approved at all until
  the mechanism lands (a one-line swap in `evaluateApprovalConsent`, pinned by test). Legs 1–2
  failing → the item is **auto-flipped to REJECTED** with `rejectedReason: "consent-revoked"`.
- **`AGGREGATE_ONLY`**: aggregate numbers only, names no person, draws no member data.
- **`OWNED_CONTENT`**: brand-owned editorial (staff blog) — no member subject.
- Unknown basis → fail closed, never approved.
- **Rejected items never publish**: REJECTED is terminal (no out-edges) and the status machine
  has **no edge into PUBLISHED from anywhere** — no v1 code path can publish, by construction
  and by test. This lane deliberately did NOT add the `Passport.allowSocialCelebration` column:
  the spec marks the consent model/default as awaiting operator ratification.

## Proposed ledger edits

*(Shared ledgers are never edited in-lane — the merge owner routes these.)*

1. **Migration-apply note (merge owner):** `20260724120000_add_social_queue_item` is committed
   but **UNAPPLIED on the shared local DB** (migrate dev banned in-lane). At merge: apply to
   `ronindojo_prodsnap` via `bun run db:migrate:deploy` (proven green on a fresh scratch DB this
   session); prod auto-applies via `prebuild → migrate deploy` on deploy. Run `prisma generate`
   before any build gate after checkout (the prebuild-migrates-not-generates memory).
2. **custom-component-inventory.md:** add `/app/social-queue` — a conformed AdminCollection
   sibling of `/app/inbox` (`SocialQueueTable` + `SocialQueueRowActions`; no new shared
   components created, no shared component edited).
3. **Open decision → operator (fork F2):** ratify the publicity-consent mechanism + default
   (spec §2.3 recommends `Passport.allowSocialCelebration`, opt-in, default OFF, edited only in
   the PassportEditor). Until ratified, MEMBER_OPT_IN approval fails closed (by design).
4. **Open decision → operator (spec §4 residue):** no sidebar nav item was added for
   `/app/social-queue` (the sidebar config is a shared surface other lanes touch; the route is
   permission-gated and reachable by URL). Merge owner may add the one-line nav entry.
5. **SOP §13 deviation (test-writing):** the router test seams the db (in-memory mock) instead
   of real Postgres — required because the table cannot exist locally until the migration is
   applied, and the dispatch mandates hermetic tests. Follow-up: once the migration is applied,
   a §5d-style real-DB integration test can join the suite if wanted.
6. **Deferred to later phases (per dispatch/spec):** Phase B capture module + E1–E5 seam
   wiring, Phase D milestone cron, renderer graduation (`lib/social-cards/`), preview drawer +
   caption editing, `SOCIAL_QUEUE_DISABLED` kill-switch (meaningful only once capture exists),
   copy-export action (post-approval; F5 gates TECHNIQUE_FEATURED export).

## Verification table

| Gate | Command | REAL_EXIT |
| --- | --- | --- |
| Bootstrap env strip | `grep -v '^RESEND_API_KEY=' … > apps/web/.env` | 0 |
| Bootstrap install | `bun install` | 0 |
| Bootstrap client | `bunx prisma generate` | 0 |
| Schema valid | `bunx prisma validate` | 0 |
| Migration SQL | `bunx prisma migrate diff --from-schema … --script` (offline) | 0 |
| Client regen (new model) | `bunx prisma generate` | 0 |
| Migration proof | `migrate deploy` full history on disposable `ronindojo_0686_scratch` (then dropped) | 0 |
| Typecheck | `bun run typecheck` (`next typegen && tsc --noEmit`) | 0 |
| Lint | `bun run lint` (oxlint; zero findings in new files) | 0 |
| Format | `bun run format` (oxfmt) | 0 |
| Transitions tests | `bun test server/social-queue/transitions.test.ts` — 17 pass / 0 fail | 0 |
| Router tests | `bun test server/orpc/routers/social-queue.test.ts` — 21 pass / 0 fail (re-run post-oxfmt) | 0 |
| Affected existing tests | `bun test server/orpc/permissions.test.ts` — 36 pass / 0 fail (roles.ts touched) | 0 |

Not run in-lane: full `bun run test` (hits the real shared DB + the open live-Resend unit-test
fix — this worktree's env has RESEND stripped, which would false-fail those suites); e2e
(surface has no rows until the migration + a capture/seed path exist); browser smoke (deferred
to the merge owner with the migration apply).

## Blockers

None. PR holds at the gate for Larry's consent review + merge-owner migration apply.
