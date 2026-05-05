"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import { type ComponentProps, use } from "react"
import { toast } from "sonner"
import { SubscriptionActions } from "~/app/admin/subscriptions/_components/subscription-actions"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { cx } from "~/lib/utils"
import { upsertSubscription } from "~/server/admin/subscriptions/actions"
import type { findSubscriptionById } from "~/server/admin/subscriptions/queries"
import { subscriptionSchema } from "~/server/admin/subscriptions/schema"
import type { findSubscriptionTierList } from "~/server/admin/subscription-tiers/queries"

type SubscriptionFormProps = ComponentProps<"form"> & {
  subscription?: Awaited<ReturnType<typeof findSubscriptionById>>
  tiersPromise: ReturnType<typeof findSubscriptionTierList>
}

export function SubscriptionForm({
  children,
  className,
  title,
  subscription,
  tiersPromise,
  ...props
}: SubscriptionFormProps) {
  const router = useRouter()
  const resolver = zodResolver(subscriptionSchema)
  const tiers = use(tiersPromise)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    upsertSubscription,
    resolver,
    {
      formProps: {
        defaultValues: {
          id: subscription?.id ?? "",
          userId: subscription?.userId ?? "",
          tierId: subscription?.tierId ?? "",
          status: subscription?.status ?? "ACTIVE",
          startsAt: subscription?.startsAt ?? new Date(),
          expiresAt: subscription?.expiresAt ?? null,
        },
      },

      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(`Subscription successfully ${subscription ? "updated" : "created"}`)
          router.push(`/admin/subscriptions/${data?.id}`)
        },

        onError: ({ error }) => {
          toast.error(error.serverError)
        },
      },
    },
  )

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          {subscription && (
            <SubscriptionActions subscription={subscription as any} />
          )}

          <Button variant="primary" isPending={action.isPending} onClick={handleSubmitWithAction}>
            {subscription ? "Update subscription" : "Create subscription"}
          </Button>
        </Stack>
      </Stack>

      <form
        className={cx("grid gap-4 sm:grid-cols-2", className)}
        noValidate
        onSubmit={handleSubmitWithAction}
        {...props}
      >
        {!subscription && (
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input placeholder="User CUID" className="font-mono text-sm" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="tierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiers.map(tier => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.name} (L{tier.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="PAST_DUE">Past Due</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expiresAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expires At (optional)</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                  onChange={e =>
                    field.onChange(e.target.value ? new Date(e.target.value) : null)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
