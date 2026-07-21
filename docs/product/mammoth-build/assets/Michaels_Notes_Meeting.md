---
type: meeting-notes
client: mammoth-build
contact: Michael Flores
meeting_date: 2026-07-18
status: captured-needs-grill
contains_real_data: false
---

# Michael's Notes — Meeting

> [!info] Live capture
> Keep this demo-safe. Record decisions and preferences, not API keys, OAuth secrets, customer exports, or real project details.

## What Michael wants the cockpit to answer

- Who is in the lead roster right now?
- Where did each lead come from?
- Who should be contacted next, by phone or email?
- How many contact attempts have been made: attempt 1, 2, or 3?
- Did the email script/workflow succeed or fail?
- What task, to-do, or calendar commitment is next?
- Which opportunities are building-only versus building + install?
- What is moving toward a successful close, and what is at risk of being dropped?

## Brand heartbeat and soul of sales

> [!success] Product North Star — ratified by Brian, 2026-07-18
> Know every prospect personally, make the next action effortless, and carry every building opportunity
> through delivery and a satisfied installation without dropping the relationship.

Successful installation explicitly includes either:

- Mammoth's team completes the installation and the customer is satisfied; or
- the client completes installation and feels fully equipped by Mammoth's brand-specific education,
  instructions, SOPs, protocols, step-by-step guides, onboarding wizards, employee how-tos, and support.

- **Soul of sales:** passionately know the customer personally and deliver for them.
- **Human promise:** a lead is not a one-time transaction; the relationship and the project stay visible.
- **Operational promise:** remove friction so the sales team has time to sell and every lead reaches a
  clear successful close or an explicit reason it did not.
- **Experience standard:** cohesive branding, meaningful microdelights, enjoyable education, financial
  and token efficiency, smooth automation, reliability, and a clear human next step.
- **Commercial lanes heard:**
  - steel building supply
  - erection / install
  - concrete and excavation
  - building-only versus building + install

## Workflow pain worth fixing first

1. Michael is pulled in many directions; setup and follow-up need to be frictionless and automated.
2. Email scripts need visible success/failure and an easy attempt history.
3. Prospecting and outreach need automation, including lead-sheet ingestion/scraping.
4. Subcontractors and part-time sales need a shared system so sales time is not lost.
5. HubSpot Pro and QuickBooks friction needs to be reduced without silently breaking either system.
6. Current lead spend: approximately $1,500 for about 600 leads, currently landing in HubSpot.

## Lead-card and roster requirements heard

- Lead card for a new client.
- Lead roster/list view in addition to the pipeline board.
- Phone-number list with click-to-dial progression through numbers.
- Contact attempts visible as Attempt 1 / 2 / 3.
- Click an email address to open a composer and send an email.
- Dream workflow: one action starts an automated email campaign.
- Quick-add notes and tasks directly on the card.
- To-do and calendar visibility.
- Lead Source column.
- CSV/JSON lead-sheet ingestion.
- Initial named sources: `BuildingGuides.com`, `Mammoth.build`, social interaction, salesperson cold
  call, and cold email / purchased lead lists.

## Pipeline and workflow shape heard

- Intake sources:
  - social-media interaction
  - salesperson cold call
  - cold email from lead lists
  - purchased leads (approximately 600 leads / $1,500)
- Sales pipeline should distinguish building-only from building + install.
- An install pipeline may be separate from the sales pipeline; decision pending.
- Daily workflow should connect phone, email, notes, transcription, to-dos, and action-item lists.
- Desired dogfood loop: CRM activities feed ledgers / Kanban boards / Todoist; whether that is one-way
  or two-way is unresolved.
- New-lead contact posture heard: "Attempt to contact you"; exact stage/label wording needs the grill.

## Customer experience and later-horizon ideas

- Customer dashboard / client account.
- Blueprint and order visibility.
- Possible relationship to `BuildingGuides.com`.
- Mammoth loyalty concept (captured as "Mammoth Loyalty C"; meaning incomplete — clarify).
- Consulting pipeline that leaves a useful digital and physical card/artifact with the client.
- Construction-CRM research / precedent scan.

## Dependencies and owner conversations

- HubSpot Pro login/access is needed from Michael; credentials stay outside this vault.
- QuickBooks workflow needs a conversation with Julie.
- Business org chart, part-time sales roles, lead ownership, and subcontractor access need definition.
- Dropdown/menu notes heard: `New`, `ATC-001`, QuickBooks→HubSpot friction customization. Exact meaning
  and whether this replaces an existing Dirstarter lead-status menu need clarification.
- "Get rid of right now" was captured without an object. Do not remove anything until Michael names it.

## Integrations

- [ ] HubSpot Pro — export/API scope, temporary coexistence, and cutover posture
- [ ] QuickBooks — Julie workflow interview; source-of-truth and write boundary
- [ ] CSV/JSON lead import — BuildingGuides and purchased-list formats
- [ ] Email provider — click-to-compose first; automated sequences only after consent/deliverability rules
- [ ] Phone provider — `tel:` click-to-call first; dialer/transcription only after provider + consent decision
- [ ] Google / OAuth — consent to connect discussed; credentials exchanged outside this vault
- [ ] Google Calendar — desired calendars and read/write boundary
- [ ] Todoist — desired projects/labels; API key stays outside this vault
- [ ] CRM real-data demo — explicit consent and tenant boundary

## Share and follow-up

- [ ] Preferred handoff: Drive / Dropbox
- [ ] Who receives the demo vault:
- [ ] Follow-up date:

## Extracted next-session build actions

> [!warning] Planning backlog, not implementation authorization
> Start with the grill in [[Michael Flores CRM Buildout — Grill and Action Plan]]. Do not connect
> accounts, import real leads, or send communications during discovery.

1. Confirm the brand heartbeat, soul-of-sales sentence, and the daily-driver outcome.
2. Lock the canonical objects: Lead/Contact, Company, Opportunity/Project, Activity, Task, and Campaign.
3. Lock the sales-stage language, including `New`, `Attempt to Contact`, attempts 1–3, Qualified,
   building-only, building + install, and closed outcomes.
4. Obtain sanitized sample exports for BuildingGuides/purchased leads and HubSpot property mapping.
5. Design the first tracer slice: lead roster + source column + CSV preview/dedupe + card/contact drawer.
6. Add manual contact actions: `tel:` call, email composer, attempt log, quick note, next task, due date.
7. Add activity timeline + task/calendar view using the already-present Mammoth `Activity` model.
8. Only then design automated email/phone sequences, consent, stop rules, success/failure telemetry,
   transcription, and task extraction.
9. Interview Julie before any QuickBooks write integration; start read-only/reconciliation-first.
10. Decide whether Todoist is a one-way projection or a two-way task source of truth.
11. Keep customer dashboard, loyalty, install operations, and subcontractor portals as later slices until
    the lead-to-close sales loop is proven.

## Surface notes

- [[Michael's Notes — Cockpit]]
- [[Michael's Notes — Scripts]]
- [[Mammoth — Michael's Landing Notes]]
- [[Michael Flores CRM Buildout — Grill and Action Plan]]
