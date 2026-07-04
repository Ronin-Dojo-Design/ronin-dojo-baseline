---
title: "Petey Plan 0498 — Epic A: The Lineage Journey (scrollytelling)"
slug: petey-plan-0498-epic-a-lineage-journey
type: plan
status: active
created: 2026-07-04
updated: 2026-07-04
last_agent: claude-session-0497
pairs_with:
  - docs/petey-plan-0494-experience-epics.md
  - docs/sprints/SESSION_0497.md
  - docs/runbooks/domain-features/lineage-hub.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0498 — Epic A: The Lineage Journey (scrollytelling)

> **Pre-staged at the SESSION_0497 close** (Petey, on operator request) so 0498 skips planning and
> goes straight to the grill → build. Grounded against `petey-plan-0494` §Epic A, `lineage-hub.md`,
> and the live `ancestry.ts` / `lineage-ancestry-timeline.tsx`. Epic A **evolves the already-live
> `/directory/[slug]` ancestry timeline** into a scroll-driven story — it does NOT build a timeline
> from scratch (see the [[epic-a-timeline-live-and-unstarted]] memory). Confirmed no collision: the
> 0496 "Epic A on Opus" lane only ever landed A0.5; A0/A2 exist nowhere.

## One task for 0498

**Land Epic A slices A0 → A2-v1 → A1 (storyboard MVP)** — the smallest-shippable spine of the Lineage
Journey: a hand-authored `LineageStoryScene` migration + read-model projection (A0), a `motion/react`
`useScroll` v1 scene scaffold over the existing ancestry walk (A2-v1), and a lean storyboard CRUD to
author scenes (A1). Everything else in the A0–A9 ladder (red-wipe, finale, self-hosted video,
conditional bridge, Lenis/GSAP) is fast-follow.

## Why now

Operator-ruled sequence is **C → A → B**; Epic C shipped (0495), A0.5 shipped (0496) — A0/A2/A1 is the
next contiguous slice. It turns the live ancestry timeline into the cinematic scroll story that is the
whole point of Epic A.

## Inputs (already read / must be current at bow-in)

- `getLineageAncestryForPassport` (`ancestry.ts`) — the PUBLIC-only up-walk, `L+3` query budget,
  deterministic primary-instructor pick. **The scenes consume this unchanged.**
- `LineageAncestryTimeline` — the SSR-visible-pre-hydration idiom (`whileInView` keyframes, not
  `initial`; reduced-motion fallback). Epic A **layers a scroll mode onto this**, enhance-not-replace.
- `lineageNodeRowPayload` / `payloads.ts` — the projection seam to extend.
- **Verified:** `LineageStoryScene` absent from schema + code → A0 is a true new migration.
  `LineageNode` PK = `cuid(2)`; `passportId` = `@unique` NOT NULL. Latest migration precedent =
  `20260703000000_add_rank_secondary_color` (hand-authored timestamp-dir pattern).

## A0 — Data model (proposed, for the grill)

**Recommendation: a dedicated 1:1 `LineageStoryScene` table** (keeps `LineageNode`/`Passport` lean).
Open sub-fork: **key by `passportId` (rec — identity SoT, ADR 0025; survives node re-parenting) or
`nodeId` (walk-native, cheaper join)?** This sets the FK for the life of the feature — grill it.

```prisma
model LineageStoryScene {
  id               String   @id @default(cuid(2))
  passportId       String   @unique          // 1:1 identity key (rec) — or nodeId
  quote            String?
  quoteAttribution String?                    // default = displayName at render
  storyBio         String?
  heroImageUrl     String?                    // cinematic large-frame
  heroVideoUrl     String?                    // A5 (self-hosted clip)
  posterUrl        String?                    // video poster / Rorion frame
  sceneOrder       Int?                        // storyboard ordering
  isBridge         Boolean  @default(false)   // Bob / dirty-dozen bridge
  bridgeCondition  String?                     // A6 conditional-render key
  enabled          Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  passport         Passport @relation(fields: [passportId], references: [id], onDelete: Cascade)
}
```

**Read-model projection:** extend `LineageAncestryEntry` with an optional `story?: LineageStorySceneView`
— batch-fetch the scene rows alongside the existing chain `findMany`, keyed by the same passportIds →
**no new N+1**, stays within the `L+3` budget. Scenes are additive to the existing founder chain.

**Migration (hand-authored — NEVER `migrate dev`; worktrees share one local DB → auto-reset landmine):**

1. Hand-edit `schema.prisma` (add model + `Passport` back-relation).
2. `prisma migrate diff --from-schema-datasource --to-schema-datamodel --script` → author the SQL.
3. Create `apps/web/prisma/migrations/2026NNNNNNNNNN_add_lineage_story_scene/migration.sql`.
4. Shadow-replay to validate (`migrate diff` against a shadow, not the shared local DB).
5. `prisma generate`. Apply via `migrate deploy` (additive, no divergent lane live — safe per
   [[parallel-session-shared-db-migrate-dev-reset-trap]]).

**Seed:** founders only this session (Carlos Sr / Carlos Jr / **Rorion** / Rigan) with placeholder
`quote`/`quoteAttribution`. Rorion + bridge quotes are TBD (fork #4).

## A2 — Scroll scaffold (v1) + the bake-off ladder

- **v1 = `motion/react` `useScroll`** — no new dep; SSR-safe; reduced-motion idiom already proven.
  A scroll mode **layers onto** the existing timeline; reduced-motion / no-JS / pre-hydration **falls
  back to today's stagger**, unchanged. Enhance-not-replace.
- **Consumes the walk unchanged:** `[founder … member]` → each entry is a scene. Per-scene motion:
  image starts **large** → shrinks + slides to **top-left** to become the timeline node, driven by
  `useScroll` progress. Red-wipe / bridge / video are A3–A6, not this session.
- **v1 must PROVE before escalating to v2 Lenis / v3 GSAP:** (a) SSR ships the chain visible
  pre-hydration with zero layout shift; (b) reduced-motion falls back cleanly; (c) 60fps on mobile
  Safari for a 5-scene chain; (d) scroll progress maps deterministically, no scroll-hijack complaints.
  Only if v1 can't hit smooth momentum do we add the Lenis dep (v2). **GSAP (v3) is never pre-committed.**

## A1 — Storyboard CRUD (scope)

- **Seed-first, then a lean admin surface.** 0498 MVP = seed founders + a compact scene-card board in
  `/app`: per-scene field set (image/video URL, quote, bio, order), a **plus-button** to add, and
  **duplicate-card**. Drag-to-reorder + media **drop** upload = fast-follow (fork #2). Mutations wire
  through **`can()`** — reuse the existing `/app` lineage-editor permission seam (no 5th authz system).
- Real slice, not a form. If the session budget is tight, A1 slips behind A2-v1 (the scaffold reads
  seeded scenes with or without the CRUD).

## Open forks to grill at 0498 bow-in (resolve BEFORE Cody builds)

1. **Story-table key** — `passportId` (rec, identity-SoT) vs `nodeId` (walk-native, cheaper join). *Permanent FK.*
2. **Storyboard CRUD depth for 0498** — MVP card-board + plus + duplicate now, drag-reorder + media-drop fast-follow (rec)? Or full board this session?
3. **A1 vs A2 order** — CRUD before the scaffold (author-then-render) or after (scaffold reads seeded scenes)? Rec: **A0 → A2-v1 → A1** (prove the spine on seeded data first).
4. **Founder quotes source** — ship curated placeholders unverified-flagged, or hold scenes until source-verified? **Rorion + bridge quotes are genuinely TBD** (operator-supplied or defer those scenes).
5. **Bake-off gate** — confirm v1 ships and is **evaluated** before any Lenis/GSAP dep. Rec: hard gate.
6. **Bridge scope** — dirty-dozen / Bob bridge (A6) explicitly **out of 0498** (needs conditional-walk logic + Rorion poster + roster confirmation from `prod-live-dirty-dozen.jpeg`)? Rec: yes — end at the universal prologue scaffold.

## Slicing (smallest-shippable-first)

| Order | Slice | Ships | Loop |
| --- | --- | --- | --- |
| 1 | **A0** data model | `LineageStoryScene` migration (hand-authored + shadow-replay) + `LineageAncestryEntry.story` projection + founder seed | Desi→Cody→Giddy ≥9.5 |
| 2 | **A2-v1** scroll scaffold | `useScroll` scene mode layered on the timeline; reduced-motion = today's stagger; SSR-visible | Desi (live SSR)→Cody→Giddy ≥9.5 |
| 3 | **A1** storyboard MVP | `/app` scene-card board + plus + duplicate; `can()`-gated | Desi→Cody→Giddy ≥9.5 |
| — | **Doug** | verify ONCE at ≥9.5 or 3 passes: gates + migration rehearsal + live UAT | end only |

Push gate is the operator's — build, verify, show, hold for "go."

## Done means

- `LineageStoryScene` in `schema.prisma` + committed hand-authored migration SQL + clean `prisma generate`; founders seeded.
- `LineageAncestryEntry` carries `story` with **no N+1** (within `L+3`); privacy invariants untouched (the `queries.visibility.test.ts` allowlist family still green).
- `/directory/[slug]` renders a **scroll-driven** scene sequence (v1) that **falls back to today's stagger** under reduced-motion / no-JS.
- (If A1 lands) a working `can()`-gated scene-card board in `/app`.
- Doug-verified ≥9.5; staged commit held at the operator's push gate.

## Standing alternative (if the operator repoints)

**FI-001 — Brian Truelson first-tester onboarding + thank-you email (P0).** Fully specified in
`petey-plan-0419` §Task 1 + `petey-plan-0457` §Slice A2 (`--verify` passes; operator-gated send). A
small, disjoint scripts-lane task — a clean pivot if the operator wants the P0 landed first.

## Follow-ups flagged (do NOT block A0/A2-v1/A1)

- **Rorion Gracie portrait** — ffmpeg poster-frame from the April-10 clip (needed for A5/A6).
- **Rorion + bridge quotes** — operator-supplied.
- **Dirty-dozen roster** — confirm from `prod-live-dirty-dozen.jpeg` (repo root, untracked) before A6.

## Also queued (operator, SESSION_0497): apparatus lean-out

Separate lane, **after** Epic A (operator pick): a focused "repo lean-out" session — `/consolidate-memory`
(the MEMORY index is settling; 0497 compacted it 20.3→18.9 KB as a stopgap), a CLAUDE.md diet, and a
superseded-docs prune. **Scope = process/knowledge apparatus only; the multi-product platform
architecture stands** (ADR 0034/0040). Run it fresh, not at the tail of a long build session.
