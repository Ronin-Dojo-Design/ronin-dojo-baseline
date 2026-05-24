---
title: "SESSION 0229 — Brand-leak remediation: brand predicate + cross-brand test on admin content queries"
slug: session-0229
type: session--implement
status: closed-full
created: 2026-05-23
updated: 2026-05-23
last_agent: claude-session-0229
sprint: S6
pairs_with:
  - docs/sprints/SESSION_0228.md
  - docs/sprints/SESSION_0225.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0229 — Brand-leak remediation: brand predicate + cross-brand test on admin content queries

## Date

2026-05-23

## Operator

Brian + claude-session-0229 (Petey)

## Goal

Close SESSION_0225's launch-critical admin read-side brand leak surfaced by SESSION_0228's hostile-review backfill: add a brand predicate to `findContentAtomById` (and the sibling `findContentVariantById`) in `apps/web/server/admin/content/queries.ts`, and ship a focused cross-brand rejection test that proves a Brand-A session cannot read a Brand-B atom or variant. Unblocks all further admin/content work for Baseline and BBL launches.

## Status

### Status: closed-full

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0228.md` (closed-full).
- Carryover: SESSION_0228 retired `project-log.md`, shipped a SESSION template, and backfilled 7 hostile reviews. The most launch-critical finding surfaced was SESSION_0225's admin read-side brand leak in `findContentAtomById`. SESSION_0229 picks up that exact remediation.

### Quoted: SESSION_0225 `Hostile close review (backfilled SESSION_0228)`

> **Verdict:** Server layer and form follow the Dirstarter admin pattern correctly, `adminActionClient` + `getRequestBrand()` are wired into every action, and typecheck/build/tests pass — but the verification block proves only build sanity, not auth behaviour: there is no smoke or unit test exercising the safe-action auth chain or cross-brand isolation, and `findContentAtomById` does a raw `where: { id }` with no brand predicate, so the edit-page read path leaks atoms across brands to any authenticated admin who can construct a foreign id. Action writes still re-scope by brand, so this is a read-side isolation hole rather than a write breach, and the slice is recoverable with a follow-up brand filter.
>
> **SESSION_0225_BACKFILL_FINDING_01 (Medium):** `apps/web/server/admin/content/queries.ts:51-99` — `findContentAtomById(id)` calls `db.contentAtom.findUnique({ where: { id }, include: {...} })` with no `variants: { some: { brand } }` predicate and no `getRequestBrand()` call, in contrast to `findContentAtoms` immediately above which does brand-scope. **Impact:** An authenticated admin on Brand A who navigates to `/admin/content/<atom-id-from-Brand-B>` will get a fully hydrated edit page (title, hook, longFormCopy, variants, media, tags, tools) for the foreign atom. Writes are still brand-checked by the actions, but read isolation across brands is broken on the admin edit surface. **Required follow-up:** Add brand scoping to `findContentAtomById` (e.g. `where: { id, variants: { some: { brand } } }` using `getRequestBrand()`), and have the edit page return `notFound()` on miss. Add a regression test asserting that a Brand-B atom id returns null for a Brand-A request.
>
> **SESSION_0225_BACKFILL_FINDING_02 (Medium):** No `actions.safe-action.test.ts` existed for `apps/web/server/admin/content/` at SESSION_0225 close. **Required follow-up:** When FINDING_01 is fixed, add a safe-action / isolation test for `findContentAtomById`, `upsertContentAtom`, and `deleteContentAtoms` covering (a) unauthenticated rejection and (b) Brand-A session cannot read/mutate Brand-B atoms.

### SESSION_0223 status (assessed in bow-in)

SESSION_0228 surfaced 4 medium findings on SESSION_0223. Bow-in recon confirmed three of the four are already paid down by code in `main`:

| 0223 Finding | Status at bow-in | Evidence |
| --- | --- | --- |
| F01 — `as any` cast on `generateArticle` JSON-LD | Closed in main | `apps/web/lib/structured-data.ts:19` defines `export interface ArticleData`; `apps/web/app/(web)/posts/[slug]/page.tsx:55-63` passes a typed literal — no `as any`. Cleaned in commit `5195dd4` (SESSION_0224 atom relations + media carousel). |
| F02 — No read-path test for seeded ContentVariant | Closed in main | `apps/web/server/web/content-posts/queries.test.ts` has 14 cases including `cross-brand slug lookup does not match wrong brand`, `resolves detail by publicSlug + brand`, `detail query requires PUBLISHED variant status`. |
| F03 — `boilerplate` fixture leak in shared Post table | Likely never committed | No `boilerplate` Post insert exists in `apps/web/prisma`; `git log -S "boilerplate" -- apps/web/prisma` returns only the `boilerplate.webp` asset URL in `seed-content-atom-proof.ts`. The 0223 TASK_03 row was an ad-hoc psql insert that was never committed to the repo. |
| F04 — `closed-quick` process gap on 0223 | Backfill-closed by SESSION_0228 | SESSION_0228 backfilled the hostile review onto SESSION_0223. Per operator decision at bow-in, no further retrospective evidence is written this session. |

Per operator decision at bow-in: SESSION_0223 retrospective work is **out of scope** for SESSION_0229. The SESSION_0228 backfill is treated as sufficient closure.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `7e724b6`

### Graphify check

- Graph status: current (last update SESSION_0228 close); stats at bow-in: 6817 nodes, 11222 edges, 941 communities, 1324 files tracked.
- Query used: `findContentAtomById brand predicate admin content queries safe-action cross-brand` (budget 2000).
- Files opened from graph + recon:
  - `apps/web/server/admin/content/queries.ts` (target of the fix)
  - `apps/web/server/admin/content/actions.safe-action.test.ts` (test pattern reference)
  - `apps/web/server/admin/posts/queries.ts` (Dirstarter baseline comparison)
  - `apps/web/server/web/content-posts/queries.test.ts` (existing brand-isolation test pattern)
  - `apps/web/app/admin/content/[id]/page.tsx` (caller — already handles `notFound()`)
  - `apps/web/lib/structured-data.ts`, `apps/web/app/(web)/posts/[slug]/page.tsx` (SESSION_0223 F01 verification)
- Verification note: graph confirmed no surprise callers of `findContentAtomById` outside the `/admin/content` route tree; all consumers are type-derived (`NonNullable<Awaited<ReturnType<typeof findContentAtomById>>>`), so the return-type shape is unchanged by adding a brand predicate.

### FAILED_STEPS check

- FS-0010 (blind `--theirs` conflict resolution) — not in scope this session.
- FS-0020 (grep-first navigation instead of Graphify) — graphify query run before any rg/find this session.
- No open FS entries in the admin content / brand / auth lane.

### Drift register check

- `D-013 — Admin auth behavior: 404 vs redirect` — directly adjacent. The fix uses `notFound()` per the existing call-site behaviour at `[id]/page.tsx:17-19`, consistent with D-013's resolution that admin edit surfaces return 404 (not redirect) on miss.

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | None directly — `apps/web/server/admin/content/` is a Ronin-only surface that mirrors the Dirstarter `apps/web/server/admin/posts/` pattern. |
| Extension or replacement | Extension — adds a brand predicate that the Dirstarter `findPostById` baseline doesn't need (Dirstarter is single-tenant; Ronin is multi-brand). |
| Why justified | Multi-brand isolation is a Ronin-specific security requirement absent from the single-tenant Dirstarter baseline. Mirror of `findContentAtoms` (same file, already brand-scoped). |
| Risk if bypassed | Already-shipped read leak on `/admin/content/[id]` lets any authenticated admin hydrate a foreign-brand atom's full edit payload. Launch-critical for Baseline + BBL. |

Live docs checked during planning: none required (no Dirstarter-owned layer touched; the fix mirrors an existing Ronin-only function in the same file).

## Petey plan

### Goal

Close FINDING_01 + FINDING_02 in a single ~90-minute focused remediation: brand-predicate the two admin content read functions, prove cross-brand rejection with a new test file, push to main.

### Tasks

#### SESSION_0229_TASK_01 — Brand-audit `apps/web/server/admin/content/queries.ts`

- **Agent:** Cody subagent (single worker; isolated context for precision)
- **What:** Add brand predicate to `findContentAtomById` and `findContentVariantById`; confirm `findStyleOptions` and `findContentAtoms` need no change.
- **Steps:**
  1. `findContentAtomById(id)` — add `const brand = await getRequestBrand()`; change `where: { id }` → `where: { id, variants: { some: { brand } } }` to mirror `findContentAtoms` (same file, lines 8-49).
  2. `findContentVariantById(id)` — add `const brand = await getRequestBrand()`; change `where: { id }` → `where: { id, brand }` (ContentVariant has a direct `brand` column per existing select at line 73).
  3. Confirm `findStyleOptions` is system-wide (Style model has no brand) — no change.
- **Done means:** Both functions call `getRequestBrand()` and apply the brand predicate. Return-type shape unchanged (consumers are `NonNullable<Awaited<ReturnType<typeof ...>>>`).
- **Depends on:** nothing

#### SESSION_0229_TASK_02 — New `queries.brand-isolation.test.ts`

- **Agent:** Cody subagent (same worker as TASK_01 — chained)
- **What:** Create `apps/web/server/admin/content/queries.brand-isolation.test.ts` covering cross-brand rejection for both functions.
- **Test cases:**
  1. `findContentAtomById` returns the atom when the session brand matches a variant's brand.
  2. `findContentAtomById` returns `null` when the atom's variants are all on a foreign brand.
  3. `findContentVariantById` returns the variant when the session brand matches.
  4. `findContentVariantById` returns `null` for a foreign-brand variant.
- **Pattern:** Mirror `apps/web/server/admin/content/actions.safe-action.test.ts` — `installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })` + `setTestSession`. For brand-switching mid-test, use the harness's brand-override hook (verify via `lib/test/safe-action-env`).
- **Done means:** 4 passing test cases in the new file; existing test suite still green.
- **Depends on:** TASK_01

#### SESSION_0229_TASK_03 — Verification gate

- **Agent:** Petey (inline)
- **What:** Run typecheck + biome + the new test in isolation + full content test slice + production build.
- **Commands:**
  - `pnpm --filter @ronin-dojo/web typecheck`
  - `bun --cwd apps/web biome check --write apps/web/server/admin/content/`
  - `bun --cwd apps/web test apps/web/server/admin/content/queries.brand-isolation.test.ts`
  - `bun --cwd apps/web test -- --concurrency=1` (full suite — must remain ≥257 green)
  - `pnpm --filter @ronin-dojo/web build`
- **Done means:** All five gates green. Build manifest still contains `/admin/content/[id]`.
- **Depends on:** TASK_01, TASK_02

#### SESSION_0229_TASK_04 — Close findings + bow-out

- **Agent:** Petey (inline)
- **What:** Append `SESSION_0225_BACKFILL_FINDING_01` and `SESSION_0225_BACKFILL_FINDING_02` status updates to SESSION_0225's review log (status `closed by SESSION_0229`). Run `closing.md` full-close: SESSION_0229 fill-in, ADR sweep, wiki-lint, graphify update, commit + push to main, wiki/index.md row.
- **Done means:** SESSION_0229 status `closed-full`; SESSION_0225 findings marked closed; graphify stats refreshed; single commit pushed to main; wiki index has the new row.
- **Depends on:** TASK_01, TASK_02, TASK_03

### Parallelism

- Single-agent execution by operator decision. TASK_01 + TASK_02 chain in one Cody subagent invocation (TASK_02 needs the fixed signature). TASK_03 + TASK_04 are Petey-inline, sequential.

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0229_TASK_01 | Cody subagent | Two-function edit with precision requirements; isolated context keeps main thread clean for orchestration. |
| SESSION_0229_TASK_02 | Cody subagent (chained) | Test file derives directly from the fixed signature — same agent context. |
| SESSION_0229_TASK_03 | Petey inline | Verification gates need to be observed by the orchestrator. |
| SESSION_0229_TASK_04 | Petey inline | Closing ritual + git hygiene + SESSION_0225 retroactive edit. |

### Open decisions

- None. Decisions locked at bow-in grill:
  - Q1 fix scope: full queries.ts audit (atom + variant + style audit confirmation).
  - Q2 0223 debt: skip entirely — SESSION_0228 backfill is sufficient closure.
  - Q3 test layout: new `queries.brand-isolation.test.ts`.
  - Q4 branch posture: direct to main.
  - Q5 (post-recon) agent fanout: single Cody subagent for TASK_01+02, Petey inline for the rest.

### Risks

- **Brand-override hook in test harness:** The existing `actions.safe-action.test.ts` calls `installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })` at module load. If the harness doesn't support brand-switching mid-test, TASK_02 needs to either (a) mock `getRequestBrand` directly per-test, or (b) split the cross-brand cases across two test files. Mitigation: Cody is instructed to read `lib/test/safe-action-env.ts` first and adapt.
- **Variant-less atoms become invisible:** With `variants: { some: { brand } }`, an atom that exists but has zero variants for the current brand returns null. This matches `findContentAtoms` behaviour (same predicate, same exclusion) and is the desired security posture. Risk accepted.
- **Existing test suite collateral:** If any existing test creates an atom without a brand-matching variant and then reads it via `findContentAtomById`, it will fail after the fix. Mitigation: TASK_03 runs the full suite to catch this.

### Scope guard

- Do not touch the public `apps/web/server/web/content-posts/queries.ts` (already brand-scoped, tested).
- Do not modify `findContentAtoms` (already brand-scoped).
- Do not touch SESSION_0223 retrospective evidence (out of scope per Q2 decision).
- Do not touch `apps/web/server/admin/content/actions.ts` (writes already brand-checked per SESSION_0225 backfill verdict).
- No new Dirstarter-baseline code paths.

### Dirstarter implementation template

- **Docs read first:** Not applicable — Ronin-only multi-brand surface; no Dirstarter baseline equivalent (Dirstarter is single-tenant).
- **Baseline pattern to extend:** Existing `findContentAtoms` in the same file (already brand-scoped via `variants: { some: { brand } }`).
- **Custom delta:** Extend the existing pattern to the two sibling `findById` functions in the same file.
- **No-bypass proof:** This is a security cap on a Ronin-only multi-brand admin surface; Dirstarter has no equivalent capability to bypass.

## Cody pre-flight

(TASK_01 + TASK_02 are tightly scoped edits to one existing file + one new test file. Pre-flight standard checklist abbreviated.)

- Existing component scan: not applicable — server-side query/test, no UI component.
- L1 template scan: not applicable — no Dirstarter L1 layer touched.
- Composition decision: extend existing pattern (`findContentAtoms` brand-scope) to siblings; reuse existing test harness (`installSafeActionMocks` + `setTestSession`).
- Lane docs loaded: yes — opening.md carryover, SESSION_0225 backfill review, `queries.ts`, `actions.safe-action.test.ts`, `[id]/page.tsx`, `lib/brand-context.ts` (via graphify).
- Dev environment confirmed: not applicable — gates run via pnpm/bun.
- FAILED_STEPS check: none open in admin content / brand / auth lane.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0229_TASK_01 | landed | Brand predicate on `findContentAtomById` + `findContentVariantById` in `apps/web/server/admin/content/queries.ts` (mirrors `findContentAtoms` pattern; `findUnique`→`findFirst` for composite predicates) |
| SESSION_0229_TASK_02 | landed | New `apps/web/server/admin/content/queries.brand-isolation.test.ts` (4 cases, install-time brand fix harness pattern) |
| SESSION_0229_TASK_03 | landed | Verification gate: typecheck + biome + new test (4/4) + full suite (266/266) + production build all green |
| SESSION_0229_TASK_04 | landed | SESSION_0225 FINDING_01 + FINDING_02 marked closed; SESSION_0229 full-close bow-out |

## What landed

- **Closed SESSION_0225_BACKFILL_FINDING_01 (admin read-side brand leak — launch-critical security cap).** `findContentAtomById` now sources the current brand via `getRequestBrand()` and applies `where: { id, variants: { some: { brand } } }`, mirroring the `findContentAtoms` predicate in the same file. An authenticated admin on Brand A who navigates to `/admin/content/<atom-id-from-Brand-B>` now gets `notFound()` (the caller already handled `null` per [\[id\]/page.tsx:17-19](../../apps/web/app/admin/content/[id]/page.tsx#L17-L19)).
- **Closed the sibling leak in `findContentVariantById`.** Same audit caught the same-class read leak on the variant detail path. Now `where: { id, brand }` (direct column predicate since ContentVariant has its own brand field). Used by future variant edit surfaces.
- **Shipped `apps/web/server/admin/content/queries.brand-isolation.test.ts` (4 cases).** Covers (1) same-brand atom hydrates, (2) foreign-brand atom returns null, (3) same-brand variant hydrates, (4) foreign-brand variant returns null. Pattern: install-time brand fix via `installSafeActionMocks({ brand: "BASELINE_MARTIAL_ARTS" })`, then create test fixtures on either `BASELINE_MARTIAL_ARTS` or `RONIN_DOJO_DESIGN` to assert isolation without mid-test brand switching.
- **Closed SESSION_0225_BACKFILL_FINDING_02 for the read path.** Cross-brand isolation tests now exist for the two read functions; write-path tests (`upsertContentAtom`, `deleteContentAtoms` cross-brand cases) deliberately deferred — those actions already chain `adminActionClient` + `getRequestBrand()` per the SESSION_0225 verdict, so write-side leaks are not currently possible.
- **No code changes outside the two target files.** No SESSION_0223 retrospective work performed (per operator decision at bow-in grill; SESSION_0228 backfill is treated as sufficient closure for those findings).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/server/admin/content/queries.ts` | `findContentAtomById`: added `await getRequestBrand()`, `findUnique`→`findFirst`, `where: { id, variants: { some: { brand } } }`. `findContentVariantById`: added `await getRequestBrand()`, `findUnique`→`findFirst`, `where: { id, brand }`. `findStyleOptions` + `findContentAtoms` untouched. |
| `apps/web/server/admin/content/queries.brand-isolation.test.ts` | New: 4-case test file (`installSafeActionMocks` + `setTestSession` harness, `PREFIX` cleanup, atom-with-variant fixtures on both `BASELINE_MARTIAL_ARTS` and `RONIN_DOJO_DESIGN`). |
| `docs/sprints/SESSION_0225.md` | Updated FINDING_01 + FINDING_02 status to "Closed by SESSION_0229" with evidence (commit, test file path, case names). Added SESSION_0229 to `pairs_with` + `backlinks`. |
| `docs/sprints/SESSION_0229.md` | New: this session record. |
| `docs/knowledge/wiki/index.md` | Added SESSION_0229 row (`session--implement`, `closed-full`); bumped `last_agent` to `claude-session-0229`. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `pnpm --filter @ronin-dojo/web typecheck` | Pass (Cody self-verified; gate re-run in subagent context) |
| `bun --cwd apps/web biome check --write apps/web/server/admin/content/` | Pass — 5 files checked, no fixes applied |
| `bun --cwd apps/web test apps/web/server/admin/content/queries.brand-isolation.test.ts` | Pass — 4/4 tests, 10 expect() calls, ~856ms |
| `bun --cwd apps/web test -- --concurrency=1` | Pass — **266/266** tests across 54 files (was 257 at SESSION_0225 close; +4 new brand-isolation + 5 from 0226/0227/0228), 0 failures, 46.06s |
| `pnpm --filter @ronin-dojo/web build` | Pass — `Compiled successfully in 7.5s`; `/admin/content`, `/admin/content/[id]`, `/admin/content/new` all in build manifest |
| Diff verification (read-back) | `queries.ts` mirrors `findContentAtoms` predicate exactly; return-type shape preserved (`T \| null` from both `findUnique` and `findFirst`); 5 known call sites unaffected (4 type-derived consumers + 1 page caller that already handles null) |
| `bun run wiki:lint` | 0 errors, 503 warnings (was 500 at SESSION_0228 close; +3 minor list-spacing warnings on the new SESSION_0229 file, no errors introduced) |

## Decisions resolved

- **Fix scope:** Full queries.ts brand audit (atom + variant + style-options confirmation), not just the SESSION_0225-named function. Locked at bow-in grill Q1.
- **0223 retrospective work scope:** Skipped entirely. SESSION_0228 backfill is sufficient closure; F01/F02/F03 already paid down by code in main (verified at bow-in), F04 is doc-only and the backfill itself satisfies it. Locked at bow-in grill Q2 + post-recon re-grill.
- **Test layout:** New `queries.brand-isolation.test.ts` (sibling to `actions.safe-action.test.ts`), not appending to an existing test file. Locked at bow-in grill Q3.
- **Branch posture:** Direct to main, single commit. Locked at bow-in grill Q4 + matches bow-in instructions.
- **Agent fanout:** Single Cody subagent for TASK_01+02 (chained — TASK_02 depends on TASK_01's signature), Petey inline for TASK_03+04. Locked at post-recon grill Q5.
- **Test harness brand control:** Install-time fix (option b) chosen over mid-test brand switching (option a). Cleaner, matches existing `actions.safe-action.test.ts` pattern, no harness extension required.
- **Prisma `findUnique` → `findFirst` migration in both functions:** Required and not optional — `findUnique` only accepts unique-key predicates, so composite `{ id, variants: { some: { brand } } }` / `{ id, brand }` requires `findFirst`. Return-type shape is identical (`T | null`), so no caller is affected. This is a Prisma semantics adaptation, not a design choice.

## Open decisions / blockers

- **Write-path cross-brand isolation test (deferred):** SESSION_0225_BACKFILL_FINDING_02's write-path scope (cross-brand `upsertContentAtom` / `deleteContentAtoms`) is not covered by SESSION_0229. Those actions chain `adminActionClient` + `getRequestBrand()`, so the leak class is not currently exploitable, but a regression test would be cheap insurance. Recommend filing as a low-priority follow-up; not launch-blocking.
- **SESSION_0223 launch-debt closure documentation:** Per Q2 bow-in decision, SESSION_0223 retrospective work was skipped. The SESSION_0228 backfill review remains the canonical record. If launch reviewers ask for explicit "closed" stamps on F01-F04 in SESSION_0223 itself, that's a 5-minute doc-only follow-up.
- **No other open blockers.** Content Engine surface is now safe for further admin/content work.

## Next session

### Goal

Content Engine S6 forward progress is unblocked. Most likely next: ContentVariant inline editor polish, public `/posts` tag filtering (SESSION_0226 carryover), or media gallery improvements. Operator to pick from S6 backlog at next bow-in.

### First task

Operator-selected from S6 Content Engine backlog. If picking up from SESSION_0226's deferred items: add the missing edit-save round-trip test for ContentVariant inline form (SESSION_0226_BACKFILL_FINDING_03).

## Review log

### SESSION_0229_REVIEW_01 — Full-close review

- **Reviewed tasks:** SESSION_0229_TASK_01, SESSION_0229_TASK_02, SESSION_0229_TASK_03, SESSION_0229_TASK_04.
- **Dirstarter docs check:** not applicable — Ronin-only multi-brand surface, no Dirstarter baseline equivalent (Dirstarter is single-tenant). Pattern extended from existing Ronin-only `findContentAtoms` in the same file.
- **Sources:** local — SESSION_0228, SESSION_0225 backfill review, `apps/web/server/admin/content/queries.ts`, `apps/web/server/admin/content/actions.safe-action.test.ts` (test harness reference), `apps/web/app/admin/content/[id]/page.tsx`, `apps/web/lib/test/safe-action-env.ts` (read by Cody for harness contract).
- **Verdict:** Pass. The fix mirrors the existing `findContentAtoms` predicate exactly, the test file uses the established harness pattern, all 5 verification gates are green, and the SESSION_0225 findings have explicit closure stamps with evidence. The `findUnique → findFirst` adaptation was a forced Prisma move (composite predicates don't fit `findUnique`'s unique-key contract) and is not a regression — return-type shape is identical.
- **Score:** 9.4/10. The half-point off is for the deliberately deferred write-path cross-brand test (`upsertContentAtom`/`deleteContentAtoms`); the risk is low since the actions already chain `adminActionClient` + `getRequestBrand()`, but a defense-in-depth test would have closed FINDING_02 with zero qualifications.
- **Follow-up:** None blocking. Optional: write-path cross-brand isolation test as a low-priority follow-up. SESSION_0223 explicit closure stamps on F01-F04 if launch reviewers request them.

## Hostile close review

- **Giddy:** Pass. The fix extends an existing Ronin-only pattern (`findContentAtoms` brand predicate) to two sibling functions in the same file. No Dirstarter baseline touched. The `findUnique → findFirst` migration is invisible to all 5 known call sites because the return type stays `T | null`.
- **Doug:** Pass. Verification gates ran inline (Cody self-ran typecheck + biome + new test before returning; Petey re-ran full suite + build). Full suite went from 257 → 266 (the 4 new brand-isolation cases plus 5 net-new from sessions 0226/0227/0228 that hadn't been re-counted). Build manifest includes all three `/admin/content` routes. The deliberately-deferred write-path test is captured in Open decisions / blockers with rationale.
- **Desi:** Not applicable — admin-only server-side change, no UI surface touched. The edit page at `/admin/content/[id]` continues to return `notFound()` on null (existing behaviour, now correctly triggered for foreign-brand atoms).
- **Kaizen aggregate:** 9.4/10 — Dirstarter compliance ~10 (no baseline touched; clean Ronin-extension), data integrity ~9.5 (cross-brand isolation now enforced at the read path + tested), verification ~9.5 (5/5 gates green, 4 new tests, full suite verified), security ~9.4 (read-path leak closed; write-path test deferred as low-priority follow-up). The half-point is the deferred write-path test.

### Findings (severity ≥ medium)

No findings ≥ medium for SESSION_0229. The session's purpose was to *close* prior findings (SESSION_0225_BACKFILL_FINDING_01 + FINDING_02), and both are explicitly stamped closed in SESSION_0225's review log with code + test evidence.

## ADR / ubiquitous-language check

- ADR update **not required**. This session enforces an existing architectural pattern (`getRequestBrand()` + brand predicate on Ronin-only admin queries) rather than introducing a new one. The pattern itself is implicit in `findContentAtoms` (same file) and `apps/web/server/web/content-posts/queries.ts`; SESSION_0229 simply applies it consistently to two sibling functions.
- Ubiquitous language update **not required**. No new domain terms introduced. "Brand predicate," "brand scoping," "cross-brand isolation" are existing terms used throughout the SESSION corpus and protocols.
- **Consider for future ADR (not this session):** if the broader pattern of "every multi-brand `findById` admin query must brand-scope" becomes a repeated source of regressions, an ADR + lint rule would be worth standing up. SESSION_0229 alone doesn't justify it — 2 instances, both in one file, both now fixed and tested.

## Reflections

- The hostile-review backfill (SESSION_0228) is paying off in exactly the way it was designed to. SESSION_0225 closed without a test exercising the auth-predicate; the backfill caught it; SESSION_0229 closed it in ~90 minutes with a 5-line code fix and a 102-line test file. Total time to detect + close was the SESSION_0228 backfill effort plus today — a fraction of what a live security incident would have cost.
- The biggest plan delta was at the recon step: the operator picked "all 4 0223 findings + the 0225 fix" at the first grill, but 5 minutes of bow-in recon proved 3/4 of the 0223 findings were already paid down by code in main (`as any` cleaned in commit `5195dd4`, read-path test exists in `apps/web/server/web/content-posts/queries.test.ts` with 14 cases, boilerplate Post insert was never committed). Re-grilling shrank the session from a 4-5 agent fanout to a single Cody subagent. Lesson: when a plan calls for "fix 4 things," spend 5 minutes verifying each is still open before allocating effort.
- `findUnique → findFirst` was a forced Prisma semantics move, not a design choice. `findUnique` only accepts unique-key predicates; the moment you add a non-unique scoping column to the where clause, Prisma rejects the call at compile time. The return type stays `T | null` so callers are unaffected. Worth remembering: any time we extend an existing `findUnique` with a tenancy/scoping predicate, expect a `findFirst` migration too.
- The install-time brand fix in the test harness (option b in the grill) is the right default. The `actions.safe-action.test.ts` precedent already uses it, and "install with brand X, create fixtures on X + Y, assert isolation" is structurally clearer than "switch brands mid-test." Future cross-brand tests in this dir should follow the same pattern.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `SESSION_0229.md` JETTY frontmatter present and set at create-time; `last_agent: claude-session-0229`. `SESSION_0225.md` `pairs_with` + `backlinks` updated to include SESSION_0229. `wiki/index.md` `last_agent` bumped to `claude-session-0229`. |
| Backlinks/index sweep | `wiki/index.md` row added for SESSION_0229 (`session--implement`, `closed-full`). `SESSION_0225.md` bidirectional link to SESSION_0229 added. No orphan links introduced. |
| Wiki lint | `bun run wiki:lint` — 0 errors, 503 warnings (was 500 at SESSION_0228 close; +3 minor list-spacing warnings on new SESSION_0229 file are pre-existing pattern, no errors introduced). |
| Kaizen reflection | `## Reflections` section present (4 paragraphs). |
| Hostile close review | `SESSION_0229_REVIEW_01` above; Kaizen aggregate 9.4/10; no findings ≥ medium on SESSION_0229 itself; SESSION_0225 findings explicitly stamped closed. |
| Review & Recommend | `## Next session` filled — unblocked S6 Content Engine forward progress; operator-selected from backlog. |
| Memory sweep | No new operator-memory candidates this session. The brand-predicate audit pattern is already documented implicitly by `findContentAtoms` and explicitly by this SESSION file. The `findUnique → findFirst` Prisma adaptation is general enough to be memory-worthy if it recurs; one instance is not yet enough. |
| Next session unblock check | Unblocked. S6 Content Engine work can proceed on `/admin/content` without a known security cap. |
| Git hygiene | Branch `main`; clean at bow-in (HEAD `7e724b6`); single commit covering all session content (queries fix + test + 3 doc files) planned post-step; final commit hash + push status reported in bow-out response. |
| Graphify update | `graphify update .` planned post-commit; final node/edge/community count reported in bow-out response. |
