---
title: "SESSION 0645 — auto-claude /rr services+pricing research + Michael one-pager (overnight auto lane, wave 2)"
slug: session-0645
type: session--implement
status: in-progress
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0645
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0645 — auto-claude /rr services+pricing research + Michael one-pager (overnight auto lane, wave 2)

> Staged by the SESSION_0635 overnight orchestrator (wave 2, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Dispatch payload = the lane prompt; its HARD
> RULES are binding. Branch: `auto/session-0645-rr-mmb-pricing`.

## Date

2026-07-24

## Operator

Brian (asleep) + autonomous lane, orchestrated by claude-session-0635

## Goal

auto-claude /rr services+pricing research + Michael one-pager — one tightly-scoped item, zero open forks (all pinned in the lane prompt).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0645_TASK_01 | done | /rr research review — MMB services & pricing (market ranges · performance pricing · metal-building niche · recommendation matrix) |
| SESSION_0645_TASK_02 | done | Client-facing "Ronin Building Design — Engagement Options" one-pager (4 named options, indicative-not-a-quote) |

## What landed

- `docs/architecture/research/research-review-mmb-services-pricing.md` — cited market ranges for
  site builds / maintenance / SEO / social / content / AI consulting; performance-pricing analysis
  (per-qualified-lead, rev-share, hybrid — hybrid-only recommended); Structure Webworks comp study;
  **PMBA resolved to MBMA (mbma.com) — flagged for operator confirmation**; 6 MBMA member reference
  sites + published guidelines; recommendation matrix anchored to the operator-pinned constraints
  ($8–10K fixed-scope build · $100–200/hr T&M · retainer-then-hourly stack · AI engagement ·
  commission-on-lead as ADD-ON only). Recommended default: Fixed-Scope Build + Retainer stack,
  commission rider later.
- `docs/product/mammoth-build/engagement/pricing-options-onepager.md` — one-page client-facing
  "Ronin Building Design — Engagement Options": Fixed-Scope Build / Build + Growth Retainer /
  Time & Materials / Performance Hybrid (add-on); explicit indicative-not-a-quote disclaimer; no
  PII, no commitments, no signature blocks.

## Files touched

| File | Change |
| --- | --- |
| docs/architecture/research/research-review-mmb-services-pricing.md | created (Deliverable 1) |
| docs/product/mammoth-build/engagement/pricing-options-onepager.md | created (Deliverable 2; `engagement/` dir created) |
| docs/sprints/SESSION_0645.md | adopted (staged → in-progress → this record) |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0645` · `auto/session-0645-rr-mmb-pricing` — exit 0 |
| Research lane — no app code, no builds, no deps | n/a by design (HARD RULES) |

## Citation self-audit (gate)

Every numeric range in the research review → its citations (all accessed 2026-07-24):

| Numeric range | Citations |
| --- | --- |
| Site build: freelance $500–$5K · SMB custom $2K–$8K (adv $15K+) · broader $3K–$12K · boutique $5K–$15K / $6K–$35K+ · agency entry $4K–$6K | levitate.ai · jim.com · digitalapplied.com · gruffygoat.com |
| Hourly context: senior avg ≈$128/hr, $100–$180+ routine; US freelance $50–$150 median ≈$85 | arc.dev · solohourly.com |
| Maintenance: $20–$50 DIY · $75–$200 professional · $95–$195 full-service · $350+/$550 premium | websitemaintenanceservices.org · webfx.com · ancientcitygroup.com |
| SEO: local $500–$1.5K · common tier $1.5K–$5K (48%; 43.3% <$1.5K) · comprehensive $2.5K–$5K · avg ≈$2,917 · GEO/AEO $900+/mo | digitalapplied.com · abstraktmg.com · responsivewebdeveloper.com · boulderseomarketing.com |
| Social: freelance $300–$1.5K/mo ($25–$100+/hr) · basic $500–$1.5K · typical $1K–$5K · full $2.5K–$7.5K+ | sproutsocial.com · boomp.net · lyfemarketing.com |
| Content: post $100–$300 ($0.10–$0.50/word) · long-form $500–$2K · retainer $2K–$3.5K · SMB program $3K–$7.5K · agency $4K–$10K | siegemedia.com · brandonrollins.com · feedbird.com |
| AI consulting: solo $80–$200/hr · boutique $150–$300 (span $80–$600) · SMB project $5K–$25K · 4–6-wk impl $10K–$15K · retainer $2K–$8K/mo · fractional $5K–$15K/mo | groovyweb.co · thecrunch.io · aiessentials.us |
| Performance: PPL $20–$200/lead (legal/fin $200–$500+) · rev-share 10–30% · hybrid 50–70% base + bonus examples | clicksgeek.com · ttmc.co.uk · stackmatix.com · dojoai.com · sevenfigureagency.com |
| MBMA facts: founded 1956 · ≈28,000 buildings/yr · 2024 manual · member roster | mbma.com · en.wikipedia.org · 360connect.com · store.accuristech.com |
| One-pager ranges ($8K–$10K · $100–200/hr · $500–$2,500/mo retainer) | operator-pinned anchors; retainer band composed from the maintenance+SEO+social entry tiers above |

## Proposed ledger edits

NOT applied (HARD RULES: no wiki/ledger writes from this lane) — for the AM merge owner:

- `docs/knowledge/wiki/goals-ledger.md` **G-019** (Mammoth landing resurrection + flesh-out): add
  pointer — pricing/services research + client one-pager landed SESSION_0645:
  `docs/architecture/research/research-review-mmb-services-pricing.md` +
  `docs/product/mammoth-build/engagement/pricing-options-onepager.md` (the "Ronin Building Design"
  framing + Structure Webworks comp + MBMA reference sites feed the landing flesh-out).
- `docs/knowledge/wiki/goals-ledger.md` **G-028** (Branded client-onboarding artifacts, RDD
  agency): add cross-ref — engagement/pricing one-pager pattern landed SESSION_0645 at
  `docs/product/mammoth-build/engagement/pricing-options-onepager.md`; candidate template for the
  G-028 onboarding-artifact family (pairs with Initial Client Meeting / MSA / NDA).

## Open decisions / blockers

- **PMBA → MBMA identification needs operator confirmation** (research review §c.2). No literal
  "PMBA" org exists; MBMA (Metal Building Manufacturers Association) is the near-certain referent
  given Mammoth = PEMB seller; NFBA checked and ruled less plausible (post-frame/wood).
- One-pager retainer band ($500–$2,500/mo) composes entry tiers of the three growth services —
  operator may want to tune before it reaches Michael.

## Residual for AM merge

- Apply the two proposed goals-ledger pointer edits above (merge owner).
- Operator: confirm the MBMA identification; review one-pager tone/ranges before any client send.

