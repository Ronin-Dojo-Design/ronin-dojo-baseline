---
title: "SESSION 0702 — Plan/grill: BBL vertical lineage timeline v2 + LineageProfileDrawer_v2 (PL-025)"
slug: session-0702
type: session--plan
status: in-progress
created: 2026-07-25
updated: 2026-07-25
last_agent: claude-session-0702
sprint: S12
lane: product
recipe: "AM_Plan_Session"
goal_ids: [PL-025]
pairs_with:
  - docs/knowledge/wiki/planning-ledger.md
  - docs/sprints/SESSION_0681.md
  - docs/product/black-belt-legacy/rankentry-unification-epic.md
  - docs/product/black-belt-legacy/rank-entry-unified-data-flow.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0702 — Plan/grill: lineage timeline v2 + drawer v2

> **Staged by SESSION_0681 (operator-directed), adopted by claude-session-0702.** Plan lane — no
> build. Ran `/grill-me` on PL-025 per the stub; every starter fork + 4 discovered forks resolved
> with the operator (MC-grill format, 9 forks across 4 rounds). Deliverable below: grill record +
> ratified plan + paste-ready fan-out lane specs.

## Goal

Grill + plan PL-025: instructor timeline cards link to LineageProfileDrawer; drawer gets a `_v2`
(desi-design-review recipe + /hallmark pass) with a personal belt-history vertical timeline
(white → current, mirrors instructor lineage), each belt a TimeCapsuleCard accordion →
StudentsCarousel-style horizontal media swiper (pics/videos/tournament wins).

## Bow-in record

- Remote (claude.ai/code) session on branch `claude/lineage-timeline-v2-plan-8pj891` — the
  container is its own isolated checkout (worktree-equivalent; canonical untouched).
  `canonical-claim.sh check --session 0702` ✅ free · `githooks/doctor.sh` ✅ after
  `install.sh` (gh absent in sandbox → server ruleset unverifiable here, noted).
- The pre-claimed branch `session-0702-lineage-timeline-v2-plan` (origin) was cut BEFORE the
  stub/PL-025 commits landed — stub + ledger row actually live on `session-0681-gold-standby`
  (commit `54b1080`). Stub adopted from there onto this branch; flip `staged → in-progress` done.
- Graphify: not built in this checkout (empty ≠ no matches). Discovery ran instead as a
  read-only Explore sub-agent anatomy sweep + lineage domain-hub read (hub → ADR 0016/0043 →
  RankEntry unified-flow spec → rankentry-unification-epic → desi-design-review recipe).
- Petey's three questions + SotD ask ran via AskUserQuestion (FS-0037 guard): ① lane confirmed
  as-is (goal election A) · ② queue reviewed — operator elected **co-planning the PL-026 seam**
  · ③ no pivot · SotD: live `/app/state` cited, **no frozen snapshot** requested.
- Parallel-lane assessment (G-023): ran; this is a single plan lane — no disjoint 2+ candidates
  inside it. Parallel-aware: SESSION_0681 (waves live) + SESSION_0682 (MMB plan) files untouched.

## Recon facts the plan stands on (Explore sweep, verified in source)

- **Drawer v1** (`components/web/lineage/lineage-profile-drawer/`, 6 files ~1180 LOC + sibling
  `lineage-rank-history-tab.tsx`): 100% prop-driven off `LineageNodeProfile` — zero fetching;
  only works inside tree-canvas islands that preload `profilesById`. 4 consumers
  (view-a island, tree board, galaxy, e2e). No URL binding (page-level `?focus=` ≠ drawer-open).
- **Ancestry timeline** (`lineage-ancestry-timeline.tsx`, 118 LOC, on `/directory/[slug]`):
  cards link **nowhere**; the `entry.slug` deep-link seam ships unconsumed = **WL-P2-23** (open).
  The stub's "0698 deep-link lane" **never ran** — no SESSION_0698 exists on any ref; WL-P2-23
  is still open work and folds into this epic. Data: `getLineageAncestryForPassport` (cached,
  PUBLIC-only, depth ≤ 12).
- **TimeCapsule substrate already exists**: `RankMilestone` (1:1 RankAward; `story` +
  `MediaAttachment[]`), media purposes `belt | instructor | certificate | competition`
  (`server/belt/schemas.ts`), attach target `"rankMilestone"` wired, R2 uploader family live
  (`belt-media-gallery.tsx`, `media-attachment-manager.tsx`). `TimeCapsuleCard` the *name* is
  greenfield; the *interaction shape* (Accordion → Embla swiper of 168px cards) is exactly
  `students-carousel-v2.tsx` — reuse, don't invent.
- **Rank truth today**: trust = `RankEntry.status` via ONE resolver (`memberTrustStatus`, LR
  0008); facts (dates/promoter/school) still on `RankAward` (`awardedAt` nullable);
  `memberTopRank` reads RankAward. RankEntry currently has NO fact columns.
- **Retirement epic** (`rankentry-unification-epic.md`): phases D expand → E belt-gate → F moat
  FK repoint → G writers native → H coach claim/merge → I destructive drop. 144 files reference
  RankAward. SESSION_0523 verdict had deferred F–I post-FI-001-send.
- **FI-001 (Brian send)**: all 5 pre-send blockers cleared; only the operator's "send now" word
  remains. Send has NOT happened.
- **Freemium precedent** (`profile-media-freemium-model-0525` memory): gate unit =
  per-`MediaAttachment.isPremium`; locked URLs stripped server-side (no-leak invariant, grep-the-
  payload verification reflex); promo never gated; rail-level eligibility via existing tier
  policy + `can()` — no new authz.
- **FI-020 operator ruling**: the 2-axis explorer is OUT of the directory timeline — "the
  timeline stays the single authored story spine"; name-dedup + name-spine fragments stay IN.

## Grill record (all forks resolved 2026-07-25)

| # | Fork | Election |
| --- | --- | --- |
| 1 | Drawer wiring from timeline cards | **Self-sufficient drawer**: v2 fetch-on-open by nodeId via a public cached read reusing the `payloads.ts` allowlist; drawer becomes mountable on any surface (directory now; school pages later = PL-026 seam; galaxy/board already). |
| 2 | v1→v2 lifecycle | **Flag during review, then cutover**: build `_v2` sibling behind `?drawer=v2`; desi + hallmark judge live vs v1; on ratify, cut over all 4 consumers and **delete v1 in the same epic** (no permanent fork). |
| 3/3b | Rank data + retirement sequencing | **Retirement D–I now, pre-send** — operator explicitly reverses the SESSION_0523 "post-send" verdict (recommended alternatives declined with FI-001 status in view). Reversal recorded as a proposed ADR (below). Capsules therefore read **RankEntry-native** facts. |
| 4 | Sparse belt histories | **Hybrid**: public/placeholder = records-only + "know this history? claim / contribute" CTA (claim-loop north star); owner = full white→current ladder with empty capsules as add-story CTAs (mirrors `belt-journey-grid` ladder+ceiling). |
| 5 | Freemium split | **Reuse per-attachment model exactly**: facts + story + capsule shell public; media honors `isPremium` + server-side URL strip; dates respect `showPromotionDatePublic`. Zero new gating axes. |
| 6/6b | Tournament wins | **Structured `TournamentResult` now**: Passport-owned, `rankEntryId` nullable **explicit** era FK (no date-derived binding), fields eventName/date/placement/division + media[]; **enrichment-only — no verification axis**; distinct card type in the capsule swiper. |
| 7 | Timeline v2 scope | **Boundary ratified**: card→drawer wiring (kills WL-P2-23) + name-dedup + name-spine + desi/hallmark polish. No spine re-architecture; FI-020 exclusion honored. |
| 8 | PL-026 seam (co-plan elected at bow-in) | **PL-025 first; seam = contracts**: (a) drawer school links target stable `/schools/[slug]`; (b) capsule + timeline components built kernel-reusable so PL-026's school page can consume them; (c) claim CTA routes through the ONE unified funnel PL-026 extends. PL-026 grills in its own session against these contracts. |
| 9 | Wave structure | **Ratified W0→W3** as specced below (no W0/W1 overlap — UI never reviews against a moving schema). |

## Ratified plan — waves + fan-out lane specs

**Dispatch precondition (all waves):** start from post-`SESSION_0692`-merge `main` (the 0681
waves touch lineage surfaces, incl. the W20 belt-order sort lane on the same read substrate).
Every lane: own `session-NNNN-<slug>` branch + `../ronin-NNNN` worktree via `/seq-lane-build`,
Cody pre-flight, full gates, `## Proposed ledger edits` only, hold at the push gate.

### W0 — RankEntry retirement epic, pre-send (sequential; Doug-gated per phase)

> Operator-elected reversal of the SESSION_0523 sequencing. Migration discipline per the epic
> doc: hand-authored SQL for data-sensitive steps; additive-first; never `prisma migrate dev`
> against `ronindojo_prodsnap`; rehearse per `runbooks/database/schema-migration.md`.

- **W0-0 · ADR + reversal record.** Write the epic's ADR (skeleton in
  `rankentry-unification-epic.md` — supersedes ADR 0016/0035/0043, revises
  `rank-entry-unified-data-flow.md:51`), PLUS an explicit "executes pre-send; reverses
  SESSION_0523 verdict; operator-elected SESSION_0702" decision paragraph. Mint via
  `ledger-id-next --prefix=ADR`. *Done-means:* ADR merged; epic doc status → in-progress.
- **W0-D · Additive expand + backfill.** Fact/provenance columns onto RankEntry (`awardedAt`,
  `source`, `provenance` — NOT an IMPORTED display status, per the epic's second-axis rule —
  `awardedById`, `awardedByPassportId`, `notes`, `location`, `organizationId`,
  `promotionEventId`); nullable `rankEntryId` onto `LineageRelationship`, `RankMilestone`,
  `MediaAttachment`, `GamificationEvent`; 1:1 backfill via `rankAwardId`. *Done-means:* backfill
  parity proof (row counts + spot diffs) on prodsnap rehearsal; privacy tests green.
- **W0-E · Belt-gate rewire.** `isFactEditable`/`memberFactEditability` onto RankEntry `source`
  + `awardedById` + provenance; IMPORTED stays member-read-only (no authority regression).
- **W0-F · Moat FK repoint.** `LineageRelationship.rankAwardId → rankEntryId` preserving the
  `@@unique` PROMOTED_BY mirror semantics (ADR 0016). ⚠ `SetNull` orphan risk is THE hazard —
  repoint + verify graph integrity (edge counts pre/post) before anything destructive.
- **W0-G · Writers RankEntry-native.** place-lead / claim-finalize / add-person / router /
  node-profile-actions / verify + the SESSION_0540–0542 promoter-proposal/belt-trust writers
  relocated onto RankEntry facts; delete `syncRankEntryFromAward` + `rankEntryStatusForAward`
  (10 call-sites); audit seed/import scripts for orphan awards first. One-pending proposal
  semantics + admin override transaction preserved (ADR 0047 D6/D7).
- **W0-H · Recruited-coach claim/confirm + MERGE loop** (epic phase H as written — after G,
  before I).
- **W0-I · Destructive contract (LAST).** Drop `rankAwardId` columns + `RankEntry.rankAwardId`;
  `DROP TABLE "RankAward"`; drop unused enums. Only after W0-D..H Doug proofs + a full-app
  grep-zero for RankAward.

### W1 — Drawer reach + timeline wiring (parallel-safe pair; contract-first)

- **W1-A · Self-sufficient drawer read path.** Public cached read
  `getLineageNodeProfile(nodeId)` (server, `"use cache"` + `cacheTag("lineage", …)`) reusing the
  `payloads.ts` public-field allowlist + visibility materializer — NO new payload shape; a
  `LineageProfileDrawerHost` mountable outside islands (fetch-on-open, loading + error states);
  mounted on `/directory/[slug]`. Privacy tests extend `queries.visibility.test.ts` pattern.
  *Owned files:* `server/web/lineage/` (new read), `components/web/lineage/lineage-profile-drawer/`.
- **W1-B · Timeline card wiring + spine polish.** Ancestor avatar+name become interactive
  (slug-bearing entries) opening the drawer host via the W1-A contract
  (`openDrawer(nodeId)` — buildable against a stub before W1-A merges); **kills WL-P2-23**;
  name-dedup (~3× per card) + name-spine treatment (the FI-016/FI-020-surviving fragments).
  *Owned files:* `lineage-ancestry-timeline.tsx`, `lineage-ancestry-entry.tsx`,
  `directory-profile/ancestry-section.tsx`.

### W2 — Drawer v2 + TimeCapsule belt-history (single lane, behind `?drawer=v2`)

- **W2-A · The v2 surface.** (1) `resolveBeltHistory(passportId)` read model — RankEntry-native
  (post-W0), ordered by `Rank.sortOrder` (nullable-date-safe), composing facts + trust status +
  milestone story/media + tournament results; strict public-projection allowlist (mirror
  `rank-progression.privacy.test.ts`); hybrid sparse rendering per Fork 4. (2) `TimeCapsuleCard`
  + vertical belt timeline inside drawer v2 — REUSE the `students-carousel-v2` Accordion→Embla
  shape (incl. its bottom-sheet `stopPropagation` touch pattern) + `belt-media-gallery` purpose
  grouping; accordion content mounts on expand; capsule swiper `next/dynamic`; media capped with
  view-all (no Embla virtualization needed at belt scale). (3) `TournamentResult` model +
  migration (Fork 6b shape) + owner editor (walk-in idiom, uploader family) + swiper card type.
  (4) Freemium wiring per Fork 5 with the grep-the-payload no-leak proof. (5) Instructor-chain
  cards inside the drawer link onward (self-sufficient drawer recursion). School links target
  `/schools/[slug]` (PL-026 contract).

### W3 — Review gate → cutover

- **W3-A · desi-design-review recipe + /hallmark pass** on drawer v2 + timeline v2 (bounded
  surface list required; findings → `DES-NNN`). **W3-B · Cody fix batch** (behavior-preserving).
  **W3-C · Cutover:** flip all 4 consumers to v2, delete v1 + the `?drawer=v2` flag in the same
  PR (Fork 2), `/ggr` close gate.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0702_TASK_01 | done | /grill-me PL-025 — 9 forks resolved with operator (grill record above) |
| SESSION_0702_TASK_02 | done | Ratified plan + W0–W3 fan-out lane specs written (this file) |
| SESSION_0702_TASK_03 | done | Proposed ledger edits drafted (below — apply at merge, not from this lane) |

## What landed

Docs-only: this SESSION file (stub adopted → grill record + ratified plan + lane specs).
No app code, no schema, no shared-ledger writes.

## Proposed ledger edits

> For the merge owner — this lane writes none of these directly (shared-ledger rule).

1. **planning-ledger PL-025**: status `queued → planned (SESSION_0702)`; append: "Grilled +
   ratified 2026-07-25 — see SESSION_0702 grill record; W0 = RankEntry retirement pre-send
   (operator election), W1–W3 = drawer/timeline builds."
2. **planning-ledger PL-026**: append seam contract: "PL-025 ships first; contracts — stable
   `/schools/[slug]` link target, kernel-reusable capsule/timeline components, ONE unified claim
   funnel. Grill PL-026 in its own session against these."
3. **wiring-ledger WL-P2-23**: append: "Routed into PL-025 W1-B (SESSION_0702) — close on land."
4. **POST_LAUNCH_SOT FI-016**: append: "Timeline fragments (name-dedup, name-spine) folded into
   PL-025 W1-B; FI-020 spine ruling honored (no 2-axis explorer)."
5. **rankentry-unification-epic.md**: status `proposed → elected (pre-send, SESSION_0702)`; note
   the operator election reversing the SESSION_0523 sequencing verdict.
6. **New ADR (W0-0 mints the number)**: RankEntry unification — supersedes 0016/0035/0043 +
   records the pre-send execution decision.

## Open decisions / blockers

- **Risk (operator-accepted at Fork 3b):** W0 runs the moat FK repoint + belt-gate rewire
  pre-send; FI-001 may fire mid-epic — if it does, freeze W0 dispatch until the in-flight phase
  lands its Doug proof.
- Dispatch of W0+ requires post-0692-merge `main` (see precondition).
- This branch (`claude/lineage-timeline-v2-plan-8pj891`) is the plan deliverable; the
  pre-claimed `session-0702-lineage-timeline-v2-plan` branch on origin is stale-cut (pre-stub) —
  merge owner should treat THIS branch's PR as the 0702 close and delete the stale claim branch.

## Next session

### Goal

Dispatch PL-025 W0-0 + W0-D (ADR + additive expand/backfill) as the first retirement lanes,
from post-0692-merge `main`.

### First task

Verify SESSION_0692 (AM merge review) completed; then dispatch W0-0 (ADR authoring lane) per the
spec above — mint the ADR id, write the reversal paragraph, hold at the push gate.
