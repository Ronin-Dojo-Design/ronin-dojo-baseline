---
title: "SESSION 0403 — BBL go-live data: lineage pricing seed + Dirty Dozen profile import"
slug: session-0403
type: session--implement
status: in-progress
created: 2026-06-17
updated: 2026-06-17
last_agent: claude-session-0403
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0402.md
  - docs/architecture/decisions/0030-per-brand-stripe-account.md
  - docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0403 — BBL go-live data: lineage pricing seed + Dirty Dozen profile import

> **Unattended cloud run.** No Postgres / live Stripe / browser. Static gates (typecheck / lint / format)
> are the in-sandbox proof; the money path + DB import are proven by the operator on a real DB / BBL Stripe
> account. Two disjoint deliverables, **one branch + draft PR each** (operator-directed: "branch per task").

## Date

2026-06-17

## Operator

Brian + claude-session-0403 (unattended cloud run)

## Goal

Produce the two BBL go-live **data** artifacts that SESSION_0402 (PR #76, the per-brand Stripe seam) named as
follow-ups, sourcing both from the monorepo BBLApp:

1. **Lineage-membership pricing seed.** Extract the BBLApp membership pricing tiers, write the BBL Stripe
   products/prices spec, and seed BBL lineage-membership `PricingPlan` rows (brand BBL,
   `metadata.surface = lineage_membership`, cumulative entitlement grants, real BBL-account `stripePriceId`s
   from env).
2. **Dirty Dozen profile import.** Read the BBLApp WordPress profile data and import claimable placeholder
   Passports (+ DirectoryProfiles), tagging the "Dirty Dozen" cohort via `LineageVisualGroup`. Comp grants are
   applied on claim (handled in baseline — see Open decisions for the honest state of that wiring).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest closed session read: `docs/sprints/SESSION_0401.md`. The go-live lane substrate is
  `docs/sprints/SESSION_0402.md` (PR #76, branch `claude/bbl-stripe-separate-account`) — its `Next session`
  first task is exactly TASK_01 here ("Add `scripts/seed-bbl-lineage-pricing.ts`…"), and its follow-up list
  named the pricing seed as blocked-on-operator. SESSION_0402 + ADR 0030 live on the PR #76 branch (read from
  there).

### Branch and worktree

- Base: `main` at `62abc56`.
- TASK_01 branch: `claude/bbl-lineage-pricing-seed` (off `62abc56`).
- TASK_02 branch: `claude/bbl-lineage-profile-import` (off `62abc56`).
- Worktree: `/home/user/ronin-dojo-baseline` (remote container). Clean at bow-in.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Payments/Stripe (L1)** read model — TASK_01 adds `PricingPlan` data the existing `findLineageMembershipPlans` + BBL webhook (ADR 0030) consume; no Stripe code touched. **Identity (Passport/Directory/Lineage)** — TASK_02 writes data through the existing models only. No schema/migration. |
| Extension or replacement | **Extension** — both are seed/import scripts producing rows the existing seams already read; no new primitive, no model change. |
| Why justified | The seam (PR #76) is live but BBL has no sellable plans + no imported cohort; these are the data the cutover needs. |
| Risk if bypassed | `/lineage/join` empty on BBL; the Dirty Dozen cohort not claimable / not discoverable in the directory. |

Live docs checked: SESSION_0402 + ADR 0030 (PR #76 branch), GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC,
`server/web/billing/lineage-membership.ts`, `lib/entitlements/lineage-comp.ts`, `prisma/seed-pricing-plans.ts`,
`scripts/stripe-rehearsal-seed.ts`, `prisma/seed-baseline-lineage.ts`, `prisma/seed-bbl-org.ts`, monorepo
`wordpress/blackbeltlegacy-payments.php` + `src/brands/blackbeltlegacy/data/featuredBlackBelts.js`.

### Grill outcome (operator-answered, before code)

- **Tier mapping → 2 paid tiers; Legend comp-only.** `LINEAGE_PREMIUM` ← BBL Premium ($9.99/$59.99);
  `LINEAGE_ELITE` ← BBL Instructor ($29.99/$299); `LINEAGE_LEGEND` is not sold (reserved comp tier).
- **Dirty Dozen comp → lifetime `LINEAGE_ELITE`** (matches the gift epic's "Dirty Dozen = lifetime elite";
  the monorepo names the tier `dirty_dozen_legend` but the operator chose Elite).

## Petey plan

### Goal

Two idempotent, in-sandbox-typecheckable scripts + their docs; behaviour proven by the operator on a real DB /
BBL Stripe account.

### Tasks

#### SESSION_0403_TASK_01 — BBL lineage-membership pricing seed (Cody)

- **What:** `apps/web/scripts/seed-bbl-lineage-pricing.ts` + `docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md`.
- **Steps:** 4 plan rows (Premium + Elite, each Monthly + Annual), amounts from
  `blackbeltlegacy-payments.php`; `metadata.surface = lineage_membership`; cumulative entitlement grants via
  `getLineageCompEntitlementKeys`; real BBL-account `stripePriceId`s from env (`BBL_STRIPE_PRICE_*`), refusing
  to seed sellable rows without them (`--dry-run` / `--allow-missing-price-ids` escape hatches). Idempotent
  upsert by (brand, org, name).
- **Done means:** typecheck/lint/format green; `--dry-run` lists the 4 plans; re-run backfills price ids.

#### SESSION_0403_TASK_02 — Dirty Dozen profile import (Cody)

- **What:** `apps/web/scripts/import-bbl-lineage-profiles.ts` (embedded BBLApp profile data) +
  `docs/product/black-belt-legacy/BBL_LINEAGE_IMPORT_SPEC.md`.
- **Steps:** For each of the 7 featured black belts, upsert an accountless (claimable) Passport (dedupe by
  plain `displayName` + `userId: null` — must match `seed-baseline-lineage`'s key so it never duplicates the 5
  overlapping people), enrich identity fields (avatar, bio, socialLinks array, placeOfBirth/startedTrainingAt),
  ensure a `DirectoryProfile` (PUBLIC, slug, location), ensure a claimable `LineageTreeMember` in a dedicated
  BBL `bbl-dirty-dozen` tree, and tag them into a "Dirty Dozen" `LineageVisualGroup`. Non-destructive enrich.
- **Done means:** typecheck/lint/format green; idempotent; documented dedup + comp-on-claim note.

#### SESSION_0403_TASK_03 — Gates + PRs (Doug / Petey)

- **What:** typecheck / lint:check / format:check / wiki:lint; push each branch; open a **draft PR** per task.
- **Done means:** gates recorded; two draft PRs opened, each referencing this session + PR #76.

### Parallelism

TASK_01 and TASK_02 touch disjoint files and ship on separate branches/PRs (operator: branch per task).
Executed inline by the orchestrator.

### Open decisions

- **"Comp grants auto-on-claim" is not literally wired today.** The claim-approval action
  (`server/admin/lineage/claim-review-actions.ts`) applies a comp only when the reviewer supplies `input.comp`
  ({ tier, termDays }); there is no cohort→comp auto-derivation in code. TASK_02 therefore makes the cohort
  *identifiable* (the "Dirty Dozen" visual group) and documents the intended grant (lifetime `LINEAGE_ELITE`),
  so the reviewer applies it on approval (or a future auto-wire reads the cohort). Flagged for the operator —
  not built here (out of scope; "handled in baseline").

### Risks

- **No real Stripe / DB / browser in sandbox.** Static gates only; the money path + import are operator-proven.
- **Avatar paths are BBL.com `/brand/...` asset paths** (media migration is a separate cutover item). The
  import stores them as-is, or absolute if `BBL_ASSET_BASE_URL` is set.

### Scope guard

- No schema change / migration. No Stripe code change (the seam is PR #76). No comp-grant logic written.
- No fabricated `price_…` ids — real ids come from the operator via env at run time.
- No relationship/edge seeding in TASK_02 (baseline already wires the Rigan edges); identity + cohort tag only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0403_TASK_01 | landed | `seed-bbl-lineage-pricing.ts` (4 plans, env price ids, cumulative grants) + `BBL_STRIPE_PRODUCTS_SPEC.md`. |
| SESSION_0403_TASK_02 | landed | `import-bbl-lineage-profiles.ts` (7 placeholder Passports + DirectoryProfiles + Dirty Dozen visual group) + `BBL_LINEAGE_IMPORT_SPEC.md`. |
| SESSION_0403_TASK_03 | in-progress | Static gates + two draft PRs. |

## What landed

- **TASK_01 — pricing seed.** Two paid tiers × monthly/annual = four BBL `PricingPlan` rows, amounts from the
  monorepo `resolve_tier_amount`, `metadata.surface = lineage_membership`, cumulative entitlement grants
  (Elite plans grant PREMIUM+ELITE so paid == comp signal), real BBL-account `stripePriceId`s from env. Plus
  the operator product/price spec.
- **TASK_02 — Dirty Dozen import.** Idempotent import of the 7 featured BBLApp black belts as accountless,
  claimable Passports (deduped against the baseline lineage seed), each with a PUBLIC DirectoryProfile and a
  claimable member in a dedicated `bbl-dirty-dozen` tree, all tagged into a "Dirty Dozen" `LineageVisualGroup`.

## Decisions resolved

- 2 paid tiers (Legend comp-only); Dirty Dozen comp = lifetime `LINEAGE_ELITE` (operator grill).
- Import targets a dedicated `bbl-dirty-dozen` tree (self-contained; does not disturb the existing
  baseline-cloned BBL Rigan tree/group); people are deduped globally so no person is duplicated.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/scripts/seed-bbl-lineage-pricing.ts` | **New** — BBL lineage-membership pricing seed (TASK_01). |
| `docs/product/black-belt-legacy/BBL_STRIPE_PRODUCTS_SPEC.md` | **New** — operator product/price spec (TASK_01). |
| `apps/web/scripts/import-bbl-lineage-profiles.ts` | **New** — Dirty Dozen placeholder import (TASK_02). |
| `docs/product/black-belt-legacy/BBL_LINEAGE_IMPORT_SPEC.md` | **New** — import spec + dedup/comp notes (TASK_02). |
| `docs/sprints/SESSION_0403.md` | This record. |
| `docs/knowledge/wiki/index.md` | SESSION_0403 row. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (apps/web) | _filled at bow-out_ |
| `bun run lint:check` / `format:check` | _filled at bow-out_ |
| `bun run wiki:lint` (root) | _filled at bow-out_ |
| `seed-bbl-lineage-pricing.ts --dry-run` | _operator (needs DB)_ |
| BBL-account Stripe rehearsal + DB import | **Deferred — operator gate** (no DB/Stripe in sandbox). |

## Open decisions / blockers

- Pricing seed needs the operator's real BBL-account `price_…` ids (env) before it seeds sellable rows.
- Comp-on-claim auto-wiring (see Petey plan Open decisions) — confirm with operator whether to build the
  cohort→comp auto-derivation or keep it reviewer-applied.

## Next session

### Goal

On the operator's machine: create the BBL Stripe products/prices, run both scripts against the BBL DB, verify
`/lineage/join` lists the plans and the Dirty Dozen profiles are claimable + directory-visible, run the
BBL-account rehearsal, then proceed to the DNS flip (SESSION_0402 checklist D).

### First task

Run `seed-bbl-lineage-pricing.ts --dry-run`, then with real env price ids; run `import-bbl-lineage-profiles.ts`;
spot-check `/lineage/join` and `/members`.

## Review log

_Filled at bow-out._

## Hostile close review

_Filled at bow-out._

## ADR / ubiquitous-language check

- No new ADR (applies ADR 0030 + the gift/comp epic). No new ubiquitous-language terms — "Dirty Dozen" is a
  cohort label on an existing `LineageVisualGroup`; tiers reuse the existing `LINEAGE_*` entitlement keys.

## Reflections

_Filled at bow-out._

## Full close evidence

_Filled at bow-out._
