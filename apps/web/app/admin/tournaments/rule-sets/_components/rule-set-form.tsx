"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { ScoringMethod } from "~/.generated/prisma/browser"
import { RuleSetActions } from "~/app/admin/tournaments/rule-sets/_components/rule-set-actions"
import { Button } from "~/components/common/button"
import { ComboboxSelector } from "~/components/common/combobox-selector"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { cx } from "~/lib/utils"
import { upsertRuleSet } from "~/server/admin/tournaments/actions"
import type { findRuleSetById } from "~/server/admin/tournaments/queries"
import { ruleSetSchema } from "~/server/admin/tournaments/schema"

type RuleSetFormProps = ComponentProps<"form"> & {
  ruleSet?: Awaited<ReturnType<typeof findRuleSetById>>
  disciplines: { id: string; name: string }[]
}

export function RuleSetForm({
  children,
  className,
  title,
  ruleSet,
  disciplines,
  ...props
}: RuleSetFormProps) {
  const router = useRouter()
  const resolver = zodResolver(ruleSetSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(upsertRuleSet, resolver, {
    formProps: {
      defaultValues: {
        id: ruleSet?.id ?? "",
        name: ruleSet?.name ?? "",
        description: ruleSet?.description ?? "",
        matchDurationSec: ruleSet?.matchDurationSec ?? null,
        overtimeSec: ruleSet?.overtimeSec ?? null,
        scoringMethod: ruleSet?.scoringMethod ?? "POINTS",
        disciplineId: ruleSet?.disciplineId ?? "",
        isSystem: ruleSet?.isSystem ?? false,
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        toast.success(`Rule set successfully ${ruleSet ? "updated" : "created"}`)
        router.push(`/app/tournaments/rule-sets/${data?.id}`)
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
          {ruleSet && <RuleSetActions ruleSet={ruleSet} size="md" />}
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
          name="scoringMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Scoring Method</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                items={Object.fromEntries(
                  Object.values(ScoringMethod).map(method => [method, method.replace(/_/g, " ")]),
                )}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scoring method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ScoringMethod).map(method => (
                    <SelectItem key={method} value={method}>
                      {method.replace(/_/g, " ")}
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
          name="matchDurationSec"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Match Duration (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={(field.value as number | null) ?? ""}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="overtimeSec"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overtime (seconds)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={(field.value as number | null) ?? ""}
                  onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disciplineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discipline (optional)</FormLabel>
              <FormControl>
                <ComboboxSelector
                  options={disciplines}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="All disciplines"
                  searchPlaceholder="Search disciplines..."
                  emptyMessage="No disciplines found."
                  clearable
                />
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
                    disabled={ruleSet?.isSystem}
                  />
                </FormControl>
                <FormLabel>System rule set</FormLabel>
              </Stack>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4 col-span-full">
          <Button size="md" variant="secondary" render={<Link href="/app/tournaments/rule-sets" />}>
            Cancel
          </Button>

          <Button size="md" isPending={action.isPending}>
            {ruleSet ? "Update rule set" : "Create rule set"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
