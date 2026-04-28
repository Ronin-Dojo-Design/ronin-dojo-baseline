---
title: "2026-05-18 Production Launch — All Brands"
slug: product-launch-all-brands
type: file
status: active
created: 2026-04-28
updated: 2026-04-28
author: Brian + Petey
last_agent: session-0019-petey
health: 5
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0019.md
  - docs/sprints/SESSION_0020.md
  - docs/architecture/program-plan.md
pairs_with:
  - docs/architecture/program-plan.md
  - docs/architecture/SCHEMA_NEEDS_MANIFEST.md
  - docs/protocols/WORKFLOW_5.0.md
tags:
  - launch
  - production
  - brands
  - milestone
---

# 2026-05-18 Production Launch — All Brands

## Scope change from program-plan.md

The original program plan targeted a 12-sprint MVP with Baseline Martial Arts first, other brands post-MVP. **That plan is now superseded.** Brian has declared a hard production launch date of **May 18, 2026** for ALL brands simultaneously.

This is no longer MVP. This is production launch.

## Launch date

**2026-05-18** — 20 days from today (April 28, 2026).

## Brand launch order (priority)

| Priority | Brand | Domain(s) | Type | Status |
| --- | --- | --- | --- | --- |
| **P1** | Baseline Martial Arts | baselinemartialarts.com | White-labeled SaaS martial arts platform; curriculum/certification affiliation available for purchase | Schema done through S4; needs S6–S10 features |
| **P2** | Black Belt Legacy (BBL) | blackbeltlegacy.com | Martial arts community/legacy platform; data migration from legacy site needed ([ADR 0007](../architecture/decisions/0007-bbl-migration.md)) | Schema exists; migration plan needed |
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
  - Data migration from legacy BBL site ([ADR 0007](../architecture/decisions/0007-bbl-migration.md))
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

The following entities are referenced in the schema needs manifest but do NOT exist in the current Prisma schema:

| Entity | Needed for | Current status |
| --- | --- | --- |
| Sites (white-label) | P4 — demo sites, templates | Not in schema |
| Templates + customization | P4 — rapid site standup | Not in schema |
| Client intake | P4 — onboarding wizard | Not in schema |
| Onboarding wizard state | P4 — maps to site fields | Not in schema |
| Products/Programs | P1 — curriculum purchase | Not in schema |
| Pricing tiers + service bundles | P4 — sales flow | Not in schema |
| Bracket system | P3 — tournament brackets | Division/Registration exist; bracket management does not |
| Match formats | P3 — bracket types | Partially in Tournament schema |
| Rule set association | P3 — multi-rule-set | Not in schema |
| Fight records (per-discipline) | All — fighter records across arts | Not in schema |
| Instructor lineage | P2 — BBL core feature | Not in schema |
| Referee/judge courses | P3 — tournament staffing | Not in schema |
| Scoring systems | P3 — per-format scoring | Not in schema |

## What exists today (S1–S5 complete)

- 31 Prisma models, all enums
- User + Passport + DirectoryProfile (S2)
- Organization CRUD + membership + join flow (S3)
- Directory search with privacy filters (S4)
- 12 disciplines, 13 rank systems, 194 ranks seeded (S5/S1)
- Tournament + TournamentDiscipline + Division + Registration + RegistrationEntry (schema only, no UI)

## Gap analysis: 20 days to launch

| Sprint | Planned work | Days needed (est.) | Launch-critical? |
| --- | --- | --- | --- |
| S6 | Course + CurriculumItem CRUD | 3–4 | Yes (P1) |
| S7 | Progress awarding + gamification | 3–4 | Yes (P1) |
| S8 | Tournament create wizard | 2–3 | Yes (P3) |
| S9 | Registration + RegistrationEntry + snapshots | 2–3 | Yes (P3) |
| S10 | Payments + capacity + waitlist | 3–4 | Yes (P1, P3) |
| S11 | All brand themes + marketing pages | 3–4 | Yes (all) |
| S12 | Deploy + smoke test | 1–2 | Yes (all) |
| NEW | Schema additions (sites, templates, onboarding, products, brackets, scoring, lineage) | 5–8 | P2–P4 |
| NEW | BBL data migration | 2–3 | P2 |
| NEW | White-label + onboarding wizard UI | 5–8 | P4 |
| **Total** | | **~30–42 days** | — |

**Assessment:** 30–42 days of work in 20 calendar days. This requires either parallel work streams, scope cuts for launch, or a phased rollout within the May 18 date (P1 fully functional, P2–P4 with landing pages + coming-soon).

## Recommended launch strategy

### Option A: Staggered launch (recommended)

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

## SESSION_0020 scope

SESSION_0020 should be a Petey deep dive covering:

1. **Schema needs pass** — reconcile `SCHEMA_NEEDS_MANIFEST.md` against current schema; identify every missing model/enum/relation
2. **Per-brand feature matrix** — exact features each brand needs for launch, with done/not-done status
3. **Launch strategy decision** — Option A/B/C above, with Brian's sign-off
4. **Sprint replan** — rewrite S6–S12 scope against the May 18 date
5. **Parallel workstream plan** — if multiple agents/sessions can work in parallel, define the worktree split
6. **Cache strategy finalization** — ADR 0010 decision must be locked for production (currently `proposed`)

## Open questions for Brian

1. Is May 18 a hard deadline or a target? What's the consequence of slipping?
2. Are you comfortable with Option A (staggered) or does it have to be Option B (everything May 18)?
3. Do you have additional developers, or is this single-operator + AI agents?
4. Is `SCHEMA_NEEDS_MANIFEST.md` the complete spec, or is there more from the ChatGPT sessions?
5. For P4 (Ronin Dojo Design) — how much of the white-label/onboarding/template system is launch-critical vs. post-launch?
