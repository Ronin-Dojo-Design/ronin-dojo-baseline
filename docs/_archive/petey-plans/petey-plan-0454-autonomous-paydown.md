---
title: "Petey Plan 0454 — Autonomous Ledger-Debt Paydown (safe, schema-free)"
slug: petey-plan-0454-autonomous-paydown
type: plan
status: active
created: 2026-06-27
updated: 2026-06-27
last_agent: claude-session-0453
pairs_with:
  - docs/runbooks/dev-environment/autonomous-sessions.md
  - docs/runbooks/component-launch-sweep-recipe.md
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/knowledge/wiki/wiring-ledger.md
backlinks:
  - docs/sprints/SESSION_0453.md
---

# Petey Plan 0454 — Autonomous Ledger-Debt Paydown

> **Authored SESSION_0453 for the overnight `auto-session.sh` run.** The goal: drive ledger debt toward
> ≈zero with **safe, schema-free, behavior-preserving** slices so Brian Truelson eventually lands on a
> bug-free MVP. Each session does **one slice → one reviewable PR** (PR gate; nothing merges to `main`
> unattended). Headless cannot grill — so every slice below is **locked + self-contained**; if a slice is
> ambiguous or needs a decision, **STOP and hand back** (do not guess).

## ⛔ HARD BOUNDARY (read first — non-negotiable for every autonomous session)

This run does **schema-free, code/docs-only, behavior-preserving cleanup**. If a slice would require any
of the following, **STOP, leave the tree clean (no-op), and surface it for the operator** — do NOT do it:

- ❌ **No prod data mutation** of any kind. Specifically **NOT** the clone-tree cleanup (WL-P2-21 /
  `rigan-machado-bjj-lineage` trees) — that is operator-gated.
- ❌ **No FI-001 / Brian Truelson email** (`send-bbl-truelson-thankyou.ts --backfill/--grant/--send`).
  Operator-gated; blocked until ledger debt is ≈zero.
- ❌ **No `prisma/` schema, no migrations, no new payload `select`s that require a schema column.**
- ❌ **No `brand` column / `Brand` enum / `lib/brand-context.ts`** (Stage-2 parked).
- ❌ **No Neon password rotation** (risk #13), no Vercel/DNS/Stripe/prod-env work.
- ❌ **No `server/<entity>` flattening / large moves** beyond the named slice.
- ❌ **Never run the banked purge script** (`scripts/purge-non-bbl-baseline-data.ts`).

Verify each slice with the full gate before committing: `bun run typecheck` (0), `bun run lint:check` +
`bun run format:check` (read-only — NOT the `--fix` variants), the **touched-area** tests
(`bun test <file>`, `--parallel=1`), `npx next build` (exit 0 for app-code), `bun run wiki:lint` (0 errors),
and `npx fallow audit --base origin/main` reading **`dead_code_introduced: 0`** + held `maintainability_avg`
(NOT the raw verdict — see [`component-launch-sweep-recipe.md`](../../runbooks/component-launch-sweep-recipe.md) §5).
**Behavior must be unchanged** — these are refactors/cleanups, not feature changes.

## The slices (do them in order — one per session)

Each session does the **next unchecked slice**, then at bow-out writes its SESSION `Next session` block
pointing at the **following** slice. After the last slice, **hand back to the operator** (see below).

**Resilience rule (avoid a false halt):** if the next unchecked slice turns out to have **nothing to do**
(already resolved, or nothing matches), mark it `✅ no-op (SESSION ref)` and **proceed to the following
slice in the SAME session** so the session still produces exactly one reviewable commit. Only **halt on a
genuinely empty list** (every slice done) — that clean no-op stop is expected and fine. Never leave a dirty
tree; never invent work beyond this list.

### Slice 1 — D-024: deploy runbooks pnpm → bun (docs-only)

- **What:** the deploy toolchain is `bun`, but the deploy runbooks still say `pnpm`. Update them.
- **Files:** the two deploy runbooks under `docs/runbooks/` (grep `pnpm` in deploy/deployment runbooks);
  `scripts/deploy-production.sh` references if any. Docs only — do not touch `package.json` scripts.
- **Done:** `grep -ri "pnpm" docs/runbooks/**/deploy*` returns only intentional/historical mentions; the
  active deploy commands read `bun`. Flip D-024 in `drift-register.md` to resolved with the SESSION ref.
- **Gate:** `wiki:lint` 0 errors. (Docs-only → free push, no deploy.)

### Slice 2 — WL-P2-5: remove the dead `treeId` param (code, tiny)

- **What:** `DrawerBody` destructures + types `treeId?: string` but never reads it (oxlint
  `noUnusedFunctionParameters`). Remove the dead param + its type + any pass-through at the call site.
- **Files:** the lineage profile drawer module (`components/web/lineage/lineage-profile-drawer/*` — grep
  `treeId`). Confirm no consumer relies on it before removing.
- **Done:** param gone; typecheck + oxlint clean; behavior unchanged. Flip WL-P2-5 → ✅ in `wiring-ledger.md`.
- **Gate:** typecheck, oxlint/oxfmt check, the drawer's touched test, `next build`.

### Slice 3 — WL-P2-10: dependency hygiene (code, small — verify build)

- **What:** `fallow audit` flagged ~4 dependency-hygiene candidates (`@ai-sdk/google`, etc. — re-run
  `npx fallow audit` to get the current list). Remove the ones that are **provably unused** (grep the repo
  for every import of each before removing). If a dep is used anywhere, leave it.
- **Files:** `apps/web/package.json` (+ `pnpm-lock.yaml` regen via `bun install`). **App-code push →
  deploys**, so `next build` MUST pass.
- **Done:** unused deps removed; `bun install` + `next build` green; `fallow` unused-dep count drops. Flip
  WL-P2-10 → ✅. If NONE are provably unused, no-op the slice and say so.
- **Gate:** `next build` (critical), typecheck, full touched-area tests.

### Slice 4 — WL-P2-18: extract oversized tournament-action branches + remove dead exports (code, medium)

- **What:** `fallow` complexity hotspots in `server/admin/tournaments/actions.ts` (`upsertDivision` CRAP 30,
  `scoreMatch`/`seedable` HIGH) + 2 confirmed-dead exports (`updateTournamentStatus`,
  `AddPersonOptions` type in `server/admin/users/queries.ts`). Extract the oversized branches into named
  helpers (behavior-preserving) and remove the dead exports **after** confirming zero references (grep +
  no dynamic import).
- **Files:** `server/admin/tournaments/actions.ts`, `server/admin/users/queries.ts`. Also
  `server/web/media/actions.ts:revalidateForTarget` (CRAP 42) is a candidate but lower priority — only if
  clean.
- **Done:** complexity of the named functions drops; dead exports gone; **all tournament-action tests pass**
  (behavior identical); `fallow dead_code_introduced: 0`. Flip WL-P2-18 → ✅.
- **Gate:** typecheck, the tournament-action + scoring tests (run them — scoring logic is correctness-critical),
  `next build`.

### Slice 5 — WL-P2-17: extract the shared admin-query-builder helper (code, BIG mechanical)

- **What:** `fallow dup:16999900` (31-line block × ~24) + `dup:c3bcb118` (26-line × 12) — the
  where/orderBy/paginate scaffold is copy-pasted across ~24 `server/admin/*/queries.ts` files. Extract ONE
  shared helper (model + where + orderBy + pagination) and migrate the call-sites.
- **Files:** ~24 `server/admin/*/queries.ts`. **This is the largest slice** — if it can't be completed
  cleanly in one session (clean tree + exactly one commit), do as many call-sites as cohere into one
  reviewable commit and point the next session's block at "WL-P2-17 continued." Do **not** leave a dirty tree.
- **Done:** a shared helper exists; migrated call-sites behave identically (per-file verify); `fallow`
  duplication for those clone groups drops; `dead_code_introduced: 0`. Flip WL-P2-17 → ✅ when fully done.
- **Gate:** typecheck, oxlint/oxfmt check, admin-query touched tests, `next build`. Behavior-preservation is
  paramount — a dedup that changes a query's where/order is a regression.

## Hand-back (after the last slice, or on any STOP)

When the slices are done (or a slice hits the HARD BOUNDARY / needs a decision), the bow-out `Next session`
block must **hand back to the operator** with the human-gated lane — do NOT autonomize it:

> **Operator-gated (next interactive session):** (1) clone-tree cleanup — remove the duplicate unpublished
> `rigan-machado-bjj-lineage` trees on prod (WL-P2-21; prod data, verify vs PROD); (2) build admin
> branch/subtree CRUD + chrome; (3) once ledger debt ≈zero, **FI-001 send** — `send-bbl-truelson-thankyou.ts`
> `--backfill` → `--send` (the `--verify` gate now passes). See `[[lineage-branch-heads-and-tree-consolidation]]`.

## Cross-references

- [Autonomous Sessions Runbook](../../runbooks/dev-environment/autonomous-sessions.md) — the driver + safety model.
- [Component Launch Sweep Recipe](../../runbooks/component-launch-sweep-recipe.md) — the schema-free boundary + `fallow` attribution reading.
- [Loop of Loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) · [wiring-ledger](../../knowledge/wiki/wiring-ledger.md) · [drift-register](../../knowledge/wiki/drift-register.md).
