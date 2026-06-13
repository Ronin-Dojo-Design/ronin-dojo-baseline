"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
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
import { cx } from "~/lib/utils"
import { upsertRole } from "~/server/admin/roles/actions"
import type { findRoleById } from "~/server/admin/roles/queries"
import { roleSchema } from "~/server/admin/roles/schema"

type RoleFormProps = Omit<ComponentProps<"form">, "role"> & {
  roleData?: Awaited<ReturnType<typeof findRoleById>>
  title?: string
}

export function RoleForm({ children, className, title, roleData, ...props }: RoleFormProps) {
  const router = useRouter()
  const resolver = zodResolver(roleSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(upsertRole, resolver, {
    formProps: {
      defaultValues: {
        id: roleData?.id ?? "",
        name: roleData?.name ?? "",
        code: roleData?.code ?? "",
        description: roleData?.description ?? "",
        displayTitle: roleData?.displayTitle ?? "",
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        toast.success(`Role successfully ${roleData ? "updated" : "created"}`)
        router.push(`/app/roles/${data?.id}`)
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          <Button variant="primary" isPending={action.isPending} onClick={handleSubmitWithAction}>
            {roleData ? "Update role" : "Create role"}
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Instructor" {...field} />
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
                <Input placeholder="e.g. INSTRUCTOR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Title (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Head Coach" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="@lg:col-span-2">
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Describe this role's responsibilities..."
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
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
