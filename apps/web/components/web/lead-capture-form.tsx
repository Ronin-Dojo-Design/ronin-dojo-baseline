"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "~/components/common/button"
import { Card } from "~/components/common/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { createPublicLead } from "~/server/web/lead/public-actions"

const captureSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Valid email is required"),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
})

type CaptureValues = z.infer<typeof captureSchema>

type LeadCaptureFormProps = {
  organizationId: string
  programId?: string
  onSuccess?: () => void
}

export function LeadCaptureForm({ organizationId, programId, onSuccess }: LeadCaptureFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<CaptureValues>({
    resolver: zodResolver(captureSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneE164: "",
    },
  })

  const { executeAsync, isPending } = useAction(createPublicLead, {
    onSuccess: () => {
      setSubmitted(true)
      toast.success("Thanks! We'll be in touch soon.")
      onSuccess?.()
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Something went wrong. Please try again.")
    },
  })

  const onSubmit = (data: CaptureValues) => {
    executeAsync({
      organizationId,
      programId,
      firstName: data.firstName,
      lastName: data.lastName || undefined,
      email: data.email,
      phoneE164: data.phoneE164 || undefined,
    })
  }

  if (submitted) {
    return (
      <Card className="p-8 text-center">
        <H3>You're all set!</H3>
        <p className="text-muted-foreground">
          We've received your info and will reach out shortly to get you started.
        </p>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name *</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneE164"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1 555 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="primary" className="w-full" isPending={isPending}>
          Get Started
        </Button>
      </form>
    </Form>
  )
}
