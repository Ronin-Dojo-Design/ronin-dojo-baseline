"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import { Note } from "~/components/common/note"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/common/select"
import { Stack } from "~/components/common/stack"
import { TextArea } from "~/components/common/textarea"
import { createJoinLegacyInterest } from "~/server/web/lead/public-actions"

const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(120),
  lastName: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Valid email is required"),
  phoneE164: z.string().trim().max(32).optional().or(z.literal("")),
  currentRank: z.string().trim().max(200).optional().or(z.literal("")),
  trainedUnder: z.string().trim().max(500).optional().or(z.literal("")),
  represent: z.string().trim().max(500).optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional().or(z.literal("")),
  profileUrl: z.string().trim().url("Use a valid URL").optional().or(z.literal("")),
  membershipPath: z.enum(["FREE", "PREMIUM", "ELITE"]),
  treeId: z.string().optional(),
  nodeId: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type JoinLegacyFormProps = {
  claimableTree?: {
    id: string
    name: string
    members: Array<{ nodeId: string; displayName: string }>
  } | null
}

export function JoinLegacyForm({ claimableTree }: JoinLegacyFormProps) {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneE164: "",
      currentRank: "",
      trainedUnder: "",
      represent: "",
      bio: "",
      profileUrl: "",
      membershipPath: "FREE",
      treeId: claimableTree?.id,
      nodeId: "",
    },
  })

  const { execute, isExecuting } = useAction(createJoinLegacyInterest, {
    onSuccess: ({ data }) => {
      if (!data) return
      toast.success("Your legacy information was received.")
      if (data.claimRequiresSignIn) {
        toast.info("Sign in to finish claiming the selected lineage profile.")
      }
      router.push(data.checkoutUrl)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Unable to submit your legacy information.")
    },
  })

  return (
    <Form {...form}>
      <form
        className="grid gap-5 md:grid-cols-2"
        onSubmit={form.handleSubmit(values => execute(values))}
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>First name</FormLabel>
              <FormControl>
                <Input size="lg" placeholder="First name" {...field} />
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
                <Input size="lg" placeholder="Last name" {...field} />
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
              <FormLabel isRequired>Email</FormLabel>
              <FormControl>
                <Input type="email" size="lg" placeholder="you@example.com" {...field} />
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
                <Input size="lg" placeholder="+1 555 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="membershipPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legacy membership path</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                items={{
                  FREE: "Free profile",
                  PREMIUM: "Premium listing",
                  ELITE: "Elite legacy listing",
                }}
              >
                <FormControl>
                  <SelectTrigger size="lg">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FREE">Free profile</SelectItem>
                  <SelectItem value="PREMIUM">Premium listing</SelectItem>
                  <SelectItem value="ELITE">Elite legacy listing</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profileUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website or public profile</FormLabel>
              <FormControl>
                <Input size="lg" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {claimableTree && claimableTree.members.length > 0 && (
          <FormField
            control={form.control}
            name="nodeId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Claim an existing lineage profile</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  items={Object.fromEntries(
                    claimableTree.members.map(member => [member.nodeId, member.displayName]),
                  )}
                >
                  <FormControl>
                    <SelectTrigger size="lg">
                      <SelectValue placeholder={`Optional: select from ${claimableTree.name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {claimableTree.members.map(member => (
                      <SelectItem key={member.nodeId} value={member.nodeId}>
                        {member.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Note className="text-xs">
                  A claim is created immediately when you are signed in. Otherwise this records the
                  intent and you can finish the claim after signing in.
                </Note>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="currentRank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rank and promotion history</FormLabel>
              <FormControl>
                <TextArea placeholder="Belt rank, dates, certifying instructor..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trainedUnder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who did you train under?</FormLabel>
              <FormControl>
                <TextArea placeholder="Instructors, schools, teams, affiliations..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="represent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Who should your tree connect to?</FormLabel>
              <FormControl>
                <TextArea placeholder="Family tree, instructor line, organization..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio or legacy notes</FormLabel>
              <FormControl>
                <TextArea placeholder="Short history, achievements, context..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Stack className="items-center justify-between md:col-span-2" wrap>
          <Note className="max-w-xl text-xs">
            Premium and Elite selections create the same intake record, then route you to the paid
            directory listing checkout copied from the Dirstarter listing pattern.
          </Note>
          <Button type="submit" variant="primary" size="lg" isPending={isExecuting}>
            Join the Legacy
          </Button>
        </Stack>
      </form>
    </Form>
  )
}
