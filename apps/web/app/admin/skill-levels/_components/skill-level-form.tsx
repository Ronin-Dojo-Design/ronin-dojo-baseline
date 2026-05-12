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
import { upsertSkillLevel } from "~/server/admin/skill-levels/actions"
import type { findSkillLevelById } from "~/server/admin/skill-levels/queries"
import { skillLevelSchema } from "~/server/admin/skill-levels/schema"

type SkillLevelFormProps = ComponentProps<"form"> & {
  skillLevel?: Awaited<ReturnType<typeof findSkillLevelById>>
  title?: string
}

export function SkillLevelForm({
  children,
  className,
  title,
  skillLevel,
  ...props
}: SkillLevelFormProps) {
  const router = useRouter()
  const resolver = zodResolver(skillLevelSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    upsertSkillLevel,
    resolver,
    {
      formProps: {
        defaultValues: {
          id: skillLevel?.id ?? "",
          name: skillLevel?.name ?? "",
          code: skillLevel?.code ?? "",
          description: skillLevel?.description ?? "",
          sortOrder: skillLevel?.sortOrder ?? 0,
        },
      },

      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(`Skill level successfully ${skillLevel ? "updated" : "created"}`)
          router.push(`/admin/skill-levels/${data?.id}`)
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
                <Input placeholder="e.g. Beginner" {...field} />
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
                <Input placeholder="e.g. BEGINNER" {...field} />
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
                <TextArea
                  placeholder="e.g. Wolchek: White–Gold–Orange belts; BJJ: Rookies, White 1–2 stripe"
                  {...field}
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
            {skillLevel ? "Update" : "Create"} Skill Level
          </Button>
        </div>
      </form>
    </Form>
  )
}
