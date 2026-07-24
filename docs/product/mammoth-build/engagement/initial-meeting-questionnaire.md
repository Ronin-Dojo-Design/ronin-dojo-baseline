---
title: "Initial Client Meeting Questionnaire -- instanced for Mammoth Metal Buildings (Draft)"
slug: mammoth-engagement-initial-meeting-questionnaire
type: reference
status: draft
created: 2026-07-24
author: RDD
session: 0643
---

> **DRAFT.** This is the Initial Client Meeting archetype (fork F2: kept separate from the
> contract-core NDA/MSA/SOW documents in this pack) instanced for Mammoth Metal Buildings. It is a
> discovery-call agenda, not a legal document -- no disclaimer banner required, but no commitment,
> price, or date below is agreed; everything is a question or a placeholder.
>
> **Mapping convention:** every question below either (a) carries an inline comment citing the
> `apps/web/components/app/client-intake/questions.ts` intake-kernel question `id` it instances, so
> the eventual `apps/rdd` interactive form can trace back to the kernel, or (b) is explicitly flagged
> `<!-- no intake-kernel id: Mammoth-specific -->` when it has no kernel counterpart. Kernel questions
> not reused verbatim were re-worded toward Mammoth's metal-building context; the underlying intent
> (per the kernel's `why` field) is preserved.
>
> **Grounding:** Mammoth-specific questions below are drawn only from
> `docs/product/mammoth-build/assets/Michaels_Notes_Meeting.md` (2026-07-18 capture, `status:
> captured-needs-grill`) and `PRD.md`/`CONTEXT.md`. No new facts are asserted -- open items from that
> capture are turned into questions, not answers.

# Initial Client Meeting -- Mammoth Metal Buildings

**Contact:** Michael Flores, GM, Mammoth Metal Buildings
**Meeting date:** [TBD]
**Attendees:** [TBD]

## Scope-split framing (ask first -- operator doctrine)

These two questions separate the client's wish list from what RDD will actually commit to build, and
should be asked before diving into feature-level questions below.

<!-- no intake-kernel id: Mammoth-specific (operator doctrine framing) -->
1. **What do you want done?** Walk through everything you'd want the ideal version of this system to
   do -- no filtering for feasibility or budget yet. (Captures the full wish list before scoping
   narrows it.)

<!-- no intake-kernel id: Mammoth-specific (operator doctrine framing) -->
2. **What can RDD do, realistically, in the first phase?** After the wish list, we'll name what fits
   inside a first fixed-price scope versus what becomes a later phase or a change order
   (`proposal-sow-draft.md` §6, Change Control). Nothing named "later" here is a promise of a later
   phase.

## The work

<!-- intake-kernel id: goals -->
3. What are your goals and objectives for this engagement -- for the CRM/automation work and for the
   site refresh?

<!-- intake-kernel id: challenges -->
4. What specific challenges are you facing right now that you believe this system should relieve?
   (PRD's stated core problem: quotes sit un-actioned, projects get silently dropped, no living proof
   of the work -- confirm or correct that framing.)

<!-- intake-kernel id: systems -->
5. What systems, tools, and data are you running on today? Specifically: HubSpot Pro (what plan,
   what's configured), QuickBooks, and any spreadsheets or lead sheets currently in use.

<!-- intake-kernel id: metrics -->
6. What numbers tell you the business is working? (PRD success metrics propose: 100% of accepted
   quotes become confirmed orders, zero projects with no owned next step, before/after photos on every
   delivered project -- do these match what you actually track?)

<!-- intake-kernel id: effortless -->
7. What should this system make effortless? (Notes capture: frictionless setup/follow-up, visible
   email script success/failure, an easy attempt history -- confirm these are still the top items.)

## The people

<!-- intake-kernel id: stakeholders -->
8. Who are the key stakeholders and decision-makers? Beyond you: part-time sales staff, project
   coordinators, installers/field crew, subcontractors -- who needs what level of access?

<!-- intake-kernel id: involvement -->
9. How involved do you want to be in the build process -- reviewing every stage, or checkpoint-only?

<!-- intake-kernel id: communication -->
10. How do you prefer to communicate about progress and issues?

<!-- intake-kernel id: reporting -->
11. How often do you want updates and reporting during the build?

<!-- intake-kernel id: partners -->
12. Are there other partners or teams RDD needs to coordinate with? (Notes flag: a QuickBooks
    workflow conversation with Julie is needed before any QuickBooks write integration.)

## The shape of the deal

<!-- intake-kernel id: timeline_budget -->
13. What is your timeline and budget for this engagement? (No figures are recorded in this draft --
    see the separate pricing exhibit.)

<!-- intake-kernel id: prior_experience -->
14. Have you had software or CRM work done for you before (including the current HubSpot setup)? How
    did it go, and what would you not repeat?

<!-- intake-kernel id: design_direction -->
15. Any brand or visual direction you love or want to avoid for the site refresh? (Landing page
    today: dark + orange treatment -- confirm this stays, or should change.)

<!-- intake-kernel id: privacy_security -->
16. Any privacy, security, or compliance concerns -- particularly around customer data currently in
    HubSpot/QuickBooks, or the purchased lead lists already in hand?

<!-- intake-kernel id: scale -->
17. Do you see this scaling or expanding later -- more sales staff, subcontractor access, a customer
    dashboard, install operations? (Notes list these as later-horizon ideas, not committed scope.)

## Metal-building / Mammoth-specific questions

Grounded only in `Michaels_Notes_Meeting.md` and `PRD.md` -- these have no intake-kernel counterpart
because they're specific to Mammoth's commercial and operational shape.

<!-- no intake-kernel id: Mammoth-specific (commercial lanes) -->
18. Of the four commercial lanes you named -- steel building supply, erection/install, concrete and
    excavation, and building-only vs. building + install -- which should the CRM pipeline track as
    distinct stages or filters, and which are informational only?

<!-- no intake-kernel id: Mammoth-specific (installation path split) -->
19. Across your current project mix, roughly what share is Mammoth-Installed versus
    Customer-Installed? (Informs how much of the initial build should prioritize the installer-facing
    checklist versus the customer-facing readiness/enablement content.)

<!-- no intake-kernel id: Mammoth-specific (lead sources) -->
20. Confirm the lead-source list to track: `BuildingGuides.com`, `Mammoth.build`, social-media
    interaction, salesperson cold call, and cold email/purchased lead lists. Any missing?

<!-- no intake-kernel id: Mammoth-specific (HubSpot cutover) -->
21. What is the HubSpot Pro cutover posture -- hard cutover, or a temporary coexistence period? Who
    grants RDD the access/export needed, and what's in scope to migrate versus leave behind?

<!-- no intake-kernel id: Mammoth-specific (QuickBooks boundary) -->
22. What is the QuickBooks source-of-truth and write boundary you want (pending the separate Julie
    conversation the notes flag as a prerequisite)? Read-only/reconciliation-first, or eventual
    two-way sync?

<!-- no intake-kernel id: Mammoth-specific (stage language) -->
23. Notes capture draft stage/status language -- `New`, `ATC-001` ("Attempt to Contact"), Attempt
    1/2/3 -- and note it may or may not replace an existing Dirstarter lead-status menu. Confirm the
    stage names and attempt-count convention you want to ratify.

<!-- no intake-kernel id: Mammoth-specific (org/access) -->
24. What does your business org chart look like for this purpose -- part-time sales roles, lead
    ownership rules, and what subcontractors should and should not be able to see?

<!-- no intake-kernel id: Mammoth-specific (sample data) -->
25. Can you provide sanitized sample exports (BuildingGuides/purchased-lead formats, HubSpot property
    list) so the CRM's field mapping is designed against real shapes, not guesses? (No real customer
    data changes hands in this meeting -- sanitized/sample only.)

<!-- no intake-kernel id: Mammoth-specific (integrations boundary) -->
26. For each of these, what's the desired boundary and who owns the credentials: Google/OAuth
    consent, Google Calendar (which calendars, read vs. write), Todoist (projects/labels, one-way
    projection vs. two-way task source), and phone provider (click-to-call first, or dialer/
    transcription later)?

<!-- no intake-kernel id: Mammoth-specific (unresolved capture) -->
27. Two items from the last capture need your clarification before they become scope: (a) "Mammoth
    Loyalty C" -- what did you mean by this? (b) "Get rid of right now" was captured without an
    object -- what should be removed, if anything?

## Share and follow-up

<!-- no intake-kernel id: Mammoth-specific (logistics) -->
28. Preferred handoff method for any files/exports (e.g. Drive/Dropbox)? Who should receive this
    meeting's capture and any resulting drafts? What is the follow-up date?

## Next actions

_(Filled after the meeting -- one row per material ask, routed to `PRD.md` / `STORIES.md` / the
goals ledger per the existing Client_Meeting_Intake recipe pattern in
`apps/web/components/app/client-intake/questions.ts`.)_
