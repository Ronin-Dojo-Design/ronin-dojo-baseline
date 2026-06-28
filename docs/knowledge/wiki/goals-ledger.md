---
title: Goals Ledger
slug: goals-ledger
type: reference
status: active
created: 2026-06-27
updated: 2026-06-28
last_agent: claude-session-0460
pairs_with:
  - docs/protocols/loop-of-loops-ledger-driven-sessions.md
  - docs/rituals/opening.md
  - docs/knowledge/wiki/files/loop-board.md
backlinks:
  - docs/knowledge/wiki/index.md
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

- **Status:** open — P1
- **Objective:** N1 — swap the verified instructor/school creatable-combobox into the post-claim
  profile-enhancement wizard. N2 — member-dashboard ports (belt-by-belt edit cards, per-member privacy
  toggles, a dedicated Billing tab). Read-and-translate, no Playwright port.
- **Lane:** lineage / member dashboard. **Unblocks:** G-001 (polished onboarding before Brian's real send).
- **Why:** the post-claim surface is where a new claimant lands — it must feel finished.

### G-005 — m-card consolidation: build `kind="generic"`

- **Status:** open — P2
- **Objective:** add the `generic` m-card kind to unlock the highest-leverage consolidation —
  FacetResultCard (orgs/trees), CourseCard, PostCard, MerchCard, TournamentCard onto the one card.
- **Lane:** ui-kit / consistency. **Why:** closes the 5-card / 4-shape parity gap; "one card" everywhere.

### G-006 — Per-brand PRD/story completion tracking

- **Status:** open — P2
- **Objective:** convert each brand's `STORIES.md` (BBL / baseline / mammoth) to `- [ ]`/`- [x]`
  checklists (+ PRD acceptance criteria) and compute a per-brand completion %; surface on the loop-board.
- **Lane:** product / governance. **Why:** visible progress per brand, aligned with product separation.
