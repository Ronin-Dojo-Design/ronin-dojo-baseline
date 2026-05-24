---
title: "SESSION 0086 — Refunded-paid tournament UI smoke + cancel/refund regressions"
slug: session-0086
type: session
status: closed-full
created: 2026-05-06
updated: 2026-05-06
last_agent: codex-session-0086
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0085.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0086 — Refunded-paid tournament UI smoke + cancel/refund regressions

### Date

2026-05-06

### Operator

Brian Scott + Codex acting as Petey orchestrator, Cody/Doug/Desi/Giddy execution lanes

### Status

closed-full

### Goal

Execute SESSION_0085 TASK_05: prove the refunded-paid customer experience end-to-end enough that a customer whose paid registration is rejected at webhook fulfillment does not see a silent success banner, and add cancel/refund action regression tests around the stored PaymentIntent refund path.

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/sprints/SESSION_0085.md`
- ✅ `docs/protocols/WORKFLOW_5.0.md`
- ✅ `docs/architecture/program-plan.md`
- ✅ `docs/protocols/failed-steps-log.md`
- ✅ `docs/knowledge/wiki/drift-register.md`
- ✅ `docs/runbooks/graphify-repo-memory.md`
- ✅ `docs/agents/petey.md`
- ✅ Component-porting docs open in IDE:
  - `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/component-port-spec.md`
  - `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PW-proof-gate.md`
  - `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-discovery-command-center.md`
  - `docs/knowledge/wiki/component-porting/plawywright-component-conversion-method/PWCC-ASCII-flow-component-port-pipeline.md`
- ✅ `apps/web/app/(web)/tournaments/[slug]/page.tsx`
- ✅ `apps/web/components/web/tournaments/register-button.tsx`
- ✅ `apps/web/server/web/tournaments/register.ts`
- ✅ `apps/web/server/web/tournaments/register.concurrency.test.ts`
- ✅ `apps/web/app/api/stripe/webhooks/route.test.ts`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Monetization (Stripe refund lifecycle), DB-backed tournament registration state, web UI primitives |
| Extension or replacement | Extension — uses existing Dirstarter/common primitives (`Badge`, `Card`, `Note`, `Section`) and existing safe-action/test patterns |
| Why justified | SESSION_0085 fixed the data-integrity/refund path but left the customer-facing post-checkout state ambiguous. May 18 launch cannot show "Registration confirmed" for a refunded failed registration. |
| Risk if bypassed | Customer trust failure: a rejected paid registration would be visibly confirmed even though the DB marks it `CANCELLED`/`REFUNDED`; cancel/refund regressions could also silently break Stripe refund replay. |

### Graphify check

- Graph status: current. `graphify-out/GRAPH_REPORT.md` built from commit `b24d8156`, matching HEAD `b24d815`.
- Queries used:
  1. `TASK_05 refunded paid registration UI smoke cancel refund tournament success banner`
  2. `Registration CANCELLED REFUNDED tournament registration display success banner`
  3. `cancelRegistration stripe refunds create registration tests`
- Files selected from graph:
  - `apps/web/app/api/stripe/webhooks/route.test.ts`
  - `apps/web/components/admin/tournaments/registrations-table.tsx`
  - `apps/web/server/admin/tournaments/registrations-queries.ts`
  - `apps/web/app/admin/tournaments/[id]/registrations/page.tsx`
- Verification note: graph did not directly surface the public tournament success banner, so source verification expanded to raw search over `apps/web/app/(web)/tournaments`, `apps/web/components/web/tournaments`, and `apps/web/server/web/tournaments`. The customer-facing defect is in `app/(web)/tournaments/[slug]/page.tsx` and `components/web/tournaments/register-button.tsx`; cancel/refund test surface is `server/web/tournaments/register.concurrency.test.ts`.

### Branch + tree state

- Branch: `main`
- Main checkout at bow-in: clean at HEAD `b24d815`
- Existing stale/temporary worktrees from SESSION_0085 remain and are not part of this session:
  - `/Users/brianscott/dev/ronin-dojo-app-wt-0085-route`
  - `/Users/brianscott/dev/ronin-dojo-app-wt-0085-tests`
  - three locked `.claude/worktrees/agent-*` worktrees

## Petey plan

### One task for this session

TASK_05 from SESSION_0085: close the refunded-paid UI smoke and cancel/refund regression gap.

### Why this task now

SESSION_0085 made the data/refund path correct; the launch-critical remaining gap is preventing the rejected paid customer from seeing a false success state.

### Deliverables

1. **Refunded-paid customer notice** — `registered=true` plus an existing `CANCELLED`/`REFUNDED` Registration renders rejected/refunded copy, not "Registration confirmed".
2. **Cancelled/refunded registration display** — the registration widget does not show an impossible re-registration form for a persisted `CANCELLED` Registration that the unique `(tournamentId, userId)` constraint still blocks.
3. **Cancel/refund regression tests** — prove paid cancel calls `stripe.refunds.create` with stored `stripePaymentIntentId`, free cancel does not refund, and missing PaymentIntent fails without mutating the registration.

### Agent assignments

| Task | Agent/persona | Worktree | Write scope | Rationale |
| --- | --- | --- | --- | --- |
| SESSION_0086_TASK_01 | Petey + Giddy (Codex main) | main checkout | `SESSION_0086.md`, `project-log.md`, worktree setup | Orchestration, graphify, task ledger, integration |
| SESSION_0086_TASK_02 | Cody + Desi worker | `../ronin-dojo-app-wt-0086-ui` | `apps/web/app/(web)/tournaments/[slug]/page.tsx`, `apps/web/components/web/tournaments/*` | UI/customer-state copy and proof are isolated from backend action tests |
| SESSION_0086_TASK_03 | Cody + Doug worker | `../ronin-dojo-app-wt-0086-refund-tests` | `apps/web/server/web/tournaments/register.concurrency.test.ts` | Cancel/refund regression tests share existing DB fixture and Stripe mock surface |
| SESSION_0086_TASK_04 | Petey + Doug (Codex main) | main checkout | integration + verification + close docs | Main checkout owns final test runs and close evidence |

### Execution steps

1. Create two clean worktrees from `main`, one for UI and one for refund tests.
2. Dispatch UI worker to implement the public rejected/refunded notice and a focused smoke/unit proof.
3. Dispatch refund-test worker to add cancel/refund regression tests using the existing real-DB fixture.
4. Integrate non-overlapping patches back into the main checkout.
5. Run focused tests:
   - `cd apps/web && bun test components/web/tournaments/registration-notice.test.tsx`
   - `cd apps/web && bun test server/web/tournaments/register.concurrency.test.ts`
   - `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts`
6. Run scoped typecheck or record known pre-existing full typecheck debt if unchanged.
7. Close with project-log review, wiki-lint, and worktree cleanup status.

### Open decisions

None blocking. Re-registration after a persisted `CANCELLED` Registration remains out of scope because the schema currently has a unique `(tournamentId, userId)` registration constraint. This session must avoid presenting a re-registration form that the backend cannot honor.

### Done means

- Customer-facing tournament detail page distinguishes paid-refunded rejection from success.
- Persisted `CANCELLED`/`REFUNDED` registration state has visible copy.
- Cancel/refund action has direct regression tests for paid, free, and missing-PaymentIntent branches.
- Focused tests pass in the primary checkout and SESSION_0086 closes with evidence.

## What landed

- ✅ **TASK_02 — refunded-paid customer notice.** The tournament detail success banner now routes through `RegistrationNotice`. If `?registered=true` resolves to a `CANCELLED`/`REFUNDED` Registration, the page says the registration could not be completed, the division filled before payment confirmation, the payment was refunded, and no slot was taken.
- ✅ **TASK_02 — persisted cancelled registration display.** `RegisterButton` now shows a cancelled/refunded state card for persisted `CANCELLED` Registrations instead of offering the registration form that the current unique `(tournamentId, userId)` constraint cannot honor.
- ✅ **TASK_03 — cancel/refund regression tests.** `register.concurrency.test.ts` now proves paid cancellation refunds by stored PaymentIntent, free cancellation skips Stripe refund, and missing PaymentIntent fails without mutating DB state.
- ✅ **Parallel subagent/worktree execution.** UI and refund-test patches were developed in separate worktrees by separate workers, then integrated and verified in the primary checkout. The 0086 worktrees and branches were removed after integration.

## Files touched

| File | Note |
| --- | --- |
| `apps/web/app/(web)/tournaments/[slug]/page.tsx` | Replaced unconditional registered success banner with status-aware `RegistrationNotice` |
| `apps/web/components/web/tournaments/registration-notice.tsx` | New notice helper/component for success, refunded rejection, cancelled, and processing states |
| `apps/web/components/web/tournaments/registration-notice.test.tsx` | Focused UI smoke/unit proof for refunded rejection, success, and processing copy |
| `apps/web/components/web/tournaments/register-button.tsx` | Persisted cancelled/refunded registration card; no impossible re-registration form |
| `apps/web/server/web/tournaments/register.concurrency.test.ts` | Added cancel/refund regression tests and tracked Stripe refund mock |
| `docs/sprints/SESSION_0086.md` | Session plan, graphify notes, close evidence |
| `docs/protocols/project-log.md` | SESSION_0086 task rows + review block |

## Decisions resolved

- Re-registration after persisted `CANCELLED` remains out of scope. The current DB uniqueness constraint still blocks a second Registration for the same `(tournamentId, userId)`, so this session avoids displaying a form that cannot work.
- `registered=true` with no existing Registration now shows a neutral "processing" notice instead of assuming success. That handles the normal Stripe redirect/webhook timing gap without pretending fulfillment has completed.
- No schema migration and no production action change. This is UI state handling plus regression tests around the existing cancellation behavior.

## Open decisions / blockers

- No blockers for TASK_05.
- Future product decision: whether cancelled tournament registrations should allow re-registration by updating/reopening the existing row, replacing it, or adding a new registration attempt model. That is a separate schema/product decision, not a SESSION_0086 patch.

## Task log

SESSION_0086_TASK_01, SESSION_0086_TASK_02, SESSION_0086_TASK_03, SESSION_0086_TASK_04

## Review log

SESSION_0086_REVIEW_01 — appended to `docs/protocols/project-log.md`.

## Hostile close review

- **Plan sanity:** The session executed the exact TASK_05 follow-up from SESSION_0085: refunded-paid UI smoke plus cancel/refund regression proof.
- **Dirstarter compliance:** UI uses existing common/web primitives and keeps page composition in the existing tournament route pattern. No scratch component system or alternate action layer was introduced.
- **Data integrity:** Tests now lock the paid/free/error cancellation branches. The rejected-paid UI reads persisted Registration state instead of trusting the query string.
- **Lifecycle proof:** Customer sees success only when a Registration exists and is not cancelled; refunded rejection and webhook-processing gaps are distinct visible states.
- **Verification honesty:** Focused UI test, cancel/refund DB test, and webhook regression test pass. Typecheck still fails only on the same pre-existing unrelated 3-file surface from SESSION_0085.
- **Score:** 9.7/10. Remaining gap is a future product/schema decision around re-registration after cancellation.

## ADR / ubiquitous-language check

No ADR needed. This session does not create a new architectural policy or domain term; it applies existing Registration/Payment status semantics to UI and tests.

## Reflections

- The graph helped find admin registration display and webhook/test clusters but missed the public success banner. Raw source verification was necessary and caught the actual customer-facing defect.
- Worktrees helped keep UI and backend-test edits independent. The known fresh-worktree dependency/env issue persisted, so final verification belongs in the primary checkout until worktree bootstrap is standardized.
- The safer launch behavior is to show a blocked/cancelled state rather than re-registration affordances. The backend uniqueness constraint is the product boundary.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0086 has JETTY 3.0 frontmatter and `status: closed-full`; no new wiki pages were added. |
| Backlinks/index sweep | No wiki index change needed; touched docs are sprint/project-log files already in the docs system. |
| Biome check | `cd apps/web && bun biome check 'app/(web)/tournaments/[slug]/page.tsx' components/web/tournaments/register-button.tsx components/web/tournaments/registration-notice.tsx components/web/tournaments/registration-notice.test.tsx server/web/tournaments/register.concurrency.test.ts` → 0 errors after Biome fixed 3 files. |
| UI smoke/unit proof | `cd apps/web && bun test components/web/tournaments/registration-notice.test.tsx` → 3 pass / 0 fail. |
| Cancel/refund regression proof | `cd apps/web && bun test server/web/tournaments/register.concurrency.test.ts` → 6 pass / 0 fail. |
| Webhook regression proof | `cd apps/web && bun test app/api/stripe/webhooks/route.test.ts` → 3 pass / 0 fail. |
| Typecheck | `cd apps/web && bunx tsc --noEmit --pretty false` → fails only on pre-existing unrelated errors in `app/admin/tournaments/roles/[id]/page.tsx`, `app/admin/tournaments/rule-sets/_components/rule-set-form.tsx`, and `server/web/categories/queries.ts` (same surface recorded in SESSION_0085). |
| Wiki lint | `bun run wiki:lint` → 0 errors, 3 pre-existing orphan warnings (`topic-index.md`, `concepts/tournament-ops.md`, `dirstarter-uplift-backlog.md`). |
| Worktree cleanup | 0086 worktrees `ronin-dojo-app-wt-0086-ui` and `ronin-dojo-app-wt-0086-refund-tests` removed; branches `codex/session-0086-ui` and `codex/session-0086-refund-tests` deleted. Older 0085/locked Claude worktrees were left untouched. |
| Project log | SESSION_0086 task rows updated; `SESSION_0086_REVIEW_01` appended. |
| Next session unblock check | Unblocked. Suggested next task: decide/rework the cancelled-registration re-registration policy only if product needs it before launch; otherwise continue S3 tournament ops launch hardening. |
