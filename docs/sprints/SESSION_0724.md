---
title: "SESSION 0724 — verification-status badge on public profile rank rows"
slug: session-0724
type: session--implement
status: in-progress
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0724
sprint: S13
lane: bbl
lane_seq:
recipe: "seq-lane-build"
goal_ids: []
tickets: ["BBL-RANK-001", "WL-P2-47"]
next_session:
pairs_with:
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0724 — verification-status badge on public profile rank rows

**Date:** 2026-07-30 · **Operator:** Brian + claude-session-0724

## Goal

Render the per-rank verification-status badge (`RankEntry.status`) on public profile-detail rank
rows at `/directory/[slug]` (BBL-RANK-001 / WL-P2-47). LANE A of a dispatched build (one repo,
one worktree, ADR 0059).

## Status

Frontmatter `status:` is the single source of truth (SESSION_0342). Do not restate it here.

## Bow-in

- Dispatched directly (single-lane build, spec fully pre-specified by the dispatch prompt — no
  separate Petey plan needed).
- Worktree: `/Users/brianscott/dev/bbl-0724` on branch `auto/session-0724-rank-status-badge`, cut
  from `origin/main`, already bootstrapped (node_modules, `apps/web/.env`, Prisma client, githooks).
  FS-0024 guard run first: `pwd` = worktree path, `git remote -v` =
  `Ronin-Dojo-Design/black-belt-legacy` (fetch+push). Confirmed BEFORE any mutating git.
- Owned-file contract (dispatch-pinned), WRITE ONLY:
  - `apps/web/server/web/passport/public-projection.ts`
  - `apps/web/app/(web)/directory/[slug]/_components/directory-profile/ranks-section.tsx`
  - `apps/web/app/(web)/directory/[slug]/_components/directory-profile/rank-status-badge.tsx` (NEW)
  - `docs/sprints/SESSION_0724.md` (this file)
- Read-only refs: `apps/web/server/web/passport/public-payloads.ts`,
  `apps/web/lib/lineage/trust-status.ts`, `apps/web/server/web/directory/profile-projection.ts`,
  `docs/product/black-belt-legacy/lineage-data-wiring-flow.md` (§3/§9).
- Hard rules acknowledged: no Prisma migration/schema/enum change, no money/Stripe/entitlements
  logic, no live email, no secrets, no onboarding flows; touch ONLY owned files (never
  `git add -A`); push authorization granted for THIS branch only (`git push -u origin HEAD` +
  `gh pr create`), never merge/deploy.
- On-demand blocks pulled: none additional — `.claude/skills/seq-lane-build/SKILL.md` read for
  the invariant sequence + gotcha floor.

## Cody pre-flight

### 1. Existing component scan

- Searched `components/web/` and `components/common/` for a per-status/trust badge: found
  `components/web/lineage/lineage-trust-badge.tsx` (`LineageTrustBadge` / `LineageClaimBadge`) —
  the directory CARD's aggregate member-trust badge (`facet-result-card.tsx`) and the profile
  hero badge cluster (`hero-badges.tsx`) both consume it.
- `components/common/badge.tsx` is the L1 `Badge` primitive both existing trust badges compose —
  **Badge** (`variant: 'primary'|'soft'|'outline'|'success'|'caution'|'warning'|'info'|'danger'`,
  `size: 'sm'|'md'|'lg'`, `prefix`/`suffix: ReactNode`, `children`). Reused directly, not
  reinvented.

### 2. L1 template scan

- N/A dirstarter — this repo's component inventory is `docs/knowledge/wiki/custom-component-
  inventory.md` (not the dirstarter template, per this repo's CLAUDE.md subject router); the
  in-repo L1 precedent is `LineageTrustBadge`/`LineageClaimBadge`, read in full (see below).
- Closest pattern: `components/web/lineage/lineage-trust-badge.tsx` — a `Record<Status, {label,
  variant, icon}>` config object + a thin function component wrapping `Badge`. Mirrored exactly
  for the new `RankStatusBadge`.

### 3. Composition decision

- [x] New component, no exact L1 match exists (justify): `LineageTrustBadge` renders
  `LineageTrustStatus` — a DIFFERENT, aggregate, member-level axis (rank + claim + placeholder
  fallback via `resolveLineageTrustStatus`/`resolveMemberTrustStatus`, `lib/lineage/trust-
  status.ts`). This task needs the raw, un-aggregated **per-award** `RankEntry.status` (4 values:
  `PENDING | UNVERIFIED | VERIFIED | DISPUTED`, `enums.ts:925`) rendered per rank row, not the
  profile-level trust summary already shown in `HeroBadges`. Composing the SAME `Badge` primitive
  and mirroring the SAME config-object idiom/icon set (no new color system) rather than
  overloading `LineageTrustBadge` with a fifth "pending" bucket it was never designed to carry
  (`LineageTrustStatus` has no `pending` member — it treats claim-pending and rank-pending as
  distinct concepts by construction, `trust-status.ts:1-9`).

### 4. Lane docs loaded

- [x] Dispatch prompt's owned/ref file list read in full (this session's substitute for "prior
  SESSION Next session" — dispatch fully specified the task).
- [x] `docs/product/black-belt-legacy/lineage-data-wiring-flow.md` §3 read — the canonical public
  label table (line 168-171): `VERIFIED -> Verified`, `UNVERIFIED -> Unverified`, `PENDING ->
  Pending verification`, `DISPUTED -> Disputed`; confirms all 4 raw values, PENDING included, are
  public-projectable ("the public projection may expose VERIFIED, UNVERIFIED, PENDING, or
  DISPUTED... but never exposes private evidence, reviewer identity, or reporter identity").
  `RANK_STATUS_BADGE_CONFIG` labels are copied verbatim from this table.
- [x] `apps/web/server/web/passport/public-payloads.ts` confirmed `rankEntry: { select: { status:
  true } }` already selected (line 57-59) — no payload widen needed, projection-only change.

### 5. Dev environment confirmed

- Dev server command: `npx next dev --turbo` (from `apps/web/`) — not launched this session (no
  runtime probe requested by the dispatch; typecheck/lint/test are the required gates).
- Working directory: `/Users/brianscott/dev/bbl-0724`
- Verification commands run from the worktree root: `bun run typecheck`, `bun run lint`,
  `bun run test`.

### 6. FAILED_STEPS check

- Prior failures in this area: none found for this exact surface (public passport rank
  projection / rank-status badge is new ground).
- Mitigation acknowledged: n/a (no prior failure to repeat).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0724_TASK_01 | landed | `PublicPassportRank.status: RankEntryStatus \| null` added to `apps/web/server/web/passport/public-projection.ts`; threaded in the `toRank` mapper (`award.rankEntry?.status ?? null`). Projects ONLY the raw status enum — no reviewer/evidence/reporter field added. |
| SESSION_0724_TASK_02 | landed | NEW `apps/web/app/(web)/directory/[slug]/_components/directory-profile/rank-status-badge.tsx` — `RankStatusBadge` component; `RANK_STATUS_BADGE_CONFIG` maps the 4 `RankEntryStatus` values to `{label, variant, icon}` mirroring `LineageTrustBadge`'s config shape/icon set (no new color system); renders `null` for a null/absent status (no orphan). |
| SESSION_0724_TASK_03 | landed | `ranks-section.tsx` renders `<RankStatusBadge status={rankAward.status} />` inline next to each rank's name (new wrapper `<div className="flex flex-wrap items-center gap-1.5">`), above the existing discipline/promoted-on meta line. JSDoc updated with a BBL-RANK-001/WL-P2-47 note. |

**Decisions resolved:**

- **RankEntryStatus vs LineageTrustStatus — kept as two distinct types, not merged.** The dispatch
  prompt's example status list ("VERIFIED / UNVERIFIED / DISPUTED / IMPORTED / etc.") matches
  `LineageTrustStatus`'s vocabulary, but the actual Prisma enum backing `PublicPassportRank.status`
  is `RankEntryStatus` (`PENDING | UNVERIFIED | VERIFIED | DISPUTED` — no `IMPORTED` member,
  `schema.prisma:2196-2201`). Followed the dispatch's own cited SoT
  (`lineage-data-wiring-flow.md` §3, which the dispatch named as authoritative for this exact
  question) for the canonical raw-enum → label mapping rather than reusing
  `resolveLineageTrustStatus`'s aggregate resolver, which would have required inventing a lossy
  mapping (e.g. `PENDING -> "claim-pending"`, mislabeling a rank-verification wait as an identity-
  claim wait). This is an implementation detail resolved from a dispatch-cited doc, not a silent
  re-plan of the lane's scope or a new architectural decision.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (worktree root) | `tsc --noEmit` clean across all 3 packages · REAL_EXIT=0 |
| `bun run lint` (worktree root) | `oxlint --fix .` — 0 errors; only pre-existing warnings in unrelated files (role-form.tsx, nav.tsx, etc. — none in owned files); `git status --porcelain` after confirms only the 3 owned files touched (2 modified + 1 new), no unrelated `--fix` mutation · REAL_EXIT=0 |
| `bun run test` (worktree root, full suite) | **REAL_EXIT=1** — `1928 pass / 1 fail / 5294 expect() calls` across 241 files (338.92s). The 1 failure is `server/web/lineage/node-profile-actions.test.ts` (`beforeAll`, `db.discipline.create`, `P2002 UniqueConstraintViolation` on `(code, brand)`). Root-caused (see below) — unrelated to this lane's diff, outside the owned-file contract, not trivially fixable inside owned files → this lane HELD and reported it. **Resolution: HELD-then-authorized.** Coordinator independently verified the same failure reproduces on untouched `main` and filed it as its own fix-lane; operator authorized proceeding. Gate line for this lane: **typecheck 0 · lint 0 · test = HELD-then-authorized (pre-existing unrelated lineage-DB flake, filed as a separate fix-lane, not a regression from this diff).** |

**Root cause of the test failure (diagnosed, not hand-waved):** `node-profile-actions.test.ts:42`
defines `tag = (name) => \`session-0184-${TS}-${name}\`` (`TS = Date.now()`), then
`node-profile-actions.test.ts:110` computes `code: tag("DISC").slice(0, 16)`. The literal prefix
`"session-0184-"` is 13 characters, so `.slice(0, 16)` keeps only 3 digits of the embedded epoch-ms
timestamp — e.g. `"session-0184-178"` — which is constant across ANY two test runs within the same
~116-day window (all of 2026 H2 shares the same leading 3 epoch-ms digits). A read-only Prisma
query against the shared local DB (`ronindojo_prodsnap`) confirmed exactly one pre-existing row:
`Discipline{ id: "session-0184-1785437506970-discipline", code: "session-0184-178", brand:
BASELINE_MARTIAL_ARTS, createdAt: 2026-07-30T18:51:48Z }` — left over from an earlier/concurrent
run (host `uptime` showed `load averages: 3.08 7.48 7.14`, consistent with other lanes/processes
active on this host) whose own `afterAll` teardown never ran (crash, or still in flight at the
time of this check). Re-running `node-profile-actions.test.ts` alone reproduces the SAME failure
deterministically (not a transient race) — the collision persists until that stale row is deleted
or the test's truncated `code` fixture is fixed, neither of which is in this lane's owned-file
contract. `node-profile-actions.test.ts` has zero relationship to this lane's diff
(`public-projection.ts` / `ranks-section.tsx` / `rank-status-badge.tsx` — passport rank
projection/UI, not lineage node profiles).

## Artifacts

None — no runtime surface probed this session (dispatch did not request one; gates were the
required feedback loop, and the test gate surfaced a blocking pre-existing issue before a runtime
probe was warranted).

## Open decisions / blockers

**RESOLVED — was BLOCKED ON OPERATOR/PETEY, now authorized.** Full-suite `bun run test` gate went
RED for a reason outside this lane's owned-file contract (see Verification above); per the
dispatch's hard rule this lane STOPPED and reported it rather than editing
`node-profile-actions.test.ts` (not owned) or deleting the stale `Discipline` row (a destructive
action on shared state outside this lane's authorized scope). The coordinator independently
verified the same failure reproduces on untouched `main`, confirmed it is outside this lane's
owned files, and filed it as its own fix-lane. Operator authorized this lane to proceed to
commit/push/PR on that basis — this lane's own diff remains fully gated clean (typecheck 0,
lint 0; the single test fail is proven pre-existing/unrelated, now independently corroborated).

## Next session

- **Goal:** N/A for this lane — the separately-filed fix-lane owns the
  `node-profile-actions.test.ts` fixture-truncation bug (own a fix or authorize a DB-row cleanup).
  This lane closes out with its diff pushed + PR opened per the operator's authorization.
- **First task:** N/A from this lane — see the separately-filed fix-lane for the
  `node-profile-actions.test.ts` follow-up.

## Close evidence

Single-lane dispatched build; no standalone Doug/Giddy/Desi grill run this session (small
pre-specified UI/projection task, self-reviewed by Cody). **Gate line:** typecheck 0 · lint 0 ·
test = HELD-then-authorized (pre-existing unrelated lineage-DB flake in
`server/web/lineage/node-profile-actions.test.ts`, root-caused this session, corroborated by the
coordinator against untouched `main`, filed as its own fix-lane — not a regression from this
lane's diff). **Findings ≥ medium:** none in this lane's own diff. **Git hygiene:** owned paths
only staged (`git status --porcelain` confirmed no drift outside the 4 owned files before commit);
single push this session — see PR link below once opened.

## Reflections

- `node-profile-actions.test.ts`'s `tag(...).slice(0, 16)` truncates virtually all of its embedded
  `Date.now()` entropy, producing an effectively-hardcoded `Discipline.code` that collides with any
  leftover row from an earlier/concurrent run sharing the same ~116-day epoch-ms window — a latent,
  always-armed shared-DB contamination bug, not a rare flake. → route: no-action this session (out
  of this lane's owned-file contract to fix; flagging for the operator/Petey to either author a
  fix in `node-profile-actions.test.ts` — e.g. drop the `.slice(0, 16)` or widen it — or route a
  one-time cleanup DELETE of the stale row before other lanes' `bun run test` gates hit the same
  wall).
