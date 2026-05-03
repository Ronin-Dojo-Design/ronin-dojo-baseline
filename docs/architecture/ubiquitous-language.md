---
title: "Ubiquitous Language"
slug: ubiquitous-language
type: concept
status: active
created: 2026-04-25
updated: 2026-05-03
last_agent: codex-session-0033
version: 2
pairs_with:
  - docs/architecture/s1-schema-design.md
  - docs/rituals/closing.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0025.md
  - docs/sprints/SESSION_0029.md
  - docs/sprints/SESSION_0033.md
  - docs/knowledge/wiki/concepts/passport-and-shells.md
---

# Ubiquitous Language

This glossary is the shared domain language for Ronin Dojo Baseline.

It exists to prevent AI-assisted development from creating naming drift, duplicate concepts, and hidden architecture changes.

## Rule

If a code change introduces, renames, or changes the meaning of a domain concept, update this file in the same change.

## Operational governance language

### Bow-in

The opening ritual for a session. Bow-in loads the latest SESSION file, WORKFLOW 5.0, relevant runbooks, failed steps, and task plan context before work starts.

### Bow-out

The closing ritual for a session. Bow-out records what landed, what remains, verification evidence, git state, and the next session handoff.

### Quick close

The lightweight bow-out mode. Quick close runs the required close steps for session handoff and git hygiene, but it does not require Kaizen reflections or the full review/recommend loop unless the operator escalates.

If the user asks for quick close, do not silently perform or claim full close.

### Full close

The complete bow-out mode. Full close includes every quick close step plus Kaizen reflections, hostile close review, review/recommend, memory sweep, next-session unblock check, JETTY/backlink proof, and wiki-lint proof.

If the user asks for full close, the SESSION file must include a `## Full close evidence` table before status becomes `closed-full`.

### JETTY 3.0 sweep

The doc metadata and linking sweep performed during close. It checks touched docs for current frontmatter (`updated`, `last_agent`, `health` where applicable), bidirectional `pairs_with`/`backlinks`, and wiki index visibility.

Do not use this phrase unless the sweep evidence is recorded in the SESSION file.

### Wiki lint

The automated docs/wiki lint pass run from the repo root:

```bash
bun run wiki:lint
```

Wiki lint checks broken links, missing backlinks, orphan pages, stale frontmatter, missing frontmatter, thin pages, and health drift. Full close must record the command result.

### Kaizen reflection

The reflection section of full close. It captures surprises, near misses, patterns, and advice for the next operator. It is not a vibe check; it is operational learning.

### Hostile close review

The Giddy + Doug close review that challenges plan sanity, Dirstarter alignment, security, data integrity, verification honesty, workflow compliance, and merge readiness.

### ADR

Architecture Decision Record. An ADR records an accepted, proposed, rejected, or superseded architecture choice that should outlive one session.

If an ADR touches a Dirstarter baseline layer, it must include compact proof links to the relevant live `https://dirstarter.com/docs` pages.

### Dirstarter docs proof

The compact source-link evidence required when a session or ADR relies on current Dirstarter baseline behavior.

Use links to the relevant live docs pages. Do not paste long excerpts into repo docs.

### Worktree cleanup

The git hygiene step that checks extra session worktrees at close.

Clean worktrees whose branches are already merged into the active branch may be removed and their local branches deleted. Worktrees with unmerged commits or uncommitted files stay in place and are recorded in the SESSION file.

### Task plan log

The append-only task ledger at `docs/protocols/task-plan-log.md`. Every task from SESSION_0023 forward gets a stable `SESSION_NNNN_TASK_XX` ID.

### Task review log

The append-only review ledger at `docs/protocols/task-review-log.md`. Every non-trivial close records findings against task IDs.

## Core identity

### User

The authentication account.

A User owns login state, email, auth sessions, and account-level flags. It should not directly own martial arts rank, organization status, tournament role, or public directory settings.

### Passport

The global person identity attached to a User.

A Passport answers: who is this person across the whole platform?

It may include display name, legal name, date of birth, gender, phone, emergency contact, and avatar.

Former name: `Profile`.

### DirectoryProfile

The public or member-facing visibility profile attached to a User.

It owns directory visibility, bio, location fields, and privacy flags such as whether email, phone, organizations, or ranks may be shown.

Passport is identity. DirectoryProfile is presentation and privacy.

## Organizations and disciplines

### Organization

A dojo, school, league, club, federation, or training group.

An Organization belongs to a Brand and can host memberships, courses, tournaments, and discipline offerings.

Former name: `School`.

### Discipline

A martial art or ruleset family such as Karate, BJJ, Judo, Muay Thai, Eskrima, Kali, Boxing, Kajukenbo, or Taekwondo.

Former name: `Style`.

Do not use `Style` for this concept in new code.

### OrganizationDiscipline

The join between Organization and Discipline.

It answers: which disciplines does this organization teach, support, sanction, or host?

Former name: `SchoolStyle`.

## Ranks

### RankSystem

The ordered rank structure for a Discipline.

Examples include BJJ belts, Karate kyu/dan, Kali levels, and coach certifications.

### Rank

One position inside a RankSystem.

Former name: `Belt`.

Use Rank because not all martial arts or certifications use belts.

### RankAward

A rank promotion record awarded to a User.

RankAward records who earned the rank, which Rank it was, who awarded it, when and where. It also supports promotion photos/videos via `mediaUrls` and links to `GamificationEvent` for point tracking.

Former name: `Progress`.

Do not use `Progress` in new code.

## Membership shells

### Shell

A context-specific identity layer.

The same person has one Passport but different shells in different contexts.

### Membership

A User inside an Organization and Discipline.

The core identity is:

```txt
User x Organization x Discipline
```

Membership owns status, optional rank, member number, joined/left dates, and assigned roles.

### MembershipStatus

The lifecycle state of a Membership.

Initial values: `INVITED`, `PENDING`, `ACTIVE`, `SUSPENDED`, `EXPIRED`.

### Role

A table (not enum) representing a role that can be assigned to a Membership.

Universal seed roles (`isSystem=true`, `brand=null`): `STUDENT`, `INSTRUCTOR`, `OWNER`, `COACH`, `ORG_ADMIN`, `STYLE_APPROVER`.

Brand-specific custom roles are supported via the `brand` column (e.g., `brand=BBL, code="SENIOR_INSTRUCTOR"`). The `isSystem` flag prevents deletion of universal defaults.

Former name: `MembershipRole` (was an enum; replaced with a table per Q3 decision in SESSION_0003).

### MembershipRoleAssignment

The join between Membership and Role.

This allows one membership to hold multiple roles without creating duplicate memberships.

## Courses and curriculum

### Course

A structured learning path created by an Organization, optionally attached to a Discipline.

### CurriculumItem

One ordered unit inside a Course.

It may represent a lesson, technique, drill, requirement, video, note, or assessment checkpoint.

## Tournament shells

### Tournament

An event hosted by an Organization under a Brand.

It owns event-level identity, dates, venue, timezone, lifecycle status, supported disciplines, and registrations.

### TournamentDiscipline

The join between Tournament and Discipline.

It answers: which disciplines or rulesets are offered at this tournament?

### Division

A competition or participation category inside a TournamentDiscipline.

A Division owns format, role requirement, gender category, age range, weight range, rank range, fee, capacity, and sort order.

### Registration

A User's registration record for a Tournament.

A Registration may contain multiple RegistrationEntries.

Former name: `TournamentRegistration`.

### RegistrationEntry

One specific entry in one Division.

This table stores immutable rank and organization snapshots so future promotions or organization changes do not rewrite tournament history.

### TournamentRole

A table (not enum) representing a role within a tournament context (e.g., COMPETITOR, COACH, JUDGE, VOLUNTEER).

Semantically distinct from org membership `Role`. Same extensibility pattern: `isSystem` defaults, brand-customizable. `Division.roleRequired` FKs to this table.

### TournamentStaffAssignment

Assignment of a User to a Tournament in a specific TournamentRole, optionally scoped to a Division.

Used for judges, referees, directors, timekeepers, and medical staff.

## Substyles

### Style

A substyle within a Discipline (e.g., Shotokan under Karate, Hawaiian Kenpo under Kenpo).

Supports parent/child hierarchy and an approval workflow (PENDING → APPROVED / REJECTED). User-submitted styles require approval by a user with the STYLE_APPROVER role.

Do not confuse with `Discipline`. Discipline is the top-level martial art; Style is a variant within it.

## Subscriptions

### SubscriptionTier

A table defining subscription levels per brand (e.g., FREE, PREMIUM, INSTRUCTOR, SCHOOL_OWNER, LEGEND).

Same `isSystem` + `brand` extensibility pattern as Role and TournamentRole.

### UserBrandSubscription

A User's subscription to a specific tier within a Brand. One subscription per user per brand.

## Commerce and entitlements

### Product

A sellable commercial offer, such as a Program, Course, Certification, Membership, Event, CertificateTemplate, or bundle.

In SESSION_0029, Product is a domain concept, not yet a Prisma model. Do not add a `Product` table until the unified catalog need is proven by implementation.

### PricingPlan

The internal Ronin price and terms record for an organization and optional Program.

PricingPlan is the right place to attach future Stripe Product/Price IDs and entitlement grants. Do not replace it with raw Stripe product metadata.

### Entitlement

A durable access key granted by purchase, subscription, manual grant, membership, or promo.

Feature code should check Entitlements rather than hard-coded plan IDs, product IDs, or scattered paid booleans.

### UserEntitlement

A User's assignment of an Entitlement, with source, status, and time window.

UserEntitlement is the user-facing access ledger. Refunds, cancellations, expirations, and manual revokes should update this ledger instead of deleting historical payment or progress records.

### EntitlementGrant

The mapping between a PricingPlan and the Entitlements it grants.

EntitlementGrant keeps commercial packaging separate from access checks: a product can be sold one way while access remains keyed by stable entitlement names.

## School operations lifecycle

### ProgramEnrollment

A User's enrollment in a Program. ProgramEnrollment owns active, waitlisted, completed, withdrawn, or suspended enrollment state and waitlist position.

ProgramEnrollment does not carry brand or organization columns; code must scope it through `Program.brand` and `Program.organizationId`.

### FamilyGroup

A household or family cluster that can contain members from more than one organization.

FamilyGroup is intentionally cross-org. Reads and writes must scope through the action target's Membership rather than treating the family group itself as brand/org-scoped.

### FamilyMember

A User inside a FamilyGroup with a role such as `GUARDIAN`, `CHILD`, or `SPOUSE`.

Guardian authority is the only parent-for-minor signing authority currently represented in the schema.

### Lead

A staff-managed prospect record for an Organization and Brand.

A Lead can move through trial lifecycle states before conversion into a User, Membership, and optional ProgramEnrollment. Public lead intake is a separate future surface, not implied by the Lead model.

### Trial booking

The lifecycle event represented by `Lead.status = TRIAL_BOOKED` and `Lead.trialBookedAt`.

Trial booking is not a paid entitlement and does not create billing state by itself.

## Lineage

### LineageNode

A user's node in the martial arts lineage graph. Controls visibility (PUBLIC, UNLISTED, RESTRICTED, PRIVATE) and verification status.

### LineageRelationship

A connection between two LineageNodes (e.g., TRAINING_PARTNER, AFFILIATION, SEMINAR, TOURNAMENT_PARTNER, COMPETITION_TEAM).

Vertical lineage (instructor→student) is captured by `RankAward.awardedById`. These models capture the richer horizontal graph.

## Waivers

### Waiver

A consent document scoped to an Organization, Tournament, or globally to a Brand. Supports version tracking for legal compliance.

### WaiverSignature

A user's signed consent for a Waiver. Includes IP/user-agent for legal audit. Supports minor consent via `signedOnBehalfOfId`.

## Certifications

### Certification

A formal record of a safety, coaching, or belt certification issued to a User by an Organization. Supports expiry tracking and revocation.

Distinct from `RankAward`: RankAward is specifically for rank promotions; Certification covers the broader set (CPR, first aid, coaching certs, formal belt certificates with external numbers).

## Gamification

### GamificationEventType

A table defining types of gamification events (e.g., CLASS_ATTENDED, BELT_AWARDED, COURSE_COMPLETED). Same `isSystem` + `brand` pattern.

### GamificationEvent

An append-only ledger entry for a point-bearing event. Links back to source (RankAward, Course, Organization, Discipline) for traceability.

## Brand

The public-facing product identity or domain context.

Initial values:

- `RONIN_DOJO_DESIGN`
- `BASELINE_MARTIAL_ARTS`
- `BBL`
- `WEKAF`

Brand is currently an enum/column, not a table.

## AI naming rules

1. Do not introduce aliases for locked terms.
2. Do not use legacy terms in new code unless writing migration notes.
3. Do not use `school`, `style`, `belt`, or `profile` as new model names.
4. Use `Organization`, `Discipline`, `Rank`, and `Passport` everywhere in new code.
5. If a domain word feels unclear, stop and update this glossary before coding.
