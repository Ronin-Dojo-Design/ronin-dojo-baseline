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

### PL-001 — Feature + feedback widgets for all sites (idea-intake surface) — planned (SESSION_0589 → lanes L2+L3)

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
- **Planned (SESSION_0589 grill) → two lanes:**
  - **L3 build** (`session-0592-feature-widget`, apps/web — deploys): NEW sibling
    `feature-widget.tsx` (admins-only idea-dump; reuse the shared R2 uploader + rate-limit +
    Report-like persistence seam — NOT an overload of `feedback-widget.tsx`). Intake path =
    **DB inbox → admin triage view → session-time promotion to `PL` rows** (replaces today's
    operator relay; markdown ledger stays SoT of *planned* work, DB is the raw inbox). Mount
    scope = **BBL `/app` admin first** (reference impl, structured for `packages/ui-kit`
    extraction); MMB mount = fast-follow.
  - **L2 wiring** (`session-0591-ledger-wiring`, scripts/docs): wire the planning-ledger into
    `scripts/ledger-backlog.ts` (`PL` code + union), closing.md §6.7 finding router, and
    `scripts/deferral-guard.ts:49` prefix regex (bundled with the RLL/YLL/GPTLL wiring below).

### PL-002 — Link-intake ledgers: Reddit (RLL) + YouTube (YLL) + ChatGPT (GPTLL) — planned (SESSION_0589 → lane L2)

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
- **Planned (SESSION_0589 grill) → lane L2 (`session-0591-ledger-wiring`):**
  - **Repo-side ledgers of record** (ADR 0048): three files **created this session** —
    [`reddit-links-ledger.md`](reddit-links-ledger.md) (`RLL`),
    [`youtube-links-ledger.md`](youtube-links-ledger.md) (`YLL`),
    [`chatgpt-links-ledger.md`](chatgpt-links-ledger.md) (`GPTLL`). **Three separate files** (not one
    combined) — maps 1:1 to the operator's three-way QuickCapture inboxes (reddit/youtube/gpt) and to
    the aggregator's one-code-per-file pattern (zero parser change). Vault = optional raw capture,
    promoted INTO the repo ledger to count.
  - **L2 wires** all four new codes (`PL` + `RLL`/`YLL`/`GPTLL`) into `ledger-backlog.ts`,
    `deferral-guard.ts:49`, and closing.md §6.7; defines `RLL/YLL/GPTLL → PL/G` hydration.
  - **GPTLL-001 seeded** (chatgpt-links-ledger) = review the ~2026-07-19 brainstorm incl. "Phase 14"
    — **content-pending operator hand-over** (Phase 14 not found in repo graph). Parts of that
    brainstorm already routed this session → PL-007 (GLL) + PL-008 (vault).
  - **Vault-consolidation / SOT-per-brand-vaults** thread split out → **PL-008** (own plan session).

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
- **Planned (SESSION_0589) → lane L4 gets its OWN `/pp` plan session**
  (`session-0593-sotd-admin-landing-plan`, staged plan-me stub). Too large to pin into an executable
  build stub tonight (5 open forks + a new `sotd` skill + ritual wiring + per-brand publish + a
  data-viz component). The taxonomy dependency is now resolved (ADR 0051 → **brand tabs**, RDD
  umbrella above them). **L4's plan must treat GLL_Epic cards (Kaizen + Giddy-lessons) as a State-of-
  Dojo content type** — see [PL-007](#pl-007--gll_epic--giddy-lessons--kaizen--teach-code-lessons-system--queued--own-epic).
  Bundles **PL-006** (token-cost component) as a slice.

### PL-004 — Portfolio taxonomy: kernel → brand → app → (suite→product→feature) — ✅ RATIFIED (ADR 0051, SESSION_0589)

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
- **Ratified (SESSION_0589 grill → [ADR 0051](../../architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md)):**
  - **Tiers:** load-bearing spine `kernel → brand → app` (app = the deploy unit = 1 Vercel project +
    1 DB, ADR 0038); **optional** intra-app nesting `suite → product → feature` used only as an app
    grows (small apps stay flat — rejected the "all six tiers mandatory" god-taxonomy).
  - **Word fixes:** old "platform" = the **kernel** (`packages/ui-kit`, ADR 0040 — name fixed, model
    unchanged); old "product" (the whole deploy) = an **app**; "product" now = a feature-area within
    an app.
  - **White-label instance axis** (first-class, second dimension): Baseline produces **White Labeled
    Dojo**; RDD resells it; each customer = a branded instance (skin + deploy). **Tuff Buffs** = pilot
    instance → absorbed into Baseline (not a peer brand).
  - **Portfolio = 7 brands** under the RDD umbrella: RDD (agency) · BBL ⭐ · Mammoth · Baseline
    (=White Labeled Dojo) · WEKAF · **ACD (Amy Coaches Data — data/analytics coaching, non-dojo,
    proves kernel domain-agnosticism)** · Tuff Buffs (instance).
- **Next step (conform-cascade = lane L1, `session-0590-taxonomy-conform`):** restate CLAUDE.md North
  Star, `ronin-project-context.md`, and the ADR 0034/0038/0040 supersede banners to ADR 0051's
  vocabulary; feeds PL-003 dashboard **brand tabs** + PL-002 vault SOT-per-brand unit.

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
- **Planned (SESSION_0589):** bundled as a **slice of lane L4** (State-of-Dojo landing) — its host
  surface. Sized + forks (telemetry schema · cost model · shared-component-vs-two-renders · dataviz
  treatment) grilled in **L4's own plan session** (`session-0593-sotd-admin-landing-plan`), not
  tonight. Seed data = the SESSION `telemetry:` frontmatter convention (SESSION_0587).

### PL-007 — GLL_Epic — Giddy-Lessons / Kaizen / /teach code-lessons system — queued · own epic (G-025)

- **Origin:** operator brainstorm dump, SESSION_0589 (2026-07-20; part of the ~2026-07-19 ChatGPT
  brainstorm surfaced live). Operator: *"this is an epic to plan for sure — multi-session grill →
  plan → build → code-review, the GLL_Epic under RDD."*
- **Goal row:** [G-025](goals-ledger.md) (own epic). **Own plan-me stub:**
  `session-0594-gll-epic-plan`.
- **The idea (faithful capture — for the plan session to grill, NOT pre-resolved):** turn session
  lessons from token-burn into a durable, browsable, learn-it-yourself system so the operator can
  pick up any work (when usage is hit, or to learn/do it himself):
  1. **Closing `/refine-recipe` binary** — a yes/no Petey step at bow-out deciding whether the
     session's **Kaizen reflections** become durable/useful instead of the current token burn.
  2. **Kaizen reflections as cards** on the State-of-Dojo page — swipe/search on phone.
  3. **Giddy Lessons-Learned as cards** that click into pages/sections on the site **or** the vault
     dashboard ("that functions/looks/feels like the site" — online on-site + local lean vault
     version; overlaps PL-008 vault-as-site-mirror).
  4. **`/teach` (Giddy) skill** triggered at session end → durable reusable, session-context-filled
     "how to code it myself + why this method + alternatives considered + token cost + time
     estimate," plus a **git-merge-strategy replay log** (which git commands were used + why → replay
     a session to learn). Output → `human-code-runbook.md` as pointed entries.
  5. **`/Code-Lessons` skill + Code-Lessons_Ledger** — leaner version of Giddy's lessons; a
     hook-trigger (≥3 lessons?) groups them into a Giddy-Lesson section entry.
- **Cross-cuts:** rituals (closing `/refine-recipe` step), skills (`/teach`, `/Code-Lessons`),
  `human-code-runbook.md`, **and the State-of-Dojo surface (PL-003/L4 — cards render there)**. L4's
  plan must account for GLL cards as a content type.
- **Next step:** `session-0594-gll-epic-plan` — `/pp` grill → G-025 children + fan-out.

### PL-008 — Vault consolidation + SOT-per-brand vaults as own repos (+ per-brand tooling) — queued · own plan (G-023)

- **Origin:** operator, SESSION_0589 (2026-07-20). Split out of PL-002's vault thread (/rr verdict:
  own session — too big to pin tonight).
- **Goal row:** [G-023](goals-ledger.md) vault constellation (existing home). **Own plan-me stub:**
  `session-0595-vault-consolidation-plan`.
- **The idea (faithful capture):** the vault merge/separate/consolidation, where **each brand's SOT
  Vault is its own repo** with its **own docs-navigator + graphify-output HTML**, and
  **RDD_Master_Vault = this repo** (`ronin-dojo-baseline`). Ties to ADR 0048 (two-repo vault-kit),
  the QuickCapture per-source inboxes (PL-002 vault side), and the per-brand tooling pipeline
  (`docs:nav` + graphify HTML per brand). Brand-prefixed vault names ratified in principle (G-023);
  only MMB exists.
- **Open forks for the plan (not pre-resolved):** repo-per-brand-vault topology vs sub-folders ·
  how per-brand docs-navigator + graphify HTML are generated + hosted · vault→repo promotion
  mechanics for the QuickCapture inboxes (PL-002) · the "vault dashboard that looks/feels like the
  site" surface (overlaps PL-007 GLL cards + PL-003 State-of-Dojo).
- **Next step:** `session-0595-vault-consolidation-plan` — `/pp` grill under G-023.

### PL-009 — Codex Daily Bug Scan (DBS) → ledger + State-of-Dojo component — planned (SESSION_0589 → L2 + L4 + fresh-Codex L`session-0596`)

- **Origin:** operator directive, SESSION_0589 (2026-07-20). The DBS "ran this morning and has work
  to review/merge."
- **The idea:** the scheduled **Codex Daily Bug Scan** feeds a **findings ledger**
  ([`daily-bug-scan-ledger.md`](daily-bug-scan-ledger.md), `DBS`, created this session) which renders
  as a **visual UI/UX component on the State of the Dojo page** — on the local opening/closing
  artifact AND the pushed `/app` admin dashboard landing — running after/as part of the scan.
- **SESSION_0589 finding:** the scan is **not editable from a Claude session here** (no repo-side
  config, no crontab; only disk/docker launchd monitors). It is Codex-Cloud-side → the pipeline is a
  **fresh Codex session** the operator runs. This morning's output is **not located in the repo**
  (no PRs/branch/report) — operator to point to it.
- **Planned (three touch-points):**
  - **L2** (`session-0591`): wire the `DBS` code into ledger-backlog + deferral-guard + §6.7.
  - **L4** (`session-0593`): build the DBS visual component on State of the Dojo.
  - **`session-0596-dbs-pipeline`** (fresh Codex): locate/import this morning's output; define the
    scan→DBS-ledger append format + schedule (cron/launchd) + the L4 component's data contract.
- **Goal row:** [G-023](goals-ledger.md) (State-of-Dojo host surface).

## Cross-references

- [Goals Ledger](goals-ledger.md) — where planned ideas graduate to.
- [Daily Bug Scan Ledger](daily-bug-scan-ledger.md) — the DBS findings ledger (PL-009).
- [Petey Plan protocol](../../protocols/petey-plan.md) — the plan-session machinery.
- [Loop-of-Loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) — ledger-driven
  session model this slots into.
