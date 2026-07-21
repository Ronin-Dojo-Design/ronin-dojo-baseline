---
title: "Recipe — New-Brand Setup (stand up a new brand/client app: the parent plan card)"
slug: recipe-new-brand-setup
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-intake.md
  - docs/protocols/recipes/new-brand-onboarding.md
  - docs/protocols/recipes/new-brand-interview-design.md
  - docs/protocols/recipes/new-brand-interview-business.md
  - docs/protocols/recipes/new-brand-interview-client.md
  - docs/protocols/recipes/epic-plan.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - orchestration
  - recipe
  - onboarding
---

# Recipe — New-Brand Setup

The **plan-session** that stands up a new brand or client app inside the monorepo — the parent card
that composes the family: [intake](new-brand-intake.md) → [interviews](new-brand-interview-business.md)
→ [onboarding](new-brand-onboarding.md) → build → cloud cutover. Specializes
[`epic-plan.md`](epic-plan.md) for the "new deploy unit" case (ADR 0034 monorepo + ADR 0038 per-app DB
+ ADR 0051 kernel→brand→app). Run this **before** any scaffold — a scaffold is the *output* of a
plan-first session, never improvised. **First worked example: RDD / SESSION_0598.**

## Persona pack

- **Petey** — owns the plan; grills the fork set below and pins each before any build lane launches.
- **Giddy** — the structural proof: `apps/*` peer vs `clients/*` standalone, disjointness of the
  owned file set (incl. the shared CI files), DB isolation shape.
- **Brandon** — runs the [business interview](new-brand-interview-business.md) (model, revenue,
  entitlements, modules).
- **Desi** — runs the [design interview](new-brand-interview-design.md) (skin/tokens, PL-005 fit).
- **Cody / Doug** — build + verify the [onboarding](new-brand-onboarding.md) scaffold in follow-on sessions.
- **Operator** — resolves every fork; gates cloud provisioning (Neon/Vercel/domain/email).

## Load-set

1. ADR **0034** (monorepo + per-product deploys) · ADR **0038** (per-product DB) · ADR **0051**
   (kernel→brand→app; is this brand first-party or a client?).
2. [`new-client-runbook.md`](../../runbooks/onboarding/new-client-runbook.md) + `scripts/new-client-scaffold.ts` — the proven mechanical path.
3. [`per-app-db-separation.md`](../../runbooks/database/per-app-db-separation.md) — the isolation proof.
4. The two structural exemplars: `apps/baseline` (workspace peer) vs `clients/mammoth-build-crm` (standalone-bun).
5. The intake brief (what the app does) — the input that makes the forks answerable.

## The fork set — pin ALL before dispatch

| Fork | Decision |
| --- | --- |
| **Home** | `apps/<name>` (first-party, permanent, workspace peer) vs `clients/<name>` (client, extractable-on-handoff, standalone-bun). First-party ⇒ `apps/*`. |
| **DB** | Own `schema.prisma` + `prisma.config.ts` + `<name>_dev` per ADR 0038; **isolation proof** required. |
| **Email** | Own domain-scoped Resend key (a cross-brand key 403s); which transactional emails at v1. |
| **Deploy + domain** | New Vercel project (Root Dir = the app dir) + scoped `ignoreCommand`; domain; Sensitive-var overlay. |
| **Scope** | Reach (local-scaffold-only vs through-cloud) × surface (marketing-only vs full auth/admin). |

## Overlays

| Signal | Shape |
| --- | --- |
| First-party permanent brand (RDD, BBL, Baseline) | `apps/<name>` peer; **3 CI edits** (`clients-ci.yml` paths + `ci.yml`/`playwright.yml` paths-ignore) — discover-CI is only half-dynamic. |
| Client, handoff-bound | `clients/<name>` standalone; `file:` ui-kit + `link-ui-kit` postinstall; auto-covered by Products-CI `clients/**`. |
| Full surface, one program | **sequential** slice roadmap (scaffold → DB → auth/admin → surface → cloud), staged one stub at a time — not a fan-out (slices depend on each other). |
| Cloud path unproven in-repo | keep provisioning (Neon/Vercel/domain/Resend) a **separate operator-gated** session after local scaffold + CI green. |

## Minimum-output contract

1. **Fork set pinned** — every row above answered, quoted into the first build stub.
2. **Brand brief** — from [intake](new-brand-intake.md) + the [business](new-brand-interview-business.md)
   and [design](new-brand-interview-design.md) interviews (client brands also run the
   [client interview](new-brand-interview-client.md)).
3. **Slice roadmap** — the sequential build sessions, with the immediate first stub staged (ADR 0049).
4. **Goal row** — a `G-NNN` program row in the goals-ledger for the deploy.

## Session stub

```yaml
type: session--plan
lane: <brand-slug>        # rdd | bma | mmb | usa | …
recipe: new-brand-setup
goal_ids: [G-NNN]         # the deploy's program row
```

## Worked example — RDD (SESSION_0598)

Home `apps/rdd` · DB `rdd_dev` · Resend `ronindojodesign.com` key · new Vercel project + domain
`ronindojodesign.com` · reach = local-scaffold-only, surface = full (marketing/portfolio + auth +
State-of-Dojo host). Goal row **G-027**. Brand brief: [`docs/product/rdd/brand-brief.md`](../../product/rdd/brand-brief.md).

## Cross-references

- [`new-brand-intake.md`](new-brand-intake.md) · [`new-brand-onboarding.md`](new-brand-onboarding.md) ·
  interview family: [design](new-brand-interview-design.md) · [business](new-brand-interview-business.md) · [client](new-brand-interview-client.md).
- [`epic-plan.md`](epic-plan.md) — the general plan card this specializes.
- `/new-client-recipe` skill + [`new-client-runbook.md`](../../runbooks/onboarding/new-client-runbook.md) — the mechanical path onboarding drives.
