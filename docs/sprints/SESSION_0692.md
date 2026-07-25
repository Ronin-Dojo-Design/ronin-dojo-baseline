---
title: "SESSION 0692 — AM Coffee Merge Review (heir to 0641): the 0681 daytime wave-15/16 run"
slug: session-0692
type: session--staged
status: staged
created: 2026-07-24
updated: 2026-07-24
last_agent: session-0681-orchestrator
sprint: S12
lane: repo
recipe: "AM_Coffee_Merge_Review"
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0681.md
  - docs/protocols/recipes/AM_Coffee_Merge_Review.md
  - docs/protocols/recipes/overnight-orchestrator-waves.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0692 — AM Coffee Merge Review (the 0681 daytime run)

> **Staged by SESSION_0681 (the gold-standby daytime orchestrator).** This is the merge baton for the
> waves-15/16 fan-out. **0692 is the ONLY merge owner** for these lanes — SESSION_0681 never merges,
> never deploys. Adopt: flip `status:` → `in-progress`, run the
> [AM_Coffee_Merge_Review](../protocols/recipes/AM_Coffee_Merge_Review.md) checklist below. Live
> dispatch record = SESSION_0681's orchestrator PR (updated after every wave).

## Lane inventory (waves 15 + 16)

| Session | Branch | Driver | Item | Expected @ AM |
| --- | --- | --- | --- | --- |
| 0684 | `auto/session-0684-mmb-gbp-pack` | Opus | MMB Google Business Profile submission pack | PR open · **docs-only** |
| 0685 | `auto/session-0685-mmb-review-engine` | Sonnet | MMB review-request engine (consent/TCPA, drafts→approve, no send) | PR open · **migration-apply = merge step** (mmb own DB) · Larry-reviewed |
| 0686 | `auto/session-0686-bbl-approval-queue` | Fable | BBL social-flywheel approval-queue (consent-gated, new AdminCollection surface + model) | PR open · **new Prisma model + migration** · **apps/web → deploys BBL prod on merge** · Larry-reviewed |
| 0687 | `auto/session-0687-mmb-posting-pipeline` | Sonnet | MMB posting pipeline (drafts→approve, no post) | PR open · **migration-apply = merge step** (mmb own DB) |
| 0688 | `auto/session-0688-bbl-og-publish-path` | Fable | BBL OG celebration-card publish path (feeds the approval-queue) | PR open · **STACKS on 0686 — MERGE-AFTER 0686** · apps/web deploy |
| 0689 | `auto/session-0689-handle-reservations` | Opus | RDD/MMB handle-reservation worksheet | PR open · **docs-only** |
| 0690 | `auto/session-0690-rdd-linkedin-calendar` | Opus | RDD founder-LinkedIn content calendar | PR open · **docs-only** |
| 0691 | `auto/session-0691-codex-quality-social-inbox` | Fable (codex-credits salvage) | quality-suite hardening of merged social+inbox code | PR open · **behavior-preserving, no schema change** · apps/web |

## Specials (read before merging)

- **Declared stack:** 0688 branches from 0686's head — merge 0686 first, then 0688. Undeclared stacks
  are a quarantine offense; this one is declared.
- **Migrations:** 0685, 0686, 0687 add Prisma models. apps/web (0686) applies via `prebuild → migrate
  deploy` on merge; mmb-crm (0685/0687) has its own DB (ADR 0038) — sequence its migration per that
  app's flow. Rehearse migrations before merge.
- **Prod-deploy-gated:** every apps/web PR (0686, 0688, 0691) auto-deploys **blackbeltlegacy.com** on
  merge (vercel `ignoreCommand`). None touch `apps/rdd`. Confirm the operator wants the BBL deploy
  before merging those three.
- **Consent/TCPA:** 0685 + 0686 (+ 0687) gate any send/publish behind explicit consent + approval and
  build to STOP at "approved" — no auto-send wired. Larry (legal) review is folded in the wave-16
  review pass; re-confirm the consent basis survived any rebase.
- **External actions still held for the operator:** GBP claim (0684), handle reservations (0689),
  LinkedIn scheduling (0690), and any actual social publish/send. Merging the code does NOT perform them.

## Merge-owner checklist (AM_Coffee_Merge_Review)

1. Recon: `gh pr list`; read SESSION_0681's orchestrator PR (the live dispatch record) top-to-bottom.
2. Quarantine check: any undeclared stack / shared-ledger write / frozen-file touch → quarantine.
3. Per lane, in dependency order (0686 before 0688): rebase onto current `main`, run the FULL gate
   set (typecheck / oxlint / oxfmt / tests / wiki-lint + `next build` for apps/web) with REAL exit
   codes, then merge `--squash --delete-branch`.
4. Specials: apply migrations; honor the 0688→0686 stack; hold apps/web deploys for the operator's word.
5. Ledger apply in ONE commit: fold EVERY lane's `## Proposed ledger edits` into the canonical
   ledgers, minting ids via `ledger-id-next`.
6. Cleanup: remove merged-lane worktrees (`../ronin-0684..0691`); leave `../ronin-0681` (orchestrator).

## Next session

### Goal

### First task
