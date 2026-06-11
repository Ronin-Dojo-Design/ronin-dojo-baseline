---
title: "SESSION 0362 — oRPC scaffold + brand-aware context (BBL-SOT-Spec Phase 1a)"
slug: session-0362
type: session--implement
status: closed
created: 2026-06-11
updated: 2026-06-11
last_agent: claude-session-0362
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0361.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0362 — oRPC scaffold + brand-aware context (BBL-SOT-Spec Phase 1a)

## Date

2026-06-11

## Operator

Brian + claude-session-0362

## Goal

BBL-SOT-Spec **Phase 1a**: port the oRPC scaffold from the captured upstream
(`dirstarter_template` @ `76c8e1e`) into `apps/web`, **brand-aware** — upstream `Context` is
brand-less; Ronin adds `brand` + a `withBrand` middleware (server-side `getRequestBrand()`,
mirroring `lib/safe-actions.ts`). Scope: scaffold + brand context + `ping`/`health.brand` smoke
only. No entity routers, no Better-Auth change, no `next-safe-action` removal (those are 1b/1c).
Deps already landed + build-proven (SESSION_0360). Continues in-chat from SESSION_0361
(closed at `3b4cada`), per the 0359→0360 precedent.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0361.md`
- Carryover: 0361 (plan) ratified oRPC-first + SOT-ADR D8 (cutover armed early, DNS flip =
  post-Phase-3 checkpoint) and confirmed this exact slice as next. First task unblocked.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean (after `3b4cada` push)
- Current HEAD at bow-in: `3b4cada`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Data layer (oRPC) + authorization (`can()`/roles) + rate limiting — the Phase-1 substrate |
| Extension or replacement | Extension: verbatim port of upstream `server/orpc/*`, `lib/orpc-*`, `app/api/rpc` with ONE Ronin delta — brand-aware `Context` (`withBrand` middleware) |
| Why justified | SOT-ADR D3 (full oRPC adoption) + D3 hard gate (brand-scope must be preserved → the brand delta) |
| Risk if bypassed | Identity/claim phases would build on the retiring `next-safe-action` layer (D2 violation) |

Live docs checked during planning: in-repo captured upstream `76c8e1e` (BBL-SOT-Spec Phase 0 capture is the pinned reference; per 0361 decision, no re-fetch).

### Graphify check

Skipped — exact files pinned by BBL-SOT-Spec/SESSION_0361 next-session block; all upstream
source files read directly from `dirstarter_template` (paths in Task log).

## Petey plan

### Goal

Working `/api/rpc` with the upstream middleware pipeline + brand-aware context, proven by
`ping` + `health.brand` smoke on `bbl.local`, all gates green.

### Tasks

#### SESSION_0362_TASK_01 — Port oRPC scaffold (brand-aware)

- **Agent:** Cody (inline)
- **What:** Port `server/orpc/{context,procedure,permissions,permissions.test,roles,rate-limit,revalidate,helpers}.ts`, `server/router.ts`, `lib/orpc-{server,client,query}.ts`, `app/api/rpc/[[...rest]]/route.ts` from `dirstarter_template` @ `76c8e1e`, adding `brand` to `Context` + `withBrand` middleware; minimal Ronin grant map (`health.read` public) pending the 1b RBAC mapping.
- **Done means:** files exist, typecheck/oxlint/oxfmt green, ported permissions test passes under `bun test`.
- **Depends on:** nothing

#### SESSION_0362_TASK_02 — Smoke proof on bbl.local

- **Agent:** Doug (inline)
- **What:** Dev server up; `/api/rpc/ping` responds; `health.brand` returns `BBL` for `bbl.local` host (and a different brand for another host) proving the brand middleware; record curl evidence.
- **Done means:** captured request/response evidence in this file.
- **Depends on:** SESSION_0362_TASK_01

### Open decisions

None — operator ratified scope in SESSION_0361.

### Risks

- **Upstream redis = ioredis; Ronin redis = `@upstash/redis` (REST)** — incompatible with
  `RateLimiterRedis`. 1a ships `RateLimiterMemory` only (per-instance; still net-new protection —
  the current action layer has none). Redis-backed limiter = 1b follow-up.
- `revalidateTag(tag, "infinite")` (upstream) vs Ronin's `updateTag` idiom — port uses Ronin's
  `updateTag` to preserve existing cache semantics (`lib/safe-actions.ts` parity).

### Scope guard

- No entity routers (1c), no Better-Auth plugin changes (1b), no `next-safe-action` removal, no
  `/api/v1` (Phase 5), no TanStack Query provider in layout (rides 1c with the first client consumer).

### Dirstarter implementation template

- **Docs read first:** captured upstream files (paths in Task log), read 2026-06-11.
- **Baseline pattern to extend:** upstream oRPC pipeline (base-context → session → rate-limit → permission).
- **Custom delta:** `brand` in `Context`; `withBrand` middleware; `rsc()` injects brand; memory-only rate limiter; `updateTag` revalidate.
- **No-bypass proof:** files are line-faithful ports except the documented deltas above.

## Cody pre-flight

### Pre-flight: oRPC scaffold port

1. **Existing component scan:** no `lib/orpc*`, `server/orpc/`, `server/router.ts`, or `app/api/rpc` in `apps/web` (verified SESSION_0361 audit). `lib/safe-actions.ts` + `lib/brand-context.ts` read as the brand/source patterns to mirror.
2. **L1 template scan:** upstream source = `dirstarter_template` @ `76c8e1e` (all 13 files read this session).
3. **Composition decision:** new files; one delta (brand) over verbatim port.
4. **Lane docs loaded:** SESSION_0361 next-session block; BBL-SOT-Spec Phase 1; SOT-ADR D3/D4.
5. **Dev environment:** `cd apps/web && npx next dev --turbo` (FS-0002); test host `bbl.local:3000`.
6. **FAILED_STEPS check:** FS-0002 (dev server cmd) acknowledged; stop dev server before any install (0360 rule — no installs planned, deps landed).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0362_TASK_01 | landed | 12 files ported (brand-aware); typecheck/oxlint/oxfmt green; 12/12 permissions tests pass. |
| SESSION_0362_TASK_02 | landed | `/api/rpc/ping` ok; `health/brand` → `BBL` (bbl.local) vs `BASELINE_MARTIAL_ARTS` (baseline.local) — brand middleware proven per-request. |
| SESSION_0362_TASK_04 | landed | **Post-close fix-forward 2 (Vercel deploy red):** every prod deploy since the 0360 push errored — 90 × `Can't resolve '~/.generated/prisma/*'`. Cause: Prisma generates into the SOURCE TREE (`apps/web/.generated`), and when the lockfile is unchanged Vercel restores its install cache so `postinstall` (db:generate) never re-runs → fresh checkout has no client. 0360's own deploy was Ready only because its lockfile change forced a cold install. Fix: `db:generate` added to `buildCommand` in BOTH `vercel.json`s (root + apps/web — the live one is apps/web, per the build log). Prod was up-but-stale (serving the 0360 deploy), not down. |
| SESSION_0362_TASK_03 | landed | **Post-close fix-forward (operator-directed):** Playwright E2E had been red on `main` since ≥2026-06-08 — `public-visibility.spec.ts` still asserted the pre-SESSION_0356 drawer tier-gate ("Highlight lineage path" control, drawer must NOT open), a UI deleted by the 0356 gate removal (D-022). Rewrote the helper/test to the ratified behavior: anonymous viewer opens the profile drawer, privacy boundary asserted WITH the drawer open (stronger leak check). 3/3 pass locally on chromium; unit suite separately verified post-uplift: **525 pass / 0 fail** (first full run since TS6/stripe-22 majors). |

## What landed

- **oRPC scaffold live at `/api/rpc`** — upstream `76c8e1e` pipeline (base-context → session →
  **brand** → rate-limit → permission) with `publicProcedure`/`authedProcedure`, `can()` flat-role
  permissions + ported unit tests, memory rate limiter, `updateTag` revalidate, `ensureFound`.
- **Brand-aware `Context` (the Ronin delta, SOT-ADR D3 hard gate):** `withBrand` middleware resolves
  per-request via `getRequestBrand()` (trusted `x-brand`/host); `rsc()` pre-injects brand+user+source;
  clients can never choose a brand.
- **`server/router.ts`:** `ping` + `health.brand` (gated by public `health.read`, so the smoke also
  exercises the permission gate). No entity routers yet (1c).
- **Smoke proven on two hosts** (see Verification) — brand is per-request, not baked.

## Decisions resolved

- **Memory-only rate limiter for 1a** — Ronin `services/redis.ts` is `@upstash/redis` (REST),
  incompatible with `RateLimiterRedis` (upstream uses ioredis). Redis-backed limiting = 1b follow-up.
- **`updateTag` over upstream's `revalidateTag(tag, "infinite")`** — matches `lib/safe-actions.ts`
  so both layers invalidate identically during the migration.
- **`bun:test` import suppression** follows the existing repo idiom (`@ts-expect-error` on the
  import; `@types/bun` not a repo dep). Wiring `bun-types` into tsconfig is a cleanup candidate.
- **Phase-1a grant map is minimal** (`health.read` public only); the real RBAC mapping (incl.
  `tournament_director`, D4 resource grants) is 1b.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/orpc/context.ts` | New — `Context`/`InitialContext` with Ronin `brand`. |
| `apps/web/server/orpc/procedure.ts` | New — pipeline + `withBrand` middleware (Ronin delta). |
| `apps/web/server/orpc/permissions.ts` | New — verbatim port (`can`, `matchesPattern`). |
| `apps/web/server/orpc/permissions.test.ts` | New — ported test, adapted to 1a grant map (12 tests). |
| `apps/web/server/orpc/roles.ts` | New — flat roles, minimal 1a grants, 1b mapping notes. |
| `apps/web/server/orpc/rate-limit.ts` | New — memory-only adaptation (upstash REST incompat documented). |
| `apps/web/server/orpc/revalidate.ts` | New — `updateTag` delta + `detailTags`. |
| `apps/web/server/orpc/helpers.ts` | New — verbatim `ensureFound`. |
| `apps/web/server/router.ts` | New — `ping` + `health.brand` root router. |
| `apps/web/lib/orpc-server.ts` | New — `rsc()` (brand-injecting) + `orNotFound`. |
| `apps/web/lib/orpc-client.ts` | New — verbatim RPC link client. |
| `apps/web/lib/orpc-query.ts` | New — verbatim TanStack router utils. |
| `apps/web/app/api/rpc/[[...rest]]/route.ts` | New — verbatim RPCHandler route. |
| `docs/sprints/SESSION_0362.md` | This session file. |
| `docs/knowledge/wiki/index.md` | SESSION_0362 row. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` (incl. `--incremental false` full check) | EXIT 0, 0 errors |
| `bun run lint:check` (oxlint) | EXIT 0, 0 errors (pre-existing warnings only) |
| `bun run format:check` (oxfmt) | EXIT 0 (1240 files) |
| `bun test server/orpc/permissions.test.ts` | 12 pass / 0 fail |
| `POST /api/rpc/ping` (Host: bbl.local) | `{"json":{"status":"ok","timestamp":"2026-06-11T17:20:19.008Z"}}` |
| `POST /api/rpc/health/brand` (Host: bbl.local) | `{"json":{"brand":"BBL","source":"rpc"}}` |
| `POST /api/rpc/health/brand` (Host: baseline.local) | `{"json":{"brand":"BASELINE_MARTIAL_ARTS","source":"rpc"}}` |

## Open decisions / blockers

- **1b follow-ups (not blockers):** Redis-backed rate limiting (ioredis or Upstash-native);
  full RBAC grant mapping (+ `tournament_director`, D4 resource-grant seam); Better-Auth plugins
  (`admin`/`nextCookies`/`oneTimeToken`) + version bump.
- This push contains `apps/web` code → Vercel prod build WILL run (unlike the 0361 docs-only push).
  Watch CI + Vercel; fix forward.

## Next session

### SESSION_0363 — Phase 1b: permission model + Better-Auth plugins

Per BBL-SOT-Spec §4.8 slice 1b:

- **Map the real grant matrix into `roles.ts`:** Ronin roles (`admin`, `user`, `guest`,
  `tournament_director` from `lib/safe-actions.ts`) + the PRD RBAC roles (TREE_ADMIN /
  BRANCH_EDITOR / NODE_EDITOR) via the **D4 resource-grant extension seam** — a
  `can(user, permission, resource?)` overload consulting `LineageTreeAccess`. Build the seam +
  its tests; claim review wires to it in Phase 4.
- **Better-Auth plugins:** add `admin()`, `nextCookies()`, `oneTimeToken()` to `lib/auth.ts` +
  bump `better-auth` toward `^1.6.x` (template parity). **Stop the dev server before any install**
  (0360 rule).
- **Optional if room:** Redis-backed rate limiter decision (ioredis client vs Upstash-native).

### First task

Write the D4 `can(user, permission, resource?)` extension with `LineageTreeAccess`-backed
tree/branch/node scope + unit tests, keeping the flat-role path byte-identical for non-resource
calls. Unblocked — no operator input needed.

## Review log

### SESSION_0362_REVIEW_01 — oRPC scaffold (Phase 1a)

- **Reviewed tasks:** SESSION_0362_TASK_01, SESSION_0362_TASK_02
- **Dirstarter docs check:** captured upstream `dirstarter_template` @ `76c8e1e` — all 13 source
  files read this session before porting (paths in Files touched).
- **Verdict:** Line-faithful port with exactly four documented deltas (brand middleware, memory
  limiter, `updateTag`, minimal grant map) — each justified against a repo constraint, none
  speculative. The smoke proves the one delta that matters (brand-per-request) on two hosts.
  What is NOT yet proven: the `rsc()` transport end-to-end (typechecked only; first exercised by
  the 1c pilot) and the FORBIDDEN deny path through the middleware (deny logic unit-covered in
  `can()`; middleware path exercised in 1b when a non-public permission exists).
- **Score:** 9.0/10
- **Follow-up:** 1b items in Open decisions.

## Hostile close review

- **Giddy:** pass — no schema change, no auth change, additive route only; brand resolution is
  server-side trusted-header, client cannot influence it (D3 gate honored).
- **Doug:** pass with two recorded gaps — `rsc()` and middleware-FORBIDDEN paths not yet
  runtime-proven (deferred to 1b/1c by scope, recorded in REVIEW_01, not papered over).
- **Desi:** not applicable (no UI).
- **Kaizen aggregate:** 9/10 — first-try smoke pass on a 13-file port; the one surprise
  (bun:test types) was resolved by reading the repo idiom instead of inventing a new fix.

## ADR / ubiquitous-language check

- **ADR update not required** — this session *implements* SOT-ADR D3 (no new decision). The four
  port deltas are engineering adaptations recorded here + in code comments, below ADR threshold.
- Ubiquitous language update not required.

## Reflections

- **The audit's "verbatim port + one delta" framing held.** 13 files, four deltas, every delta
  forced by a real repo difference (upstash vs ioredis, `updateTag` idiom, missing bun types,
  empty grant map). Zero invented architecture.
- **`tsc --incremental` can mask a missing-types failure** — the first `typecheck` "exit 0" was a
  pipeline artifact (`tail` exit), and incremental caching muddied diagnosis. `--incremental false`
  + `pipestatus` got ground truth. Worth remembering for any "why does only MY file error" moment.
- **The repo already had the answer** (the `@ts-expect-error` bun:test idiom across 95 test files).
  Grepping a sibling test beat adding a new dependency or tsconfig change mid-slice.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION doc `last_agent: claude-session-0362`; no wiki/architecture docs touched beyond index. |
| Backlinks/index sweep | `wiki/index.md`: SESSION_0362 row added; SESSION pairs_with 0361 + BBL-SOT-Spec. |
| Wiki lint | `bun run wiki:lint` — result in bow-out chat. |
| Kaizen reflection | Reflections present: yes (3 entries). |
| Hostile close review | SESSION_0362_REVIEW_01; Giddy/Doug pass (2 recorded runtime-proof gaps). |
| Review & Recommend | Next session = 1b (D4 seam + auth plugins), first task unblocked. |
| Memory sweep | No new standing fact (scaffold facts live in BBL-SOT-Spec/this file; program memory already current). |
| Next session unblock check | Unblocked. |
| Git hygiene | Branch `main`; single push at close; hash reported at bow-out — see git log. FS-0024 guard run. |
| Graphify update | Run before the close commit — count in bow-out chat. |
