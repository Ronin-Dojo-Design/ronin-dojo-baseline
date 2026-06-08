"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import { type ComponentProps, use } from "react"
import { toast } from "sonner"
import { LeadSource } from "~/.generated/prisma/browser"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { upsertLead } from "~/server/admin/leads/actions"
import type { findLeadById, findOrganizationList } from "~/server/admin/leads/queries"
import { leadFormSchema } from "~/server/admin/leads/schema"

type LeadFormProps = ComponentProps<"form"> & {
  title: string
  lead?: NonNullable<Awaited<ReturnType<typeof findLeadById>>>
  organizationsPromise: ReturnType<typeof findOrganizationList>
}

export function LeadForm({ title, lead, organizationsPromise, ...props }: LeadFormProps) {
  const router = useRouter()
  const organizations = use(organizationsPromise)
  const resolver = zodResolver(leadFormSchema)

  const { form, action } = useHookFormAction(upsertLead, resolver, {
    formProps: {
      defaultValues: {
        id: lead?.id ?? "",
        organizationId: lead?.organizationId ?? "",
        programId: lead?.programId ?? "",
        source: lead?.source ?? LeadSource.WALK_IN,
        firstName: lead?.firstName ?? "",
        lastName: lead?.lastName ?? "",
        email: lead?.email ?? "",
        phoneE164: lead?.phoneE164 ?? "",
        notes: lead?.notes ?? "",
        referredBy: lead?.referredBy ?? "",
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        if (!data) return
        toast.success(`Lead successfully ${lead ? "updated" : "created"}`)
        router.push(`/admin/leads/${data.id}`)
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
        onSubmit={form.handleSubmit(data => action.execute(data))}
        className="grid gap-6 mt-6"
        {...props}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name *</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneE164"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 555 123 4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization *</FormLabel>
                <FormControl>
                  <ComboboxSelector
                    options={organizations.map(org => ({ id: org.id, name: org.name }))}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select organization..."
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
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  items={Object.fromEntries(
                    Object.values(LeadSource).map(s => [s, s.replace(/_/g, " ")]),
                  )}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(LeadSource).map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="referredBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referred by</FormLabel>
              <FormControl>
                <Input placeholder="Referral source" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <TextArea placeholder="Additional notes..." rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={action.isPending}>
            {lead ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
