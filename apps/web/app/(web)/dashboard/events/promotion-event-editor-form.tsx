"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "~/components/common/button"
import { Card, CardDescription, CardHeader } from "~/components/common/card"
import { Checkbox } from "~/components/common/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H4, H6 } from "~/components/common/heading"
import { Hint } from "~/components/common/hint"
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
import { upsertPromotionEvent } from "~/server/web/promotion-events/editor-actions"
import type {
  PromotionEventEditorData,
  PromotionEventEditorEvent,
} from "~/server/web/promotion-events/editor-queries"

const noHostValue = "__none__"

const formSchema = z.object({
  title: z.string().trim().min(3).max(200),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  location: z.string().max(240).optional(),
  description: z.string().max(5000).optional(),
  hostOrganizationId: z.string().optional(),
  rankAwardIds: z.array(z.string()),
  auditNote: z.string().trim().min(10).max(1000),
})

type FormValues = z.infer<typeof formSchema>

type PromotionEventEditorFormProps = {
  event: PromotionEventEditorEvent | null
  hostOrganizations: PromotionEventEditorData["hostOrganizations"]
  rankAwards: PromotionEventEditorData["rankAwards"]
}

export function PromotionEventEditorForm({
  event,
  hostOrganizations,
  rankAwards,
}: PromotionEventEditorFormProps) {
  const router = useRouter()
  const isEdit = Boolean(event)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title ?? "",
      eventDate: event?.eventDate ?? "",
      location: event?.location ?? "",
      description: event?.description ?? "",
      hostOrganizationId: event?.hostOrganizationId || noHostValue,
      rankAwardIds: event?.rankAwardIds ?? [],
      auditNote: "",
    },
  })

  const { execute, isPending } = useAction(upsertPromotionEvent, {
    onSuccess: ({ data }) => {
      if (data?.id) {
        router.push(`/dashboard/events/${data.id}`)
        router.refresh()
      }
    },
  })

  const selectedAwardIds = form.watch("rankAwardIds")

  const onSubmit = (values: FormValues) => {
    execute({
      id: event?.id ?? null,
      title: values.title,
      eventDate: values.eventDate,
      location: values.location ?? "",
      description: values.description ?? "",
      hostOrganizationId:
        values.hostOrganizationId && values.hostOrganizationId !== noHostValue
          ? values.hostOrganizationId
          : null,
      rankAwardIds: values.rankAwardIds,
      auditNote: values.auditNote,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <Stack direction="column" size="lg" className="w-full">
          <Card hover={false}>
            <CardHeader direction="column" size="xs">
              <H4 render={props => <h2 {...props}>{props.children}</h2>}>
                {isEdit ? "Edit ceremony" : "New ceremony"}
              </H4>
              <CardDescription>Promotion event details and linked rank awards.</CardDescription>
            </CardHeader>

            <Stack direction="column" size="md" className="w-full">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Coral Belt Ceremony" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hostOrganizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host organization</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      items={{
                        [noHostValue]: "No host organization",
                        ...Object.fromEntries(
                          hostOrganizations.map(organization => [
                            organization.id,
                            organization.name,
                          ]),
                        ),
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No host organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={noHostValue}>No host organization</SelectItem>
                        {hostOrganizations.map(organization => (
                          <SelectItem key={organization.id} value={organization.id}>
                            {organization.name}
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Oklahoma City, OK" {...field} />
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
                      <TextArea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Stack>
          </Card>

          <Card hover={false}>
            <CardHeader direction="column" size="xs">
              <H6 render={props => <h2 {...props}>{props.children}</h2>}>Rank awards</H6>
              <CardDescription>Selected awards appear together on the event page.</CardDescription>
            </CardHeader>

            {rankAwards.length > 0 ? (
              <FormField
                control={form.control}
                name="rankAwardIds"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="grid w-full gap-2">
                      {rankAwards.map(award => {
                        const checked = selectedAwardIds.includes(award.id)

                        return (
                          <label
                            key={award.id}
                            className="flex items-start gap-3 rounded-md border bg-background p-3 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={nextChecked => {
                                const nextValue = nextChecked
                                  ? Array.from(new Set([...field.value, award.id]))
                                  : field.value.filter(id => id !== award.id)
                                field.onChange(nextValue)
                              }}
                            />
                            <span className="grid gap-1">
                              <span className="font-medium">{award.label}</span>
                              <span className="text-xs text-secondary-foreground">
                                {award.detail}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <Hint>No rank awards are available for your current editor scope.</Hint>
            )}
          </Card>

          <Card hover={false}>
            <CardHeader direction="column" size="xs">
              <H6 render={props => <h2 {...props}>{props.children}</h2>}>Audit</H6>
              <CardDescription>Saved changes write a promotion-event audit entry.</CardDescription>
            </CardHeader>

            <FormField
              control={form.control}
              name="auditNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audit note</FormLabel>
                  <FormControl>
                    <TextArea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>

          <Stack size="sm" wrap>
            <Button type="submit" isPending={isPending}>
              {isEdit ? "Save changes" : "Create event"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </form>
    </Form>
  )
}
