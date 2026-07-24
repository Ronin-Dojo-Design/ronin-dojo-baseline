---
title: "Mammoth Build inquiry follow-up sequences"
type: template
status: draft
created: 2026-07-24
session: 0656
---

> **DRAFT — NOT APPROVED FOR SENDING**

# Inquiry follow-up sequences

Email-first templates for the current Mammoth landing-page inquiry. The form captures no phone
number, so this draft does not assume SMS or calling consent.

## Verified InquiryForm contract

These are the exact `Draft` field names in
`clients/mammoth-build-crm/components/landing/InquiryForm.tsx`:

| Field | Template token | Use |
| --- | --- | --- |
| `name` | `{{name}}` | Greeting and contact identity |
| `email` | `{{email}}` | Recipient address |
| `buildingType` | `{{buildingType}}` | Building-aware subject and copy |
| `message` | `{{message}}` | The prospect's own project context |

No other intake field is assumed. Tokens such as `[SENDER_NAME]`, `[REPLY_ADDRESS]`, and
`[SCHEDULING_LINK]` are operational placeholders, not InquiryForm fields.

## Rendering rules

- If `buildingType` is blank, replace the building-type phrase with `your building project`; do
  not expose an empty token.
- If `message` is blank, omit the quoted-message block rather than inventing project context.
- Preserve the submitted `name`, `email`, `buildingType`, and `message` values exactly in the CRM
  record; escape them safely before rendering outbound copy.
- Stop the sequence on reply, opt-out, permanent delivery failure, an explicit lost reason, or
  promotion into an owned Opportunity with its own Next Action.
- Every live Lead or Opportunity must have an owner and Next Action; automation must not hide an
  unowned inquiry.

## Immediate autoresponder

**Send:** immediately after a successful production submission.

**Subject:** We received your Mammoth inquiry

> Hi `{{name}}`,
>
> Thanks for telling us about `{{buildingType}}`.
>
> You shared:
>
> “`{{message}}`”
>
> A Mammoth team member can review your inquiry and identify the right next action. Mammoth's
> promise is to know the customer, carry the build, and finish proud.
>
> Built all the way through.
>
> `[SENDER_NAME]`<br>
> Mammoth Metal Buildings<br>
> `[REPLY_ADDRESS]`
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

## Three-touch follow-up

### Day 0 — personal acknowledgment

**Subject:** Your `{{buildingType}}` inquiry

> Hi `{{name}}`,
>
> I’m following up on your Mammoth inquiry about `{{buildingType}}`.
>
> You wrote:
>
> “`{{message}}`”
>
> What matters most to you about this build? Reply here, and we can make that context part of the
> next action instead of treating your inquiry like a one-time transaction.
>
> `[SENDER_NAME]`<br>
> `[SENDER_ROLE]`<br>
> Mammoth Metal Buildings
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

**CRM action:** assign `[LEAD_OWNER]`; record the email as an Activity; set
`[PLACEHOLDER: DAY-2 NEXT ACTION]`.

### Day 2 — clarify the right next step

**Subject:** A useful next step for `{{buildingType}}`

> Hi `{{name}}`,
>
> The right next step depends on what you’re building and what confidence looks like for you.
> Based on your `{{buildingType}}` inquiry, what question would be most useful for Mammoth to answer
> first?
>
> You can reply directly to this email. If you prefer to choose a conversation time, use
> `[SCHEDULING_LINK]`.
>
> `[SENDER_NAME]`<br>
> Mammoth Metal Buildings
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

**CRM action:** record the contact attempt as an Activity; set
`[PLACEHOLDER: DAY-7 NEXT ACTION]`.

### Day 7 — polite close-the-loop touch

**Subject:** Should we keep your Mammoth inquiry open?

> Hi `{{name}}`,
>
> I’m closing the loop on your `{{buildingType}}` inquiry. If the project is still active, reply
> with the best next question for Mammoth to help with. If the timing has changed, you can say
> that too, and we’ll keep the record clear.
>
> Built all the way through.
>
> `[SENDER_NAME]`<br>
> Mammoth Metal Buildings
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

**CRM action:** record the contact attempt. If there is no reply, set
`[PLACEHOLDER: APPROVED NO-REPLY DISPOSITION]` with an explicit reason; do not mark the record as a
Successful Close.

## Preflight checklist

- [ ] Production submission routing is live; the current local-only MVP message is not represented as a CRM receipt.
- [ ] The rendered email uses only `name`, `email`, `buildingType`, and `message` from InquiryForm.
- [ ] Blank `buildingType` and `message` values follow the rendering rules.
- [ ] Sender identity, reply mailbox, scheduling link, and unsubscribe link are approved.
- [ ] Day 0, 2, and 7 timing is configured once, with no duplicate enrollment.
- [ ] Reply, opt-out, bounce, lost, and Opportunity-promotion stop conditions are tested.
- [ ] Every enrolled inquiry has an owner and visible Next Action.
- [ ] A human has approved the final copy before activation.
