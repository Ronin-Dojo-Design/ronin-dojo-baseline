"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Label } from "~/components/common/label"
import { Note } from "~/components/common/note"
import { RadioGroup, RadioGroupItem } from "~/components/common/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { submitLineageClaimRequest } from "~/server/web/lineage/claim-actions"

/**
 * Client-island lineage claim form.
 *
 * Author: Cody / SESSION_0182 TASK_02.
 */

interface ClaimFormProps {
  treeId: string
  members: Array<{ nodeId: string; displayName: string }>
}

const formSchema = z.object({
  nodeId: z.string().min(1, "Select a node to claim"),
  relationship: z.enum(["SELF", "STUDENT_OF", "FAMILY", "ARCHIVIST"]),
  claimantNote: z.string().max(2000).optional(),
  evidence: z
    .array(
      z.object({
        label: z.string().max(200).optional(),
        url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
        text: z.string().max(5000).optional(),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

const RELATIONSHIP_OPTIONS = [
  { value: "SELF", label: "This is me" },
  { value: "STUDENT_OF", label: "I'm a student / family member" },
  { value: "FAMILY", label: "I'm a family member" },
  { value: "ARCHIVIST", label: "I'm an archivist with permission" },
] as const

export function LineageClaimForm({ treeId, members }: ClaimFormProps) {
  const router = useRouter()

  const { execute, isExecuting, result } = useAction(submitLineageClaimRequest, {
    onSuccess: () => {
      router.push("/lineage?claimed=true")
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nodeId: "",
      relationship: "SELF",
      claimantNote: "",
      evidence: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "evidence",
  })

  function onSubmit(values: FormValues) {
    // Clean up empty URL strings before submission.
    const evidence = values.evidence
      ?.map(e => ({
        ...e,
        url: e.url || undefined,
      }))
      .filter(e => e.url || e.text || e.label)

    execute({
      treeId,
      nodeId: values.nodeId,
      relationship: values.relationship,
      claimantNote: values.claimantNote || undefined,
      evidence: evidence?.length ? evidence : undefined,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Node selector */}
        <FormField
          control={form.control}
          name="nodeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Which node are you claiming?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.nodeId} value={m.nodeId}>
                      {m.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Relationship */}
        <FormField
          control={form.control}
          name="relationship"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to this node</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-2"
                >
                  {RELATIONSHIP_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value}>{opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="claimantNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note to reviewer (optional)</FormLabel>
              <FormControl>
                <TextArea
                  placeholder="Any context that helps the reviewer verify your claim..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Evidence */}
        <Stack direction="column" className="space-y-3">
          <Label>Evidence (optional, raises approval odds)</Label>
          {fields.map((item, index) => (
            <Stack key={item.id} direction="column" className="rounded-md border p-3 space-y-2">
              <FormField
                control={form.control}
                name={`evidence.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Belt certificate" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`evidence.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`evidence.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text description</FormLabel>
                    <FormControl>
                      <TextArea placeholder="Describe the evidence..." rows={2} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                Remove
              </Button>
            </Stack>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ label: "", url: "", text: "" })}
          >
            + Add evidence
          </Button>
        </Stack>

        {/* Error feedback */}
        {result?.serverError && <Note className="text-destructive">{result.serverError}</Note>}

        {/* Submit */}
        <Button type="submit" isPending={isExecuting}>
          Submit Claim
        </Button>
      </form>
    </Form>
  )
}
