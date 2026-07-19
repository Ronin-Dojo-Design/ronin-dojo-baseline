# G-022 fan-out — Technique graph out of beta (three parallel lanes)

> Planned + ratified at SESSION_0578 (Petey plan-first lane; operator grill resolved 4 forks).
> Recipe: [`fan-out-session-recipe.md`](../protocols/fan-out-session-recipe.md). Goal row:
> goals-ledger **G-022**. Merge order **C → B → A**; Lane A holds the beta→GA flip and lands last.
> Sibling planning-session numbers 0574–0578 are burned; the lanes pin **0579 / 0580 / 0581**
> (each lane re-runs the FS-0030 ID-space check at bow-in and goes ABOVE if a number got taken).

## Ratified scope (SESSION_0578 grill)

- **GA bar (flip-blocking):** all remaining 0546 Desi waves — Wave 2 remainder (C4 zoom/fit
  easing, C5 neighborhood glow, D3 empty states, B2 difficulty tooltips) AND Wave 3 (E1
  CurriculumJourney motion-only, B3 key-point peek, C3 grid stagger, G2 node-modal menu) — plus
  WL-P2-65/66/67, D-4 cooperative touch, entry wiring, AND member progress tracking (Lane B).
  E2 Combo Flows stays post-GA. F1 Lenis stays REJECTED (motion-only) — never re-open.
- **Content scope amendment:** the technique system covers **grappling arts only — BJJ + judo +
  wrestling takedowns; NO striking, NO weapons**. Supersedes the port-epic's BJJ-only line;
  ADR check owed at Lane C's close. Wrestling has no source dataset → authoring task, not a lane
  blocker.
- **Beta mechanics (verified):** the graph is PUBLIC at `/techniques/graph`; "beta" = the
  `BETA_FEATURES` entry in `apps/web/lib/feature-log.ts` (+ `FEATURES.md` mirror) + the on-page
  Badge/Note. Entry links EXIST (Library index `techniques-index/index.tsx:58` "BJJ Graph";
  `curriculum/page.tsx:40` "Technique Graph") — the GA gap is **affordance quality + naming
  consistency** (AUD2-4), not link existence. The separate "Curriculum" beta entry stays beta.

## Lane definitions + owned file sets (the disjointness contract)

### LANE C — grappling curriculum data at scale (`session-0579-grappling-data`)

Adopt the monorepo harvest (READ-ONLY source): `bjj.js` 98-technique trunk + judo 20-throws
(Kodokan seed / `judo.js`) via a shown-before-run TS transform; backfill the ~14 dark graph
slugs (present in layout JSON, no published DB row); seed disciplines/styles, curriculum links,
belt-level linkage. Wrestling = ledgered authoring gap. Judo/new techniques land **Library-dark
for the graph** (no layout slots yet — Lane A adds them); the importer must not require JSON
presence for new rows.

**Owns:**

- `apps/web/prisma/import-bbl-bjj-curriculum.ts` (extend; READS `bbl-bjj-graph.json` — never writes it)
- `apps/web/prisma/data/` **new** payload files only (e.g. `bbl-grappling-curriculum.json`)
- `apps/web/prisma/schema.prisma` + ONE new hand-authored migration dir (only if the small
  additive delta — e.g. `nativeName`/`aliases` — is ratified at its own bow-in grill)
- **new** transform script (node/TS; shown to the operator before running)

### LANE B — member progress wiring (`session-0580-technique-progress`)

Wire the existing zero-write-path `TechniqueProgress` model (NOT_STARTED→…→MASTERED,
`@@unique[userId,techniqueId]`): oRPC write surface (FULL-oRPC direction), detail-page tracking
control, dashboard wiring. Any signed-in member tracks their own progress. Graph-node progress
overlay = post-GA (Lane A file). No migration needed — the model exists.

**Owns:**

- **new** `apps/web/server/techniques/router.ts` (oRPC domain router, mirroring
  `server/belt/router.ts`) + its registration line in `apps/web/server/router.ts`
- **new** `apps/web/server/web/techniques/progress.ts` + `.test.ts`
- `apps/web/server/web/techniques/permissions.ts` (only if a tracking predicate is needed)
- `apps/web/server/web/dashboard/queries.ts` (+ its test)
- `apps/web/app/(web)/dashboard/techniques-tab.tsx`, `techniques-table.tsx`
- `apps/web/app/(web)/techniques/[slug]/_components/technique-detail/*` (+ **new**
  `technique-progress-control.tsx` component file)

### LANE A — GA design close-out + flip (`session-0581-technique-ga-design`, multi-session)

Wave 2 remainder + Wave 3 + WL-P2-65/66/67 + D-4 + SESSION_0578 Desi audit items + multi-art
layout expansion (judo cluster coordinates in the layout JSON, AABB-verified) + entry wiring +
the beta→GA flip as the lane's LAST commit. Continuation tasks live under G-022 (lane plan) per
recipe §6.

**Owns:**

- `apps/web/components/web/techniques/*` (incl. `technique-graph.tsx` + any WL-P3-53 split-outs)
- `apps/web/components/web/curriculum/*`
- `apps/web/server/web/techniques/graph-query.ts`, `node-tooltip.ts`, `graph-belt-level.ts` (+ tests)
- `apps/web/prisma/data/bbl-bjj-graph.json` (layout — the ONLY lane that writes it)
- `apps/web/lib/utils.ts` (WL-P2-66) · `apps/web/lib/feature-log.ts` + `FEATURES.md` (flip)
- `apps/web/app/(web)/techniques/page.tsx`, `graph/page.tsx`, `app/(web)/curriculum/page.tsx`
- `apps/web/app/(web)/techniques/_components/techniques-index/*` (AUD2-4 entry affordance/naming)

### Disjointness proof

Pairwise intersections of the owned sets above are **empty**:

- **A∩B = ∅** — closest pairs: A `components/web/techniques/*` vs B
  `app/(web)/techniques/[slug]/_components/technique-detail/*` (different trees); A
  `app/(web)/techniques/page.tsx` vs B `…/[slug]/…` (different files); A graph server modules
  vs B progress/permissions modules (same dir `server/web/techniques/`, different files).
- **A∩C = ∅** — C reads `bbl-bjj-graph.json` but only A writes it; C's importer/payloads vs A's
  components/lib/pages share nothing. (Behavioral coupling — C's seeded slugs need A's layout
  slots to render — is handled by merge order, not file ownership.)
- **B∩C = ∅** — B is server/app surface; C is `prisma/*` only.

Shared-by-rule files (recipe §4, additive/own-row edits only): `docs/knowledge/wiki/goals-ledger.md`
(G-022 row), `wiring-ledger.md` (own rows), wiki `index.md`, `docs/sprints/` (own SESSION file each).
⚠ Live sibling 0575 is a ledger-hygiene lane — ledger edits stay additive; flag conflicts at merge.

### Merge order

**C → B → A.** C first (content foundation; Library grows, graph unchanged). B second
(progress writes; independent of C's content but merge-ordered to keep one rebase direction).
A last, multi-session: rebases over both, expands layout against final content, verifies fit/AABB
live, and flips beta→GA only when G-022's flip-blocking children are all closed.

## SESSION_0578 Desi hallmark audit punch list (AUD2-1..12)

Audit-only per D11-as-amended; full text in the SESSION_0578 record. Routed (>3 ledgered tasks —
all tracked as G-022 children here; **WL-row creation deferred to the lanes' closes** to avoid
ID-space collision with the live 0575 ledger-mechanization lane):

| Id | Sev | Finding (short) | Lane |
| --- | --- | --- | --- |
| AUD2-1 | P1 | PNG export clips every node label (= WL-P2-65) | A |
| AUD2-2 | P1 | Reduced-motion runtime-false in `popoverAnimationClasses` (= WL-P2-66) | A |
| AUD2-3 | P1 | Mobile can't frame graph: `ZOOM_MIN` clamp + toolbar density (= WL-P2-67 + D-4 batch) | A |
| AUD2-4 | P1 | GA flip surface: 3 names for one destination · de-beta chip/note · entry affordance (cross-link card idiom, no new components) | A (the flip) |
| AUD2-5 | P2 | Progress display channel unreserved — badge/tint budget spent on all 4 surfaces; ratify ONE channel BEFORE build | B (pre-build decision gate) |
| AUD2-6 | P2 | Multi-art 1-art lock-ins ×5 (closed type union, silent export fallback amber, single-axis pills, no overlap guard, `Bjj*` naming) — decide art-identity model (spatial cluster + filter axis, NO third color channel) BEFORE judo seed | A (design) + C (overlap guard, naming) |
| AUD2-7 | P2 | Curriculum topic filter strands users on silent empty grid (D3 scope must include curriculum browser) | A (D3) |
| AUD2-8 | P2 | Dead token `hsl(var(--border))` — dot-grid never paints; pattern-level (also `uploader/belt-preview.tsx:26`) — needs live verify | A ride-along |
| AUD2-9 | P3 | PNG export is the page's only primary button — wrong primary at GA | A ride-along |
| AUD2-10 | P3 | Two active-chip languages across sibling surfaces | CONTINUATION (post-GA) |
| AUD2-11 | P3 | Curriculum level tabs may still read as codes (needs live verify; fix is seed-side) | C |
| AUD2-12 | P3 | Node dialog CTA is secondary — fold into G2 | A (in G2) |

Conforms-do-not-touch list (F4 tints, roving tabindex, B1 tooltip contract, C2 pill, AUD-4 wheel
gate, export snapshot machinery, ListingCard composition, locked-media architecture, belt rail,
page scaffolding) — in the SESSION_0578 record; preserve under any refactor.

**Multi-art readiness verdict (Desi):** not ready as-is; foundation holds ONLY IF art identity is
spatial + filter-axis (never a third color channel) and the five lock-ins are resolved before the
judo seed lands.

## Paste-ready lane prompts

The three prompts live verbatim in the SESSION_0578 close report (chat deliverable) and follow
[recipe §2](../protocols/fan-out-session-recipe.md) — pinned number, worktree/branch/setup,
owned-scope + non-goals, ledger rows, gates, push/hold, gotcha floor, bow-out/loop-state. Blocks
must not be trimmed when re-using.
