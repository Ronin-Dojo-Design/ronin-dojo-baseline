---
title: "SESSION 0580 — G-022 Lane B: member technique-progress wiring"
slug: session-0580
type: session--open
status: closed
created: 2026-07-19
updated: 2026-07-19
last_agent: claude-session-0580
sprint: S1
lane: bbl
lane_seq:
vault_session:
goal_ids: [G-022]
tickets: []
next_session:
pairs_with:
  - docs/sprints/SESSION_0578.md
  - docs/sprints/SESSION_0582.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0580 — G-022 Lane B: member technique-progress wiring

## Date

2026-07-19

## Operator

Brian + claude-session-0580

## Goal

Wire the existing zero-write-path `TechniqueProgress` model (NOT_STARTED→LEARNING→DRILLING→
SPARRING→MASTERED, `@@unique[userId,techniqueId]`): a new oRPC domain router (own-user
upsert/clear, no entitlement gate), a detail-page tracking control, and dashboard wiring — the
G-022 fan-out's flip-blocking Lane B (`session-0580-technique-progress`).

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0578.md` (the G-022 fan-out plan + the three
  pinned lane prompts, incl. this lane's paste-ready prompt at line ~491).
- Carryover: SESSION_0578 ratified the GA bar and the three-lane split (C→B→A); SESSION_0582
  dispatched this lane per the fan-out recipe with the operator's AUD2-5 grill outcome ALREADY
  PINNED (leading glyph in the identity cluster) — no re-grill needed at bow-in.

### Branch and worktree

- Branch: `session-0580-technique-progress`
- Worktree: `/Users/brianscott/dev/ronin-0580`
- Status at bow-in: reset hard to `origin/main`, clean.
- Current HEAD at bow-in: `9f3f4696` (`Merge branch 'session-0582-mmb-import'`)
- `git log --oneline main..session-0580-technique-progress` was EMPTY at bow-in (FS-0030 check
  passed — branch existed but carried no commits yet).

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (existing `TechniqueProgress` model, no migration), oRPC procedure/router idiom |
| Extension or replacement | Extension — new own-user oRPC router mirroring `promotion/router.ts` / `belt/router.ts`; no Dirstarter capability replaced |
| Why justified | ADR 0024 full-oRPC direction; the model already exists with zero write paths |
| Risk if bypassed | A `next-safe-action` surface here would fork the mutation transport mid-migration |

Live docs checked during planning: not applicable (server/oRPC + component work, no Dirstarter
storage/payments/media/blog/auth/theming surface touched beyond the existing Select/Button/Table
L1 primitives).

### Graphify check

Skipped — Graphify reports 0 nodes in a fresh worktree (not-built, per the gotcha floor); the
lane's owned-file set was fully enumerated by the dispatch prompt + `docs/epics/technique-graph-ga-fanout.md`,
so repo-wide discovery wasn't needed.

### Grill outcome

AUD2-5 (progress display channel) was ratified and PINNED by the operator in the dispatch
prompt itself (2026-07-19) — not re-opened at this bow-in:

- Channel = a **leading glyph** in the technique's identity cluster (○ not-started / dashed-ring
  and dotted-ring in-progress states / ✓ mastered), one neutral tone — never a new color channel,
  never touching the trailing attribute badge row or `Foundational`.
- Directory rich-profile projection of `techniqueProgress` stays AS-IS (already
  `canRenderRichMedia`-gated) — verify no-leak, don't touch the file.

### Drift logged

None new. Confirmed (did not need to re-litigate): `findUserTechniques` in
`server/web/dashboard/queries.ts` already exists for AUTHORED/managed techniques — a DIFFERENT
dataset from the progress-tracking rows this lane adds; the new `findUserTechniqueProgress` sits
beside it (additive), not a replacement.

## Petey plan

### Goal

Ship the own-user technique-progress write surface + its two read/render consumers
(technique-detail page, dashboard) inside the disjoint Lane B file set, self-review, commit
locally — no push.

### Tasks

#### SESSION_0580_TASK_01 — oRPC progress router + query/write layer

- **Agent:** Cody
- **What:** `server/web/techniques/progress.ts` (uncached read/upsert/clear over the compound
  `userId_techniqueId` key) + `server/techniques/router.ts` (`setProgress`/`clearProgress`,
  `authedProcedure`, no `meta.permission` — mirrors `promotion/router.ts`'s own-user pattern) +
  one registration line in `server/router.ts`.
- **Steps:** read `belt/router.ts` + `promotion/router.ts` for the idiom; write `progress.ts` +
  `progress.test.ts` (WL-P2-64 mocked-Prisma query-shape idiom); write the router with an
  in-brand technique-existence guard; register.
- **Done means:** `bun test server/web/techniques/progress.test.ts` green; router type-checks;
  registered in `appRouter`.
- **Depends on:** nothing

#### SESSION_0580_TASK_02 — shared progress glyph + detail-page control

- **Agent:** Cody
- **What:** `components/common/technique-progress-status.tsx` (shared `Record<Status, glyph>`
  map + accessible `TechniqueProgressGlyph`, mirrors `tool-status.tsx`) + NEW
  `technique-progress-control.tsx` mounted near the Save row in `technique-detail/index.tsx` +
  `technique-detail-format.ts` type extension + `[slug]/page.tsx` wiring (own-progress read,
  `null` for anonymous viewers).
- **Steps:** design the 5-glyph shape progression (Circle→CircleDashed→CircleDotDashed→
  CircleDot→CircleCheck, one neutral tone); build the client control (`client.techniques.*`,
  optimistic + rollback, matches `belt-promotion-request.tsx`'s oRPC-from-client idiom); wire
  `page.tsx` to resolve session + `findOwnTechniqueProgress`.
- **Done means:** control renders only for a signed-in viewer; status change round-trips via the
  oRPC client; runtime proof captured.
- **Depends on:** SESSION_0580_TASK_01

#### SESSION_0580_TASK_03 — dashboard wiring

- **Agent:** Cody
- **What:** `findUserTechniqueProgress` (NEW, additive) in `server/web/dashboard/queries.ts` +
  its test; NEW `TechniqueProgressTable` export in `techniques-table.tsx`; wired into
  `techniques-tab.tsx` alongside the existing authored-techniques `TechniquesTable`.
- **Steps:** add the query beside `findUserTechniques` (do not touch it); add the table export
  using the same shared glyph; fetch + render in the tab.
- **Done means:** `bun test server/web/dashboard/queries.test.ts` green (existing + new describe
  block); tab renders both sections.
- **Depends on:** SESSION_0580_TASK_01, SESSION_0580_TASK_02 (shared glyph)

#### SESSION_0580_TASK_04 — gates + runtime proof + no-leak verification

- **Agent:** Cody
- **What:** typecheck / lint / format:check / test / build; live write-path proof via a dev
  server on :3580; confirm the EXISTING directory no-leak test
  (`profile-detail-projection.test.ts`) still passes untouched.
- **Steps:** run each gate; boot `next dev --turbo -p 3580`; exercise upsert→render→clear.
- **Done means:** all gates green; evidence recorded below.
- **Depends on:** SESSION_0580_TASK_01..03

### Parallelism

Sequential — every task touches the same small owned-file set (progress.ts → glyph → control →
dashboard all compose on each other); no sub-agent fan-out justified at this scale.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0580_TASK_01 | Cody | Server write-surface build |
| SESSION_0580_TASK_02 | Cody | Component build, reuses L1 primitives |
| SESSION_0580_TASK_03 | Cody | Additive query + table wiring |
| SESSION_0580_TASK_04 | Cody | Self-review gate pass |

### Open decisions

None — AUD2-5 was pre-ratified in the dispatch prompt.

### Risks

Sibling worktrees 0579/0581 running concurrent `tsc` on the same host caused heavy CPU/memory
contention, stretching every gate's wall-clock time significantly. No correctness risk — noted
for the record only.

### Scope guard

- No migration (the model needs none; a schema gap would have been a STOP-and-flag, not hit).
- No entitlement gate on own-progress writes (ratified: free tier included).
- No edits to `technique-graph.tsx`, `components/web/techniques|curriculum/*`,
  `server/web/curriculum/queries.ts`, `bbl-bjj-graph.json`, `lib/feature-log.ts`/`FEATURES.md`, or
  the beta flip (all Lane A).
- No refactor of `findUserTechniques` or the existing staff predicates in `permissions.ts` —
  additive only.
- No new permission grant in `server/orpc/roles.ts` — the own-user pattern needs none (mirrors
  `promotion/router.ts`'s `submit`, which also omits `meta.permission`).

### Dirstarter implementation template

- **Docs read first:** not applicable (no Dirstarter L1 surface replaced).
- **Baseline pattern to extend:** the repo's own oRPC domain-router idiom
  (`server/<entity>/router.ts` + `authedProcedure`), not a purchased Dirstarter template.
- **Custom delta:** own-user progress tracking is a Ronin-specific domain feature.
- **No-bypass proof:** nothing purchased is being replaced.

## Cody pre-flight

### Pre-flight: oRPC progress router + control + dashboard wiring

#### 1. Existing component scan

- Searched `components/common/`, `components/web/`, `app/(web)/dashboard/`,
  `app/(web)/techniques/[slug]/_components/technique-detail/` directly (Graphify unavailable in
  the fresh worktree).
- Found: `components/common/tool-status.tsx` (the shared `Record<Enum, icon>` precedent),
  `components/common/select.tsx` (requires an `items` prop even for enum values — every existing
  consumer in `technique-form.tsx` passes it), `belt-promotion-request.tsx` (the client
  `client.<router>.<procedure>()` + optimistic/toast idiom), `bookmarks/queries.ts` (the
  plain-function, no-injectable-db query-layer idiom used for `progress.ts` instead of the
  transaction-threaded `belt/queries.ts` shape).

#### 2. L1 template scan

- Consulted `docs/knowledge/wiki/dirstarter-component-inventory.md`: yes — confirmed `Badge`,
  `Select`, `Button`, `Table` are the correct primitives; no raw HTML used.
- Closest L1 pattern: `toolStatusIcon`/`toolStatusBadgeProps` (`components/common/tool-status.tsx`)
  for the shared status→glyph map; `promotion/router.ts` for the own-user oRPC procedure shape.
- Primitive API spot-check: `Select` needs `items={Record<value,label>}` even for static enum
  options (verified against every existing Select call site in `technique-form.tsx`); lucide-react
  `Circle`/`CircleDashed`/`CircleDotDashed`/`CircleDot`/`CircleCheck` confirmed present in the
  installed `lucide-react` package.

#### 3. Composition decision

- Extending existing component: none extended in place (additive files only).
- Composing existing components: `Stack`, `Select`/`SelectTrigger`/`SelectContent`/`SelectItem`/
  `SelectValue`, `Button`, `Badge`, `Table*`, `Note`, `H4`, `Link`.

#### 4. Lane docs loaded

- Prior SESSION next session read: yes (`SESSION_0578.md`, `SESSION_0582.md` dispatch).
- ADR read: ADR 0024 (full-oRPC direction, confirmed no next-safe-action surface added).
- Runbook consulted: `docs/protocols/fan-out-session-recipe.md`,
  `docs/epics/technique-graph-ga-fanout.md`.

#### 5. Dev environment confirmed

- Dev server command: `cd apps/web && npx next dev --turbo -p 3580` (preview_start cannot serve a
  worktree, per the gotcha floor).
- Working directory: `/Users/brianscott/dev/ronin-0580`
- Brand/host for testing: local BBL host, port 3580.

#### 6. FAILED_STEPS check

- Prior failures in this area: none found for technique-progress specifically.
- Mitigation acknowledged: FS-0027 (test-writing hook) — both new/edited `.test.ts` files follow
  the mocked-Prisma recorder idiom (WL-P2-64), `bun run test` is the only full-suite command used.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0580_TASK_01 | landed | `server/web/techniques/progress.ts` (+6-test query-shape file) + `server/techniques/router.ts` (`setProgress`/`clearProgress`, own-user, in-brand technique guard, no entitlement gate) + `techniques` registered in `appRouter`. |
| SESSION_0580_TASK_02 | landed | `components/common/technique-progress-status.tsx` (AUD2-5 leading-glyph channel: Circle→CircleDashed→CircleDotDashed→CircleDot→CircleCheck, one neutral tone, `role="img"`+`aria-label`) + `technique-progress-control.tsx` mounted beside `ListingSaveButton`; BOTH `TechniqueDetail` consumers wired (canonical `[slug]/page.tsx` + the profile-scoped `directory/[slug]/techniques/[techniqueSlug]/page.tsx`, discovered via the typecheck gate). |
| SESSION_0580_TASK_03 | landed | `findUserTechniqueProgress` (additive, uncached, brand via `technique:{brand}`) + query-shape test; `TechniqueProgressTable` ("My progress") added to `techniques-table.tsx`; `techniques-tab.tsx` fetches + renders it below the authored table. |
| SESSION_0580_TASK_04 | landed | All gates run (see Verification); runtime write-path proof on :3580 (upsert→transition→render→clear→auth-reject→friendly NOT_FOUND, throwaway rows cleaned up); no-leak regression green. |

## What landed

- The `TechniqueProgress` model has its first write path: `client.techniques.setProgress` /
  `clearProgress` over `/api/rpc` — own-user structural ownership, free tier included, no
  entitlement gate (ratified G-022 scope).
- The AUD2-5-ratified progress channel exists as ONE shared module
  (`components/common/technique-progress-status.tsx`) consumed identically by the detail-page
  control and the dashboard table; Lane A applies the same module to cards/graph later.
- Dashboard "My progress" section (tracked techniques, glyph + label + last-drilled) beside the
  existing authored-techniques table.
- Cache trap respected: progress reads are UNCACHED; progress writes revalidate only
  `/techniques/[slug]` + `/dashboard` paths — never the shared `"techniques"` /
  `"bjj-technique-graph"` content tags.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/techniques/router.ts` | NEW — oRPC domain router (`setProgress`/`clearProgress`), own-user, rate-limited, in-brand technique guard |
| `apps/web/server/router.ts` | `techniques` router registered in `appRouter` (one import + one key) |
| `apps/web/server/web/techniques/progress.ts` | NEW — uncached query/write layer over the compound `userId_techniqueId` key; `lastDrilledAt` auto-stamp semantics |
| `apps/web/server/web/techniques/progress.test.ts` | NEW — 6 mocked-Prisma query-shape tests (WL-P2-64 idiom) |
| `apps/web/components/common/technique-progress-status.tsx` | NEW — the ONE AUD2-5 glyph channel (label map + icon map + accessible `TechniqueProgressGlyph`), mirrors `tool-status.tsx` |
| `apps/web/app/(web)/techniques/[slug]/_components/technique-detail/technique-progress-control.tsx` | NEW — client control (Select + glyph + Clear), optimistic with rollback, oRPC client |
| `apps/web/app/(web)/techniques/[slug]/_components/technique-detail/index.tsx` | Control mounted in the Save row (renders only when `progress != null`) |
| `apps/web/app/(web)/techniques/[slug]/_components/technique-detail/technique-detail-format.ts` | `TechniqueDetailView.progress` added (null = anonymous) |
| `apps/web/app/(web)/techniques/[slug]/page.tsx` | Resolves session + own progress, threads `progress` down |
| `apps/web/app/(web)/directory/[slug]/techniques/[techniqueSlug]/page.tsx` | Same wiring for the second `TechniqueDetail` consumer (profile-scoped watch page) |
| `apps/web/server/web/dashboard/queries.ts` | ADDITIVE — `findUserTechniqueProgress` beside the untouched `findUserTechniques` |
| `apps/web/server/web/dashboard/queries.test.ts` | ADDITIVE — `techniqueProgress.findMany` recorder + new describe block; existing tests untouched |
| `apps/web/app/(web)/dashboard/techniques-table.tsx` | ADDITIVE — `TechniqueProgressTable` export beside the untouched `TechniquesTable` |
| `apps/web/app/(web)/dashboard/techniques-tab.tsx` | Fetches progress in the existing `Promise.all`, renders the new table |
| `docs/sprints/SESSION_0580.md` | This record |

NOT touched (owned-file options deliberately unused): `server/web/techniques/permissions.ts` — no
tracking predicate is needed; ownership is structural (`userId` = session id, never input), matching
`promotion/router.ts`'s no-`meta.permission` own-user pattern. Adding an empty predicate would have
been abstraction-for-later.

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run typecheck` | EXIT 0 (`✓ Types generated successfully`, tsc clean) — run twice, incl. post-format |
| `bun run lint:check` | EXIT 0 — pre-existing warnings only; the one new-file warning (unused catch param) fixed |
| `bun run format:check` (repo-wide, 1976 files) | EXIT 0 after `bun run format` normalized the 6 new/edited files |
| `bun run test` (full suite) | 1367 pass / 48 fail / 8 errors under LIVE sibling-lane DB contention (0579+0581 suites on the same local Postgres, 1255s wall). ALL 48 failures are DB-integration hook-timeouts/FK races (the SOP's documented Head-2 class); zero name any Lane B surface. Spot-checked two failed files solo → both green (`server/admin/users/queries.test.ts` 2 pass; `server/admin/lineage/place-lead-core.test.ts` 8 pass). |
| `bun test server/web/techniques/progress.test.ts` | 6 pass / 0 fail |
| `bun test server/web/dashboard/queries.test.ts` | 3 pass / 0 fail (2 existing + 1 new) |
| `bun test server/web/directory/profile-detail-projection.test.ts` (no-leak regression, grill outcome 2) | 4 pass / 0 fail — free-tier projection keeps `techniqueProgress: []` + serialized-object leak check |
| `cd apps/web && npx next build` | EXIT 0 — `✓ Compiled successfully in 9.5min` + TypeScript pass green (wall time inflated by sibling-lane contention) |
| `bun run test` re-run on a briefly quiet DB | 1413 pass / 32 fail / 3 errors, 808s — Lane A's suite started again mid-run (same shared-Postgres contention). ALL fails = beforeEach/afterEach hook timeouts in DB-integration files. Solo re-runs of failed files: `server/web/techniques/queries.discovery.test.ts` 9 pass; `app/api/stripe/webhooks/route.test.ts` 10 pass (the P2003 file); `server/admin/lineage/claim-finalize.test.ts` 8 pass — all green while Lane A was STILL running. Failure class = cross-worktree shared-DB contention, not this diff; CI is the authoritative suite gate. |
| Runtime write-path proof (dev server :3580, oRPC client + signed Better-Auth cookie) | `setProgress(LEARNING)` → DB row `{status:LEARNING, notes, lastDrilledAt auto-stamped}`; `setProgress(MASTERED)` → transitioned; signed-in `GET /techniques/closed-guard` HTML contains "Mastered", anonymous GET contains NO control; `clearProgress` → row `null`; anonymous write → "Authentication required"; bad `techniqueId` → "Technique not found" (no raw P2003). Throwaway user/session/progress rows deleted (leftover `null`). |

## Open decisions / blockers

- **Full-suite green run not attainable locally while sibling lanes are live:** two full runs both
  overlapped a sibling lane's suite on the ONE shared local Postgres (48→32 DB hook-timeout fails,
  every spot-checked file green solo). CI remains the authoritative suite gate per the e2e-db
  memory; the merge sweep should confirm CI green.
- **Schema quirk flagged (Lane C's file — NOT fixed here):** `TechniqueProgress.updatedAt` is
  `@default(now())` WITHOUT `@updatedAt`, so it never auto-updates (visible in the runtime proof:
  `updatedAt` unchanged across a status transition). The dashboard's `orderBy: {updatedAt: "desc"}`
  therefore sorts by row creation. Adding `@updatedAt` is a Prisma-client-behavior change with zero
  SQL, but `schema.prisma` is Lane C-owned — routed to the merge sweep.

## Next session

### Goal

Lane A (`session-0581-technique-ga-design`) rebases over Lanes B+C, applies the same AUD2-5
leading-glyph channel to cards/graph nodes, and executes the beta→GA flip as its last commit.

### First task

Lane A reads this session's `Proposed ledger edits` + the shared glyph module
(`components/common/technique-progress-status.tsx`) before touching cards/graph.

## Review log

### SESSION_0580_REVIEW_01 — Cody self-review (Doug/Giddy/Desi review happens at the merge sweep)

- **Reviewed tasks:** SESSION_0580_TASK_01..04
- **Dirstarter docs check:** not applicable (no L1 surface replaced; primitives composed per inventory)
- **Verdict:** the write surface is structurally own-user (userId never an input), the AUD2-5
  channel is ONE shared module used identically in both mounts, both `TechniqueDetail` consumers
  compile-verified, the cache trap is respected (uncached reads, path-only revalidation), and the
  runtime proof exercised every procedure including both negative paths. Honest gaps: full-suite
  green unobtainable under live sibling contention (solo-proof substituted); the `Select`'s
  optimistic state briefly disagrees with the server if a write fails mid-flight (rolled back with
  a toast — accepted, matches the Save button's optimistic pattern); dashboard "last drilled"
  formatting uses `toLocaleDateString()` matching the surrounding tabs, not a shared formatter.
- **Score:** n/a (self-review — the wave's Doug scores at merge)
- **Follow-up:** merge-sweep items in "Proposed ledger edits".

## Hostile close review

Deferred to the merge sweep per the lane dispatch (Doug/Giddy review the wave together). Self-review
above; no known unresolved severity-medium+ finding. Candidate hostile angles pre-answered:

- "Progress writes bust the shared technique cache" — they don't: `context.revalidate` is
  paths-only (`/techniques/[slug]`, `/dashboard`); no `techniques`/`bjj-technique-graph` tag.
- "A member can write another member's row" — impossible by construction: `userId` =
  `context.user.id`; the compound key is the only where.
- "Anonymous or cross-brand writes" — proven rejected live (UNAUTHORIZED / NOT_FOUND).
- "techniqueProgress leaks to free-tier profile viewers" — regression test green
  (`profile-detail-projection.test.ts`, 4 pass, including the serialized-object leak sweep).

## ADR / ubiquitous-language check

- ADR update not required — no architectural decision made (ADR 0024's full-oRPC direction was
  followed, not amended).
- Ubiquitous language update not required — no new domain terms; "progress tracking" already
  named by the `TechniqueProgress` model.

## Reflections

The lane brief was unusually executable — the AUD2-5 decision arriving pre-ratified in the dispatch
prompt removed the one open fork, and the disjointness contract meant zero coordination overhead
with the live sibling lanes. The one owned-file-list gap (the second `TechniqueDetail` consumer in
`directory/[slug]/techniques/`) was caught by the typecheck gate exactly as the gate system
intends; future lane briefs that add a required prop to a shared component should enumerate ALL
its consumers.

The dominant cost was environmental: three lanes' gates contending for one CPU and one Postgres
stretched a ~15-minute gate pass into hours and made a local full-suite green structurally
unattainable (every failure solo-reproduces green). The per-worker DB isolation the test SOP
already sketches would eliminate the whole failure class for fan-out waves.

The runtime proof caught a real schema latency: `updatedAt` without `@updatedAt` silently never
updates — a class of bug no mocked-Prisma test can see. Worth keeping live write-path proof
mandatory for first-write-path lanes.

## Proposed ledger edits

<!-- Giddy applies these at the merge sweep — not edited directly in the shared ledgers. -->

- **G-022** (goals-ledger.md): mark the "Schema-wiring axis — LANE B" tracked child DONE —
  `TechniqueProgress` write path shipped (oRPC `techniques.setProgress`/`clearProgress`),
  detail-page control + dashboard wiring landed; graph-overlay display remains deferred to Lane A
  per the original scope. Record the AUD2-5 implementation artifact: the shared channel module is
  `components/common/technique-progress-status.tsx` (Lane A consumes it for cards/graph).
- **New D-row candidate (drift-register):** `TechniqueProgress.updatedAt` lacks `@updatedAt`
  (`@default(now())` only) — never auto-updates on writes; proven live SESSION_0580. Fix is a
  zero-SQL schema attribute in Lane C's owned `schema.prisma`; until then, consumers must not
  treat `updatedAt` as "last activity" (the dashboard sort currently degrades to insert order).
- **custom-component-inventory.md** (shared wiki — not edited from this lane): add
  `TechniqueProgressGlyph` / `techniqueProgressIcon` / `techniqueProgressLabel`
  (`components/common/technique-progress-status.tsx`) — the AUD2-5 progress channel, sibling of
  the `tool-status.tsx` map pattern; and `TechniqueProgressControl`
  (`app/(web)/techniques/[slug]/_components/technique-detail/technique-progress-control.tsx`).
- **Owned-set note for the merge sweep:** `app/(web)/directory/[slug]/techniques/[techniqueSlug]/page.tsx`
  (the SECOND `TechniqueDetail` consumer — profile-scoped watch page) was edited though not in the
  Lane B owned list: the new required `progress` prop made it a compile-blocking consumer. It is in
  NO sibling lane's owned set (checked against the fan-out doc's disjointness contract).
- No new WL-row needed — nothing surfaced that fits the wiring-ledger's drift/regression-gap
  pattern; the AUD2-5 channel decision was pre-ratified, not a new finding.

## Full close evidence

Lane close (not a canonical bow-out): the Giddy merge sweep owns wiki lint / index / ledger /
Graphify steps for the whole wave. This lane's evidence:

| Step | Proof |
| --- | --- |
| Frontmatter | `lane: bbl`, `goal_ids: [G-022]`, pairs SESSION_0578/0582 |
| Kaizen reflection | Reflections section above |
| Self-review | SESSION_0580_REVIEW_01 |
| Review & Recommend | Next session goal (Lane A) written |
| Git hygiene | local commit on `session-0580-technique-progress` (hash in the lane report; NO push per dispatch) |
| Graphify update | deferred to merge sweep (fresh worktree, graph not built) |
