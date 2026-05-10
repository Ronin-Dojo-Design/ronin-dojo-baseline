---
title: "SESSION 0112 — Phase 3 Merch Stripe Checkout + Admin Product Management"
slug: session-0112
type: session
status: in-progress
created: 2026-05-09
updated: 2026-05-09
last_agent: copilot-session-0112
sprint: S3
pairs_with:
  - docs/sprints/SESSION_0111.md
  - docs/architecture/decisions/0014-stripe-product-policy.md
  - docs/architecture/monetization-entitlements-spec.md
  - apps/web/server/web/billing/actions.ts
  - apps/web/server/web/merch/queries.ts
  - apps/web/app/(web)/merch/page.tsx
  - apps/web/components/web/tuffbuffs/merch-card.tsx
  - apps/web/components/web/tuffbuffs/merch-browser.tsx
  - apps/web/app/admin/pricing-plans/_components/pricing-plan-form.tsx
  - apps/web/prisma/seed-tuffbuffs-merch.ts
  - apps/web/app/api/stripe/webhooks/route.ts
  - docs/runbooks/stripe-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
  - docs/protocols/project-log.md
---

# SESSION 0112 — Phase 3 Merch Stripe Checkout + Admin Product Management

## Date

2026-05-09

## Operator

Brian Scott + Copilot acting as Petey (planner)

## Status

in-progress

## Goal

Detailed planning for Phase 3: Stripe Checkout integration for the `/merch` store, customer-facing checkout UI, and admin UI for managing merch products (adding/editing products, managing images, role-based access). Execute if runway permits.

## Graphify check

- Graph status: current (post-SESSION_0111 commit `87d8a0a`)
- Queries used:
  1. `stripe checkout session merch product billing actions webhook` → `billing/actions.ts`, `products/actions.ts`, `register.ts`, `stripe/webhooks/route.ts`, ADR 0014
  2. `admin pricing plan form image media upload role permission` → `pricing-plan-form.tsx`, `form-media.tsx`, `auth-hoc.tsx`, `authz.ts`
- Key findings:
  - `createProgramEnrollmentCheckout` in `billing/actions.ts` is the gold-standard checkout pattern
  - Admin pricing-plan CRUD is full gold-standard (12 files)
  - `FormMedia` component exists for image upload
  - `authz.ts` has role-checking helpers
  - Webhook handler already routes by `metadata.brand` and handles `checkout.session.completed`

## Petey Plan

### Context: What exists vs what's needed

| Component | Current state | What's needed |
| --- | --- | --- |
| **Merch products in DB** | ✅ 24 PricingPlan rows with `metadata.source = "tuffbuffs-merch"` | Need `stripeProductId` + `stripePriceId` populated |
| **Merch store page** | ✅ `/merch` with category browser, product cards | Add size/color selectors, "Add to Cart" → Stripe Checkout |
| **Stripe Products** | ❌ Not created yet | Create via setup script (ADR 0014 naming: `BMA_merch_{id}`) |
| **Checkout flow** | ❌ No merch checkout action | Create `createMerchCheckout` server action |
| **Webhook handling** | ✅ Generic `checkout.session.completed` handler | Extend to handle `type: "merch_purchase"` metadata |
| **Order tracking** | ❌ No order model | Use existing `Payment` + `Invoice` for now; future `MerchOrder` |
| **Admin product CRUD** | ✅ Generic pricing-plan admin (12 gold-standard files) | Add merch-specific fields: images gallery, sizes, colors, stock toggle |
| **Image management** | ✅ `FormMedia` component exists for single image | Need multi-image gallery for merch |
| **Role-based access** | ✅ `withAdminPage` HOC + `authz.ts` | Need merch-manager role or permission check |

### Phase 3 decomposition — 3 work streams

#### Stream A — Stripe Product Setup (script + DB update)

**TASK_01 — Create Stripe Products + Prices for merch items**
- **Agent:** Cody
- **What:** Extend `scripts/setup-ronin-stripe-products.ts` (or create `scripts/setup-merch-stripe-products.ts`) to create Stripe Products + Prices for the 24 merch items. Follow ADR 0014 naming (`BMA_merch_{product_id}`). Write `stripeProductId` and `stripePriceId` back to the PricingPlan rows.
- **Steps:**
  1. Read all PricingPlan rows where `metadata.source = "tuffbuffs-merch"`
  2. For each, create Stripe Product with metadata: `{ brand, vertical: "merch", organization_id, created_by: "script" }`
  3. Create one Stripe Price per product (one-time `payment` mode, amount from PricingPlan)
  4. Update PricingPlan row with `stripeProductId` and `stripePriceId`
  5. Push ALL products including those with `placeholder.svg` — use a branded fallback image for Stripe product images where no real image exists
- **Done means:** PricingPlan rows for in-stock merch products have `stripeProductId` + `stripePriceId`. Stripe Dashboard shows the products.

#### Stream B — Customer Checkout Flow

**TASK_02 — Create `createMerchCheckout` server action**
- **Agent:** Cody
- **What:** Create `server/web/merch/actions.ts` with a `createMerchCheckout` action following the `createProgramEnrollmentCheckout` pattern exactly.
- **Input schema:**
  ```typescript
  {
    pricingPlanId: string  // the PricingPlan ID for the merch item
    quantity: number       // default 1
    size?: string          // selected size (stored in checkout metadata)
    color?: string         // selected color (stored in checkout metadata)
  }
  ```
- **Validation:**
  1. Resolve brand via `getRequestBrand()`
  2. Find PricingPlan by ID + brand + `isActive` + `metadata.source = "tuffbuffs-merch"`
  3. Verify `stripePriceId` exists (not yet pushed to Stripe = can't checkout)
  4. Verify `metadata.inStock = true`
  5. Resolve or create Stripe customer
- **Checkout session metadata:**
  ```json
  {
    "type": "merch_purchase",
    "userId": "...",
    "pricingPlanId": "...",
    "organizationId": "...",
    "brand": "BASELINE_MARTIAL_ARTS",
    "size": "L",
    "color": "Black"
  }
  ```
- **Mode:** `payment` (one-time, not subscription)
- **Shipping:** Add `shipping_address_collection` with `allowed_countries: ["US"]` and flat-rate shipping ($4.99 via `TUFFBUFFS_MERCH_SHIPPING_FEE_CENTS`)
- **Success/cancel URLs:** `/merch/order/success?sessionId={CHECKOUT_SESSION_ID}` / `/merch?cancelled=true`
- **Done means:** Server action compiles, creates Stripe Checkout session with merch metadata + shipping.

**TASK_03 — Merch product detail + checkout UI**
- **Agent:** Cody
- **What:** Create `/merch/[id]/page.tsx` product detail page with:
  1. Image gallery (carousel of `metadata.imagePaths`)
  2. Size selector (radio group from `metadata.sizes`)
  3. Color selector (radio group from `metadata.colors`)
  4. Price display
  5. "Buy Now" button → calls `createMerchCheckout`
  6. Shipping info note ($4.99 flat rate)
- **Components needed:**
  - `merch-product-detail.tsx` — client component with size/color state + checkout action
  - `merch-image-gallery.tsx` — image carousel/grid
- **L1 components:** `Card`, `RadioGroup`, `Button`, `Badge`, `Stack`, `H2`, `H3`, `Wrapper`, `Intro`
- **Done means:** Product detail page renders, size/color selectable, "Buy Now" redirects to Stripe Checkout.

**TASK_04 — Order success page**
- **Agent:** Cody
- **What:** Create `/merch/order/success/page.tsx` that:
  1. Reads `sessionId` from URL params
  2. Displays "Thank you for your order" with order summary
  3. Shows shipping info (address from Stripe session)
  4. Link back to `/merch`
- **Done means:** After successful Stripe payment, user sees confirmation page.

#### Stream C — Admin Product Management

**TASK_05 — Extend pricing-plan-form for merch fields**
- **Agent:** Cody
- **What:** Add merch-specific fields to the existing `pricing-plan-form.tsx` that appear conditionally when `metadata.source = "tuffbuffs-merch"`:
  1. **Image gallery manager:** Multi-image upload using `FormMedia` pattern — add/remove/reorder images for `metadata.imagePaths`
  2. **Sizes editor:** Tag-style input for `metadata.sizes` array
  3. **Colors editor:** Tag-style input for `metadata.colors` array
  4. **Features editor:** Tag-style input for `metadata.features` array
  5. **Stock toggle:** Switch for `metadata.inStock`
  6. **Featured toggle:** Switch for `metadata.featured`
  7. **Category select:** Dropdown for `metadata.category`
  8. **Product type input:** Text for `metadata.type`
  9. **Class type select:** Optional dropdown for `metadata.classType`
- **Pattern:** These fields edit the `metadata` JSON. The form should serialize them back into the metadata object on submit.
- **Done means:** Admin can edit all merch-specific fields via the existing pricing-plan form.

**TASK_06 — Role-based merch management permissions**
- **Agent:** Cody
- **What:** Wire merch management permissions using the existing role/user system:
  1. Admin users (existing `withAdminPage`) can always manage merch
  2. Use existing `MembershipRoleAssignment` roles — org `OWNER` and `ADMIN` roles can manage merch
  3. `authz.ts` helper: `canManageMerch(user, brand)` — checks admin OR org OWNER/ADMIN
  4. Pricing-plan form conditionally shows merch fields based on this permission
- **Done means:** Org owners/admins can manage merch products. No new models or enums needed.

**TASK_07 — Webhook extension for merch purchases**
- **Agent:** Cody
- **What:** In the existing webhook handler (`app/api/stripe/webhooks/route.ts`), add handling for `checkout.session.completed` events where `metadata.type = "merch_purchase"`:
  1. Create `Payment` record
  2. Create `Invoice` + `InvoiceLineItem`
  3. Log the order details (size, color, shipping address)
  4. No entitlement grant needed (merch is physical, not digital access)
- **Done means:** Merch purchases create proper payment/invoice records.

### Parallelism

```
Stream A (TASK_01) ──→ Stream B (TASK_02 → TASK_03 → TASK_04)
                   ╲
                    ──→ Stream C (TASK_05 → TASK_06)
                                           ↓
                                        TASK_07 (needs TASK_02 metadata format)
```

TASK_01 first (Stripe products). Then Streams B and C can run in parallel. TASK_07 last (needs metadata format from TASK_02).

### Agent assignments

| Task | Agent | Rationale |
| --- | --- | --- |
| TASK_01 | Cody | Script work, follows existing setup-stripe-products pattern |
| TASK_02 | Cody | Server action, follows createProgramEnrollmentCheckout exactly |
| TASK_03 | Cody | UI components, follows component inventory |
| TASK_04 | Cody | Simple page, follows existing patterns |
| TASK_05 | Cody | Form extension, follows pricing-plan-form pattern |
| TASK_06 | Petey → Cody | Design decision needed first (role model), then implementation |
| TASK_07 | Cody | Webhook extension, follows existing handler pattern |

### Open decisions

1. ~~**TASK_06 — Role model for merch management:**~~ ✅ **Resolved:** Use existing roles and user definitions already in the system. No new enum or Permission model needed — the role/user infrastructure is already set up. User signed off.

2. ~~**Shipping integration:**~~ ✅ **Resolved:** Flat $4.99 as default for launch. Plan and spec a real shipping calculator (weight-based, USPS/FedEx API) as a follow-on task — not deferred indefinitely, actively planned. User signed off.

3. ~~**Placeholder products:**~~ ✅ **Resolved:** DO push all products to Stripe including placeholders. Show them on the merch page with a graceful fallback UI for products without real images (branded placeholder card, not hidden). User signed off.

4. ~~**Order fulfillment:**~~ ✅ **Resolved:** Manual via Stripe Dashboard for now. Printful integration is the planned next step — Brian already uses Printful for WEKAF Team USA uniforms and TuffBuffs/Baseline/BBL/WEKAF shirts, rash guards, and hoodies. Dedicated Printful POD session planned. User signed off.

### Risks

- Multi-size/color products are ONE Stripe Product with ONE Price in this design. Size/color are metadata on the checkout session, not separate Price objects. This means Stripe inventory tracking won't work per-size — acceptable for launch, revisit if needed.
- Shipping address collection adds complexity to Checkout. Stripe handles the UX, but we need to store the address for fulfillment.
- Products with `placeholder.svg` will be purchasable — need a graceful fallback image so the Stripe Checkout page doesn't show a broken image.

### Scope guard

If additional work surfaces during execution, note it in SESSION file under `Open decisions / blockers` — do NOT expand scope mid-task. Order fulfillment, print-on-demand, multi-currency, tax configuration, and inventory management are explicitly future sessions.

### Dirstarter implementation template

- **Docs read first:** ADR 0014 (Stripe Product Policy), monetization-entitlements-spec.md, Dirstarter [Payments](https://dirstarter.com/docs/integrations/payments) and [Monetization](https://dirstarter.com/docs/monetization) docs.
- **Baseline pattern to extend:** `createProgramEnrollmentCheckout` server action, `setup-stripe-products.ts` script, `checkout.session.completed` webhook handler, `pricing-plan-form.tsx` admin form.
- **Custom delta:** Merch-specific checkout with shipping, multi-image gallery, size/color selectors, conditional form fields, role-based access.
- **No-bypass proof:** Stripe Checkout is Dirstarter's payment pattern. We extend it, not replace it.

## What Landed

(Execution pending — plan complete, ready for TASK_01)

## Files Touched

(Execution pending)

## Task Log

(Execution pending)

## Decisions Resolved

(Execution pending)

## Open Decisions / Blockers

All 4 decisions resolved — no blockers. Ready for execution.

- **Printful POD integration:** Future session. Brian uses Printful for WEKAF Team USA, TuffBuffs/Baseline/BBL/WEKAF apparel. Will be a dedicated integration session.
- **Real shipping calculator:** Actively planned follow-on — weight-based USPS/FedEx API. Not deferred indefinitely.

## Next Session

### Goal

Execute Phase 3 tasks if not completed this session. Start with TASK_01 (Stripe Product creation).

### Inputs to read

- This SESSION file (plan is complete)
- `apps/web/server/web/billing/actions.ts` — checkout action pattern
- `apps/web/app/api/stripe/webhooks/route.ts` — webhook handler

### First task

TASK_01 — Create Stripe Products + Prices for merch items via setup script.
