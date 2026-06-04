---
title: "2026-05-18 Production Launch — All Brands"
slug: product-launch-all-brands
type: file
status: active
created: 2026-04-28
updated: 2026-06-04
author: Brian + Petey
last_agent: claude-session-0342
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0019.md
  - docs/sprints/SESSION_0020.md
  - docs/sprints/SESSION_0342.md
  - docs/architecture/program-plan.md
pairs_with:
  - docs/architecture/program-plan.md
  - docs/runbooks/deploy/bbl-production-runbook.md
  - docs/product/black-belt-legacy/GAP_MATRIX.md
  - docs/protocols/WORKFLOW_5.0.md
tags:
  - launch
  - production
  - brands
  - milestone
---

# 2026-05-18 Production Launch — All Brands

> ## ⚠️ CURRENT STATUS (2026-06-04) — superseded by a BBL-first cutover
>
> **The "all brands live May 18" plan below was NOT executed as written and is historical.** May 18 has
> passed; brand work since then has focused on the lineage surface (responsive + carousel slices,
> SESSION_0331–0341). This banner is the live framing; the sections below are preserved for history.
>
> **Current primary focus: launch `blackbeltlegacy.com` (BBL).** Cut over from the legacy WordPress site to
> the BBL brand on the existing Vercel app. Target is **ASAP — soft aim this weekend (Fri/Sat/Sun), no hard
> date — explicitly "not rushed or sloppy."** Safe + secure over fast.
>
> **Staging-prod strategy:** `baselinemartialarts.com` is the live "test-production" surface for BBL
> behavior (phone checks + a few invited live users exercising registration). Local UI + Playwright remain
> the dev-side gate. BBL itself goes live only when the readiness layers below are green.
>
> **Three readiness layers (each has a canonical doc — do not re-derive):**
>
> | Layer | Canonical doc | State (2026-06-04) |
> | --- | --- | --- |
> | Deploy / DNS cutover | [`bbl-production-runbook.md`](../../runbooks/deploy/bbl-production-runbook.md) | Solid; **1 blocking item** — confirm `blackbeltlegacy.com` DNS source of truth before any DNS change. |
> | Feature readiness | [`GAP_MATRIX.md`](../../product/black-belt-legacy/GAP_MATRIX.md) + PRD/STORIES | 6 built / 17 partial / 6 not-started / 3 infra-only (of 32 stories). |
> | Test / verification readiness | [`test-fail-fix-ledger.md`](../../knowledge/wiki/test-fail-fix-ledger.md) + e2e gap list | Unit gate **green** (SESSION_0342). Launch-critical e2e gaps still unwritten — see below. |
>
> **Launch-critical e2e gaps (none exist yet; gate a safe BBL cutover) — staged, not built (SESSION_0342):**
>
> 1. Registration / sign-up flow (member front door).
> 2. Stripe checkout / purchase (test mode) → success/cancel pages — money path.
> 3. Member join → tier → entitlement lifecycle (user-facing, not just admin).
> 4. Authenticated claim flow (GAP_MATRIX #1).
> 5. Role-scoped editor access enforcement (BRANCH_EDITOR / NODE_EDITOR — security-adjacent).
>
> **Next planning step:** a dedicated BBL launch-readiness replan session that sequences the GAP_MATRIX
> partials + the e2e gaps + the DNS-confirmation blocker into a cutover checklist. Lineage Slice 5
> (PORTMAP-0006) continues **within** this BBL-launch frame, not as a parallel track.

## Scope change from program-plan.md

The original program plan targeted a 12-sprint MVP with Baseline Martial Arts first, other brands post-MVP. **That plan is now superseded.** Brian has declared a hard production launch date of **May 18, 2026** for ALL brands simultaneously.

This is no longer MVP. This is production launch.

## Launch date

**2026-05-18** — 20 days from today (April 28, 2026).

## Brand launch order (priority)

| Priority | Brand | Domain(s) | Type | Status |
| --- | --- | --- | --- | --- |
| **P1** | Baseline Martial Arts | baselinemartialarts.com | White-labeled SaaS martial arts platform; curriculum/certification affiliation available for purchase | Schema done through S4; needs S6–S10 features |
| **P2** | Black Belt Legacy (BBL) | blackbeltlegacy.com | Martial arts community/legacy platform; data migration from legacy site needed ([ADR 0007](../decisions/0007-bbl-migration.md)) | Schema exists; migration plan needed |
| **P3** | WEKAF USA | wekafusa.com, usastickfighting.com | Tournament organization/league; stick fighting focus; needs full tournament bracket system | Tournament schema exists (S8–S9 planned); greenfield rebuild |
| **P4** | Ronin Dojo Design | ronindojodesign.com | Umbrella/admin brand; agency platform; hosts demos of all three brands + white-label sales system | Most complex — runs real AND demo versions of P1–P3 plus white-label client onboarding |

## Brand specifications

### Baseline Martial Arts (P1)

- **Identity:** Rebrand of TuffBuffs. Cannot advertise CU Boulder connection. No links to rec center registration.
- **Function:** White-labeled SaaS ready for purchase and population. Baseline Martial Arts curriculum available for clients to buy and learn.
- **Features needed for launch:**
  - User registration + Passport + DirectoryProfile ✅ (S2)
  - Organization CRUD + membership ✅ (S3)
  - Directory with privacy ✅ (S4)
  - Course + CurriculumItem CRUD (S6 — not started)
  - Progress/rank awarding + gamification (S7 — not started)
  - Tournament basics (S8–S9 — not started)
  - Payments/Stripe (S10 — not started)
  - Brand theme tokens + marketing pages (S11 — not started)
- **Risk:** S6–S11 is 6 sprints of work in 20 days. Aggressive.

### Black Belt Legacy (P2)

- **Identity:** Existing martial arts community site at blackbeltlegacy.com.
- **Function:** Community platform, instructor profiles, lineage tracking, legacy content.
- **Features needed for launch:**
  - All P1 features (shared platform)
  - Data migration from legacy BBL site ([ADR 0007](../decisions/0007-bbl-migration.md))
  - Brand-specific theme tokens
  - Instructor lineage features (not yet in schema)
- **Risk:** Migration plan doesn't exist yet. Legacy data format unknown.

### WEKAF USA (P3)

- **Identity:** Tournament organization for Filipino Martial Arts stick fighting.
- **Domains:** wekafusa.com + usastickfighting.com (both point to same brand)
- **Function:** League-style tournament management. Bracket system. Multi-format competitions.
- **Features needed for launch:**
  - All P1 features (shared platform)
  - Full tournament bracket system: single elimination, double elimination, round robin, grand championship
  - Division types: single stick, double stick, forms, traditional, open, live stick
  - Weight classes per division
  - Multi-rule-set support (WEKAF rules, but system must support IBJJF, NASKA, NBL, USA Boxing, USA Judo, USA Taekwondo rulesets for future)
  - Bracket management (8+ brackets)
  - Scoring system per format
- **Risk:** Tournament bracket system is the most complex feature. S8–S9 only planned the schema + basic registration. Full bracket management + scoring is not scoped.

### Ronin Dojo Design (P4)

- **Identity:** The umbrella brand. Agency/admin platform.
- **Domains:** ronindojodesign.com
- **Function:**
  - Runs real production versions of P1–P3
  - Runs demo/preview versions of P1–P3 for sales
  - White-label client onboarding wizard
  - Template system for rapid site standup
  - Pricing tiers and sales flow
  - Brand switcher (admin views all brands)
- **Features needed for launch:**
  - All P1 features
  - Client intake + onboarding wizard (not in schema)
  - Template system with pre-population (not in schema)
  - Demo/preview site generation (not in schema)
  - Pricing tier management (not in schema)
  - Sales flow with service bundles (not in schema)
- **Risk:** Highest complexity. Multiple features have no schema, no design, no implementation. This is the hardest brand to launch.

## Schema gaps (from SCHEMA_NEEDS_MANIFEST.md)

> **UPDATE (SESSION_0020):** All schema gaps below have been addressed in [s2-schema-additions.md](../s2-schema-additions.md) across 3 design passes (38 new models, 29 new enums). `SCHEMA_NEEDS_MANIFEST.md` is now deprecated. The table below is preserved for historical reference.

The following entities were referenced in the schema needs manifest but did NOT exist in the Prisma schema at time of writing:

| Entity | Needed for | Resolved in |
| --- | --- | --- |
| Sites (white-label) | P4 — demo sites, templates | ⏳ POST-LAUNCH (Option A-plus) |
| Templates + customization | P4 — rapid site standup | ⏳ POST-LAUNCH |
| Client intake | P4 — onboarding wizard | ⏳ POST-LAUNCH |
| Onboarding wizard state | P4 — maps to site fields | ⏳ POST-LAUNCH |
| Products/Programs | P1 — curriculum purchase | ✅ Program + ProgramCourse + ProgramEnrollment (Pass 1) |
| Pricing tiers + service bundles | P4 — sales flow | ✅ PricingPlan + SubscriptionTier (Pass 1) |
| Bracket system | P3 — tournament brackets | ✅ Bracket + Match + MatchCompetitor (Pass 2) |
| Match formats | P3 — bracket types | ✅ Match.result + MatchStatus enum (Pass 2) |
| Rule set association | P3 — multi-rule-set | ✅ RuleSet + TournamentDiscipline.ruleSetId (Pass 3) |
| Fight records (per-discipline) | All — fighter records across arts | ✅ FightRecord (Pass 2) |
| Instructor lineage | P2 — BBL core feature | ✅ LineageRelationType.INSTRUCTOR_STUDENT (Pass 1) |
| Referee/judge courses | P3 — tournament staffing | ✅ TournamentRole.JUDGE + Course (S1, live) |
| Scoring systems | P3 — per-format scoring | ✅ RuleSet.scoringConfig + ScoringMethod (Pass 3) |

## What exists today (S1–S5 complete + S2 design)

**Live in schema (36 models):**

- User + Passport + DirectoryProfile (S2)
- Organization CRUD + membership + join flow (S3)
- Directory search with privacy filters (S4)
- 12 disciplines, 13 rank systems, 194 ranks seeded (S1)
- Tournament + TournamentDiscipline + Division + Registration + RegistrationEntry (schema only, no UI)
- Courses + CurriculumItem + Gamification + Subscriptions + Lineage + Waivers + Certifications + Content Engine

**Designed, migration pending (38 models):**

- Programs, scheduling, attendance, check-in, belt testing, family, billing, contracts, notifications, org settings (Pass 1 — 24 models)
- Invitations, generic events, brackets, matches, fight records, audit log (Pass 2 — 9 models)
- Lead/CRM, rules engine, weigh-ins, mat assignments (Pass 3 — 5 models)

## Gap analysis: 20 days to launch

> **Updated SESSION_0020:** Old sprint estimates replaced by WORKFLOW 5.0 session calendar.

| Session block | Work | WORKFLOW 5.0 sessions |
| --- | --- | --- |
| Schema Wave A | School ops models → Prisma migration | 0021–0022 |
| Schema Wave B | Promotions, events, leads, invitations | 0023–0025 |
| Content + curriculum | Curriculum, media, certifications | 0026 |
| Schema Wave C | Tournament execution — brackets, scoring, rules | 0027–0029 |
| Athlete-facing contracts | BJJBuddy-plus baseline app contracts | 0030 |
| Brand launches | Baseline → BBL → WEKAF → RDD | 0031–0034 |
| QA hardening | E2E tests, fixtures, seeds, migration rehearsal | 0035 |
| Launch + support | Email, analytics, storage, payments, ops | 0036 |
| Buffer | Mandatory debt burn-down | 0037 |
| Cross-brand QA | UAT, accessibility, performance | 0038 |
| Launch readiness | Freeze, rollback drill, support playbook | 0039 |
| Launch day | Release execution, monitoring, triage | 0040 |

**Assessment:** 20 sessions across 20 days. Tight but feasible with WORKFLOW 5.0's single-lane-per-session discipline and 9.5/10 score gate.

## Recommended launch strategy

> **UPDATE (SESSION_0020):** Option A-plus selected pending formal sign-off. Session calendar and execution plan now governed by [WORKFLOW_5.0.md](../../protocols/WORKFLOW_5.0.md).

### Option A-plus: All brands live May 18, differentiated depth (recommended)

All four brands go publicly live on May 18 with differentiated feature depth:

- **P1 Baseline:** Full member lifecycle — scheduling, attendance, billing, belt testing, CRM
- **P2 BBL:** Migration-safe community — lineage, curriculum, certifications, member profiles
- **P3 WEKAF:** Real registration + bracket visibility — not full long-tail tournament rules engine
- **P4 Ronin Dojo Design:** Assisted white-label sales + onboarding — not fully self-serve wizard

Schema migration in 3 waves (see WORKFLOW_5.0.md for session calendar):

- **Wave A (SESSION_0021–0022):** School ops models
- **Wave B (SESSION_0023–0025):** Promotions, events, leads
- **Wave C (SESSION_0027–0029):** Tournament execution

### Option A: Staggered launch (original recommendation, superseded)

- **May 18:** P1 (Baseline) fully functional. P2–P4 have branded landing pages, user registration, directory — but advanced features (tournaments, onboarding wizard) marked "coming soon."
- **June 1:** P3 (WEKAF) tournament features live
- **June 15:** P2 (BBL) migration complete + live
- **July 1:** P4 (Ronin Dojo Design) white-label + onboarding wizard

### Option B: Hard launch all brands May 18

- Requires 2x development velocity or significant scope cuts
- Risk: quality issues, data leakage bugs, incomplete features visible to users
- Not recommended without additional developers

### Option C: Launch P1 May 18, defer P2–P4

- Safest option. Original program plan essentially.
- Doesn't match Brian's stated goal of all brands launching.

## SESSION_0020 scope ✅ COMPLETED

All items completed during SESSION_0020 Petey deep dive:

1. ✅ **Schema needs pass** — reconciled against current schema; produced [s2-schema-additions.md](../s2-schema-additions.md) with 38 new models, 29 new enums across 3 passes
2. ✅ **Per-brand feature matrix** — Option A-plus defines differentiated depth per brand (see above)
3. ✅ **Launch strategy decision** — Option A-plus selected (all brands live May 18, differentiated depth)
4. ✅ **Sprint replan** — replaced S6–S12 with WORKFLOW 5.0 session calendar (SESSION_0021–0040)
5. ✅ **Parallel workstream plan** — 5 worktrees defined in WORKFLOW 5.0 (core-platform, school-ops, tournaments, brand-launch, qa-hardening)
6. ⏸ **Cache strategy finalization** — ADR 0010 still `proposed`; scheduled for SESSION_0022

## Open questions for Brian ✅ RESOLVED

1. ✅ **Hard deadline.** May 18 is a hard launch date, not a target.
2. ✅ **Option A-plus.** All brands live May 18 with differentiated depth. Not staggered, not deferred.
3. ✅ **Single operator + AI agents.** No additional developers. 6 AI personas (Petey, Cody, Doug, Desi, Brandon, Giddy).
4. ✅ **Complete spec.** s2-schema-additions.md (3 passes) + ChatGPT deep research brief = complete spec. SCHEMA_NEEDS_MANIFEST.md is deprecated.
5. ✅ **P4 white-label.** Assisted onboarding is launch scope. Self-serve wizard is post-launch.
