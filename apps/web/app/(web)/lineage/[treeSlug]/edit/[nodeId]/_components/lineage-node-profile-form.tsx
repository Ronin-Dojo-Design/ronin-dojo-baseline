"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { FormMedia } from "~/components/common/form-media"
import { Input } from "~/components/common/input"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { updateLineageNodeProfile } from "~/server/web/lineage/node-profile-actions"
import type { EditableLineageNodeProfile } from "~/server/web/lineage/node-profile-queries"
import type { UpdateLineageNodeProfileInput } from "~/server/web/lineage/node-profile-schemas"

type FormValues = {
  treeId: string
  nodeId: string
  displayName: string
  bio: string
  avatarUrl: string
  promotionDate?: Date | null
}

const str = (value: string | null | undefined) => value ?? ""

const toDate = (value: Date | string | null | undefined) => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDateInputValue = (value: Date | string | null | undefined) => {
  const date = toDate(value)
  return date ? date.toISOString().split("T")[0] : ""
}

type Props = {
  profile: EditableLineageNodeProfile
}

export function LineageNodeProfileForm({ profile }: Props) {
  const router = useRouter()
  const selectedRankAward = profile.member.selectedRankAward
  const canEditPromotionDate = Boolean(selectedRankAward)
  const initialPromotionDate = selectedRankAward?.awardedAt ?? null

  const { execute, isExecuting } = useAction(updateLineageNodeProfile, {
    onSuccess: () => {
      toast.success("Lineage profile updated.")
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Failed to update lineage profile.")
    },
  })

  const form = useForm<FormValues>({
    defaultValues: {
      treeId: profile.tree.id,
      nodeId: profile.node.id,
      displayName: str(profile.node.user.passport?.displayName),
      bio: str(profile.node.bio),
      avatarUrl: str(profile.node.user.passport?.avatarUrl),
      promotionDate: canEditPromotionDate ? toDate(initialPromotionDate) : null,
    },
  })

  function onSubmit(values: FormValues) {
    const payload = {
      treeId: values.treeId,
      nodeId: values.nodeId,
      displayName: values.displayName,
      bio: values.bio,
      avatarUrl: values.avatarUrl,
      ...(canEditPromotionDate ? { promotionDate: values.promotionDate ?? null } : {}),
    } satisfies UpdateLineageNodeProfileInput

    execute(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <input type="hidden" {...form.register("treeId")} />
        <input type="hidden" {...form.register("nodeId")} />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input
                  placeholder="How this person appears on the tree"
                  {...field}
                  value={str(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {canEditPromotionDate ? (
          <FormField
            control={form.control}
            name="promotionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Promotion date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={toDateInputValue(field.value)}
                    onChange={event =>
                      field.onChange(event.target.value ? new Date(event.target.value) : null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <Note className="self-end">
            Promotion date is unavailable because this tree member has no selected rank award.
          </Note>
        )}

        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormMedia
              form={form}
              field={field}
              path={`lineage/${profile.tree.id}/${profile.node.id}/avatar`}
              className="sm:col-span-2"
            >
              {field.value && (
                <img
                  src={field.value}
                  alt="Lineage avatar preview"
                  className="size-20 rounded-full object-cover"
                />
              )}
            </FormMedia>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <TextArea
                  rows={5}
                  placeholder="Short lineage-specific bio"
                  {...field}
                  value={str(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {canEditPromotionDate && (
          <Note className="sm:col-span-2">
            Promotion date updates the selected rank award for this tree member.
          </Note>
        )}

        <Stack className="sm:col-span-2">
          <Button type="submit" isPending={isExecuting}>
            Save Lineage Profile
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
