---
title: Goals Ledger
slug: goals-ledger
type: reference
status: active
created: 2026-06-27
updated: 2026-07-18
last_agent: claude-session-0564
pairs_with:
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/rituals/opening.md
  - docs/knowledge/wiki/files/loop-board.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0546.md
tags:
  - governance
  - goals
  - ledgers
  - loop-of-loops
---

# Goals Ledger

The durable home for **goals / objectives** — the *top* of the Loop-of-Loops backlog. Where the other
ledgers hold debt and findings (what's *broken* or *missing*), this holds **what we're driving toward**.
It makes the operator's per-session `/goal` durable and gives the [loop-board](files/loop-board.md) +
`scripts/ledger-backlog.ts` a north-star lane (ledger code **`GL`**).

**North star (not a tracked row — the why behind the rows):** Black Belt Legacy's verified lineage
**graph** is the asset/moat; the **mission** (preserve the Machado / Bob Bass lineage) is the engine;
revenue is exhaust. Optimize the **claim loop** above all. (BBL PRD; `ronin-project-context.md`.)

## Format (so the parser + board ingest it)

Each goal is a level-3 section `### G-NNN — title` with a `- **Status:**` line carrying the lifecycle
**and** a priority tag, e.g. `- **Status:** in-progress — P0`. Open/in-progress/active goals project as
cards (done/achieved/dropped are closed). Mirrors `drift-register` so the existing `parseSectioned`
aggregator reads it with no new parser logic.

- **Status values:** `open` · `in-progress` · `done` · `dropped`
- **Priority tag:** `P0` (the one thing) · `P1` (this stretch) · `P2` (soon) — drives ranking.

## Goals

### G-001 — Land Brian Truelson (FI-001 — the P0 first tester)

- **Status:** in-progress — P0
- **Objective:** deliver Brian Truelson's claim magic-link + lifetime Elite comp so BBL has its first
  non-admin tester landing on a polished onboarding.
- **Lane:** lineage / onboarding. **Gated:** real send to `btruelson@gmail.com` held until N1/N2 land
  AND the operator says "send Brian now" (test-send proven 0457).
- **Why:** the claim loop is the moat's engine — the first real claim proves the funnel end-to-end.

### G-002 — Per-product database separation

- **Status:** in-progress — P1
- **Objective:** give each product its own database (BBL its own dedicated DB; clients their own),
  separate brands + per-product deploys, **staying monorepo**. BBL's own *prod repo* is **deferred**.
- **Lane:** platform / infra. **Decision:** ADR 0038. **Depends on:** nothing (it unblocks G-003).
- **Progress:** **Phase 1 LANDED (SESSION_0459)** — Mammoth scaffolded on its own `mammoth_dev` DB
  (HubSpot-replacement CRM core); isolated migration proven (BBL `ronindojo_prodsnap` byte-identical;
  root `bun.lock` untouched); per-app-db-separation runbook + guardrail documented. **Phase 2 local half
  LANDED (SESSION_0460)** — Mammoth app wired off localStorage onto `mammoth_dev` (Prisma adapter + server
  actions + DB-backed AdminKanban store; guardrails preserved; one Project SoT; headless-verified;
  `next build` green; MB-DATA-002 done). Phase 2 **cloud half** (Neon provision + Vercel wiring) +
  loop-board Phase B (G-003) deferred, operator-gated/SHIP-gated.
- **Why:** a shared DB couples products (a client migration can break BBL); BBL's lineage graph
  deserves its own failure domain + backup posture. Completes ADR 0034's multi-product model.

### G-003 — Loop-of-Loops P3 Phase B (editable, DB-backed loop-board)

- **Status:** landed — P2 (SESSION_0461)
- **Objective:** make `/app/loop-board` editable — a `KanbanCard` model + drag/add persistence — and
  **collapse the localStorage `AdminTaskBoard` into it** as a card *source* (one shared board).
- **Lane:** governance tooling. **Depends on:** G-002 (the table lands on BBL's own DB, not the shared one).
- **Why:** closes the Loop-of-Loops loop — sessions move cards; the board IS the live backlog.
- **Progress:** **LANDED (SESSION_0461)** — `KanbanCard` model on BBL's `ronindojo_prodsnap` (migration
  `20260628000000_add_kanban_card`); Prisma `BoardStore` (upsert-only save) + insert-only ledger importer +
  one-time localStorage→DB task migration; `AdminTaskBoard` retired (`/admin/task-board`→redirect, engine
  deleted). Anti-drift discipline → learning record 0004. Verified: data-layer proof 11/11 (anti-drift +
  anti-race) + Playwright 2/2 + `next build`.

### G-004 — BBLApp feature adaptation (N1 + N2)

- **Status:** done — P1 (SESSION_0500)
- **Objective:** N1 — swap the verified instructor/school creatable-combobox into the post-claim
  profile-enhancement wizard. N2 — member-dashboard ports (belt-by-belt edit cards, per-member privacy
  toggles, a dedicated Billing tab). Read-and-translate, no Playwright port.
- **Lane:** lineage / member dashboard. **Unblocks:** G-001 (polished onboarding before Brian's real send).
- **Why:** the post-claim surface is where a new claimant lands — it must feel finished.
- **Progress:** **DONE (SESSION_0500, shipped to prod).** N1 = post-claim wizard now uses the verified
  creatable-combobox for instructor/school (typed refs `trainedUnderNodeId`/`claimedSchoolId`; Doug SHIP
  9.6). N2 = **2 of 3 surfaces (belt edit cards + privacy fields) were already on main via #186** — real
  work was the NEW Billing tab + privacy discoverability polish. So **G-001/FI-001's onboarding-polish gate
  is now cleared** — only the operator "send Brian now" remains. (See `186-superseded-belt-lane-ledger-items`
  memory — the belt ledgers overstated remaining work.)

### G-005 — m-card consolidation: build `kind="generic"` + rebase the kernel card on the Dirstarter L1

- **Status:** open — P1 — **doctrine ratified SESSION_0467, code pending.** [ADR 0040](../../architecture/decisions/0040-design-system-doctrine-and-card-architecture.md)
  + the [Design-System Doctrine](design-system-doctrine.md) define the target: ONE L1 `Card` surface + named
  cards (`ListingCard`=catalog, `m-card`→record/person, `BoardCard`=kernel); **`kind="generic"` DROPPED** (the
  5 bespoke cards fold onto `ListingCard`, not a generic kind); the `kind` god-union splits into named cards;
  the kernel card rebases on the **ported** L1 surface (Option B: tokens travel, Tailwind doesn't). The code
  session executes against the doctrine §5–§6 conformance-gap checklist.
- **Status (historical):** open — P1 (promoted SESSION_0466 — operator)
- **Objective:** (a) add the `generic` m-card kind to unlock the highest-leverage consolidation —
  FacetResultCard (orgs/trees), CourseCard, PostCard, MerchCard, TournamentCard onto the one card; **and
  (b) heal the card-origin fork** — the kernel card (`packages/ui-kit/src/m-card/m-card.tsx`) is a
  clean-room reimplementation that does NOT inherit Piotr Kulpinski's Dirstarter L1 `Card`
  (`apps/web/components/common/card.tsx`) the way `ListingCard` (ADR 0028/0029) and the app `web/m-card`
  do. **Extract the Dirstarter L1 `Card` primitive *down* into `packages/ui-kit`** as the ONE shared base
  (kernel-safe: framework-agnostic, no Next `Link`), then **rebase the kernel m-card on it** and reconcile
  the two parallel m-cards (app `web/m-card` vs kernel `ui-kit/m-card`, flagged "for reconciliation" in the
  custom-component-inventory).
- **Lane:** ui-kit / consistency. **Why:** closes the 5-card / 4-shape parity gap AND restores the
  Dirstarter origin as the single L1 across app + kernel ("one card" everywhere, on Piotr's clean base
  instead of three cards / two foundations). The loop-board readability bug (SESSION_0466) was a symptom of
  the clean-room fork. **Grounding:** Graphify-confirmed (SESSION_0466) — `listing-card.tsx`↔ADR 0028;
  kernel `m-card.tsx` has no edge to `common/card.tsx`; G-005 is the direct neighbor of `m-card.tsx`.

### G-006 — Per-brand PRD/story completion tracking

- **Status:** open — P2
- **Objective:** convert each brand's `STORIES.md` (BBL / baseline / mammoth) to `- [ ]`/`- [x]`
  checklists (+ PRD acceptance criteria) and compute a per-brand completion %; surface on the loop-board.
- **Lane:** product / governance. **Why:** visible progress per brand, aligned with product separation.

### G-007 — PR-review automation: open PRs as a live Loop-of-Loops source

- **Status:** done — P1 (SESSION_0548 verified fully shipped)
- **Objective:** make `/bow-in` auto-pick-up open-PR review/fix the way it picks up ledger debt.
  (a) add a **live `PR` source** to `scripts/ledger-backlog.ts` — query
  `gh pr list --state open --json number,title,headRefName,isDraft,reviewDecision,statusCheckRollup`,
  emit each open PR as a backlog item (synthetic code `PR`; rank: red-CI/changes-requested = P1,
  draft/clean = P2, then by age), parser shared with `apps/web/lib/loop-board/ledger-parse.ts` so
  `/app/loop-board` projects PRs too; (b) wire bow-in (`docs/rituals/opening.md`) to route the default
  task to `/pr-fix-loop` when open PRs exist; (c) enhance `/pr-fix-loop` to fan out one background
  subagent per PR in its own `git worktree` (the SESSION_0463–0465 pattern) running
  pr-review-score-fix + `/fallow-fix-loop` + hostile-close, committing fixes to the PR branch,
  pause-on-merge, concurrency-capped.
- **Lane:** governance tooling / automation. **Depends on:** existing `pr-fix-loop` skill +
  `ledger-backlog.ts` aggregator. **First exercise:** PRs #172 / #173 / #174 (the 0463–0465 lanes).
- **Design note (Petey/Giddy):** PRs are **live state** (query `gh`), not a hand-maintained markdown
  ledger — so "PR ledger" = a live *source* in the aggregator, not a file that goes stale. The
  *capability* is this goal (GL); the *running PRs* surface automatically once the source ships.
- **Why:** closes the OTHER half of the Loop-of-Loops — inbound ledger debt **and** outbound open-PR
  review become one auto-surfaced backlog; the operator just runs `/bow-in`.
- **Progress:** DONE. (a) `scripts/ledger-backlog.ts` has the live `PR` source and shared parser;
  `apps/web/lib/loop-board/fetch-ledgers.ts` projects PRs into the board. (b) `docs/rituals/opening.md`
  §1c routes open PRs to `/pr-fix-loop`. (c) `.claude/skills/pr-fix-loop/SKILL.md` now has the
  worktree fan-out contract: one subagent per PR, own `git worktree`, pr-review-score-fix +
  `/fallow-fix-loop` + hostile-close, local commits only, concurrency cap, pause-on-merge, and no push
  without operator authorization.

### G-008 — BBL lineage/profile visual expansion (parked direction)

- **Status:** open — P2 (direction, not vital; worked on "as we go")
- **Objective:** the operator's stated visual roadmap for the lineage/profile surfaces, captured at
  SESSION_0520 so it is documented but explicitly **does not gate the FI-001 send**:
  (a) refine the **V2 beta cards** and promote them to a visible option alongside the cinematic
  explorer and board/tree; (b) add a **view-method toggle** (list/card-style, like the posts toggle)
  for the tree, including a **new simplified file-tree style**, pulling the operator's uipkge.dev
  components — organization-chart, tree-chart, timeline, tree-table, sheet
  (`https://uipkge.dev/react/components/*`); (c) **another BBL Galaxy attempt**.
- **Lane:** lineage explorer / design system. **Depends on:** nothing hard; enabled now that
  instructor/student modeling + the Passport-DTO-on-anything pattern exist.
- **Why:** the verified lineage graph is the moat; richer, switchable visualizations deepen it. The
  **scrollytelling timeline** is the operator's top visual, but it is a **pre-send Group-1 item
  (FI-023)**, not parked here — G-008 holds the non-gating expansion only.

### G-009 — Creator payout model for premium community content

- **Status:** open — P2
- **Objective:** design + build a **creator-payout model** so a member who authors premium content
  (FI-028b lets any create-capable author self-serve mark their own community post premium-to-read)
  earns a share of the revenue their gated content drives — rev-share / payout rails, an author
  earnings surface, and the tax/KYC plumbing a real payout needs.
- **Lane:** payments / monetization. **Depends on:** FI-028b (per-post premium ships the *gate*;
  this ships the *incentive*). **Enables:** turning premium posting from a platform merchandising
  lever into genuine creator monetization.
- **Why:** FI-028b (SESSION_0537) shipped the author-toggle **without** a payout model — premium
  currently benefits the platform (drive upgrades), not the author. Logged at the operator's request
  during the FI-028b grill (Q3) so the incentive gap is a tracked goal, not a silent asymmetry. Until
  this lands, "mark premium" is an author-controlled *platform* lever, not creator monetization.

### G-010 — Instructor review queue for backfill promoter-changed reviews

- **Status:** done — P1 (SESSION_0541 + SESSION_0542 + SESSION_0544/PR #210 squash-merged)
- **Objective:** the `belt.admin` AdminCollection queue now actions captured
  `RankEntryReview{PROMOTER_CHANGED, status: PROPOSAL_PENDING}` proposals through an inspect-before-decide detail route.
  Approval atomically applies the immutable proposed promoter and verifies the belt; denial preserves the
  accepted promoter; an explicit admin override closes and corrects the proposal atomically. The list links
  member/belt/proposed-promoter context to canonical confirmed actions.
- **Lane:** belt / lineage / admin. **Depends on:** SESSION_0540 backfill-verification model (ships the
  create-side; `verifyRankEntry` already exists). **Enables:** closing the trust loop — a member's
  different-promoter backfill can actually be reviewed instead of sitting UNVERIFIED forever.
- **Why:** SESSION_0540 shipped reviews as CREATE-without-consumer. SESSION_0541 added the queue; SESSION_0542
  closed the second-order integrity and AdminCollection findings with an immutable proposal snapshot,
  transaction-serialized decisions, addressable detail, and confirmation UX. SESSION_0543/0544 hardened the
  review with lock-before-read race close, belt.admin permission parity, DB-target guards, and CI-caught
  brand-null fix. PR #210 squash-merged to main 2026-07-17. The separate register-later confirmation/MERGE
  loop is explicitly owned by RankEntry-retirement epic task H rather than this completed queue.

### G-011 — RankEntry unification (retire RankAward)

- **Status:** proposed · **Blocked-by: G-001 / FI-001** (post-send epic; do not start before Brian
  Truelson's email ships and the moat is live)
- **Objective:** collapse `RankAward` + `RankEntry` into ONE rank model — delete the compatibility Seam,
  the dual-write call sites, and every `RankAward`-direct reader. The result is a single `RankEntry` Module
  that hides rank fact, provenance, trust, and proposal-preservation rules.
- **Pointer:** full plan lives at [`docs/product/black-belt-legacy/rankentry-unification-epic.md`](../../product/black-belt-legacy/rankentry-unification-epic.md).
  Do not duplicate the plan here — this Goals Ledger row is a backlog-visibility pointer only.
- **Scope signal:** `RankAward` appears in 44 non-test, non-script TS/TSX files; 10 compatibility writer
  call sites identified in the epic. The epic has tasks A–H; task H is the table-drop.
- **Lane:** belt / schema. **Depends on:** G-001 / FI-001 (send Brian Truelson's verified-lineage email).
  **Enables:** KISS rank model (operator mandate, SESSION_0523), G-010 task H (register-later loop), ADR 0047
  trust-state consolidation.
- **Why:** the epic doc exists and the mandate is clear, but without a Goals Ledger row the unification work
  is invisible to `ledger-backlog.ts` and future bow-in planning. This row surfaces it for prioritization
  without blocking anything active. (SESSION_0542 architecture scan; SESSION_0544 TASK_05.)

### G-012 — Count-neutral DB-backed verification (fixture-ownership module)

- **Status:** open · P2
- **Objective:** extract the repeated fixture-ownership pattern across 71 DB-backed tests into one reusable
  module — rollback adapter, tagged-cleanup adapter, run-identity, FK-safe teardown order, and count-neutral
  proof. The current state has 6 identical `inRolledBackTx` rollback implementations copied across test
  files; 36 tests use ad-hoc tag/prefix deletion; and SESSION_0542's D-047 leak proved that green assertions
  alone do not prove fixture ownership.
- **Lane:** test infrastructure / developer experience. **Independent of FI-001 / G-001 sequencing** — can
  land in any focused infrastructure session.
- **Enables:** safer DB-backed test authoring across the repo, closes the class of teardown leaks that
  produced D-047 and the SESSION_0542 interrupted-run residue (41 Users / 22 Organizations / 138 Passports).
- **Why:** 6 copied rollback implementations + 71 tests with manual teardown = a real, measurable duplication
  problem with a concrete Adapter waiting to be extracted. Distinct from D-047 (one-time historical cleanup);
  this goal is the recurring pattern fix. (SESSION_0542 architecture scan; SESSION_0544 TASK_05.)

### G-013 — Finish the BJJ technique experience epic

- **Status:** in-progress — P1
- **Objective:** continue the operator-pinned technique graph/curriculum epic after SESSION_0546 Wave 1:
  Wave 2 graph tooltips, animated filter pill, zoom/fit easing, selected-neighborhood glow, empty/reset states,
  and difficulty help; Wave 3 motion-only CurriculumJourney, key-point peek, grid stagger, and node menu; then
  read-only curated Combo Flows. Preserve beta posture, keyboard/reduced-motion parity, and the locked-media
  invariant (no URL or media-id-bearing poster).
- **Lane:** BJJ techniques / curriculum / design. **Depends on:** SESSION_0546 Wave 1 (landed locally).
  **First task:** B1 graph-node tooltips + C2 filter pill as one reviewed slice, then C4/C5.
- **Constraints:** extend existing Dirstarter Content/Media/Monetization seams; derive-only content v1; no
  schema migration, Lenis, nav promotion, QuestPanel/XP, Eskrima appendix, haptics, or authoring flow.
- **Why:** Brian explicitly pinned this epic. Wave 1 fixed the conversion/access and visual foundation; the
  remaining interaction and narrative layers are now a bounded, independently reviewable continuation rather
  than untracked design intent. (SESSION_0546.)

### G-014 — Obsidian Dashboard Epic — vault-kit + dashboard design/planning

- **Status:** in-progress — P1
- **Objective:** execute the SESSION_0564 epic: ONE canonical vault (Baseline_Vault consolidation,
  Design-vault fold-in, 13 GB RoninDojoObsidian archive), layered git+Obsidian-Sync phone/laptop
  parity, and the in-repo `vault-kit/` (idempotent installer, DB-seed-token brand skins, template
  library, Command Center v2 on Bases/Dataview/Kanban) — the vault as design-system skins + quick
  mockups + client business-showcase + dashboard.
- **Pointer:** full plan at
  [`docs/product/obsidian-dashboard/Obsidian_Dashboard_Epic.md`](../../product/obsidian-dashboard/Obsidian_Dashboard_Epic.md)
  (workstreams A–C; tasks OD-A1..OD-C3). This row is backlog visibility only — do not duplicate.
- **Lane:** design-system / operator tooling. **Includes:** skills onboarding (vendor `hallmark`;
  vendor+conform `wayfinder` + 4 sibling deps; replace the dead-path `obsidian-vault` skill).
- **Why:** operator-pinned "heartbeat of the brand" — the vault-kit installer doubles as the RDD
  client-automation demo (ADR 0034 platform model extended to the workbench layer).

### G-015 — Hermes local automation + Model Option research-recommend

- **Status:** open — P1
- **Objective:** build Hermes (`vault-kit/hermes/`): launchd-scheduled `claude -p` job runner with
  ntfy reporting, running the v1 job set — daily brief, weekly review draft, content-engine sweep,
  design-drop watcher (hallmark `study`), email sweep — writing markdown into the canonical vault.
  Ship the **Model Option** research-recommend doc (per-job model matrix, measured token volumes
  after 2 weeks live, subscription-`claude -p`-vs-API decision record; task OD-D1b).
- **Pointer:** epic §5-D + §6 (tasks OD-D1..OD-D6, OD-D1b). **Depends on:** G-014 phase 1
  (canonical vault + sync). **Invariant:** Hermes never auto-sends anything (epic D12).
- **Lane:** automation / agentic ops.
- **Why:** the dashboard is only alive if something feeds it daily; Hermes is the feed and the
  first productized "automate a client's daily workflow" proof.

### G-016 — Email Boards program (5 brands, phased)

- **Status:** open — P2
- **Objective:** per-brand email boards (BBL · Baseline · Mammoth · Tuff Buffs · WEKAF) per epic
  Workstream E: E-P1 sweep+categorize (read-only) → E-P2 board surface (vault kanban + Command
  Center rollup) → E-P3 reply drafts (into cards, never outboxes) → E-P4 explicit per-message
  approval→send. Cards carry the frontmatter contract; message-id ledger keeps sweeps idempotent;
  OAuth tokens live in keychain/env only (never vault/repo).
- **Pointer:** epic §5-E (spec, sequence diagram, integration notes). **Execution recipe:** Fable
  plans → Codex CLI worktree lanes and/or cheap-model caveman subagent fan-out under simple Petey
  orchestration — one lane per brand once the pilot proves the shape.
- **Lane:** automation / email. **Depends on:** G-017 pilot. **Gate:** E-P4 ships nothing until
  its approval-UX grill (epic D12).
- **Why:** staged so brand lanes are ready-to-grab vertical slices alongside codebase work.

### G-017 — Email Boards BBL pilot (then Mammoth)

- **Status:** open — P1
- **Objective:** prove E-P1+E-P2 on **BBL first** (Brian's own mailbox via Gmail API — zero
  external OAuth blockers): Hermes email sweep, categorized cards on a BBL board note, Command
  Center rollup. Success = demo-ready for the Michael Flores video meeting (2026-07-18 showcase
  of the Obsidian/Hermes setup) + a week of daily use with zero duplicate cards. **Mammoth =
  first follower**: Michael's OAuth (+ possible Google Calendar integration and Todoist API keys
  — todoist-sync-plugin already in the Design-vault harvest) collected at that meeting.
- **Pointer:** epic §5-E phases E-P1/E-P2 (D9 as amended). **Depends on:** G-015 (Hermes core).
  **Feeds:** G-016 5-brand fan-out.
- **Lane:** automation / email / BBL→Mammoth. **Why:** pilot on our own mailbox, showcase to the
  client, then onboard the client — the vault-kit business-showcase motion in miniature.
