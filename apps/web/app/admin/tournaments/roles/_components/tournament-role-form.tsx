"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { TournamentRoleActions } from "~/app/admin/tournaments/roles/_components/tournament-role-actions"
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
import { Link } from "~/components/common/link"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { useComputedField } from "~/hooks/use-computed-field"
import { cx } from "~/lib/utils"
import { upsertTournamentRole } from "~/server/admin/tournaments/actions"
import type { findTournamentRoleById } from "~/server/admin/tournaments/queries"
import { tournamentRoleSchema } from "~/server/admin/tournaments/schema"

type TournamentRoleFormProps = Omit<ComponentProps<"form">, "role"> & {
  role?: Awaited<ReturnType<typeof findTournamentRoleById>>
}

export function TournamentRoleForm({
  children,
  className,
  title,
  role,
  ...props
}: TournamentRoleFormProps) {
  const router = useRouter()
  const resolver = zodResolver(tournamentRoleSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    upsertTournamentRole,
    resolver,
    {
      formProps: {
        defaultValues: {
          id: role?.id ?? "",
          code: role?.code ?? "",
          name: role?.name ?? "",
          description: role?.description ?? "",
          isSystem: role?.isSystem ?? false,
        },
      },

      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(`Tournament role successfully ${role ? "updated" : "created"}`)
          router.push(`/admin/tournaments/roles/${data?.id}`)
        },

        onError: ({ error }) => {
          toast.error(error.serverError)
        },
      },
    },
  )

  // Auto-compute code from name (uppercase, underscored)
  useComputedField({
    form,
    sourceField: "name",
    computedField: "code",
    callback: (name: string) =>
      name
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "_")
        .replace(/^_|_$/g, ""),
    enabled: !role,
  })

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          {role && <TournamentRoleActions role={role} size="md" />}
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
              <FormLabel isRequired>Name</FormLabel>
              <FormControl>
                <Input data-1p-ignore {...field} />
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
              <FormLabel isRequired>Code</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <TextArea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isSystem"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <Stack size="sm">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={role?.isSystem}
                  />
                </FormControl>
                <FormLabel>System role</FormLabel>
              </Stack>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4 col-span-full">
          <Button size="md" variant="secondary" asChild>
            <Link href="/admin/tournaments/roles">Cancel</Link>
          </Button>

          <Button size="md" isPending={action.isPending}>
            {role ? "Update role" : "Create role"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
