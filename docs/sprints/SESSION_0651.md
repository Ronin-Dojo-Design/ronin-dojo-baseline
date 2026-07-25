---
title: "SESSION 0651 — auto-claude /rr G-009 creator payout model (Stripe Connect) (overnight auto lane, wave 3)"
slug: session-0651
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0651
sprint: S12
lane: bbl
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0651 — auto-claude /rr G-009 creator payout model (Stripe Connect) (overnight auto lane, wave 3)

> Staged by the SESSION_0635 overnight orchestrator (wave 3 — continuation wave, operator-authorized).
> Adopt at lane start: flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0651-rr-creator-payout`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude /rr G-009 creator payout model (Stripe Connect) — one tightly-scoped item, zero open forks (or forks deliberately OPEN for the /rr lane).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0651_TASK_01 | landed | G-009 research-review authored: `docs/architecture/research/research-review-creator-payout-model.md` — Stripe Connect account-type + charge-type survey, 3-option earnings-ledger comparison, 4 sourced comparables, staged 5-phase build-lane spec, 7 OPEN forks (nothing decided). |

## What landed

- **`docs/architecture/research/research-review-creator-payout-model.md` (NEW)** — the G-009
  decision brief. Highlights:
  - **Grounded repo findings:** `StripeAccount` (mode EXPRESS/STANDARD, `applicationFeeBps` 500) +
    `PayoutSplit` exist in `prisma/schema.prisma` since ~SESSION_0107 with **zero application-code
    references** — org-scoped, unwired scaffolding, not creator-shaped. `CommunityPost` has **no
    view/read tracking** — every attribution model except flat-bounty needs instrumentation first.
  - **Research:** Express vs Standard vs Custom (onboarding friction / KYC / 1099 ownership /
    payout-timing control / $2 + 0.25%+25¢ Express fees vs free Standard); destination charges vs
    separate charges & transfers (pooled subscription revenue → separate transfers is the natural
    fit; destination charges only fit a future per-post-purchase product); Stripe payout minimum is
    $0.01 → any threshold is product policy; OBBBA restored 1099-K $20k/200 + raised NEC/MISC to
    $2,000 (2026+).
  - **Ledger options:** view-weighted pooling (Medium/YouTube-Shorts shape) vs per-unlock
    conversion attribution vs flat bounty vs hybrid — argued, not decided.
  - **Comparables (sourced):** Patreon (flat 10% post-Aug-2025), Substack (10% + Stripe),
    YouTube (55% ads / 45% Shorts pool / 70% memberships), Medium (~50% pool by member reading time
    — the closest structural analogue).
  - **Recommended DEFAULT (open):** Express + unchanged charges + separate transfers on a monthly
    cycle + view-weighted pooled ledger + platform-policy threshold — with Phase 0 (entitled-read
    instrumentation) as the no-regret first move under every fork branch.
  - **Staged build-lane spec:** 5 phases (P0 instrumentation → P1 Connect onboarding test-mode →
    P2 accrual ledger → P3 payout execution behind the live-mode fence → P4 creator surface + tax),
    per-phase gates, schema PROPOSAL sketches only (no code/migrations), live-mode + `[bbl]`
    CLI-profile + `STRIPE_SECRET_KEY_BBL` preconditions baked into P1/P3.
  - **7 OPEN forks** for the operator: F1 split % (+ pool definition) · F2 threshold/cadence ·
    F3 Express vs Standard · F4 attribution model · F5 tax posture · F6 schema seam (new
    creator-scoped models vs extending dormant `StripeAccount`) · F7 build-now vs
    defer-behind-subscriber-threshold.

## Sources consulted

- **Repo (canonical, read-only):** `docs/knowledge/wiki/goals-ledger.md` (G-009 row) ·
  `docs/sprints/SESSION_0537.md` (FI-028b — the gate-without-incentive parent) ·
  `docs/architecture/research/research-review-security-headers-posture.md` (format reference) ·
  `apps/web/prisma/schema.prisma` (`StripeAccount`, `PayoutSplit`, `StripeConnectMode`,
  `CommunityPost`, `SubscriptionTier` deprecation note) · `apps/web/server/web/billing/*` (live
  Stripe stack) · memories `bbl-membership-tier-model-0472`, `bbl-stripe-cli-account-trap`.
- **Web (primary-first):** docs.stripe.com (connect/accounts, connect/charges, connect/tax-reporting,
  payouts) · stripe.com/connect/pricing · irs.gov (OBBBA 1099-K FAQ) · Avalara (OBBBA thresholds) ·
  support.patreon.com (fee articles ×2) · support.google.com/youtube (72902, 12504220) ·
  help.medium.com (360036691193) · Substack pricing analyses (Ruzuku, SchoolMaker — secondary,
  labeled as such).

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/research-review-creator-payout-model.md` | NEW — G-009 research-review (options, recommendation-as-default, staged lane spec, 7 open forks) |
| `docs/sprints/SESSION_0651.md` | adopted (staged → in-progress → closed), task log + close docs |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0651` · `auto/session-0651-rr-creator-payout` — exit 0 |
| Docs-only lane — no build/test gates apply | n/a (2 owned files only; no code, no ledger/index edits) |

## Proposed ledger edits

_Not applied by this lane (ledgers are outside the owned-paths fence). For the AM merge owner:_

- **`docs/knowledge/wiki/goals-ledger.md` G-009 row** — append to Status/Why: *"Research-review
  complete (SESSION_0651 → `docs/architecture/research/research-review-creator-payout-model.md`):
  Stripe Connect + attribution options surveyed, staged 5-phase build-lane spec drafted, 7 operator
  forks OPEN (split % · threshold · Express vs Standard · attribution · tax · schema seam ·
  timing). Status stays **open** — build not started; Phase 0 (entitled-read instrumentation)
  identified as the no-regret first slice."*
- Optional drift note (operator's call, fork F6): `StripeAccount`/`PayoutSplit` are schema-only and
  unwired since ~SESSION_0107 — candidate for the drift-register if F6 lands on "new creator-scoped
  models."

## Open decisions / blockers

- None blocking the doc. **All 7 G-009 forks are deliberately OPEN** — see the research-review's
  "OPEN FORKS" section; nothing was pinned per the lane charter.
- Wiki `index.md` backlink for the new doc NOT added (index is outside the owned-paths fence) —
  AM merge owner to add on merge, per convention.

## Residual for AM merge

- Merge PR (never merged by this lane). Apply the G-009 goals-ledger note above. Add the
  `index.md` backlink. Operator: review the 7 forks — F3 (Express vs Standard) + F4 (attribution)
  are the two that gate any build phase; F7 decides whether anything builds now at ~0 paid
  subscribers.

