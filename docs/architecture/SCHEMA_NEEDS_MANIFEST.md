---
title: Schema Needs Manifest
slug: schema-needs-manifest
type: file
status: deprecated
created: 2026-04-25
updated: 2026-04-28
last_agent: copilot-session-0020-preflight
pairs_with:
  - docs/architecture/s2-schema-additions.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/architecture/launch/2026_05_18_PRODUCT_LAUNCH_ALL_BRANDS.md
needs_fix:
  - "Superseded by s2-schema-additions.md — all gaps addressed in Passes 1–3"
---

> **⚠️ DEPRECATED** — This was Brian's raw intake notes from early planning. All schema gaps identified here have been resolved in [s2-schema-additions.md](s2-schema-additions.md) (38 new models, 29 new enums across 3 passes). Kept for historical reference only. Do not use as a planning input.

## Traceability: original requirement → resolved model

| Brian's original requirement | Resolved by | s2-schema-additions section |
| --- | --- | --- |
| Brands | `Brand` enum (S1, live) | — |
| Sites (white-label demos) | ⏳ POST-LAUNCH (Option A-plus) | — |
| Templates + customization | ⏳ POST-LAUNCH | — |
| Client intake / onboarding wizard | ⏳ POST-LAUNCH (RDD P4) | — |
| Users/Members (roles, ranks, disciplines) | User, Passport, Membership, Rank, Discipline (S1, live) | — |
| Products/Programs | Program, ProgramCourse, ProgramEnrollment | § 2.1 |
| Pricing tiers/options | PricingPlan, SubscriptionTier | § 2.4 |
| Tournament divisions | Division (S1, live) | — |
| Tournament brackets | Bracket, Match, MatchCompetitor | § 7.4 |
| Weight classes per division | Division.weightMin/weightMax (S1, live) + WeighInRecord | § 10.3 |
| Rule set association | RuleSet + TournamentDiscipline.ruleSetId | § 10.3 |
| Fight records (per-discipline) | FightRecord | § 7.5 |
| Instructor lineage | LineageNode + LineageRelationship + INSTRUCTOR_STUDENT enum | § 4 |
| Coaching certification courses | Course + CertificationType.COACH (S1, live) | — |
| Scoring systems | RuleSet.scoringConfig + ScoringMethod enum | § 10.3 |
| Referee/judge courses | Course + TournamentRole.JUDGE (S1, live) | — |
| Class scheduling / attendance | ClassSchedule, ClassSession, CheckIn, Attendance | § 2.1 |
| Belt testing | BeltTestEvent, BeltTestRegistration, BeltTestPrerequisiteConfig | § 2.2 |
| Family / guardian | FamilyGroup, FamilyMember | § 2.3 |
| Invoicing / billing | Invoice, InvoiceLineItem, Payment | § 2.4 |
| Stripe Connect | StripeAccount, PayoutSplit | § 2.4 |
| Contracts | MembershipContract | § 2.5 |
| Notifications | NotificationPreference, Announcement | § 2.6 |
| Org network (affiliation) | OrgRelationship | § 2.7 |
| Promo codes | PromoCode | § 2.4 |
| Lead / CRM | Lead, LeadFollowUp | § 10.2 |
| Audit trail | AuditLog | § 7.6 |
| Invitations / QR | Invite, InviteClaim | § 7.2 |
| Generic events (seminars, camps) | Event, EventRegistration | § 7.3 |
| Mat/ring assignment | MatAssignment | § 10.3 |

---

## Original raw notes (archived)

Project Overview:
- Architecture: mo-fi wireframes for data structure and end-to-end user registration/lifecycle
- Current work: building schema, enums, and tables for ranks, disciplines, roles, members, etc.

Brand & White-label Sites:
- ronindojodesign.com
  - Needs a record for ronindojodesign.com itself
  - Must include sales and demo preview white-label sites
  - Support templates and customization for quick on-the-spot sales demonstrations
- Other brands to exist individually inside system:
  - baselinemartialarts.com
    - Serves as white-labeled SaaS ready to purchase and populate
    - Can be used as a program/certification affiliation (Baseline Martial Arts curriculum available for clients to buy and learn)
  - tuffbuffs.com (legacy site that we are basing Baseline off of, not copying exactly (rebrand/refine improve, can’t advertise that we are connected with CU Boulder directly, no links to rec center registration anymore, we have to switch to Baseline Martial Arts)
  - WEKAF USA (tournament organization/league)
  - All white labeled/ronindojodesign needs to be generic template and customizable to client/my needs (lifecycle end-to-end user needed for all brands and for generic)
  - Additional brands (Sensei Jays, NASKA, clients might have any type of martial art/workout/yoga/fitness/mental health/meditation tracking, training, course sales etc.) implied

Client Intake & Onboarding:
- Client intake information to capture: client details, needs, wants
- Client onboarding wizard:
  - Funnels intake data into a custom template site
  - Pre-populates all site fields (including header) with onboarding info
  - Presents pricing tiers and options based on client choices
  - Sales onboarding wizard to display available options for:
    - Posting
    - Maintenance
    - Build vs. custom build
    - Assistance vs. do-it-yourself

Templates & Customization:
- Templates should allow:
  - Quick population with client onboarding data
  - Further customization and template application per brand/white-label
- Support for demo/preview white-labels to show customization options live

Pricing & Sales Flow:
- Pricing tiers and options determined by onboarding choices
- Immediate visibility of available services based on selections
- Options to combine services (posting, maintenance, builds, custom work)

Tournament & Competition Schema Requirements:
- WEKAF USA site and app: league-style tournament management for martial arts tournaments, specific for WEKAF but can work for any of the following, customizable tournament software/site/app
  - Support multiple formats: single elimination, double elimination, round robin, grand championship (winners of divisions feed into grand championship)
  - Bracket management (e.g., eight brackets)
  - Weight classes per division
  - Division types: single stick, double stick, forms, traditional, open, live stick
- Support for multiple rule sets and organization-specific divisions:
  - Jiu-Jitsu: IBJJF, Fight2Win, NAGA (different divisions/weight categories)
  - Karate: NASKA, NBL, Sensei Jay Farrell and his documentation on USA Karate (kata divisions, kumite rules)
  - Boxing: USA Boxing (look at USABoxing.com)
  - Judo: USA Judo (look at USAjudo.com)
  - Taekwondo: USA Taekwondo (look at USA taekwondo website 
  - Okinawan Kobudo kata and one steps and complexes Tadishi Yamashita 
- Schema must accommodate varied rules, divisions, weight categories, scoring systems, and bracket types
- Customization required per tournament/organization

Data Model & Schema Considerations (high-level list of needed entities):
- Brands
- Sites (including white-label demo sites and templates)
- Templates and template customization
- Clients (intake data, needs/wants)
- Onboarding wizard state and mapped site fields
- Users/Members (roles, ranks, disciplines)
- Dirstarter.com/docs again to see how to build best backend for ranks, disciplines, roles, weight classes, division types, rule sets, instructor lineage, coaching certification courses, instructional courses, how to courses, curriculum courses, tournament courses, referees/judges courses, volunteer courses, time keeper/score keeper courses, tournament records, fight records (one fighter might have different record across MMA, Boxing, Muay Thai, Karate, BJJ, Eskrima stick fighting, etc) all the things we would need for in ONE reusable backend for any front end needs in the Ronin Dojo ecosystem 
- Tournaments/Leagues
  - Divisions
  - Brackets
  - Match formats
  - Weight classes
  - Rule set association
- Products/Programs (e.g., Baseline Martial Arts curriculum)
- Pricing tiers/options and service bundles (posting, maintenance, build, custom)
- Sales/demo preview configurations
- School owners/instructors can create their own courses to package and sell as well as give access to their own students

Requirements / To-Do Items:
- Create schema pass focused on full coverage and customization possibilities
- Ensure onboarding wizard maps to all site fields for full pre-population
- Design template system to allow rapid white-label demos and on-the-spot sales
- Model tournament structures with flexible bracket and rule configurations
- Define backend and database configuration and architecture systems with flow charts, mermaid diagrams, ascii data and user registration e2e lifecycles, for all sports/org-specific divisions and weight categories
- Ensure brands and sites can be individually managed within the overall system
- Support purchasing workflow for programs/certifications (e.g., Baseline Martial Arts)

Notes / Constraints:
- Extract and reflect only information provided (no assumptions beyond message and dirstarter.com/docs as only codebase we are using with customization and porting of tuffbuffs.com and blackbeltlegacy.com needs to new software and sites baselinemartialarts.com ronindojodesign.com and wekafusa.com as well as usastickfighting.com as another domain for wekafusa.com
- Need another pass on schema: think in more detail and depth for all possibilities and customizations