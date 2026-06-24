---
title: "Post-Launch SOT — Black Belt Legacy"
slug: post-launch-sot
type: sot
status: active
created: 2026-06-20
updated: 2026-06-24
last_agent: claude-session-0441
pairs_with:
  - docs/knowledge/wiki/files/feature-request-dialog.md
  - docs/petey-plan-0419-post-launch-sweep.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - bbl
  - post-launch
  - sot
  - running-list
---

# Post-Launch SOT — Black Belt Legacy

**The single light running list now BBL is live.** What's live, what's next (P0/P1/P2), and
what's come in. This **supersedes** the day-old `feature-intake-ledger.md` — one list, not two.

- **P0** — breaks or blocks live users (fix now).
- **P1** — important, schedule soon.
- **P2** — nice-to-have / polish.

> Detailed task breakdowns for in-flight items live in their petey-plan
> (e.g. [`petey-plan-0419-post-launch-sweep`](../../petey-plan-0419-post-launch-sweep.md)).
> This SOT is the index + status, not the spec.

## Status convention (the yaml pointer)

Each shipped feature gets a **file-spec** under `docs/knowledge/wiki/files/` carrying a
`lifecycle:` frontmatter field — **the single source of truth for feature status**:

```yaml
lifecycle: planned | building | MVP_LIVE | ga | dropped
```

- `MVP_LIVE` = shipped to production at MVP quality (the launch bar).
- `ga` = hardened / general-availability. `dropped` = decided against.

Aggregate "what's live" in one command — the SOT just *links* to the specs, so status is
never duplicated:

```bash
grep -rl '^lifecycle: MVP_LIVE' docs/knowledge/wiki/files/
```

## Now live (MVP_LIVE)

| Feature | Spec | Shipped |
| --- | --- | --- |
| Feature-request widget (DojoBots) | [feature-request-dialog](../../knowledge/wiki/files/feature-request-dialog.md) | SESSION_0422 |
| Public `/changelog` (What's New) | — | SESSION_0422 |
| Premium `/about` page | — | SESSION_0422 |

## Running list (P0 / P1 / P2)

Inbound requests land as `Report`(Feedback) via the widget (see the spec) — triage them into
this table. IDs are monotonic `FI-NNN` (carried over from the retired intake ledger).

| ID | Item | Type | Pri | Status | Source / notes |
| --- | --- | --- | --- | --- | --- |
| FI-001 | Brian Truelson first-tester onboarding + lifetime comp + thank-you email | feature | P0 | triaged | petey-plan-0419 |
| FI-002 | Lifecycle-email copy audit (all `LifecycleEmailKind`, now `DRYRUN=0`) | bug | P1 | triaged | SESSION_0419 follow-up |
| FI-003 | Student sign-up under instructor/school + claim-approval flow | feature | P1 | triaged | petey-plan-0419 |
| FI-004 | Admin email-composer parity + port BBLApp BBLEmail + mobile admin | feature | P1 | triaged | petey-plan-0419 |
| FI-005 | UI polish: rank-badge overlap · EmailCapture theme default · FormLabel wrap | polish | P2 | triaged | petey-plan-0419 |
| FI-006 | Claim→award rank lifecycle: registration/claim rank picker → pending claim (`rankId` on claim record) → admin-verify creates `RankAward`; deprecate `LineageTreeMember.selectedRankAward` FK | feature | P1 | in-progress | ADR 0035 / SESSION_0430. **SESSION_0441:** registration/claim **rank picker built** (creatable combobox → `currentRankId` → `claimedRankId`) + claim-review now displays the claimed rank ("approval will create a verified RankAward"). Held (not pushed). Remaining: `selectedRankAward` FK deprecation. |
| FI-007 | Directory-profile form: Cover Photo Url + Video intro show **"Invalid URL" on empty fields** (validation bug); assess cover-photo + avatar wiring correctness end-to-end; update the forms | bug | P1 | resolved (SESSION_0434) | Validation fixed (#159); wiring audited — avatar round-trips; cover/video were stored + in the read model but **never rendered** (logged WL-P2-14/15). SESSION_0434 wired the render: `coverPhotoUrl` → `ProfileHero` background + new `ProfileCoverBanner` (claimed `ListingDetail` path); `videoIntroUrl` → new `VideoIntroSection` (YouTube/Vimeo embed). Browser-verified (dev-login as admin owner → `/directory/brian-scott`). Orig screenshot `_assets/SESSION_0430-directory-profile-form-invalid-url.png`. |
| FI-008 | Reconcile `seed-baseline-lineage.ts` with the SESSION_0430 SQL corrections (Bill Hosken/Jerry Smith/Rikki/ranks/merges) so the seed stops being a latent regression (D-030); then it can carry the full Hélio Gracie node + Rorion link | bug | P1 | resolved (#161) | SESSION_0433 — seed reconciled; D-030 resolved; seed-run verified on prodsnap (no regression; independently re-verified SESSION_0434 — throwaway prodsnap copy, before/after byte-identical) |
| FI-009 | Re-derive the technique-graph + BJJ-curriculum feature fresh on current main (do NOT rebase the conflicting WIP). Reference: closed PR #157 / branch `codex/technique-graph-curriculum` + its 2 data JSONs (`prisma/data/bbl-bjj-{curriculum,graph}.json`) + `import-bbl-bjj-curriculum.ts`. De-threads getRequestBrand (gone); needs html2canvas dep | feature | P2 | resolved (SESSION_0435) — LIVE on prod | **Already built + merged on `main` before this lane** — the re-derive landed via `0be7eacc` (port) + `e2cdeb9c`/#154 (getRequestBrand de-thread, pages use `Brand.BBL`); `main` is byte-identical to the ref branch; html2canvas + nav/seo/footer/header/brand-features all present. SESSION_0435 = browser-verified both pages render with real data (no console errors); made graph node cards opaque (`bg-card`) so connector lines no longer bleed through; ran the idempotent `import-bbl-bjj-curriculum.ts` against **prod Neon** (all-creates: +1 org, 5 courses, 80 items, 61 techniques, 75 prereqs, 81 links; before-state confirmed 0 BJJ rows). Live: `blackbeltlegacy.com/curriculum` + `/techniques/graph` both 200 with content (countdown off). |

<!-- Append new rows above. Resolve in place: Status → MVP_LIVE (+ link the file-spec) or declined (+ reason). -->

## Inbox (raw, untriaged)

Feature requests submitted through the widget are stored as `Report` rows of type `Feedback`
(no separate table). Read them (admin / DB), then promote real ones into the running list
above with an `FI-NNN` id. Until triaged they live only as Feedback reports — this line is the
pointer so they're not lost.
