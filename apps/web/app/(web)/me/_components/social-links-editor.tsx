"use client"

import { PlusIcon, TrashIcon } from "lucide-react"
import { type UseFormReturn, useFieldArray } from "react-hook-form"
import { Button } from "~/components/common/button"
import { EmptyList } from "~/components/common/empty-list"
import { FormField, FormItem, FormLabel, FormMessage } from "~/components/common/form"
import { H2 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"

const PLATFORMS = [
  { value: "WEBSITE", label: "Website" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "TWITTER", label: "Twitter / X" },
  { value: "LINKEDIN", label: "LinkedIn" },
] as const

type SocialLinksEditorProps = {
  form: UseFormReturn<any>
}

export function SocialLinksEditor({ form }: SocialLinksEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <H2 className="text-base">Social Links</H2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          prefix={<PlusIcon />}
          onClick={() => append({ platform: "WEBSITE", url: "" })}
        >
          Add link
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <FormField
            control={form.control}
            name={`socialLinks.${index}.platform`}
            render={({ field: platformField }) => (
              <FormItem className="w-40 shrink-0">
                {index === 0 && <FormLabel>Platform</FormLabel>}
                <Select value={platformField.value} onValueChange={platformField.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
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
            name={`socialLinks.${index}.url`}
            render={({ field: urlField }) => (
              <FormItem className="flex-1">
                {index === 0 && <FormLabel>URL</FormLabel>}
                <Input
                  type="url"
                  placeholder="https://..."
                  {...urlField}
                  value={urlField.value ?? ""}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={index === 0 ? "mt-7" : "mt-1"}
            onClick={() => remove(index)}
            aria-label="Remove link"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      ))}

      {fields.length === 0 && <EmptyList>No social links added yet.</EmptyList>}
    </div>
  )
}
