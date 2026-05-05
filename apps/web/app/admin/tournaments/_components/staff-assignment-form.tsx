"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks"
import { toast } from "sonner"
import { Button } from "~/components/common/button"
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name ?? u.email}
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
          name="tournamentRoleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
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
          name="divisionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Division (optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="All divisions" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">All divisions</SelectItem>
                  {divisions.map(d => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
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

        <Button size="md" isPending={action.isPending}>
          Assign Staff
        </Button>
      </form>
    </Form>
  )
}
