---
title: "WORKFLOW 5.0 — Launch Operating System"
slug: workflow-5
type: protocol
status: active
created: 2026-04-28
updated: 2026-05-01
last_agent: claude-session-0031
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

All brands go publicly live on May 18, 2026, with **differentiated depth**:

| Brand | Priority | Launch depth |
| --- | --- | --- |
| **Baseline Martial Arts** | P1 | Most complete operational brand — full member lifecycle, scheduling, attendance, billing, belt testing |
| **Black Belt Legacy** | P2 | Migration-critical and community-critical flows — lineage, curriculum, certifications, member profiles |
| **WEKAF** | P3 | Real registration and bracket visibility — not a full long-tail tournament rules engine |
| **Ronin Dojo Design** | P4 | Assisted white-label sales and onboarding — not fully self-serve wizard |

---

## Session calendar (SESSION_0021–0040)

This table is reality-adjusted as of SESSION_0029. Completed sessions show the actual outcome; future sessions show target outcomes. The May 18 launch target remains fixed.

| Date / target | Session | Primary lane | Main outcome |
| --- | --- | --- | --- |
| Apr 29 actual | 0021 | Core platform | Superseded planning stub; Wave A scope absorbed by SESSION_0023 |
| Apr 28 actual | 0022 | Core platform | Schema Pass 4 grill, migration SOP, runbook inventory |
| Apr 29 actual | 0023 | Core platform | Schema Wave A landed; task/review logs introduced |
| Apr 29 actual | 0024 | Core platform governance | Hostile close review protocol wired into closing |
| Apr 29 actual | 0025 | Core platform governance | Full-close proof contract, wiki-lint close evidence, branch push |
| Apr 28 actual | 0026 | Core platform | Traceability cleanup; Schema Waves B/C/D landed; process failure logged |
| Apr 28 actual | 0027 | Core platform governance | Governance audit; logs merged; FS-0006/FS-0007 mitigated |
| Apr 29 actual | 0028 | School operations | Calendar re-sequence; Program CRUD with auth and brand scoping |
| Apr 30 actual | 0029 | Core platform governance + monetization | Commerce learning path specs; raw source preserved; School CRUD continuation pushed one session |
| Apr 30 actual | 0030 | Core platform governance | Hostile review + security/privacy/payments/monitoring plan; `security-privacy-payments-monitoring-plan.md` and MB-013 landed; class schedule implementation pushed one session |
| Apr 30 actual | 0031 | School operations | Class schedules + sessions + instructor assignments executed with all 11 SESSION_0030 security gates verified; closed-full at WORKFLOW rubric 10/10 / Kaizen aggregate 7/10 |
| May 1 target | 0031.5 | Core platform governance + School operations | Schedule slice hardening: pagination + status filter, action-level test for gates 4/9, Cody pre-flight protocol update, dev-environment runbook, materialize instrumentation, DST + concurrency tests. Kaizen aggregate must reach ≥ 9 before SESSION_0032 begins. |
| May 1–2 target | 0032 | School operations | Attendance/check-in flows and staff class-control surface (gated on SESSION_0031.5 Kaizen ≥ 9) |
| May 3 actual | 0033 | School operations | Program enrollments, family groups, waivers, trial lifecycle; closed-full 9.7/10 |
| May 3 actual | 0034 | Core platform governance | Merge-train: landed SESSION_0032+0033 branches, authored merge-to-main protocol, failed-steps FS-0010–0013, WORKFLOW calendar update. No feature code. |
| May 4 target | 0035 | School operations | Entitlement layer, pricing plans, contracts, invoices, Stripe account wiring (entitlement-first per ADR 0011) |
| May 5 target | 0036 | School operations | Lead intake, trial conversion, CRM follow-up states |
| May 6 target | 0037 | Tournament operations | Event discovery, registration checkout, rosters, check-in |
| May 7 target | 0038 | Tournament operations | Brackets, match ops, mat assignment, scoring, live results |
| May 8 target | 0039 | Content + curriculum | Curriculum, techniques, media, certificates, publishing surfaces |
| May 9 target | 0040 | Brand launch | Baseline/BBL/WEKAF/RDD public surfaces, sample orgs, seed content |
| May 10-17 target | 0040 | QA hardening + launch support | E2E lifecycle tests, fixtures, migration artifacts, staging deploy, email/storage/analytics, rollback drill, launch calendar lock |
| May 18 target | 0041 | Launch day | Release execution, monitoring, support, post-launch triage |

---

## Schema migration waves

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

NOW
  [Class schedules + sessions]
  [Entitlement layer]
  [School Ops auth predicates per feature]

NEXT
  [Attendance/check-in]
  [Program enrollments + trials + family groups]
  [Pricing/contracts/invoices]

READY FOR LAUNCH
  [S1-S4 identity/org/directory foundation]
  [Schema Waves A-D validated locally]
  [Commerce learning path specs]
  [Governance close gates restored]
  [Launch strategy Option A-plus]

POST-LAUNCH
  [Full self-serve white-label templating]
  [Advanced competition rulesets + scoring]
  [Deeper mobile athlete intelligence]
  [Cross-brand analytics + automation]
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
