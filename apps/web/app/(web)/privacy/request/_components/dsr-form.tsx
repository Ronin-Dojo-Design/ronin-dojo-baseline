"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/common/button"
import { Checkbox } from "~/components/common/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { submitDataSubjectRequest } from "../_actions"

const DSR_TYPES = ["EXPORT", "DELETE", "RECTIFY"] as const

const dsrFormSchema = z.object({
  type: z.enum(DSR_TYPES),
  reason: z.string().trim().max(1000),
  confirm: z.boolean().refine(v => v === true, "Please confirm before submitting."),
})

type DsrFormValues = z.infer<typeof dsrFormSchema>
type DsrType = (typeof DSR_TYPES)[number]

const TYPE_LABELS: Record<DsrType, string> = {
  EXPORT: "Export my data",
  DELETE: "Delete my account and data",
  RECTIFY: "Correct or update my data",
}

export function DsrForm() {
  const router = useRouter()

  const form = useForm<DsrFormValues, unknown, DsrFormValues>({
    resolver: zodResolver(dsrFormSchema),
    defaultValues: {
      type: "EXPORT",
      reason: "",
      confirm: false,
    },
  })

  const { execute, status } = useAction(submitDataSubjectRequest, {
    onSuccess: ({ data }) => {
      if (data?.requestId) {
        router.push(`/privacy/request/submitted?id=${data.requestId}`)
      }
    },
    onError: ({ error }) => {
      const message = error.serverError ?? "Failed to submit request. Please try again."
      toast.error(message)
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(values => execute(values))}
        className="flex flex-col gap-y-6"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a request type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DSR_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {TYPE_LABELS[type]}
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason or additional context (optional)</FormLabel>
              <FormControl>
                <TextArea
                  rows={5}
                  maxLength={1000}
                  placeholder="If your request needs context (which fields to correct, which exports you want, etc.), tell us here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <Stack direction="row" className="items-start gap-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={value => field.onChange(value === true)}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  I confirm I am the account holder and that this request is made in good faith.
                </FormLabel>
              </Stack>
              <FormMessage />
            </FormItem>
          )}
        />

        <Stack direction="row" className="justify-end">
          <Button type="submit" isPending={status === "executing"}>
            Submit request
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
