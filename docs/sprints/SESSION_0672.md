---
title: "SESSION 0672 — Fable /rr — QuickBooks integration (Julie bookkeeping + Claude connector + invoice pipeline) (auto lane, wave 11/12)"
slug: session-0672
type: session--implement
status: review
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0672
sprint: S12
lane: mmb
goal_ids: []
pairs_with:
  - docs/sprints/SESSION_0635.md
  - docs/sprints/SESSION_0641.md
backlinks:
  - docs/knowledge/wiki/index.md
---

# SESSION 0672 — Fable /rr — QuickBooks integration (Julie bookkeeping + Claude connector + invoice pipeline) (auto lane, wave 11/12)

> Staged by the SESSION_0635 orchestrator (waves 11+12, operator-directed). Adopt at lane start:
> flip `status:` → `in-progress`, set `last_agent:`. Branch: `auto/session-0672-mmb-quickbooks-rr` (base: main).

## Date

2026-07-24

## Operator

Brian + autonomous lane, orchestrated by claude-session-0635

## Goal

Fable /rr — QuickBooks integration (Julie bookkeeping + Claude connector + invoice pipeline).

## Task log

| ID | Status | Summary |
| --- | --- | --- |
| SESSION_0672_TASK_01 | done | /rr research: QBO API surface (OAuth2, Invoice/Bill endpoints, no-draft-state gotcha, rate limits, sandbox/prod-key gating, 2026 plan pricing) — ≥2 sources per fact, accessed 2026-07-24 |
| SESSION_0672_TASK_02 | done | /rr research: QuickBooks↔Claude paths — official Intuit connector (live, US, Feb 2026 Intuit–Anthropic partnership), official Intuit MCP server (144 tools/29 entities), Zapier/Make bridges |
| SESSION_0672_TASK_03 | done | Deliverable 1: `research-review-mmb-quickbooks-integration.md` — evidence base + options table + recommendation + 6 open forks |
| SESSION_0672_TASK_04 | done | Deliverable 2: `billing/quickbooks-julie-workflow-draft.md` — DRAFT client-facing one-pager, approval gates explicit, Julie named as role only |

## What landed

- **Research review** (`docs/architecture/research/research-review-mmb-quickbooks-integration.md`):
  the evidence base for the MMB QuickBooks question. Headline findings:
  - **An official Intuit QuickBooks connector for Claude is live** (Intuit–Anthropic
    partnership, announced 2026-02-24, rolling out since spring 2026; US-only) — creates
    invoices/estimates with payment links, imports transactions, pulls P&L/cash-flow/
    benchmarks; confirm-before-write; conversation-driven only (no background automation —
    which matches the human-gate constraint by construction).
  - **QBO API has no draft-invoice state** — the approval gate in any API flow is "create
    with `EmailStatus: NotSet`, never call `/send`"; a human sends from QBO.
  - **Books-side framing:** an RDD invoice in *Mammoth's* QBO is a **Bill** (AP, vendor=RDD),
    not an Invoice — and Bill entry needs Essentials+ (Simple Start = expense-at-payment).
  - **Recommendation (forks open):** ship option (2) zero-integration this week (PDF/email →
    Julie enters it; two human gates for free); pilot the official connector on the Mammoth
    side as step two (doubles as the §1d AI-consulting upsell: categorization drafts, report
    summaries, receivables-chasing *drafts*); hold the custom dev-app/API path until volume
    triggers fire — and if it fires, prefer the official Intuit MCP server over hand-rolled
    API code. Skip Zapier/Make at this volume.
- **Julie workflow one-pager** (`docs/product/mammoth-build/billing/quickbooks-julie-workflow-draft.md`):
  DRAFT-watermarked, client-facing; today's manual flow, the optional Claude-connector
  assist, what stays manual forever (sending, paying, posting), and the "later, only if it
  earns it" API path — every approval gate named inline.

## Files touched

| File | Change |
| --- | --- |
| `docs/architecture/research/research-review-mmb-quickbooks-integration.md` | NEW — /rr evidence base + options table + recommendation + open forks |
| `docs/product/mammoth-build/billing/quickbooks-julie-workflow-draft.md` | NEW — DRAFT client-facing Julie workflow one-pager (billing/ dir created in this branch; only this file touched — 0667's billing files live unmerged on their own branch) |
| `docs/sprints/SESSION_0672.md` | adopted (status → in-progress → review), task log + close-out |

## Verification

| Command / smoke | Result (REAL exit code — no pipes) |
| --- | --- |
| `pwd` + `git branch --show-current` before writes | `/Users/brianscott/dev/ronin-0672` · `auto/session-0672-mmb-quickbooks-rr` — exit 0 |
| `git show origin/auto/session-0667-mmb-billing:.../invoice-mmb-draft.md` (ref-store read) | exit 0 — invoice pipeline context loaded without touching the unmerged branch |
| `git show origin/auto/session-0669-client-invoice-proto:.../client-invoice/README.md` | exit 0 — prototype context loaded |
| Docs-only lane — no build/test gates apply | n/a |

## Sources

All accessed 2026-07-24. Primary: Intuit press release (investors.intuit.com, 2026-02-24
Intuit–Anthropic partnership) · claude.com/connectors/intuit-quickbooks ·
github.com/intuit/quickbooks-online-mcp-server · developer.intuit.com OAuth docs ·
help.developer.intuit.com (throttling, refresh-token validity, token expiration) ·
quickbooks.intuit.com connector help article · support.claude.com connector articles.
Secondary corroboration: Apideck (Invoice API guide), Satva Solutions (API guide + rate
limits + dev portal), Zuplo, Codat (app-assessment questionnaire), NerdWallet + Fit Small
Business + Costbench (QBO 2026 pricing), Scalekit (MCP vs API), Zapier + Make integration
pages, usecarly.com (flagged: predates connector launch). Full inline citations in the
research review. Note: developer.intuit.com deep pages + the Intuit help article
intermittently ECONNRESET from this environment — facts corroborated via help-center search
surface + independent secondaries where the primary page would not render.

## Proposed ledger edits

> Pointer proposals only — this lane writes no ledgers.

- **ronin-project-context.md (portfolio map / MMB section):** add a pointer to
  `research-review-mmb-quickbooks-integration.md` as the QuickBooks-integration decision base
  for the Mammoth engagement.
- **mammoth-build docs hub (wherever the 0667 billing/ set merges):** cross-link
  `quickbooks-julie-workflow-draft.md` from `invoice-mmb-draft.md`'s payment-terms
  placeholder section (fork F6 feeds that placeholder).
- **Possible ADR (operator call, post-fork-resolution):** "MMB QuickBooks handoff — manual
  first, connector second, API deferred" once F1–F4 are answered with Michael/Julie.

## Open decisions / blockers

- Forks F1–F6 in the research review §4 — all OPEN for the operator + the Michael/Julie
  conversation (QBO plan, dev-app ownership, connector seat, Julie-automation scope, RDD's
  own QBO company, payment rails).
- Connector visibility from Michael's actual Claude account is unverified (US requirement
  met; plan/rollout state must be checked from his seat — in-workspace MCP-registry probe
  returned zero results, treated as non-evidence).

## Residual for AM merge

- `billing/` dir collision is by-design: 0667's branch holds `invoice-mmb-draft.md` /
  `hours-worksheet.md` / `rdd-client-invoice-template.md`; this branch adds ONLY
  `quickbooks-julie-workflow-draft.md`. Merge order doesn't matter — no shared files.
- Julie one-pager stays DRAFT until Brian reviews wording; it references the connector pilot
  which is itself fork-gated.
- Research review `status: research-review` — flip to `active`/`decided` only after forks
  close.

