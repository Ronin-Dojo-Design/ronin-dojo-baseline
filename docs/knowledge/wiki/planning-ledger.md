---
title: Planning Ledger
slug: planning-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0587
pairs_with:
  - docs/knowledge/wiki/goals-ledger.md
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/protocols/petey-plan.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - governance
  - planning
---

# Planning Ledger

Queue of **ideas that need a proper plan before any build** — the intake layer ABOVE the
goals-ledger. A `PL` row is an idea-dump (feature needs, bug fixes, design changes, images,
notes) from the admins; it graduates by getting a **full `/pp` Petey plan session →
AM_Plan_Session → fan-out build session** (the SESSION_0587 orchestrator pattern), at which
point the plan lands as a `G-NNN` goal (or children of one) and the PL row closes with a
pointer.

**Contributors:** Brian (operator) · Michael (MMB business owner, admin) · Tony (BBL admin).
Today ideas enter via operator relay into this file; the in-app intake surface for Michael/Tony
is itself the first queued item (PL-001 → G-024).

**Row law:** `PL-NNN` ids, append-only, mint = max+1 (verify by grep — see D-049 class).
Status: `queued → planning → planned (→ G-row pointer) → done/rejected`. This ledger is not
yet wired into `scripts/ledger-backlog.ts` or the closing.md §6.7 finding router — both edits
are deferred (files owned by live lanes 0585/0584 at creation time); wiring is part of PL-001's
plan scope.

## Rows

### PL-001 — Feature + feedback widgets for all sites (idea-intake surface) — queued

- **Origin:** operator directive, SESSION_0587 (2026-07-20), mid-orchestration.
- **Goal row:** [G-024](goals-ledger.md) (program shell; plan-first — no build until the plan
  session runs).
- **The idea:** admins-only idea-dump widget ("feature-widget") on the MMB and BBL admin
  surfaces where Brian/Michael/Tony dump ideas, images, notes, feature needs, bug fixes, and
  design changes — the in-app front door to THIS ledger. Later phase: the feature-widget moves
  onto the changelog feature page for all logged-in users. Platform module per RDD law (ONE
  kernel module × per-product mount), not per-product forks.
- **What exists (graphify-verified 2026-07-20):** ONE `feedback-widget.tsx`
  (`apps/web/components/web/feedback-widget.tsx`) — engagement-triggered toast (time/pageview/
  scroll thresholds in `apps/web/config/feedback.ts`), brand-aware, mounted in the `(web)`
  layout; submits via `reportFeedback` (`server/web/actions/report.ts`) → rate-limited →
  persists `Report` (type `Feedback`) + admin email (`emails/admin-feedback.tsx`); e2e
  `e2e/feedback-widget.spec.ts`. No separate feature-widget component exists. Prior backlog:
  `docs/petey-plan-0419-post-launch-sweep.md` §5.4 "make feedback widget brand/account aware".
- **Next step:** full `/pp` Petey plan session → AM_Plan_Session → fan-out build (0587
  pattern). That plan session also wires this ledger into `ledger-backlog.ts` + the §6.7
  router. **Reserved: SESSION_0589** (`session-0589-feature-widget-plan`, claimed mid-0587;
  runs parallel with SESSION_0588 quality-suite review).

### PL-002 — Link-intake ledgers: Reddit (RLL) + YouTube (YLL) + ChatGPT (GPTLL) — queued

- **Origin:** operator directive, SESSION_0587 (2026-07-20) — "noted as I was thinking about it";
  GPTLL added later same session; flesh out in the SESSION_0589 planning session.
- **The idea:** three sibling link-intake ledgers that feed/hydrate the goals-ledger the same way
  this planning-ledger does — captured links/threads/videos/transcripts as raw planning material
  that graduates to PL/G rows:
  - **Reddit-Links-Ledger** (`RLL-0NN`) — threads/posts.
  - **YouTube-Links-Ledger** (`YLL-0NN`) — videos.
  - **ChatGPT-Links-Ledger** (`GPTLL-0NN`) — ChatGPT brainstorming-session outputs/links.
- **Specific 0589 input (operator):** there is **ChatGPT brainstorming work from the night before
  (≈2026-07-19)** that needs to be **reviewed and queued** — it is the first GPTLL intake; the
  0589 plan session reviews those brainstorm outputs and routes them to PL/G rows.
- **Vault context (operator-stated, not repo-verified — vault is operator-side per ADR 0048):**
  stub folders for Reddit already exist in `RDD_Master_Vault`; the vault-consolidation +
  SOT-per-brand-vaults task is partially done / partially planned (G-023 vault-constellation
  direction: brand-prefixed vault names ratified in principle, only MMB exists).
- **Next step:** SESSION_0589 plan session decides: repo-side ledger files vs vault-side capture
  with repo pointers, id law, aggregator/router wiring (bundled with PL-001's wiring scope),
  and how RLL/YLL rows hydrate into goals-ledger.

### PL-003 — State of the Dojo as the `/app` admin landing (AdminKanban embed + ritual render + per-product publish) — queued

- **Origin:** operator directive, SESSION_0587 (2026-07-20). Extends the G-023 SOT-dashboard
  slice-1 (0585 render, published via Artifact) toward the in-app admin surface.
- **The ask (operator's words, faithful):**
  1. **Embed AdminKanban** (the DB-backed loop-board — `KanbanCard`, G-003/G-007,
     `/app/loop-board`) *into* the State of the Dojo page.
  2. **State becomes a ritual artifact via a REUSABLE SKILL** (operator-pinned SESSION_0587):
     one skill (working name `update-state-of-the-dojo` / `sotd`, mirroring the `seq-*` skill
     pattern) that renders + publishes the projection, invoked as a **step in both rituals** —
     `docs/rituals/opening.md` (bow-in: render current state) and `docs/rituals/closing.md`
     (bow-out: update state). Today it's a bare script (`scripts/state-of-project.ts`, 0585) +
     the projection protocol; it is NOT yet a skill and NOT yet a ritual step — this pins that
     it should become both. (Ritual-step wiring is additive on 0584's just-rewritten rituals.)
  3. **Publish the umbrella State** onto the **RDD admin surface** with ALL brands + clients.
  4. **Then publish per-brand/client filtered State** onto EACH brand/client's own admin
     surface.
  5. Compose all of it as the **initial `/app` admin dashboard LANDING** — clicking into the
     admin dashboard shows State of the Dojo **+** the admin section cards **+** BBL's v2 admin
     cards, as ONE admin landing dashboard.
- **Relationship:** this IS the SOT-dashboard **slice 2** (`/app/state`, ledgered by 0585) PLUS
  admin-landing composition + AdminKanban embed + per-product publish + ritual wiring. Goal row:
  [G-023](goals-ledger.md) (SOT dashboard) — propose G-023 children or a dedicated G-row at plan
  time.
- **Open forks for the plan session to grill (do NOT pre-resolve):**
  - **Publish mechanism:** 0585's model is agent-publishes-via-Artifact-tool (projection-only,
    ledgers stay SoT). Operator now wants it ON the in-app admin surface — reconcile: does the
    ritual still render an Artifact, does it write the in-app `/app/state` data source, or both?
  - **Per-product fan-out:** each brand/client is a separate DB + deploy (ADR 0038). One render
    → N product admin surfaces: how (build-time inject? shared read endpoint? per-deploy render
    step?) without cross-product data leak.
  - **Two data sources on one surface:** AdminKanban is DB-backed (apps/web `KanbanCard`); State
    of the Dojo is a frontmatter/ledger projection (scripts). Integrating = reconciling a live-DB
    board with a docs projection on one page.
  - **Admin-landing composition** must conform to the AdminCollection one-surface law
    ([[admin-collection-one-surface-law]]) — State + section cards + BBL v2 cards as ONE
    conformed surface, not a bespoke god-page.
  - **Ritual wiring** is additive on top of 0584's just-rewritten opening/closing (0584 landed
    this sweep) — new render/update steps, not a rewrite.
- **Ratified inputs (operator, SESSION_0587) — feed the dashboard slice-2 build:**
  - **Masthead name = per-skin (house-language seam):** "State of the Dojo" under dojo-brand
    skins (RDD/BBL); **"State of the Building"** under the MMB/Mammoth skin. Name is ratified —
    drop the "(name pending operator ratification)" provenance note at the next render; replace
    with the per-skin title map.
  - **Skin invariants:** operator chose REVISE on the proposed "semantic tokens fixed, never
    re-skinned" law — the boundary is being re-specified (see PL-005). Do NOT encode the old law
    until PL-005 resolves.
- **Next step:** SESSION_0589 plan session ( `/pp` Petey plan). Bundle with PL-001/PL-002/PL-004
  as the planning session's scope; sequence after (or alongside) the widget-intake plan.

### PL-004 — Portfolio taxonomy: brand > platform > product (evolves ADR 0034) — queued · ADR-worthy

- **Origin:** operator directive, SESSION_0587 (2026-07-20), correcting the "five products"
  framing during the dashboard ratification.
- **The direction (operator, "I think is the way to go" — a lean, ratify formally at plan time):**
  the portfolio is **five BRANDS** (BBL · Mammoth · Baseline · Tuff Buffs · WEKAF), and **a brand
  can contain multiple platforms, each with multiple products.** Hierarchy = **brand → platform →
  product** (not the current flat "product = brand token-swap × modules" language).
- **Why it's ADR-worthy, not a reword:** [ADR 0034](../../architecture/decisions/) + CLAUDE.md's
  North Star currently call BBL/Mammoth/etc "products" of "ONE platform." This direction inverts
  that (brand is the top unit; platforms live *inside* a brand). It reshapes: the State-of-Dojo
  dashboard tabs (brand tabs, per PL-003), the vault SOT-per-brand model (PL-002 / G-023 vault
  constellation), and the RDD umbrella language. **Do NOT rewrite ADR 0034 / CLAUDE.md now** —
  formalize via a new ADR in SESSION_0589 planning, then conform the docs.
- **Next step:** SESSION_0589 — grill the taxonomy to a ratified ADR (reconcile with ADR 0034 +
  0040; define brand/platform/product precisely; map the five brands' current platforms/products),
  then cascade the wording (dashboard, vault names, North Star) as conform work.

### PL-005 — Skin-invariant boundary (semantic tokens) — ✅ RATIFIED (SESSION_0587)

- **Ratified law (operator, SESSION_0587):** **fixed hue, brand tint.** Semantic tokens
  (good/warn/crit) keep their recognizable hue (green/amber/red family) so meaning reads across
  brands, but **every brand tints them toward its own palette within an accessibility-safe
  range.** Supersedes the proposed "fixed, never re-skinned" law (rejected) — semantics are
  neither frozen nor fully skinnable; they're hue-anchored + brand-tinted with a contrast floor.
- **Encodes:** the existing BBL crit-darken case is now IN-LAW (a contrast-driven tint), not an
  exception. The current mock's "semantic tokens NEVER re-skinned" comment is now WRONG — fix at
  the PL-003 dashboard slice-2 build (tint tokens per brand + assert an accessibility-safe
  contrast range; do not hardcode a single crit).
- **Design-law input to:** PL-003 (dashboard render) + the brand-skin pipeline (G-018 /
  brand-skins) + `design-system-doctrine`.

### PL-006 — Token-Cost-Tracker visual component (State of the Dojo + Session-Summary-Brief) — queued

- **Origin:** operator directive, SESSION_0587 (2026-07-20). Motivated by the Sonnet-cost
  experiment telemetry this session recorded (lanes on Sonnet, orchestrator Fable→Opus).
- **The ask:** a **visual UI/UX component** surfacing token/cost telemetry, rendered on **two
  surfaces**: (1) the **State of the Dojo** dashboard (PL-003), and (2) the **Session-Summary-
  Brief** (the lean per-session report surface). Shows per-session / per-model / per-lane token +
  cost, trend over sessions.
- **Open forks for 0589 to grill:** data source (where session token telemetry is captured
  durably — SESSION frontmatter `telemetry:` field is the current seed; formalize a schema) ·
  cost model (per-model $/token table; who maintains it) · whether it's a shared component reused
  across both surfaces (AdminCollection-conformant) or two renders of one data feed · the
  data-viz treatment (follow the `dataviz` skill — semantic-token palette, accessible).
- **Depends on / relates to:** PL-003 (State of the Dojo — the host surface) + the session
  `telemetry:` frontmatter convention started in SESSION_0587.
- **Next step:** SESSION_0589 plan session — size it as a G-023 SOT-dashboard child (slice) or its
  own goal.

## Cross-references

- [Goals Ledger](goals-ledger.md) — where planned ideas graduate to.
- [Petey Plan protocol](../../protocols/petey-plan.md) — the plan-session machinery.
- [Loop-of-Loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) — ledger-driven
  session model this slots into.
