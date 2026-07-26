---
title: "SESSION 0221 — Close D-006 + D-007 drift entries"
slug: session-0221
type: session--implement
status: closed-full
created: 2026-05-22
updated: 2026-05-22
last_agent: copilot-session-0221
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0220.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0221 — Close D-006 + D-007 drift entries

## Date

2026-05-22

## Operator

Brian + copilot-session-0221 (Petey orchestration, Cody execution)

## Goal

Resolve the last two deferred drift register entries (D-006, D-007) to fully close the L1 upstream alignment lane.

## Bow-in notes

- **Previous session:** SESSION_0220 completed `@primoui/utils` → `@dirstack/utils` migration.
- **Branch:** `main` (clean).
- **Drift register:** D-006 and D-007 were the only two `deferred` entries remaining.

## What landed

### D-006 — `packages/api-client` not installed in workspace

- Verified `@ronin-dojo/api-client@0.0.1` already installs correctly in the pnpm workspace.
- Zero consumers in `apps/web/`. Kept for future use per SESSION_0060 decision.
- Status updated to `resolved`.

### D-007 — Dirstarter package identity vs Ronin identity

- Renamed `"name": "dirstarter"` → `"@ronin-dojo/web"` in `apps/web/package.json`.
- Updated `vercel.json` build command: `pnpm --filter dirstarter build` → `pnpm --filter @ronin-dojo/web build`.
- Updated `.claude/hooks/biome-unsafe-nudge.sh` filter reference.
- `pnpm install` lockfile updated cleanly.
- Status updated to `resolved`.

### Verification gates

| Gate | Result |
| --- | --- |
| Typecheck (`pnpm --filter @ronin-dojo/web typecheck`) | ✅ pass |
| Lint (`bun biome check .`) | ✅ pass (979 files, 0 errors) |
| Build (`pnpm --filter @ronin-dojo/web build`) | ✅ pass |

## Files touched

- `apps/web/package.json` — renamed `"name"` to `@ronin-dojo/web`
- `vercel.json` — updated `--filter` to `@ronin-dojo/web`
- `.claude/hooks/biome-unsafe-nudge.sh` — updated `--filter` to `@ronin-dojo/web`
- `docs/knowledge/wiki/drift-register.md` — D-006 and D-007 marked `resolved`, frontmatter updated

## Decisions resolved

- **D-006:** `packages/api-client` installs correctly, zero consumers, kept for future use. Resolved.
- **D-007:** Package identity renamed to `@ronin-dojo/web`. All downstream references (`vercel.json`, hooks) updated. Resolved.

## Open decisions / blockers

- None. L1 upstream alignment lane is fully closed — zero deferred drift entries remain.

## Reflections

Quick session. Both drift items were straightforward. D-006 was already effectively resolved in SESSION_0060 — just needed the register entry updated. D-007 required a 3-file rename with downstream reference updates. The `pnpm --filter` syntax works with scoped package names, confirmed by typecheck + build gates.

## Hostile close review (Doug)

- **Scope creep check:** No unrelated changes. Every file touch is the identity rename or drift register update.
- **Regression risk:** All 3 gates green. `vercel.json` build command tested via `pnpm --filter @ronin-dojo/web build` — confirmed it resolves correctly.
- **Drift check:** Zero deferred entries remain in drift register. L1 alignment lane closed.

## Full close evidence

| Evidence | Proof |
| --- | --- |
| D-006 resolved in drift register | `drift-register.md` D-006 status: `resolved` |
| D-007 resolved in drift register | `drift-register.md` D-007 status: `resolved` |
| Package renamed | `apps/web/package.json` name: `@ronin-dojo/web` |
| Vercel config updated | `vercel.json` filter: `@ronin-dojo/web` |
| Typecheck green | `pnpm --filter @ronin-dojo/web typecheck` → pass |
| Lint green | `bun biome check .` → 979 files, 0 errors |
| Build green | `pnpm --filter @ronin-dojo/web build` → pass |

## ADR / ubiquitous-language check

- No new ADR needed — this is a transitional cleanup item.
- Ubiquitous language: `pnpm --filter dirstarter` should be replaced with `pnpm --filter @ronin-dojo/web` in any future session notes or runbooks.

## Next session

### Priority 1 — L2 Content Engine: DB Posts from ContentAtom pipeline

- **Goal:** Execute SESSION_0196 plan — render public blog posts from `ContentVariant` (channel=BLOG) instead of MDX. Prove one database post from one atom for one brand.
- **Why now:** L1 alignment complete. Content engine is the next MVP deliverable for Baseline launch.
- **Done means:** Public post route renders from `ContentVariant`. Brand scoping enforced. Draft variants invisible. Tests pass.

### Inputs to read

- `docs/sprints/SESSION_0221.md`
- `docs/sprints/SESSION_0196_content_atoms_db_posts.md`
- `docs/architecture/program-plan.md`
- `docs/architecture/plan-vs-current.md`

### First task

Bow in to SESSION_0196 content atoms pipeline — read the plan, identify first implementation task.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0221_TASK_01 | done | D-007: rename package identity to @ronin-dojo/web + update downstream refs |
| SESSION_0221_TASK_02 | done | D-006 + D-007: update drift register entries to resolved |
