---
title: "Ronin Project Context"
slug: ronin-project-context
type: concept
status: active
created: 2026-05-18
updated: 2026-06-11
author: Brian + Giddy
last_agent: claude-session-0360
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
  - docs/runbooks/dev-environment/session-ops-cookbook.md
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

Ronin Dojo Baseline is a multi-brand martial arts platform built on a Dirstarter/Next.js foundation with one shared app, one shared schema, and brand behavior controlled through data, routing, and theme context.

## Toolchain (canonical, SESSION_0360)

- **Package manager:** Bun — one root `bun.lock`; Vercel + CI run `bun install --frozen-lockfile`. Stop the dev server before any install.
- **Lint / format:** **Oxc** — `oxlint` + `oxfmt` (replaced Biome). Gates: `bun run lint:check` / `format:check`. Run the local bin, **never `bunx oxlint`/`bunx oxfmt`** (it hangs).
- **Language / framework:** TypeScript 6, Next.js 16, React 19, Prisma 7 — versions aligned to the in-repo `dirstarter_template` upstream reference.
- **Typecheck is separate from lint:** `next typegen && tsc --noEmit` (Oxc does not replace `tsc`).
- Command recipes: [session-ops-cookbook](../../runbooks/dev-environment/session-ops-cookbook.md).

## The four brands

| Brand | Product theme | Primary story |
| --- | --- | --- |
| Baseline Martial Arts | School operations, curriculum, certification, and affiliation | Prove the operating system through Brian's school/program first, then scale as reusable school-ops SaaS for other schools and university programs. |
| Black Belt Legacy | Lineage, profiles, curriculum, certifications, and trust | Preserve martial arts legacy. |
| WEKAF USA | Tournament operations | Run events, divisions, brackets, scoring, and results. |
| Ronin Dojo Design | White-label sales, demos, and onboarding | Sell and operate client martial arts systems. |

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

1. **Black Belt Legacy launch** — the `BBL-SOT-Spec` program (upstream-current substrate → person-rooted identity → claim → WP-parity → cutover). THE focus until cutover.
2. Baseline Martial Arts school-ops PRD + stories.
3. Four-brand story map.
4. Docs pruning/consolidation.
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

- `docs/product/black-belt-legacy/BBL-SOT-Spec.md` — **THE single program blueprint (SESSION_0359 pivot); read first.** `SOT-ADR.md` D1–D7 are the current decisions.
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
