"use client"

import { slugify } from "@dirstack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import type { FieldValues } from "react-hook-form"
import { toast } from "sonner"
import { Brand, CertificationType } from "~/.generated/prisma/browser"
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
import { useComputedField } from "~/hooks/use-computed-field"
import { upsertCourse } from "~/server/admin/courses/actions"
import type { findCourseById } from "~/server/admin/courses/queries"
import { courseSchema } from "~/server/admin/courses/schema"

type CourseFormProps = ComponentProps<"form"> & {
  course?: NonNullable<Awaited<ReturnType<typeof findCourseById>>>
  title?: string
}

export function CourseForm({ children, className, title, course, ...props }: CourseFormProps) {
  const router = useRouter()
  const resolver = zodResolver(courseSchema)

  const { form, action } = useHookFormAction(upsertCourse, resolver, {
    formProps: {
      defaultValues: {
        id: course?.id ?? "",
        brand: course?.brand ?? Brand.BASELINE_MARTIAL_ARTS,
        title: course?.title ?? "",
        slug: course?.slug ?? "",
        description: course?.description ?? "",
        certificationType: course?.certificationType ?? CertificationType.BELT_RANK,
        isPublished: course?.isPublished ?? false,
        publishedAt: course?.publishedAt ?? null,
        organizationId: course?.organizationId ?? "",
        disciplineId: course?.disciplineId ?? "",
        rankId: course?.rankId ?? "",
      },
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (data) {
          toast.success(course ? "Course updated" : "Course created")
          router.push(`/admin/courses/${data.id}`)
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Something went wrong")
      },
    },
  })

  // Auto-generate slug from title
  useComputedField({
    form: form as unknown as import("react-hook-form").UseFormReturn<FieldValues>,
    sourceField: "title",
    computedField: "slug",
    callback: slugify,
    enabled: !course,
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(action.execute)} className="space-y-6" {...props}>
        <Stack direction="column" size="md">
          {title && <H3>{title}</H3>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. White Belt Curriculum" {...field} />
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
                    <Input placeholder="white-belt-curriculum" {...field} />
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
                  <TextArea placeholder="Course description..." rows={3} {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
              name="certificationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certification Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CertificationType).map(ct => (
                        <SelectItem key={ct} value={ct}>
                          {ct.replace(/_/g, " ")}
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
              name="rankId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Rank (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Rank ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel>Published</FormLabel>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="primary"
            className="self-start"
            isPending={action.isPending}
          >
            {course ? "Update course" : "Create course"}
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
