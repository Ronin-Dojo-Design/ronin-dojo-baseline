---
title: "SESSION 0712 — Phase C: trim-to-brand fan-out (five-repo era)"
slug: session-0712
type: session--implement
status: closed
created: 2026-07-26
updated: 2026-07-27
last_agent: claude-session-0712
sprint: S13
lane: repo
recipe: "epic-plan"
goal_ids: []
pairs_with:
  - docs/sprints/_archive/monorepo-era/SESSION_0711.md
  - docs/sprints/plans/petey-plan-0711-brand-repo-separation.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0712 — Phase C: trim-to-brand fan-out

> **Staged by SESSION_0711** (the fork session — Phases A+B complete, five repos live at
> `ecefd008`). Adopt: flip `status:` → `in-progress`. Sprint S13 = the post-cleanup era marker
> (N1 call: monotonic numbers, era via `sprint:`).

## Goal

Execute **Phase C** of `docs/sprints/plans/petey-plan-0711-brand-repo-separation.md` (operator
go given at 0711 for the phase sequence; per-phase checkpoint still applies): per brand repo
(BBL · Baseline-Martial-Arts · Mammoth-Metal-Buildings · USA-Stickfighting — RDD-Monorepo
untouched): C1 delete other brands' apps/clients (ordinary commits) · C2 brand-doc trim ·
C3 CI matrix prune · C4 ~150-line CLAUDE.md router · C5 fresh SESSION era
(spine → `_archive/<era>/`, restart 0001) · C6 per-repo `docs/adr/` subset. Plus: per-repo
`settings.json` (bow-in-gates hook registration is gitignored — copy at bootstrap) and extend
the `main-pr-only` server ruleset to all four siblings. Then Phase D validation
(install/typecheck/build/preview/smoke per repo).

**Law reminder (ADR 0059):** session = one repo — Phase C lanes run as separate sessions or
sequential lanes in each repo's own checkout, NOT worktrees of one repo.

## First task

Open the fork plan Phase C section; start with **Black-Belt-Legacy** (this checkout — trim
baseline/rdd apps + mammoth client out of it). Riders: WL-P3-69 (a) ui-kit oxfmt pin+normalize
(ratified 0711 decision #9, fell through the wave) + (c) upstream repro · FS-0042 doc sweep
(`bunx fallow` in executed docs) · Desktop vault copy deletion (pending operator word) ·
PL-030 explorer epic queued behind the fork work.

## Bow-in

- Adopted the staged stub (ADR 0049 flip). Canonical claimed for 0712; githooks doctor PASS.
- Operator answers (Petey's three + SotD ask): **lane = Phase C BBL trim** (no pivot) · riders
  elected: **WL-P3-69 (a)+(c)** + **FS-0042 doc sweep** (Desktop-vault deletion NOT elected —
  stays pending) · **SotD frozen snapshot: YES** (published, see Artifacts).
- Parallel-lane assessment (1d): Phase C is 4-repo disjoint, but ADR 0059 (session = one repo)
  ⇒ single-lane in Black-Belt-Legacy today; sibling repos get their own sessions.
- Trim survey: this repo carries `apps/{baseline,rdd,web}` + `clients/mammoth-build-crm` +
  `packages/{api-client,ui-kit}`. BBL keeps `apps/web` + `packages/*`.

## Petey plan

| ID | Task | Maps to |
| --- | --- | --- |
| SESSION_0712_TASK_01 | C1: `git rm` `apps/baseline`, `apps/rdd`, `clients/mammoth-build-crm`; repo builds with `apps/web` only | Phase C1 |
| SESSION_0712_TASK_02 | C2: delete other brands' docs/seeds; wiki-lint green | Phase C2 |
| SESSION_0712_TASK_03 | C3: CI matrix prune to surviving app; one green CI run | Phase C3 |
| SESSION_0712_TASK_04 | C4: ~150-line CLAUDE.md router (pointers, no duplicated rule text) | Phase C4 |
| SESSION_0712_TASK_05 | C5: sprints spine → `docs/sprints/_archive/<era>/`; restart SESSION_0001 | Phase C5 |
| SESSION_0712_TASK_06 | C6: `docs/adr/` subset — only ADRs binding BBL | Phase C6 |
| SESSION_0712_TASK_07 | settings.json bootstrap note + `main-pr-only` ruleset on the four siblings | 0712 goal extras |
| SESSION_0712_TASK_08 | Rider: WL-P3-69 (a) ui-kit oxfmt pin+normalize + (c) upstream repro | WL |
| SESSION_0712_TASK_09 | Rider: FS-0042 `bunx fallow` doc sweep | FS |

## Task log

| ID | Result |
| --- | --- |
| TASK_01 (C1) | ✅ `698d8628..6d2e1571` — 3 app trees removed, lockfile refreshed, tsc + `next build` green |
| TASK_02 (C2) | ✅ `f401a402..8b3c4f83` — 62 other-brand doc files removed, wiki-lint 0 errors |
| TASK_03 (C3) | ✅ `8ee5fdad..bbbccf81` — clients-ci.yml deleted, ci/playwright pruned + YAML-validated (green CI run lands at push) |
| TASK_04 (C4) | ✅ `e1bce0de` — CLAUDE.md → 79-line router; all 34 cited paths verified to exist |
| TASK_05 (C5) | ✅ `de2c…/82f9` — spine 0304–0711 (282 files) → `_archive/monorepo-era/`; **operator-ratified: monotonic numbering + `sprint: S13` era marker** (supersedes plan C5 "restart 0001") |
| TASK_06 (C6) | ✅ call: live `docs/adr/` (0055–0059) already IS the BBL-binding subset — all five reference live surfaces; legacy 0001–0054 stays intact per the README freeze law. Cleanup: `a654233f` dropped squash-reintroduced 0001–0004 duplicates + finished the renumber (H1s/titles/README) — **drift finding from the #342 squash close** |
| TASK_07 | ✅ `main-pr-only` ruleset created ACTIVE on all four siblings (ids 19777563–66); `b5f97e17` tracked `.claude/settings.shared.json` + bootstrap copy step (cherry-pick to RDD-Monorepo per ADR 0059) |
| TASK_08 (WL-P3-69) | ✅ `4a31dbaf`/`fad078db` — (a) ui-kit oxfmt pinned zero-diff; (b) moot (C1 deleted the script); (c) comment-reorder REPRODUCED (worse: one line hoisted per pass, converges N+1) → G10 guardrail + scratchpad repro + DRAFT upstream issue (unposted, operator-gated) |
| TASK_09 (FS-0042) | ✅ `03d89b88`/`d92992ba`/`d2dd66ee` — bunx-fallow doc sweep (6 executed docs), minter phantom-filter fix, + the Doug-caught self-burn evidence line fixed |

## Goal extension (bow-out ①)

Operator: "goal not hit until the 7 repos are in the local dev folder." Done in-session:
4 sibling clones at `ecefd008` (`baseline-martial-arts` · `mammoth-metal-buildings` ·
`usa-stickfighting` · `ronin-dojo-design-monorepo`) + **Amy-Coaches-Data created** (fresh
private repo, no fork history — nothing existed to fork; `main-pr-only` ruleset active;
cloned as `amy-coaches-data`) + Tuff Buffs slot = the pre-existing `~/dev/ronin-dojo-monorepo`
(old WP/React work; NO new TB repo — ADR 0051 instance model honored, operator call).
All 7 slots local. Repos are cloned, NOT bootstrapped (each repo's own session, ADR 0059).

## Verification

- Doug full-diff verify (`1a513d43..HEAD`, 26 commits): **GO, 9.2/10** — tsc ✅ · `next build` ✅ ·
  `bun run test` 1923 pass / 0 fail ✅ · format:check root+ui-kit ✅ · wiki-lint 0 errors ✅ ·
  arch-gate 4/4 ✅ · executable-reference sweep to deleted paths clean. Diff shape:
  548 files, +379/−27278.
- Doug P3 residue (routed to Next session): on-disk gitignored leftovers (`apps/rdd/` node_modules,
  `clients/mammoth-build-crm/.env` — move secrets to RDD-Monorepo then delete), 6 stale pre-fork
  worktrees + 1 stale agent worktree (ADR 0059 prune), pre-0304 petey-plans/lanes archive sweep,
  WEKAF brand-kit PNG disposition (→ USA-Stickfighting), ADR 0055/0059 missing frontmatter,
  api-client missing format/test scripts.

## /rr — kepano/obsidian-skills (research-recommend, operator-requested)

- **Graph query:** `graphify query "obsidian vault skills CLI sync"` → prior art: vendored
  `.agents/skills/obsidian-vault/SKILL.md` (**broken-foreign — points at a WSL
  `/mnt/d/…` vault that doesn't exist on this Mac**), `ronin_obsidian_starter_vault/`, ADR 0048,
  G-014 epic, and the 0566 **skills-CLI over-sync incident** (memory: `npx skills add` treats
  itself as owner of the whole skill set — tried ~15 unrequested installs + refresh/delete of
  every existing skill; keep-list revert + `skills-lock.json` rebuild was the recovery).
- **Upstream:** kepano/obsidian-skills = 5 Agent-Skills-spec skills (obsidian-markdown ·
  obsidian-bases · json-canvas · obsidian-cli · defuddle), by Obsidian's CEO, 43K★, active.
  Directly serves G-014 (Bases/Canvas are the dashboard formats) + the RDD_Master_Vault system.
- **Recommendation (ONE):** vendor at **user level, manually pinned** — clone to
  `~/.claude/vendor/obsidian-skills` + symlink the 5 skill dirs into `~/.claude/skills/` —
  NOT `npx skills add` into this repo. Why: every repo + vault session on this machine sees
  them; sidesteps the 0566 CLI over-sync against this repo's 40+ custom skills +
  `skills-lock.json`; keeps freshly-trimmed BBL lean; if repo-vendoring is later wanted it
  lands RDD-Monorepo-first per ADR 0059. Alternatives considered: (a) literal `npx skills add`
  in-repo — known over-sync trap + bloat ×5 repos; (b) vault-root `.claude/` — invisible to
  repo sessions; (c) RDD-Monorepo vendor+sync — the eventual home if in-repo is ever needed.
- **Rider routed:** replace the broken `obsidian-vault` skill with a thin RDD-vault pointer
  (live vault path + conventions), delegating format knowledge to the kepano set.

## /gq — ACD + Tuff Buffs (the 6th/7th board slots)

- **ACD (Amy Coaches Data):** ratified 6th brand — ADR 0051 taxonomy table + `ronin-project-context.md`
  (amycoachesdata.com, data/analytics coaching, non-martial-arts, "load-bearing evidence" the kernel
  stays domain-agnostic). **No repo, no app, no code** anywhere (org repo list checked) — correctly
  absent from the ADR 0055 fork; its lane starts with a scope/interview session (G-027 recipe family),
  then repo + ruleset + scaffold (ADR 0057 own DB).
- **Tuff Buffs:** ratified as the **pilot white-label instance of Baseline** (ADR 0051 — transitional,
  being absorbed, NOT a peer repo). WordPress today (Local Sites checkout); own Stripe account
  (the `acct_1T065a…` CLI trap). Path: blocked on the Baseline trim → Baseline-skinned instance app
  (own deploy + DB) → migrate content/commerce → WP sunset.
- Both added to the Fork Fan-out Board (republished, same URL).

## SotD review — wiring + the invisible-work map (operator-requested)

- **Explore sweep (full inventory in-session):** 19 SHIPPED items · 7 in-flight · 14 planned-not-started ·
  7 mentioned-no-owner. Headline: the promised SotD is ONE dashboard with ~10 components; what exists is
  (a) the static script (5 sections), (b) live `/app/state` (3 sections), (c) FOUR sibling panels mounted
  NEXT to it on `/app` (ComponentCatalog · CardCatalog · Cookbook · TokenCost) — never ON it, and (d) ~7
  promised components queued across PL-003/-006/-007/-009/-020 + WL-P2-71/-75/-76/-80 with no open session.
- **Drift finding (D-candidate, route at bow-out):** two renderers diverged — `scripts/state-of-project.ts`
  keeps its own copies of PHASES/BELT_WORD/BRANDS/masthead instead of importing
  `apps/web/components/app/state-of-dojo/_kernel/phase.ts`; the script also lacks the deploy-scope gate
  (leaks cross-brand data the live route suppresses) and the per-skin masthead. Every vocabulary fix
  (e.g. PL-020) must land twice; the bow-out gate renders the stale one each close.
- **Stale-status finding:** `_archive/monorepo-era/SESSION_0674.md` frontmatter says `in-review` but its
  build IS merged (`b2fc7013`, PR #303 — `/app/state/[brand]` + BrandStatePanel). Unclean-close class.
- **Docs-nav/graph on SotD:** WL-P2-76 (docs-navigator on SotD — 0620 /rr ratified a LINK CARD, not a
  panel; never built) · PL-008/SESSION_0595 (per-brand vaults with own docs-nav + graphify HTML — staged,
  never run). Graph output on SotD was never promised beyond PL-008.
- **Epics visibility:** epics live scattered (docs/epics/ ×3 · BBL product epic-plans/specs ×5 ·
  obsidian-dashboard epic · staged plan stubs 0594/0595/0605 · PL-030). Consolidated as a new **Epics tab**
  on the frozen artifact (15 rows); a permanent epics panel belongs in the renderer lane below.
- **Routed recommendation:** ONE plan lane ("SotD usefulness epic", /pp next session or after the sibling
  trims): unify both renderers on `_kernel/phase.ts` → PL-020 belt words once → bake Fan-out + Epics panels
  into `state-of-project.ts` → WL-P2-76 docs-nav link card → WL-P2-75 MBR→Needs-you → PL-003 §1 loop-board
  embed; decide the fork-era home of the PORTFOLIO SotD (RDD-Monorepo) vs the per-brand SotD (each repo).
- **Consolidation done this session:** the frozen artifact now carries RDD/BBL/MMB + **Fan-out** (7 slots)
  + **Epics** (15 epics) tabs at ONE url (see Artifacts).

## Artifacts

- State-of-Dojo frozen snapshot (bow-in): <https://claude.ai/code/artifact/77fd25bb-4dd6-4f34-98f0-98dea93adbfd>
- Fork Fan-out Board (per-repo C/D step board, operator-requested): <https://claude.ai/code/artifact/8e513de0-a42f-4037-9363-fb6786a0cacb>

## /gq — "did we trim the /cas /car /cac skills?"

No — they were never built. `/cas`·`/car`·`/cac` (`create-a-sequence` / `create-a-recipe` /
`create-a-card`, WS-E) are the SESSION_0605 **staged plan**, still `status: staged`, now at
`docs/sprints/_archive/monorepo-era/SESSION_0605.md`. The trim deleted no skills; the graph query
also surfaced pre-trim phantoms (mammoth paths) — full Graphify rebuild queued at bow-out.

## Reflections

- **The fork's first trim proved the recipe cheap:** C1–C6 landed in one session with zero test
  regressions (1923 pass) because deletion-by-ordinary-commit + shared history means nothing is
  ever lost — the fear tax on trimming was already paid at 0711. The SESSION_0712 task log is now
  the reusable recipe for the three sibling trims.
- **Squash-merges are a drift vector at close:** #342 reintroduced files its own branch had
  renamed (ADR 0001–0004 dupes) and #303's session record never flipped from in-review. Both
  found only because this session LOOKED. Routed as incidents; the pattern to watch is
  "close-time squash + rename in the same wave."
- **Ledgers self-burn:** writing a minter's predicted output verbatim into a scanned ledger
  claims the id (FS-0042's own close evidence did it). Rule recorded: mangle ids in ledger prose.
- **The operator's SotD frustration was data, not vibes:** the sweep proved ~7 promised
  components never landed and two renderers drifted. The fix is one lane (PL-032), not scattered
  patches — and the hand-built artifact tabs are the mock for it.

## Review log

- Doug full-diff verify: **GO 9.2/10** (gates in §Verification). Gate 12d: `/ggr` composite not
  required (no shippable app-code beyond deletions + a config pin; working-tree diff at gate time
  was docs-only). CI on PR #343: **9/9 green** incl. chromium 28m — Phase C3 done-means satisfied.

## Full close evidence

| Gate | Result |
| --- | --- |
| Task log | PASS (9 rows, all ✅) |
| Format-fix (code) | 0 code files (ui-kit pin verified green) |
| wiki:lint | 0 err / 108 warn |
| Build | `next build` PASS (Doug) + CI 9/9 green |
| /ggr (code session) | n/a per Gate 12d — Doug 9.2 GO stands |
| Graphify | full rebuild at close (post-trim; incremental keeps phantoms) |
| Git state | branch=session-0712-phase-c-trim · PR #343 green · merge on operator word |
| Secret scan | PASS |
| Evidence-artifact URL | https://claude.ai/code/artifact/77fd25bb-4dd6-4f34-98f0-98dea93adbfd (SotD + Fan-out + Epics tabs) |
| Finding router | INC ×2 (#342 squash dupes · 0674 stale status) · D-055 (renderer split) · PL-032 (SotD usefulness) · WL-P3-69 ✅ · FS-0042 closed |

## Goal verdict

**EXTENDED → YES.** Original goal (Phase C BBL trim) hit and merged (PR #343, CI 9/9). The
operator extended it at bow-out ("7 repos in the local dev folder") — also hit same day. All
post-close directives executed (below).

## Post-close operations (operator-directed, same day)

| Op | Evidence |
| --- | --- |
| Mammoth `.env` parked + leftover trees deleted | `~/dev/_secrets-parking/mammoth-build-crm/` |
| oxfmt idempotency bug posted upstream (re-verified on 0.60.0 first) | oxc-project/oxc#24960 |
| kepano/obsidian-skills installed user-level (pinned) | `~/.claude/vendor/obsidian-skills` @a1dc48e |
| SotD artifact consolidated: + Fan-out (7 slots) + Epics (15) + What-landed tabs | artifact URL in §Artifacts |
| SotD invisible-work sweep → D-055 + PL-032 minted, grilled, planned | `plans/petey-plan-0712-sotd-usefulness.md` |
| Process-OS cherry-picked up immediately (operator call) | rdd-monorepo PR #1 |
| All 7 portfolio slots local (4 clones + amy-coaches-data created + TB = old monorepo) | fetch-verified |
| Canonical renamed `ronin-dojo-app` → `black-belt-legacy` (+compat symlink; stale 0413 clone deleted) | PR #344 |
| Stale worktrees pruned (6 + husks + caches) after safety verification; uniques backed up | `_secrets-parking/worktree-backups/` |
| Repo names normalized lowercase; long-form monorepo → `rdd-monorepo` | PR #345 + ADR 0055 amendment |
| Ritual amendment: goal-verdict question at bow-in ⓪ + recorded `## Goal verdict` at close | this PR |

## Next session

### Goal

**Mammoth trim** (operator-elected 0712 bow-out; 08-05 cutover pressure): run C1–C6 + D1–D3 in
`~/dev/mammoth-metal-buildings` (cloned at `ecefd008`, ruleset live), reusing this file's Task
log as the recipe. Restore the parked `.env` from `~/dev/_secrets-parking/mammoth-build-crm/`
first. SESSION_0713 stub staged.

### First task

Bootstrap the Mammoth checkout (bootstrap.sh copies settings.shared.json post-#343), C1 `git rm`
apps/web + apps/baseline + apps/rdd. Queued after/alongside: **PL-032 session A** (plan staged:
`docs/sprints/plans/petey-plan-0712-sotd-usefulness.md` — builds in BBL, cherry-picks up) ·
BBL hygiene lane (Doug P3 residue: stale worktrees, pre-0304 petey-plan sweep, WEKAF PNGs →
USA-Stickfighting, ADR 0055/0059 frontmatter) · Desktop vault copy deletion (STILL pending
operator word) · PL-030 explorer epic · RDD-Mono bootstrap session (set the weekly sync DAY —
unset as of 0712).
