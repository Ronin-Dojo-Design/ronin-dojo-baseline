---
session: 463
status: open
---

# SESSION 0463 — Baseline: restore its own deployment (`apps/baseline`)

## Date

2026-06-28 (pre-staged for the 0463/0464/0465 parallel sprint)

## Operator

Brian

## Goal

Restore `baselinemartialarts.com` to its OWN white-labeled deployment as **`apps/baseline`** (off the
BBL app), continuing ADR 0038 per-product separation now that BBL has its own setup. Baseline is the lean,
flexible, white-label SaaS *school* template + the minimal UI/UX brand-tokens kit, built on the same
professional `apps/web` (Dirstarter-BBL) backend via the shared `packages/ui-kit` kernel.

## Status

open

## Locked decisions (sprint planning, 2026-06-28)

- Baseline lives in **`apps/baseline`** — an OWNED template peer to `apps/web`, NOT `clients/baseline`
  (it's the kept template, not a client-handoff product).
- It gets its own brand-token block + own DB + own Vercel project, consuming `packages/ui-kit`.
- `baselinemartialarts.com` **currently serves the BBL app** (single `ronin-dojo-baseline` Vercel project
  rooted at `apps/web`; `apps/web/lib/brand-context.ts` `resolveBrand()` always returns BBL).

## Bow-in

### Parallel session awareness

- **SESSION_0463 (THIS)** — Baseline restore — dir `apps/baseline` (new) — own DB — worktree
  `../ronin-0463` (branch `session-0463-baseline`).
- **SESSION_0464** — Mammoth auth + staging — dir `clients/mammoth-build-crm` — DB `mammoth_dev`.
- **SESSION_0465** — Platform security + `apps/*` CI/deploy — dir `apps/web` + `.github/` + `vercel.json`.

### Branch and worktree

- Branch `session-0463-baseline`, worktree `../ronin-0463`.

### Bow-out cleanup

- Fold worktree/branch self-clean into the close once merged to `main`.

## Petey plan

### Tasks

**TASK_01 — ADR (decision-first).** Write the ADR for Baseline as `apps/baseline`. Placement is DECIDED;
the ADR records (a) which BBL backend features Baseline keeps — shared `ui-kit` UI only vs porting
`apps/web/server/*` logic (auth/lineage/claim); (b) the domain cutover: detach `baselinemartialarts.com`
from the BBL Vercel project, point it at the new Baseline project (operator-gated — verify
`blackbeltlegacy.com` is attached to BBL FIRST, per Giddy).

**TASK_02 — scaffold `apps/baseline`.** Brand-token block, `prisma/schema.prisma` starter + own
`DATABASE_URL`, a runnable Next skeleton consuming `packages/ui-kit`. (Adapt `scripts/new-client-scaffold.ts`
for an `apps/*` target, or hand-build from `apps/web`'s shape.)

**TASK_03 — brand-tokens kit.** The minimal white-label token surface (the "lean, customizable, flexible,
responsive" goal) so a new school site is a one-file token swap.

### Pull ledger

- G-002 (per-product DB separation), MB-006 (Baseline rollout), RISK #9 (Dirstarter template model debt).

### Gates

- typecheck / oxlint / oxfmt / `bun run test` for any touched package; `apps/baseline` typecheck once it exists.

### Scope guard / coordination

- Do NOT edit CI (`ci.yml`/`playwright.yml`) or `vercel.json` here — the `apps/*` CI/deploy generalization
  is **SESSION_0465**'s job. Build the product; 0465 wires the gate. Coordinate at merge.

### Operator-gated handoff

- Vercel: detach/attach `baselinemartialarts.com`; provision Baseline's DB.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0463_TASK_01 | open | ADR: Baseline = apps/baseline; feature-keep scope + domain cutover |
| SESSION_0463_TASK_02 | open | scaffold apps/baseline (brand tokens, DB, ui-kit skeleton) |
| SESSION_0463_TASK_03 | open | minimal white-label brand-tokens kit |

## Next session

(TBD at close)
