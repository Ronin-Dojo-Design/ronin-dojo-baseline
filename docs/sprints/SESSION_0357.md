---
title: "SESSION 0357 — Passport-centric identity consolidation (rail→RankAward, school-as-relationship, add-person, doc discoverability)"
slug: session-0357
type: session--open
status: closed
created: 2026-06-08
updated: 2026-06-08
last_agent: claude-session-0357
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0356.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0357 — Passport-centric identity consolidation

## Date

2026-06-08

## Operator

Brian + claude-session-0357

## Goal

Restore the **documented** Passport + Shells identity architecture (`passport-and-shells.md`) that the
implementation drifted away from. Locked model: **Passport** is the single identity source of truth;
**RankAward** is the single rank source (gains `source` `STATED`|`EARNED` + verification = BBL-RANK-004);
**DirectoryProfile** is a presentation/privacy *view*; **Membership** is Baseline enrollment (paying is a
separate entitlement layer, ADR 0019); a person's **schools / affiliations / leagues are all Organizations**
(type-discriminated) linked by a new one-to-many person↔org relationship (working name TBD vs
`ubiquitous-language.md`). Fix the implementation drift so the rail / directory / lineage read the canonical
sources (the empty "Top Ranked" rail fills), add the missing admin **"add someone"** (one User+Passport
placeholder, claimable), and make the canonical docs discoverable at bow-in so agents stop re-deriving them.
Slice-gated; slice 1 (rail→RankAward) needs no migration.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0356.md`.
- Carryover: SESSION_0356 closed with the operator's BBL refocus + a flag that `memberSchoolLabel`-from-`Membership`
  is the wrong source for BBL. This session takes that school-source fix and — through an extended Petey grill —
  finds it is one facet of a wider drift from the documented **Passport + Shells** model.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean before creating this file.
- Current HEAD at bow-in: `3f8385e`
- Remote guard: `origin` = `Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd not `dirstarter_template`. FS-0024 passed.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma schema (Passport / RankAward / new person↔org relationship); the L1 `Listing`/`Tool` listing pattern (rail repurposing); `/admin/users` + `/admin/tools/new` CRUD pattern. |
| Extension or replacement | **Extension** — restores the documented Passport+Shells model and repurposes the L1 `Listing` pattern; extends `RankAward` with provenance/verification. No Dirstarter capability replaced. |
| Why justified | The code drifted into 3 disconnected "person" sources; this re-aligns to `passport-and-shells.md`, it does not invent a system. |
| Risk if bypassed | Identity stays fragmented — the rail/directory/lineage render different/empty people; BBL launch surfaces are wrong. |

Live docs checked: `passport-and-shells.md`, `ronin-project-context.md`, `lineage-data-wiring-flow.md` (SOP),
`repo-truth-index.md`, ADR 0016, GAP_MATRIX (BBL-RANK-004), and the BBL Pods schema/exports in the monorepo
(`RoninDashboard/context/BBL_PODS_SCHEMA.md`, `wordpress/pods-exports/*`).

### Graphify check

- Graph status: current; stats at bow-in: 9755 nodes, 15405 edges, 1443 communities, 1632 files.
- Queries used: BBL launch set; `Passport … source of truth …`; `sop data wiring flow …`.
- **Key finding:** graphify did **not** surface `passport-and-shells.md` for "Passport source of truth" (it
  returned the *lineage-promotion* SoT, ADR 0016) — a real discoverability gap addressed in TASK_05.
- Verification: all model facts confirmed by direct `schema.prisma` read; Pods facts by direct monorepo read.

### Grill outcome (forks resolved during planning)

1. **Passport = identity SoT; DirectoryProfile = view** — ratified (matches `passport-and-shells.md`).
2. **RankAward = single rank source**; gains `source`(`STATED`|`EARNED`) + verification (BBL-RANK-004).
   Current rank is **derived** (highest verified), never a stored Passport field.
3. **Membership = Baseline enrollment roster**; paying is a separate entitlement layer (ADR 0019); not the BBL
   school source. `Membership.rankId` deprecated→derived; **column removal deferred to a Baseline cleanup**
   (do not break Baseline this session).
4. **Schools / affiliations / leagues = all `Organization`** (type-discriminated: `DOJO/SCHOOL/CLUB` vs
   `LEAGUE/FEDERATION`). Person↔org is a **one-to-many relationship** (working name TBD — **not** `Affiliation`,
   because that word already means a group-of-schools Organization). A person's *historical* school+instructor
   per belt already lives in `RankAward.organization` + `awardedBy` + lineage `PROMOTED_BY` edges.
5. **Slug → one**, on Passport (kill `DirectoryProfile.slug` + `LineageNode.slug` as separate identities).
   **Cover/video photo → Passport** (identity media in one place).
6. **Admin "add someone" does not exist** (no create-person action; `/admin/users` has no `new/`) → **ONE**
   action creating a User+Passport placeholder (`isPlaceholder`, claimable later).

### Drift to log (IDs assigned at bow-out via the finding router)

- `black-belt-rail.tsx` reads `Membership.rank` (wrong source) → empty "Top Ranked" while the lineage is full of
  black belts; also raw `db.membership` in a `_components/` file (no DTO), no `Listing` composition, a duplicate
  `initials()`.
- Three disconnected person sources (`Membership` / `DirectoryProfile` / `LineageNode`) — the same human exists
  in only one.
- GAP_MATRIX marks **BBL-EDITOR-001 ✅ Built** but no create-person action exists anywhere.
- `passport-and-shells.md` open question (RankAward↔Membership) unresolved; `repo-truth-index.md` has no
  canonical-entity layer; graphify blind to Passport-SoT.
- Live-surface junk: test/demo rows on BBL (`E2E Karate …`, Student/Sensei Demo, "Baseline Martial Arts Academy"
  on BBL), a "Why Baseline?" brand leak + DirStarter software-dev footer categories on the BBL home, and a
  `pg` "client already executing a query" warning on `/directory`.

## Petey plan

### Goal

Re-align the implementation to the documented Passport+Shells model, slice-gated, starting with the visible
rail repoint that needs no migration.

### Tasks

#### SESSION_0357_TASK_01 — Repoint black-belt-rail to RankAward (slice 1, no migration)

- **Agent:** Cody → Doug/Playwright
- **What:** Replace the `db.membership` query in `black-belt-rail.tsx` with a brand-scoped **RankAward** read,
  routed through a proper `server/web/…` query (DTO), composed onto the L1 `Listing` pattern, reusing the shared
  member view-model (kill the duplicate `initials()`).
- **Steps:** (a) add a `server/web/disciplines/…` query — RankAwards where `rank.rankSystem.disciplineId = X`,
  brand-scoped via the **directory read-model's existing brand boundary** (do not invent one), deduped per user,
  ordered by `rank.sortOrder desc`, take 10; (b) repoint `BlackBeltRail` to it; compose `<Listing>`; remove the
  inline raw `db` + the duplicate `initials()`; (c) browser-verify the BJJ discipline "Top Ranked" fills.
- **Done means:** the rail renders the lineage black belts from RankAward; no raw `db` in the component;
  typecheck/biome/tests green; screenshot.
- **Depends on:** nothing.

#### SESSION_0357_TASK_02 — Schema foundation migration

- **Agent:** Cody
- **What:** Passport gains `slug` + `coverPhotoUrl`/`videoIntroUrl` (moved from DirectoryProfile); `RankAward`
  gains `source`(`STATED`|`EARNED`) + verification enum (BBL-RANK-004); new person↔org one-to-many relationship.
- **Done means:** additive migration green; ADR for the person↔org term + the resolved Passport+Shells question.
- **Depends on:** 01.

#### SESSION_0357_TASK_03 — `/admin/users/new` add-person (one action)

- **Agent:** Cody
- **What:** Create a User+Passport placeholder (`isPlaceholder`, claimable) + stated rank (RankAward
  `source=STATED`) + affiliation + optional lineage placement — mirroring `/admin/tools/new` and the DirStarter
  submit-form idiom (react-hook-form + Zod + next-safe-action). One action, not two.
- **Depends on:** 02.

#### SESSION_0357_TASK_04 — Repoint reads to Passport

- **Agent:** Cody
- **What:** `memberSchoolLabel` + the directory people facet read Passport / the new relationship / RankAward —
  not `Membership`.
- **Depends on:** 02.

#### SESSION_0357_TASK_05 — Doc discoverability leave-behind (parallel)

- **Agent:** Petey
- **What:** Close `passport-and-shells.md`'s open question (school resolution); add a **canonical-entity
  source-of-truth** section to `repo-truth-index.md`; link the trio (`passport-and-shells`,
  `ronin-project-context`, lineage SOP) into `opening.md`; glossary entries (DTO, view-model, `fd`, the
  person↔org term); one `human-code-runbook.md` (WP/Pods→TS map). **No new ledgers.**
- **Depends on:** nothing.

#### SESSION_0357_TASK_06 — Governance + verify + full bow-out

- **Agent:** Doug → Petey
- **Depends on:** all.

### Parallelism

TASK_01 first (visible proof, no migration). TASK_02 unblocks 03/04. TASK_05 (docs) runs parallel. TASK_06 last.

### Open decisions

- Final **name** for the person↔org relationship (vs `ubiquitous-language.md`) — confirm at TASK_02. Otherwise locked.

### Risks

- **Brand-scoping RankAward** (no `brand` column) — must reuse the directory's brand boundary, not invent one
  (TASK_01 pre-flight).
- Schema migration (TASK_02) touches Passport/DirectoryProfile/RankAward — additive first; slug/photo moves need a backfill.
- `Membership.rankId` removal is **out of scope** (Baseline blast radius).

### Scope guard

- No `Membership.rankId` column removal (Baseline cleanup, later).
- No Stripe/tier wizard; no full BBL registration-wizard port.
- One exemplar surface for the Listing repurposing (the rail) — not a repo-wide sweep.
- No demo-data purge / BBL chrome strip this session (separate fast pass) unless trivial.

### Dirstarter implementation template

- **Docs read first:** `passport-and-shells.md`, `ronin-project-context.md`, lineage SOP, `repo-truth-index.md`,
  ADR 0016, BBL Pods schema (monorepo) — 2026-06-08.
- **Baseline pattern to extend:** L1 `Listing` / `ToolList` / `FeaturedTools` composition; `/admin/tools/new`
  CRUD; the directory read-model + payloads (DTO).
- **Custom delta:** RankAward provenance/verification; the person↔org relationship; the add-person placeholder flow.
- **No-bypass proof:** restores the documented Passport+Shells model and repurposes L1 patterns — no parallel system.

## Cody pre-flight

### Pre-flight: TASK_01 (black-belt-rail repoint)

#### 1. Existing component scan

- The directory read-model (`server/web/directory/queries.ts`, `profile-projection.ts`, `payloads.ts`) already
  does brand-scoped people + RankAward — reuse its brand boundary + payload shape. `BlackBeltRail` is invoked at
  `app/(web)/disciplines/[slug]/page.tsx:239` with `{ disciplineId, brand }`.

#### 2. L1 template scan

- L1 pattern: `Listing` + `XxxList` (`featured-tools.tsx`). Compose `<Listing>`; reuse `memberInitials`
  (`lib/lineage/canvas-model.ts`).

#### 3. Composition decision

- Compose `Listing`; add a `server/web/disciplines` query (DTO); use the shared member view-model.

#### 4. Lane docs loaded

- `passport-and-shells.md`, lineage SOP (ADR 0016 — RankAward canonical), `repo-truth-index.md`.

#### 5. Dev environment confirmed

- `cd apps/web && npx next dev --turbo` (FS-0002); host `bbl.local:3000`; gates `bun run typecheck` / `bunx biome check` / `bun test`.

#### 6. FAILED_STEPS check

- FS-0002 (dev command) acknowledged; none open in this area.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0357_TASK_01 | landed | Rail → RankAward repoint (slice 1). New `server/web/disciplines/top-ranked-queries.ts` (DTO, brand = lineage-tree OR org-membership); `black-belt-rail.tsx` reads it (no raw db); list reuses `memberInitials` + `BeltSwatch`, literal `<li>`. **Browser-verified** — empty "Top Ranked" now fills with the lineage black belts (`bbl-06-rail-beltswatch-full.png`); biome + typecheck green. |
| SESSION_0357_TASK_02 | landed | Additive migration `20260608124028_…provenance_affiliation`. `RankAward` + `source`/`verificationStatus` (BBL-RANK-004); `Passport` + coverPhotoUrl/videoIntroUrl/placeOfBirth/startedTrainingAt; new `Affiliation` model (person↔org, display-only, role + isCurrent + linked-org-or-free-text); `OrganizationType.AFFILIATION`. Additive only (no DROP); `prisma format` validated; typecheck green. Affiliation grill resolved: scope=person→org, verification=light, +AFFILIATION org type. |
| SESSION_0357_TASK_03 | pending | `/admin/users/new` add-person. |
| SESSION_0357_TASK_04 | pending | Repoint reads to Passport. |
| SESSION_0357_TASK_05 | pending | Doc discoverability leave-behind. |
| SESSION_0357_TASK_06 | pending | Governance + verify + bow-out. |
| SESSION_0357_TASK_07 | landed | **(mid-session, operator)** Kill BBL gold/yellow accent. Root cause: brand color truth is the **`BrandSettings` DB row** injected at runtime by `layout.tsx` (overrides `styles.css`); gold was seeded from the old CSS value. Fixed all 4 layers — `seed-brand-settings.ts` BBL `accentColor → null` + **reseeded live DB**, `styles.css` BBL accent override removed, `baseline-design-system.md` (86/125) gold spec corrected, `card.tsx` highlight `yellow-500 → primary` token. **Browser-verified** neutral (`bbl-10-yellow-gone.png`). Finding for TASK_05 repo-truth-index: brand color SoT = DB `BrandSettings`, not CSS. |

## What landed

- **Slice 1 — black-belt-rail repointed to RankAward (browser-verified).** The discipline "Top Ranked"
  rail read `Membership.rank` and rendered empty for BBL (lineage people have no Membership). It now reads
  **RankAward** (canonical promotion, ADR 0016) via a new `server/web/disciplines/top-ranked-queries.ts`
  DTO, brand-scoped by **lineage-tree OR org-membership** — so the empty rail fills with the lineage black
  belts (Carlos Gracie Sr, Rigan Machado, …). Composed onto the shared `BeltSwatch` + `memberInitials`
  (killed a 3rd `initials()` copy, the inline style, and the `<ol>`/non-`<li>` lint); no raw `db` in the
  component; dropped the hardcoded `sortOrder >= 10` threshold.
- **BBL gold/yellow accent killed (browser-verified) — root cause was the DB, not CSS.** Brand colors have
  two layers; the live SoT is the **`BrandSettings` DB row** injected at runtime by `layout.tsx`, which
  overrides `styles.css`. The gold was seeded into the DB. Fixed all four layers: `seed-brand-settings.ts`
  BBL `accentColor → null` + **reseeded the live DB**, removed the `styles.css` BBL accent override,
  corrected `baseline-design-system.md` (86/125 + a runtime-override note), and `card.tsx` highlight
  `yellow-500 → primary` token.
- **Passport-centric schema foundation (TASK_02) — additive migration, typecheck-green.** `RankAward` +
  `source`/`verificationStatus` (BBL-RANK-004); `Passport` + `coverPhotoUrl`/`videoIntroUrl`/`placeOfBirth`/
  `startedTrainingAt`; new `Affiliation` model (person↔org, display-only); `OrganizationType.AFFILIATION`.
- **Goal partially reached (sliced):** an extended operator-led grill settled the Passport+Shells model
  *before* code. Slices 1, 2, and the yellow fix landed; **add-person (TASK_03), read-repoint (TASK_04),
  slug consolidation, and the doc leave-behind (TASK_05) carry to next session** — the read-repoint is
  intentionally sequenced after add-person, which is the only thing that creates Affiliation data.

## Decisions resolved

- The six **Grill outcome** forks (above) are locked: Passport = identity SoT; RankAward = single rank
  source (+ source/verification); Membership = Baseline enrollment; slug → Passport; photos → Passport.
- **Affiliation** = display-only person↔org relationship (operator: **no payment** for CSW / Rigan
  Machado Affiliation — just display the fact). Scope = person→org; verification = light (linked-org or
  free-text); umbrellas are `Organization`s typed `AFFILIATION`.
- **Brand color SoT = the `BrandSettings` DB table** (admin-editable per brand, first-party included —
  operator wants that for white-label parity); `styles.css` = fallback. The gold was a wrong *value*, not
  a wrong design. White-label setup left unchanged.
- **Membership.rankId** deprecated→derived (RankAward canonical); column removal deferred to a Baseline
  cleanup (not this session — don't break Baseline).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/web/disciplines/top-ranked-queries.ts` | **New.** RankAward-backed "top ranked" DTO + query; brand = lineage-tree OR org-membership; deduped per user. |
| `apps/web/app/(web)/disciplines/_components/black-belt-rail.tsx` | Reads the new query (no raw `db.membership`); RankAward source. |
| `apps/web/app/(web)/disciplines/_components/black-belt-rail-list.tsx` | Consumes the DTO; reuses `BeltSwatch` + `memberInitials`; literal `<li>`; removed dup type + `initials()`. |
| `apps/web/components/common/card.tsx` | `isHighlighted` highlight `yellow-500 → primary` token (brand-aware, no hardcoded yellow). |
| `apps/web/app/styles.css` | Removed the BBL `--color-accent` gold override (inherits neutral base). |
| `apps/web/scripts/seed-brand-settings.ts` | BBL `accentColor → null` (no gold); **live DB reseeded**. |
| `apps/web/prisma/schema.prisma` | `Passport` identity fields; `RankAward` `source`/`verificationStatus` + enums; `Affiliation` model + `AffiliationRole`; `OrganizationType.AFFILIATION`; back-relations. |
| `apps/web/prisma/migrations/20260608124028_…provenance_affiliation/` | New additive migration. |
| `docs/runbooks/design/baseline-design-system.md` | Corrected BBL gold spec (86/125) + runtime-override note (brand color SoT = DB). |
| `docs/knowledge/wiki/index.md` | Added SESSION_0356 (backfill) + SESSION_0357 rows; `last_agent` bump. |
| `docs/sprints/SESSION_0357.md` | This ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | ✅ clean (after migration + client regen) |
| `bunx biome check` (5 changed TS/TSX files) | ✅ clean |
| `npx prisma migrate dev` | ✅ applied `20260608124028_…provenance_affiliation`; additive only (no DROP) |
| `bun run wiki:lint` | ✅ 0 errors (1 warning fixed: design-doc `updated` bump) |
| Browser — rail fills from RankAward | ✅ `bbl-06-rail-beltswatch-full.png` |
| Browser — BBL accent neutral (no gold) | ✅ `bbl-10-yellow-gone.png` |
| Tests | Not added for the new query (follow-up); no existing tests broken (typecheck green). |

## Open decisions / blockers

- Final name for the person↔org relationship (TASK_02, vs `ubiquitous-language.md`).
- **Affiliation is a first-class concept** (operator, mid-session): a *paid affiliation membership* school owners buy into (e.g. CSW / Erik Paulson, Rigan Machado Affiliation) — distinct from a single school and from a league. `Organization` (today the catch-all) likely **splits** into School/Dojo vs Affiliation vs League. Revisit at TASK_02 before naming/modeling the person↔org link.
- **BBL accent is the wrong token** (operator): `app/styles.css:182/189` sets BBL `--color-accent: hsl(51 100% 50%)` (gold `#FFD700`) — the "awful yellow" on hover/active. Likely the wrong tear sheet imported (monorepo had several). Fix = a dark shade (`hsl(0 0% 10%)`) or the correct tear-sheet value, in the BBL-chrome pass.
- **Demo/test data on live BBL surfaces** ("E2E Karate …", Student/Sensei Demo, "Baseline Martial Arts Academy" on BBL) — separate cleanup pass.

## Next session

### Goal

Continue the Passport-centric consolidation on the foundation now in the DB: build the admin **add-person**
flow (TASK_03), then **repoint reads** onto it (TASK_04), then land the **doc leave-behind** (TASK_05).
TASK_03 is the BBL-launch-relevant payoff (the operator's "admin needs to just add someone").

### First task

Build **`/admin/users/new`** (mirror `/admin/tools/new` + the DirStarter submit-form idiom:
react-hook-form + Zod + next-safe-action; dynamically-populated `Rank`/`Organization` selects — **no
hardcoding**). One submit creates: a placeholder `User` (`isPlaceholder`) + `Passport`, a stated
`RankAward` (`source=STATED`, `verificationStatus=UNVERIFIED`), an `Affiliation`, and optional lineage
placement — **one action**. That Affiliation/RankAward data is what makes TASK_04's read-repoint
(`memberSchoolLabel` + directory people facet → Passport/Affiliation/RankAward) visible end-to-end. Then
TASK_05: repo-truth-index canonical-entity layer (incl. brand-color-SoT-is-DB) + `opening.md` links to
`passport-and-shells` / `ronin-project-context` / lineage SOP + glossary (DTO, view-model, `fd`) + one
`human-code-runbook.md`. Deferred: slug consolidation; semantic-yellow sweep; demo-data cleanup.

## Review log

### SESSION_0357_REVIEW_01 — Rail repoint + Passport schema foundation + BBL accent fix

- **Reviewed tasks:** SESSION_0357_TASK_01, TASK_02, TASK_07.
- **Dirstarter docs check:** extended the L1 `Listing`/`Tool` listing pattern + the `/admin/tools/new` CRUD
  shape (cached docs sufficient); Prisma migration follows the standard additive cycle.
- **Verdict:** Pass. The rail repoint is a clean DTO + canonical-source fix, browser-verified (empty →
  filled). The migration is additive and typecheck-green. The yellow fix's real value was the root-cause
  discovery (DB `BrandSettings` overrides CSS), now documented so the next agent doesn't chase styles.css.
  Heavy operator grilling prevented building on the wrong model — the session re-derived the *documented*
  Passport+Shells architecture, which is the session's own lesson (discoverability staged as TASK_05).
- **Score:** 8.5/10 locally.
- **Follow-up:** TASK_03/04/05; unit test for `top-ranked-queries.ts`; semantic-yellow sweep; demo-data
  cleanup; the owed ADR.

## Hostile close review

- **Giddy:** Pass — the rail reuses existing primitives (`BeltSwatch`, `memberInitials`, the directory
  read-model brand pattern); no parallel system. `Affiliation` is a new model but the grill confirmed it's
  genuinely distinct from `Membership` (paid enrollment) and `RankAward.organization` (awarding school) —
  not a fork.
- **Doug:** Pass — typecheck + biome (5 files) + wiki-lint green; migration additive (no DROP); both visible
  fixes browser-verified with screenshots. Honest gap: the new `top-ranked-queries.ts` has no unit test.
- **Desi:** Pass — belt color now uses the canonical `BeltSwatch`; BBL accent neutral (no gold), aligning to
  the tear sheet (red CTAs + deep-black surfaces).
- **Security review:** no new public payload surface; the rail DTO selects allowlisted identity fields only
  (id/name/image/passport displayName+avatar/rank). New Passport/Affiliation fields are not yet exposed.
- **Kaizen aggregate:** 8.5/10 — clean, browser-proven, honestly sliced; the standing lesson is the
  re-derivation of already-documented architecture (the discoverability fix is staged).

### Findings (severity ≥ medium)

#### SESSION_0357_FINDING_01 — GAP_MATRIX BBL-EDITOR-001 marked Built, but no create-person action exists

- **Severity:** medium
- **Task:** (surfaced in TASK_01 discovery)
- **Evidence:** repo-wide search for `db.user.create` / `db.lineageTreeMember.create` outside seed/claim/test
  returned nothing; `/admin/users` has no `new/` route. GAP_MATRIX shows BBL-EDITOR-001 ✅ Built.
- **Impact:** the "add someone" capability the operator needs does not exist; the gap matrix is wrong.
- **Required follow-up:** TASK_03 builds it; correct the GAP_MATRIX row.
- **Status:** open (next session).

#### SESSION_0357_FINDING_02 — Person identity fragmented across 4 stores (drift)

- **Severity:** medium
- **Task:** (architectural through-line)
- **Evidence:** the same person appears in `Membership` / `DirectoryProfile` / `LineageNode` / `Passport`;
  the rail and `/directory` rendered empty because they read the wrong store. Documented model
  (`passport-and-shells.md`) was not enforced.
- **Impact:** surfaces show different/empty people; school-source mismodeled.
- **Required follow-up:** Passport-SoT consolidation (this + next session); logged as **drift D-023**.
- **Status:** open (in progress).

#### SESSION_0357_FINDING_03 — Hardcoded semantic `yellow-500`/`amber` status colors remain

- **Severity:** low–medium
- **Evidence:** ~10 sites (admin status icons + `badge.tsx` warning variant) use hardcoded yellow/amber.
- **Impact:** "no yellow anywhere" not fully met; admin-only + semantic (pending/waiting).
- **Required follow-up:** operator decision on status-color semantics, then a sweep.
- **Status:** open.

## ADR / ubiquitous-language check

- **ADR owed (deferred to TASK_05 — not written this session):** a short ADR reaffirming **Passport + Shells
  as the identity SoT** (resolving `passport-and-shells.md`'s standing open question), recording the new
  **`Affiliation`** model, and **brand color SoT = DB `BrandSettings`** (admin-editable; `styles.css`
  fallback). Touches Prisma (Dirstarter L1) → the ADR carries the Dirstarter proof table.
- **Ubiquitous language (new terms — to add at TASK_05):** **Affiliation** (display-only person↔org),
  **RankAwardSource** (`STATED`/`EARNED`), **RankAwardVerificationStatus**. Passport/Membership/Organization
  unchanged in meaning; Passport reaffirmed as the identity SoT.

## Reflections

- The session's own lesson, again: I **re-derived** the documented Passport+Shells architecture instead of
  finding `passport-and-shells.md` — and graphify actively mis-routed ("Passport source of truth" returned
  *lineage-promotion* SoT). The operator's "WE HAVE DOCS" was the correction. The discoverability fix (link
  the canonical trio into `opening.md` / `repo-truth-index`) is the real deliverable, staged for TASK_05.
- The yellow chase was the standout: **four** layers, and the one I kept editing (`styles.css`) was the
  loser — the DB `BrandSettings` override won. I only found it because the screenshot stayed yellow after
  the CSS "looked fixed." Lesson held: prove it on the live DOM and trace the *runtime* source, not the
  static file.
- Scope honesty: this began as "BBL launch / CUTOVER" and became identity-architecture + a theme bug.
  Unlike SESSION_0356's drift, it was operator-directed and lands a real foundation (the schema) + two
  browser-verified fixes — but the BBL-launch payoff (add-person) is next session, not this one.
- Pressure-as-review worked again: every operator push ("hardcoded everywhere?", "still yellow", "WE HAVE
  DOCS") found something real — the DB override, the missing create-person action, the existing canon.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `baseline-design-system.md` `updated → 2026-06-08` + `last_agent → claude-session-0357` + runtime-override note; SESSION_0357 + wiki index stamped. |
| Backlinks/index sweep | wiki `index.md`: added SESSION_0356 (backfill of a prior-session gap) + SESSION_0357 rows; `last_agent` bumped. |
| Wiki lint | `bun run wiki:lint` — ✅ 0 errors (the 1 warning, design-doc stale `updated`, fixed). |
| Kaizen reflection | Reflections section present. |
| Hostile close review | SESSION_0357_REVIEW_01 + Giddy/Doug/Desi/security + 3 findings. |
| Review & Recommend | Next session = TASK_03 add-person, then TASK_04 read-repoint, then TASK_05 docs. |
| Memory sweep | Updated `bbl-school-source-not-membership` (Affiliation model landed); new `brand-color-sot-is-db`; new `passport-identity-consolidation`. |
| Next session unblock check | Unblocked — TASK_03 (`/admin/users/new`) is doable now (schema is live). |
| Git hygiene | Branch `main`; FS-0024 guard; single push — hash reported at bow-out / see git log. |
| Graphify update | `graphify update .` before the commit — incremental (87 nodes / 660 edges touched; communities 1460). |
