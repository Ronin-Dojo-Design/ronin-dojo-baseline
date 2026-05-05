---
title: "SESSION 0048 — Bracket/Match Generation + F-03 Brand Scoping"
slug: session-0048
type: session
status: closed-unclean
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0048
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0047.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0048 — Bracket/Match Generation + F-03 Brand Scoping

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey → Cody)

### Status

closed-quick

### Goal

1. Build single-elimination bracket generation for tournament divisions
2. Remediate F-03: add brand scoping to admin registrations query

### Petey plan

#### TASK_01 — F-03 Remediation: Brand-scope admin registrations query
- **Agent:** Cody
- **What:** Add brand filtering to `findRegistrationsByTournamentId` so admins only see registrations for tournaments belonging to their brand
- **Steps:**
  1. Update `registrations-queries.ts` to accept `brand` param and filter `tournament.brand`
  2. Update the registrations page to pass brand from session/middleware
- **Done means:** Query includes `tournament: { brand }` filter
- **Depends on:** nothing

#### TASK_02 — Bracket generation Zod schema
- **Agent:** Cody
- **What:** Create `generateBracketSchema` in `server/admin/tournaments/schema.ts`
- **Steps:**
  1. Add Zod schema: `divisionId` (string), optional `bracketName` (string)
- **Done means:** Schema exported and importable
- **Depends on:** nothing

#### TASK_03 — Bracket generation server action
- **Agent:** Cody
- **What:** Create `generateBracket` server action that builds single-elimination bracket + matches for a division
- **Steps:**
  1. Fetch approved registrationEntries for the division
  2. Calculate rounds (ceil log2 of competitor count)
  3. Create Bracket record
  4. Create Match records for each round/matchNumber
  5. Create MatchCompetitor records seeding competitors into round 1
  6. Handle byes (odd competitor count → advance to next round)
- **Done means:** Action creates Bracket, Matches, MatchCompetitors in DB
- **Depends on:** TASK_02

#### TASK_04 — Admin UI: Generate Bracket button on division detail
- **Agent:** Cody
- **What:** Add "Generate Bracket" button to admin tournament division view
- **Steps:**
  1. Add button that calls `generateBracket` action
  2. Show success/error feedback
  3. Display generated bracket summary (round count, match count)
- **Done means:** Admin can trigger bracket generation from UI
- **Depends on:** TASK_03

#### TASK_05 — Type-check
- **Agent:** Cody
- **What:** Run `tsc --noEmit` to verify no type errors
- **Done means:** Clean type-check
- **Depends on:** TASK_01–04

### Parallelism

TASK_01 and TASK_02 are independent → parallel. TASK_03 depends on TASK_02. TASK_04 depends on TASK_03. TASK_05 is final gate.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Clear fix, no decisions |
| TASK_02 | Cody | Schema definition |
| TASK_03 | Cody | Core logic implementation |
| TASK_04 | Cody | UI integration |
| TASK_05 | Cody | Validation |

### Open decisions

- Seeding strategy: default to registration order (no ranking system yet)
- Only single elimination for now; double elim / round robin deferred to later sprint

### Context

- Bracket model: `apps/web/prisma/schema.prisma` line 2360
- Match model: line 2376, MatchCompetitor: line 2401
- MatchStatus enum: SCHEDULED, IN_PROGRESS, COMPLETED, NO_CONTEST, BYE
- MatchResult enum: WIN_POINTS, WIN_SUBMISSION, WIN_KO_TKO, etc.
- Admin registrations query: `server/admin/tournaments/registrations-queries.ts`

### What landed

- **F-03 Remediation**: Admin registrations query now accepts optional `brand` param, filtering via `tournament.brand`. Registrations page passes `getRequestBrand()` — brand scoping enforced.
- **Bracket generation schema**: `generateBracketSchema` Zod schema added (`divisionId`, optional `bracketName`)
- **Bracket generation action**: `generateBracket` server action creates single-elimination bracket structure — Bracket, Match (per round), MatchCompetitor (seeded by registration order). Handles byes, validates min 2 competitors, prevents duplicate brackets.
- **Admin bracket UI**: "Bracket" button added to each division row in `divisions-editor.tsx`. Shows success toast with competitor count, rounds, and bye count.

### Files touched

- `apps/web/server/admin/tournaments/registrations-queries.ts` — Added brand param + tournament.brand filter
- `apps/web/app/admin/tournaments/[id]/registrations/page.tsx` — Import getRequestBrand, pass brand to query
- `apps/web/server/admin/tournaments/schema.ts` — Added generateBracketSchema
- `apps/web/server/admin/tournaments/actions.ts` — Added generateBracket action (single-elim bracket generation)
- `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` — Added "Bracket" button + handleGenerateBracket

### Decisions resolved

- **Seeding strategy**: Registration order (createdAt asc) as default seeding — no ranking system yet
- **Bracket type**: Single elimination only for now; double elim / round robin deferred
- **BYE handling**: Matches with no slot-2 competitor marked as status BYE
- **F-03**: Resolved — brand scoping added to admin registrations query

### Open decisions / blockers

- **Pre-existing**: `TagInclude` excessive stack depth error in `admin/tags/queries.ts` — upstream Dirstarter, low priority
- **Bracket advancement**: Winner progression from BYE matches to next round not yet automated (SESSION_0049 scope)
- **Bracket visualization**: No UI to view bracket tree yet — future session

### Next session

**Goal**: Match scoring + bracket advancement (SESSION_0049)
**Inputs**: Match/MatchCompetitor models, bracket generation code from this session
**First task**: Petey plan for scoring flow + winner advancement logic
