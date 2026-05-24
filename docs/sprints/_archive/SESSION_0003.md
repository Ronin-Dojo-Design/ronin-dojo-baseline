# SESSION_0003 — S1 schema rev: sign-off + migration

**Date:** 2026-04-26
**Operator:** Brian + Claude
**Goal:** Get sign-off on Q1–Q8, finalize Global Passport schema design, write the `schema.prisma` migration.
**Status:** closed-full

---

## Task

Continue S1 schema design for the Global Passport. Resolve open questions from SESSION_0002, review any remaining gaps (WEKAF bracket/results), then Cody rewrites `schema.prisma` with the full S1 rev.

## Inputs

- `docs/architecture/s1-schema-design.md` — design doc (sign-off target)
- `docs/sprints/SESSION_0002.md` — previous session context
- `apps/web/prisma/schema.prisma` — current schema (rewrite target)
- `docs/architecture/program-plan.md` — S1 deliverable spec

---

## What landed

- **Q1–Q8 signed off** — all 8 open questions from SESSION_0002 resolved with Brian's decisions
- **6 schema gaps identified and filled** — Gamification FKs, CourseEnrollment/CurriculumItemCompletion, Waiver/WaiverSignature, Style substyle model, TournamentStaffAssignment, Certification
- **`s1-schema-design.md` fully updated** — 31 models total, all relations cross-referenced, stale `MembershipRole` enum references replaced with `Role`/`TournamentRole` table FKs, User/Organization/Tournament/Discipline/Rank models updated with new reverse relations
- **Lint clean** — no markdown lint errors on touched files

## Files touched

- `docs/architecture/s1-schema-design.md` — major update (Q1–Q8 resolved, Gaps 1–6 added, model definitions corrected)
- `docs/sprints/SESSION_0003.md` — created + updated (this file)

## Decisions resolved

- **Q1:** Direct FK `Membership.rankId` — promotion updates FK + `RankAward` atomically via `$transaction()`
- **Q2:** No stripes column — stripe info in `name`/`shortName` conventions
- **Q3:** `Role` table (not enum) — universal defaults seeded, customizable per brand, `isSystem` protects defaults
- **Q4:** Include all 7 Baseline disciplines in S1 seed (BJJ, Eskrima, Muay Thai, Boxing, Self Defense, Judo, Kajukenbo) — also serves as white-label template
- **Q5:** `TournamentRole` as table (not enum) — same pattern as `Role`, customizable per brand, defaults: COMPETITOR, COACH, JUDGE, VOLUNTEER
- **Q6:** Add `rankId String?` FK on `Course` now in S1
- **Q7:** Option C — `SubscriptionTier` table + `UserBrandSubscription` model now; universal + BBL tiers (Free, Premium, Instructor, School Owner, Legend)
- **Q8:** Add `LineageNode` + `LineageRelationship` models now in S1

## Open decisions / blockers

None — all 8 questions resolved + 6 gaps filled + all model cross-references corrected. Design doc is ready for careful review then schema.prisma migration.

## Next session — SESSION_0004

**Goal:** Review `s1-schema-design.md` carefully in fresh context, then write `schema.prisma` + run migration.

**Inputs to read:**
- `docs/architecture/s1-schema-design.md` — the full design doc (31 models, all enums, all resolved questions)
- `apps/web/prisma/schema.prisma` — current schema (rewrite target)
- This SESSION file for context

**First task:** Read through `s1-schema-design.md` top to bottom. Validate all 31 model definitions, all FK cross-references, all enum usages. Flag anything that looks wrong before writing code.

**Then:** Rewrite `schema.prisma`, run `prisma migrate dev --name s1-schema-rev`, update `lib/authz.ts` + `middleware.ts` references, verify with `prisma generate` + `tsc --noEmit`.

**Also queued:** Update `data-model.md` to match new schema (still uses old naming: School, Style, Belt, Profile). Fix pre-existing markdown lint warnings (fenced code blocks missing language tags).

**Parked:** MCP/Obsidian second-brain architecture — old blueprint is WordPress-shaped, not applicable to new stack. Concepts are valid for S3+ but no schema or code action needed now. The current schema (GamificationEventType, LineageNode, CurriculumItem) already provides the data primitives an MCP server would expose later.

## Reflections

- **Enum vs table decision framework landed well.** The filter is simple: if a brand admin should customize it → table with `isSystem` + `brand` pattern. If it's internal plumbing → enum. Applied consistently across Q3 (Role), Q5 (TournamentRole), Q7 (SubscriptionTier), Gap 1 (GamificationEventType).
- **Cross-referencing against the ChatGPT plan caught real gaps.** 6 models that would have been painful to add later (especially Waiver/WaiverSignature and CourseEnrollment/CurriculumItemCompletion) were added now while the migration is still destructive.
- **User's instinct to override "defer" recommendations was consistently right.** The white-label SaaS context makes "add it now while migration is free" the correct default. Deferral advice was calibrated for a single-brand MVP, not a multi-brand platform.
- **Stale enum references are easy to miss.** After replacing `MembershipRole` enum with `Role` table, two model definitions (`Division.roleRequired` and `RegistrationEntry.role`) still referenced the deleted enum. Always grep for the old name after a rename.
- **Reverse relations compound fast.** Adding 6 new models required updating 6 existing models with new relation arrays. This is a Prisma-specific tax — every FK needs a matching reverse relation or `prisma generate` fails. Do this in the same pass, not as a follow-up.
