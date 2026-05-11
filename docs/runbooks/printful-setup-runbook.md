---
title: Printful API Setup Runbook
slug: printful-setup-runbook
type: runbook
status: active
created: 2026-05-10
updated: 2026-05-10
last_agent: copilot-session-0117
pairs_with:
  - docs/architecture/printful-pod-spec.md
  - docs/runbooks/stripe-setup-runbook.md
  - docs/runbooks/resend-setup-runbook.md
backlinks:
  - docs/knowledge/wiki/index.md
tags:
  - printful
  - pod
  - merch
  - runbook
  - infrastructure
---

# Printful API Setup Runbook

Step-by-step operator guide for configuring the Printful print-on-demand integration for the Ronin Dojo platform.

## Prerequisites

- Printful account ([printful.com](https://www.printful.com))
- A "Manual order platform/API" store created in Printful Dashboard
- Access to `.env` in `apps/web/`

## Architecture Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PRINTFUL INTEGRATION POINTS                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  apps/web/                                                          │
│  ├── services/printful.ts        ← API client (L1 pattern)         │
│  ├── env.ts                      ← PRINTFUL_* env var declarations │
│  ├── .env                        ← Local secrets (gitignored)      │
│  └── app/api/stripe/webhooks/    ← merch_purchase → createOrder()  │
│                                                                     │
│  External                                                           │
│  ├── api.printful.com            ← REST API (Bearer token auth)    │
│  └── developers.printful.com     ← Developer Portal (token mgmt)  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step

### 1. Create a Printful account

Go to [printful.com](https://www.printful.com) and sign up or log in.

### 2. Create an API store

- Go to [printful.com/dashboard/store](https://www.printful.com/dashboard/store)
- Click **"Create"** under **"Manual order platform/API"**
- Name it (e.g., "Baseline Martial Arts")

### 3. Generate a Private Token

- Go to the **Developer Portal**: [developers.printful.com/tokens](https://developers.printful.com/tokens)
- Sign in with your Printful account
- Click **"Add new token"** or go to [developers.printful.com/tokens/add-new-token](https://developers.printful.com/tokens/add-new-token)
- Set access level to **"A single store"** and select your store
- Select scopes: `orders`, `sync_products`, `file_library`, `webhooks`
- Create the token — **copy it immediately** (it won't be shown again)

> **Important:** The token page is in the Developer Portal (`developers.printful.com`), NOT the main Printful dashboard settings.

### 4. Wire environment variables

Add to `apps/web/.env`:

```bash
# === Printful (POD) ===
PRINTFUL_API_KEY="<your-private-token>"
PRINTFUL_WEBHOOK_SECRET=""
PRINTFUL_CONFIRM_ORDERS="false"
```

- `PRINTFUL_API_KEY` — the Private Token from step 3
- `PRINTFUL_WEBHOOK_SECRET` — set later when configuring webhooks
- `PRINTFUL_CONFIRM_ORDERS` — `"false"` in dev/test (orders stay as drafts), `"true"` in production (auto-confirm)

### 5. Verify the token works

```bash
curl -s 'https://api.printful.com/stores' \
  --header 'Authorization: Bearer <your-token>' | python3 -m json.tool
```

Expected: `"code": 200` with your store listed.

### 6. Test a shipping rate call

```bash
curl -s -X POST 'https://api.printful.com/shipping/rates' \
  --header 'Authorization: Bearer <your-token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "recipient": {
      "address1": "123 Main St",
      "city": "Denver",
      "state_code": "CO",
      "country_code": "US",
      "zip": "80202"
    },
    "items": [{ "variant_id": 4012, "quantity": 1 }]
  }' | python3 -m json.tool
```

Expected: shipping options with rates and delivery estimates.

### 7. Add Vercel production env vars

In Vercel Dashboard → Settings → Environment Variables, add:

| Variable | Value | Environment |
|---|---|---|
| `PRINTFUL_API_KEY` | `<production token>` | Production |
| `PRINTFUL_WEBHOOK_SECRET` | `<from webhook setup>` | Production |
| `PRINTFUL_CONFIRM_ORDERS` | `true` | Production |

> **Note:** Consider generating a separate token for production with tighter scope.

### 8. Configure webhooks (future session)

Once the app is deployed with a public URL:

```bash
curl -X POST 'https://api.printful.com/webhooks' \
  --header 'Authorization: Bearer <your-token>' \
  --header 'Content-Type: application/json' \
  --data '{
    "url": "https://baselinemartialarts.com/api/printful/webhooks",
    "types": [
      "package_shipped",
      "order_failed",
      "order_canceled",
      "order_put_hold",
      "order_remove_hold"
    ]
  }'
```

## API Reference Quick Links

| Resource | URL |
|---|---|
| Developer Portal | [developers.printful.com](https://developers.printful.com) |
| API Docs | [developers.printful.com/docs](https://developers.printful.com/docs) |
| Token Management | [developers.printful.com/tokens](https://developers.printful.com/tokens) |
| Webhook Simulator | [printful.com/api/webhook-simulator](https://www.printful.com/api/webhook-simulator) |
| Dashboard (stores) | [printful.com/dashboard/store](https://www.printful.com/dashboard/store) |

## Rate Limits

- General: **120 requests/minute**
- Mockup generator: lower limit (varies)
- Private Tokens have an **expiration date** — monitor and rotate before expiry

## Troubleshooting

| Problem | Solution |
|---|---|
| `401 Unauthorized` | Token expired or invalid. Generate a new one at [developers.printful.com/tokens](https://developers.printful.com/tokens). |
| `403 Forbidden` | Token doesn't have required scope. Recreate with correct scopes. |
| `429 Too Many Requests` | Rate limited. Back off 60 seconds. |
| Store not found | Token scoped to wrong store. Check `GET /stores` response. |
| Orders auto-confirming in dev | Set `PRINTFUL_CONFIRM_ORDERS="false"` in `.env`. |

## Known Gotchas

- **Token visibility:** Private Tokens are only shown once at creation. If lost, delete and create a new one.
- **Developer Portal vs Dashboard:** API tokens live at `developers.printful.com`, not in the main Printful dashboard settings page.
- **Store naming:** Printful names the API store "Personal orders" by default. Rename in Dashboard → Settings if desired.
- **Jewelry products:** Not supported via API (Printful limitation).

## Cross-references

- [Printful POD Spec](../architecture/printful-pod-spec.md) — full integration spec with wireframes, state machine, data flows
- [Stripe Setup Runbook](stripe-setup-runbook.md) — Stripe integration (payments flow into Printful orders)
- [Resend Setup Runbook](resend-setup-runbook.md) — transactional email (order confirmations)
- [`services/printful.ts`](../../apps/web/services/printful.ts) — API client implementation
- [`server/web/merch/printful-actions.ts`](../../apps/web/server/web/merch/printful-actions.ts) — `createPrintfulOrder()` server action
- [`app/api/stripe/webhooks/route.ts`](../../apps/web/app/api/stripe/webhooks/route.ts) — Stripe webhook merch_purchase handler (creates MerchOrder + triggers Printful)

## Implementation Status

### Phase 1 (SESSION_0117)

| Component | Status | Notes |
|---|---|---|
| `services/printful.ts` — API client | ✅ Done | createOrder, getOrder, getShippingRates, cancelOrder, estimateOrderCosts, verifyWebhookSignature |
| `MerchOrder` model + `FulfillmentStatus` enum | ✅ Done | Migration `20260511011048_add_merch_order_fulfillment` |
| `printful-actions.ts` — `createPrintfulOrder()` | ✅ Done | Variant mapping stubbed — needs Printful catalog variant IDs |
| Stripe webhook wiring | ✅ Done | `merch_purchase` handler creates MerchOrder + calls `createPrintfulOrder()` via `after()` |
| Product mapping (variant IDs) | ⬜ Blocked | Need to map each merch PricingPlan to Printful catalog `variant_id` |

### Mapping Printful Variant IDs

To complete the integration, populate `PRINTFUL_VARIANT_MAP` in `server/web/merch/printful-actions.ts`.

**How to find variant IDs:**

```bash
# List all Printful catalog products (find the product ID for your base product)
curl -s 'https://api.printful.com/products' \
  --header 'Authorization: Bearer <your-token>' | python3 -m json.tool | grep -A2 '"id"'

# Get variants for a specific product (e.g., Bella+Canvas 3001 = product 71)
curl -s 'https://api.printful.com/products/71' \
  --header 'Authorization: Bearer <your-token>' | python3 -c "
import json, sys
data = json.load(sys.stdin)
for v in data['result']['variants']:
    print(f\"  id={v['id']}  size={v['size']}  color={v['color']}  name={v['name']}\")
"
```

Each size/color combo has a unique `variant_id`. Map these into the `PRINTFUL_VARIANT_MAP` keyed by the merch product ID from `seed-tuffbuffs-merch.ts`.

### Phase 2 (future)

- Printful webhook handler (`app/api/printful/webhooks/route.ts`)
- Shipment notification email template
- MerchOrder status lifecycle UI
