---
title: "QA Runtime Verification"
slug: qa-runtime-verification
type: protocol
status: active
created: 2026-06-20
updated: 2026-06-20
last_agent: claude-session-0423
pairs_with:
  - docs/agents/doug.md
  - docs/protocols/hostile-close-review.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - qa
  - verification
---

# QA Runtime Verification

> Promoted from the legacy `RoninDashboard/protocols/QA_RUNTIME_VERIFICATION.md`
> (SESSION_0423). Leaned for this repo: dropped the brand-specific WEKAF runners
> (`wo176-*` / `wo177-*`), the `qa-auto-flow.sh` / `qa-manual-flow.sh` autorunner
> stack, the RoninDashboard evidence-path layout, and the multi-brand parity
> language. What survives is the check-record schema, the strict status vocabulary,
> the evidence rules, and the smoke/manual/UI/webhook checklist shape — re-pointed
> at this repo's roster, SESSION-file ledger, and `next dev` local verify.

The protocol behind [Doug](../agents/doug.md)'s **"prove, don't assume"** rule. Every
"looks fine" claim about runtime behavior must resolve to a check record with an
explicit status and a concrete evidence artifact. This is how runtime QA gets into
the SESSION file's `## Verification` table and survives the
[hostile close review](hostile-close-review.md).

## When to use

- Any session that changes UI/runtime behavior (routes, server actions, role grants,
  claim/registration flows, webhook-dependent entitlement).
- Every deployment smoke check before a push that deploys (`apps/web` touched).
- Any promotion gate (e.g. reveal flip, paid-path enable) where assertion alone is
  not enough.

Skip it for docs/governance-only changes that never run — those don't deploy and have
no runtime surface (SESSION_0335 `ignoreCommand`).

## Status vocabulary (non-negotiable)

- `PASS` — check executed, expected behavior confirmed, evidence captured.
- `FAIL` — check executed, behavior incorrect or blocked by a defect.
- `MANUAL STEP REQUIRED` — code is ready, but an external/manual action is needed to
  finish the check (e.g. a Stripe dashboard confirmation, an email actually sent).
- `TODO` — not executed yet. **Never** read as a pass.

Matches the strict status set used across this repo's review docs
([pr-review-score-fix-loop](pr-review-score-fix-loop.md), Doug's output format).

## Required check-record shape

Each runtime check carries these fields:

1. `check_id` — stable id (e.g. `RV-001`).
2. `surface` — route / page / component under test.
3. `actor` — role used (guest / member / coach / org-admin / platform-admin).
4. `preconditions` — what must be true first (signed in, seeded data, flag set).
5. `action` — the concrete thing done.
6. `expected_result` — the behavior that proves the change.
7. `evidence` — artifact(s): see evidence types below.
8. `status` — `PASS` / `FAIL` / `MANUAL STEP REQUIRED` / `TODO`.
9. `owner` — who executes (usually Doug for QA).
10. `follow_up` — **required** for any non-`PASS` state.

## Evidence types

Evidence is not screenshot-only. Pick the cheapest artifact that actually proves it:

- **UI state** — screenshot (or short screen recording) of the rendered surface;
  capture SSR HTML via `curl` when a screenshot would race the compile.
- **Data / queue transitions** — audit-row id or queue/job id + timestamp.
- **API / runtime contract** — probe or server-log output saved to a file path +
  the status code observed.
- **External systems (Stripe, email send, DNS)** — `MANUAL STEP REQUIRED` + named
  owner + the exact next action and where to confirm it.

If a check is visual and user-facing, include a screenshot by default. If a check
cannot run in-shell (external dashboard, real email delivery, physical device),
log it as `MANUAL STEP REQUIRED` in the
[manual-boundary registry](../knowledge/wiki/manual-boundary-registry.md) so the
boundary is tracked rather than silently skipped.

## Local verify

Bring the app up locally and exercise the surface for real:

```bash
cd apps/web && npx next dev --turbo
```

(FS-0002 — not `bun dev` / `pnpm dev`.) Run a local `next build` first for new
server-action or route modules — `tsc`/`bun test` miss `"use server"` export bugs
([[next-build-catches-use-server]]). Execute checks lowest-privilege actor first,
and **mark status at the moment of execution** — never batch status updates later.

## Checklist shape

A runtime pass typically covers four families. Lift the ones that apply:

- **Smoke** — the touched routes return 200 and render; console is clean (errors
  triaged into real defect vs known external noise).
- **UI / interaction** — the changed control behaves by actor (button submits,
  chip revokes, gated content shows/hides for the right role).
- **Manual** — anything that needs a human or external dashboard →
  `MANUAL STEP REQUIRED` with owner + next action + where evidence lands.
- **Webhook / entitlement** — signed webhook → DB entitlement sync (rehearse off-prod
  via the Stripe CLI test-mode path; Baseline prod is `sk_live` — a "test card on
  prod" is a trap, drift D-018).

## Copy/paste template

```markdown
## Verification

| check_id | surface | actor | preconditions | action | expected_result | evidence | status | owner | follow_up |
|---|---|---|---|---|---|---|---|---|---|
| RV-001 | /directory/[slug] | guest | seeded passport exists | open listing | detail renders, no console errors | screenshot:..., curl:200 | PASS | Doug | none |
| RV-002 | /api/stripe/webhooks/bbl | platform-admin | checkout completed | signed webhook fires | entitlement row written | audit:..., webhook id | MANUAL STEP REQUIRED | Doug | confirm in Stripe dashboard |
| RV-003 | /app/profile | member | not org owner | attempt restricted action | access denied copy | screenshot | FAIL | Doug | hand fix to Cody |

### Manual step required
- [ ] RV-002 — Stripe dashboard confirmation pending (owner: Doug) → logged in manual-boundary-registry

### Remaining TODO
- [ ] RV-00X — mobile touch smoke on iOS
```

## Gate rules

- A close gate cannot pass with an unresolved `FAIL`.
- A session cannot close on an unresolved `TODO` unless explicitly deferred and the
  deferral is recorded in the SESSION file.
- `MANUAL STEP REQUIRED` is allowed only with a named owner, next action, and evidence
  target — and is logged in the
  [manual-boundary registry](../knowledge/wiki/manual-boundary-registry.md).
- Each non-`PASS` row opens a fix pass (hand to Cody — Doug doesn't fix in review).

## Cross-references

- [Doug](../agents/doug.md) — owns this protocol; this is the method behind "prove,
  don't assume."
- [Hostile Close Review](hostile-close-review.md) — the close pass that audits the
  `## Verification` table for assertion-without-evidence.
- [Manual-boundary registry](../knowledge/wiki/manual-boundary-registry.md) — where
  `MANUAL STEP REQUIRED` checks are logged.
- [PR Review → Score → Fix Loop](pr-review-score-fix-loop.md) — shares the strict
  status vocabulary; runtime evidence feeds its `performs_intended_function` check.
