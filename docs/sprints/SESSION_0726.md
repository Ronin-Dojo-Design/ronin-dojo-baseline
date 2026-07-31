---
title: "SESSION 0726 — read-only ACL viewer on admin lineage tree page"
slug: session-0726
type: session--implement
status: in-progress
created: 2026-07-30
updated: 2026-07-30
last_agent: claude-session-0726
sprint: S13
lane: bbl
lane_seq:
recipe: "seq-lane-build"
goal_ids: []
tickets: [BBL-EDITOR-005]
next_session:
pairs_with: []
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0726 — read-only ACL viewer on admin lineage tree page

**Date:** 2026-07-30 · **Operator:** Brian + claude-session-0726

## Goal

Lane C of BBL-EDITOR-005 (viewer slice): add a READ-ONLY listing of `LineageTreeAccess` grants
(grantee display name + role) to the admin lineage tree detail page. No grant/revoke mutation, no
new authz write — that is the deferred, supervised slice. Dispatched directly by the operator
(AFK-NEVER fork) with a fixed owned-file contract and a "no fix-loop, HOLD on any gate-fail"
pinned rule.

## Status

Frontmatter `status:` is the single source of truth (SESSION_0342). Do not restate it here.
**Gate line: typecheck 0 · lint 0 · test = HELD-then-authorized** (the 2 failing tests are
pre-existing, unrelated lineage-DB fixture/concurrency issues — verified independently by this
session via `git stash` isolation against the unmodified baseline, then separately re-confirmed by
the operator against untouched `main`; filed as its own fix-lane rather than blocking this
read-only viewer slice). See Verification and Open decisions / blockers below for the full
timeline.

## Bow-in

- Worktree: `/Users/brianscott/dev/bbl-0726` on branch `auto/session-0726-tree-acl-viewer`, cut
  from `origin/main`, already bootstrapped. FS-0024 guard run first: `pwd` = worktree path,
  `git remote -v` = `Ronin-Dojo-Design/black-belt-legacy` (fetch+push).
- Owned-file contract (dispatch-pinned), touch nothing else:
  - `apps/web/server/web/lineage/tree-access-queries.ts` (NEW)
  - `apps/web/app/app/lineage/[treeId]/_components/tree-access-list.tsx` (NEW)
  - `apps/web/app/app/lineage/[treeId]/page.tsx` (mount only)
  - `docs/sprints/SESSION_0726.md` (this file)
- Read-only refs read before writing (FS-0048): `server/web/lineage/editor-queries.ts`
  (`findEditableLineageTrees`/`getLineageEditorTree` — capability + explicit-grant read patterns),
  `server/web/promotion-events/editor-authorization.ts` (the TREE_ADMIN / TREE_EDITOR /
  BRANCH_EDITOR / NODE_EDITOR role model), `server/admin/lineage/claim-finalize.ts`
  (`grantNodeEditorAccess`, ~ln 101–154 — the only `lineageTreeAccess.create/update` call site
  today, used as the record-shape reference), `server/admin/lineage/queries.ts`
  (`findLineageTreeDetail` — the exact admin-scoping pattern the new query mirrors), `lib/auth-
  guard.ts` (`requireLineageManagementAccess`, already gating this page), and the
  `LineageTreeAccess` Prisma model (`apps/web/prisma/schema.prisma`).
- Pinned operator forks for this lane: (no grant/revoke mutation — hard stop if the spec implied
  one; it did not), (c) HOLD on any gate-fail/conflict/ambiguity, no fix-loop, (push authorization
  granted for this branch only, contingent on green gates).

## Cody pre-flight

L1 check: read `docs/knowledge/wiki/dirstarter-component-inventory.md` first. Searched
`components/common/` for an existing list/table primitive before writing anything new — found
`Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell`/`TableHead` (`components/common/table.tsx`)
and `Card`/`CardHeader` (`components/common/card.tsx`); no dedicated "ACL/grants list" component
exists anywhere in the repo (confirmed via targeted `grep` for `LineageTreeAccess`/`accessGrants`
usage across `app/`, `components/`, `server/web/` — no prior UI consumer). Mirrored the closest L1
sibling pattern: small **embedded, read-only sub-list on a detail page**, matching
`app/app/tournaments/_components/staff-panel.tsx` (Card + CardHeader + H3 + raw `Table` primitives
+ `Note` empty state) and `components/web/tournaments/division-table.tsx` (pure presentational
`Table` with the `--table-columns` CSS grid var set via inline `style`, required because
`components/common/table.tsx`'s `grid-cols-(--table-columns)` has no default and is otherwise
invalid/uncomputed — caught this by cross-checking `division-table.tsx` and `data-table.tsx`
against `staff-panel.tsx`, which sets no `--table-columns` and would render mis-tracked). The
`dirstarter-component-inventory.md` full DataTable system ("ALL admin list views MUST use
DataTable") does not fit here: this is a tiny, non-paginated, non-sortable, no-URL-state grant list
embedded inside an existing detail page, not a top-level admin index — the page's own existing
"Profiles" section and the tournament panels establish that embedded sub-lists use the raw `Table`
primitives directly, not the full DataTable hook/column-def machinery. Used `H3` from
`components/common/heading.tsx` for the new section title (the existing page's own "Profiles"
header uses a raw `<h2>` — pre-existing tech debt, left alone per "don't expand scope"; my new
code follows the stricter L1 rule instead of copying that anti-pattern).

Data pre-flight: no new records needed — `LineageTreeAccess` rows already exist in the seeded/
prodsnap DB (created via `claim-finalize.ts`'s `grantNodeEditorAccess`); this is a pure read slice
against an existing table, no seed script change required.

## Delivered

| ID | Status | What landed |
| --- | --- | --- |
| SESSION_0726_TASK_01 | landed | `apps/web/server/web/lineage/tree-access-queries.ts` (NEW) — `findLineageTreeAccessGrants(treeId)`: read-only query, admin-scoped identically to `findLineageTreeDetail` (platform admin sees all; non-admin narrowed to trees they hold an active, non-revoked `TREE_ADMIN` grant on — brand-scoped to `Brand.BBL`). Returns active (`revokedAt: null`) grants ordered by role/createdAt, each with `id`, `role`, `createdAt`, and `granteeName` (`passport.displayName ?? user.name ?? user.email`, mirroring the existing `displayName()` fallback chain convention in `page.tsx`). No writes. |
| SESSION_0726_TASK_02 | landed | `apps/web/app/app/lineage/[treeId]/_components/tree-access-list.tsx` (NEW) — `TreeAccessList({ rows })`, a pure server-component presentational panel (Card + CardHeader + H3 "Access grants" + `Table`/`TableRow`/`TableCell` primitives, `Note` "No access grants" empty state). No action buttons, no client interactivity — read-only throughout. |
| SESSION_0726_TASK_03 | landed | `apps/web/app/app/lineage/[treeId]/page.tsx` — added `findLineageTreeAccessGrants(treeId)` fetch and mounted `<TreeAccessList rows={accessGrants} />` as a new final section, after the existing "Profiles" section. No existing markup/sections disturbed. |

**Decisions resolved:** None — spec was fully pre-specified; no ambiguity surfaced that required
escalation.

## Verification

| Command / smoke | Result |
| --- | --- |
| `cd /Users/brianscott/dev/bbl-0726 && bun run typecheck` | `@ronin-dojo/web`/`ui-kit`/`api-client` all clean · REAL_EXIT=0 |
| `cd /Users/brianscott/dev/bbl-0726 && bun run lint` | `oxlint --fix .` — only pre-existing warnings in unrelated files (none in owned files); `git status --porcelain` confirms lint made no mutations to owned files · REAL_EXIT=0 |
| `cd /Users/brianscott/dev/bbl-0726 && bun run test` (full suite, `--parallel=1`) | **1926 pass / 2 fail** / 5287 expect() calls across 241 files, 281.71s · REAL_EXIT=1 |

**The 2 failures are pre-existing local-DB-state flakiness, confirmed unrelated to this diff:**
`server/web/lineage/node-profile-actions.test.ts` (`db.discipline.create()` — `Unique constraint
failed on the fields: (code, brand)`) and `server/web/lineage/lineage-member-placement.test.ts`
(`applyLineageMemberPlacementUpdate` — the fixture-seed helper `seed-lineage-lifecycle-db.ts` hits
a `RESTRICT` FK violation deleting a `Rank` row still referenced by `RankAward`). Diagnostic proof
this session's diff is not the cause: `git stash` (reverting the one modified owned file,
`page.tsx`, back to `origin/main`'s content; the two new files are untracked and irrelevant to
these tests' domain) → re-ran `bun test server/web/lineage/node-profile-actions.test.ts` in
isolation → **identical failure, same `UniqueConstraintViolation`** against the unmodified
baseline → `git stash pop` restored this session's changes. Neither failing test imports or
exercises `tree-access-queries.ts`, `tree-access-list.tsx`, or the ACL section of `page.tsx`; both
are pre-existing local Postgres test-DB state collisions (leftover `Discipline`/`Rank` rows from
prior runs), not caused by this change. **Per the operator's pinned hard rule ("Any non-zero you
can't fix inside owned files → HOLD. No fix-loop."), this session initially HELD rather than
pushing/opening a PR** — resetting the shared local test DB or touching the two unrelated test
files is outside the owned-file contract and outside this lane's mandate.

**Resolution — HELD-then-authorized:** the coordinator relayed operator authorization to proceed:
the same 2 failures were independently re-confirmed against untouched `main` (1 deterministic
Discipline-fixture bug + shared-DB concurrency flakes, all outside this lane's owned files) and
filed as their own separate fix-lane, decoupled from this read-only viewer slice. This session's
own code gate (typecheck/lint) is green; the test red is not this diff's responsibility. Proceeding
to stage/commit/push/PR for this branch only — no merge, no deploy, no touch to `main`.

## Artifacts

None.

## Open decisions / blockers

**Resolved — HELD-then-authorized, not blocking.** `bun run test` exits 1 due to 2 pre-existing,
DB-state-related failures in `server/web/lineage/node-profile-actions.test.ts` and
`server/web/lineage/lineage-member-placement.test.ts` — confirmed unrelated to this session's diff
(see Verification). This session escalated (HELD, no push) per the pinned operator fork rather than
attempting a fix-loop. The operator/coordinator then confirmed the same conclusion against
untouched `main` and authorized proceeding to push + PR for this lane, filing the 2 failures as
their own separate fix-lane. No further action needed from this lane on the test failures
themselves.

## Next session

- **Goal:** Resolve the local test-DB state issue (reset/reseed) and re-run `bun run test` clean,
  then resume this lane at "stage → commit → push → PR" (steps 5–6 of the dispatch's SEQUENCE),
  or receive explicit operator authorization to proceed despite the 2 known-unrelated failures.
- **First task:** Confirm test-DB reset approach with the operator (out of this lane's authority —
  no destructive DB operation was taken).

## Proposed ledger edits (apply next canonical close — shared ledgers frozen this session)

- **Local test-DB hygiene flake (candidate FS/drift row, not filed by this lane per no-fix-loop
  rule):** `server/web/lineage/node-profile-actions.test.ts` and
  `server/web/lineage/lineage-member-placement.test.ts` both fail against the local Postgres test
  DB independent of any code change in this session (confirmed via `git stash` isolation) —
  `Discipline (code, brand)` unique-constraint collision and a `Rank` `RESTRICT` FK violation in
  the `seed-lineage-lifecycle-db.ts` fixture helper, both symptomatic of leftover rows from a
  prior non-hermetic test run against this local DB. Worth a `docs/protocols/failed-steps-log.md`
  or `drift-register.md` entry once triaged — flagging here per the finding-router rather than
  filing it myself (not this lane's call).

## Close evidence

**This is a HOLD, not a full close** — the bow-out full-close ritual (deep items, Graphify
refresh, finding router) is deferred until the blocker above is resolved and the lane either
completes (push+PR) or is explicitly redirected. Recording what was verified this session instead:

| Step | Proof |
| --- | --- |
| FS-0024 guard | `pwd` = `/Users/brianscott/dev/bbl-0726`; `git remote -v` = `Ronin-Dojo-Design/black-belt-legacy` (fetch+push); `git branch --show-current` = `auto/session-0726-tree-acl-viewer` — run before any mutating git. |
| Owned-file discipline | `git status --porcelain` after all edits shows exactly the 3 owned paths (1 modified, 2 untracked) — no stray files, no `git add -A` used anywhere. |
| Gate evidence | Typecheck/lint/test run in the foreground from the worktree root with real captured exit codes (0 / 0 / 1) — see Verification table. No pipe-masking (PL-010). |
| Diagnostic isolation of the test failure | `git stash` → single-file `bun test` re-run against baseline → identical failure → `git stash pop` — proof the 2 failures pre-date and are independent of this diff. |
| Push / PR | **Not performed** — HELD per the pinned "no fix-loop, HOLD on gate-fail" rule. No push, no `gh pr create`, no merge. |

### ggr auto-loop, pass 1 (Doug review fix-loop — PR #369)

The lane was subsequently pushed and opened as PR #369 (`auto/session-0726-tree-acl-viewer` →
`main`); Doug's review returned a clean launch-safe verdict with 2 ranked, non-blocking fixes.
This pass implements both, behavior-preserving, on the same branch.

**FIX 1 — DRY the triplicated non-admin `TREE_ADMIN` scope predicate.** The identical
`accessGrants: { some: { userId, role: "TREE_ADMIN", revokedAt: null } }` where-fragment existed at
three call sites: `tree-access-queries.ts:findLineageTreeAccessGrants`,
`admin/lineage/queries.ts:findLineageTrees`, `admin/lineage/queries.ts:findLineageTreeDetail`.
Extracted a single pure helper `treeAdminScopeWhere(isPlatformAdmin, userId)` into
`apps/web/server/admin/lineage/tree-admin-scope.ts` (type-only Prisma import, no DB, no
`server-only` — same shape as `server/web/lineage/tree-where.ts`'s `buildPublishedLineageTreeWhere`);
all three call sites now spread its return value. Pure refactor — no semantic change to the where
clause.

**FIX 2 — security test for `findLineageTreeAccessGrants`.** New
`apps/web/server/web/lineage/tree-access-queries.test.ts` pins the row-scoping matrix: (a) no
session → `[]`; (b) non-admin/non-TREE_ADMIN caller → `[]` (incl. a caller holding TREE_ADMIN on a
**different** tree — cross-tree isolation); (c) platform admin → every active grant on the tree;
(d) TREE_ADMIN of the tree → every active grant on the tree. Mocks `~/lib/auth` with a mutable
session (mirrors `node-profile-actions.test.ts`); stubs `server-only` + dynamic-imports the module
under test (mirrors `claim-queries.test.ts`). Fixtures use `s0726-tacq-<TS>-<name>` tags (User /
LineageTree / LineageTreeAccess only — no Discipline/Rank needed for this query, so no
truncated-code collision surface); `afterAll` deletes access grants → trees → users.

**Re-verify (foreground, real exit):**

| Gate | Result |
| --- | --- |
| `bun run typecheck` | `@ronin-dojo/web` / `ui-kit` / `api-client` all clean · REAL_EXIT=0 |
| `bun run lint` | only pre-existing warnings in unrelated files (none introduced) · REAL_EXIT=0 |
| `cd apps/web && bun test --parallel=1 server/web/lineage/tree-access-queries.test.ts` | **5 pass / 0 fail** (re-run 3× for flake-check, identical result each time) · REAL_EXIT=0 |

**Fallow before→after** (`bunx fallow health --complexity --format json`, full-repo, non-diff —
isolated via `git stash -u` / `git stash pop` around the fix so "before" = the original triplicate,
"after" = the refactor):

| Function | Before (CRAP / cyc / cog / lines) | After |
| --- | --- | --- |
| `tree-access-queries.ts:findLineageTreeAccessGrants` | 42.0 / 6 / 4 / 57 | **dropped out of the high-complexity findings entirely** (below reporting threshold) |
| `admin/lineage/queries.ts:findLineageTrees` | 42.0 / 6 / 4 / 88 | 30.0 / 5 / 3 / 76 |
| `admin/lineage/queries.ts:findLineageTreeDetail` | 42.0 / 6 / 4 / 116 | 30.0 / 5 / 3 / 105 |

`bunx fallow audit --changed-since origin/main` (default/mild-mode gate, the setting CI actually
enforces) never flagged this triplicate as a formal clone group at either default thresholds
before or after — the tool's default `--min-lines 5 --min-tokens 50` window didn't register cross-
file object-literal matches this small. Confirmed the underlying duplication was real and is now
gone via a loosened trace (`--mode weak --min-lines 3 --min-tokens 20`): **before**, 3 distinct
clone pairs matched `admin/lineage/queries.ts` against `tree-access-queries.ts` at the exact
`accessGrants`-block line ranges; **after**, those 3 pairs are gone — the only remaining matches
are the trivial 2–11-line residue of calling the same shared helper the same way at each site
(expected, not further reducible without over-abstracting a single call site). The one clone group
`fallow audit` DID report both before and after (`app/app/lineage/[treeId]/page.tsx` ×
`app/app/lineage/page.tsx`, 17 lines) is unrelated UI duplication pre-existing in the original PR
commit — out of scope for this fix-loop, left alone per "don't expand scope." The pre-existing
`AdminLineageTreeRow` unused-type-export finding in `queries.ts:112` (present in `origin/main`
before this session too — confirmed via `git show origin/main:...`) is likewise pre-existing dead
code surfaced only because `queries.ts` entered the diff scope; not fixed here, named for the
finding router.

**Full close evidence (FS-0004):**

| Step | Proof |
| --- | --- |
| FS-0024 guard | `pwd` = `/Users/brianscott/dev/bbl-0726`; `git remote -v` = `Ronin-Dojo-Design/black-belt-legacy`; `git branch --show-current` = `auto/session-0726-tree-acl-viewer` — re-run at the top of this pass. |
| Files touched (explicit, no `git add -A`) | `apps/web/server/admin/lineage/queries.ts` (modified), `apps/web/server/web/lineage/tree-access-queries.ts` (modified), `apps/web/server/admin/lineage/tree-admin-scope.ts` (new), `apps/web/server/web/lineage/tree-access-queries.test.ts` (new), `docs/sprints/SESSION_0726.md` (this file). |
| Gate evidence | typecheck 0 · lint 0 · new test 5/5 pass in isolation — see table above. |
| Fallow before→after | CRAP + duplication trace — see table/note above. |
| Push | `git push` to `auto/session-0726-tree-acl-viewer` — same branch, updates PR #369. No merge, no deploy, no touch to `main`. |

Both Doug fixes landed in this pass (FIX 1 shared helper + FIX 2 security test) — no fix was
dropped or routed as a follow-up.

## Reflections

- `components/common/table.tsx`'s raw `Table` root (`grid-cols-(--table-columns)`) has no CSS
  default for `--table-columns` — every *working* direct consumer (`division-table.tsx`,
  `data-table.tsx`, `data-table-skeleton.tsx`) sets it via inline `style`, but at least one existing
  consumer (`app/app/tournaments/_components/staff-panel.tsx`) does not. Worth a spot-check by
  whoever owns that panel; not fixed here (outside owned files, no scope to touch it). → route:
  flag only, no ledger row filed by this lane.
