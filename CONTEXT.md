# Ronin Dojo Design — Platform

The RDD platform monorepo: one shared kernel + a library of brand-agnostic feature-modules, from which each product is assembled as a brand token-swap × a selection of modules. This file is the agent-facing domain model that Matt Pocock skills (`domain-modeling`, `wayfinder`, `grill-with-docs`) read and maintain. It is intentionally **lean** — the full glossary is [`docs/architecture/ubiquitous-language.md`](docs/architecture/ubiquitous-language.md); add a term here only when its absence actively misleads an agent.

## Language

### Repos & environments

**Active monorepo**:
`ronin-dojo-baseline` (GitHub `Ronin-Dojo-Design/ronin-dojo-baseline`) — the current, active, production platform monorepo; `main` = prod. Local checkout dir is `ronin-dojo-app`.
_Avoid_: "ronin-dojo-app" as the canonical repo name; "black-belt-legacy" as the repo name.

**Old monorepo**:
`ronin-dojo-monorepo` — the retired, reference-only legacy monorepo. Read-only; source for component-porting and design-pattern reference. Never build/deploy/mutate.
_Avoid_: treating it as active.

**Vault repo**:
`RDD_Baseline44_Vault` (private) — the operator's canonical Obsidian vault as its own lean git repo (`~/Desktop/Baseline_Vault`), separate from the monorepo.
_Avoid_: mixing vault content and monorepo content.

### Platform shape

**Platform**:
The one thing RDD builds — the shared kernel plus the module library. The moat.
_Avoid_: "app" (the platform is not one app), "website".

**Product**:
A brand token-swap × a selection of feature-modules, on its own DB/deploy (BBL · Mammoth · Baseline · Tuff Buffs · WEKAF). Any module can run on any product.
_Avoid_: "brand" (a brand is the token set; a product is brand × modules), "site".

**Kernel**:
`packages/ui-kit` — the shared UI foundation (one L1 Card, named cards, the token contract). Tokens are law on product surfaces.
_Avoid_: "component library", "design system" used loosely.

**Module**:
A brand-agnostic feature (leads/CRM, claims, payments, lineage graph, directory…). Belongs to the platform, not to a product.
_Avoid_: "feature" used to mean a product-specific one-off.

**BBL** (Black Belt Legacy):
The flagship product + the living verified lineage **graph** (the asset/moat). Permanent in-repo; never handed off.
_Avoid_: treating BBL as the repo name.

### Design pass

**DESIGN.md**:
The portable visual-system doc (GetDesign.MD / Google Stitch format) that the Impeccable design skill reads before a design command. Generated from the codebase, not hand-authored.
_Avoid_: confusing it with this CONTEXT.md (domain language, not visual system).

**Design pass**:
An anti-AI-slop design review run by the **Desi** agent driving a design skill (hallmark or Impeccable — both installed, called on demand). Scoped to greenfield / mockups / skins / brand surfaces, never overriding the ui-kit token contract on product surfaces (D11).
_Avoid_: "design review" used to mean a generic PR review.
