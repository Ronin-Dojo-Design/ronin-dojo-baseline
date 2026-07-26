---
title: "SESSION 0535 — FI-028 community-posts freemium ladder (create gate + MAB action)"
slug: session-0535
type: session--implement
status: closed
created: 2026-07-13
updated: 2026-07-14
last_agent: claude-session-0535
sprint: S53
pairs_with:
  - docs/sprints/SESSION_0534.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0535 — FI-028 community-posts freemium ladder (create gate + MAB action)

## Date

2026-07-13

## Operator

Brian + claude-session-0535

## Goal

**FI-028 — the community-posts freemium participation ladder** (SESSION_0529 grill Q2/Q3, operator-ratified;
spec in `POST_LAUNCH_SOT.md` FI-028). Tighten community-post CREATE from "any signed-in member" to **Premium ∨
Elite ∨ Legend ∨ staff ∨ RBAC** via a new `canCreateCommunityPostForUser` (mirror `canCreateTechniqueForUser`
— no 5th authz), enforced at the SERVER/action (payload) layer with adversarial negative tests FIRST; free
members see an upgrade CTA where the composer was; restore 1-tap create for MAB holders via a member "post" MAB
action. **PLAN-FIRST** — grill the open forks (scope of read-gating, gate placement, entitlement-key breadth,
free-user experience, grandfathering) and get operator sign-off BEFORE any build.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0534.md` (FS-0031 seed-shape hardening + AdminCollection
  ecosystem drain; closed + pushed to `origin/main` @ `1b41fe80`, fully green).
- Carryover: SESSION_0534's `Next session` flagged FI-028 as the alternative lane needing its OWN grill. The
  AdminCollection ecosystem is drained; FI-028 is the operator's chosen lane for this session.

### Branch and worktree

- Branch: `session-0535-fi028`
- Worktree: `/Users/brianscott/dev/ronin-0535` (off `origin/main` @ `1b41fe80`)
- Status at bow-in: clean (fresh worktree; bootstrapped via `/worktree-setup` — copied `.env` + `bun install`
  [756 pkgs] + `prisma generate` → `.generated/prisma`).
- Current HEAD at bow-in: `1b41fe80`
- ⚠ CONCURRENCY: a sibling session (0536) runs RISK #2 (CSP/security headers) in `../ronin-0536` — disjoint
  from posts. If FI-028 needs middleware/security-header/`next.config` edits, STOP and coordinate. This lane
  stays in the posts/entitlements surfaces.

### Dirstarter alignment

| Field                       | Answer                                                                                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dirstarter baseline touched | Auth/authz (entitlement gating) — reuses the established tier/entitlement seam, no L1 baseline delta                                                                                               |
| Extension or replacement    | Extension: a new `canCreateCommunityPostForUser` composing the three existing authz seams (`can()` ∨ staff `Membership` ∨ lineage-tier entitlement), exactly mirroring `canCreateTechniqueForUser` |
| Why justified               | The participation ladder (Premium = community posting) is a ratified product decision; no new capability, no 5th authz system                                                                      |
| Risk if bypassed            | A UI-only gate leaves the server action open — any signed-in member could still POST via the action. Server/payload enforcement is the whole point                                                 |

Live docs checked during planning: SESSION_0534, `POST_LAUNCH_SOT.md` (FI-028 row), SESSION_0530 (FI-028
spec block), ADR 0046, memories `bbl-membership-tier-model-0472` / `profile-media-freemium-model-0525` /
`technique-authoring-ownership-adr-0046`.

### Graphify check

- Query: `graphify query "community post create composer entitlement premium gate CommunityPost /posts feed"`
  (canonical checkout — worktree graph is empty by design). Seed nodes → `create-community-post-dialog.tsx`,
  Petey Plan 0493 (community feed). Opened exactly: `server/web/community/{actions,schema,queries}.ts`,
  `components/web/community/{community-feed,create-community-post-dialog}.tsx`,
  `server/web/techniques/{permissions,technique-access}.ts`, `components/web/nav/mab-mount.ts`,
  `lib/entitlements/lineage-comp.ts`, `server/web/entitlements/lineage-tier-policy.ts`, `app/(web)/posts/page.tsx`,
  `.generated/prisma/models/CommunityPost.ts`.

### Grill outcome

- Grill presented to operator (see `## Petey plan → Open decisions`). **Build HELD pending operator answers.**

### Drift logged

- None new at bow-in. Pre-existing feed-dedup drift (D-035, D-037) is not a blocker for the create-gate lane.

## Petey plan

### Goal

Ship the community-posts CREATE gate (`canCreateCommunityPostForUser`, server-enforced) + composer upgrade-CTA

- member "post" MAB action, behavior-tightening (free members lose create), proven by adversarial negative
  tests at the action layer FIRST. Per-post READ freemium-gating is a scope FORK for the grill (see Open
  decisions Q1).

### Tasks

_Tasks are provisional pending the grill. The likely shape (if the grill resolves as recommended):_

#### SESSION_0535_TASK_01 — `canCreateCommunityPostForUser` + server-layer create gate + negative tests

- **Agent:** Cody (build + self-verify) → Doug (adversarial authz verify)
- **What:** new gate helper mirroring `canCreateTechniqueForUser`; wire into `createCommunityPost` +
  `uploadCommunityPostImage` actions; unit + e2e negative tests (free/anon cannot create) authored FIRST.
- **Done means:** a free-tier and an anon request to the create action are REJECTED server-side; a
  Premium/Elite/Legend/staff/admin request succeeds; tests green.

#### SESSION_0535_TASK_02 — Composer upgrade-CTA (free-user experience) + MAB member "post" action

- **Agent:** Cody (build) → Desi (UX) + Doug (verify)
- **What:** free signed-in members see an upgrade CTA instead of the composer form; add the member "post" MAB
  fan action (restores 1-tap create after the SESSION_0529 FAB de-collision), gated by the same predicate.
- **Done means:** free member sees CTA (no composer); Premium+ sees composer; MAB "post" action appears for
  create-capable viewers only; no double-FAB.

### Parallelism

Sequential: TASK_01 (the server gate + tests) FIRST — it is the security core and gates how TASK_02 is
verified. TASK_02 (UI/CTA/MAB) builds on the resolved predicate. Single coherent Cody per task; review wave
(Doug authz + Desi UX) after each. No fan-out (surfaces are contiguous).

### Agent assignments

| Task                 | Agent              | Rationale                                                                               |
| -------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| SESSION_0535_TASK_01 | Cody → Doug        | server-layer authz gate; verify demands adversarial negative tests (free/anon rejected) |
| SESSION_0535_TASK_02 | Cody → Desi + Doug | UX of the free-member CTA + the MAB action; parity + no-regression                      |

### Open decisions

**The grill — build HELD until the operator answers.** Recommendations grounded in code are in the bow-out
chat / the AskUserQuestion presented to the operator.

1. **[SCOPE] Read-gating in or out?** `CommunityPost` has NO `isPremium` field; the read path is public
   (`status:PUBLISHED` only). Per-post freemium READ-gating (locked-post display + per-post premium setter +
   no-leak payload) needs an additive migration + a product reason a post is "premium." **Recommend: SPLIT** —
   ship CREATE gate + MAB + CTA this session (no migration); defer READ-gating to FI-028b.
2. **[GATE PLACEMENT]** Enforce in the server action (`createCommunityPost` + `uploadCommunityPostImage`), not
   just the UI. **Recommend: server-action layer, negative tests FIRST** (operator directive).
3. **[ENTITLEMENT KEYS]** Paid Elite/Legend keys depend on `PricingPlan.entitlementGrants` config (not
   code-guaranteed to include `LINEAGE_PREMIUM`). **Recommend: gate on ANY lineage-tier key**
   (`LINEAGE_PREMIUM` ∨ `ELITE` ∨ `LEGEND`, reusing the tier-policy key set) — robust to plan config; not a
   single-key check.
4. **[FREE-USER UX]** What replaces the composer for free signed-in members. **Recommend: upgrade CTA in the
   dialog** (mirror the `LoginDialog` swap pattern already in the composer) pointing at the membership/upgrade
   funnel.
5. **[GRANDFATHERING]** Existing free-authored posts on downgrade. **Recommend: grandfather** — create-gate is
   forward-only; existing posts stay published, authors keep edit/delete of their own; no retroactive hide.
   (Prodsnap = 0 paid subs and few/zero community posts → near-zero real data impact.)

### Risks

- **UI-only-gate trap:** hiding the composer button without gating the action leaves the write open. Mitigated
  by TASK_01's server enforcement + adversarial tests as the FIRST deliverable.
- **Entitlement-key breadth:** a single-key (`PREMIUM`-only) check could wrongly deny a paid Elite whose plan
  grants only the `ELITE` key. Mitigated by the any-tier-key recommendation (Q3).
- **MAB fan geometry:** adding a 6th MAB action must respect the 90° quadrant cap + radius count-scaling
  (`shouldMountMab` invariants). Mitigated by reusing the existing fan-action pattern.

### Scope guard

- Behavior change is INTENTIONAL and singular: free members lose community-post CREATE. Everything else
  behavior-preserving. No god-component. No 5th authz — compose the existing seams.
- FI-001 / Brian Truelson email STAYS PARKED. `../ronin-dojo-monorepo` READ-ONLY. Hand-authored migrations
  only (relevant only if Q1 resolves read-gating IN). No middleware/security-header/`next.config` edits (0536's
  turf). No push/deploy without explicit operator "go" (build → verify → show → HOLD).

## Task log

| ID                   | Status | Summary                                                                                                                                                                                                                                                                     |
| -------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SESSION_0535_TASK_01 | landed | `canCreateCommunityPostForUser` (server core) + gate on BOTH `createCommunityPost` + `uploadCommunityPostImage` + negative tests (Cody `05bdbbef`). Doug GO 9.6 — free/anon rejected at payload layer PROVEN, any-tier-key breadth PROVEN, authorId session-derived PROVEN. |
| SESSION_0535_TASK_02 | landed | Composer 3-way swap (login/upgrade/form) via `canCreate` prop + MAB `post` rewire (`shouldMountMab` + `mobile-shell.permissions.post` → gate) (Cody `b7db6aab`). Desi PASS-with-fixes, Giddy PASS-with-notes (no ADR).                                                      |
| SESSION_0535_TASK_03 | landed | Review-wave batch-fix (`643b55d2`): Desi P1 (canCreate-aware empty state) + P2 (dialog dedup, i18n 4-type consistency, variant, "or higher") + Giddy docstring rewords. Delta re-verified green.                                                                            |

## What landed

- **TASK_01 — server CREATE gate (`05bdbbef`):** `server/web/community/permissions.ts#canCreateCommunityPostForUser`
  — mirrors `canCreateTechniqueForUser` (cache-wrapped, injectable db), gates on `can(posts.manage)` ∨
  **any lineage-tier entitlement** (`LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS`, not single-PREMIUM) ∨
  OWNER/INSTRUCTOR membership. Enforced in BOTH write actions after rate-limit, before any write/upload.
  9 gate-logic tests + 18 action-wiring tests (free/anon rejected, no row/upload; Elite-only-key allowed).
- **TASK_02 — UI/nav wiring (`b7db6aab`):** composer `canCreate` prop → 3-way swap (logged-out → LoginDialog,
  free → upgrade CTA → `/lineage/join`, capable → form); `shouldMountMab` + `mobile-shell.permissions.post`
  rewired to the gate so Premium-only members get the (pre-existing) MAB `post` action; feed FAB de-collides
  off the one `shouldMountMab` predicate (no double-FAB). Free entry points stay visible (funnel-first).
- **TASK_03 — review-wave polish (`643b55d2`):** empty feed is canCreate-aware; upgrade dialog deduped +
  parity variant; i18n 4-type consistency; permissions docstring overclaims corrected.

## Verification

| Command / check                                                           | Result                                                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `bun test server/web/community/permissions.test.ts` (single-file)         | **9/9** — free denied, Elite-only-key allowed, COACH denied, all legs                    |
| `bun test server/web/community/actions.safe-action.test.ts` (single-file) | **18/18** — free/anon rejected on both actions (no row/upload), authorId session-derived |
| `next build` (final diff, pre-push gate)                                  | **exit 0** — `/posts` + `/posts/[slug]` compiled, no `"use server"` warning              |
| `bunx tsc --noEmit` (touched files)                                       | clean (only fresh-worktree `PageProps` noise, clears under build — Doug confirmed)       |
| `bun run format:check` (repo-wide, 1923 files)                            | clean                                                                                    |
| `bunx oxlint` (touched files)                                             | clean                                                                                    |
| CI e2e blast radius                                                       | **ZERO** — the only e2e touching post-create (`mobile-shell.spec.ts`) self-skips in CI   |
| Doug adversarial verify                                                   | **GO 9.6/10** — non-bypass, breadth, grandfather/no-read-regression all PROVEN           |
| Giddy structure                                                           | PASS-with-notes — no 5th authz, no god-component, zero gate skew; **ADR not required**   |
| Desi UX                                                                   | PASS-with-fixes — all P1/P2 applied; brand parity with profile upgrade CTA confirmed     |

**Manual boundary (route to registry at close):** live `mobile-shell.spec.ts` run (elite two-action fan +
`/posts` single-FAB screenshots) — CI-skipped local aid; its FI-028 assertions statically verified against the
real i18n labels + Doug-traced sound. Deferred to a live-browser session (worktree can't `preview_start`; sibling
0536 may hold the browser MCP).

**CI on PR #203 (post-push):** ALL GREEN — Playwright chromium/firefox/webkit, Typecheck, Unit tests, Oxc,
Vercel preview deploy, CodeRabbit review (Description / Linked-Issues / Out-of-Scope all ✅, no inline
findings). `mergeStateStatus: CLEAN`, `MERGEABLE`. PR is READY (pending operator merge).

## Decisions resolved

- **Scope = CREATE-gate only** (grill Q1): shipped the gate + composer CTA + MAB rewire; NO migration, NO
  per-post READ-gating. Per-post premium READ (locked-post display + `CommunityPost.isPremium` + no-leak
  payload) deferred to **FI-028b**.
- **Entitlement keys = ANY lineage tier** (grill Q2): gate checks `LINEAGE_LISTING_TIER_ENTITLEMENT_KEYS`
  (PREMIUM ∨ ELITE ∨ LEGEND), not a single PREMIUM key — robust to `PricingPlan.entitlementGrants` config
  (paid Elite/Legend keys aren't code-guaranteed to carry PREMIUM). Proven by the Elite-only-key test.
- **Free-user UX = dialog upgrade CTA** (grill Q3): entry points stay visible (funnel-first); the composer
  dialog swaps to an upgrade panel → `/lineage/join` (the existing paid funnel, byte-parity with the profile
  upgrade CTA).
- **Grandfather = forward-only** (grill Q4): gate blocks NEW creation only; existing posts stay published,
  authors keep edit/delete; no read-path change.
- **Gate placement = server action layer** (operator directive): enforced in `createCommunityPost` +
  `uploadCommunityPostImage`, adversarial negative tests FIRST.

## Files touched

| File                                                                 | Change                                                                                  |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/web/server/web/community/permissions.ts`                       | NEW `canCreateCommunityPostForUser` (mirrors `canCreateTechniqueForUser`; any-tier-key) |
| `apps/web/server/web/community/actions.ts`                           | gate enforced on `createCommunityPost` + `uploadCommunityPostImage` (before write)      |
| `apps/web/server/web/community/permissions.test.ts`                  | NEW — 9 hermetic gate-logic tests (breadth + all legs)                                  |
| `apps/web/server/web/community/actions.safe-action.test.ts`          | +gate mock + 4 wiring tests (free/anon rejected)                                        |
| `apps/web/components/web/community/create-community-post-dialog.tsx` | `canCreate` prop → 3-way swap (login/upgrade/form)                                      |
| `apps/web/components/web/community/community-feed.tsx`               | thread `viewer.canCreate`; canCreate-aware empty state                                  |
| `apps/web/app/(web)/posts/page.tsx`                                  | server-resolve `canCreate` → feed                                                       |
| `apps/web/components/web/nav/mab-mount.ts`                           | `shouldMountMab` also mounts post-capable members                                       |
| `apps/web/components/web/nav/mobile-shell.tsx`                       | `permissions.post` → the gate (was admin-only); comment fix                             |
| `apps/web/components/web/nav/mab.tsx`                                | pass `canCreate={permissions.post}`; refreshed stale comments                           |
| `apps/web/e2e/mobile-shell.spec.ts`                                  | elite test → two-action fan (post + technique)                                          |
| `apps/web/messages/en/community.json`                                | upgrade CTA + `no_posts_upgrade` keys                                                   |

## Review log

### SESSION_0535_REVIEW_01 — FI-028 create gate (review wave + quality passes)

- **Reviewed:** the full branch diff (`origin/main..HEAD`).
- **Doug (adversarial authz):** GO **9.6/10** — free/anon non-bypass on both actions PROVEN, any-tier-key
  breadth PROVEN, grandfather/no-read-regression PROVEN, `next build` green.
- **Giddy (structure):** PASS — no 5th authz, no god-component, zero gate skew across 4 surfaces. **ADR not
  required.**
- **Desi (UX):** PASS-with-fixes (applied) — brand parity with the profile upgrade CTA confirmed.
- **Fresh correctness finder (fallow-loop review phase):** CLEAN — no correctness/security findings; 1 stale
  comment (fixed), 1 test-coverage follow-up (ledgered).
- **code-quality-matrix:** Class B, **Composite 8.9/10 (Strong)** — D1 9 · D2 9 · D3 8.5 · D4 9 · D5 9 · D6 9
  · D7 9; no cap binds. Gap to gold = the deferred DRY convergence (WL follow-ups). (`code-quality-matrix §2/§4`)
- **CodeRabbit (CI):** pass — no inline findings.

## Hostile close review

- **Giddy:** pass — the gate composes the three existing seams (no 5th authz); `AccountActionItems`-style
  route-local shape; `shouldMountMab` stays the ONE predicate. No structural drift.
- **Doug:** pass (GO 9.6) — server-layer non-bypass proven on both write actions; read path/schema untouched;
  CI green across 3 browsers.
- **Desi:** pass — upgrade CTA reuses L1 primitives byte-for-byte with the profile precedent; no double-FAB.
- **Kaizen aggregate:** 9.2/10 — a disciplined, adversarially-proven security tightening; the only debt is the
  named DRY convergence, explicitly deferred with reason.

## ADR / ubiquitous-language check

- **ADR not required** (Giddy-confirmed) — operates under the ratified SESSION_0529 participation ladder + ADR
  0046's `canCreateTechniqueForUser` mirror pattern + the D13 tier/entitlement model. No new architectural
  decision.
- **Ubiquitous-language:** the `canCreate<X>ForUser` capability-gate convention (post-capable / technique-capable)
  is worth naming; new gate recorded in `custom-component-inventory.md`.

## Reflections — kaizen

- **The mirror pattern collapsed the build.** FI-028 read as "build a freemium system," but the honest
  discovery was that `canCreateTechniqueForUser` + the tier policy + the MAB `post` slot already existed — the
  work was a gate + wiring, not greenfield. Verify-don't-assert shrank a session-sized feature to a 4-file core.
- **The Q2 entitlement-key breadth caught a latent landmine.** The obvious gate (`hasEntitlement(PREMIUM)`)
  would have silently denied a future paid Elite whose plan didn't also write the PREMIUM key. Reading the
  Stripe webhook (keys come from `PricingPlan.entitlementGrants`, DB-configured) turned a one-line gate into a
  correct one. The Elite-only-key test encodes it so a regression can't slip back.
- **The FS-0027 mock.module leak bit me exactly as documented.** Running the two community test files as one
  bare `bun test` false-failed (`COACH returns true`) — the gate mock from the action test bled into the
  permissions test. Single-file runs (as Doug did) are green. The SOP is right; I re-learned it live.
- **Restraint held on the DRY convergence.** The `hasAnyActiveEntitlement` extraction touches the shared
  tier-policy module (gates profile rendering app-wide); Giddy flagged it defer-worthy, and chasing it in an
  autonomous overnight run right before a push would have widened blast radius for a cosmetic score bump. Named
  it, ledgered it, left it.

## Full close evidence

| Step                 | Proof                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Gate runner          | fallow delta **0 introduced**; graphify 13217 nodes; tree clean; task-log 5 rows PASS                                             |
| Build gate           | `next build` **exit 0** on the real 13-file diff (runner's "docs-only/skipped" is the known working-tree under-report) + CI green |
| Reflections          | yes — 4 (mirror-collapses-build, Q2-breadth-landmine, FS-0027-relearned, DRY-restraint)                                           |
| Hostile close review | Giddy pass · Doug pass (GO 9.6) · Desi pass · correctness finder clean — Kaizen 9.2                                               |
| Code-quality gate    | Class B **8.9/10 Strong** (`code-quality-matrix`)                                                                                 |
| Runtime verification | unit 9/9 + 18/18; CI Playwright ×3 browsers green; live mobile-shell e2e = manual boundary (CI-skipped)                           |
| ADR check            | not required (Giddy)                                                                                                              |
| Memory sweep         | FI-028 create-gate pattern captured (see MEMORY)                                                                                  |
| New component        | `canCreateCommunityPostForUser` → `custom-component-inventory.md`                                                                 |
| Finding router       | FI-028 → POST_LAUNCH_SOT LANDED; 3 follow-ups → wiring-ledger (WL)                                                                |
| Graphify             | updated by gate runner (13217/29589/1394)                                                                                         |
| Git hygiene          | 6 commits on `session-0535-fi028`; PR #203 open + CI green; **not merged** (operator-gated)                                       |
| PR                   | [#203](https://github.com/Ronin-Dojo-Design/ronin-dojo-baseline/pull/203) — READY (pending operator merge)                        |

## Next session

### Goal

Operator's call. Candidates: **FI-028b** (per-post READ freemium: `CommunityPost.isPremium` migration +
locked-post display + no-leak payload — the deferred half of FI-028); or the top board item (**RISK #2** global
security headers/CSP if the sibling 0536 didn't land it; **G-002** per-product DB separation). FI-001 / Brian
Truelson email STAYS PARKED.

### First task

Merge PR #203 (operator review), then pick: if FI-028b, grill the per-post premium setter + locked-post display
(teaser vs full-hide) + the no-leak payload discipline (mirror `technique-media-gate.ts`). Otherwise the top
non-parked board card (`cd apps/web && bun scripts/board-backlog.ts --top=10`).
