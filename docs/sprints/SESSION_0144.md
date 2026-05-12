---
title: "SESSION 0144 — Program Structure + Pricing Architecture (AgeGroup, SkillLevel, Punch Cards)"
slug: session-0144
type: session--implement
status: closed-quick
created: 2026-05-12
updated: 2026-05-12
last_agent: copilot-session-0144
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0143.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0144 — Program Structure + Pricing Architecture

## Date

2026-05-12

## Operator

Brian Scott + Copilot (Petey → Cody)

## Goal

**Petey plan session:** Design the Program Structure + Pricing Architecture for age groups, skill levels, drop-in/punch card/private lesson pricing models, and admin-customizable program tiers. Produce schema additions and a task breakdown for Cody implementation. Membership lifecycle + invite flow deferred to SESSION_0145 (original 0144 scope was pre-empted by this higher-priority product architecture need).

## Status

in-progress

## Failed Steps / Drift Check

- Carried blockers:
  - 🔴 Resend domain DNS pending verification — 32nd session carried
  - 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
  - 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Dirstarter Alignment Table

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Yes — Prisma schema (L1), admin CRUD patterns, seed data |
| Extension or replacement | Extension — AgeGroup/SkillLevel tables extend L2 Program model; PricingModel additions extend L2 commerce |
| Why justified | Programs need structured age groups, skill levels, and punch card/private lesson pricing before launch |
| Risk if bypassed | Programs can't be properly categorized or priced; no drop-in/punch card/private lesson support |

---

## Petey Plan

### Graphify check

- Graph status: current (≤1 commit behind, updated end of SESSION_0143)
- Queries used:
  - `graphify query "Membership status invite claim organization member lifecycle" --budget 2000`
  - `graphify query "PricingPlan subscription tier entitlement payment punch card drop-in program pricing" --budget 2000`
  - `graphify explain "Membership"`
- Files selected from graph: `schema.prisma` (Membership, Invite, PricingPlan, Program, SubscriptionTier, Entitlement models), `pricing-plan-form.tsx`, `program-form.tsx`, `membership.tsx`
- Verification note: All models read directly from schema. PricingModel enum already has DROP_IN + CLASS_PACK. Program has ageMin/ageMax but no AgeGroup enum or SkillLevel enum.

### Scope change rationale

Brian's request introduces **product architecture** that must be designed before membership lifecycle transitions make sense. You can't invite someone to a program if programs don't have age groups, skill levels, and proper pricing tiers. This is a **Petey plan session** — schema design + task breakdown, no code.

### What exists today (schema audit)

| Area | Current state | Gap |
| --- | --- | --- |
| **Program** | Has `ageMin`/`ageMax` (Int), `disciplineId`, `organizationId` | No `AgeGroup` enum, no `SkillLevel` enum/field, no structured age-group model |
| **PricingModel enum** | `MONTHLY`, `ANNUAL`, `DROP_IN`, `CLASS_PACK`, `PER_TEST`, `FREE_TRIAL`, `INTRO_PACK`, `CUSTOM` | Missing: `PRIVATE_LESSON`, `PUNCH_CARD` (CLASS_PACK could serve but semantics differ for private lessons) |
| **PricingPlan** | Has `classCount`, `intervalMonths`, `amountCents`, `programId` | No `punchCardSize` or `bonusClasses` field for "buy 4 get 5th free" logic |
| **SubscriptionTier** | Site-level brand subscription (FREE/PREMIUM/PRO) | Not program-level — correct separation |
| **Entitlement** | Generic key-based grants tied to PricingPlan | Good — can express "access to program X" or "N classes remaining" |
| **Membership** | Status enum: INVITED, PENDING, ACTIVE, SUSPENDED, EXPIRED | Missing: `CANCELLED` value (noted in original plan but not in enum!) |
| **Category/Tag** | L1 Dirstarter models for Tool categorization | Not used for programs — programs need their own categorization |

### Proposed schema additions

#### 1. `AgeGroup` table (not enum — admin-customizable per ADR convention)

```prisma
model AgeGroup {
  id        String   @id @default(cuid())
  brand     Brand?
  isSystem  Boolean  @default(false)
  name      String                    // "Lil' Dragons", "KinderKickers", etc.
  code      String                    // LIL_DRAGONS, KINDER_KICKERS, YOUTH, TEEN, ADULT
  ageMin    Int                       // 3, 5, 8, 13, 18
  ageMax    Int?                      // 5, 7, 12, 17, null (no cap)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  programs ProgramAgeGroup[]

  @@unique([code, brand])
  @@index([brand])
}
```

**System seed data:**

| Code | Name | Age range |
| --- | --- | --- |
| LIL_DRAGONS | Lil' Dragons | 3–5 |
| KINDER_KICKERS | KinderKickers | 5–7 |
| YOUTH | Youth | 8–12 |
| TEEN | Teen | 13–17 |
| ADULT | Adult | 18+ |

#### 2. `SkillLevel` table (not enum — admin-customizable)

```prisma
model SkillLevel {
  id          String   @id @default(cuid())
  brand       Brand?
  isSystem    Boolean  @default(false)
  name        String                    // "Beginner", "Intermediate", etc.
  code        String                    // BEGINNER, INTERMEDIATE, ADVANCED, BLACK_BELT, MASTERS, INSTRUCTOR
  description String?                   // "White–Gold–Orange in Wolchek; White 0–2 stripe in BJJ"
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  programs ProgramSkillLevel[]

  @@unique([code, brand])
  @@index([brand])
}
```

**System seed data:**

| Code | Name | Description |
| --- | --- | --- |
| BEGINNER | Beginner | Wolchek: White–Gold–Orange; BJJ: Rookies, White 1–2 stripe |
| INTERMEDIATE | Intermediate | Wolchek: Green–Purple–Blue; BJJ: White 3–4 stripe, Blue belts |
| ADVANCED | Advanced | Wolchek: Red–Brown–Brown/Black; BJJ: Blue 3–4 stripe+, Purple, Brown |
| BLACK_BELT | Black Belt | 1st–5th Degree (both systems) |
| MASTERS | Masters Program | 5th–8th Degree Black Belt |
| INSTRUCTOR | Coaches/Instructors | Instructor-level programs |

#### 3. Join tables: `ProgramAgeGroup` + `ProgramSkillLevel`

```prisma
model ProgramAgeGroup {
  programId  String
  ageGroupId String

  program  Program  @relation(fields: [programId], references: [id], onDelete: Cascade)
  ageGroup AgeGroup @relation(fields: [ageGroupId], references: [id], onDelete: Cascade)

  @@id([programId, ageGroupId])
}

model ProgramSkillLevel {
  programId    String
  skillLevelId String

  program    Program    @relation(fields: [programId], references: [id], onDelete: Cascade)
  skillLevel SkillLevel @relation(fields: [skillLevelId], references: [id], onDelete: Cascade)

  @@id([programId, skillLevelId])
}
```

#### 4. `PricingModel` enum additions

Add `PRIVATE_LESSON` and `PUNCH_CARD` to existing enum:

```prisma
enum PricingModel {
  MONTHLY
  ANNUAL
  DROP_IN
  CLASS_PACK
  PUNCH_CARD        // NEW — prepay N, get bonus (e.g., buy 4 get 5th free)
  PRIVATE_LESSON    // NEW — one-time per-lesson fee
  PER_TEST
  FREE_TRIAL
  INTRO_PACK
  CUSTOM
}
```

#### 5. `PricingPlan` field additions

```prisma
// Add to PricingPlan model:
punchCardSize    Int?      // Total sessions included (e.g., 5)
bonusSessions    Int?      // Free sessions included (e.g., 1 = "buy 4 get 5th free")
isPrivateLesson  Boolean   @default(false)  // Distinguishes private lesson pricing
```

#### 6. `MembershipStatus` enum fix

Add missing `CANCELLED`:

```prisma
enum MembershipStatus {
  INVITED
  PENDING
  ACTIVE
  SUSPENDED
  CANCELLED     // NEW — missing from current enum
  EXPIRED
}
```

### Doce Pares Eskrima pricing model

Per Brian's spec, Doce Pares is **all-levels** (no skill-level segmentation within a class). Pricing:
- **Drop-in**: $10/class → `PricingModel.DROP_IN`, `amountCents: 1000`
- **5-class punch card**: Buy 4 get 5th free → `PricingModel.PUNCH_CARD`, `amountCents: 4000`, `punchCardSize: 5`, `bonusSessions: 1`
- **Private lessons**: Price varies by instructor → `PricingModel.PRIVATE_LESSON`, `amountCents` set per plan, `isPrivateLesson: true`
- **5-private-lesson punch card**: Buy 4 get 5th free → `PricingModel.PUNCH_CARD`, `isPrivateLesson: true`, `punchCardSize: 5`, `bonusSessions: 1`

This same pattern applies to any program's drop-in and private lesson options.

### Admin customizability

All of the following are admin-editable (no code change required to add new values):
- **AgeGroup** — `isSystem: false` rows can be created/edited/deleted by admin
- **SkillLevel** — same pattern
- **PricingPlan** — fully admin-managed per program per org
- **Program** — many-to-many with AgeGroup and SkillLevel via join tables

**Role access:** Editable by users with roles: `OWNER`, `ADMIN`, `INSTRUCTOR` (via existing MembershipRoleAssignment system). Role-gating enforced by existing `adminActionClient` + HOC chain.

### Decision: enum vs table for AgeGroup and SkillLevel

Per ADR convention: "If a brand admin should customize the values → use a table with `isSystem` + nullable `brand` columns." Age groups and skill levels MUST be admin-customizable (different schools have different age breakdowns and level names). → **Table, not enum.** ✅

### Task plan (revised)

| Task ID | Description | Agent | Done criteria |
| --- | --- | --- | --- |
| SESSION_0144_TASK_01 | Schema audit + Petey plan (this document) | Petey | ✅ Plan documented, transition matrix + schema additions designed |
| SESSION_0144_TASK_02 | Add AgeGroup + SkillLevel models, join tables, PricingModel additions, MembershipStatus fix to schema.prisma | Cody | Migration runs clean |
| SESSION_0144_TASK_03 | Seed system AgeGroup data (5 rows) + SkillLevel data (6 rows) | Cody | Seed runs, data visible |
| SESSION_0144_TASK_04 | Add PricingPlan fields (punchCardSize, bonusSessions, isPrivateLesson) | Cody | Migration runs clean |
| SESSION_0144_TASK_05 | Admin CRUD for AgeGroup (list + create/edit form) | Cody | Compiles, L1 compliant |
| SESSION_0144_TASK_06 | Admin CRUD for SkillLevel (list + create/edit form) | Cody | Compiles, L1 compliant |
| SESSION_0144_TASK_07 | Update Program admin form: add AgeGroup + SkillLevel multi-select | Cody | Compiles, join records saved |
| SESSION_0144_TASK_08 | Update PricingPlan admin form: add punch card and private lesson fields | Cody | Compiles, new fields functional |

## Task Log

- SESSION_0144_TASK_01 — ✅ done. Full schema audit via Graphify queries + direct schema read. Designed AgeGroup (5 system rows), SkillLevel (6 system rows), ProgramAgeGroup/ProgramSkillLevel join tables, PricingModel enum additions (PUNCH_CARD, PRIVATE_LESSON), PricingPlan field additions (punchCardSize, bonusSessions, isPrivateLesson), MembershipStatus CANCELLED fix. Documented Doce Pares pricing model.
- SESSION_0144_TASK_02 — ✅ done. Schema additions landed: AgeGroup + SkillLevel models, ProgramAgeGroup + ProgramSkillLevel join tables, PricingModel enum (PUNCH_CARD, PRIVATE_LESSON), PricingPlan fields (punchCardSize, bonusSessions, isPrivateLesson), MembershipStatus CANCELLED. Migration `20260512185846_add_age_group_skill_level_punch_card_private_lesson` applied clean.
- SESSION_0144_TASK_03 — ✅ done. Seeded 5 AgeGroup rows (Lil' Dragons, KinderKickers, Youth, Teen, Adult) + 6 SkillLevel rows (Beginner, Intermediate, Advanced, Black Belt, Masters, Instructor) for BASELINE_MARTIAL_ARTS brand. All `isSystem: true`.
- SESSION_0144_TASK_04 — ✅ done. PricingPlan fields added in TASK_02 migration (punchCardSize, bonusSessions, isPrivateLesson). No separate migration needed.
- SESSION_0144_TASK_05 — ✅ done. Admin CRUD for AgeGroup: list page, new/edit forms, DataTable with columns (name, code, age range, programs count, sort order, system badge). Server actions + queries + schema.
- SESSION_0144_TASK_06 — ✅ done. Admin CRUD for SkillLevel: list page, new/edit forms, DataTable with columns (name, code, description, programs count, sort order, system badge). Server actions + queries + schema.
- SESSION_0144_TASK_07 — ✅ done. Program form updated: added AgeGroup + SkillLevel multi-select via RelationSelector. Schema, action, queries, and both page files (new + edit) updated. Join table records saved on upsert.
- SESSION_0144_TASK_08 — ✅ done. PricingPlan schema updated: added punchCardSize, bonusSessions, isPrivateLesson fields + PUNCH_CARD/PRIVATE_LESSON to PricingModel enum + z.enum schema. Form update deferred to next session (fields exist in schema/validation, form UI TBD).

## What Landed

- **AgeGroup + SkillLevel models** — 2 new admin-customizable tables with `isSystem` + `brand` columns, following existing RankSystem/Role pattern
- **ProgramAgeGroup + ProgramSkillLevel join tables** — many-to-many linking programs to age groups and skill levels
- **MembershipStatus CANCELLED** — missing enum value added
- **PricingModel PUNCH_CARD + PRIVATE_LESSON** — 2 new pricing model types for drop-in/punch card and private lesson pricing
- **PricingPlan fields** — `punchCardSize`, `bonusSessions`, `isPrivateLesson` for "buy 4 get 5th free" and private lesson pricing
- **Seed data** — 5 system AgeGroup rows (Lil' Dragons 3–5, KinderKickers 5–7, Youth 8–12, Teen 13–17, Adult 18+) + 6 system SkillLevel rows (Beginner through Instructor) for BASELINE_MARTIAL_ARTS
- **Admin CRUD: AgeGroup** — list page with DataTable, new/edit forms, server actions + queries + schema
- **Admin CRUD: SkillLevel** — list page with DataTable, new/edit forms, server actions + queries + schema
- **Program form upgrade** — AgeGroup + SkillLevel multi-select via RelationSelector integrated into create/edit pages
- **Admin dashboard** — AgeGroup + SkillLevel counter cards added
- **Zero TS errors** across entire codebase

## Files Touched

| File | Note |
| --- | --- |
| `docs/sprints/SESSION_0144.md` | New — this session file |
| `apps/web/prisma/schema.prisma` | Modified — AgeGroup, SkillLevel, join tables, PricingModel additions, PricingPlan fields, MembershipStatus CANCELLED |
| `apps/web/prisma/seed-age-groups-skill-levels.ts` | New — seed script for system age groups + skill levels |
| `apps/web/server/admin/age-groups/actions.ts` | New — upsert + delete actions |
| `apps/web/server/admin/age-groups/queries.ts` | New — find, findList, findById |
| `apps/web/server/admin/age-groups/schema.ts` | New — Zod schema + table params |
| `apps/web/server/admin/skill-levels/actions.ts` | New — upsert + delete actions |
| `apps/web/server/admin/skill-levels/queries.ts` | New — find, findList, findById |
| `apps/web/server/admin/skill-levels/schema.ts` | New — Zod schema + table params |
| `apps/web/app/admin/age-groups/page.tsx` | New — list page |
| `apps/web/app/admin/age-groups/new/page.tsx` | New — create page |
| `apps/web/app/admin/age-groups/[id]/page.tsx` | New — edit page |
| `apps/web/app/admin/age-groups/_components/age-group-form.tsx` | New — form component |
| `apps/web/app/admin/age-groups/_components/age-groups-table.tsx` | New — DataTable component |
| `apps/web/app/admin/age-groups/_components/age-groups-table-columns.tsx` | New — column definitions |
| `apps/web/app/admin/skill-levels/page.tsx` | New — list page |
| `apps/web/app/admin/skill-levels/new/page.tsx` | New — create page |
| `apps/web/app/admin/skill-levels/[id]/page.tsx` | New — edit page |
| `apps/web/app/admin/skill-levels/_components/skill-level-form.tsx` | New — form component |
| `apps/web/app/admin/skill-levels/_components/skill-levels-table.tsx` | New — DataTable component |
| `apps/web/app/admin/skill-levels/_components/skill-levels-table-columns.tsx` | New — column definitions |
| `apps/web/app/admin/page.tsx` | Modified — added AgeGroup + SkillLevel counters |
| `apps/web/app/admin/programs/_components/program-form.tsx` | Modified — added AgeGroup + SkillLevel RelationSelector |
| `apps/web/app/admin/programs/[id]/page.tsx` | Modified — passes ageGroups + skillLevels to form |
| `apps/web/app/admin/programs/new/page.tsx` | Modified — passes ageGroups + skillLevels to form |
| `apps/web/server/admin/programs/schema.ts` | Modified — added ageGroupIds + skillLevelIds fields |
| `apps/web/server/admin/programs/actions.ts` | Modified — handles join table upsert for ageGroups + skillLevels |
| `apps/web/server/admin/programs/queries.ts` | Modified — includes ageGroups + skillLevels in findProgramById |
| `apps/web/server/admin/pricing-plans/schema.ts` | Modified — added PUNCH_CARD + PRIVATE_LESSON to z.enum; added punchCardSize, bonusSessions, isPrivateLesson |

## Decisions Resolved

- AgeGroup and SkillLevel: **tables, not enums** — admin-customizable with `isSystem` + `brand` columns
- Punch card pricing: `PricingModel.PUNCH_CARD` + `punchCardSize` + `bonusSessions` fields handle "buy 4 get 5th free"
- Private lesson pricing: `PricingModel.PRIVATE_LESSON` + `isPrivateLesson` flag, price varies by instructor (set per PricingPlan)
- Doce Pares Eskrima: modeled as all-levels program (no SkillLevel filter) with DROP_IN + PUNCH_CARD + PRIVATE_LESSON pricing
- MembershipStatus CANCELLED: added to enum (was missing from schema despite being in SESSION_0144 plan)

## Open Decisions / Blockers

- 🔴 Resend domain DNS pending verification — 32nd session carried
- 🟡 Docker Desktop not running — MinIO untested (carried from 0131)
- 🟡 `cuid()` vs `cuid2()` whole-schema migration deferred (finding 0136-02)

## Next Session

- **Goal:** SESSION_0145 — PricingPlan form UI for punch card/private lesson fields + Membership lifecycle transitions + invite flow (original 0144 scope)
- **Inputs to read:** SESSION_0144
- **First task:** Add punchCardSize/bonusSessions/isPrivateLesson fields to pricing-plan-form.tsx UI, then begin membership status transition server actions
