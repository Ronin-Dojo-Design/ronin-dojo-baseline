---
title: "WORKFLOW 5.0 — Launch Operating System"
slug: workflow-5
type: protocol
status: active
created: 2026-04-28
updated: 2026-05-13
last_agent: copilot-session-0155
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

## Session calendar (SESSION_0021–0093, with forward plan)

> **Calendar reconciled SESSION_0093_TASK_03.** Rows 0021–0092 reflect actuals at a planning-summary level. Forward plan re-set for commerce hardening → PWCC → four-brand launch surfaces before the May 18, 2026 launch goal.

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
| May 3 actual | 0035 | School operations (planning) | Entitlement-first commerce plan: resolved 4 open questions, 7-task breakdown for implementation. No code. |
| May 3–4 actual | 0036 | School operations | Entitlement implementation (schema + service layer + webhook wiring) |
| May 4 actual | 0037 | School operations | Lead intake + trial conversion + CRM follow-up |
| May 4 actual | 0038 | School operations | Lead intake admin UI (admin CRUD + DataTable + forms + detail) |
| May 4 actual | 0038.5 | School operations | Lead intake hostile review remediation (publicActionClient, brand scoping, audit, smoke script, email template) |
| May 4 actual | 0039 | Core platform governance | Dirstarter Baseline Index (300+ template files cataloged, divergence audit) |
| May 4 actual | 0040 | Content + curriculum | Course + CurriculumItem admin CRUD, Certificate template admin CRUD |
| May 4 actual | 0041 | Content + curriculum | Technique library public pages (list + detail + filters + components) |
| May 4 actual | 0041.5 | Content + curriculum | Integration tests for technique queries (brand isolation, filter combos) |
| May 4 actual | 0042 | Tournament ops | Admin CRUD (tournaments + divisions) + public list + detail |
| May 4 actual | 0043 | Tournament ops | Registration checkout: capacity check + Stripe + webhook fulfillment |
| May 4 actual | 0044 | Tournament ops | RegisterButton wiring + success banner + admin registration list |
| May 4 actual | 0045 | Tournament ops | Free-path registration + admin links + TS fixes |
| May 4 actual | 0046 | Tournament ops | Cancel registration + Stripe refund |
| May 4 actual | 0046.5 | Tournament ops | stripePaymentIntentId storage + serializable transaction capacity fix |
| May 4 actual | 0047 | Tournament ops | Admin registration approval workflow (status transitions + bulk actions + L1 rewrite) |
| May 4 actual | 0048 | Tournament ops | Bracket/match generation + F-03 brand-scoping remediation |
| May 4 actual | 0049 | Tournament ops | Match scoring + bracket advancement + auto-BYE |
| May 4 actual | 0050 | Tournament ops | L1 refactor: ScoreMatchForm + MatchCard → Dirstarter primitives, 10-point must scoring, auto-TKO |
| May 4 actual | 0051 | Core platform governance | Deep Dirstarter L1 audit + component inventory |
| May 4 actual | 0052 | L1 refactor | P1+P2+P3 L1 violation fixes (divisions-editor, registrations-table, tournament-card, admin scaffolding) |
| May 4 actual | 0053 | Commerce | Stripe products (16) + entitlement admin CRUD + PricingPlan admin CRUD |
| May 4 actual | 0054 | Commerce | Enrollment checkout + webhook fulfillment + user dashboard |
| May 4 actual | 0055 | School operations | Lead intake + trial conversion + CRM follow-up |
| May 4 actual | 0056 | Content + curriculum | Course publishing + certificate issuance + technique→curriculum linking + media gallery |
| May 4 actual | 0057 | P0–P2 remediation | Hostile-close remediation: brand scoping, Passport display, server boundaries |
| May 4 actual | 0058 | P0–P2 remediation | Registration snapshot fields + admin auth HOC hardening |
| May 4 actual | 0059 | P0–P2 remediation | Cache pattern upgrade + enrollment Passport check + drift close |
| May 4 actual | 0060 | Hostile-close review | Cross-session hostile-close audit (6 P1, 1 P2, 3 P3) |
| May 4 actual | 0061 | School operations governance | P1 brand-scoping fixes + white-label/brand-ops Petey plan. *(closed-unclean — recovered SESSION_0073)* |
| May 4 actual | 0062 | Brand launch | Brand-aware site config + martial-arts navigation overhaul (WP-1 + WP-2). *(closed-unclean — recovered SESSION_0073)* |
| May 4 actual | 0063 | Core platform | SubscriptionTier + UserBrandSubscription admin CRUD; entitlement wiring |
| May 4 actual | 0064 | Core platform governance | Defensive wiring close-out + component inventory enforcement |
| May 4 actual | 0065 | Brand launch | Homepage + hero overhaul (Baseline Martial Arts) (WP-3) |
| May 4 actual | 0066 | Core platform (planning) | Petey plan: Tool→Listing pattern repurposing (Techniques/Profiles/Schools) + ADR 0013. *(closed-unclean — recovered SESSION_0073)* |
| May 4 actual | 0067 | Directory | DirectoryProfile slug field + member detail page. *(closed-unclean — recovered SESSION_0073)* |
| May 4 actual | 0068 | Dashboard | Dashboard tabs (Profile, School, Techniques). *(closed-unclean — recovered SESSION_0073)* |
| May 4 actual | 0069 | Directory | Technique CRUD + card components + filters |
| May 4 actual | 0070 | Directory | Public listing pages + server queries |
| May 4 actual | 0071 | Directory | Member/school detail pages + auth integration |
| May 4 actual | 0072 | Core platform governance | Card-to-detail link verification + 20 pre-existing TS errors fixed (closed-full 7/10) |
| May 4 actual | 0073 | Core platform governance | **This session.** Unclean-close recovery (5 sessions); Organization.description schema; member/school filter actions; DirectoryProfile slug auto-generation; hostile review of last 12 sessions; calendar reconciliation skeleton. |
| **May 5 actual** | **0074** | **Core platform governance** | **Lookup-system rebuild: project-log backfill, failed-steps audit, tournament-ops concept page, calendar reconciliation, 17 unclean-close recoveries, closing.md atomicity, slug backfill, Dirstarter uplift backlog. Closes S2.** |
| May 5 actual | 0075 | Tournament operations (S3) | TournamentRole/StaffAssignment, WeighIn, and RuleSet CRUD completion lane started |
| May 5 actual | 0076 | Tournament operations (S3) | Admin UI for TournamentRole, StaffAssignment, WeighIn, and RuleSet |
| May 5 actual | 0077 | Core platform + tournament ops | Google OAuth setup plus remaining S3/tournament work assessment and deployment prep |
| May 5 actual | 0078 | Tournament operations (S3) | Results page, RuleSet wiring, and seeding strategies landed |
| May 5 actual | 0079 | Tournament ops + governance | Tournament director role, Giddy import, and porting-awareness notes |
| May 6 actual | 0080 | Tournament operations (S3) | Manual seed editor UI |
| May 6 actual | 0081 | Tournament operations (S3) | Manual seed editor polish and integration tests |
| May 6 actual | 0082 | Tournament operations hardening | Tournament registration capacity-race planning/test lane |
| May 6 actual | 0083 | Tournament operations hardening | Free-path capacity race tests with real fixtures |
| May 6 actual | 0084 | Tournament operations hardening | Stripe webhook harness plus paid-path oversubscription proof |
| May 6 actual | 0085 | Tournament operations hardening | Paid-path webhook capacity re-check + refund fix |
| May 6 actual | 0086 | Tournament operations hardening | Refunded-paid customer UI smoke and cancel/refund regressions |
| May 6 actual | 0087 | QA hardening | S3 tournament launch hardening: TS fixes, brand isolation tests, WeighIn integration, results smoke |
| May 6 actual | 0088 | QA hardening | Playwright E2E infrastructure and first athlete lifecycle tests |
| May 6 actual | 0089 | QA hardening | Fixed `register.ts` schema `"use server"` export bug |
| May 6 actual | 0090 | QA hardening | Admin bracket and scoring E2E tests |
| May 6 actual | 0091 | QA hardening | Full E2E suite triage: 9 pass, 3 skips, 0 fail |
| May 6 actual | 0092 | QA hardening | Seed tournament fixture + Better-Auth cookie signing; 12/12 E2E passing |
| May 7 actual | 0093 | Commerce planning | Petey plan: commerce structures first, then PWCC, then brand/content rollouts; workspace normalized away from WP public root |
| May 7 actual | 0094 | Commerce | Commerce truth reconciliation: monetization spec and MB-013 now match landed entitlement schema; payment proof targets staged |
| May 7 actual | 0095 | Commerce QA | One-time and subscription Checkout/webhook entitlement proof landed; tournament webhook now retries serializable write conflicts |
| May 7 actual | 0096 | Commerce implementation | Stripe customer mapping, Customer Portal action, processed-event dedupe, non-tournament ledger projection, and subscription/refund/dispute lifecycle proof landed |
| May 8 actual | 0097 | Commerce hardening | Protected Ronin paid-access checkout action with server-derived user/brand/org/plan metadata proof |
| May 9 target | 0098 | Commerce hardening | Stripe webhook operations monitor plus payment/entitlement drift audit; manual MB-013 launch checklist staged |
| May 10–11 target | 0099 | Commerce hardening or PWCC | Manual/admin payment parity if Brian keeps it in paid launch scope; otherwise first PWCC component discovery and port-map records |
| May 11–12 target | 0100 | Brand launch | Four-brand launch-definition matrix and content checklist |
| May 13–15 target | 0101 | Brand launch + PWCC | First launch-surface component/content port with Playwright proof |
| May 16 target | 0102 | QA hardening + launch | Cross-brand UAT, remaining MB-013 signoff, migration/deploy rehearsal |
| May 17 target | 0102 | Launch readiness | Freeze, rollback drill, support playbook, env/domain proof |
| May 18 target | 0103 | Launch day | Release execution, monitoring, and triage for all four brands |
| **S5 forward plan (approved SESSION_0134)** | | | |
| May 11 actual | 0134 | Governance + QA | Dirstarter 10-area alignment audit, hostile review (0130+0133), E2E tournament QA, S5 scope planning. Closed-full. |
| May 12 target | 0135 | QA hardening | Dev-login guard test, upsertDivision test, registration concurrency test. Close findings 0133-01/02/03 + 0134-02. |
| May 12 target | 0136 | Blog DB migration | Add Post model to schema, run migration, migrate MDX content, wire admin CRUD |
| May 13 target | 0137 | QA hardening | Fix school-ops test failure (triage + fix) |
| May 13–14 target | 0138–0139 | Content + curriculum | Course + CurriculumItem admin CRUD (server actions + admin pages) |
| May 14–15 target | 0140–0141 | Content + curriculum | Public course pages + course enrollment (entitlement-gated) |
| May 15–16 target | 0142–0143 | Brand launch | Multi-brand theme polish (per-brand tokens, branded nav/footer for all 4 brands) |
| May 16–17 target | 0144–0145 | School operations | Membership lifecycle transitions + invite flow |
| May 17 target | 0146 | QA hardening + launch | Full hostile review + QA hardening pass (all brands) |
| May 18 target | 0147 | Launch day | Vercel/Neon staging deploy, final smoke test, go/no-go for all four brands |
| **S6 actuals (SESSION_0134+)** | | | |
| May 12 actual | 0140 | School operations | Program Admin CRUD server layer + pages |
| May 12 actual | 0141 | School operations | Program Admin UX Polish: Picker Components + ProgramCourse Join |
| May 12 actual | 0142 | School operations | ProgramWaiver Join Management + ComboboxSelector Reuse Audit |
| May 12 actual | 0143 | School operations | ComboboxSelector Upgrade for Admin FK Fields + TS Error Fixes |
| May 12 actual | 0144 | School operations | Program Structure + Pricing Architecture (AgeGroup, SkillLevel, Punch Cards) |
| May 12 actual | 0145 | School operations | PricingPlan Form UI + Membership Lifecycle Transitions |
| May 12 actual | 0146 | Governance | Hostile Close Review + SOP Cross-Reference (0140–0145) |
| May 12 actual | 0147 | School operations | Invite Admin CRUD + Claim Flow |
| May 12 actual | 0148 | School operations | Membership Admin List Page + Invite Email |
| May 12 actual | 0149 | School operations | Membership Detail Page + Role Assignment Management |
| May 12 actual | 0150 | School operations | Membership Transition Audit Trail + Integration Tests |
| May 12 actual | 0151 | School operations | Membership Scalability Hardening: Concurrency + Audit Resilience + E2E Plan |
| May 12 actual | 0152 | School operations | Optimistic Locking for Membership Transitions |
| May 12 actual | 0153 | QA hardening | E2E Playwright Tests for Membership Admin |
| May 13 actual | 0154 | Tournament ops + governance | P2028 Transaction Fix + Registration Optimistic Locking |
| May 13 actual | 0155 | Tournament ops + planning | Bulk Registration Optimistic Locking + Course CRUD Planning |

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
  [Course enrollment + curriculum completion server layer]
  [Public course pages + enrollment UI]

NEXT
  [Multi-brand theme polish (all 4 brands)]
  [Membership lifecycle + invite flow — LANDED 0145–0149]
  [Invoice optimistic locking]

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
