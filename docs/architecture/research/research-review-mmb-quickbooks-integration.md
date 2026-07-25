---
title: "Research Review — MMB QuickBooks Integration (Julie workflow + Claude connector + invoice pipeline)"
slug: research-review-mmb-quickbooks-integration
type: research-review
status: research-review
created: 2026-07-24
updated: 2026-07-24
last_agent: claude-session-0672
pairs_with:
  - docs/product/mammoth-build/billing/quickbooks-julie-workflow-draft.md
backlinks:
  - docs/sprints/SESSION_0672.md
tags:
  - mammoth-build
  - billing
  - quickbooks
  - integrations
---

# Research Review — MMB QuickBooks Integration

/rr lane, SESSION_0672 (research + recommend; forks OPEN, nothing built). Question: **how should
the RDD invoice pipeline hand off to QuickBooks, and what could a Claude + QuickBooks setup do
for Mammoth's own books?** Context: Julie (bookkeeping, Mammoth) runs Mammoth's books in
QuickBooks; Michael uses Claude; RDD now has an invoice pipeline
(`invoice-mmb-draft.md` + `rdd-client-invoice-template.md` on the 0667 branch, and the
fill-and-print `client-invoice` HTML prototype on the 0669 branch).

**Standing constraint carried through every option below: nothing is sent, filed, or posted
anywhere without Brian's explicit approval. Every proposed flow has a human-approval gate at
each send/write boundary.**

## TL;DR — Verdict

**Start with (2) zero-integration this week** — Brian approves the RDD invoice, it goes to
Julie as a PDF/email, she enters it in QuickBooks exactly as she enters any vendor bill.
**Build toward the official Intuit QuickBooks connector for Claude (a stronger form of option
3) as step two** — it launched under the Feb 2026 Intuit–Anthropic partnership, needs no
developer app, and covers both the RDD-invoice handoff *and* the Julie-side bookkeeping wins.
**Defer a custom Intuit developer app / direct API build (option 1)** until invoice volume or
automation scope justifies owning OAuth token plumbing for one-invoice-a-month traffic. All
forks below stay open for the operator + the Michael/Julie conversation.

---

## 1. Evidence base

All sources accessed **2026-07-24**.

### 1a. QuickBooks Online (QBO) API surface

**Auth model.** QBO API access is OAuth 2.0 authorization-code flow via an app registered on
the Intuit Developer portal. Access tokens live ~60 minutes; refresh tokens have a **100-day
rolling expiry and rotate as often as daily** — the integration must durably store the latest
refresh token or the connection dies. ([Intuit: Set up OAuth 2.0](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0);
[Intuit help: Handling OAuth token expiration](https://help.developer.intuit.com/s/article/Handling-OAuth-token-expiration);
[Intuit help: Validity of Refresh Token](https://help.developer.intuit.com/s/article/Validity-of-Refresh-Token))

**Relevant entities/endpoints.**

- **Invoice** (accounts receivable — the *seller's* side): `POST /v3/company/{realmId}/invoice`
  creates one; required fields are `CustomerRef` + a `Line` array.
  `POST /v3/company/{realmId}/invoice/{id}/send` emails it to the customer.
  ([Apideck: QuickBooks Invoice API integration guide](https://www.apideck.com/blog/quickbooks-invoice-api-integration);
  [Intuit API reference: Invoice](https://developers.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice))
- **No true "draft" state exists for API-created invoices.** An invoice created via the API is
  a real posted invoice record; the only send-related field is `EmailStatus`
  (`NotSet` / `NeedToSend` / `EmailSent`). The approval gate in any API flow is therefore
  **"create with `EmailStatus: NotSet` and never call `/send`"** — a human sends from the QBO
  UI. ([Intuit API reference: Invoice](https://developers.intuit.com/app/developer/qbo/docs/api/accounting/most-commonly-used/invoice);
  [Apideck guide](https://www.apideck.com/blog/quickbooks-invoice-api-integration))
- **Bill** (accounts payable — the *buyer's* side): also full CRUD via the API. This matters
  because **an RDD invoice landing in *Mammoth's* QBO is a Bill (vendor = RDD), not an
  Invoice** — see §2. ([Intuit MCP server README — `create_bill` among the exposed tools](https://github.com/intuit/quickbooks-online-mcp-server);
  [Apideck: Exploring the QBO Accounting API](https://www.apideck.com/blog/exploring-the-quickbooks-online-accounting-api))
- **Customer / Payment / reports** (P&L, cash flow, AR aging, general ledger) all have API
  surface. ([Intuit MCP server README](https://github.com/intuit/quickbooks-online-mcp-server);
  [Satva: QBO API guide](https://satvasolutions.com/blog/quickbooks-online-api-guide))

**Rate limits.** 500 requests/min per realm (company), 10 concurrent, batch endpoint
120 req/min (tightened Oct 31 2025); exceeding returns HTTP 429 `ThrottleExceeded` (003001).
Irrelevant at RDD's volume — noted for completeness.
([Intuit help: API call limits and throttling](https://help.developer.intuit.com/s/article/API-call-limits-and-throttling);
[Satva: QBO rate limits](https://satvasolutions.com/blog/quickbooks-online-api-limitations-guide))

**Developer account + sandbox.** Free developer account; free **sandbox companies** with
sample data; sandbox and production use separate keys. **Production keys are gated behind
Intuit's app-assessment questionnaire** (applies even to private apps; usually a fast review).
Free "Builder" tier covers US apps to ~500K calls/month.
([Codat: QBO app assessment questionnaire](https://docs.codat.io/integrations/accounting/quickbooksonline/qbo-app-assessment-questionnaire);
[Satva: Intuit developer portal app setup](https://satvasolutions.com/blog/quickbooks-online-app-using-intuit-developer-portal);
[Zuplo: QuickBooks API developer's guide 2026](https://zuplo.com/learning-center/quickbooks-api))

**QBO plan pricing (what Julie likely runs).** Five tiers (monthly, list, July 2026):
Solopreneur $20 · Simple Start $38 · Essentials $75 · Plus $115 · Advanced $275, with
announced increases effective Aug 1 2026. The API works against every tier. **Gotcha: bill
(accounts-payable) tracking starts at Essentials** — on Simple Start, Julie records vendor
charges as expenses at payment time, not as entered-then-paid Bills. A small construction
supplier most plausibly runs Simple Start or Essentials; Plus if they track per-project
profitability. *Which plan Mammoth actually runs is an open fork — ask.*
([NerdWallet: QuickBooks pricing 2026](https://www.nerdwallet.com/business/software/learn/quickbooks-pricing);
[Fit Small Business: QBO comparison 2026](https://fitsmallbusiness.com/quickbooks-online-comparison/);
[Costbench: QBO pricing](https://costbench.com/software/accounting/quickbooks-online/))

### 1b. QuickBooks ↔ Claude paths

**Official Intuit QuickBooks connector for Claude — exists and is live (US).** Under the
**Intuit–Anthropic multi-year partnership announced Feb 24 2026** (QuickBooks, TurboTax,
Credit Karma, Mailchimp surfaced inside Claude; rollout began spring 2026), Intuit ships a
first-party connector in the Claude connectors directory. Capabilities per Intuit + Anthropic
pages: generate financial reports (P&L, cash flow), industry benchmarking, **import
transactions** (from CSV/PDF/images/pasted text), and **create sales documents — invoices and
estimates — with payment links**, creating customers on the fly. Destructive actions require
in-chat confirmation. End-user OAuth — **no developer app, no API keys**. US-only for now.
([Intuit press release, Feb 24 2026](https://investors.intuit.com/news-events/press-releases/detail/1305/intuit-and-anthropic-partner-to-bring-trusted-financial-intelligence-and-custom-ai-agents-to-consumers-and-businesses);
[Claude connectors directory: Intuit QuickBooks](https://claude.com/connectors/intuit-quickbooks);
[Intuit help: Use the QuickBooks connector with Claude](https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/use-quickbooks-connector-claude/L3YBlo6Ht_US_en_US);
[Claude help: Use connectors](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities))

- Connector availability: directory connectors work across Claude.ai / Desktop / Mobile /
  Code / Cowork; connectors are available on Free through Enterprise plans (Free limited to
  one custom connector).
  ([Claude docs: Connectors directory](https://claude.com/docs/connectors/directory);
  [Claude help: custom connectors via remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp))
- **Hard limitation (shared by every MCP path): conversation-driven only.** Tools run inside a
  chat someone starts; nothing watches QBO in the background, no "when invoice goes 30 days
  overdue, send a reminder" triggers. For RDD's approval-gate constraint this is a *feature*:
  a human is in the loop by construction.
  ([Carly: Claude + QuickBooks in 2026](https://www.usecarly.com/blog/claude-quickbooks-integration/);
  [Intuit help article](https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/use-quickbooks-connector-claude/L3YBlo6Ht_US_en_US))
- Caveat: some third-party writeups (e.g. the Carly piece) predate the connector launch and
  still claim "no official connector exists" — superseded by Intuit's own help article and the
  claude.com directory listing. The MCP-registry search from *this* environment returned no
  QuickBooks hits, so treat "connector visible in *this* workspace" as unverified — check from
  Michael's actual Claude account.

**Official Intuit QBO MCP server (self-hosted).** Open source at
[`intuit/quickbooks-online-mcp-server`](https://github.com/intuit/quickbooks-online-mcp-server)
(first preview Oct 2025): local stdio server, **~144 tools across 29 entity types** (full CRUD
incl. `create_invoice`, `create_bill`, `create_customer`, `create_payment`) plus 11 financial
reports; supports sandbox and production; deletes can be disabled via
`QUICKBOOKS_DISABLE_DELETE=true`. Requires an Intuit developer app (Client ID/Secret), a
browser OAuth handshake, and refresh-token storage — i.e. the option-1 plumbing, packaged.
([GitHub README](https://github.com/intuit/quickbooks-online-mcp-server);
[Scalekit: QuickBooks MCP vs API](https://www.scalekit.com/blog/quickbooks-mcp-vs-api))

**No-code bridges.** Zapier: QBO is a **premium app** (paid Zapier plan) with Create
Invoice / Create Customer / Create Expense actions and invoice/bill/expense triggers, with
line-item support. Make: QBO modules cover invoices, bills, sales receipts, estimates,
payments, customers, purchase orders, and more. Both add a monthly SaaS cost and a third data
processor for a flow RDD would run ~once a month — weak fit here, noted as the generic
alternative. ([Zapier: QuickBooks integrations](https://zapier.com/apps/quickbooks/integrations);
[Zapier help: getting started with QBO](https://help.zapier.com/hc/en-us/articles/8495935103885-How-to-get-started-with-QuickBooks-Online-on-Zapier);
[Make: QuickBooks integration](https://www.make.com/en/integrations/quickbooks);
[Make apps docs: QuickBooks](https://apps.make.com/quickbooks))

### 1c. The books-side framing the options must respect

The RDD invoice is **one document with two ledger identities**:

- In **RDD's** books it is an *Invoice* (accounts receivable). RDD currently has no QBO
  company of its own — the pipeline output is the markdown/HTML invoice, which is fine.
- In **Mammoth's** books it is a **Bill or expense** (accounts payable, vendor = RDD /
  "Ronin Building Design"). Anything RDD pushes into *Mammoth's* QBO via API or connector
  would be a **Bill**, not an Invoice — and Bill entry requires Essentials or above (§1a).

The mission's option 1 ("created in QBO as a draft for Julie") therefore has two distinct
readings — *Bill in Mammoth's QBO* vs *Invoice in a future RDD QBO* — and both inherit the
same gate: **create unsent/unpaid; a human reviews and acts.**

### 1d. Julie-side wins (the AI-consulting upsell)

What the official connector already supports, all conversation-driven with a human approving
every write ([Intuit help article](https://quickbooks.intuit.com/learn-support/en-us/help-article/accounting-bookkeeping/use-quickbooks-connector-claude/L3YBlo6Ht_US_en_US);
[claude.com connector page](https://claude.com/connectors/intuit-quickbooks)):

| Julie task today | Claude + QBO assist (human-gated) |
| --- | --- |
| Categorizing transactions | Import CSV/PDF/photo batches; Claude proposes categories, Julie confirms before anything posts |
| Monthly reporting for Michael | "Show me P&L for June, plain-English summary" — read-only pull, no write risk |
| Chasing receivables | Claude reads open invoices, **drafts** reminder emails; Julie/Michael send them — nothing auto-sends |
| Creating Mammoth's own customer invoices | Plain-language invoice creation with payment links, confirmed in-chat before creation |
| Benchmarking / "how are we doing?" | Industry comparison built into the connector |

This is the natural second engagement line: RDD sets up + trains the Michael/Julie Claude+QBO
workflow as billable AI-consulting, independent of how RDD's own invoices arrive.

---

## 2. Integration-options table

| | **(2) Zero-integration** (PDF/email to Julie) | **Official Claude connector** (Michael/Julie side — evolved option 3) | **(1) RDD dev-app + API** (create Bill in Mammoth QBO, unsent/unpaid) | **Zapier / Make bridge** |
| --- | --- | --- | --- | --- |
| What happens | Brian approves → invoice PDF/email → Julie enters it in QBO herself | Julie/Michael connect the Intuit connector to their Claude; paste the RDD invoice; Claude drafts the Bill entry; human confirms in-chat | RDD's registered Intuit app writes a Bill (vendor=RDD) into Mammoth's realm via OAuth grant; Julie reviews in QBO | Zap/scenario maps invoice data → QBO Create action |
| Approval gates | Brian (send) → Julie (entry) — two human gates, inherently | Brian (send) → Julie/Michael confirm the write in-chat | Brian (send) → API creates *unpaid, unsent* record → Julie approves/pays in QBO | Brian (send) → automation writes (gate must be bolted on) |
| Effort to stand up | **Zero** — works today | ~1 hour on Michael's side; no dev account | Days: dev app, OAuth consent from Mammoth, token storage (100-day rotating refresh), assessment questionnaire for prod keys | Hours + new paid SaaS subscription |
| Ongoing burden | Julie types ~7 lines/mo | None beyond the chat habit | RDD owns token rotation + a credentialed write path into a client's books | Zapier/Make bill + brittle mapping |
| Trust/liability surface | Smallest — RDD never touches Mammoth's books | Intuit-authored connector; OAuth held by Mammoth, revocable by them | RDD holds standing write credentials to a client's ledger — heaviest trust ask | Third processor in the middle |
| Upside beyond RDD invoices | None | **All of §1d** — the consulting upsell rides the same connection | Programmatic anything, if ever needed | Generic app-to-app automation |
| Key risks | Manual typo risk (7 lines — low) | US-only; Michael's Claude plan/connector availability unverified from his account; conversation-driven only | Over-engineering for ~1 invoice/mo; plan gotcha (Bills need Essentials+); refresh-token death every ~100 days if idle | Cost + no real fit at this volume |

---

## 3. Recommendation (forks open — nothing decided)

1. **This week: option (2), zero-integration.** The 0667 invoice draft + 0669 print prototype
   already produce a clean PDF/email. Brian approves; it goes to Julie; she enters it the way
   she enters every other vendor bill. Two human gates for free, nothing to build, nothing to
   break. Ship the companion one-pager
   ([`quickbooks-julie-workflow-draft.md`](../../product/mammoth-build/billing/quickbooks-julie-workflow-draft.md))
   with the first invoice.
2. **Step two (this engagement's upsell): pilot the official Intuit QuickBooks connector on
   the Mammoth side.** It collapses the mission's option 3 from "Michael manually pastes
   things" into an Intuit-supported, OAuth-revocable, confirm-before-write channel — and the
   *same connection* powers every §1d Julie win. RDD's role: setup + training + prompt
   playbook = billable AI-consulting hours. Verify from Michael's actual Claude account that
   the connector is visible/available (US requirement is met; plan requirement unverified).
3. **Hold option (1) — the RDD developer app / direct API (or self-hosted Intuit MCP server)
   — until volume or scope demands it.** Triggers that would flip this: RDD invoicing several
   clients monthly into their QBO realms, RDD standing up its *own* QBO company (then the API
   writes RDD-side *Invoices*, a much smaller trust ask than writing into client books), or a
   Julie-side automation need the connector can't cover. If it flips, the evidence favors the
   official Intuit MCP server over hand-rolled API code (same OAuth cost, 144 tools free).
4. **Skip Zapier/Make** for this engagement — cost and a third data processor for a
   once-a-month flow the other options cover better.
5. **Every future flow keeps the standing constraint**: API/connector writes create
   **unsent/unpaid** records only (`EmailStatus: NotSet`; never call `/send`; Bills entered,
   never auto-paid); a named human sends/pays.

## 4. Open forks (operator + Michael/Julie conversation)

| # | Fork | Options | Leaning (not decided) |
| --- | --- | --- | --- |
| F1 | Which QBO plan does Mammoth run? | Solopreneur / Simple Start / Essentials / Plus | Ask Julie. Determines Bill-vs-expense entry (§1a gotcha) and whether option 1 is even shaped right |
| F2 | Who would hold an Intuit developer app, if ever | RDD holds one multi-client app · Mammoth holds their own · nobody (stay connector-only) | Nobody, until §3.3 triggers fire |
| F3 | Connector account ownership on the Mammoth side | Michael's Claude · a Julie/bookkeeping Claude seat · shared | Whoever does the entry work — likely Julie's own seat if she'll use §1d daily |
| F4 | Scope of Julie-side automations to propose | Reports-only (read) · + categorization drafts · + receivables-chasing drafts · full §1d | Start reports-only (zero write risk), expand with trust |
| F5 | Does RDD stand up its own QBO company (RDD's AR side)? | Yes (Solopreneur/Simple Start) · no (markdown pipeline is the ledger) | No for now; revisit at multi-client volume |
| F6 | Payment rails on the invoice (feeds the Payment terms placeholder in `invoice-mmb-draft.md`) | Check · Zelle · QBO payment link (if RDD had QBO) · Stripe link | Operator call — out of this lane's scope |

## 5. Method note

Search-first via WebSearch/WebFetch, Intuit primary sources preferred; every market/API fact
above carries ≥2 sources inline, all accessed 2026-07-24. Intuit's own docs pages
(`developer.intuit.com` deep pages, the QuickBooks-connector help article) intermittently
reset connections from this environment; where a primary page would not load, the fact is
corroborated by the Intuit help-center/search surface plus an independent secondary source,
and flagged when only secondary. The in-workspace MCP-registry probe (`search_mcp_registry`
for quickbooks/intuit/accounting) returned zero results — noted in §1b as
"verify from Michael's account," not treated as evidence of absence.
