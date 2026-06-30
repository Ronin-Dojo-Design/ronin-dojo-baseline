---
title: "Design-System Doctrine — the Ronin Dojo Design constitution"
slug: design-system-doctrine
type: concept
status: active
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0467
pairs_with:
  - docs/architecture/decisions/0040-design-system-doctrine-and-card-architecture.md
  - docs/learning/ddd/learning-records/0006-design-systems-and-ui-kits.md
  - docs/knowledge/wiki/files/design-system-grid-ratio-hierarchy.md
  - docs/product/black-belt-legacy/page-specs/bbl-type-system.md
  - docs/runbooks/design/baseline-design-system.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - design-system
  - doctrine
  - tokens
  - typography
  - spacing
  - card
  - ui-kit
  - kernel
  - brand
---

# Design-System Doctrine — the Ronin Dojo Design constitution

> **This is the canonical design-system law** (ratified by [ADR 0040](../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md)).
> When any other doc disagrees with this one, **this doc + the live app win.** The teachable narrative
> behind it is [Learning Record 0006](../../learning/ddd/learning-records/0006-design-systems-and-ui-kits.md);
> read that first if you want the *why*, this if you want the *what*.
>
> **Live source of truth (code):** `apps/web/app/styles.css` (`@theme`), `apps/web/lib/brand-theme.ts` +
> the `BrandSettings` DB table (runtime brand overrides), `packages/ui-kit/src/tokens/tokens.css` (`--mk-*`
> kernel tokens). **The deleted `docs/_imports/monorepo-design-system/` corpus is NOT a source** — it was
> confidently-wrong legacy monorepo data (gold BBL, a `useDesignSystem()` hook) that contradicted canon.

---

## 0. What a design system is (and what this one was not)

A design system is **not a component folder.** It is a small set of **decisions made once** — color roles,
a spacing rhythm, a type ladder, proportion rules, a card architecture — written down as law, expressed as
**tokens**, and consumed by a small set of **single-responsibility components**. Brands are **token swaps**.
Apple, Material, and Figma all work this way: *tokens → primitives → components*, in that dependency order.

Before this doctrine the repo had the ingredients but never the loaf: three documents each claimed a
different "one card," a card component grew a five-way `kind` god-union, and an imported design system
contradicted the live app's own tokens. The fix is not "more components" or "improve the card" — it is
**ratify the system, then conform the components to it.**

The three laws everything below serves:

1. **Tokens are the contract.** Components reference token names, never literal hex. A brand is a block of
   token values. (§1)
2. **One surface, many named cards.** One `Card` *surface* primitive; a few semantic cards composed on it,
   each with a tight prop type. No `kind` union spanning unrelated information architectures. (§5)
3. **The live app is truth.** Imported or remembered values that contradict the running code are worse than
   no docs — they are confidently wrong. (§0 banner)

---

## 1. Tokens — the contract

Tokens are CSS custom properties carrying **semantic** roles, not raw colors. A component says
`bg-primary` / `var(--mk-accent)`; it never says `#E52421`. Two token namespaces exist, by design:

| Namespace | Where | Set by | Consumed by |
| --- | --- | --- | --- |
| `--color-*` | `apps/web/app/styles.css` `@theme` | static defaults + per-brand `[data-brand]` blocks + **`BrandSettings` DB** (runtime, wins) | the app (Tailwind v4 semantic classes: `bg-primary`, `text-muted-foreground`, …) |
| `--mk-*` | `packages/ui-kit/src/tokens/tokens.css` | kernel defaults; **re-mappable** by the host (`--mk-accent: var(--color-primary)`) | the kernel (`@ronin-dojo/ui-kit` — m-card, AdminKanban) |

**Why two:** the kernel is framework-agnostic and ships its own CSS (a standalone-bun client consumes it),
so it can't depend on the app's Tailwind pipeline. The `--mk-` prefix namespaces it so it never collides
with a host's `--color-*`, and a host **bridges** them with one line per token. Tokens travel into the
kernel; Tailwind does not (see §6).

### Runtime source of truth (important)

The static `[data-brand]` blocks in `styles.css` are the **fallback**. The **live SoT is the `BrandSettings`
DB table**, injected by `app/layout.tsx` as a `<style>` (via the HSL-guarded `brandThemeCss()` in
`lib/brand-theme.ts`) so white-label clients tune colors **without a deploy**. *If a color looks wrong on a
live page but `styles.css` looks right, check `BrandSettings` + `scripts/seed-brand-settings.ts` — the DB
wins.* (The infamous "BBL gold accent" bug was a wrong seeded DB value, not a CSS bug.)

### Color roles (semantic set)

`background` · `foreground` · `card` (+`-foreground`) · `popover` · `primary` (the one accent / CTA) ·
`secondary` · `muted` (+`-foreground`, the workhorse for secondary text) · `accent` (hover/surface, *not*
the brand color) · `destructive` · `border` / `input` / `ring` · `chart-1..5` · `chrome-*` (dark shell
band). **Rule:** no raw hex / `rgb()` / `text-[#…]` / `bg-[#…]` in public pages — that is the #1 drift.

### Dark / light

Light is default; **dark is a true inversion** that follows the OS (`prefers-color-scheme: dark`) and is
forceable via `<html data-theme="light|dark">`. Both modes keep the brand accent; only surfaces invert.
Dark surfaces deliberately mirror the iOS/Todoist chrome the board is modelled on.

---

## 2. Typography — the ladder

**Type pairing:** **Poppins** headings (extrabold, often uppercase italic for hero) + **Inter** body, with
**Geist** as the neutral fallback (`lib/fonts.ts` → `--font-bbl-heading` / `--font-bbl-body` → the
`--font-display` / `--font-sans` theme tokens; `--font-geist` is the fallback that avoids a self-reference
cycle). Loaded globally on `<html>` so every page resolves them.

| Role | Class | Use |
| --- | --- | --- |
| Eyebrow | `text-xs uppercase tracking-[0.18em] text-primary font-semibold` (or `--text-2xs` = 10px) | section kicker |
| `H1` | `text-3xl md:text-4xl` semibold | page title — **one per view** |
| `H2` | `text-2xl md:text-3xl` | section title |
| `H3` | `text-2xl` · `H4` `text-xl` | sub-sections |
| Body | `text-base text-muted-foreground` | prose |
| Meta / label | `text-sm` / `text-xs` `text-muted-foreground` | captions, badges |

**Hierarchy levers, in order:** size → weight → **color** (`foreground` vs `muted-foreground` vs `primary`)
→ space → tracking. Reach for the cheapest lever first; color does real hierarchy work — secondary text is
`muted-foreground`, not smaller-and-darker guesswork. The **squint test**: hierarchy must read in a
3-second squint. (`--text-2xs` = `0.625rem`, `--text-5xl` = `2.75rem`; otherwise the Tailwind scale.)

---

## 3. Spacing & rhythm

- **4px base scale** for all component-internal spacing (Tailwind's scale: `gap-2`=8, `gap-3`=12,
  `gap-4`=16, `p-5`=20…). No magic numbers; if a value isn't on the scale, it's a smell.
- **Fluid section spacing** via `--spacing-fluid-xs|sm|md|lg` (clamp-based) for responsive section rhythm —
  prefer these over ad-hoc margins.
- **The 1-2-3 rhythm:** eyebrow → title → body → **one** primary CTA. Everything else is
  `secondary`/`ghost`. One primary action per view.
- **Do not double-systematize:** 4px for component spacing, **φ for macro proportion** (§4) — never both on
  the same axis.

---

## 4. Proportion & grid

- **12-column grid.** Container `max-w-6xl` (~1152px) centered, padding `px-4 sm:px-6 lg:px-10`;
  `grid grid-cols-1 md:grid-cols-12 gap-6`. Canonical spans: content+sidebar **8/4**; even pair 6/6; triple
  4/4/4; feature row 3/3/3/3. Every block snaps to the grid. **Mobile (≤390px) = single column, full-width
  cards** (`min-w-0`, no fixed widths — the overflow lesson).
- **Golden ratio φ ≈ 1.618** where the grid doesn't dictate: hero/media aspect `1.618/1`; asymmetric splits
  favor ~62/38 over 50/50 ("designed," not "centered"); macro section gaps step by φ
  (`space-y-16` → `space-y-20` at `md`). φ is macro only — component spacing stays on the 4px scale.
- **Radius / elevation:** container `16px`, card `8px` (`rounded-lg`); one soft card shadow
  (`--mk-shadow-card` in the kernel). *(Conformance gap: the kernel card currently uses `--mk-r-card: 12px`
  — to reconcile to the L1 `8px` in the code session, §6.)*
- **Motion:** `--animate-reveal` (scroll-driven via `view()`), `fade-in`, `connector-draw`, accordion;
  global `a/button` ease-out 100ms. **Always** a `prefers-reduced-motion` fallback (show final state, no
  transform). The lineage timeline's dotted connector is a reusable motif — don't reinvent it.

---

## 5. The card architecture (the law that started this)

**One `Card` *surface* primitive + a small set of named, single-responsibility cards.** The Dirstarter L1
`Card` (`apps/web/components/common/card.tsx` — `Card`/`CardHeader`/`CardFooter`/`CardDescription`/`CardBadges`/
`CardBg`/`CardIcon`) is the ONE foundation. Semantic cards compose it; each has a **tight prop type**.

| Semantic card | Job (information architecture) | Anatomy | Lives |
| --- | --- | --- | --- |
| **`ListingCard`** | catalog / listing | media-hero + title + tagline + categories + View/Save footer | app |
| **record/person card** (today's app `m-card`) | identity | glyph/avatar + title + meta + **one focal value** + badges | app + (ported) kernel |
| **`BoardCard`** (today's kernel `m-card`: `task\|deal\|record`) | board cell | checkbox/glyph + title + due/focal + stage | kernel |

### The rule that bans the god-component

**No `kind` union that spans catalog *and* person *and* board.** `kind="roster"|"rank"|"task"|"loop"|"generic"`
is five cards hiding in a `switch`, with a DTO type that is really five DTOs in a trench coat. A blog post,
a person, and a kanban task are different information architectures — they get different *named* components,
not one component with skins. The board's "uniform stream" need is satisfied by **`BoardCard` being uniform
within the board**, not by forcing posts and people through one switch.

### Card anatomy (universal, brand-agnostic)

- **Exactly one focal value per card** gets accent + emphasis; the eye lands once. Everything else is
  identity or muted supporting meta.
- **Identity cluster reads as one unit:** leading glyph/avatar + title + secondary meta, left-aligned; the
  focal value right-aligned on the same baseline.
- **Progressive enrichment is a `density` prop, not a fork** (`compact` text-only → `rich` + hero image is
  the *same* component). Never split into two components to add an image.
- **Secondary meta is `muted-foreground`** and never competes with the title or the focal value.

### What this means for the in-flight work

- `ListingCard` (ADR 0028) is the **catalog** card — tools, schools, techniques **and** the five bespoke
  cards (course, post, merch, tournament, facet-result) consolidate onto it. **`m-card(kind=generic)` is
  not built.**
- `m-card` is **demoted** from "the one card" to the **record/person** card.
- The kernel `m-card` is the **board** card; it gets rebased onto the ported L1 surface (§6, the G-005 heal).

---

## 6. The kernel / UI-kit boundary

The kernel (`packages/ui-kit`, `@ronin-dojo/ui-kit`) is the shared core consumed by BBL **and** Mammoth
**and** future clients. It must stay **framework-agnostic** — a standalone-bun client consumes it from raw
source and it ships its own CSS, so it **cannot** import app-coupled Tailwind/cva/Base-UI code.

**The boundary rule: tokens travel, Tailwind does not.** To share the L1 `Card` with the kernel we **port
its surface contract** (anatomy + visual contract — padding/radius/border/bg/hover/shadow + slots) into the
kernel's plain-CSS/`--mk-*` idiom (ADR 0040 D4, "Option B: one contract, two renderers"), bridge `--mk-*`
to the host's `--color-*` so there is ONE token SoT, record the provenance chain in the component header,
and guard it with an **anti-drift parity test**. We do **not** drag Tailwind into the kernel (breaks the
standalone-bun client), and we do **not** clean-room a parallel (that is the drift this whole lane heals —
[Learning Record 0005](../../learning/ddd/learning-records/0005-extract-the-l1-down-dont-cleanroom-it.md)).

### Known conformance gaps (the half-baked truths the code session fixes)

These are real, currently-true divergences — recorded here so the follow-up code session has a checklist,
not a scavenger hunt:

1. **Two m-cards, different `kind` unions** — `apps/web/components/web/m-card` (`roster|rank|task|loop|generic`,
   Tailwind on the L1) vs `packages/ui-kit/src/m-card` (`task|deal|record`, plain CSS, clean-room). Reconcile
   per §5 (record/person card + BoardCard on one ported surface).
2. **Kernel card not on the L1** — the kernel `m-card` inherits none of Piotr's L1; port the surface down (§6).
3. **Token-name bridge gap** — Mammoth (`clients/mammoth-build-crm/app/globals.css`) defines `--accent` /
   `--surface` / `--border` / `--text-*`, but the kernel `m-card.css` reads `--mk-accent` / `--mk-elevated` /
   `--mk-line`. Verify/define the bridge so Mammoth actually re-skins the card (it may currently fall back to
   kernel defaults).
4. **Radius drift** — kernel card `--mk-r-card: 12px` vs the L1 `rounded-lg` (8px). Reconcile in the port.
5. **WEKAF token drift** — `styles.css` `[data-brand="WEKAF"]` primary is a generic red `hsl(0 84% 50%)`;
   the brand canon target is `#BF0A30` (+ blue `#002868`, gold `#FCD116`). Align the seed.

---

## 7. Brand tear sheets (derived from live canon only)

Six identities: **Ronin Dojo** (the platform umbrella) + the five products. Every value below traces to the
live app/client code or the brand-canon target — **never** the deleted import. The runtime SoT for the
app-brands (BBL/Baseline/WEKAF) is the `BrandSettings` DB; `styles.css` is the fallback shown here.

### Ronin Dojo — the platform umbrella (not a skin)

The parent that owns the monorepo, the kernel (`packages/ui-kit`), and this doctrine. It is **not a brand
token block**; it is the *system* the brands are skins of. "Ronin Dojo Design (RDD)" is the white-label
capability — Baseline is its reference output. No tear-sheet tokens; its "brand" is the doctrine itself.

### Black Belt Legacy (BBL) — the flagship

| | |
| --- | --- |
| Identity | "Black Belt Legacy" · *Honor the Lineage. Build the Future.* |
| Primary / accent | **red `hsl(1 79% 51%)` = `#E52421`** — the one accent. **No gold** (`#FFD700`/`#d7a74c` was a corrected wrong-import defect; do not reintroduce). |
| Surfaces | deep-black chrome shell, always dark: chrome `hsl(0 0% 4%)`, elevated `11%`, fg `100%`, muted `64%`, border `16%`. |
| Type | Poppins headings (extrabold, uppercase-italic hero) / Inter body. |
| Source | `[data-brand="BBL"]` in `styles.css`; `BrandSettings` (DB) at runtime. |

### Baseline Martial Arts — the RDD white-label reference

| | |
| --- | --- |
| Identity | The clean **dirstarter-derivative** white-label every client site forks from; intentionally minimal. |
| Primary | **Baseline blue/indigo `hsl(234 98% 61%)`** (the dirstarter default). Black / white / blue. |
| Surfaces | bg white `hsl(0 0% 100%)` / fg `hsl(0 0% 12%)` / card `98%` / border `88%` / muted-fg `45.1%`. True dark inversion. |
| Type | Geist (display = sans today; a distinct display face is a future brand-layer choice). |
| Source | the default `@theme` (no `[data-brand]` block) in `styles.css`. Token architecture frozen by ADR 0022. |

### Mammoth Build CRM — the construction-CRM client

| | |
| --- | --- |
| Identity | Construction-CRM product; dark + orange, industrial. **Provisional palette** (swap when real brand confirmed). |
| Primary | **orange `#FF6A1A`** (hover `#FF8338`, deep `#C24E12`). |
| Surfaces | bg `#0E0F11` / surface `#16181B` / elevated `#1F2226` / border `#2A2E33` / text `#F4F5F6` / muted `#9BA1A8`. |
| Type | Saira (display) / Inter (sans) — industrial stack, no build-time fetch. |
| Source | `clients/mammoth-build-crm/app/globals.css` (own product, separate DB per ADR 0038). Bridges its palette onto the kernel (`--accent: var(--primary)`) — see §6 gap #3. |

### Tuff Buffs — the CU-gold lifestyle/gear brand

| | |
| --- | --- |
| Identity | CU (Colorado) lifestyle/gear; the eventual Baseline visual-reference / customization demo. |
| Primary / accent | **CU gold `#CFB87C`**; secondary black `#000`, dark-gray `#434343`. |
| Type | Helvetica Neue display. |
| Source | external WordPress site (`Local Sites/tuffbuffs/…`); **not** an in-repo `[data-brand]` skin today. Brand-canon values synthesized in `baseline-design-system.md`. Status: reference, not yet applied in-app. |

### WEKAF USA — the FMA/Filipino-flag brand

| | |
| --- | --- |
| Identity | World Eskrima Kali Arnis Federation (USA); Filipino-flag palette, gradient surfaces. |
| Primary / accent | brand canon **red `#BF0A30` + blue `#002868` + gold `#FCD116`**. (Live `styles.css` fallback is a generic red `hsl(0 84% 50%)` — align to canon, §6 gap #5.) |
| Source | `[data-brand="WEKAF"]` in `styles.css` (+ `.dark` parity); `BrandSettings` at runtime. |

### Adding a brand (the recipe)

1. `Brand` enum in Prisma → 2. host map in `brand-context.ts` → 3. config in `config/site.ts` → 4. optional
`[data-brand]` token block in `styles.css` (fallback) → 5. `BrandSettings` row (runtime SoT, deploy-free).
The card/board components **do not change** — a brand is a token block.

---

## 8. Conformance & governance (the Desi sweep)

Audit any surface by diffing its computed classes against this doctrine (curl the SSR HTML or inspect the
live DOM — don't eyeball mid-compile):

- [ ] Tokens only — **no raw hex / `rgb()` / `text-[#…]` / `bg-[#…]`** in public pages.
- [ ] Every block snaps to the 12-grid; container `max-w-6xl` + standard padding; mobile = 1 column, `min-w-0`.
- [ ] Two-pane / hero proportions use φ (or the 8/4 grid), not 50/50 by default.
- [ ] Exactly **one `H1`** and **one primary CTA** per view; type follows the ladder (no ad-hoc sizes).
- [ ] Color does hierarchy work (`muted-foreground` for secondary), not just decoration.
- [ ] Spacing on the 4px scale (component) / φ (macro); no magic numbers.
- [ ] Every interactive control has **`focus-visible`** (the single largest polish gap in the legacy build).
- [ ] Cards: **one focal value** + identity cluster + muted meta; **a named card, never a `kind` god-union**.
- [ ] Cards compose the L1 `Card` surface (or the ported kernel surface) — never a from-scratch card.
- [ ] Loading = **skeletons** over spinners for list/card surfaces.
- [ ] WCAG AA contrast; dark/light both pass.

---

## 9. Gold-standard references (the systems we measure against)

This doctrine is not invented — it is the distillation of the field's best systems onto our stack. Five
named gold standards, each with what we take and the code/doc to study:

| Gold standard | What it is | What we take | Study |
| --- | --- | --- | --- |
| **Dirstarter** (the primitive gold standard) | The purchased boilerplate our app + Baseline/RDD white-label are built on — **Tailwind v4 + Radix UI + shadcn/ui** L1 primitives (`Card`, `Button`, `Stack`, `Form`…). | Our **L1 surface + token model IS Dirstarter's**: `app/styles.css` `@theme` with HSL `--color-*`, `.dark` class inversion, `lib/fonts.ts` → `--font-*`, `cva` variants. Don't rebuild primitives — compose them. | [dirstarter.com/docs](https://dirstarter.com/docs) · **[/docs/theming](https://dirstarter.com/docs/theming)** (the canonical code reference); our [dirstarter-baseline-index](../../architecture/dirstarter-baseline-index.md). |
| **shadcn/ui** | The unstyled-primitive + copy-in-ownership model under Dirstarter (Radix + Tailwind, you own the component code). | **Semantic `background`/`foreground` token pairs** (our exact convention), `.dark` token-override theming, ownership (we copy + adapt, never npm-lock a card). | [ui.shadcn.com/docs/theming](https://ui.shadcn.com/docs/theming) |
| **Material Design 3** (Material You) | Google's third-gen system; **3-tier tokens** (reference → system → component) + dynamic color from one source. | The **token-tier discipline**: raw HSL = *reference*; `--color-primary` / `--mk-accent` = *system* (semantic); the card/button = *component*. Swap reference, components don't change = our **brand-is-a-token-swap**. | [m3.material.io](https://m3.material.io/foundations/design-tokens/overview) |
| **Apple Human Interface Guidelines** | Multi-platform OS design language. | **Principles over rigid specs** — clarity, deference, depth; one focal action; the *squint test* (§2). | [developer.apple.com/design](https://developer.apple.com/design/human-interface-guidelines) |
| **Figma token model** | The *tokens → primitives → components* dependency order. | The build order this doctrine enforces (§0): you don't ship components before the tokens + primitives they stand on. | [figma.com/resource-library/design-system-examples](https://www.figma.com/resource-library/design-system-examples/) |

## 10. The 12 design systems — and the position each one validates

From [Figma — *Design system examples* (resource library)](https://www.figma.com/resource-library/design-system-examples/),
the operator's reference. Figma defines a design system as *"a comprehensive collection of reusable
components, guidelines, and tools… a shared source of truth,"* built from **four parts: UI kits · design
tokens · patterns · documentation** (the §11 self-test). We don't cite the twelve for flattery — each
independently confirms a position this doctrine takes, which is the point: our laws are the field's
consensus, not local preference.

| # | System | What it is / its lesson | Doctrine position it validates |
| --- | --- | --- | --- |
| 1 | **TapTap** | comprehensive Figma kit — a versatile *starting point* | §0/§5 start from a base (Dirstarter), don't reinvent |
| 2 | **Material Design 3** | dynamic color from a single source; 3-tier tokens | §1 tokens-as-contract; one accent SoT |
| 3 | **Arco** (ByteDance) | "Design Lab" intelligent theme creation | §6/§7 brand theming = token swap, not a fork |
| 4 | **Shopify Polaris** | components + accessibility across the ecosystem | §5 named single-purpose components; §8 a11y |
| 5 | **Dialect** | speed-first community kit for prototyping | §0 compose a base; don't start from scratch |
| 6 | **IBM Carbon** | open-source, accessibility + *extensive documentation* | §0/§8 documentation-as-law; tokens at the token layer |
| 7 | **Simple Design System** | foundational elements; learning good habits | §3–§4 foundations (spacing, type, proportion) |
| 8 | **Apple HIG** | principles-driven grammar > rigid specs | §2 squint test, one focal value, hierarchy levers |
| 9 | **Finesse UI** | clean, organized component kit | §5 one surface + tidy, single-purpose cards |
| 10 | **Atlassian** | layered tokens across interconnected products | §1 two-tier `--color-*`/`--mk-*` + the bridge; §7 multi-product |
| 11 | **Wanted** | clean visual language, established quickly | §1 tokens = a consistent language, fast |
| 12 | **Uber Base** | consistency across a global, multi-product ecosystem | §7 scalability: kernel + token-swap brands + per-product deploy |

## 11. Are we a real design system? (Figma's four-part test)

Figma's definition says a design system is **UI kits + design tokens + patterns + documentation**. Applied
to us honestly — also the rubric the [Desi sweep](#8-conformance--governance-the-desi-sweep) and
[`hostile-repo-review`](../../protocols/hostile-repo-review.md) audit against:

| Figma part | Our implementation | Status |
| --- | --- | --- |
| **UI kits** (reusable building blocks) | Dirstarter L1 primitives (`Card`/`Button`/`Stack`/`Form`) + the named cards (§5) | **Partial** — primitives solid; the card layer is mid-consolidation (G-005). |
| **Design tokens** (color / spacing / type) | `--color-*` (app, DB-driven) + `--mk-*` (kernel), bridged (§1) | **Strong** — tokens *are* the code (`@theme`). |
| **Patterns** (element behavior) | card anatomy (one focal value), connector motif, the 1-2-3 rhythm, the 12-grid/φ (§3–§5) | **Strong** — documented; mid-migration onto the one surface. |
| **Documentation** | this doctrine + tear sheets + the inventory + the Desi sweep | **Strong (as of now)** — the point of this session. |

> Two deeper bars the field holds (Carbon's docs depth, Fluent/Polaris accessibility, Atlassian/Uber
> scalability): we're **strong on scalability by design** (shared kernel + token-swap + per-product DB),
> and the honest gaps are **accessibility** (focus-visible, §8) and **component depth** (the card
> consolidation). Those gaps *are* the S48 + G-005 backlog — this is a scorecard, not a victory lap.

## 12. Provenance

Authored SESSION_0467 (Petey grill + Giddy lesson) to ratify a single design-system law after a
card-consolidation lane (G-005) surfaced three contradicting "one card" docs, a `kind` god-union, and a
confidently-wrong imported design system (deleted this session). Researched against the five gold standards
(§9) and the twelve systems (§10). Ratified by
[ADR 0040](../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md); narrated in
[Learning Record 0006](../../learning/ddd/learning-records/0006-design-systems-and-ui-kits.md). Absorbs +
supersedes the scattered fragments ([grid/ratio/hierarchy](files/design-system-grid-ratio-hierarchy.md),
[type system](../../product/black-belt-legacy/page-specs/bbl-type-system.md), [component-design-system](component-design-system.md),
[baseline-design-system](../../runbooks/design/baseline-design-system.md)), which now point here.
Also grounded in Ousterhout's *A Philosophy of Software Design* (deep modules — the card surface is the deep
module; pull complexity down into tokens + primitives).
