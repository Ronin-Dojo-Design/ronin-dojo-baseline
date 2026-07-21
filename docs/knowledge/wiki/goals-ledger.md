---
title: Goals Ledger
slug: goals-ledger
type: reference
status: active
created: 2026-06-27
updated: 2026-07-21
last_agent: claude-session-0599
pairs_with:
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/rituals/opening.md
  - docs/knowledge/wiki/files/loop-board.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/sprints/SESSION_0546.md
  - docs/sprints/SESSION_0568.md
  - docs/sprints/SESSION_0571.md
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

- **Status:** landed · P2 · SESSION_0551
- **Objective:** extract the repeated fixture-ownership pattern across 71 DB-backed tests into one reusable
  module — rollback adapter, tagged-cleanup adapter, run-identity, FK-safe teardown order, and count-neutral
  proof. The current state has 6 identical `inRolledBackTx` rollback implementations copied across test
  files; 36 tests use ad-hoc tag/prefix deletion; and SESSION_0542's D-047 leak proved that green assertions
  alone do not prove fixture ownership.
- **Landed:** `apps/web/lib/test/fixture-ownership.ts` provides the shared rollback adapter, run identity,
  FK-safe exact/tagged cleanup, and count-neutral proof helper. SESSION_0551 migrated all 6 copied rollback
  call-sites plus the directory paywall and authenticated lineage e2e seed helpers; remaining ad-hoc cleanup
  migrations should follow [`test-fixture-ownership.md`](../../runbooks/sops/test-fixture-ownership.md) in
  small batches.
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
- **Progress (SESSION_0569):** Wave 2 first batch LANDED — B1 tooltips (no-media DTO, L1 tooltip,
  250ms/instant-focus) + C2 layoutId pill + hallmark-audit smalls (AUD-1 export font/crop fix,
  AUD-2 badge demotion, AUD-3 readable curriculum tabs, AUD-4 ctrl/⌘-gated wheel zoom) + fix batch
  (shared tooltip reduced-motion consolidation, 47-node coordinate re-pitch 67→0 overlaps, roving
  tabindex). Triple-reviewed (Doug 9.6×2, Desi GO-WITH-CHANGES), code-quality 9.4. **Next batch:**
  C4 zoom/fit easing (+ WL-P2-67 ZOOM_MIN + D-4 cooperative touch) + C5 neighborhood glow +
  D-3 pill parity on curriculum rows; then D3 empty states + B2 difficulty tooltips; then Wave 3.
  Audit defers D-1 (chart-token remap) and D-5→done/D-6 tracked in SESSION_0569.
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
- **Progress (SESSION_0568):** OD-A1 core split complete (53 MB); OD-B4 Command Center v2 built in the
  canonical vault with Worn Gi default and graceful fallbacks. G-014 stays in progress: private Git,
  Sync/phone merge, native Obsidian smoke, and credential-safe Todoist setup are routed to MB-016;
  vault-kit packaging/automation work remains in the epic.

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

### G-018 — Per-brand Command Center skins program (RDD · Baseline · WEKAF)

- **Status:** open — P3 (future lane; operator-declared SESSION_0566)
- **Objective:** extend the OD-B2 skin family so every remaining brand gets its own cockpit
  skin + vault setup: RDD, Baseline, and WEKAF USA Stick Fighting — seed-token-derived, same
  cockpit anatomy, textures as personality. BBL ×2 (`bbl-worn-gi`, `bbl-mat-room`) and Mammoth
  (`mammoth-crm`) shipped SESSION_0566 and are the templates.
- **Pointer:** epic §5-B OD-B2; SESSION_0566 snippets + harness/Playwright verify pattern.
- **Lane:** design / vault-kit. **Depends on:** OD-B1 packaging (skins ship via installer,
  not hand copies). **Why:** same cockpit, different skin + data wiring — the platform motion.

### G-019 — Mammoth landing resurrection + flesh-out

- **Status:** open — P2
- **Objective:** flesh out the Mammoth landing on both surfaces: (a) localhost dev —
  `clients/mammoth-build-crm/app/page.tsx` already renders the React landing (SiteHeader ·
  MirrorVisual · BuildingTypesGrid · InquiryForm); (b) vault — `Mammoth — Landing (draft).md`
  in the demo vault (ported SESSION_0566). Start-from artifact: the prod mock recovered from
  git (`524f0286^:apps/web/public/mammoth-build.html`; copy ships in the demo vault).
- **Pointer:** `docs/product/mammoth-build/` (PRD + STORIES, added when the mock came off
  prod at `524f0286`). **Lane:** Mammoth product. **Why:** was briefly live on BBL prod;
  now the client-facing follow-up artifact after the 2026-07-18 meeting.
- **Progress (SESSION_0568):** demo vault polished and packaged with empty Michael-feedback surfaces;
  landing flesh-out stays open until approved client vocabulary, claims, photos, and project proof exist.

### G-020 — Desi-driven hallmark audit program — BBL public surfaces

- **Status:** open — P2
- **Objective:** run the read-only `hallmark audit` (D11 as amended SESSION_0569: audit-only on
  `apps/web`; `redesign`/default stays banned) across the BBL public surfaces — home, lineage,
  directory, posts/blog, profiles, join funnel — Desi driving; every punch list routes through
  Desi + design-system doctrine (tokens stay law) before any build. Template: the SESSION_0569
  technique-surface pass (audit → merged Desi brief → batched build → review gates).
- **Pointer:** SESSION_0569 (grill outcomes + the technique-pass recipe); hallmark preamble D11
  amendment; wayfinder D10 preamble.
- **Lane:** design / public surfaces. **Mapping:** multi-session by construction → open a
  **wayfinder map** (`wayfinder:map` issue + per-surface audit tickets) when this lane starts —
  its proper epic-scale use per D10. **Why:** operator-ratified at the SESSION_0569 grill —
  extend the anti-slop consistency lens beyond the technique surfaces without re-litigating scope
  per session.

### G-021 — Mammoth lean operating shell + sales-cockpit tracer

- **Status:** in-progress — P1
- **Objective:** give Mammoth one lightweight operating projection and one safe daily sales path:
  `/game-on` → live evidence → `/game-off`, plus Today queue → lead roster → contact workspace →
  Contact Attempt → one owned, due Next Action. Reusable templates/presets live in the monorepo;
  private notes stay in the Mammoth vault; CRM truth stays in Mammoth's database.
- **Lane:** Mammoth product / vault-kit / CRM. **Session:**
  [`SESSION_0571`](../../sprints/SESSION_0571.md). **Depends on:** G-014 vault-kit packaging and
  the existing ADR 0038 per-product Mammoth DB.
- **Progress:** SESSION_0571 reconciled the phone/iCloud/local evidence, kept
  `MMB_INITIAL_INTAKE` explicitly missing, mapped the legacy `/GOALS` folder as historical rather
  than importing duplicate goal bodies, and rejected premature `discuss-determine` skill promotion.
  The reusable operating shell, Mammoth dashboard projection, and sanitized Activity-backed tracer landed.
  The next slice is an authenticated DB-backed concurrency smoke with sanitized fixtures, followed by operator
  ratification of the provisional attempt-outcome vocabulary before any schema/import/integration work.
  Private-vault `MMB_SESSION_0002` also queues the operator's lean SESSION_SUMMARY_REPORTS/recipe, Michael/Brian
  goal views, CV-001 EEE, CV-002 Token Discipline, BHB/runbook, and local-agent feasibility discovery; its first
  decision is whether ADR 0048's separate-live-vault boundary should remain or be amended.
  **SESSION_0582 (loop 2/3 slice a LANDED, merged + pushed `9f3f4696`):** lead-sheet import
  commit behind explicit confirm — ONE shared dedupe matcher (`lib/contact-match.ts`) consumed by
  preview AND widened `findOrCreateContact` (case-insensitive email + last-10-digit phone;
  operator-ratified); `commitLeadSheet` owner-gated, server-side re-parse, in-tx index,
  skip+report (never enrich/overwrite), Contact + lead Project per new row; Doug GO-WITH-NOTE
  9.6/10 with hermetic scratch-DB UAT. **Loop-3 slice (b) LANDED**
  ([`SESSION_0586`](../../sprints/SESSION_0586.md), 0587 sweep): Lead Source facet on the
  Sales-cockpit roster AND the pipeline board — shared `LeadSourceFacet` chips, ONE
  `normalizeLeadSource`/`leadSourceLabel` vocabulary, per-source counts, honest zero-count
  empty state; read-side only (board filter = remount over filtered `BoardStore`, ui-kit kernel
  untouched); board-card Lead Source badge (operator: KEEP); 40/40 tests + scratch-DB live UAT.
  **Remaining loop-3 candidates:** (c) attempt-cadence surfacing · enrich-blanks-on-match
  (NEW SESSION_0582 — blank-only, never overwrite; per-field rules to pin at election).
  Attempt-outcome vocabulary STILL provisional (ratification pending). Residual note: legacy
  `findOrCreateContact` form/board entry keeps Prisma `mode:"insensitive"` vs `emailKey` JS-fold
  edge divergence + matches "@"-less emails — reconcile at the vocabulary-ratification pass.
- **Boundaries:** no real lead import, scraping, send/call/email automation, provider connection,
  secret storage, or HubSpot use. HubSpot rotation remains owner-mediated under MB-017; Todoist is
  optional and one-way until its source-of-truth and credential decisions are explicit.
- **Why:** turns the ratified Mammoth Brand Heartbeat and no-drop sales promise into the smallest
  repeatable operating loop without creating a second CRM, second ledger, or client-data repo.

### G-022 — Technique graph out of beta (GA)

- **Status:** in-progress — P1 (Brian goal, opened SESSION_0578)
- **Objective:** promote the technique graph from `FeatureStatus: "beta"` (feature-log.ts +
  on-page Badge/Note — the graph is already PUBLIC at `/techniques/graph`, not `/app/beta`-gated)
  to GA. Ratified GA bar (SESSION_0578 grill): **(1)** ALL remaining 0546 Desi design waves —
  Wave 2 remainder (C4 zoom/fit easing, C5 neighborhood glow, D3 empty states, B2 difficulty
  tooltips) AND Wave 3 (E1 CurriculumJourney motion-only scrollytelling, B3 key-point peek,
  C3 grid stagger, G2 node-modal menu) — plus WL-P2-65/66/67 and D-4 cooperative touch, plus
  the GA flip surface (Desi AUD2-4: naming unification — three names for one destination —
  de-beta chip/note removal, and entry-affordance upgrade; links from the Library index and
  Curriculum page EXIST — the SESSION_0578 "nothing links to the graph" claim was corrected by
  the Desi audit); **(2)** member progress
  tracking is FLIP-BLOCKING — wire the existing zero-write-path `TechniqueProgress` model
  (oRPC write layer + detail-page control + dashboard); **(3)** graph content scope AMENDED to
  **grappling arts only — BJJ + judo + wrestling takedowns; no striking, no weapons** (supersedes
  the epic's BJJ-only line for the technique system; the ratifying ADR is a **blocking
  merge-gate on Lane C/SESSION_0579** — Giddy close condition). E2 Combo Flows stays post-GA
  (sequenced after E1).
- **Tracked children (the three fan-out lanes, planned SESSION_0578):**
  - **Design axis — LANE A** (`session-0581-technique-ga-design`, lands LAST, owns the flip):
    Wave 2 remainder + Wave 3 + WL-P2-65/66/67 + D-4 + SESSION_0578 Desi hallmark-audit items +
    multi-art layout expansion + entry wiring + feature-log flip. Multi-session lane — continuation
    tasks live in this row and the wiring-ledger, per the fan-out recipe.
  - **Schema-wiring axis — LANE B** (`session-0580-technique-progress`): `TechniqueProgress`
    write path (oRPC per the FULL-oRPC direction), detail-page tracking control, dashboard wiring;
    graph-overlay display deferred post-GA (Lane A file ownership).
  - **Monorepo-harvest axis — LANE C** (`session-0579-grappling-data`): grappling-arts data
    adoption — `bjj.js` 80-technique trunk (SALVAGE — ground-truthed SESSION_0579; the "98" counted section objects) + `bjjCanvasData.js` lineage (already the
    app JSON's ancestor) + Kodokan judo 20-throws seed and `judo.js` (ADAPT — grappling now in
    scope) via a shown-before-run TS transform; backfill the ~14 dark graph slugs; **wrestling
    takedowns = named content gap (no dataset exists in the monorepo — authoring task)**;
    PII exports and striking/weapons data REJECTED. Small hand-authored migration allowed
    (e.g. `nativeName`/`aliases`) — NEVER `migrate dev`.
- **Lane:** BJJ→grappling techniques / curriculum / schema wiring. **Extends:** G-013 (the design
  waves fold into Lane A; G-013 remains the design-epic tracker). **Depends on:** SESSION_0578
  plan + prompts (`docs/protocols/fan-out-session-recipe.md`). Merge order **C → B → A**; the
  flip is the last commit of Lane A.
- **Why:** Brian pinned GA promotion as a proper goal: the graph is the technique system's front
  door, curriculum at real scale needs the harvested trunk data, and progress tracking is the
  member-facing value that justifies GA. (SESSION_0578 grill, 4 forks resolved.)
- **Progress (SESSION_0582 sweep — three lanes LANDED, merged C→B→A-S1):**
  **Lane C DONE** ([`SESSION_0579`](../../sprints/SESSION_0579.md)): judo 20/20 Kodokan adopted
  (`nativeName`/`aliases` additive migration), AABB guard, ADR 0050 (grappling scope — the
  blocking merge-gate) ratified. Ground-truth corrections: BJJ trunk is **80** techniques (the
  "98" counted section objects); the "~14 dark slugs" were already backfilled pre-lane. Wrestling
  authoring gap stays open (child, P3 — no dataset). **Lane B DONE**
  ([`SESSION_0580`](../../sprints/SESSION_0580.md)): oRPC `techniques` router, own-user
  upsert/clear runtime-proven, AUD2-5 channel = leading glyph via shared
  `components/common/technique-progress-status.tsx` (Lane A consumes this SAME module for
  cards/graph), dashboard "My progress", no-leak test green. **Lane A S1 DONE**
  ([`SESSION_0581`](../../sprints/SESSION_0581.md)): C4 eased zoom-to-fit (+never-during-drag,
  CSS motion-reduce), WL-P2-67 resolved (375px fit = 61/61 nodes, zoom 0.160), D-4 cooperative
  touch (pan-y + 2-finger pinch), AUD2-3 mobile toolbar, AUD2-8 dead-token fix, AUD2-9 PNG
  demote — computed-style/live proofs in the session file. **Lane A S2 DONE**
  ([`SESSION_0583`](../../sprints/SESSION_0583.md), 0587 sweep): C5 neighborhood glow —
  **redesigned selected→hover-driven** (selected-glow proved invisible behind the dialog's
  backdrop blur; judgment call flagged for Desi/operator confirm, not silently substituted) ·
  D3 empty states (graph type-filter + AUD2-7 curriculum topic-filter EmptyList + "Show all
  topics" reset) · B2 difficulty-term tooltips (glossary DTO in `node-tooltip.ts`, no-leak
  re-proven) · WL-P2-65 resolved (real cause: html2canvas × `-webkit-line-clamp`; real export
  bytes ×3) · WL-P2-66 resolved (`motion-reduce:animate-none!`, computed-style proof ×2
  surfaces). **Open:** Lane A S3 (E1/B3/C3/G2) + S4 (multi-art + AUD2-4 flip — the GA flip),
  wrestling authoring, graph progress overlay (post-GA).

### G-023 — WORKFLOW_6.0: session-recipe OS + SOT_Cookbook + brand SOT cards

- **Status:** in-progress — P1 (operator-ratified direction, SESSION_0574 extended grill;
  Sessions A+B core landed via SESSION_0584, SOT-dashboard slice 1 via SESSION_0585 — 0587 sweep)
- **Est:** 4 sessions (2 spent: 0584 governance + 0585 dashboard) — remaining: C small-code ·
  D epic-plan · brand SOT cards (B remainder)
- **Objective:** crown the lived orchestrator/fan-out/review-wave pattern as the governing OS.
  Ratified forks (operator MC grill, 8 volleys): **6.0 = thin ~150-line pointer-first spine**,
  WORKFLOW_5.0 kept-superseded (its rituals read is DEAD canon — opening.md step 2 still mandates
  5.0's archived calendar + `wt-*` map) · **SOT_Cookbook.md** = new 1-screen router at
  `docs/protocols/`; agent-systems-map §1 router table MOVES into it, map demotes to concept;
  old `session-ops-cookbook.md` renamed `session-command-log.md` · **4 recipe cards** in
  `docs/protocols/recipes/` (orchestrator · epic-plan · lane · review-wave; vault 90_Templates
  format generalized: persona pack + load-set + overlays + minimum-output contract) ·
  **additive `recipe:` frontmatter key** on staged stubs = hydration at adopt · **brand SOT
  cards** = conformed `docs/product/<brand>/README.md` "SOT — <BRAND>" pointer cards (no new
  SOT_* family; Status·Goals·Load-set·Canonical·Maps, D-023 pointer law) · **lane facet +
  `--lane=` filter** on the universal ledgers (parse the `Lane:` bullet in `ledger-parse.ts`;
  views are filters, never files; vault MMB IDs stay vault-side per ADR 0048) · **epic wiring** =
  G-row `Est:` + children as SoT, wayfinder GitHub maps/tickets per epic (#228/#237 pattern),
  reservation branches + `recipe: lane` stubs for lane-1 only · **merge-wave =
  `docs/protocols/recipes/merge-wave.md` standalone card; `giddy-merge-strategy.md` RETIRES into
  it** (supersede-banner; G0–G4 gates absorbed, not lost — operator override of the
  extend-in-place recommendation).
- **Tracked children:**
  - Session A (docs-only, free push): WORKFLOW_6.0.md spine · 5.0 supersede banner · rituals
    repointed (kills the dead-canon read) · ~15 referrer conform · merge-wave.md card +
    giddy-merge-strategy retirement · ADR 0050.
  - Session B (docs-only): SOT_Cookbook.md + router move + map demotion · 4 recipe cards +
    `recipe:` key in SESSION_TEMPLATE · 5 brand SOT cards · session-ops-cookbook rename.
  - Session C (small code, apps/web gates): `lane` facet in `ledger-parse.ts` + `--lane=` in
    `ledger-backlog.ts` + `Est:` grammar + open-row backfill + parser unit test.
  - Session D: /pp epic-planning session — R2's first firing on the new machinery
    (features → epics → Est + lanes + wayfinder tickets + lane-1 stubs).
- **Vault constellation (direction, own small vault-ops session — NOT in A–C):** brand-prefixed
  vault names ratified in principle (MMB_Vault · BBL_Vault · RDD_Vault · BMA_Vault · USA_Vault);
  rename = folder + obsidian.json registry + separate-git-dir pointer with Obsidian closed
  (FS-0033: check registries first; iCloud mid-sync renames are hazardous). Only MMB exists —
  others created on first real session (D-012 needs-phone router), names reserved now. **SOT
  cards live in the REPO** (agents in worktrees/cloud lack vault access; ADR 0048 privacy);
  vault dashboards may link the repo card, never the reverse.
- **Lane:** repo (platform governance). **Depends on:** ADR 0049 (staged stubs, lane enum,
  reservations) · `fan-out-session-recipe.md` · SESSION_0574 (lived orchestrator + wave) ·
  SESSION_0578 (lived epic-plan + lane prompts). Research reports: Petey/Giddy subagents,
  SESSION_0574 extended chat.
- **Why:** the pattern already runs the repo by hand (0574/0577/0578 proved it in one night);
  6.0 makes it law the read-path consumes, and the rituals currently point at a corpse.
- **Progress (0587 sweep):** **Session A + B core DONE via
  [`SESSION_0584`](../../sprints/SESSION_0584.md)** (operator full-scope election folded A+B+
  personas into one lane): WORKFLOW_6.0 spine · 5.0 supersede banner · rituals repointed off
  the dead 5.0 canon (opening step 1d + step 2 rewrite; closing §6a evidence-artifact policy +
  bow-out-gates Gate 12c dry-run-proven) · SOT_Cookbook + §1 router move + map demotion ·
  **7** recipe cards (the planned 4 + merge-wave [giddy-merge-strategy retired, G0–G4 absorbed]
  + PM_Planning_Lane + AM_Coffee_Merge_Review) · `recipe:` key in SESSION_TEMPLATE ·
  session-ops-cookbook → session-command-log rename · 6 personas canonical in
  `.claude/agents/` with Allowed/never sections (docs/agents = pointer stubs) ·
  seq-research-recommend skill · D-049 fixed. **SOT-dashboard slice 1 DONE via
  [`SESSION_0585`](../../sprints/SESSION_0585.md):** `state-of-project-parse` lib (30 tests) +
  additive `ledger-backlog --json` sessions/goals fields (text output byte-stable) +
  `state-of-project.ts` renderer + `state-of-project-projection.md` protocol; slice 2
  (`/app/state`) open. **Remaining:** Session C (lane facet + `--lane=` — read 0585's additive
  `--json` fields before extending `ledger-backlog.ts`) · Session D (/pp epic-plan dogfood) ·
  brand SOT cards (B remainder, explicitly not built per dispatch).
- **Progress (SESSION_0589):** two children staged as their own plan-me sessions — **slice-2
  State-of-Dojo `/app` admin landing** (PL-003 + PL-006 token-cost) → `session-0593-sotd-admin-
  landing-plan`; **vault consolidation + SOT-per-brand-vaults-as-repos + per-brand tooling**
  (PL-008) → `session-0595-vault-consolidation-plan`. ADR 0051 (PL-004) ratified the dashboard's
  unit = **brand tabs** under the RDD umbrella.

### G-024 — Feature + feedback widgets for all sites (idea-intake program)

- **Status:** in-progress — **L2 + L3 SHIPPED to prod (SESSION_0597):** L2/0591 ledger-wiring +
  L3/0592 admins-only `feature-widget`→`PlanningIntake` triage, both on `main`, BBL prod deploy Ready.
  **Remaining:** MMB mount (kernel extraction), phase-2 changelog widget, and a Desi UX pass on the
  0592 triage table (queued SESSION_0592). Plan ran 0589; was plan-first (0587).
- **Est:** 2 lanes (L2 wiring + L3 widget) — **both done**; MMB mount = fast-follow after kernel extraction.
- **Objective:** ONE platform intake module (RDD kernel law — module × per-product mount, not
  forks). Phase 1: **admins-only "feature-widget"** on the MMB and BBL admin surfaces — an
  idea-dump for Brian / Michael (MMB owner, admin) / Tony (BBL admin): ideas, images, notes,
  feature needs, bug fixes, design changes — feeding the
  [planning-ledger](planning-ledger.md) intake flow. Phase 2: feature-widget on the changelog
  feature page for all logged-in users. Eventually all sites.
- **What exists:** single `feedback-widget.tsx` on the BBL `(web)` layout
  (engagement-triggered toast; `Report` type `Feedback` persistence + admin email via
  `reportFeedback`; config `apps/web/config/feedback.ts`; e2e spec). No separate
  feature-widget component. Prior row: `petey-plan-0419` §5.4 (brand/account-aware feedback).
- **Tracked children (staged SESSION_0589):**
  - **L3** `session-0592-feature-widget` — NEW `feature-widget.tsx` (admins-only idea-dump; reuse
    uploader/rate-limit/persistence seam, NOT a feedback-widget overload); **DB inbox → admin triage
    → session-time promote to PL rows**; **BBL `/app` admin first**, structured for `packages/ui-kit`
    extraction; MMB fast-follow.
  - **L2** `session-0591-ledger-wiring` — wire `PL` + `RLL`/`YLL`/`GPTLL` into `ledger-backlog.ts` +
    `deferral-guard.ts:49` + closing.md §6.7 (shared with PL-002).
- **Lane:** rdd (platform module; first mounts bbl, then mmb).

### G-025 — GLL_Epic: Giddy-Lessons / Kaizen / /teach code-lessons system

- **Status:** open — queued, **plan-first** (operator directive SESSION_0589; own multi-session epic:
  grill → plan → build → code-review). Captured as [PL-007](planning-ledger.md).
- **Est:** unplanned (the `session-0594-gll-epic-plan` plan session sets it).
- **Objective:** turn session lessons from token-burn into a durable, browsable, learn-it-yourself
  system so the operator can pick up any work (usage-hit or by choice). Pieces (plan-session grills,
  not pre-resolved): closing **`/refine-recipe` binary** (make Kaizen reflections durable) · **Kaizen
  + Giddy-Lessons as cards** on State-of-Dojo (swipe/search on phone; click into site/vault pages) ·
  **`/teach` skill** at session end (durable how-to-code-it-myself + why + alternatives + token cost +
  time est + git-replay merge log) → `human-code-runbook.md` pointed entries · **`/Code-Lessons`
  skill + Code-Lessons_Ledger** (leaner Giddy lessons; hook-trigger groups ≥N into a Giddy-Lesson
  entry).
- **Cross-cuts:** rituals (closing), skills, `human-code-runbook.md`, **State-of-Dojo surface (G-023
  / PL-003 — cards render there)**, vault-as-site-mirror (PL-008).
- **Tracked children:** `session-0594-gll-epic-plan` (own `/pp` plan → children + fan-out).
- **Lane:** rdd (platform governance + agent-learning system).

### G-026 — /app admin-surface consolidation (landing shell + nav + quick-actions + AdminCollection sweep)

- **Status:** in-progress — P1 (planned SESSION_0599; the **interactive/WRITE side** of the `/app`
  admin surface — the READ side is G-023 slice-2 / SESSION_0593)
- **Est:** ~6 workstreams (1 spent: 0599 plan) — WS-1 shell · WS-2 nav · WS-3 mount-0593-panels
  (serial) · WS-4 conformance sweep (5 batches) · WS-5 route hygiene · WS-6 ui-kit extraction (deferred).
- **Objective:** consolidate the `/app` admin surface. Promote the beta **Command Deck**
  (`app/app/beta/command-deck`) to the `/app` landing as the grouped launcher over the **existing**
  7-group `ADMIN_SECTION_GROUPS` SOT (`config/admin-sections.ts`, SESSION_0501/FI-021 — evolve, never
  fork a parallel taxonomy); build a `DashboardLanding` shell (slot composition, ADR 0045 D4 — the
  landing is a COMPOSITION, not an AdminCollection) hosting a **quick-action grid + short carousel**
  (`carousel.tsx`, `link`/`trigger` discriminated-union action contract), a compact loop-board embed,
  and MOUNTED SESSION_0593 read-projection panels behind a **frozen import-path contract**; a
  **collapsible desktop sidebar** accordion; and finish the **ADR 0045 conformance sweep** — ~19
  hand-rolled kit tables in 5 batches (D5's "~29 pages" is **stale**: media/organizations/claims are
  already conformed).
- **Boundary (SESSION_0593 sibling — no landing tug-of-war):** 0593 owns the read-projection framework
  + panels + the mount contract; G-026 owns the shell + nav + quick-actions + route consolidation and
  **mounts** 0593's panels. **Re-scopes PL-003 point 5** (landing composition → 0599). The
  shell/quick-action pattern is structured for `packages/ui-kit` extraction so the RDD deploy
  (SESSION_0598) reuses it with its own action set (deferred WS-6, abstraction-ladder — one consumer
  today).
- **Tracked children:**
  - **WS-1** `session-0600-admin-landing-shell` (staged `recipe: lane` stub): Command Deck promotion +
    `DashboardLanding` shell + quick-action grid+carousel + landing hierarchy (actions/attention above
    fold, metrics demoted, first-run empty state) + loop-board compact embed. AdminTODOist = the embed
    (NO revived personal-todo surface — reviving re-opens ratified G-003).
  - **WS-2** nav rationalization: collapsible sidebar accordion (`components/app/nav.tsx` →
    groups collapsed except active) + mobile routes through `/app/sections`; keep `BottomNav` member
    chrome + `Mab` create-only (no third create affordance). Parallel-safe with WS-1 (disjoint files).
  - **WS-3** mount 0593 panels — **SERIAL**, gated on 0593 freezing the panel import-path + prop
    signature (proposed: `components/app/state-of-dojo/{state,component-catalog,card-catalog,cookbook}-panel.tsx`,
    self-fetching async, placement-agnostic, optional `{ compact? }`).
  - **WS-4** conformance sweep (sequential, cheapest-first): **A** categories/tags/age-groups/skill-levels
    (+ the merges: categories+tags→Taxonomy tabs, age-groups+skill-levels→Curriculum-lookups) · **B**
    content/courses/programs/certificates · **C** subscriptions/subscription-tiers/pricing-plans/entitlements/memberships
    (Stripe-adjacent — Doug/Desi review) · **D** roles/invites/leads/reports · **E** tournaments (own
    table + roles/rule-sets subdirs — biggest) / lineage index grid / merch-orders / privacy-requests
    (each own lane).
  - **WS-5** route hygiene: retire `/app/beta` **after** Command Deck promotion · `/app/email`
    demote to a Growth card (Resend pointer, no persistence) · `/app/profile` relocate off `/app`
    (duplicate mount of `(web)/dashboard/*`) · `/app/events` add missing index.
  - **WS-6** `packages/ui-kit` extraction — Carousel + QuickAction contract (inline arrow buttons,
    token CSS — ui-kit has no Button/cx); **deferred** until SESSION_0598/RDD proves the second consumer.
- **Lane:** repo. **Depends on:** ADR 0045 (frame) · ADR 0051 (kernel→brand→app) · SESSION_0501/FI-021
  (`ADMIN_SECTION_GROUPS`) · G-003 (loop-board) · SESSION_0593 (mount contract). **Research:**
  Petey/Giddy/Desi subagents (SESSION_0599).
- **Why:** the `/app` admin surface is the operator's daily console; ADR 0045 D5's conformance sweep
  was never given a goal row, and the landing/nav/quick-action shell is the reusable kernel pattern the
  RDD deploy needs. Consolidation over sprawl — "what would Apple do."

### G-027 — RDD umbrella app deploy (ronindojodesign.com) + new-brand onboarding recipe family

- **Status:** in-progress — P1 (planned SESSION_0598). **Lane:** rdd.
- **Objective:** stand up `apps/rdd` (own DB/deploy/email/env/CI) + generalize the reusable new-brand
  onboarding recipe family (RDD = exerciser #1).
- **Children:** `session-0601-rdd-scaffold` (Slice A) → B1/B2/B3/C, staged one at a time.
- **Cross-refs:** `new-brand-*` recipe cards; hosts the G-023 State surface; reuses the G-026 admin
  shell (deferred WS-6 Carousel/QuickAction ui-kit extraction — RDD = the second consumer); ADR
  0034/0038/0051; PL-005 + G-018 skin. (Minted at SESSION_0598 — G-026 was already taken by 0599.)

### G-028 — Branded client-onboarding artifacts + interactive forms (RDD agency)

- **Status:** proposed — own plan session (operator directive SESSION_0598). **Lane:** rdd.
- **Objective:** brand + make interactive forms of the RDD onboarding templates (Initial Client Meeting /
  MSA / NDA) + future ones, reusable across brands/clients; reuse-first (ONE uploader seam, existing form
  primitives, existing entitlement gating — no 5th authz system).
- **Origin:** operator uploads under `docs/product/rdd/assets/`. **Child:** `session-0602-rdd-onboarding-forms-plan`.
- **Cross-refs:** `new-brand-interview-client.md` + `new-brand-intake.md`; PL-011.
