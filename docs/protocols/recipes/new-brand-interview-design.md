---
title: "Recipe — New-Brand Design Interview (skin/tokens, Desi-owned)"
slug: recipe-new-brand-interview-design
type: protocol
status: active
created: 2026-07-21
updated: 2026-07-21
last_agent: claude-session-0598
pairs_with:
  - docs/protocols/recipes/new-brand-setup.md
  - docs/knowledge/wiki/design-system-doctrine.md
backlinks:
  - docs/protocols/SOT_Cookbook.md
tags:
  - governance
  - design
  - recipe
  - onboarding
---

# Recipe — New-Brand Design Interview

Sibling interview card (Desi-owned): derive a new brand's **skin + brand tokens** and prove
design-system fit *before* the surface is built. Feeds the brand-skin pipeline + the PL-005 skin law.
Standalone-composable — run inside a [new-brand-setup](new-brand-setup.md) session or on its own when a
brand needs a skin. **Rung-2 card, first proven by RDD/0598; skill-ify deferred until 2–3 runs.**

## Persona pack

- **Desi** — owns it; extracts tokens, checks contrast + ui-kit L1 fit. Reviews and recommends; does not write production code.
- **Operator** — supplies the visual seed + ratifies the hue anchor.
- **Cody** — consumes the token spec at build (`app/globals.css` vars); not part of the interview.

## Load-set

1. **PL-005 skin law** (planning-ledger) — fixed-hue-brand-tint: semantic tokens hue-anchored +
   brand-tinted within an accessibility-safe contrast floor.
2. The **visual seed** — an existing render/mock/screenshot the brand starts from.
3. [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md) + the ui-kit token set —
   what's re-skinnable vs structural.
4. **G-018** (per-brand cockpit skins) — the skin family the brand joins.

## Step sequence

1. **Seed → hue anchor** — pull the brand's fixed hue(s) from the visual seed.
2. **Semantic token map** — derive the hue-anchored + brand-tinted semantic tokens; verify each against
   the **contrast floor** (PL-005). No hardcoded palette that bypasses the semantic layer.
3. **L1 fit check** — confirm the tokens drive ui-kit L1 primitives (card/m-card, buttons, selects)
   with **no bespoke component** needed; if a primitive is missing, **extract it down into `packages/ui-kit`**, don't clone.
4. **Emit the token spec** — a design brief (token block + rationale), NOT code in a plan session;
   hands to Cody at build.

## Minimum-output contract

1. A **token spec** (semantic tokens + fixed-hue anchor + contrast-floor proof).
2. **L1 fit statement** — reuse-only, or a named extract-down for the kernel.
3. **Skin-family placement** (G-018) — how this brand relates to the existing skins.

## Session stub

```yaml
type: session--plan            # or a section within a new-brand-setup session
lane: <brand-slug>
recipe: new-brand-interview-design
```

## Worked example — RDD (SESSION_0598)

Operator pin: **RDD's skin starts from the current State-of-the-Dojo surface look** — that render
(`scripts/state-of-project*` + the current mock) is the token seed. Extract RDD's fixed hue → PL-005
semantic tokens → RDD becomes the token exemplar the other brand skins derive from (G-018). Not
blank-canvas; not a hardcoded palette.

## Cross-references

- [`new-brand-setup.md`](new-brand-setup.md) · [`new-brand-interview-business.md`](new-brand-interview-business.md) · [`new-brand-interview-client.md`](new-brand-interview-client.md).
- [`design-system-doctrine.md`](../../knowledge/wiki/design-system-doctrine.md) — the L1/tokens-as-contract law.
