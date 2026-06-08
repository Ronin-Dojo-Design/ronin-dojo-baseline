import { execFileSync } from "node:child_process"

export type LineageMembershipCheckoutFixture = {
  suffix: string
  userId: string
  organizationId: string
  planIds: string[]
  entitlementIds: string[]
  oneTimePlanId: string
  oneTimePlanName: string
  oneTimePriceId: string
  oneTimeEntitlementId: string
  subscriptionPlanId: string
  subscriptionPlanName: string
  subscriptionPriceId: string
  subscriptionEntitlementId: string
}

export type LineageCheckoutState = {
  activePurchaseGrantCount: number
  activeSubscriptionGrantCount: number
  revokedSubscriptionGrantCount: number
  membershipCount: number
  programEnrollmentCount: number
  paidInvoiceCount: number
  stripeCustomerCount: number
  processedWebhookCount: number
  entitlements: Array<{
    entitlementId: string
    sourceType: string
    sourceId: string | null
    status: string
  }>
}

export type LineageWebhookResult = {
  status: number
  body: string
  state: LineageCheckoutState
}

type CompleteLineageCheckoutInput = {
  fixture: LineageMembershipCheckoutFixture
  mode: "payment" | "subscription"
  sessionId: string
  subscriptionId?: string
}

type DeleteLineageSubscriptionInput = {
  fixture: LineageMembershipCheckoutFixture
  subscriptionId: string
}

function runStripeDbCommand<T>(command: string, payload?: unknown): T {
  const args = ["e2e/helpers/stripe-checkout-db.ts", command]

  if (payload !== undefined) {
    args.push(Buffer.from(JSON.stringify(payload), "utf-8").toString("base64"))
  }

  const raw = execFileSync("bun", args, {
    cwd: process.cwd(),
    encoding: "utf-8",
  })

  return raw ? (JSON.parse(raw) as T) : (undefined as T)
}

export function seedLineageMembershipCheckoutFixture(userId: string) {
  return runStripeDbCommand<LineageMembershipCheckoutFixture>("seed", { userId })
}

export function completeLineageCheckout(input: CompleteLineageCheckoutInput) {
  return runStripeDbCommand<LineageWebhookResult>("complete-checkout", input)
}

export function deleteLineageSubscription(input: DeleteLineageSubscriptionInput) {
  return runStripeDbCommand<LineageWebhookResult>("delete-subscription", input)
}

export function readLineageCheckoutState(fixture: LineageMembershipCheckoutFixture) {
  return runStripeDbCommand<LineageCheckoutState>("read-state", { fixture })
}

export function cleanupLineageMembershipCheckoutFixture(fixture: LineageMembershipCheckoutFixture) {
  runStripeDbCommand<void>("cleanup", { fixture })
}
