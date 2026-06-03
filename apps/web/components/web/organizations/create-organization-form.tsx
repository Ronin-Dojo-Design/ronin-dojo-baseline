"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import type { Brand } from "~/.generated/prisma/client"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { createOrganization } from "~/server/web/organization/actions"
import { createOrganizationSchema } from "~/server/web/organization/schemas"

type Discipline = { id: string; name: string }

interface CreateOrganizationFormProps extends ComponentProps<"form"> {
  brand: Brand
  disciplines: Discipline[]
}

export const CreateOrganizationForm = ({
  brand,
  disciplines,
  className,
  ...props
}: CreateOrganizationFormProps) => {
  const router = useRouter()
  const resolver = zodResolver(createOrganizationSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(createOrganization, resolver, {
    formProps: {
      defaultValues: {
        brand,
        name: "",
        slug: "",
        type: "DOJO" as const,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        websiteUrl: "",
        email: "",
        phoneE164: "",
        disciplineIds: [],
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        if (!data) return
        toast.success(`"${data.name}" created!`)
        router.push(`/organizations/${data.slug}`)
      },

      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  // Auto-generate slug from name
  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldOnChange: (...args: unknown[]) => void,
  ) => {
    fieldOnChange(e)
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    form.setValue("slug", slug, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className={className} noValidate {...props}>
        <Stack direction="column" className="gap-5">
          {/* Hidden brand field */}
          <input type="hidden" {...form.register("brand")} />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input
                    size="lg"
                    placeholder="e.g. Baseline Martial Arts Academy"
                    {...field}
                    onChange={e => handleNameChange(e, field.onChange)}
                  />
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
                <FormLabel>URL Slug *</FormLabel>
                <FormControl>
                  <Input size="lg" placeholder="baseline-martial-arts-academy" {...field} />
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
                <FormLabel>Organization Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger size="lg">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DOJO">Dojo</SelectItem>
                    <SelectItem value="SCHOOL">School</SelectItem>
                    <SelectItem value="CLUB">Club</SelectItem>
                    <SelectItem value="LEAGUE">League</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input size="lg" placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input size="lg" placeholder="Suite 100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 @sm:grid-cols-3">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State *</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl>
                    <Input size="lg" placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input size="lg" placeholder="US" {...field} />
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
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input type="url" size="lg" placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 @sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input type="email" size="lg" placeholder="contact@school.com" {...field} />
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
                    <Input type="tel" size="lg" placeholder="+1 555 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Discipline multi-select via checkboxes */}
          {disciplines.length > 0 && (
            <FormField
              control={form.control}
              name="disciplineIds"
              render={() => (
                <FormItem>
                  <FormLabel>Disciplines</FormLabel>
                  <div className="grid gap-2 @sm:grid-cols-2">
                    {disciplines.map(discipline => (
                      <FormField
                        key={discipline.id}
                        control={form.control}
                        name="disciplineIds"
                        render={({ field }) => (
                          <FormItem>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(discipline.id)}
                                  onCheckedChange={checked => {
                                    const current = field.value ?? []
                                    field.onChange(
                                      checked
                                        ? [...current, discipline.id]
                                        : current.filter((id: string) => id !== discipline.id),
                                    )
                                  }}
                                />
                              </FormControl>
                              {discipline.name}
                            </label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit" isPending={action.isPending} className="self-start">
            Create Organization
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
