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
| 0642 | auto/session-0642-curriculum-wave3 | claude Sonnet | G-013 Wave-3 (B3/C3/G2 + E1 stretch, verify-first) | PR open (wave 2) |
| 0643 | auto/session-0643-mmb-engagement-pack | claude Sonnet | MMB engagement doc pack (G-028 content layer) | PR open (wave 2) |
| 0644 | auto/session-0644-mmb-seo | codex | MMB SEO/metadata foundation (mammothmb.com) | local commit → orchestrator pushes → PR |
| 0645 | auto/session-0645-rr-mmb-pricing | claude Fable | /rr pricing research + Michael one-pager (father-notes anchors: $8–10K site, $100–200/hr, retainer-then-hourly, change-control doctrine, PMBA resolve) | PR open (wave 2) |
| 0646 | auto/session-0646-mmb-pitch-deck | claude Sonnet | "Ronin Building Design" pitch deck (structurewebworks + yt-short refs, infographic slide) | PR open (wave 2) |
| 0647 | auto/session-0647-3d-prototype | codex | three.js metal-building 3D prototype | local commit → orchestrator pushes → PR |
| 0648 | auto/session-0648-rdd-industries | claude Sonnet | RDD /industries pages (structurewebworks pattern, Ronin Building Design page) | PR open (wave 2) — **⚠ merge auto-deploys live ronindojodesign.com; Desi pass + operator copy sign-off first** |

> **Wave-2 additions to the checklist:** merge order per Petey — #269 (0639) first, then 0642 (same
> app, rebase after), then codex 0644/0647 (orchestrator-pushed; full build gate in a normal shell),
> then docs lanes 0643/0645/0646 any order, then 0648 LAST (deploys prod RDD — Desi pass + operator
> copy approval are its merge gates). 0647 morning smoke: `bun
> scripts/prototypes/metal-building-3d/serve.js` → :4173. 0645's PMBA conclusion needs operator
> confirmation. Ronin Building Design niche-brand family is canon (memory `rdd-niche-brand-variants`)
> — consider a goals-ledger row at the ledger-apply step.
> **Wave 3 (launched — continuation wave, all Claude):**
> · 0649 `auto/session-0649-curriculum-journey` — E1 CurriculumJourney on /curriculum (the 0642
>   escalation; G-022 Wave-3 GA bar; additive above the untouched browser; techniques-import ban)
> · 0650 `auto/session-0650-render-deck` — standalone markdown→branded-HTML slide-deck CLI
>   (G-030-adjacent; deliberate token-duplication debt vs frozen #268, consolidation queued)
> · 0651 `auto/session-0651-rr-creator-payout` — /rr G-009 Stripe-Connect payout research,
>   ALL FORKS LEFT OPEN for the operator (split %, threshold, Express-vs-Standard, attribution, tax)
> Petey's wave-3 rejections (stacking/frozen-file collisions) are documented in the orchestrator
> transcript; zero codex lanes (budget). Wave-2/-3 stale-ledger corrections to fold at ledger-apply:
> G-013 superseded by G-022 (0642 finding) · 5 stale WL rows (0636) · graph Wave-2 already landed
> (0637/0642 double-verified).
>
> **Wave 4 (operator-pinned, launches after wave 3 lands — LAST wave):** 3 lanes, ALL FABLE,
> Claude-only (codex budget low), /rr research-recommend on structurewebworks-style social-media
> automation setup: one lane each for RDD (agency presence + packageable client offering), MMB
> (project-photo pipeline / before-after content / review engine / cadence + tooling), BBL
> (lineage/technique content flywheel from platform assets). No builds. If any run dies on limits:
> Claude same-worktree salvage ("reassess disk state first, disk truth over memory") — standing
> operator rule.

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
