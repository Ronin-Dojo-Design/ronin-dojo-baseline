"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ComboboxSelector } from "~/components/admin/combobox-selector"
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
import {
  LINEAGE_ELITE_ENTITLEMENT_KEY,
  LINEAGE_PREMIUM_ENTITLEMENT_KEY,
} from "~/lib/entitlements/lineage-comp"
import { cx } from "~/lib/utils"
import { createInvite } from "~/server/admin/invites/actions"
import { inviteSchema } from "~/server/admin/invites/schema"

type InviteFormProps = ComponentProps<"form"> & {
  organizations: { id: string; name: string }[]
  title?: string
}

export function InviteForm({
  children,
  className,
  title,
  organizations,
  ...props
}: InviteFormProps) {
  const router = useRouter()
  const resolver = zodResolver(inviteSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(createInvite, resolver, {
    formProps: {
      defaultValues: {
        organizationId: "",
        type: "ORGANIZATION" as const,
        maxUses: null,
        expiresAt: null,
        meta: null,
        compTier: "NONE" as const,
        compTermDays: null,
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        toast.success("Invite created — copy the link to share it")
        router.push(`/admin/invites/${data?.id}`)
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })
  const compTier = form.watch("compTier")

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          <Button variant="primary" isPending={action.isPending} onClick={handleSubmitWithAction}>
            Create invite
          </Button>
        </Stack>
      </Stack>

      <form
        onSubmit={handleSubmitWithAction}
        className={cx("grid gap-4 @lg:grid-cols-2", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <FormControl>
                <ComboboxSelector
                  options={organizations}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select organization"
                  searchPlaceholder="Search organizations..."
                  emptyMessage="No organizations found."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invite Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ORGANIZATION">Organization</SelectItem>
                  <SelectItem value="PROGRAM">Program</SelectItem>
                  <SelectItem value="TOURNAMENT">Tournament</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Uses (optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={field.value != null ? String(field.value) : ""}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
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
                  type="datetime-local"
                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ""}
                  onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compTier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comp Tier</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? "NONE"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="No comp" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value={LINEAGE_PREMIUM_ENTITLEMENT_KEY}>Lineage Premium</SelectItem>
                  <SelectItem value={LINEAGE_ELITE_ENTITLEMENT_KEY}>Lineage Elite</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="compTermDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comp Term Days (optional)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Lifetime"
                  disabled={!compTier || compTier === "NONE"}
                  value={field.value != null ? String(field.value) : ""}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
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
