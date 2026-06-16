---
title: "ADR 0026 — Lineage View A engine: vendored donatso/family-chart fork; one DTO, two engines"
slug: adr-0026-lineage-view-a-engine-donatso-fork
type: decision
status: superseded
created: 2026-06-13
updated: 2026-06-16
last_agent: claude-session-0394
pairs_with:
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/petey-plan-0379.md
  - docs/runbooks/domain-features/lineage-hub.md
  - apps/web/lib/lineage/trust-status.ts
  - apps/web/server/web/lineage/payloads.ts
  - docs/sprints/SESSION_0379.md
  - docs/sprints/SESSION_0380.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# ADR 0026 — Lineage View A engine: vendored donatso/family-chart fork; one DTO, two engines

## Status

**Superseded by [ADR 0027](0027-lineage-view-a-custom-cohort-timeline.md) (SESSION_0394).** The shared
engine-agnostic DTO survives; the *engine choice* does not. family-chart is a genealogy engine with no
promotion-date **cohort** concept (it rendered a flat single row), it owns the card DOM as HTML strings, and
it carried recurring connector/zoom/dnd friction. View A moves to a custom cohort-timeline layout. The text
below is retained as historical context.

~~Accepted~~

## Context

The lineage tree needs a **focal genealogy explorer** — re-center on any practitioner, walk ancestry
("who promoted me") up and progeny ("whom I promoted") down, depth-limited, with shareable focus URLs —
a capability the existing whole-tree overview canvas cannot provide. SESSION_0379 opened to hand-build a
2D tidy-tree layout engine, but grounding showed that premise was stale: `lib/lineage/tree-layout.ts`'s
`bucketByDepth` is dead (test-only), the depth-row renderer `lineage-tree.tsx` is orphaned, and the live
overview (`lineage-tree-canvas.tsx`, ~53KB = "View B") already lays out via recursive CSS flexbox with
DOM-measured connectors, a `LineageVisualGroup` cohort model, a dnd reparent editor, and privacy guards.

SESSION_0379 therefore pivoted and committed two candidate bases for comparison, deferring the final
choice to a fresh chat to avoid the long-context "dumb zone":

- **Candidate-A** — fork the MIT/TypeScript/D3 library [`donatso/family-chart`](https://github.com/donatso/family-chart).
- **Candidate-B** — a ChatGPT/operator-authored visual-parity spike using **Balkan-style** naming
  (`pid`/`ppid`/`stpid`/`slinks`/`clinks`/`tags`). **Clarified in SESSION_0380: candidate-B is original
  work, not Balkan code, and involves no Balkan license or runtime package** — Balkan's vocabulary was
  borrowed only as a design language. It was authored **with the repo connector attached** (ChatGPT viewed
  the real repo), so its **DTO design (types + projection) is repo-grounded** and is **lift-and-adapted**
  here — with the discipline that repo-grounded ≠ perfectly current (verify each field against the live
  payload on adapt; e.g. its 4-state trust enum is superseded by the richer in-repo `trust-status.ts`).

SESSION_0380 (this ADR) is that fresh chat. After a grill that re-verified the claims against the real
code, the path was locked.

## Decision

1. **View A engine = a vendored fork of `donatso/family-chart`** (MIT; TypeScript; sole runtime dep
   `d3 ^7.9.0`; no install/postinstall scripts). The TS `src/` is vendored into a workspace-local module
   we own (`apps/web/lib/lineage/family-chart/`), compiled by our own Next/TS build (not the upstream
   rollup/vite build). We keep the upstream `LICENSE`, record the forked commit SHA, and run a read-only
   **IoC + license review** (confirm `LICENSE.txt` = MIT — the `package.json` license field is the
   non-SPDX `"SEE LICENSE IN LICENSE.txt"`) before it commits. It is **not** an npm dependency; we edit
   internals freely.

2. **Two complementary views, two layout engines, one source of visual truth.**
   - **View A** = the new focal genealogy explorer on the donatso fork.
   - **View B** = the existing `LineageTreeCanvas` overview — **kept and left untouched**. When View B
     additions later begin (partner/assistant placement + secondary-link overlay), they are built on a
     **copy** (`lineage-tree-canvas-v2.tsx`), never by editing the original, so the working path is an
     intact fallback.
   - Focal genealogy and whole-tree-org-chart-with-cohorts+dnd are **different layout problems**; each
     view uses the layout that fits its shape rather than forcing one engine to do both.

3. **A shared, engine-agnostic visual DTO is the single source of visual truth.** A pure client adapter
   derives `LineageVisualNode[] + LineageSecondaryLink[]` (role; trust via the existing
   `resolveLineageTrustStatus`; group; partner/assistant; secondary links) **once** from the materialized
   public payload. donatso (View A) projects it → `Datum[]`; the v2 canvas (View B) reads it for its new
   surfaces. No new oRPC contract; no engine shape leaks server-side.

4. **Mapping: single-primary-line + secondary-overlay.** `rels.parents = [primaryVisualParentMemberId]`
   (`single_parent_empty_card = false` — promoters are not couples); `rels.children = [promotees]`.
   Cross-belt/secondary promoters render as a belt-labelled, dashed, subordinate **secondary-link
   overlay** (slink/clink idiom), in-view only, else surfaced in the drawer's rank history.

5. **No Balkan package, no license.** Candidate-B contributes its **design** (the neutral DTO, the
   role + trust + grouped-cohort vocabulary), not code or a dependency.

6. **Privacy and brand invariants are unchanged and sacred.** View A consumes the *same* materialized
   public payload as View B; non-PUBLIC members are dropped by the materializer and never reach View A
   (do not use family-chart `is_private` to surface hidden members — that would regress
   `queries.visibility.test.ts`). Belt color stays `Rank.colorHex` data. No schema changes (pure
   read-model + client display).

7. **Collapsing to a single engine is deferred as an evidence-based gate.** The 0379-1 vendor smoke-test
   renders the whole bjj tree in donatso (`main_id` = root); that result, plus how View A feels in use,
   informs a later decision on whether to migrate View B onto donatso and retire the canvas. The shared
   DTO keeps that door open without re-deciding the data model.

## Consequences

- **Secondary-overlay is cheaper than the runbook assumed.** The public payload **already** materializes
  the multi-parent edges (`payloads.ts` → `relationshipsTo`/`relationshipsFrom`; `queries.ts` builds an
  `edgeMap`). The slink/clink overlay has a real client-side data source today — its server scope shrinks
  to "expose the already-fetched edges to the adapter," not "add them to the payload."
- **The trust vocabulary is already built.** `lib/lineage/trust-status.ts`'s `resolveLineageTrustStatus()`
  (`disputed | verified | claimed | claim-pending | imported | unverified`) is richer than candidate-B's
  4-state enum; the adapter reuses it rather than inventing one.
- **Zero risk to the working path.** View A is purely additive; View B is untouched (and copy-first when
  extended). The dnd editor, cohort grouping, and privacy guards in the existing canvas are preserved.
- **Supply-chain posture honored.** Vendoring the TS source (no install-time code execution; IoC +
  LICENSE.txt review + recorded SHA before commit) satisfies the operator's caution. Adds `d3@7` +
  `@types/d3` to `apps/web`.
- **Two canvas files will diverge** once View B work begins (original + v2) — accepted tracked debt,
  justified by the zero-risk mandate; revisited at the one-engine gate.
- Executable breakdown lives in [`petey-plan-0379`](../../petey-plan-0379.md); full integration mechanics
  in lineage-tree-runbook §0/§0a.

## Alternatives considered

- **Add the Balkan package (`balkan-orgchart-js-community`) as in candidate-B File 4.** Rejected — a
  runtime dependency on a proprietary package conflicts with the no-vendor-runtime-dep posture. (Moot
  once clarified that candidate-B is original code; its *design* is adopted regardless.)
- **One engine — donatso powers both views.** Deferred (not rejected). It would rebuild cohort grouping +
  the dnd editor + privacy on a genealogy engine not designed for big top-down org charts, replacing
  working capability. Re-opened as the evidence-based gate (Decision 7) once View A proves the engine.
- **Build a from-scratch 2D tidy-tree engine** (the original SESSION_0379 plan). Rejected — the canvas
  already lays out (View B), `bucketByDepth` is dead, and Walker/Buchheim contour math is needless risk
  when a mature MIT genealogy engine exists.
- **Lift/reimplement Balkan's layout patterns into our own new overview renderer.** Folded — we adopt
  candidate-B's design *vocabulary* and render it via engines we own (donatso + the canvas), rather than
  reimplementing a layout engine.
- **Single `toFamilyChartData` adapter (no neutral DTO).** Rejected — with two engines, a per-engine
  adapter risks two sources of visual truth; the two-step neutral DTO prevents drift.
