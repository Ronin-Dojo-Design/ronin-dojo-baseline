---
title: "BBL Pods → Prisma Schema Inventory & Consolidation Map"
slug: pods-schema-inventory
type: reference
status: draft
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0728
sprint: S13
pairs_with:
  - docs/product/black-belt-legacy/BBL_PODS_FULL_IMPORT_SPEC.md
  - apps/web/prisma/schema.prisma
backlinks:
  - docs/knowledge/wiki/index.md
---

# BBL Pods → Prisma Schema Inventory & Consolidation Map

> **One-line:** every field in the WordPress/Pods `bbl_member` (95) + `bbl_school` (20) authority
> definitions, mapped to the current Prisma schema as **✅ have / ⚠️ partial / ❌ missing / 🔁 dup**,
> plus the net-new forward features (stripes, globe). Produced SESSION_0728 (operator-authorized
> ADR-0059 read of `rdd-monorepo/wordpress/pods/*_pod.json`). Supersedes the Phase-1 gap sketch in
> [BBL_PODS_FULL_IMPORT_SPEC.md](BBL_PODS_FULL_IMPORT_SPEC.md).

**Authority source:** `rdd-monorepo/wordpress/pods/bbl_member_pod.json` (95 fields),
`bbl_school_pod.json` (20 fields). **Target:** `apps/web/prisma/schema.prisma`.

Legend: ✅ have · ⚠️ partial / mismatch · ❌ missing · 🔁 duplicate-to-consolidate · 🆕 net-new (not in Pods)

---

## Headline

| Bucket | Count | Notes |
| --- | --- | --- |
| ✅ cleanly covered | ~60 | per-belt ladder, core profile, school basics |
| ⚠️ partial / semantic mismatch | ~8 | galleries wiring, `started_training_at`, 2→1 bio |
| ❌ genuine migration gaps | ~12 | listed below — mostly Organization + Affiliation roles |
| 🔁 DRY consolidation | 3 | `RankAward.mediaUrls`, socials blob, website split |
| 🆕 net-new (NOT in Pods) | 1 | **belt stripes 0–4** — a forward feature, not a migration |

**Two surprises worth stating up front:**
1. **`latitude_longitude` IS in the Pods `bbl_school` source** (a `text` field) — so school geo is a
   *migration gap*, not net-new. The globe/map feature is unblocked by data we already had.
2. **Belt stripes (0–4) are NOT in the Pods source at all** — the ladder is color + degree only.
   Stripes are a genuine new feature to design, not a field to port.

---

## Group 1 — Identity & profile → `Passport` / `User`

| Pods field | Type | Schema home | Status |
| --- | --- | --- | --- |
| full_name / display_name | text | `Passport.legalFirstName` / `legalLastName` / `displayName` | ✅ |
| email_address | email | `User.email` (+ `Passport.showEmail`) | ✅ |
| date_of_birth | date | `Passport.dob` | ✅ |
| place_of_birth | text | `Passport.placeOfBirth` | ✅ |
| current_place_of_residence | text | `Passport.currentResidence` | ✅ |
| city_state_country_of_origin | text | — (overlaps `placeOfBirth`) | ⚠️ decide: reuse or new |
| mailing_address | text | — | ❌ missing |
| biography (long) + bio (short) | paragraph ×2 | `Passport.bio` (one) | ⚠️ 2→1 collapse (accept) |
| profile_picture | file | `Passport.avatarUrl` | ✅ |
| cover_photo | file | `Passport.coverPhotoUrl` | ✅ |
| title_preferred | text | — | ❌ missing (honorific/title) |
| belt_size / shirt_size | text | — | ❌ missing (→ `Passport.sizes Json?`) |
| membership_tier | pick | Membership / entitlement | ✅ |
| student_instructor_owner_status | pick | `AffiliationRole` | ✅ |
| is_verified / profile_complete | boolean | verification / derived | ✅ |
| wp_user_id / instructor_id | text/pick | legacy WP import ids | ⚠️ import-only, don't persist as schema |

## Group 2 — Media & galleries

| Pods field | Type | Schema home | Status |
| --- | --- | --- | --- |
| profile_picture / cover_photo | file | `Passport.avatarUrl` / `coverPhotoUrl` | ✅ |
| picture_gallery / any_picture_gallery | file | `MediaAttachment` (polymorphic) | ⚠️ confirm + wire |
| `<belt>_pictures` ×14 | file | `MediaAttachment` via `RankMilestone` | 🔁 **`RankAward.mediaUrls` is a deprecated Json dup — kill it** |

## Group 3 — Socials (member)

| Pods field | Type | Schema home | Status |
| --- | --- | --- | --- |
| youtube_channel / facebook_page_member / instagram_page_member | website | `Passport.socialLinks Json?` | ⚠️ untyped blob — decide typed vs JSON |

## Group 4 — School affiliations (member `pick` relations)

| Pods field | Type | Schema home | Status |
| --- | --- | --- | --- |
| current_school | pick | `Affiliation` TRAINS_AT | ✅ |
| owned_school | pick | `Affiliation` OWNER | ✅ |
| home_gym | pick | — | ❌ `AffiliationRole.HOME_GYM` missing |
| promotion_school | pick | `RankAward.organizationId` (per-belt) | ⚠️ / ❌ `PROMOTED_AT` role missing |
| representing_school | pick | — | ❌ `AffiliationRole.REPRESENTS` missing |
| instructor | pick (person) | `LineageRelationship` | ✅ |
| started_training_with | pick (person) | `LineageRelationship` or Passport field | ❓ undecided |
| started_training_at | pick (**school**) | `Passport.startedTrainingAt` is a **DATE** | ⚠️ **semantic mismatch** — source is a school, schema is a date |
| bbl_lineage_branch | pick | lineage structure | ✅ |

## Group 5 — Per-belt promotion ladder (the timeline USP) → `RankAward`

14 belt levels — white, blue, purple, brown, black, 1st–7th degree, 8th–10th coral — each carrying
`who_promoted_you_to_<belt>` (person), `<belt>_promotion_date` (date),
`where_you_were_promoted_to_<belt>` (school), `<belt>_pictures` (files):

| Pods sub-field | Schema home | Status |
| --- | --- | --- |
| `<belt>_promotion_date` | `RankAward.awardedAt` | ✅ |
| `who_promoted_you_to_<belt>` | `RankAward.awardedById` / `awardedByPassportId` | ✅ |
| `where_you_were_promoted_to_<belt>` | `RankAward.organizationId` (+ `location` freetext) | ✅ |
| `<belt>_pictures` | `MediaAttachment` (see Group 2) | ⚠️ wire; 🔁 not `mediaUrls` |
| belt_degree | `Rank.degree` | ✅ |
| current_rank_in_bjj | derived from `RankEntry` (top rank) | ✅ |
| **belt stripes 0–4** | — | 🆕 **not in Pods; new feature to design** |

> **Grouping ("promoted_with"):** already modeled as **`PromotionEvent`** (`RankAward.promotionEventId`
> groups multiple people's awards into one ceremony). Do **not** build a duplicate grouping field.

## Group 6 — School → `Organization` (`bbl_school_pod`, 20 fields)

| Pods field | Type | Schema home | Status |
| --- | --- | --- | --- |
| name_of_school | text | `Organization.name` | ✅ |
| school_logo | file | `logoUrl` | ✅ |
| school_location_address | text | `addressLine1` / `city` / `state` / `zip` | ✅ |
| **latitude_longitude** | text | — | ❌ **missing (in source!)** → globe/map |
| phone_number | phone | `phoneE164` | ✅ |
| email_address | email | `email` | ✅ |
| website | website | `websiteUrl` | ✅ |
| head_instructor / owner_head_instructor / school_owner | pick | `Affiliation` HEAD_INSTRUCTOR / OWNER | ✅ |
| assistant_instructors | pick | — | ⚠️ no ASSISTANT role |
| parent_school | pick | `OrgRelationship` | ✅ |
| history_biography_of_school | paragraph | `Organization.description` | ✅ (approx) |
| **establishment_year** | number | — | ❌ missing |
| **youtube/facebook/instagram_page_school** | website | — | ❌ missing (Org has no socials) |
| **verified / verified_by / verified_date** | bool/pick/date | — | ❌ missing (Org has no verification) |

---

## Consolidation (DRY) targets

1. **🔁 `RankAward.mediaUrls` (deprecated `Json`)** → migrate belt pics to `MediaAttachment` via
   `RankMilestone`; drop the column. Two homes for belt media today.
2. **🔁 Socials** — `Passport.socialLinks` is an untyped JSON blob; `Organization` has **no** social
   field at all. Decide one shape (typed columns vs one JSON convention) and apply to **both**.
3. **🔁 Website** — typed `Organization.websiteUrl` but member website lives inside `socialLinks`
   JSON. Align with the socials decision.
4. **⚠️ `started_training_at` mismatch** — Pods = a school pick; schema = a `Date`. Two distinct
   facts got one name. Split into "started training at (school)" + the existing date.

## Net-new forward features (design, not port)

- **🆕 Belt stripes (0–4)** — white→brown. Not in Pods. **Couples to `RankEntry`** (a person is at
  "Blue + 2 stripes"), so the shape must be settled **before the G-011 RankAward table-drop** or
  RankEntry migrates twice.
- **Globe / maps** — needs `latitude_longitude` (Group 6, already a migration gap) on `Organization`
  (+ optionally Passport residence). Data exists in source; the field + geocode wiring do not.

---

## Recommended ticket breakdown

**Onto map [#374](https://github.com/Ronin-Dojo-Design/black-belt-legacy/issues/374) (RankEntry wayfinder — couples to the table-drop):**

- **Belt-stripes shape** — where stripes live (Rank rows vs `RankEntry.stripes Int?`); decide before G-011.

**New wayfinder — "Pods schema consolidation & gap-fill"** (graduates this doc; the field authority
lives in `rdd-monorepo`, so run it monorepo-aware):

- **Organization gap-fill** — `latitude`/`longitude`, `establishmentYear`, socials, verification triad.
- **AffiliationRole additions** — `REPRESENTS`, `PROMOTED_AT`, `HOME_GYM` (+ `ASSISTANT_INSTRUCTOR`?).
- **Passport gap-fill** — `titlePreferred`, `mailingAddress`, `sizes Json?`, origin-vs-residence decision.
- **Socials shape decision** — typed vs JSON, unified member + school (resolves DRY #2/#3).
- **Media consolidation** — wire `picture_gallery` + per-belt pics to `MediaAttachment`; kill
  `RankAward.mediaUrls` (DRY #1).
- **Training-provenance split** — `started_training_with` (person) + `started_training_at` (school)
  vs the existing date (fixes the mismatch).

**Sequencing:** all of the above land **after** the RankEntry seam (#376) and the provenance
migration (#375-derived) so migrations don't race on the shared DB.

---

# Expanded gap analysis — beyond the Pods import (SESSION_0728)

Operator asked to pressure-test the whole schema (not just Pods) against every planned surface —
tournaments/wins-losses, FightCamp journal, technique graph, curriculum, nationality/flag,
school↔member registration, multi-discipline ranks, and personal life-story fields. Verified by
three parallel readers against PRD.md, STORIES.md, GAP_MATRIX.md, design-experience-epic.md,
planning-ledger.md, and the live schema (136 models). **Finding: the schema is deep — most named
surfaces already exist.** Genuine gaps below.

## Already present — do NOT rebuild

| Surface | Home | Note |
| --- | --- | --- |
| Tournaments / brackets | `Tournament`→`Division`→`Bracket`→`Match`→`MatchCompetitor` | internal WEKAF events; `MatchResult`, `ScoringMethod`, `SeedingMethod` |
| Career W/L record | `FightRecord` | **aggregate** W/L/D/NC per `Passport`×`Discipline`×`FightRecordType`; freestanding (no tournament FK) |
| Technique graph | `Technique` + `TechniquePrerequisite` (DAG) + `TechniqueProgress` + `MediaAttachment` | one discipline per technique; media polymorphic |
| Curriculum (2 systems) | `Course`/`CurriculumItem` (rank-linked content) **vs** `Program`/`ProgramEnrollment` (class ops), bridged by `ProgramCourse` | complementary, not dup — keep separate |
| Multi-discipline ranks | `Discipline`→`RankSystem`→`Rank`; `RankAward[]` per Passport | a person can hold ranks in >1 discipline today |
| Belt degree | `Rank.degree Int?` (+ `secondaryColorHex`, `beltFamily`) | dan-degree; NOT progression stripes |
| Lineage **Galaxy** viz | `/lineage/galaxy` (3D WebGL, built S525) | plots the lineage GRAPH, not geography — needs no geo schema |
| Certificates | `Certificate{Template,Order,Issuance}` | issuance flow partial (GAP_MATRIX BBL-CERT) |

> The `flag` "hits" in schema are **comment prose only** — there is no flag field. Flags render from
> a country code, which we don't yet store on the identity SoT (see below).

## Confirmed gaps — CHEAP additive wins (fold into epic #384)

| Gap | Where | Value |
| --- | --- | --- |
| **Nationality / country-of-origin** (ISO `@db.Char(2)` → flag icon) | `Passport` (identity SoT) — resolves the `city_state_country_of_origin` origin-vs-residence decision in #389 | heritage/identity + `/directory` faceting; operator explicitly wants the flag |
| **Member geo lat/long** (Globe enabler) | `DirectoryProfile` (member-rooted per D1), backfilled by geocoding existing city/region/country | design-experience-epic Stream B; pairs with Org geo in #387 |

Both are additive nullable columns, no behavior change. **Recommend adding to #384 now** (extend #389
for origin-country, extend #387's geo scope to cover member `DirectoryProfile` too).

## Confirmed gaps — NET-NEW SCOPE (operator decision required)

These are genuine greenfield — **not in Pods, not (fully) in the PRD**. Each is a "do we want this?"
call, not a port:

1. **Itemized competition / match history** — extend `FightRecord` (or add a `CompetitionResult`
   row: opponent, method/finish, event, date, placement/medal, weight class). Today only the
   aggregate tally exists. PRD lists "full tournament record" + "full achievement model" as **slice-1
   non-goals** — so this is a deliberate re-scope, not an oversight. Mission-fit: HIGH (verified
   competition record is a credibility signal on a legacy profile).
2. **Personal life-story bio** — `occupation`, `maritalStatus`, `children`-as-biography on `Passport`
   (distinct from `FamilyMember` gym accounts). Pure greenfield; not planned anywhere. Mission-fit:
   MEDIUM (fits "legacy preservation" — a black belt's life story — but expands profile scope).
3. **Training journal / FightCamp log** — new `TrainingLogEntry` model (dated entries: rounds/drills/
   sparring notes, bodyweight over time, camp/opponent, injuries, goals). No model exists; the
   closest planned thing is PL-025 (per-belt media TimeCapsuleCards — media, not free-form entries).
   Mission-fit: LOW-MEDIUM (engagement/retention driver, orthogonal to the lineage-graph moat).

## Separate lanes (NOT this epic)

- **School ↔ member registration consolidation** = **PL-026** (operator directive 2026-07-25, queued;
  needs its own plan session). Agent read: likely wiring on `Affiliation`/`Organization`
  creation-at-signup, **no new tables** — so nothing to pre-add here.
- **Dedup / merge-candidate** (GAP_MATRIX BBL-MIGRATE-002) — no `MergeCandidate` model; data-
  stewardship cleanup, lower priority.
- **Trust enum on `LineageRelationship`** (GAP_MATRIX BBL-RANK-004) — `RankAward.verificationStatus`
  already exists (that row is partly stale); verify whether `LineageRelationship` still uses a bare
  `isVerified` boolean and wants the 4-value enum. Minor.

## Ledger sweep (goals-ledger + planning-ledger, SESSION_0728)

Swept both live ledgers. Most rows are cross-brand ops (Mammoth CRM, Iggy social, token tracker,
AgentOS, Bubble Builder) — not BBL member schema. BBL-relevant new findings:

- **Creator payout / earnings / KYC — MISSING** (goal **G-009**, open P2). Premium content shipped
  the *gate* (FI-028b) with no payout side: no rev-share ledger, per-author earnings, payout
  transactions, or W-9/1099/KYC records. Tracked as G-009; **no ticket created** (already a goal).
- **`Goal` / `TrainingGoal` model — genuinely ABSENT.** The goals-ledger holds *operator* G-NNN
  governance goals, not member training goals. So the "goals concept" the training journal keys to
  does not exist — it is net-new (ticketed in #395).
- **Technique-graph epic = `G-022`** (in-progress P1, extends `G-013`). Its design waves carry a
  **"no schema migration"** constraint, so the journal + Goal lands as a **new lane under G-022**,
  not inside current work.
- Feature-intake-ledger is superseded/empty (folded into `POST_LAUNCH_SOT.md`).

## Ticketing outcome (SESSION_0728)

| Gap | Ticket |
| --- | --- |
| Origin/nationality country-code (flag) | folded into #389 |
| Member + Org geo lat/long (Globe) | folded into #387 |
| Belt stripes 0–4 | #391 (on map #374) |
| **Itemized competition history** | #393 (map #392) |
| **Life-story bio (occupation/marital/children)** | #394 (map #392) |
| **Training journal + Goal model** (new lane under G-022) | #395 (map #392) |
| Creator payout / earnings / KYC | goal G-009 (no ticket — already tracked) |

Maps: **#384** (Pods consolidation) · **#392** (profile depth & records) · belt-stripes on **#374**.

> **Ledger note:** the journal/Goal lane is now recorded as **PL-033** (planning-ledger) + **G-035**
> (goals-ledger, Extends G-022), added in black-belt-legacy SESSION_0728 at operator direction.
> These ledgers are portfolio-shared (canonical in rdd-monorepo) — **up-sync to the monorepo copy is
> pending (operator, next day)** to reconcile drift.
