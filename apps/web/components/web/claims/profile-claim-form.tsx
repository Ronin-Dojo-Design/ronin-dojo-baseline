"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/common/button"
import { DataSelect } from "~/components/common/data-select"
import { TextAreaField } from "~/components/common/fields"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Note } from "~/components/common/note"
import { submitProfileClaimRequest } from "~/server/web/claims/claim-actions"

/**
 * Client-island claim form for the generic member/org profile claim
 * (SESSION_0354). Dogfoods `DataSelect` (WL-P1-7) for the relationship picker.
 */

const RELATIONSHIP_OPTIONS = [
  { value: "SELF", label: "This is me" },
  { value: "STAFF", label: "I'm staff / an instructor here" },
  { value: "OWNER", label: "I own / run this" },
  { value: "REPRESENTATIVE", label: "I'm an authorized representative" },
  { value: "FAMILY", label: "I'm a family member" },
  { value: "OTHER", label: "Other" },
]

const formSchema = z.object({
  relationship: z.enum(["SELF", "STAFF", "OWNER", "REPRESENTATIVE", "FAMILY", "OTHER"]),
  claimantNote: z.string().max(2000).optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ProfileClaimForm({
  subjectType,
  subjectId,
  subjectLabel,
}: {
  subjectType: "PERSON" | "ORGANIZATION"
  subjectId: string
  subjectLabel: string
}) {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { relationship: undefined, claimantNote: "" },
  })

  const { execute, isExecuting } = useAction(submitProfileClaimRequest, {
    onSuccess: () => {
      toast.success("Claim submitted — an admin will review it shortly.")
      router.refresh()
    },
    onError: ({ error }) => toast.error(error.serverError ?? "Could not submit your claim."),
  })

  function onSubmit(values: FormValues) {
    execute({ subjectType, subjectId, ...values })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full min-w-0">
        <div className="flex min-w-0 flex-col gap-4">
          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your relationship to {subjectLabel}</FormLabel>
                <FormControl>
                  <DataSelect
                    value={field.value}
                    onValueChange={value => field.onChange(value)}
                    options={RELATIONSHIP_OPTIONS}
                    placeholder="Select your relationship"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <TextAreaField
            control={form.control}
            name="claimantNote"
            label="Anything that helps us verify your claim (optional)"
            rows={3}
            placeholder="e.g. a link to your school site, your role, or how you're connected."
          />

          <Button type="submit" disabled={isExecuting} className="self-start">
            {isExecuting ? "Submitting…" : "Submit claim"}
          </Button>

          <Note className="text-xs">
            An admin reviews every claim before any profile is handed over.
          </Note>
        </div>
      </form>
    </Form>
  )
}
