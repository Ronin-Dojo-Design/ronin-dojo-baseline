---
title: "SESSION 0005 — Seed File, Shadow DB, Data-Model Update"
slug: session-0005
type: session
status: closed-quick
created: 2026-04-26
updated: 2026-04-26
last_agent: copilot-session-0005
sprint: S1
pairs_with:
  - docs/sprints/SESSION_0004.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION_0005 — Seed file, shadow DB, data-model.md update

**Date:** 2026-04-26
**Operator:** Brian + Copilot (Petey → Cody)
**Goal:** Write `seed.ts` with all system defaults (7 disciplines, rank ladders, roles, tournament roles, gamification event types, subscription tiers, Karate substyles), configure shadow DB, update `data-model.md` to match S1 schema.
**Status:** closed-quick

---

## Petey plan

### Decisions resolved this session

1. **Kajukenbo dual identity (Option C):** Kajukenbo exists as both a top-level Discipline (with its own rank system) AND as a Karate substyle (Style row).
2. **Karate is discipline #8.** The Q4 "7 disciplines" predates Gap 4. Karate substyles (Shotokan, Wado-Ryu, Goju-Ryu, Hawaiian Kenpo, Kajukenbo) are Style rows under it.
3. **TKD, Wrestling, Krav Maga, Wing Chun added** as disciplines #9–12.
4. **Add `isSystem` + `brand` columns to Discipline, RankSystem, Rank** — same extensibility pattern as Role/TournamentRole. Schema change required.
5. **BJJ uses full IBJJF ladder** — 4 stripes per belt + degrees through 10th + coral/red = 30 ranks.
6. **Eskrima: one discipline, TWO rank systems** — PIMA Denver (GM Steve Wolk) and PIMA Jersey (SGM Dong Cuesta).
7. **Muay Thai: Sak Va Roon system** — 9 ranks (not 8).
8. **Boxing & Self Defense: brand-specific** (`isSystem: false, brand: BASELINE_MARTIAL_ARTS`), not system defaults.
9. **Judo: real Kodokan system** — 6 kyu + 10 dan = 16 ranks.
10. **Karate: USA Karate Federation Olympic standard** — 10 kyu + 10 dan = 20 ranks.
11. **TKD: USA Taekwondo/WT Olympic standard** — 10 gup + 10 dan = 20 ranks.
12. **Curriculum ports: deferred** — not this session.

### Schema change: Discipline/RankSystem/Rank extensibility

Add to `Discipline`:

```prisma
isSystem  Boolean  @default(false)
brand     Brand?
```

Add to `RankSystem`:

```prisma
isSystem  Boolean  @default(false)
brand     Brand?
```

Add to `Rank`:

```prisma
isSystem  Boolean  @default(false)
brand     Brand?
```

Update unique constraints accordingly (e.g., `Discipline.@@unique([name])` may need `@@unique([name, brand])`).

### Seed data spec (FINAL)

#### 12 Disciplines

| # | code | name | isSystem | brand | notes |
| --- | --- | --- | --- | --- | --- |
| 1 | `bjj` | Brazilian Jiu-Jitsu | true | null | |
| 2 | `eskrima` | Doce Pares Eskrima | true | null | |
| 3 | `muay-thai` | Muay Thai | true | null | |
| 4 | `boxing` | Boxing | true | null | |
| 5 | `self-defense` | Self Defense | true | null | |
| 6 | `judo` | Judo | true | null | |
| 7 | `kajukenbo` | Kajukenbo | true | null | Also a Karate substyle (Option C) |
| 8 | `karate` | Karate | true | null | USA Karate Fed Olympic standard |
| 9 | `tkd` | Taekwondo | true | null | USA TKD/WT Olympic standard |
| 10 | `wrestling` | Wrestling | true | null | |
| 11 | `krav-maga` | Krav Maga | true | null | |
| 12 | `wing-chun` | Wing Chun | true | null | |

#### 14 Rank Systems

| # | Discipline | RankSystem name | Kind | isSystem | brand | Rank count | Ranks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BJJ | IBJJF Belt System | BELT | true | null | 30 | White (0–4 stripe), Blue (0–4), Purple (0–4), Brown (0–4), Black 1st–6th Degree, Coral Red/Black 7th, Coral Red/White 8th, Red 9th, Red 10th |
| 2 | Eskrima | PIMA Denver Doce Pares (GM Steve Wolk) | BELT | true | null | 22 | Level 1–11, Black Belt (Guro), 1st–9th Degree Black Belt, 10th Degree Red Belt |
| 3 | Eskrima | PIMA Jersey Doce Pares (SGM Dong Cuesta) | BELT | true | null | 22 | White, Yellow, Orange, Green, Blue, Purple, Brown, Brown w/ Black Stripe, Brown 1st Grade, Brown 2nd Grade, Black w/ Stripes, Black Belt (Guro), 1st–9th Degree Black Belt, 10th Degree Red Belt |
| 4 | Muay Thai | Sak Va Roon Thai Boxing Prajioud System | PRAJIOUD | true | null | 9 | White, Yellow, Yellow-Black, Blue, Blue-Black, Red, Black, Red-Black, Red-Blue-Black |
| 5 | Boxing | Boxing Skill Levels | GRADE | false | BASELINE | 8 | Fundamentals, Novice, Beginner, Intermediate, Advanced, Sparring Ready, Amateur, Competition Ready |
| 6 | Self Defense | Self Defense Levels | GRADE | false | BASELINE | 8 | Awareness, Fundamentals, Basic Responses, Intermediate, Advanced, Weapons Defense, Ground Defense, Multiple Attackers |
| 7 | Judo | Kodokan Judo Kyu-Dan System | KYU_DAN | true | null | 16 | 6th Kyu (White)→1st Kyu (Brown), 1st Dan (Shodan)→5th Dan (black), 6th–8th Dan (red-white), 9th–10th Dan (red) |
| 8 | Kajukenbo | Kajukenbo Belt System | BELT | true | null | 19 | White, Yellow, Orange, Purple, Blue, Green, Brown 3rd, Brown 2nd, Brown 1st, Black 1st–10th Degree |
| 9 | Karate | USA Karate Federation Kyu-Dan System | KYU_DAN | true | null | 20 | 10th Kyu (White)→1st Kyu (Brown), Shodan→10th Dan |
| 10 | TKD | USA Taekwondo Gup-Dan System | KYU_DAN | true | null | 20 | 10th Gup (White)→1st Gup, 1st Dan (Poom/Dan)→10th Dan |
| 11 | Wrestling | Wrestling Skill Levels | GRADE | true | null | 6 | Beginner, Novice, Intermediate, Advanced, Elite, Master |
| 12 | Krav Maga | Krav Maga Level System | GRADE | true | null | 6 | Practitioner 1 (P1), P2, P3, P4, P5, Graduate/Expert |
| 13 | Wing Chun | Wing Chun Forms Progression | OTHER | true | null | 8 | Siu Nim Tao, Chum Kiu, Biu Jee, Muk Yan Jong, Luk Dim Boon Gwan, Baat Jaam Do, Instructor, Master |
| 14 | Kajukenbo (TuffBuffs) | TBD — need to confirm from TuffBuffs/monorepo | BELT | false | BASELINE | TBD | TBD — may be same as #8 or differ |

**Note on #14:** Kajukenbo rank system #8 above uses the standard Emperado-lineage progression. If TuffBuffs uses a different ladder, we'll add it as a second brand-specific rank system like we did for Eskrima. For now, seed #8 as system default; #14 deferred until TuffBuffs data confirmed.

#### Roles (isSystem: true, brand: null)

STUDENT, INSTRUCTOR, OWNER, COACH, ORG_ADMIN, STYLE_APPROVER

#### TournamentRoles (isSystem: true, brand: null)

COMPETITOR, COACH, JUDGE, VOLUNTEER

#### GamificationEventType (isSystem: true, brand: null)

BELT_PROMOTION, CLASS_ATTENDANCE, TOURNAMENT_WIN, TOURNAMENT_PARTICIPATION, COURSE_COMPLETION, CURRICULUM_ITEM_COMPLETION
*(Marked "needs future design pass" in code comments)*

#### SubscriptionTier

- Universal (isSystem: true, brand: null): FREE (level=0)
- BBL (brand: BBL): FREE(0), PREMIUM(10), INSTRUCTOR(20), SCHOOL_OWNER(30), LEGEND(40)
- Baseline + WEKAF: deferred — seed only universal FREE

#### Karate substyles (Style rows, status: APPROVED, under Karate discipline)

Shotokan, Wado-Ryu, Goju-Ryu, Hawaiian Kenpo, Kajukenbo

---

### Task breakdown

#### Track A0 — Schema change (Cody, must complete before seed)

1. Add `isSystem Boolean @default(false)` + `brand Brand?` to `Discipline`, `RankSystem`, `Rank`
2. Update unique constraints (e.g., `Discipline.@@unique([name, brand])`)
3. `dropdb ronindojo_dev && createdb ronindojo_dev && prisma db push && prisma generate`
4. Fix any type errors from new columns

#### Track A1 — Seed file (Cody, primary deliverable, after A0)

1. Replace contents of `apps/web/prisma/seed.ts`
2. Keep Dirstarter template seed data (users, categories, tags, tools) at top
3. Add Ronin Dojo seed data below:
   - 12 Disciplines (10 system, 2 system but niche)
   - 13 RankSystems (11 system/universal, 2 brand-specific BASELINE)
   - Full rank ladders per system (~200+ Rank rows total)
   - 6 Roles
   - 4 TournamentRoles
   - 6 GamificationEventTypes
   - 6 SubscriptionTiers (1 universal + 5 BBL)
   - 5 Karate Styles (substyles)
4. Verify: `dropdb ronindojo_dev && createdb ronindojo_dev && prisma db push && bun run prisma/seed.ts`

#### Track B — Shadow DB config (Cody, parallel-safe)

1. Add `shadowDatabaseUrl` to `.env` pointing to `ronindojo_shadow`
2. Add to `schema.prisma` datasource block
3. Test: `prisma migrate dev --name s1-schema-rev` works
4. Document in runbook

#### Track C — `data-model.md` update (Cody, parallel-safe)

1. Full rewrite to match 31-model schema
2. Narrative style (matches existing doc tone)
3. Include the 12-discipline seed list
4. Add JETTY 3.0 frontmatter (type: concept)

#### Track D — JETTY 3.0 wiki pages for touched files (Cody, parallel-safe)

1. Add JETTY 3.0 frontmatter to `data-model.md` (done in Track C)
2. Add JETTY 3.0 frontmatter to `SESSION_0005.md`
3. Create `docs/knowledge/wiki/files/schema-prisma.md` — type: file, health score, wiring, key models
4. Create `docs/knowledge/wiki/files/seed-ts.md` — type: file, health score, what it seeds
5. Update `docs/knowledge/wiki/index.md` with new pages
6. Update backlinks on any pages that reference these files

---

### Persona assignments

| Track | Persona | Parallel? |
| --- | --- | --- |
| A0 (schema change) | Cody | Must complete first |
| A1 (seed file) | Cody | After A0 |
| B (shadow DB) | Cody-2 | Yes, parallel with A1 |
| C (data-model.md) | Cody-3 | Yes, parallel with A1 |
| D (JETTY 3.0 wiki) | Cody-4 | Yes, parallel with A1 |

Tracks B and C can run after A starts. All three are independent of each other.

---

### Done criteria

- [ ] Schema updated: `isSystem` + `brand` on Discipline/RankSystem/Rank
- [ ] `seed.ts` runs clean against fresh DB
- [ ] All 12 disciplines seeded
- [ ] All 13 rank systems with full ladders seeded (~200+ Rank rows)
- [ ] Roles, TournamentRoles, GamificationEventTypes, SubscriptionTiers seeded
- [ ] 5 Karate substyles seeded
- [ ] Shadow DB configured and `prisma migrate dev` works
- [ ] `data-model.md` reflects current schema (12 disciplines, 31 models)
- [ ] JETTY 3.0 frontmatter on `data-model.md` and `SESSION_0005.md`
- [ ] JETTY 3.0 wiki pages for `schema.prisma` and `seed.ts`
- [ ] Wiki index updated with new pages
- [ ] `prisma generate` + `tsc --noEmit` clean

---

## What landed

- **Schema change**: Added `isSystem` + `brand` columns to `Discipline`, `RankSystem`, `Rank` — same extensibility pattern as Role/TournamentRole
- **Seed file rewrite**: 12 disciplines, 13 rank systems, 194 ranks, 6 roles, 4 tournament roles, 6 gamification event types, 6 subscription tiers, 5 Karate substyles — all seeded clean
- **Shadow DB partial**: Created `ronindojo_shadow` DB, added `shadowDatabaseUrl` to `prisma.config.ts` + `.env`, granted `CREATEDB` — but `prisma migrate dev` still hangs (same blocker as SESSION_0004)
- **`data-model.md` full rewrite**: 31 models documented with JETTY 3.0 frontmatter, 12-discipline table, all domain sections updated from old naming
- **JETTY 3.0 wiki pages**: `schema-prisma.md` and `seed-ts.md` created, wiki index updated with both + SESSION_0005

## Files touched

| File | Note |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added `isSystem` + `brand` to Discipline, RankSystem, Rank; updated unique constraints |
| `apps/web/prisma/seed.ts` | Full rewrite — 12 disciplines, 13 rank systems, 194 ranks, roles, tiers, styles |
| `apps/web/prisma.config.ts` | Added `shadowDatabaseUrl` |
| `apps/web/.env` | Added `SHADOW_DATABASE_URL` |
| `docs/architecture/data-model.md` | Full rewrite with JETTY 3.0 frontmatter |
| `docs/knowledge/wiki/files/schema-prisma.md` | New — JETTY 3.0 file annotation |
| `docs/knowledge/wiki/files/seed-ts.md` | New — JETTY 3.0 file annotation |
| `docs/knowledge/wiki/index.md` | Updated: data-model health, SESSION_0005, code files section |
| `docs/sprints/SESSION_0005.md` | This file |

## Decisions resolved

1. **Kajukenbo dual identity (Option C)**: Both a Discipline and a Karate substyle
2. **Karate = discipline #8**: Q4 "7 disciplines" predates Gap 4
3. **12 disciplines total**: Added TKD, Wrestling, Krav Maga, Wing Chun
4. **`isSystem` + `brand` on Discipline/RankSystem/Rank**: Schema change for white-label extensibility
5. **Full IBJJF BJJ ladder**: 4 stripes/belt + degrees through 10th + coral/red = 30 ranks
6. **Eskrima: 2 rank systems**: PIMA Denver (GM Steve Wolk) + PIMA Jersey (SGM Dong Cuesta)
7. **Muay Thai: Sak Va Roon**: 9 ranks, not 8
8. **Boxing & Self Defense: brand-specific**: `isSystem: false, brand: BASELINE_MARTIAL_ARTS`
9. **Judo: real Kodokan system**: 16 ranks
10. **Karate: USA Karate Fed Olympic standard**: 20 ranks
11. **TKD: USA TKD/WT Olympic standard**: 20 ranks

## Open decisions / blockers

- **`prisma migrate dev` still hangs** — even with `CREATEDB` grant + shadow DB. Same blocker as SESSION_0004. Options: Docker Postgres, or defer to Neon for production migration history.
- **Kajukenbo TuffBuffs-specific rank system** (#14) — need to confirm from monorepo whether it differs from standard Emperado belt order
- **Baseline + WEKAF subscription tiers** — not yet defined
- **GamificationEventType point values** — placeholder, needs design pass
- **`plan-vs-current.md`** — still stale after S1 rewrite

## Next session

**Goal:** S2 — Better-Auth + Passport bootstrap. Sign-up creates User + Passport + DirectoryProfile stubs. `/me` route renders Passport editor. Brand cookie wired through middleware.

**Inputs to read:**

- `docs/sprints/SESSION_0005.md` (this file)
- `docs/architecture/program-plan.md` (S2 row)
- `apps/web/prisma/schema.prisma` (Passport + DirectoryProfile models)
- `apps/web/lib/authz.ts` (current auth patterns)

**First task:** Wire Better-Auth sign-up to create Passport + DirectoryProfile stubs in a transaction.
