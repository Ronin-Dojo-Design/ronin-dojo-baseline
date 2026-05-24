---
title: "SESSION 0095 - Commerce QA Entitlement Proof"
slug: session-0095
type: session
status: closed-full
created: 2026-05-07
updated: 2026-05-07
last_agent: codex-session-0095
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0094.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0095 - Commerce QA Entitlement Proof

## Date

2026-05-07

## Operator

Brian Scott + Codex acting as Petey, then Cody/Doug for implementation and review

## Status

closed-full

## Goal

Add one-time and subscription Checkout/webhook proof tests using the tournament harness as the template, and fix any entitlement idempotency gap the proof exposes.

## Bow-in

### Previous session pickup

- `SESSION_0094` closed full and staged `SESSION_0095` as Commerce QA.
- Required first task from `SESSION_0094`: build the one-time Checkout fixture for `PricingPlan.stripePriceId -> EntitlementGrant -> UserEntitlement`, including a replay/idempotency assertion before subscription coverage.
- Current branch: `main`.
- Current status at bow-in: clean.
- Current HEAD at bow-in: `5f1d41c`.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization/payments, Prisma/database, Stripe webhook test harness |
| Extension or replacement | Extension. Keep Dirstarter Stripe Checkout/webhook and Prisma patterns; add Ronin entitlement proof on top of the existing webhook route and test harness. |
| Why justified | The May 18 launch needs paid-access proof before PWCC and brand rollout work. |
| Risk if bypassed | Checkout could grant access inconsistently, subscription cancellation could leave paid access active, and replayed payment events could duplicate or drift entitlements. |

### Protocol checks

- `WORKFLOW_5.0.md`: current row says `SESSION_0095` is Commerce QA for one-time and subscription Checkout/webhook proof.
- `manual-boundary-registry.md`: MB-013 remains open and requires one-time proof, subscription grant/revoke proof, idempotency proof, and remaining ledger/customer decisions.
- `drift-register.md`: no open drift entry blocks this lane.
- `failed-steps-log.md`: relevant mitigations acknowledged: FS-0006/FS-0007 Petey/WORKFLOW compliance, FS-0008 schema spot-checks, FS-0010/FS-0011 git discipline, FS-0015 project-log/full-close gate.

## Graphify check

- Graph status: stale but intentionally not refreshed per user instruction; report was built from `e0f7237a`, current HEAD is `5f1d41c`.
- Query used:
  - `Stripe checkout entitlement webhook one-time subscription idempotency PricingPlan`
- Files selected from graph/source verification:
  - `docs/architecture/monetization-entitlements-spec.md`
  - `apps/web/app/api/stripe/webhooks/route.ts`
  - `apps/web/app/api/stripe/webhooks/route.test.ts`
  - `apps/web/prisma/schema.prisma`
  - `docs/knowledge/wiki/manual-boundary-registry.md`
- Verification note: Graphify was navigation only. Source review confirmed the webhook grants entitlements from Stripe line-item price IDs and revokes subscription-sourced entitlements on `customer.subscription.deleted`.

## Agent assignments

| Task | Persona/agent | Responsibility |
| --- | --- | --- |
| SESSION_0095_TASK_01 | Petey + Giddy | Bow-in, Graphify query, Dirstarter alignment, task ledger, and pre-flight |
| SESSION_0095_TASK_02 | Cody | Add/fix one-time Checkout entitlement proof and replay idempotency |
| SESSION_0095_TASK_03 | Cody + Doug | Add subscription grant/revoke proof, run verification, update MB-013, and full close |
| Commerce Source Scout | Subagent explorer | Read-only source-flow brief for route/schema/entitlement behavior |
| Test Harness Scout | Subagent explorer | Read-only brief for test commands, mocks, and pitfalls |

### Worktree decision

No new worktree for this slice. The write set is small and tightly coupled (`route.ts`, `route.test.ts`, MB-013, Project Log, and this SESSION file), so parallel worktrees would add merge overhead without isolating ownership. Old dirty SESSION_0085 worktrees remain out of scope unless close hygiene requires recording them again.

## Petey execution scope

### One task for this session

Prove the generic entitlement Checkout path for one-time and subscription Stripe webhooks using real Prisma fixtures and the existing webhook test harness.

### Why this task now

`SESSION_0094` reconciled commerce truth and left MB-013 launch-blocking until paid-access behavior is proven in code.

### Done means

- Focused webhook tests cover mapped one-time Checkout entitlement grant, replay/idempotency, subscription Checkout grant, and subscription deletion revoke.
- Any source-id/idempotency bug exposed by those tests is fixed in the webhook route.
- MB-013 and Project Log record what is now proven and what remains open.

## Pre-flight: Backend - Stripe entitlement webhook proof

### 1. Auth predicates planned

- [x] Session auth required: not applicable to Stripe webhook; signature verification is required by `STRIPE_WEBHOOK_SECRET`.
- [x] Org membership verified: not applicable to webhook fulfillment; fixtures use brand/org-scoped `PricingPlan` rows.
- [x] Brand column filtered: entitlement lookup flows through `PricingPlan.stripePriceId` to brand-scoped `EntitlementGrant`; duplicate price mapping remains a documented launch risk.
- Authorization approach: keep Stripe webhook signature path intact; tests mock signature verification only at module boundary.

### 2. Existing action scan

- Consulted `docs/architecture/dirstarter-baseline-index.md`: not needed for this route-level test; `SESSION_0094` already confirmed Dirstarter Stripe baseline docs.
- Searched source for: `listLineItems`, `checkout.session.completed`, `customer.subscription.deleted`, `pricingPlan`, `entitlementGrants`, `sourceId`.
- Related existing actions/routes: `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/app/api/stripe/webhooks/route.test.ts`, `apps/web/server/web/entitlement/grant-entitlement.ts`.
- L1 pattern match: existing Dirstarter/Ronin webhook route with Bun module mocks and real Prisma DB fixtures.

### 3. Data flow reference

- [x] `docs/runbooks/sop-data-and-wiring-flows.md`: not loaded; no new user-facing data flow or action is being introduced.
- [x] `docs/runbooks/sop-e2e-user-lifecycle.md`: not loaded; this is an API webhook proof, not an E2E browser lifecycle.
- Schema spot-check: `PricingPlan.stripePriceId` is nullable and not unique; `EntitlementGrant` is unique on `[pricingPlanId, entitlementId]`; `UserEntitlement` indexes `[sourceType, sourceId]` but has no unique source constraint. `EntitlementSourceType`: `PURCHASE`, `SUBSCRIPTION`, `MANUAL_GRANT`, `MEMBERSHIP`, `PROMO`. `EntitlementStatus`: `ACTIVE`, `EXPIRED`, `REVOKED`.

### 4. FAILED_STEPS check

- Prior failures in this area: FS-0006, FS-0007, FS-0008, FS-0015.
- Manual Boundary Registry entries: MB-013.
- Mitigation acknowledged: SESSION file and Project Log entries are created before code; schema values were read from source; close cannot mark full without project-log review and full-close evidence.

## Task log

- SESSION_0095_TASK_01
- SESSION_0095_TASK_02
- SESSION_0095_TASK_03

## What landed

- Created `SESSION_0095.md` and Project Log task rows before implementation.
- Added one-time Checkout entitlement proof to the Stripe webhook test harness:
  - real `PricingPlan.stripePriceId` fixture
  - real `EntitlementGrant`
  - manual-grant control row
  - replay of the same Checkout event
  - durable PURCHASE `UserEntitlement`
  - `ProgramEnrollment` projection
- Fixed the webhook entitlement source lookup by normalizing `sourceType` and `sourceId` before lookup/create.
- Added subscription Checkout grant/replay and `customer.subscription.deleted` revoke proof.
- Added a targeted retry for Prisma `P2034` serializable write conflicts around the paid tournament webhook transaction, which stabilized the existing parallel paid-capacity proof.
- Updated MB-013, the monetization spec, and the security/privacy/payments plan to mark one-time/subscription proof landed while keeping remaining launch blockers visible.
- Marked `WORKFLOW_5.0.md` SESSION_0095 as actual and staged SESSION_0096 for commerce implementation.
- Appended `SESSION_0095_REVIEW_01` to the Project Log with three open follow-up findings.

## Files touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0095.md` | New session record, pre-flight, implementation summary, and full-close evidence |
| `apps/web/app/api/stripe/webhooks/route.ts` | Normalized entitlement source lookup/create and added Prisma `P2034` retry for serializable tournament transaction conflicts |
| `apps/web/app/api/stripe/webhooks/route.test.ts` | Added commerce entitlement fixtures and one-time/subscription webhook proof tests |
| `docs/architecture/monetization-entitlements-spec.md` | Updated paid-launch gap status after SESSION_0095 proof |
| `docs/architecture/security-privacy-payments-monitoring-plan.md` | Updated commerce gate language after one-time/subscription proof landed |
| `docs/knowledge/wiki/manual-boundary-registry.md` | Updated MB-013 with proven items and remaining launch gates |
| `docs/protocols/project-log.md` | Added SESSION_0095 task rows and full-close review entry |
| `docs/protocols/WORKFLOW_5.0.md` | Marked SESSION_0095 actual and kept SESSION_0096 as the next commerce lane |

## Decisions resolved

- No Playwright run was needed; this was an API/webhook proof and the existing Bun webhook harness was the right proof surface.
- No new worktree was created because the implementation and docs were tightly coupled.
- Graphify was queried but not refreshed, per user instruction.
- Sequential one-time/subscription replay is now proven at the entitlement source-row level; Stripe event-id persistence remains a separate launch-hardening gap.
- Subscription deletion currently revokes by Stripe subscription id; failed-payment, update, refund/dispute, and grace policy stay in SESSION_0096.

## Open decisions / blockers

- MB-013 remains open.
- Stripe Customer ID / Customer Portal storage path is unresolved.
- Non-tournament `Invoice`/`Payment` ledger projection remains unresolved.
- Subscription update, failed payment, refund, dispute, and grace policy remain unresolved.
- Manual/admin payment entitlement parity remains unresolved.
- `PricingPlan.stripePriceId` remains nullable/non-unique, and `UserEntitlement` source rows remain app-idempotent rather than DB-unique.
- Stripe processed-event ID storage is not implemented.
- Full app typecheck still fails on pre-existing unrelated issues:
  - `server/web/tags/queries.ts(67,10)` excessive stack depth comparing Prisma include types.
  - `server/web/tournaments/queries.brand-isolation.test.ts(18,22)` cannot find module `bun:test` type declarations.
  - `server/web/tournaments/results.smoke.test.ts(16,22)` cannot find module `bun:test` type declarations.
- Existing old SESSION_0085 worktrees remain dirty/locked and were not removed:
  - `/Users/brianscott/dev/ronin-dojo-app-wt-0085-route`
  - `/Users/brianscott/dev/ronin-dojo-app-wt-0085-tests`
  - three locked `.claude/worktrees/agent-*` worktrees
- Changes are uncommitted; no commit/push was requested.

## Verification

- `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` passed: 5 pass, 0 fail, 54 assertions.
- `cd apps/web && bun test --rerun-each=5 app/api/stripe/webhooks/route.test.ts` passed: 25 pass, 0 fail, 270 assertions.
- `cd apps/web && bun biome check app/api/stripe/webhooks/route.ts app/api/stripe/webhooks/route.test.ts` passed after `bun biome check --write` formatted the touched webhook files.
- `cd apps/web && bun run typecheck` failed only on the pre-existing unrelated type errors listed above.
- `git diff --check` passed.
- `bun run wiki:lint` passed: 0 errors, 3 pre-existing orphan warnings.

## Review log

- `SESSION_0095_REVIEW_01` appended to `docs/protocols/project-log.md`.

## Hostile close review

- **Giddy:** Plan stayed aligned with WORKFLOW 5.0. The session extended Dirstarter's existing Stripe Checkout/webhook and Prisma layers rather than introducing a second payment abstraction. No Graphify refresh was run, matching the user instruction.
- **Doug:** The proof is behavioral, not just response-status based: tests assert persisted `UserEntitlement`, `ProgramEnrollment`, revocation scope, replay behavior, refund calls, and tournament capacity invariants. Typecheck remains blocked by unrelated known errors and is recorded honestly.
- **Dirstarter docs check:** live docs checked on 2026-05-07.
- **Sources:** Dirstarter Payments, Monetization, Prisma; Stripe Checkout, subscription integration design, and webhooks.
- **WORKFLOW score:** 9.6/10 for this Commerce QA slice.
- **Kaizen aggregate:** 7.6 for overall payment readiness because ledger, customer identity, subscription policy, processed-event storage, and DB uniqueness remain open.

## ADR / ubiquitous-language check

- No ADR needed. This session fixed/tested existing entitlement-first commerce behavior under ADR 0011 without changing the architecture.
- No ubiquitous-language update needed. Existing terms `PricingPlan`, `Entitlement`, `EntitlementGrant`, and `UserEntitlement` remain accurate.

## Next session

- **Goal:** Close customer/subscription launch gaps or document explicit deferrals before PWCC work resumes.
- **Inputs to read:** `SESSION_0095.md`, `docs/architecture/monetization-entitlements-spec.md`, `docs/knowledge/wiki/manual-boundary-registry.md`, `docs/architecture/security-privacy-payments-monitoring-plan.md`, `apps/web/app/api/stripe/webhooks/route.ts`, `apps/web/server/web/products/actions.ts`, `apps/web/prisma/schema.prisma`.
- **First task:** Decide and implement the Stripe Customer ID / Customer Portal storage path, or explicitly defer it with MB-013 risk accepted; then address ledger projection and subscription failed-payment/refund/dispute policy.

## Reflections

- The one-time replay concern was more subtle than simple duplication: without source normalization, an existing manual grant could be mistaken for the purchase grant.
- The new entitlement tests also flushed out an existing tournament concurrency weakness: Prisma `P2034` write conflicts can happen under the serializable capacity transaction and need a targeted retry.
- The current webhook is now stronger for proven paths, but Stripe's own webhook guidance still points toward processed-event persistence for broader replay/audit safety.
- The cleanest next move is not more proof tests first; it is deciding the customer identity, ledger, and subscription policy contracts so tests can target the real launch behavior.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Checked touched docs with frontmatter: `SESSION_0095.md`, `monetization-entitlements-spec.md`, `security-privacy-payments-monitoring-plan.md`, `manual-boundary-registry.md`, `project-log.md`, and `WORKFLOW_5.0.md`. Updated touched docs to `updated: 2026-05-07` / `last_agent: codex-session-0095` where appropriate. |
| Backlinks/index sweep | Added `docs/sprints/SESSION_0095.md` backlinks to `monetization-entitlements-spec.md`, `security-privacy-payments-monitoring-plan.md`, `manual-boundary-registry.md`, and `project-log.md`. No new wiki page was created; wiki index change not needed. |
| Wiki lint | `bun run wiki:lint` passed: 0 errors, 3 pre-existing orphan warnings (`topic-index.md`, `concepts/tournament-ops.md`, `dirstarter-uplift-backlog.md`). |
| Kaizen reflection | Reflections section present: yes. |
| Hostile close review | `SESSION_0095_REVIEW_01` appended to Project Log with findings 01-03. |
| Review & Recommend | Next session goal written: yes, aligned to WORKFLOW 5.0 `SESSION_0096` Commerce implementation. |
| Memory sweep | No operator memory update needed; durable facts are captured in MB-013, the monetization spec, and the Project Log review. |
| Next session unblock check | Unblocked for SESSION_0096 commerce implementation; first task is customer/portal storage decision and implementation or explicit deferral. |
| Git hygiene | Branch `main`; `git worktree list` shows old dirty SESSION_0085 worktrees and locked `.claude` worktrees left in place; `git diff --check` passed; project-log gate returned 18; no commit/push because not requested. |
