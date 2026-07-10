"use client"

/**
 * Issue-certificate dialog — the affordance that drives the previously-orphaned
 * `issueCertificate` action (FI-022): recipient picker (User id-space via
 * `findActiveUsers`/`toRecipientOptions`) + optional expiry, on the template
 * detail page's issuance list.
 *
 * @added SESSION_0520 — cloned from the walk-in-registration-dialog pattern
 *   (the repo's admin create-dialog idiom); shared formatting lives in
 *   components/admin/recipient-options.ts.
 */
import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { ComboboxSelector } from "~/components/common/combobox-selector"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/common/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { type ActiveUser, toRecipientOptions } from "~/components/admin/recipient-options"
import { Input } from "~/components/common/input"
import { issueCertificate } from "~/server/admin/certificates/issuance-actions"
import { issueCertificateSchema } from "~/server/admin/certificates/schema"

type CertificateIssueDialogProps = {
  templateId: string
  users: ActiveUser[]
}

export function CertificateIssueDialog({ templateId, users }: CertificateIssueDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    issueCertificate,
    zodResolver(issueCertificateSchema),
    {
      formProps: {
        defaultValues: {
          certificateTemplateId: templateId,
          userId: "",
          expiresAt: "",
        },
      },
      actionProps: {
        onSuccess: () => {
          toast.success("Certificate issued")
          form.reset()
          setIsOpen(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error.serverError ?? "Failed to issue certificate")
        },
      },
    },
  )

  const userOptions = useMemo(() => toRecipientOptions(users), [users])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button size="sm" variant="primary" />}>
        Issue certificate
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Issue certificate</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmitWithAction} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <FormControl>
                    <ComboboxSelector
                      options={userOptions}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select user..."
                      searchPlaceholder="Search by name or email..."
                      emptyMessage="No users found."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires (optional)</FormLabel>
                  <FormControl>
                    {/* min = today: the UI shouldn't mint an instantly-"Expired" cert; the
                        schema stays permissive so programmatic imports can backdate. */}
                    <Input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isPending={action.isPending}>
                Issue certificate
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
