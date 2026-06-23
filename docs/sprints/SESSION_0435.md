---
title: "SESSION 0435 — FI-009 BJJ technique-graph + curriculum: verify already-landed feature + prod import"
slug: session-0435
type: session--open
status: closed
created: 2026-06-22
updated: 2026-06-23
last_agent: claude-session-0435
sprint: S43
pairs_with:
  - docs/sprints/SESSION_0434.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0435 — FI-009 BJJ technique-graph + curriculum: verify already-landed feature + prod import

## Date

2026-06-22

## Operator

Brian + claude-session-0435

## Goal

FI-009 was briefed as a fresh re-derivation (harvest the closed PR #157 / `codex/technique-graph-curriculum`
branch, port + de-thread `getRequestBrand`, re-apply nav/seo). **Bow-in discovery: the entire feature is
already built, merged on `main`, and de-threaded** — landed via `0be7eacc feat(bjj): port TechniqueGraph +
Curriculum Library (BJJ) [codex]` (2026-06-19) + `e2cdeb9c` / #154 getRequestBrand de-thread (2026-06-21).
The 4 core files on `main` are **byte-identical** to the reference branch. The local DB (`ronindojo_prodsnap`)
is already imported and both routes return 200 with real content. So the harvest is moot.

Operator direction (grilled at bow-in): **verify + import to prod now**. This session: (1) browser-verify
both pages render with real data + screenshot; (2) run the idempotent `import-bbl-bjj-curriculum.ts` against
**prod Neon** (before/after counts, explicit go before write) so the feature is reveal-ready on
blackbeltlegacy.com; (3) resolve FI-009 in POST_LAUNCH_SOT. (Pages stay behind `BBL_COUNTDOWN` until reveal —
the import only makes them reveal-ready, it does not expose them.)

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0434.md` (FI-008 local verify + merge; FI-007 cover/video render).
  Note: `SESSION_0434` already existed + committed (`443c83b9`) when this session opened — the bow-in brief
  said 0433 was highest. This session is **0435** (avoided the number collision).
- Carryover: 0434 closed FI-007/FI-008. The bow-in named FI-009 as the next lane assuming it was unbuilt.

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: clean
- Current HEAD at bow-in: `8e927949`

### Dirstarter alignment

| Field | Answer |
| --- | --- |
| Dirstarter baseline touched | Prisma (data import only — no schema change); Content (Course/Technique read models) |
| Extension or replacement | Extension: feature already merged; this session imports data + verifies render |
| Why justified | Pages 404 without imported data; prod is migrate-only (not seeded) so a manual import is required |
| Risk if bypassed | Feature stays invisible on prod after reveal (curriculum/graph 404) |

Live docs checked during planning: Prisma (idempotent upsert import), not applicable for schema.

### Graphify check

- Graphify not run; the bow-in brief named exact files. Direct inspection confirmed all FI-009 files
  already present on `main` (git log + byte-identical diff vs `origin/codex/technique-graph-curriculum`).

### Grill outcome

1. **The lane is already done on `main`** — not a rebuild. Confirmed via: `git merge-base --is-ancestor 0be7eacc main`
   (true), 0-line diff of the 4 core files vs the reference branch, `getRequestBrand` fully gone (pages use
   `Brand.BBL`), data JSONs + import script + `html2canvas` + nav/seo/footer/header/brand-features all present.
2. **Direction:** verify + import to prod now (operator pick over verify-only / QA-first / rebuild).
3. **Single-brand confirmed:** pages call `Brand.BBL` directly; no `getRequestBrand`.
4. **Data freshness:** the 2 JSONs are the merged source already imported locally; no refresh requested.

### Drift logged

- None new. (POST_LAUNCH_SOT FI-009 was stale at `triaged` despite the code being merged — resolved this session.)

## Petey plan

### Goal

Prove the already-landed FI-009 renders locally, push its data to prod Neon idempotently, and resolve FI-009.

### Tasks

#### SESSION_0435_TASK_01 — Browser-verify both pages render with real data (local)

- **Agent:** Doug
- **What:** dev-login, load `/curriculum` + `/techniques/graph` on :3000, confirm real content renders, screenshot.
- **Steps:** dev-login → navigate both routes → confirm curriculum levels + graph nodes render → screenshot each.
- **Done means:** two screenshots proving render; no console errors.
- **Depends on:** nothing

#### SESSION_0435_TASK_02 — Prod Neon import (gated)

- **Agent:** Cody
- **What:** run `import-bbl-bjj-curriculum.ts` against prod Neon (idempotent upsert), with before/after counts.
- **Steps:** obtain prod `DATABASE_URL` (vercel env pull / operator) → capture before counts → **explicit go** →
  run import → capture after counts → confirm 5 courses / 61 techniques / 75 prereqs / 81 links present.
- **Done means:** prod has the BJJ curriculum + graph data; BBL org name/type unchanged; counts match local.
- **Depends on:** SESSION_0435_TASK_01

#### SESSION_0435_TASK_03 — Resolve FI-009 in POST_LAUNCH_SOT

- **Agent:** Cody
- **What:** flip FI-009 `triaged` → resolved with the merge SHAs + prod-import evidence.
- **Done means:** POST_LAUNCH_SOT FI-009 row updated; `updated` date bumped.
- **Depends on:** SESSION_0435_TASK_02

### Parallelism

Sequential: verify (01) → prod import (02) → ledger (03).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| SESSION_0435_TASK_01 | Doug | browser verification |
| SESSION_0435_TASK_02 | Cody | data import (gated prod write) |
| SESSION_0435_TASK_03 | Cody | ledger update |

### Open decisions

- Prod `DATABASE_URL` source (vercel env pull vs operator-provided — creds were rotated).

### Risks

- `ensureBblOrg` upsert `update` overwrites BBL org `name`/`type` — capture before-state to confirm no clobber.
- `ensureRankId` returns null if prod's BJJ rank system is unseeded → courses get null `rankId` (tolerated by query).

### Scope guard

- Do NOT rebuild/re-derive the feature (already merged, byte-identical to reference).
- Do NOT flip `BBL_COUNTDOWN` (reveal is a separate operator decision).
- Do NOT touch the feature code — import + verify + ledger only.
- No prod write without explicit "go" + before/after counts.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0435_TASK_01 | landed | Browser-verified `/curriculum` (5 levels + items) + `/techniques/graph` (61 techniques / 75 links, full graph + PNG export) render with real prodsnap data; zero console errors; screenshots captured |
| SESSION_0435_TASK_02 | landed | Prod Neon import (direct endpoint, operator-provided): before-state confirmed 0 BJJ rows + no `black-belt-legacy` org; idempotent import = all-creates (+1 org, 5 courses, 80 items, 61 techniques, 75 prereqs, 81 links); after-state matches local exactly; live `blackbeltlegacy.com/curriculum` + `/techniques/graph` both 200 with content |
| SESSION_0435_TASK_03 | landed | FI-009 → resolved (LIVE on prod) in POST_LAUNCH_SOT; `last_agent` bumped to 0435 |
| SESSION_0435_TASK_04 | landed | Graph node cards made opaque (`bg-primary/10`→`bg-card`, `bg-destructive/10`→`bg-card`) so the `opacity-55` connector edges no longer bleed through the cards (operator-requested visual fix); re-screenshot confirmed; oxfmt + oxlint clean |

## What landed

- **Discovery (the main outcome):** FI-009 was briefed as a fresh re-derivation, but the entire feature
  was **already built + merged on `main`** before this lane — `0be7eacc` (port) + `e2cdeb9c`/#154
  (getRequestBrand de-thread). `main` is **byte-identical** to the reference branch
  `codex/technique-graph-curriculum`; data JSONs + import script + `html2canvas` + nav/seo/footer/header/
  brand-features all present; pages use `Brand.BBL` directly. No rebuild needed — the harvest was moot.
- **Local verification:** both pages render with real prodsnap data, zero console errors (screenshots).
- **Graph card opacity fix:** node cards were `bg-primary/10` / `bg-destructive/10` (~90% transparent) so
  the `opacity-55` connector edges bled through. Made them `bg-card` (opaque) — lines now tuck cleanly
  behind, category identity preserved via border + text color (matches how `transition`/`counter` already work).
- **Prod Neon import (operator-gated):** captured read-only before-state (0 BJJ rows, no `black-belt-legacy`
  org, but bjj discipline + BJJ rank system present), got explicit go, ran the idempotent import against the
  direct Neon endpoint. All-creates: **+1 org, 5 courses, 80 curriculum items, 61 techniques, 75 prereqs,
  81 links**. After-state matches local exactly.
- **Live on prod:** operator flipped `BBL_COUNTDOWN` off mid-session; `blackbeltlegacy.com/curriculum` +
  `/techniques/graph` both confirmed 200 with real content.
- **FI-009 resolved** in POST_LAUNCH_SOT (LIVE on prod).

## Decisions resolved

- FI-009 is a **verify + ship**, not a rebuild — the feature already merged; re-deriving would duplicate
  byte-identical, working, de-threaded code (operator chose "verify + import to prod now").
- Prod connection lives only in a **gitignored `.env.production.local`**, sourced explicitly + inline for
  the one import command (never in `.env.local`, so the running dev server stays on local prodsnap). File
  **deleted** after the import — no prod credential left on disk.
- Graph cards made **opaque** (not a z-index change) — the bleed-through was card transparency, not edge ordering.
- Session is **0435**, not 0434 — `SESSION_0434` was already committed (`443c83b9`, FI-007). Avoided the collision.

## Files touched

| File | Change |
| --- | --- |
| `apps/web/components/web/techniques/technique-graph.tsx` | Node cards `bg-*/10` → `bg-card` (opaque) so connector edges don't bleed through |
| `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` | FI-009 → resolved (LIVE on prod); `last_agent` → 0435 |
| `docs/sprints/SESSION_0435.md` | This file |
| `apps/web/prisma/import-bbl-bjj-curriculum.ts` | (no change) — run as-is against prod Neon |

## Verification

| Command / smoke | Result |
| --- | --- |
| Local browser `/curriculum` + `/techniques/graph` (chrome-devtools MCP) | both render real data; **0 console errors/warnings**; screenshots captured |
| Prod before-state (read-only) | 0 bjj-level courses, 0 techniques/prereqs/links, no `black-belt-legacy` org; bjj discipline + BJJ rank system present |
| Prod import run | `[bbl-bjj] courses=5, curriculumItems=80, techniques=61, prerequisites=75` |
| Prod after-state | org created (`BBL · black-belt-legacy · DOJO`); 5 courses / 80 items / 61 techniques / 75 prereqs / 81 links; page-query join returns 5 |
| Live `blackbeltlegacy.com/curriculum` | HTTP 200, "BJJ Curriculum" + 5 bjj-levels |
| Live `blackbeltlegacy.com/techniques/graph` | HTTP 200, "BJJ Technique Graph" + graph content |
| `bun run typecheck` (`next typegen && tsc --noEmit`) | clean — no errors |
| `oxfmt` + `oxlint` (technique-graph.tsx) | clean |
| `bun run wiki:lint` | 0 errors (15 pre-existing warnings in `SESSION_VIDEO_R001.md`, not mine) |
| Full unit suite | Deferred to CI — card change is a presentational className edit; no test covers it (consistent with SESSION_0434) |

## Open decisions / blockers

- **Card fix not yet deployed** — the solid-card change is committed/pushed at close; until the deploy lands,
  the live graph still shows the translucent cards (data is correct either way).
- **html2canvas PNG export on prod** — present in code + renders the button locally; not exercised on the live
  domain this session.
- **helio-gracie TREE_SEEDS membership** — still deferred (from SESSION_0433/0434), unrelated to FI-009.

## Next session

### Goal

Clear remaining BBL tails: add helio-gracie to `TREE_SEEDS` (deferred since 0433), and consider the FI-009
follow-ups (exercise the graph PNG export on the live domain; optional faint opaque tint on graph cards if the
operator wants more color identity than borders alone).

### First task

Add helio-gracie tree membership to `TREE_SEEDS` in `seed-baseline-lineage.ts`, then dry-run on a throwaway
prodsnap copy to confirm the membership materializes without disturbing the corrected roster.

## Review log

### SESSION_0435_REVIEW_01 — FI-009 verify + prod import

- **Reviewed tasks:** SESSION_0435_TASK_01–04
- **Dirstarter docs check:** Prisma — data import via idempotent upserts; no schema change. Not applicable for UI primitives.
- **Verdict:** The highest-value act was **not building** — discovery proved the feature was already merged and
  byte-identical to the reference, so the session pivoted to verify + ship instead of duplicating it. The prod
  import was gated correctly (read-only before-state shown, explicit go, idempotent all-creates, after-state
  matched, credential deleted). The card fix is a minimal, correct root-cause change (transparency, not z-order).
  Everything was verified on the live domain, not just locally.
- **Score:** 9/10 (deducted: full unit suite deferred to CI; PNG export not exercised on live).
- **Follow-up:** confirm deploy turns the live graph cards solid; helio TREE_SEEDS next session.

## Hostile close review

- **Giddy:** pass — every claim is backed (before/after prod counts, live-domain HTTP 200 + markers, screenshots,
  gate outputs). Honest about what wasn't tested (full suite, live PNG export) and that the card fix isn't live until deploy.
- **Doug:** pass — `tsc` clean; the only code change is a presentational className (opaque bg), null/logic-safe, no
  `"use server"` / query / schema change; import script run unchanged (already merged + reviewed). Idempotent upserts verified all-creates.
- **Desi:** pass — solid cards improve legibility (edges no longer cross the card face) while keeping category color
  via border + text; consistent with the existing `transition`/`counter` opaque treatment. No new card/detail shell.
- **Kaizen aggregate:** 9/10 — disciplined "discover before build," correctly-gated prod write, clean minimal UI fix.

## ADR / ubiquitous-language check

- ADR update: not required. No new architectural decision — verifying + importing an already-merged feature.
- Ubiquitous language: no new terms. "Technique graph" / "BJJ curriculum" already exist in the schema + ledger.

## Reflections

**Discover before you build — the brief can be stale.** The lane was written to harvest + rebuild FI-009 from a
closed PR, but a *different* codex effort had already merged the exact same feature (byte-identical to the reference)
three days earlier, and a separate session had already imported the data locally. Five minutes of `git log` +
diff + a DB count turned a multi-hour rebuild into a verify-and-ship. The operator-drives memory
([operator-drives-nothing-canonical]) is exactly this: surface the real repo state, don't autopilot the brief.

**A fresh prod snapshot is a free dry-run — but it's not the prod write.** `ronindojo_prodsnap` was a same-day dump
of prod that already had the import applied, which proved the import is safe + idempotent against current prod-shaped
data. But the BJJ rows were locally injected (createdAt=today), so prod itself still had zero — the snapshot
de-risks the write without substituting for it. Reading `createdAt` was what distinguished "in prod" from "in my copy."

**The cheapest visual fix is the root cause, not a workaround.** "Lines under the cards" reads like a z-index bug, but
the edges were already behind — they showed through because the cards were 90% transparent. One className (`/10` →
opaque) fixed it; no z-index, no overlay, no new component.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0435 full frontmatter; POST_LAUNCH_SOT `updated`/`last_agent` bumped |
| Backlinks/index sweep | SESSION_0435 `backlinks: wiki/index.md`; `pairs_with` 0434; MEMORY.md pointer added |
| Wiki lint | `bun run wiki:lint` → 0 errors (15 pre-existing warnings, not mine) |
| Kaizen reflection | Reflections section present (3 lessons) |
| Hostile close review | SESSION_0435_REVIEW_01; Giddy/Doug/Desi pass |
| Review & Recommend | Next session goal written (helio TREE_SEEDS + FI-009 follow-ups) |
| Memory sweep | Updated [bbl-launch-is-the-focus] (FI-009 LIVE on prod) — see close report |
| Custom components | None new — reused existing `TechniqueGraph` + chrome; one className edit |
| Finding router | No new WL/D/FS/incident — feature already merged; data gap closed by import |
| Git hygiene | One commit on `main`; FS-0024 guard run; `.session-tmp/` screenshots removed |
| Graphify update | `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` at close |
