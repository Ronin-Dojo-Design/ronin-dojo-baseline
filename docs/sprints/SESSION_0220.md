---
title: "SESSION 0220 — @primoui/utils → @dirstack/utils full migration"
slug: session-0220
type: session--implement
status: closed-full
created: 2026-05-22
updated: 2026-05-22
last_agent: copilot-session-0220
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0219.md
  - docs/sprints/petey-plan-0084.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0220 — @primoui/utils → @dirstack/utils full migration

## Date

2026-05-22

## Operator

Brian + copilot-session-0220 (Petey orchestration, Cody execution, Doug validation)

## Goal

Execute the full `@primoui/utils` → `@dirstack/utils` migration across all 102 import sites in `apps/web`, remove the legacy dependency, and pass all verification gates.

## Bow-in notes

- **Previous session:** SESSION_0219 produced petey-plan-0084 with 4-wave migration plan.
- **Branch:** `main` (clean after PR 40 fast-forward pull).
- **Graphify:** rebuilt/current (6921 nodes / 11415 edges / 855 communities / 1297 files).

## What landed

### Wave 0 — Preflight and contract check (Petey + Giddy)

- Confirmed full export parity between `@primoui/utils` and `@dirstack/utils`.
- All 24 unique named imports (functions + `WithRequired` type) verified present in `@dirstack/utils`.
- Decision: pure mechanical find-and-replace is safe — no call-site adaptations needed.

### Wave 1–3 — Server/lib + Admin UI + Public UI (Cody)

- Replaced `@primoui/utils` → `@dirstack/utils` across 102 files in one pass (confirmed export parity made wave splitting unnecessary for safety).
- Biome auto-fixed 16 import-order issues from the alphabetical resorting.

### Wave 4 — Cleanup and closure (Doug)

- Removed `"@primoui/utils": "^1.3.4"` from `apps/web/package.json`.
- Verified zero remaining `@primoui/utils` references in source.

### Verification gates

| Gate | Result |
| --- | --- |
| Typecheck (`tsc --noEmit`) | ✅ pass |
| Lint (`biome check`) | ✅ pass (16 auto-fixed) |
| Tests (244 tests / 51 files) | ✅ 244/244 pass, 0 fail |
| Build (`next build`) | ✅ pass |

## Files touched

- 102 files: `@primoui/utils` → `@dirstack/utils` import replacement (server, admin, web, components, lib, emails, config surfaces)
- `apps/web/package.json`: removed `@primoui/utils` dependency

## Decisions resolved

- **Single-session vs multi-session execution:** Single session — export parity made wave splitting unnecessary.
- **Compatibility shim:** Not needed — full export parity confirmed.

## Open decisions / blockers

- None. Migration complete.

## Reflections

The petey-plan-0084 4-wave structure was sound for risk management, but Wave 0's export parity confirmation made the actual execution trivially safe as a single batch `sed` replace. The 16 biome import-order fixes were the only friction. This validates the "preflight contract check before mechanical migration" pattern for future utility package swaps.

## Hostile close review (Doug)

- **Scope creep check:** No unrelated changes. Every file touch is the mechanical import swap or the dependency removal.
- **Regression risk:** All 4 gates green. No behavioral changes — same functions, same signatures, different package path.
- **Drift check:** D-007 (`package.json` identity rename) is the only remaining drift item; this session reduces it by removing one legacy package reference.

## Full close evidence

| Evidence | Proof |
| --- | --- |
| Zero `@primoui/utils` imports | `grep -r "@primoui/utils" --include="*.ts" --include="*.tsx" -l \| wc -l` → 0 |
| `@primoui/utils` removed from package.json | Line no longer present in `apps/web/package.json` |
| Typecheck green | `pnpm --filter dirstarter typecheck` → pass |
| Lint green | `bun biome check .` → 979 files checked, 0 errors |
| Tests green | `bun test` → 244/244 pass |
| Build green | `pnpm --filter dirstarter build` → success |

## ADR / ubiquitous-language check

- No new ADR needed — this is execution of existing architectural direction (upstream `@dirstack/utils` adoption).
- Ubiquitous language: `@primoui/utils` should no longer appear in any developer documentation going forward.

## Next session

### Priority 1 — Housekeeping: close D-006 + D-007

- **Goal:** Resolve the last two deferred drift entries. D-006: install `packages/api-client` in workspace (or remove if unused). D-007: rename `"name": "dirstarter"` in `apps/web/package.json` to Ronin identity (e.g. `@ronin-dojo/web`).
- **Why now:** L1 upstream alignment lane is otherwise fully closed. These are the only two deferred drifts remaining. Quick wins before shifting to L2 feature work.
- **Done means:** Both drift register entries updated to `resolved`. Typecheck/lint/build green.

### Priority 2 — L2 Content Engine: DB Posts from ContentAtom pipeline

- **Goal:** Execute SESSION_0196 plan — render public blog posts from `ContentVariant` (channel=BLOG) instead of MDX. Prove one database post from one atom for one brand.
- **Why now:** L1 alignment complete. Content engine is the next MVP deliverable for Baseline launch. Schema already has `ContentAtom`, `ContentVariant`, `ContentTask`, `ContentPublication`.
- **Done means:** Public post route renders from `ContentVariant`. Brand scoping enforced. Draft variants invisible. Tests pass.

### Priority 3 — Remaining L2 lanes per program plan

- S1 schema rev completion (plan-vs-current gap closure)
- Stripe/payments wiring (S10 per program plan)
- Tournament/registration flows
- Directory/public listing

### Inputs to read

- `docs/sprints/SESSION_0220.md`
- `docs/sprints/SESSION_0196_content_atoms_db_posts.md` — content atoms DB posts plan (plan-ready)
- `docs/knowledge/wiki/drift-register.md` — D-006, D-007 deferred entries
- `docs/knowledge/wiki/dirstarter-gap-audit.md` — upstream alignment status
- `docs/architecture/program-plan.md` — 12-sprint MVP plan
- `docs/architecture/plan-vs-current.md` — schema gap analysis
- `docs/architecture/s1-schema-design.md` — S1 schema design (31 models)

### First task

Resolve D-006 and D-007 (two small drift items), then bow into SESSION_0196 content atoms pipeline.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0220_TASK_01 | done | Wave 0: export parity contract check |
| SESSION_0220_TASK_02 | done | Waves 1-3: 102-file import migration |
| SESSION_0220_TASK_03 | done | Wave 4: dependency removal + verification gates |
