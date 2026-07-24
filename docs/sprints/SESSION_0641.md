---
title: "SESSION 0641 — AM Coffee Merge Review: overnight 5-lane wave + 0632/0633/0635 sweep"
slug: session-0641
type: session--open
status: staged
created: 2026-07-24
updated: 2026-07-24
last_agent: staged-session-0641
sprint: S12
lane: repo
recipe: "AM_Coffee_Merge_Review"
goal_ids: [G-033, G-013, G-019, G-030]
pairs_with:
  - docs/sprints/SESSION_0635.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0641 — AM Coffee Merge Review: overnight 5-lane wave + 0632/0633/0635 sweep

> **Pre-staged by SESSION_0635 (the overnight orchestrator). ATTENDED session — coffee-gated, one
> merge owner.** Adopt: flip `status:` → `in-progress`. This stub is the baton; the lane inventory
> below is the work list.

## Operator

Brian + <agent>-session-0641

## Goal

Merge-sweep the whole outstanding wave under ONE merge owner: the three attended lanes
(0632 intake-kernel, 0633 deploy-planning, 0635 RDD-go-live = PR #264) plus the five overnight auto
lanes (0636–0640), then apply every lane's "Proposed ledger edits" + assign pooled finding ids in ONE
canonical commit. Gate ladder: `docs/protocols/recipes/merge-wave.md` (G0→G4).

## Lane inventory (merge queue)

| Session | Branch | Driver | Item | Expected state at AM |
| --- | --- | --- | --- | --- |
| 0632 | session-0632-intake-kernel | claude (attended) | client-intake kernel WS-A/B/C | PR open (green per operator) |
| 0633 | session-0633-brand-deploys | claude (attended) | RDD+MMB deploy planning | PR open (green per operator) |
| 0635 | session-0635-rdd-golive | claude (attended) | RDD go-live + G-033 mint + this stub | PR #264 open |
| 0636 | auto/session-0636-wl-tokens | codex gpt-5.5 | WL-P3-58 dead-token fixes + stale-WL sweep | local commit pushed by orchestrator → PR |
| 0637 | auto/session-0637-graph-wave2 | codex gpt-5.5 | technique-graph C5/D3/B2 | local commit pushed by orchestrator → PR |
| 0638 | auto/session-0638-mmb-landing | claude Sonnet | G-019 Mammoth landing port | PR open |
| 0639 | auto/session-0639-inbox-module | claude Fable | G-033 slice 1 (InboundEmail + /app/inbox) | **DRAFT** PR (migration unapplied) |
| 0640 | auto/session-0640-doc-renderer | claude Sonnet | G-030 v1 doc renderer | PR open |

## Merge-owner checklist (from the 0635 dispatch — do IN ORDER)

1. **G0 recon:** `gh pr list` + per-lane SESSION file read (Verification + Residual sections). Any lane
   that violated its HARD RULES → quarantine its PR, don't merge.
2. **Rebase + full gates per lane** (in-lane green predates the rebase — re-run after rebase onto
   current main): typecheck · lint · `bun run test` (full, uncontended, REAL exit codes — no pipes) ·
   build · affected e2e. Codex lanes never ran builds/DB tests — this is their first full gate.
3. **0639 special (G-033):** apply the hand-authored migration to local DB + prodsnap rehearsal ·
   `prisma generate` · dev-login smoke `/app/inbox` · THEN flip the draft. Register the Resend webhook
   endpoint + `RESEND_WEBHOOK_SECRET` (operator, Resend dashboard) — module is dark until then.
4. **0637 special:** Desi pass on C5/D3/B2 (motion quality, reduced-motion, keyboard) — gates prove
   types, not design.
5. **0636 special:** computed-style visual probe on the three fixed surfaces (class presence ≠ paint).
6. **Ledger apply:** collect every lane's "## Proposed ledger edits" + SESSION_0635 `## Findings to
   route` → assign FS/D/WL/GOAL ids via `ledger-id-next` → apply to canonical ledgers in ONE commit.
   Includes: G-027 flip check (RDD deploy delivered), G-033 id-uniqueness verify, the two runbook
   corrections (per-domain dashboard IP · inbound-MX diagram vs live), PL pipe-masking recurrence,
   root-vercel.json `_comment` FS-candidate.
7. **Cleanup:** remove merged `../ronin-NNNN` worktrees + `auto/*` branches (don't re-grow WL-P3-57);
   `GRAPHIFY_VIZ_NODE_LIMIT=10000 graphify update .` from canonical; release/verify canonical claim.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0641_TASK_01 | pending | G0 recon + quarantine check |
| SESSION_0641_TASK_02 | pending | per-lane rebase + full gates + merges |
| SESSION_0641_TASK_03 | pending | 0639 migration apply + smoke + draft flip |
| SESSION_0641_TASK_04 | pending | ledger apply (ONE commit) |
| SESSION_0641_TASK_05 | pending | worktree/branch cleanup + graphify |

## What landed

## Open decisions / blockers

## Next session

### Goal

### First task
