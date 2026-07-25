---
title: "Mammoth Build review-request sequences"
type: template
status: draft
created: 2026-07-24
session: 0656
---

> **DRAFT — NOT APPROVED FOR SENDING**

# Review-request sequences

Operational copy for a consented review request after the CRM records a **Satisfied Installation**.
The sequence expresses Mammoth's canonical promise: **Built all the way through.**

## Automation contract

- Trigger: the CRM records `Satisfied Installation`.
- First-touch window: send between 90 minutes and 3 hours after the confirmation event.
- Channel: use the customer's consented/preferred channel; do not send both SMS and email by default.
- Follow-up: send once only at `[PLACEHOLDER: APPROVED FOLLOW-UP DELAY]` if there is no reply, review
  event, opt-out, bounce, or open Resolution Task.
- Public route: `[GOOGLE_REVIEW_LINK]`.
- Private service-recovery route: `[PRIVATE_FEEDBACK_FORM_LINK]`.
- Sender identity: `[SENDER_NAME]`, `[SENDER_ROLE]`, `[REPLY_ADDRESS]`.
- SMS opt-out: `Reply STOP to opt out.`
- Email opt-out: `[EMAIL_UNSUBSCRIBE_LINK]`.

Before activation, `[PLACEHOLDER: COMPLIANCE OWNER]` must approve consent evidence, sender
identification, quiet hours, opt-out handling, retention, and provider-specific requirements.

## Routing rules

1. If `Satisfied Installation` is confirmed, consent is present, and no Resolution Task is open,
   enter the review-request sequence.
2. If a Resolution Task is open or the customer reports an unresolved experience, do not send or
   follow up on a Google request. Enter the private service-recovery branch.
3. If the customer replies, posts a review, opts out, or the message fails permanently, stop all
   remaining steps.
4. Do not ask customers to rate their experience before showing the Google link. Do not make the
   public-review opportunity conditional on positive sentiment.

## SMS sequence

### First touch — 90 minutes to 3 hours after Satisfied Installation

> Hi `[CUSTOMER_FIRST_NAME]` — thank you for building with Mammoth. We’re proud to have carried your
> `[BUILDING_TYPE]` project through a satisfied installation. Would you share your experience on
> Google? `[GOOGLE_REVIEW_LINK]` — `[SENDER_NAME]`, Mammoth Metal Buildings. Reply STOP to opt out.

### One polite follow-up — `[PLACEHOLDER: APPROVED FOLLOW-UP DELAY]`

> Hi `[CUSTOMER_FIRST_NAME]` — one quick follow-up from Mammoth. If you’d still like to share how
> your `[BUILDING_TYPE]` project went, here’s the Google link: `[GOOGLE_REVIEW_LINK]`. Thank you for
> trusting us with your build. Reply STOP to opt out.

## Email sequence

### First touch — 90 minutes to 3 hours after Satisfied Installation

**Subject:** Would you share your Mammoth build experience?

> Hi `[CUSTOMER_FIRST_NAME]`,
>
> Thank you for building with Mammoth. We’re proud to have carried your `[BUILDING_TYPE]` project
> through a satisfied installation.
>
> If you have a moment, would you share your experience on Google?
>
> `[LEAVE_A_GOOGLE_REVIEW_BUTTON → GOOGLE_REVIEW_LINK]`
>
> Your feedback helps future customers build with confidence.
>
> Built all the way through.
>
> `[SENDER_NAME]`<br>
> `[SENDER_ROLE]`<br>
> Mammoth Metal Buildings
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

### One polite follow-up — `[PLACEHOLDER: APPROVED FOLLOW-UP DELAY]`

**Subject:** One quick follow-up about your Mammoth build

> Hi `[CUSTOMER_FIRST_NAME]`,
>
> One quick follow-up: if you’d still like to share your `[BUILDING_TYPE]` project experience,
> here’s the direct Google review link:
>
> `[LEAVE_A_GOOGLE_REVIEW_BUTTON → GOOGLE_REVIEW_LINK]`
>
> Thank you for trusting Mammoth to carry the build through.
>
> `[SENDER_NAME]`<br>
> Mammoth Metal Buildings
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

## Private service-recovery branch

Use this branch when a Resolution Task is already open or a reply identifies an unresolved
experience. Suppress the remaining Google-request steps, assign an owner, and preserve a Next
Action until the concern is resolved.

### SMS

> Hi `[CUSTOMER_FIRST_NAME]` — thank you for telling us. We want to understand what happened and
> keep the next step owned. Please share the details here: `[PRIVATE_FEEDBACK_FORM_LINK]`, or reply
> directly. `[RESOLUTION_OWNER_NAME]` will own the follow-up. Reply STOP to opt out.

### Email

**Subject:** Let’s make sure your Mammoth experience is carried through

> Hi `[CUSTOMER_FIRST_NAME]`,
>
> Thank you for telling us there’s more to resolve. Please use our private feedback form to share
> the details:
>
> `[PRIVATE_FEEDBACK_BUTTON → PRIVATE_FEEDBACK_FORM_LINK]`
>
> `[RESOLUTION_OWNER_NAME]` will own the next action in the Mammoth project record. No further
> review reminders will be sent while this concern is open.
>
> `[SENDER_NAME]`<br>
> Mammoth Metal Buildings
>
> `[EMAIL_UNSUBSCRIBE_LINK]`

## Send checklist

- [ ] `Satisfied Installation` is recorded; a Confirmed Order or delivery alone is not enough.
- [ ] Required channel consent is present and auditable.
- [ ] No open Resolution Task or known unresolved experience exists.
- [ ] Google review and private feedback links resolve to the approved destinations.
- [ ] Sender identity, reply path, opt-out handling, and suppression events are configured.
- [ ] Placeholder values are populated from approved project data.
- [ ] Only one follow-up is queued.
- [ ] A human has approved the final rendered copy and automation rules.
