---
title: "SESSION 0699 — WL-P2-51 bottom-nav hydration mismatch (mounted-guard fix, overnight auto lane)"
slug: session-0699
type: session--implement
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0699
sprint: S12
lane: repo
goal_ids: []
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0699 — WL-P2-51 bottom-nav hydration mismatch (mounted-guard fix, overnight auto lane)

> Staged as an overnight-orchestrator auto lane. Branch: `auto/session-0699-wl51-hydration-mounted-guard`,
> worktree `/Users/brianscott/dev/ronin-0699`. Dispatch payload's HARD RULES are binding (owned files:
> `bottom-nav.tsx`, `e2e/mobile-shell.spec.ts`, this SESSION file).

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, overnight orchestrator

## Goal

WL-P2-51 — `/lineage` (+ `/directory` facets) trip the Next dev overlay with a hydration mismatch
sourced at `bottom-nav.tsx:98` (SSR nav vs client session-gate). Fix by making `BottomNav` self-gate
hydration-stable using the same mounted-guard pattern already proven by `Mab`/`Header`/`UserMenu`, then
remove the `nextjs-portal`-removal workaround it forced into `e2e/mobile-shell.spec.ts`.

## Verify-first check (operator addendum)

Confirmed the bug and its workaround were both still live in this worktree before editing — not
superseded by any intervening fix:

- `git log --oneline -- apps/web/components/web/nav/bottom-nav.tsx` — last touch was
  `ce8e05ac` (SESSION_0500); no mounted-guard was ever added to this file.
- `git log --oneline -- apps/web/e2e/mobile-shell.spec.ts` — no commit since removed the
  `nextjs-portal` workaround; it was present verbatim (the `page.addInitScript` interval-removal
  loop in `beforeEach`, plus the programmatic `.evaluate(el => el.click())` workaround at the
  "Done" button) at the start of this session.
- Read `bottom-nav.tsx` directly: `const { data: session } = useSession()` followed by
  `if (!session?.user) return null` — no `mounted` state anywhere in the file. Confirms the fix was
  genuinely needed, not a re-do.

## Root cause

`BottomNav` is member chrome: SSR always renders unauthenticated (no session available server-side),
but Better Auth's client can resolve a cookie-cached session **synchronously on the very first client
paint** — before hydration reconciles. SSR emits no `<nav>`; the client's first render can already emit
one. That's a structural (node-presence) hydration mismatch, not just an attribute/text diff, so it
trips the full React remount + the dev overlay.

This is the exact same shape of bug that `UserMenu`, `Header`'s `MinimalAuthControls`, and `Mab` already
solved with a `mounted` guard (`mab.tsx`'s own comment says it "mirrors the header's mounted guard").
`BottomNav` was the one member-chrome surface still missing it.

## Petey plan

1. Find and read the MAB's (`components/web/nav/mab.tsx`) and `Header`'s (`MinimalAuthControls`)
   mounted-guard implementations; mirror the pattern exactly rather than inventing a new one.
2. Add the same `mounted` state + `useEffect(() => setMounted(true), [])` to `BottomNav`; fold it into
   the existing `if (!session?.user) return null` guard as `if (!mounted || !session?.user) return null`
   (SSR and first client paint both render `null`; the bar appears once the effect fires and settles).
3. Remove the `nextjs-portal`-removal `beforeEach` workaround and the programmatic `.evaluate(click)`
   workaround from `e2e/mobile-shell.spec.ts` (both were downstream of the same hydration bug).
4. Verify via typecheck/oxlint/dev-server smoke (no browser MCP — pane contended); attempt the affected
   e2e spec only if the hermetic e2e DB stands up without contending with concurrent overnight lanes.

Pre-flight: waived — behavior-preserving hydration-timing fix mirroring an existing, already-reviewed
pattern in the same file family; no new component, schema, or user-visible string.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0699_TASK_01 | done | Added the `mounted` guard to `BottomNav`, mirroring `Mab`/`Header`/`UserMenu`; removed both e2e workarounds tied to the hydration bug. |

## What landed

- `apps/web/components/web/nav/bottom-nav.tsx`: added `const [mounted, setMounted] = useState(false)` +
  `useEffect(() => setMounted(true), [])`; changed the early-return guard from `if (!session?.user)` to
  `if (!mounted || !session?.user)`. SSR and the client's first paint now render the identical `null`
  node; the bar only appears once the mount effect settles.
- `apps/web/e2e/mobile-shell.spec.ts`: removed the `beforeEach` `page.addInitScript` interval that
  stripped the Next dev `<nextjs-portal>` overlay every 250ms, and reverted the "Done" button's
  programmatic `.evaluate(el => el.click())` workaround back to a plain `.click()`. Both existed only
  because the hydration mismatch kept re-tripping the dev overlay onto the fixed mobile chrome.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/nav/bottom-nav.tsx` | Mounted-guard hydration fix (mirrors `Mab`/`Header`/`UserMenu`). |
| `apps/web/e2e/mobile-shell.spec.ts` | Removed the `nextjs-portal`-removal `beforeEach` workaround and the programmatic-click workaround. |
| `docs/sprints/SESSION_0699.md` | This record. |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `cd apps/web && bun run typecheck` | **exit 0** — `next typegen` + `tsc --noEmit` both clean. |
| `cd apps/web && bunx oxlint components/web/nav/bottom-nav.tsx e2e/mobile-shell.spec.ts` | **exit 0** — zero warnings/errors on the touched files (fixed one incidental unused-`page`-param warning the edit introduced, by dropping the now-unused `beforeEach` param). |
| `cd apps/web && bun run lint:check` (full repo, non-mutating) | **exit 0** — pre-existing warnings only, none on touched lines. |
| `cd apps/web && PORT=3699 npx next dev --turbo` + `curl -s -o lineage.html -w "%{http_code}" http://localhost:3699/lineage` | **HTTP 200**, clean compile, no server-side errors in the dev log. (Anonymous curl has no session cookie so it doesn't itself reproduce the authenticated code path that trips the mismatch — see Residual below; this confirms the route still renders correctly post-fix.) Server stopped cleanly after the check. |
| `cd apps/web && bun run test` (full unit suite) | **ABORTED (SIGTERM), not counted as a gate result.** The run hit `beforeEach`/`afterEach` hook timeouts (5s) across multiple DB-fixture test files (`scripts/backfill-passport-claims.test.ts`, `server/belt/verify-rank-entry.safe-action.test.ts`, `server/belt/router.integration.test.ts`, `server/entitlements/lineage-comp-seed.test.ts`, `server/entitlements/comp-grants.test.ts`) — none of which touch `bottom-nav.tsx` or `mobile-shell.spec.ts`. `ps` showed a second, unrelated `bun test` process already running for ~9 minutes from a concurrent overnight lane against the same shared local Postgres — the timeouts are shared-DB contention, not a regression from this diff. Killed the run rather than burn more time/DB contention for zero signal on this change. **No unit test file exists under `components/web/nav/` or targets `BottomNav`** (confirmed via `find`), so "affected tests" at the unit layer is empty by construction. |
| `e2e/mobile-shell.spec.ts` (the actual functional owner of this behavior) | **e2e = AM sweep.** Not run this session: it needs the hermetic `ronindojo_e2e` local Postgres DB (`.env.e2e`, not part of this session's bootstrap) migrated + seeded, and the DB is a genuinely shared local resource — standing it up mid-overnight-run risks colliding with concurrent lanes' own DB usage (consistent with the unit-suite contention observed above). Per the dispatch's own fallback clause, deferring to the AM sweep rather than churning. |

## Proposed ledger edits

<!-- Lanes NEVER edit shared ledgers. Every WL/G/D/FS change you would have made goes here as a row;
the attended AM merge applies them once. -->

1. **WL-P2-51 → draft-resolved, pending e2e confirm (SESSION_0699).** Evidence: `bottom-nav.tsx` now
   carries the same `mounted`-guard pattern as `Mab`/`Header`'s `MinimalAuthControls`/`UserMenu`
   (`if (!mounted || !session?.user) return null`); the `e2e/mobile-shell.spec.ts` `nextjs-portal`
   workaround and the programmatic-click workaround (both downstream symptoms of this same mismatch)
   are removed. Typecheck + oxlint (touched files + full `lint:check`) exit 0. **AM residual:** run
   `e2e/mobile-shell.spec.ts` against the hermetic `ronindojo_e2e` DB once it can stand up without
   lane contention — confirm all 4 tests pass with the workarounds gone, then flip this row to fully
   ✅ RESOLVED. If a real hydration warning still surfaces in that run, the client's first-paint session
   read (cookie-cache sync-resolve behavior) needs a second look before closing.

## Open decisions / blockers

None for the lane's own scope. The one open item is the AM e2e confirm noted above — explicitly
anticipated by the dispatch's "e2e = AM sweep" fallback, not a blocker on this lane's work.

## Residual for AM merge

- Run `e2e/mobile-shell.spec.ts` (all 4 tests) against the standing/rebuilt `ronindojo_e2e` DB; confirm
  green with both workarounds removed. This is the authoritative proof — it drives a real headless
  Chromium through an authenticated session and will surface any residual hydration warning the dev
  overlay would catch, which the anonymous curl smoke in this session's Verification table structurally
  cannot exercise (no session cookie → SSR and first paint agree trivially either way).
- Re-run the full unit suite (`bun run test`) uncontended (no concurrent overnight lane sharing the local
  Postgres) as a sanity pass — expected clean given no unit test targets the touched files, but worth
  confirming the DB-hook-timeout failures observed tonight were purely environmental.

## Review log

Self-review only (autonomous overnight lane, no Doug/Desi pass dispatched). Checklist:

- Matches the plan's "done means": mounted-guard added mirroring the MAB's exact pattern; e2e workaround
  removed. Yes.
- Typecheck passes. Yes (exit 0).
- Linter passes. Yes (exit 0, touched files + full repo).
- Tests: no unit test targets the touched files; full suite aborted due to unrelated shared-DB
  contention (documented above, not swept under the rug); e2e explicitly deferred to AM per dispatch.
- Leaves the codebase cleaner: yes — removes two dead workarounds alongside fixing their root cause.
- No unintended files modified (confirmed via `git status --short`: exactly the two owned files + this
  SESSION file).
- No new dependencies.
- Not a schema change, not a security-sensitive change, no new env vars.
- Full close evidence: this table + the Verification table above constitute the evidence; no closing.md
  ritual items were skipped (single-file behavior fix, no ADR/component-inventory/memory-sweep triggers).

## ADR / ubiquitous-language check

No architectural decision or domain term changed. The mounted-guard is an established, already-reviewed
pattern in this same codebase (three prior instances) — this fix conforms to existing law, it doesn't
introduce a new one.

## Artifacts

None (no browser/visual proof this session — dev-server curl + code-level pattern match only, per the
dispatch's no-browser-MCP instruction).

## Reflections

The dev-overlay-tripping hydration bug and its two e2e workarounds were exactly as scoped in the ledger
row — a genuinely small, well-isolated fix once the reference pattern (`Mab`'s comment pointing at
`Header`'s guard) was found. The more interesting finding is environmental: a full local `bun run test`
run collided with a concurrent overnight lane's own test run against the same shared local Postgres,
producing a wall of unrelated `beforeEach` hook timeouts. That's not this session's bug to fix, but it's
worth the AM orchestrator knowing shared-DB contention across parallel lanes' unit-test runs is a real,
observed cost tonight, not just a theoretical risk from the standing memory notes.
