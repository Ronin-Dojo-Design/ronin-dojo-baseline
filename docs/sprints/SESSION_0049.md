---
title: "SESSION 0049 — Match Scoring + Bracket Advancement"
slug: session-0049
type: session
status: closed-quick
created: 2026-05-04
updated: 2026-05-04
last_agent: copilot-session-0049
sprint: S2
pairs_with:
  - docs/sprints/SESSION_0048.md
backlinks:
  - docs/knowledge/wiki/index.md
---

## SESSION 0049 — Match Scoring + Bracket Advancement

### Date

2026-05-04

### Operator

Brian Scott + Copilot (Petey)

### Status

closed-quick

### Goal

Design the match scoring flow and automatic winner advancement through single-elimination brackets.

### Petey plan

#### TASK_01 — Score match Zod schema
- **Agent:** Cody
- **What:** Create `scoreMatchSchema` in `server/admin/tournaments/schema.ts`
- **Steps:**
  1. Fields: `matchId` (string), `winnerEntryId` (string), `result` (MatchResult enum value), optional `scoreData` (object — e.g. `{ competitor1Points, competitor2Points }`), optional `notes` (string)
  2. Validate `result` against the `MatchResult` enum values
- **Done means:** Schema exported and importable
- **Depends on:** nothing

#### TASK_02 — Score match server action
- **Agent:** Cody
- **What:** Create `scoreMatch` server action that records the result and advances the winner
- **Steps:**
  1. Validate match exists, status is `SCHEDULED` or `IN_PROGRESS`, and `winnerEntryId` is a competitor in the match
  2. Update the Match: set `status: COMPLETED`, `result`, `winnerEntryId`, `scoreData`, `notes`, `endedAt: now()`
  3. **Advancement logic:** Find the next-round match this winner feeds into:
     - Next round = `match.roundNumber + 1`
     - Next match number within round = `ceil(matchNumber_within_round / 2)` (pair matches feed into one)
     - Determine slot: if the completed match was an odd-numbered match in its round → slot 1; even → slot 2
     - Create a `MatchCompetitor` for the winner in the next-round match with the correct slot
  4. If the completed match is the final (last round), no advancement — the bracket champion is determined
  5. Wrap in a transaction
- **Done means:** Scoring a match updates its status and seeds the winner into the next round's match
- **Depends on:** TASK_01

#### TASK_03 — Auto-advance BYE winners
- **Agent:** Cody
- **What:** After bracket generation, auto-advance competitors who received a BYE into round 2
- **Steps:**
  1. In `generateBracket` action (or as a post-generation step), find all round-1 matches with status `BYE`
  2. For each BYE match, the single competitor (slot 1) is the winner
  3. Use the same advancement logic from TASK_02 to place them into round 2
  4. Mark BYE matches with `winnerEntryId` set to the solo competitor's entry ID
- **Done means:** After bracket generation, BYE winners appear in their round-2 match slots
- **Depends on:** TASK_02

#### TASK_04 — Admin UI: Score match form
- **Agent:** Cody
- **What:** Add scoring UI to admin bracket/match view
- **Steps:**
  1. Create a match scoring dialog/form with: winner selector (radio for each competitor), result type dropdown, optional score fields, optional notes
  2. Wire to `scoreMatch` action
  3. Show success feedback, refresh bracket state
  4. Disable scoring for already-completed or BYE matches
- **Done means:** Admin can score a match from the UI and see the winner advance
- **Depends on:** TASK_02

#### TASK_05 — Admin UI: Bracket viewer (read-only tree)
- **Agent:** Cody
- **What:** Simple bracket visualization showing rounds, matches, and competitors
- **Steps:**
  1. Query bracket with all matches + competitors (include registration entry → passport name)
  2. Render as a round-by-round column layout (round 1 left → final right)
  3. Highlight completed matches, show winner, show BYE labels
  4. No drag-and-drop or editing — just a read-only view for now
- **Done means:** Admin can see the bracket tree with match results
- **Depends on:** TASK_03, TASK_04

#### TASK_06 — Type-check
- **Agent:** Cody
- **What:** Run `tsc --noEmit` to verify no type errors
- **Done means:** Clean type-check
- **Depends on:** TASK_01–05

### Parallelism

TASK_01 is independent. TASK_02 depends on TASK_01. TASK_03 depends on TASK_02. TASK_04 depends on TASK_02. TASK_03 and TASK_04 are parallel. TASK_05 depends on TASK_03 + TASK_04. TASK_06 is final gate.

### Agent assignments

| Task | Agent | Rationale |
|---|---|---|
| TASK_01 | Cody | Schema definition |
| TASK_02 | Cody | Core scoring + advancement logic |
| TASK_03 | Cody | BYE advancement fix from SESSION_0048 |
| TASK_04 | Cody | UI integration |
| TASK_05 | Cody | Bracket visualization |
| TASK_06 | Cody | Validation |

### Open decisions

- **Score data structure**: Suggest `{ competitor1Points: number, competitor2Points: number }` as a minimal JSON shape — confirm or extend?
- **Match status transitions**: `SCHEDULED → IN_PROGRESS → COMPLETED` vs allowing direct `SCHEDULED → COMPLETED` for quick scoring — recommend allowing both
- **Bracket viewer complexity**: Minimal column layout for now; interactive bracket (drag, reorder, print) deferred

### Context

- Match model: `apps/web/prisma/schema.prisma` line 2376
- MatchCompetitor model: line 2401
- Match has `winnerEntryId`, `result` (MatchResult), `scoreData` (Json), `notes`
- Bracket generation action: `server/admin/tournaments/actions.ts` (generateBracket)
- Match unique constraint: `@@unique([bracketId, roundNumber, matchNumber])` — use this to find next-round match
- MatchCompetitor unique: `@@unique([matchId, slot])` — slot 1 or 2

### What landed

- **Score data schemas**: Two scoring systems — `POINTS` (simple competitor1/competitor2 points for Karate, TKD, Fencing) and `TEN_POINT_MUST` (round-by-round scoring with per-round deductions for knockdowns/disarms and fouls, supporting Boxing, Muay Thai, MMA, Eskrima/WEKAF). Discriminated union via `scoreDataSchema`.
- **Score match schema**: `scoreMatchSchema` Zod schema — matchId, winnerEntryId, result (MatchResult enum), optional scoreData (union type), optional notes.
- **Score match action**: `scoreMatch` server action — validates match status + winner, updates match to COMPLETED with result/score, auto-advances winner to next round via `advanceWinner` helper.
- **BYE auto-advancement**: `generateBracket` now auto-advances BYE winners into round 2 after bracket creation. BYE matches get `winnerEntryId` set.
- **Bracket viewer**: `BracketViewer` component renders round-by-round columns with match cards showing competitors, status, results, and BYE labels. Completed matches highlighted green, BYEs amber.
- **Score match form**: Inline scoring form on each scoreable match — winner radio selector, result type dropdown, optional notes. Wired to `scoreMatch` action with toast feedback.
- **Bracket detail page**: `/admin/tournaments/[id]/brackets/[bracketId]` — fetches bracket with all matches/competitors and renders `BracketViewer`.
- **Division bracket linking**: `findTournamentById` now includes bracket IDs. Divisions editor shows "View" button for existing brackets and navigates to bracket page after generation.
- **Type-check**: Clean (only pre-existing `TagInclude` stack depth error).

### Files touched

- `apps/web/server/admin/tournaments/schema.ts` — Added `pointsScoreDataSchema`, `tenPointMustScoreDataSchema`, `scoreDataSchema` (discriminated union), `scoreMatchSchema`
- `apps/web/server/admin/tournaments/actions.ts` — Added `advanceWinner` helper, `scoreMatch` action, BYE auto-advancement in `generateBracket`
- `apps/web/server/admin/tournaments/bracket-queries.ts` — Created: `findBracketsByDivisionId` query + types
- `apps/web/server/admin/tournaments/queries.ts` — Added brackets include to `findTournamentById`
- `apps/web/app/admin/tournaments/_components/bracket-viewer.tsx` — Created: `BracketViewer`, `MatchCard`, `ScoreMatchForm` components
- `apps/web/app/admin/tournaments/[id]/brackets/[bracketId]/page.tsx` — Created: bracket detail admin page
- `apps/web/app/admin/tournaments/_components/divisions-editor.tsx` — Added "View" bracket button, navigate to bracket on generation
- `docs/sprints/SESSION_0049.md` — Updated with completion

### Decisions resolved

- **Score data structure**: Dual-system — `POINTS` for point-based disciplines (Karate, TKD, Fencing) and `TEN_POINT_MUST` for Boxing/MT/MMA/Eskrima with per-round knockdown/disarm tracking and deduction fields
- **Match status transitions**: Allow both `SCHEDULED → COMPLETED` and `SCHEDULED → IN_PROGRESS → COMPLETED`
- **BYE advancement**: Auto-advances during bracket generation (resolved from SESSION_0048)
- **Bracket viewer**: Minimal round-by-round column layout, scoring inline

### Open decisions / blockers

- **3-knockdown/3-disarm TKO rule**: Schema supports tracking totals, but automatic TKO detection not yet implemented — future session
- **Detailed round-by-round scoring UI**: Current form uses simple winner + result type; full round-by-round 10-point must input form deferred
- **Bracket print/export**: Not yet implemented
- `TagInclude` stack depth error persists (upstream, low priority)

### Next session

**Goal**: Detailed round-by-round scoring UI for 10-point must system + automatic TKO detection (3 knockdowns/disarms)
**Inputs**: `tenPointMustScoreDataSchema`, `scoreMatch` action, `BracketViewer` component
**First task**: Build round-by-round scoring form component for 10-point must disciplines
