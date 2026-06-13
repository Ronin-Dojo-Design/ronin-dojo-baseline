---
title: "Petey Plan 0379 — Lineage Tree org-chart-grade enhancement"
slug: petey-plan-0379
type: petey-plan
status: active
created: 2026-06-13
updated: 2026-06-13
last_agent: claude-session-0374
pairs_with:
  - docs/runbooks/domain-features/lineage-tree-runbook.md
  - docs/runbooks/domain-features/lineage-hub.md
  - docs/petey-plan-0305.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# Petey Plan 0379 — Lineage Tree org-chart-grade enhancement

Executable breakdown for evolving the lineage tree toward org-chart-grade capability, benchmarked
against BALKAN OrgChart. **Read [`lineage-tree-runbook.md`](runbooks/domain-features/lineage-tree-runbook.md)
first** (feature matrix + gap analysis) and [`lineage-hub.md`](runbooks/domain-features/lineage-hub.md)
(data model + privacy invariants). This plan is the slice sequence; the runbook is the spec.

## Locked decisions (do not re-grill)

1. **Build our own** — Balkan is Community-limited / Commercial-paid; operator won't pay. Balkan is a
   reference (its docs ship code); mine the layout math + display vocabulary, implement on our model.
2. **No schema changes** outside the Phase 3 identity re-root window (`PHASE3_USER_CARRY_PREFLIGHT.md`).
   Slices 1–5 are **pure display / read-model**; slice 6 polish is display-only too.
3. **Privacy + RBAC invariants are sacred** — never regress the hub's guarded tests (public payload
   allowlist, materializer, rank-progression projection). Belt color stays `Rank.colorHex` data.
4. **Extends petey-plan-0305** (Org Chart Board → SVG connectors → export → trophy); this is its
   org-chart-grade continuation, not a parallel track.
5. **Multi-parent provenance already exists in the data** (`RankAward` + `LineageRelationship`); the
   work is to *display* it (slinks/clinks), not re-model it.

## Slices (each ≈ one session)

### 0379-1 — 2D tidy-tree layout engine (foundation)

- **Goal:** replace the 1D depth-bucket `tree-layout.ts` with a real 2D tidy-tree layout producing
  `{x,y,width}` per member; pure TS, unit-tested; remove the ±5 depth clamp.
- **Files:** `apps/web/lib/lineage/tree-layout.ts` (rewrite), `tree-layout.test.ts`; consume in
  `lineage-tree-canvas.tsx` / `canvas-model.ts`. Add a `mixed` mode (wide sibling rows → columns).
- **Done means:** layout returns positioned nodes; canvas renders from `{x,y}`; existing trees render
  with no overlap; tests green; browser-proof on `bbl.local:3000/disciplines/bjj`.
- **Depends on:** nothing.

### 0379-2 — Multi-parent display: slinks + clinks

- **Goal:** surface secondary `PROMOTED_BY` parents (cross-school promotions) as **slinks** (in-tree,
  straight) and **clinks** (cross-tree, curved), visually subordinate to the primary tree edge, with a legend.
- **Files:** `connector-geometry.ts` (+ test), `canvas-model.ts` (expose secondary parents), the public
  payload (`server/web/lineage/payloads.ts`) **respecting the materializer**, canvas SVG overlay.
- **Done means:** a node promoted by two professors shows the primary edge + a distinct secondary
  link; privacy tests still green; browser-proof.
- **Depends on:** 0379-1.

### 0379-3 — Expand/collapse + load-on-demand

- **Goal:** interactive expand/collapse wired to the new layout; lazy-load collapsed subtrees from the
  server (removes the depth clamp). Reuse `buildDescendantCounts` badges.
- **Files:** a paginated subtree query in `server/web/lineage/queries.ts`, canvas collapse state,
  `canvas-model.ts`.
- **Done means:** big trees load incrementally; collapsed nodes show counts; expand fetches children; browser-proof.
- **Depends on:** 0379-1.

### 0379-4 — Partner + assistant display roles

- **Goal:** co-promoter/co-founder (**partner**, side-by-side) and assistant-instructor (**assistant**,
  beside-not-below) display positions.
- **Files:** layout engine positioning, `canvas-model.ts`; a projection-only `displayRole` on the
  `LineageTreeMember` read-model if needed (no provenance change).
- **Done means:** partner/assistant nodes render in their positions; browser-proof.
- **Depends on:** 0379-1.

### 0379-5 — Filter + highlight/center search

- **Goal:** filter by belt/school/verification/generation; highlight + center-on-result using the
  existing privacy-safe `search.ts`.
- **Files:** canvas filter UI, `search.ts` consumers, highlight state in the canvas.
- **Done means:** filtering hides/dims non-matches (privacy-safe set only); search centers + highlights; browser-proof.
- **Depends on:** 0379-1.

### 0379-6 — Polish wave (subtree orientation · multiple templates · undo/redo · export)

- **Goal:** per-branch orientation, per-node-type card templates (placeholder/claimed/root), editor
  undo/redo, PNG/PDF export (aligns with petey-plan-0305 3f).
- **Files:** layout options, `lineage-node-card.tsx` template variants, editor command stack, export util.
- **Done means:** each sub-feature browser-proven; export produces a usable PNG/PDF.
- **Depends on:** 0379-1..5.

## How to run this

- **Fresh interactive chat (recommended for slice 1):** bow in, point at this plan + the runbook,
  build 0379-1 with browser proof. The layout engine is the keystone — worth a careful first pass.
- **Autonomous (slices 2–5 are mechanical-ish):** the Codex runner is proven —
  `caffeinate -i scripts/auto-session-codex-automerge.sh N` after the SESSION "Next session" pointer
  names this plan. The Claude runner got a diagnosed fix (`--setting-sources user,project,local`,
  SESSION_0374) but is **unverified** — confirm one session closes before trusting an N-run.
- **Ultracode:** fine for slice 1 (the hard one) if you want max quality on the layout engine.

## Scope guard

- No schema migration outside the Phase 3 window. No DNS/Vercel-prod/Stripe changes.
- Do not regress privacy/RBAC invariants (hub §"Privacy invariants").
- Belt color = `Rank.colorHex` data; no hardcoded brand colors in shared code.
- Each slice is independently shippable + browser-proven; don't batch slice 1 with others.

## Cross-references

- [Lineage Tree Runbook](runbooks/domain-features/lineage-tree-runbook.md) — the spec + Balkan matrix.
- [Lineage Domain Hub](runbooks/domain-features/lineage-hub.md) — data model, file map, invariants.
- [Petey Plan 0305](petey-plan-0305.md) — the epic this extends.

**Honor the Lineage. Build the Future. OSSS.**
