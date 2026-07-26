---
title: "SESSION 0403 — BBL claim-comp + email + join-landing epic (Track B, baseline-only)"
slug: session-0403
type: session--implement
status: closed
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0403
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0402.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0403 — BBL claim-comp + email + join-landing epic (Track B, baseline-only)

> **Unattended cloud run.** No live DB/browser. Static gates + pure unit tests are the in-sandbox proof; the
> DB-backed claim flow is covered by CI integration tests + the operator. Part of the BBL go-live push.

## Date

2026-06-17

## Operator

Brian + claude-session-0403 (unattended cloud run)

## Goal

Track B of the BBL go-live epic — the baseline-only pieces that don't need the monorepo (Track A, a separate
two-repo cloud session, owns pricing tiers + the WordPress profile import). This session: (1) **comp gift epic**
— auto-grant comp Elite on claim approval (Dirty Dozen → lifetime, everyone else → 1 year); (2) email
redesign + a new "claim your profile" announcement email; (3) rebuild `/lineage/join` as a features landing +
modal. Lane 1 (comp) landed here; lanes 2–3 are staged.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Read: `docs/sprints/SESSION_0402.md` (BBL Stripe separate-account seam, ADR 0030, PR #76) + the operator's
  expanded BBL go-live asks.
- Carryover: operator wants the full BBL go-live. Monorepo (`ronin-dojo-monorepo`) is **not in this session's
  GitHub scope** (verified — `get_file_contents` denied), so pricing-tier + profile-import work is handed to a
  fresh two-repo cloud session (Track A). This session does the baseline-only Track B.

### Branch and worktree

- Branch: `claude/bbl-claim-comp-email-epic` (off `main` at `5fcd4a9`)
- Status at bow-in: clean off main

### Grill outcome

Operator decisions locked:

- **Comp = auto-grant on claim approval.** Dirty Dozen cohort → **lifetime** Elite (no end date); everyone else
  → Elite **+1 year**. (No Stripe; uses the existing `grantComp` `MANUAL_GRANT` path.)
- **Build the four baseline pieces here** (comp-grant, email redesign, claim email, join landing); pricing +
  import go to the monorepo cloud session.

## Petey plan

### Goal

Land the baseline-only BBL go-live pieces; comp-grant first (fully testable), then emails + join landing.

### Tasks

#### SESSION_0403_TASK_01 — Comp Elite on claim approval (Cody) — LANDED

- **What:** Auto-grant comp Elite when a BBL claim is approved — Dirty Dozen → lifetime, else +1yr — reusing
  the existing `grantComp` engine; manual `input.comp` still overrides.
- **Done means:** static gates + pure unit test green; non-BBL + manual-comp paths unchanged.

#### SESSION_0403_TASK_02 — Branded email layout + new "claim your profile" email (Cody) — STAGED

- **What:** A BBL-branded email layout (logo, Poppins/Inter, brand color matching the landing) + a new
  `emails/bbl-claim-your-profile.tsx` announcement (blackbeltlegacy.com is live → claim your profile → your comp
  membership) + a `notifyMemberOfBblClaimYourProfile` sender + a bulk admin action. Restyle the existing BBL
  templates to the shared layout.
- **Depends on:** nothing (disjoint files). Build plan in the investigation report.

#### SESSION_0403_TASK_03 — `/lineage/join` features-landing + modal (Cody) — STAGED

- **What:** Rebuild `/lineage/join` as a features landing (reusing BBL landing sections) with a `Drawer`-based
  modal wrapping the existing `JoinLegacyForm`; decouple from the empty pricing-plan state so the page works
  before plans are seeded.
- **Depends on:** nothing.

#### SESSION_0403_TASK_04 — Gates + PR per lane (Doug) — IN PROGRESS

- Lane 1 PR opened; lanes 2–3 follow.

### Open decisions

- **Manual comp override scope:** kept manual `input.comp` as the override for any brand; BBL auto-grant only
  fires when no explicit comp is set. (Petey call — preserves existing admin workflow + tests.)

### Risks

- **Dirty Dozen detected by visual-group label.** Mitigated: the label literal is now a single shared const
  (`lib/lineage/dirty-dozen.ts`), byte-extracted from the seed so it matches existing DB rows; both seed and
  runtime import it. A future hardening is a stable cohort slug/flag (parked).
- **DB-backed claim flow unverifiable in-sandbox.** The term rule is unit-tested; the grant integration is
  covered by CI (`claim-review-actions.test.ts`) + operator.

### Scope guard

- Comp grant is **BBL-only** + claim-approval-only; no change to the Stripe entitlement path, the manual comp
  UI, or non-BBL behaviour.
- No schema/enum change (reuses `MANUAL_GRANT` + `endsAt: null` lifetime semantics).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0403_TASK_01 | landed | Comp Elite auto-grant on BBL claim approval (Dirty Dozen lifetime / else +1yr); shared `DIRTY_DOZEN_LABEL`; pure term-rule unit test (3/0). |
| SESSION_0403_TASK_02 | staged | Branded email layout + `bbl-claim-your-profile` email + bulk sender. |
| SESSION_0403_TASK_03 | staged | `/lineage/join` features-landing + modal. |
| SESSION_0403_TASK_04 | in-progress | Lane-1 PR opened; lanes 2–3 follow. |

## What landed

- **Comp gift epic (claim → Elite).** `applyLineageClaimReview` now auto-grants comp Elite on BBL claim
  approval: the claimed node's `LineageTreeMember.visualGroup` label is checked against the shared
  `DIRTY_DOZEN_LABEL`; Dirty Dozen → lifetime (`endsAt: null`), everyone else → +365 days. Reuses the existing
  `grantComp` `MANUAL_GRANT` engine (idempotent + audited); the manual admin `input.comp` still overrides and
  non-BBL brands are unaffected. Elite is cumulative (also grants Premium).
- **Shared Dirty Dozen constant.** `lib/lineage/dirty-dozen.ts` — `DIRTY_DOZEN_LABEL` byte-extracted from
  `seed-baseline-lineage.ts` (which now imports it), so the seed and runtime detection share one literal.
- **Pure unit test.** `lib/entitlements/lineage-comp.test.ts` — term rule (lifetime vs 1yr) + cumulative Elite.

## Decisions resolved

- Comp = auto-on-claim; Dirty Dozen lifetime Elite, else 1-year Elite; manual override preserved; BBL-only.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/lineage/dirty-dozen.ts` | **New** — shared `DIRTY_DOZEN_LABEL`. |
| `apps/web/lib/entitlements/lineage-comp.ts` | `BBL_CLAIM_COMP_TERM_DAYS` + `bblClaimCompTermDays`. |
| `apps/web/lib/entitlements/lineage-comp.test.ts` | **New** — term rule + cumulative-keys tests. |
| `apps/web/server/admin/lineage/claim-review-actions.ts` | BBL auto-comp on approval (Dirty Dozen detection + `grantComp`). |
| `apps/web/prisma/seed-baseline-lineage.ts` | Import shared `DIRTY_DOZEN_LABEL` (literal removed). |
| `docs/sprints/SESSION_0403.md` | This record. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun test lib/entitlements/lineage-comp.test.ts` | PASS — 3/0. |
| `bun run typecheck` | PASS — 0 errors. |
| `bun run lint:check` / `format:check` | PASS — exit 0. |
| DB-backed claim → comp grant | Deferred to CI (`claim-review-actions.test.ts`) + operator. |

## Open decisions / blockers

- Lanes 2–3 (emails, join landing) staged for the next build step.
- Track A (pricing tiers + profile import) blocked on the monorepo cloud session.

## Next session

### Goal

Build lanes 2–3 (branded emails + new claim email; `/lineage/join` features-landing + modal). Once Track A
imports placeholder Passports + seeds BBL pricing, run a BBL-account Stripe rehearsal + the bulk claim-email
send, then the operator does the DNS flip.

### First task

Build the BBL email layout + `bbl-claim-your-profile.tsx` + the bulk claim-announcement admin action.

## Review log

_Lanes 2–3 + bow-out pending._

## Hostile close review

_Pending bow-out._

## ADR / ubiquitous-language check

- No new ADR (reuses ADR 0012 comp model + the existing `grantComp` engine). No new domain terms.

## Reflections

_Pending bow-out._

## Full close evidence

_Pending bow-out._
