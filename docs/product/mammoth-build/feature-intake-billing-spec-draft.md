---
title: "Feature-intake → estimate → Client-Invoice pipeline (build-ready design spec, approval-gated)"
slug: feature-intake-billing-spec-draft
type: design-spec
status: draft-spec
created: 2026-07-24
session: SESSION_0675
author: "Claude (Fable 5) — autonomous design-spec lane, wave 12"
decision: "DRAFT — 4 forks (§7) open for operator ratification; everything else build-ready"
pairs_with:
  - docs/sprints/SESSION_0675.md
  - docs/product/mammoth-build/billing/rdd-client-invoice-template.md
  - docs/product/mammoth-build/billing/state-of-the-building.html
backlinks:
  - docs/knowledge/wiki/index.md
---

# Feature-intake → estimate → Client-Invoice pipeline (design spec)

> **DRAFT** — staged by an overnight autonomous lane. Four forks (§7) are presented with
> recommendations for the operator to ratify; every other section is intended to be executable by
> a build lane without re-derivation.

> **Operator directive (SESSION_0635 wave-12 dispatch):** *Michael (MMB) and Tony Hua (BBL) can
> quickly type feature needs, bug fixes, and design tweaks on the state artifacts; MMB requests
> then flow into billing — per-feature hours estimate at the rate table, into Client-Invoice
> creation.*
>
> **THE HARD RULE, threaded through every phase of this spec: NOTHING is ever sent automatically.
> No invoice, no estimate, no email, no notification to a client — ever — without Brian's explicit
> approval. Every artifact this pipeline produces is a DRAFT until Brian sends it by hand.**
> This is the billing-surface instance of the standing operator law (`explicit-push-authorization`
> memory; `rdd-client-invoice-template.md` fill-in checklist: "Operator reviewed every number —
> nothing sends without the word").

---

## 0. Verify-first evidence (canonical checkout, read-only)

Everything below was verified against `/Users/brianscott/dev/ronin-dojo-app` (canonical, `main`)
and the named wave branches via `git show` — cited `file:line` throughout.

| # | Claim | Evidence |
|---|---|---|
| V1 | **A FeatureWidget L1 pattern already exists and is live.** Admins-only floating dialog (category select + body + up to 4 images via the shared `ImageFieldUploader` R2 seam), prop-free, no internal authz check, explicitly structured for `packages/ui-kit` extraction with "the MMB mount is a separate fast-follow". | `apps/web/components/web/feature-widget.tsx:43-58` (doc comment), `:105-197` (dialog) |
| V2 | It mounts across every `/app` page, gated server-side: `{isAdmin(user) && <FeatureWidget />}`. The `/app` layout itself only requires a signed-in user (`requireUser`). | `apps/web/app/app/layout.tsx:20,41` |
| V3 | Its write path is `createPlanningIntake` — `adminActionClient`, IP-rate-limited (`planning_intake` bucket), `createdById` from session never client input; triage view `/app/planning-intake` gated on `planning-intake.manage`. | `apps/web/server/web/actions/planning-intake.ts:27-59`, `apps/web/lib/rate-limiter.ts:131` |
| V4 | The `PlanningIntake` model has **no** brand, title, urgency, estimate, rate, or invoice fields — category/body/imageUrls/status (`NEW\|TRIAGED\|PROMOTED\|DISMISSED`) + createdBy. Promotion to `planning-ledger.md` PL rows is BY HAND, never automated (pinned SESSION_0592 decision). | `apps/web/prisma/schema.prisma:4521-4562` |
| V5 | **G-024 is the idea-intake program and this spec is a slice of it.** Ledger row: "ONE platform intake module (RDD kernel law — module × per-product mount, not forks)… idea-dump for Brian / Michael (MMB owner, admin) / Tony (BBL admin)"; L2+L3 shipped to prod (SESSION_0597); named remaining: **MMB mount (kernel extraction)** + phase-2 changelog widget. | `docs/knowledge/wiki/goals-ledger.md:550-575` |
| V6 | **The authz matrix for a client-facing submit surface exists and has a named precedent.** Per-area permission strings in `APP_AREA_PERMISSIONS`; the law is stated twice in the file: "a new authz NEED maps to a new KEY, never a new system (repo rule: 4 authz systems, never a 5th)". The trusted-tester shape is `beta.view` + FI-019: "named non-admin testers arrive via FI-019 per-user override grants". | `apps/web/server/orpc/roles.ts:110-158` |
| V7 | FI-019 per-user grants are a live model: `UserPermissionGrant` (grant string + reason + soft revoke, partial unique on live grants), wired into `lib/auth.ts` / `server/orpc/permissions.ts` / the `/app/users/[id]` admin page. | `apps/web/prisma/schema.prisma:3005-3040` |
| V8 | **`/app/state` (the live BBL state artifact) is a signed-in surface with NO per-route permission gate** — the layout's `requireUser` is the only gate; the page renders the self-fetching `StatePanel` (G-023 WS-A). For an admin, the existing FeatureWidget already floats over it (V2). | `apps/web/app/app/state/page.tsx` (no `requirePermission`), `apps/web/components/app/state-of-dojo/state-panel.tsx:1-8` |
| V9 | **The static State-of-the-Building artifact is a self-contained HTML file with no backend** — `docs/product/mammoth-build/billing/state-of-the-building.html` (0667 lane, unmerged): inline CSS, DRAFT watermark, no script, no auth, no form target. A widget cannot write anywhere from it; **a `mailto:` link block is the only zero-build intake channel it can carry** (§2.3, stated honestly). | `git show origin/auto/session-0667-mmb-billing:docs/product/mammoth-build/billing/state-of-the-building.html` |
| V10 | **The rate table is ratified in the 0667 template**: Standard **$200/hr** · Friends & Family **$100/hr** · retainer row (pre-committed block); "always show the standard rate when discounting so the discount is visible". The live MMB invoice draft applies F&F. The 0669 fillable prototype ships the same presets (Standard $200 / F&F $100 / Custom). | `rdd-client-invoice-template.md` §Rate & total (0667 branch); `invoice-mmb-draft.md`; `scripts/prototypes/client-invoice/README.md` step 4 (0669 branch) |
| V11 | **The Client-Invoice pipeline this feeds**: 0667 `rdd-client-invoice-template.md` (email-composer paste-block template + fill-in checklist ending in the no-send-without-the-word gate) + 0669 `scripts/prototypes/client-invoice/invoice.html` (fillable, line-item rows `Description / Session-Ref / Hours / Rate`, auto-total, print-to-PDF + copy-summary — no persistence by design). | 0667 + 0669 branches, `git show --stat` |
| V12 | **The MMB CRM is its own app with its own auth + DB** (ADR 0038 D5): own Better Auth (email+password, roles `owner`/`member`), own Postgres schema. Its `Invoice` model is **Michael invoicing HIS customers** (deposit/engineering/fabrication/delivery/final) — NOT RDD invoicing Michael; the two must never be conflated. | `clients/mammoth-build-crm/lib/auth.ts:39-85`, `clients/mammoth-build-crm/prisma/schema.prisma:54,198-222,425-448` |
| V13 | The migration discipline for any new model is the proven 0639 pattern: hand-authored migration committed with the schema, **unapplied at build time**, applied by the AM-merge owner; `prisma migrate dev` is banned. | SESSION_0639 (commit `e5f51f03`), `prisma-prod-migration-flow` memory |
| V14 | `welcome@ronindojodesign.com` is the real RDD contact address, wired in code on both the platform and the public RDD page. | `apps/web/lib/email.ts:30`, `apps/rdd/app/page.tsx:19` |
| V15 | An inbound-email capture path exists for the mailto channel: 0639 built a Resend inbound webhook → `InboundEmail` rows → `/app/inbox` AdminCollection (`email.manage`-gated). Unmerged + migration unapplied tonight — a convergence point, not a dependency. | 0639 branch `git show --stat`, SESSION_0639 task log |

---

## 1. Purpose + non-goals

**Purpose.** Give the two named humans closest to the products — **Michael Flores** (MMB owner)
and **Tony Hua** (BBL trusted tester) — a near-zero-friction way to type feature needs, bug
reports, and design tweaks at the moment they see them on the state artifacts, and give the
operator ONE queue where those requests are triaged, hours-estimated at the ratified rate table
(V10), client-approved **before work starts**, and rolled up as line items into the existing
Client-Invoice draft pipeline (V11). Intake → estimate → invoice **draft** — the pipeline's output
is always a draft in Brian's hands, never a sent artifact.

**Non-goals (hard boundaries for the build lane):**

- **No automated sending of ANYTHING.** No auto-acknowledgement email to the requester, no
  auto-sent estimate, no auto-sent invoice, no client-facing notification of any kind. The intake
  module contains **zero send paths by construction** (§6.4) — this is the operator directive's
  hard rule and it is structural, not procedural.
- **No payment collection.** No Stripe links, no payment intents, no money movement. The invoice
  draft's payment method is chosen by Brian at send time (template §Payment terms).
- **No public/anonymous form.** Every in-app intake surface sits behind auth + a named grant
  (§2); the only unauthenticated channel is `mailto:` (§2.3), which is just email. No spam
  surface, no CAPTCHA problem, nothing to rate-limit beyond the existing action buckets (V3).
- **No coupling to the MMB CRM `Invoice` model.** That model is Michael→his-customers (V12).
  RDD→Michael invoices remain doc artifacts (template + prototype + the parallel QuickBooks
  lane's ledger-of-record, §5.3); this spec's `invoiceRef` is a plain string join key, no FK.
- **No change to `PlanningIntake` semantics.** Brian's internal idea inbox and its by-hand
  PL-promotion law (V4) are untouched. This spec adds a *sibling* with a billing lifecycle, and
  the two stay separate models (§3 rationale; fork §7.4 records the alternative).
- **No auto-promotion into ledgers.** Same law as PlanningIntake: a FeatureRequest becoming a PL
  row / session lane / goal child is a deliberate operator step, never automated.

---

## 2. Intake surfaces

The request shape is identical on every surface (the operator directive's shape):

```
{ brand: "MMB" | "BBL",        // pinned SERVER-SIDE by the mount — never client input
  type: FEATURE | BUG | DESIGN_TWEAK,
  title: string (≤120),
  description: string (≤4000),
  urgency: LOW | NORMAL | HIGH }
```

`brand` is derived from where the widget is mounted (BBL app → `"BBL"`; MMB CRM → `"MMB"`),
exactly as `createdById` is derived from the session and never trusted from the client (V3).

### 2.1 BBL — widget on `/app/state` (and the rest of `/app`) for Tony

**What exists tonight:** `/app/state` is reachable by any signed-in user (V8), and the existing
admins-only FeatureWidget already floats over every `/app` page for admins (V2) — but Tony is not
served by that unless he holds the full `admin` role, which is the wrong hammer for a trusted
tester.

**Proposed shape (the V6 precedent, applied):**

- **New permission KEY, existing system:** `FEATURE_REQUEST_CREATE = "feature-request.create"` —
  a new key in the existing `can()` axis, exactly the `beta.view` + FI-019 named-tester precedent
  (`roles.ts:115-118`). Admins pass automatically via the `"*"` grant; **Tony gets a
  `UserPermissionGrant` row** (`grant: "feature-request.create"`, `reason: "BBL trusted tester —
  G-024 intake"`) minted from the existing `/app/users/[id]` grant UI (V7). No new role, no new
  system — the 4-authz-systems law holds.
- **Mount:** one line in `apps/web/app/app/layout.tsx` beside the existing FeatureWidget mount,
  server-gated on `can(user, FEATURE_REQUEST_CREATE)`. The two floating widgets are **mutually
  exclusive** to avoid button-stacking: `isAdmin` → the internal FeatureWidget (whose dialog gains
  nothing here); non-admin grant-holders → the new `FeatureRequestWidget`. Tony therefore sees
  exactly one lightbulb-style trigger on `/app/state` — and on every other `/app` page, which is
  the proven "capture it wherever it strikes" posture (V2 comment).
- **Component:** a **sibling of `feature-widget.tsx`, not an overload** — same L1 dialog pattern
  (trigger + Dialog + react-hook-form + safe-action), different audience/payload/action, mirroring
  how `feature-widget` itself was deliberately built as a sibling of `feedback-widget` rather than
  an overload (`feature-widget.tsx:45-47`). No image slots in v1 (keeps the client surface
  dependency-free for later ui-kit extraction; fork-able later).
- **Action:** `createFeatureRequest` — a `userActionClient`-based action that re-checks
  `can(user, FEATURE_REQUEST_CREATE)` in the action (defense in depth — the widget mount is
  UI-only), IP-rate-limited with its own bucket (`feature_request`), brand pinned `"BBL"`.

### 2.2 MMB — widget in the CRM for Michael

The MMB CRM is a separate app with its own auth + DB (V12). Michael signs in with an
`owner`-role account. The widget mounts in the CRM's `/app` layout
(`clients/mammoth-build-crm/app/app/layout.tsx`) for any signed-in user — the whole CRM is an
internal, provisioned-accounts surface (no self-serve signup, V12), so "signed in" is already
"Michael or someone Michael provisioned". Brand pinned `"MMB"`.

**Where the row lands is fork §7.2** (the one genuinely open architecture question — Mammoth DB
vs platform DB). The recommended v1 (fork §7.2-A) keeps the write in the Mammoth DB with a
one-screen triage list in the CRM, and the operator carries estimates/billing on the platform
side; the kernel-extraction pass G-024 already names (V1, V5) is the moment the component itself
becomes ONE module mounted per-product.

**Phasing honesty:** the BBL surface (§2.1) is a small delta on live, proven plumbing — it ships
first. The MMB widget rides the G-024 MMB-mount fast-follow; until it lands, Michael's channel is
§2.3, which works **today**.

### 2.3 STOPGAP for the static artifacts — a `mailto:` block (works today, zero build)

The static State-of-the-Building HTML (V9) has no backend, no auth, and no script — **a widget
cannot exist there; a prefilled `mailto:` link is the only intake channel a static artifact can
honestly carry.** Same for any exported/printed state artifact (PDF of the deck, the invoice
itself). The block below is ready to paste into the artifact's footer area by the 0667/AM-merge
owner (this lane does not write that wave-owned file):

```html
<section class="card">
  <h2>Request a change</h2>
  <div class="status review">Always open</div>
  <p>Spotted a bug? Want a tweak or a new feature? One click — say what and how urgent,
     and you'll get an hours estimate to approve before any work starts.</p>
  <p><a href="mailto:welcome@ronindojodesign.com?subject=%5BMMB%20request%5D%20%3Cshort%20title%3E&body=Type%20(feature%20%2F%20bug%20%2F%20design%20tweak)%3A%0A%0AWhat%20you%20need%3A%0A%0AUrgency%20(low%20%2F%20normal%20%2F%20high)%3A"
        style="color:var(--primary);font-weight:700">welcome@ronindojodesign.com</a></p>
</section>
```

- The address is the real, code-wired RDD contact (V14). The prefilled subject `[MMB request] …`
  + body template mirror the §2 request shape so a human (or agent, at triage time) can transcribe
  it into a `FeatureRequest` row losslessly.
- **Convergence, not dependency:** once the 0639 inbox module merges and `welcome@` is
  Resend-routed, these emails surface automatically as `InboundEmail` rows in `/app/inbox` (V15)
  — the transcription step keeps its human, but loses the mailbox-checking. Nothing in this spec
  waits on that.
- The equivalent BBL stopgap (for anything static Tony sees) is the same block with subject
  prefix `[BBL request]`.

---

## 3. Model proposal (schema sketch — NOT a migration)

Sibling of `PlanningIntake`, not an extension of it: `PlanningIntake` is Brian's internal idea
inbox with a *planning* lifecycle ending in a by-hand ledger promotion (V4); `FeatureRequest` is
**client-originated work-order intake with a billing lifecycle** ending in an invoice line. Mixing
the two state machines in one table couples an internal ledger law to client billing (the
god-model smell the mantra exists to kill). Fork §7.4 records the extend-instead alternative.

```prisma
/// Client/tester-originated work requests (G-024 intake-billing slice, SESSION_0675 spec).
/// Written by the FeatureRequestWidget mounts (BBL /app; MMB CRM later) and by hand-transcribed
/// mailto requests. Billing lifecycle — NOT the internal PlanningIntake planning inbox, and NOT
/// the MMB CRM's own customer-facing Invoice model. NOTHING here sends anything, ever:
/// estimates and invoices generated FROM these rows are drafts until the operator sends by hand.
// @added   <build-lane migration — 0639 pattern, unapplied at build>
// @why     feature-intake → estimate → Client-Invoice pipeline (SESSION_0675 spec §3)
// @wired   components/web/feature-request-widget.tsx (write) · app/app/feature-requests (triage)
model FeatureRequest {
  id          String                 @id @default(cuid(2))
  /// Engagement/brand key: "BBL" | "MMB" (string, NOT the Brand enum — the in-app multi-brand
  /// enum harness is dead/being pruned, and this axis is the RDD engagement portfolio, which
  /// outgrows any one app's enum; also keeps the widget free of a value-imported Brand enum
  /// in client-shared code, a known trap).
  brand       String
  type        FeatureRequestType
  title       String                 // ≤120, schema-enforced
  body        String                 // ≤4000, schema-enforced
  urgency     FeatureRequestUrgency  @default(NORMAL)
  status      FeatureRequestStatus   @default(NEW)

  /// Operator's triage estimate, in hours (quarter-hour granularity is real: the 0667
  /// worksheet bills 0.25 h rows). NULL until ESTIMATED.
  estimatedHours Decimal?            @db.Decimal(6, 2)
  /// Rate applied, cents/hr: 20000 standard · 10000 F&F · 0 retainer-included/comp (fork §7.3).
  /// NULL until ESTIMATED. Always a snapshot — rate-table changes never rewrite history.
  rateCents      Int?
  /// Free-text estimate/approval trail: what was quoted, where/when the client said yes.
  estimateNote   String?
  /// Invoice number this row was billed on (e.g. "RBD-2026-002") once rolled up (§5.2).
  /// Plain string, no FK — invoices are doc artifacts (template/prototype/QuickBooks), not rows.
  invoiceRef     String?

  requester   User?   @relation(fields: [requesterId], references: [id])
  requesterId String?   // session-derived on widget writes; NULL for transcribed mailto rows
  /// Snapshot for mailto transcriptions with no User row ("Michael Flores <email>").
  requesterLabel String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([brand, status])
  @@index([invoiceRef])
}

enum FeatureRequestType    { FEATURE  BUG  DESIGN_TWEAK }
enum FeatureRequestUrgency { LOW  NORMAL  HIGH }
enum FeatureRequestStatus  {
  NEW                   // just landed (widget or transcribed mailto)
  TRIAGED               // operator has read it; scoped/deduped/split
  ESTIMATED             // hours + rate set; estimate DRAFT exists for the client
  APPROVED_FOR_INVOICE  // client said yes to the estimate — work may start
  DONE                  // work delivered; awaiting roll-up onto an invoice draft
  DECLINED              // operator or client passed (either side, any stage)
}
```

Notes for the build lane:

- **BBL rows never reach `ESTIMATED`** in v1 — BBL is RDD's own brand; Tony's requests feed the
  planning loop (triage → a PL row / lane by hand → `DONE`/`DECLINED`), not billing. The lifecycle
  supports both; only client-brand engagements use the billing legs. The status enum is one
  machine, not two — a BBL row simply short-circuits `TRIAGED → DONE`.
- `invoiceRef` back-fills at roll-up time (§5.2) and makes "what's billed vs banked" a one-index
  query (`@@index([invoiceRef])`, NULL = unbilled).
- Where this model lives is fork §7.2; the sketch above is the platform-DB (apps/web) placement.

---

## 4. Estimate flow

### 4.1 Who estimates (fork §7.1 — recommendation: operator first, agent-draft later)

**v1: the operator estimates at triage.** Brian reads the request in the triage surface (§6
Phase 2), sets `estimatedHours` + picks a rate, status → `ESTIMATED`. He is the only person with
the codebase context AND the authority to commit hours — and an estimate is a *price quote*, which
falls squarely under the hard rule: it must never reach a client without his hands on it.

**Flagged fork (§7.1): agent-assist DRAFT estimates.** A later slice can have an agent read the
request + the affected code and pre-fill a DRAFT `estimatedHours` + rationale into `estimateNote`
for Brian to accept/edit at triage — the same "agent drafts, operator ratifies" contract as every
other draft artifact in this pipeline. The DRAFT estimate is **never client-visible**: it lives
only in the triage surface until Brian ratifies and sends. Not in v1.

### 4.2 The rate table (ratified — V10)

| Rate | Cents/hr | Applies |
|---|---:|---|
| Standard studio | 20000 ($200/hr) | Default for any non-discounted engagement |
| Friends & Family | 10000 ($100/hr) | MMB today (`invoice-mmb-draft.md` applies it) |
| Retainer-included | 0 | Work covered by a pre-committed retainer block (fork §7.3 — no retainer exists yet) |

Template law carried forward: when a discount rate applies, the estimate and invoice both show the
standard rate struck through so the discount is visible (V10).

### 4.3 How the estimate reaches Michael — BEFORE work starts

1. Brian triages → sets hours + rate → status `ESTIMATED`.
2. The triage surface renders a **copy-ready estimate block** (the 0669 "Copy summary" move —
   clipboard, not email integration):

   ```
   Estimate — <title> (<type>, <urgency>)
   <one-line scope restatement>
   Estimated: <H> h × $<rate>/hr = $<total>   (standard rate $200/hr — F&F applied)
   Nothing is built and nothing is billed until you say go.
   ```

3. **Brian pastes and sends it himself** — email or text, his channel, his moment. The system has
   no send button (§6.4). This is the hard rule's second checkpoint (the first: no auto-ack at
   intake; the third: the invoice draft gate §5).
4. Michael replies yes → Brian flips status → `APPROVED_FOR_INVOICE`, drops the where/when into
   `estimateNote` (audit trail). Only now may a build lane pick the item up.
5. Michael declines or goes quiet → `DECLINED` (revivable by re-triage; rows are never deleted).

Scope-change law (mirrors the template's §Change control): if actual work is going to exceed the
estimate materially, the item goes BACK to `ESTIMATED` with new numbers and a fresh client yes —
no silent overrun billing.

---

## 5. Billing hand-off — into the Client-Invoice pipeline

### 5.1 What feeds the invoice

Only rows that completed the full consent chain: `ESTIMATED → APPROVED_FOR_INVOICE → DONE`, with
`invoiceRef IS NULL`. Anything not client-approved is unbillable by state-machine construction.

### 5.2 Monthly roll-up DRAFT

At period close (monthly, matching the 0667 period framing), the operator (or an agent, drafting)
runs the roll-up:

1. Query: `brand = "MMB" AND status = DONE AND invoiceRef IS NULL AND` period match.
2. Each row becomes one line item in the **existing pipeline's shape** — exactly the 0669
   prototype's columns: `Description / Session-Ref / Hours / Rate` (V11). `title` → Description;
   the delivering session/PR → Session-Ref; `estimatedHours`/`rateCents` → Hours/Rate.
3. The line items are pasted into the pipeline artifacts **by name**:
   - **`rdd-client-invoice-template.md`** (0667) — the email-composer paste-block template; its
     itemized-work table takes these rows directly, and its fill-in checklist is the send gate.
   - **`scripts/prototypes/client-invoice/invoice.html`** (0669) — the fillable prototype; type
     the rows in, rate preset F&F, print-to-PDF or copy-summary.
   - **The parallel QuickBooks lane** — a wave-12 sibling lane is building the QuickBooks flow
     for issued invoices (referenced by name per the dispatch; its branch was not yet on origin
     at spec-write time, so no file citation — honest limit). Wherever the final invoice is
     *issued* from, `invoiceRef` remains the join key; this spec is agnostic between
     prototype-PDF and QuickBooks issuance.
4. Invoice number minted (`RBD-2026-NNN`, per the 0667 draft's `RBD-2026-001` precedent) and
   written back to each rolled-up row's `invoiceRef`.
5. **THE GATE, again and always:** the assembled invoice is a DRAFT. Brian reconciles every number
   (hours worksheet cross-check, the 0667 checklist), then sends by hand. **No step 1–4 sends
   anything, and no build lane may add a step that does.**

### 5.3 Relationship to the other billing artifacts

- The 0667 **hours-worksheet** stays the evidence table for *session-time* billing (the engagement
  build-out). FeatureRequest line items are *per-feature* billing on top — the invoice draft can
  carry both (the template's itemized table is row-shaped, not source-shaped). Double-billing
  guard: a feature delivered inside a session already billed as session-time is either billed as
  the feature line OR the session line, never both — operator's reconciliation call at the
  checklist step.
- The MMB CRM `Invoice` model stays out of this entirely (V12, non-goal).

---

## 6. Build-lane plan — phases + gates

Each phase is one lane, independently shippable, kill-switched (§6.4). Migration discipline is the
0639 pattern throughout (V13): schema + hand-authored migration committed together via
`prisma migrate diff --from-migrations --to-schema`, **unapplied at build time**, applied by the
AM-merge owner; `migrate dev` banned; `prisma generate` before build gates; REAL exit codes, never
piped through `tail` (PL-010).

| Phase | Scope | Gates |
|---|---|---|
| **P0 — stopgap (zero build, today)** | Paste the §2.3 mailto block into `state-of-the-building.html` (0667/AM-merge owner — the file is wave-owned) + any other static client artifact. | None — it's a link. Operator eyeballs the rendered card. |
| **P1 — model + BBL intake** | `FeatureRequest` model + migration (0639 rules) · `FEATURE_REQUEST_CREATE` key in `roles.ts` · `FeatureRequestWidget` (sibling L1, §2.1) · `createFeatureRequest` action (+ `feature_request` rate bucket) · layout mount with the mutual-exclusion rule · Tony's `UserPermissionGrant` minted by the operator post-deploy. | typecheck / oxlint / tests · unit: action rejects without the grant, brand pinned server-side, schema bounds · e2e: widget hidden for plain user, visible+submits for grant-holder (UI-contract law: source+unit+build ≠ verified) · migration unapplied at build, PR says so |
| **P2 — triage + estimate surface** | `/app/feature-requests` as a **conformed AdminCollection data-table** (the admin law — `/app/tools` is the reference impl) · new area key `featureRequests: "feature-requests.manage"` in `APP_AREA_PERMISSIONS` + inline `requirePermission` (the `/app/client-intake` precedent) · row controls: status select (the `planning-intake-status-select` pattern), hours + rate inputs, copy-estimate-block button (§4.3) · `admin-sections` count-lock tests bumped (0639 did 37→38). | typecheck / oxlint / tests · AdminCollection conformance · e2e on the status flip · no send path exists (§6.4 grep gate) |
| **P3 — MMB mount** | Fork §7.2 gates this lane. Recommended v1: widget in the CRM writing a CRM-local `FeatureRequest` (same sketch, Mammoth schema) + a read-only list page; operator triages/estimates on the platform side from that list (manual carry, low volume). The G-024 kernel extraction later collapses the two mounts into ONE module. | `clients-ci` typecheck (root gates never cover `clients/*`) · CRM-local scratch-DB UAT (fixture-login + in-page-fetch, the proven tracer-lane recipe) |
| **P4 — roll-up assist** | Read-only roll-up view or script: period + brand filter → line items in 0669 column shape → clipboard. Optionally pre-fills the 0669 prototype via a paste format. `invoiceRef` write-back happens here (the ONLY write this phase has). | typecheck / tests · output diffed by operator against the hours worksheet before any use |

**Ship order:** P0 today · P1 → P2 next build wave (P1 without P2 leaves rows invisible — ship
both before announcing the widget to Tony) · P3 after fork §7.2 ratifies · P4 with the first real
monthly close.

### 6.4 Kill-switch + the structural no-send guarantee

- **Kill-switch:** `FEATURE_REQUEST_INTAKE_DISABLED` env flag (registered in `env.ts` +
  `.env.example`, the 0639/0660 convention): truthy → widget mounts render nothing and
  `createFeatureRequest` rejects. One env edit, no code change, stops all intake.
- **No-send guarantee (structural):** the feature-request module (`server/web/feature-request/*`,
  the widget, the triage surface, the roll-up) imports **no email/notification code** — no
  `resend`, no `notifyAdmin*`, no `lib/email`. Enforced as a P2 gate:
  `grep -rn "resend\|notifyAdmin\|lib/email" <module paths>` must return empty, recorded in the
  build lane's session file with a real exit code. All output leaves the system through the
  operator's clipboard. An ntfy.sh ping **to Brian himself** on new rows (operator-facing, not
  client-facing) is permitted-by-the-rule but still deferred — v1 keeps the module at zero
  side-channels so the invariant stays grep-simple.

### 6.5 G-024 relationship — this IS a G-024 slice

G-024 already names this program: ONE platform intake module, Michael and Tony by name, MMB mount
as the tracked fast-follow (V5). This spec extends the program with the billing lifecycle. Since
this lane cannot write `docs/knowledge/wiki/**`, the ledger cross-link is **proposed** in
`docs/sprints/SESSION_0675.md` → "Proposed ledger edits" for the AM-merge owner: a G-024 progress
bullet linking this spec as the intake→billing slice, and re-pointing the "MMB mount" remaining
item through §6 P3.

---

## 7. OPEN FORKS — operator ratifies

| # | Fork | Options | Recommendation + why |
|---|---|---|---|
| **7.1** | **Estimate authority** | A) operator-only estimates · B) agent-assist DRAFT estimate at intake, operator ratifies | **A for v1, B as a later slice** (§4.1). An estimate is a price quote — hard-rule territory. B's draft never becomes client-visible without the operator flip, so it's safe to add once the loop has run manually a few times and the agent has real estimate-vs-actual pairs to calibrate on. |
| **7.2** | **Where MMB intake lives** (client app vs RDD side) | A) CRM-local model in the Mammoth DB, operator carries to platform · B) CRM widget POSTs cross-app to a platform endpoint · C) MMB stays mailto-only until kernel extraction | **A** (§6 P3). ADR 0038 separation says products own their DBs — B builds a cross-app authenticated write channel (a new attack/maintenance surface) to save the operator a weekly copy-paste at single-client volume. C is the fallback if P3 keeps slipping; the mailto channel already works. Revisit B only when instance count makes manual carry real toil. |
| **7.3** | **Retainer-vs-hourly interaction** | A) `rateCents = 0` + note ("retainer-included") · B) explicit `billingBasis` enum (HOURLY / RETAINER_INCLUDED / COMP) · C) model retainer blocks as their own entity with drawdown | **A for v1** — no retainer exists yet (the template's retainer row is aspirational; MMB is F&F hourly, V10). B is a cheap additive migration the day a retainer is signed; C is real design work that should wait for a real retainer contract's actual terms. Don't model a contract that doesn't exist. |
| **7.4** | **Sibling model vs extending `PlanningIntake`** | A) new `FeatureRequest` model (this spec) · B) add brand/title/urgency/billing fields + statuses to `PlanningIntake` | **A** (§3). B makes one table serve two state machines and two audiences (internal planning inbox + client billing intake), entangling the by-hand PL-promotion law with invoice generation — the `kind`-union god-model the mantra bans. The cost of A is one more small table; the widget L1 pattern is still shared. |
| *(minor)* | Tony's authz shape | Named FI-019 grant (recommended, §2.1) vs full `admin` role | The grant is scoped, revocable, self-documenting (`reason` column), and exactly what FI-019 was built for; `admin` hands a tester the whole console. Flagged here because the operator may already have made Tony an admin — if so, P1's mutual-exclusion mount still does the right thing (he'd see the internal widget instead; the grant swap is a 1-row change). |

---

## 8. What this spec deliberately leaves alone

- The live State-of-Dojo projection kernel (G-023) — the widget floats over `/app/state`; it does
  not touch `StatePanel` or the frozen panel contract.
- `PlanningIntake` + its triage view + the PL-promotion law (V4).
- The 0667 billing artifacts' numbers and the 0669 prototype's internals — consumed as-is by name.
- Payment rails, invoice issuance mechanics, and the QuickBooks integration — the parallel lane's
  territory; `invoiceRef` is the only coupling, and it's a string.
