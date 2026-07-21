---
title: "Recipe — New-Brand Business Interview (model/revenue/modules, Brandon-owned)"
slug: recipe-new-brand-interview-business
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-setup.md
  - docs/protocols/recipes/new-brand-intake.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - brand
  - recipe
  - onboarding
---

# Recipe — New-Brand Business Interview

Sibling interview card (Brandon-owned): turn a brand's raw material into a **structured brand brief** —
positioning, mission, philosophy, founder/brand story, revenue model, entitlements, and which kernel
feature-modules the brand runs. Standalone-composable. **Rung-2 card, first proven by RDD/0598;
skill-ify deferred until 2–3 runs.**

## Persona pack

- **Brandon** — owns it; separates **confirmed truth** (operator's words / ratified canon) from
  **recommendation** from **`[operator to fill]`**. Reviews and recommends; does not publish or write code.
- **Operator** — the source of confirmed truth; ratifies positioning + mission before anything goes on-brand.
- **Petey** — consumes the module map + showcase model for scope/sequencing.

## Load-set

1. The raw ask (operator directive / [intake](new-brand-intake.md) brief).
2. ADR 0051 taxonomy + CLAUDE.md North Star — where the brand sits (first-party vs client; which modules).
3. [`ronin-project-context.md`](../../knowledge/wiki/ronin-project-context.md) — the portfolio map.
4. **Kernel module inventory** — what exists to reuse (leads, directory, auth, media, entitlements) vs net-new.

## Step sequence

1. **Positioning + mission** — one-line + a mission draft (mark `[REC]`; operator ratifies).
2. **Philosophy / how the brand runs** — the operating model in buyer-facing language.
3. **Founder / brand story** — the credibility spine, with `[operator to fill]` for concrete facts.
4. **Revenue model** — the monetization lines (`[REC]`, needs operator confirm; no numbers on-site until ratified).
5. **Module map** — which kernel feature-modules the brand runs (**reuse**) vs **net-new** content types.
6. **Entitlements** — public vs authed split; **reuse existing authz — never build a 5th system**.
7. **Emit the brand brief** — `docs/product/<brand>/brand-brief.md`; the showcase/entry field list
   seeds the [client interview](new-brand-interview-client.md); open questions → operator.

## Minimum-output contract

1. **Brand brief** at `docs/product/<brand>/brand-brief.md` (confirmed / rec / `[operator to fill]` legend).
2. **Module map** — reuse vs net-new, path-cited.
3. **Entitlement split** — public/authed, reuse-only.
4. **Open questions** consolidated for the operator; **no copy is canon until sign-off**.

## Session stub

```yaml
type: session--plan            # or a section within a new-brand-setup session
lane: <brand-slug>
recipe: new-brand-interview-business
```

## Worked example — RDD (SESSION_0598)

From the operator's option-3 + portfolio answer, Brandon produced
[`docs/product/rdd/brand-brief.md`](../../product/rdd/brand-brief.md): positioning ("one kernel, many
brands"), mission draft, founder four-beat spine (`[operator to fill]`), showcase content type (fields),
three revenue lines, module map (leads/directory/auth/media **reuse**; testimonials + portfolio-adapter
**net-new**), two-state entitlements (public marketing + private admin). 8 open questions routed to operator.

## Cross-references

- [`new-brand-setup.md`](new-brand-setup.md) · [`new-brand-intake.md`](new-brand-intake.md) · [`new-brand-interview-client.md`](new-brand-interview-client.md).
- **Brandon** role: [`docs/agents/brandon.md`](../../agents/brandon.md).
