---
title: "SESSION 0191 — Billing Safe-Action Wrapper"
slug: session-0191
type: session--implement
status: closed-full
created: 2026-05-17
updated: 2026-05-17
last_agent: codex-session-0191
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0190.md
  - docs/runbooks/sop-test-writing.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0191 — Billing Safe-Action Wrapper

## Date

2026-05-17 MDT

## Operator

Brian Scott + Codex as Petey orchestrator, Cody implementer (subagent), Doug reviewer.

## Goal

Roll the wrapped safe-action test pattern to the billing lane, starting with `createBillingPortalSession` unless bow-in discovery shows `createProgramEnrollmentCheckout` is the better proof target.

## Bow-in Notes

- Opening ritual read from `docs/rituals/opening.md`.
- Latest closed session read: `docs/sprints/SESSION_0190.md`; status `closed-full`.
- SESSION_0190 next-session goal pre-staged this billing wrapper lane.
- Branch at bow-in: `session-0191-billing-safe-action-test`, created from clean `main` at `f49dfde`.
- Local project date command returned `2026-05-17 MDT`; session dates use that project-local date.
- FAILED_STEPS scan: FS-0020 applies directly, so Graphify was used before broad repo search. FS-0021 is open but schema/migration work is not in scope. FS-0022/FS-0023 are deploy/env checks; no env or deployment changes are planned.
- Drift Register scan from Graphify showed no direct billing-wrapper blocker. Billing runtime debt, if found, stays in blockers rather than widening this session.

## Graphify check

- Graph status: `graphify stats --graph .` reported `6295` nodes / `11315` edges / `758` communities / `1240` files after the requested bow-in update path.
- Queries used:
  - `opening.md ritual bow in`
  - `petey-plan.md tasks slated for next session`
  - `graphify-repo-memory.md use graphify queries CLI commands`
  - `billing wrapper createBillingPortalSession safe-action Stripe portal harness`
  - `sop-test-writing wrapped safe-action tests billing inventory`
- Files selected from graph and verified or assigned for direct read:
  - `apps/web/server/web/billing/actions.ts`
  - `apps/web/server/web/billing/actions.test.ts`
  - `apps/web/lib/test/safe-action-env.ts`
  - `apps/web/server/web/attendance/actions.safe-action.test.ts`
  - `docs/runbooks/sop-test-writing.md` §5b and §12
- Verification note: Graphify is navigation only; Cody and Doug must verify behavior by direct source/test reads before implementation claims.

## Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Test infrastructure adjacent to the Dirstarter-derived `next-safe-action` / `userActionClient` and Stripe billing action layer. |
| Extension or replacement | Extension. Adds a local wrapper test using the existing `installSafeActionMocks` harness and existing Stripe/redirect mocks. |
| Why justified | SESSION_0190 staged billing as the last obvious wrapped-action rollout lane after enrollment, schedule, and attendance. |
| Risk if bypassed | Billing helper tests could pass while the real wrapper path regresses on auth, input parsing, Stripe service dispatch, or redirect behavior. |

**Live Dirstarter docs checked on 2026-05-17:** N/A unless runtime billing/Stripe code changes. This session should only add local tests and docs inventory.

## Petey plan

### Goal

Prove the billing safe-action client chain end-to-end by invoking a wrapped billing export through the existing `installSafeActionMocks` harness with unauthenticated, validation/error, and authorized happy-path coverage.

### Tasks

#### TASK_01 — Billing wrapped action discovery + test

- **Agent:** Cody backend test worker.
- **What:** Add `apps/web/server/web/billing/actions.safe-action.test.ts` using the existing harness and Stripe mock precedent from `billing/actions.test.ts`.
- **Steps:**
  1. Run Graphify query for billing wrapper terms, then directly read `apps/web/server/web/billing/actions.ts`, `apps/web/server/web/billing/actions.test.ts`, `apps/web/lib/test/safe-action-env.ts`, and `docs/runbooks/sop-test-writing.md` §5b.
  2. Prefer `createBillingPortalSession` as the initial wrapper target because its fixture surface is small: user + current-brand `StripeCustomer` + mocked Stripe billing portal + mocked `redirect`.
  3. Prove unauthenticated short-circuit with no Stripe call and no redirect.
  4. Prove a validation or error-normalization case. If using `createBillingPortalSession`, either submit an invalid `returnUrl` shape to trigger `validationErrors` or use the existing no-customer branch to prove serverError without Stripe call.
  5. Prove authorized happy path creates a Stripe Customer Portal session for the current-brand customer and redirects to the mocked URL.
- **Done means:** New billing wrapper test passes in isolation and does not change billing runtime code or the shared harness.
- **Depends on:** nothing.

#### TASK_02 — Verification and close

- **Agent:** Doug + Petey.
- **What:** Run focused billing wrapper test, combined wrapper regression, scoped typecheck, wiki lint, docs inventory update, project-log/wiki/session closeout, git hygiene, and post-commit Graphify update.
- **Done means:** SESSION_0191 closes with evidence and billing appears in the wrapped safe-action inventory.
- **Depends on:** TASK_01.

### Parallelism

TASK_01 is one new test file, so one Cody worker is enough. TASK_02 is sequential and should stay on the main thread because it touches shared docs.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Single-file implementation with strong local precedent. |
| TASK_02 | Doug + Petey | Verification and closeout. |

### Open decisions

- Decide at bow-in whether the wrapper proof should target `createBillingPortalSession` first or jump to `createProgramEnrollmentCheckout`. The portal action is the smaller, lower-risk first proof.

### Risks

- `redirect()` must be mocked before importing billing actions.
- Stripe service must be mocked before the action import.
- `createProgramEnrollmentCheckout` has a larger fixture surface and should not be selected unless the session has enough room for PricingPlan/EntitlementGrant setup.

### Scope guard

No billing runtime changes, no Stripe SDK changes, no harness changes, and no env/deploy changes. If billing runtime debt appears, record it for a follow-up instead of widening SESSION_0191.

### Dirstarter implementation template

- **Docs read first:** `docs/runbooks/sop-test-writing.md` §5b, `apps/web/server/web/billing/actions.test.ts`, `apps/web/server/web/attendance/actions.safe-action.test.ts`; live Dirstarter docs only if the session changes billing runtime, Stripe integration, or env behavior.
- **Baseline pattern to extend:** `userActionClient` wrapper + `installSafeActionMocks` + existing Stripe billing portal mock.
- **Custom delta:** Adds wrapper proof for billing action middleware and error shape.
- **No-bypass proof:** Test should invoke the exported billing action directly through the wrapper.

## Task Log

SESSION_0191_TASK_01, SESSION_0191_TASK_02

## What landed

1. **TASK_01 — Billing wrapper test:** Added `apps/web/server/web/billing/actions.safe-action.test.ts` invoking the wrapped `createBillingPortalSession` export through `installSafeActionMocks`. Four cases prove the `userActionClient` path: unauthenticated -> `serverError === "User not authenticated"` with no Stripe call or redirect; authenticated invalid `returnUrl` -> `result.validationErrors.returnUrl`; authenticated no-current-brand customer -> `serverError === "No billing customer found for this brand."`; authorized current-brand customer -> Stripe Customer Portal call and mocked redirect to the portal URL.
2. **TASK_02 — Verification + docs + close:** Isolated and combined regressions passed. `sop-test-writing.md` gained the billing wrapper row, `project-log.md` gained SESSION_0191 task/review/kaizen entries, `wiki/index.md` marks SESSION_0191 closed-full, and full-close evidence is recorded below.

## Files touched

- `apps/web/server/web/billing/actions.safe-action.test.ts` — new wrapped safe-action test for `createBillingPortalSession`.
- `docs/runbooks/sop-test-writing.md` — appended billing wrapper test to §12 inventory; bumped `last_agent`.
- `docs/protocols/project-log.md` — SESSION_0191 task plan, review, and kaizen entry; bumped `last_agent`.
- `docs/knowledge/wiki/index.md` — updated SESSION_0191 row to `closed-full`; bumped `last_agent`.
- `docs/sprints/SESSION_0191.md` — current session record and full-close artifact.

## Decisions resolved

- Chose `createBillingPortalSession` over `createProgramEnrollmentCheckout` because it proves the billing wrapper path with one user, one `StripeCustomer`, a Stripe portal mock, and redirect capture. The checkout action has a much larger PricingPlan/Entitlement fixture surface and is better left to helper/webhook/drift tests.
- Used an unsafe test-only cast with `returnUrl: 42` for the validation case because the action schema only validates shape, not URL semantics.
- Covered the no-customer branch as a server-error proof because it is billing-specific error normalization that validation-only coverage would miss.

## Open decisions / blockers

- FS-0023 follow-up remains: add a Vercel env parity guard or audit procedure so Production/Preview env scope drift is detectable before PR deploys fail.
- Existing SESSION_0188 continuation follow-ups remain outside this session: `_`-prefixed unused prop audit and production seed inventory.
- No blocker for the next session.

## Verification

| Check | Command | Result |
| --- | --- | --- |
| New wrapper test (isolated) | `bun test --timeout 120000 server/web/billing/actions.safe-action.test.ts` from `apps/web` | 4 pass / 0 fail / 18 expect() |
| Combined wrapper + helper regression | `bun test --timeout 120000 server/web/billing/actions.safe-action.test.ts server/web/billing/actions.test.ts server/web/attendance/actions.safe-action.test.ts server/web/attendance/actions.test.ts server/web/schedule/actions.safe-action.test.ts server/web/schedule/actions.test.ts server/web/enrollment/actions.safe-action.test.ts server/web/lineage/node-profile-actions.safe-action.test.ts server/admin/lineage/claim-review-actions.safe-action.test.ts` from `apps/web` | 33 pass / 0 fail / 173 expect() across 9 files |
| TypeScript | `bunx tsc --noEmit` from `apps/web` | exit 0 |
| Wiki lint | `bun run wiki:lint` | 0 errors / 495 warnings after touched-file R8 cleanup; remaining warnings are pre-existing outside this session's touched-file scope |
| Diff whitespace | `git diff --check` | clean |

## Review log

- SESSION_0191_REVIEW_01 — billing wrapper coverage recorded in `docs/protocols/project-log.md`.

## Hostile close review

- **Giddy verdict:** The session stayed inside the planned billing-wrapper lane. It extends the Dirstarter-derived `userActionClient` test pattern and uses existing local mocks. No billing runtime, Stripe SDK, env, schema, or shared harness changes were made.
- **Doug verdict:** The proof surface is complete for the chosen wrapper target: unauthenticated callers short-circuit before Stripe, invalid parsed input surfaces `validationErrors`, missing current-brand Stripe customer surfaces the billing-specific `serverError`, and the authorized happy path uses the current-brand platform `StripeCustomer` to create a portal session and redirect. Combined regression with prior wrapper/helper tests passed.
- **Dirstarter docs check:** not applicable — local test file + local SOP inventory edit only.
- **Sources:** `apps/web/server/web/billing/actions.ts`, `apps/web/server/web/billing/actions.test.ts`, `apps/web/server/web/billing/stripe-customers.ts`, `apps/web/lib/test/safe-action-env.ts`, `apps/web/server/web/attendance/actions.safe-action.test.ts`, `docs/runbooks/sop-test-writing.md` §5b/§12.
- **WORKFLOW score:** 9.8/10. Held below 10 because recent deploy-chain follow-ups still need an operational guard.

## ADR / ubiquitous-language check

No ADR or ubiquitous-language update needed. This session adds test coverage for an existing billing action-client pattern and introduces no new architectural decision or domain term.

## Next session

- **Goal:** Add a Vercel env parity guard for FS-0023 so required variables can be checked across Production and Preview before PR deploys fail.
- **Inputs to read:** `docs/protocols/failed-steps-log.md` FS-0023, `docs/runbooks/deployment.md`, `apps/web/env.ts`, existing repo scripts under `scripts/`, and Vercel CLI/API availability in the local environment.
- **First task:** Petey + Cody — design the smallest useful guard first. Prefer a script or documented command that reports missing Production/Preview scope without printing secret values. If Vercel credentials are unavailable locally, land the script/runbook with a dry-run/mockable mode and record the credential requirement.

## Reflections

- The portal action was the right proof target. It closes the billing wrapper gap without dragging checkout enrollment fixtures into a test whose purpose is middleware and error-shape coverage.
- `redirect()` mocking is the only extra seam beyond the standard safe-action harness and Stripe mock. Keeping that local to the test file avoids harness bloat.
- Subagent partitioning worked cleanly: Doug identified the smallest target, Cody wrote one isolated test file, and Petey kept docs/closeout separate.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Updated `last_agent: codex-session-0191` on `sop-test-writing.md`, `project-log.md`, and `wiki/index.md`; `SESSION_0191.md` frontmatter set to `status: closed-full`, `type: session--implement`; fixed touched-file R8 blank-line warning in `sop-test-writing.md`. |
| Backlinks/index sweep | `docs/knowledge/wiki/index.md` SESSION_0191 row updated to `session--implement` / `closed-full`; no new wiki pages or cross-reference pairs created. |
| Wiki lint | `bun run wiki:lint` returned 0 errors / 495 warnings after touched-file R8 cleanup; remaining warnings are pre-existing outside this session's touched-file scope. |
| Kaizen reflection | Reflections section present above; project-log Kaizen entry present under SESSION_0191_REVIEW_01. |
| Hostile close review | SESSION_0191_REVIEW_01 recorded in project log; hostile close review section present above. |
| Review & Recommend | Next session goal written above: Vercel env parity guard for FS-0023. |
| Memory sweep | None needed; the reusable wrapper pattern remains documented in `sop-test-writing.md` §5b/§12 and the session records. |
| Next session unblock check | Unblocked if Vercel CLI/API credentials are available; otherwise the first task can still land a dry-run/mockable script and document credential setup. |
| Git hygiene | Pending final branch/status/commit/push proof in bow-out response. |
| Graphify update | Pending post-commit Graphify update. |

## Status

closed-full
