"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Badge } from "~/components/common/badge"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H4 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { ProfileHero } from "~/components/web/profile/profile-hero"
import { initialsOf } from "~/lib/directory/facet-result"
import { updateOrganization } from "~/server/web/school/actions"

const schoolFormSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Lowercase alphanumeric and dashes only"),
  description: z.string().max(2000).optional().default(""),
  websiteUrl: z.string().max(2048).optional().default(""),
  email: z.string().email().max(200).optional().or(z.literal("")),
  phoneE164: z.string().max(32).optional().default(""),
  addressLine1: z.string().max(500).optional().default(""),
  city: z.string().max(100).optional().default(""),
  state: z.string().max(100).optional().default(""),
  country: z.string().max(2).optional().default(""),
})

type Discipline = { discipline: { id: string; name: string } }

type OrganizationData = {
  id: string
  name: string
  slug: string
  description?: string | null
  websiteUrl?: string | null
  email?: string | null
  phoneE164?: string | null
  addressLine1?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  disciplines?: Discipline[]
}

type SchoolFormProps = {
  organization: OrganizationData | null
}

export function SchoolForm({ organization }: SchoolFormProps) {
  if (!organization) {
    return (
      <Note>
        You don&apos;t own any schools yet. Contact an administrator to set up your organization.
      </Note>
    )
  }

  return <SchoolFormContent organization={organization} />
}

function SchoolFormContent({ organization }: { organization: OrganizationData }) {
  const form = useForm({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: {
      name: organization.name ?? "",
      slug: organization.slug ?? "",
      description: organization.description ?? "",
      websiteUrl: organization.websiteUrl ?? "",
      email: organization.email ?? "",
      phoneE164: organization.phoneE164 ?? "",
      addressLine1: organization.addressLine1 ?? "",
      city: organization.city ?? "",
      state: organization.state ?? "",
      country: organization.country ?? "",
    },
  })

  const { execute, isPending } = useAction(updateOrganization, {
    onSuccess: () => toast.success("School updated"),
    onError: ({ error }) => toast.error(error.serverError ?? "Failed to save"),
  })

  // Live preview — same hero the public org/school page header uses.
  const previewName = useWatch({ control: form.control, name: "name" })
  const previewCity = useWatch({ control: form.control, name: "city" })
  const previewState = useWatch({ control: form.control, name: "state" })

  return (
    <Stack size="lg" direction="column">
      <ProfileHero
        name={previewName || null}
        subtitle={[previewCity, previewState].filter(Boolean).join(", ") || null}
        initials={initialsOf(previewName)}
        tags={(organization.disciplines ?? []).map(d => d.discipline.name)}
      />

      <section>
        <H4>School Details</H4>

        {organization.disciplines && organization.disciplines.length > 0 && (
          <Stack size="xs" direction="row" wrap>
            {organization.disciplines.map(d => (
              <Badge key={d.discipline.id} variant="soft">
                {d.discipline.name}
              </Badge>
            ))}
          </Stack>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(data =>
              execute({ organizationId: organization.id, ...data }),
            )}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
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
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <TextArea {...field} placeholder="About your school..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="websiteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="contact@school.com" />
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
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" placeholder="+1 555 123 4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Stack size="sm" direction="row" wrap>
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Region</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="US" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Stack>

            <Button type="submit" isPending={isPending}>
              Save School
            </Button>
          </form>
        </Form>
      </section>
    </Stack>
  )
}
