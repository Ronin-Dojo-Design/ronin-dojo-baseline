---
title: "SESSION 0652 — Fable /rr — RDD social-media automation setup (agency presence + packageable client offering) (overnight auto lane, wave 4 — final)"
slug: session-0652
type: session--plan
status: complete
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0652
sprint: S12
lane: rdd
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0652 — Fable /rr — RDD social-media automation setup (agency presence + packageable client offering) (overnight auto lane, wave 4 — final)

> Staged by the SESSION_0635 overnight orchestrator (wave 4 — the operator-pinned FINAL wave: 3×
> Fable /rr, social-media automation, structurewebworks-style service framing). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0652-rr-rdd-social`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

Fable /rr — RDD social-media automation setup (agency presence + packageable client offering) — research-recommend ONLY; operator forks presented OPEN.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0652_TASK_01 | done | /rr research-review written: RDD social-media automation (agency presence + packageable client offering), forks OPEN |

## What landed

- `docs/architecture/research/research-review-rdd-social-automation.md` — cited research-review
  covering both angles: ① RDD's own presence (LinkedIn-founder-first for the umbrella;
  FB/IG-first playbook for the trade-niche variants, start-gated on real work-product) and
  ② the packageable social-automation service (structurewebworks comp studied: process-not-prices
  packaging, consult-driven — compatible with the no-numbers-until-ratified brand rule).
- Tooling comparison (solo operator, multi-brand axis): Metricool per-brand SaaS vs Buffer/Later/
  Publer billing-unit mismatches vs self-hosted Postiz/Mixpost + n8n (~$0 license + VPS) vs native
  scheduling bootstrap; X API now pay-per-use (deprioritize).
- Recommended automation flows (work-product → AI draft → human approval queue → scheduler; the
  brand-brief hard rules as a literal pre-publish gate; NO auto-publish at v1), a 4-week
  placeholder cadence template, service tier sketch (Presence / Growth / Engine, retainer-then-
  hourly doctrine, numbers deferred), cost-to-run ~$0–70/mo.
- Six OPEN forks argued with recommended defaults: F1 platform priority · F2 SaaS tool ·
  F3 self-hosted vs SaaS · F4 AI-assist level · F5 when to start niche-variant accounts ·
  F6 ship the service page now.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/research-review-rdd-social-automation.md` | NEW — the /rr deliverable |
| `docs/sprints/SESSION_0652.md` | adopted (staged → in-progress → this close-out) |

## Sources

All cited inline with URLs, accessed 2026-07-24; ≥2 sources per claimed market fact. Primary
fetches: ronindojodesign.com (live, no social links yet) · structurewebworks.com + /services ·
metricool.com/pricing · buffer.com/pricing · github.com/gitroomhq/postiz-app. Full source list at
the bottom of the review doc.

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` in worktree | `/Users/brianscott/dev/ronin-0652` · `auto/session-0652-rr-rdd-social` — exit 0 |
| `git status --short` (only the two owned paths staged) | exit 0 |

## Proposed ledger edits

- **goals-ledger (proposal only — NOT edited by this lane):** add row **"RDD social-automation
  program"** — stand up RDD's own social presence (LinkedIn-founder-first) + the packageable
  client-facing social retainer, citing
  `docs/architecture/research/research-review-rdd-social-automation.md`; blocked on the six
  operator forks (F1–F6) in that doc. Wire-up owner: AM merge session.

## Open decisions / blockers

- All six forks (F1–F6) in the review doc are OPEN for the operator — recommended defaults marked ⭐,
  none decided. No blockers; lane completed clean.

## Residual for AM merge

- Operator to decide forks F1–F6 (platform priority · tool choice · self-hosted vs SaaS · AI-assist
  level · niche-variant account timing · service-page timing).
- If ratified: add the proposed goals-ledger row (above) and, per F6, sequence the services-page
  update after `research-review-mmb-services-pricing.md` (open PR) merges.
- F5 note: reserving "Ronin Building Design" handles is a zero-cost option-preservation step the
  operator can do any time — the doc recommends reserve-but-don't-post.

