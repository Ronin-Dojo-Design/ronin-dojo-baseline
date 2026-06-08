---
title: "Petey Plan 0356 — Profile system redesign: one Person-presentation contract + BBL profile shell + unified register/claim funnel"
slug: petey-plan-0356-profile-redesign
type: plan
status: active
created: 2026-06-07
updated: 2026-06-07
last_agent: claude-session-0355
pairs_with:
  - docs/sprints/SESSION_0355.md
  - docs/runbooks/sops/lineage-data-wiring-flow.md
  - docs/knowledge/wiki/custom-component-inventory.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - profile
  - directory
  - person-presentation
  - bbl
  - onboarding
  - claim
  - register
---

# Petey Plan 0356 — Profile system redesign

> Staged from SESSION_0355 (assessment-only). Operator goal: apply the
> `baselinemartialarts.com/black-belt-legacy` layout/style to the user, school, and org
> profiles, and assess the profile setup *as a whole*. Guiding principle (operator):
> **"the instructor avatar should not be just for instructors"** — a person is a person
> everywhere. This is a **build plan**, not yet built.

## Governing concept — one Person-presentation contract

A single role-agnostic contract reused **everywhere a person appears** (cards, hero, lineage
nodes, selects), regardless of role (member / student / instructor / owner):

```text
PersonPresentation = avatar (passport.avatarUrl ?? user.image) + name + belt/rank + disciplines + location
```

Belt colour is always `Rank.colorHex` data (never hardcoded). Avatar resolution is one helper
`resolvePersonAvatar(user)`; initials are one helper `initialsOf`. The org/school analogue is the
same shell with an org logo (`Organization.avatarUrl`) in the avatar slot.

## Assessment (Desi, SESSION_0355)

**Caveat:** `WebFetch` to the live BBL page was denied in the assessment sandbox, so the live visual
teardown is **blocked**. Desi reconstructed the BBL signature treatment from the in-repo
`BlackBeltRail` family (`app/(web)/disciplines/_components/black-belt-rail{,-list}.tsx`) — a
belt-color + avatar + rank-badge rail with restrained, reduced-motion-safe stagger. **A build session
must re-run the live WebFetch (or a screenshot pass) before locking hero visuals.**

### Headline finding

`ProfileHero` (shipped SESSION_0354) already encodes most of the contract — but it is used in only
**three preview surfaces** (two dashboard forms + the claim teaser). **No public detail page renders
it.** The three public profiles each hand-roll a header from `Intro`/`IntroTitle`; two of three (org,
school) render **no avatar/logo at all**. Org member rows and school instructor cards render people as
**name-only text, no avatar** — the direct violation of "a person is a person everywhere."

### Current-state map

| Surface | Header | Avatar resolution | Uses ProfileHero? |
| --- | --- | --- | --- |
| `/directory/[slug]` (person) | `Intro` + separate avatar block below | `user.image` only (stale-avatar bug) | no |
| `/organizations/[slug]` | `Intro` + badges | none | no |
| `/schools/[slug]` | `Intro` + badges | none | no |
| directory card (`facet-result-card`) | normalized view-model | `passport.avatarUrl ?? user.image` ✓ | no (own card) |
| lineage node card / drawer | bespoke | `passport.avatarUrl ?? user.image` ✓ | no (own card) |
| black-belt rail | bespoke | `passport.avatarUrl ?? user.image` ✓ | no |
| dashboard profile/school form preview, claim teaser | `ProfileHero` | passed in | **yes** |

### Fragmentation to consolidate

- **Two hero systems** (`Intro`-based public vs `ProfileHero` preview) → preview ≠ published, defeating
  the live-preview promise.
- **Four hand-rolled person cards** (`facet-result-card`, `lineage-node-card`, org member row, school
  instructor card); the last two lack avatars.
- **Three different `initials()` implementations** + a local `profileInitial` on the directory page.
- **`ProfileHero` lacks** a belt-color/rank stripe slot, so lineage card/drawer reimplement it.

> **Fallow evidence (SESSION_0355):** `fallow audit` flags `SchoolDetailPage` at **355 lines / CRAP 1056
> (CRITICAL)** and `OrganizationDetailPage` at **350 lines / CRAP 702 (CRITICAL)**, plus duplication clone
> groups across the org/school pages. Lanes A/B (shared `ProfileShell` + one `PersonCard`) are the
> mechanical fix for these scores — track them as the success metric for the consolidation.

## Build lanes (prioritized)

### Lane A — Public profiles adopt the shared shell (P1)

1. Render `ProfileHero` (or a `ProfileHero`-backed profile shell) on `/directory/[slug]`,
   `/organizations/[slug]`, `/schools/[slug]`. Org/school get a logo (`Organization.avatarUrl`) → initials
   fallback in the avatar slot.
2. Fix the directory person avatar to `resolvePersonAvatar(user)` (currently `user.image` only).
3. Add an optional `accentColorHex` (belt stripe) + rank slot to `ProfileHero`; retire bespoke belt
   treatments in lineage card/drawer.

### Lane B — One `PersonCard` (P1/P2)

1. Extract one `PersonCard` implementing the contract; refactor `facet-result-card`, `lineage-node-card`,
   the org member row (`organizations/[slug]/page.tsx`), and the school instructor card
   (`schools/[slug]/page.tsx`) onto it — **avatars on members + instructors** (the operator's core ask).
2. Centralize `resolvePersonAvatar(user)` + one `initialsOf`; delete the 3 duplicate initials fns + the
   local `profileInitial`.

### Lane C — BBL "cohort/legacy rail" (P2)

1. Generalize `BlackBeltRail`/`BlackBeltRailList` into a scope-agnostic cohort/legacy rail (school top
   ranks, org top ranks, tree honor strip), driven by `Rank.colorHex`. **Re-run the live BBL WebFetch /
   screenshot first.**

### Lane D — Rich select rows for people/orgs (P2) — DataSelect-consumer follow-up from SESSION_0355

> **Decision rule — `DataSelect` vs `ComboboxSelector` (do not merge them):** `DataSelect` (Base UI
> `Select`) is for **short / fixed** lists (enums, facet filters, a handful of options); `ComboboxSelector`
> (`Command` + `Popover`, searchable) is for **long / searchable** lists (people, orgs, large discipline
> sets). The two are distinct UX primitives — merging would force a search box on a 6-item enum or drop
> search from a 500-row list. The **consolidation is a shared row-presentation contract** (the
> Person-presentation contract / `BeltSwatch`), so a rich row looks identical in both — NOT a merged
> primitive. Watch the borderline rank-award select (SESSION_0355): if those lists run long in real data,
> move it from `DataSelect` to `ComboboxSelector` (keep the belt swatch as its row).

1. School **logos** and person **avatars** in pickers belong on **`ComboboxSelector`** (the searchable
   person/org picker — `components/common/combobox-selector.tsx`), **not** `DataSelect`. SESSION_0355
   shipped `DataSelect` rich rows (`content?: ReactNode`) + `BeltSwatch` on the rank select + the
   `tool-filters` move-back; the remaining logo/avatar rows want the same Person-presentation contract
   applied to `ComboboxSelector` rows.

### Lane E — Unified register/claim/invite funnel (P1) — the Dirstarter submit pattern

Operator directive (SESSION_0355): **all registers, claims, and invites should follow the Dirstarter
submit pattern** (search-first → claim if it exists, else create new). SESSION_0355 shipped the interim
discoverable entry points (claim CTA on owner-less org/school detail pages; "Add your school" + "Join the
directory" register callouts; a dedup hint on the create-org form). This lane builds the **unified
funnel**:

1. One "Add your organization" entry that **searches the directory first**, then routes to **claim**
   (found, owner-less) or **create** (not found) — mirroring `app/(web)/submit/**` (Dirstarter Tool
   submit/claim) and the lineage claim flow. Align with `sop-data-and-wiring-flows.md` §18
   (Organization registration = our Tool-submission analogue).
2. Person onboarding: a first-class "Join the directory" → signup → Passport + DirectoryProfile create
   flow; replace the dashboard **"Avatar URL" free-text input** with an upload control (MinIO/S3 path
   already exists) — the **root cause** of empty avatars platform-wide.

### Lane F — Form/onboarding polish (P3)

1. Reorder profile-form fields (avatar first); feed rank/discipline tags into the live preview hero.
2. Replace the emoji settings glyph with a lucide icon; warm up the org "No members" empty state to
   match the claim-teaser tone.

## Privacy / spec guardrails (do not cross)

- Profile shells render only already-public/projected fields (lineage SOP §7; never widen a private
  payload). HIDDEN persons keep `notFound()` (no existence leak).
- Belt colour = `Rank.colorHex` data; **no hardcoded colours; no inline `style={}` for colour** — use the
  SVG `fill` / `--rank-color` CSS-var idiom (SESSION_0355 `BeltSwatch`).
- Claim/register auth follows the lineage SOP §5 ("sign in if needed", `?next=` return).
- `RankAward` is canonical (ADR 0016); presentation derives from it, never inverts it.

## Open question to grill before Lane A build

Single shared **profile shell** component (hero + section scaffold reused by person/org/school) vs just
reusing the leaf `ProfileHero` per page? Recommendation: a thin `ProfileShell` wrapping `ProfileHero` +
a tabbed/section body, so the three pages converge without over-abstracting the bodies.

## Cross-references

- [SESSION_0355](sprints/SESSION_0355.md) — assessment origin + the shipped DataSelect/claim/register interim.
- [Lineage data wiring SOP](runbooks/sops/lineage-data-wiring-flow.md) — §4 directory, §5 claim, §7 privacy.
- [Data + wiring SOP](runbooks/sops/sop-data-and-wiring-flows.md) — §18 org registration = Tool-submission analogue.
- `components/web/profile/profile-hero.tsx`, `components/web/directory/facet-result-card.tsx`,
  `components/common/combobox-selector.tsx`, `app/(web)/submit/**`, `app/(web)/organizations/new/**`.
