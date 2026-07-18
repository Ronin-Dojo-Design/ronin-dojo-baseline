---
title: "Ubiquitous Language"
slug: ubiquitous-language
type: concept
status: active
created: 2026-04-25
updated: 2026-07-16
last_agent: codex-session-0542
version: 2
pairs_with:
  - docs/architecture/s1-schema-design.md
  - docs/rituals/closing.md
  - docs/architecture/programs-curriculum-certification-spec.md
  - docs/architecture/monetization-entitlements-spec.md
  - docs/architecture/decisions/0011-entitlement-first-commerce.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/architecture/decisions/0047-promoter-as-placeholder-recruited-coach-identity.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/_archive/SESSION_0025.md
  - docs/sprints/_archive/SESSION_0029.md
  - docs/sprints/_archive/SESSION_0033.md
  - docs/sprints/_archive/SESSION_0178.md
  - docs/sprints/SESSION_0479.md
  - docs/sprints/SESSION_0509.md
  - docs/sprints/SESSION_0541.md
  - docs/sprints/SESSION_0542.md
  - docs/knowledge/wiki/concepts/passport-and-shells.md
---

# Ubiquitous Language

This glossary is the shared domain language for Ronin Dojo Baseline.

It exists to prevent AI-assisted development from creating naming drift, duplicate concepts, and hidden architecture changes.

## Rule

If a code change introduces, renames, or changes the meaning of a domain concept, update this file in the same change.

## Repository & environment language

### Active monorepo

`ronin-dojo-baseline` (GitHub `Ronin-Dojo-Design/ronin-dojo-baseline`) — the **current, active, production** platform monorepo; `main` = prod. The local working checkout is the directory `ronin-dojo-app`, but the canonical repo name is `ronin-dojo-baseline` (its Vercel project + `blackbeltlegacy.com`).
_Avoid_: calling it "ronin-dojo-app" as the canonical name, or "black-belt-legacy" as the repo name.

### Old monorepo

`ronin-dojo-monorepo` (`/Users/brianscott/dev/ronin-dojo-monorepo`) — the **retired, reference-only** legacy monorepo. Read-only; a source for component-porting and design-pattern reference (e.g. the TuffBuffs admin brand switcher). Never build, deploy, or mutate it.
_Avoid_: treating it as active, or confusing it with the active monorepo.

### Vault repo

`RDD_Baseline44_Vault` (GitHub `Ronin-Dojo-Design/RDD_Baseline44_Vault`, **private**) — the operator's canonical Obsidian vault as its own lean git repo (`~/Desktop/Baseline_Vault`), separate from the monorepo (ADR two-repo model). Stood up SESSION_0568.
_Avoid_: committing vault content into the monorepo, or vice versa.

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

### Full-close all steps

Shorthand for invoking the complete closing ritual as defined in `docs/rituals/closing.md`. When the user says "full-close all steps" or "full close all steps in closing.md ritual," the agent must execute every numbered step in closing.md — quick close steps 1–5 **and** full close steps 6–8 — without skipping any sub-step. This includes the dual JETTY 3.0 sweep (step 3a–3c: doc frontmatter, bidirectional backlinks audit, and wiki index completeness check), project-log gate, Graphify update, reflections, evidence artifact, and hostile review. Declaring `closed-full` without completing all steps is a Pattern 2 violation (see `failed-steps-log.md`).

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

### IA (Information Architecture)

How a product's content and features are **organized, labeled, and navigated** — the route structure, the
nav/sidebar hierarchy, which surface _owns_ a concept, and what each thing is _called_. IA is distinct from
**visual design** (how it looks) and from **data modeling** (how it's stored): two records can live in
separate tables yet be presented on one surface, and one surface can host two record types. Example
(SESSION*0472): seminars (`Event`) and promotions (`PromotionEvent`) stay **distinct models**, but the IA
decision routes seminars to `/app/events` and promotions to the lineage area, surfaced together in one
"Events" view. When a change moves \_where* a feature lives or _renames_ a nav surface, that's an IA change —
call it out explicitly; don't fold it silently into a feature PR.

### Bounded parallelism (test runner)

The full Bun test suite runs with `--parallel=1` (`bun run test`), not the unbounded default. `--parallel` gives per-file process isolation (required to prevent `mock.module()` leakage), but its default worker count (CPU cores) over-subscribes the single Postgres.app test database at scale. `--parallel=1` keeps the isolation while running files sequentially — the deterministic green gate (SESSION_0342). See `sop-test-writing.md` §2.

### Mock-module leakage

The failure mode where `mock.module()` calls in one test file bleed into another's module resolution (symptom: `db.someModel is not a function`) because they share a process. Avoided by the parallel/isolate code path; reintroduced by running the full suite as bare `bun test` (no `--parallel`). The reason `--parallel` is mandatory.

### Test Fail Fix Ledger

`docs/knowledge/wiki/test-fail-fix-ledger.md` — the canonical pointer doc for expensive/recurring test-failure clusters (stable IDs `TFF-NNN`, focused repro commands, fix status). The close-router destination for test-stability findings. Read it (and `sop-test-writing.md` §2) before re-triaging a red suite.

### Fallow vs Farrow

**Fallow** (`fallow-rs/fallow`) is the Rust-native TS/JS codebase-intelligence scanner (unused code, duplication, circular deps, complexity, architecture boundaries; ships an MCP server + Agent Skill). Invoked via `npx fallow`, `npm i -D fallow`, or `cargo install fallow-cli`. **Farrow** is an unrelated TypeScript web framework. `npx farrow` is **not** the code-cleanliness tool — do not conflate them.

If an ADR touches a Dirstarter baseline layer, it must include compact proof links to the relevant live `<https://dirstarter.com/docs`> pages.

### Dirstarter docs proof

The compact source-link evidence required when a session or ADR relies on current Dirstarter baseline behavior.

Use links to the relevant live docs pages. Do not paste long excerpts into repo docs.

### Worktree cleanup

The git hygiene step that checks extra session worktrees at close.

Clean worktrees whose branches are already merged into the active branch may be removed and their local branches deleted. Worktrees with unmerged commits or uncommitted files stay in place and are recorded in the SESSION file.

### AFK / attended vs unattended

Whether the operator is **at the keyboard** during a session (attended) or **away** — **AFK** ("Away From Keyboard", an unattended run). The distinction is operationally load-bearing: an unattended session cannot answer a clarifying prompt or babysit flaky setup (a DB that won't boot, a stuck deploy), so a task queued for an AFK run must be **self-contained**, while an attended session can resolve environment friction live. Reorder a next-session plan accordingly — lead an AFK run with self-contained work, defer env-dependent proofs (e.g. a separate-DB staging check) to an attended one.

### Task plan log

The append-only task ledger at `docs/protocols/task-plan-log.md`. Every task from SESSION_0023 forward gets a stable `SESSION_NNNN_TASK_XX` ID.

### Task review log

The append-only review ledger at `docs/protocols/task-review-log.md`. Every non-trivial close records findings against task IDs.

## Core identity

### User

The authentication account.

A User owns login state, email, auth sessions, and account-level flags. It should not directly own martial arts rank, organization status, tournament role, or public directory settings.

A User is a Person with an account. Some People do not have accounts yet.

### Person

A human identity in the platform, whether or not that person has an authentication account.

Person-facing admin collections are about the Passport-backed human; account status is a property of that person, not the identity itself. Avoid using `User` when the thing being managed can be an accountless person.

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

### Affiliation

A **display-only** relationship between a person (User) and an Organization — "trains at", "teaches at",
"head instructor", "owner", or "member" (`AffiliationRole`). Either links an `Organization` or records a
free-text `schoolName`; `isCurrent` marks the active one. Added SESSION_0357.

Affiliation is the **canonical person↔org axis** for a member's school/affiliation/league — distinct from
`Membership` (Baseline enrollment) and from `RankAward.organization` (the awarding school). It carries **no
payment/billing**; umbrella affiliations (e.g. a federation a school buys into) are `Organization`s typed
`OrganizationType.AFFILIATION`. School-label and directory org-facet reads prefer Affiliation, falling back
to Membership during the Passport-consolidation transition (D-023). See [ADR 0025](decisions/0025-passport-identity-source-of-truth.md).

## Ranks

### RankSystem

The ordered rank structure for a Discipline.

Examples include BJJ belts, Karate kyu/dan, Kali levels, and coach certifications.

### Rank

One position inside a RankSystem.

Former name: `Belt`.

Use Rank because not all martial arts or certifications use belts.

### RankAward

A compatibility-era rank-promotion provenance record attached to a Passport.

RankAward records who earned the rank, which Rank it was, who awarded it, when and where. It links to
`GamificationEvent` for point tracking and currently stores the promotion fact while the RankEntry fold is in
progress. It does not independently decide the member-facing current rank or trust state; `RankEntry` owns those
reads. Legacy `mediaUrls` are deprecated; Belt Journey media/story enrichment lives on `RankMilestone` plus
`MediaAttachment` during compatibility.

Former name: `Progress`.

Do not use `Progress` in new code.

**Being retired:** read paths now resolve a member's rank from `RankEntry` (below); the `RankAward`
table-drop is a tracked post-launch epic. Prefer `RankEntry` for new rank reads/writes.

### RankEntry

The current single model for a member's rank/belt standing. It supersedes `RankAward` — member-facing
lineage-trust reads were collapsed onto `RankEntry` (SESSION_0519–0523), and it is the model new code
should use for "what rank does this member hold." `RankEntryReview` carries its verification workflow.
`RankAward` still exists in the schema during the transition; its removal is a tracked post-launch epic
(`rankentry-unification-epic.md`), not new-code surface.

### Belt Journey

The member-facing experience for telling the story of a person's rank progression belt by belt.

Belt Journey is UX language. It does not create rank authority, verification, privacy, or promotion facts. Its
enrichment is stored in `RankMilestone` during compatibility, while the related promotion provenance remains on
`RankAward`. The member-facing current rank and trust state come from `RankEntry`; the retirement epic folds the
remaining compatibility facts and enrichment into that one model.

### Backfill

A belt a member adds themselves at or below their awarded ceiling — their own lower-belt history (SESSION_0540). A
backfill is self-added (`source: STATED`, no approver `awardedById`), fully fact-editable by the owner, and minted
`UNVERIFIED`; it can never raise the shown belt above the member's awarded truth (the ceiling gate). Above the ceiling
is not a backfill — it routes to a `RANK_PROMOTION` claim (`promotion.submit`).

### Trust State

The legibility state of a member's owned belt entry (`BeltTrustState`: `verified` | `unverified` | `pending_review`,
SESSION_0540). Derived (`deriveTrustState`): an open review (`PENDING` legacy or captured `PROPOSAL_PENDING`) wins
(in flight), else the entry's verified flag decides. Presentation only — the authority is `RankEntry.status` + any
open review, never a stored belt field.
`pending_review` is a workflow overlay: it does not mean the proposed promoter is active, and it is distinct from
`RankEntry.status=PENDING` for a new higher-rank request.

### Accepted Promoter

The promoter currently carried by the active rank fact. For an established-coach change, promoter A remains the
accepted promoter while B is under review. Public lineage and provenance use the accepted promoter, never the
pending proposal.

### Promoter-change proposal

The immutable expected-prior/proposed-target snapshot on one `PROPOSAL_PENDING` / `PROMOTER_CHANGED` review
(ADR 0047 D7). `PROPOSAL_PENDING` is deliberately distinct from legacy `PENDING`: the previous release's reviewer
only accepts `PENDING`, so it cannot approve a captured proposal without applying its proposed coach.
The proposal is not active provenance. Re-submitting the same target is idempotent; a different target conflicts
until the review resolves. **Approve** atomically applies the exact proposal and verifies the entry; **Deny** leaves
the accepted promoter and prior status unchanged. Use **pending review**, not “pending verification,” for this
workflow, and use **Deny**, not “Dismiss,” for its negative decision.

### Anchor Promoter

The promoter of a member's **anchor** award — their highest authority-verified rank (`IMPORTED`, or `VERIFIED` with an
approver `awardedById`); its `awardedByPassportId` is the promoter we already trust (SESSION_0540). For an
initial/unaccepted backfill fact, an established promoter equal to the anchor promoter auto-verifies (same coach),
while an anchor-different established promoter stays unverified. Once the backfill has an established **accepted
promoter A**, replacing A with a different established B opens a `PROMOTER_CHANGED` proposal regardless of which
coach is on the anchor; A stays active. A fresh recruited coach follows the separate unverified/no-review path.

### Recruited-coach placeholder

The accountless (`userId` null), off-tree (no `LineageNode` / `DirectoryProfile`) `Passport` minted for a free-typed
promoter (`ensurePromoterPlaceholder`), set as the award's `awardedByPassportId` (ADR 0047). It is a recruitment /
identity **artifact**, **not a claimable identity** — a bare Passport has no ADR 0036 claim door and no ADR 0032
email-reconcile hook, so the claim path is **phase-2**. Never call it "claimable"; hidden from every public surface
(no-leak). Dedup is exact-normalized (bias to duplicates over false-merge); its paired CRM `Lead` links back via
`meta.passportId`.

### Belt Family

The BJJ bar-treatment axis on a `Rank`: `BeltFamily` enum — `COLORED` (white/blue/purple/brown), `BLACK`,
`CORAL` (7th/8th degree), `RED` (9th/10th degree) (SESSION_0539). It drives the **rank bar**'s color + seam
treatment in `BeltSwatch`, while the belt *body* color stays `Rank.colorHex` data (ADR 0026 / design-system
doctrine — never a hardcoded belt-color map). `null` = a non-BJJ / unseeded rank → the belt renders bar-free.
Render-layer only, like `degree`/`secondaryColorHex`; never rank authority.

### Rank Bar

The contrasting tab near the belt's tip that carries the degree marks (`BeltSwatch` `variant="belt"`,
SESSION_0539). Black for colored belts, red for black/coral/red; coral & red add thin flush left/right white
seams. Length varies — ¾ for white→6th-black, full for coral/red. A belt-color tip shows past it.

### Degree Marks (stripes / degrees)

The white "wrapped athletic-tape" marks on the **rank bar** = a belt's grade, rendered full-height and
right-anchored from the tip (`Rank.degree`). Vocabulary differs by family: colored belts carry 0–4 **stripes**;
black/coral/red carry 1–10 **degrees** — both render as the same white marks (SESSION_0539).

### RankMilestone

A member-owned enrichment record attached 1:1 to a `RankAward`.

RankMilestone stores editable story text and Belt Journey media attachments for one awarded rank. It is always
subordinate to `RankAward`: it has no `rankId`, no verification status, and no authority to promote, demote, verify,
or dispute a rank fact. Deleting the owning RankAward deletes the milestone.

### RankAwardSource

How a compatibility-era RankAward was established (SESSION*0357, BBL-RANK-004): `STATED` (asserted — e.g. admin-added or
self-claimed) or `EARNED` (recorded through a promotion the platform witnessed). Pairs with
**RankAwardVerificationStatus** (`UNVERIFIED` | `VERIFIED` | `DISPUTED` | `IMPORTED`). Those fields preserve
provenance and compatibility gates until RankAward retires. A person's member-facing **current rank** is the highest
non-`PENDING` `RankEntry` in the discipline ordering: `UNVERIFIED`, `VERIFIED`, and `DISPUTED` all count. It is never
a stored Passport/Membership field and is not derived from “highest verified RankAward.”

### PromotionEvent

A belt ceremony that groups multiple RankAwards into one event (SESSION_0318).

PromotionEvent holds a shared date, host venue (`hostOrganizationId`, distinct from each award's awarding school), description, and a shared media gallery (`MediaAttachment[]`). It is discipline-agnostic — one ceremony can group BJJ, FMA/WEKAF, and Muay Thai awards together — and global, displayed per-brand. It sits _above_ RankAward as an optional grouping (`RankAward.promotionEventId`, nullable, `SET NULL`); it never owns promotion truth and carries **no verification signal** (verification stays role-gated on RankAward/LineageRelationship per ADR 0016). A per-tree LineageVisualGroup may point at the event via `promotionEventId` so a cohort box and its ceremony are one truth.

## Lineage

### LineageNode

The reusable lineage profile for a person.

LineageNode is **Passport-rooted** (`passportId`, not User — SOT-ADR D1) and can appear in one or more LineageTree contexts through LineageTreeMember. A **placeholder** node has an accountless Passport, claimable via LineageClaimRequest.

### LineageRelationship

A graph edge between two LineageNodes.

For `PROMOTED_BY`, the direction is promoter to promoted person: `fromNodeId` is the promoter and `toNodeId` is the promoted person.

### PROMOTED_BY

The LineageRelationship type that mirrors a RankAward for graph traversal and display.

PROMOTED_BY is not the source of promotion truth. RankAward is canonical.

### LineageTree

A publishable lineage context scoped to a Brand, Organization, Discipline, Style, Person, or custom grouping.

LineageTree owns public/editor visibility, slug, membership rows, visual groups, ACL grants, and claim requests.

### LineageTreeMember

The tree-specific placement of a LineageNode.

LineageTreeMember owns visual parent, display order, selected display RankAward, group membership, and public display toggles. It does not own promotion truth.

### Branch head

A LineageTreeMember placed directly beneath the tree root whose person-node anchors a _branch_ — the instructor / school owner under whom that branch's students are filed.

A branch head is a **real person-node**, not an abstract container — though it also _acts_ as the container its students' placements point to (via `primaryVisualParentMemberId`). It is typically a **placeholder** node an admin adds ahead of the person; the holder later **claims it or accepts an invite** to take ownership. Claiming/accepting a branch-head node grants **branch-scoped LineageTreeAccess**, letting the holder maintain (add, place, verify) the members beneath them. Decentralizing lineage maintenance this way — students filing under their own instructor's branch — is the reason placeholder nodes + claim exist. Visual placement under the root is independent of promotion provenance (a branch head need not be PROMOTED_BY the root).

### LineageVisualGroup

A materialized visual row/group inside a LineageTree.

Groups can be generated from promotion dates, rank, generation, team, or a custom editor label. Unknown-date groups require explicit app or database integrity because nullable SQL uniqueness is not enough by itself.

### LineageTreeAccess

An explicit ACL grant for editing lineage.

Organization owner and organization admin access may be derived by server authorization logic; explicit grants are stored for tree, branch, or node-specific editors.

### PassportClaimRequest

The **unified person-claim record** (ADR 0036; live since SESSION*0438 P5). Both person-claim doors — lineage-node \_and* directory-profile — resolve their subject to a `passportId` (identity SoT, ADR 0025) and write ONE `PassportClaimRequest`, so the claimable + duplicate guards key on identity, not door. Reviewed via `reviewPassportClaim` → `finalizePassportClaim` (approve / deny / needs-info; node branches run only when node context is present — this is what gives a directory-only person a real account→Passport attach). Org claims do NOT come here (see `ProfileClaimRequest`). Every decision is audited; node claims email the claimant.

### LineageClaimRequest

**RETIRED as the live person-claim path** (ADR 0036 P5, SESSION_0438) — superseded by `PassportClaimRequest`. Historically: a request by an authenticated user to claim a placeholder LineageNode (Passport-rooted; approval attached the account to the node's Passport). Retained read-only for legacy straggler rows until the table is dropped in a post-cutover migration; `applyLineageClaimReview` stays only to review those.

### LineagePendingClaim

An **email-bound** pending lineage claim (ADR 0032, SESSION*0419). Created when a claim is initiated before the claimant has an account; **reconciled on every sign-in** — magic-link \_and* social — via `lib/auth.ts` `hooks.after` → the shared `claimNodeForUser` core, so social sign-in no longer bypasses the magic-link-only claim. Verification emails store exact email casing.

### LineageClaimEvidence

Private evidence attached to a LineageClaimRequest.

Evidence is visible to the claimant and reviewers, not public lineage payloads.

### ProfileClaimRequest

The **ORGANIZATION-only** claim system (SESSION_0354; narrowed by ADR 0036 P5, SESSION_0438) — a request to claim an **owner-less Organization**. Org approval sets `ownerId`. **Person claims no longer come here** — they unified onto `PassportClaimRequest`, and the `/admin/claims` queue is now organization-only. **Register ≠ Claim** (ADR 0023): register creates new, claim takes over existing. See [[profile-claim-vs-lineage-claim]].

### LineageVerificationStatus

The per-`RankAward` verification enum (`PENDING`, `VERIFIED`, `DISPUTED`). It exists as data but is **not used for display**.

The **canonical display verification axis is `node.isVerified`** — binary `Verified` / `Unverified` on the public canvas (tree / board / cards), per ADR 0035 §5. Do **not** "replace `isVerified` with verificationStatus" — that earlier guidance is reversed. `verificationStatus` is vestigial for presentation; the multi-state resolver survives only on the drawer + `/directory` facet.

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

## Authorization

### Permission

A stable `can()` key such as `beta.view`, `media.upload`, or `lineage.manage`.

Permissions answer whether an account may perform an action platform-wide. They are not membership roles
and they are not commerce entitlements.

### PermissionGrant

An additive grant of a Permission to a User, resolved inside the existing global `can()` capability axis.

Per-user permission grants are the FI-019 model for letting a non-admin account reach a narrow gated area
without promoting that account to platform `admin`. They must use the same `Grant` string vocabulary as
`server/orpc/roles.ts`, be auditable, and be soft-revokable. They do not replace org membership roles,
lineage resource grants, or commerce entitlements.

## Courses and curriculum

### Course

A structured learning path created by an Organization, optionally attached to a Discipline.

### CurriculumItem

One ordered unit inside a Course.

It may represent a lesson, technique, drill, requirement, video, note, or assessment checkpoint.

### Technique

A rich curriculum-library object (name, discipline, belt tag, position/category, cues, media). Distinct
from a **CurriculumItem** (a unit _inside a Course_). A Technique's owner is two separate axes — its
**school** and its **author** (ADR 0046):

- **Canonical technique** — an org-seeded library technique with **`authorPassportId = null`**. The
  existing library. Unique on `(brand, organizationId, slug)`.
- **Authored-by** (`authorPassportId`) — a member (Elite/staff/RBAC) who created the technique. It surfaces
  on that member's profile curriculum. Ownership and variants key off this column, **not** the org.
- **School-grouped curriculum** — techniques grouped by `organizationId` (nullable = the author's school,
  from their `Affiliation`; `null` → profile-only, ungrouped). "All South Bay techniques" = one school's
  Techniques across many authors. Not to be confused with a **Course**'s CurriculumItems.
- **Variant** — one of several independent `Technique` rows with the same `(organizationId, slug)` but
  different `authorPassportId` (two instructors' rendition of the same move). A _display_ grouping, not a
  schema entity.
- **Featured** (`isFeatured`) — a staff-promoted authored technique surfaced in the canonical browse;
  attribution (`authorPassportId`) is preserved.

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

### Participation ladder

The rule that each paid membership tier unlocks the next member _action_ (verb), not merely more content:
Free = read; **Premium** = CREATE community posts; **Elite** = AUTHOR techniques (+post); staff/RBAC =
everything. Upgrading a tier earns the next verb.

Ratified SESSION_0529; the community-post CREATE gate shipped SESSION_0535 (FI-028), tightening posting to
Premium-and-up (free members lost it). The read-side per-post freemium (locked posts) shipped SESSION_0537
(FI-028b) — see **Premium community post** below.

### Premium community post

A `CommunityPost` with `isPremium = true`: **visible-but-locked** to an unentitled reader — the title, type,
author, and a short `excerpt` teaser stay public (funnel hook), but the full body, video, and image are
stripped server-side and shown only to an entitled viewer (admin ∨ the post's own author ∨ a paid tier, via
`isCommunityPostViewerEntitled` mirroring the technique read gate). Default `false` (posts are free & public to
everyone including logged-out visitors); premium is **author-set, self-serve at create** (FI-028b, SESSION_0537).
Distinct from a premium *technique*: a technique is staff-*promoted* to a paid curriculum, whereas a premium
community post is author-flagged and **platform-monetized with no creator payout yet** — that payout model is a
tracked future goal (**G-009**), not a shipped economics.

### Capability gate (`canDo<X>ForUser`)

A server-side predicate that answers "may this user perform action X?" by composing the three existing authz
seams — `can()` RBAC ∨ active staff `Membership` ∨ paid-tier `Entitlement` — and **never a new (5th) authz
system**. Members of the family: `canCreateTechniqueForUser` (ADR 0046), `canCreateCommunityPostForUser`
(SESSION_0535, FI-028), `canUploadMediaForUser`.

Enforced at the server action (the write), not the UI button. A gate checks the **tier-key set**
(`LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS` = PREMIUM ∨ ELITE ∨ LEGEND), not a single key, because which keys a
plan grants is `PricingPlan` config, not a code guarantee (Learning Record 0015).
Entitlements are commercial access facts, not the source of truth for platform authority. If the desired
toggle answers "may this account perform this action?", model it as a Permission/PermissionGrant instead.

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

**`BBL` is the only live/active brand** (BBLApp v4.4 — launched June 19, 2026). The enum retains all four for the not-yet-pruned multi-brand harness, so **brand-scoping still applies in code**; the single-brand collapse is a future prune.

## Content surfaces (SESSION_0493 / ADR 0042 Amendment 1)

- **Community post** — a member-authored `CommunityPost` on the `/posts` feed. Post-moderated (`PUBLISHED | HIDDEN`), saveable (`Bookmark` `COMMUNITY_POST`), never editorial.
- **Editorial post** — a staff-authored `Post` on `/blog`, managed at `/app/blog`. The two never share a table (kind-union rejected).
- **Post-moderation** — publish-first, hide-on-review (`HIDDEN` by admin action) — as opposed to the pre-moderated editorial workflow.

## Admin surfaces (ADR 0045)

### AdminCollection

The one ratified admin list-surface pattern: every admin index (`/app/*`) is a conformed, searchable,
sortable data table built from a column definition + a query, never a hand-rolled list. Row → detail →
one editor. Per ADR 0045, this pattern _is_ the admin law — a new admin screen conforms to it rather than
inventing its own shape. `/app/tools` is the reference implementation (not a required route).

## Web security posture (SESSION_0536)

The platform's security-header + CSP vocabulary. The posture lives **per-app** (each product app builds it
from `apps/web/config/security-headers.ts`), not in root config. RISK #2 in the security risk register
tracks it.

### CSP (Content-Security-Policy)

The browser-enforced allowlist, sent as an HTTP header, of which origins the page may load each resource
type from (scripts, styles, images, frames, fonts, connections). Anything off the list is blocked. It is
the platform's primary defense against XSS/injection. Built in `apps/web/config/security-headers.ts`.

### Report-Only

The observe-don't-block mode of a CSP: the browser reports what _would_ be blocked without blocking it,
via `Content-Security-Policy-Report-Only`. The platform doctrine is **observe, then enforce** — ship the
policy Report-Only, watch the prod report stream, then flip. BBL's CSP is Report-Only today; the flip is
the single env change `CSP_ENFORCE=1` (operator-gated — high blast radius).

### CSP nonce

A per-request random token stamped on each `<script>` and echoed in the CSP header, so the browser runs
only scripts carrying that request's token. It lets `script-src` drop `'unsafe-inline'` (the main XSS
weakness) without a host allowlist. Minted in `apps/web/proxy.ts`; Next auto-applies it to its own
bootstrap scripts. Data-block scripts (`application/ld+json`) are intentionally _not_ nonced.

### Security-header baseline

The enforced set of hardening headers every response carries — HSTS, X-Frame-Options, COOP,
Referrer-Policy, Permissions-Policy, X-Content-Type-Options — plus the CSP. Built app-agnostically so each
product app replicates the same posture from its own config.

## AI naming rules

1. Do not introduce aliases for locked terms.
1. Do not use legacy terms in new code unless writing migration notes.
1. Do not use `school`, `style`, `belt`, or `profile` as new model names.
1. Use `Organization`, `Discipline`, `Rank`, and `Passport` everywhere in new code.
1. If a domain word feels unclear, stop and update this glossary before coding.
