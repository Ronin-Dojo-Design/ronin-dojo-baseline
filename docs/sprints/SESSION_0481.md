---
title: "SESSION 0481 — Belt Journey Slice 4: BeltEditCard + grid + edit form + CountrySelect"
slug: session-0481
type: session--implement
status: closed
created: 2026-07-01
updated: 2026-07-01
last_agent: claude-session-0481
sprint: S49
pairs_with:
  - docs/petey-plan-0477-belt-journey-crm-epic.md
  - docs/sprints/SESSION_0480.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0481 — Belt Journey Slice 4: BeltEditCard + grid + edit form + CountrySelect

> **Autonomous epic, Slice 4 of [`petey-plan-0477`](../petey-plan-0477-belt-journey-crm-epic.md)** — driven by
> `claude-session-0481` (Petey→Cody) while the Codex run is paused on out-of-credits. Stacked on Slice 3
> (`auto/session-0480`). Slices 1–3 = PRs #177/#178/#179.

## Goal

The member-facing belt UI: a `BeltEditCard` grid gated by the ceiling, an edit surface that respects the
UNVERIFIED-only fact rule, and a `CountrySelect` primitive — all wired to the Slice-3 belt oRPC.

## Status

Closed. Slice 4 complete + gates green; committed to `auto/session-0481` for PR (stacked on `auto/session-0480`).

## What landed

- **`apps/web/components/web/belt/`** (client, presentational — render from a view-model prop, mutate via the
  plain oRPC `client` proxy; no Prisma in client files):
  - `BeltEditCard` — L1 `Card` + belt color via `--rank-color` (from `Rank.colorHex`); status Add/Locked/
    Completed; locked (`sortOrder > ceiling`) = disabled + `opacity-70` + tooltip. Not an `m-card` kind.
  - `BeltJourneyGrid` — one card per discipline rank in `sortOrder`, responsive 1→2→3 cols, opens the edit
    `Dialog` on an unlocked card; local overlay refreshes a saved card in place.
  - `BeltEditForm` — fact fields (date/promoter/school/country) editable **only when UNVERIFIED** (else
    read-only + a "verified" note); story + 4 media galleries always editable; white-belt special-case.
  - `BeltMediaGallery`, `belt-view-model.ts` (pure derivation helpers), `index.ts` barrel.
- **`lib/countries.ts`** — static ISO 3166-1 alpha-2 list + `getCountryLabel` + `countryFlagEmoji`
  (Regional-Indicator transform — no per-country table, no new dep). `CountrySelect` wraps `ComboboxSelector`.
- Calls the Slice-3 oRPC: `client.belt.upsertBeltMilestone` (story), `updateRankAwardFact` (fact; promoter/
  school as typed FK on a registered pick, else freetext → router emits the school-lead), `attach|detachMilestoneMedia`.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/belt/*` (8 files + 2 tests) | **NEW** — belt card, grid, edit form, media gallery, view-model, barrel |
| `apps/web/lib/countries.ts` + `.test.ts` | **NEW** — ISO country list + flag helper + `CountrySelect` data |

## Verification

| Gate | Result |
| --- | --- |
| `tsc --noEmit` | ✅ 0 errors |
| `oxlint` / `oxfmt --check` | ✅ clean |
| `bun run test` (belt view-model + countries) | ✅ 18 pass / 0 fail |
| `bun run build` (app-code gate) | ✅ PASS |

## Open decisions / blockers

- **Codex out of credits** (external); driven in Claude. Resume: `AUTO_BASE_BRANCH=auto/session-0481 scripts/auto-session-codex.sh 2`.
- **Slice 5 must provide (3 seams Cody delegated):**
  1. **Milestone media upload** — `MediaAttachTargetKind` has no `rankMilestone` kind; the galleries take an
     `onUpload(file) → {mediaId}` prop. Slice 5 adds a `rankMilestone` target kind + resolver (or a small
     dedicated milestone-upload action), then wires `onUpload`. Omitting it = read-only galleries (safe).
  2. **Media URL join** — `BeltCardOutput.milestone.media` is ids only; Slice 5's server load must join `Media`
     to resolve `url`/`type` into `BeltRankViewModel.media`.
  3. **Country persistence** — `CountrySelect` renders but is local-only; `updateRankAwardFactInput` has no
     `country` field yet. Slice 5 decides where it persists (`Organization.country` / `Affiliation`, Locked #7).
- **oRPC-client-on-the-client is a repo first** — Slice 5 should smoke that `/api/rpc` authenticates from the
  browser (cookies already `credentials: "include"`).

## Next session

### Goal

**Slice 5** of `petey-plan-0477` — mount the "Belts" tab on `/app/profile` (server-load awarded ranks +
`memberTopRank` (BJJ) + milestones with the media-URL join; supply `onUpload` for milestone media) + wire the
ceiling + a Playwright behavior proof; prove zero regression to the awarded-truth rank display. Branch
`auto/session-0482` off this one.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0481_TASK_01 | ✅ done | Belt UI — `BeltEditCard`/grid/form/media gallery + `CountrySelect` + `lib/countries`; 18 tests; wired to belt oRPC |
