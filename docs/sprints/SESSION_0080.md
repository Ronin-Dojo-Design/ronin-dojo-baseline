---
title: "SESSION 0080 — Manual seed editor UI"
slug: session-0080
type: session
status: in-progress
created: 2026-05-06
updated: 2026-05-06
last_agent: codex-session-0080
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0079.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0080 — Manual seed editor UI

### Date

2026-05-06

### Operator

Brian Scott + Codex (Cody)

### Status

in-progress

### Goal

Manual seed editor UI (drag-and-drop reorder of seed positions; wires to existing `manualSeeds` API in `generateBracket`).

### Context read

- ✅ `docs/rituals/opening.md`
- ✅ `docs/sprints/SESSION_0079.md` (Next session goal + inputs)
- ✅ `docs/protocols/WORKFLOW_5.0.md`
- ✅ `docs/architecture/program-plan.md` (layered architecture + brand sequencing)
- ✅ `docs/protocols/failed-steps-log.md` (noted FS-0001/FS-0008 pre-flight requirements)
- ✅ `docs/knowledge/wiki/drift-register.md` (no open drift affecting tournament ops seed editor)

### Repo baseline checks (pre-change)

- `pnpm -r typecheck` fails due to pre-existing `packages/api-client` TS2742 inference typing (not in tournament ops slice).
- `bunx biome check .` fails with many pre-existing diagnostics across `apps/web/` (run read-only; no fixes applied).
- `bun run scripts/wiki-lint.ts` passes with 3 orphan warnings.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming/UI primitives (admin dialog + form primitives) |
| Extension or replacement | Extension (new UI on top of existing tournament admin flows) |
| Why justified | Tournament ops UX gap before May 18; manual seeding is already supported by backend schema |
| Risk if bypassed | FS-0001 regression risk (raw HTML / scratch components) and inconsistent admin patterns |

### Task plan

- `SESSION_0080_TASK_01` — Implement manual seed editor UI (DnD reorder + persist)
- `SESSION_0080_TASK_02` — Verification + quick close (scoped typecheck + scoped biome check + wiki lint)

## What landed

- (pending)

## Files touched

- (pending)

## Decisions resolved

- (pending)

## Open decisions / blockers

- (pending)

## Next session

- **Goal:** (pending)
- **Inputs to read:** (pending)
- **First task:** (pending)

