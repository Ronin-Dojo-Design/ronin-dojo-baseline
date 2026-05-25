"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { EyeIcon, PencilIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ComponentProps, useState } from "react"
import { toast } from "sonner"
import { ContentChannel, ContentVariantStatus } from "~/.generated/prisma/browser"
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
import { Input, inputVariants } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { Markdown } from "~/components/web/markdown"
import { cx } from "~/lib/utils"
import { upsertContentVariant } from "~/server/admin/content/actions"
import type { findContentAtomById } from "~/server/admin/content/queries"
import { contentVariantSchema } from "~/server/admin/content/schema"

type Variant = NonNullable<Awaited<ReturnType<typeof findContentAtomById>>>["variants"][number]

type ContentVariantFormProps = ComponentProps<"form"> & {
  atomId: string
  variant?: Variant
  onDone?: () => void
}

export function ContentVariantForm({
  className,
  atomId,
  variant,
  onDone,
  ...props
}: ContentVariantFormProps) {
  const router = useRouter()
  const resolver = zodResolver(contentVariantSchema)
  const [isRenderedCopyPreviewing, setIsRenderedCopyPreviewing] = useState(false)

  const { form, action } = useHookFormAction(upsertContentVariant, resolver, {
    formProps: {
      defaultValues: {
        id: variant?.id ?? "",
        atomId,
        channel: variant?.channel ?? "BLOG",
        status: variant?.status ?? "DRAFT",
        publicTitle: variant?.publicTitle ?? "",
        publicSlug: variant?.publicSlug ?? "",
        excerpt: variant?.excerpt ?? "",
        renderedCopy: variant?.renderedCopy ?? "",
        cta: variant?.cta ?? "",
        thumbnailUrl: variant?.thumbnailUrl ?? "",
        videoUrl: variant?.videoUrl ?? "",
        voiceNotes: variant?.voiceNotes ?? "",
        publishDate: variant?.publishDate ?? null,
      },
    },

    actionProps: {
      onSuccess: () => {
        toast.success(`Variant ${variant ? "updated" : "created"}`)
        router.refresh()
        onDone?.()
      },
      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  const handleSubmit = form.handleSubmit(data => {
    action.execute(data)
  })

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className={cx("grid gap-4 @lg:grid-cols-2 rounded-lg border bg-card p-4", className)}
        noValidate
        {...props}
      >
        <H4 className="col-span-full">
          {variant ? `Edit variant — ${variant.channel}` : "New variant"}
        </H4>

        <FormField
          control={form.control}
          name="channel"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Channel</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ContentChannel).map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(ContentVariantStatus).map(s => (
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
          name="publicTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public Title</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publicSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Public Slug</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <TextArea rows={2} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="renderedCopy"
          render={({ field }) => {
            const renderedCopy = field.value ?? ""

            return (
              <FormItem className="col-span-full items-stretch">
                <Stack className="justify-between">
                  <FormLabel>Rendered Copy</FormLabel>

                  {renderedCopy && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsRenderedCopyPreviewing(prev => !prev)}
                      prefix={isRenderedCopyPreviewing ? <PencilIcon /> : <EyeIcon />}
                      className="-my-1"
                    >
                      {isRenderedCopyPreviewing ? "Edit" : "Preview"}
                    </Button>
                  )}
                </Stack>

                <FormControl>
                  {renderedCopy && isRenderedCopyPreviewing ? (
                    <Markdown
                      code={renderedCopy}
                      className={cx(
                        inputVariants(),
                        "max-w-none min-h-18 bg-card border leading-normal",
                      )}
                    />
                  ) : (
                    <TextArea rows={4} {...field} value={renderedCopy} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="cta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTA</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="publishDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Publish Date</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().slice(0, 16)
                      : typeof field.value === "string" && field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ""
                  }
                  onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail URL</FormLabel>
              <FormControl>
                <Input type="url" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input type="url" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="voiceNotes"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Voice Notes</FormLabel>
              <FormControl>
                <TextArea rows={2} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 col-span-full">
          {onDone && (
            <Button type="button" size="sm" variant="secondary" onClick={onDone}>
              Cancel
            </Button>
          )}
          <Button size="sm" variant="primary" type="submit" isPending={action.isPending}>
            {variant ? "Update" : "Create"} variant
          </Button>
        </div>
      </form>
    </Form>
  )
}
