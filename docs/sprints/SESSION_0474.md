---
title: "SESSION 0474 — S2: BBL free-tier render + avatar + rate-limit (parallel track B)"
slug: session-0474
type: session--implement
status: closed
created: 2026-06-29
updated: 2026-06-30
last_agent: claude-session-0474
sprint: S49
pairs_with:
  - docs/sprints/SESSION_0472.md
  - docs/sprints/SESSION_0473.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0474 — S2: BBL free-tier render + avatar + rate-limit (parallel track B)

> **⚠️ POST-SESSION CORRECTION (in-session grill).** The `## What landed` / `Decisions` below describe a
> **prefer-verified resolver + a per-award "Unverified" belt badge** keyed off `RankAward.verificationStatus`.
> An operator grill (this session) **reverted that approach** — it contradicted **ADR 0035 §5** (which marks
> `RankAward.verificationStatus` *vestigial, never displayed*) and showed founders (Rigan Machado, Brian Scott)
> as both Verified **and** Unverified. The **shipped model**: belt = highest *awarded* rank by sortOrder
> (`memberTopRank`); verification = the single `node.isVerified` axis (binary Verified/Unverified); Claimable
> removed from the tree (drawer + directory only). Also fixed a pre-existing regression — the honor strip +
> canvas branch read the deprecated `selectedRank` (stale WP-import), mis-ranking Meyer/Casey. Canonical model:
> the [[bbl-verification-claim-display-model]] memory + ADR 0035. The consolidation (one `resolveLineageMemberView`
> resolver, `initials` 4→1) **stands**. TASK_01 (avatar) + TASK_03 (rate-limit) **stand**.

> **PRE-STAGED at SESSION_0472 close.** This is **build slice S2** of the ratified BBL membership epic
> (SESSION_0472 build-sequencing block). It is the **head of parallel track B** (the verification on-ramp) and
> can run **concurrently with SESSION_0473 (S1)** in its own worktree — disjoint files. It unblocks **S3**
> (fresh-member rank-submission door), which renders the pending nodes this slice introduces.

## Date

2026-06-29 (pre-staged; executes next)

## Operator

Brian + claude-session-0474

## Goal

Give the **free tier** its immediate value (D472-15): a free member uploads an **avatar**, declares a
**self-reported belt** (shown with an `unverified` badge), and is **listed under their instructor** — gated
against abuse by an **IP-keyed `avatar_upload` rate-limit** bucket. Lays the render groundwork the
verification on-ramp (S3–S5) builds on.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0472.md` — read **D472-8** (rate-limit reuse) + **D472-15**
  (free-tier value + unverified-belt display) + the **Build sequencing** block.
- Carryover: SESSION_0472 ratified that verification is open to all and free members get immediate value
  (avatar + self-belt + listing). This slice implements the free-tier render + the avatar abuse-control.

### Branch and worktree

- Branch: `session-0474-free-render` (own worktree — parallel-dispatch; run `/worktree-setup` first if fresh)
- Worktree: `../ronin-0474` (or main if run solo)
- Status at bow-in: TBD (verify clean at pickup)

## Petey plan

### Goal

Free-tier render policy (avatar + self-belt + listing) + the `avatar_upload` IP rate-limit, verified on the live DOM.

### Tasks

#### SESSION_0474_TASK_01 — Free-tier render policy: avatar + self-declared belt + listing

- **Agent:** Cody
- **What:** Update the lineage render read-model so the **free** tier renders an **avatar** (today
  `FREE_LINEAGE_LISTING_RENDER_POLICY` has `avatar: false`) and the person stays **listed under their
  instructor**. The full profile (bio/links/rank history/QR/video/cert) stays Premium+.
- **Done means:** a free member shows avatar + name + belt + listing on the card/tree; premium gate unchanged; policy unit tests updated.
- **Depends on:** nothing.

#### SESSION_0474_TASK_02 — Unverified-belt display

- **Agent:** Cody
- **What:** A self-declared belt is `STATED`/`UNVERIFIED`; current-rank display today = highest **VERIFIED**
  award, so an unverified self-belt wouldn't render. Show the highest `STATED` award with an **unverified
  trust badge** when no verified award exists (reuse the existing trust-badge component).
- **Done means:** a free member with only a self-declared belt shows that belt + an `unverified` badge; a verified member is unchanged.
- **Depends on:** TASK_01.

#### SESSION_0474_TASK_03 — `avatar_upload` IP rate-limit bucket

- **Agent:** Cody
- **What:** Add an `avatar_upload` bucket to `lib/rate-limiter.ts` — mirror `evidence_upload` (public,
  **IP-keyed**, fail-closed; e.g. ~10/hour per IP). Call `isRateLimited(await getIP(), "avatar_upload")` in the
  free-avatar upload action.
- **Done means:** free avatar upload is IP-rate-limited; `shouldFailClosed("avatar_upload")` returns true; unit test.
- **Depends on:** TASK_01.

### Reuse targets (files)

- `apps/web/lib/entitlements/lineage-tier-policy.ts` — `FREE_LINEAGE_LISTING_RENDER_POLICY` (flip `avatar` on)
- `apps/web/lib/rate-limiter.ts` — add the `avatar_upload` bucket + `FAIL_CLOSED_BUCKETS` (mirror `evidence_upload`)
- the trust-badge resolver/component (BBL-PROFILE-004) — for the unverified badge
- `apps/web/lib/lineage/rank-progression.ts` — rank display (highest STATED fallback)

### Scope guard

- Don't gate verification behind payment — verification is **open to anyone** (D472-15); this slice only renders
  the unverified state. The actual submission flow is **S3** (next slice).
- Don't touch tiers/Stripe (that's S1 / SESSION_0473) or the Instructor Hub (S6+).

## Cody pre-flight

<!-- Run cody-preflight before code. Prior art: SESSION_0445 `evidence_upload` (the IP-rate-limit pattern to mirror). -->

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0474_TASK_01 | done | Free render policy: avatar flip (`?view=board` cards) + self-belt + listing |
| SESSION_0474_TASK_02 | done | Rank/verification display — SHIPPED: highest-awarded rank + single `node.isVerified` axis via one `resolveLineageMemberView` resolver (prefer-verified approach reverted per ADR 0035 grill); fixed Meyer/Casey `selectedRank` regression |
| SESSION_0474_TASK_03 | done | `avatar_upload` IP rate-limit bucket (fail-closed) wired into the avatar action |

## What landed

S2 render groundwork for the verification on-ramp, built reuse-first (no new components).
**Petey grilled one open fork before build** — how a self-declared belt is modeled/rendered
(D472-15 wants it visible on submit, ADR 0035 mints the award only on approve). Operator
ratified **Option A**: a self-declared belt is a `RankAward{source: STATED, verificationStatus:
UNVERIFIED}` minted on submit (flips → VERIFIED on approve — a mint-early/verify-late amendment to
ADR 0035, ADR pass deferred to S3/S4); the listing display reads `rankAwardsEarned` with a
**prefer-verified** rule.

- **TASK_01** — flipped `FREE_LINEAGE_LISTING_RENDER_POLICY.features.avatar → true` (school /
  honor-strip avatar stay Premium+). This gates the `?view=board` surfaces (root `LineageNodeCard`
  + compact child rows + mobile list). **Finding:** the *default* public view is the View A timeline
  (`?view=board` is the fallback), and View A does **not** consume the listing policy — it already
  shows avatars to free/anonymous viewers. So free-tier avatar value was already live on the default
  view; this flip brings the board cards into parity.
- **TASK_02** — new `memberShownRankAward` / `memberRankIsUnverified` in `canvas-model.ts`: shown
  belt = highest **VERIFIED/IMPORTED** award, else the highest award overall (a STATED/UNVERIFIED
  self-belt) flagged unverified. **Universal** — View A timeline, board (root + compact rows), and
  mobile all read belt via these, so an unverified self-promotion can never mask a verified rank
  (closes the SESSION_0430 founders-mis-rank class at the source). Payload drops `take: 1` and adds
  `verificationStatus` so the resolver can see >1 award. The explicit belt-level "Unverified" badge
  (reuses `LineageTrustBadge`) renders on the root `LineageNodeCard`; the existing **node** trust
  badge already shows "Unverified" for fresh members on View A / mobile / the root card.
- **TASK_03** — `avatar_upload` bucket (10/h per IP, fail-closed) mirroring `evidence_upload`; called
  at the top of `uploadAndPromotePassportAvatar` (before the passport lookup / R2 write).

## Decisions resolved

- **D474-1 — Self-declared belt = a STATED/UNVERIFIED `RankAward` (operator-ratified Option A).**
  Minted on submit (S3), flips UNVERIFIED→VERIFIED on approve (S4) — mint-early/verify-late, a small
  ADR 0035 amendment (full ADR pass at S3/S4). Display reads `rankAwardsEarned` (keeps the SESSION_0430
  `selectedRankAward` display-decoupling intact); `selectedRankAward` stays the pending-claim pointer.
- **D474-2 — Prefer-verified is the display rule, not a query filter.** Resolved in `canvas-model.ts`
  (JS), not Prisma orderBy (the enum can't express verified-first cleanly). Trusted = VERIFIED or
  IMPORTED; UNVERIFIED/DISPUTED → unverified.
- **D474-3 — Scope boundary:** prefer-verified is universal via `canvas-model`; the *explicit*
  belt-level badge currently lands on the root `LineageNodeCard` only. Compact descendant rows render
  no verification badge (pre-existing); View A / mobile convey unverified via the node trust badge.
  Per-surface explicit belt badges deferred to S3 (revisit with real fresh-member data) — no masking
  is possible today since all awards are VERIFIED/IMPORTED.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/lib/entitlements/lineage-tier-policy.ts` | Free listing policy `avatar: false → true` (TASK_01) |
| `apps/web/lib/entitlements/lineage-tier-policy.test.ts` | Assert free avatar true; school/honor-strip stay false |
| `apps/web/lib/rate-limiter.ts` | +`avatar_upload` bucket (10/h IP) + `FAIL_CLOSED_BUCKETS` entry (TASK_03) |
| `apps/web/lib/rate-limiter.test.ts` | `avatar_upload` in the fail-closed classification |
| `apps/web/server/web/actions/passport-avatar.ts` | IP rate-limit gate before lookup/upload |
| `apps/web/server/web/actions/passport-avatar.safe-action.test.ts` | +rate-limited-path test (blocks before upload) |
| `apps/web/lib/test/safe-action-env.ts` | Shared mock now exports `getIP` (faithful IP for IP-keyed actions) |
| `apps/web/server/web/lineage/payloads.ts` | `rankAwardsEarned`: +`verificationStatus`, drop `take: 1` |
| `apps/web/lib/lineage/canvas-model.ts` | +`memberShownRankAward`/`memberRankIsUnverified` (prefer-verified); belt/label route through them |
| `apps/web/lib/lineage/canvas-model.test.ts` | +5 prefer-verified cases; rich fixture gains `verificationStatus` |
| `apps/web/components/web/lineage/lineage-node-card.tsx` | Root card: belt-level "Unverified" badge (de-duped vs node badge) |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run test` (4 touched files, `--parallel=1`) | **31 pass / 0 fail** (62 expect) |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | clean |
| `oxlint` (touched files) | exit 0 |
| `oxfmt --check` (11 touched files) | all correctly formatted |
| `bun run build` (`next build`) | succeeded (sitemap post-step ran) |
| Live SSR — `?view=board` (anonymous = free) | avatars now render on board cards (TASK_01); 77 verified members show no spurious "Unverified" |
| Live SSR — View A default tree | 200; belts + R2 avatars render; prefer-verified change = no regression (0 spurious unverified across 77) |
| Live positive proof (flip 1 award → UNVERIFIED, revert) | root-card belt path + prefer-verified resolver exercised on real data; reverted to IMPORTED |
| Prefer-verified safety (unit) | unverified self-promotion (higher belt) does NOT mask a VERIFIED lower belt |

## Open decisions / blockers

- None at plan-lock. Self-contained; no operator input required to start (browser-proof on `bbl.local`).

> **What ACTUALLY shipped (post-grill, supersedes `What landed` / `Decisions` above — see the header banner):**
> belt = highest **awarded** rank by `Rank.sortOrder` (`memberTopRank`); ONE verification axis `node.isVerified`
> (binary); `RankAward.verificationStatus` vestigial; Claimable removed from tree/board/cards; one
> `resolveLineageMemberView` resolver every surface reads; honor strip + canvas branch repointed off `selectedRank`
> (fixes Meyer/Casey). Pushed (`eb963036`), prod deploy SUCCESS + smoke-verified live. Canon: ADR 0035 +
> [[bbl-verification-claim-display-model]] + [`learning-record-0008`](../learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md).

## Next session

### Goal

The lineage rank-display refinement + cleanup: **(1)** make the shown rank **discipline-scoped** — BBL tree/board/cards
show the **BJJ** rank (the tree's own discipline), NOT "highest awarded by sortOrder" (meaningless across rank
systems — ADR 0035 known limitation); drawer + directory show the member's *other* discipline ranks. **(2)** Remove
the YAGNI `selectedRank`/`LineageTreeMember.rankAwardId` (~38 files + Prisma migration; repoint live uses to
awarded-truth, delete the admin dropdown + dead plumbing). **(3)** Apply the lineage doc consolidation (survey list below).

### Inputs to read

- [[lineage-rank-display-and-selectedrank-removal]] (the full plan) · ADR 0035 · `human-code-runbook` §8 (the read-model).
- The doc-consolidation survey (this session): `lineage-hub.md` mental model, `lineage-listing-runbook.md` §trust-badges,
  `lineage-rank-promotion-sync-rules.md`, `directory-page.md`, `sop-e2e-user-lifecycle.md` §5/§15 (rank on-ramp) still
  describe pre-0474 behavior; `architecture/lineage/SESSION_0263_*` are `_archive/` candidates (hub already flags them).

### First task

`selectedRank` removal — schema migration first (drop `rankAwardId` + relation + `@@index`), then repoint the live
non-display uses (`to-lineage-visual` promotionDate, `bbl-galaxy-from-lineage`, `students-carousel`, `deriveDrawerProfileView`
panel rank, the public node-edit form's promotion-date) to the top **awarded** award, then delete the admin "Selected rank"
dropdown + the `SelectedRank`/`CanvasMember.selectedRank` plumbing. Then the discipline-scoped resolver.

## Review log

### SESSION_0474_REVIEW_01 — S2 render slice → display-model unification + correction

- **Reviewed tasks:** TASK_01 (free avatar — done), TASK_02 (rank/verification display — done, but the *approach*
  reverted mid-session, see below), TASK_03 (avatar_upload rate-limit — done).
- **Verdict:** the slice grew, correctly, into the session that gave the lineage display its real shape. TASK_02 was
  built twice: first as a per-award `RankAward.verificationStatus` "prefer-verified" resolver + belt badge (D474-1..3),
  then **reverted** after the operator's grill showed it contradicted ADR 0035 §5 (per-award verification is vestigial)
  and made founders show "Verified AND Unverified." Shipped model = the ADR 0035 canon: highest **awarded** rank +
  single `node.isVerified` axis, via ONE `resolveLineageMemberView` resolver. Also fixed a **pre-existing** regression
  (honor strip + canvas branch read the stale `selectedRank` → Meyer/Casey mis-ranked) and consolidated `initials` 4→1.
- **Score:** 8/10 — strong consolidation + a real prod bug fixed, verify-don't-assert discipline (live smoke + e2e
  guard). −2 because I shipped a wrong second-verification-axis mid-session that the grill (not my own check) caught;
  the lesson is [`learning-record-0008`](../learning/ddd/learning-records/0008-one-source-read-everywhere-and-the-display-dead-field.md).
- **Follow-up:** `selectedRank` removal + discipline-scoped rank → next session (memory staged); 6 lineage docs to
  update + 2 to archive (survey); 1 pre-existing unrelated e2e failure (`admin/membership-detail` 404) flagged, not fixed.

## Hostile close review

- **Giddy:** pass — the shipped state is one resolver read everywhere (DRY), ADR-0035-aligned after the revert, no new
  authz axis (the second verification axis was *removed*). The self-inflicted second-source-of-truth is the session's
  real finding, owned in LR 0008. Doc consolidation routed (survey), not silently dropped.
- **Doug:** pass — prod deploy SUCCESS + **smoke-verified on blackbeltlegacy.com** (Meyer renders Coral 7th live, no
  error); lineage e2e **12/12** + a new awarded-truth-vs-selectedRank + no-Claimable-on-board guard; admin regression
  sweep = 0 regressions; `next build` green. The one red e2e (`admin/membership-detail` 404) is pre-existing/unrelated.
- **Desi:** pass — consistency is now structural (every surface = `resolveLineageMemberView`); Claimable correctly
  scoped to drawer + directory; the cinematic timeline keeps its idiom while sharing the data rule.
- **Kaizen aggregate:** 8/10 — the ding is the mid-session wrong-model that the grill caught, not a shipped defect.

## ADR / ubiquitous-language check

- **No new ADR** — the model **reverted onto ADR 0035** (rank display = awarded truth; `node.isVerified` the single
  axis; `RankAward.verificationStatus` vestigial). A *mint-early/verify-late* amendment (self-declared belt on the
  S3 on-ramp) is deferred for a formal ADR pass at S3/S4 — the single point all the rank docs should then cite.
- **Ubiquitous language updated** — the `LineageVerificationStatus` entry was **backwards** ("`isVerified` should be
  replaced by `verificationStatus`") and is being corrected this close (`node.isVerified` = canonical display axis).
- **Deprecation logged** — `selectedRank`/`selectedRankAward` is display-dead; full removal staged for next session.

## Reflections

- **Consistency is one source read everywhere, not N surfaces kept in sync.** The Meyer/Casey bug + my self-inflicted
  double-badge are the *same* bug: two surfaces reading two fields for one record. The fix and the prevention are both
  "one resolver." (Full lesson: LR 0008.)
- **A partial migration off a deprecated field is the bug's nest.** ADR 0035 fixed the cards but left two surfaces on
  `selectedRank` — a 44-session-old loaded gun. Finish the sweep, or the divergence survives.
- **"Display-dead" ≠ "cheap to remove."** `selectedRank` looked like a dead FK; it was 38 files (live promotionDate,
  edit-form, galaxy tendrils). Map the footprint before estimating; split schema-touching cleanup out of a verified push.
- **The grill is load-bearing.** Three operator grills this session each *shrank* the build and corrected a wrong
  assumption I'd have shipped (verification = rank-not-node; selectedRank = YAGNI; BJJ-scoped not highest-awarded).

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `human-code-runbook` (updated→0630, +pairs_with ADR0035/lineage-data-wiring); LR 0008 created; 4 lineage docs corrected (agent) + frontmatter bumped; `SESSION_0474` status→closed |
| Backlinks/index sweep | LR 0008 ↔ ADR0035/LR0007/human-code-runbook; wiki index session row added; bbl page-specs moved + 14 links repointed |
| Wiki lint | `bun run wiki:lint` — **0 errors** (~18 warnings, cosmetic frontmatter — pre-existing + 3 from the fold) |
| Kaizen reflection | `## Reflections` present (4) + `learning-record-0008` |
| Hostile close review | SESSION_0474_REVIEW_01 + Giddy/Doug/Desi pass (8/10) |
| Code-quality gate | shipped code is reuse-first (one resolver + helpers); no new Class-A god-module — `LineageNodeCard` *shrank* 129→102 |
| Runtime verification (Doug) | prod smoke (Meyer Coral 7th live) + lineage e2e 12/12 + new guard + admin 0-regression sweep |
| Review & Recommend | next session written (selectedRank removal + discipline-scoped rank + doc consolidation); memory staged |
| Memory sweep | 2 memories: `bbl-verification-claim-display-model`, `lineage-rank-display-and-selectedrank-removal` |
| Next session unblock check | unblocked — selectedRank removal is self-contained (footprint mapped); no operator input needed |
| Git hygiene | `main`; code push `eb963036` (deploy SUCCESS); docs close = single docs-only commit, hash reported at bow-out / see git log |
| Graphify update | run before the close commit — count reported in chat / see SESSION graphify line |
