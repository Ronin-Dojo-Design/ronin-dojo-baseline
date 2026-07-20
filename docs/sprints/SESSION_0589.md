---
title: "SESSION 0589 — planning session: widgets + link-ledgers + State-of-Dojo admin landing + taxonomy ADR"
slug: session-0589
type: session--plan
status: closed
created: 2026-07-20
updated: 2026-07-20
last_agent: claude-session-0589
next_session: session-0590
sprint: S12
lane: repo
recipe: epic-plan
goal_ids: [G-023, G-024]
tickets: []
pairs_with:
  - docs/sprints/SESSION_0587.md
  - docs/knowledge/wiki/planning-ledger.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0589 — planning session (PL-001..005 → executable fan-out)

> **Pre-staged stub (ADR 0049).** Created at SESSION_0587 bow-out. Reservation branch
> `session-0589-feature-widget-plan`. Operator holds the finalized bow-in prompt (0587 chat).
> Adopt, verify via FS-0030, run a full `/pp` Petey plan → AM_Plan_Session (no product code).

## Date

2026-07-20

## Operator

Brian + claude-session-0589

## Goal

Full `/pp` Petey plan session over the planning-ledger intake, producing ONE executable fan-out
plan (lanes + owned files + pinned forks + reservation branches + staged stubs) — **no product
code beyond ledger/stub scaffolding.** Grill the open forks in each PL row; do not pre-resolve.

Scope (read `docs/knowledge/wiki/planning-ledger.md` first):

- **PL-001 / G-024** — feature+feedback widgets for all sites (admins-only feature-widget on MMB +
  BBL admin surfaces → planning-ledger intake; phase 2 = changelog page for logged-in users). ONE
  platform module. Also wire the planning-ledger into `ledger-backlog.ts` + closing.md §6.7 router
  + `deferral-guard` prefixes (G-024 wiring scope, lane L2 `session-0591`).
- **PL-002** — link-intake ledgers: Reddit (`RLL`) + YouTube (`YLL`) + **ChatGPT (`GPTLL`)** →
  goals-ledger hydration; repo-side vs vault-side decision + the vault-consolidation / SOT-per-
  brand thread. **Concrete first input: review + queue the ChatGPT brainstorming work from the
  night of ~2026-07-19** (the first GPTLL intake).
- **PL-003** — State of the Dojo as the `/app` admin landing (AdminKanban embed + ritual render at
  bow-in / update at bow-out + per-brand/client publish + admin-landing composition). G-023
  SOT-dashboard slice-2 continuation. Consumes PL-005 (skin law) + the per-skin masthead name.
- **PL-004** — portfolio taxonomy **brand > platform > product** (five brands): grill to a
  ratified **ADR** (reconcile with ADR 0034 / 0040), then cascade the wording as conform work.
  **This is the load-bearing one** — dashboard tabs, vault names, and North Star language all
  depend on it.

## First task

Bow-in per ADR 0049; read planning-ledger PL-001..005 + goals-ledger G-023/G-024 + the 0584 recipe
cards (`PM_Planning_Lane.md` · `orchestrator.md` · `epic-plan.md`). Start the grill on PL-004
(taxonomy) since the others depend on the brand/platform/product definition.

## Bow-in

- Reservation branch `session-0589-feature-widget-plan` was 19 commits behind main (cut pre-stub at
  0587); fast-forwarded clean (no divergence). Stub adopted (`staged`→`in-progress`). FS-0030: 0589
  highest, next free 0590.
- **Parallel-lane assessment (step 1d):** this session's *output* IS the fan-out — lanes proven
  disjoint here, dispatched later (operator chose stage-for-later). No product code written.

## Petey plan — PL intake → executable fan-out

**PL-004 taxonomy RATIFIED → [ADR 0051](../architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md):**
spine `kernel → brand → app` (app=deploy unit) + optional `suite→product→feature` nesting; word-fixes
(platform=kernel, product=app, product now=feature-area); white-label instance axis (Baseline→White
Labeled Dojo, RDD resells, Tuff Buffs=pilot instance); 7 brands (RDD·BBL·Mammoth·Baseline·WEKAF·**ACD**·
Tuff-Buffs-instance). ACD (data/analytics coaching) = the non-dojo proof the kernel stays
domain-agnostic.

**Fan-out (6 lanes; stage-for-later, operator dispatches on his word — no overnight run):**

| Lane | Rows | Branch / stub | Kind | Deploys? | Owned files (disjoint) |
| --- | --- | --- | --- | --- | --- |
| **L1** | PL-004 | `session-0590-taxonomy-conform` | build | no | CLAUDE.md North Star, ronin-project-context, ADR 0034/38/40 banners |
| **L2** | PL-002 + PL-001-wiring | `session-0591-ledger-wiring` | build | no | `scripts/` (ledger-backlog lib + deferral-guard) + closing §6.7 + the 3 link-ledgers |
| **L3** | PL-001 / G-024 | `session-0592-feature-widget` | build | **yes** | `apps/web` feature-widget + intake action + BBL admin triage |
| **L4** | PL-003 + PL-006 | `session-0593-sotd-admin-landing-plan` | **plan-me** | (later) | State-of-Dojo landing (own `/pp` plan) |
| **GLL** | PL-007 / G-025 | `session-0594-gll-epic-plan` | **plan-me** | (later) | GLL_Epic lessons/Kaizen/teach (own `/pp` plan) |
| **Vault** | PL-008 | `session-0595-vault-consolidation-plan` | **plan-me** | (later) | vault-as-repos + tooling (own `/pp` plan) |
| **DBS** | PL-009 | `session-0596-dbs-pipeline` | **fresh-Codex** | later | Codex bug scan → DBS ledger → State-of-Dojo component (also touches L2 wiring + L4 component) |

**Merge order:** **L1 first** (ADR 0051 vocabulary is load-bearing for L4/vault dashboards). L2/L3
independent of L1 and each other (L2 = `scripts` + ledgers; L3 = `apps/web`). Disjointness: L1 (North
Star docs) ∩ L2 (`scripts` + link-ledgers) ∩ L3 (`apps/web`) = ∅; the plan-me lanes write no code
until their own plan runs. Giddy disjointness proof runs in each build lane's own review wave (G-024
L2/L3 · G-023 L1) — not this planning session.

**Written this session (ledger/stub scaffolding only):** ADR 0051 · 3 link-intake ledgers (RLL/YLL/
GPTLL, seeded; GPTLL-001 Phase14 content-pending) · **DBS findings ledger** (daily-bug-scan, seeded
DBS-001 output-pending) · planning-ledger (PL-004 ratified; PL-001/002/003/006 planned; **new PL-007
GLL, PL-008 vault, PL-009 DBS**) · goals-ledger (**new G-025 GLL**; G-024 lanes; G-023 note) · **7
reservation branches + 7 staged stubs** (incl. `session-0596-dbs-pipeline`, fresh-Codex).

**Not pinned tonight (routed out, operator-agreed):** L4 (own plan), GLL_Epic (own multi-session
epic, G-025), vault-consolidation (own plan). Phase 14 epic not found in repo graph — GPTLL-001
content-pending.

## What landed

- Full `/pp` Petey plan over PL-001..006 → **one executable fan-out** (6 lanes + a 7th DBS pipeline).
- **PL-004 taxonomy RATIFIED → ADR 0051** (`kernel → brand → app` spine + optional `suite→product→
  feature` + white-label instance axis + 7-brand portfolio incl. **ACD**, the non-dojo brand).
- **L1/L2/L3 pinned to executable build stubs**; **L4 (State-of-Dojo) + GLL_Epic + vault-consolidation
  routed to their own plan sessions** (operator-agreed — capture-don't-solve).
- **New epics captured:** PL-007/**G-025** (GLL_Epic), PL-008 (vault), PL-009 (DBS).
- **3 link-intake ledgers + DBS findings ledger created + wired into wiki index.** Seeded: GPTLL-001
  (Phase 14 brainstorm, content-pending) + GPTLL-002 (share link) + DBS-001/002/003 (real scan output).
- **7 reservation branches + 7 staged stubs** (0590–0596).
- Handed the operator a **paste-ready L1 prompt** to launch fresh (kept off this session).
- Goal **achieved** — deliverable = the fan-out plan; no product code written (planning lane).

## Files touched

- `docs/architecture/decisions/0051-brand-platform-product-portfolio-taxonomy.md` — NEW; the ratified taxonomy ADR.
- `docs/knowledge/wiki/{reddit,youtube,chatgpt}-links-ledger.md` — NEW; the three capture-inbox ledgers.
- `docs/knowledge/wiki/daily-bug-scan-ledger.md` — NEW; DBS findings ledger (DBS-001/002/003).
- `docs/knowledge/wiki/planning-ledger.md` — PL-004 ratified; PL-001/002/003/006 planned; +PL-007/008/009.
- `docs/knowledge/wiki/goals-ledger.md` — G-024 lanes; +G-025 (GLL); G-023 progress note.
- `docs/knowledge/wiki/index.md` — added the 4 new ledgers to the reference table.
- `docs/sprints/SESSION_0590..0596.md` — NEW; 7 staged stubs (L1/L2/L3 build · L4/GLL/vault plan · DBS fresh-Codex).
- `docs/sprints/SESSION_0589.md` — this file (plan record + close).

## Decisions resolved (operator-signed)

- **ADR 0051 taxonomy** — kernel/brand/app + optional nesting; app=deploy unit (ADR 0038 "product"→"app");
  white-label instance axis; 7 brands incl. ACD; RDD = umbrella + agency brand.
- **Link-ledgers = 3 separate files** (match QuickCapture inboxes), repo-side SoT (ADR 0048).
- **feature-widget** = NEW sibling component; **DB inbox → admin triage → session-time PL promotion**;
  **BBL-first** mount, structured for kernel extraction (MMB fast-follow).
- **L4 / GLL / vault** each get their own plan session; **stage-for-later** (no overnight dispatch).
- **DBS** = fresh-Codex pipeline (scan is Codex-side, not editable here).

## Open decisions / blockers (for the next sessions)

- **GPTLL-001/002 content-pending** — the ~2026-07-19 brainstorm + the ChatGPT share link
  (`/share/e/…`) aren't agent-readable; operator to paste/point for triage.
- **DBS this-morning output** lives as an **uncommitted `clients-ci.yml` change in the Codex worktree
  bc1f** (closes WL-P3-56) — **pending review/merge**; DBS-002/003 (Mammoth dedup + signed-out
  boundary) open, route to the Mammoth lane.
- **Phase 14 epic** not found in the repo graph — operator to provide if it exists.
- None block the L1/L2/L3 lanes.

## Reflections

- **The grill kept expanding** — operator surfaced ACD (7th brand), GLL_Epic, vault-as-repos, and DBS
  mid-session. Holding the Petey discipline of **route-don't-solve** (capture to ledgers, stage own
  plan sessions) is what kept a taxonomy grill from becoming five half-built epics.
- **ADR slug-guessing bit me** — I authored ADR 0051 cross-refs from remembered filenames; wiki-lint
  caught 6 broken links (real slugs differed). Lesson: `ls docs/architecture/decisions/` before
  writing ADR cross-refs, don't trust memory of filenames.
- **Gate-runner mis-target:** `bow-out-gates.sh` picks the highest-numbered SESSION file — because I
  staged 0590–0596 *before* bow-out, it ran on 0596, not 0589. Had to run deferral-guard on 0589 by
  hand. Worth a note: staging stubs pre-close shifts the gate runner's target off the active session.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | 4 new ledgers were missing `updated:` → added; ADR 0051 slugs corrected; `last_agent` = claude-session-0589 on all new docs. |
| Backlinks/index sweep | Added the 4 new ledgers to `wiki/index.md` reference table (fixed 4 orphan warnings); ADR 0051 pairs_with/backlinks set. |
| Wiki lint | `bun run wiki:lint` → **0 errors**, 62 warnings (all the repo-standard bold-label-then-list pattern; 7 in new files match existing convention). Started 10 err (all mine: 6 ADR slugs + 4 missing `updated`) → fixed. |
| Kaizen reflection | yes (above). |
| Hostile close review | n/a — planning/docs-only session, no product code, no runtime surface. Self-review: deferral-guard clean, lint clean, disjointness recorded. |
| Code-quality gate (Class-A) | no Class-A custom code this session (docs/governance only). |
| Runtime verification (Doug) | no runtime surface touched. |
| Evidence-artifact URL | n/a — no runtime surface touched. |
| Review & Recommend | yes — Next session = dispatch fan-out (L1 first); paste-ready prompt handed to operator. |
| Memory sweep | updated `rdd-north-star-and-apple-mantra` for ADR 0051 (taxonomy vocabulary superseded). |
| Next session unblock check | unblocked — L1/L2/L3 stubs are self-contained; plan-me lanes ready when adopted. |
| Git hygiene | branch `session-0589-feature-widget-plan`; committed at close (hash in bow-out reply); **not pushed — holds for operator "go"**. |
| Graphify update | nodes=19126 edges=36525 communities=2612 (gate-runner, pre-commit). |
| Deferral guard | `deferral-guard docs/sprints/SESSION_0589.md` → clean (2 flags reworded to G-024/G-023 refs). |

## ADR / ubiquitous-language check

- **ADR 0051 created** (accepted) — the portfolio taxonomy. Supersedes vocabulary in ADR 0034/0038;
  ADR 0040 model intact.
- **Ubiquitous Language:** the redefined terms (kernel · brand · app · suite · product · feature ·
  white-label instance) are ratified in ADR 0051; the `ubiquitous-language.md` + CLAUDE.md/context
  conform is **lane L1** (`session-0590`) — intentionally deferred per the operator's "don't rewrite
  the North Star until the ADR ratifies."

## Status

Single source of truth is the frontmatter `status:` field.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0589_TASK_01 | done | Grill PL-004 taxonomy → ratified ADR 0051 (kernel→brand→app + white-label axis + 7 brands) |
| SESSION_0589_TASK_02 | done | Pin PL-001/002 build-forks → executable lanes L2/L3; L4/PL-006 → own plan |
| SESSION_0589_TASK_03 | done | Capture new epics: PL-007/G-025 (GLL), PL-008 (vault); seed 3 link-ledgers |
| SESSION_0589_TASK_04 | done | Stage reservation branches + staged stubs (L1/L2/L3 executable; L4/GLL/vault plan-me) |
| SESSION_0589_TASK_05 | done | Capture DBS (PL-009): daily-bug-scan ledger + fresh-Codex `session-0596` stub + L2/L4 threads |

## Next session

### Goal

Dispatch the SESSION_0589 fan-out on the operator's word — **L1 first** (`session-0590-taxonomy-conform`,
docs-only free push), then L2 (`session-0591-ledger-wiring`) + L3 (`session-0592-feature-widget`) in
parallel. Or adopt a plan-me lane (L4 `session-0593`, GLL `session-0594`, vault `session-0595`).

### First task

Bow-in; pick a staged lane from the table above (reservation branch already claims the number — ff to
main, flip `staged`→`in-progress`, follow the stub's pinned prompt). Hold the push gate for the
operator's explicit word.
