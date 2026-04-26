# Behavioral roadmap — plan spec vs current build

This document treats the [ChatGPT-authored plan](source/chatgpt-original-plan.md) as a **functional spec** (what behaviors the system must support) and compares it against what's currently built in the codebase. We don't copy the plan's MySQL schema verbatim — we adopt its behavioral requirements onto the new Postgres + Prisma + Dirstarter foundation.

Use this doc to:
- judge whether each thing we ship covers a real spec'd requirement
- track what's missing and why we're choosing to defer or prioritize it
- not silently drift from the original product intent

---

## Plan's core architecture: Passport + Shells

The plan is built around **two primitives** (sections 1–2):

1. **Passport** — global identity. *One per user.* Holds: legal/display name, DOB, gender, phone, emergency contact, avatar. Independent of any org/league/tournament.
2. **Shells** — context-specific identity. The same person has **different attributes** in different contexts:
   - **Organization Shell** (dojo/league/school): membership status, roles, rank
   - **Discipline Shell** (Karate vs BJJ vs TKD): different rank system per discipline
   - **Tournament Shell**: registration status, role for that event, **rank snapshotted at registration time** so future promotions don't rewrite competitive history

This model isn't optional — it's the spine of the data architecture and resolves the requirement *"same profile passport, but different ranks/roles/member statuses across different shells."*

### Plan's primary entities (section 2)

| Entity | Role |
|---|---|
| **User** | Login/account |
| **Passport** | Global profile (1:1 with User) |
| **DirectoryProfile** | Privacy/visibility settings (1:1 with User) |
| **Organization** | Dojo / league / school / club |
| **Discipline** | Karate / BJJ / TKD / etc. |
| **RankSystem + Rank** | Belt/dan/kyu lists per discipline |
| **Membership** | User × Organization × Discipline (with rank, status, multiple roles) |
| **Tournament** | Tournament event |
| **TournamentDiscipline** | Tournament × Discipline (one tournament can support many) |
| **Division** | Age/weight/rank/gender/format categories under a tournament discipline |
| **Registration** | User signs up for tournament |
| **RegistrationEntry** | One row per division × role the user entered, with rank/org snapshot |

---

## Current schema (apps/web/prisma/schema.prisma) — what we have

| Plan entity | Our model | Status |
|---|---|---|
| User | `User` (Better-Auth) | ✅ exists |
| Passport | `Profile` | ⚠️ shape mismatch — Profile has bio/phone/socialLinks; missing DOB, gender, legal names, emergency contact, avatar |
| DirectoryProfile | — | ❌ missing entirely |
| Organization | `School` | ⚠️ named School; missing type enum (dojo/league/school/club) |
| Discipline | `Style` | ⚠️ named Style; behaviorally equivalent |
| RankSystem | — | ❌ missing — we collapsed it into a flat `Belt` table |
| Rank | `Belt` | ⚠️ exists but oversimplified — no `kind` (belt/dan/kyu_dan), no `color_hex`, no `short_name` |
| Membership | `Membership` | ⚠️ shape mismatch: missing `discipline` dimension; status is missing (no invited/pending/active/suspended/expired); single-role-per-membership instead of M:N |
| Tournament | `Tournament` | ⚠️ shape — missing per-discipline split, status enum (draft/published/closed/archived), venue fields |
| TournamentDiscipline | — | ❌ missing — currently no concept of "tournament supports multiple disciplines" |
| Division | — | ❌ missing — no age/weight/rank/gender constraints, no format (single_elim/round_robin/forms/sparring) |
| Registration | `TournamentRegistration` | ⚠️ minimal — no status enum, no payment status, no submitted_at |
| RegistrationEntry | — | ❌ missing — **and this is the table that holds the rank/org snapshots, which the plan calls out as critical** |

---

## Where Brand fits (our addition, not in the plan)

The plan has no `Brand` concept. We added it (ADR 0004) because the rebuild needs to support multiple brand-faces (Ronin Dojo Design, Baseline Martial Arts, BBL, WEKAF) on one shared DB.

These two models are **orthogonal and compatible**:

- **Brand** = which marketing face / domain the user is in (host-derived).
- **Passport + Shells** = the identity/membership model the plan describes.

Practically: a `School` (or, post-rename, `Organization`) belongs to a `Brand`. The brand-as-column scoping (ADR 0004) is fine and stays. The Passport+Shells redesign happens *inside* the brand-scoped tables.

---

## Plan's behavioral requirements not yet covered

Beyond schema shape, the plan implies these **behaviors**:

1. **Membership lifecycle**: invited → pending → active → suspended → expired. Not in current model. Required for organization workflows (invite student, approve pending application, suspend lapsed payment).

2. **Multiple roles per membership**: a user might be both a `coach` and a `judge` at the same dojo. Current model is single-role; needs M:N to a Role catalog.

3. **Rank-at-registration snapshot**: when a competitor registers for a tournament, freeze their rank/org as a string (`snapshot_rank_name`, `snapshot_org_name`) so a later promotion doesn't rewrite the historical division they competed in.

4. **Directory search with privacy**: directory listings respect each user's `DirectoryProfile.visibility` (hidden / members_only / public) and per-field flags (`show_email`, `show_phone`, etc.).

5. **Tournament division eligibility**: divisions enforce gender/age/weight/rank constraints. Registration UI filters or rejects out-of-range entries.

6. **Idempotent registration submission**: the plan mentions idempotency keys + audit logging on registration. We haven't accounted for that.

7. **Per-discipline rank systems**: a school teaches Karate and BJJ → those use different rank systems → users hold different ranks per discipline. Our `Belt` model can't represent this without `RankSystem`.

---

## UI behavioral spec (plan section 5: "Ronin Bar")

The plan calls for a Mac-menu-bar-style top chrome:

- **Compact mode**: context switcher, search, notifications, avatar
- **Full mode**: full app navigation
- **Traffic-light buttons** (left side): red (close panel / hold to log out), yellow (compact), green (full / focus)
- **⌘K command palette** in the center: search across directory, tournaments, members
- **Right side**: context dropdown (Dojo / Tournament / Admin), notifications, profile

We haven't built any of this. **The "context dropdown" the plan describes is functionally what we've been calling the Brand Switcher** — but the plan's version is more general (it switches between Dojo / Tournament / Admin contexts, not just brands).

---

## Plan's milestone ordering

The plan's recommended build order (section 6):

1. **Milestone 1 — Identity + Membership Shells**
   1. Auth + User + Passport CRUD
   2. Organization create/join
   3. Membership per (org × discipline)
   4. Directory search (basic) with privacy controls
2. **Milestone 2 — Tournament registration**
   1. Tournament create (draft → published)
   2. Add disciplines + divisions
   3. Registration + entries + rank/org snapshotting

Our current todo list jumps to per-brand rollouts (Ronin Dojo Design, BBL, etc.) without first nailing the Identity + Membership Shells milestone. **The plan's order is better** — get the identity/membership/directory loop working once, then per-brand work becomes data + theming, not architectural rework.

---

## Recommended sequencing (revised against plan)

Each item below is "one task" in the user's sense — pick one, finish it, then come back for the next.

### Phase 0 — finish the foundations we started

- ✅ `lib/authz.ts` — exists, but needs renames (`School` → `Organization`, `Style` → `Discipline`) once schema rev lands. Functional check on logic vs plan's permissions model is otherwise good.
- ✅ `middleware.ts` — host→brand resolution, fine as-is.
- ⏸ Prisma client extension for brand scoping — defer until schema rev, since model names will change.
- ⏸ Better-Auth `lastActiveBrandId` field — fine to do now, no schema dependency.

### Phase 1 — schema rev to align with Passport + Shells

One migration that:
1. Renames `Style` → `Discipline` and `School` → `Organization` (keeps brand column).
2. Adds `Organization.type` enum (dojo / league / school / club).
3. Creates `RankSystem` between `Discipline` and `Belt`. Renames `Belt` → `Rank` with new fields (kind, color_hex, short_name, sort_order).
4. Expands `Profile` → renames it `Passport` and adds DOB, gender, legal names, emergency contact, avatar.
5. Adds `DirectoryProfile` (visibility + privacy flags).
6. Reshapes `Membership`: adds `disciplineId`, adds `status` enum, replaces single-role with `MembershipRoleAssignment` join table.
7. Reshapes `Tournament`: adds status enum, venue fields, splits into `Tournament` + `TournamentDiscipline` + `Division`.
8. Adds `RegistrationEntry` with rank/org snapshot fields.

This is a big migration but it's the right time for it — no real data exists yet, so a rebuild is cheap. **Do this before building any UI.**

### Phase 2 — Milestone 1 (Identity + Membership Shells)

Sequence per the plan:
1. Better-Auth wired with Passport linkage (sign-up creates User + Passport stub).
2. Passport CRUD UI (a `/me` route).
3. Organization create + join flow.
4. Membership creation tied to (Organization × Discipline) with role assignment.
5. Directory search with `DirectoryProfile` privacy filters.

### Phase 3 — Milestone 2 (Tournament registration)

Per the plan:
1. Tournament create wizard (draft → published).
2. Add disciplines + divisions to a tournament.
3. Registration → entries with rank/org snapshot at submit time.
4. Idempotency + audit log on submission.

### Phase 4 — Per-brand rollout

Each brand becomes:
- A subdomain mapping in `middleware.ts`
- Theming (colors, logo, copy) via the brand cookie/header
- Optional brand-specific seed data

This is when the legacy frontends get ported visually, but they all consume the same Phase 1–3 APIs.

### Phase 5 — Ronin Bar UI shell

Compact/full mode, traffic-light buttons, ⌘K palette, context dropdown. Layered on top once the data + flows are working.

---

## Open questions to resolve before Phase 1

1. **Naming**: `School` → `Organization` (plan's term)? Or keep `School` since most members will think in those terms? (Recommendation: rename to `Organization`, matches the plan and supports future league/club types without rework.)
2. **Style** → `Discipline`? (Recommendation: rename — the plan's `discipline` is the standard MA term and avoids overloading "Style" with CSS connotations.)
3. **Profile** → `Passport`? Or keep `Profile` and rename later? (Recommendation: rename now while there's no real data.)
4. **Should `Belt` become `Rank`** with a `RankSystem` parent? (Recommendation: yes — directly per plan.)
5. **Multiple roles per membership** — implement now, or defer with a TODO and enforce single-role for MVP? (Recommendation: do now — `MembershipRoleAssignment` join table is a small extra surface that future-proofs.)
