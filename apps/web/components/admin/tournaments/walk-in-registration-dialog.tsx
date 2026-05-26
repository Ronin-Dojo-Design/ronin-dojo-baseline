"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/common/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { Input } from "~/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { createWalkInRegistration } from "~/server/admin/tournaments/actions"
import { createWalkInRegistrationSchema } from "~/server/admin/tournaments/schema"

const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Unpaid" },
  { value: "PAID", label: "Paid (cash/cheque/comp)" },
  { value: "PARTIAL", label: "Partial" },
  { value: "REFUNDED", label: "Refunded" },
] as const

type WalkInDialogProps = {
  tournamentId: string
  divisions: Array<{ id: string; name: string; roleRequiredId: string | null }>
  roles: Array<{ id: string; name: string }>
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function WalkInRegistrationDialog({
  tournamentId,
  divisions,
  roles,
  isOpen,
  setIsOpen,
}: WalkInDialogProps) {
  const router = useRouter()

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    createWalkInRegistration,
    zodResolver(createWalkInRegistrationSchema),
    {
      formProps: {
        defaultValues: {
          tournamentId,
          divisionId: divisions[0]?.id ?? "",
          tournamentRoleId: divisions[0]?.roleRequiredId ?? roles[0]?.id ?? "",
          paymentStatus: "UNPAID" as const,
          recipient: { kind: "guest" as const, email: "", name: "" },
        },
      },
      actionProps: {
        onSuccess: ({ data }) => {
          toast.success(
            data?.promotedFromGuest
              ? "Walk-in registered (matched existing user account)."
              : "Walk-in registered.",
          )
          form.reset()
          setIsOpen(false)
          router.refresh()
        },
        onError: ({ error }) => {
          toast.error(error.serverError ?? "Failed to register walk-in")
        },
      },
    },
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create walk-in registration</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmitWithAction} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="recipient.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="competitor@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="divisionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)
                        const division = divisions.find(d => d.id === value)
                        if (division?.roleRequiredId) {
                          form.setValue("tournamentRoleId", division.roleRequiredId)
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tournamentRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Payment status" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                Create walk-in
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
