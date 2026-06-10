---
title: "SESSION 0359 — BBL-SOT-Spec Phase 0: program pivot, upstream capture (76c8e1e), SoT blueprint"
slug: session-0359
type: session--plan
status: closed
created: 2026-06-09
updated: 2026-06-10
last_agent: claude-session-0359
sprint: S6
pairs_with:

  - docs/sprints/SESSION_0358.md
  - docs/product/black-belt-legacy/BBL-SOT-Spec.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0359 — BBL-SOT-Spec Phase 0: program pivot + upstream capture + SoT blueprint

## Date

2026-06-09 / 2026-06-10

## Operator

Brian + claude-session-0359

## Goal

What started as "form/identity consolidation" was re-framed, through an extended operator grill, into a
**program pivot**: get `blackbeltlegacy.com` live **correctly** by (1) bringing the repo to **upstream-current
Dirstarter** (oRPC + permissions + unified `/app` dashboard) and (2) **re-rooting identity on Person (Passport)**
on that new substrate, then the BBL claim/verify loop and WP-parity — all **before** launch, no can-kicking.
This session is **Phase 0** of that program: capture the real current upstream, re-pin, and write the single
canonical blueprint (`BBL-SOT-Spec.md` + `SOT-ADR.md`) so any agent — or Brian — can execute lane-by-lane
with zero context re-establishment.

## Status

Single source of truth is the frontmatter `status:` field.

## Bow-in

### Previous session

- Latest read: `docs/sprints/SESSION_0358.md` (admin add-person + `createLineageMember` + read-repoint + ADR 0025).
- Carryover that triggered the pivot: SESSION_0358's add-person re-introduced the synthetic-`User` placeholder
  pattern ADR 0020 had deliberately killed, and the operator wants full upstream parity (oRPC) done **now**, not later.

### Branch and worktree

- Branch: `main`; worktree `/Users/brianscott/dev/ronin-dojo-app`.
- Status at bow-in: clean. HEAD: `6aaa3c3`.
- Remote guard: `origin` = `Ronin-Dojo-Design/ronin-dojo-baseline.git`; cwd not `dirstarter_template`. FS-0024 passed.

### Grill outcome (the pivot — operator-confirmed, multi-round)

1. **Lineage/identity work is launch-prerequisite, not drift** — WP-functional parity on `bbl.local:3000` is required *to be able to launch*; backend-correct first, WP visual parity later.
2. **Identity is Person-rooted** — `Passport` = SoT, `Passport.userId` nullable (placeholder = accountless Passport, no synthetic email); satellites (`DirectoryProfile`/`LineageNode`/`RankAward`/`Affiliation`) → `passportId`; claim = attach account; names = legal/displayName/derived-`User.name`; @handle = existing slug. (SOT-ADR D1.)
3. **Full upstream Dirstarter parity, now** — adopt oRPC + the `server/orpc` permission model + unified `/app` dashboard + public API; **foundation-first** so identity is built once on the final substrate. Overrides ADR 0024 hybrid. (SOT-ADR D2/D3/D5.)
4. **Claim is always RBAC-reviewed** (verification = BBL value prop); **BBL extends the flat role model with resource-scoped grants** (per-tree/branch) — upstream `can()` is role-only. (SOT-ADR D4/D6.)
5. **One SoT doc set** — `BBL-SOT-Spec.md` (first), `SOT-ADR.md`, PRD, STORIES, CUTOVER_CHECKLIST, GAP_MATRIX (re-verify; it's stale). Old ADRs archived/superseded, not sacred.
6. **Capture mechanism** — `dirstarter_template` IS the upstream clone; refresh it (`git pull`) — NOT `git remote add upstream` in the app repo (one history).

### Drift logged

- **D-024 (new)** — fork behind upstream "unified dashboard" (`/admin`+`/dashboard` → `/app`); now folded into the program (SOT-ADR D5).
- **D-021 / ADR 0024** — oRPC undecided/unbuilt → resolved to **full adoption** (SOT-ADR D3).
- **D-023** — person identity fragmented across 4 minters → resolved by the person-root re-root (Phase 3).

## Petey plan

### Goal

Phase 0: capture current upstream, re-pin, and land the single canonical blueprint + consolidated ADR + opening.md repoint.

### Tasks

#### SESSION_0359_TASK_01 — Capture current upstream + re-pin

- **Agent:** Petey/Cody
- **What:** Refresh the `dirstarter_template` clone to current `main` and re-pin the marker; record the real substrate paths.
- **Done means:** template at `76c8e1e`; `apps/web/.dirstarter-upstream` re-pinned (`uplift_target_sha = 76c8e1e`); substrate facts captured.
- **Depends on:** nothing.

#### SESSION_0359_TASK_02 — Write the SoT blueprint + consolidated ADR

- **Agent:** Petey
- **What:** `BBL-SOT-Spec.md` (the single build blueprint: locked decisions, phase map 0–7, coarse session roadmap) + `SOT-ADR.md` (consolidated decisions D1–D7 superseding the scattered ADRs).
- **Done means:** both docs exist; `bun run wiki:lint` green.
- **Depends on:** TASK_01 (real paths).

#### SESSION_0359_TASK_03 — Repoint opening.md at the SoT set

- **Agent:** Petey
- **What:** Bow-in reads the SoT set first (SOT-Spec → SOT-ADR → PRD → STORIES → CUTOVER → GAP_MATRIX) for BBL/launch work.
- **Done means:** `opening.md` updated; wiki-lint green.
- **Depends on:** TASK_02.

#### SESSION_0359_TASK_04 — Governance + bow-out

- **Agent:** Doug → Petey
- **What:** wiki-lint; memory sweep (BBL focus, identity model, oRPC); graphify update; single push.
- **Depends on:** all.

### Open decisions

- None blocking. (Phase 1+ task detail is finalized at each phase's start, per the roadmap — operator-confirmed: just-in-time, not pre-written.)

### Scope guard

- Phase 0 is **docs + capture only** — no code/schema changes this session. The substrate build starts Phase 1.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0359_TASK_01 | landed | `dirstarter_template` fast-forwarded `7e724b6 → 76c8e1e` (52 commits, 2026-06-03 unified-dashboard release); `.dirstarter-upstream` re-pinned (`uplift_target_sha = 76c8e1e`). Confirmed substrate: `server/orpc/{procedure,permissions,roles}.ts`, `lib/orpc-{server,client,query}.ts`, `server/router.ts`, `app/api/rpc/`, `app/api/v1/`, `app/app/`, flat `server/<entity>/*`. |
| SESSION_0359_TASK_02 | landed | `BBL-SOT-Spec.md` (blueprint: decisions, phases 0–7, captured paths, session roadmap) + `SOT-ADR.md` (D1–D7; **D4** = BBL extends flat `can()` with resource-scoped grants). |
| SESSION_0359_TASK_03 | landed | `opening.md` step 0 repointed at the SoT set (SOT-Spec → SOT-ADR → PRD → STORIES → CUTOVER → GAP_MATRIX). |
| SESSION_0359_TASK_04 | landed | Governance + full bow-out (this section). |
| SESSION_0359_TASK_05 | landed | Doc reconciliation (operator-added): substrate banners on GIFT epic + 2 wiring SOPs + lineage hub + central tracking list (SoT-Spec §5); **test gap matrix** (`sop-test-writing` §15 — ~30 rewrite / ~23 update / ~45+ keep, **not** "redo all"); **TypeScript learning guide** (`human-code-runbook`). |

## What landed

- **Program pivot captured** — from a single-feature session to the BBL-SOT-Spec program (upstream-current Dirstarter → person-rooted identity → claim → WP-parity → cutover), foundation-first.
- **Upstream captured + re-pinned** — `76c8e1e` (current `main`); real substrate paths confirmed; the uplift target un-stuck from the stale `7e724b6`.
- **Single blueprint** — `BBL-SOT-Spec.md` + `SOT-ADR.md` are the one place to start; old ADRs superseded (D1–D7).
- **Key finding** — upstream `can()` is role-only; BBL needs resource-scoped grants (SOT-ADR D4).

## Files touched

| File | Change |
| --- | --- |
| `apps/web/.dirstarter-upstream` | Re-pinned: `uplift_target_sha = 76c8e1e`; captured substrate paths recorded. |
| `docs/product/black-belt-legacy/BBL-SOT-Spec.md` | **New.** The single build blueprint (phases 0–7, captured paths, coarse session roadmap). |
| `docs/product/black-belt-legacy/SOT-ADR.md` | **New.** Consolidated decisions D1–D7 (supersedes ADR 0016/0019/0020/0023/0024/0025). |
| `docs/product/black-belt-legacy/GIFT_MEMBERSHIP_AND_TIER_GATING_EPIC.md` | Program-alignment banner (not superseded; folds into Phases 4–6; RBAC = D4). |
| `docs/rituals/opening.md` | Bow-in step 0 → read the SoT set first. |
| `docs/runbooks/sops/sop-data-and-wiring-flows.md` | Substrate-change banner. |
| `docs/runbooks/sops/sop-e2e-user-lifecycle.md` | Substrate-change banner (§1 → Passport-first). |
| `docs/runbooks/sops/sop-test-writing.md` | Banner + **§15 Test Gap Matrix** (substrate-change impact). |
| `docs/runbooks/domain-features/lineage-hub.md` | Substrate-change banner (oRPC + D4 + person-root). |
| `docs/runbooks/porting/human-code-runbook.md` | **New section** — "TypeScript — a learning guide for this codebase". |
| `docs/sprints/SESSION_0359.md` | This ledger. |

## Verification

| Command / smoke | Result |
| --- | --- |
| `bun run wiki:lint` | ✅ 0 errors, 0 warnings (629 files); 1 introduced warning (line-leading `+`) fixed |
| Upstream capture | ✅ `dirstarter_template` ff `7e724b6 → 76c8e1e`; substrate paths confirmed by direct read |
| Code/schema gates (typecheck/biome/tests) | N/A — docs + capture only this session (scope guard held) |
| `fallow audit` spike | `fallow@2.91.0` (operator-authorized; `.fallow` cache present) — **11 changed files: ✓ no issues** (docs). 2 pre-existing repo findings (recommend-only): unused dep `tailwind-merge`, unused devDep `@react-email/preview-server` |

## Open decisions / blockers

- Confirm Dirstarter upstream `git pull` creds remain valid for future refreshes (worked this session).
- GAP_MATRIX is stale — re-verify feature status against the live app at each dependent phase.

## Next session

### Goal

**Phase 1 — oRPC substrate.** Stand up the upstream data + authorization layer so all later code is written on it.

### First task

Slice 1a: add deps (`@orpc/*`, `@tanstack/react-query`) + bump `better-auth` → `^1.6.2`; port the oRPC scaffold from
the refreshed `dirstarter_template` (`lib/orpc-{server,client,query}.ts`, `server/router.ts`, `server/orpc/context.ts`,
`app/api/rpc/`); stand up a TanStack Query provider. Then Slice 1b lands `server/orpc/{procedure,permissions,roles}.ts`
**plus the BBL resource-scoped-grant extension seam (SOT-ADR D4)** and the auth plugins (`admin`/`nextCookies`/`oneTimeToken`).
Write the detailed 3–5-task petey-plan for Phase 1 at bow-in, per `BBL-SOT-Spec.md` §4.8.

## Review log

### SESSION_0359_REVIEW_01 — Phase 0 program pivot + SoT blueprint

- **Reviewed tasks:** TASK_01–05.
- **Dirstarter docs check:** live docs read this session (changelog, authentication, codebase/structure, public-api, content, updates) **and** the captured upstream `76c8e1e` source (`server/orpc/*`, `lib/auth.ts`). Cited in SOT-ADR D3/D4.
- **Verdict:** Pass. Phase 0 is docs + capture only (no code) but it un-sticks the program: the uplift target was 3+ weeks stale (`7e724b6` < `76c8e1e`, 52 commits), now captured + re-pinned; the architecture (person-rooted identity, full oRPC, D4 resource-scoped grants) is locked in one blueprint any agent/operator can execute cold. Honest gap: Phase 1+ file lists are "pin at lane start" — accurate, not guessed.
- **Score:** 8.5/10.
- **Follow-up:** Phase 1 (oRPC scaffold); detailed petey-plan at its bow-in per SoT-Spec §4.8.

## Hostile close review

- **Giddy:** Pass — no parallel system; the work *consolidates* (4 identity minters → one door planned; scattered ADRs → SOT-ADR; uplift target re-pinned to real upstream). Anti-sprawl held: runbooks bannered + centrally tracked, not mass-rewritten.
- **Doug:** Pass — `bun run wiki:lint` green (629 files, 0 violations); FS-0024 git guard passed; no code/schema touched (test impact captured as the §15 gap matrix instead). Capture verified against real upstream **source**, not docs alone.
- **Security review:** N/A this session (docs). The substrate program's security (oRPC permission gate must preserve brand-scope + audit + rate-limit + public-payload allowlists) is a **hard gate** flagged for Phase 1 (SOT-ADR D3).
- **Kaizen aggregate:** 8.5/10 — standouts: caught that our **own** uplift epic was 52 commits stale vs upstream, and that upstream `can()` is role-only → BBL needs the **D4** resource-grant extension (a rework-saver caught before any code).

## ADR / ubiquitous-language check

- ADR work **done** — `SOT-ADR.md` (D1–D7) is the new consolidated decision record; it supersedes ADR 0016/0019/0020/0023/0024/0025 (left in place as historical). No separate `architecture/decisions/` file added — the SoT-ADR is the canonical home per operator direction.
- Ubiquitous-language: no new term-file needed; `BBL-SOT-Spec.md` + `SOT-ADR.md` carry the program vocabulary. Fold "oRPC procedure", "resource-scoped grant", "substrate" into the glossary at Phase 1.

## Reflections

- **The biggest win was a grill, not a build.** What came in as "form/identity consolidation" was the wrong altitude; pushing on it surfaced the real goal — full upstream parity + a correct identity root **before** launch. Capturing it in ONE blueprint prevents the re-discovery churn the operator is frustrated by.
- **Our own tracking docs were stale.** The uplift epic targeted `7e724b6`; upstream `main` was already 52 commits ahead (`76c8e1e`). "Measure before port" applied to our *own* plan, not just the code.
- **Read the existing ADRs before re-deciding.** The operator was right that I re-derive instead of reading — ADR 0020 already ratified the nullable-`userId`/no-synthetic-`User` pattern the re-root generalizes, and ADR 0023 already specced the claim use-case. Reading them mid-session changed the plan.
- **Discipline under "do it all now."** The pull to mass-rewrite runbooks was real; the disciplined move (banner the entry points, track the rest centrally, rewrite per-phase) keeps docs honest without sprawl.

## Full close evidence

| Step | Proof |
| --- | --- |
| JETTY/frontmatter sweep | Bumped `updated`/`last_agent` on opening.md, lineage-hub, sop-data-and-wiring-flows, sop-e2e-user-lifecycle, sop-test-writing, human-code-runbook, GIFT epic; new BBL-SOT-Spec + SOT-ADR carry full frontmatter. |
| Backlinks/index sweep | SoT docs `pairs_with` PRD/STORIES/CUTOVER/GAP_MATRIX + each other; wiki `index.md` SESSION_0359 row added. |
| Wiki lint | `bun run wiki:lint` — ✅ 0 errors, 0 warnings (629 files); 1 introduced warning fixed (line-leading `+`). |
| Kaizen reflection | Reflections section present (4 notes). |
| Hostile close review | SESSION_0359_REVIEW_01 + Giddy/Doug/security. |
| Review & Recommend | Next session = Phase 1 (oRPC scaffold), specced in `Next session` + SoT-Spec §4.8. |
| Memory sweep | Updated `bbl-launch-is-the-focus`, `passport-identity-consolidation`, `orpc-decision-adr-0024`; new `bbl-sot-spec-program`. |
| Fallow audit spike | `fallow@2.91.0` run (operator-authorized; `.fallow` cache). **11 changed files (this session): ✓ no issues** (docs). 2 pre-existing repo findings (recommend-only, NOT this session): unused dep `tailwind-merge` + unused devDep `@react-email/preview-server` (apps/web/package.json) → defer removal to Phase 5 toolchain lane. |
| Next session unblock check | Unblocked — Phase 1 first task specced; only needs operator if an upstream re-pull is wanted. |
| Git hygiene | Branch `main`; FS-0024 passed; single push — hash reported at bow-out / see git log. |
| Graphify update | `graphify update .` run before the close commit — incremental (240 nodes / 839 edges touched); total **9838 nodes / 15540 edges / 1481 communities / 1641 files**. |
