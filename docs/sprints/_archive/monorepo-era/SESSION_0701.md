---
title: "SESSION 0701 — BUILD: WL-P2-41 invite/claim-email hardening trio"
slug: session-0701
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0701
sprint: S12
lane: bbl
recipe: lane
goal_ids: []
tickets: []
pairs_with:
  - docs/sprints/SESSION_0515.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0701 — BUILD: WL-P2-41 invite/claim-email hardening trio

> Overnight-orchestrator build lane. Worktree `/Users/brianscott/dev/ronin-0701`, branch
> `auto/session-0701-wl41-claim-email-hardening`. Target: the three deliberately-deferred
> SESSION_0515 items in WL-P2-41 (none launch-blocking — hardening).

## Operator

Brian (overnight dispatch) + claude-session-0701

## Goal

Close WL-P2-41's trio: (a) roll back the claim-invite bind when the send fails, (b) resolve
legacy `/app/users/{userId}` bookmarks to the passport-keyed URL instead of 404, (c) replace the
`findMedia` `brand`/`type` `as any` casts with boundary narrowing. Hermetic tests for all three.

## Verify-first (SESSION_0515-era row vs current code)

- **(a)** HALF-STALE: the "sends email even when `bindPendingClaim` returns false" branch was
  already fixed (SESSION_0515 TASK_06 / Doug LOW-1 — `invite-actions.ts` aborts before send on
  `bound === false`). Still open: a FAILED send left the just-written binding in place
  (orphaned-but-benign). That half is what this lane fixes.
- **(b)** REPRODUCES: `app/app/users/[id]/page.tsx` resolved only `findPersonByPassportId(id)`
  → `notFound()`; no userId fallback existed.
- **(c)** REPRODUCES: `server/admin/media/queries.ts:25-26` carried both
  `brand: brand as any` and `type: type as any`.

## Cody pre-flight: Backend — WL-P2-41 trio

1. **Auth predicates:** unchanged — `sendBblClaimInvite` stays on `adminActionClient`;
   `/app/users/[id]` stays inside the admin app shell; `findMedia` is a server query behind the
   admin surface. No authz logic touched.
2. **Existing action scan:** `server/admin/email/invite-actions.ts` (the composer),
   `server/web/lineage/mint-claim-magic-link.ts` (`bindPendingClaim` upsert — read, NOT modified),
   `server/identity/person-service.ts` (the injectable-client DI convention the new helpers and
   tests mirror), `server/admin/people/queries.ts` (`findPersonByPassportId`). Graphify query
   run from canonical (`pending claim bind invite media findMedia passport userId`, budget 1500).
3. **Data flow:** durable claim-email flow (email-links-durable pattern, SESSION_0513) — bind
   server-side, link to plain `/auth/login`; magic-link/callbackURL semantics untouched.
   `Passport.userId` is `String? @unique` (schema read directly), so the (b) fallback resolves
   to at most one passport.
4. **FAILED_STEPS:** FS-0027 acknowledged — suite via `bun run test` (`--parallel=1`); new tests
   are pure DI-fake unit tests (no `mock.module`, no DB, no email seam — heeds the open
   live-Resend finding; lane `.env` has `RESEND_API_KEY` stripped on purpose).

## Task log

### SESSION_0701_TASK_01 — (a) bind rollback on send failure

`sendBblClaimInvite` now snapshots any pre-existing `email_nodeId` binding BEFORE
`bindPendingClaim`, and on a send failure (thrown OR `result.error`) runs a compensating write:
fresh bind → delete the row; pre-existing binding (idempotent re-send) → restore the exact prior
fields (`expiresAt`/`consumedAt`/`consumedByUserId`/`brand`) so the earlier successfully-sent
durable email keeps reconciling through its original window. Rollback is best-effort (never
throws) so the SEND error stays the surfaced, toastable failure — a lingering binding is the
pre-fix benign status quo; a masked send error is not. New helper module
`server/admin/email/pending-claim-rollback.ts` (DI-client pattern); `bindPendingClaim` itself
NOT modified. Durable/90-day-TTL/magic-link semantics untouched.

### SESSION_0701_TASK_02 — (b) legacy userId bookmark fallback

`app/app/users/[id]/page.tsx`: when `findPersonByPassportId(id)` misses, resolve the id as a
legacy USER id via new `server/admin/users/resolve-passport-id.ts`
(`passport.findUnique({ where: { userId } })` — unique key) and `redirect()` to the
passport-keyed URL; only a genuinely unknown id still 404s.

### SESSION_0701_TASK_03 — (c) findMedia enum narrowing

`server/admin/media/queries.ts`: `brand`/`type` stay URL-string params at the signature, but are
narrowed through exported literal-union guards (`parseMediaBrandParam`/`parseMediaTypeParam`,
generic `enumParam` over the Prisma enum objects). A recognized value types as the real enum
member; junk drops the filter (admin list ignores it) instead of reaching Prisma as an
invalid-enum runtime error. Zero `as any` remain in the file.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/email/invite-actions.ts` | snapshot-before-bind + best-effort rollback on send failure (throw and `result.error` paths) |
| `apps/web/server/admin/email/pending-claim-rollback.ts` | NEW — snapshot/rollback helpers (DI client, mirrors `bindPendingClaim` email normalization) |
| `apps/web/server/admin/email/pending-claim-rollback.test.ts` | NEW — 8 hermetic tests (delete vs restore, consumed-marker verbatim, never-throws, key normalization) |
| `apps/web/app/app/users/[id]/page.tsx` | userId→passportId fallback resolve + redirect before `notFound()` |
| `apps/web/server/admin/users/resolve-passport-id.ts` | NEW — `resolvePassportIdByUserId` (unique `Passport.userId` lookup) |
| `apps/web/server/admin/users/resolve-passport-id.test.ts` | NEW — 3 hermetic tests (hit, miss, blank short-circuit) |
| `apps/web/server/admin/media/queries.ts` | literal-union boundary guards replace the two `as any` casts |
| `apps/web/server/admin/media/queries.test.ts` | NEW — 14 hermetic tests (accept every member; reject junk/case-drift/whitespace/cross-enum) |
| `docs/sprints/SESSION_0701.md` | this record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test server/admin/email/pending-claim-rollback.test.ts` | 8 pass / 0 fail, REAL_EXIT=0 |
| `bun run test server/admin/users/resolve-passport-id.test.ts` | 3 pass / 0 fail, REAL_EXIT=0 |
| `bun run test server/admin/media/queries.test.ts` | 14 pass / 0 fail, REAL_EXIT=0 |
| `bun run lint:check` (oxlint) | REAL_EXIT=0 (all warnings pre-existing, none in touched files) |
| `bun run typecheck` run 1 | REAL_EXIT=2 — caught `PendingClaimSnapshot.expiresAt` typed `Date` vs schema `DateTime?`; widened to `Date \| null` |
| `bun run typecheck` run 2 (post-fix) | REAL_EXIT=0 |
| `bun run format:check` (oxfmt, new files) | REAL_EXIT=0 (one wrap auto-fixed in the rollback test, re-run green) |

Affected-test sweep: the only other test file matching the touched modules is
`server/web/organization/org-management.safe-action.test.ts`, which imports a DIFFERENT
`invite-actions` (org invites) — unrelated. `server/web/lineage/bind-pending-claim.test.ts`
covers `bindPendingClaim`, which this lane did not modify; it is a shared-local-DB integration
test, deliberately not run from a parallel lane.

## Proposed ledger edits

> NOT applied — shared ledgers are merge-owner territory. Apply at the merge sweep.

- **`docs/knowledge/wiki/wiring-ledger.md` WL-P2-41 → mark resolved:**
  - Row `WL-P2-41` → `WL-P2-41 ✅`, status column → **RESOLVED — SESSION_0701**.
  - Resolution text: "✅ Resolved — SESSION_0701 (overnight lane). (a) send-failure rollback:
    `pending-claim-rollback.ts` snapshots the `email_nodeId` row pre-bind; a failed send deletes
    a fresh bind / restores a pre-existing one (idempotent re-send window preserved), best-effort
    so the send error surfaces. (The bind-false→abort half had already landed at SESSION_0515
    TASK_06/Doug LOW-1.) (b) `/app/users/{userId}` bookmarks now resolve via unique
    `Passport.userId` → redirect to the passport-keyed URL (`resolve-passport-id.ts`). (c)
    `findMedia` narrows `brand`/`type` through `parseMediaBrandParam`/`parseMediaTypeParam`
    literal-union guards — junk drops the filter, no `as any` left. 25 hermetic tests
    (8+3+14); typecheck/oxlint/oxfmt green."
- No FS/D/incident entries proposed — no SOP misses or drift beyond the half-stale (a)
  reproduction note above, which the resolution text captures.

## Open decisions / blockers

- None. Deliberately NOT done (scope guard): no change to `bindPendingClaim` itself; no inbox
  subtree contact; snapshot→bind is not atomic — a loser in that ms-window degrades to the
  pre-fix benign-orphan behavior (commented at the call site), accepted per the row's
  "orphaned-but-benign" framing.

## Hostile close review

- **Cody self-review:** pass — behavior-preserving except the (a) rollback + (b) redirect (the
  point of the row); no authz changes; no new deps; no schema/migration; no env vars; owned-file
  contract respected (new files confined to `server/admin/{email,users}` + `server/admin/media`
  tests).
- Full hostile review deferred to the orchestrator's merge wave (lane pattern).

## Next session

Merge-owner sweep: apply the WL-P2-41 resolution above, run the build gate at merge
(codex-sandbox note: build in a normal shell), and land the PR.
