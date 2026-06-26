---
title: "SESSION 0451 — operator's pick (Stage-2 parked): cleanup leftovers / cred rotation / security-docs / BBL feature"
slug: session-0451
type: session--open
status: in-progress
created: 2026-06-26
updated: 2026-06-26
last_agent: claude-session-0450
sprint: S45
pairs_with:

  - docs/sprints/SESSION_0450.md
backlinks:

  - docs/knowledge/wiki/index.md
---

# SESSION 0451 — operator's pick (Stage-2 parked)

> **PRE-STAGED at SESSION_0450 bow-out — not yet started.** The next session's bow-in should read this
> file, let the operator pick / reorder the lane (no autopilot), then execute. The candidate Petey plan
> below is a menu, not a commitment — the operator adds/removes tasks at bow-in.

## Date

<set at bow-in>

## Operator

Brian + <agent>-session-0451

## Goal

The SESSION_0450 Stage-2 brand-schema-drop lane is **PARKED** (the `brand` column is the BBL-vs-future-
`baselinemartialarts.com` multi-product separator, kept on purpose — see `[[brand-vestige-trim-inventory]]`).
So this session has **no forced lane**. Pick one (or more) of the candidate tasks below — operator's call.

## Bow-in

### Previous session

- Latest session read: `docs/sprints/SESSION_0450.md` (closed). It refreshed prodsnap == prod, gate-reviewed
  + PARKED the brand-column drop (banked a verified purge tool), and did a memory/governance-docs cleanup.
- Carryover: no blocker. prodsnap is fresh. The brand column stays. A few cleanup leftovers + standing
  follow-ups remain (below).

### Branch and worktree

- Branch: `main`
- Worktree: `/Users/brianscott/dev/ronin-dojo-app`
- Status at bow-in: SESSION_0450 pushed a **docs-only** commit. Expect ONE intentionally-untracked file —
  `apps/web/scripts/purge-non-bbl-baseline-data.ts` (the banked purge tool, held out of the docs push to
  avoid a no-op BBL redeploy). Not a problem; it lands free on the next app-code push. Don't run it.

## Petey plan (CANDIDATE — operator picks/reorders/adds at bow-in)

### Goal

Operator-selected lane from the menu below.

### Tasks

#### SESSION_0451_TASK_01 — Finish the memory + governance-docs de-dup (carryover from 0450 TASK_05)

- **Agent:** Cody/Giddy
- **What:** Clear the audit leftovers from SESSION_0450's memory sweep.
- **Steps:** (a) fix the stale "prodsnap has ZERO legacy BBL claims" line in `bbl-sot-spec-program.md`
  (prodsnap was refreshed == prod); (b) resolve the launch-status conflict — verify the current
  `BBL_COUNTDOWN` / reveal state of `blackbeltlegacy.com` (0450 curl showed 200 + live site, no "countdown"
  text → likely revealed), then de-conflict `bbl-launch-is-the-focus` ↔ `bbl-paid-live-and-e2e-green`
  (consolidate to one dated launch-status memory); (c) merge claim-file overlaps
  (`creatable-combobox-and-typed-claim-refs` → cite `claim-unification-adr-0036`; `passport-identity-consolidation`
  ↔ `claim-unification`); (d) lean `.github/copilot-instructions.md` (12KB) the same way AGENTS.md was leaned.
- **Done means:** no stale/conflicting memory; Copilot doc de-duped; MEMORY.md still < 17KB.

#### SESSION_0451_TASK_02 — 🔐 Rotate the prod Neon password

- **Agent:** Cody (operator-driven, creds)
- **What:** The prod Neon password was re-exposed in a psql error in the SESSION_0450 transcript (and earlier
  in 0449). Rotate it in the Neon dashboard, update `.env.prod` + Vercel, verify prod + a prodsnap re-pull.
- **Done means:** new password live; old one invalid; `.env.prod` + Vercel updated; prod reachable.
- **Depends on:** nothing (operator does the dashboard step).

#### SESSION_0451_TASK_03 — SESSION_0446 stale-security-docs audit

- **Agent:** Giddy/Doug
- **What:** The `docs/security/*` set was written for the dead multi-brand model. Trim/keep/update —
  distinguish the still-load-bearing host→brand security gate (MB-002, KEEP-FOREVER) from multi-brand-only
  hardening. Don't blind-delete risk rows; update rationale.
- **Done means:** `docs/security/*` reflects the single-brand-collapse + multi-product reality; MB-002 clearly
  marked load-bearing.

#### SESSION_0451_TASK_04 — A BBL feature lane from POST_LAUNCH_SOT.md (operator's pick)

- **Agent:** Petey → Cody
- **What:** Pick a P0/P1 from `docs/product/black-belt-legacy/POST_LAUNCH_SOT.md` (e.g. the blog Tiptap editor
  gap per `[[dirstarter-changelog-gaps]]`, or another). Plan → build → verify.
- **Done means:** the chosen feature shipped + verified (PR route if schema/public-surface).

#### SESSION_0451_TASK_05 — (future/optional) "BJJ courses under a Baseline school listing on BBL"

- **Agent:** Petey (grill first — product decision)
- **What:** The 0450 idea — surface the Baseline Martial Arts school + its BJJ courses on BBL. This is a
  *feature* (re-brand those rows to BBL, or build a cross-brand listing), not cleanup. Grill scope first.
- **Done means:** scope decided; deferred unless the operator wants it now.

### Open decisions

- Which lane(s) to run — operator's call at bow-in. Tasks are independent; any subset works.

### Scope guard

- Do NOT touch the `brand` column / `Brand` enum / `lib/brand-context.ts` (Stage-2 parked; column is the
  multi-product separator). The banked purge `scripts/purge-non-bbl-baseline-data.ts` is for the FUTURE
  Baseline extraction only — do not run it.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0451_TASK_01 | pending | memory/docs de-dup leftovers |
| SESSION_0451_TASK_02 | pending | rotate prod Neon password |
| SESSION_0451_TASK_03 | pending | security-docs audit |
| SESSION_0451_TASK_04 | pending | BBL feature from POST_LAUNCH_SOT |
| SESSION_0451_TASK_05 | pending | (future) Baseline-courses-on-BBL feature |

## Next session

### Goal

<set at bow-out>

### First task

<set at bow-out>
