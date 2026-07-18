---
title: "SESSION 0556 — G-013 Wave 2: graph tooltips (B1) + animated filter pill (C2)"
slug: session-0556
type: session--implement
status: in-progress
created: 2026-07-17
updated: 2026-07-17
last_agent: claude-session-0556
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0546.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0556 — G-013 Wave 2: graph tooltips (B1) + animated filter pill (C2)

## Date

2026-07-17

## Operator

Brian + claude-session-0556 (autonomous background lane)

## Goal

Continue G-013 with technique-experience Wave 2 first slice, per SESSION_0546 `Next session`: implement
B1 graph-node tooltips (~250ms delay, keyboard parity, no-media tooltip data contract by construction)
and C2 animated filter-chip pill (motion/react layoutId + useReducedMotion instant fallback) together,
then run the in-lane Desi design pass + Doug verification pass before C4/C5. Preserve graph beta posture
and the locked-media no-leak law.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0546.md` (Wave 1 landed + merged to main at `823d94e7`;
  its `Next session` block pins this exact slice). G-013 ledger row read (in-progress P1).
- Carryover: none blocking. Wave 2 items B1 + C2 are this session; C4/C5/D3/B2 stay queued.

### Branch and worktree

- Branch: `session-0556-g013-wave2`
- Worktree: `/Users/brianscott/dev/ronin-0556` (bootstrapped: canonical .env copied, `bun install`,
  `bunx prisma generate`)
- Status at bow-in: clean
- Current HEAD at bow-in: `09b042c9` (origin/main)

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Content (techniques graph surface); no media/monetization payload change |
| Extension or replacement | Extension: composes the L1 `Tooltip` primitive + shipped graph component |
| Why justified | Wave 2 of an in-flight operator-pinned epic on an existing surface |
| Risk if bypassed | Hand-rolled tooltip/pill = parallel primitives + no-leak regression risk |

Live docs checked during planning: existing in-repo seams (L1 tooltip.tsx, product-interval-switch pill
precedent, students-carousel reduced-motion layoutId convention) — no new L1 area entered.

### Graphify check

- Graph status: worktree reads 0 nodes (graph lives in canonical checkout — expected, not a negative).
  Navigation instead via SESSION_0546 recon + direct file reads; exact target files were named by the brief.
- Files opened: `technique-graph.tsx`, `graph-query.ts`, `graph-belt-level.ts` (+ test),
  `components/common/tooltip.tsx`, `product-interval-switch.tsx`, `verified-badge.tsx`.

## Petey plan

### Goal

Ship B1 tooltips + C2 filter pill as one reviewed slice with type-encoded no-media tooltip contract.

### Tasks

#### SESSION_0556_TASK_01 — Belt name plumbing (existing-column only)

- **Agent:** Cody (inline)
- **What:** `GraphBeltLevel` gains `name: string | null`; graph-query selects `Rank.name` on both rank
  paths; tests updated. No schema change; display-only.
- **Done means:** `bun test graph-belt-level.test.ts` green; typecheck green.
- **Depends on:** nothing

#### SESSION_0556_TASK_02 — B1 tooltip contract + component wiring

- **Agent:** Cody (inline)
- **What:** pure `buildGraphNodeTooltip` picker (whitelisted strings-only payload — no url/poster/media
  field can exist by type construction) + unit tests; graph nodes wrapped in L1 Tooltip (Provider
  delay≈250ms, keyboard focus opens, motion-reduce fallback).
- **Done means:** tooltip unit tests green; tooltips render on hover + focus in live browser check.
- **Depends on:** SESSION_0556_TASK_01

#### SESSION_0556_TASK_03 — C2 animated filter pill

- **Agent:** Cody (inline)
- **What:** filter chips become a segmented group with a shared `motion/react` `layoutId` pill
  (tween ~0.125s easeOut per product-interval-switch precedent); `useReducedMotion` drops the layoutId
  → instant swap (students-carousel convention). `aria-pressed` semantics kept.
- **Done means:** pill slides between chips; reduced-motion = instant; filters still filter.
- **Depends on:** nothing (same file as TASK_02 — sequential inline)

#### SESSION_0556_TASK_04 — In-lane review wave + fixes

- **Agent:** Desi (design pass) + Doug (verification, headless browser vs worktree `next dev`)
- **What:** epic-lane §5b in-lane wave after local commit; batched fixes; delta verify.
- **Done means:** Desi GO + Doug GO (or findings fixed + re-verified); gates green.
- **Depends on:** TASK_01–03 committed (commit-before-review — subagent stash clobber guard)

### Parallelism

All build tasks sequential inline (single component file). Review wave after commit; Desi + Doug parallel.

### Open decisions

None — forks were resolved in SESSION_0546 (F1–F5); this slice is fully specified.

### Risks

- Tooltip payload accidentally growing gated fields later → mitigated by type-encoded picker + whitelist test.
- Review subagents mutating the tree → mitigated: commit first; prompts forbid git mutations.

### Scope guard

- No push / PR / merge / deploy — hold at push gate (standing rule; brief explicit).
- FI-001 PARKED. No nav promotion, no Lenis, no schema migration, no C4/C5/D3/B2 scope creep.
- Canonical checkout + `../ronin-dojo-monorepo` untouched.

### Dirstarter implementation template

- **Docs read first:** in-repo canon (SESSION_0546, G-013 row, ADR 0046 context from 0546 close)
- **Baseline pattern to extend:** L1 `Tooltip` (Base UI), `motion/react` layoutId pill precedent
- **Custom delta:** graph-node tooltip contract module + segmented filter pill on the graph toolbar
- **No-bypass proof:** composes the existing L1 tooltip; no parallel tooltip/pill primitive introduced

## Cody pre-flight

### Pre-flight: B1 + C2 (single component slice)

#### 1. Existing component scan

- Found: L1 `components/common/tooltip.tsx` (Base UI Provider/Root/Trigger `render` composition —
  consumer precedent `verified-badge.tsx`); pill precedent `product-interval-switch.tsx`
  (`layoutId="indicator"`, tween 0.125 easeOut); reduced-motion layoutId-drop convention
  `students-carousel-v2.tsx`. No existing graph tooltip; no competing pill primitive.

#### 2. L1 template scan

- Tooltip API spot-checked from source: `TooltipProvider(delay)`, `Tooltip`, `TooltipTrigger(render)`,
  `TooltipContent(size sm|md|lg, side, align)` — portal + arrow + `data-instant:duration-0` built in.
- `motion/react` + `useReducedMotion` already repo-standard (10+ consumers).

#### 3. Composition decision

- Extend `TechniqueGraph`; compose L1 Tooltip + motion.span pill. ONE new pure module
  (`technique-graph-tooltip.ts`) — a data contract, not a UI primitive.

#### 4. Lane docs loaded

- SESSION_0546 `Next session` + locked waves + F1–F5 grill outcomes; G-013 ledger row; no-leak law
  (graph payload verified media-free at bow-in: `BjjTechniqueGraphNode` carries no url/poster field).

#### 5. Dev environment confirmed

- Worktree `apps/web`; dev via Bash `npx next dev --turbo` (Browser-pane preview can't serve worktrees);
  headless verification via own Playwright chromium script if needed.

#### 6. FAILED_STEPS check

- FS-0027: single-file `bun test <file>` only (no bare multi-file run; full suite is CI's).
- FS-0024: git ops from worktree only; remote verified `ronin-dojo-baseline`.
- No-leak (SESSION_0526/0529 class): tooltip contract is strings-only by type; gate files untouched.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0556_TASK_01 | pending | Belt name plumbing |
| SESSION_0556_TASK_02 | pending | B1 tooltip contract + wiring |
| SESSION_0556_TASK_03 | pending | C2 animated filter pill |
| SESSION_0556_TASK_04 | pending | Review wave + fixes |

## What landed

## Decisions resolved

## Files touched

| File | Change |
| --- | --- |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

## Next session

### Goal

### First task

## Review log

## Hostile close review

## ADR / ubiquitous-language check

## Reflections

## Full close evidence

| Step | Proof |
| --- | --- |
