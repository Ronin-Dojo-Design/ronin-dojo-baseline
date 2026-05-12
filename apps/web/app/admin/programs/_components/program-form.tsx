"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { slugify } from "@primoui/utils"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { toast } from "sonner"
import { Brand, ProgramStatus } from "~/.generated/prisma/browser"
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
import { Switch } from "~/components/common/switch"
import { TextArea } from "~/components/common/textarea"
import type { FieldValues } from "react-hook-form"
import { useComputedField } from "~/hooks/use-computed-field"
import { upsertProgram } from "~/server/admin/programs/actions"
import type { findProgramById } from "~/server/admin/programs/queries"
import { programSchema } from "~/server/admin/programs/schema"

type ProgramFormProps = ComponentProps<"form"> & {
  program?: NonNullable<Awaited<ReturnType<typeof findProgramById>>>
  title?: string
}

export function ProgramForm({ children, className, title, program, ...props }: ProgramFormProps) {
  const router = useRouter()
  const resolver = zodResolver(programSchema)

  const { form, action } = useHookFormAction(upsertProgram, resolver, {
    formProps: {
      defaultValues: {
        id: program?.id ?? "",
        brand: program?.brand ?? Brand.BASELINE_MARTIAL_ARTS,
        name: program?.name ?? "",
        slug: program?.slug ?? "",
        description: program?.description ?? "",
        status: program?.status ?? ProgramStatus.DRAFT,
        ageMin: program?.ageMin ?? null,
        ageMax: program?.ageMax ?? null,
        enforceAgeCap: program?.enforceAgeCap ?? false,
        maxEnrollment: program?.maxEnrollment ?? null,
        minEnrollment: program?.minEnrollment ?? null,
        sortOrder: program?.sortOrder ?? 0,
        imageUrl: program?.imageUrl ?? "",
        organizationId: program?.organizationId ?? "",
        disciplineId: program?.disciplineId ?? "",
      },
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(program ? "Program updated" : "Program created")
          router.push(`/admin/programs/${data.id}`)
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  // Auto-generate slug from name
  useComputedField({
    form: form as unknown as import("react-hook-form").UseFormReturn<FieldValues>,
    sourceField: "name",
    computedField: "slug",
    callback: slugify,
    enabled: !program,
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
                    <Input placeholder="e.g. Kids Karate Program" {...field} />
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
                    <Input placeholder="kids-karate-program" {...field} />
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
                  <TextArea placeholder="Program description..." rows={3} {...field} />
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
                      {Object.values(ProgramStatus).map(s => (
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
              name="organizationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Organization ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="disciplineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discipline (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Discipline ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="ageMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="—"
                      {...field}
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
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
                  <FormLabel>Max Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="—"
                      {...field}
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minEnrollment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Enrollment</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="—"
                      {...field}
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxEnrollment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Enrollment</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="—"
                      {...field}
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="enforceAgeCap"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Enforce age cap</FormLabel>
              </FormItem>
            )}
          />

          <Stack direction="row" size="sm" className="pt-4">
            <Button type="submit" variant="primary" disabled={action.isPending}>
              {program ? "Update program" : "Create program"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Form>
  )
}
