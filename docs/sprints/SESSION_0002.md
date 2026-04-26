# SESSION_0002 — S1 schema rev design

**Date:** 2026-04-26
**Operator:** Brian + Claude
**Goal:** Produce a written S1 schema design for sign-off. No migration this session — design only.
**Status:** closed-quick

---

## Task

Petey produces the S1 schema design covering:

- `User` extension
- `Passport` (replacing `Profile`)
- `DirectoryProfile`
- `Organization` (replacing `School`) with `type` enum + `brand` column
- `Discipline` (replacing `Style`)
- `RankSystem` + `Rank` (replacing flat `Belt`)
- `MembershipStatus` enum
- `Membership` reshape with `disciplineId` + `status` + multi-role via `MembershipRoleAssignment`
- `Tournament` reshape with status + venue
- `TournamentDiscipline` / `Division` / `Registration` / `RegistrationEntry` with rank+org snapshot fields

Open questions surfaced before writing migration SQL.

## Inputs

- `docs/architecture/program-plan.md` — S1 row + open decisions
- `docs/architecture/plan-vs-current.md` — gap analysis
- `docs/architecture/decisions/0004-multi-brand-as-column.md` — confirms `brand` column stays
- `docs/architecture/source/chatgpt-original-plan.md` lines 130–401 — Passport/Org/Discipline/Rank/Tournament shapes
- `apps/web/prisma/schema.prisma` — current model
- `docs/sprints/SESSION_0001.md`

---

## What landed

- **S1 schema design doc written** at `docs/architecture/s1-schema-design.md` — full Prisma model definitions for all 12 changes in the S1 rev, with enums, indexes, relations, and design notes.
- **Legacy rank/curriculum data reviewed** from TuffBuffs monorepo: BJJ (15 levels), Eskrima (13 levels), Muay Thai (8 levels), Boxing (8 levels), Self Defense (8 levels). Extracted rank system seed data preview into the design doc.
- **BBL legacy data reviewed**: `beltInfoSchema.js` (promotion metadata → added `location` and `mediaUrls` to `RankAward`), `bblTiers.js` (subscription tier system → surfaced as Q7), `lineageSchemas.js` (lineage tree model → surfaced as Q8).
- **TuffBuffs services reviewed** (KISS filter): `promotionReadiness.js` (promotion requirements/attendance/XP tracking — behavioral, not schema), `rankApprovalService.js` (rank request approval flow — behavioral), `techniqueAdapter.js` / `techniquesService.js` (curriculum API layer — S6 concern).
- **8 open questions surfaced** for Brian's sign-off before migration.
- **Markdown lint errors fixed** in both `s1-schema-design.md` and `SESSION_0002.md`.

## Files touched

- `docs/architecture/s1-schema-design.md` — created (S1 schema design doc)
- `docs/sprints/SESSION_0002.md` — created + updated (this file)

## Decisions resolved

None formally — this session produced the design for sign-off. Decisions are pending Brian's review of Q1–Q8.

## Open decisions / blockers

8 open questions in `docs/architecture/s1-schema-design.md` awaiting sign-off:

- **Q1:** Rank relation on Membership — direct FK or derived from RankAward? (rec: direct FK)
- **Q2:** `Rank.stripes` column for BJJ? (rec: no, use name/shortName)
- **Q3:** MembershipRole as enum or table? (rec: enum for MVP)
- **Q4:** Judo/Kajukenbo in S1 or defer to S5 seed? (rec: defer)
- **Q5:** Division.roleRequired — MembershipRole or separate enum? (rec: MembershipRole)
- **Q6:** Course.rankId FK now or defer to S6? (rec: add now)
- **Q7:** Subscription tier model in S1? (rec: Option C lightweight model, or defer to S10)
- **Q8:** Lineage model in S1? (rec: defer)

**Still pending from user request:** WEKAF athlete admin files, live scoring hooks, and bracket/results schema implications were queued but not yet reviewed. These may surface additional tournament-result models (match results, bracket tracking, live scoring) for the design doc before sign-off.

## Next session — SESSION_0003

- **Goal:** Get sign-off on Q1–Q8, review WEKAF athlete/bracket/results data for any schema gaps, then write the actual `schema.prisma` migration.
- **Inputs to read:**
  - `docs/architecture/s1-schema-design.md` — the design doc (sign-off target)
  - `apps/web/prisma/schema.prisma` — current schema (rewrite target)
  - `lib/authz.ts` + `middleware.ts` — need rename passes after migration
  - WEKAF admin athletes folder if bracket/results schema is needed
  - This file
- **First task:** Brian reviews Q1–Q8 and signs off. Then Cody rewrites `schema.prisma`.

## Reflections

(filled at close)
