---
title: Planning Ledger
slug: planning-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0587
pairs_with:
  - docs/knowledge/wiki/goals-ledger.md
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
---

# Planning Ledger

Queue of **ideas that need a proper plan before any build** — the intake layer ABOVE the
goals-ledger. A `PL` row is an idea-dump (feature needs, bug fixes, design changes, images,
notes) from the admins; it graduates by getting a **full `/pp` Petey plan session →
AM_Plan_Session → fan-out build session** (the SESSION_0587 orchestrator pattern), at which
point the plan lands as a `G-NNN` goal (or children of one) and the PL row closes with a
pointer.

**Contributors:** Brian (operator) · Michael (MMB business owner, admin) · Tony (BBL admin).
Today ideas enter via operator relay into this file; the in-app intake surface for Michael/Tony
is itself the first queued item (PL-001 → G-024).

**Row law:** `PL-NNN` ids, append-only, mint = max+1 (verify by grep — see D-049 class).
Status: `queued → planning → planned (→ G-row pointer) → done/rejected`. This ledger is not
yet wired into `scripts/ledger-backlog.ts` or the closing.md §6.7 finding router — both edits
are deferred (files owned by live lanes 0585/0584 at creation time); wiring is part of PL-001's
plan scope.

## Rows

### PL-001 — Feature + feedback widgets for all sites (idea-intake surface) — queued

- **Origin:** operator directive, SESSION_0587 (2026-07-20), mid-orchestration.
- **Goal row:** [G-024](goals-ledger.md) (program shell; plan-first — no build until the plan
  session runs).
- **The idea:** admins-only idea-dump widget ("feature-widget") on the MMB and BBL admin
  surfaces where Brian/Michael/Tony dump ideas, images, notes, feature needs, bug fixes, and
  design changes — the in-app front door to THIS ledger. Later phase: the feature-widget moves
  onto the changelog feature page for all logged-in users. Platform module per RDD law (ONE
  kernel module × per-product mount), not per-product forks.
- **What exists (graphify-verified 2026-07-20):** ONE `feedback-widget.tsx`
  (`apps/web/components/web/feedback-widget.tsx`) — engagement-triggered toast (time/pageview/
  scroll thresholds in `apps/web/config/feedback.ts`), brand-aware, mounted in the `(web)`
  layout; submits via `reportFeedback` (`server/web/actions/report.ts`) → rate-limited →
  persists `Report` (type `Feedback`) + admin email (`emails/admin-feedback.tsx`); e2e
  `e2e/feedback-widget.spec.ts`. No separate feature-widget component exists. Prior backlog:
  `docs/petey-plan-0419-post-launch-sweep.md` §5.4 "make feedback widget brand/account aware".
- **Next step:** full `/pp` Petey plan session → AM_Plan_Session → fan-out build (0587
  pattern). That plan session also wires this ledger into `ledger-backlog.ts` + the §6.7
  router. **Reserved: SESSION_0589** (`session-0589-feature-widget-plan`, claimed mid-0587;
  runs parallel with SESSION_0588 quality-suite review).

### PL-002 — Reddit-Links-Ledger (RLL) + YouTube-Links-Ledger (YLL) intake ledgers — queued

- **Origin:** operator directive, SESSION_0587 (2026-07-20) — "noted as I was thinking about it";
  flesh out in the SESSION_0589 planning session.
- **The idea:** two new link-intake ledgers that feed/hydrate the goals-ledger the same way this
  planning-ledger does: **Reddit-Links-Ledger** (`RLL-0NN`) and **YouTube-Links-Ledger**
  (`YLL-0NN`) — captured links/threads/videos as raw planning material that graduates to PL/G
  rows.
- **Vault context (operator-stated, not repo-verified — vault is operator-side per ADR 0048):**
  stub folders for Reddit already exist in `RDD_Master_Vault`; the vault-consolidation +
  SOT-per-brand-vaults task is partially done / partially planned (G-023 vault-constellation
  direction: brand-prefixed vault names ratified in principle, only MMB exists).
- **Next step:** SESSION_0589 plan session decides: repo-side ledger files vs vault-side capture
  with repo pointers, id law, aggregator/router wiring (bundled with PL-001's wiring scope),
  and how RLL/YLL rows hydrate into goals-ledger.

## Cross-references

- [Goals Ledger](goals-ledger.md) — where planned ideas graduate to.
- [Petey Plan protocol](../../protocols/petey-plan.md) — the plan-session machinery.
- [Loop-of-Loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) — ledger-driven
  session model this slots into.
