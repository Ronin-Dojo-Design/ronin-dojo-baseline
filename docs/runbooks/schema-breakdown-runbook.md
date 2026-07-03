---
title: "Schema breakdown runbook — professional schema design, taught from our own schema"
slug: schema-breakdown-runbook
type: runbook
status: active
created: 2026-07-02
updated: 2026-07-03
last_agent: claude-session-0493
pairs_with:
  - docs/architecture/decisions/0025-passport-identity-source-of-truth.md
  - docs/architecture/decisions/0029-polymorphic-bookmark-and-listing-detail.md
  - docs/architecture/decisions/0035-lineage-rank-display-from-awarded-truth.md
  - docs/architecture/decisions/0036-unified-passport-claim.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
  - docs/architecture/decisions/0042-canonical-blog-surface-post-over-contentatom.md
  - docs/architecture/decisions/0043-rank-award-fact-vs-member-milestone.md
  - docs/runbooks/dev-environment/schema-migration.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - schema
  - prisma
  - ddd
  - vertical-slices
  - teaching
---

# Schema breakdown runbook

How professional teams (the "what would Apple / Facebook / YouTube do" bar) design relational
schemas — taught entirely from **this repo's** `apps/web/prisma/schema.prisma` (4,229 lines,
~140 models). Every claim cites a real line. Part 1: what we do well. Part 2: what we do
poorly and the professional fix. Part 3: the teaching sections — enums, FKs, relation naming,
polymorphism, unique constraints as invariants, and vertical slices + DDD applied to schema.

The organizing law comes from
[The Vertical Codebase](https://tkdodo.eu/blog/the-vertical-codebase):
**"code that changes together should live together."** A schema is code. Models that change
together (an aggregate) should be designed, named, indexed, and migrated together — and a new
feature should land as a **new vertical slice**, not as a widening of an existing model.

---

## Part 1 — What we do well

### 1.1 Closed polymorphic contracts (`Bookmark`)

`apps/web/prisma/schema.prisma:344–394`. One Save concept across six subject types, done the
professional way:

- A **closed enum discriminator**: `subjectType BookmarkSubjectType` (`TOOL | PERSON |
  ORGANIZATION | TECHNIQUE | POST | TREE`).
- **One real nullable FK per subject** (`toolId`, `passportId`, `organizationId`,
  `techniqueId`, `postId`, `lineageTreeId`) — each with a genuine relation and
  `onDelete: Cascade`, so the DB keeps referential integrity and orphan cleanup.
- **Per-(user, FK) uniques** (`@@unique([userId, toolId])` … one per subject) — "you can save
  a thing once" is a *DB invariant*, not an application promise.
- Per-FK lookup indexes for the reverse question ("who saved this post?").

This is ADR 0029's pattern, and it is what a feed/likes team at any large platform ships. The
alternative — an open `(entityType, entityId)` string pair — surrenders FK integrity, cascade,
and joinability. We have that anti-pattern too, for contrast (see §2.5).

### 1.2 Claim vs fact — awarded truth (`RankAward` + `PassportClaimRequest`)

The single best piece of domain modeling in the schema (ADR 0035 + Amendment 1, ADR 0036):

- `RankAward` (`schema.prisma:2135–2193`) is a **pure fact table**: who holds which belt,
  awarded by whom, where, when. `@@unique([passportId, rankId])` — one award per person per
  belt, as an invariant.
- A rank someone merely *asserts* is **never** a `RankAward`. It lives as `claimedRankId` on
  the claim record (`PassportClaimRequest:3050–3053` — "NOT a RankAward; admin-verify mints
  the awarded RankAward from this"). Approval *creates* the fact.
- The payoff is structural, not procedural: an unverified belt **cannot leak into display**
  because it does not exist in the displayed table. No "remember to filter by status" bug
  class. ADR 0035 Amendment 1 documents the rejected alternative (per-award status display
  axis) and why filter-discipline always eventually fails.

**Lesson:** when a domain has "asserted" vs "verified" states, prefer *two tables with a
promotion step* over *one table with a status column every reader must remember to filter*.

### 1.3 Fact vs enrichment (`RankMilestone`, ADR 0043)

`schema.prisma:2195–2208`. Belt-journey stories/photos live in a sibling `RankMilestone`
(1:1, `rankAwardId @unique`, `onDelete: Cascade`), explicitly documented as carrying "no
verification or rank authority." The fact table stays lean and authoritative; member-editable
fluff lives beside it, not inside it. The superseded inline approach is visible in the same
model: `mediaUrls Json?` at line 2140–2141 carries a `/// @deprecated` doc-comment pointing
at the replacement. That is how you retire a field professionally: mark, repoint, then drop.

### 1.4 Passport as the one identity root (ADR 0025 / SOT-ADR D1)

`schema.prisma:1042–1100`. Every person is one `Passport`; account-ness is optional
(`userId String? @unique`). The identity satellites (`DirectoryProfile:1121–1122`,
`LineageNode:2670–2671`, `Affiliation:1433–1434`, `RankAward` earner `:2151–2152`,
`FightRecord`) all root on `passportId` — most `@unique NOT NULL` with `Cascade`. Meanwhile
**acting-account** relations deliberately stay on `User` (`User:99` — `awardedRankAwards
@relation("AwardedBy")`, with the `:94–96` comment explaining exactly why: "the promoter is
an account actor"). `RankAward` even models the split explicitly: `awardedById` (the acting
account) vs `awardedByPassportId` (historical promoter identity, `:2155–2161`).

**Lesson:** separate *identity* (a person exists) from *account* (a person can log in). Big
platforms all converge on this; we got there via a documented migration (Phase 3a–3c
comments preserved in the schema itself).

### 1.5 Enum-over-string with the *why* attached

`UserRole` (`schema.prisma:57–66`): the comment block is a model of professional schema
writing — it states the reason ("a typo can't silently bypass an authz gate"), the deliberate
exclusion (`lineage_tree_admin` is a derived UI label, never stored), and the constraint that
shaped it (Better Auth array-roles would emit `"a,b"`, invalid for an enum column). The
String→enum conversion was a hand-authored migration with a `USING` cast
(`prisma/migrations/20260626000000_user_role_enum`).

### 1.6 `citext` for human-typed identity text

`datasource … extensions = [citext]` (`schema.prisma:8–11`), applied to `Tool.name:242`,
`Category.name:282`, `Tag.name:304`, `Post.title:4085`. Case-insensitive uniqueness and
lookup live in the column type, not in scattered `LOWER()` calls. This is the Postgres-native
answer; app-level lowercasing (which we also do — `LineagePendingClaim.email:2900`
"lowercased at write time") is the fallback when the column predates the extension.

### 1.7 onDelete as a deliberate, documented policy

The three referential actions are chosen per-relation with the reasoning inline:

- **Cascade** — owned children die with the owner: `Session:185`, `Account:207`, all
  Passport satellites, `Bookmark` subjects.
- **SetNull** — history survives the referent: `RankAward.organization:2162–2168` ("removing
  an org never drops promotion history"), `RankAward.promotionEvent:2170–2175`,
  `Affiliation.organization:1435`.
- **Restrict** — the fact protects its referent: `RankAward.rank:2153` — you cannot delete a
  `Rank` that people hold.

**Lesson:** for every FK ask "if the parent dies, is the child (a) meaningless → Cascade,
(b) still-true history → SetNull, or (c) evidence the parent must not die → Restrict?" Write
the answer as a comment when it isn't obvious.

### 1.8 Unique constraints as domain invariants

Not dedupe hygiene — *business rules in DDL*:

- One membership per person-org-discipline: `Membership @@unique([userId, organizationId,
  disciplineId]):1366`.
- One award per person per belt: `RankAward @@unique([passportId, rankId]):2186`.
- A belt ladder can't have two belts on the same rung, nor two rungs with the same name:
  `Rank @@unique([rankSystemId, sortOrder]) + @@unique([rankSystemId, name]):1328–1329`.
- One node appears once per tree: `LineageTreeMember @@unique([treeId, nodeId]):2787`.
- One pending invite per email+node: `LineagePendingClaim @@unique([email, nodeId]):2911`.
- Importer idempotency as a constraint: `KanbanCard @@unique([configId, source,
  sourceRef]):4227`, with the Postgres NULLs-are-distinct behavior *deliberately exploited*
  and documented so manual cards (null `sourceRef`) never collide (`:4210–4211`).

### 1.9 Hot-path composite indexes, with provenance

Indexes exist for named queries, and say so: `Membership @@index([disciplineId, status,
rankId]):1371–1372` ("member-by-rank carousel query perf, SESSION_0125"); claim queues index
`([brand, status])`, `([passportId, status])`, `([nodeId, status])`
(`PassportClaimRequest:3068–3072`) — exactly the shapes the admin review queue filters on.

### 1.10 The schema is annotated like an ADR

`@added / @why / @wired` blocks throughout (e.g. `ToolTier:31–33`, `LineageTree:2712–2714`,
`KanbanCard:4190–4199`), optimistic-locking `version` on `Membership:1345–1348` with its
consumer named, and honest self-audit notes ("`@wired` (no runtime consumers found —
verify)", `LineageClaimEvidence:2918`). Future readers get the *why* at the point of use —
the schema file doubles as its own change log. This is rare and worth protecting.

### 1.11 Disciplined discriminators (when a union is *right*)

`PassportClaimRequest.type` (`PassportClaimType { IDENTITY, RANK_PROMOTION }`,
`schema.prisma:2989–2997, 3017–3019`) is a type-union done correctly — because the two kinds
share ~all machinery (evidence, review queue, statuses, finalize skeleton) and diverge in one
branch. ADR 0035 Amendment 1 records the rejected sibling-table alternative and the reason
("a second table duplicates the claim machinery for no invariant gain"). Contrast §3.6: when
the kinds *diverge* in behavior and lifecycle, a union becomes a god-model and you want a
sibling instead. Knowing which side of that line you're on is the skill.

---

## Part 2 — What we do poorly (and the professional fix)

### 2.1 Parked multi-brand columns = ambient dead ceremony

`enum Brand` (`schema.prisma:414–419`) is stamped on ~30 models (`Post.brand:4097`,
`Membership:1340`, `Media:3616`, `LineageTree:2717`, `PassportClaimRequest:3023`,
`BblEmailCapture:4172`…), plus `Brand?` on `RankSystem/Rank/Role` and `Brand[]` on
`ContentAtom.siteTargets:3194`. Meanwhile the app is single-brand: `lib/brand-context.ts:40`
— `export const resolveBrand = (_host?: string | null): Brand => Brand.BBL`. The old
`getRequestBrand` call sites are **fully pruned (0 remain)**; the columns are deliberately
PARKED (brand = the BBL-vs-Baseline data separator until ADR 0038 per-product DBs finish the
split). That parking is a legitimate, decided staging area — the *failure mode* is that new
models keep cargo-culting `brand Brand` (e.g. `KanbanCard` correctly does **not**; several
mid-era models did). **Fix:** (a) a schema-top comment declaring brand columns frozen — no new
ones without an ADR; (b) column drops staged behind the ADR 0038 DB separation; (c) treat any
new `brand` field in review as a default-reject.

### 2.2 Enum values that lie: `PostStatus.Scheduled`

`PostStatus { Draft, Scheduled, Published }` (`schema.prisma:51–55`). The admin form offers
Scheduled (`app/app/posts/_components/post-form.tsx:282`; table filter + badge variants
too), but the public read path selects **only** `PostStatus.Published`
(`server/web/posts/queries.ts:21,31,44`) and the only cron is `app/api/cron/publish-tools` —
there is no post-publishing job. A Scheduled post silently never publishes. Tools do this
correctly (`publish-tools/route.ts:18` flips `Scheduled→Published`; `lib/tools.ts:56–57`).
**Fix:** either wire Posts into the same cron pattern (or read
`status=Scheduled AND publishedAt <= now()` as published), or remove Scheduled from the post
form until the job exists. An enum value the system can enter but never leave is a lie in
the type system — worse than no option at all.

### 2.3 A defaulted status column that must never be read

`RankAward.verificationStatus` defaults to `UNVERIFIED` (`schema.prisma:2143`) yet ADR 0035
§5 + Amendment 1 rule it **vestigial for display** — every displayed award is trusted, and no
code path mints an `UNVERIFIED` award for belt journey. The design is right (see §1.2); the
*hygiene* is wrong: unlike its neighbor `mediaUrls` (`:2140`, which carries a
`/// @deprecated` doc-comment), `verificationStatus` has no field-level warning. A new
engineer will read the enum and build a badge off it — that exact bug shipped once already
(LR 0008 double-badge). **Fix:** a `///` doc-comment on the field ("NOT a display axis — see
ADR 0035 §5/Amendment 1"), and long-term either collapse it into `source` or move
verification events to an audit table. In this codebase the generated docstring is the last
guardrail before someone re-litigates the ADR by accident.

### 2.4 Three coexisting claim systems (superseded models still live)

ADR 0036 declared `PassportClaimRequest` "THE single person-claim record"
(`schema.prisma:2999–3013`) — yet its predecessors remain as full tables with live
User-relations: `LineageClaimRequest:2856–2889`, `ProfileClaimRequest:2961–2987` (person arm
superseded; org arm still legitimate), plus near-identical twin evidence tables
(`LineageClaimEvidence:2919–2933` — flagged in its own comment as "no runtime consumers
found" — vs `PassportClaimEvidence:3076–3090`). Tolerated duplication is fine **when
labeled and time-boxed** (single-source-of-truth rule); this one is labeled but not
time-boxed. **Fix:** a dated drop plan — migrate any residual rows, delete
`LineageClaimRequest` + `LineageClaimEvidence`, narrow `ProfileClaimRequest` to
ORGANIZATION-only (rename toward `OrgClaimRequest` at that point), and remove the six dead
User back-relations (`User:103–107`).

### 2.5 `Favorite` vs `Bookmark` — the same concept, once right, once wrong

`Favorite` (`schema.prisma:3888–3900`) is an **open** polymorph: `entityType
FavoriteEntityType + entityId String` — no FK, no cascade, no join, orphan `entityId`s on
delete. `Bookmark` (§1.1) is the same concept done right, and ADR 0029 already picked it.
The subject lists even overlap (`FavoriteEntityType:999–1006` has `ORGANIZATION`,
`TECHNIQUE`; `BookmarkSubjectType` has both). Two save systems means every "has the user
saved this?" read must know which table a subject lives in. **Fix:** fold the still-wanted
subjects (`EVENT`, `COURSE`, `CONTENT_ATOM` if genuinely used) into `BookmarkSubjectType` as
real FKs, migrate rows, drop `Favorite`. If `Favorite` turns out unwired, delete it outright
(prefer deletes — S48 lesson).

### 2.6 `MediaAttachment` — a closed-ish polymorph missing its guardrails

`schema.prisma:3647–3693`: ten nullable owner FKs (real relations — good), but **no
discriminator enum, no exclusive-arc enforcement, and no uniqueness** — nothing stops one
attachment row pointing at two owners, or the same media attached to the same owner five
times. Compare `Bookmark`, which has all three. It also grows a column per new owner (now
10) with `purpose` as a free-text `String?`. **Fix:** add an `ownerType` enum (mirroring
`BookmarkSubjectType`'s pattern), per-owner composite uniques where duplication is
meaningless, and — since Prisma can't express CHECK constraints — a hand-authored migration
adding an exactly-one-owner CHECK (we already hand-author migrations; see §3.1 gotchas).

### 2.7 `User` as a wave-organized relation hub

`User` carries ~70 back-relations grouped by construction era — "Wave B relations",
"Wave C", "Wave D" (`schema.prisma:137–148`) — i.e. organized by *when we built it*, not by
*domain*. That is the horizontal-layer smell the vertical-codebase law targets: a reader
asking "what can an account do in the belt domain?" must scan an undifferentiated hub. The
identity half was already fixed (satellites re-rooted on Passport, §1.4). **Fix:** purely
editorial — regroup the remaining acting-account relations under domain headings (claims /
school-ops / billing / content / media / privacy). Zero migration; large legibility gain.

### 2.8 Small defects and inconsistencies

- **Real bug:** `ContentTask.updatedAt DateTime @default(now())` (`schema.prisma:3267`) and
  `Media.updatedAt DateTime @default(now())` (`:3631`) — missing `@updatedAt`, so both
  columns freeze at creation. Every other model does it right. One-line fix each.
- **Redundant index:** `User @@index([id]):171` — the PK is already indexed.
- **Enum casing is three-way inconsistent:** Dirstarter PascalCase (`PostStatus.Draft`),
  platform SCREAMING_SNAKE (`MembershipStatus.ACTIVE`), lowercase (`UserRole.user`,
  `KanbanCardSource.ledger`). Each had a local reason (template heritage; Better Auth string
  compatibility); pick SCREAMING_SNAKE for all *new* enums and note the legacy bands.
- **FK naming drift:** the codebase convention is `xxxById` + a named relation
  (`reviewedById`, `awardedById`), but `DataSubjectRequest.fulfilledBy:4149` is an FK column
  without the `-Id` suffix, and its submitter FK is a bare `userId` with a separately-named
  `user` relation (`:4143,4152`). Minor, but conventions only pay when they're total.
- **Stale schema TODO:** the Dirstarter-template banner (`schema.prisma:396–408`) still says
  "TODO(remove-before-prod): delete the Dirstarter template models … before BBL DNS
  cutover" — cutover happened, BBL is live, and `Tool`/`Category`/`Tag` became load-bearing
  (Post taxonomy, listing kernel). The TODO is now confidently wrong; per the operating
  mantra, kill it and ratify the models as adopted.

### 2.9 Nullable-FK sprawl on claim door-context — named, accepted, bounded

`PassportClaimRequest` carries eight nullable FKs (`node/tree/directoryProfile/claimedRank/
claimedSchool/trainedUnderNode/representTree/reviewedBy`, `schema.prisma:3038–3064`). Which
combination is valid per `type` is enforced only in the action layer — the DB accepts any
mix. This is a *known* Prisma limitation trade (no native CHECK), and the block comments do
carry the rules. Keep it bounded: if a ninth door-context FK appears, that is the signal to
split the claim vertical (per-type child tables), not to keep widening.

---

## Part 3 — Teaching sections

### 3.1 Enums — when, why, and how they evolve

**Use an enum when** the value set is (a) closed, (b) owned by this system, and (c) load-
bearing for behavior — statuses, roles, kinds. The gain is the DB rejecting garbage: see
`UserRole:57–66` ("a typo can't silently bypass an authz gate"). **Don't** use an enum for
open vocabularies (school names → FK + free-text fallback, `Affiliation.schoolName:1424`) or
pure display strings.

**Evolution rules (Postgres):**

- *Adding* a value is cheap (`ALTER TYPE … ADD VALUE`) — but it is non-transactional on older
  Postgres and cannot run inside the same transaction that uses the new value; Prisma's
  generated migration handles ordering, but hand-check when combining with data backfill.
- *Removing/renaming* a value has **no direct DDL** — you create a new type, `USING`-cast the
  column, drop the old type. Hand-author it (this repo's `20260626000000_user_role_enum`
  String→enum migration is the template; same `USING text::enum` cast shape).
- **Never ship a value the system can't honor** — that's the `PostStatus.Scheduled` lesson
  (§2.2). An enum is a contract with every reader; a value with no writer *or* no reader is
  drift with a type signature.
- Statuses that represent a *review lifecycle* deserve the full set up front:
  `LineageClaimStatus { PENDING, APPROVED, DENIED, NEEDS_INFO, CANCELLED }:581–587` has aged
  well across three claim generations because it modeled the workflow, not the first UI.
- **No dormant columns for future phases.** Phase-2 features get their enum values in
  phase 2 (this is ratified policy — ADR 0042 Amendment 1's moderation cut ships
  `PUBLISHED|HIDDEN` only). A dormant value invites a reader to build against vapor.

### 3.2 Foreign keys and onDelete

Covered concretely in §1.7 — the professional discipline is that **onDelete is a domain
decision, not a default**. Three of ours worth memorizing:

- `RankAward.rank … onDelete: Restrict:2153` — facts protect their referents.
- `RankAward.organization … onDelete: SetNull:2167` — history outlives orgs.
- `Passport.user … onDelete: Cascade:1070` + satellites — identity owns its record tree.

Prisma's implicit defaults (optional→SetNull, required→Restrict) are *usually* right but
silently so; write the action explicitly on any relation where a reviewer might wonder.

### 3.3 Relation naming

- **Name the relation whenever two models connect more than once**: `RankAward` ↔ `User` via
  `"AwardedBy"`; `LineageRelationship` ↔ `LineageNode` via `"LineageFrom"`/`"LineageTo"`;
  `WaiverSignature` `"SignedOnBehalf"`. Unnamed duplicate relations are a Prisma error, but
  *meaningfully* named ones are documentation.
- **Name FK fields by role, not by type**: `claimantUserId` / `reviewedById` beat a second
  bare `userId`. Follow `xxxById` + relation `xxxBy` (breached in §2.8).
- **Directed edges need direction semantics on the field, not in tribal memory.**
  `LineageRelationship.fromNodeId/toNodeId:2697–2700` is direction-neutral while
  `LineageRelationType:537–545` mixes voices — `INSTRUCTOR_STUDENT` reads from→to as
  instructor→student, but `PROMOTED_BY` reads the *reverse* arrow, and `TRAINING_PARTNER` is
  symmetric (stored one-way, so every reader must query both directions). Professional fix:
  document per-type direction at the enum (`/// from = instructor, to = student`), keep all
  types in one consistent voice (prefer active: `PROMOTED` not `PROMOTED_BY`), and for
  symmetric types either write both edges or canonicalize (lower id first) — pick one and
  write it down.

### 3.4 Polymorphic patterns — closed contract vs open string pair

Three tiers, all present in this schema (full detail §1.1, §2.5, §2.6):

| Tier | Example | Integrity | Verdict |
| --- | --- | --- | --- |
| Closed contract (enum discriminator + per-FK + per-FK uniques) | `Bookmark:353` | Full FK, cascade, joins, invariants | **The standard.** |
| Per-owner FKs, no discriminator/uniques | `MediaAttachment:3647` | FK yes; exclusivity/dedupe no | Acceptable; retrofit the guardrails. |
| Open `(entityType, entityId)` string pair | `Favorite:3888` | None — orphans on delete | **Rejected.** Migrate to Bookmark. |

Why we chose closed (ADR 0029): the open pair looks cheaper (no schema change per subject)
but pushes integrity into every reader forever. The closed contract costs one column + one
unique per subject type at *design time* — and the migration adding a subject is mechanical
(see `Bookmark:357` — discriminator backfilled to `TOOL` additively). Rails-style
`commentable_type/commentable_id` is the open pattern; note that the companies that ship it
at scale compensate with infrastructure we don't have (online schema-change tooling,
app-layer integrity sweepers). At our scale, the DB is the sweeper — use it.

### 3.5 Unique constraints as domain invariants

§1.8 has the inventory. The teaching point: read each `@@unique` aloud as a business rule —
if it doesn't parse as one ("a person holds a given belt at most once"), it's probably just
dedupe and belongs in app code. Corollaries: (a) Postgres treats NULLs as distinct in unique
indexes — exploit it deliberately and *say so* (`KanbanCard:4210–4211`), never accidentally;
(b) a unique on a nullable FK (`LineageRelationship @@unique([rankAwardId]):2704`) is how you
say "at most one edge per award" — fine, but if it's conceptually 1:1, model it as a 1:1
relation (`RankMilestone.rankAwardId @unique:2205`) so the client types say it too.

### 3.6 Vertical slices + DDD applied to schema

**The law:** code that changes together should live together — and *models* that change
together form an **aggregate**: one root, its dependents, one consistency boundary, edited
via the root.

Our real aggregates (each is a contiguous, commented band in the schema file — keep it that
way):

| Aggregate root | Members | Boundary rule |
| --- | --- | --- |
| `LineageTree:2715` | `LineageTreeMember`, `LineageVisualGroup`, `LineageTreeAccess` | All Cascade off the tree; placement/visuals never leak onto `LineageNode` |
| `Passport:1042` | `DirectoryProfile`, `LineageNode`, `Affiliation`, earner-`RankAward`, `FightRecord` | Identity satellites root here, not on `User` |
| `PassportClaimRequest:3014` | `PassportClaimEvidence` | Evidence never outlives the claim (Cascade) |
| `RankAward:2135` | `RankMilestone` | Fact is authoritative; enrichment is 1:1 beside it |
| `ContentAtom:3179` | `ContentVariant`, `ContentTask`, `ContentPublication` | Atom is canon; variants derived; all Cascade |

Cross-aggregate links are **nullable SetNull references, not ownership**
(`LineageVisualGroup.promotionEventId:2814`, `RankAward.organizationId:2167`) — an aggregate
may *point at* another but never *own into* it. That's the DDD reference-by-id rule showing
up as onDelete policy.

**A new feature is a new vertical, not a widened model.** The governing precedent chain:

1. ADR 0040 killed the `kind`-union god-component (`kind=generic` dropped) at the UI layer.
2. ADR 0043 put belt stories in a sibling `RankMilestone` instead of widening `RankAward`.
3. ADR 0042 Amendment 1 (SESSION_0493) applies it to content: the member community feed is a
   **new `CommunityPost` model + its own slice**, *not* `Post.kind = EDITORIAL | COMMUNITY`.
   Test: editorial `Post` and community posts differ in author model, moderation lifecycle,
   ranking, and admin surface — near-total divergence → sibling. Compare
   `PassportClaimType:2994` (§1.11), where near-total *sharing* justified the union. The
   question is always "how much of the machinery is genuinely shared?", answered honestly.

**Shared non-domain code is its own vertical with an explicit public seam.** The blog-post
version of this is the design-system directory; our schema versions are `Bookmark` (§1.1),
`Media`/`MediaAttachment` (`:3614`), and the taxonomy pair `Category`/`Tag` — platform
verticals many domains consume through a *closed contract* (the discriminator enum + FK is
the seam). Extending the seam (a new `BookmarkSubjectType`) is an explicit, reviewed act —
exactly what the vertical-codebase model wants from a public API between verticals, and the
schema-level twin of `packages/ui-kit`'s export surface.

**Anti-patterns this law names in our own schema:** wave-organized relation hubs (§2.7 —
grouped by time, not domain), parallel duplicated verticals awaiting collapse (§2.4 claims,
§2.5 Favorite/Bookmark), and ambient cross-cutting columns stamped everywhere (§2.1 brand).
Each is the horizontal smell in a different costume.

---

## Checklist — reviewing a schema PR

1. New model: which aggregate does it join — or is it a new vertical? (Never "just add a
   kind to an existing model" without the §3.6 shared-machinery test.)
2. Every enum value has a writer AND a reader shipping in the same slice.
3. Every FK has an explicit, defensible `onDelete`.
4. Every `@@unique` reads aloud as a business rule.
5. Indexes match named query shapes; no `@@index([id])`.
6. `updatedAt` uses `@updatedAt`, not `@default(now())`.
7. Polymorphic? Closed contract (discriminator + real FKs + per-FK uniques). No string pairs.
8. No `brand` column without an ADR. No dormant phase-2 columns.
9. Migration hand-authored + shadow-replayed if any concurrent worktree touched the DB
   (see `docs/runbooks/dev-environment/schema-migration.md`).
10. `@added/@why/@wired` comment on anything a future reader will question.
