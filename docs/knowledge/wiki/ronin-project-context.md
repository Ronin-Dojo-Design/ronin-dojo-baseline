---
title: "Ronin Project Context"
slug: ronin-project-context
type: concept
status: active
created: 2026-05-18
updated: 2026-07-20
author: Brian + Giddy
last_agent: claude-session-0590
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/repo-truth-index.md
  - docs/product/README.md
  - docs/product/baseline-martial-arts/PRD.md
pairs_with:
  - docs/protocols/WORKFLOW_5.0.md
  - docs/knowledge/wiki/doc-pruning-register.md
  - docs/product/baseline-martial-arts/PRD.md
  - docs/product/black-belt-legacy/PRD.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
  - docs/runbooks/dev-environment/session-command-log.md
tags:
  - context
  - canon
  - workflow
  - brands
---

# Ronin Project Context

This page is the compact project-context handoff for agents and humans working in `ronin-dojo-baseline`.

It is intentionally short. It should explain the rules a new agent must not miss without replacing the repo truth index, architecture docs, or session files.

## What this project is

**Black Belt Legacy (BBLApp v4.4) is LIVE** at [blackbeltlegacy.com](https://blackbeltlegacy.com) — launched **June 19, 2026** — the heritage/community lineage network for martial artists (profiles, the promotion **timeline-tree**, rank history, claims, paid Premium/Elite memberships).

The codebase began as a *multi-brand* martial arts platform (one shared Next.js app + schema, brand behavior via data/routing/theme) and is being **pared to single-brand BBL** — the multi-brand harness is dormant and slated for prune. For agents: the schema + `Brand` enum still carry four brands, so **brand-scoping still applies in code**, but **BBL is the only live/active brand and the whole near-term game.**

## Toolchain (canonical, SESSION_0360)

- **Package manager:** Bun — one root `bun.lock`; Vercel + CI run `bun install --frozen-lockfile`. Stop the dev server before any install.
- **Lint / format:** **Oxc** — `oxlint` + `oxfmt` (replaced Biome). Gates: `bun run lint:check` / `format:check`. Run the local bin, **never `bunx oxlint`/`bunx oxfmt`** (it hangs).
- **Language / framework:** TypeScript 6, Next.js 16, React 19, Prisma 7 — versions aligned to the in-repo `dirstarter_template` upstream reference.
- **Typecheck is separate from lint:** `next typegen && tsc --noEmit` (Oxc does not replace `tsc`).
- Command recipes: [session-command-log](../../runbooks/dev-environment/session-command-log.md).

## Brands (the RDD portfolio — BBL is live; the rest dormant/emerging)

Per [ADR 0051](../../architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md) a
**brand** is the top portfolio unit (`kernel → brand → app`); a brand owns **one or more apps**
(an app = the deploy unit, one Vercel project + one DB). Seven brands under the RDD umbrella:

| Brand | Domain | App(s) / deploy | Status |
| --- | --- | --- | --- |
| **Ronin Dojo Design** | agency / white-label reseller | ronindojo.design | owns the kernel + the umbrella State-of-Dojo dashboard; resells the White Labeled Dojo. |
| **Black Belt Legacy** ⭐ | martial-arts lineage, claims, certifications, paid memberships | `apps/web` | **🚀 LAUNCHED June 19, 2026 — the active lane; flagship, permanent in-repo.** |
| **Mammoth** | build/reno CRM | `clients/mammoth-build-crm` | client-brand app — in-repo until a contractual handoff. |
| **Baseline** | dojo school-ops, curriculum, certification | baselinemartialarts.com | **= the White Labeled Dojo** SaaS (RDD resells it); hardened the kernel pre-BBL. |
| **WEKAF USA** | tournament operations | dormant | schema exists, no active build. |
| **ACD** (Amy Coaches Data) | **data/analytics coaching** (PowerBI/Tableau/SQL/Python; courses, cert, consulting) | amycoachesdata.com | **non-martial-arts** — proves the kernel + modules stay domain-agnostic. |
| _Tuff Buffs_ | _(→ Baseline)_ | _WordPress today_ | **white-label instance** of Baseline, mid-rebrand — an instance being absorbed, not a permanent peer brand. |

**Disambiguation (ADR 0051):** portfolio "brand" (above) ≠ the DEAD in-app 4-brand `Brand`-enum
harness (four brand-skins crammed into ONE app → collapsed to single-brand BBL; ~170 vestigial
`getRequestBrand` sites slated for prune). A brand skin per *deploy* (white-label instance) is
alive; multiple skins in one app via the enum is what's dead.

## Repo & product strategy (ADR 0034; taxonomy ratified by ADR 0051)

**One monorepo (this repo) hosts the kernel + every brand's apps** (`kernel → brand → app`, ADR
0051); deploy unit = **per-app Vercel projects** (`ignoreCommand`); `main` = prod, previews =
staging. **No separate prod repos.** The in-app multi-*brand* `Brand` enum (~170 `getRequestBrand`
sites) is dead → single-brand collapse to BBL + full prune; **multi-*app* (separate apps in one
monorepo, one deploy per brand/instance) is the model.** Repo name stays neutral (**not**
`black-belt-legacy`). A true separate repo is reserved for a **client handoff** only. (Old docs:
"platform"=the kernel, "product"=an app — ADR 0051 word-fix table.)

| Surface | Role | North star |
| --- | --- | --- |
| `apps/web` — **Black Belt Legacy** | flagship **app** (BBL brand); **permanent in-repo** (never handed off) | the verified lineage **graph** (asset/moat); **mission** (preserve the Machado / Bob Bass lineage) is the engine; revenue is exhaust; **optimize the claim loop**. Full vision: BBL PRD. |
| `packages/ui-kit` | the shared **kernel** (m-card, boards, tokens) | reusable leverage; published as a package on client handoff (ADR 0033 D1) |
| `clients/*` — e.g. Mammoth CRM | **client-brand apps** | in-repo until a contractual handoff, then own repo consuming `ui-kit` |

## Non-negotiable rules

- Dirstarter is the L1 baseline.
- `WORKFLOW_5.0` governs sessions.
- Latest accepted ADR beats older reports.
- Current Prisma schema beats nostalgia.
- Brand scoping is mandatory.
- Public payloads are allowlists.
- Sensitive mutations require audit logs.
- Lineage truth changes must use explicit audited actions, not casual drag/drop.
- Rank/certification records should remain compatible with later Black Belt Legacy verification.
- **Passport is the identity source of truth** (ADR 0025); a person is one `Passport` — do not re-introduce parallel person stores (the 4-minter drift is being consolidated). SESSION_0357–0358.
- **A BBL member's school comes from `Affiliation`** (registration / claim / invite / RBAC), **not `Membership`**.
- Session files are operational handoff truth.
- Wiki pages are repo memory, but not every wiki page is canonical product truth.
- Do not bulk-load old imports unless the lane requires it.

## Current product priorities

1. **Black Belt Legacy post-launch** — BBL is **LIVE** (launched June 19, 2026). The running post-launch list (P0/P1/P2 + Now-live) is canonical in `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md`. Feature lifecycle is tracked as `lifecycle:` (e.g. `MVP_LIVE`) on `files/` specs; public feature status lives in `FEATURES.md` + the in-app `/changelog`.
2. Single-brand collapse / multi-brand-harness prune (GitHub + folder rename → black-belt-legacy).
3. Docs pruning/consolidation + session-process lean-up.
4. Baseline Martial Arts school-ops (dormant lane).
5. Agent workflow/dashboard integration later.

## Where truth lives

| Truth domain | Canonical location |
| --- | --- |
| Product | `docs/product/` |
| Architecture | `docs/architecture/` |
| Decisions | `docs/architecture/decisions/` |
| Schema | `apps/web/prisma/schema.prisma` |
| Identity (person root) | `Passport` (+ `User` for auth) — [ADR 0025](../../architecture/decisions/0025-passport-identity-source-of-truth.md) |
| Protocols | `docs/protocols/` |
| Rituals | `docs/rituals/` |
| Repo memory | `docs/knowledge/wiki/` |
| Sessions | `docs/sprints/SESSION_NNNN.md` |
| Historical source/imports | `docs/architecture/source/`, `docs/_imports/`, archive folders |

## Conflict resolution order

When docs disagree, resolve in this order:

1. accepted ADR
2. current Prisma schema for durable data
3. canonical product doc in `docs/product/`
4. current architecture spec
5. current protocol/ritual
6. latest relevant session file
7. historical source/import docs

## Product-doc rule

PRDs and story docs should be concise and decision-oriented.

They should not carry every implementation note, full session history, raw research dump, or duplicate architecture spec.

## Current Baseline Martial Arts canon

- `docs/product/baseline-martial-arts/PRD.md`
- `docs/product/baseline-martial-arts/STORIES.md`
- `docs/architecture/source/Launch-OS-Baseline-Martial-Arts-.md`

## Current Black Belt Legacy canon

- `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` — **post-launch running list (P0/P1/P2 + Now-live); canonical since launch.**
- `docs/product/black-belt-legacy/BBL-SOT-Spec.md` — the phased program blueprint (SESSION_0359 pivot). `SOT-ADR.md` **D1–D11** are the current decisions (D11 = minimum-viable-flip gate, ratified).
- `docs/product/black-belt-legacy/PRD.md`
- `docs/product/black-belt-legacy/STORIES.md`
- `docs/architecture/lineage/lineage-tree-v1-requirements.md`
- `docs/architecture/lineage/lineage-editor-permissions-spec.md`

## Baseline product chain

```txt
Lead -> Trial -> Household/Member -> Waiver -> Membership -> Schedule -> Attendance -> Progress -> Rank -> Billing -> Renewal
```

Baseline should lead with school-owner operations while making the visible demo student-friendly.

## Doc diet rule

Before deleting or moving docs, record candidates in:

- `docs/knowledge/wiki/doc-pruning-register.md`

Use these states:

- canonical
- active supporting
- reference
- archive candidate

Archive only after a summary is preserved in a canonical or active-supporting doc.
