"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import { type ComponentProps, use } from "react"
import { toast } from "sonner"
import { PricingPlanActions } from "~/app/admin/pricing-plans/_components/pricing-plan-actions"
import { RelationSelector } from "~/components/admin/relation-selector"
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
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import { cx } from "~/lib/utils"
import { upsertPricingPlan } from "~/server/admin/pricing-plans/actions"
import type { findPricingPlanById, findOrganizationList, findProgramList } from "~/server/admin/pricing-plans/queries"
import { pricingPlanSchema } from "~/server/admin/pricing-plans/schema"
import type { findEntitlementList } from "~/server/admin/entitlements/queries"

type PricingPlanFormProps = ComponentProps<"form"> & {
  title: string
  pricingPlan?: NonNullable<Awaited<ReturnType<typeof findPricingPlanById>>>
  organizationsPromise: ReturnType<typeof findOrganizationList>
  programsPromise: ReturnType<typeof findProgramList>
  entitlementsPromise: ReturnType<typeof findEntitlementList>
}

const pricingModelOptions = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "ANNUAL", label: "Annual" },
  { value: "DROP_IN", label: "Drop-in" },
  { value: "CLASS_PACK", label: "Class Pack" },
  { value: "PER_TEST", label: "Per Test" },
  { value: "FREE_TRIAL", label: "Free Trial" },
  { value: "INTRO_PACK", label: "Intro Pack" },
  { value: "CUSTOM", label: "Custom" },
] as const

export function PricingPlanForm({
  children,
  className,
  title,
  pricingPlan,
  organizationsPromise,
  programsPromise,
  entitlementsPromise,
  ...props
}: PricingPlanFormProps) {
  const router = useRouter()
  const organizations = use(organizationsPromise)
  const programs = use(programsPromise)
  const entitlements = use(entitlementsPromise)
  const resolver = zodResolver(pricingPlanSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    upsertPricingPlan,
    resolver,
    {
      formProps: {
        defaultValues: {
          id: pricingPlan?.id ?? "",
          name: pricingPlan?.name ?? "",
          pricingModel: pricingPlan?.pricingModel ?? "MONTHLY",
          amountCents: pricingPlan?.amountCents ?? 0,
          currency: pricingPlan?.currency ?? "USD",
          intervalMonths: pricingPlan?.intervalMonths ?? null,
          classCount: pricingPlan?.classCount ?? null,
          trialDays: pricingPlan?.trialDays ?? null,
          isActive: pricingPlan?.isActive ?? true,
          sortOrder: pricingPlan?.sortOrder ?? 0,
          stripeProductId: pricingPlan?.stripeProductId ?? "",
          stripePriceId: pricingPlan?.stripePriceId ?? "",
          organizationId: pricingPlan?.organizationId ?? "",
          programId: pricingPlan?.programId ?? "",
          entitlementIds: pricingPlan?.entitlementGrants.map(g => g.entitlementId) ?? [],
          metadata: pricingPlan?.metadata ? JSON.stringify(pricingPlan.metadata, null, 2) : "",
        },
      },

      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(`Pricing plan successfully ${pricingPlan ? "updated" : "created"}`)
          router.push(`/admin/pricing-plans/${data?.id}`)
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
          {pricingPlan && <PricingPlanActions pricingPlan={pricingPlan} />}

          <Button variant="primary" isPending={action.isPending} onClick={handleSubmitWithAction}>
            {pricingPlan ? "Update plan" : "Create plan"}
          </Button>
        </Stack>
      </Stack>

      <form
        className={cx("grid gap-4 sm:grid-cols-2", className)}
        noValidate
        onSubmit={handleSubmitWithAction}
        {...props}
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Monthly Unlimited" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pricing Model */}
        <FormField
          control={form.control}
          name="pricingModel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pricing Model</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {pricingModelOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organization */}
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Program (optional) */}
        <FormField
          control={form.control}
          name="programId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program (optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="All programs" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">All programs</SelectItem>
                  {programs.map(prog => (
                    <SelectItem key={prog.id} value={prog.id}>
                      {prog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount (in cents) */}
        <FormField
          control={form.control}
          name="amountCents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (cents)</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="e.g. 9900 = $99.00" {...field} value={field.value as number} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="USD" maxLength={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Interval Months */}
        <FormField
          control={form.control}
          name="intervalMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interval (months)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 1 for monthly"
                  {...field}
                  value={(field.value as number) ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Class Count */}
        <FormField
          control={form.control}
          name="classCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 10 for class pack"
                  {...field}
                  value={(field.value as number) ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Trial Days */}
        <FormField
          control={form.control}
          name="trialDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trial Days</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="e.g. 7"
                  {...field}
                  value={(field.value as number) ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sort Order */}
        <FormField
          control={form.control}
          name="sortOrder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="0" {...field} value={field.value as number} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stripe Product ID */}
        <FormField
          control={form.control}
          name="stripeProductId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe Product ID</FormLabel>
              <FormControl>
                <Input placeholder="prod_..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Stripe Price ID */}
        <FormField
          control={form.control}
          name="stripePriceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe Price ID</FormLabel>
              <FormControl>
                <Input placeholder="price_..." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Toggle */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 sm:col-span-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="mt-0!">Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Metadata JSON */}
        <FormField
          control={form.control}
          name="metadata"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Metadata (JSON)</FormLabel>
              <FormControl>
                <TextArea
                  placeholder='{"key": "value"}'
                  rows={6}
                  className="font-mono text-xs"
                  {...field}
                  value={(field.value as string) ?? ""}
                  onChange={e => {
                    const raw = e.target.value
                    field.onChange(raw)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Entitlements (multi-select) */}
        <FormField
          control={form.control}
          name="entitlementIds"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Entitlements Granted</FormLabel>
              <RelationSelector
                relations={entitlements.map(e => ({ id: e.id, name: `${e.name} (${e.key})` }))}
                selectedIds={field.value ?? []}
                setSelectedIds={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
