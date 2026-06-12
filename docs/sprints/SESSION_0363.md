---
title: "SESSION 0363 — Phase 1b: D4 resource-grant seam + Ronin role mapping (cloud run)"
slug: session-0363
type: session--implement
status: closed
created: 2026-06-11
updated: 2026-06-11
last_agent: claude-session-0363
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0362.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0363 — Phase 1b: D4 resource-grant seam + Ronin role mapping

> **Cloud run.** Executed unattended on a feature branch
> (`session-0363-orpc-phase-1b`) with a PR opened for the operator. Bow-out /
> full close + browser verification happen later on the operator's machine; the
> bottom sections (`Review log` → `Full close evidence`) are intentionally left
> as bow-out stubs.

## Date

2026-06-11

## Operator

Brian (away) + claude-session-0363 (unattended cloud run)

## Goal

BBL-SOT-Spec **Phase 1b**: build the **D4 resource-grant seam** — extend the
flat oRPC permission layer so BBL can express per-resource authority
(`TREE_ADMIN` of a tree / `BRANCH_EDITOR` of a branch / `NODE_EDITOR` of a node)
layered ON TOP of the flat global roles, backed by the existing
`LineageTreeAccess` model, per SOT-ADR D4. `claim.review` must be expressible
this way (D6). Also map the Ronin `tournament_director` role into `roles.ts`.
Keep flat `can()` byte-compatible; the seam is purely additive. Better-Auth
plugins are stretch-only.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0362.md`
- Carryover: 0362 landed the brand-aware oRPC scaffold (Phase 1a) — flat
  `can()`/roles, `health` smoke, brand middleware. Its `Next session` block
  queued exactly this slice (D4 seam + role mapping + auth-plugin stretch). The
  Phase-1a grant map was deliberately minimal; 1b fills the RBAC model.

### Branch and worktree

- Branch: `session-0363-orpc-phase-1b` (off `main`)
- Worktree: cloud sandbox `/home/user/ronin-dojo-baseline`
- Status at bow-in: clean
- Current HEAD at bow-in: `09ab5b1`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Authorization (`can()` / roles permission gate) — the Phase-1 substrate ported in 0362 |
| Extension or replacement | Extension: the upstream `permissions.ts` documents an "adding ownership grants" pattern; D4 implements exactly that as an ADDITIVE seam (`canWithGrants` / `canForResource`), flat `can()` untouched |
| Why justified | SOT-ADR D4 — upstream flat roles have no per-resource ownership; BBL needs tree/branch/node authority for editor + claim review |
| Risk if bypassed | Claim review (Phase 4) + lineage editor would have no scoped-authority model — either everyone-or-admin, violating D4/D6 |

Live docs checked during planning: captured upstream `dirstarter_template`
permission model (read via 0362's port); not re-fetched (per 0361 decision).

### Graphify check

Skipped — files pinned by the SESSION_0362 next-session block and the task
spec; schema (`LineageTreeAccess` / `LineageTreeAccessRole`) and existing
consumers (`editor-actions.ts`, `claim-review-actions.ts`) read directly.

## Petey plan

### Goal

A pure, unit-tested resource-grant matcher + thin DB resolver that extends
`can()` with `LineageTreeAccess` tree/branch/node scope, plus the
`tournament_director` flat-role mapping — all gates green, flat path unchanged.

### Tasks

#### SESSION_0363_TASK_01 — D4 resource-grant seam

- **Agent:** Cody (inline)
- **What:** `server/orpc/resource-permissions.ts` — pure `canWithGrants(user,
  permission, resource, grants)` + async `canForResource(db, user, permission,
  resource)`; `LINEAGE_RESOURCE_GRANTS` role→grant matrix in `roles.ts`;
  comprehensive pure tests.
- **Done means:** pure tests pass; typecheck/lint/format green; flat `can()`
  byte-identical.
- **Depends on:** nothing

#### SESSION_0363_TASK_02 — Ronin `tournament_director` mapping

- **Agent:** Cody (inline)
- **What:** add `tournament_director` to the `Role` union + `ROLES` (USER_GRANTS
  + minimal `tournaments.*`); flip the `permissions.test.ts` guest-fallback
  assertion to the new mapped behavior.
- **Done means:** `permissions.test.ts` green with the flipped expectation.
- **Depends on:** nothing

#### SESSION_0363_TASK_03 — Better-Auth plugins (STRETCH)

- **Agent:** Cody (inline)
- **What:** `admin()` / `nextCookies()` / `oneTimeToken()` + `better-auth`
  `^1.6.x` bump.
- **Done means:** wired + typecheck green — OR cleanly deferred if install
  fights the sandbox.
- **Depends on:** TASK_01, TASK_02 committed

### Open decisions

None — operator ratified scope via the SESSION_0362 next-session block.

### Risks

- **Schema field names differ from the spec prose.** The prompt referenced a
  `LineageAccessRole` enum; the actual schema is `LineageTreeAccessRole` with a
  fourth value `TREE_EDITOR` (not just TREE_ADMIN/BRANCH_EDITOR/NODE_EDITOR).
  Resolved by reading the schema + consumers and modelling all four roles. Not
  a blocker — the D4 plan holds, the field shape is richer than the prose, not
  contradictory.

### Scope guard

- No schema changes (`LineageTreeAccess` used as-is).
- No changes to `next-safe-action` code paths, entity actions, or the existing
  procedure middleware order — the seam is ADDITIVE only.
- No BBL hardcoding in shared primitives (brand-neutral).
- No DB-backed integration tests RUN here (no Postgres in sandbox); CI runs them.

### Dirstarter implementation template

- **Docs read first:** captured upstream permission model (via 0362 port);
  schema `prisma/schema.prisma` (`LineageTreeAccess` / `LineageTreeAccessRole`);
  consumers `server/web/lineage/editor-actions.ts`,
  `server/admin/lineage/claim-review-actions.ts`.
- **Baseline pattern to extend:** upstream `can()` + the documented "adding
  ownership grants" extension point.
- **Custom delta:** `canWithGrants` (pure) + `canForResource` (resolver) +
  `LINEAGE_RESOURCE_GRANTS`; `tournament_director` flat role.
- **No-bypass proof:** flat `can()` untouched; both new entry points consult it
  first, so resource grants can only ADD authority — never narrow the existing
  path.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0363_TASK_01 | landed | `resource-permissions.ts` (`canWithGrants` pure + `canForResource` resolver) + `LINEAGE_RESOURCE_GRANTS` in `roles.ts` + 24 pure tests. Tree/branch/node scope, revoked-grant skip, flat-admin bypass, guest/null deny, unknown-role deny, multi-grant most-permissive. |
| SESSION_0363_TASK_02 | landed | `tournament_director` added to `Role` + `ROLES` (USER_GRANTS + `tournaments.*`); `permissions.test.ts` flipped to assert mapped behavior (+ unmapped-role still denies). |
| SESSION_0363_TASK_03 | deferred | Better-Auth plugins/version bump NOT attempted — stretch-only, needs network `bun add`, half-wired auth risk, no browser verification possible unattended. Re-queued for the operator's machine. |

## What landed

- **D4 resource-grant seam** (`server/orpc/resource-permissions.ts`):
  - `canWithGrants(user, permission, resource, grants)` — **pure**, DB-free,
    unit-testable. Consults flat `can()` first (admin + global grants bypass),
    then matches preloaded `LineageTreeAccess` rows by role-grant ×
    resource-scope.
  - `canForResource(db, user, permission, resource)` — thin async resolver;
    loads active (`revokedAt: null`) grants for the tree and delegates. Types
    `db` via `import type { db as appDb } from "~/services/db"` (matching
    `claim-review-actions.ts` / `editor-actions.ts`).
  - `LINEAGE_RESOURCE_GRANTS` in `roles.ts` — minimal role→grant matrix grounded
    in `editor-actions.ts` usage; `claim.review` expressible at every level (D6).
- **`tournament_director` flat role** mapped in `roles.ts` (USER_GRANTS +
  `tournaments.*`), mirroring `lib/safe-actions.ts`'s
  `tournamentAdminActionClient`.
- **Tests:** `resource-permissions.test.ts` (24) + updated `permissions.test.ts`
  (12) → **36 pass / 0 fail** under `bun test server/orpc/`.

## Decisions resolved

- **Branch matching is pre-resolved into the resource, not computed in the pure
  matcher.** `LineageResource.branchRootMemberIds` carries the target's
  ancestor-chain member ids (the set a `BRANCH_EDITOR.rootMemberId` must hit).
  The caller — which already holds the member graph (cf.
  `editor-graph.isLineageMemberInBranch`) — computes it, keeping `canWithGrants`
  pure and DB-free. The resolver stays thin (grants query only).
- **All four `LineageTreeAccessRole` values modelled** (incl. `TREE_EDITOR`,
  which the spec prose omitted): `TREE_ADMIN` → `lineage.*` + `claim.review`;
  `TREE_EDITOR` → member/relationship edits + `claim.review` (no admin-only
  `lineage.group.edit`); `BRANCH_EDITOR` → in-branch member/relationship edit +
  `claim.review`; `NODE_EDITOR` → own-node edit + `claim.review` (no
  re-parenting — mirrors `NODE_EDITOR_CANNOT_REPARENT`).
- **Flat path preserved byte-for-byte** — `can()` / `roles.ts ROLES`
  semantics for `admin`/`user`/`guest` unchanged; `tournament_director` is a new
  key, not a change to existing ones.
- **Better-Auth plugins deferred** (see Task log / Open decisions).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/orpc/resource-permissions.ts` | New — `canWithGrants` (pure), `canForResource` (resolver), `LineageGrant`/`LineageResource` types. |
| `apps/web/server/orpc/resource-permissions.test.ts` | New — 24 pure unit tests for the D4 seam. |
| `apps/web/server/orpc/roles.ts` | Added `tournament_director` to `Role`+`ROLES`; added `LINEAGE_RESOURCE_GRANTS` matrix. |
| `apps/web/server/orpc/permissions.test.ts` | Flipped `tournament_director` expectation to mapped behavior; kept unmapped-role deny. |
| `docs/sprints/SESSION_0363.md` | This session file. |

## Verification

| Command / gate | Result |
| --- | --- |
| `bun install --frozen-lockfile` (root, CI dummy env) | EXIT 0 (647 installs / 805 pkgs) |
| `bun run db:generate` (Prisma client) | EXIT 0 — Prisma Client 7.8.0 → `apps/web/.generated/prisma` |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | EXIT 0, 0 errors |
| `bun run lint:check` (oxlint) | EXIT 0 — only pre-existing warnings, none in touched files |
| `bun run format:check` (oxfmt, 1242 files) | EXIT 0 |
| `bun test server/orpc/` | 36 pass / 0 fail (69 expect calls) |

> DB-backed integration coverage (the `canForResource` query path) is NOT run
> here — no Postgres in the sandbox. CI exercises it on the PR.

## Open decisions / blockers

- **Better-Auth plugins + version bump (Task 3)** — deferred to the operator's
  machine: needs network `bun add`, and a half-wired auth change is explicitly
  out of bounds without browser verification.
- **`canForResource` runtime/DB path** unit-typed only here; first exercised
  when Phase 4 claim review wires to it (and by CI's DB-backed suite).
- **Branch-ancestor computation helper** — the caller currently must assemble
  `branchRootMemberIds`. A shared helper (reusing `editor-graph`) could land
  with the first `canForResource` consumer in Phase 4.

## Next session

### Goal

Wire the D4 seam into a real consumer (Phase 4 claim review gates `claim.review`
through `canForResource`), and land the Better-Auth plugins (`admin()`,
`nextCookies()`, `oneTimeToken()`) + `better-auth ^1.6.x` bump on the operator's
machine where install + browser auth verification are available.

### First task

On the operator's machine: attempt the Better-Auth plugin/version work
(stop the dev server before install, per the 0360 rule); if clean, verify the
auth flow in-browser. Then begin the Phase 4 claim-review wiring against
`canForResource`, adding the branch-ancestor helper.

## Review log

### SESSION_0363_REVIEW_01 — D4 seam (cloud run → PR #61 → merged)

- **Reviewed tasks:** SESSION_0363_TASK_01, _02, _03 (deferred)
- **Reviewer:** operator-side claude session (same chat that dispatched the run); diff reviewed
  before merge — flat `can()` untouched, deny-by-default on unknown roles, `revokedAt` honored in
  both layers, NODE_EDITOR matches node OR member id, claim-review matrix matches D6 verbatim.
- **Merged:** PR #61 → `edb74b2` (squash). CI on the PR: typecheck/oxc/unit (incl. DB-backed suite
  on CI Postgres)/Playwright ×3/Vercel preview — all green.
- **Verdict:** first unattended cloud implementation run for this repo; line-faithful to the brief,
  and it caught `TREE_EDITOR` (4th `LineageTreeAccessRole` the spec prose omitted) by reading the
  schema instead of guessing. Draft-PR-by-default behaved exactly as designed.
- **Score:** 9.0/10
- **Follow-up:** Better-Auth plugins (local), Phase-4 `canForResource` consumer + branch-ancestor helper.

## Hostile close review

- **Giddy:** pass — additive seam, no schema/auth/payload surface changed; resource grants can only
  add authority, never remove; clients can't influence grants.
- **Doug:** pass with recorded gap — `canForResource`'s DB path is exercised by CI's suite but has
  no dedicated integration test until the Phase-4 consumer lands (recorded in Open decisions).
- **Desi:** not applicable (no UI).
- **Kaizen aggregate:** 9/10 — the cloud-dispatch pattern (tight brief + draft-on-doubt + CI as
  authoritative gate) produced mergeable work on the first attempt.

## ADR / ubiquitous-language check

- ADR update not required — this session *implements* SOT-ADR D4 (no new
  decision). Modelling `TREE_EDITOR` alongside the three roles named in D4 is an
  engineering grounding (the schema already has it), recorded here + in code
  comments, below ADR threshold.
- Ubiquitous language update not required — no new domain terms; reuses
  `LineageTreeAccess` / `LineageTreeAccessRole` vocabulary.

## Reflections

- **The unattended-cloud pattern works when the brief carries the context.** A fully self-contained
  prompt (exact files to read, hard constraints, draft-on-doubt escape hatch, CI as the authoritative
  gate) produced a mergeable PR cold. The brief is the bottleneck, not the model.
- **Read-the-schema beat the spec prose:** D4 named three resource roles; the schema has four. The
  agent modelled `TREE_EDITOR` from `LineageTreeAccess` reality instead of following the doc — the
  correct priority order (live code > doc), unprompted.
- **Cloud runs share the account usage pool.** The follow-up 0364 run was killed silently by the
  operator's session limit (no branch, no PR, no error surface). Lesson: fire cloud dispatches with
  usage headroom, and watch with a deadline so silence ≠ progress.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION doc frontmatter current (`last_agent` cloud session; close stamped by operator-side session). |
| Backlinks/index sweep | `wiki/index.md` SESSION_0363 row added at this close. |
| Wiki lint | `bun run wiki:lint` — result in close chat. |
| Kaizen reflection | Reflections present: yes (3 entries). |
| Hostile close review | SESSION_0363_REVIEW_01; Giddy/Doug pass (1 recorded gap). |
| Review & Recommend | Next session block written by the cloud run; superseded in part by SESSION_0364 (already executed). |
| Memory sweep | `bbl-sot-spec-program` memory already current (D4/D8); no new standing fact. |
| Next session unblock check | Unblocked (0364 already ran; Better-Auth plugins queued local). |
| Git hygiene | Landed via PR #61 review → squash `edb74b2`; close-ritual docs commit via main push at this close. |
| Graphify update | Run before this close commit — count in close chat. |
