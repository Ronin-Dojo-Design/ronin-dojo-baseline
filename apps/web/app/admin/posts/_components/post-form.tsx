"use client"

import { slugify } from "@dirstack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { EyeIcon, PencilIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ComponentProps, use, useState } from "react"
import { toast } from "sonner"
import { PostStatus } from "~/.generated/prisma/browser"
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
import { Input, inputVariants } from "~/components/common/input"
import { Link } from "~/components/common/link"
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
import { useComputedField } from "~/hooks/use-computed-field"
import { cx } from "~/lib/utils"
import { upsertPost } from "~/server/admin/posts/actions"
import type { findPostById } from "~/server/admin/posts/queries"
import { postSchema } from "~/server/admin/posts/schema"
import type { findToolList } from "~/server/admin/tools/queries"

type PostFormProps = ComponentProps<"form"> & {
  post?: NonNullable<Awaited<ReturnType<typeof findPostById>>>
  toolsPromise: ReturnType<typeof findToolList>
}

export function PostForm({
  children,
  className,
  title,
  post,
  toolsPromise,
  ...props
}: PostFormProps) {
  const router = useRouter()
  const tools = use(toolsPromise)
  const resolver = zodResolver(postSchema)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const { form, action } = useHookFormAction(upsertPost, resolver, {
    formProps: {
      defaultValues: {
        id: post?.id ?? "",
        title: post?.title ?? "",
        slug: post?.slug ?? "",
        description: post?.description ?? "",
        content: post?.content ?? "",
        imageUrl: post?.imageUrl ?? "",
        status: post?.status ?? PostStatus.Draft,
        publishedAt: post?.publishedAt ?? undefined,
        tools: post?.tools.map(t => t.id) ?? [],
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        if (!data) return
        toast.success(`Post successfully ${post ? "updated" : "created"}`)
        router.push("/admin/posts")
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  // Set the slug based on the title
  useComputedField({
    form,
    sourceField: "title",
    computedField: "slug",
    callback: slugify,
    enabled: !post,
  })

  const handleSubmit = form.handleSubmit(data => {
    action.execute(data)
  })

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>
      </Stack>

      <form
        onSubmit={handleSubmit}
        className={cx("grid gap-4 @lg:grid-cols-2", className)}
        noValidate
        {...props}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Title</FormLabel>
              <FormControl>
                <Input data-1p-ignore {...field} />
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
              <FormLabel isRequired>Slug</FormLabel>
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
          name="content"
          render={({ field }) => (
            <FormItem className="col-span-full items-stretch">
              <Stack className="justify-between">
                <FormLabel isRequired>Content</FormLabel>

                {field.value && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsPreviewing(prev => !prev)}
                    prefix={isPreviewing ? <PencilIcon /> : <EyeIcon />}
                    className="-my-1"
                  >
                    {isPreviewing ? "Edit" : "Preview"}
                  </Button>
                )}
              </Stack>

              <FormControl>
                {field.value && isPreviewing ? (
                  <Markdown
                    code={field.value}
                    className={cx(
                      inputVariants(),
                      "max-w-none min-h-18 bg-card border leading-normal",
                    )}
                  />
                ) : (
                  <TextArea className="min-h-48" {...field} />
                )}
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input type="url" {...field} />
              </FormControl>
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
                  <SelectItem value={PostStatus.Draft}>Draft</SelectItem>
                  <SelectItem value={PostStatus.Scheduled}>Scheduled</SelectItem>
                  <SelectItem value={PostStatus.Published}>Published</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tools"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Tools</FormLabel>
              <RelationSelector
                relations={tools}
                selectedIds={field.value ?? []}
                setSelectedIds={field.onChange}
              />
            </FormItem>
          )}
        />

        <div className="flex justify-between gap-4 col-span-full">
          <Button size="md" variant="secondary" render={<Link href="/admin/posts" />}>
            Cancel
          </Button>

          <Button size="md" variant="primary" type="submit" isPending={action.isPending}>
            {post ? "Update post" : "Create post"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
