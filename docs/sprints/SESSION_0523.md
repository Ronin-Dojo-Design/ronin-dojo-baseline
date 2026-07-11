---
title: "SESSION 0523 — WL-P2-46: retire node.isVerified → derive lineage trust from verified RankEntry"
slug: session-0523
type: session--implement
status: closed
created: 2026-07-10
updated: 2026-07-10
last_agent: claude-session-0523
sprint: S1
pairs_with:

  - docs/sprints/SESSION_0522.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0523 — WL-P2-46: retire node.isVerified → derive lineage trust from verified RankEntry

## Date

2026-07-10

## Operator

Brian + claude-session-0523

## Goal

**Retire the node-level verification axis — derive lineage trust from the Passport's verified
`RankEntry.status`** (operator, SESSION_0522: "get rid of `node.isVerified`… should be using the
verified RankEntry from Passport"). Collapse `resolveLineageTrustStatus` off
`node.isVerified`/`node.verificationStatus` onto the verified **`RankEntry`**, across the remaining
lineage surfaces (canvas cards / directory / m-card / mobile-list / carousel / galaxy — the **drawer**
was already fixed in SESSION_0522). This is what still shows real verified members (Tony's students,
Đạt) as "Unverified" on the canvas despite VERIFIED `RankEntry`s. **First**, run the 3 deferred quality
passes against SESSION_0522's merge-base so that belt/drawer/`/me` code is covered.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0522.md`
- Carryover: SESSION_0522 landed RankEntry-migration step 5 (`/me` → `/app/profile`), the belt
  verification backfill (canonical tree 45 unverified → **0**, all applied to live prod), forward
  mint + steward `verifyRankEntry`, and the drawer's verification-axis consolidation (node-trust
  `LineageTrustBadge` removed, awarded-by → instructor). It **deferred** the 3 quality passes + deep
  hostile review to this session (lean close, dumb-zone), and left the node-level `node.isVerified`
  retirement on the **other 7 lineage surfaces** as the pinned next lane (WL-P2-46).

### Branch and worktree

- Branch: `session-0523-wl-p2-46`
- Worktree: `/Users/brianscott/dev/ronin-0523` (fresh — bootstrapped this bow-in: `.env` copied,
  `bun install`, `bunx prisma generate` → Prisma 7.8 client at `apps/web/.generated/prisma`)
- Status at bow-in: clean (branched off `origin/main` `a38c1058` = SESSION_0522 close)
- Current HEAD at bow-in: `a38c1058`
- Sibling worktree note: operator keeps `../ronin-0522` open (the watch + its gitignored `.env.prod`);
  this session does **not** reuse it.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Auth/admin (member verification/trust read model), Theming (belt/trust badge chrome). No new L1 primitives. |
| Extension or replacement | Extension: collapse the redundant `node.isVerified` trust axis onto the existing verified-`RankEntry` seam; removes a second axis, adds none. |
| Why justified | One-foundation doctrine — two verification axes (node-level + RankEntry) is exactly the redundant-second-source the RDD mantra targets; this makes RankEntry.status the single trust source. |
| Risk if bypassed | Real verified members keep showing "Unverified" on public lineage surfaces (the funnel/mission asset) right before the FI-001 Brian send. |

Live docs checked during planning: Auth/Theming — reconfirm during Cody pre-flight.

### Grill outcome

Operator-pinned lane (bow-in args) — no open forks at bow-in:

- **Lane = WL-P2-46**: retire `node.isVerified`/`node.verificationStatus`; derive lineage trust from
  the verified `RankEntry.status`. Drawer already done (SESSION_0522) — this covers canvas/directory/
  m-card/mobile-list/carousel/galaxy.
- **First task before the lane**: the 3 deferred quality passes (`/fallow-fix-loop`, `/code-quality`,
  hostile-close) against `git diff 9d343b9a..a38c1058` (SESSION_0522's diff; base `9d343b9a`).
- Prod data all applied; `.env.prod` read-only re-grounding is the pattern if the lane needs live data.

**To surface at plan-lock (nuance found in bow-in grep):** there are **two** distinct verification
axes in the code — member-level `node.isVerified` (canvas cards / carousel / galaxy) AND edge-level
`LineageRelationship.isVerified` (the instructor-edge "Unverified" badge in the drawer info-tab /
`ancestry.ts` tiebreak). The ledger folds both into this lane; confirm whether the instructor-edge
axis retires the same way or stays as an edge-provenance signal.

## Petey plan

### Goal

Make `RankEntry.status` the single lineage-trust source: run the 3 deferred quality passes on the
SESSION_0522 diff, then collapse `resolveLineageTrustStatus` off `node.isVerified` onto the verified
`RankEntry` across the remaining lineage surfaces.

### Tasks

#### SESSION_0523_TASK_01 — 3 deferred quality passes on the SESSION_0522 diff

- **Agent:** lead (inline) → Cody for any fixes → Doug re-verify
- **What:** Run `/fallow-fix-loop`, `/code-quality`, and a hostile-close review against
  `git diff 9d343b9a..a38c1058` — the belt/verify/drawer/`/me`/place-lead code plus the founder scripts.
- **Steps:** fallow audit + health for CRAP/dupes/dead-code on the diff → `/code-quality` score on the
  belt/verify/drawer units → hostile-close adversarial pass → implement surviving fixes → re-verify.
- **Done means:** findings triaged (fix vs ledger), applied fixes gate-green, a written verdict.
- **Depends on:** worktree bootstrap (done).

#### SESSION_0523_TASK_02 — Retire node.isVerified → verified-RankEntry trust (WL-P2-46)

- **Agent:** Petey (scope + open-fork grill) → Cody (build) → Doug (verify)
- **What:** Collapse `resolveLineageTrustStatus`/`pickLineageClaimStatus` off
  `node.isVerified`/`node.verificationStatus` onto the verified `RankEntry.status`; retire
  `LineageTrustBadge`'s node-trust use on the remaining surfaces (canvas card, mobile-list,
  compact-child-list, carousel, galaxy filter); audit the `node.isVerified` writers (create-lineage-member,
  editor-actions, place-lead, claim-finalize).
- **Steps:** TBD at plan-lock (Petey) — confirm the RankEntry projection reaches each surface's read
  model first; resolve the node-axis-vs-edge-axis fork.
- **Done means:** Tony's students / Đạt show VERIFIED on canvas + directory; no surface reads
  `node.isVerified` for trust; build + affected e2e green; fallow dead-code delta negative.
- **Depends on:** SESSION_0523_TASK_01 (quality baseline), plan-lock grill.

### Parallelism

TASK_01 is sequential and first (operator order). TASK_02 planning can begin in parallel with TASK_01
fixes, but its build waits on the quality baseline + plan-lock.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0523_TASK_01 | lead + Cody/Doug | Review/cleanup loop on a landed diff. |
| SESSION_0523_TASK_02 | Petey → Cody → Doug | Multi-surface refactor with one open fork (node vs edge axis). |

### Open decisions

- **Node-axis vs edge-axis:** does the instructor-edge `LineageRelationship.isVerified` retire onto
  RankEntry too, or stay as edge provenance? (surface to operator at TASK_02 plan-lock).

### Risks

- Missing a surface leaves a member showing "Unverified" on a public page right before the send.
- The RankEntry projection may not yet reach every read model (directory/canvas payloads) — needs a
  read-path audit before flipping the trust source.

### Scope guard

- Do NOT send anything to Brian — FI-001 send stays operator-gated.
- Do NOT touch prod data without explicit per-action authorization (`.env.prod` is read-only here).
- Do NOT expand into RankEntry migration steps 6–7 (owner-arm deletion) unless the trust retirement
  needs it — those are separate ledgered follow-ups.
- Hold at the push gate for the operator's explicit "go".

### Dirstarter implementation template

- **Docs read first:** `rank-entry-unified-data-flow.md` (SoT) + lineage hub + WL-P2-46 ledger row — reconfirm at pre-flight.
- **Baseline pattern to extend:** the shared RankEntry projection + `resolveLineageTrustStatus` seam.
- **Custom delta:** re-point the trust resolver's inputs from node fields to the verified RankEntry.
- **No-bypass proof:** removes a redundant second verification axis; adds no primitive.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0523_TASK_01 | landed | 3 quality passes on `9d343b9a..a38c1058` (fallow 0-mine, code-quality ≈8.8, hostile 9.6) → surfaced + FIXED 3 items: **A1** public-mint discipline-scope (HIGH security), **A2** `/me` middleware shadow, **A3** `verifyRankEntry` test coverage; **B1** stale-IMPORTED prod re-sync (Rorion). Doug-verified 9.7/10 launch-safe. |
| SESSION_0523_TASK_02 | landed (Slice A) | WL-P2-46 read-collapse — `RankEntry.status` = single trust source via one resolver + beltless membership fallback (regression-free: +4 fixes, 33 beltless kept). Prod cross-axis verified. Edge-axis strip + steps 6-7 + WP belt backfill → next session. |
| SESSION_0523_TASK_03 | landed | Galaxy exposed on `/app/beta/galaxy` (reuses `beta.view` gate + galaxy seam untouched) + `/app/beta` card. Verified live rendering the real Machado/Gracie constellation on the refreshed prodsnap. |
| SESSION_0523_TASK_04 | landed | Refreshed local `ronindojo_prodsnap` from live Neon (VERIFIED 65 / UNVERIFIED 2) — fixed the stale snapshot hiding the cutover + galaxy locally. |

## What landed

- **TASK_01 hardening (A1/A2/A3) + B1 re-sync** — see the review log (REVIEW_01/02/03).
- **B1 applied to prod** (operator-authorized "Rorion needs to be verified"): the 1 stale off-canonical-tree
  IMPORTED member (`Rorion Gracie — Red Belt 9th Degree`) → `RankEntry.status = VERIFIED` (award kept
  IMPORTED for provenance); live re-query post-apply = 0 stale IMPORTED entries.
  (`scripts/session-0523-rorion-rankentry-verify.ts`, dry-run → apply on live Neon prod.)
- **WL-P2-46 read-collapse (Slice A) — `RankEntry.status` is now the single member-facing lineage-trust
  source.** `resolveMemberTrustStatus` (`lib/lineage/trust-status.ts`) + `memberTrustStatus`
  (`canvas-model.ts`) = ONE choke point (LR 0008 "one source, read everywhere"); every reader repointed
  (galaxy filter, students-carousel, rank-history-tab, drawer hook, directory projection); cards/mobile-list/
  compact-child-list inherit it via `resolveLineageMemberView` (no edits). **Reads only** — writers +
  columns kept (schema drop is the post-send epic).
- **Membership fallback (REVIEW_04) — prevents a 33-member regression.** A live prod cross-axis probe found
  the pure cutover would drop 33 documented-but-beltless lineage members from the public verified galaxy.
  Rule now = top non-PENDING RankEntry.status (belt precedence) **else** node membership verification; keeps
  the +4 fixes AND the 33. `node.isVerified` survives ONLY as the beltless fallback.
- **Galaxy exposed on beta** — `/app/beta/galaxy` (gated by `beta.view`, reusing `getBblGalaxyData` +
  `GalaxyRoute` untouched; no `NEXT_PUBLIC_GALAXY_ENABLED` flag) + a card on `/app/beta`. Verified live on the
  refreshed prodsnap: renders the real Machado/Gracie constellation (Carlos Sr 10th-degree grand-master
  planet, Carlos Jr 9th, Renato Magno coral, …); the beltless-fallback members render as expected. Was
  invisible before (public route flag-404s + nothing linked to it).
- **Fresh prodsnap** — refreshed local `ronindojo_prodsnap` from live Neon (VERIFIED 65 / UNVERIFIED 2,
  matches prod), fixing the stale-snapshot that hid the cutover + galaxy locally.
- **RankAward-retirement epic mapped** (operator mandate: "retire RankAward → RankEntry-only, KISS it") —
  the read-collapse is phase 1; the table-drop is a documented post-send epic
  ([`rankentry-unification-epic.md`](../product/black-belt-legacy/rankentry-unification-epic.md)).

## Decisions resolved

- **IMPORTED is never a public status** (operator, this session): the IMPORTED provenance lives on
  `RankAward.verificationStatus` (belt-gate/admin only); public/member surfaces read `RankEntry.status`,
  which derives IMPORTED→VERIFIED. Confirmed satisfied by the current architecture — no public surface reads
  the RankAward provenance for display (every public `verificationStatus` read is the node/edge
  PENDING|VERIFIED|DISPUTED enum, which has no IMPORTED). B1 closed the one stale-status hole.
- **⚑ MAJOR — Retire `RankAward` entirely → RankEntry as the single rank model** (operator, this session:
  "simplify this whole process, it shouldn't be this complicated and convoluted"). Supersedes the ratified
  anchor→projection split (ADR 0016/0035/0043 + `rank-entry-unified-data-flow.md`, which currently anchor on
  the RankAward row). Sequenced in **two phases** (I pushed back only on the *timing* of the table-drop, not
  the direction):
  - **This session (safe read-collapse):** WL-P2-46 (`node.isVerified` retirement) + migration **steps 6-7**
    — move EVERY read onto the RankEntry projection + delete the legacy split-path. After this, RankEntry is
    the one read model everywhere; RankAward shrinks to a write-side fact anchor nothing displays.
  - **Follow-on epic (post-FI-001-send):** fold RankAward's fact fields into RankEntry, rewire belt-gate +
    the ADR-0016 lineage/moat invariant, drop the `RankEntry.rankAwardId` FK + the RankAward table, supersede
    the ADRs. **High-risk (touches the moat's fact-anchor + belt-gate authority + a shared-DB migration) — do
    NOT run pre-send.** Petey is mapping the full footprint + a sliced plan + ADR skeleton (SESSION_0523).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/lineage/place-lead-core.ts` | A1 — discipline-scope the public belt mint (`ensureDeclaredRankAward` skips non-BJJ ranks via `getBjjDisciplineId(tx)`; no ceiling) |
| `apps/web/server/admin/lineage/place-lead-core.test.ts` | A1 test — non-BJJ rank → no mint; positive test repointed to a seeded BJJ rank |
| `apps/web/server/belt/verify-rank-entry.safe-action.test.ts` (new) | A3 — `verifyRankEntry` coverage (admin verify, non-admin/anon reject, idempotent, IMPORTED-keeps-provenance) |
| `apps/web/proxy.ts` | A2 — drop `/me` from the anon-guard so `me/page.tsx`'s own `/app/profile` redirect wins (no `next=/me` shadow) |
| `apps/web/scripts/session-0523-rorion-rankentry-verify.ts` (new) | B1 — targeted prod re-sync (applied): stale IMPORTED `RankEntry` → VERIFIED (Rorion Gracie) |
| `apps/web/lib/lineage/trust-status.ts` | WL-P2-46 — `resolveMemberTrustStatus` (belt precedence + node membership fallback) + `pickTopTrustStatus` |
| `apps/web/lib/lineage/canvas-model.ts` | WL-P2-46 — `memberTrustStatus` (the one choke point) feeds `resolveLineageMemberView` |
| `apps/web/server/web/lineage/payloads.ts`, `passport/public-payloads.ts`, `directory/payloads.ts` | WL-P2-46 — `rankEntry.status` selects added to the canvas/public/directory read models |
| `apps/web/server/web/directory/profile-projection.ts` | WL-P2-46 — directory trust routed through the same resolver (no divergence) |
| `apps/web/components/web/lineage/galaxy/bbl-galaxy-from-lineage.ts` + `students-carousel-v2.tsx` + `lineage-rank-history-tab.tsx` + `lineage-profile-drawer/use-drawer-profile.ts` | WL-P2-46 — readers repointed onto `memberTrustStatus` |
| WL-P2-46 tests (trust-status, canvas-model, to-lineage-visual, galaxy, node-card.policy, directory ×3) | fixtures moved to `rankEntry.status` + fallback/belt-precedence cases |
| `apps/web/app/app/beta/galaxy/page.tsx` (new) + `apps/web/app/app/beta/page.tsx` | Galaxy-on-beta — beta leaf route (reuses galaxy seam) + discovery card |
| `docs/product/black-belt-legacy/rankentry-unification-epic.md` (new) | The RankAward-retirement epic plan (post-send) |

## Verification

| Command / smoke | Result |
| --- | --- |

## Open decisions / blockers

- **None blocking the push.** All work is gate-green (build PASS, 74+ tests, fallow 0-mine, Giddy/Doug 9.4).
- **Operator decisions still standing (not blockers):** (1) FI-001 Brian send remains operator-gated. (2) The
  RankAward table-drop epic is intentionally deferred post-send. (3) `.env.prod` credential was surfaced in a
  transcript error earlier this session — **recommend rotating the Neon password** if the transcript could be
  shared (operator's call).
- **Held at the push gate** — one commit staged on `session-0523-wl-p2-46`; awaiting the operator's explicit
  "go" before push (explicit-push-authorization).

## Next session

### Goal

Finish the RankEntry unification's **read-collapse** and set up the post-send RankAward-retirement epic:
(1) backfill the 33 beltless canonical-tree members' belts from WordPress so lineage trust is fully
RankEntry-native (the membership fallback stops being needed for them); (2) strip the edge-axis public
badges; (3) migration steps 6-7 finish + owner-arm deletion after proofs. Full epic map:
[`rankentry-unification-epic.md`](../product/black-belt-legacy/rankentry-unification-epic.md).

### First task — Codex: WP belt backfill for the 33 beltless lineage members

**Run this in Codex** (it can read the local machine — `blackbeltlegacy.local`, Local by Flywheel WP —
which the sandboxed agents here cannot; operator has no Cowork on macOS 12.7).

- **Who:** the ~33 canonical `rigan-machado-lineage` members who are `node.isVerified=true` but have NO
  `RankAward` (beltless nodes). Identify them programmatically (don't hardcode the list — re-derive against
  live prod): tree members whose `passport.rankAwardsEarned` is empty. Examples surfaced this session: Brian
  Bass, Derek Johnson, Vince Krause, Jesse Briggs, Kos Galatsis, Robert Mendoza, Les Bennett, … (see
  REVIEW_04).
- **Get their belts** from `blackbeltlegacy.local` (the old WP site holds the belt data — operator
  confirmed).
- **Backfill** each: create a `RankAward` (provenance `verificationStatus: IMPORTED` — imported historical
  truth, keeps belt-gate authority semantics) + sync a `RankEntry` (derives VERIFIED via
  `rankEntryStatusForAward`), mirroring `scripts/session-0522-belt-backfill.ts` (PrismaPg adapter, no
  app-module imports, `--env-file=.env.prod`, dry-run default). **Prod write → dry-run → show → explicit
  operator authorization → apply.**
- **Verify:** re-run a cross-axis divergence probe (the SESSION_0523 `tmp-wlp246-axis-divergence` shape) →
  **0 regressions** (every one of the 33 now resolves VERIFIED via RankEntry, no longer via the membership
  fallback). Then the pure RankEntry axis matches reality on prod.

### Then (this-lane follow-ups)

- **Edge-axis strip** (WL-P2-46 remainder): keep `LineageRelationship.isVerified` as the `ancestry.ts`
  structural tiebreak (edge provenance), but remove its member-facing "Unverified" badges (drawer info-tab
  instructor edge, lineage-tab) — they duplicate the RankEntry axis. (Decision: keep-as-edge-provenance.)
- **Steps 6-7:** the display-read projection cutover largely landed in Slice A/B; finish any remaining
  RankAward-direct display reads (per epic §1 bucket c), then delete the dead owner-arm tree (`me-profile/*`,
  `owner-profile.tsx`, `loadProfileViewForOwner`) after Doug data+browser proofs.
- **Stale comments** (Cody-flagged): `server/web/onboarding/actions.ts:16` + `server/admin/people/queries.ts:77`
  still describe the retired node-axis model — one-line fixes.
- **Admin raw-state views** (Cody-flagged, deliberate): `app/app/lineage/[treeId]/page.tsx:166` +
  `app/app/users/_components/people-table-columns.tsx:154` still show raw `node.isVerified` — decide
  repoint vs keep-as-raw-writer-state.

### Post-send epic

The RankAward table-drop (fold facts onto RankEntry → rewire belt-gate → repoint the moat's PROMOTED_BY
mirror → drop the table) — **after the FI-001 send** — per the epic doc. Write the superseding ADR then.

## Review log

### SESSION_0523_REVIEW_01 — TASK_01: the 3 deferred quality passes on the SESSION_0522 diff

Scope: `git diff 9d343b9a..a38c1058` (SESSION_0522's landed belt/verification/`/me` diff — already on
`origin/main` AND applied to live prod). Ledgered follow-ups excluded from re-report (TREE_ADMIN
widening of `verifyRankEntry`; the 7 remaining `LineageTrustBadge` surfaces; test-setup dup; the
one-shot `scripts/session-0522-*.ts`; inherited `InfoTab`/`placeLeadIntoLineage` size).

**Pass 1 — `/fallow-fix-loop` (diagnosis):** baseline (new-only gate) = dead code 15 · complexity 31 ·
duplication 38 groups / 1,246 lines (0.6%) · maintainability 88.0 (good). **Zero introduced-and-mine
fixable findings:** the 7 "unused files" are the one-shot prod scripts (false positive); the unused
exports (`payloads.ts` `lineageVisualGroupPayload`/`lineageTreeMemberPayload`, `place-lead-core.ts`
`PLACE_LEAD_ERROR`/`resolvePlacementActorUserId`) are present at base `9d343b9a` = **inherited**; the
complexity hotspots are inherited (the diff extracted `ensureDeclaredRankAward` + `RankVerifyButton`
into new helpers rather than inflating the host functions). No fix executed → no re-measure delta.

**Pass 2 — `/code-quality` (matrix score, Class B — custom lineage/belt):**

| Unit | Composite | Verdict |
| --- | ---: | --- |
| `server/belt/verify-rank-entry.ts` (new steward action) | 8.7 | Strong / near-gold |
| `server/belt/queries.ts` `rankEntryStatusForAward` | 9.2 | Strong (Doug confirmed no downstream regression) |
| `server/admin/lineage/place-lead-core.ts` `ensureDeclaredRankAward` | 9.0 | Strong |
| `components/web/lineage/lineage-profile-drawer/info-tab.tsx` `RankVerifyButton` + awarded-by | 8.3 | Functional, not gold |

Roll-up ≈ **8.8 (Strong)**, no cap triggered — D2 authz proven, patterns reused (no 5th authz; one
rank seam; `createPerson` shape mirrored), D4 docstrings exemplary. Weakest unit = `info-tab`, dragged
by **inherited** `InfoTab` size (190 lines / 39-cyclo) + the DISPUTED-display gap (below).

**Pass 3 — hostile-close (Doug, independent adversarial):** **9.6 / 10, no hard cap, launch-safe.**
Every hunted vector refuted concretely against real prodsnap data + green gates (typecheck clean,
oxlint clean on all 8 files, `bun test --parallel=1` belt/place-lead = 42 pass / 0 fail): verifyRankEntry
state-corruption + IMPORTED durability (reads by unique id, promotes only its own award, IMPORTED derives
VERIFIED durably); `ensureDeclaredRankAward` double-mint (`findFirst` + `RankAward @@unique([passportId,
rankId])` backstop → P2002 rollback, not corruption); payload mis-pairing (`RankEntry.rankAwardId`
`@unique` → `rankAward.rankEntry` is to-one = exactly the top award's entry; prodsnap 61 awards/61 entries,
0 entryless); IMPORTED→VERIFIED downstream (only 2 callers — `toBeltCard` + `syncRankEntryFromAward`;
belt-**gate** reads `RankAward.verificationStatus` directly, so IMPORTED stays authority-owned/read-only);
IDOR (`adminActionClient` = authed + `isAdmin`; client `canVerifyRank` cosmetic, server-backed).

**Consolidated finding (the only one across all 3 passes):**

- **DISPUTED-status display gap** (P3, latent, NOT launch-reachable) — `info-tab.tsx:~52`
  `isRankUnverified = rankEntry?.status === "UNVERIFIED"` is the only status-badge branch, so a
  `DISPUTED` entry paints Current Rank with belt swatch + **zero** warning; paired, `verify-rank-entry.ts:~45`
  would promote a `DISPUTED`-backed award to VERIFIED (guard only skips IMPORTED/VERIFIED). **Unreachable
  today:** no runtime writer sets `RankAward`/`RankEntry` to DISPUTED (`editor-schemas.ts` PENDING/VERIFIED/
  DISPUTED is the lineage-**node** axis), `RankEntryReview` unwired, prodsnap 0 DISPUTED / 0 PENDING.
  **Deferred → WL-P2-47** (dispute-workflow lane): render a distinct DISPUTED badge (no Verify
  button) + add an explicit `entry.status === "DISPUTED"` reject in `verifyRankEntry` **when** the dispute
  workflow wires up. Do not spend launch time on it now.

**Data-gap note (not a code bug):** the local `ronindojo_prodsnap` predates the SESSION_0522 belt-backfill
`--apply` (shows 59 UNVERIFIED / 2 VERIFIED). Structural invariants hold regardless, so the code verdict
stands; to *confirm* the live post-backfill state (every canonical-tree member VERIFIED) re-run the
read-only probe against live `.env.prod`. Routed to re-grounding, not a code fix.

**Verdict (pre-workflow):** Doug's pass read the diff launch-safe. The independent Opus-4.8 workflow
(6-angle find → 3-lens adversarial verify, 43 agents) then found items Doug's single pass did NOT — so
TASK_01 is **not** a pure review-only pass. See REVIEW_02.

### SESSION_0523_REVIEW_02 — TASK_01 workflow cross-check (43-agent find→verify) + consolidated triage

The exhaustive harness (6 finder angles → dedup → 3 adversarial refuters/finding, majority vote) produced
17 raw → 11 deduped findings. Doug's clean bill held on the belt-verification *correctness* core (every
corruption/IDOR vector he refuted stayed refuted), but the wider angles surfaced a genuine security gap and
a missed `/me`-sweep item. Consolidated, verified triage:

**A — real, act this session:**

- **A1 [HIGH] Public unauthenticated signup mints an arbitrary, above-ceiling, cross-discipline belt onto
  the public lineage graph.** `ensureDeclaredRankAward` (`place-lead-core.ts:64`) does `tx.rank.findUnique`
  (existence only) — no discipline/brand/ceiling check — reachable anon via `createJoinLegacyInterest`
  (`publicActionClient`, `public-actions.ts:366`) → `after()` (:649) → `autoPlaceSignupOnLineage` when
  `!isClaimOfExistingNode && trainedUnderNodeId`; `currentRankId` is only `.max(64)`. The legit self-submit
  path (`belt/router.ts:90–104`) rejects out-of-discipline (`rank.rankSystem.disciplineId !== bjj`) AND
  above-ceiling (`isWithinCeiling`); the mint path skips both. `memberTopRankAward` (`canvas-model.ts:66`)
  renders the award with no verification filter → forged belt shows color+rank+date on public surfaces
  (drawer adds an "Unverified" badge; canvas/cards do not). Verified end-to-end against source (2 CONFIRM /
  1 REFUTE-as-launch-noise). **Fix nuance:** the helper is shared by the trusted manual steward place AND
  the untrusted public auto-place — the fix must gate discipline+ceiling on the UNTRUSTED path only (a
  `trusted` param, or validate/clamp at the public entry point), not blanket-reject (a steward may legit
  place any rank). Operator decision required (security change on a public launch path).
- **A2 [MED] `/me` middleware miss** — `proxy.ts:45` still guards the retired `/me` and sets post-login
  `next=/me`, shadowing `me/page.tsx`'s `/app/profile` anon redirect arm. Real missed item from
  SESSION_0522 step 5. Mechanical, in the `/me`-retirement lane.
- **A3 [MED/coverage] `verifyRankEntry` has zero automated coverage** — no test invokes the only reachable
  self-submit verify path, and no test proves the `belt.admin` authz rejection. Code reads correct (Doug +
  refuters agree it's a coverage gap, not a live bug), but it's a launch-critical path — one integration
  test (mint UNVERIFIED STATED → verify as admin → assert award+entry VERIFIED + non-admin rejected) is
  cheap insurance.

**B — confirm then likely close (re-grounding, not a code fix):**

- **B1 [MED] IMPORTED→VERIFIED only re-synced the backfilled set — CONFIRMED as 1 live stale row.** Migration
  `20260709000000` seeded IMPORTED awards' RankEntry as UNVERIFIED; the drawer reads the STORED
  `rankEntry.status` (not the derived `rankEntryStatusForAward`), and the SESSION_0522 backfill was scoped to
  the canonical `rigan-machado-lineage` tree only. Read-only `.env.prod` re-grounding (SESSION_0523, temp
  probe, deleted): live `RankEntry` = **VERIFIED 64 / UNVERIFIED 3**; the stale-IMPORTED class (award IMPORTED
  + entry UNVERIFIED) = **exactly 1: `Rorion Gracie — Red Belt 9th Degree`** (off the canonical tree → missed
  by the backfill). The other 2 UNVERIFIED are legitimately non-IMPORTED. **Fix:** a targeted 1-row prod
  re-sync (`RankEntry` for that IMPORTED award → VERIFIED, consistent with the global IMPORTED→VERIFIED rule)
  — dry-run + explicit operator authorization, never auto-applied. Open question for the operator: confirm a
  Gracie (off the Machado canonical tree) should read VERIFIED (the derivation already makes him so on any
  derived-status surface; this only fixes the stored-status staleness).

**C — latent / ledger (not this session):**

- DISPUTED display+verify gap (`info-tab.tsx:~52` no DISPUTED badge; `verify-rank-entry.ts:45` would promote
  a DISPUTED award) — Doug's P3 too; deferred → **WL-P2-47** (dispute-workflow lane; 0 DISPUTED live,
  `RankEntryReview` unwired).
- `verifyRankEntry` no brand/tenant scoping (`:31`, latent cross-product IDOR) — fold into the WL-P2-46
  TREE_ADMIN steward-widening.
- Low cleanups: `owner-profile.tsx:41` stale `/me` breadcrumb (refuted-unreachable — `OwnerProfile` no
  longer renders), `profile-edit-drawer.tsx:54` stale `/me#edit` comment + dead deep-link.
- Refuted, no action: `place-lead-core.ts:67` check-then-act vs upsert (P2002-rollback race unreachable).

### SESSION_0523_REVIEW_05 — `/fallow-fix-loop` + `/code-quality` on the session diff (base a38c1058)

- **fallow-fix-loop:** **0 introduced findings** (gate-runner delta). The new-only gate's 14 complexity
  findings are all inherited functions in touched files (`canvas-model:248` group-sort comparator,
  `rankProgressPercent` CRAP 56, `StudentPreview`, `LineageRankHistoryTab`); dead-code/dup = test-setup
  duplication in the new test files (low-priority). New production code (resolver + fallback + galaxy route)
  introduces zero CRAP/dupes/dead-code. Goal met — nothing to fix. Build PASS.
- **code-quality (Class B — WL-P2-46 resolver + fallback):** **composite ≈ 9.1 (Strong), no cap.** D1 9
  (verified end-to-end on prod + live render), D2 9, D3 9 (0 introduced fallow), D4 9, D5 10 (one choke point
  → divergence impossible), D6 9, D7 9. The LR 0008 one-resolver pattern done right; the fallback is a clean,
  documented softening. Galaxy-on-beta = thin wiring (reuses the `beta.view` gate + galaxy seam untouched,
  ~10-line leaf) — no Class-A concern.

### SESSION_0523_REVIEW_04 — WL-P2-46 cutover: prod cross-axis divergence (the critical finding)

Cody's Slice A (node.isVerified → RankEntry read-collapse) built clean + gates green + surfaces-agree on
local data. But a **read-only prod cross-axis probe** (canonical `rigan-machado-lineage` tree, 84 members)
found the pure cutover would regress on live data:

| Axis | "Verified" count |
| --- | --- |
| OLD (`node.isVerified===true`) | 80 |
| NEW (top non-PENDING `RankEntry`===VERIFIED) | 51 |

- **+4 intended fixes** (ThienTa, Phan Nguyễn, Đạt Nguyễn, Jay Farrell — verified belts wrongly showing
  unverified; the exact WL-P2-46 target).
- **−33 regressions, ALL "no RankAward at all" (beltless nodes)** — real documented Machado-lineage members
  (Brian Bass, Derek Johnson, Vince Krause, …) verified *as lineage members* but with no belt on record. The
  pure cutover drops them from the public verified galaxy.

**Root:** `node.isVerified` (lineage-MEMBERSHIP verified) and `RankEntry.status` (BELT verified) are genuinely
two facts; 33 members have the first, not the second. The mandate's hidden assumption (every verified member
has a verified belt) is false on prod.

**Operator decision:** the 33 belts DO exist in `blackbeltlegacy.local` (Local by Flywheel WP) — retrieve +
backfill via **Codex next session** (Codex can read the local WP site; sandboxed agents here cannot).

**This-session resolution:** add a **membership fallback** to `resolveLineageTrustStatus` — trust = top
RankEntry VERIFIED, OR (no rank AND node membership-verified). Regression-free (keeps the 4 fixes + the 33),
and it's the *correct permanent* rule (a beltless-but-lineage-verified member is a real recurring category),
not throwaway scaffolding. `node.isVerified` thus survives ONLY as the beltless fallback — a documented
softening of "retire it entirely," forced by the data. The WP backfill next session reduces how often the
fallback fires; it does not make it removable.

### SESSION_0523_REVIEW_03 — TASK_01 hardening slice (Doug, launch-safety)

Doug verified the 4 hardening changes (A1 discipline-scope, A2 `/me` middleware, A3 verify test, B1 prod
re-sync): **9.7/10, no hard cap, all four LAUNCH-SAFE, zero blockers.** Evidence: typecheck 0 errors; oxlint
clean on all 5 touched files; A1 tests 8 pass/47 assertions (positive BJJ mint + out-of-discipline no-mint);
A3 tests 5 pass/24 assertions (real action, real authz rejection); **A2 runtime-proven** (dev server, anon
`GET /me` → 307 → `/auth/login?next=/app/profile`, no `next=/me` shadow, page self-guard reached); **B1
confirmed on live prod** (0 stale IMPORTED entries, Rorion `rank-entry-fix0430rorionred9th` = VERIFIED with
award still IMPORTED). One P3 (fixed): stale filename in the A3 test docstring `Run:` line.

## Hostile close review

Scope: WL-P2-46 read-collapse + fallback + galaxy-on-beta (A1/A2/A3/B1 already Doug-verified 9.7 — REVIEW_03).

- **Giddy (architecture / Dirstarter):** **PASS — 9.4/10.** Dirstarter-check n/a (no baseline capability
  touched). "One source, read everywhere" achieved for the member-facing axis (single choke point
  `resolveMemberTrustStatus`/`memberTrustStatus`; directory agrees with drawer/canvas); the beltless fallback
  is a clean, documented, correct softening — not a smell; galaxy-on-beta is clean reuse (`beta.view` gate,
  `getBblGalaxyData`+`GalaxyRoute` unmodified). **Correctly sliced** — belt-gate, the moat FK, and the table-drop
  all confirmed unmodified (Slice B only); the A1 discipline-guard *strengthens* the moat. Findings all LOW:
  → **WL-P2-48** (2 admin surfaces still read the node axis — ledgered), stale comment
  `onboarding/actions.ts:16` (doc-drift), and a transition-risk (trust now depends on RankEntry staying
  synced — mitigated by B1 + the compat writer, resolves when writers go RankEntry-native, epic phase G).
- **Doug (QA / security):** **PASS — 9.4/10, no P1.** 74 tests pass; prod-proven (84/84 canonical-tree
  members resolve VERIFIED = 50 belt-verified + 34 beltless-fallback; +4 fixes picked up by the belt path;
  belt precedence holds for UNVERIFIED and DISPUTED; galaxy filter + beta gate solid, no private leak). Found
  one **P2** — a self-introduced directory list-vs-detail trust-badge divergence (the list payload's
  `take: 1` starved the resolver so a null-entry top award fell to the node fallback while detail read the
  full set). **FIXED this session:** dropped `take: 1` from `directoryProfileListPayload.rankAwardsEarned`
  (display still top-1 via `.slice(0,1)`; trust now matches detail — LR 0008), + Doug's P3 test assertion
  (UNVERIFIED belt + node-verified → NOT upgraded) + the ~33→~34 comment. Re-verified: typecheck clean, 18
  directory/trust tests pass. Remaining P3 (`galaxy-data.ts` `profilesById` over-fetch) is pre-existing +
  public-safe — Doug observation, not this session's debt.
- **Kaizen aggregate:** **9.4** — clean, well-documented, correctly-sliced incremental work; the P2 divergence
  was caught + fixed in-session; the only remaining thread (admin node-axis divergence) is out-of-scope and
  tracked (WL-P2-48).

### Findings (severity ≥ medium)

None ≥ medium. All Giddy findings are LOW and ledgered (WL-P2-47 DISPUTED gap, WL-P2-48 admin divergence) or
doc-drift.

## ADR / ubiquitous-language check

- **ADR:** none written this session — the RankAward→RankEntry retirement is a mandated direction but the
  superseding ADR is deliberately deferred to when the **post-send epic** starts (it must supersede 0016/0035/
  0043 with the migration proven; writing it now would ratify a design not yet built). Epic skeleton in
  [`rankentry-unification-epic.md`](../product/black-belt-legacy/rankentry-unification-epic.md). The
  IMPORTED=VERIFIED member-facing rule (SESSION_0522) stands; no amendment needed.
- **Ubiquitous language:** no new domain term. `memberTrustStatus` / `resolveMemberTrustStatus` are the
  member-facing trust resolver (reinforces the existing "trust = verified RankEntry" language).

## Reflections

- **The prod cross-axis probe was the session's most important 30 lines.** Cody's cutover was correct-to-spec,
  gates green, and its local surfaces-agree proof passed — but on the STALE local snapshot. A read-only probe
  against LIVE prod showed the pure cutover would drop **33 documented lineage members** from the public
  galaxy. The lesson (again, cf. the stale-prodsnap through-line of SESSION_0522): a trust-SOURCE cutover must
  be verified against live data, because the bug is data-shaped, not code-shaped. Local green ≠ prod-safe.
- **`node.isVerified` and `RankEntry.status` are genuinely two facts.** The mandate "retire node.isVerified,
  derive from RankEntry" carried a hidden assumption — every verified member has a verified belt — false for
  33 beltless-but-documented members. The membership fallback isn't a hack; it's the reconciliation (a lineage
  graph's trust badge means "confirmed member", and for beltless historical members that's a node fact). It's
  the correct permanent softening of "retire it entirely".
- **The RankAward convolution was the real pain, and the operator named its root:** the Baseline
  curriculum-vs-lineage separation is over-engineering for BBL. The right move was to push back on the *timing*
  (table-drop is a post-send epic — it touches the moat's fact anchor + belt-gate) while landing the felt
  simplification now (the read-collapse). Map the footprint before sizing the cut (LR 0008 coda held again:
  RankAward is load-bearing in 3 places, not display-dead).
- **Two harness gotchas cost time:** (1) `preview_start` is hard-locked to the canonical checkout (rejects an
  absolute `cwd`) — it structurally can't serve a `../ronin-NNNN` worktree; run the worktree dev server via
  Bash and let the Browser pane read `localhost:3000`. (2) I leaked the Neon prod password by hand-extracting
  the URL with `sed` into a `psql` arg that errored and echoed it — **always `--env-file` / `source`, never
  hand-parse a secret into argv.** Flagged for rotation.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0523 + `rankentry-unification-epic.md` (new, frontmatter present); `wiring-ledger.md` + `wiki/index.md` updated (both `updated:` 2026-07-10 = local date; wiki:lint's UTC-2026-07-11 staleness warning is a timezone artifact, not real). |
| Backlinks/index sweep | wiki index: added SESSION_0523 + backfilled SESSION_0522 (0522's own close skipped it, FS-0019). Epic doc `pairs_with` the ADRs + LR 0008; MEMORY.md pointers added. |
| Wiki lint | `bun run wiki:lint` → **0 errors / 51 warnings** (all pre-existing petey-plan style + the UTC date artifact; none introduced-error). |
| Kaizen reflection | Reflections present (prod-cross-axis lesson, two-facts, RankAward timing, preview_start + secret-leak gotchas). |
| Hostile close review | Giddy PASS 9.4 + Doug PASS 9.4 (REVIEW section) — Doug's P2 (directory divergence) FIXED in-session + P3 test added. |
| Code-quality gate (Class-A) | WL-P2-46 resolver (Class B) ≈ **9.1**, no cap (REVIEW_05). Galaxy-on-beta = thin wiring, no Class-A concern. |
| Runtime verification (Doug) | `/app/beta/galaxy` verified live (real Machado/Gracie constellation on the refreshed prodsnap); WL-P2-46 prod cross-axis (84/84 verified); A2 `/me` anon redirect runtime-proven; B1 prod re-query 0 stale. |
| Review & Recommend | Next session written — Codex WP belt backfill (33 beltless) + edge-axis strip + steps 6-7. |
| Memory sweep | 2 memories added: `rankaward-retire-to-rankentry-only` (project direction), `preview-start-cannot-serve-worktree` (harness/secret gotcha). |
| Next session unblock check | Unblocked — the Codex WP-backfill first task is self-contained (needs the local WP site, which Codex reads). |
| Git hygiene | branch `session-0523-wl-p2-46`; own worktree `../ronin-0523` (NOT merged — do not self-remove); single commit at close; **hash reported in the bow-out chat**; held at push gate for operator "go". |
| Graphify update | nodes=12968 · edges=28658 · communities=1447 (gate runner, pre-commit). |
