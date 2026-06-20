"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import { Form, FormControl, FormField, FormItem } from "~/components/common/form"
import { Input } from "~/components/common/input"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { useSession } from "~/lib/auth-client"
import { cx } from "~/lib/utils"
import { reportFeedback } from "~/server/web/actions/report"
import { createFeedbackSchema } from "~/server/web/shared/schema"

/**
 * Feature-request modal. Reuses the existing feedback wiring (`reportFeedback` →
 * `Report` of type Feedback) rather than a new backend — a feature request is feedback.
 * Controlled `open` state with a plain trigger button keeps focus/dismiss reliable.
 */
export const FeatureRequestDialog = ({
  triggerLabel = "Send a Feature Request",
  triggerClassName,
}: {
  triggerLabel?: string
  triggerClassName?: string
}) => {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const tSchema = useTranslations("schema")
  const schema = createFeedbackSchema(tSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    reportFeedback,
    zodResolver(schema),
    {
      formProps: {
        defaultValues: { email: session?.user.email || "", message: "" },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Request received — the DojoBots are on it. 🤖")
          form.reset({ email: session?.user.email || "", message: "" })
          setOpen(false)
        },
        onError: ({ error }) =>
          toast.error(error.serverError ?? "Something went sideways — please try again."),
      },
    },
  )

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Have a Feature Request?</DialogTitle>
            <DialogDescription className="italic">The DojoBots are on it…</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <Stack
              direction="column"
              className="w-full items-stretch"
              render={<form onSubmit={handleSubmitWithAction} noValidate />}
            >
              {!session?.user && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@email.com"
                          className={cx(fieldState.error ? "bg-destructive/5!" : "")}
                          data-1p-ignore
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="message"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <TextArea
                        placeholder="What would make Black Belt Legacy better for you?"
                        className={cx("h-28", fieldState.error ? "bg-destructive/5!" : "")}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Stack size="sm" className="justify-end">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button isPending={action.isPending}>Send it to the DojoBots</Button>
              </Stack>
            </Stack>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
