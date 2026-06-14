---
title: "Petey Plan 0379 — Lineage focal explorer (fork donatso/family-chart)"
slug: petey-plan-0379
type: petey-plan
status: active
created: 2026-06-13
updated: 2026-06-14
last_agent: claude-session-0382
pairs_with:
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md
  - docs/sprints/SESSION_0380.md
  - docs/petey-plan-0305.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0379 — Lineage focal explorer (fork donatso/family-chart)

> **REWRITTEN SESSION_0379.** The original plan (build a 2D tidy-tree engine from scratch, extend the
> existing canvas) is **superseded**. After grilling, the operator chose to **fork the MIT TypeScript/D3
> library [`donatso/family-chart`](https://github.com/donatso/family-chart)** and build a new
> **focal-centric genealogy explorer (View A)** alongside the existing org-chart canvas (View B). The
> full decision trail + integration spec live in
> [`lineage-tree-runbook.md`](runbooks/domain-features/lineage-tree-runbook.md) **§0 + §0a — read those
> first.** This file is just the slice sequence.
>
> ✅ **PATH LOCKED (SESSION_0380, [ADR 0026](architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md)).**
> A fresh-chat grill confirmed candidate-A and refined it: **one shared engine-agnostic DTO, two layout
> engines** — donatso (focal View A) + the existing canvas (overview View B, **untouched**; copy →
> `lineage-tree-canvas-v2.tsx` only when View B work begins). Candidate-B contributes its **design** (the
> two-step DTO + role/trust/cohort vocabulary), **not** code or any Balkan package. Collapsing to one
> engine is a later evidence-based gate. Grounding corrections folded into the slices below.

## Locked decisions (do not re-grill — see runbook §0/§0a for rationale)

1. **Base = fork `donatso/family-chart`** (MIT, TypeScript, `d3@7`). Vendor the source into a
   workspace-local module we own (`apps/web/lib/lineage/family-chart/` or a `packages/` module); IoC +
   read review before commit. Not an npm dependency; we edit internals freely.
2. **Two coexisting views, two layout engines, one DTO.** **View B** = the existing org-chart
   `LineageTreeCanvas` (whole-tree overview) — **kept, untouched**. When View B additions later begin,
   build them on a **copy** (`lineage-tree-canvas-v2.tsx`); never edit the original (zero-risk fallback).
   **View A** = the new donatso focal explorer. B→A: click a person in B → open A focused on them.
3. **View A is focal-centric.** `main_id` = tree root by default; every node re-centers; depth-limited;
   shareable `?focus=` URLs. (FamilyTreeApp is the visual/UX north star.)
4. **Mapping: single-primary-line + secondary-overlay.** `rels.parents = [primaryVisualParentMemberId]`,
   `rels.children = [promotees]`, `single_parent_empty_card = false`. Cross-belt/secondary promoters
   (`LineageRelationship` PROMOTED_BY beyond primary) render as a **secondary-link overlay** (belt-
   labelled, dashed, subordinate; in-view only, else drawer). `rels.spouses` reserved/unused in v1.
5. **Privacy unchanged + sacred.** Non-PUBLIC dropped by the materializer, never reach View A. Do not
   use family-chart `is_private` to surface hidden members. Belt color stays `Rank.colorHex`.
6. **No schema changes.** Pure read-model + client display. Adapter is client-side + pure.
7. **Shared two-step DTO (cherry-picked from candidate-B).** A pure adapter derives an engine-agnostic
   `LineageVisualNode[] + LineageSecondaryLink[]` **once** from the materialized payload; donatso projects
   it → `Datum[]`; the v2 canvas reads it for its new surfaces. **Reuse `lib/lineage/trust-status.ts`
   (`resolveLineageTrustStatus`)** — do not invent a trust enum (it already exists, richer than B's).
8. **No Balkan package, no license.** Candidate-B is original code; we adopt its *design*, render via
   engines we own.
9. **One-engine = later gate (not now).** The 0379-1 smoke (whole tree in donatso, `main_id`=root) + how
   View A feels decide whether View B later migrates onto donatso. The shared DTO keeps that cheap.

> ⚠ **Grounding correction (SESSION_0380, verified in code):** the multi-parent secondary edges are
> **already materialized** in the public payload (`payloads.ts` `relationshipsTo`/`relationshipsFrom`;
> `queries.ts` `edgeMap`). The secondary-overlay (slink/clink, slice 0379-4) therefore has a client-side
> data source **today** — its server scope is "expose already-fetched edges to the adapter," not "add them
> to the payload" (runbook §4 assumed the latter).

## Slices (each ≈ one session)

### 0379-1 — Vendor the fork (foundation)

- **Goal:** bring `donatso/family-chart` `src/` into a workspace-local module we own; add `d3@7`; make
  it compile + typecheck inside our repo.
- **Steps:** IoC + read review of the ~40 TS files; copy under `apps/web/lib/lineage/family-chart/`
  (keep upstream `LICENSE` + record forked commit SHA); wire into our TS/build; smoke a trivial chart.
- **Done means:** the forked module typechecks + lints in-repo; a throwaway demo renders; license +
  provenance recorded; IoC review clean.
- **Depends on:** nothing.

### 0379-2 — Shared two-step DTO + donatso projection

- **Goal:** the engine-agnostic visual model (candidate-B's two-step DTO), then the donatso projection.
  - **Step 1 (neutral):** `apps/web/lib/lineage/to-lineage-visual.ts` → `{ nodes: LineageVisualNode[],
    secondaryLinks: LineageSecondaryLink[] }` from the materialized payload (incl. the already-present
    `relationshipsTo`/`relationshipsFrom` edges). Carries role, **trust via `resolveLineageTrustStatus`
    (reuse — do not reinvent)**, group, primary/partner/assistant parent, secondary links.
  - **Step 2 (engine projection):** `apps/web/lib/lineage/to-family-chart-data.ts` → family-chart
    `Datum[]`: `rels.parents=[primaryVisualParentMemberId]`, `rels.children=[promotees]`,
    `single_parent_empty_card=false`, `gender` unset, and `data`:
    - `colorHex`, `avatar`, `displayName`, `rankLabel`, `slug`, `claimable`
    - **`trustStatus: LineageTrustStatus`** (full 6-value enum from `resolveLineageTrustStatus` — NOT a
      `verified: boolean` collapse; Desi review: `disputed`/`claim-pending` states must reach the card
      for users to see warning/caution signals)
    - **`isFocal: boolean`** — `true` when `datum.id === main_id` (Desi review: required for focal ring +
      "you are here" affordance; must be passed through so the card templater can apply the ring without
      re-querying the store)
- **Files:** the two libs above + `.test.ts` each (pure, unit-tested).
- **Done means:** both unit-tested green; bjj payload → valid neutral DTO → valid `Datum[]`; privacy =
  consumes the same materialized payload as View B (no non-PUBLIC). The neutral DTO is engine-agnostic
  (no family-chart types leak into step 1) so View B can later read it too.
- **Depends on:** 0379-1 (step 2 only; step 1 is independent and could land earlier).

### 0379-3 — View A island + bjj render + B→A link

- **Goal:** the `"use client"` family-chart island on `/lineage/[treeSlug]?view=explore&focus=[person]`;
  HTML belt cards via `cardInnerHtmlCreator` (band from `Rank.colorHex`, avatar, name/rank/badges);
  click = re-center (+ `?focus=` shallow sync); "View profile" → existing `LineageProfileDrawer`;
  reuse path-to-main hover + mini-tree expand. Add the View B → View A link.
- **Card HTML templater — design spec (Desi review, SESSION_0381 + SESSION_0382):**
  - **Inline styles ONLY.** No CSS class names except engine-managed (`f3-card`, `f3-path-to-main` etc.).
    No separate `family-chart.css` for card classes (YAGNI; engine manages its own CSS; inline avoids
    specificity conflicts and hydration issues in d3-managed DOM).
  - **Belt band:** `position:absolute; top:0; left:0; right:0; height:4px` (not 1px — invisible at zoom);
    `background-color: ${data.colorHex ?? '#e2e8f0'}` (neutral gray for null/unranked, not omitted).
  - **Corner rank chip (SESSION_0382 HIGH):** `position:absolute; top:10px; right:6px; background:
    ${data.colorHex ?? '#64748b'}; color:#fff; font-size:10px; font-weight:500; padding:2px 6px;
    border-radius:999px; max-width:68px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap`.
    Renders `data.rankLabel`. Replaces the below-name rank text line (saves vertical space; rank-at-a-
    glance from belt color + chip). Omit chip if `data.rankLabel` is null.
  - **Card shadow (SESSION_0382 HIGH):** `box-shadow: 0 1px 4px rgba(0,0,0,0.10)` on the outer card
    `<div>` (the donatso-rendered card wrapper). When `data.isFocal === true`, MERGE with focal ring:
    `box-shadow: 0 0 0 2px ${data.colorHex ?? '#64748b'}, 0 1px 4px rgba(0,0,0,0.10)`.
  - **Avatar size (SESSION_0382 HIGH):** 44×44px circle (`width:44px; height:44px; border-radius:50%;
    object-fit:cover; flex-shrink:0`). Initials fallback `<div>`: same 44px dimensions, `background:
    ${data.colorHex ?? '#94a3b8'}; color:#fff; font-size:16px; font-weight:700; display:flex;
    align-items:center; justify-content:center`. Call `memberInitials()` from `canvas-model.ts`; do
    NOT use `onerror` JS injection in the HTML string (unsafe in d3 DOM).
  - **Profile icon trigger (SESSION_0382 MEDIUM):** `position:absolute; bottom:6px; right:6px;
    opacity:0.4; font-size:12px; color:#64748b; cursor:pointer` — a `↗` character (or equivalent SVG
    icon) that calls the card's `onProfileClick` handler → opens `LineageProfileDrawer`. Simpler than a
    `...` menu; follows the Balkan UX pattern without dropdown overhead.
  - **Trust badge:** render full `LineageTrustStatus` states from DTO `trustStatus` — not a boolean.
    Color map (inline bg-color + text, hex literals for d3 DOM): `verified` → `#dcfce7`/`#15803d`;
    `disputed` → `#fee2e2`/`#b91c1c`; `claim-pending` → `#fef3c7`/`#92400e`; `claimed` → `#e0e7ff`/
    `#3730a3`; `claimable` → `#c7d2fe`/`#3730a3` (lighter indigo to distinguish from `claimed`);
    `imported`/`unverified` → `#f1f5f9`/`#64748b` (neutral). Trust badge is on the same row as the
    name (not a second line below), sharing the row with the avatar layout.
  - **Focal ring (now merged with shadow above):** `box-shadow: 0 0 0 2px ${data.colorHex ?? '#64748b'},
    0 1px 4px rgba(0,0,0,0.10)` when `data.isFocal === true`. No size change (keeps engine node-
    separation math stable).
  - **Typography:** name at `14px / font-weight:500`; no rank text line (rank → corner chip above) —
    absolute px, not Tailwind utilities (Tailwind cannot run inside d3 HTML strings).
- **Files:** new island component + route wiring (shared fetch w/ existing viewer), card HTML templater.
- **Done means:** bjj lineage renders in View A from engine coordinates; re-center + focus URL work;
  drawer opens; B→A link works; belt cards render correctly (band, avatar, trust badge, focal ring);
  browser-proof on `bbl.local:3000`.
- **Depends on:** 0379-2.

### 0379-4 — Secondary-overlay (slink/clink) — View A

- **Goal:** render cross-belt/secondary promoters as a belt-labelled, dashed, subordinate overlay by
  extending the fork's `layout/create-links.ts` + `renderers/view-links.ts`; drawn only when both
  endpoints are in the current focal view; out-of-view secondaries listed in the drawer. Legend + toggle.
- **Files:** forked `create-links`/`view-links`; the neutral DTO's `secondaryLinks` (already sourced from
  the payload's `relationshipsTo`/`relationshipsFrom` — **no new server work**); drawer rank-history.
- **Done means:** a node promoted by two professors shows the primary edge + a distinct secondary link
  in-view (drawer otherwise); privacy tests still green; browser-proof.
- **Depends on:** 0379-2 (DTO `secondaryLinks`), 0379-3.

### 0379-B1 — View B (overview) engine extensions [separate track, after View A proves out]

- **Goal:** on a **copy** `lineage-tree-canvas-v2.tsx` (original untouched), add what View B lacks vs the
  candidate-B design: **partner/assistant placement** + the **slink/clink secondary overlay** (reading
  the same neutral DTO `secondaryLinks`). Grouped cohorts already exist (`LineageVisualGroup`).
- **Done means:** v2 canvas renders partner/assistant + secondary overlay from the shared DTO; the
  original canvas + its dnd editor/privacy guards are untouched; browser-proof.
- **Depends on:** 0379-2 (shared DTO). Gated behind the one-engine evaluation (decision 9) — only build
  View B's own engine if the gate keeps two engines.

### 0379-5 — Privacy + edge-case + mobile verification

- **Goal:** prove the materializer drop holds in View A (non-PUBLIC absent; broken lineage lines, no
  phantom card with `single_parent_empty_card=false`); guarded privacy tests green; mobile zoom/pan/
  re-center polish.
- **Done means:** `queries.visibility.test.ts` + privacy guards green; mobile browser-proof; no leak.
- **Depends on:** 0379-3 (4 if landed).

### 0379-6 — Polish wave

- **Goal:** depth controls (`ancestry_depth`/`progeny_depth`), mini-tree load-on-demand, focus-URL
  polish, node templates (placeholder / claimed / deceased / root), export + minimap **if free from the
  fork**.
- **Done means:** each sub-feature browser-proven.
- **Depends on:** 0379-1..5.

## How to run this

- **Interactive (recommended for 0379-1..3):** bow in, point at runbook §0/§0a + this plan. Vendoring
  the fork (1), the pure adapter (2), and the first render (3) want careful hands + browser proof.
- **Secondary-overlay (4)** is the novel custom work (editing the fork's link layer) — interactive.
- **Autonomous (5–6)** are more mechanical once the engine is wired; confirm one session closes first.

## Scope guard

- No schema migration. No DNS/Vercel-prod/Stripe changes.
- **Never edit `lineage-tree-canvas.tsx`** — View A is additive; View B changes go on the v2 copy only.
- Do not regress privacy/RBAC invariants (runbook §0a; hub §"Privacy invariants").
- Belt color = `Rank.colorHex` data; no hardcoded brand colors.
- IoC + LICENSE.txt + read review the vendored fork before it commits (operator supply-chain caution).
- No Balkan npm package; the neutral DTO must not leak family-chart types (engine-agnostic).

## Cross-references

- [ADR 0026 — Lineage View A engine (donatso fork; one DTO, two engines)](architecture/decisions/0026-lineage-view-a-engine-donatso-fork.md) — the ratified decision.
- [Lineage Tree Runbook](runbooks/domain-features/lineage-tree-runbook.md) — §0 verdict + §0a integration spec (the authoritative design).
- [Lineage Domain Hub](runbooks/domain-features/lineage-hub.md) — data model, file map, privacy invariants.
- [Petey Plan 0305](petey-plan-0305.md) — the lineage epic this continues.
- [`donatso/family-chart`](https://github.com/donatso/family-chart) — the MIT fork base.

**Honor the Lineage. Build the Future. OSSS.**
