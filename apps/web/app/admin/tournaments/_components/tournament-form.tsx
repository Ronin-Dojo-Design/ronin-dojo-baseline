"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { slugify } from "@primoui/utils"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { Brand, TournamentStatus } from "~/.generated/prisma/browser"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import type { FieldValues } from "react-hook-form"
import { useComputedField } from "~/hooks/use-computed-field"
import { upsertTournament } from "~/server/admin/tournaments/actions"
import type { findTournamentById } from "~/server/admin/tournaments/queries"
import { tournamentSchema } from "~/server/admin/tournaments/schema"

type TournamentFormProps = ComponentProps<"form"> & {
  tournament?: NonNullable<Awaited<ReturnType<typeof findTournamentById>>>
  title?: string
  organizations?: { id: string; name: string }[]
}

export function TournamentForm({ children, className, title, tournament, organizations, ...props }: TournamentFormProps) {
  const router = useRouter()
  const resolver = zodResolver(tournamentSchema)

  const { form, action } = useHookFormAction(upsertTournament, resolver, {
    formProps: {
      defaultValues: {
        id: tournament?.id ?? "",
        brand: tournament?.brand ?? Brand.BASELINE_MARTIAL_ARTS,
        name: tournament?.name ?? "",
        slug: tournament?.slug ?? "",
        description: tournament?.description ?? "",
        status: tournament?.status ?? TournamentStatus.DRAFT,
        startDate: tournament?.startDate ?? new Date(),
        endDate: tournament?.endDate ?? new Date(),
        timezone: tournament?.timezone ?? "",
        venueName: tournament?.venueName ?? "",
        venueCity: tournament?.venueCity ?? "",
        venueRegion: tournament?.venueRegion ?? "",
        venueCountry: tournament?.venueCountry ?? "",
        hostId: tournament?.hostId ?? "",
      },
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(tournament ? "Tournament updated" : "Tournament created")
          router.push(`/admin/tournaments/${data.id}`)
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  useComputedField({
    form: form as unknown as import("react-hook-form").UseFormReturn<FieldValues>,
    sourceField: "name",
    computedField: "slug",
    callback: slugify,
    enabled: !tournament,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(action.execute)} className="space-y-6" {...props}>
        <Stack direction="column" size="md">
          {title && <H3>{title}</H3>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Spring Arnis Championship 2026" {...field} />
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="spring-arnis-championship-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <TextArea placeholder="Tournament description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(Brand).map(b => (
                        <SelectItem key={b} value={b}>
                          {b.replace(/_/g, " ")}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TournamentStatus).map(s => (
                        <SelectItem key={s} value={s}>
                          {s}
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
              name="hostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host Organization</FormLabel>
                  {organizations && organizations.length > 0 ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select host organization" />
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
                  ) : (
                    <FormControl>
                      <Input placeholder="Organization ID" {...field} />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                      onChange={e => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Input placeholder="America/Chicago" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="venueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue name</FormLabel>
                  <FormControl>
                    <Input placeholder="Convention Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Chicago" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region / State</FormLabel>
                  <FormControl>
                    <Input placeholder="IL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venueCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country (2-letter)</FormLabel>
                  <FormControl>
                    <Input placeholder="US" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" variant="primary" disabled={action.isPending}>
            {tournament ? "Update tournament" : "Create tournament"}
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
