"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import type { ComponentProps } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { UserActions } from "~/app/app/users/_components/user-actions"
import { Avatar, AvatarImage } from "~/components/common/avatar"
import { Button } from "~/components/common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/common/form"
import { FormMedia } from "~/components/common/form-media"
import { H3 } from "~/components/common/heading"
import { Input } from "~/components/common/input"
import { Link } from "~/components/common/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { client } from "~/lib/orpc-client"
import { cx } from "~/lib/utils"
import type { findUserById } from "~/server/admin/users/queries"
import { userSchema, type UserSchema } from "~/server/admin/users/schema"

type UserFormProps = ComponentProps<"form"> & {
  user: NonNullable<Awaited<ReturnType<typeof findUserById>>>
}

export function UserForm({ children, className, title, user, ...props }: UserFormProps) {
  const router = useRouter()

  // Update user via the oRPC `users.update` procedure (WL-P2-43): the procedure owns
  // the layout-typed /app/users revalidation; the refresh re-renders the saved values
  // (a Server Action used to carry that re-render in-band — an RPC response doesn't).
  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? "",
      role: (user.role as "admin" | "tournament_director" | "user") ?? "user",
    },
  })

  const handleSubmitWithAction = form.handleSubmit(async values => {
    try {
      await client.users.update(values)
      toast.success("User successfully updated")
      router.refresh()
    } catch (error) {
      // Surface the real oRPC message (FORBIDDEN carries the self-role-change copy).
      toast.error(error instanceof Error && error.message ? error.message : "Failed to update user")
    }
  })

  return (
    <Form {...form}>
      <Stack className="justify-between">
        <H3 className="flex-1 truncate">{title}</H3>

        <Stack size="sm" className="-my-0.5">
          <UserActions user={user} size="md" />
        </Stack>
      </Stack>

      <form
        onSubmit={handleSubmitWithAction}
        className={cx("grid gap-4 @lg:grid-cols-2", className)}
        noValidate
        {...props}
      >
        <div className="grid gap-4 @lg:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input data-1p-ignore {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                items={{
                  user: "User",
                  tournament_director: "Tournament Director",
                  admin: "Admin",
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="tournament_director">Tournament Director</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormMedia form={form} field={field} path={`users/${user.id}/avatar`}>
              {field.value && (
                <Avatar className="size-8 border box-content">
                  <AvatarImage src={field.value} />
                </Avatar>
              )}
            </FormMedia>
          )}
        />

        <div className="flex justify-between gap-4 col-span-full">
          <Button size="md" variant="secondary" render={<Link href="/app/users" />}>
            Cancel
          </Button>

          <Button type="submit" size="md" isPending={form.formState.isSubmitting}>
            Update user
          </Button>
        </div>
      </form>
    </Form>
  )
}
