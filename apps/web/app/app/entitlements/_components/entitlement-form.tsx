"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { EntitlementActions } from "~/app/app/entitlements/_components/entitlement-actions"
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
import { TextArea } from "~/components/common/textarea"
import { useComputedField } from "~/hooks/use-computed-field"
import { cx } from "~/lib/utils"
import { upsertEntitlement } from "~/server/admin/entitlements/actions"
import type { findEntitlementById } from "~/server/admin/entitlements/queries"
import { entitlementSchema } from "~/server/admin/entitlements/schema"

type EntitlementFormProps = ComponentProps<"form"> & {
  entitlement?: Awaited<ReturnType<typeof findEntitlementById>>
}

export function EntitlementForm({
  children,
  className,
  title,
  entitlement,
  ...props
}: EntitlementFormProps) {
  const router = useRouter()
  const resolver = zodResolver(entitlementSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(upsertEntitlement, resolver, {
    formProps: {
      defaultValues: {
        id: entitlement?.id ?? "",
        key: entitlement?.key ?? "",
        name: entitlement?.name ?? "",
        description: entitlement?.description ?? "",
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        toast.success(`Entitlement successfully ${entitlement ? "updated" : "created"}`)
        router.push(`/app/entitlements/${data?.id}`)
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  // Auto-generate key from name (e.g., "Program Access" → "program-access")
  useComputedField({
    form,
    sourceField: "name",
    computedField: "key",
    callback: (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    enabled: !entitlement,
  })

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          {entitlement && <EntitlementActions entitlement={entitlement} />}

          <Button variant="primary" isPending={action.isPending} onClick={handleSubmitWithAction}>
            {entitlement ? "Update entitlement" : "Create entitlement"}
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
                <Input placeholder="e.g. Program Access" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Key</FormLabel>
              <FormControl>
                <Input placeholder="e.g. program-access" className="font-mono text-sm" {...field} />
              </FormControl>
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
                <TextArea placeholder="What does this entitlement grant access to?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
