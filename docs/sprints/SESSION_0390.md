---
title: "SESSION 0390 — Phase 3a: Passport identity service + additive FK re-root (no destructive drops)"
slug: session-0390
type: session--implement
status: closed
created: 2026-06-15
updated: 2026-06-15
last_agent: claude-opus-4-8-session-0390
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0389.md
  - docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0390 — Phase 3a: Passport identity service + additive FK re-root (no destructive drops)

## Date

2026-06-15

## Operator

Brian + claude-opus-4-8-session-0390 (Petey → Cody → Doug → Petey)

## Goal

Begin Phase 3 (Passport-first identity re-root) safely and reversibly: stand up the single
`server/identity/` service (`createPassport` / `attachAccount` / `derivePersonName`) with tests —
collapsing the 4 hand-rolled shell minters into one door — and land the **additive, non-destructive**
half of the schema re-root (nullable `passportId` on the 5 identity satellites + nullable
`Passport.userId`, **no column drops, no constraint moves, no reseed**). Build + validate the
pre-backfill assertion scripts that gate the destructive 3b window. Fix the doc drift (spec §4
reseed→carry, FightRecord promoted to a 5th satellite, cuid2 stays in the wave, hard-delete reap).

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0389.md` (Codex — Phase 2c waves 5+6 `/app` migration, closed).
- Carryover: SESSION_0388 § Next session set Phase 3 as the lane and named the four bow-in inputs
  (`PHASE3_USER_CARRY_PREFLIGHT.md`, SOT-ADR D1/D7, BBL-SOT-Spec Phase 3, `schema.prisma`). D11
  (SESSION_0388) reordered the DNS flip to *before* Phases 3–6 and mandated user-carry semantics.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `3a80e15`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (schema/migration) + auth (signup shell creation). Both L1 areas. |
| Extension or replacement | Extension: Ronin-specific person-rooted identity layer on top of upstream Better-Auth; upstream `lib/auth.ts` has NO shell-creation hook (BBL-SOT-Spec §3) — the 4 minters are Ronin's and move to `server/identity/`. |
| Why justified | SOT-ADR D1 (Passport = person-rooted SoT). Identity service is Ronin domain logic, not a Dirstarter primitive replacement. |
| Risk if bypassed | Continuing the 4 divergent minters (CRAP 272/137/106 + claim repoint at 88) = silent DirectoryProfile-parity drift across create paths. |

Live docs checked during planning: not applicable (identity is Ronin-specific; no upstream alignment URL governs the person-root).

### Graphify check

- Graph status: current (rebuilt at SESSION_0389 close); stats at bow-in: 12768 nodes, 23793 edges, 1790 communities, 1990 files tracked.
- Discovery note: all Phase-3 file paths were pinned in `PHASE3_USER_CARRY_PREFLIGHT.md` (exact line numbers re-verified against live `schema.prisma` `a0ca55a` — still hold, file unchanged at 3787 lines). Opened those exact files directly; no repo-wide grep needed for planning.

### Grill outcome

4 forks resolved (Petey grill, this session):

1. **Session scope** → **Service + additive schema** (option A). Build+test `server/identity/`; add nullable `passportId` to the satellites + nullable `Passport.userId`; no destructive drops/constraint-moves/reseed (those are 3b). Build+validate the pre-backfill assertion scripts.
2. **cuid2 timing** → **stays in the Phase-3 wave** (operator override of Petey's "defer"). Executes in the 3b destructive window (it is a PK rewrite, not additive), NOT this session. Sub-order pinned: regenerate cuid2 IDs first → backfill satellites against the new `Passport.id`.
3. **FightRecord** → **promoted to a 5th satellite (REPOINT)** (operator override of Doug's "defer/CARRY"). Gets a nullable `passportId` this session; `@@unique([userId,disciplineId,type])`→`([passportId,…])` + `@@index` move happen in 3b. Disposition is now **4 REPOINT + 1 DUAL** (DirectoryProfile, LineageNode, Affiliation, FightRecord REPOINT; RankAward DUAL). Requires a SOT-ADR D1 amendment (name 5 satellites).
4. **Placeholder reap** → **hard-delete** after the §5 step-4 assertion passes (3b, operator override of Petey's "archivedAt"). Claim flow §6 transform therefore drops the placeholder-archive step entirely.

Defaults accepted (no objection): Certification → CARRY; claim result contract gets `passportAccountAttached: boolean`, drops `placeholderArchivedUserId`.

### Drift logged

- **D-PHASE3-A:** BBL-SOT-Spec Phase 3 §4 says "clean big-bang + reseed"; D11 + the SESSION_0388 first-task spec say **user-carry** (preserve `User`/`Passport`, repoint by lookup). Resolved → user-carry; stale §4 line to be corrected this session.
- **D-PHASE3-B:** `PHASE3_USER_CARRY_PREFLIGHT.md` names 4 canonical satellites; operator promoted FightRecord to a 5th. Preflight doc + SOT-ADR D1 to be amended.

## Petey plan

### Goal

Land the reversible Phase-3a substrate (identity service + additive FK columns + assertion gate) and fix the Phase-3 doc drift, leaving the destructive backfill/drop/reseed/test-sweep cleanly specced for 3b/3c.

### Tasks

#### SESSION_0390_TASK_01 — `server/identity/` service + tests

- **Agent:** Cody
- **What:** Create the one-door identity service that the 4 minters will call.
- **Steps:**
  1. `server/identity/person-schema.ts` — zod schemas for `createPassport` input (legalFirstName, legalLastName, displayName?, optional profile fields) and `attachAccount` input (passportId, userId).
  2. `server/identity/person-service.ts` — `createPassport(identity)` (accountless Passport, no synthetic email), `attachAccount(passportId, userId)` (`tx.passport.update({ data: { userId } })`, with a `CLAIMANT_HAS_PASSPORT` pre-check on `Passport.userId @unique` collision), `derivePersonName({displayName, legalFirstName, legalLastName})` → `displayName ?? "First Last"`.
  3. `server/identity/person-service.test.ts` — unit tests for `derivePersonName` (pure) + `createPassport`/`attachAccount` against the seam (mock or test-tx). **No live Resend sends** (heed the open email-stub finding).
- **Done means:** files exist; `derivePersonName` fully tested; service compiles + typechecks; tests green.
- **Depends on:** nothing (service can exist before the FK move; full accountless-create path proven in 3b when columns flip).

#### SESSION_0390_TASK_02 — Additive schema migration (nullable `passportId`, no drops)

- **Agent:** Cody
- **What:** Add the new identity-link columns alongside the existing `userId` columns — fully reversible, non-breaking.
- **Steps:**
  1. `prisma/schema.prisma`: add `passportId String?` + a named `passport Passport?` relation to **DirectoryProfile, LineageNode, Affiliation, RankAward (earner), FightRecord**; add the matching Passport back-relations; change `Passport.userId String @unique` → `String? @unique` and `user User` → `user User?`.
  2. **Do NOT** drop any `userId` column, move any `@unique`/`@@index`, or touch `awardedById` (RankAward promoter stays User).
  3. `prisma migrate dev --create-only --name phase3a_additive_passport_fks` → **show the generated SQL to the operator**, then apply.
  4. `bun run db:generate`; `bun run typecheck` (after `next typegen`).
- **Done means:** migration created, SQL reviewed, applied to local DB; client regenerated; typecheck green; existing `userId` reads still compile (additive = non-breaking).
- **Depends on:** nothing (independent of TASK_01).

#### SESSION_0390_TASK_03 — Pre-backfill assertion scripts (the 3b gate)

- **Agent:** Cody
- **What:** The read-only diagnostic that must pass before any 3b destructive backfill/drop runs.
- **Steps:**
  1. `scripts/backfill/phase3-preflight-assert.ts` — read-only SELECTs: (A) Passport↔User 1:1 integrity (no duplicate `userId`); (B) orphan check — every satellite `userId` has a matching `Passport.userId` (any miss would backfill NULL then fail the future NOT-NULL flip); (C) placeholder-actor check — list any `isPlaceholder` User referenced by any CARRY-side FK (Session/Account/Membership/Invoice/AuditLog/…); expected empty.
  2. Exit non-zero with a clear report if any assertion fails; never mutate.
  3. Run it against the local DB; record the result (note: authoritative run is pre-3b against the migration-target DB — local seed is a logic+sanity smoke only).
- **Done means:** script exists, runs read-only, reports per-assertion counts; local run recorded honestly.
- **Depends on:** nothing.

#### SESSION_0390_TASK_04 — Verify (Doug, Claude-in-Chrome browser proof)

- **Agent:** Doug
- **What:** Prove the additive change broke nothing and the service is honest.
- **Steps:** `bun run typecheck`, `bun run lint:check` + `bun run format:check`, `bun test server/identity/`; start dev (`cd apps/web && npx next dev --turbo`); browser-proof on `bbl.local:3000` that lineage tree + directory still render the seed nodes (additive change must be invisible to current reads); 0 new console errors.
- **Done means:** all gates green; browser proof captured; honest verification table.
- **Depends on:** TASK_01, TASK_02, TASK_03.

#### SESSION_0390_TASK_05 — Doc drift fixes + SOT-ADR amendment + close (Petey)

- **Agent:** Petey
- **What:** Resolve D-PHASE3-A/B and pin the 3b/3c destructive order.
- **Steps:** SOT-ADR D1 — amend to name **5** satellites (add FightRecord) + note cuid2-in-wave + hard-delete reap + `passportAccountAttached` contract; BBL-SOT-Spec Phase 3 §4 — "reseed"→"user-carry"; append a "Phase-3 execution status + 3b/3c order" note to `PHASE3_USER_CARRY_PREFLIGHT.md` (FightRecord = REPOINT, cuid2 sub-order, hard-delete); SESSION_0390 Next-session = the 3b destructive plan. Then full-close ritual.
- **Done means:** docs consistent; wiki:lint green; next-session plan written.
- **Depends on:** TASK_04.

### Parallelism

TASK_01 / TASK_02 / TASK_03 are largely independent (service, schema, script) but touch the same mental model — done inline sequentially as one coherent change (CLAUDE.md: single coherent change inline, not disjoint sub-agents). TASK_04 gates on 01–03. TASK_05 closes.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0390_TASK_01 | Cody | New service code. |
| SESSION_0390_TASK_02 | Cody | Schema/migration. |
| SESSION_0390_TASK_03 | Cody | Diagnostic script. |
| SESSION_0390_TASK_04 | Doug | Verification + browser proof. |
| SESSION_0390_TASK_05 | Petey | Governance docs + close. |

### Open decisions

- None at plan-lock (4 forks resolved in grill; 2 defaults accepted).

### Risks

- Additive Passport back-relations must use distinct relation names (RankAward already has `EarnedBy`/`AwardedBy` to User) — Prisma relation-ambiguity errors if mis-named.
- Local DB may lack representative placeholder data → assertion run is a logic smoke, not the authoritative gate (run pre-3b against the real target).
- Email-seam: identity-service tests must not trigger live Resend sends (open finding `unit-tests-send-real-resend-emails`).

### Scope guard

- **No destructive schema ops this session:** no `userId` column drops, no `@unique`/`@@index` moves, no backfill execution, no reseed, no cuid2 regeneration. All reversible/additive only.
- Do **not** repoint the claim flow or the 4 minters' call sites yet (3c) — the service exists but the old paths keep working until the columns flip.
- Do **not** touch `awardedById` (RankAward promoter = User), or any CARRY model.

### Dirstarter implementation template

- **Docs read first:** SoT set (BBL-SOT-Spec, SOT-ADR D1/D7/D11, PHASE3_USER_CARRY_PREFLIGHT). Not a Dirstarter-primitive lane.
- **Baseline pattern to extend:** upstream Better-Auth (no shell hook); `MediaAttachment.passportId` is the in-repo precedent for a Passport-pointing satellite.
- **Custom delta:** `server/identity/` one-door service + nullable `passportId` identity-satellite links.
- **No-bypass proof:** identity person-root is Ronin domain logic; no Dirstarter capability is being replaced.

## Cody pre-flight

### Pre-flight: identity service + additive schema

#### 1. Existing component scan

- Pinned from `PHASE3_USER_CARRY_PREFLIGHT.md` + live verify: `server/identity/` does not exist; minters at `lib/auth.ts`, `server/admin/users/actions.ts:88`, `server/web/lead/actions.ts:375`, `server/web/lineage/node-profile-actions.ts:90`; `MediaAttachment.passportId` precedent at schema 3313.

#### 2. L1 template scan

- Consulted dirstarter-docs-inventory: not applicable (Ronin identity logic). Closest precedent: existing Passport/MediaAttachment relation.

#### 3. Composition decision

- New `server/identity/` module; reuses Prisma client + transaction patterns from existing server actions.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes. ADR: SOT-ADR D1/D7/D11. Runbook: PHASE3_USER_CARRY_PREFLIGHT (the execution map).

#### 5. Dev environment confirmed

- Dev server: `cd apps/web && npx next dev --turbo` (FS-0002). Working dir: `/Users/brianscott/dev/ronin-dojo-app`. Brand/host: `bbl.local:3000`.

#### 6. FAILED_STEPS check

- FS-0002 (dev server) acknowledged. Open finding: unit tests firing live Resend — identity tests must stub/avoid the email seam.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0390_TASK_01 | landed | `server/identity/` service (createPassport/attachAccount/derivePersonName) + 11 unit tests (fake client, no DB/email) |
| SESSION_0390_TASK_02 | landed | Additive migration `20260614225425_phase3a_additive_passport_fks` — nullable passportId on 5 satellites + Passport.userId nullable; applied; 0 destructive ops |
| SESSION_0390_TASK_03 | landed | `scripts/phase3-preflight-assert.ts` (read-only, catalog-driven); run FAILed → surfaced 3b prerequisites (73 Users sans Passport; 17 placeholder promoters) |
| SESSION_0390_TASK_04 | landed | Doug verify: typecheck/oxlint/oxfmt green, 11/11 tests, bbl.local browser proof (lineage + directory render, 0 console errors) |
| SESSION_0390_TASK_05 | landed | SOT-ADR D1 amendment (5 satellites + calls); spec §4 reseed→carry; preflight §9 status; this close |
| SESSION_0390_TASK_06 | landed | Operator-requested mid-session: gate AdCard (footer "Bottom" + posts/blog ads) on `brandHasFeature(brand,"advertise")` — closes the SESSION_0388 AdBanner-only gap; BBL footer ad gone, baseline unaffected (browser-verified) |

## What landed

- **`server/identity/` — the one-door identity service** (D1): `createPassport` (accountless Passport, no synthetic email), `attachAccount` (sets `Passport.userId`, with a `CLAIMANT_HAS_PASSPORT` pre-check on the `@unique` collision; idempotent), `derivePersonName` (`displayName ?? "First Last"`). Composes via an injectable client (nests into the minters' `$transaction` in 3c) + unit-tested with a fake client (no DB, no email seam). 11 tests green.
- **Additive FK re-root migration** `20260614225425_phase3a_additive_passport_fks` — nullable `passportId` + a Passport relation on **5 satellites** (DirectoryProfile, LineageNode, Affiliation, RankAward-earner, FightRecord) + `Passport.userId` → nullable. **Purely additive**: 5 ADD COLUMN, 1 DROP NOT NULL, 2 unique indexes, 5 FKs (ON DELETE SET NULL, mirroring the `MediaAttachment.passportId` precedent). Zero column drops, zero constraint moves, zero reseed — fully reversible.
- **Pre-backfill assertion gate** `scripts/phase3-preflight-assert.ts` — read-only, catalog-driven CARRY-FK discovery (can't drift as columns change). Run against the local seed DB; **correctly FAILed**, surfacing the real 3b prerequisites (below). This is the gate doing its job.
- **Doc drift resolved:** SOT-ADR **D1 amendment** (5 satellites + cuid2-in-wave + hard-delete + claim contract); BBL-SOT-Spec Phase 3 §4 "reseed"→"user-carry"; preflight **§9** execution status + gate findings.
- **AdCard advertise-gate (operator-requested mid-session):** `AdCard` now returns null when `!brandHasFeature(brand, "advertise")` — closes the SESSION_0388 gap (only `AdBanner` was gated; the footer `<AdCard type="Bottom" />` and post/blog/listing ads were not). BBL footer ad gone, baseline unaffected — browser-verified.

## Decisions resolved

- **4 forks (grill, recorded under Bow-in › Grill outcome):** scope = service + additive schema; cuid2 stays in the Phase-3 wave (3b); FightRecord promoted to a 5th satellite; placeholder reap = hard-delete.
- **Defaults accepted:** Certification → CARRY; claim contract = `passportAccountAttached` (drop `placeholderArchivedUserId`).
- **Migration strategy = user-carry, not reseed** (D11/D9; spec §4 corrected).
- **AdCard gate is the right seam** (root-cause, DRY, mirrors `ad-banner.tsx`) vs gating each consumer.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/identity/person-schema.ts` | NEW — zod input schemas (`createPassport`, `attachAccount`). |
| `apps/web/server/identity/person-service.ts` | NEW — `createPassport` / `attachAccount` / `derivePersonName` + `ClaimantHasPassportError`. |
| `apps/web/server/identity/person-service.test.ts` | NEW — 11 unit tests (fake client). |
| `apps/web/prisma/schema.prisma` | Additive: nullable `passportId` + Passport relation on 5 satellites; `Passport.userId` → nullable + 5 back-relations. |
| `apps/web/prisma/migrations/20260614225425_phase3a_additive_passport_fks/migration.sql` | NEW — the additive migration. |
| `apps/web/scripts/phase3-preflight-assert.ts` | NEW — read-only pre-backfill assertion gate. |
| `apps/web/server/web/media/media-authorization.ts` | Null-guard the now-nullable `Passport.userId` (accountless placeholder → admin-only media). |
| `apps/web/components/web/ads/ad-card.tsx` | Gate on `brandHasFeature(brand, "advertise")` (BBL footer/post ads suppressed). |
| `docs/product/black-belt-legacy/SOT-ADR.md` | D1 amendment (5 satellites + migration calls). |
| `docs/product/black-belt-legacy/BBL-SOT-Spec.md` | Phase 3 §4 reseed→user-carry; 5 satellites; 3a/3b/3c split. |
| `docs/product/black-belt-legacy/PHASE3_USER_CARRY_PREFLIGHT.md` | §9 execution status + operator decisions + gate findings. |
| `docs/sprints/SESSION_0390.md` | This session record. |
| `docs/knowledge/wiki/index.md` | SESSION_0390 row. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `prisma validate` / `prisma format` | ✅ schema valid |
| additive migration SQL review (`migrate diff`) | ✅ 5 ADD COLUMN + 1 DROP NOT NULL + 2 unique idx + 5 FK; 0 destructive |
| `prisma migrate deploy` | ✅ applied `20260614225425_phase3a_additive_passport_fks` |
| `bun run db:generate` | ✅ client regenerated (7.8.0) |
| `bun test server/identity/` | ✅ 11 pass / 0 fail |
| `bun run typecheck` | ✅ exit 0, 0 TS errors |
| `oxlint` (changed files) | ✅ clean |
| `oxfmt --check` (changed files) | ✅ all correctly formatted |
| `phase3-preflight-assert.ts` | ⚠ exit 1 (FAIL **by design** — see Open decisions; 3b prerequisites, not a 3a defect) |
| Browser `bbl.local:3000/lineage/rigan-machado-bjj-lineage` | ✅ 200, tree renders (Machado/Gracie nodes), 0 console errors/warnings |
| Browser `bbl.local:3000/directory` | ✅ 200, profile cards render, 0 console errors |
| Browser AdCard gate (BBL vs baseline) | ✅ BBL footer ad gone (DOM), baseline ad still present |

## Open decisions / blockers

- **3b PREREQUISITE — mint missing Passports first.** Local gate shows 148 Users / 75 Passports → 73 Users have no Passport; ALL 29 LineageNodes + 19 RankAwards (earner) point at Passport-less Users. The user-carry backfill assumes Passport↔User 1:1, which is **false today**. 3b must mint a Passport for every satellite-bearing User lacking one *before* the satellite `passportId` backfill (or the NOT-NULL flip fails). Authoritative re-run is pre-3b against the migration-target DB.
- **3b DESIGN CALL — placeholder-as-promoter.** 17 RankAwards have a placeholder `awardedById` (a historical master promoted students — legitimate for imported lineage). The §5-step-4 assertion flags it as "placeholder acted as account." 3b must reconcile explicitly (promoter-as-passport repoint, or exempt promoter rows from the hard-delete) — do **not** cascade-delete.
- **Read-path sweep (3c):** `media-authorization.ts` was one boundary fix; the full audit of code joining identity via the old `user` relation is 3c.

## Next session

### Goal

Phase 3b — destructive user-carry migration: mint missing Passports, backfill satellite `passportId` by lookup, null-out + hard-delete placeholder Users, cuid2 regen, then drop old `userId` columns + move `@unique`/`@@index`.

### First task

Re-run `scripts/phase3-preflight-assert.ts` against the migration-target DB. Then write the 3b migration script in this strict order: (1) mint a Passport for every `DirectoryProfile`/`LineageNode`/`Affiliation`/`RankAward`(earner)/`FightRecord` User that lacks one; (2) decide + implement the placeholder-promoter (`RankAward.awardedById`) reconciliation; (3) backfill `passportId` by `Passport.userId` lookup; (4) cuid2 regen (IDs first); (5) null-out + hard-delete placeholder Users (assert first); (6) drop old `userId` columns + move constraints. Re-run the gate; it must PASS before step 6.

## Review log

### SESSION_0390_REVIEW_01 — Phase 3a additive re-root + AdCard gate

- **Reviewed tasks:** TASK_01..06.
- **Dirstarter docs check:** Prisma + auth L1 lanes; identity is Ronin domain logic (no upstream primitive replaced); AdCard gate uses the existing `brandHasFeature` seam (D9). Not applicable beyond that.
- **Giddy verdict:** Plan held. Scope discipline good — additive-only, no destructive ops, every fork operator-ratified. The assertion gate is the standout: it converted an unknown ("is the data 1:1?") into a hard, documented 3b prerequisite before any destructive work. FightRecord promotion correctly recorded as a SOT-ADR amendment. AdCard gate is the root-cause fix, not whack-a-mole.
- **Doug verdict:** Honest. The gate FAIL is reported as a FAIL (exit 1) with the findings carried to Next session, not buried. Browser proof real (a11y snapshot + console + node-name HTML probe). No false green. cuid2 noted as 3b (not falsely claimed done this session).
- **Score:** 9/10 — clean, reversible, well-documented; −1 because the authoritative assertion run (prod-shape DB) is deferred, so the 1:1 gap is proven only on local seed.
- **Follow-up:** 3b first task = re-run gate on target DB + mint-missing-Passports.

## Hostile close review

- **Giddy:** pass — no scope creep beyond the operator-requested AdCard fix; no schema destruction; no force-push.
- **Doug:** pass — no false verification; gate FAIL surfaced honestly; cuid2/3b correctly deferred.
- **Desi:** pass — AdCard suppression is brand-correct (BBL only), no layout regression (footer ends cleanly at the Dirstarter credit).
- **Kaizen aggregate:** 9/10 — the additive-then-gate pattern de-risked a launch-critical schema change.

### Findings (severity ≥ medium)

#### SESSION_0390_FINDING_01 — Passport↔User is not 1:1 (3b blocker)

- **Severity:** medium
- **Task:** SESSION_0390_TASK_03
- **Evidence:** `scripts/phase3-preflight-assert.ts` local run — 73/148 Users without a Passport; 29 LineageNode + 19 RankAward orphans.
- **Impact:** the user-carry backfill would write NULL `passportId` then fail the 3b NOT-NULL flip.
- **Required follow-up:** 3b must mint missing Passports before backfill; re-run gate on the target DB.
- **Status:** open (3b).

#### SESSION_0390_FINDING_02 — placeholder-as-promoter (`RankAward.awardedById`)

- **Severity:** medium
- **Task:** SESSION_0390_TASK_03
- **Evidence:** gate (C) — 17 RankAwards reference a placeholder User via `awardedById`.
- **Impact:** the hard-delete reap would orphan/violate these promoter FKs if applied blindly.
- **Required follow-up:** 3b reconcile (promoter-as-passport or exempt); never cascade-delete.
- **Status:** open (3b).

## ADR / ubiquitous-language check

- ADR update **required and done:** SOT-ADR **D1 amendment** (FightRecord = 5th satellite; cuid2-in-wave; hard-delete reap; `passportAccountAttached` contract). No standalone new ADR — the SoT-ADR is the consolidated record.
- Ubiquitous language: no new domain terms. "Identity satellite" count moves 4→5; "accountless Passport" reaffirmed as the placeholder. `passportAccountAttached` introduced as the claim-result field (documented in D1).

## Reflections

- **Additive-first was the right call.** Splitting the schema re-root into an additive 3a (reversible) + a destructive 3b let the assertion gate run *before* anything irreversible — and it immediately found that Passport↔User is not 1:1, a landmine that a one-shot "big-bang" migration would have hit mid-flight. The gate paid for itself on first run.
- **The CRAP baseline predicted the work.** fallow flagged the 4 minters as the CRAP/coverage hotspots (272/137/106) before a line was written; D1's "collapse to one door" maps exactly onto them. Building the tested service is the CRAP fix, not a side quest.
- **A nullable column is a typed blast radius.** Making `Passport.userId` nullable surfaced exactly one compile-time caller (`media-authorization.ts`) — typecheck is the cheap proxy for the 3c read-path audit. The full runtime sweep still owes 3c.
- **Operator overrides sharpened the plan.** Promoting FightRecord and keeping cuid2 in-wave both widened 3b; recording them as a SOT-ADR amendment (not silent schema drift) keeps the next session honest.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0390: `status: closed`, `last_agent: claude-opus-4-8-session-0390`. SOT-ADR / BBL-SOT-Spec / PHASE3_USER_CARRY_PREFLIGHT `updated` + `last_agent` bumped. |
| Backlinks/index sweep | SESSION_0390 `pairs_with` the SoT set; wiki/index.md row added. No orphans. |
| Wiki lint | `bun run wiki:lint` — result in git hygiene step. |
| Kaizen reflection | Reflections section present. |
| Hostile close review | Giddy/Doug/Desi pass; 2 medium findings logged (both 3b prerequisites). |
| Review & Recommend | Next session = Phase 3b; first task = re-run gate + mint-missing-Passports. |
| Memory sweep | `bbl-sot-spec-program.md` updated (Phase 3a landed; 3b prerequisites). |
| Next session unblock check | Unblocked — 3b plan + prerequisites written; gate script in place. |
| Git hygiene | Branch `main`; single commit + push at close — hash in bow-out report. |
| Graphify update | Run before close commit; stats in close commit message. |
| New component inventory | `server/identity/` service documented in SOT-ADR D1 + this record. |
