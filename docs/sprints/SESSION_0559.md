---
title: "SESSION 0559 — G-009 creator-payout model plan (docs-only Petey lane)"
slug: session-0559
type: session--plan
status: closed
created: 2026-07-17
updated: 2026-07-17
last_agent: claude-session-0559
sprint: S12
pairs_with:

  - docs/sprints/SESSION_0555.md
  - docs/petey-plan-0559-creator-payout.md
  - docs/product/black-belt-legacy/POST_LAUNCH_SOT.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0559 — G-009 creator-payout model plan (docs-only Petey lane)

## Date

2026-07-17

## Operator

Brian + claude-session-0559

## Goal

Produce a build-ready Petey plan for **G-009 — the creator-payout model for premium community
content** (`docs/knowledge/wiki/goals-ledger.md` §G-009): rev-share model options, Stripe Connect
architecture, the author-earnings surface, schema deltas, abuse considerations, and a PR-sized slice
plan — grounded in the BBL SoT set, ending with an operator grill list. Docs-only; no app code, no
schema edits, no push (hold at push gate).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md). Do not restate the value here.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0555.md`
- Carryover: SESSION_0555 staged the quality-suite **merge wave** as its next session. This lane is
  **operator-pinned to G-009 planning instead** (autonomous plan-only brief); the merge wave remains
  the canonical checkout's next task and is untouched here.

### Branch and worktree

- Branch: `session-0559-g009-payout-plan`
- Worktree: `/Users/brianscott/dev/ronin-0559` (docs-only lane — deliberately **not** bootstrapped:
  no `node_modules`, no `.env`; per opening.md the empty graphify here means "graph not built", and
  wiki-lint cannot run in-worktree — it runs at merge from the canonical checkout)
- Status at bow-in: clean
- Current HEAD at bow-in: `09b042c9`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Payments (planning only — no code this session) |
| Extension or replacement | Extension: live payments doc covers Stripe checkout + subscriptions only (no Connect / marketplace / payouts); creator payouts are a custom delta on the existing Stripe seam |
| Why justified | Dirstarter has no payout capability to reuse; the plan builds beside the existing webhook/entitlement seam, not over it |
| Risk if bypassed | None this session (docs-only); build sessions must re-check the live payments doc |

Live docs checked during planning: Payments (<https://dirstarter.com/docs/integrations/payments>, 2026-07-17).

### Graphify check

Skipped — graph not built in this worktree (opening.md fresh-worktree caveat); discovery ran doc-first
against the SoT set named in the brief. No repo-wide negative asserted from empty graph output.

## Petey plan

### Goal

Write `docs/petey-plan-0559-creator-payout.md` — the G-009 build-ready plan — grounded in the repo
SoT set, with every open fork surfaced for the operator grill.

### Tasks

#### SESSION_0559_TASK_01 — Ground the payout plan in the SoT set

- **Agent:** Petey (inline; docs-only)
- **What:** Read the G-009 row, FI-028/FI-028b rows, SOT-ADR D13, BBL_STRIPE_PRODUCTS_SPEC, ADR
  0030/0045/0046, the Prisma payment/entitlement/community models, and the SESSION_0098 Connect
  pipeline sketch; check Dirstarter live payments doc for Connect coverage.
- **Steps:** (1) goals-ledger §G-009; (2) POST_LAUNCH_SOT FI-028/FI-028b; (3) SOT-ADR D13 + Stripe
  products spec; (4) schema models (`PricingPlan`/`Payment`/`StripeCustomer`/`Entitlement*`/
  `CommunityPost`/`Technique`); (5) prior Connect art (SESSION_0098); (6) Dirstarter payments doc.
- **Done means:** every product claim in the plan carries a repo file-path citation.
- **Depends on:** nothing

#### SESSION_0559_TASK_02 — Write the creator-payout Petey plan

- **Agent:** Petey (inline; docs-only)
- **What:** Author `docs/petey-plan-0559-creator-payout.md` covering rev-share options, Stripe
  Connect architecture, earnings surface, schema deltas, abuse, PR-sized slices, and the grill list.
- **Steps:** per the brief's deliverable outline; petey-plan template conformance; OPEN FORK markers
  wherever the SoT is silent.
- **Done means:** the plan file exists, frontmatter-conformant, ending with the 5–8-fork grill list.
- **Depends on:** SESSION_0559_TASK_01

### Parallelism

Sequential — TASK_02 consumes TASK_01's grounding. Single inline lane (docs-only; no fan-out justified).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0559_TASK_01 | Petey | Discovery/grounding, no code |
| SESSION_0559_TASK_02 | Petey | Plan authorship is the Petey deliverable |

### Open decisions

- All payout-model forks are deliberately **left open for the operator grill** — they are the plan's
  final section, not decisions this session takes.

### Risks

- The goals-ledger is owned by a held lane — this session **must not edit it** (respected; output is
  a new file only).
- Wiki-lint cannot run in this worktree (no `node_modules`); conformance is by-template, verified at
  merge from canonical.

### Scope guard

- No app code, no schema migrations, no Stripe dashboard changes, no push/PR/merge (hold at push gate).
- No edits to `docs/knowledge/wiki/goals-ledger.md` or `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md`.
- FI-001 (send Brian) stays parked.

### Dirstarter implementation template

- **Docs read first:** <https://dirstarter.com/docs/integrations/payments> (2026-07-17)
- **Baseline pattern to extend:** Stripe checkout/subscription seam (`server/web/payments/`,
  `app/api/webhooks/stripe/`, `StripeCustomer`/`StripeWebhookEvent`) + `UserEntitlement` gate
- **Custom delta:** Stripe Connect payout rail + attribution ledger + earnings surface (Dirstarter
  has no marketplace/payout layer)
- **No-bypass proof:** live payments doc enumerates checkout + subscriptions only; nothing replaced

## Cody pre-flight

Not applicable — docs-only planning session; no code written.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0559_TASK_01 | landed | SoT grounding read; all citations collected; Dirstarter payments alignment confirmed (no Connect layer upstream) |
| SESSION_0559_TASK_02 | landed | `docs/petey-plan-0559-creator-payout.md` written — model options, Connect architecture, surface argument, schema deltas, abuse, 6 PR slices, 8-fork grill list |

## What landed

- `docs/petey-plan-0559-creator-payout.md` — the G-009 build-ready creator-payout plan (new file).
- `docs/sprints/SESSION_0559.md` — this session record.
- No app code, no schema, no ledger edits (goals-ledger untouched per held-lane ownership).

## Decisions resolved

- None ratified — by design. Every payout fork is queued for the operator grill (plan §Grill list);
  the recommended answers are recommendations, not decisions.

## Files touched

| File | Change |
| --- | --- |
| `docs/petey-plan-0559-creator-payout.md` | NEW — G-009 creator-payout Petey plan |
| `docs/sprints/SESSION_0559.md` | NEW — session record |

## Verification

| Command / smoke | Result |
| --- | --- |
| `git diff --check` | clean (no whitespace errors) |
| Frontmatter/template conformance | by-template (SESSION_TEMPLATE + petey-plan frontmatter shape); wiki-lint deferred to merge from canonical (no `node_modules` in this docs-only worktree) |
| Grounding citations | every product claim in the plan cites a repo file path |

## Open decisions / blockers

- The plan's **grill list (8 forks)** awaits the operator — nothing in G-009 should build before the
  grill resolves (petey-plan protocol: grill open forks first).
- Wiki-lint at merge from canonical (worktree has no `node_modules`).
- Held at push gate: committed locally on `session-0559-g009-payout-plan`, no push.

## Next session

### Goal

Operator grills the 8 payout forks; on resolution, ratify ADR 0048 (creator-payout model) and start
PR-1 of the slice plan (schema wave: `CreatorPayoutAccount` + `CreatorEarningEvent`).

### First task

Run the grill against `docs/petey-plan-0559-creator-payout.md` §Grill list; record resolutions in the
build session's SESSION file + the new ADR; then dispatch Cody on PR-1 per the slice plan.

## Review log

### SESSION_0559_REVIEW_01 — plan self-review

- **Reviewed tasks:** SESSION_0559_TASK_01, SESSION_0559_TASK_02
- **Dirstarter docs check:** live docs checked (payments)
- **Verdict:** The plan is grounded (every claim cited), honest about SoT silence (OPEN FORK markers),
  and PR-sliced with done-means. Its weakness is inherent to a plan: the pool-% and scope recommendations
  are judgment calls the grill must ratify — flagged, not hidden.
- **Score:** 9.0/10
- **Follow-up:** grill, then ADR 0048.

## Hostile close review

- **Giddy:** pass — docs-only, no structural drift; new file conforms to the petey-plan doc family; goals-ledger ownership respected.
- **Doug:** pass — no runtime surface to verify; `git diff --check` clean; citations spot-checked against source files.
- **Desi:** not applicable — no UI touched.
- **Kaizen aggregate:** 9/10 — lean lane executed to brief; the only unverifiable gate (wiki-lint) is explicitly deferred to merge.

## ADR / ubiquitous-language check

- ADR update **not required this session** — but the plan itself calls for **ADR 0048 (creator-payout
  model)** as PR-1 of the build, after the grill. ADR 0030 (per-brand Stripe account) and ADR 0045
  (AdminCollection law) confirmed valid and load-bearing for the plan.
- Ubiquitous language update not required — new terms (earning event, payout period/line, creator pool)
  enter the wiki when the model is ratified, not at plan stage.

## Reflections

The sharpest discovery was that the repo already anticipated this lane twice: `StripeCustomer.accountScope`
(SESSION_0107) reserved a "platform vs connect" scope, and archived SESSION_0098 sketched the entire
Connect webhook pipeline including the exact manual decisions this grill list now formalizes. Plan lanes
should always sweep `docs/sprints/_archive/` for prior art — the payout fork list was 90% pre-written
eighteen months of sessions ago.

Second: the attribution problem is the real design center, not Stripe. Because BBL sells **memberships**
(annual tiers), not per-post purchases, "revenue their gated content drives" has no native per-item
money edge — every model choice is a way of *imputing* one. Writing that down explicitly (pool vs
conversion-bounty vs hybrid) kept the Stripe section from pretending the hard part was plumbing.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | both new files carry conformant frontmatter (this file + the plan) |
| Backlinks/index sweep | plan pairs_with SoT set; SESSION pairs_with plan + prior session |
| Wiki lint | deferred to merge from canonical (no `node_modules` in docs-only worktree) — noted in Verification |
| Kaizen reflection | §Reflections above |
| Hostile close review | §Hostile close review above |
| Review & Recommend | §Next session written (grill → ADR 0048 → PR-1) |
| Memory sweep | no new standing rules; prior-art-in-archive lesson recorded in Reflections |
| Next session unblock check | grill list is self-contained in the plan; no other blockers |
| Git hygiene | committed locally on `session-0559-g009-payout-plan`; HELD at push gate |
| Graphify update | skipped — lean docs close per brief (graph lives in canonical) |
