---
title: "WORKFLOW 5.0 — Launch Operating System"
slug: workflow-5
type: protocol
status: active
created: 2026-04-28
updated: 2026-05-24
last_agent: copilot-session-0241
pairs_with:
  - docs/rituals/opening.md
  - docs/rituals/closing.md
  - docs/architecture/s2-schema-additions.md
  - docs/architecture/dirstarter-commerce-alignment.md
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# WORKFLOW 5.0 — Launch Operating System

Governing operating system for every session from SESSION_0021 forward. Supersedes the older sequential sprint model. Synthesized from the ChatGPT deep research brief and Launch OS document.

**Source docs:**

- `docs/architecture/source/Ronin-Dojo-Launch-Deep-Research-Brief.md`
- `docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md`

---

## Five hard rules

1. Every session begins with a **Dirstarter-baseline check**
2. Every session is scoped to **one primary lane**, max **three deliverables**
3. Every deliverable is scored against the **10-point rubric**
4. Every deliverable gets max **three review passes** in one session
5. Anything under **9.5/10** after pass three → fresh follow-up session, not hidden debt

---

## Session lifecycle

| Block | Purpose | Owner |
| --- | --- | --- |
| Bow-in audit | Read opening ritual, confirm scope, Dirstarter baseline, previous session carryover | Petey |
| Dirstarter alignment | Fill alignment table (see below) | Petey |
| Lane selection | One primary lane, optional one dependent sub-lane | Petey + Giddy |
| Worktree plan | Name worktree, branch intent, PR target, merge dependency | Giddy |
| Deliverables | No more than three concrete outputs | Petey |
| Review pass loop | Up to three passes with score and fix list | Cody, Doug, Desi, Brandon, Giddy |
| Closure | Record score, debt, next-session intent, launch-board state | Petey |

### Dirstarter alignment table (required per session)

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth, DB, storage, monetization, content, theming, i18n, or deployment |
| Extension or replacement | Does this session extend an existing Dirstarter layer or replace part of it? |
| Why justified | Short rationale tied to launch needs |
| Risk if bypassed | Migration risk, inconsistency risk, or downstream maintenance risk |

---

## Score rubric (10-point weighted)

| Category | Weight | Failure condition |
| --- | ---: | --- |
| Dirstarter alignment | 2.5 | Session bypasses an existing baseline capability without justification |
| Data and architecture integrity | 2.0 | Schema, migration, or tenancy logic is incomplete or contradicts prior decisions |
| Lifecycle coverage | 1.5 | Core user journey for that lane is not demonstrably served |
| Test evidence | 2.0 | No credible unit, integration, e2e, or QA plan for the change |
| Merge and docs readiness | 1.0 | PR notes, ADR notes, or session notes are missing |
| Launch usefulness | 1.0 | Work does not materially move a May 18 launch deliverable |

**Hard caps:**

- Fail on Dirstarter alignment OR data integrity → score capped at **8.9**
- Under 9.5 after pass three → rolls to fresh session

---

## Review pass loop

```text
Pass 1: Architecture + schema review (Cody, Giddy)
  → Score? ≥ 9.5 → Close session
  → < 9.5 → fix list → Pass 2

Pass 2: UX, QA, lifecycle review (Doug, Desi)
  → Score? ≥ 9.5 → Close session
  → < 9.5 → fix list → Pass 3

Pass 3: Polish, hardening, docs (Brandon, all)
  → Score? ≥ 9.5 → Close session
  → < 9.5 → Create fresh follow-up session
```

---

## Persona responsibilities

| Persona | Role | Key outputs |
| --- | --- | --- |
| **Petey** | Orchestrator | Session scope, lane selection, launch definition per brand, score gate |
| **Giddy** | Architecture + Git strategy | Worktree boundaries, branch strategy, merge gates, Dirstarter compliance |
| **Cody** | Implementation + code review | Code quality gate, no route hacks, no UI without backend contracts |
| **Doug** | QA + release readiness | Failure modes, test gates, migration rehearsal, release checklists |
| **Desi** | UX + design consistency | Screen→backend contract verification, component review |
| **Brandon** | Brand + marketing rollout | Launch narrative, messaging per brand, social cadence |

---

## Worktree map

| Worktree | Responsibility |
| --- | --- |
| `wt-core-platform` | auth, tenancy, schema, migrations, shared DAL |
| `wt-school-ops` | memberships, schedules, attendance, billing, family workflows |
| `wt-tournaments` | events, registration, brackets, scoring, rankings |
| `wt-brand-launch` | content, theming, SEO, landing pages, launch assets |
| `wt-qa-hardening` | test harness, fixtures, seeds, release checks |

**Rule:** Only one primary lane in flight per session. Everything else is blocked, queued, or done.

---

## Lane model

| Lane | Owns | Brand impact | Lead reviewers |
| --- | --- | --- | --- |
| Core platform | tenancy, authz, schema, migrations, shared services | all brands | Petey, Giddy, Cody |
| School operations | leads, members, households, programs, attendance, billing, waivers | Baseline → BBL | Cody, Doug |
| Tournament operations | events, registrations, brackets, scoring, officials, results | WEKAF → Baseline events | Giddy, Doug |
| Content and curriculum | articles, curriculum, certifications, media, SEO pages | BBL + Baseline | Desi, Brandon |
| White-label + brand ops | themes, org setup, demos, launch pages, sales collateral | Ronin Dojo Design | Brandon, Desi |
| Launch and support | analytics, release checklists, incident handling, social cadence | all brands | Brandon, Doug, Petey |

---

## Launch strategy: Option A-plus

All brands targeted for May 18, 2026 launch with **differentiated depth**. **Actual status (2026-05-24): 6 days past target.** Baseline and BBL are furthest along; WEKAF and Ronin Dojo Design are content/theme shells only.

| Brand | Priority | Launch depth |
| --- | --- | --- |
| **Baseline Martial Arts** | P1 | Most complete operational brand — full member lifecycle, scheduling, attendance, billing, belt testing |
| **Black Belt Legacy** | P2 | Migration-critical and community-critical flows — lineage, curriculum, certifications, member profiles |
| **WEKAF** | P3 | Real registration and bracket visibility — not a full long-tail tournament rules engine |
| **Ronin Dojo Design** | P4 | Assisted white-label sales and onboarding — not fully self-serve wizard |

---

## Session calendar

> **Consolidated SESSION_0241.** The 200+ row session calendar (SESSION_0021–0155) is archived. It was never read by agents — they all read the latest SESSION file. The calendar served as a historical audit trail but added 200 lines of stale context to every agent's read.
>
> **Current state:** SESSION_0221+ are the active window in `docs/sprints/`. SESSION_0001–0220 are archived in `docs/sprints/_archive/`. Each SESSION file carries its own date, lane, goal, and outcome — that IS the calendar.
>
> **Launch status:** 6 days past May 18, 2026 target. Every session must ship product.

---

---

## Schema migration waves

| Wave | Models | Session target / status |

| Wave | Models | Session target / status |
| --- | --- | --- |
| **Wave A — School ops** | Program, ProgramEnrollment, ProgramCourse, ClassSchedule, ClassInstructorAssignment, ClassSession, CheckIn, Attendance, FamilyGroup, FamilyMember, PricingPlan, Invoice, InvoiceLineItem, Payment, MembershipContract, OrgSettings, OrgRelationship, StripeAccount, PayoutSplit, PromoCode | Landed SESSION_0023 |
| **Wave B — Promotions + events** | BeltTestEvent, BeltTestRegistration, BeltTestPrerequisiteConfig, NotificationPreference, Announcement, Invite, InviteClaim, Event, EventRegistration, Lead, LeadFollowUp | Landed SESSION_0026 |
| **Wave C — Tournament execution** | Bracket, Match, MatchCompetitor, FightRecord, AuditLog, RuleSet, WeighInRecord, MatAssignment | Landed SESSION_0026 |
| **Wave D — Media, techniques, certificates, gamification** | Media, MediaAttachment, Technique, TechniquePrerequisite, TechniqueCurriculumLink, TechniqueProgress, CertificateTemplate, CertificateOrder, CertificateIssuance, Favorite, StudentList, StudentListMember + gamification FK additions | Landed SESSION_0026 |
| **Migration hardening** | Durable Prisma migrations, partial unique indexes for nullable business rules, staging rehearsal, rollback plan | Target SESSION_0038 before staging deploy |

---

## Four lifecycles to validate

1. **Prospect → Member**: Lead → Trial → Household → Waiver/Contract → Enrollment → Attendance → Billing → Promotion → Retention
2. **Coach → Admin**: Permissions → Org assignment → Class control → Promotion authority → Audit trail
3. **Athlete → Event**: Discover → Eligibility → Register → Pay → Check-in → Bracket → Compete → Results → Rankings
4. **White-label onboarding**: Qualify → Tenant → Theme → Seed → Demo → Launch

---

## Test gates (Doug owns pass/fail)

| Test layer | Must prove before score > 9.5 |
| --- | --- |
| Schema + migration | Models migrate cleanly, seed data works, rollback path exists |
| Permissions | Org, role, household, coach, admin, staff scopes enforced |
| Billing | Trial→paid, failed payment, refund, cancellation, resubscribe |
| Events | Registration, eligibility, bracket creation, score submission, result publication |
| Content | Public pages render by brand, SEO metadata present, drafts stay private |
| Cross-brand UAT | All four brands complete a core journey |
| Release ops | Storage, emails, analytics, monitoring, support playbooks operational |

---

## Launch board

```text
BACKLOG
  [White-label self-serve wizard] [Full multi-sport rules engine]
  [Deep scoring/referee workflows] [App-level BJJBuddy-plus analytics]
  [Ranking series] [Athlete journal/HealthKit]
  [Usage-based billing / credits lifecycle (velobase-harness pattern)]
  [BullMQ background workers (velobase-harness pattern)]
  [Anti-abuse guardrails / rate limiting (velobase-harness pattern)]
  [Affiliate/referral engine (velobase-harness pattern)]

NOW — SHIP PRODUCT (6 days past May 18 target)
  [Lineage public parity chrome (SESSION_0240 on Codex)]
  [Repo cleanup + workflow refinement (SESSION_0241)]

NEXT
  [BBL lineage foundation slice — published tree queries + SSG]
  [Baseline public pages content fill]
  [Multi-brand theme polish (all 4 brands)]

READY FOR LAUNCH
  [S1-S4 identity/org/directory/tournament foundation]
  [Schema Waves A-D validated locally]
  [Commerce entitlement layer landed]
  [Governance close gates restored]
  [Launch strategy Option A-plus]
  [Dirstarter alignment: 8/10 confirmed]
  [E2E tournament flow verified]
  [Course + CurriculumItem admin CRUD — landed SESSION_0040]
  [Membership lifecycle transitions — landed SESSION_0145]
  [Invite CRUD + claim flow — landed SESSION_0147]
  [Membership admin list/detail + role assignment — landed SESSION_0148–0149]
  [Membership transition audit trail + tests — landed SESSION_0150–0151]
  [Optimistic locking: Membership (0152) + Registration (0154) + Bulk registration (0155)]
  [P2028 transaction fix — landed SESSION_0154]
  [Dashboard private chrome — landed SESSION_0239]
  [Public parity uplift: disciplines, schools, courses, programs, orgs, passports — landed SESSION_0234–0238]
  [Sprint docs archived (0001–0220) — SESSION_0241]

POST-LAUNCH
  [Full self-serve white-label templating]
  [Advanced competition rulesets + scoring]
  [Deeper mobile athlete intelligence]
  [Cross-brand analytics + automation]
  [Rate limiting + anti-abuse hardening]
  [Background worker infrastructure (email, imports, scoring)]
```

---

## Cross-references

- [Opening ritual](../rituals/opening.md)
- [Closing ritual](../rituals/closing.md)
- [S2 Schema Additions](../architecture/s2-schema-additions.md)
- [Launch Plan](../architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md)
- [Deep Research Brief](../architecture/source/Ronin-Dojo-Launch-Deep-Research-Brief.md)
- [Launch OS Source](../architecture/source/Launch-OS-Baseline-Martial-Arts-.md)
- [Program Plan](../architecture/program-plan.md) — superseded by this workflow for session scheduling
- [Petey](../agents/petey.md), [Cody](../agents/cody.md) — primary execution roles
