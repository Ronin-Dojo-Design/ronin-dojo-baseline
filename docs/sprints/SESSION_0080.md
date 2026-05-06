---
title: "SESSION 0080 — Manual seed editor UI"
slug: session-0080
type: session
status: closed-quick
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

closed-quick

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

### Pre-flight output (TASK_01)

#### Component inventory check

- No existing DnD / sortable / reorder component is listed in `docs/knowledge/wiki/dirstarter-component-inventory.md`.
- Will compose from existing primitives:
  - `Dialog*` (`apps/web/components/common/dialog.tsx`)
  - `Select*` (`apps/web/components/common/select.tsx`) (already used)
  - `Stack` (`apps/web/components/common/stack.tsx`) — `size`, `direction`, `wrap`, `asChild`
  - `Card` (`apps/web/components/common/card.tsx`) — `hover`, `focus`, `asChild`
  - `Button` (`apps/web/components/common/button.tsx`) — `variant`, `size`, `prefix`, `suffix`, `isPending`, `asChild`
  - `Badge` (`apps/web/components/common/badge.tsx`) — `variant`, `size`, `prefix`, `suffix`, `asChild`
  - `Note` (`apps/web/components/common/note.tsx`) — `as?: ElementType` (defaults to `p`)

#### Target files read

- UI entry: `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` (Generate Bracket dialog + seeding method select)
- Backend contract: `apps/web/server/admin/tournaments/schema.ts` (`generateBracketSchema.manualSeeds?: { entryId: string; seed: number }[]`)
- Backend implementation: `apps/web/server/admin/tournaments/actions.ts` (`generateBracket` uses `manualSeeds` → `manualSeedMap` → `seedEntries`)

#### Library decision

- Add `@dnd-kit/core` + `@dnd-kit/sortable` (+ `@dnd-kit/utilities`) for drag-and-drop reorder inside the manual seed editor dialog.

## What landed

- Manual seed editor UI for bracket generation (Seeding Method: `MANUAL`): loads approved entries for a division and supports drag-and-drop reorder; submits `manualSeeds` to `generateBracket`.
- New tournament-admin server action to load division entries for the seeding dialog (`listDivisionSeedEntries`).

## Files touched

- `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` — manual seed editor UI (DnD reorder + `manualSeeds` submit).
- `apps/web/server/admin/tournaments/actions.ts` — add `listDivisionSeedEntries` action.
- `apps/web/package.json` — add `@dnd-kit/*` dependencies.
- `apps/web/bun.lock` — lockfile updated for `@dnd-kit/*`.
- `docs/sprints/SESSION_0080.md` — session record.

## Decisions resolved

- Use `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` for the manual seed reorder UI.

## Open decisions / blockers

- Pre-existing `apps/web` typecheck failures prevent a clean full-slice compile signal (Zod resolver overload mismatch, Next config typing mismatch, Prisma category query stack-depth).
- Pre-existing Biome diagnostics across `apps/web/` (hundreds of errors) make full `bunx biome check .` non-actionable; verification is scoped to touched files.
- `bun run db:generate` requires `DATABASE_URL` + `SHADOW_DATABASE_URL` to be set in the environment.

## Next session

- **Goal:** Integration tests for registration capacity race conditions (tournament registration).
- **Inputs to read:** `apps/web/server/web/tournaments/register.ts`; `apps/web/server/admin/tournaments/schema.ts` (division capacity fields); any existing tournament test files.
- **First task:** Identify the concurrent capacity race path and add a deterministic test that proves we fail closed (no oversubscription) under parallel registration attempts.

## Task log

SESSION_0080_TASK_01, SESSION_0080_TASK_02

## Review log

SESSION_0080_REVIEW_01 — Self-review by Codex.

- Manual seeding UI uses existing primitives (Dialog/Stack/Card/Button/Badge/Note) and avoids new raw form primitives.
- `manualSeeds` payload shape matches `generateBracketSchema.manualSeeds` and `generateBracket` implementation.
- Scoped lint/format: `bunx biome check server/admin/tournaments/actions.ts app/admin/tournaments/_components/divisions-editor.tsx` passes.
- `bun run scripts/wiki-lint.ts` passes with 3 pre-existing orphan warnings.

## Hostile close review

- Dirstarter alignment: extended existing tournament admin dialog using known primitives; no scratch component patterns introduced.
- Data integrity: no Prisma changes; `manualSeeds` is an input-only seeding contract consumed server-side.
- Security/tenancy: `listDivisionSeedEntries` uses `tournamentAdminActionClient` (role-gated, brand-scoped action client).
- Verification honesty: full-app typecheck and full Biome check are blocked by pre-existing diagnostics; scoped checks were run and recorded.

## ADR / ubiquitous-language check

No ADRs needed. No new domain terms introduced.
