---
title: "Recipe — New-Brand Intake (requirements → brief)"
slug: recipe-new-brand-intake
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-setup.md
  - docs/protocols/recipes/new-brand-interview-business.md
  - docs/runbooks/onboarding/new-client-runbook.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - onboarding
  - recipe
---

# Recipe — New-Brand Intake

The first mini-recipe: capture a new brand/client's requirements into a **brief** that makes the
[setup](new-brand-setup.md) fork set answerable. Standalone-composable — run it inside a larger
[new-brand-setup](new-brand-setup.md) session, or on its own when a lead first lands. Extends
[`new-client-runbook.md`](../../runbooks/onboarding/new-client-runbook.md) §1 and the lead material
under `docs/business/leads/`.

## Persona pack

- **Petey** — owns intake; turns the raw ask into structured requirements + the fork inputs.
- **Brandon** — pulled in when the ask is brand/voice-heavy (hands off to the [business interview](new-brand-interview-business.md)).
- **Operator** — the source of truth for what the brand *is* and what the app must do.

## Load-set

1. The raw ask (operator directive, or a lead doc under `docs/business/leads/<name>`).
2. ADR 0051 taxonomy — is this a **first-party brand** or a **client**? (decides `apps/*` vs `clients/*`).
3. [`ronin-project-context.md`](../../knowledge/wiki/ronin-project-context.md) — the portfolio map (where the brand sits).
4. Kernel module inventory — what already exists to reuse (leads, directory, auth, media, uploader).
5. **Discovery-call agenda** — `docs/product/rdd/assets/Initial_Client_Meeting_Template.docx` (RDD): the script for the intake meeting; its questions feed steps 1–3. Client-services fields (budget/stakeholders/cadence) are owned by the [client interview](new-brand-interview-client.md).

## Step sequence

1. **What the app does** — one-line + the domain objects it manages (`new-client-runbook.md:73-83`).
2. **Brand identity seeds** — name, domain, visual seed (an existing render/mock/screenshot → feeds the
   [design interview](new-brand-interview-design.md)), voice.
3. **Scope** — reach (local-scaffold-first vs through-cloud) × surface (marketing-only vs full auth/admin).
4. **Home classification** — first-party (`apps/*`) vs client-handoff (`clients/*`).
5. **Module map** — which kernel feature-modules the brand runs (reuse) vs net-new content types.
6. **Emit the brief** — `docs/product/<brand>/brand-brief.md`, structured, marking confirmed vs
   recommended vs `[operator to fill]`. Route brand/revenue depth to the [business interview](new-brand-interview-business.md).

## Minimum-output contract

1. A **brand brief** at `docs/product/<brand>/brand-brief.md`.
2. The **fork inputs** for [new-brand-setup](new-brand-setup.md) (home · scope · modules).
3. **Open questions** consolidated for the operator (the `[operator to fill]` items).

## Session stub

```yaml
type: session--plan            # or a section within a new-brand-setup session
lane: <brand-slug>
recipe: new-brand-intake
```

## Worked example — RDD (SESSION_0598)

Operator's Q2 answer (option-3 surface + portfolio showcase + founder story) was the raw ask; the
brief landed at [`docs/product/rdd/brand-brief.md`](../../product/rdd/brand-brief.md) (Brandon
synthesized the business depth). Home = `apps/rdd` (first-party); modules = leads/directory/auth/media
reuse + testimonials/portfolio-adapter net-new.

## Cross-references

- [`new-brand-setup.md`](new-brand-setup.md) — the parent that consumes this brief.
- [`new-brand-interview-business.md`](new-brand-interview-business.md) — where brand/revenue depth is developed.
- [`new-client-runbook.md`](../../runbooks/onboarding/new-client-runbook.md) §1 · `docs/business/leads/`.
