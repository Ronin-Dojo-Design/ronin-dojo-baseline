"use client"

import { slugify } from "@dirstack/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { EyeIcon, PencilIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { type ComponentProps, use, useState } from "react"
import { toast } from "sonner"
import { ContentAtomStatus } from "~/.generated/prisma/browser"
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
import { upsertContentAtom } from "~/server/admin/content/actions"
import type { findContentAtomById, findStyleOptions } from "~/server/admin/content/queries"
import { contentAtomSchema } from "~/server/admin/content/schema"
import type { findDisciplineOptions } from "~/server/admin/programs/queries"
import type { findTagList } from "~/server/admin/tags/queries"
import type { findToolList } from "~/server/admin/tools/queries"

type ContentAtomFormProps = ComponentProps<"form"> & {
  atom?: NonNullable<Awaited<ReturnType<typeof findContentAtomById>>>
  tagsPromise: ReturnType<typeof findTagList>
  toolsPromise: ReturnType<typeof findToolList>
  disciplinesPromise: ReturnType<typeof findDisciplineOptions>
  stylesPromise: ReturnType<typeof findStyleOptions>
}

export function ContentAtomForm({
  children,
  className,
  title,
  atom,
  tagsPromise,
  toolsPromise,
  disciplinesPromise,
  stylesPromise,
  ...props
}: ContentAtomFormProps) {
  const router = useRouter()
  const tags = use(tagsPromise)
  const tools = use(toolsPromise)
  const disciplines = use(disciplinesPromise)
  const styles = use(stylesPromise)
  const resolver = zodResolver(contentAtomSchema)
  const [isPreviewing, setIsPreviewing] = useState(false)

  const { form, action } = useHookFormAction(upsertContentAtom, resolver, {
    formProps: {
      defaultValues: {
        id: atom?.id ?? "",
        title: atom?.title ?? "",
        slug: atom?.slug ?? "",
        canonicalId: atom?.canonicalId ?? "",
        hook: atom?.hook ?? "",
        longFormCopy: atom?.longFormCopy ?? "",
        status: atom?.status ?? ContentAtomStatus.INBOX,
        disciplineId: atom?.discipline?.id ?? "",
        styleId: atom?.style?.id ?? "",
        tags: atom?.tags.map(t => t.id) ?? [],
        tools: atom?.tools.map(t => t.id) ?? [],
      },
    },

    actionProps: {
      onSuccess: ({ data }) => {
        if (!data) return
        toast.success(`Content atom successfully ${atom ? "updated" : "created"}`)
        router.push("/admin/content")
      },

      onError: ({ error }) => {
        toast.error(error.serverError)
      },
    },
  })

  useComputedField({
    form,
    sourceField: "title",
    computedField: "slug",
    callback: slugify,
    enabled: !atom,
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
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hook"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Hook</FormLabel>
              <FormControl>
                <TextArea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longFormCopy"
          render={({ field }) => (
            <FormItem className="col-span-full items-stretch">
              <Stack className="justify-between">
                <FormLabel>Long Form Copy</FormLabel>

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
                  {Object.values(ContentAtomStatus).map(s => (
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
          name="disciplineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discipline</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
                items={{ "": "None", ...Object.fromEntries(disciplines.map(d => [d.id, d.name])) }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {disciplines.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
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
          name="styleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
                items={{ "": "None", ...Object.fromEntries(styles.map(s => [s.id, s.name])) }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {styles.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
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
          name="tags"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Tags</FormLabel>
              <RelationSelector
                relations={tags}
                selectedIds={field.value ?? []}
                setSelectedIds={field.onChange}
              />
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
          <Button size="md" variant="secondary" render={<Link href="/admin/content" />}>
            Cancel
          </Button>

          <Button size="md" variant="primary" type="submit" isPending={action.isPending}>
            {atom ? "Update atom" : "Create atom"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
