"use client"

import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import { H4 } from "~/components/common/heading"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { createLineageMembershipCheckout } from "~/server/web/billing/actions"
import type { LineageMembershipPlan } from "~/server/web/billing/lineage-membership"

type LineageMembershipCheckoutProps = {
  plans: LineageMembershipPlan[]
  onSelectPlan?: (plan: LineageMembershipPlan) => void
}

const formatPrice = (plan: LineageMembershipPlan) => {
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: 0,
  }).format(plan.amountCents / 100)

  if (plan.intervalMonths === 1) return `${price}/mo`
  if (plan.intervalMonths === 12) return `${price}/yr`
  if (plan.intervalMonths) return `${price}/${plan.intervalMonths} mo`
  return price
}

const getIntakeCtaLabel = (plan: LineageMembershipPlan) => {
  if (plan.requiresBlackBelt) return "Start Black Belt rate intake"
  if (plan.entitlementKeys.includes("LINEAGE_ELITE")) return "Start Elite intake"
  return "Start Premium intake"
}

export function LineageMembershipCheckout({ plans, onSelectPlan }: LineageMembershipCheckoutProps) {
  const checkout = useAction(createLineageMembershipCheckout, {
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to start checkout")
    },
  })
  const startsWithIntake = Boolean(onSelectPlan)

  const startCheckout = async (plan: LineageMembershipPlan) => {
    if (onSelectPlan) {
      onSelectPlan(plan)
      return
    }

    const result = await checkout.executeAsync({ pricingPlanId: plan.id })

    if (result?.data?.checkoutUrl) {
      window.location.assign(result.data.checkoutUrl)
      return
    }

    if (result?.serverError) {
      toast.error(result.serverError)
    }
  }

  if (plans.length === 0) {
    return (
      <Card hover={false} className="p-4" data-testid="lineage-membership-empty">
        <Stack direction="column" size="xs">
          <Badge variant="outline">Membership</Badge>
          <strong>Lineage membership</strong>
          <Note className="text-sm">Paid lineage tiers are being prepared for this brand.</Note>
        </Stack>
      </Card>
    )
  }

  return (
    <Stack direction="column" className="gap-4">
      <Stack direction="column" size="xs" className="w-full">
        <Badge variant="outline">Membership</Badge>
        <strong>Lineage membership</strong>
        <Note className="text-sm">
          {startsWithIntake
            ? "Pick a price, complete the join intake, then continue to Checkout."
            : "Choose an annual lineage tier to continue to Checkout."}{" "}
          The discounted Elite rate is for verified BJJ black belts.
        </Note>
      </Stack>

      {plans.map(plan => (
        <Card
          key={plan.id}
          hover={false}
          className="p-4"
          data-testid={`lineage-membership-plan-${plan.id}`}
        >
          <Stack direction="column" size="md" className="w-full">
            <Stack direction="column" size="xs" className="w-full">
              <Stack className="w-full justify-between gap-3" wrap={false}>
                <H4 className="min-w-0 flex-1 truncate">{plan.name}</H4>
                <Badge variant={plan.intervalMonths ? "info" : "success"}>
                  {plan.intervalMonths ? "Subscription" : "One-time"}
                </Badge>
              </Stack>
              {plan.summary && <Note className="text-sm">{plan.summary}</Note>}
            </Stack>

            <div className="text-2xl font-semibold leading-tight">{formatPrice(plan)}</div>

            {plan.features.length > 0 && (
              <ul className="grid gap-2 text-sm text-secondary-foreground">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-green-600" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              className="w-full"
              variant="primary"
              suffix={startsWithIntake ? <ArrowRightIcon /> : <ArrowUpRightIcon />}
              isPending={!startsWithIntake && checkout.isPending}
              disabled={!startsWithIntake && checkout.isPending}
              onClick={() => {
                void startCheckout(plan)
              }}
            >
              {startsWithIntake ? getIntakeCtaLabel(plan) : plan.ctaLabel}
            </Button>
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
