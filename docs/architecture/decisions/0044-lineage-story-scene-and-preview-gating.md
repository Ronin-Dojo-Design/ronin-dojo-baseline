---
title: "ADR 0044 — LineageStoryScene: Epic A scene model, preview gating, and the transport-split revalidation law"
slug: 0044-lineage-story-scene-and-preview-gating
type: adr
status: accepted
created: 2026-07-04
updated: 2026-07-04
last_agent: claude-session-0498
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0035-lineage-rank-display-awarded-truth.md
  - docs/architecture/decisions/0037-lineage-branch-heads-and-visual-placement.md
  - docs/architecture/research/research-review-passport-node-id.md
  - docs/architecture/research/research-review-authz-systems.md
  - docs/petey-plan-0498-epic-a-lineage-journey.md
backlinks:
  - docs/sprints/SESSION_0498.md
  - docs/knowledge/wiki/index.md
---

# ADR 0044 — LineageStoryScene: Epic A scene model, preview gating, and the transport-split revalidation law

**Status:** accepted (SESSION_0498; Giddy pass-2 recommended ratifying now — the contested structural
decisions landed with A0+A1+A2 and stopped moving; what remains of Epic A is presentation/media plumbing).

## Context

Epic A (the Lineage Journey scrollytelling) needed: story data per person over the live ancestry walk
(A0), a public scroll-story renderer (A2), a curation surface (A1), and a pre-GA preview surface
(`/app/beta`). Each forced a structural decision with life beyond Epic A. Loop-verified to SHIP ≥9.5
across five reviews (SESSION_0498 REVIEW_01–05).

## Decisions

### D1 — Scene identity: 1:1 `LineageStoryScene` keyed by `passportId`

A scene is story data about a **person** (identity), not a tree position. Keyed
`passportId @unique NOT NULL`, `onDelete: Cascade` — survives node re-parenting/tree consolidation
(ADR 0037 has orphaned nodes before). The deeper "collapse Passport.id/LineageNode.id to one id?"
question was researched and **rejected** — see
[`research-review-passport-node-id.md`](../research/research-review-passport-node-id.md) (a 1:1 FK is a
relationship stored once, not a fact stored twice; the mapping is 1:0..1).

### D2 — Scenes carry NO rank, visibility, or verification authority

`LineageStoryScene` is additive narrative copy/media. Rank truth stays `RankAward` (ADR 0035);
visibility stays `LineageNode.visibility`; verification stays the claim system (ADR 0036). A hidden
node's scene can never surface or resurrect the node (truncation-gated attachment, test-pinned).

### D3 — Walk order is the authoritative entry order; `sceneOrder` is storyboard-only

The ancestry walk (founder → member promotion chain) orders the public sequence. `sceneOrder` exists
for the A1 board's presentation only and is **not projected** into the public view — a consumer must
never re-sort the chain by scene metadata (a second ordering authority would fabricate promotion order).

### D4 — Public view minimalism + the constant-in-view rule

`LineageStorySceneView` projects **only what the public renderer consumes** (quote, storyBio,
heroImageUrl, enabled). Provenance (`quoteAttribution` — sourcing notes; display attribution renders
`displayName`), dormant media (`heroVideoUrl`/`posterUrl` until A5), and bridge fields (until A6) stay
DB-only. **The rule:** a public-view field that is *constant-by-construction* on the public path (e.g.
`enabled` — always true because the public where filters it) is admissible **only with a where-shape
test pinning the constant**. Otherwise "a preview consumes it" becomes the universal excuse for
payload widening.

### D5 — The preview-widening flag pattern (`/app/beta`)

Pre-GA preview = the **same** cached read with an options flag (`includeDisabledScenes`) that relaxes
exactly one filter, where: (a) the gated surface is the only caller that passes it (call-graph
verified); (b) public callers structurally can't reach it (no plumb-through); (c) `"use cache"` keys on
arguments, so preview and public are distinct cache entries by construction, both flushed by the same
tags. A5/A6 media previews MUST reuse this shape, not invent a third variant. GA itself is **data**
(the per-scene `enabled` kill-switch flipped on the A1 storyboard), never a deploy.

### D6 — Flat `lineage.manage` for cross-tree curation; `beta.view` as an axis-1 key

Scene curation is cross-tree Passport-keyed editorial work — tree-scoped `LineageTreeAccess` grants
don't map, so the storyboard gates on the flat capability key (`can()`), with page gate, procedure
`meta.permission`, and entry-link visibility agreeing. The beta area's `beta.view` follows the ratified
authz law (see [`research-review-authz-systems.md`](../research/research-review-authz-systems.md)):
**a new authz need = a new key or composition helper — never a new store or resolver.** Per-user grants
of such keys = FI-019 (a `UserPermissionGrant` table inside axis-1 resolution).

### D7 — The transport-split revalidation law (do-not-merge twins)

Next 16 hard-throws `updateTag` (E872) outside true Server Actions. Therefore **one revalidation
contract, two transport-bound implementations**:

| Seam | Transport | Tag API |
| --- | --- | --- |
| `lib/safe-actions.ts` | next-safe-action Server Actions | `updateTag` (same-request refresh) |
| `server/orpc/revalidate.ts` | `/api/rpc` Route Handler | `revalidateTag(tag, { expire: 0 })` (read-your-writes next request) |

They must never be merged or cross-copied (the WL-P1-8 twin class — WL row logged). Every scene
mutation revalidates `"lineage"` + `lineage-ancestry-${passportId}`.

### D8 — Editorial integrity defaults

Duplicate-card lands **disabled + unordered** (copied words must be re-attributed before publishing).
The founder seed is **create-only** (a reseed can never revert operator-curated copy or re-arm a
disabled scene). `bridgeCondition` grammar is explicitly **deferred to A6** — it is an undefined
stringly-typed field until then and must not grow ad-hoc consumers.

## Dirstarter docs proof

Not applicable — lineage is an ahead-of-baseline custom module (no Dirstarter baseline layer replaced);
Prisma usage follows the repo's established hand-authored-migration lane.

## Consequences

- Epic A fast-follows (A3 layout, A5 media, A6 bridges) build on ratified law instead of re-litigating
  keys, ordering, gating, or revalidation.
- The public payload stays lean by rule, not by review vigilance.
- Prod bring-up is operator-controlled data flow: deploy (no visible change) → seed `--disabled` →
  beta preview → flip live per-scene.
