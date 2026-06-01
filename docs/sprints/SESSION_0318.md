---
title: "SESSION 0318 — PromotionEvent ADR/migration + April 10 ceremony model"
slug: session-0318
type: session--implement
status: closed
created: 2026-05-31
updated: 2026-05-31
last_agent: claude-session-0318
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0317.md
  - docs/architecture/lineage/promotion-event-model.md
  - docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md
  - docs/architecture/lineage/lineage-rank-promotion-sync-rules.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0318 — PromotionEvent ADR/migration + April 10 ceremony model

## Date

2026-05-31

## Operator

Brian + claude-session-0318

## Goal

Promote the staged `PromotionEvent` model from design to a first-class additive schema: amend ADR 0016, migrate `PromotionEvent` + nullable FKs on `RankAward`, `MediaAttachment`, and `LineageVisualGroup`, seed the April 10, 2026 Coral Belt Ceremony as the canonical event, wire the cohort `LineageVisualGroup` back to the event, and surface the event read-only in the profile Rank History — with no gallery page, media upload, editor, or permission model in scope.

## Status

### Status: closed

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0317.md`
- Carryover: SESSION_0317 bridged the April 10, 2026 ceremony through plain linked `RankAward` facts (Rigan R9, four CB7s) and deliberately held `PromotionEvent` as staged — its hostile-close FINDING_01 ("PromotionEvent still staged") is open and names this session as the remediation. The new people (Erik Paulson, Casey Olsen, Rick Minter, Rorion Gracie) and the April 10 award dates already exist in the seed; this session adds the first-class grouping/gallery object above them.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `fc08d1c`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma/database (additive model + nullable FKs + migration) and Media (shared gallery wired through the existing `MediaAttachment` polymorphic pattern). |
| Extension or replacement | Extension: adds a new domain model and nullable FKs following the existing `MediaAttachment` polymorphic-owner pattern and ADR 0016; no Dirstarter capability replaced or forked. |
| Why justified | A ceremony that groups multiple people's awards + a shared media gallery is the highest-leverage lineage primitive across BBL / Baseline / WEKAF / RDD white-label, and cannot be expressed by per-person `RankAward` alone. |
| Risk if bypassed | Faking the ceremony through `LineageVisualGroup` or shared-date `RankAward`s (the SESSION_0317 bridge) keeps ceremony media/identity un-modeled and blocks the dedicated event/gallery surfaces. |

Live docs checked during planning: Dirstarter Prisma (`https://dirstarter.com/docs/database/prisma`) confirmed as the migration workflow baseline (re-checked at execution per FS-0006/FS-0008 schema pre-flight).

### Graphify check

- Graph status: current; stats at bow-in: 8824 nodes, 13308 edges, 1389 communities, 1504 files tracked.
- Queries used:
  - `PromotionEvent rank promotion lineage ceremony cohort rank history source of truth`
- Files selected from graph + read directly:
  - `docs/architecture/lineage/promotion-event-model.md`
  - `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md`
  - `docs/architecture/lineage/lineage-rank-promotion-sync-rules.md`
  - `apps/web/prisma/schema.prisma` (RankAward@1929, LineageTreeMember@2452, LineageVisualGroup@2487, Media@3096, MediaAttachment@3128)
  - `apps/web/prisma/seed-baseline-lineage.ts`
- Verification note: exact files opened after Graphify; Graphify used as navigation, not proof. A read-only `Explore` subagent ran a consumer-impact audit of the four FK additions in parallel during planning.

### Grill outcome

Five forks resolved (Petey grill rounds 1–2, all ratified by Brian):

1. **Scope = spine + cohort wiring.** Ships: ADR 0016 amendment, additive migration, seed the April 10 event, cohort-group→event link, and read-only Rank-History event display. Deferred to 0319+: dedicated gallery/event page, media upload, org promotions timeline, event editor, and the permission model.
2. **Attestor dropped.** No `attestedById`, no attendee model in v1. Its only stated purpose (driving verification) was removed by decision 3; the promoter is already on each `RankAward.awardedById` and the photo uploader is already on `Media.uploadedById`. A `PromotionEventAttendee` join table can be added additively later if a real consumer appears.
3. **Verification carries no event signal.** Verification stays role-gated (promoting instructor / admin / school-owner / instructor / user with granted capability) on `RankAward` / `LineageRelationship.verificationStatus`, exactly per ADR 0016 + the sync rules. The event neither auto-verifies nor proposes status.
4. **Cohort link via FK.** Add nullable `LineageVisualGroup.promotionEventId` (`SetNull`). Many per-tree cohort boxes (Baseline + BBL trees; multiple parents within a tree) point at one global event — many-to-one, one truth.
5. **WEKAF / competition linkage deferred.** The manual-ceremony model is sufficient for v1; competition-result linkage is out of scope.

## Petey plan

### Goal

Land the additive `PromotionEvent` schema + ADR amendment, seed the April 10, 2026 ceremony as the canonical event with its cohort linkage, and surface it read-only in Rank History — all without expanding into gallery/editor/permission scope.

### Tasks

#### SESSION_0318_TASK_01 — ADR 0016 amendment + lock the model doc

- **Agent:** Petey
- **What:** Write the ADR 0016 amendment that ratifies `PromotionEvent` as the grouping fact above `RankAward`, records the dropped-attestor + no-event-verification decisions, and the `LineageVisualGroup.promotionEventId` cohort link; mark `promotion-event-model.md` decisions locked.
- **Steps:**
  1. Append a `SESSION_0318` amendment block to ADR 0016 (same shape as the SESSION_0311 amendment): the additive schema delta, `SetNull` everywhere, and the explicit statements that the event holds no verification signal and no attestor/attendee in v1.
  2. Update `promotion-event-model.md`: move the five open questions to a "Resolved (SESSION_0318)" section, strike `attestedById` from the proposed schema, add the `LineageVisualGroup.promotionEventId` link, and set status from `draft` toward `accepted`/`implemented`.
  3. Confirm ubiquitous-language: `PromotionEvent` is a new domain term — add/queue a glossary entry.
- **Done means:** ADR 0016 has a SESSION_0318 amendment; the model doc reflects the locked decisions; no schema file touched yet.
- **Depends on:** nothing (gate — must precede TASK_02 per the bow-in directive "write the ADR amendment before editing Prisma schema").

#### SESSION_0318_TASK_02 — Prisma migration (PromotionEvent + nullable FKs)

- **Agent:** Cody, Doug verification
- **What:** Add the `PromotionEvent` model and three nullable FKs additively; generate the migration and prove it is loss-free.
- **Steps:**
  1. Cody schema pre-flight (FS-0006 / FS-0008): re-read the four touched models + the `MediaAttachment` polymorphic pattern + the SESSION_0311 additive-migration precedent before editing.
  2. Add `model PromotionEvent { id, title, eventDate, location?, description?, hostOrganizationId? (→ Organization, SetNull), rankAwards[], mediaAttachments[], visualGroups[], createdAt, updatedAt, @@index([eventDate]), @@index([hostOrganizationId]) }`.
  3. Add `RankAward.promotionEventId String?` (+ relation, `SetNull`, `@@index`); `MediaAttachment.promotionEventId String?` (+ relation, `@@index`, matching the existing per-owner column pattern); `LineageVisualGroup.promotionEventId String?` (+ relation, `SetNull`, `@@index`); `Organization.hostedPromotionEvents PromotionEvent[]` back-relation.
  4. Generate the migration, regenerate the Prisma client, run `bun run typecheck`, and confirm the migration SQL is purely additive (no drops, no NOT NULL on existing rows).
- **Done means:** Migration applies cleanly to local dev, `prisma generate` + `typecheck` pass, and the SQL diff shows only `CREATE TABLE` + nullable `ADD COLUMN` + indexes + FKs.
- **Depends on:** SESSION_0318_TASK_01.

#### SESSION_0318_TASK_03 — Seed April 10 event + cohort link + read-only Rank-History display; verify + close

- **Agent:** Cody (build) + Explore (read-only consumer audit, already running) + Desi/Doug (visual/QA)
- **What:** Seed the April 10, 2026 Coral Belt Ceremony as one global `PromotionEvent`, backfill `promotionEventId` onto the five existing April 10 `RankAward`s, link the cohort `LineageVisualGroup`(s) in both Baseline + BBL trees to the event, and surface the event read-only in the Rank History tab.
- **Steps:**
  1. In `seed-baseline-lineage.ts`, idempotently upsert one `PromotionEvent` ("Coral Belt Ceremony — Erik Paulson's", `eventDate = 2026-04-10`, `hostOrganization` = Erik Paulson's school if present, else `location` fallback).
  2. Link the five April 10 `RankAward`s (Rigan R9 by Rorion; Erik/Casey/Rick Minter/Rick Williams CB7 by Rigan) to the event via `promotionEventId`. Re-confirm Rick Williams' CB7 date is `2026-04-10` (the SESSION_0316 approximate-date refinement).
  3. Link the relevant April 10 cohort `LineageVisualGroup`(s) — in both Baseline and BBL trees — to the event via `promotionEventId` (idempotent on rerun).
  4. Wire `lineage-rank-history-tab.tsx` (or the award row it renders) to show the event title/date read-only when an award has a linked event, using the server selector the Explore audit pinpoints. No new page, no upload, no editor.
  5. Verify: DB probes for the event + links in both brands; browser `/disciplines/bjj` Rigan Rank-History shows the ceremony label; `bun run typecheck`, focused tests, changed-file Biome, `bun run wiki:lint`.
  6. Hand back to Petey for full-close.
- **Done means:** One global `PromotionEvent` exists with five linked awards and the cohort group(s) linked in both brands; Rank History renders the event read-only; verification recorded with DB + browser evidence.
- **Depends on:** SESSION_0318_TASK_02.

### Parallelism

The critical path is strictly sequential — ADR → schema → seed/display is a hard dependency chain on the same domain (`promotion-event-model.md` → `schema.prisma` → `seed-baseline-lineage.ts`), so the build runs inline rather than fanned out. The only genuinely disjoint work is read-only: an `Explore` subagent audits FK-addition consumer impact + locates the exact Rank-History display target in parallel during TASK_01/TASK_02. Code edits stay single-threaded because TASK_03 seed + display both depend on the migrated client.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0318_TASK_01 | Petey | Decision capture (ADR + model doc) is Petey's domain; holds the grilled rulings. |
| SESSION_0318_TASK_02 | Cody + Doug | Additive schema migration with a mandatory FS-0006/FS-0008 pre-flight gate; Doug verifies loss-free SQL + typecheck. |
| SESSION_0318_TASK_03 | Cody + Explore + Desi/Doug | Seed + read-only display; Explore (read-only) audits consumer impact in parallel; Desi/Doug confirm the browser surface. |

### Open decisions

- None at plan-lock. All five forks resolved in the grill (see `Grill outcome`).

### Risks

- The April 10 cohort `LineageVisualGroup` may not yet exist as a discrete group in both trees (SESSION_0317 decided *not* to add a second group because `LineageTreeMember.visualGroupId` allows only one group per member and the Dirty Dozen occupies that slot for several practitioners). TASK_03 must reconcile: link an existing April 10 group if present, or document that the cohort-group link is created only where a non-conflicting group exists, rather than forcing a second group assignment. This is the one place the seed could surface a real modeling wrinkle.
- Local Postgres/auth instability recurred in SESSION_0316; webpack remains the DB-backed verification fallback if Turbopack regresses (SESSION_0317 proved Turbopack works for `/disciplines/bjj`).
- Root `bun run lint` is still blocked by the `packages/api-client` Biome PATH gap (FS / SESSION_0317 FINDING_03, accepted-risk); use changed-file Biome + typecheck as the gate.

### Scope guard

- No dedicated event/gallery page, no media upload UI, no event editor, no permission/capability model — all deferred to 0319+.
- No `attestedById`, no attendee/witness model.
- No change to verification semantics or to `RankAward`/`LineageRelationship` ownership of truth.
- No second `LineageVisualGroup` forced onto members already in the Dirty Dozen group (carry as data-quality item if it conflicts).
- No Bob Bass / Nobuo Yagai / data-quality import pass (separate staged candidate).

### Dirstarter implementation template

- **Docs read first:** Dirstarter Prisma (`https://dirstarter.com/docs/database/prisma`) — re-confirmed at TASK_02 pre-flight.
- **Baseline pattern to extend:** the existing `MediaAttachment` polymorphic per-owner FK columns (`rankAwardId`, `eventId`, …) and the SESSION_0311 `RankAward.organizationId` additive-FK migration precedent.
- **Custom delta:** Ronin adds a first-class `PromotionEvent` grouping/gallery object above `RankAward`, with a cohort link from `LineageVisualGroup`.
- **No-bypass proof:** uses Prisma migrations + the established polymorphic attachment pattern; nothing in Dirstarter provides a martial-arts ceremony grouping, so this is net-new domain modeling, not a replacement.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0318_TASK_01 | landed | ADR 0016 amended (SESSION_0318 block); model doc locked (open questions → resolved, attestor struck, cohort FK added); PromotionEvent added to ubiquitous-language. |
| SESSION_0318_TASK_02 | landed | Additive migration `20260601041817_add_promotion_event`: PromotionEvent + nullable `promotionEventId` on RankAward/MediaAttachment/LineageVisualGroup + Organization back-relation + indexes. typecheck clean; SQL is CREATE TABLE + nullable ADD COLUMN + FK/index only. |
| SESSION_0318_TASK_03 | landed | Seeded one global April-10 PromotionEvent, linked the April-10 awards, created per-tree (Baseline+BBL) cohort groups linked to the event, wired read-only ceremony badge into Rank History (`payloads.ts` + `lineage-rank-history-tab.tsx`); browser-verified on Rigan's profile. |
| SESSION_0318_TASK_04 | landed | Operator-directed data-quality correction (mid-session, user-authorized): Bob Bass → CB7 2024-06-08 OKC (not April 10); Chris Haueter CB7 → BK6 (6th-degree black); added Chris Posnik (CB7, April 10, joins event+cohort) and Renato Magno (CB7, 2024-06-08 OKC). Event now links 6 awards. |

## What landed

- ADR 0016 amended with a SESSION_0318 block ratifying `PromotionEvent` as the optional grouping fact above `RankAward`, with the dropped-attestor, no-event-verification, and `LineageVisualGroup.promotionEventId` cohort-link decisions recorded. The model doc was locked (open questions → resolved, `attestedById` struck, cohort FK added, status → accepted).
- New `PromotionEvent` model + purely-additive migration `20260601041817_add_promotion_event`: nullable `promotionEventId` on `RankAward`, `MediaAttachment`, and `LineageVisualGroup` (all `SET NULL`), an `Organization.hostedPromotionEvents` back-relation, and indexes. Migration SQL is `CREATE TABLE` + nullable `ADD COLUMN` + FK/index only — no drops, no data loss.
- Seeded one global April 10, 2026 "Coral Belt Ceremony — CSW World Conference" `PromotionEvent`, linked the April-10 awards, and created per-tree cohort `LineageVisualGroup`s (Baseline + BBL) linked to the same global event — proving many-cohort-boxes → one event.
- Read-only ceremony display: the Rank History tab now shows a calendar badge with the event title for any award linked to a `PromotionEvent` (`payloads.ts` widened, `lineage-rank-history-tab.tsx` renders it). Browser-verified on Rigan Machado's R9 award.
- Operator-confirmed data-quality corrections (TASK_04, mid-session, user-directed): Bob Bass → CB7 on **2024-06-08** in Oklahoma City (not April 10; attended but not promoted then); Chris Haueter CB7 → **BK6** (6th-degree black belt) via a non-destructive repoint; added **Chris Posnik** (CB7, April 10 — joins the event + cohort) and **Renato Magno** (CB7, 2024-06-08 OKC). Event links **6** awards; cohort group holds **4** members per tree.
- Goal achieved in full, plus the operator-directed data-quality extension.

## Decisions resolved

- Scope = spine + cohort wiring; gallery/editor/permissions deferred.
- Attestor + attendee model dropped for v1.
- `PromotionEvent` carries no verification signal; verification stays role-gated on `RankAward`/`LineageRelationship`.
- Cohort link via nullable `LineageVisualGroup.promotionEventId` FK (`SetNull`, many-to-one).
- WEKAF/competition linkage deferred to v2.
- (TASK_04, operator first-hand authority) The four flagged practitioners are all 7th-degree coral **except** Chris Haueter (6th-degree black belt). Bob Bass + Renato Magno were promoted together on June 8, 2024 in Oklahoma City — a separate ceremony from April 10. Dave Meyer (Jan 17 2026) and John Will (Sep 14 2025) confirmed correct as already seeded.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/prisma/schema.prisma` | Added `PromotionEvent` model + nullable `promotionEventId` FKs on `RankAward`, `MediaAttachment`, `LineageVisualGroup`; `Organization.hostedPromotionEvents` back-relation; indexes. |
| `apps/web/prisma/migrations/20260601041817_add_promotion_event/migration.sql` | New additive migration (CREATE TABLE + nullable ADD COLUMN + FK/index). |
| `apps/web/prisma/seed-baseline-lineage.ts` | Added `ensurePromotionEvent` + `ensureCeremonyCohortGroup`; April-10 ceremony seed; TASK_04 data corrections (Bob Bass, Haueter repoint, Posnik, Magno) + people/nodes/edges/tree/cohort wiring. |
| `apps/web/server/web/lineage/payloads.ts` | Widened `lineageNodeProfilePayload` rankAwards select to include read-only `promotionEvent { id, title, eventDate }`. |
| `apps/web/components/web/lineage/lineage-rank-history-tab.tsx` | Read-only ceremony badge (`CalendarDaysIcon` + event title) on awards linked to a `PromotionEvent`. |
| `docs/architecture/decisions/0016-lineage-promotion-source-of-truth.md` | SESSION_0318 amendment block (PromotionEvent grouping fact, dropped attestor, no event verification, cohort FK). |
| `docs/architecture/lineage/promotion-event-model.md` | Locked: open questions → Resolved (SESSION_0318), attestor struck, cohort FK added, status → accepted. |
| `docs/architecture/ubiquitous-language.md` | Added `PromotionEvent` glossary entry. |
| `docs/knowledge/wiki/index.md` | SESSION_0318 row + Promotion Event Model status → accepted; date/last_agent bump. |
| `docs/sprints/SESSION_0318.md` | This session ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bunx prisma validate` | schema valid |
| `bunx prisma migrate dev --name add_promotion_event` | applied `20260601041817_add_promotion_event`; migration history was in sync (no reset) |
| Migration SQL destructive-op scan | none — only `CREATE TABLE` + nullable `ADD COLUMN` + indexes + `AddForeignKey` |
| `bun run typecheck` (after migration, after display edits, after TASK_04) | passed all three times |
| `bunx biome check` on the 3 changed TS files | passed, no fixes |
| `bun test lib/lineage/tree-layout.test.ts` | 3 pass |
| Seed run (TASK_03) | 1 PromotionEvent, 5 awards linked, 2 cohort groups (Baseline+BBL) linked, 3 members each |
| Seed re-run (idempotency) | event stays 1, groups stay 2, "exists, refreshed" |
| Seed run (TASK_04) | Posnik+Magno created, Haueter repointed to BK6, event links 6 awards, cohort 4 members each |
| DB probe — corrected ranks | Haueter `BK6` (no stale coral); Bob Bass `CB7` 2024-06-08 OKC; Posnik `CB7` 2026-04-10; Magno `CB7` 2024-06-08 OKC |
| DB probe — event links (expect 6, not Bob/Magno) | Casey Olsen, Chris Posnik, Erik Paulson, Rick Minter, Rick Williams, Rigan Machado |
| Browser `/disciplines/bjj` → Rigan → Rank History (webpack) | R9 award shows "Red Belt - 9th Degree", "Rorion Gracie", "Apr 10, 2026", and read-only badge **"Coral Belt Ceremony — CSW World Conference"**; cohort label "Coral Belt Ceremony — Apr 10, 2026" on board. Screenshot `/tmp/ronin-session-0318/rigan-rank-history-ceremony.png`. |
| `bun run wiki:lint` | 0 errors, 3 pre-existing stale-frontmatter warnings (none in this session's files) |

## Open decisions / blockers

- **June 8, 2024 Oklahoma City ceremony** (Bob Bass + Renato Magno) is currently represented as linked `RankAward`s sharing a date/location — not yet its own `PromotionEvent`. The `ensurePromotionEvent` helper is hardcoded to the April-10 event; generalizing it to seed a second event is a clean follow-up.
- **Cohort split is intentional but worth a UX note:** Rick Williams (April-10 promotee) stays in the historical "Dirty Dozen" (1994) group, while the other April-10 coral belts sit in the new "Coral Belt Ceremony — Apr 10, 2026" group, because `LineageTreeMember.visualGroupId` allows only one group per member. His *award* links to the event regardless. Decide later whether multi-group membership is wanted.
- **Roster completeness:** the April-10 cohort may still be incomplete vs public reports (e.g. "Stick Williams" naming, any others); a future data-quality pass can reconcile with full citations.
- Root `bun run lint` still blocked by `packages/api-client` Biome PATH gap (SESSION_0317 FINDING_03, accepted-risk); changed-file Biome + typecheck used as the gate.

## Next session

### Goal

SESSION_0319 — PromotionEvent display surfaces: dedicated event/gallery page per ceremony (shared across BBL/Baseline) + org-profile promotions timeline, plus generalize the seed's single-event helper to model the June 8, 2024 Oklahoma City ceremony.

### First task

Generalize `ensurePromotionEvent` in `seed-baseline-lineage.ts` into a small data-driven list (April 10 2026 CSW + June 8 2024 OKC), seed the OKC event linking Bob Bass + Renato Magno, then scaffold the read-only `/events/[slug]` ceremony/gallery page that resolves a `PromotionEvent` with its linked awards + shared `MediaAttachment` gallery. Media **upload**, the event **editor**, and the **permission/capability** model remain deferred until the read surface is proven.

### Locked decisions + full 3-session arc → `docs/petey-plan-0319.md`

This next-session pointer was grilled and planned into a multi-session epic on 2026-05-31 (Petey). The cold/headless sessions **must read [`docs/petey-plan-0319.md`](../petey-plan-0319.md)** for the full S0319→S0320→S0321 decomposition and the locked decisions — they cannot grill. Locked (ratified by Brian):

1. **Route = `/events/[slug]`** (global, brand-neutral). Add an additive `PromotionEvent.slug String? @unique` column + backfill.
2. **Gallery proof = real BBL ceremony photos** committed at `apps/web/public/seed/events/` (see the epic's "Seed media mapping" table) + a "No photos yet" empty state. No upload UI.
3. **Session split:** S0319 = seed-gen + OKC event + `/events/[slug]` read/gallery page; S0320 = org promotions timeline + `/events` index + cross-links; S0321 = **begin** the deferred editor + media upload (capability-gated).
4. **Run:** `scripts/auto-session.sh 3` (push + one PR per session, no auto-merge; review/merge bottom-up). A failed gate leaves the tree uncommitted and halts the loop.

## Review log

### SESSION_0318 — PromotionEvent ADR/migration + April 10 ceremony model

#### Review

**SESSION_0318_REVIEW_01 — Close readiness**

- **Reviewed tasks:** SESSION_0318_TASK_01, TASK_02, TASK_03, TASK_04
- **Dirstarter docs check:** Dirstarter Prisma (`https://dirstarter.com/docs/database/prisma`) — confirmed Prisma migration workflow as the baseline path; the additive change follows the existing `MediaAttachment` polymorphic pattern and the SESSION_0311 additive-FK precedent, so no Dirstarter capability was replaced.
- **Verdict:** Merge-ready. The schema change is purely additive and loss-free (verified SQL), the consumer-impact audit confirmed no existing query/select/zod drift, the ADR amendment precedes the schema edit (gate honored), DB + browser proof cover the new read surface, and the operator-directed data corrections were applied only after explicit first-hand rulings — with conflicts surfaced rather than guessed.
- **Score:** 8.5/10
- **Follow-up:** Generalize the event seed helper + build the gallery page (SESSION_0319); reconcile the full April-10 roster in a data-quality pass.

## Hostile close review

### SESSION_0318 — PromotionEvent ADR/migration + April 10 ceremony model

- **Giddy:** pass — WORKFLOW 5.0 honored (Petey grill → plan → Cody build → verify); ADR-before-schema gate met; FS-0006/FS-0008 schema pre-flight satisfied; FS-0024 git guard run at bow-in.
- **Doug:** pass — additive migration proven loss-free, idempotent seed proven by re-run, typecheck/biome/focused-tests green, DB + browser evidence recorded honestly.
- **Desi:** pass — read-only ceremony badge reuses the existing `Badge` primitive + lucide icon in the established Rank-History metabar idiom; no bespoke component, no L1 fork.
- **Kaizen aggregate:** 8.5/10 — clean additive spine with strong proof; cap reflects the staged display surfaces (no gallery page yet), the not-yet-modeled June-8 OKC event, and an incomplete public roster.

### Findings (severity ≥ medium)

#### SESSION_0318_FINDING_01 — June 8 2024 OKC ceremony not yet a PromotionEvent

- **Severity:** medium
- **Task:** SESSION_0318_TASK_04
- **Evidence:** `apps/web/prisma/seed-baseline-lineage.ts` — `ensurePromotionEvent` is hardcoded to the April-10 event; Bob Bass + Renato Magno share date/location but have no grouping event.
- **Impact:** The new model isn't yet exercised for a second ceremony; the OKC promotion is "bridge" data, the same gap PromotionEvent was built to close.
- **Required follow-up:** Generalize the helper and seed the June 8, 2024 OKC event in SESSION_0319.
- **Status:** open

#### SESSION_0318_FINDING_02 — April-10 cohort roster may be incomplete

- **Severity:** low
- **Task:** SESSION_0318_TASK_04
- **Evidence:** public report names ("Stick Williams", possible others) vs the seeded set.
- **Impact:** Cohort/event display may under-represent the real ceremony until reconciled with citations.
- **Required follow-up:** Data-quality pass with source citations; do not guess.
- **Status:** open

## ADR / ubiquitous-language check

- **ADR update required and made.** ADR 0016 gained a SESSION_0318 amendment (PromotionEvent grouping fact). Includes the existing Dirstarter Prisma proof row (database baseline layer). No new ADR file needed — this extends the accepted ADR 0016 like the SESSION_0311 amendment.
- **Ubiquitous language updated.** Added `PromotionEvent` to `docs/architecture/ubiquitous-language.md`. `RankAward`, `LineageVisualGroup`, `LineageRelationship` kept their meanings.

## Reflections

- Decoupling verification from the event collapsed the whole attestor question — once Brian ruled that verification stays role-gated, `attestedById` had no consumer and the model got simpler. The grill's job was to find that the "evidence drives verification" premise (from the draft model doc) was the thing to challenge, not to refine it.
- The cohort-link decision only looked clean after seeing that one global event maps to *several* per-tree boxes (two brands × possibly two parents). That many-to-one shape is exactly what a nullable FK on the group expresses and what date-matching-at-sync would have gotten wrong.
- The sharpest gotcha is a seed-idempotency trap: `RankAward`'s `@@unique` is `[userId, rankId]`, so correcting a person's *rank* (Haueter CB7 → BK6) creates a new row and orphans the old one — the stale coral award would have lingered. The fix was a non-destructive repoint of the existing row's `rankId` (preserving the LineageTreeMember/relationship FKs), which converges both fresh and existing DBs. Worth remembering for any future rank correction.
- Doing real web research before touching live people's belt ranks paid off: it contradicted the initial "all 8th degree" framing (Meyer is 7th, Haueter is a black belt), which led Brian to correct the premise himself. Surfacing conflicts instead of applying the request verbatim was the right call.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Touched docs (ADR 0016, model doc, ubiquitous-language, wiki/index, SESSION_0318) carry `updated: 2026-05-31` / `last_agent: claude-session-0318` where they have frontmatter; code files unchanged in annotation health. |
| Backlinks/index sweep | `wiki/index.md` has the SESSION_0318 row + Promotion Event Model status flip; SESSION_0318 ↔ promotion-event-model now pair bidirectionally (the implementing session); ADR 0016 ↔ model doc ↔ sync-rules already cross-link, and all three backlink `wiki/index.md` (the session↔doc hub convention — prior sessions are not injected into ADR frontmatter). |
| Wiki lint | `bun run wiki:lint` → 0 errors, 3 pre-existing stale-frontmatter warnings (data-model, aliases-and-canonical-ids, repo-truth-index — none touched this session). |
| Kaizen reflection | Present in `## Reflections` (4 notes). |
| Hostile close review | `SESSION_0318_REVIEW_01` + Giddy/Doug/Desi pass + 2 findings recorded. |
| Review & Recommend | Next session goal + first task written (SESSION_0319 display surfaces + generalized event seed). |
| Memory sweep | Saved the RankAward `@@unique [userId, rankId]` rank-change-orphan gotcha + repoint fix to operator memory; PromotionEvent facts live in ADR 0016 / model doc / glossary (project-scoped, recallable). |
| Next session unblock check | Unblocked — SESSION_0319 first task (generalize seed helper + gallery page scaffold) needs no user input; roster reconciliation is a separate optional pass. |
| Git hygiene | Branch `main`; `git worktree list` shows only `/Users/brianscott/dev/ronin-dojo-app`; task-log gate returns 4; single push — commit hash reported at bow-out (see git log). |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=6000 graphify update .` run before the close commit — incremental rebuild: Nodes 135, Edges 745, Communities 1310. |
