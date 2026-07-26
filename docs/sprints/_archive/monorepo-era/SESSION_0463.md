---
session: 463
status: closed
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

closed

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
| SESSION_0463_TASK_01 | done | ADR 0039 (`docs/architecture/decisions/0039-baseline-as-apps-baseline.md`): Baseline = apps/baseline; feature-keep scope (shared ui-kit + lean own backend, NOT BBL's engine); operator-gated domain cutover (verify blackbeltlegacy.com on BBL first) |
| SESSION_0463_TASK_02 | done | scaffolded `apps/baseline` — runnable Next skeleton (`next build` green), own `prisma/schema.prisma` (Lead + SchoolSettings) + `baseline_dev` DATABASE_URL, consumes `@ronin-dojo/ui-kit` via `workspace:*` |
| SESSION_0463_TASK_03 | done | brand-tokens kit: `lib/brand.ts` (identity + color/font data) + `app/globals.css` CSS-var surface bridged to the kernel's `--mk-*` — a new school is a two-file swap |

## Key decision made during build (autonomous call — D3 in the ADR)

`apps/baseline` matches the root `package.json` `workspaces` glob (`apps/*`), so — unlike Mammoth
(`clients/*`, outside the glob) — it is a **root workspace member**, exactly like `apps/web`. It
therefore consumes the kernel via `"@ronin-dojo/ui-kit": "workspace:*"` and installs from the repo
root, with **no** `file:` + `link-ui-kit.mjs` symlink hack. The Mammoth standalone-bun pattern fights
bun's hoisting under `apps/*` (deps hoist to root, the local `file:` link never materializes). This is
the conservative, idiomatic call (follows the `apps/web` sibling). Recorded as ADR 0039 D3 +
convention: **`apps/*` = workspace member; `clients/*` = standalone-bun.**

## Evidence

| Claim | Proof |
| --- | --- |
| ADR written (placement + feature-keep + cutover) | `docs/architecture/decisions/0039-baseline-as-apps-baseline.md`; markdownlint 0 errors |
| `apps/baseline` scaffolded + runnable | `next build` → "Compiled successfully", "Finished TypeScript", 3 static pages prerendered (`/`, `/_not-found`) |
| Typechecks clean | `cd apps/baseline && bun run typecheck` (`tsc --noEmit`) → no output, exit 0 |
| Own DB, isolated (ADR 0038) | `prisma/schema.prisma` (Lead + SchoolSettings, NO BBL models) + `prisma.config.ts` (`DATABASE_URL` → `baseline_dev`); `prisma generate` → client OK |
| Consumes shared kernel via workspace | `node_modules/@ronin-dojo/ui-kit -> ../../packages/ui-kit` (whole-dir symlink); `package.json` dep `workspace:*` |
| Brand-tokens kit = two-file swap | `lib/brand.ts` (identity + `brandColors`/`brandFonts` data) + `app/globals.css` CSS vars bridged to kernel `--mk-*`; landing page renders zero hardcoded school name/copy/hex |
| Formatting gate | `oxfmt --check apps/baseline` → "All matched files use the correct format" |
| Lint gate | `oxlint apps/baseline` → only the `no-shadow-restricted-names` warning on the Prisma `globalThis` singleton — identical to `clients/mammoth-build-crm/lib/db.ts` + `apps/web/services/db.ts` (established repo pattern, warning not error) |
| No real data seeded | `prisma/seed.ts` upserts only the `SchoolSettings` template-defaults singleton; no leads |
| Scope respected | no edits to `.github/`, `vercel.json`, `apps/web`, or sibling worktrees; only `apps/baseline/**`, ADR 0039, this file, + root `bun.lock` (workspace-add) touched |

## Operator-gated handoffs (NOT done — documented per the guardrails)

1. **DB provision** — `createdb baseline_dev` locally; provision a Baseline Neon DB + `prisma migrate
   deploy` at ship.
2. **Vercel project** — create the Baseline project rooted at `apps/baseline`, own env
   (`DATABASE_URL`), own `ignoreCommand`.
3. **Domain cutover** — detach `baselinemartialarts.com` from the BBL project, attach to the Baseline
   project. **VERIFY `blackbeltlegacy.com` is attached to the BBL project FIRST** (ADR 0039 D5).
4. **CI/deploy wiring** for `apps/*` (`vercel.json` `ignoreCommand`, the `apps/*` CI matrix) — this is
   **SESSION_0465**'s lane; coordinate at merge. Baseline ships no CI/vercel.json change.

## Next session

- Execute the operator-gated cutover (DB provision + Vercel project + domain move, in the D5 order),
  coordinated with SESSION_0465's `apps/*` CI/deploy wiring at merge.
- Flesh out the Baseline product: a real inquiry POST → `Lead`, an admin board on the shared
  AdminKanban kernel, and richer school content — all still token-driven.
