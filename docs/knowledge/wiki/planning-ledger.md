---
title: Planning Ledger
slug: planning-ledger
type: reference
status: active
created: 2026-07-20
updated: 2026-07-22
last_agent: petey-session-0616
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

### PL-003 — State of the Dojo as the `/app` admin landing (AdminKanban embed + ritual render + per-product publish) — planned (SESSION_0593 → WS-A…E)

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
     - **⚠ AMENDED (SESSION_0599, G-026):** the landing **SHELL/composition** is now owned by the
       admin-consolidation lane (**G-026 / SESSION_0599**, the WRITE side) — **not** PL-003/0593. 0593
       delivers each read surface (State-of-Dojo / component-catalog / card-catalog / cookbook) as a
       **self-fetching async panel behind a frozen import-path contract**
       (`components/app/state-of-dojo/{…}-panel.tsx`, placement-agnostic, optional `{ compact? }`);
       G-026's `DashboardLanding` shell **mounts** them. **No landing tug-of-war: 0593 delivers
       content, 0599 owns the shell.** 0593's remaining scope = the projection framework + panels +
       the mount contract (freeze the import-path + prop signature for WS-3).
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

### PL-006 — Token-Cost-Tracker visual component (State of the Dojo + Session-Summary-Brief) — planned (SESSION_0593 → WS-D)

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

### PL-010 — Failed-Steps ledger sweep: repeat-offender audit + durable-prevention mechanism — queued · own plan session

- **Origin:** operator observation, SESSION_0597 (2026-07-21): *"that's a lot of Failed Steps… are we
  just really good at capturing them but not doing anything about it?"* Direct evidence THIS session:
  the **pipe-masks-exit-code** trap (already captured durably before) **recurred** and produced a
  false-green build — capture ≠ prevention.
- **The idea (to grill in the plan session — NOT pre-resolved):**
  1. **Sweep all FS-NNNN entries for repeat offenders / clusters** — same root cause recurring under
     different ids (build-gate honesty, migration flow, worktree bootstrap, etc.). Quantify recurrence.
  2. **Diagnose the gap:** is `failed-steps-log.md` a write-only graveyard? For each mitigation, was it
     enforced *durably* (a gate/hook/script) or only *documented* (prose a future agent must remember)?
  3. **Design the capture→prevention promotion path:** which FS misses can become **enforced gates**
     (e.g. a build-gate wrapper that captures the real `$?`; a bow-out gate that regenerates the Prisma
     client after a schema lands) vs stay docs-only. A recurring FS is the trigger to promote.
  4. **Define "the mitigation stuck":** how do we know an FS didn't recur after capture? (a recurrence
     counter / a periodic self-audit).
- **Note:** related to the abstraction-ladder doctrine (run → card → skill) — this is the same
  "prove the fix is durable, don't just log it" instinct applied to the FS log.
- **Goal row:** none yet (mint a `G-NNN` if it graduates to a program).

### PL-011 — Branded client-onboarding artifacts + interactive forms — queued · own plan (G-028)

- **Origin:** operator directive SESSION_0598 (uploaded RDD onboarding templates).
- **Raw assets:** `docs/product/rdd/assets/{Initial_Client_Meeting_Template,Master_Service_Agreement_Template,NDA_Template}.docx`.
- **Own plan-me stub:** `session-0602-rdd-onboarding-forms-plan`. **Goal row:** [G-028](goals-ledger.md).

### PL-012 — ULTIMATE NORTH STAR: Bubble Builder Bento Box (Custom Card Component Catalog Creator) — queued · **dedicated `/pp` epic** (RDD phase 14)

- **Origin:** operator directive SESSION_0604 (relayed the `ULTIMATE_NORTH_STAR.md` vision from RDD_Master_Vault).
- **Captured:** [`docs/product/north-star-bubble-builder-bento-box.md`](../../product/north-star-bubble-builder-bento-box.md) — the flagship vision (canvas-of-canvases · shells + one passport · bento-box page-builder · tournament blueprint · sliding-tile mats · Apple-Pencil/iPad-native · CCC engines-built-once).
- **Session focus:** user delight + experience. **Grill deep with pros** (operator asked to be grilled) — but in the *dedicated* session, not inline; break each feature into highlights · key necessities · desired behaviors.
- **Research:** Milanote (canvas layout/tech) · sliding-tile puzzle games (mat-swipe behavior) · Beaver Builder (page-builder model).
- **Relationship:** the create-\* commands + component lifecycle (WS-E) staged in [SESSION_0605](../../sprints/SESSION_0605.md) are this North Star's **tooling substrate** — scope 0605 as a child of PL-012. Look-and-feel North Star = the Ronin Dojo Monorepo.
- **Graduates to:** its own `G-NNN` at the dedicated plan session. Not yet stubbed — mint the SESSION when grabbed.

### PL-013 — Iggy Agent: social-media automation for all brands — queued

- **Origin:** operator directive, bow-out 2026-07-22.
- **Coverage check (goals ledger):** **no G-row** covers social-media automation. (`Iggy` appears in ~20
  docs — confirm at plan time whether Iggy is an already-named agent persona or net-new before scoping.)
- **The idea:** an **Iggy** agent that automates social-media presence/content across **all brands**
  (RDD · BBL · Mammoth · Baseline · WEKAF · ACD) — one kernel capability, per-brand voice.
- **Open forks for the plan (not pre-resolved):** which platforms (IG/X/YT/TikTok/LinkedIn) · content
  pipeline (source → draft → approve → schedule → post) · **HITL approval gate** (nothing posts
  unattended — publish-content boundary) · per-brand voice (route through **Brandon** for brand canon) ·
  asset source (the cross-brand CMS, PL-014) · scheduling/runtime (local agent vs cloud).
- **Next step:** own `/pp` plan session → `G-NNN`. Relates to [[join-funnel-comp-gate-and-global-modal]]
  (content → funnel) + PL-014 (asset source).

### PL-014 — Cross-brand CMS (WordPress-Pods-style) in concert with the HubSpot-Pro-replacement CRM — queued

- **Origin:** operator directive, bow-out 2026-07-22.
- **Coverage check (goals ledger):** **partially covered** — the HubSpot-replacement **CRM core** is
  [G-021](goals-ledger.md) (Mammoth lean operating shell + sales-cockpit tracer); the **cross-brand
  "see all brands' assets/state"** view is [G-027](goals-ledger.md) (RDD umbrella app) +
  [G-023](goals-ledger.md) (State-of-Dojo, per-brand + umbrella). **NEW** = the **Pods-style flexible-
  content CMS layer spanning all brands**, run in concert with the CRM, surfaced to RDD across every brand.
- **The idea:** a WordPress-Pods-style CMS (flexible content types) for **all brands**, wired to the MMB
  CRM, so **RDD sees all brands' assets + state** in one place — the cross-brand visibility we're building
  toward. (`Pods` in ~50 docs is mostly the BBL `bbl_member` **WordPress-Pods import data**, D-028 — NOT a
  CMS goal; different sense.)
- **Open forks:** content model (per-brand DB boundary, ADR 0038, vs one shared CMS) · how RDD aggregates
  all-brands assets **without cross-product data leak** · relationship to the kernel module library ·
  build-on-MMB-first then generalize (the CRM pattern) vs RDD-first.
- **Next step:** own `/pp` plan session → `G-NNN` (or G-021/G-027 children). Feeds PL-013 (asset source).

### PL-015 — Phase 14 RDD lift from the old ronin-dojo-monorepo — queued · **source doc in hand**

- **Origin:** operator directive, bow-out 2026-07-22.
- **✅ Source doc imported (2026-07-22):** [`phase14-local-deployment-checklist`](../../product/rdd/phase14-local-deployment-checklist.md)
  (operator-provided from Baseline_Vault; secret-scanned clean). It is a 14-section DirStarter local-deploy
  + Phase 1–14 port/lift checklist: **§0 app-boundary gate** (Option A `apps/rdd-web` new app —
  *recommended* — vs Option B tenant), inventory → scaffold → DB/env → design system → **6 bounded epics
  A–F (`#248`–`#253`, master epic `#247`)** → feature-lift rule ("port behavior, not filenames") → smoke
  → quality gates → Vercel preview → prod. Carries its **own `/grill-me` decision gate (15 Qs)** + a
  **recommended first session RDD-0001** (repo-truth + app-boundary ADR; *do not lift feature code until
  the boundary is decided*).
- **Coverage check:** overlaps **[G-027](goals-ledger.md)** (RDD umbrella app deploy) + **[G-028](goals-ledger.md)**
  (already resolved F5 = build in `apps/rdd` now, ADR 0038 own DB) — this checklist is the **full lift
  program** those goals sit inside. Legacy ref repo = `ronin-dojo-monorepo`.
- **Next step:** **ready for its `/pp` plan session** (no longer blocked) — run the doc's §0 app-boundary
  gate + 15-Q grill first, then graduate to `G-NNN` (or G-027 children) with epics `#247`–`#253` as the
  lane map. Relates to PL-012 · G-027 · G-028.

### PL-016 — Obsidian Vaults / Admin Dashboards: financial tracking + business planning/vision — queued

- **Origin:** operator directive, bow-out 2026-07-22.
- **Coverage check (goals ledger):** **partially covered** — [G-014](goals-ledger.md) (Obsidian Dashboard
  Epic) owns the vault dashboards; **NEW facet** = **financial tracking + business planning/vision**
  (real business financials, not the token/cost telemetry of [PL-006](#pl-006--token-cost-tracker-visual-component-state-of-the-dojo--session-summary-brief)).
- **The idea:** the Obsidian vaults + admin dashboards carry **financial tracking** and **business
  planning/vision** per brand and at the RDD umbrella — a business layer over the State-of-Dojo/vault
  constellation.
- **Open forks:** financial data source (where truth lives — a ledger/DB/spreadsheet) · which brands ·
  vault-note projection vs in-app surface · privacy (financials are sensitive — access boundary).
- **Next step:** own `/pp` plan session under/with [G-014](goals-ledger.md) → `G-NNN`. Pairs with PL-008
  (vault consolidation) + PL-017 (RDD-as-company).

### PL-017 — AgentOS: RDD as a company with an org-chart hierarchy (Roadmap v1.0) — queued · ⚠ source doc needed

- **Origin:** operator directive, bow-out 2026-07-22 (from the old-monorepo **Ronin Dojo Roadmap v1.0**).
- **Coverage check (repo):** **none** — `AgentOS`/`Agent OS`/`Roadmap v1`/`Ronin Dojo Roadmap` return
  **0 docs**. Relates to the **agent-systems-map** (the 5 pillars, [[agent-systems-map]]) but "AgentOS as a
  company with an org chart" is a new vision layer.
- **⚠ Blocker:** the source is the old-monorepo **Ronin Dojo Roadmap v1.0** — **NOT in this repo**;
  **operator to hand it over** (graphify query found nothing here).
- **The idea:** model **RDD as a company** — an **AgentOS** with an **org-chart hierarchy** mapping
  agents/roles to a company structure (who reports to whom, decision authority), extending the
  agent-systems-map into an operating org.
- **Next step:** operator provides Roadmap v1.0 → `/pp` plan session → `G-NNN`. Pairs with PL-016
  (business layer) + [[agent-systems-map]].

### PL-018 — Repo-Refinement-Review recipe / session template — queued

- **Origin:** operator directive, 2026-07-22 (bow-out follow-on).
- **Coverage check:** the **`state-sweep`** recipe (SESSION_0616 — `docs/protocols/recipes/state-sweep.md`
  on the `state-sweep-deliverables` branch, lands on `main` via SESSION_0614) is the nearest existing
  template — assess repo-state + ledger status-flip + autonomous-lane prep. The operator's **Repo-Refinement-Review**
  is related but broader; **resolve at plan time** whether it *supersedes/renames* `state-sweep` or is a
  sibling that adds a *refinement* pass (not just assess-and-flip, but actively refine).
- **The idea:** a durable session-template recipe for a periodic **repo refinement review** — sweep the
  ledgers + repo state, flip stale, review + refine (dedupe / dead-code / drift / quality), stage follow-ups
  — a first-class SOT_Cookbook card, **paired with the per-brand SOT-vault update (G-029)** so a refinement
  review also refreshes the brand/client vault.
- **Open forks:** name (Repo-Refinement-Review vs keep `state-sweep`) · scope (assess-only vs assess+refine)
  · cadence (per-sprint / on-demand) · relationship to [`hostile-repo-review`](../../protocols/hostile-repo-review.md)
  (the repo-wide lean-out) + the 3 design passes.
- **Next step:** `/pp` plan session → recipe card (+ SOT_Cookbook row) → possibly `G-NNN`. Pairs with
  [G-023](goals-ledger.md) (recipe OS) · [G-029](goals-ledger.md) (per-brand vault ritual).

### PL-019 — `Brian_Scott_Master_Vault` consolidation (work + family + personal, one Obsidian Sync master)

- **Status:** in-progress — P2 (operator, 2026-07-22, SESSION_0617). Supersedes/absorbs the vault-consolidation
  half of [PL-008](#pl-008--vault-consolidation--sot-per-brand-vaults-as-own-repos--per-brand-tooling).
- **Problem (diagnosed from operator screenshots):** ~7 scattered Obsidian vaults across **two sync mechanisms**
  — iCloud Drive (`clients`, `RoninDojoObsidian`, `PodsJWT`, `RoninDojoDesign`) vs **Obsidian Sync** (phone
  `RDD_Master_Vault` ↔ remote **"Baseline"**). No Sync pairing between the iCloud copies and the "Baseline"
  remote, so the phone master never lands on the Mac (root cause of "State-of-Dojo not on desktop").
- **Target:** ONE master **`Brian_Scott_Master_Vault`** (work + a family folder + a personal folder), backed by
  the **"Baseline" Obsidian Sync remote** as the single SoT. Mac local master = renamed `~/Desktop/Baseline_Vault`
  → `~/Desktop/Brian_Scott_Master_Vault` (done this session).
- **Plan:** (1) operator connects the Mac master to the "Baseline" Sync remote (UI-only, operator does it).
  (2) Non-destructive merge script (`vault-merge.sh`) zip-backs-up the master then rsyncs each source's notes+
  attachments into `_import/<source>/` (excludes `.obsidian`/`.git`/`node_modules`/`.trash`; **no deletes**).
  Real note volume: Baseline_Vault 3,338 · Ronin_Baseline 210 · RoninDojoDesign 16 · THIS_ONE_VAULT 0.
  (3) Verify on both devices, then retire the iCloud copies. **Lane:** vault-infra / personal-ops.

## Cross-references

- [Goals Ledger](goals-ledger.md) — where planned ideas graduate to.
- [Failed-Steps Log](../../protocols/failed-steps-log.md) — the ledger PL-010 audits.
- [Daily Bug Scan Ledger](daily-bug-scan-ledger.md) — the DBS findings ledger (PL-009).
- [Petey Plan protocol](../../protocols/petey-plan.md) — the plan-session machinery.
- [Loop-of-Loops](../../protocols/loop-of-loops-ledger-driven-sessions.md) — ledger-driven
  session model this slots into.
