---
title: ADR 0034 — One monorepo platform + per-product Vercel deploys
slug: adr-0034-monorepo-platform-and-per-product-deploys
type: decision
status: accepted
created: 2026-06-21
updated: 2026-07-20
last_agent: claude-session-0590
pairs_with:
  - docs/architecture/decisions/0033-component-library-shared-kernel-and-strategic-harness.md
  - docs/product/black-belt-legacy/SOT-ADR.md
  - docs/knowledge/wiki/ronin-project-context.md
  - docs/architecture/decisions/0048-two-repo-vault-kit-and-client-ops-projections.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - architecture
  - repo-strategy
  - monorepo
  - deploys
  - bbl
---

# ADR 0034 — One monorepo platform + per-product Vercel deploys

> **⚠ Vocabulary superseded by [ADR 0051](0051-brand-platform-product-portfolio-taxonomy.md)
> (SESSION_0589).** The *unit-of-portfolio* and *unit-of-deploy* nouns here are corrected:
> **"platform" → "kernel"**, **"product" → "app"** (the deploy unit); "product" now means a
> feature-area *within* an app. The strategy — one monorepo, per-deploy-unit Vercel projects, no
> separate prod repos — is **unchanged**; only the words change. See the ADR 0051 word-fix table
> and the `kernel → brand → app` spine.

## Status

Accepted — grilled with the operator (SESSION_0421, `grill-with-docs`). **Supersedes SOT-ADR D12.**

## Context

A repo-strategy session set out to "consolidate `black-belt-legacy` → `ronin-dojo-baseline`, prune,
rename, run baseline as a staging monorepo, promote to prod repos." Grounding corrected the premise:

- The local `black-belt-legacy` repo is a **fork of this repo at the SESSION_0414 pivot** with
  **exactly 1 unique commit** (an R2 next/image host fix) + 1 uncommitted edit. `ronin-dojo-baseline`
  is **90 commits ahead** — it has everything. The fork is the **corpse of D12** ("BBL extracts to
  its own repo"), created at the pivot and abandoned the same day. **Nothing to consolidate.**
- The proposal conflated **multi-*brand*** (4 brands in one app via a `Brand` enum — dead, collapsing
  to BBL) with **multi-*product*** (separate apps in one monorepo — the actual model). They were
  never the same thing.
- BBL's north star is **the verified lineage graph** (asset/moat), fueled by the **mission**, grown
  by the **claim loop**; revenue is exhaust. BBL is a *permanent flagship asset*, not a product to be
  handed off — so D12's "extract BBL to its own repo" was the right *pattern* aimed at the wrong
  target. The separate-repo pattern belongs to **client handoff** (Mammoth), not BBL.

## Decision

1. **One monorepo (this repo) is the platform.** `apps/web` = the BBL flagship; `clients/*` = client
   products (e.g. Mammoth CRM); `packages/ui-kit` = the shared kernel. No multi-repo split.
2. **Per-product Vercel projects are the deploy unit** (`vercel.json` `ignoreCommand` per app).
   `main` = prod, previews = staging. **There are no separate prod *repos*** — "staging vs prod" is
   Vercel environments, not repositories.
3. **BBL is permanent in-repo** (flagship + the living graph; never handed off). **Client products
   live in-repo until a contractual handoff**, then extract to their own repo consuming the
   **published** `ui-kit` (ADR 0033 D1). A separate repo is reserved for client handoff only.
4. **Multi-brand is dead.** The `Brand` enum + ~170 vestigial `getRequestBrand` sites are slated for
   a **full prune** (single-brand BBL). **Multi-product is the model.**
5. **The repo name stays platform-neutral** (e.g. `ronin-dojo-baseline` / `ronin-platform`) — **not**
   `black-belt-legacy`. BBL's identity is its Vercel project + `blackbeltlegacy.com`, not the repo name.
6. **BBL north star (recorded):** graph (asset) · mission (engine) · revenue (exhaust) · **optimize
   the claim loop above all.** Full vision lives in the BBL PRD; portfolio map in `ronin-project-context.md`.

## Consequences

- The single-brand collapse and the multi-client reuse stop contradicting: one shared kernel, many
  thin product apps, each with its own deploy.
- D12's "BBL → own repo" is formally dead; the local fork is disposable.
- Client work (Mammoth) gets fast in-repo iteration now and a clean extraction path later.
- Cost: the brand-harness prune (~170 sites) is real mechanical work; the repo-name and dead-repo
  cleanup are one-time.

## Migration checklist

- [ ] Salvage the local `black-belt-legacy` fork's 1 unique commit (R2 image-host fix) + the
      `brand-context.ts` edit **if not already equivalent on `main`**, then **delete the local fork +
      the empty `mrbscott44/black-belt-legacy` GitHub stub**.
- [ ] Stamp **SOT-ADR D12 superseded** (this ADR).
- [ ] Decide + execute the repo name (platform-neutral; or keep `ronin-dojo-baseline`).
- [ ] **Full-prune the brand harness** (`Brand` enum + ~170 `getRequestBrand` sites) — incremental /
      cloud-prompt batch.
- [ ] Stand up the **Mammoth Vercel project** pointing at `clients/mammoth-build-crm` (its own deploy).
- [ ] Add a `## North Star` section to the **BBL PRD**.
- [ ] Archive dead repos (`black-belt-legacy*` stubs, `-copy-from-git-mess`, the legacy monorepo once mined).
