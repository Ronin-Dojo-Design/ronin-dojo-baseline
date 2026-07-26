---
title: "SESSION 0653 — Fable /rr — MMB social-media automation setup (photo pipeline, reviews, cadence) (overnight auto lane, wave 4 — final)"
slug: session-0653
type: session--plan
status: closed
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0653
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0653 — Fable /rr — MMB social-media automation setup (photo pipeline, reviews, cadence) (overnight auto lane, wave 4 — final)

> Staged by the SESSION_0635 overnight orchestrator (wave 4 — the operator-pinned FINAL wave: 3×
> Fable /rr, social-media automation, structurewebworks-style service framing). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0653-rr-mmb-social`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

Fable /rr — MMB social-media automation setup (photo pipeline, reviews, cadence) — research-recommend ONLY; operator forks presented OPEN.

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0653_TASK_01 | done | /rr research + recommendation: MMB social-media automation (platforms, photo→post pipeline, review engine, tooling, industry examples) — research-review + client-facing playbook draft written; all forks OPEN |

## What landed

- **`docs/architecture/research/research-review-mmb-social-automation.md`** (new) — the evidence
  base: observed state of mammoth.build (FB + IG linked, **no GBP link**, no YouTube/LinkedIn/
  TikTok; site content-rich and social-ready), structurewebworks framing study (sell operations,
  not impressions), sourced market facts (discovery = Google/Maps + reviews; cadence norms; SMS
  review-request conversion windows; scheduler/automation/review-tool cost landscape; Morton/Nucor
  observed social patterns), the CRM automation seam (BuildPhoto → posts; Satisfied Installation →
  review request; Lead Source → cost-per-customer reporting), a recommended default, and **6 OPEN
  forks** (platform priority · who posts · scheduler · review buy-vs-CRM-native-build · budget
  tier · YouTube timing).
- **`docs/product/mammoth-build/social-automation-playbook-draft.md`** (new) — client-facing DRAFT
  (watermarked, no prices, no commitments), branded Ronin Building Design: the three engines
  (proof / review / measurement), platform lineup, 4-week starter cadence template with
  placeholder slots, who-provides-what split, setup questions for Michael.

### Key findings

- mammoth.build already links a (young) Facebook page + `@mammothmetalbuildings` Instagram; the
  **Google Business Profile — the evidence-backed highest-ROI surface for a contractor — is
  absent from the site entirely**. That is the cheapest, highest-leverage fix.
- The MMB CRM already models both automation triggers: `BuildPhoto` (before/during/after = the
  content pipeline's raw material) and Satisfied Installation (the ideal review-request moment,
  90min–3h post-completion being the sourced conversion window). The service is a projection of
  existing proof, not a new content burden on Michael.
- Podium/Birdeye-class review tools (~$299–599/mo list) are overkill at this scale; NiceJob-class
  (~$75/mo) is the buy option; the CRM-native build is the moat option (kernel feature-module,
  resellable).
- Category pattern (Morton = ~243K FB / ~31K IG / YouTube tour channel; Nucor = corporate B2B
  posture): the dealer/builder tier wins on **local project proof**, not brand content.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/research-review-mmb-social-automation.md` | new — /rr evidence base + recommendation + 6 open forks |
| `docs/product/mammoth-build/social-automation-playbook-draft.md` | new — client-facing DRAFT playbook (Ronin Building Design) |
| `docs/sprints/SESSION_0653.md` | adopted (staged → in-progress → this close) |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0653` · `auto/session-0653-rr-mmb-social` — exit 0 |
| `curl https://mammoth.build` (WebFetch 403; curl w/ UA) | exit 0, 152,920 bytes; social links + full page text extracted via python |
| Docs-only lane | no code gates applicable; no app/ledger/frozen files touched |

## Sources (primary ones; full citations inline in the research review)

- structurewebworks.com (homepage + /industries/contractors) — service-framing study
- mammoth.build — live-site observation (2026-07-24)
- CallRail home-services stats · Improve & Grow contractor market report 2025 · Minyona GBP guide
- BrightLocal / Shapo / BizIQ / OnTheMap — review + local-SEO statistics
- Hootsuite / Buffer / Constant Contact / HeyOrca / Richwood / GMB API — cadence norms
- CompanyCam / SD Marketing Pros / BuildBook / Viryze — job-site photo workflow + video formats
- Starworks / Applause / TrueReview / WiserReview / US Tech Automations — review-request timing/conversion
- Buffer/Metricool/Eclincher (schedulers) · Digital Applied/Zignuts/FuturePicker (Zapier/Make/n8n) ·
  Authencio/Replifast/TrueReview/WiserNotify (NiceJob/Podium/Birdeye)
- Morton Buildings (FB/IG/YouTube) · Nucor Buildings Group (FB/YouTube) · Nucor Corp (IG) — observed examples

## Proposed ledger edits

> Proposed only — this lane does not touch ledgers (wiki/** frozen). AM merge owner applies.

- **G-019 pointer:** add a pointer from G-019 to
  `docs/architecture/research/research-review-mmb-social-automation.md` (MMB social program
  research landed; forks open).
- **Goals-row suggestion:** new row "**MMB social program**" — owner Brian; Next Action = run the
  6 forks (research review §4) with the operator, then walk the playbook draft with Michael.

## Open decisions / blockers

- All 6 forks in the research review §4 are OPEN (platform priority, who posts, scheduler,
  review-tool buy vs CRM-native build, budget tier, YouTube timing). Recommended defaults stated,
  nothing decided.
- Meta blocks unauthenticated page reads — Mammoth FB/IG post history unverified; check at kickoff.
- Whether a Mammoth GBP exists unclaimed (vs create-new) needs a Maps check at kickoff.

## Residual for AM merge

- Apply the two proposed ledger edits above (G-019 pointer + MMB goals row).
- Operator: pick forks, then the playbook draft graduates from DRAFT for the Michael walkthrough.
- Optional: verify the review-request consent language question against the intake-form plans in
  the engagement lane (frozen `engagement/**` files in open PRs may already cover intake).

