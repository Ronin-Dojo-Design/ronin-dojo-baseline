"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
import { ComboboxSelector } from "~/components/common/combobox-selector"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { TextArea } from "~/components/common/textarea"
import { upsertTournamentStaffAssignment } from "~/server/admin/tournaments/actions"
import { tournamentStaffAssignmentSchema } from "~/server/admin/tournaments/schema"

type StaffAssignmentFormProps = {
  tournamentId: string
  roles: { id: string; name: string; code: string }[]
  divisions: { id: string; name: string }[]
  users: { id: string; name: string | null; email: string }[]
  onSuccess?: () => void
}

export function StaffAssignmentForm({
  tournamentId,
  roles,
  divisions,
  users,
  onSuccess,
}: StaffAssignmentFormProps) {
  const resolver = zodResolver(tournamentStaffAssignmentSchema)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    upsertTournamentStaffAssignment,
    resolver,
    {
      formProps: {
        defaultValues: {
          tournamentId,
          userId: "",
          tournamentRoleId: "",
          divisionId: "",
          notes: "",
        },
      },

      actionProps: {
        onSuccess: () => {
          toast.success("Staff assigned successfully")
          form.reset()
          onSuccess?.()
        },

        onError: ({ error }) => {
          toast.error(error.serverError)
        },
      },
    },
  )

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="grid gap-4" noValidate>
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>User</FormLabel>
              <FormControl>
                <ComboboxSelector
                  options={users.map(u => ({ id: u.id, name: u.name ?? u.email }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select user"
                  searchPlaceholder="Search users..."
                  emptyMessage="No users found."
                />
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
              <FormLabel isRequired>Role</FormLabel>
              <FormControl>
                <ComboboxSelector
                  options={roles}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select role"
                  searchPlaceholder="Search roles..."
                  emptyMessage="No roles found."
                />
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
              <FormLabel>Division (optional)</FormLabel>
              <FormControl>
                <ComboboxSelector
                  options={divisions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="All divisions"
                  searchPlaceholder="Search divisions..."
                  emptyMessage="No divisions found."
                  clearable
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <TextArea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="md" isPending={action.isPending}>
          Assign Staff
        </Button>
      </form>
    </Form>
  )
}
