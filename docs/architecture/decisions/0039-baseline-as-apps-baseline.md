---
title: ADR 0039 — Baseline restored as `apps/baseline` (its own deploy + DB)
slug: adr-0039-baseline-as-apps-baseline
type: decision
status: accepted
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0463
pairs_with:
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - repo-strategy
  - baseline
  - white-label
  - deploys
  - database
---

# ADR 0039 — Baseline restored as `apps/baseline` (its own deploy + DB)

## Status

**Accepted** — sprint planning SESSION_0463 (placement locked before build). **Applies** ADR 0034
(per-product deploys) and ADR 0038 (per-product DBs) to the Baseline product; **consistent with**
ADR 0033 (the `ui-kit` kernel stays shared).

## Context

`baselinemartialarts.com` currently serves **the BBL app**: there is one Vercel project
(`ronin-dojo-baseline`) rooted at `apps/web`, and `apps/web/lib/brand-context.ts` `resolveBrand()`
always returns `Brand.BBL` (the single-brand collapse, ADR 0034 D4). So the Baseline domain has no
deployment of its own — it rides BBL.

ADR 0034 established multi-*product* (separate apps in one monorepo, per-product Vercel deploys) and
ADR 0038 added one database per product. Mammoth (`clients/mammoth-build-crm`) already proved the
per-product DB pattern. Baseline is the next product to get its own home — but unlike Mammoth (a
client product on a handoff path under `clients/*`), **Baseline is an OWNED template** the platform
keeps. It is the lean, white-label martial-arts *school* site: a marketing page + lead-capture funnel,
re-skinnable to any school by a token swap.

The open questions this ADR settles: (1) **where** Baseline lives, (2) **which BBL backend features**
it keeps, and (3) **how** the domain moves off the BBL project.

## Decision

### D1 — Baseline lives in `apps/baseline` (an owned template, peer to `apps/web`)

Not `clients/baseline`. The `clients/*` tree is for client-handoff products (extractable on sale, ADR
0033 D1); Baseline is the **kept** white-label template — a first-party app, peer to the BBL flagship.
It gets its own brand-token block, its own database, and its own Vercel project, consuming the shared
`packages/ui-kit` kernel.

### D2 — Feature-keep scope: shared `ui-kit` UI + a LEAN own backend, NOT BBL's engine

Baseline is a lean school template, **not** BBL's lineage/claim engine. The recommendation, recorded:

- **KEEP (shared):** the `@ronin-dojo/ui-kit` kernel — m-card, design tokens, AdminKanban (ADR 0033
  D3). The kernel reads only its own `--mk-*` vars, so Baseline re-skins it via a CSS bridge for free.
- **KEEP (own, lean):** only the genuinely-needed app/server pieces for a school marketing site — a
  Prisma client over its **own** DB (`Lead` inquiry capture + a `SchoolSettings` white-label config
  singleton), a runnable Next skeleton, the brand-token surface. That's the MVP surface; it grows
  only as a real school need appears.
- **OUT of scope (BBL's moat, stays in `apps/web`):** the lineage graph, Passport identity, the claim
  loop, RankAward/promotion provenance, Membership/Affiliation, the ~125-model BBL schema, the brand
  harness (`getRequestBrand`/`Brand` enum). None of it is ported. Baseline owns no cross-product FK to
  BBL data (ADR 0038 D1) — any future shared data crosses an API/contract, not a FK.

Rationale: porting BBL server logic would re-couple the products the separation ADRs just decoupled,
and a school site does not need a lineage engine. Start lean; add only what a school genuinely needs.

### D3 — Baseline is a ROOT WORKSPACE member (`workspace:*`), not standalone-bun

This is the one place the build **diverged** from the Mammoth precedent, on purpose. `apps/baseline`
matches the root `package.json` `workspaces` glob (`apps/*`) — so, exactly like `apps/web`, it is a
**root workspace member**: it consumes the kernel via `"@ronin-dojo/ui-kit": "workspace:*"`, installs
from the repo root (shared `bun.lock`), and needs **no** `file:` link-script hack. Mammoth uses the
`file:` + `postinstall` whole-dir-symlink workaround **only because `clients/*` is outside the
workspaces glob** (genuinely standalone). Forcing a standalone-bun model on a path that the workspace
glob already claims would fight the toolchain (bun hoists the deps to the root regardless, leaving the
local `file:` link unmaterialized). Following the `apps/web` pattern is the clean, idiomatic call for
anything under `apps/*`. (Recorded for the new-client runbook: **`apps/*` = workspace member; `clients/*`
= standalone-bun.**)

### D4 — Own database (`baseline_dev` local; Neon at deploy)

Per ADR 0038 D1: Baseline gets its own `prisma/schema.prisma` (lean: `Lead` + `SchoolSettings`), its
own `prisma.config.ts` (Prisma 7 — URL lives here, not in the schema), its own `DATABASE_URL`
(`baseline_dev` locally), its own migrations. No shared Prisma package, no cross-product FK. Baseline
does **not** read BBL's lineage DB.

### D5 — Domain cutover plan (OPERATOR-GATED — not executed in this session)

`baselinemartialarts.com` must be detached from the BBL Vercel project and pointed at the new Baseline
project. **Ordering matters** (per Giddy): **verify `blackbeltlegacy.com` is attached to the BBL
project FIRST**, so detaching the Baseline domain never leaves BBL reachable only via the Baseline
host. Steps (all gated):

1. Confirm `blackbeltlegacy.com` (apex + `www`) is attached to the BBL Vercel project and serving.
2. Create the Baseline Vercel project, root directory `apps/baseline`, with its own env
   (`DATABASE_URL` → Baseline Neon DB) and `ignoreCommand` (CI/deploy wiring is **SESSION_0465**'s job).
3. Provision the Baseline Neon DB; run `prisma migrate deploy` against it.
4. **Then** remove `baselinemartialarts.com` from the BBL project and add it to the Baseline project;
   verify DNS + TLS resolve to the new project before considering it cut over.

## Consequences

**Positive:** Baseline gets its own deploy + DB + brand, decoupled from BBL; BBL's app stops
double-serving a domain it doesn't own; a new school site becomes a two-file token swap; the
`apps/*` = workspace-member convention is now explicit.

**Costs / follow-ups:**

- The domain cutover + Neon provision are operator-gated (D5) — not done here.
- CI/deploy generalization for `apps/*` (`vercel.json` `ignoreCommand`, the `apps/*` CI matrix) is
  **SESSION_0465**'s lane; this session builds the product only and coordinates at merge.
- The lean schema (`Lead`/`SchoolSettings`) is a starting point; a real inquiry POST handler, an admin
  board on the shared AdminKanban, and richer school content are follow-up work.

## Alternatives considered

- **`clients/baseline` (standalone-bun, Mammoth shape)** — rejected (D1/D3): Baseline is a kept owned
  template, not a handoff client, and it sits under the `apps/*` workspace glob; the standalone model
  fights bun's hoisting there.
- **Port BBL's server/auth/lineage into Baseline** — rejected (D2): re-couples the products the
  separation ADRs decoupled; a school marketing site doesn't need a lineage engine.
- **Keep Baseline served by the BBL app under a brand flag** — rejected: that's the multi-brand model
  ADR 0034 killed; it blocks independent deploy/DB/failure-domain — the whole point of the split.

## Dirstarter docs proof

Baseline extends, doesn't replace, the Dirstarter/`apps/web` baseline: same Next + Prisma + Tailwind
stack and the same per-app `DATABASE_URL` pattern ADR 0038 already established — just a leaner app and
a brand-token surface on top of the shared kernel. No new framework, no replaced pattern.

## Relationships

- **Applies** ADR 0034 (per-product Vercel deploys) and ADR 0038 (per-product DBs) to Baseline.
- **Consistent with** ADR 0033 D1/D3 (shared `ui-kit` kernel; a true repo split reserved for client
  handoff — Baseline stays in-repo as an owned template).
- **Records** the `apps/*` = workspace-member vs `clients/*` = standalone-bun convention for the
  new-client runbook.
