---
title: "SESSION 0429 — Design-system component batch (PWCC-001…007), Mammoth-Rebuild CRM epic, PR #137 watch"
slug: session-0429
type: session--open
status: closed
created: 2026-06-21
updated: 2026-06-21
last_agent: claude-session-0429
sprint: S-foundation
pairs_with:

  - docs/sprints/SESSION_0428.md
  - docs/epics/post-launch-clean-repo-001.md
  - docs/epics/mammoth-rebuild-crm-001.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0429 — Design-system component batch + Mammoth-Rebuild CRM epic

## Date

2026-06-21

## Operator

Brian + claude-session-0429

## Goal

Land the Desi brand-system pass (one token set + dark/light) and spec a reusable, brand-/content-
agnostic component library (task board, m-card, magnetic drawer, AdminKanban), then fold it into a
Mammoth-Rebuild CRM (HubSpot-replacement) epic with a clean PWCC port series — all on the
`post-launch-clean-repo-001` branch (PR #137), docs-only.

## Status

See frontmatter `status:`.

## Bow-in

### Previous session

- Continues `claude/post-launch-clean-repo-001` (PR #137) from SESSION_0428's repo-health epic +
  files/ spec catalog. This session is the design-system + component-spec batch on the same branch.

### Branch and worktree

- Single branch `claude/post-launch-clean-repo-001` → draft PR #137. Docs + root `scripts/` only
  (no `apps/web`), so it skips the prod deploy gate; the `package.json` script-entry edit triggers
  a Vercel preview build only.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0429_TASK_01 | landed | Desi brand pass — `component-design-system.{md,html}` + shared `bbl-doc-theme.ts`; restyled hub + poster generators (no gold; BBL red `#E52421`) |
| SESSION_0429_TASK_02 | landed | Dark/light inversion across the doc design system (prefers-color-scheme + `data-theme`; accent `#FF4D49` on dark; toggles) |
| SESSION_0429_TASK_03 | landed | AdminTaskBoard spec (PWCC-001) — Todoist model + PWCC cloud handoff |
| SESSION_0429_TASK_04 | landed | m-card spec (PWCC-002) — content-/brand-agnostic roster/rank/task/loop card on Dirstarter base |
| SESSION_0429_TASK_05 | landed | three-level magnetic drawer spec (PWCC-003) — content-agnostic canvas, infinite m-card list, cinematic chrome |
| SESSION_0429_TASK_06 | landed | Mammoth-Rebuild CRM epic + bindings (PWCC-004/005/006) — HubSpot-replacement, library→surface map, cloud-agent prompts |
| SESSION_0429_TASK_07 | landed | AdminKanban spec (PWCC-007) — reusable config-driven board + lead intake + follow-up automations + Desi pass + reusable Cody loop |
| SESSION_0429_TASK_08 | landed | PR #137 watch — subscribed; diagnosed + re-kicked a transient `@prisma/client` `bun install` flake (Playwright chromium) |

## What landed

- **Design system (Desi pass):** one canonical token set (accent `#E52421`, Poppins/Inter, the
  1-2-3 step = filled red disc + white number) in `scripts/lib/bbl-doc-theme.ts`; authored
  `docs/component-design-system.{md,html}`; restyled the orchestration-hub + loop-poster generators
  to it; gold `#d7a74c`/`#FFD700` flagged off-brand.
- **Dark/light inversion:** true OS-following inversion (`prefers-color-scheme`) + forceable
  `data-theme`; accent lifts to `#FF4D49` on dark; toggles in the hub + the design-system HTML;
  posters pinned light (paper). Dark surfaces mirror the iOS/Todoist chrome.
- **Component library specs (PWCC series):** AdminTaskBoard (001), m-card (002), magnetic drawer
  (003), AdminKanban (007) — all brand-agnostic (Dirstarter base + token swap) and content-agnostic
  (kind→DTO), each with ASCII+mermaid wiring, wireframes, status taxonomy, and a PWCC cloud handoff.
- **Mammoth-Rebuild CRM epic:** `docs/epics/mammoth-rebuild-crm-001.md` — replace HubSpot by
  assembling the library (object→component map, PWCC register, phased roadmap re-basing the
  SESSION_0425 MVP); bindings PWCC-004/005/006 with ready cloud-agent prompts; Mammoth dark/orange
  token block = the cross-brand proof.
- **PR #137 watch:** subscribed to PR activity; all bot events (Vercel/CodeRabbit) non-actionable;
  diagnosed the one CI failure as a transient registry flake (`@prisma/client@^7.8.0` failed to
  resolve in `bun install` on the chromium runner while the same step passed on Oxc/Typecheck) and
  re-kicked via empty commit `8c11de28` (rerun API was 403 for the integration).

## Decisions resolved

- Canonical accent is BBL red `#E52421` (dark `#FF4D49`); **gold is off-brand** (`styles.css:210`).
- Two axes of agnosticism for the library: **content** (`kind`→DTO) + **brand** (Dirstarter base +
  token block). Zero per-brand/per-content code in components.
- Clean **PWCC-NNN** port series for this batch (distinct from the SESSION_0337 `PORTMAP-NNNN`
  lineage epic). Mammoth pipeline (PWCC-004) binds the reusable AdminKanban (PWCC-007).
- The Mammoth CRM is the cross-brand proof of the brand-agnostic library; the SESSION_0425 MVP is
  re-based onto it, not discarded.

## Files touched

| File | Change |
| --- | --- |
| `scripts/lib/bbl-doc-theme.ts` | NEW shared token/step/dark-light theme module |
| `scripts/build-orchestration-hub.ts`, `scripts/build-loop-posters.ts` | restyle to shared theme + dark/light + theme toggle; posters pinned light |
| `docs/component-design-system.html`, `docs/knowledge/wiki/component-design-system.md` | NEW living design-system reference (.html committable) + companion |
| `docs/runbooks/dev-environment/orchestration-hub.md`, `package.json`, `.gitignore` | docs:hub/docs:posters scripts + runbook + ignores |
| `docs/knowledge/wiki/files/{bbl-admin-task-board,m-card-pattern,three-level-magnetic-drawer,admin-kanban-board,mammoth-crm-bindings}.md` | NEW PWCC-001/002/003/007 + bindings specs |
| `docs/epics/mammoth-rebuild-crm-001.md` | NEW HubSpot-replacement CRM epic + PWCC register |
| `docs/epics/post-launch-clean-repo-001.md` | catalog rows + RH-5 render-layer mitigation |
| `docs/knowledge/wiki/{index.md,custom-component-inventory.md}` | catalog rows + MagneticDrawer/MCard inventory entries |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | 0 errors, 14 warnings (all pre-existing in `SESSION_VIDEO_R001.md`) |
| CI on PR #137 (Typecheck / Oxc / Unit / Vercel) | green (docs-only; outside `apps/web` job scope) |
| Playwright (chromium) | transient `bun install` flake → re-kicked `8c11de28`; rerun green past install |
| Live component render | N/A — specs only (build handed to cloud agents via PWCC prompts) |

## Open decisions / blockers

- **PR #137 not merged** — draft; CI re-running on `8c11de28`. NOT blocked on user.
- **PWCC builds not started** — 001/002/003/007 + bindings are specs; first build (recommend
  PWCC-007 AdminKanban or PWCC-002 m-card) is a cloud/sub-agent lane.
- **Carryover from SESSION_0428:** issue #134 directory-DTO migration + cloud Graphify parity sweep
  still open (separate thread from this batch).

## Next session

> Superseded the stale PR-Review-Loop-on-#137 brief: #137 and the whole DTO + brand-prune +
> dead-code-sweep program (PRs #146/#147/#150/#151/#152/#153/#154/#155/#156) all merged out-of-band
> across the agent-workflow sessions. SESSION_0430 = a **local, full-close** session: a lineage
> rank/identity wiring-health deep-dive + an agent-workflow system-setup orientation. Create
> `docs/sprints/SESSION_0430.md` at bow-in (highest on `main` is 0429).

### Type

**Wiring-health deep-dive** (Petey orchestration: Petey plans/grills → Cody fixes → Doug verifies)
**+ system-setup orientation review.** Full local session; full bow-out close.

### Goal

Track A — find and fix the lineage **rank / promotion-date / verification / bio** sources-of-truth
drift exposed live in the profile drawer, and harden the DTO + editor + client/server wiring so the
structured rank and the displayed narrative can't silently disagree again.
Track B — orient on the **new agent-workflow system setup** (protocols/loops/ledgers added of late)
and recommend how the operator runs it smoothly going forward.

### Anchor bug (reproduced live, SESSION_0429, `/lineage/bbl-lineage` → David Meyer drawer)

Three sources of truth disagree on one member:

| Drawer field | Shows | Source |
| --- | --- | --- |
| Bio narrative | "**7th Degree Coral Belt** · promoted by Rigan Machado on **January 17, 2026** · Seattle WA" | `LineageNode.bio` (free-text WP import) |
| CURRENT RANK | "**Black Belt — 5th Degree**" | `Passport.rankAwardsEarned[0].rank` (structured `RankAward`) |
| PROMOTED ON | "**Unknown date**" | `currentAward.awardedAt` (null in prodsnap) |
| AWARDED BY | "**lineage-unverified**" | fallback when `RankAward.awardedByPassport` is null |
| Header badge | "**Verified**" | `LineageNode.isVerified` / `verificationStatus` (set independently) |

So: free-text bio ≠ structured rank; promotion date present in prose but null in data; "Verified"
badge is independent of the award's own verification + promoter backfill. Nothing reconciles them,
and there is **no admin UI to edit verification** (drawer says "Manage verification (coming soon)").

### Track A — wiring deep-dive (Petey: grill scope first, then Cody/Doug)

Wiring map already scouted (SESSION_0429 Explore pass) — confirm, then decide the fix:

- **Read path:** `components/web/lineage/lineage-profile-drawer/{index,info-tab,rank-history-tab,
  lineage-tab,use-drawer-profile}.tsx` — `deriveDrawerProfileView()` picks `rankAwardsEarned[0]`
  (order `awardedAt desc`); `awardedBy` falls back to `awardedByPassport ?? awardedBy ?? "lineage-unverified"`.
- **DTO layer:** `server/web/lineage/payloads.ts` (`LineageNodeProfile`, `lineageNodeProfilePayload`,
  rank/award sub-payloads) · `server/web/directory/profile-projection.ts` · `lib/identity/*` ·
  `lib/lineage/trust-status.ts` (`resolveLineageTrustStatus`). Note `RankAward.verificationStatus`
  is **never joined** into the drawer payload — possible missing signal.
- **Source-of-truth question (the core decision):** reconcile `LineageNode.bio` (free text) vs
  `Passport.rankAwardsEarned` (structured) vs `Passport.bio` (import narrative, currently unused in
  drawer). Decide which is canonical and whether bio should derive from / be validated against the
  structured rank, or be clearly labelled as narrative.
- **Verification:** `LineageNode.isVerified`/`verificationStatus` (drives badge) vs
  `RankAward.awardedByPassport` backfill (drives "lineage-unverified"). Decide the contract; the
  Rigan-Machado promoter backfill (`awardedByPassportId`, Phase 3b) may be incomplete in prod.
- **Three editors that WRITE these — audit client↔server parity for each:**
  - User/owner editor: `app/(web)/lineage/[treeSlug]/edit/[nodeId]/_components/lineage-node-profile-form.tsx`
    → `server/web/lineage/node-profile-actions.ts` (writes `bio`, `promotionDate`→`selectedRankAward.awardedAt`).
  - Admin claim-review: `server/admin/lineage/claim-review-actions.ts` + `claim-finalize.ts`
    (attaches account + access; does NOT write rank/bio/verification).
  - Profile editor: `app/(web)/me/*` + `app/(web)/directory/[slug]/*` sidebars + their server actions.
  - For each: which of {rank, promotionDate, awardedBy, verification, bio} is editable in UI, which
    is actually persisted, and which is surfaced — flag any field editable-but-not-persisted or
    persisted-but-not-shown (the drift seams).
- **Deliverable:** a fix (or a tight ADR + scoped fix) that gives rank/date/verification one
  reconciled read model; log the divergence in `wiring-ledger` (WL) + `drift-register` (D).

### Track B — agent-workflow system-setup orientation (lighter; can be a sub-agent)

The **operator playbook already exists** — `docs/protocols/operator-playbook.md` (drafted late
SESSION_0429). Track B is now **validate + close gaps**, not create from scratch:

- **Validate the playbook** against the live system: confirm the loop→signal and finding→ledger
  tables are accurate and the inline-vs-cloud-fanout rule matches how sessions actually run.
- **Finding-router check (closing.md §6.7):** confirm it points at live ledgers and **retire
  `feature-intake-ledger`** (superseded by `POST_LAUNCH_SOT`) — the playbook flags this as open.
- **Loops/ledgers are mapped** in the playbook (loop-promotion program complete: THREE_PASS /
  KISS_DRY_YAGNI / QA_RUNTIME / IDENTIFY_INTENT / HOT_FIX + pr-review-score-fix-loop /
  giddy-merge-strategy / merge-to-main / review-recommend). Spot-check for stale/duplicated docs.
- **JETTY schema-annotation sweep → draft PR #158** (`chore/jetty-schema-annotations`): annotated
  the **17** recent-migration models/enums that genuinely lacked blocks (lineage-v1's 6 models +
  5 enums, `ToolTier`, `ReportType`, `DataSubjectRequest` + 2 enums, `BblEmailCapture`) with
  `@added/@why/@wired`. Comment-only (51 ins / 0 del), `prisma validate`-clean. **Review `@wired`
  accuracy and merge.** Correction to an earlier guess: the standard IS followed for recent domain
  models — `Bookmark`, `Affiliation`/provenance enums, `BrandSettings`, `PromotionEvent`, the
  ProfileClaim group, and `LineagePendingClaim` were already annotated (correctly skipped). Two
  enums flagged `(no runtime consumers found — verify)`: `LineageVisualGroupType` and
  `LineageClaimEvidence` (the latter is reached via `LineageClaimRequest.evidence` includes, so
  likely a grep artifact, not dead). Going forward: keep annotating new models **at creation**;
  the older pre-standard models stay un-backfilled per the standard.

### Known backlog (not this session unless you choose to)

- **PR #157** — `codex/technique-graph-curriculum` draft: recovered BJJ curriculum + technique-graph
  feature (~4,200 lines incl. 2 data JSONs). CONFLICTING + uses the deleted `getRequestBrand`;
  needs a rebase-onto-post-prune-main + de-thread + lockfile re-sync before review. Merge-vs-re-derive
  decision pending.
- **Brand-prune Stage 2** (schema drop) — gated, own session, 4 Phase-0 decisions first
  (`docs/petey-plan-brand-harness-prune.md`).

### Repo state at handoff (SESSION_0429 close)

`main` green + deployed (through #156). Remote branches pruned 94→3 (`main`, `gh-pages`,
`codex/technique-graph-curriculum`). No open PRs except the #157 draft.

### Inputs to read (next bow-in)

- `docs/sprints/SESSION_0429.md` (this file) · `docs/reviews/giddy-review-recommend.md` ·
  `docs/protocols/operator-playbook.md`
- `docs/protocols/next-session-loading-order.md` · `docs/rituals/{opening,closing}.md`
- Track A files above · `docs/petey-plan-brand-harness-prune.md` (Stage 2 still pending, gated)

## ADR / ubiquitous-language check

- No new ADR required this session (specs only; the canonical-DTO ADR remains queued under #134).
  No new ubiquitous-language terms — reused Passport/DirectoryProfile/Rank; introduced doc-level
  terms (m-card, PWCC port id, detent) scoped to the specs, not the domain model.

## Reflections

- **Two axes of agnosticism is the unlock.** Separating "brand" (token block) from "content"
  (`kind`→DTO) let one card/board/drawer serve BBL, Mammoth, and any future brand — and the CRM
  fell out as "assemble the library + a token block," which is the whole argument for the library.
- **A docs-only PR can still go red on infra.** The `@prisma/client` resolve flake hit one runner
  while the same install passed on two others — proof it was registry noise, not the diff. The
  cheap tell: compare the failing step's outcome across sibling jobs on the same SHA before re-kicking.
- **No rerun permission → empty commit is the fallback.** `rerun_failed_jobs` 403'd for the
  integration; an empty commit re-triggers cleanly. Worth knowing for the PR-Review-Loop next session.
- **Spec-first + cloud-handoff prompts kept this session lightweight.** Every component shipped as a
  spec with a paste-ready prompt rather than a build — the build lanes are cleanly parallelizable later.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | SESSION_0429 frontmatter set; `last_agent: claude-session-0429`; pairs_with SESSION_0428 + both epics; touched docs carry frontmatter. |
| Backlinks/index sweep | `wiki/index.md` rows added for all 5 specs + 2 epics; `custom-component-inventory.md` MagneticDrawer/MCard rows + bumped `updated`. |
| Wiki lint | `bun run wiki:lint` → 0 errors, 14 warnings (pre-existing in SESSION_VIDEO_R001.md). |
| Kaizen reflection | Reflections present: yes. |
| Hostile close review | Lightweight — docs/spec only; wiki:lint 0 errors; CI green on docs scope; the one red was a diagnosed infra flake (re-kicked), not a content defect. |
| Review & Recommend | Next session = PR-Review-Loop on #137 with full Petey prompt + per-lane file read/touch lists. |
| Memory sweep | Project facts captured in the epics + PWCC register; no operator-memory change needed. |
| Next session unblock check | Unblocked — Lane 0 (re-check #137 CI) is doable immediately. |
| Git hygiene | Branch `claude/post-launch-clean-repo-001`; docs-only; single close commit — hash reported at bow-out / see git log. |
| Graphify update | Skipped — Graphify not installed in container. |
