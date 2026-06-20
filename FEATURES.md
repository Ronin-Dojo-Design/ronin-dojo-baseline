# Black Belt Legacy — Feature Log

**BBLApp v4.4** · Milestone: `MVP — LIVE` (June 19, 2026) · [blackbeltlegacy.com](https://blackbeltlegacy.com)

This is the public, plain-language log of what Black Belt Legacy can do today. We build
**continuously** — features land in **beta** and graduate to **live** as they harden. Have an
idea? Open an issue or reply to any BBL email.

**Legend:** ✅ Live · 🧪 Beta (built, hardening) · 🛠️ Planned

---

## ✅ Live — set and in production

| Feature | What it does |
| --- | --- |
| **Lineage network (timeline-tree)** | The signature feature. A chronological tree of who promoted whom, with **provable provenance** — "Promoted by X · date", year-stamped connectors, ordered by time. |
| **Public lineage viewer** | Browse trees with a node drawer, search, selected-path highlighting; responsive on mobile. |
| **Member & practitioner profiles** | Each person has a profile (Passport identity) with rank history and trust signals. |
| **Public directory** | Searchable directory of **people** and **schools**. |
| **One-click profile claims** | Claim your profile with a **magic link** (no passwords) or social sign-in. Claims bind to your email and reconcile on every sign-in. |
| **Admin claim review** | Approve / deny / needs-info on claims, with full audit trail and a notification email to the claimant on every decision. |
| **Rank history & awards** | Belt/rank record per practitioner, surfaced on profiles and the timeline. |
| **Paid memberships** | **Premium** and **Elite** via Stripe checkout → signed webhook → entitlements. Billing portal included. |
| **Comp & gift memberships** | Audited complimentary / gifted grants (e.g. for claim approvals and first testers). |
| **Lifecycle emails** | Welcome, claim approved/denied, and payment receipts (via Resend). |
| **Schools & organizations** | Membership, invites, roles, settings, and per-org theming. |

## 🧪 Beta — built, hardening toward GA

| Feature | Status |
| --- | --- |
| **Video library** | Beta — **closest to GA.** |
| **Technique graph** | Beta — close. A connected map of techniques. |
| **Curriculum** | Beta — close. Structured rank/program curriculum. |
| **Certificates** | Beta — close. Issuable certificates with public verification codes (`/certificates/verify/<code>`). |
| **Merch / gear** | Beta — close. Storefront with Printful fulfillment. |

> Beta features are visible and usable but may change, and aren't covered by the same
> stability/support bar as Live features.

## 🛠️ Planned / on the bench

- Deeper lineage features — secondary cross-lineage links, focal choreography.
- Richer member media galleries.
- Public "what's new" / changelog surface inside the app.

*(Planned items are directional, not commitments or dates.)*

---

## Recent highlights

A lightweight changelog of notable, user-visible changes. Newest first.

### June 2026 — MVP launch
- 🚀 **Black Belt Legacy launched** at blackbeltlegacy.com (June 19): public lineage network,
  one-click magic-link claims, and live paid Premium/Elite memberships, end to end.
- ✉️ **Lifecycle emails went live** — including a claimant notification on **every** claim
  decision (approve *and* deny).
- 👥 Full member roster, member photos, and the Dirty Dozen lineage migrated to production.
- 🔐 Social sign-in now binds and reconciles profile claims the same as magic-link.

---

*How to read this log: "Live" means shipped and in production for all visitors/members. "Beta"
means built and usable but still hardening — close, not final. This file is updated as features
move between states; for engineering-level history see `docs/sprints/`.*
