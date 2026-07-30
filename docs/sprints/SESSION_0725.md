---
title: "SESSION 0725 — related-profile suggestions on public profile detail"
slug: session-0725
type: session--implement
status: in-progress
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0725
sprint: S13
lane: bbl
lane_seq: B
recipe: "seq-lane-build"
goal_ids: []
tickets:
  - BBL-DISCOVER-003
next_session:
pairs_with: []
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0725 — related-profile suggestions on public profile detail

**Date:** 2026-07-30 · **Operator:** Brian + claude-session-0725 · **Lane:** B (BBL-DISCOVER-003)

## Goal

Add a below-the-fold "Related profiles" discovery rail to the public profile detail
(`/directory/[slug]`), mirroring the org page's `RelatedOrganizations`. Operator-pinned heuristic
(do NOT re-open): related = **same top-discipline AND shares at least one lineage tree; exclude
self; PUBLIC-visibility profiles only; limit 6.** Reuse the existing directory privacy gate
(`buildDirectoryProfileWhere` predicate) — no hand-rolled visibility filter.

## Status

Frontmatter `status:` is the single source of truth (SESSION_0342). Was HELD on the full-suite
`bun run test` red; **operator adjudicated and AUTHORIZED the push** — the failure is a PRE-EXISTING,
unrelated shared-DB concurrency flake (`reconcile-pending-claims.test.ts` +
`lineage-member-placement.test.ts`, both PASS in isolation on untouched main, outside my owned
files), filed as its own separate fix-lane. Owned-code gate is green.

**Gate line:** typecheck 0 · lint 0 · test = HELD-then-authorized (pre-existing unrelated lineage
concurrency flake, filed as a separate fix-lane). Pushed per operator authorization.

## Bow-in

- Dispatched as **Lane B** of a parallel worktree build (Lane A = rank badge, does NOT touch the
  shared `public-profile.tsx` assembler — no conflict). Pinned forks: push+PR authorized for THIS
  branch only; HOLD on any gate-fail/ambiguity; NEVER merge/deploy/push-to-main.
- Worktree: `/Users/brianscott/dev/bbl-0725` on branch `auto/session-0725-related-profiles`, cut
  from `origin/main` + pre-bootstrapped. FS-0024 guard run: `pwd` = worktree path, `git remote -v`
  = `Ronin-Dojo-Design/black-belt-legacy`.
- Owned-file contract (WRITE ONLY these):
  - `apps/web/server/web/directory/related-profiles.ts` (NEW — privacy-gated query)
  - `apps/web/app/(web)/directory/[slug]/_components/directory-profile/related-profiles-section.tsx` (NEW — display)
  - `apps/web/server/web/directory/profile-view.ts` (extend `PublicProfileView` + fetch in `loadProfileViewBySlug`)
  - `apps/web/app/(web)/_components/profile-view/public-profile.tsx` (mount the section)
  - `docs/sprints/SESSION_0725.md` (this file)
- Pinned heuristic reproduced verbatim above. Never `git add -A` (FS-0035) — explicit owned paths only.

## Cody pre-flight

FS-0048 read-before-build: read every owned + ref file first. Key references studied before writing:
`organizations/[slug]/.../related-organizations.tsx` + `organization-detail-data.ts`
(`findRelatedOrganizations`) — the EXACT pattern mirrored (related query returns ≤6, self excluded,
shared-discipline `OR`, section renders a `Grid` of cards); `profile-where.ts`
(`buildDirectoryProfileWhere` — the reused privacy predicate; `viewerUserId: null` → PUBLIC-only
scope); `search-profiles.ts` + `facets.ts` (`peopleFacet`) — the proven
`directoryProfileListPayload` → `projectDirectoryProfileListItem` → `mapPersonToFacet` →
`DirectoryFacetResult` pipeline reused wholesale; `facet-result-card.tsx` (**stale at time of
writing** — believed to be "the ONE directory card, reused for people"; corrected in ggr pass 1:
the live `/directory` people facet had already migrated to `MCard kind="roster"`
(PWCC-002, on main before this session), so `related-profiles-section.tsx` was fixed to render
through `MCard` + `mapFacetPersonToRosterCard` instead — see ggr pass-1 note below); `payloads.ts`
/ `public-payloads.ts` / `public-projection.ts` (payload shapes, top-rank ordering); schema
confirmation of `LineageTreeMember.treeId`, `RankSystem.disciplineId`, `Passport.lineageNode` /
`rankAwardsEarned`.

L1 pre-flight: no NEW UI primitive created — the section composes existing L1 pieces (`Section`,
`H4`, `Grid`) and (as originally built) reused `FacetResultCard` — **stale**, see the ggr pass-1
correction above: people cards now render via `MCard kind="roster"` (PWCC-002), matching the
sibling profile sections' in-`ListingDetail` wrapper convention (bare `Section` + `H4`, per
`ranks-section.tsx` / `organizations-section.tsx`).

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0725_TASK_01 | built (held) | NEW `server/web/directory/related-profiles.ts` — `findRelatedProfiles({ passportId, brand })`. Pre-query resolves the current passport's top-discipline id (highest-belt-first `rankAwardsEarned[0].rank.rankSystem.disciplineId`) + its lineage-tree ids (`lineageNode.treeMembers[].treeId`); returns `[]` when either is absent (nothing to relate). Where clause spreads the REUSED `buildDirectoryProfileWhere({}, brand, null)` privacy+brand base (PUBLIC-only visibility) and ANDs in: `passportId not self`, `passport.rankAwardsEarned some rank in the top discipline`, `passport.lineageNode.treeMembers some treeId in the shared trees`. `findMany` (take 6, brand-filtered memberships identical to `searchDirectoryProfiles`) → policies → `projectDirectoryProfileListItem` → `mapPersonToFacet`, returning `DirectoryFacetResult[]`. `"use cache"` + `cacheTag("related-profiles-${passportId}")` + `cacheLife("minutes")`, mirroring `findRelatedOrganizations`. |
| SESSION_0725_TASK_02 | built (held) | `server/web/directory/profile-view.ts` — extended `PublicProfileView` with `relatedProfiles: DirectoryFacetResult[]`; added `findRelatedProfiles(...)` to the existing `Promise.all` batch (viewer-independent, so it batches) and threaded it into the returned view. |
| SESSION_0725_TASK_03 | built (held) | NEW `directory/[slug]/_components/directory-profile/related-profiles-section.tsx` — `RelatedProfilesSection({ profiles })`: `if (profiles.length === 0) return null` (no orphan empty state), else `Section` + `H4 "Related profiles"` + `Grid` of `FacetResultCard`. Reuses the ONE directory card — no bespoke card. |
| SESSION_0725_TASK_04 | built (held) | `_components/profile-view/public-profile.tsx` — `next/dynamic`-imported `RelatedProfilesSection` (SSR kept, same lazy boundary as the other below-the-fold client-JS sections) and mounted `<RelatedProfilesSection profiles={view.relatedProfiles} />` as the final below-the-fold child (after the main body + upgrade CTA). |

**Decisions resolved:** None — heuristic pre-pinned by the operator; single interpretation call
documented below.

**Interpretation note (top-discipline):** an exact "candidate's TOP discipline == current TOP
discipline" correlation is not cheaply expressible in Prisma. Following the pinned intent and the
`findRelatedOrganizations` precedent (shared-discipline overlap), the query requires the candidate
to hold at least one rank in the current profile's top discipline, AND to share a lineage tree
(trees are discipline-scoped, so the two constraints together are a faithful, tight approximation
of "same top-discipline"). Documented in the query's doc comment.

## Verification

Gates run FOREGROUND from `apps/web`, real exit codes captured (no pipe-mask, PL-010):

| Command | Result |
| --- | --- |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | clean · REAL_EXIT=0 |
| `bun run lint` (`oxlint --fix .` + button-type) | clean · REAL_EXIT=0 — only pre-existing warnings in unrelated files; `git status --porcelain` shows ONLY the 4 owned paths (2 modified, 2 new), no `--fix` mutation of other tracked files |
| `bun run test` (full suite, run 1) | **REAL_EXIT=1** — 1927 pass / **2 fail** / 5290 expect · 241 files. Fails: `server/web/lineage/reconcile-pending-claims.test.ts` (P2002 UniqueConstraintViolation, claim-reconcile race) + `server/web/lineage/lineage-member-placement.test.ts` (`intra-group reorder…`, P2034 TransactionWriteConflict/deadlock — error text: "Please retry your transaction"). BOTH in `server/web/lineage/*`, outside my owned files and unrelated to the additive directory read. |
| isolation re-run: `bun test --parallel=1 reconcile-pending-claims.test.ts lineage-member-placement.test.ts` | **REAL_EXIT=0** — 7 pass / 0 fail. Both "failing" files pass cleanly in isolation → confirms concurrency flake, not a regression. |
| `bun run test` (full suite, run 2 — flake retry, NO code change) | **REAL_EXIT=1** — 1928 pass / **1 fail** (down from 2; the P2034 member-placement flake cleared). Remaining fail = the SAME `reconcile-pending-claims.test.ts` P2002 race. Non-determinism across runs (2→1 fails) further confirms flake. |

My change is a purely additive READ (new query + new display section + view-type extension); it
touches no lineage claim/placement code and cannot cause a P2002/P2034 transaction conflict in
those files.

## Artifacts

None (no runtime smoke published — HELD before push; local dev not booted this lane).

## Open decisions / blockers — RESOLVED (push authorized)

**Was BLOCKER (HOLD), now cleared:** full-suite `bun run test` was non-zero (REAL_EXIT=1) due to a
pre-existing, non-deterministic concurrency flake in
`server/web/lineage/reconcile-pending-claims.test.ts` (P2002 claim-reconcile unique-constraint
race) + `server/web/lineage/lineage-member-placement.test.ts` (P2034 write-conflict) — OUTSIDE my
owned-file contract, in a domain my additive directory-read change does not touch, both PASS in
isolation on untouched main. **Operator adjudicated it as a pre-existing unrelated shared-DB
concurrency flake, filed it as its own fix-lane, and AUTHORIZED the push.** Owned-code gate green
(typecheck 0, lint 0, both flaky files green in isolation). Staged the 4 owned paths, committed,
pushed, and opened the PR per that authorization — see below.

## ggr pass-1 (fix-loop) close evidence

Doug held the score at ~7.7 on a Dirstarter-reuse cap; Desi found 2 P0 render defects. All 5
findings (Desi P0×2, Doug MINOR, Desi P2, Desi P3) applied in this pass — see FIX 1–5 in the
dispatch. Files touched (explicit paths, no `git add -A`):

- `apps/web/app/(web)/directory/[slug]/_components/directory-profile/related-profiles-section.tsx`
  — FIX 1 (dropped stale `FacetResultCard`, now `MCard kind="roster"` +
  `mapFacetPersonToRosterCard`, mirroring the live `/directory` people facet, PWCC-002), FIX 2
  (`Grid` gets `md:col-span-2`, exact `ancestry-section.tsx:34-36` precedent), FIX 3 (heading →
  "Related Profiles").
- `apps/web/server/web/directory/related-profiles.ts` — FIX 4 (typed `where` literal, `AND: [...]`
  composition replacing the spread + blind `as Prisma.DirectoryProfileWhereInput` cast; privacy
  predicate + heuristic left byte-identical — same PUBLIC-only gate, self-exclusion,
  same-discipline-AND-shared-tree logic, `RELATED_PROFILE_LIMIT = 6`, unchanged).
- `docs/sprints/SESSION_0725.md` — FIX 5 (corrected the stale "FacetResultCard is the ONE directory
  card, reused for people" pre-flight claim; noted the PWCC-002 `MCard` migration) + this section.

**Gates (foreground, real exit codes, from `apps/web`):**

| Command | Result |
| --- | --- |
| `bun run typecheck` | REAL_EXIT=0 — clean |
| `bun run lint` | REAL_EXIT=0 — only the same pre-existing repo-wide warnings noted in the original Verification table; `git status --porcelain` confirms `--fix` touched ONLY the 3 owned paths above |

**Fallow (`bunx fallow audit --changed-since origin/main`, before → after this pass — captured via
`git stash` around the pass-1 diff so "before" is the exact pre-fix code Doug/Desi reviewed):**

- Before: 1 unused-type finding (`profile-view.ts:184 ClaimViewerState`, pre-existing/unrelated) +
  3 complexity findings (`findRelatedProfiles` 97 lines, `loadProfileViewBySlug` 88 lines,
  `PublicProfile` HIGH-complexity, all pre-existing) · maintainability 87.5.
- After: SAME 1 unused-type finding (untouched file) + SAME 3 complexity findings
  (`findRelatedProfiles` now 103 lines — grew 6 lines from the `AND` restructuring comment/code,
  same pre-existing flagged function, not a new finding) · maintainability 87.3. **No new fallow
  findings introduced by this pass.**

**Runtime:** MCard/`mapFacetPersonToRosterCard` wiring confirmed via typecheck (0) AND a live
worktree smoke — booted `next dev --turbo` in this worktree (port 3177, local prodsnap Postgres,
already running), hit `GET /directory/bob-bass` (a real PUBLIC profile with a slug) → `200`, no
error boundary/digest in the response body or server log, module graph (including the new `MCard`
/ `map-roster` imports) compiled clean. **Could NOT exercise the "rail present" branch**: a
throwaway read-only query against the local prodsnap snapshot found no pair of PUBLIC profiles
sharing both a top discipline and a lineage tree (Doug's own pinned heuristic is a tight AND), so
every real profile in this snapshot hits `profiles.length === 0` and short-circuits before ever
rendering `MCard`. Did not seed synthetic data to force the case — this local Postgres instance is
shared across worktrees on this machine and mutating it is out of this pass's scope/authorization.
**Recommended pre-merge follow-up:** a visual smoke against a seeded pair (or prod) to confirm the
populated-rail render, since this pass only proves the empty-branch + compile-time contract.

**New HEAD:** see push confirmation in the hand-back below. **Pushed to PR #367**, same branch
(`auto/session-0725-related-profiles`) — no merge, no deploy, `main` untouched.

## Close evidence — ggr pass 2 (model-currency correctness fix, ADR-0058)

**Operator-caught bug:** `findRelatedProfiles` derived the top-discipline signal from
`rankAwardsEarned` (the `RankAward` model). Per **ADR 0058** (`docs/adr/0058-rankentry-is-rank-truth.md`)
`RankEntry` is the ONE rank model — the `RankAward` read-collapse is DONE, `RankAward` is
dead-but-present (table drop queued as G-011), so `rankAwardsEarned` returns stale/near-empty data.
Fix = repoint the discipline signal to `RankEntry`; the pinned strict-AND heuristic is unchanged.

**Only code file changed:** `apps/web/server/web/directory/related-profiles.ts` (+11/-5):

1. Current-profile top-discipline derivation: `rankAwardsEarned` select → `rankEntries`
   (`Passport.rankEntries RankEntry[]`, schema `:1131`). Same path `rank → rankSystem → disciplineId`.
   `RankEntry` has no `awardedAt`, so secondary orderBy `{ awardedAt: "desc" }` → `{ createdAt: "desc" }`
   (primary `{ rank: { sortOrder: "desc" } }`, `take: 1` kept). `topDisciplineId =
   current?.rankEntries[0]?.rank?.rankSystem?.disciplineId ?? null`.
2. Peer-match predicate: `passport.rankAwardsEarned.some` → `passport.rankEntries.some`
   (same `rank.rankSystem.disciplineId` on `topDisciplineId`).
3. Stale comments repointed to `rankEntries` (kept 3 explanatory mentions that name the retired
   model to explain the ADR-0058 rationale).

**No status filter added** (kept statusless, faithful to the original all-awards behavior).
Justification: `grep -rn "rankEntries" apps/web/server apps/web/lib` returns nothing — there is NO
canonical public passport payload that derives a top-discipline from `RankEntry` at all (the
existing top-rank helpers in `disciplines/top-ranked-queries.ts` + `lineage/node-profile-queries.ts`
still read `rankAwardsEarned`/`awardedAt`). So there was no status-filtered canonical to match.

**Sparsity re-run (read-only, local `ronindojo_prodsnap`, throwaway scripts deleted, never staged):**

- Denominator reconciliation: the actual BBL-scoped predicate
  `buildDirectoryProfileWhere({}, "BBL", null)` yields **78** PUBLIC DirectoryProfiles. Doug's prior
  **"89"** was the raw cross-brand `visibility=PUBLIC` count (`raw PUBLIC (any brand) = 89`;
  `raw PUBLIC w/ BBL tree = 78`). Real scoped denominator = 78.
- **RankEntry path (the fix):** pass gate (top-discipline + ≥1 tree) = **0/78**; NON-EMPTY rail = **0/78**.
- **RankAward path (Doug's prior basis):** pass gate = **0/78**; NON-EMPTY rail = **0/78**.
- Root cause — data, not model: **0 of 78** PUBLIC BBL passports have ANY `RankEntry`, and **0 of 78**
  have ANY `RankAward`; all 78 DO have a lineage tree. Global prodsnap totals: **14 `RankEntry`
  rows, 15 `RankAward` rows**, and **ZERO** of either belong to any BBL-tree passport
  (`RankSystem.disciplineId` is NON-nullable, so a resolvable top-discipline == having ≥1 entry row).

**Conclusion (LOUD — sends the decision back to the operator):** the repoint is CORRECT per ADR-0058
and now reads the live rank model, but the rail stays **dark on today's snapshot because the BBL
roster genuinely lacks rank data in BOTH models** — not because of the model choice. No seed was
performed (out of authorization; and the "STILL 0" branch is instructed not to seed). No populated
smoke was possible (nothing qualifies the strict-AND). The rail lights automatically once BBL
passports acquire `RankEntry` rows in a shared top-discipline + tree. The feature ships correct but
inert-until-data; whether to backfill BBL rank data is an operator decision.

**Gates (foreground, real exit codes, no pipe-mask):** `bun run typecheck` = **0** · `bun run lint`
= **0** (only pre-existing repo-wide warnings; none in the changed file) · `bun run format:check` =
**0** (the changed file was already oxfmt-clean — no reformat needed).

**Fallow (`bunx fallow audit --changed-since origin/main`, before → after):** unchanged — 1 dead-code
finding + 3 complexity findings (`findRelatedProfiles`, `loadProfileViewBySlug`, `PublicProfile`),
all inherited/gate-excluded (audit gate excluded 3 inherited findings both runs). **No new fallow
findings introduced.**

**New HEAD:** `d2040f5d` — **pushed to PR #367**, same branch, no merge, no deploy, `main` untouched.

## Next session

- **Goal:** PR review + merge for this lane (operator-gated); CI will re-run the full suite — the
  same lineage concurrency flake may recur on the required check and needs the operator's judgment
  there (or the separate flake fix-lane landing first). Recommend a visual smoke of the populated
  "Related Profiles" rail (seeded pair or prod) before merge — this pass only exercised the
  empty-branch + compile-time contract (see ggr pass-1 close evidence above).
- **First task:** the separate stabilize-the-lineage-claim-reconcile-flake fix-lane (P2002/P2034
  under shared-DB full-suite load) — owned by that lane, not this one.

## Proposed ledger edits (apply next canonical close — shared ledgers frozen this session)

- **Flake candidate (FYI for the merge sweep / possible incidents row):**
  `server/web/lineage/reconcile-pending-claims.test.ts` (P2002 claim-reconcile race) and
  `server/web/lineage/lineage-member-placement.test.ts` (P2034 write-conflict/deadlock) fail
  non-deterministically under full-suite (`--parallel=1`, shared `ronindojo_prodsnap`) load but
  pass in isolation. Two consecutive full-suite runs this session failed on 2 then 1 of them.
  Worth a flaky-integration-test stabilization pass (retry-on-P2034 or fixture isolation) — not a
  defect surfaced by this lane's change.
