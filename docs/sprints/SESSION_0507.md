---
title: "SESSION 0507 — FI-001 pre-send readiness verify + A1 clone-cleanup recheck (no send)"
slug: session-0507
type: session--review
status: closed
created: 2026-07-06
updated: 2026-07-06
last_agent: claude-session-0507
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0506.md
  - docs/petey-plan-0457-operator-gated-lineage.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0507 — FI-001 pre-send readiness verify + A1 clone-cleanup recheck (no send)

## Date

2026-07-06

## Operator

Brian + claude-session-0507

## Goal

Pre-send readiness for the FI-001 / G-001 P0 (land Brian Truelson as the first tester):
prove the lifetime-Elite comp path + claim magic-link + welcome email are wired & green on
**live prod** so the operator's real "send Brian now" is a confident one-click, and re-audit
the Slice-A1 (WL-P2-21) clone cleanup. **Verification only — no prod mutation, no email
send** (operator did not select "send now").

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

- Continuation of SESSION_0506 (same warm context; polish bundle shipped `4bfa3491`).
  Inbound scan inherited from 0506 (no re-scan).
- Source of truth read: `petey-plan-0457` Slice A2 (send script) + Slice A1 (clone cleanup);
  `scripts/send-bbl-truelson-thankyou.ts`; `lib/entitlements/lineage-comp.ts`.
- Standing gate: `explicit-push-authorization` — every prod mutation / send held for operator
  "go". This session ran only the two **safe** modes (`--dry-run`, `--verify`) + the
  read-only clone audit.

## What was verified (all GREEN)

| Check | How | Result |
| --- | --- | --- |
| Welcome email renders | `--dry-run` (no DB, no send) | ✓ 18.4KB → `/tmp/bbl-first-tester-welcome.html`; on-brand, warm (screenshotted for operator) |
| Brian's prod node claimable | `--verify` vs **prod** (Neon; read-only rolled-back Serializable tx) | ✓ node `cmq60y01l000n3sdsem2v2h1f` — `passportUnclaimed`, `isClaimableMember`, `treePublished`, `treeClaimable` all true |
| Claim + comp simulation | rolled-back `claimNodeForUser` | ✓ would CLAIM + grant 2 entitlements (LINEAGE_PREMIUM + LINEAGE_ELITE); nothing persisted |
| Account state | prod query | none yet → claim auto-fires on Brian's first sign-in (as designed) |
| Resend send-keys | `.env.prod` | ✓ 2/2 (`RESEND_API_KEY` + `RESEND_SENDER_EMAIL_BBL`) |

## Decisions resolved

- **Lifetime Elite via the `--grant` step** (operator's call), NOT a Dirty-Dozen data change.
  The email promises *lifetime* Elite, but the BBL claim auto-comp gives **1 year** for
  non-Dirty-Dozen members (`bblClaimCompTermDays` → 365; lifetime only for the Dirty Dozen
  cohort). Brian's node is `visualGroup: (none)` → not Dirty Dozen → his claim alone grants
  1yr. The designed flow closes the gap: after he signs in, run `--grant --grantor-email
  <admin>` to upgrade to lifetime (`endsAt: null`). No prod topology change.

## The operator send sequence (all prod-gated; NOT run this session)

```bash
cd apps/web
# 1. Bind email→node so ANY sign-in auto-claims (no expiry)
bun --env-file=.env.prod scripts/send-bbl-truelson-thankyou.ts --backfill
# 2. Mint magic-link + Resend the welcome email to btruelson@gmail.com
bun --env-file=.env.prod scripts/send-bbl-truelson-thankyou.ts --send
# 3. Brian clicks → signs in → auto-claims node + 1yr Elite
# 4. Upgrade the comp to LIFETIME
bun --env-file=.env.prod scripts/send-bbl-truelson-thankyou.ts --grant --grantor-email <admin@…>
```

- Operator-side (not code): the email promises Brian's *"old PayPal subscription is waived"* —
  cancel it manually.
- Test-safety hatches on `--send` if a rehearsal is wanted first: `--to <throwaway>` redirects
  the send; `--free-signup` points the link at `/me` (plain sign-in, never claims Brian's node).

## A1 (WL-P2-21) clone-cleanup recheck — Brian clean; clone trees deliberately kept (D-034)

Read-only `scripts/audit-residual-lineage-clones.ts` vs prod — CONFIRMS the intended 0457 state:

- **Brian's node is fully clean (send-safe):** `brianTotalMemberships: 1` — the canonical
  `rigan-machado-lineage` (BBL, published + claimable); `brianCloneMemberships: 0`. A1's
  surgical member cleanup (SESSION_0457) held.
- **The 2 clone TREES are intentionally kept** (`rigan-machado-bjj-lineage` on BASELINE 16m +
  BBL 15m, both unpublished): SESSION_0457's coverage audit proved each is the **sole home of
  4 founders absent from the canonical tree** → drift **D-034**. Both unpublished → inert to
  `claimNodeForUser` → not a send blocker. Removal stays blocked on the D-034 founder
  migration — the recheck confirms the documented state, nothing drifted.

## Files touched

| File | Change |
| --- | --- |
| `docs/sprints/SESSION_0507.md` | this record |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | FI-001 annotated: readiness re-verified green (0507); lifetime via `--grant` |

(WL-P2-21 left as-is — its row already documents "Clone TREES KEPT" + D-034; the recheck confirmed it, no edit needed.)

## Verification

- No code changed → no gates beyond doc lint. `bun run wiki:lint` → 0 errors.
- No prod mutation, no email send performed (verification-only session).

## Open decisions / blockers

- **Operator send** (backfill → send → grant) held for explicit "go" — machinery green.
- **WL-P2-21 clone-tree removal** stays blocked on **D-034** — each clone tree is the sole
  home of 4 founders absent from canonical; migrate them to the canonical tree first, then the
  clone trees can be removed. Inert meanwhile.

## Next session

### Goal

Operator triggers the FI-001 send when ready (sequence above), OR the D-034 founder-migration
lane (prereq to WL-P2-21 clone-tree removal), OR the next ledger/board lane.

### First task

If sending: run the 4-step sequence with per-step operator confirmation + Doug E2E after the
claim (node claimed, Elite entitlement, lifetime after `--grant`), then teardown per
`petey-plan-0457` if a rehearsal `--to` click was used.

## Review log

## Hostile close review

- **Doug:** pass — readiness proven against LIVE prod (not prodsnap) via read-only rolled-back
  tx; A1 recheck surfaced the remaining clone trees (not a send blocker); no mutation/send.
- **Giddy:** pass — no code; the lifetime-vs-1yr gap correctly routed to the `--grant` step
  rather than a topology change.

## ADR / ubiquitous-language check

- None required (verification + docs).

## Reflections

The dry-run screenshot was the highest-leverage check: reading the email surfaced the
*"lifetime membership"* promise, which the code only auto-honors for the Dirty Dozen — a
copy-vs-entitlement gap that a green `--verify` alone would have hidden. The A1 recheck
confirmed the documented state exactly — Brian's memberships surgically cleaned, clone trees
deliberately kept as the sole home of 4 founders (D-034). The WL-P2-21 row already said "Clone
TREES KEPT", so the recheck's value was re-proving it against LIVE prod rather than trusting
the annotation — the discipline `petey-plan-0457` demanded (verify vs prod, not the snapshot).

## Full close evidence

| Step | Proof |
| --- | --- |
| Email renders | `--dry-run` 18.4KB + screenshot |
| Prod claim green | `--verify` → CLAIMED (rolled back), 2 entitlements |
| Resend keyed | `.env.prod` 2/2 |
| A1 recheck | audit → Brian 1 canonical membership, 0 clone; 2 clone trees kept per D-034 |
| No mutation/send | only `--dry-run`/`--verify`/read-only audit run |
