---
title: "SESSION 0369 — stripe@22 live test-mode rehearsal (BBL brand, pre-flip gate)"
slug: session-0369
type: session--review
status: closed
created: 2026-06-12
updated: 2026-06-12
last_agent: claude-session-0369
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0368.md
  - docs/runbooks/integrations/stripe-setup-runbook.md
  - docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0369 — stripe@22 live test-mode rehearsal (BBL brand, pre-flip gate)

## Date

2026-06-12

## Operator

Brian + claude-session-0369

## Goal

First item of the SOT-ADR D9 pre-flip gate: re-prove the **real signed-webhook → entitlement
path** on `stripe@^22.1.1` (already in package.json — this is the runtime proof), with a
**BBL-branded** fixture driven from `bbl.local/lineage/join`, per the
`stripe-setup-runbook.md` "Stripe CLI live test-mode rehearsal" procedure (SESSION_0345).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0368.md` (closed — feature gate + minimal chrome).
- Carryover: D9 pre-flip order — this rehearsal is item 1.

### Branch and worktree

- Branch: `main` (rehearsal session; only docs + a reusable tooling script land)
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `1879dc5`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None (verification session; payments pipeline exercised, not modified) |
| Extension or replacement | Not applicable |
| Why justified | D9 pre-flip gate; D-018 (prod is live-mode) forces the off-prod rehearsal |
| Risk if bypassed | First real BBL checkout after the flip would be the first runtime test of stripe@22 |

### FAILED_STEPS / drift check

- D-018 acknowledged (live-mode prod) — rehearsal ran fully off prod (`sk_test`, local DB).
- FS-0002 acknowledged — dev server restarted via the canonical command (twice: rehearsal env,
  then clean restore).

## Petey plan

### Goal

Runbook §rehearsal executed end-to-end on stripe@22 with a BBL fixture; every assertion green;
fixture cleaned by id; evidence + runbook/checklist updates landed.

### Tasks

#### SESSION_0369_TASK_01 — Rehearsal execution + evidence

- **Agent:** Cody/Doug (inline) + operator (hosted-checkout card entry)
- **What:** Env verification → real test-mode Stripe objects → disposable BBL fixture
  (new reusable bridge `apps/web/scripts/stripe-rehearsal-seed.ts`) → dev server with
  `DEV_LOGIN_USER_ID` → `stripe listen` forwarder → subscription checkout → grant assert →
  CLI cancel → revoke assert → one-time checkout (returning customer) → purchase assert →
  cleanup by id + deactivate test objects → docs.
- **Done means:** all runbook §6 assertions green; cleanup verified; runbook + checklist updated.
- **Depends on:** nothing

### Open decisions

None.

### Scope guard

- No app-code changes (the billing pipeline is being *proven*, not modified).
- No prod URLs, no live keys, no schema.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0369_TASK_01 | landed | Full rehearsal green on stripe@22 — see Verification. One new tool: `scripts/stripe-rehearsal-seed.ts` (seed/read-state/cleanup against REAL price ids). Operator completed both hosted checkouts (card entry sealed from automation, re-confirmed; second was Stripe Link one-click). |

## What landed

- **stripe@22 runtime proof (D9 pre-flip item 1) — GREEN.** Real signed webhooks on a BBL-branded
  lineage-membership fixture: subscription grant → cancel → revoke; one-time purchase grant +
  success-page render; returning-customer fix (SESSION_0345_FINDING_01) holds.
- Reusable rehearsal bridge `apps/web/scripts/stripe-rehearsal-seed.ts`.
- Runbook §"SESSION_0369 re-proof" + CUTOVER_CHECKLIST rank-2/step-4 updated.

## Decisions resolved

- Rehearsal brand = BBL (the flip surface), driven from `bbl.local/lineage/join` — both
  rehearsal plans rendered through the real brand-scoped plan query.
- Launch-day note recorded: verify the **prod** Stripe account's public business name/branding
  (test account renders "Tuff Buffs" on hosted checkout).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/stripe-rehearsal-seed.ts` | NEW — reusable real-price-id fixture bridge (seed / read-state / cleanup) |
| `docs/runbooks/integrations/stripe-setup-runbook.md` | §SESSION_0369 re-proof + operational notes |
| `docs/product/black-belt-legacy/CUTOVER_CHECKLIST.md` | rank-2 + step-4 marked re-proven |
| `apps/web/.env` (uncommitted) | `STRIPE_WEBHOOK_SECRET` re-synced to current CLI listener secret (runbook step 1) |

## Verification

| Assertion (runbook §6) | Result |
| --- | --- |
| `STRIPE_SECRET_KEY` = `sk_test_…`; webhook secret hash == listener hash | ✅ (synced, strict-trim compare MATCH) |
| Real test-mode objects | ✅ `prod_UgwqbelaAbEyE2` + one-time `price_…uhL5Oobp` (9900) + monthly `price_…2asIZMth` (2900) |
| BBL plans render on `bbl.local/lineage/join` | ✅ "Join Legacy (rehearsal)" + "Start Monthly (rehearsal)" |
| Subscription checkout → signed webhook | ✅ `checkout.session.completed` + `invoice.paid` forwarded **[200]**, both `PROCESSED` |
| Subscription grant | ✅ `UserEntitlement` ACTIVE, sourceType SUBSCRIPTION, source `sub_1ThZ6D…` |
| `stripe subscriptions cancel` → revoke | ✅ `customer.subscription.deleted` [200] → grant `REVOKED` (active 0 / revoked 1) |
| Returning-customer second checkout | ✅ session created without `customer_update` rejection (FINDING_01 fix holds); Stripe Link one-click completed it |
| One-time purchase grant | ✅ PURCHASE ACTIVE, source = `cs_test_…`, `paidInvoiceCount` 1; success page rendered |
| ADR 0019 boundary | ✅ `membershipCount` 0, `programEnrollmentCount` 0 throughout |
| Webhook ledger | ✅ 5/5 events `PROCESSED` (2× checkout.completed, 2× invoice.paid, 1× subscription.deleted) |
| Cleanup | ✅ DB rows deleted by id (user/shells/org/entitlements/plans/grants/invoices/webhook rows/StripeCustomer); product + both prices deactivated (`"active": false` ×3); forwarder stopped; clean dev server restored |

## Open decisions / blockers

- D9 pre-flip remainder: **OG/meta + robots/sitemap hygiene** → minimal 301 map → prod render
  verify → FLIP.
- Launch-day: prod Stripe account branding check; money-free webhook-destination verification on
  the prod domain; deliberate real-charge-and-refund smoke decision (per checklist step 4).
- `.env` note: `DEV_LOGIN_USER_ID` was used transiently; clean server restored without it.

## Next session

### Goal

D9 pre-flip item 2: BBL OG image + metadata basics; robots/sitemap must not advertise gated
routes (the static `public/sitemap*.xml` predates the D9 gate).

### First task

Audit `public/robots.txt` + `public/sitemap*.xml` + OG/metadata config for BBL against the D9
allowlist; ship the minimal hygiene fix (gated routes out, BBL og-image present). Unblocked.

## Review log

### SESSION_0369_REVIEW_01 — Rehearsal

- **Reviewed tasks:** TASK_01
- **Dirstarter docs check:** not applicable (verification)
- **Verdict:** The full runbook assertion matrix executed without a single pipeline defect —
  stripe@22 is runtime-proven on the exact surface BBL will sell. Procedure friction found and
  documented (interactive `subscriptions cancel` prompt; listener-secret drift since 0345;
  Link one-click on returning customers). Cleanup verified to zero.
- **Score:** 9.5/10
- **Follow-up:** none — gate closed.

## Hostile close review

- **Giddy:** pass — zero app-code changes; no prod contact; secrets handled by hash comparison;
  fixture cleaned by id; .env change is the runbook-prescribed local state.
- **Doug:** pass — every assertion is a positive check against DB state or signed-forwarder
  output; nothing inferred from silence.
- **Desi:** not applicable (no UI changes).
- **Kaizen aggregate:** 9.5/10.

## ADR / ubiquitous-language check

- ADR update not required — proves D9/D-018 posture; ADR 0019 boundary re-confirmed by assertion.
- Ubiquitous language unchanged.

## Reflections

- **The monitor-on-forwarder pattern made the operator handoff seamless:** card entry is the one
  human step; tailing `stripe listen` with an event filter meant the agent resumed assertions
  within seconds of payment, both times, with no polling.
- **Listener secrets rot between rehearsals.** The 0345-era `STRIPE_WEBHOOK_SECRET` no longer
  matched the CLI listener — now a named runbook step with a hash-compare one-liner.
- **Interactive CLI confirmations fail silently behind greps.** `stripe subscriptions cancel`
  prompted for `yes` and got EOF; the first "cancel" did nothing and only the unchanged DB state
  revealed it. Raw-output-first on unfamiliar CLI commands, then filter.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | This file + runbook + checklist stamped session-0369. |
| Backlinks/index sweep | `wiki/index.md` SESSION_0369 row added at close. |
| Wiki lint | Result in close chat. |
| Kaizen reflection | 3 entries above. |
| Hostile close review | REVIEW_01; pass, 9.5/10. |
| Review & Recommend | Next = OG/sitemap hygiene (D9 item 2), first task staged. |
| Memory sweep | Program memory: rehearsal gate CLOSED; pre-flip remainder updated. |
| Next session unblock check | Unblocked. |
| Git hygiene | Single close commit on main (docs + tooling script). |
| Graphify update | Stats in close chat. |
