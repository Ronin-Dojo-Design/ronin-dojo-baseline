---
title: "SESSION 0508 — D-034 founder migration to canonical + WL-P2-21 clone-tree retirement"
slug: session-0508
type: session--implement
status: closed
created: 2026-07-07
updated: 2026-07-07
last_agent: claude-session-0508
sprint: S49
pairs_with:

  - docs/sprints/SESSION_0507.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0508 — D-034 founder migration to canonical + WL-P2-21 clone-tree retirement

## Date

2026-07-07

## Operator

Brian + claude-session-0508

## Goal

Resolve drift D-034: migrate the 4 founders (Carlos Gracie Sr, Carlos Gracie Jr, Erik Paulson,
Rick Minter) from the 2 unpublished `rigan-machado-bjj-lineage` clone trees onto the published
canonical `rigan-machado-lineage` (rehearsed, operator-gated, data-only), then — behind a
separate gate — retire the clone trees (WL-P2-21). End state: canonical shows the Gracie roots
above Rigan (Sr → Jr → Rigan, Erik + Rick as Rigan's students), one Erik Paulson, clones gone.

## Status

Single source of truth is the frontmatter `status:` field (`in-progress` → `closed` at bow-out, per closing.md).

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0507.md`
- Carryover: 0507 proved FI-001 pre-send readiness fully green on live prod (dry-run email,
  rolled-back claim+comp sim, Resend keys, A1 clone recheck). The send itself is held for the
  operator's explicit "go"; lifetime-Elite resolves via the post-claim `--grant` step.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: 2 untracked screenshots from prior sessions (`prod-live-dirty-dozen.jpeg`,
  `tony-hua-lineage-timeline-prod.jpeg`) — raised at fork; otherwise clean
- Current HEAD at bow-in: `9cf2618c`

### Inbound scan (ledger + board)

- `bun scripts/ledger-backlog.ts` — 54 open; top: G-001/FI-001 (P0, in-progress, operator-gated
  send), G-002, G-005, G-007, FI-002/003/004, RISK #13 (Neon credential rotation overdue).
- `apps/web bun scripts/board-backlog.ts` — 48 open cards; board order matches: FI-001/G-001/G-002
  in-progress, then TFF-006, MB-010, MB-012, MB-013, G-007, MB-014, FI-002.
- Open PRs: 0 → `/pr-fix-loop` default lane does not fire.

### Grill outcome

Session-lane fork resolved by operator: **D-034 founder migration** (over FI-001 send / next
board lane). Stray repo-root screenshots: **deleted** (evidence already in SESSION files).

Petey discovery (read-only vs prodsnap) grounded the plan; operator ratified all 8 forks:

- **(a) Topology:** mirror the clone trees exactly — Carlos Sr (root) → Carlos Jr → Rigan
  (re-parent Rigan's member row); **Erik Paulson + Rick Minter are Rigan's STUDENTS** (clone
  rows: parent=Rigan, sort 5 and 7) — children, not ancestors.
- **(b) Copy vs recreate:** recreate minimal new `LineageTreeMember` rows; clone rows are the
  placement spec only.
- **(c) Verification:** no writes — all 4 nodes already `isVerified=true` with VERIFIED
  `INSTRUCTOR_STUDENT` provenance edges (sr→jr, jr→rigan, rigan→erik, rigan→rick) + RankAwards.
- **(d) Erik Paulson duplicate (discovered):** canonical carries a 0493-backfill placeholder
  `erik-james-paulson` (no awards, no user). **Swap-in-place**: repoint the canonical member
  row's `nodeId` → rich `erik-paulson`, delete the backfilled dup edge, delete the placeholder
  node/passport (audit prints both DirectoryProfiles first).
- **(e) `defaultRootMemberId`:** repoint to Carlos Sr's new member row in the same tx.
- **(f) Visual group:** add Erik + Rick to the existing "Rigan's First Black Belts (1992–96)"
  (Dirty Dozen) group.
- **(g) Clone retirement:** same session, behind its own separate operator gate, only after the
  prod coverage audit shows 0 would-be-orphans.
- **(h) Public impact:** operator signs off on local rehearsal screenshots before prod apply.

Side-find (log-only): `renato-magno` + `renato-magno-baptista` BOTH on published canonical — a
pre-existing public duplicate → new drift row; NOT fixed this lane.

### Drift logged

- D-NEW (number at close): renato-magno / renato-magno-baptista duplicate pair on the published
  canonical tree (same 0493-import pattern as the Erik pair).

## Petey plan

### Goal

Migrate the 4 founders onto canonical (rehearse → gate → apply), then retire the 2 clone trees
(separate gate); Doug verifies vs prod + live site; ledgers closed.

### Tasks

#### SESSION_0508_TASK_01 — Build `migrate-founders-to-canonical.ts`

- **Agent:** Cody
- **What:** new `apps/web/scripts/migrate-founders-to-canonical.ts` — `--dry-run` (default) /
  `--apply` / `--rollback <file>`; JSON backup; reads outside the tx, mutation in ONE
  Serializable tx (generous `maxWait` — Neon P2028 lesson); in-tx asserts (published canonical,
  77→80 members, slugs resolve, no published-row deletes); encodes forks a–f; idempotent.
- **Prior art:** `remove-brian-clone-memberships.ts` (guards/backup/rollback),
  `consolidate-rigan-machado-tree.ts` (atomic tree ops), `backfill-lineage-instructor-edges.ts`.
- **Done means:** script green on gates; `--dry-run` vs prodsnap prints the exact mutation table.
- **Depends on:** nothing (forks ratified).

#### SESSION_0508_TASK_02 — Rehearsal on prodsnap + render proof (UN-GATED)

- **Agent:** Cody
- **What:** `--apply` vs LOCAL prodsnap only; re-run `audit-clone-member-coverage.ts` (expect 0
  not-on-canonical / 0 orphans); local render `/lineage/rigan-machado-lineage` — screenshots of
  timeline + canvas + Dirty Dozen group (Sr→Jr→Rigan roots, Erik/Rick under Rigan, ONE Erik).
- **Done means:** operator reviews screenshots + audit output → fork-h sign-off.
- **Depends on:** TASK_01.

#### SESSION_0508_TASK_03 — Prod read-only pre-flight (UN-GATED)

- **Agent:** Cody
- **What:** vs PROD via `--env-file=.env.prod` (read-only): both audit scripts + the script's
  `--dry-run`. Confirm prod matches prodsnap assumptions (4 VERIFIED edges, placeholder
  ref-count unchanged, canonical 77m/Rigan-sole-root, clones 15m/16m). Mandatory — prodsnap is
  pre-0457-stale.
- **Done means:** dry-run mutation table vs prod shown to operator; divergences surfaced BEFORE
  the gate.
- **Depends on:** TASK_01 (parallel-safe with TASK_02).

#### SESSION_0508_TASK_04 — GATED prod apply (operator "go" #1)

- **Agent:** Cody
- **What:** `--apply` vs prod (backup path echoed) → immediately re-run both audit scripts vs prod.
- **Done means:** coverage audit vs PROD: 4 founders `onCanonical:true`, 0 would-be-orphans;
  canonical 80 members; backup path recorded here.
- **Depends on:** TASK_02 sign-off + TASK_03 clean.

#### SESSION_0508_TASK_05 — GATED clone-tree retirement, WL-P2-21 (operator "go" #2)

- **Agent:** Cody
- **What:** `remove-residual-lineage-clones.ts` (per petey-plan-0457): `--dry-run` →
  refuse-if-any-lastPlacement + refuse-published guards → JSON backup → `--apply` deletes the 2
  unpublished clone trees.
- **Done means:** prod has zero `rigan-machado-bjj-lineage` trees; canonical untouched (in-tx
  assert); backup recorded.
- **Depends on:** TASK_04 verified.

#### SESSION_0508_TASK_06 — Doug verify

- **Agent:** Doug
- **What:** independent audit re-runs vs PROD; live `blackbeltlegacy.com/lineage/…` renders
  Sr → Jr → Rigan + exactly ONE Erik Paulson (curl SSR / isolated Playwright — browser-lock
  memory); privacy suites + gates green.
- **Done means:** evidence rows per check; "⚠ audit after --apply" satisfied twice.
- **Depends on:** TASK_05 (or TASK_04 if retirement deferred mid-flight).

#### SESSION_0508_TASK_07 — Ledger + docs close

- **Agent:** Cody
- **What:** D-034 → resolved; NEW renato-dup drift row; WL-P2-21 → fully resolved;
  `lineage-hub.md` wiring bullet refreshed; memory update
  (`lineage-branch-heads-and-tree-consolidation`); this session ledger.
- **Depends on:** TASK_06.

### Parallelism

TASK_02 ∥ TASK_03 (disjoint: local snapshot vs read-only prod). Everything else sequential.

### Open decisions

None — all 8 forks ratified (see Grill outcome). Two prod gates + push gate remain operator-held.

### Risks

- Prodsnap↔prod divergence (snapshot pre-dates 0457) — mitigated by mandatory TASK_03.
- Rehearsal render exposes a layout bug with the new 3-generation root chain → STOP, screenshot,
  back to Petey (scope guard; no silent UI fix).

### Scope guard

- No schema change / no migration files (data-only).
- No FI-001 send work.
- No canvas/timeline/drawer UI edits.
- No renato-magno dedupe (drift row only).
- No passport-merge machinery (Erik swap is a one-off scripted repoint).
- No seed-file edits.

## Pre-flight: Backend — migrate-founders-to-canonical.ts + remove-residual-lineage-clones.ts

### 1. Auth predicates planned

- N/A — operator-run prod-op scripts (not app surface); no session/action-client. Guards are
  data-level (published-tree protection, orphan refusal, in-tx asserts, JSON backup + rollback).

### 2. Existing script scan

- Prior art read in full: `scripts/remove-brian-clone-memberships.ts` (guards/backup/rollback +
  reads-outside-tx shape), `scripts/consolidate-rigan-machado-tree.ts` (atomic tree ops),
  `scripts/backfill-lineage-instructor-edges.ts` (dry-run table shape),
  `scripts/audit-clone-member-coverage.ts` (orphan test). `~/services/db` extended client used
  (same as prior prod-op scripts). `DIRTY_DOZEN_LABEL` imported from `~/lib/lineage/dirty-dozen`
  (drives claim-finalize lifetime-comp — never hardcode the label).
- Schema spot-check (read from `schema.prisma` directly): `LineageTreeMember.tree/node` onDelete
  **Cascade** (tree delete cascades members); `primaryVisualParent` SetNull; `visualGroup` SetNull;
  `LineageVisualGroup.parentMemberId` ↔ `member.visualGroupId` are a **circular FK pair** (rollback
  restores in two passes); `LineageNode.passport` Cascade; `DirectoryProfile.passportId` @unique
  Cascade; `LineageTree.defaultRootMemberId` is a bare column (no FK relation);
  `@@unique([treeId, nodeId])` on member (Erik nodeId repoint requires rich node absent from
  canonical — asserted).

### 3. Data flow reference

- Flow: lineage tree consolidation (ADR 0037 / petey-plan-0457 Slice A1); prodsnap grounding run
  read-only 2026-07-07 — canonical `bo0gn48s7ywk5e93pxqm6djp` 77m/Rigan sole root; clones BBL 16m /
  BASELINE 17m (prodsnap pre-0457-stale: Brian rows still present); all 4 founder VERIFIED edges
  confirmed; placeholder `erik-james-paulson` = 1 canonical member + 1 dup edge + profile, zero
  awards/claims/user; rich `erik-paulson` has NO DirectoryProfile → profile decision = REPOINT.
- Data delta vs plan (logged, fork f wins): clone rows put Erik/Rick in the "Coral Belt Ceremony —
  Apr 10, 2026" group; ratified fork f assigns them to the Dirty Dozen group on canonical.
- Data delta (retirement): BASELINE clone carries 1 PENDING `LineageClaimRequest`
  (`brian-scott` / mrbscott@gmail.com, 2026-06-12 — operator dev-era test claim). Cascade gated
  behind explicit `--cascade-claims` flag; row backed up.

### 4. FAILED_STEPS check

- FS-0024 (git guard) — no git mutations this task. Neon P2028 cold-start — generous
  maxWait/timeout on the one Serializable tx, all reads outside. `--env-file` REPLACES env —
  `import "dotenv/config"` first line (env-prod-overlay memory). No prod runs this task
  (rehearsal = local prodsnap only).

## Pre-flight: FI-003 — Approve lead into lineage (backend + UI)

### Backend — `approveLeadIntoLineage` server action

**1. Auth predicates planned**
- [x] Session auth required — via `adminActionClient` (extends `userActionClient` → `getServerSession`).
- [x] Brand column filtered (ADR 0004) — `ctx.brand = Brand.BBL`; lead read is `brand: BBL`.
- Authorization approach: reuse existing `adminActionClient` (admin role holds `*`, covers the
  `lineage.manage` grant, roles.ts:134). NO new authz system.

**2. Existing action scan**
- Consulted `server/admin/users/actions.ts` `createPerson` — the add-person tx + audit idiom to mirror.
- Reused primitives (do NOT reinvent): `createLineageMember` (`server/web/lineage/create-lineage-member.ts`),
  `materializeTrainedUnder` + `materializeVisualPlacement` (currently PRIVATE consts in
  `server/admin/lineage/claim-finalize.ts` — additively `export`ed, behavior unchanged),
  `ensurePassportForUser` (`server/identity/person-service.ts`).
- Lead read: `findLeadById` (`server/admin/leads/queries.ts`); meta parse:
  `parseLeadLineageMeta` (`server/admin/leads/lineage-selections.ts`).
- L1 pattern match: dirstarter action-client chain (`adminActionClient.inputSchema(...).action(...)`).

**3. Data flow reference**
- Flow: lineage claim materialization (ADR 0037 branch-head placement) — the SAME machinery a
  `PassportClaimRequest` approval runs, applied to a `Lead` (join-the-legacy) that has a real User.
- Lifecycle stage: post-registration lead → placed lineage member (Unverified).

**4. FAILED_STEPS check**
- FS-0024 (git guard) — no git mutations; `pwd`+remote verified (`ronin-dojo-baseline`).
- FS-0027 — `bun run test` (never bare `bun test fileA fileB`).
- `--env-file` REPLACES env (env-prod-overlay memory) — prod reads via `SKIP_ENV_VALIDATION=1
  bun --env-file=.env.prod`, READ-ONLY only, never a mutation.

**5. Key schema facts (read from source)**
- `LineageTreeMember @@unique([treeId, nodeId])`; `Passport.userId @unique`;
  `LineageNode.passportId @unique`. `materializeVisualPlacement`: instructor-not-a-member → student
  left at root (no invention). `materializeTrainedUnder` mints VERIFIED INSTRUCTOR_STUDENT edge; the
  member/node verification (`LineageNode.isVerified`) defaults false → Unverified (NOT flipped).

### UI — Approve control on `/app/leads/[id]`

- Existing scan: `Button` (`components/common/button`), sibling client surface
  `lead-status-actions.tsx` (`useAction` + `sonner`). Composition: new small
  `_components/lead-lineage-approve.tsx` mirroring it — NO new component family.
- Shown ONLY when `lead.source === "join-the-legacy"`, brand BBL, and
  `parseLeadLineageMeta(lead.meta).trainedUnderNodeId` present.

### FI-003 TASK_10 — prod ground truth (READ-ONLY, verified 2026-07-07)

Canonical tree `rigan-machado-lineage` = `bo0gn48s7ywk5e93pxqm6djp` (brand BBL). Placement table:

| student | email | User | Passport (empty) | node | trainedUnderNodeId | instructor member on canonical |
| --- | --- | --- | --- | --- | --- | --- |
| Thien Ta | thientd0501@icloud.com | `m5oabItMaXOUKBYzMyBu6WTYfC4GvFYL` | `iqr9xzv7o93zjrkxh2wc7g7t` (0 awards) | none | `uz6bv38prs7u35avccwuuowa` (Tony Hua) | `og4l2mlt90a3se9jeqwtbqhl` |
| David Lapetina | david.lapetina@gmail.com | `m9I2DTWNpczcgmBTFDQ2aNgSU8cdTMNI` | `q02lguzq86keutrt4zmq9azz` (0 awards) | none | Tony Hua | `og4l2mlt90a3se9jeqwtbqhl` |
| Phan Nguyễn | nguyenphan161195@gmail.com | `gDPgvexcOWRmsbKuXqpeqKFfEtFKSu3n` | `ok1ejb108cy380w0fypp5a9b` (0 awards) | none | Tony Hua | `og4l2mlt90a3se9jeqwtbqhl` |
| Đạt Nguyễn | datnt189@gmail.com | `y5b5mRLYEXLPYdIquxoQidQhhsRO1BGh` | `y4pxfia58picxq3rcdahjsz3` (0 awards) | none | Tony Hua | `og4l2mlt90a3se9jeqwtbqhl` |
| Jay Farrell | jay.farrell711@gmail.com | **MISSING** | **MISSING** | none | `cmq60xxjm00003sdseks0y4bl` (Brian Scott) | `g0ljc9g3t5i7bwyn8sertoey` |

Tony Hua member `og4l2mlt90a3se9jeqwtbqhl` (visualParent `nf4i2fdzt5t3nqfpqqyccun1`); Brian Scott member
`g0ljc9g3t5i7bwyn8sertoey` (visualParent `nf4i2fdzt5t3nqfpqqyccun1`). Both post-D-034 rows present.

**Findings (surfaced, not silently resolved):**
- **DIVERGENCE vs plan premise:** the plan says "All 5 have real Users + placeholder Passports."
  TRUE for 4/5. **Jay Farrell has NO User AND NO Passport** (no case variant, `convertedToUserId=null`).
  Design impact: the action handles TWO cases — (a) User exists → bind to its Passport
  (`ensurePassportForUser`); (b) NO User → mint an accountless placeholder Passport from the lead's
  name (mirrors `createPerson` / BBL-roster placeholder model), still rendered under Brian, Unverified,
  claimable later via magic-link. No new schema/authz. Narrow, additive — not a STOP-worthy contradiction.
- **`Lead.source` gotcha:** the `join-the-legacy` marker lives in `meta.source` (JSON path), NOT the
  `Lead.source` enum column (all 5 rows carry `source=WEBSITE`). The UI gate + action filter on
  `meta.source`, matching the existing `lead-country.ts` / `email/queries.ts` convention.
- **David pending-claim:** confirmed PENDING `PassportClaimRequest ic2ah7n0yn5u6xhmc7ze1jg2` on his OWN
  Passport `q02lguzq86keutrt4zmq9azz` (claimant = David's own User). Binding him to a lineage node does
  NOT touch this claim row (we don't attach/merge — his User already owns his Passport). Clean, no collision.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0508_TASK_01 | done | build migrate-founders-to-canonical.ts (+ remove-residual-lineage-clones.ts, WL-P2-21) — gates green, dry-run table exact |
| SESSION_0508_TASK_02 | done | prodsnap rehearsal + render proof — local applied snapshot renders Sr→Jr→Rigan, Erik/Rick under Rigan, ONE Erik (screenshot) |
| SESSION_0508_TASK_03 | done | prod read-only pre-flight — prod matched rehearsal exactly (canonical 77, clones 16+15, 4 founders orphan-risked, dry-run table identical) |
| SESSION_0508_TASK_04 | done | **PROD apply** — migration applied, canonical 77→80, root=Carlos Gracie Sr, one Erik; live render verified. Backup `/tmp/migrate-founders-backup-1783453504203.json` |
| SESSION_0508_TASK_05 | done | **PROD clone retirement (WL-P2-21)** — 2 clones deleted (31 members, 6 groups, 1 stale mrbscott claim cascaded per operator go), 0 orphans, canonical intact. Backup `/tmp/residual-lineage-clones-backup-1783453747508.json` |
| SESSION_0508_TASK_06 | pending | Doug verify (D-034) |
| SESSION_0508_TASK_07 | pending | ledger + docs close (D-034 → resolved, WL-P2-21 → resolved; new drift rows: renato-magno dup + erik-james-paulson stale directory slug) |
| SESSION_0508_P0 | done + SHIPPED | Baseline-domain leak (307) + claimed-node exclusion + /people 404 — commit `7d4cd5a4`, live on prod (verified) |
| SESSION_0508_CLEANUP | done | prod: deleted 2 dead pending-claims + 2 dup Phan leads (operator test leads untouched). Backup `/tmp/tony-hua-cleanup-backup-apply.json` |
| SESSION_0508_TASK_10–16 | in-progress | FI-003 instructor-anchor (derived model, no schema change, lead-detail surface) — Cody building through rehearsal; prod apply of the 5 placements gated |
| FI-003 TASK_10 | done | prod read-only ground truth confirmed — 4/5 have User+empty Passport, **Jay has NO User** (design: placeholder path); David pending-claim clean (no collision); `meta.source` gotcha logged |
| FI-003 TASK_11 | done | `approveLeadIntoLineage` action + `placeLeadIntoLineage` core + 4 unit tests (mid-tree anchor / idempotent / Unverified / placeholder / David-no-throw) — all green; `materializeTrainedUnder`+`materializeVisualPlacement` additively exported (claim-finalize 7/7 regression green) |
| FI-003 TASK_12 | done | `/app/leads/[id]` "Approve into lineage" button (`lead-lineage-approve.tsx` + `resolveApproveLeadIntoLineageTarget` gate) — shown only for eligible join-legacy leads; confirm dialog shows instructor + tree; ui-kit L1 only |
| FI-003 TASK_13 | done | LOCAL prodsnap rehearsal (all 5 placed): Thien/David/Phan/Đạt under Tony, Jay under Brian, all Unverified, Tony still under Bob Bass, one Erik; render proof captured (`lineage-fi003-branchheads.png`); idempotency proven (User-backed leads); **finding: no-User re-run mints duplicate placeholder — one-time prod apply is safe, deduped in rehearsal** |

## What landed

Session grew far past the planned D-034 lane — an operator-driven P0 (misrouted signups) preempted it, then cascaded into the identity/placement model and a governance insight.

- **P0 signup leak (SHIPPED `7d4cd5a4`, live):** `baselinemartialarts.com` (+ www) 307-redirects to `blackbeltlegacy.com` (`/api` excluded for Stripe webhooks); already-claimed nodes excluded from the join wizard list / submit action / pending-claim binding; dropped the fabricated `/people/<slug>` Tool URL (404).
- **Prod data cleanup:** deleted 2 dead `LineagePendingClaim` (phan+đạt → Tony's claimed node) + 2 duplicate Phan leads (ID-targeted; operator test leads untouched).
- **D-034 RESOLVED + WL-P2-21 RESOLVED (prod):** 4 founders migrated onto canonical (77→80, Carlos Sr root, Erik swap-in-place, 0 orphans); 2 unpublished clone trees retired. Erik directory slug `erik-james-paulson`→`erik-paulson`; `renato-magno-baptista` duplicate removed.
- **FI-003 (SHIPPED `97b78eb0`, live):** signups that name an instructor **auto-place** under them — **Unverified, never claimable**, bound to their account (accountless links on sign-in) — via one shared placement core; tree edge unified to **`INSTRUCTOR_STUDENT`** (fixed the latent admin-add-person invisible-to-genealogy bug); duplicate "Legacy Profile" Tool removed from signup. The **5 real people** placed on prod (Thien/David/Phan/Đạt under Tony, Jay under Brian).
- **Favicon fix (SHIPPED `7fc488c5`):** tab favicon + apple-touch-icon + og:image were routed through CloudFront (403 — assets only in `public/`); now served relative like the manifest.
- **AdminCollection design law CAPTURED** (memory `admin-collection-one-surface-law` + index) — the operator's 500-session north star.

## Decisions resolved

- **Verification model (SESSION_0474 reaffirmed, `bbl-verification-claim-display-model`):** membership is automatic; the ONE flag `node.isVerified` IS belt-rank verification (no second axis); verified is earned by a belt approval and **nothing else** (no standalone verify toggle); signups are never claims and never `isClaimable` (Claim = WP-import placeholder flow only).
- **Tree placement:** parent = **"listed under" = `INSTRUCTOR_STUDENT`** (exactly one); `PROMOTED_BY` = per-rank promoter (optional, many, lives with the rank). All three entry paths (signup / claim / admin add-person) write the same tree edge via one placement function.
- **Profile SoT:** ONE `PassportEditor` is the edit surface every Passport-fed surface reads from; the stray `LineageNode.bio` folds into `Passport.bio`; `User.name/image` are auth-only fallbacks. (Consolidation = next-session lane.)
- **AdminCollection law:** `/app/tools` is THE admin-collection template; every admin surface listing records = a conformed instance (columns + query, no hand-roll); tree = public-view-only; `/app/brand-settings` deleted (multi-brand dead); enforcement doc-sprawl collapses to one read-path law.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/next.config.ts` | Baseline→BBL 307 host redirect |
| `apps/web/server/web/lead/public-actions.ts` | claimed-node exclusion; drop Tool creation; auto-place signups |
| `apps/web/server/web/lineage/mint-claim-magic-link.ts` | pending-binding excludes claimed nodes |
| `apps/web/app/(web)/lineage/join/page.tsx` | wizard excludes claimed nodes |
| `apps/web/server/web/lineage/create-lineage-member.ts` | INSTRUCTOR_STUDENT tree edge + optional PROMOTED_BY, idempotent |
| `apps/web/server/admin/lineage/place-lead-core.ts` (+ `place-lead.ts`, `place-target.ts`, control, tests) | signup placement core (not-claimable, unverified) |
| `apps/web/app/layout.tsx` | favicon/apple-touch/og served relative, not CloudFront |
| `apps/web/scripts/{migrate-founders-to-canonical,remove-residual-lineage-clones,cleanup-tony-hua-signup-mess,fix-lineage-dedup-followups}.ts` | prod-op scripts (backup+rollback) |
| `docs/knowledge/wiki/drift-register.md`, `wiring-ledger.md` | D-034 → resolved, WL-P2-21 → clones removed |
| memory `admin-collection-one-surface-law.md` | the admin-surface law |

## Verification

| Command / smoke | Result |
| --- | --- |
| Baseline redirect live | `baselinemartialarts.com/lineage/join` → 307 → BBL ✓; `/api` passes through |
| D-034 prod coverage audit (post-apply) | 0 not-on-canonical, 0 would-be-orphans; canonical 80m, root Carlos Sr ✓ |
| Clone retirement (prod) | 0 `rigan-machado-bjj-lineage` trees; canonical intact ✓ |
| 5 placements (prod) | 4 under Tony, Jay under Brian; all `isClaimable=false`, `isVerified=false` ✓ |
| Erik/Renato dedup (prod) | `erik-paulson` profile resolves; one Renato on canonical ✓ |
| Gates | typecheck clean; FI-003 tests 20/20; oxlint/oxfmt clean |
| Favicon | fix pushed; post-deploy verify in progress |

## Open decisions / blockers

- None blocking. Admin add-person UI ("listed under" vs "promoted by" as two fields) deferred to the next-session admin lane; the data layer already supports it.

## Next session

### Goal

The **AdminCollection admin-surface lane** + the **profile-editor consolidation** — conform every admin collection surface to the `/app/tools` pattern and land one Passport editor everywhere.

### First task

Build the `AdminCollection` frame (columns + query → the full `/app/tools` data-table), conform `/app/users` into a real **member** table (belt, listed-under, verified, school — not the thin account list), delete `/app/brand-settings`, and de-sprawl the enforcement docs into the one read-path law. Then profile-editor **Slice A** (fold `LineageNode.bio` → `Passport.bio` + backfill). See memory `admin-collection-one-surface-law` + the Petey plans in this session's transcript.

## Review log

Session ran inline (lead) with dispatched sub-agents: Petey (D-034 plan, FI-003 plan, profile-consolidation plan), Cody (FI-003 build + correction + edge/Tool land), Giddy (entry-path + profile-surface audit). All builds gate-green and rehearsed on prodsnap before any gated prod apply.

## Hostile close review

- **Doug:** pass — every prod mutation rehearsed on prodsnap + render/coverage-verified, JSON-backup + rollback for each; the 5 placements verified (right instructor, not-claimable, unverified); favicon fix reasoned from the 403 + the 200 relative-path proof.
- **Giddy:** pass — the identity model was re-grounded in the ratified doc (not re-derived); placement unified to one edge/one core; the AdminCollection law captured rather than re-litigated. One debt: admin add-person UI split + profile-editor consolidation carried forward, not silently half-built.
- **Kaizen aggregate:** 9/10 — the miss was mine early (didn't ground in `bbl-verification-claim-display-model` / didn't know brand-settings was dead until the operator flagged both).

## ADR / ubiquitous-language check

- ADR update **recommended (next session):** the AdminCollection law + the "verified = belt approval only / membership is automatic" model both deserve ratified ADRs (currently canon lives in memory + SESSION_0474). Flag when the AdminCollection lane opens.
- Ubiquitous language: reaffirmed **"listed under" (INSTRUCTOR_STUDENT) vs "promoted by" (PROMOTED_BY)** as distinct; **membership** = app membership (automatic), not a verified state.

## Reflections

The session's real lesson was the operator's: the reason a rule doesn't stick across 500 sessions isn't that it's unwritten — it's that it's written *fifteen times in fifteen places*, so no agent reads the authoritative one. I re-derived the verification model instead of reading the ratified memory, and didn't recall that multi-brand was dead — both exactly the failure the operator was naming. The fix that matters most this session isn't code, it's the single `admin-collection-one-surface-law` capture + the mandate to de-sprawl.

The favicon bug was a clean example of "done" hiding a gap: SESSION_0505 genuinely shipped the PWA icons, so "icons done" read as true — but the *tab* favicon was a different mechanism routed through CloudFront where the files never existed. The operator's "why don't I see it" was worth more than any green checkmark.

## Full close evidence

| Step | Proof |
| --- | --- |
| Ledger cross-off | D-034 → RESOLVED (drift-register), WL-P2-21 → clones removed (wiring-ledger) |
| Prod mutations backed up | migrate/remove/cleanup/fix backups in `/tmp/*.json` |
| Gates | typecheck clean, FI-003 20/20, oxlint/oxfmt clean |
| Memory sweep | `admin-collection-one-surface-law` written + indexed |
| Hostile close review | Doug + Giddy pass (above) |
| Git hygiene | `7d4cd5a4` (P0) · `97b78eb0` (FI-003) · `02a844c5` (D-034 scripts+doc) · `7fc488c5` (favicon) — all pushed |
| Next session unblock | AdminCollection + profile-editor lane written above |
| Graphify update | run at close |
