---
title: Page Code Review
slug: page-code-review
type: protocol
status: active
created: 2026-07-06
updated: 2026-07-06
last_agent: claude-session-0504
pairs_with:
  - .claude/skills/fallow-fix-loop/SKILL.md
  - .claude/skills/code-quality/SKILL.md
  - docs/knowledge/wiki/code-quality-matrix.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Page Code Review — a replayable per-page pass

Ratified SESSION_0502. **One page per pass. Composes existing tools — NOT a new engine.** The recipe is the
deliverable; the page is its test case. Default contract: **behavior-preserving** (any behavior change is a
deliberate, logged exception — see Step 3).

Home: this protocol is the SoT. A `/page-review <route>` skill is deferred until the recipe has run clean on
2–3 pages (skill-ifying an unproven recipe is the premature abstraction the recipe hunts).

## Step 0 — Define the page's file set (the bounding rule)

A "page" = the **bounded transitive closure** from the route entry:

- **IN:** `page.tsx` (+ page-owned `layout.tsx`) · `_components/*` · the server actions / oRPC procedures it
  calls · the read-model/query fn it uses · page-scoped helpers.
- **OUT (hard boundary — do NOT recurse in):** `packages/ui-kit` L1 primitives and any **shared** component
  used by ≥2 pages (`components/web/*`). Those get their own **component** pass; a page pass may only *flag*
  an L1/shared issue as a ticket, never edit it.

Without this bound every page pass swallows the whole app. Write the explicit file list into the SESSION task.

> Exception: when two entry points are genuinely **one surface with two parallel implementations** (e.g.
> `/me` + `/directory/[slug]` both rendering "the profile"), the file set may span both — consolidating them
> is the point. State this explicitly in Step 0.

## Step 1 — fallow BASELINE (capture as an artifact, before any edit)

`fallow health` + `fallow dupes` + `fallow audit` scoped to the Step-0 files. **Write the numbers down**
(CRAP hotspots, dup clusters, dead-code, complexity) into the SESSION file. No delta proof is honest without
a captured baseline.

## Step 2 — Review pass (read-only, scored) → prioritized fix list

- **Reuse-first / UX** (Desi lens): near-dupes of Dirstarter L1 + `custom-component-inventory`, needless
  client islands, dead props, `kind`-union god-components, empty-state + hierarchy.
- **Code-quality score** (`/code-quality` vs the matrix): /10 + Class A/B/C + hard caps → "Apple/Facebook
  grade?" with the specific gaps.

Output: ONE prioritized fix list. Structural / cross-page items → tickets, not inline edits.

## Step 3 — Fixes (Cody) via /fallow-fix-loop

`/fallow-fix-loop` IS the engine (audit + health + multi-angle review + implement + re-verify). This recipe
just bookends it: Step-0 bound, Step-1 baseline, Step-4 re-verify.

**Behavior-preserving by default.** A deliberate behavior change (a page that is broken/half-wired by design
and the operator has ratified a fix) is allowed **only** when: (a) the operator ratified the change, and
(b) it is logged in the SESSION file as an explicit exception with the ratified decision. Otherwise defer
behavior changes to their own ticket.

## Step 4 — Re-verify (the 0495 + 0501 contract)

- **Affected `e2e/` MUST run** for any UI-contract change (0495: source + unit + `next build` ≠ verified).
- **Repo-wide `format:check`** if ANY file was added (0501: oxfmt formats `.html`; the gate-runner skips
  untracked new files).
- typecheck + oxlint + `bun run test` (FS-0027, `--parallel=1`) on the touched set.

## Step 5 — Prove the delta + log

Re-run fallow on the same file set; prove CRAP / dupes / dead-code **down** (or non-worse, with justification).
Log baseline→final numbers + the `/code-quality` score in the SESSION file. Flip the page's row in the
inventory tracker below.

## Done-means (per page)

1. fallow deltas ≤ baseline (any increase explicitly justified).
2. `/code-quality` score recorded, ≥ 8.5 or a documented reason.
3. Zero NEW near-dupes of L1/inventory; dead props / needless client islands / kind-unions removed or ticketed.
4. Affected e2e green + format:check green + gates green.
5. Behavior preserved — or the change is a ratified, logged exception (Step 3).
6. Baseline→final numbers + score logged; inventory row flipped.

## Page inventory + order

| # | Page | Status | Notes |
| --- | --- | --- | --- |
| 1 | `/directory/[slug]` | ✅ done (0502) | profile fix — free-basic public profile + premium rich-media gate + 404-teaser; Doug 9.2 SHIP |
| — | `/me` | partial (0502) | shares the consolidated policy; component-tree merge = TICKET-0502-A |
| 2 | `/lineage/[treeSlug]` | ✅ done (0504) | explore-island extraction: cyclo 52→27, CRAP 2756→756 (−73%), 794→412 LOC, 8 page-owned files; zero shared-file edits; Doug 8.5 SHIP; new explore-view e2e. Shared canvas/timeline/drawer = TICKET-0504-A |
| — | `/posts` | queued | community feed |
| — | `/` (landing) | queued | public first-impression |
| — | `/app` index | queued | pairs with the Command Deck unified-index chip |

Order principle: safe-first proof (fresh/polished page), escalate to gnarly by ~#3. 1 page/session while the
recipe is young; 1–2/session once proven.
