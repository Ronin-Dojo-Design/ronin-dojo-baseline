---
title: "SESSION 0522 — WL-P2-37/TICKET-0502-A: /me → profile consolidation + scrollytelling prominence"
slug: session-0522
type: session--implement
created: 2026-07-10
updated: 2026-07-10
last_agent: claude-session-0522
sprint: S1
status: closed
pairs_with:

  - docs/sprints/SESSION_0521.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0522 — WL-P2-37/TICKET-0502-A: /me → profile consolidation + scrollytelling prominence

## Date

2026-07-10

## Operator

Brian + claude-session-0522

## Goal

**Advance the RankEntry unified migration + clear the pre-Brian-send member workflow.** Re-anchored mid-grill
onto [`rank-entry-unified-data-flow.md`](../product/black-belt-legacy/rank-entry-unified-data-flow.md)
(SESSION_0517) — the ratified target the earlier "WL-P2-37 profile consolidation" framing was orthogonal to.
Operator-locked scope: **migration step 5** (retire `/me` → redirect to `/app/profile`; `/directory/[slug]` =
public read), **migration step 6** (switch public profile + the lineage timeline reads to the shared
`RankEntry` projection — `memberTopRankAward`/`rankAwardsEarned` is the legacy holdout), and the **belt
verification backfill** (every current tree member → `VERIFIED` `RankEntry`; WP-import ranks recovered;
join/admin paths mint `UNVERIFIED` going forward). Plus two prod-data fixes that ride along: **Truelson**
lineage (Bob Bass removed) and the belt backfill scripts. The leaf-merge is dropped (the owner arm retires,
not merges). `RankAward` is retained as the fact anchor (ADR 0016/0035); no ADR 0035 amendment needed — the
RankEntry spec already ratifies member-entered `UNVERIFIED` ranks.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0521.md`
- Carryover: SESSION_0521 cleared **FI-024** (the last FI-001 pre-send blocker) — one-surface inline edit
  via `PassportEditor` drawer, URL photo fields → uploader family, `AncestrySection` put on the `/me`
  owner arm, public belt readability. The loader + orchestrator consolidation (WL-P2-37 proper) already
  landed at SESSION_0515 (#200); this session picks up the **deferred section-leaf layer + route fate**.

### Branch and worktree

- Branch: `session-0522-wl-p2-37`
- Worktree: `/Users/brianscott/dev/ronin-0522` (fresh — **NOT bootstrapped**: no node_modules/.env/prisma
  client; run `/worktree-setup` before any gate)
- Status at bow-in: clean (off `origin/main`)
- Current HEAD at bow-in: `9d343b9a`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Theming (brand-token profile chrome), Media (uploader family, already landed), Auth/admin (owner-vs-viewer branch on the profile read model). |
| Extension or replacement | Extension: reconciles the twin section-leaves onto ONE implementation per section behind the existing `viewerContext`/`isOwner` seam; no new primitives. |
| Why justified | One-foundation doctrine — the twin leaves are exactly the "one god-component vs one foundation" the RDD mantra targets; WL-P2-38 reconciles them, does not add a pattern. |
| Risk if bypassed | The profile is the funnel/mission asset Bob & Brian land on; two divergent trees drift and a half-done consolidation is a launch risk (FS-0029). |

Live docs checked during planning: Theming + Media — reconfirm during Cody pre-flight.

### Collision check (disjointness) — operator-requested BEFORE any edit

**Verdict: DISJOINT — the named "live lanes" already landed via squash-merge; nothing live to clobber.**

- No active `../ronin-NNNN` sibling worktrees exist (`git worktree list` — only fallow-audit temp caches +
  one Codex worktree at `3ebeaa62`, which is **an ancestor of `origin/main`** = already landed).
- **AdminCollection + Passport lane** (`session-0510-adminpassport`, last commit Jul 8): signature files
  (`admin-collection.tsx`, `lineage-node-profile-form.tsx`, `people-table.tsx`) are **identical to main**
  = landed. Touches `app/app/users/*` + `admin/*` + `brand-settings` — **disjoint** from the profile-view
  tree.
- **Epic A scrollytelling** (`session-0498-epic-a` Jul 4, `session-0499-scene-hero-uploader` Jul 5): the
  headline deliverable `ancestry-section.tsx` is **identical to main** = landed; 0499 is fully identical.
  This session **reuses `AncestrySection` verbatim (repositions only)** — does NOT re-author the Epic A
  scaffold (`lineage-story/*`).
- **0515-conformance** (the #200 profile-view consolidation, Jul 8): `index.tsx`/`public-profile.tsx`/
  `me/page.tsx` identical; the `owner-profile.tsx` + `passport-editor.tsx` diffs are **main being NEWER**
  (SESSION_0521 Jul 10 edited exactly those two on top of the landed tree). Landed.
- Branching off `origin/main` (`9d343b9a`, SESSION_0521) gives a base that already includes every named
  lane's integrated content → **no live collision**.

### Ledger-label finding (surface, not silently obey)

WL-P2-37 is marked **✅ Resolved (SESSION_0515, MERGED #200)** in the wiring-ledger — the loader + read
model + orchestrator consolidation is DONE. The **actual open item** for this session's remaining work is
**WL-P2-38** (twin section-leaf trees) + the `/me` route fate + `AncestrySection` prominence. The operator
uses "WL-P2-37" as shorthand for the whole TICKET-0502-A lane; the precise ledger row to cross off at close
is **WL-P2-38**. Re-ledgered from SESSION_0502's escaped deferral per **FS-0029**.

### Grill outcome

Operator grill (this session) — decisions LOCKED (re-anchored mid-grill onto the RankEntry unified spec
after the operator flagged the recent RankAward→RankEntry cutover; my earlier "keep /me + merge leaves"
framing was against the wrong target and is retracted):

- **Retire `/me` → redirect to `/app/profile`** (RankEntry migration **step 5**). `/app/profile` (the
  existing 9-tab workspace) is THE authenticated member surface; `/directory/[slug]` is the public read.
  The owner-arm profile-view tree (`me-profile/*`, `owner-profile.tsx`, `loadProfileViewForOwner`) is
  retired, NOT merged — the leaf-merge is dropped.
- **Public + timeline reads → the shared `RankEntry` projection** (**step 6**). `memberTopRankAward` /
  `rankAwardsEarned` (canvas-model) is the legacy holdout; shown rank = **highest non-PENDING `RankEntry`**
  (spec rule), not top RankAward.
- **Remove the legacy split-path / milestone code** (**step 7**) — only AFTER data + browser proofs.
- **Belt verification model:** belts **visible regardless of status** (badge, not gate). **Every current
  canonical-tree member → `RankEntry.status = VERIFIED`**; **future join/admin signups → `UNVERIFIED`** until
  Tony / operator / RBAC verify via `RankEntryReview`. Backfill covers three cases: flip existing UNVERIFIED,
  materialize declared-but-unmade (Jay Farrell, Tony's students), and **recover WP-import ranks** ("the
  information is there" — locate on the bootstrapped prodsnap). One seam: `syncRankEntryFromAward`.
- **Signup automation** confirmed sufficient — Join-the-Legacy auto-places (immediate, Unverified); admin
  add-person already mints via `syncRankEntryFromAward`; both aligned to the verified-default rule. Instructor
  picker = any tree member + creatable "Other" (off-tree → no fabricated founder chain).
- **Truelson: Bob Bass removed** — chain Sr → Jr → Rigan → Bill Hosken → Truelson. Seed already correct
  (`seed-baseline-lineage.ts:383`); PROD likely still carries the legacy VERIFIED `Bob→Truelson` edge that
  wins the walk's `isVerified DESC` tiebreak. Fix: delete it + mark `Bill→Truelson` verified.
- **No ADR 0035 amendment** — the RankEntry spec already ratifies member-entered `UNVERIFIED` ranks.
- **Scrollytelling** stays beta-only + gets a Desi redesign (directions delivered) → ledger, not built.

## Petey plan

### Goal

Complete RankEntry migration steps 5–7 + the belt verification backfill so the authenticated member surface
is `/app/profile`, all reads are RankEntry-native, and every current tree member shows a VERIFIED belt.

### Tasks

#### SESSION_0522_TASK_01 — Step 5: retire `/me` → redirect to `/app/profile` (Cody → Doug)

- **What:** `me/page.tsx` → redirect (signed-in → `/app/profile`; signed-out → `/auth/login?callbackURL=
  /app/profile`). Repoint the ~40 internal `/me` references (nav, footer, breadcrumbs, `/me#edit` auto-open,
  hero-actions "this profile is yours", claim/merch/invite redirects, emails → `/app/profile` or a durable
  login path). Migrate `/me` tests. The owner-arm profile-view tree stops being rendered (deleted in step 7).
- **Done means:** `/me` 3xx→`/app/profile` (auth) / login (anon); no live link lands on the old owner arm;
  auth-lifecycle e2e green.
- **Depends on:** worktree bootstrap.

#### SESSION_0522_TASK_02 — Step 6: public + timeline reads → shared RankEntry projection (Cody → Doug)

- **What:** Move `/directory/[slug]` profile reads and the **lineage ancestry timeline** off
  `memberTopRankAward`/`rankAwardsEarned` (canvas-model legacy) onto the shared `RankEntry` projection.
  Shown rank = **highest non-PENDING `RankEntry`** in the discipline ordering (spec rule), status as a badge.
  This is where Jay Farrell / Tony's students' belts start showing (once WS03 backfill populates entries).
- **Done means:** timeline + public profile read RankEntry; shown-rank rule = highest non-PENDING; paywall
  + profile-projection unit/e2e green.
- **Depends on:** TASK_01 (surface shape settled) — can start in parallel on the read model.

#### SESSION_0522_TASK_03 — Belt verification backfill + forward minting (Cody + prod scripts → Doug)

- **Model:** belts visible regardless of status (badge). **Every current canonical-tree member →
  `RankEntry.status = VERIFIED`; future join/admin → `UNVERIFIED`** until Tony/operator/RBAC verify via
  `RankEntryReview`. ONE seam: `syncRankEntryFromAward` (`server/belt/rank-entry-compatibility.ts`).
- **What:**
  1. **Forward (code):** join-placement (`placeLeadIntoLineage`) mints the declared belt as `RankAward` +
     `RankEntry` (`UNVERIFIED`) via `syncRankEntryFromAward` (matching admin-add + claim paths). Align the
     admin-add verification default to the "steward act → VERIFIED (or selectable)" rule.
  2. **Backfill (prod script), all current tree members — three cases:** flip existing `UNVERIFIED`→
     `VERIFIED`; materialize declared-but-unmade (Jay Farrell, Tony's students); **recover WP-import ranks**
     ("the information is there" — locate source on the bootstrapped prodsnap, then materialize `VERIFIED`).
  3. Confirm the `RankEntryReview` verify affordance is reachable for Tony/operator/RBAC (flag if missing).
- **Done means:** timeline + drawer show every current tree member's belt VERIFIED; new join/admin signups
  mint via the one seam; backfill rehearsed on prodsnap; unit coverage on minting.
- **Depends on:** worktree bootstrap; the prod script rehearses before TASK_02's read-cutover is proven.

#### SESSION_0522_TASK_04 — Step 7: remove legacy split-path / milestone code (Cody → Doug) — AFTER proofs

- **What:** Delete the now-dead owner-arm tree (`me-profile/*`, `owner-profile.tsx`,
  `loadProfileViewForOwner`) and the legacy RankAward-based read paths superseded by the RankEntry
  projection (+ `RankMilestone` member-facing, per spec) — **only after TASK_01/02/03 data + browser proofs**.
- **Done means:** no dead legacy path remains; build + full e2e green; fallow dead-code delta negative.
- **Depends on:** TASK_01, TASK_02, TASK_03 (+ Doug proofs).

#### SESSION_0522_TASK_05 — Truelson prod lineage fix (Doug rehearse → prod script)

- **What:** Verify Truelson's live edges; delete the legacy VERIFIED `Bob→Truelson` `INSTRUCTOR_STUDENT`
  edge; mark `Bill→Truelson` verified (authoritative tiebreak). Hand-authored prod script via `.env.prod`;
  rehearse on prodsnap.
- **Done means:** Truelson's walk returns Sr → Jr → Rigan → Bill Hosken → Truelson; Doug-verified.
- **Depends on:** nothing.

#### SESSION_0522_TASK_06 — Signup confirm + scrollytelling → beta ledger (Cody verify + Petey ledger)

- **What:** Confirm Join-the-Legacy is THE signup (no generic bypass) + instructor picker (any member +
  "Other"). Ledger the scrollytelling redesign (Desi directions A/B/C delivered) as a beta lane +
  `useReducedMotion` `@mantine`→`motion/react` fix; NOT built this session.
- **Done means:** written signup-coverage confirmation + a ledger row for the scrollytelling redesign.
- **Depends on:** nothing.

### Parallelism

TASK_01 (retire `/me`), TASK_02 (RankEntry reads), TASK_03 (belt server + backfill), TASK_05 (Truelson),
TASK_06 (confirm/ledger) can proceed as parallel Cody slices after bootstrap. **TASK_04 (step-7 deletion) is
gated** on 01/02/03 + Doug browser proofs. Both prod-data scripts (TASK_03 backfill, TASK_05 Truelson) are
rehearsed on prodsnap and held for explicit per-action operator authorization before prod.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody → Doug | Wide mechanical redirect + repoint; browser-proof the auth redirect. |
| TASK_02 | Cody → Doug | RankEntry read-model cutover; projection parity. |
| TASK_03 | Cody → Doug (+ prod script) | One-seam minting + rehearsed backfill. |
| TASK_04 | Cody → Doug | Legacy deletion after proofs; dead-code sweep. |
| TASK_05 | Doug rehearse → prod script | Prod-data correction; rehearse-then-authorize. |
| TASK_06 | Cody verify + Petey ledger | Confirmation + ledgering, minimal build. |

### Open decisions

**RESOLVED (operator, this grill):** retire `/me`→`/app/profile` (steps 5–7); public+timeline reads →
RankEntry projection; belts visible-regardless-of-status, every current tree member VERIFIED / future signups
UNVERIFIED; signup trust = immediate+Unverified, picker = any member + "Other"; Truelson Bob removed +
`Bill→Truelson` VERIFIED; no ADR 0035 amendment (spec already ratifies member-entered UNVERIFIED);
scrollytelling → beta ledger.

**To verify during build (flag if a gap):**
1. `RankEntryReview` verify UI reachable for Tony/operator/RBAC (TASK_03).
2. No generic signup bypasses Join-the-Legacy auto-placement (TASK_06).
3. WP-import rank source located on the prodsnap before writing the backfill (TASK_03).

### Risks

- **Prod-data mutation right before a send** (TASK_03 backfill, TASK_05 Truelson) — highest risk. Rehearsed on
  prodsnap, Doug-verified, held for explicit per-action authorization; never auto-applied.
- **Wide `/me` repoint** (TASK_01) — a missed reference strands a link on a dead surface; grep-driven
  inventory + auth-lifecycle e2e is the guard.
- **Step-7 deletion before proofs** — gated behind TASK_01/02/03 + browser proofs (spec: "only after data
  and browser proofs").

### Scope guard

- Do NOT delete legacy code (step 7 / TASK_04) before the step 5–6 data + browser proofs land.
- Do NOT re-author the Epic A scrollytelling scaffold — scrollytelling stays beta; redesign is a ledger row.
- Do NOT touch the AdminCollection/Passport surfaces (`app/app/users/*`, `brand-settings`) — landed lane.
- Do NOT apply either prod-data script without explicit per-action operator authorization.
- Do NOT send anything to Brian — FI-001 send stays operator-gated (spec non-goal until the workflow clears).

### Dirstarter implementation template

- **Docs read first:** `rank-entry-unified-data-flow.md` (SoT) + lineage SOP + ADR 0016/0035 — reconfirm at pre-flight.
- **Baseline pattern to extend:** the shared RankEntry projection + `syncRankEntryFromAward`; the existing
  `/app/profile` workspace; the shipped FI-003 auto-placement.
- **Custom delta:** `/me` redirect + repoint; timeline/public read cutover to RankEntry; belt backfill scripts.
- **No-bypass proof:** advances the ratified migration order; reuses the one rank seam; deletes legacy paths.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0522_TASK_01 | landed (committed `e995ca2d`, unpushed) | Step 5 — retired `/me` → redirect to `/app/profile`; 27 files repointed (`?next=` not `?callbackURL`); static gates green; owner arm left for step 7. Doug browser-proof pending. |
| SESSION_0522_TASK_02 | planned | Step 6 — public + timeline reads → RankEntry projection |
| SESSION_0522_TASK_03 | **APPLIED to live prod** (committed `13215012`) | prodsnap was STALE — re-grounded on live prod via `.env.prod`. `rankEntryStatusForAward` IMPORTED→VERIFIED (operator ADR). Backfill: 20 UNVERIFIED awards→VERIFIED + 38 IMPORTED entries verified (award kept IMPORTED) + 4 minted (Jay/thient ta/Phan/Đạt). Tree: 45 unverified→**0**, 51 verified. Truelson walk=Bill. |
| SESSION_0522_TASK_04 | **DEFERRED → Next Session** | Step 7 (delete legacy owner-arm/split-path) — owner arm is unreachable dead code after step 5; deletion is safe cleanup, ladders out. |
| SESSION_0522_TASK_08 | landed (committed `f54a25f0`) | Drawer verification-axis consolidation — removed `LineageTrustBadge` from the drawer header; "Awarded By" → the INSTRUCTOR (not admin actor / not "lineage-unverified"). Doug browser-proof in flight. |
| SESSION_0522_TASK_05 | **CLOSED — no-op** | Truelson already correct on LIVE prod: one edge `Bill Hosken→Truelson` (VERIFIED), no Bob edge. Walk → Bill→Rigan→CarlosJr→CarlosSr. No script needed. |
| SESSION_0522_TASK_06 | planned | Signup confirm (Join-legacy auto-place confirmed) + scrollytelling → beta ledger |
| SESSION_0522_TASK_07 | in progress (Cody) | Belt-code lane: mapping-test fix + forward mint on `placeLeadIntoLineage` (UNVERIFIED) + steward `verifyRankEntry` (belt.admin) + Verify button on LineageProfileDrawer. |
| SESSION_0522_TASK_02 | **DEFERRED → Next Session** | Step 6 (public + timeline reads → RankEntry projection) — belts already render correctly via the backfilled awards + stored entry status; this is migration completeness, not launch-blocking. |

## What landed

Session grew (operator-driven) from "WL-P2-37 /me consolidation" into the RankEntry-migration step 5 +
the pre-send belt/verification cleanup + several founder data fixes. All CODE committed on
`session-0522-wl-p2-37` (7 commits); all PROD DATA applied live via `.env.prod` scripts.

- **Step 5 — `/me` retired** → redirect to `/app/profile` (signed-in) / `/auth/login?next=/app/profile`
  (anon); ~27 refs repointed. Owner-arm tree left dead-but-present (step 7 deferred). (`e995ca2d`)
- **Belt = RankEntry-native + verified on the tree.** `rankEntryStatusForAward` IMPORTED→VERIFIED
  (operator ADR — imported = verified truth, award keeps IMPORTED provenance/belt-gate). Prod backfill:
  20 UNVERIFIED awards→VERIFIED, 38 IMPORTED entries verified, 4 minted (Jay/thient ta/Phan/Đạt) →
  canonical tree 45 unverified → **0**. (`13215012`)
- **Belt forward + verify.** `placeLeadIntoLineage` now mints the declared belt (UNVERIFIED) on placement;
  new `verifyRankEntry` steward action + Verify button on the drawer. (`44b85f56`)
- **Drawer = one verification axis.** Removed the node-trust `LineageTrustBadge` from the drawer header;
  "Awarded By" → the INSTRUCTOR (not the admin actor / not "lineage-unverified"). (`f54a25f0`)
- **Founder fixes (prod data):** all three roots (Carlos Sr/Jr, Rigan) **not claimable** (`64f7003c`);
  **founder avatars** wired to their existing scrollytelling hero images (`a61f6e2f`); **Phan Nguyễn's
  blank "?" card** name-backfilled from his lead (`7874feac`).
- **Truelson** confirmed already-correct on live prod (Bill Hosken, no Bob edge) — no-op.

## Decisions resolved

- Retire `/me` → `/app/profile` (steps 5–7); `/app/profile` is the member workspace, `/directory/[slug]`
  the public read. (Re-anchored mid-session onto `rank-entry-unified-data-flow.md` after the operator
  flagged the RankAward→RankEntry cutover — my initial "keep /me + merge leaves" plan was retracted.)
- IMPORTED = VERIFIED (member-facing entry status); award keeps IMPORTED provenance.
- Every current tree member verified; future join/admin signups UNVERIFIED until steward verify.
- Founder roots not claimable; lineage trust must derive from the verified **RankEntry**, not `node.isVerified` (→ Next).
- **Lean close:** the 3 quality passes + deep hostile review deferred to next session (dumb-zone; the
  post-6-7 shape is the right thing to review) — run against **this session's merge-base**, not just 6-7.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/app/(web)/me/page.tsx` | Retired → redirect to `/app/profile` |
| ~27 refs (nav/footer/emails/redirects/tests) | `/me` → `/app/profile` |
| `apps/web/server/belt/queries.ts` | `rankEntryStatusForAward` IMPORTED→VERIFIED |
| `apps/web/server/admin/lineage/place-lead-core.ts` | Mint declared belt (UNVERIFIED) on placement |
| `apps/web/server/belt/verify-rank-entry.ts` (new) | Steward `verifyRankEntry` action |
| `apps/web/components/web/lineage/lineage-profile-drawer/{info-tab,drawer-header,index}.tsx` | Verify button; trust badge removed; awarded-by → instructor |
| `apps/web/server/web/lineage/payloads.ts` | RankEntry `{id,status}` on the drawer payload |
| `apps/web/prisma/seed-baseline-lineage.ts` | Rigan `isClaimable` true→false |
| `apps/web/scripts/session-0522-*.ts` (5) | Forensics + belt backfill + rigan-claimable + member-names + founder-avatars (all applied to prod) |
| tests | router.integration + place-lead-core + rank-entry-status + e2e/profile-paywall + registration |

## Verification

| Check | Result |
| --- | --- |
| `next build` | PASS (whole diff) |
| `bun run typecheck` | 0 errors |
| `bunx oxlint` / `format:check` | clean / 1882 files |
| Unit (belt-gate 22, place-lead 7, router 31, rank-entry 4) | pass |
| `/me` redirect (server fetch) | 307 → `/app/profile` (anon via middleware→login) |
| Lineage page render (live dev) | renders, no new console errors |
| Prod belt backfill | tree 45 unverified → 0; 4 minted (re-query verified) |
| Prod founder fixes | Sr/Jr/Rigan non-claimable + avatars set; Phan named (re-query verified) |
| Drawer visual (trust badge/awarded-by) | code+build verified; live-drawer proof blocked by canvas-click + stale-compile; **operator confirms live post-deploy** |
| Deep review + fallow/code-quality/hostile-close | **DEFERRED → next session** (lean close) |

## Open decisions / blockers

None blocking the push. All operator asks are live-on-prod, fixed-by-push, or ledgered follow-ups (below).

## Next session

### Goal

**Retire the node-level verification axis — derive lineage trust from the Passport's verified `RankEntry`**
(operator: "get rid of `node.isVerified`… should be using the verified RankEntry from Passport"). The
member-facing verification is `RankEntry.status` (RankAward is only the fact anchor). This is what still
shows Tony's students / Đạt as "Unverified" on the **canvas cards** (the drawer was fixed this session).
Same refactor as the trust-badge retirement — collapse `resolveLineageTrustStatus` off
`node.isVerified`/`node.verificationStatus` onto the verified **`RankEntry`**, across all ~15 lineage surfaces.

### First task

Run the **3 deferred quality passes** (`/fallow-fix-loop`, `/code-quality`, hostile-close-review) against
**this session's merge-base** (`git diff <SESSION_0522 base>..main`) so today's belt/drawer/`/me` code is
covered, then start the `node.isVerified` retirement. Then the remaining migration debt:

- **Steps 6–7:** public + timeline reads → RankEntry projection; delete the dead owner-arm tree (after proofs).
- **Trust-badge retirement** on the other 7 surfaces (directory/canvas/m-card/mobile-list/…) — folds into
  the `node.isVerified` retirement.
- **Forward name-wiring:** propagate the lead name to the account on free-signup so no future nameless "?" cards.
- **Verify affordance gate:** widen `verifyRankEntry` so a TREE_ADMIN (e.g. Tony) can verify their own
  students, not just platform admins.
- **Instructor-edge "Unverified" badge** in the drawer — the last stray verification axis; fold into the retirement.

FI-001 Brian send remains operator-gated (separate); the node.isVerified retirement should land before it.

## Review log

### SESSION_0522_REVIEW_01 — pre-push verification (self + Doug-partial)

- **Reviewed:** the 7-commit diff (step 5, belt mapping+backfill, forward-mint+verify, drawer, founder fixes).
- **Verdict:** launch-safe for the push at the gate level — `next build` + typecheck + oxlint + format + unit
  all green; prod data backfills re-queried and verified; `/me` redirect + live page render confirmed. The
  interactive drawer visual (trust badge/awarded-by) is code+build verified but not headlessly eyeballed
  (canvas-click + a stale-compile blocked it) → operator confirms live post-deploy.
- **Deferred:** `/fallow-fix-loop`, `/code-quality`, and the deep hostile-close review → next session,
  against this session's merge-base (lean close, operator-agreed; dumb-zone).

## Hostile close review

**Deferred → next session (lean close, operator-agreed).** Not applicable to run in-session: this session
ran deep into the dumb zone and steps 6–7 will reshape the reviewed code, so the deep adversarial review +
the 3 quality passes run next session against this session's merge-base. Gate-level safety (build/typecheck/
lint/format/unit + prod re-query) is the push floor.

## ADR / ubiquitous-language check

- **ADR touch (light):** IMPORTED=VERIFIED for the member-facing RankEntry status is an operator decision
  extending `rank-entry-unified-data-flow.md` (RankAward keeps IMPORTED provenance; belt-gate unchanged).
  Captured in `queries.ts` comment + this SESSION file; a formal ADR amendment can ride the next-session
  RankEntry migration work. No new ubiquitous term.

## Reflections

- **The session's biggest miss was mine and process-shaped: I planned a whole lane (keep `/me`, merge
  leaves) against the wrong target architecture because I didn't read the recent `rank-entry-unified-data-
  flow.md` before reasoning about ranks.** The operator's "how do you NOT know that" was fair. The fix that
  actually held: re-ground on the ratified spec the moment it surfaced, retract the plan explicitly, and
  re-anchor. Lesson (again): read the domain SoT before planning, not after the operator corrects you.
- **Dry-run-first on prod data paid off twice.** The belt backfill's first version wrongly flipped IMPORTED
  awards' `verificationStatus` (would have broken belt-gate read-only); the dry-run surfaced it before any
  write. Every prod script this session was dry-run → show → apply.
- **"Stale prodsnap" was the through-line.** Doug's whole first forensic pass (Tony's-students missing ranks,
  Truelson) was against a stale local snapshot and had to be re-grounded on live prod via `.env.prod`. The
  operator caught it faster than I did ("the ranks are there, on the leads pages"). Lesson: for launch data
  questions, confirm the data source is LIVE before drawing conclusions.
- **I hit the dumb zone and the operator flagged it** (asking for founder images that were already in the
  media gallery/scrollytelling). Right call to close here and defer the deep review to a fresh session.

## Full close evidence

| Step | Proof |
| --- | --- |
| Task log | 8 task rows (steps 5/6/7, belt, Truelson, signup, drawer) — statuses landed/deferred/closed |
| Gates | `next build` PASS · typecheck 0 · oxlint clean · format:check 1882 · unit (belt-gate 22/place-lead 7/router 31/rank-entry 4) |
| Prod data | belt backfill (45→0), rigan-not-claimable, founder-avatars, phan-name — all re-queried live |
| Review & Recommend | Next session = `node.isVerified`→RankAward retirement (+ the 3 quality passes first) |
| Hostile close / quality passes | DEFERRED → next session against this session's merge-base (lean close) |
| Git hygiene | 7 commits on `session-0522-wl-p2-37`; branch off `origin/main` `9d343b9a`; push held for operator go |
| Deferral guard | follow-ups carried in Next-session block (node.isVerified, steps 6-7, trust-badge, forward-wiring, verify-gate) |
