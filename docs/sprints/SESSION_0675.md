---
title: "SESSION 0675 — feature-widget → hours-estimate → client-invoice pipeline spec (approval-gated) (auto lane, wave 11/12)"
slug: session-0675
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0675
sprint: S12
lane: mmb
goal_ids:
  - G-024
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
  - docs/product/mammoth-build/feature-intake-billing-spec-draft.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0675 — feature-widget → hours-estimate → client-invoice pipeline spec (approval-gated) (auto lane, wave 11/12)

> Staged by the SESSION_0635 orchestrator (waves 11+12, operator-directed). Adopted + closed by the
> wave-12 autonomous lane. Branch: `auto/session-0675-feature-intake-billing` (base: main).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

feature-widget → hours-estimate → client-invoice pipeline spec (approval-gated).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0675_TASK_01 | done | Verify-first recon (canonical, read-only): FeatureWidget/PlanningIntake pattern, G-024 row, authz matrix + FI-019, /app/state + static artifact, rate table, 0667/0669 pipeline, 0639 migration rules — all cited file:line in the spec §0 |
| SESSION_0675_TASK_02 | done | Build-ready spec authored (0660/0666 house style): purpose/non-goals, 3 intake surfaces (BBL widget · MMB widget · mailto stopgap), FeatureRequest schema sketch, estimate flow at the ratified rate table, Client-Invoice hand-off, 4-phase build plan + kill-switch + structural no-send gate, 4+1 open forks |

## What landed

**`docs/product/mammoth-build/feature-intake-billing-spec-draft.md`** — build-ready design spec
(DRAFT) for the operator directive: Michael (MMB) and Tony Hua (BBL) type feature/bug/design-tweak
requests on the state artifacts; MMB requests flow into billing (per-feature hours estimate at the
$200/$100/retainer rate table → line items in the Client-Invoice draft pipeline). The hard rule —
**no automated sending of anything, ever; drafts only until Brian sends by hand** — is threaded
through every section and made *structural* (§6.4: the module has zero send paths, grep-gated).

Key verified findings (full table: spec §0):

- The L1 pattern already exists and is live: `feature-widget.tsx` (admins-only, prop-free,
  ui-kit-extraction-ready, "MMB mount is a separate fast-follow" in its own doc comment), mounted
  via `{isAdmin(user) && <FeatureWidget />}` at `app/app/layout.tsx:41`.
- `/app/state` is signed-in-gated only (no per-route permission) — Tony can already *see* it; the
  gap is a non-admin submit affordance. Recommended shape: new `feature-request.create` KEY in the
  existing `can()` axis + an FI-019 `UserPermissionGrant` for Tony (the `beta.view` named-tester
  precedent, `roles.ts:115-118`) — never a 5th authz system.
- The static State-of-the-Building HTML (0667 branch) has no backend/auth/script — **a mailto:
  block is the only zero-build intake it can carry** (spec says so honestly and ships the
  paste-ready snippet, prefilled subject/body matching the request shape; converges with the 0639
  InboundEmail capture once that merges).
- `PlanningIntake` overlaps but is the wrong home: internal planning inbox with a by-hand
  PL-promotion law vs client billing lifecycle → sibling `FeatureRequest` model (brand pinned
  server-side, `NEW→TRIAGED→ESTIMATED→APPROVED_FOR_INVOICE→DONE|DECLINED`, `estimatedHours`,
  snapshot `rateCents`, string `invoiceRef` — no FK; invoices are doc artifacts).
- The MMB CRM's own `Invoice` model is Michael→his-customers — explicitly firewalled from
  RDD→Michael billing (spec non-goal).
- Billing hand-off references the pipeline by name: 0667 `rdd-client-invoice-template.md` +
  0669 `invoice.html` prototype + the parallel wave-12 QuickBooks lane (branch not yet on origin
  at write time — noted honestly; `invoiceRef` is the join key either way).

## Files touched

| File | Change |
| --- | --- |
| docs/product/mammoth-build/feature-intake-billing-spec-draft.md | NEW — build-ready intake→estimate→invoice spec (DRAFT, approval-gated) |
| docs/sprints/SESSION_0675.md | Adopted + closed (this file) |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0675` · `auto/session-0675-feature-intake-billing` (exit 0) |
| Verify-first reads | canonical checkout read-only (`grep`/`sed`/`Read`); wave branches via `git show origin/auto/session-0660…0669` (exit 0 each) |
| Docs-only diff — no code/migrations/ledgers | `git status` shows only the two owned files |

## Proposed ledger edits

> Proposed only — this lane does not write `docs/knowledge/wiki/**` (forbidden paths). For the AM
> merge owner:

- **`goals-ledger.md` → G-024**: add a progress bullet — *"SESSION_0675: intake→billing slice
  spec'd (`docs/product/mammoth-build/feature-intake-billing-spec-draft.md`) — client-facing
  FeatureRequest intake (Tony via FI-019 grant on BBL `/app`; Michael via CRM mount / mailto
  stopgap) with estimate + Client-Invoice draft lifecycle, hard-gated on operator approval at
  every send."* Re-point the tracked "MMB mount (kernel extraction)" remaining item through spec
  §6 P3 (fork §7.2 gates it).
- Optional cross-link from G-024 to the 0667/0669 billing artifacts as the pipeline the slice
  feeds (they're referenced by name in spec §5.2).

## Open decisions / blockers

Spec §7 forks await operator ratification (recommendations given): 7.1 estimate authority
(operator-only v1, agent-draft later) · 7.2 MMB intake home (CRM-local DB, manual carry) ·
7.3 retainer-vs-hourly (rateCents=0+note until a real retainer exists) · 7.4 sibling model vs
extending PlanningIntake (sibling) · minor: Tony's authz shape (FI-019 grant over full admin).

## Residual for AM merge

- Operator ratifies the §7 forks; then P1/P2 (BBL intake + triage) is dispatchable as one build
  wave from the spec alone.
- P0 stopgap: paste the spec §2.3 mailto block into `state-of-the-building.html` (0667/AM-merge
  owner — wave-owned file, not writable from this lane).
- Apply the proposed G-024 ledger edit above.
