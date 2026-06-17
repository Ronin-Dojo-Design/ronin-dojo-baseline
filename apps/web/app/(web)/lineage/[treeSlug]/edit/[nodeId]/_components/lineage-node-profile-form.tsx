"use client"

import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { AvatarField, DateField, TextAreaField, TextField } from "~/components/common/fields"
import { Form } from "~/components/common/form"
import { Note } from "~/components/common/note"
import { Stack } from "~/components/common/stack"
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

/** Initial form values — promotion date only when the member has a selected rank award. */
function nodeFormDefaults(
  profile: EditableLineageNodeProfile,
  canEditPromotionDate: boolean,
): FormValues {
  return {
    treeId: profile.tree.id,
    nodeId: profile.node.id,
    displayName: str(profile.node.passport.displayName),
    bio: str(profile.node.bio),
    avatarUrl: str(profile.node.passport.avatarUrl),
    promotionDate: canEditPromotionDate
      ? toDate(profile.member.selectedRankAward?.awardedAt ?? null)
      : null,
  }
}

/** Submit payload — promotion date is only carried when the member has a selected rank award. */
function buildPayload(
  values: FormValues,
  canEditPromotionDate: boolean,
): UpdateLineageNodeProfileInput {
  return {
    treeId: values.treeId,
    nodeId: values.nodeId,
    displayName: values.displayName,
    bio: values.bio,
    avatarUrl: values.avatarUrl,
    ...(canEditPromotionDate ? { promotionDate: values.promotionDate ?? null } : {}),
  }
}

type Props = {
  profile: EditableLineageNodeProfile
}

export function LineageNodeProfileForm({ profile }: Props) {
  const router = useRouter()
  const canEditPromotionDate = Boolean(profile.member.selectedRankAward)

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
    defaultValues: nodeFormDefaults(profile, canEditPromotionDate),
  })

  function onSubmit(values: FormValues) {
    execute(buildPayload(values, canEditPromotionDate))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <input type="hidden" {...form.register("treeId")} />
        <input type="hidden" {...form.register("nodeId")} />

        <TextField
          control={form.control}
          name="displayName"
          label="Display name"
          placeholder="How this person appears on the tree"
        />

        {canEditPromotionDate ? (
          <DateField control={form.control} name="promotionDate" label="Promotion date" />
        ) : (
          <Note className="self-end">
            Promotion date is unavailable because this tree member has no selected rank award.
          </Note>
        )}

        <AvatarField
          form={form}
          control={form.control}
          name="avatarUrl"
          path={`lineage/${profile.tree.id}/${profile.node.id}/avatar`}
          className="sm:col-span-2"
          previewAlt="Lineage avatar preview"
        />

        <TextAreaField
          control={form.control}
          name="bio"
          label="Bio"
          rows={5}
          placeholder="Short lineage-specific bio"
          className="sm:col-span-2"
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
