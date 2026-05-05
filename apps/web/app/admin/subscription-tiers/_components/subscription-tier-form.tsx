"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { SubscriptionTierActions } from "~/app/admin/subscription-tiers/_components/subscription-tier-actions"
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
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { useComputedField } from "~/hooks/use-computed-field"
import { cx } from "~/lib/utils"
import { upsertSubscriptionTier } from "~/server/admin/subscription-tiers/actions"
import type { findSubscriptionTierById } from "~/server/admin/subscription-tiers/queries"
import { subscriptionTierSchema } from "~/server/admin/subscription-tiers/schema"

type SubscriptionTierFormProps = ComponentProps<"form"> & {
  tier?: Awaited<ReturnType<typeof findSubscriptionTierById>>
}

export function SubscriptionTierForm({
  children,
  className,
  title,
  tier,
  ...props
}: SubscriptionTierFormProps) {
  const router = useRouter()
  const resolver = zodResolver(subscriptionTierSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    upsertSubscriptionTier,
    resolver,
    {
      formProps: {
        defaultValues: {
          id: tier?.id ?? "",
          code: tier?.code ?? "",
          name: tier?.name ?? "",
          description: tier?.description ?? "",
          level: tier?.level ?? 0,
          isSystem: tier?.isSystem ?? false,
        },
      },

      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(`Subscription tier successfully ${tier ? "updated" : "created"}`)
          router.push(`/admin/subscription-tiers/${data?.id}`)
        },

        onError: ({ error }) => {
          toast.error(error.serverError)
        },
      },
    },
  )

  // Auto-generate code from name (e.g., "Gold Tier" → "gold-tier")
  useComputedField({
    form,
    sourceField: "name",
    computedField: "code",
    callback: (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    enabled: !tier,
  })

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          {tier && <SubscriptionTierActions tier={tier} />}

          <Button variant="primary" isPending={action.isPending} onClick={handleSubmitWithAction}>
            {tier ? "Update tier" : "Create tier"}
          </Button>
        </Stack>
      </Stack>

      <form
        className={cx("grid gap-4 sm:grid-cols-2", className)}
        noValidate
        onSubmit={handleSubmitWithAction}
        {...props}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Gold Tier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. gold-tier"
                  className="font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} value={field.value as number ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSystem"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel>System tier</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="What does this tier include?"
                  {...field}
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
