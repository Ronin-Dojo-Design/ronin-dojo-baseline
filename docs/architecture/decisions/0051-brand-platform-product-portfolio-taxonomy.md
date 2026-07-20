---
title: "ADR 0051 — Portfolio taxonomy: kernel → brand → app → (suite → product → feature) + white-label instance axis"
slug: 0051-brand-platform-product-portfolio-taxonomy
type: adr
status: accepted
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
pairs_with:
  - docs/architecture/decisions/0034-monorepo-platform-and-per-product-deploys.md
  - docs/architecture/decisions/0038-per-product-database-separation.md
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
  - docs/knowledge/wiki/planning-ledger.md
backlinks:
  - docs/sprints/SESSION_0589.md
  - docs/knowledge/wiki/index.md
  - docs/knowledge/wiki/goals-ledger.md
  - docs/knowledge/wiki/ronin-project-context.md
---

# ADR 0051 — Portfolio taxonomy: kernel → brand → app → (suite → product → feature)

**Status:** accepted (SESSION_0589 operator grill, ratified). Supersedes the *unit-of-portfolio*
and *unit-of-deploy* vocabulary of [ADR 0034](0034-monorepo-platform-and-per-product-deploys.md) and
[ADR 0038](0038-per-product-database-separation.md); the technical-substrate model of
[ADR 0040](0040-design-system-doctrine-and-card-architecture.md) survives unchanged (only its *name* is fixed here).

> **Conform-cascade is deferred (PL-004 / lane L1 = `session-0590-taxonomy-conform`).** This ADR is
> the ratification artifact. Rewriting CLAUDE.md's North Star, the ADR 0034/0038/0040 supersede
> banners, and `ronin-project-context.md` to this vocabulary is the L1 build lane's job — not done
> in the ratifying session, per the operator's "don't rewrite the North Star until the ADR ratifies."

## Context

ADR 0034 + CLAUDE.md's North Star describe **"ONE platform"** (the shared kernel `packages/ui-kit`
+ brand-agnostic feature-modules) with the portfolio brands (BBL, Mammoth, Baseline, …) as
**"products"** = *a brand token-swap × a selection of modules*, each on its own DB/deploy (ADR 0038).
This is a **flat** model: one platform, N products.

At SESSION_0589's planning grill the operator corrected the framing: the portfolio is a set of
**brands**, and a brand can contain **multiple deploys, each an organized tree of capability** —
i.e. **brand is the top portfolio unit**, not "product." The word "platform" was overloaded (it
meant both *the shared kernel* and *a customer-facing grouping inside a brand*). This ADR
disambiguates the vocabulary and ratifies the hierarchy.

## Decision

### 1. The tier model

A **load-bearing spine of three tiers, always present**, plus **optional intra-app nesting**:

```
KERNEL                      the shared technical substrate: packages/ui-kit + brand-agnostic
  │                         feature-modules. Exactly ONE, owned by RDD (the company). (ADR 0040)
  │                         "platform" in old docs == the kernel; that name is now fixed.
  └─ BRAND                  the top PORTFOLIO unit (BBL, Mammoth, Baseline, WEKAF, ACD, RDD-agency).
      └─ APP                THE DEPLOY UNIT — one Vercel project + one database (ADR 0038). A brand
          │                 has ONE OR MORE apps. This is what ADR 0038 previously called a "product."
          └─ [optional, as an app grows:]
             SUITE          a grouping of related products within an app
               └─ PRODUCT   a feature-area within a suite
                   └─ FEATURE   a single capability within a product
```

- **Always present:** `kernel → brand → app`. Small apps stop here (`app → features`, flat).
- **Optional:** `suite → product → feature` is intra-app organization used **only as an app grows**.
  A brand is **not** required to express all tiers — forcing empty suites/products on a small app is
  the god-taxonomy this ADR rejects (the "one foundation + a few single-purpose pieces, lean over
  sprawl" mantra; CLAUDE.md).

**Word fixes (the disambiguation):**

| Term | Meaning (this ADR) | Was |
| --- | --- | --- |
| **kernel** | the shared technical substrate (`packages/ui-kit` + modules) | called "the platform" (ADR 0034/0040) |
| **brand** | top portfolio unit; owns 1+ apps | (implicit; conflated with "product") |
| **app** | the deploy unit (1 Vercel project + 1 DB) | called "product" (ADR 0034/0038) |
| **product** | a feature-area *within* an app | the whole deploy |
| **feature** | a single capability within a product | — |

### 2. The white-label instance axis (a second dimension)

Orthogonal to `brand → app → …`, the ADR ratifies a **white-label instance** concept — the RDD
reseller business, and the original ADR 0034 "brand token-swap × modules" made first-class:

- **Baseline** (brand) produces the **White Labeled Dojo** — the MVP-style finished school-ops SaaS.
- **RDD** (agency brand) **resells** White Labeled Dojo to customers.
- Each customer = a **white-label instance**: its own brand skin (PL-005 fixed-hue-brand-tint law) +
  its own deploy (= an app), produced from the White Labeled Dojo product.
- **Tuff Buffs** is the **pilot white-label instance**, mid-rebrand **into Baseline** — it is *not* a
  permanent peer brand; it is an instance being absorbed.

An instance IS an app (own deploy + own DB, ADR 0038), skinned per-brand from a source product. The
instance axis is *who a deploy is branded for*; the tier model is *how a brand's capability is
organized*.

### 3. The portfolio map (SESSION_0589)

Seven brands under the **RDD umbrella** (RDD the company owns the kernel + the umbrella dashboard):

| Brand | Domain | App(s) / deploy | Notes |
| --- | --- | --- | --- |
| **RDD** | agency / white-label reseller | ronindojo.design | owns kernel + umbrella State-of-Dojo; sells White Labeled Dojo |
| **BBL** ⭐ | martial-arts lineage | `apps/web` | flagship (permanent in-repo) |
| **Mammoth** | build/reno CRM | `clients/mammoth-build-crm` | client product (in-repo until handoff) |
| **Baseline** | dojo school-ops | baselinemartialarts.com | **= White Labeled Dojo** SaaS |
| **WEKAF** | tournament ops | dormant | schema exists, no active build |
| **ACD** (Amy Coaches Data) | **data/analytics coaching** — PowerBI/Tableau/SQL/Python; courses, certification, consulting | amycoachesdata.com | **non-martial-arts** — proves the kernel must stay domain-agnostic |
| _Tuff Buffs_ | _(→ Baseline)_ | _WordPress today_ | **white-label instance** of Baseline, transitional |

**ACD is load-bearing evidence:** a non-dojo brand in the portfolio proves the kernel + module
library must be **domain-agnostic** (courses/cert/consulting modules serve ACD *and* Baseline *and*
BBL memberships) — the reuse thesis of ADR 0040 holds only if no dojo assumptions leak into the kernel.

## Consequences

- **ADR 0034** — its "ONE platform / products = brand token-swap" framing is superseded by
  `kernel / brand / app`. The *monorepo-is-the-platform, per-deploy-unit, no-separate-prod-repos*
  strategy is unchanged; only the nouns change (platform→kernel, product→app).
- **ADR 0038** — "separate DB per **product**" reads "separate DB per **app** (deploy unit)."
  Semantics identical; the noun is corrected.
- **ADR 0040** — unchanged. The kernel + module-library model IS "the kernel" tier; this ADR only
  fixes its name (it is not "the platform").
- **Downstream conform (lane L1):** CLAUDE.md North Star, `ronin-project-context.md`, the ADR
  0034/0038/0040 supersede banners, and the State-of-Dojo dashboard tab model (PL-003: **brand
  tabs**, RDD umbrella above them) all restate to this vocabulary.
- **PL-002 vault SOT-per-brand** and **PL-003 dashboard tabs** now have a ratified unit: the **brand**
  is the tab/vault unit; apps are sub-views within a brand.

## Cross-references

- [ADR 0034 — repo & product strategy](0034-monorepo-platform-and-per-product-deploys.md) — superseded vocabulary.
- [ADR 0038 — separate DBs per product](0038-per-product-database-separation.md) — "product"→"app".
- [ADR 0040 — design-system doctrine & card architecture](0040-design-system-doctrine-and-card-architecture.md) — the kernel/module tier (unchanged).
- [ADR 0048 — two-repo vault-kit](0048-two-repo-vault-kit-and-client-ops-projections.md) — SOT-per-brand vaults.
- [Planning Ledger PL-004](../../knowledge/wiki/planning-ledger.md) — the row this ratifies.
- [SESSION_0589](../../sprints/SESSION_0589.md) — the ratifying grill.
