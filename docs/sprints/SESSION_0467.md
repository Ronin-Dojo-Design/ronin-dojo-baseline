---
title: "SESSION 0467 — Heal the card-origin fork (G-005): extract the Dirstarter L1 Card into the kernel"
slug: session-0467
type: session--plan
status: closed
created: 2026-06-28
updated: 2026-06-28
last_agent: claude-session-0467
sprint: S47
pairs_with:

  - docs/sprints/SESSION_0466.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0467 — Heal the card-origin fork (G-005): extract the Dirstarter L1 Card into the kernel

## Date

2026-06-28

## Operator

Brian + claude-session-0467

## Goal

**Pivoted from build → ratify (operator, mid-session).** The G-005 card-fork grill exposed that the repo
had *three* contradicting "one card" docs + a `kind` god-union + a confidently-wrong imported design system.
Apple/Facebook would write the law before refactoring the components — so this session **ratifies the
design-system doctrine** (the constitution the card heal executes against) rather than touching code:
[ADR 0040](../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md) +
[`design-system-doctrine.md`](../knowledge/wiki/design-system-doctrine.md) +
[Learning Record 0006](../learning/ddd/learning-records/0006-design-systems-and-ui-kits.md); delete the wrong
monorepo-design-system import; wire the "what would Apple do" mantra + the unified RDD North Star into
CLAUDE.md; refresh `hostile-repo-review.md` and tee up the **S48 repo-health sprint**. The G-005 *code*
(extract the L1 surface, named cards, fold the 5 onto ListingCard) lands next, against the ratified doctrine.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0466.md`
- Carryover: 0466 shipped G-007 (live PR source) + the acute m-card mobile fix, and promoted G-005 to
  P1 with the structural extraction as the next lane. PRs #172/#173/#174 (the operator-gated 0463–0465
  lanes the bow-in PR-nudge would surface) are all **MERGED** — that lane is closed; this session is
  cleanly the single G-005 card-consolidation lane.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `8a575498`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | **Theming / component primitives** — Piotr's L1 `Card` (`components/common/card.tsx`), built on `box`/`stack`/`slot`/`cva`. |
| Extension or replacement | **Extension** — make the L1 `Card`'s contract (anatomy + tokens) the ONE foundation shared by the app cards *and* the kernel, instead of the current clean-room kernel fork. |
| Why justified | We bought Dirstarter for Piotr's clean, debugged components; the kernel m-card clean-room threw that value away and reintroduced a bug the L1 had solved (learning record 0005). |
| Risk if bypassed | Continued drift: 3 cards / 2 foundations; the kernel card keeps diverging and reintroducing solved bugs; per-session reviews keep walking past it. |

Live docs checked during planning: not applicable (the L1 origin is in-repo; the question is the
`packages/ui-kit` import boundary, not the Dirstarter upstream).

### Graphify check

- Graph status: not re-run at bow-in (the topology was Graphify-confirmed in SESSION_0466 — `listing-card.tsx`↔ADR 0028; kernel `m-card.tsx` has no edge to `common/card.tsx`). Discovery this session was direct source inspection of the three cards + their consumers.
- Files selected (direct read):
  - `apps/web/components/common/card.tsx` (Piotr's L1 — Tailwind + cva + Base UI `useRender`)
  - `packages/ui-kit/src/m-card/m-card.tsx` + `m-card.css` + `m-card.types.ts` (kernel clean-room — plain BEM CSS + `var(--mk-*)`)
  - `apps/web/components/web/m-card/m-card.tsx` (app m-card — Tailwind/cva on the L1)
  - `packages/ui-kit/src/tokens/tokens.css` (token bridge already documented: `--mk-accent: var(--color-primary)`)
- Consumers mapped: kernel m-card → AdminKanban engine → loop-board + Mammoth board; app m-card → `/directory` facets + `/disciplines/[slug]/ranks`.

### Grill outcome

**2 forks resolved (operator, 2026-06-28):**

1. **Extraction strategy → Option B** — port the L1 `Card`'s visual contract into the kernel's plain-CSS
   idiom, reconcile `--mk-*` ↔ `--color-*` into ONE token SoT, record provenance, add an anti-drift
   parity test. "One contract, two renderers." Rationale: keeps the kernel framework-agnostic so the
   standalone-bun Mammoth consumer keeps working (Option A would Tailwind-couple the kernel and risk
   Mammoth; Option C would reverse ADR 0028 across every directory listing).
2. **Scope → include both** — *then re-pivoted to docs-only* (below).
3. **Generic-card target → `ListingCard`, not `m-card(kind=generic)`** — the 5 bespoke cards are catalog
   content; they fold onto `ListingCard` (ADR 0028's real job). `kind="generic"` is **dropped**; m-card is
   **demoted** to the record/person card. (Apple/Facebook lens: kill the `kind` god-union.)
4. **Session re-scoped to docs/doctrine/ADR only** — ratify the law this session; the code conforms next.
   (The Apple sequence: ratify, then conform.)
5. **`docs/_imports/monorepo-design-system/` is WRONG → deleted outright** (operator, emphatic) — gold-BBL +
   `useDesignSystem()` legacy data that contradicted live canon; the "lost in translation" source.
6. **Unified North Star (RDD)** — ONE composable platform: shared kernel + brand-agnostic **feature-modules**
   (leads/CRM, claims, payments, lineage graph, directory…); a product = brand token-swap × selected modules,
   own DB/deploy; **any feature on any project** (Mammoth's CRM/leads/payments are platform capabilities, not
   a separate product line). Wired into CLAUDE.md.
7. **"What would Apple/Facebook do?" → standing mantra** (wired into CLAUDE.md) + **S48 repo-health sprint**
   teed up (`hostile-repo-review.md` refreshed as its governing protocol).

### Drift logged

No new drift ID. The fork itself is already documented (learning record 0005 + custom-component-inventory
"flagged for reconciliation"); this session is its scheduled heal, not a new discovery.

## Petey plan

### Goal

Resolve the kernel-extraction boundary (operator decision), then make the L1 `Card` the single
foundation across app + kernel and reconcile the two m-cards — without regressing the loop-board /
Mammoth board / directory listings.

### The boundary collision (why we grill first)

The directive says "extract Piotr's L1 `Card` **down** into the kernel as framework-agnostic, tokens
only." But the two sides use **fundamentally different styling pipelines**:

- **L1 `Card`** (`common/card.tsx`) = Tailwind v4 utility classes + `cva` variants + Base UI
  `useRender`, and depends on `~/components/common/box`, `~/components/common/stack`, `~/lib/slot`,
  `~/lib/utils`. Its "skeleton" is *almost entirely* Tailwind class strings — there is very little
  structure independent of them.
- **Kernel `m-card`** (`packages/ui-kit`) = plain BEM CSS (`mk-card__*`) + `var(--mk-*)` tokens, ships
  its own `.css`, **zero Tailwind / zero cva**, consumed from raw source by a standalone-bun Mammoth
  client (fragile `file:` symlink + Turbopack constraints — see `separation-separate-dbs-per-product`).

So "extract the L1 down as-is" is **not literally executable** without dragging Tailwind+cva+Base-UI
into the kernel, which breaks the kernel's framework-agnostic contract and the standalone-bun consumer.
That collision is the whole reason the kernel card got clean-roomed in the first place. It must be an
operator decision because the blast radius spans all products.

### Tasks (provisional — locked after the Open decision)

#### SESSION_0467_TASK_01 — Resolve the extraction-strategy fork (Petey + operator)

- **Agent:** Petey
- **What:** Operator picks the extraction strategy (options A/B/C below) so the kernel boundary is decided before code.
- **Done means:** A chosen option recorded here + in the goals-ledger G-005 entry; an ADR stub opened if the choice is architectural (D1 already anticipated an ADR for this).

#### SESSION_0467_TASK_02 — Build the chosen extraction (Cody)

- **Agent:** Cody
- **What:** Implement the chosen strategy — extract/port the L1 contract into the kernel as the ONE base, rebase the kernel m-card on it, record provenance in headers + custom-component-inventory.
- **Done means:** One documented foundation; kernel m-card visually matched to the L1 contract; provenance chain recorded.
- **Depends on:** SESSION_0467_TASK_01

#### SESSION_0467_TASK_03 — Card-parity review (Desi)

- **Agent:** Desi
- **What:** Review card parity across surfaces (loop-board, Mammoth board, a directory listing, ranks) for visual + a11y consistency.
- **Done means:** Prioritized fix list (or clean pass) for Cody.
- **Depends on:** SESSION_0467_TASK_02

#### SESSION_0467_TASK_04 — Runtime no-regression proof (Doug)

- **Agent:** Doug
- **What:** `qa-runtime-verification` on `/app/loop-board` AND a directory listing to prove no regression at desktop + 360/390px.
- **Done means:** Headless render evidence at both breakpoints; loop-board title no longer crushes; directory cards unchanged.
- **Depends on:** SESSION_0467_TASK_02

### Open decisions

**FORK — extraction strategy (operator must pick before TASK_02):**

- **Option A — Literal extraction (Tailwind-couple the kernel).** Move `card.tsx` + `box`/`stack`/`slot`/`cva` into `packages/ui-kit`; every consumer (incl. standalone-bun Mammoth) runs the same Tailwind v4 theme. *Pro:* Piotr's card preserved verbatim, ONE foundation literally. *Con:* kernel stops being framework-agnostic; high risk to the Mammoth standalone-bun consumer; contradicts learning record 0002 + ADR 0033 D2. **Not recommended.**
- **Option B — Port the L1 visual contract into the kernel's CSS idiom (RECOMMENDED).** Faithfully re-express the L1 `Card`'s anatomy + visual contract (padding/radius/border/bg/hover/shadow + the highlight/reveal/badges/bg/icon slots) as the kernel base in plain CSS, **reconcile `--mk-*` ↔ the app `--color-*` token set into ONE token SoT**, record the provenance chain, and add a parity test so it cannot drift. Distinguished from the current clean-room by: deliberate faithful port + ONE token SoT + recorded provenance + anti-drift test. *Pro:* respects the kernel boundary, keeps Mammoth standalone-bun working, heals the visual fork + the token fork. *Con:* still two renderers (Tailwind app-side, CSS kernel-side) — "one contract, two renderers," not one literal component.
- **Option C — Flip the dependency (app cards rebase onto the kernel card).** Make the kernel card the ONE base; the app `ListingCard` + app m-card wrap it. *Pro:* one literal component. *Con:* contradicts ADR 0028 (ListingCard on the Tailwind L1); huge blast radius across every directory listing; loses Tailwind ergonomics app-side. **Not recommended.**

Secondary (after the fork): does G-005 part (a) — build app `kind="generic"` (FacetResultCard/Course/Post/Merch/Tournament) — ride in this session, or split to a follow-up? Recommend **split** to keep this lane a single reviewable boundary change.

### Risks

- Touching the shared kernel = all products. Mitigation: grill-first (this section) + Doug runtime proof on loop-board AND a directory listing before close.
- Standalone-bun Mammoth consumer is fragile (Turbopack `file:` symlink). Mitigation: Option B keeps the kernel Tailwind-free, preserving that contract.

### Scope guard

- Do NOT Tailwind-couple the kernel unless the operator explicitly picks Option A.
- Do NOT start TASK_02 before the fork is resolved.
- Do NOT fold G-005 part (a) `kind="generic"` consolidation in unless the operator opts in.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0467_TASK_01 | landed | Grill the card-fork + design-system architecture (7 forks resolved) |
| SESSION_0467_TASK_02 | landed | ADR 0040 — design-system doctrine + card architecture (supersedes 3 "one card" claims) |
| SESSION_0467_TASK_03 | landed | `design-system-doctrine.md` — the doctrine + 6 brand tear sheets (live canon) |
| SESSION_0467_TASK_04 | landed | Learning Record 0006 — design systems & UI kits (Giddy narrative) |
| SESSION_0467_TASK_05 | landed | Delete the wrong `_imports/monorepo-design-system/` corpus + repoint refs |
| SESSION_0467_TASK_06 | landed | Wire mantra + RDD North Star into CLAUDE.md |
| SESSION_0467_TASK_07 | landed | Refresh `hostile-repo-review.md` (Graphify method + 6 lenses) → governs S48 |
| SESSION_0467_TASK_08 | landed | Housekeeping: repoint absorbed docs, update inventory + G-005 ledger |

## What landed

- **ADR 0040** — design-system doctrine + card architecture ratified; supersedes the 3 contradicting
  "one card" claims (ADR 0028 ListingCard framing, m-card spec "folds in," ADR 0033 D3) + the `kind` god-union.
- **`design-system-doctrine.md`** — the canonical constitution: tokens-as-contract, type ladder, spacing/φ,
  the card architecture (one surface + named cards), the kernel boundary (tokens travel, Tailwind doesn't),
  6 brand tear sheets (BBL/Baseline/Mammoth/TuffBuffs/WEKAF + Ronin umbrella) from live canon, the Desi sweep.
- **Learning Record 0006** — "how to build a design system & UI kit"; points to the doctrine.
- **Deleted** `docs/_imports/monorepo-design-system/` (confidently-wrong gold-BBL legacy); repointed the one
  live consumer (`baseline-design-system.md`).
- **CLAUDE.md** — unified RDD North Star (composable platform of feature-modules) + the "what would Apple do"
  operating mantra.
- **`hostile-repo-review.md` refreshed** (it already existed, forgotten — the irony) — Graphify-first method,
  6 hunt-lenses, finding-router output, cadence table; governs the **S48 repo-health sprint**.
- Housekeeping: `m-card-pattern.md` / `component-design-system.md` / `design-system-grid-ratio-hierarchy.md`
  now point to the doctrine; `custom-component-inventory.md` §9 + goals-ledger G-005 updated.

## Next session

### Goal

**Open Sprint S48 — `/goal`: Giddy repo-health + hostile-repo-review — lean the repo, prove what's wired
(3–5 sessions).** Run `hostile-repo-review.md` across the 43M / 891-doc / 248-SESSION corpus.

### First task

Run the hostile-repo-review §Method (Graphify stats/query/explain) to produce the **wired-vs-dead table** +
the **lean-out action list** (quantified), then start the **cruft purge** (operator-gated deletes): the
`RONIN_DOJO-Baseline/` vault (3.2M, 102 files), the duplicated `baseline-systems-pack` dirs, retire
`project-log.md` to `_archive`, dedup `neon-advisory-lock-recovery.md`. (Then, as a separate lane, the G-005
*code*: extract the L1 surface into the kernel + named cards + fold the 5 onto ListingCard, against the
ratified doctrine §5–§6.)

## Decisions resolved

- **Card architecture = one L1 `Card` surface + named single-responsibility cards** (`ListingCard`=catalog,
  `m-card`→record/person, `BoardCard`=kernel). `kind="generic"` dropped; the `kind` god-union splits. (ADR 0040)
- **Tokens are the contract; brand = token swap; live app is truth.** Kernel boundary: tokens travel, Tailwind
  doesn't (Option B port for the G-005 heal).
- **Unified RDD North Star** = one composable platform (shared kernel + brand-agnostic feature-modules; any
  feature on any project; Mammoth's CRM/leads/payments are platform capabilities). Wired into CLAUDE.md.
- **"What would Apple/Facebook do?" = standing operating mantra** (CLAUDE.md).
- **Delete the wrong `_imports/monorepo-design-system/` corpus** (confidently-wrong gold-BBL legacy).
- **S48 repo-health sprint** approved; `hostile-repo-review.md` is its governing protocol.
- **Gold-standard references** for the doctrine: Dirstarter (+/docs/theming), shadcn/ui, Material Design 3,
  Apple HIG, Figma — grounded in Figma's 12-design-systems study (operator's source).

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/decisions/0040-...card-architecture.md` | **NEW** — ratifies doctrine + card architecture; supersedes the 3 "one card" claims |
| `docs/knowledge/wiki/design-system-doctrine.md` | **NEW** — canonical design-system law (12 sections + 6 tear sheets + gold standards) |
| `docs/learning/ddd/learning-records/0006-design-systems-and-ui-kits.md` | **NEW** — Giddy narrative lesson → points to the doctrine |
| `docs/sprints/SESSION_0467.md` | **NEW** — this session |
| `docs/_imports/monorepo-design-system/*` (5 files) | **DELETED** — confidently-wrong gold-BBL legacy import |
| `CLAUDE.md` | RDD North Star + "what would Apple do" mantra |
| `docs/protocols/hostile-repo-review.md` | refreshed — Graphify method + 6 lenses + finding-router output; governs S48 |
| `docs/runbooks/design/baseline-design-system.md` | repointed off the deleted import → the doctrine; superseded-banner |
| `docs/knowledge/wiki/component-design-system.md` | scope-narrowed banner → doctrine |
| `docs/knowledge/wiki/files/design-system-grid-ratio-hierarchy.md` | absorbed-into-doctrine banner |
| `docs/knowledge/wiki/files/m-card-pattern.md` | superseded banner (m-card demoted; generic dropped) |
| `docs/knowledge/wiki/custom-component-inventory.md` | §9 card-architecture banner + FacetResultCard drift flag |
| `docs/knowledge/wiki/goals-ledger.md` | G-005 → doctrine-ratified, code pending |
| `docs/knowledge/wiki/index.md` | doctrine added to Concepts; SESSION_0467 row |

## Reflections

The session's highest-value move was *refusing to build.* The bow-in directive was "heal the card fork
(code)," but the grill exposed that the repo had three contradicting "one card" docs, a `kind` god-union,
and an imported design system that contradicted live canon. Writing the code first would have built a fourth
card against an un-ratified, self-contradicting law. The Apple sequence — ratify, then conform — was both
the correct and the *cheaper* path (one decision vs N re-litigations).

The sharpest moment was the operator's "Monorepo import is WRONG!!!!!" — a reminder that a confidently-wrong
doc is worse than no doc. Graphify quantified the rest of that class (a 3.2M forgotten vault, duplicated
systems-packs, a retired protocol still in an active dir).

The richest irony: drafting `hostile-repo-review.md` from scratch, I hit "file already exists" — it had been
written in May and forgotten. I *almost* clean-roomed a parallel of the very protocol whose job is to catch
clean-roomed parallels. That's the single best proof the S48 repo-health sprint is needed, and it's now its
opening anecdote.

## Review log

### SESSION_0467_REVIEW_01 — design-system doctrine + North Star + S48 setup

- **Reviewed tasks:** SESSION_0467_TASK_01–08
- **Dirstarter docs check:** live — fetched `dirstarter.com/docs/theming` (Tailwind v4 + Radix + shadcn/ui;
  `app/styles.css` `@theme`; `.dark`; `lib/fonts.ts`; cva); cited as the primitive code reference in the doctrine.
- **Verdict:** Clean docs/governance lane. The doctrine is grounded in five researched gold standards + the
  operator's Figma 12-systems article, not assertion; every position has an external validator. The card
  architecture is now ratified law (ADR 0040) that the G-005 code can execute against. No code touched =
  no runtime risk. The one honest caveat: the doctrine *describes* a target the code doesn't fully meet yet
  (the card consolidation + a11y gaps), which is correctly scoped as backlog, not claimed as done.
- **Score:** 9.5/10
- **Follow-up:** S48 repo-health sprint + the G-005 code lane; bump UTC-rollover `updated` dates (cosmetic).

## Hostile close review

- **Giddy:** pass — the doctrine extends (not clean-rooms) the existing fragments; the card architecture
  respects the kernel boundary (Option B); the *near-miss* parallel of `hostile-repo-review.md` was caught
  and converted to a refresh. Honest scope: code deferred, gaps named as backlog, not hidden.
- **Doug:** pass — claims are sourced: Dirstarter/MD3/shadcn fetched live; token values traced to
  `styles.css`/`tokens.css`/Mammoth `globals.css`; `wiki:lint` 0 errors (verified); no runtime surface
  touched so no qa-runtime needed.
- **Desi:** pass — the doctrine *is* the design-consistency artifact; 6 tear sheets from live canon, the
  Desi sweep is codified §8, the gold standards (incl. the operator's Figma source) ground the rationale.
- **Kaizen aggregate:** 9.5/10 — a strategic (not tactical) session: it ratified a law and teed a sprint,
  the rare high-leverage close. Only the deferred code keeps it from 10.

## ADR / ubiquitous-language check

- **ADR created:** [ADR 0040](../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md)
  — design-system doctrine + card architecture (supersedes the "one card" framing of ADR 0028 / the m-card
  spec / ADR 0033 D3). Dirstarter theming proof cited (theming = a baseline L1 layer).
- **Ubiquitous language:** new platform-context terms — *Card surface*, *named card*, *feature-module*,
  *token-as-contract*, *token bridge* — defined in the doctrine (the platform/design-system context, ADR
  0033 D4 keeps it separate from the BBL domain glossary). No BBL domain term changed.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | `updated`/`last_agent` set on touched docs (baseline-design-system, the banner'd wiki pages); new docs carry full frontmatter |
| Backlinks/index sweep | doctrine added to `wiki/index.md` Concepts; absorbed fragments + baseline-design-system `pairs_with` → doctrine; ADR 0040 ↔ doctrine ↔ 0006 cross-linked. **Finding (→S48):** the index *Sessions* table is stale since ~0429 (0430–0467 absent) — backfill is an S48 repo-health task, not papered with a lone row over a 37-session gap |
| Wiki lint | `bun run wiki:lint` — **0 errors**, 22 warnings (pre-existing + UTC-rollover date nits) |
| Kaizen reflection | Reflections section present |
| Hostile close review | SESSION_0467_REVIEW_01 (Giddy/Doug/Desi pass, Kaizen 9.5) |
| Code-quality gate (Class-A) | no Class-A custom code this session (docs/governance only) |
| Runtime verification (Doug) | no runtime surface touched (docs only) — n/a |
| Review & Recommend | Next session goal written (S48 repo-health sprint) |
| Memory sweep | new memories: design-system doctrine + RDD North Star + delete-wrong-imports + forgotten-protocol lesson |
| Next session unblock check | unblocked — S48 first task is runnable (hostile-repo-review §Method); deletes operator-gated |
| Git hygiene | single push to `main` — hash reported at bow-out / see git log |
| Graphify update | run before the close commit — 15,641 nodes / 30,737 edges / 2,089 communities / 2,469 files |
