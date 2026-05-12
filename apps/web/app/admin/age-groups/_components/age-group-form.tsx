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
import { cx } from "~/lib/utils"
import { upsertAgeGroup } from "~/server/admin/age-groups/actions"
import type { findAgeGroupById } from "~/server/admin/age-groups/queries"
import { ageGroupSchema } from "~/server/admin/age-groups/schema"

type AgeGroupFormProps = ComponentProps<"form"> & {
  ageGroup?: Awaited<ReturnType<typeof findAgeGroupById>>
  title?: string
}

export function AgeGroupForm({ children, className, title, ageGroup, ...props }: AgeGroupFormProps) {
  const router = useRouter()
  const resolver = zodResolver(ageGroupSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(upsertAgeGroup, resolver, {
    formProps: {
      defaultValues: {
        id: ageGroup?.id ?? "",
        name: ageGroup?.name ?? "",
        code: ageGroup?.code ?? "",
        ageMin: ageGroup?.ageMin ?? 0,
        ageMax: ageGroup?.ageMax ?? null,
        sortOrder: ageGroup?.sortOrder ?? 0,
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        toast.success(`Age group successfully ${ageGroup ? "updated" : "created"}`)
        router.push(`/admin/age-groups/${data?.id}`)
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
                <Input placeholder="e.g. Lil' Dragons" {...field} />
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
                <Input placeholder="e.g. LIL_DRAGONS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ageMin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Age</FormLabel>
              <FormControl>
                <Input type="number" min={0} value={String(field.value ?? "")} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ageMax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Age (leave empty for no cap)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="No cap"
                  value={String(field.value ?? "")}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input type="number" value={String(field.value ?? "")} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-full flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isPending={action.isPending}>
            {ageGroup ? "Update" : "Create"} Age Group
          </Button>
        </div>
      </form>
    </Form>
  )
}
