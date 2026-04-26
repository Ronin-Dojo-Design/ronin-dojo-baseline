# SESSION_0004 — S1 schema rev: review design doc, write migration, update references

**Date:** 2026-04-26
**Operator:** Brian + Copilot (Petey → Cody)
**Goal:** Review `s1-schema-design.md` for correctness, rewrite `schema.prisma` with all 31 models + enums, run migration, update `authz.ts` + `middleware.ts`, verify with `prisma generate` + `tsc --noEmit`.
**Status:** in-progress

---

## Task breakdown (Petey plan)

### Phase 1 — Design doc review (Petey, sequential)

Read `s1-schema-design.md` top-to-bottom. Validate:
- All 31 model definitions match resolved Q1–Q8 + Gaps 1–6
- All FK cross-references are consistent (every `@relation` has a matching reverse)
- All enum usages are correct (no stale `MembershipRole` references)
- `@@unique` / `@@index` constraints are sensible

Flag issues before writing any code.

### Phase 2 — Schema rewrite (Cody, single task)

Rewrite `apps/web/prisma/schema.prisma`:
- Keep Dirstarter template models (User core shape, Session, Account, Verification, Tool, Category, Tag, Report, Ad) intact
- Replace all Ronin Dojo models with S1 design doc definitions
- Remove `MembershipRole` enum
- Add all new enums (17 new + 1 existing `CertificationType`)
- Add all new models (21 changes per summary list)

### Phase 3 — Migration (Cody, sequential after Phase 2)

1. `dropdb ronindojo_dev && createdb ronindojo_dev`
2. `bun db:migrate dev` (or `npx prisma migrate dev --name s1-schema-rev`)
3. `npx prisma generate`

### Phase 4 — Reference updates (Cody, can parallelize across files)

- `lib/authz.ts` — rename School→Organization, MembershipRole→Role table queries, Belt→Rank, canEditSchool→canEditOrganization, canAwardBelt→canAwardRank, canViewSchoolRoster→canViewOrgRoster
- `middleware.ts` — minimal (only has a comment referencing BBL)
- Any other files with stale model name imports

### Phase 5 — Verify (Cody, sequential)

- `npx prisma generate` (clean)
- `tsc --noEmit` (clean or only pre-existing errors)

### Phase 6 — Doc updates (Cody, parallel-safe)

- Update `data-model.md` to match new naming

---

## Persona assignments

| Phase | Persona | Notes |
|---|---|---|
| 1 | Petey | Review only, no code |
| 2–5 | Cody | Execute sequentially |
| 6 | Cody | Can run after Phase 5 |

No parallel worktrees needed — this is a single-branch, single-migration task. The phases are sequential because Phase 3 depends on Phase 2, Phase 4 depends on Phase 3 (generated client types), and Phase 5 validates everything.

---

## What landed

*(updated at close)*

## Files touched

*(updated at close)*

## Decisions resolved

*(updated at close)*

## Open decisions / blockers

*(updated at close)*

## Next session

*(updated at close)*
