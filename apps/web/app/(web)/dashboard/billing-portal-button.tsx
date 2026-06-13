"use client"

import { CreditCardIcon } from "lucide-react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { createBillingPortalSession } from "~/server/web/billing/actions"

export function BillingPortalButton() {
  const { execute, isPending } = useAction(createBillingPortalSession, {
    onError: ({ error }) => {
      toast.error(error.serverError)
    },
  })

  return (
    <Button
      variant="secondary"
      size="sm"
      prefix={<CreditCardIcon />}
      isPending={isPending}
      onClick={() => execute({ returnUrl: "/app/profile" })}
    >
      Manage billing
    </Button>
  )
}
